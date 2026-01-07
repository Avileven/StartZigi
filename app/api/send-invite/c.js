// api/send-invite/route.js 7126
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
    // ✅ הוספנו את ventureId לקליטה מה-Body (נשלח מה-Frontend שעדכנו קודם)
    const { email, ventureName, inviterName, invitationToken, ventureId } = body || {};

    console.log("send-invite payload:", { email, ventureName, inviterName, hasToken: !!invitationToken, ventureId });

    if (!email || !ventureName || !inviterName || !invitationToken || !ventureId) {
      return NextResponse.json(
        { error: "Missing required fields", details: { email: !!email, ventureName: !!ventureName, inviterName: !!inviterName, invitationToken: !!invitationToken, ventureId: !!ventureId } },
        { status: 400 }
      );
    }

    const baseUrl = getBaseUrl(request);

    // ✅ תיקון הלינק: במקום /venture-landing, אנחנו שולחים ל- /venture-profile/[id]
    // ומוסיפים את הטוקן כפרמטר לאימות
    const profileUrl = `${baseUrl}/venture-profile/${ventureId}?token=${encodeURIComponent(invitationToken)}`;

    const { data, error } = await resend.emails.send({
      from: "StartZig <invite@startzig.com>",
      to: [email],
      subject: `${inviterName} invited you to view the venture: ${ventureName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 600px; margin: auto;">
          <h1 style="color: #1e293b; font-size: 24px;">Hello!</h1>
          <p style="color: #475569; font-size: 16px;">
            <strong>${inviterName}</strong> has invited you to explore their venture and discuss a potential co-founder partnership:
          </p>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h2 style="color: #6366f1; margin: 0;">${ventureName}</h2>
          </div>
          <p style="color: #475569; font-size: 16px;">Click the button below to view the full Venture Profile:</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${profileUrl}"
               style="background-color: #6366f1; color: white; padding: 14px 32px;
                      text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              View Venture Profile
            </a>
          </div>
          <p style="margin-top: 30px; font-size: 12px; color: #94a3b8; line-height: 1.5;">
            This is a private invitation. If the button doesn't work, copy and paste this link into your browser:<br/>
            <span style="color: #6366f1;">${profileUrl}</span>
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("send-invite route failed:", error);
    return NextResponse.json({ error: error?.message || "Unknown error" }, { status: 500 });
  }
}