// api/send-welcome/route-early-adopter.js
// [EARLY ADOPTER] Welcome email for launch period — includes Early Adopter badge and Builder upgrade message.
// Switch back to route.js after the launch window closes.

import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);


function getBaseUrl(request) {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  const proto = request.headers.get("x-forwarded-proto") || "https";
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (!host) return "https://www.startzig.com";
  return `${proto}://${host}`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, founderName, ventureName } = body || {};

    if (!email || !ventureName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const baseUrl = getBaseUrl(request);
    const dashboardUrl = `${baseUrl}/dashboard`;

    const { data, error } = await resend.emails.send({
      from: "StartZig <hello@startzig.com>",
      to: [email],
      subject: `Your venture is live on StartZig 🚀`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: auto; background: white; border: 1px solid #e2e8f0; border-radius: 12px;">

          <h1 style="color: #1e293b; font-size: 22px; margin-bottom: 8px;">
            Hi${founderName ? ` ${founderName}` : ""},
          </h1>

          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Your venture <strong style="color: #6366f1;">${ventureName}</strong> is now live on StartZig — the complete startup ecosystem that takes you from your first idea all the way to exit.
          </p>

          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            You're joining as one of StartZig's Early Adopters — a founding group of builders who chose to start their journey here from day one.
          </p>

          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            As an Early Adopter, you're getting two benefits that won't be available to anyone who joins later:
          </p>

          <table style="margin: 20px 0; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 16px 10px 0; vertical-align: middle;">
                <span style="display:inline-block;background:#0f0f1a;border:1.5px solid #FFA500;border-radius:6px;padding:6px 14px;text-align:center;">
                  <span style="display:block;font-size:9px;letter-spacing:2px;color:#FFD700;opacity:0.8;font-family:Arial,sans-serif;">STARTZIG</span>
                  <span style="display:block;font-size:12px;font-weight:800;color:#FFA500;letter-spacing:0.5px;font-family:Arial,sans-serif;">Early Adopter</span>
                </span>
              </td>
              <td style="padding: 10px 0; vertical-align: middle; color: #475569; font-size: 15px; line-height: 1.5;">
                A permanent mark on your profile that shows you were here from the beginning.
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 16px 10px 0; vertical-align: middle; font-size: 28px;">🚀</td>
              <td style="padding: 10px 0; vertical-align: middle; color: #475569; font-size: 15px; line-height: 1.5;">
                <strong>Free Builder plan for 30 days</strong> — including 100 credits for our AI Mentor and Demo Builder. No credit card. No commitment. Just build.
              </td>
            </tr>
          </table>

          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Before every phase and after every milestone, you'll find a message waiting for you on your dashboard — guiding your next steps and tracking your progress.
          </p>

          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            StartZiging.
          </p>

          <div style="text-align: center; margin-top: 36px;">
            <a href="${dashboardUrl}"
               style="background-color: #6366f1; color: white; padding: 14px 36px;
                      text-decoration: none; border-radius: 8px; display: inline-block;
                      font-weight: bold; font-size: 16px;">
              Go to Dashboard
            </a>
          </div>

          <p style="margin-top: 40px; font-size: 12px; color: #94a3b8; text-align: center;">
            StartZig · startzig.com
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend early-adopter welcome email error:", error);
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ data });

  } catch (error) {
    console.error("send-welcome early-adopter route failed:", error);
    return NextResponse.json({ error: error?.message || "Unknown error" }, { status: 500 });
  }
}
