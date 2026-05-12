// app/api/cron/vc-screening/route.js
// [ADDED 12/05/2026] Daily cron job — runs VC screening for pending meetings.
// Sends email to founder with firm response. Dashboard runScreeningCheck creates VentureMessage when user logs in.
// Triggered by Vercel cron (see vercel.json) — runs once per day at 09:00 UTC.

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
    const cutoff = new Date(now.getTime() + 60000); // TESTING: finds all pending immediately
    // const cutoff = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // PRODUCTION: 5 days

    // Fetch all pending VC screenings
    const { data: pendingMeetings, error: meetingsError } = await supabase
      .from("vc_meetings")
      .select("*")
      .eq("status", "pending_screening")
      .lt("screening_submitted_at", cutoff.toISOString());

    if (meetingsError) throw meetingsError;
    if (!pendingMeetings?.length) {
      return NextResponse.json({ message: "No pending VC screenings to process." });
    }

    let processed = 0;

    for (const meeting of pendingMeetings) {
      try {
        // Load VC firm
        const { data: firms } = await supabase
          .from("vc_firms")
          .select("*")
          .eq("id", meeting.vc_firm_id);
        if (!firms?.length) continue;
        const firm = firms[0];

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

        // Screening logic — same as dashboard runScreeningCheck
        let passed = true;
        let rejectReason = "";
        const params = firm.screening_parameters || {};

        const { data: fundingEvents } = await supabase
          .from("funding_events")
          .select("investment_type")
          .eq("venture_id", venture.id);

        const hasVCInvestment = fundingEvents?.some(e => e.investment_type === "VC");

        if (hasVCInvestment) {
          passed = false;
          rejectReason = params.rejection_messages?.vc || `Thank you for reaching out. Unfortunately, it is our firm's policy not to invest in ventures that have already secured VC funding. We wish you all the best.`;
        } else if (params.freeze_investment) {
          passed = false;
          rejectReason = params.rejection_messages?.freeze || `Thank you for the time you've invested in this process. We have made the difficult decision to pause all new investments at this time.`;
        } else if (params.team_focus && (venture.founders_count || 1) < 2) {
          passed = false;
          rejectReason = params.rejection_messages?.team || `Your venture's potential is clear, but we have a strong preference for teams with multiple co-founders.`;
        } else if (params.sector_focus && firm.focus_areas?.length > 0 && venture.sector && !firm.focus_areas.includes(venture.sector)) {
          passed = false;
          rejectReason = params.rejection_messages?.sector || `Thank you for sharing your work with us. It doesn't align with our current investment thesis.`;
        }

        // Update meeting status
        await supabase
          .from("vc_meetings")
          .update({
            status: passed ? "screening_passed" : "screening_rejected",
            screening_result: passed ? "passed" : "rejected",
            screening_result_sent_at: now.toISOString(),
          })
          .eq("id", meeting.id);

        // Send email
        const baseUrl = getBaseUrl();
        const subject = passed
          ? `${firm.name} wants to meet you!`
          : `Response from ${firm.name}`;

        const bodyContent = passed
          ? `<p style="color:#475569;font-size:16px;line-height:1.6;">Great news! <strong>${firm.name}</strong> reviewed your application and is interested in learning more. Head to your dashboard to schedule your meeting. Good luck!</p>`
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
              <p style="margin-top:24px;font-size:13px;color:#475569;text-align:center;">
                <a href="https://www.startzig.com" style="color:#6366f1;text-decoration:none;">startzig.com</a>
              </p>
              <p style="margin-top:8px;font-size:12px;color:#94a3b8;text-align:center;">Don't just start up. StartZig.</p>
            </div>
          `,
        });

        processed++;
      } catch (err) {
        console.error(`Error processing VC meeting ${meeting.id}:`, err);
      }
    }

    return NextResponse.json({ message: `Processed ${processed} VC screenings.` });

  } catch (error) {
    console.error("Cron vc-screening failed:", error);
    return NextResponse.json({ error: error?.message || "Unknown error" }, { status: 500 });
  }
}
