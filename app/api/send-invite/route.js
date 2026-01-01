// app/api/send-invite/route.js310125
import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

// ✅ FIX (2025-12-31): בונים baseUrl יציב גם ב-Vercel וגם בדומיין מותאם.
// origin לפעמים לא מגיע. לכן משתמשים גם ב-x-forwarded-*.
function getBaseUrl(request) {
  const origin = request.headers.get("origin");
  if (origin) return origin;

  const proto = request.headers.get("x-forwarded-proto") || "https";
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "startzig.vercel.app";

  return `${proto}://${host}`;
}

export async function POST(request) {
  try {
    // ✅ FIX (2025-12-31): חייבים invitationToken כדי לשלוח לינק נכון
    const { email, ventureName, inviterName, invitationToken } = await request.json();

    if (!email || !ventureName || !inviterName || !invitationToken) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const baseUrl = getBaseUrl(request);

    // ✅ FIX (2025-12-31): הלינק חייב ללכת ל-venture-landing עם invitation_token
    // ולא ל-/join (שנתן 404).
    const joinUrl = `${baseUrl}/venture-landing?invitation_token=${encodeURIComponent(
      invitationToken
    )}`;

    const { data, error } = await resend.emails.send({
      from: "VentureLaunch <onboarding@resend.dev>",
      to: [email],
      subject: `${inviterName} invited you to join ${ventureName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>Hello!</h1>
          <p><strong>${inviterName}</strong> has invited you to join their venture:</p>
          <h2 style="color: #6366f1;">${ventureName}</h2>
          <p>Click the button below to join:</p>
          <a href="${joinUrl}"
             style="background-color: #6366f1; color: white; padding: 12px 24px;
                    text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 10px;">
            Join Venture
          </a>
          <p style="margin-top: 14px; color:#6b7280; font-size: 12px;">
            If the button doesn’t work, copy & paste this link:<br/>
            ${joinUrl}
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


