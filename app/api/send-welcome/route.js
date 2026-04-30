// api/send-welcome/route.js
// [ADDED 300426] Welcome email sent automatically after venture creation

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
        <div style="font-family: Arial, sans-serif; padding: 32px; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px;">
          
          <h1 style="color: #1e293b; font-size: 24px; margin-bottom: 8px;">
            Hi${founderName ? ` ${founderName}` : ""},
          </h1>

          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Your venture <strong style="color: #6366f1;">${ventureName}</strong> is now live on StartZig — 
            the complete startup ecosystem that takes you from your first idea all the way to exit.
          </p>

          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Before every phase and after every milestone, you'll find a message waiting for you on your dashboard — 
            guiding your next steps and tracking your progress.
          </p>

          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            We hope you enjoy the journey.
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
      console.error("Resend welcome email error:", error);
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ data });

  } catch (error) {
    console.error("send-welcome route failed:", error);
    return NextResponse.json({ error: error?.message || "Unknown error" }, { status: 500 });
  }
}
