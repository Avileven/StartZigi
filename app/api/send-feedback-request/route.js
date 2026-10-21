// api/send-feedback-request/route.js
// ============================================================
// FILE DESTINATION: app/api/send-feedback-request/route.js (new file)
// ============================================================
// [NEW] Sends one email to the founder of a venture that was selected to
// receive a feedback request (In-App promotion round). Same pattern as
// send-phase-transition: Resend, from hello@startzig.com. Called
// non-blocking from InAppPromotion.jsx, so a failed email never blocks the
// round itself.

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

// Venture and founder names are user input — escape before putting in HTML.
function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      email,             // recipient: the founder of the venture that was selected
      fromVentureName,   // the venture asking for feedback
      feedbackUrl,       // relative path, e.g. /venture-landing?id=...&campaign=...
    } = body || {};

    if (!email || !fromVentureName || !feedbackUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    // Only allow internal relative paths for the button link.
    if (typeof feedbackUrl !== "string" || !feedbackUrl.startsWith("/") || feedbackUrl.startsWith("//")) {
      return NextResponse.json({ error: "Invalid feedbackUrl" }, { status: 400 });
    }

    const baseUrl = getBaseUrl(request);
    const link = `${baseUrl}${feedbackUrl}`;
    const venture = esc(fromVentureName);

    const { data, error } = await resend.emails.send({
      from: "StartZig <hello@startzig.com>",
      to: [email],
      subject: `${fromVentureName} is asking for your feedback`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 32px; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px;">

          <h1 style="color: #1e293b; font-size: 22px; margin-bottom: 8px;">
            Hi,
          </h1>

          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            <strong>${venture}</strong> asked the StartZig community for feedback.
            Your feedback matters, and it helps other founders build better products.
          </p>

          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            It's also good for you. Every piece of feedback you give earns Zigback,
            which you can use to request feedback on your own product from others.
          </p>

          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            This request is open for 7 days.
          </p>

          <div style="text-align: center; margin-top: 28px;">
            <a href="${link}"
               style="background-color: #6366f1; color: white; padding: 14px 32px;
                      text-decoration: none; border-radius: 8px; display: inline-block;
                      font-weight: bold; font-size: 15px;">
              Give feedback
            </a>
          </div>

          <p style="margin-top: 40px; font-size: 12px; color: #94a3b8; text-align: center;">
            StartZig · startzig.com
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend feedback-request email error:", error);
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("send-feedback-request route failed:", error);
    return NextResponse.json({ error: error?.message || "Unknown error" }, { status: 500 });
  }
}
