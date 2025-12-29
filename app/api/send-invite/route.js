// /api/send-invite/route.js
import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { email, ventureName, inviterName, invitationToken } = await request.json();

    if (!email || !ventureName || !inviterName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ✅ FIX: לא תלוי ב-Origin מהדפדפן. עובד גם בדומיין מותאם וגם ב-Vercel.
    // מומלץ להגדיר ב-Vercel: NEXT_PUBLIC_SITE_URL=https://startzig.vercel.app (או הדומיין החדש שלך)
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      request.nextUrl?.origin ||
      "https://startzig.vercel.app";

    // ✅ FIX: אם יש טוקן → שולחים ללנדינג עם invitation_token
    // אם אין טוקן (כדי לא לשבור) → שולחים ללנדינג בלי טוקן
    const joinUrl = invitationToken
      ? `${origin}/venture-landing?invitation_token=${encodeURIComponent(invitationToken)}`
      : `${origin}/venture-landing`;

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

