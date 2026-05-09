// app/api/cron/angel-screening/route.js
// [ADDED 08/05/2026] Daily cron job — runs angel screening for pending meetings older than 48 hours.
// Sends email to founder with investor response. Dashboard runScreeningCheck creates VentureMessage when user logs in.
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
    const cutoff = new Date(now.getTime() - 48 * 60 * 60 * 1000); // 48 hours ago

    // Fetch all pending screenings older than 48 hours
    const { data: pendingMeetings, error: meetingsError } = await supabase
      .from("investor_meetings")
      .select("*")
      .eq("status", "pending_screening")
      .lt("screening_submitted_at", cutoff.toISOString());

    if (meetingsError) throw meetingsError;
    if (!pendingMeetings?.length) {
      return NextResponse.json({ message: "No pending screenings to process." });
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

        // Load founder email
        const { data: profiles } = await supabase
          .from("user_profiles")
          .select("email")
          .eq("id", venture.founder_user_id);
        const founderEmail = profiles?.[0]?.email;
        if (!founderEmail) continue;

        // Screening logic — same as runScreeningCheck in dashboard
        let passed = true;
        let rejectReason = "";

        const { data: fundingEvents } = await supabase
          .from("funding_events")
          .select("investment_type")
          .eq("venture_id", venture.id);

        const hasAngelInvestment = fundingEvents?.some(e => e.investment_type === "angel");
        if (hasAngelInvestment) {
          passed = false;
          rejectReason = `Unfortunately, I have to pass. Your venture looks promising, but I don't co-invest alongside other angel investors. Best of luck!`;
        } else if (investor.investor_type === "no_go") {
          passed = false;
          rejectReason = `Thank you for your time, but we have decided not to move forward as we are currently only advising our existing portfolio companies.`;
        } else if (investor.investor_type === "team_focused" && (venture.founders_count || 1) < 2) {
          passed = false;
          rejectReason = `We have a strong focus on ventures with multiple co-founders and have decided to pass at this time.`;
        }

        // Update meeting status
        await supabase
          .from("investor_meetings")
          .update({
            status: passed ? "screening_passed" : "screening_rejected",
            screening_result: passed ? "passed" : "rejected",
            screening_result_sent_at: now.toISOString(),
          })
          .eq("id", meeting.id);

        // Send email
        const baseUrl = getBaseUrl();
        const subject = passed
          ? `🎉 ${investor.name} wants to meet you!`
          : `📋 Response from ${investor.name}`;

        const bodyContent = passed
          ? `<p style="color:#475569;font-size:16px;line-height:1.6;">Great news! <strong>${investor.name}</strong> reviewed your business plan and is interested in learning more. Head to your dashboard to schedule your Zoom meeting. Good luck!</p>`
          : `<p style="color:#475569;font-size:16px;line-height:1.6;"><strong>${investor.name}</strong> has reviewed your business plan and sent the following response:</p>
             <div style="background:#f8fafc;border-left:4px solid #cbd5e1;padding:16px;border-radius:4px;margin:16px 0;">
               <p style="color:#334155;font-size:15px;line-height:1.6;margin:0;">${rejectReason}</p>
             </div>
             <p style="color:#475569;font-size:16px;line-height:1.6;">Don't give up — there are many other investors in the Angel Arena waiting to hear from you.</p>`;

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
              <p style="margin-top:40px;font-size:12px;color:#94a3b8;text-align:center;">StartZig · startzig.com</p>
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
