// api/send-phase-transition/route.js
// ============================================================
// FILE DESTINATION: app/api/send-phase-transition/route.js (new file)
// ============================================================
// [ADDED 020826] Combines two things into one email, per this session's
// explicit decision: (1) congratulations on completing the previous phase
// + welcome to the new one — the same content already shown in the in-app
// "phase_welcome" message — and (2) the example-project demo invitation.
// Two separate in-app messages stay separate (dashboard notifications are
// passive, no cost to having more of them); one combined email, since email
// is intrusive and shouldn't fire twice in a row for the same moment.

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
    const {
      email,
      founderName,
      ventureName,          // the founder's own venture
      newPhaseTitle,         // e.g. "🚀 Welcome to MVP Phase!" — same text as the in-app message
      newPhaseMessage,       // e.g. "Time to build your Minimum Viable Product..." — same text as the in-app message
      exampleVentureName,    // e.g. "PocketVet.zig"
      exampleVentureId,
      exampleStage,          // e.g. "MVP"
    } = body || {};

    if (!email || !ventureName || !newPhaseTitle || !newPhaseMessage) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const baseUrl = getBaseUrl(request);
    const exampleUrl = exampleVentureId ? `${baseUrl}/venture-landing?id=${encodeURIComponent(exampleVentureId)}` : null;

    // [ADDED 020826] Renders each line of newPhaseMessage as its own
    // paragraph, and any line starting with "•" as a real HTML list item
    // instead of a plain-text bullet character.
    const bodyLines = newPhaseMessage.split('\n').filter(l => l.trim());
    let bodyHtml = '';
    let inList = false;
    for (const line of bodyLines) {
      const isBullet = line.trim().startsWith('•');
      if (isBullet && !inList) { bodyHtml += '<ul style="color:#475569; font-size:16px; line-height:1.6; padding-left:20px; margin:12px 0;">'; inList = true; }
      if (!isBullet && inList) { bodyHtml += '</ul>'; inList = false; }
      bodyHtml += isBullet
        ? `<li>${line.trim().replace(/^•\s*/, '')}</li>`
        : `<p style="color:#475569; font-size:16px; line-height:1.6;">${line.trim()}</p>`;
    }
    if (inList) bodyHtml += '</ul>';

    const { data, error } = await resend.emails.send({
      from: "StartZig <hello@startzig.com>",
      to: [email],
      subject: newPhaseTitle.replace(/^[^\w]+/, ""), // strip a leading emoji for the subject line
      html: `
        <div style="font-family: Arial, sans-serif; padding: 32px; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px;">

          <h1 style="color: #1e293b; font-size: 22px; margin-bottom: 8px;">
            Hi${founderName ? ` ${founderName}` : ""},
          </h1>

          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            ${newPhaseTitle}
          </p>
          ${bodyHtml}

          ${exampleUrl ? `
          <div style="border-top: 1px solid #e2e8f0; margin-top: 32px; padding-top: 24px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <img src="${baseUrl}/icons/startzig-lightbulb-icon.svg" alt="" width="22" height="22" style="display: inline-block; vertical-align: middle;" />
              <h2 style="color: #6366f1; font-size: 18px; margin: 0;">You're invited to give feedback</h2>
            </div>
            <p style="color: #475569; font-size: 15px; line-height: 1.6;">
              <strong>${exampleVentureName}</strong> is at the ${exampleStage || "current"} stage. It's recommended to watch it to learn how it looks after this stage, and also to practice giving feedback and earning Insight.
            </p>
            <div style="text-align: center; margin-top: 20px;">
              <a href="${exampleUrl}"
                 style="background-color: #6366f1; color: white; padding: 14px 32px;
                        text-decoration: none; border-radius: 8px; display: inline-block;
                        font-weight: bold; font-size: 15px;">
                Take me to ${exampleVentureName}
              </a>
            </div>
          </div>
          ` : ""}

          <p style="margin-top: 40px; font-size: 12px; color: #94a3b8; text-align: center;">
            StartZig · startzig.com
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend phase-transition email error:", error);
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ data });

  } catch (error) {
    console.error("send-phase-transition route failed:", error);
    return NextResponse.json({ error: error?.message || "Unknown error" }, { status: 500 });
  }
}
