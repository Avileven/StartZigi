
// api/send-invite/route.js
import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

function getBaseUrl(request) {
  // עדיף להגדיר ב-.env של Vercel:
  // NEXT_PUBLIC_SITE_URL=https://startzig.vercel.app
  // או הדומיין המותאם שלך
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");

  // fallback יציב בסביבת Vercel/Proxy
  const proto = request.headers.get("x-forwarded-proto") || "https";
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");

  if (!host) return "https://startzig.vercel.app"; // fallback אחרון
  return `${proto}://${host}`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, ventureName, inviterName, invitationToken } = body || {};

    // לוג מינימלי (לא סיסמאות/מידע רגיש)
    console.log("send-invite payload:", { email, ventureName, inviterName, hasToken: !!invitationToken });

    if (!email || !ventureName || !inviterName || !invitationToken) {
      return NextResponse.json(
        { error: "Missing required fields", details: { email: !!email, ventureName: !!ventureName, inviterName: !!inviterName, invitationToken: !!invitationToken } },
        { status: 400 }
      );
    }

    const baseUrl = getBaseUrl(request);

    // ✅ הלינק הנכון: venture-landing עם invitation_token
    const joinUrl = `${baseUrl}/venture-landing?invitation_token=${encodeURIComponent(invitationToken)}`;

    const { data, error } = await resend.emails.send({
      // תשאיר כמו שעבד לך (הקובץ שלך משתמש ב-startzig.com)
      // אם זה Verified ב-Resend, זה מצוין.
      from: "StartZig <invite@startzig.com>",
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
          <p style="margin-top: 16px; font-size: 12px; color: #666;">
            If the button doesn't work, copy and paste this link:<br/>
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
    console.error("send-invite route failed:", error);
    return NextResponse.json({ error: error?.message || "Unknown error" }, { status: 500 });
  }
}

