// app/api/cron/angel-screening/route.js
// [UPDATED 13/05/2026] Refactored to match VC screening logic.
// Dashboard owns screening + status. Cron only sends email reminder next day.
//
// LOGIC:
// 1. Dashboard processes pending_screening meetings immediately — updates status, creates VentureMessage with button.
// 2. Cron runs daily at 08:00 UTC — finds all meetings where screening_result_sent_at is within last 24 hours.
// 3. Sends one email per meeting — no status update, dashboard owns the status.
// 4. Cron runs once per day so each meeting is in the 24h window only once — no duplicates ever.
// Triggered by Vercel cron (see vercel.json) — runs once per day at 08:00 UTC.

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

// Direct Supabase client — needed for server-side cron (no user session)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // service role — bypasses RLS for cron
);

function getBaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  return "https://www.startzig.com";
}

export async function GET(request) {
  // [SECURITY] Vercel cron requests include this header — reject all other callers
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    // Find all angel meetings processed by dashboard in the last 24 hours.
    // screening_result_sent_at is set by dashboard when it processes a meeting.
    // Cron sends one email per meeting. Runs once per day = no duplicates ever.
    const window24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const { data: pendingMeetings, error: meetingsError } = await supabase
      .from("investor_meetings")
      .select("*")
      .in("status", ["screening_passed", "screening_rejected"])
      .gte("screening_result_sent_at", window24h.toISOString())
      .order("screening_result_sent_at", { ascending: false });

    if (meetingsError) throw meetingsError;
    if (!pendingMeetings?.length) {
      return NextResponse.json({ message: "No recent angel screenings to email." });
    }

    let processed = 0;

    for (const meeting of pendingMeetings) {
      try {
        // Load investor
        const { data: investors } = await supabase
          .from("investors")
          .select("*")
          .eq("id", meeting.investor_id);
        if (!investors?.length) continue;
        const investor = investors[0];

        // Load venture
        const { data: ventures } = await supabase
          .from("ventures")
          .select("*")
          .eq("id", meeting.venture_id);
        if (!ventures?.length) continue;
        const venture = ventures[0];

        // Load founder email from auth.users using created_by_id
        const { data: authUser } = await supabase.auth.admin.getUserById(venture.created_by_id);
        const founderEmail = authUser?.user?.email;
        if (!founderEmail) continue;

        // Determine result from status set by dashboard — no screening logic in cron
        const passed = meeting.status === "screening_passed";

        // Rejection reason — re-derive from investor type
        let rejectReason = "";
        if (!passed) {
          const { data: fundingEvents } = await supabase
            .from("funding_events")
            .select("investment_type")
            .eq("venture_id", venture.id);
          const hasAngelInvestment = fundingEvents?.some(e => e.investment_type === "angel");
          if (hasAngelInvestment) {
            rejectReason = `Unfortunately, I have to pass. Your venture looks promising, but I don't co-invest alongside other angel investors. Best of luck!`;
          } else if (investor.investor_type === "no_go") {
            rejectReason = `Thank you for your time, but we have decided not to move forward as we are currently only advising our existing portfolio companies.`;
          } else if (investor.investor_type === "team_focused") {
            rejectReason = `We have a strong focus on ventures with multiple co-founders and have decided to pass at this time.`;
          }
        }

        // Send email — no status update, dashboard owns the status
        const baseUrl = getBaseUrl();
        const subject = passed
          ? `${investor.name} wants to meet you!`
          : `Response from ${investor.name}`;

        const bodyContent = passed
          ? `<p style="color:#475569;font-size:16px;line-height:1.6;">Great news! <strong>${investor.name}</strong> reviewed your business plan and is interested in learning more. Head to your dashboard to schedule your Zoom meeting. Good luck!</p>`
          : `<p style="color:#334155;font-size:15px;line-height:1.6;margin:0;">${rejectReason}</p>`;

                await resend.emails.send({
          from: "StartZig <hello@startzig.com>",
          to: [founderEmail],
          subject,
          html: `
            <div style="font-family:Arial,sans-serif;padding:32px;max-width:600px;margin:auto;border:1px solid #e2e8f0;border-radius:12px;">
              <h1 style="color:#1e293b;font-size:24px;margin-bottom:8px;">${subject}</h1>
              ${bodyContent}
              <div style="text-align:center;margin-top:36px;">
                <a href="${baseUrl}/dashboard" style="background-color:#6366f1;color:white;padding:14px 36px;text-decoration:none;border-radius:8px;display:inline-block;font-weight:bold;font-size:16px;">
                  Go to Dashboard
                </a>
              </div>
              <p style="margin-top:24px;font-size:13px;color:#475569;text-align:center;"><a href="https://www.startzig.com" style="color:#6366f1;text-decoration:none;">startzig.com</a></p>
              <p style="margin-top:8px;font-size:12px;color:#94a3b8;text-align:center;">Don't just start up. StartZig.</p>
            </div>
          `,
        });

        processed++;
      } catch (err) {
        console.error(`Error processing meeting ${meeting.id}:`, err);
      }
    }

    return NextResponse.json({ message: `Processed ${processed} screenings.` });

  } catch (error) {
    console.error("Cron angel-screening failed:", error);
    return NextResponse.json({ error: error?.message || "Unknown error" }, { status: 500 });
  }
}
