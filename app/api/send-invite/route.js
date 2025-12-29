
// app/api/send-invite/route.js
import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    // ✅ FIX #1: לא "לשבור" את ה-API הקיים
    // במקום לדרוש invitationToken כחובה (שגרם ל-400),
    // קוראים את ה-body ושומרים תאימות לאחור.
    const body = await request.json();
    const { email, ventureName, inviterName } = body;

    // ✅ עדיין חובה: הפרטים הבסיסיים לשליחת המייל
    if (!email || !ventureName || !inviterName) {
      return NextResponse.json(
        { error: "Missing required fields (email, ventureName, inviterName)" },
        { status: 400 }
      );
    }

    // ✅ FIX #2: token אופציונלי (תומך בכמה שמות אפשריים)
    // כדי שלא תיפול אם בקוד שולחים בשם אחר.
    const invitationToken =
      body.invitationToken || body.invitation_token || body.token || null;

    // ✅ FIX #3: base url
    // origin יכול להיות חסר בסביבות מסוימות, אז נשאר fallback.
    const origin = request.headers.get("origin") || "https://startzig.vercel.app";

    // ✅ FIX #4: הלינק למוזמן
    // אם יש token – שולחים לינק עם invitation_token
    // אם אין token – עדיין שולחים מייל, אבל JOIN לא יוכל לאשר הזמנה בלי token.
    const joinUrl = invitationToken
      ? `${origin}/venture-landing?invitation_token=${encodeURIComponent(invitationToken)}`
      : `${origin}/venture-landing`;

    const { data, error } = await resend.emails.send({
      // הערה: "onboarding@resend.dev" זה דיפולט של Resend.
      // אם יש לך דומיין מאומת, תחליף לכתובת משלך.
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
          ${
            invitationToken
              ? ""
              : `<p style="margin-top:14px;color:#b45309;">
                   Note: invitation token missing. This email will open the landing page, but won't be able to auto-join.
                 </p>`
          }
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("send-invite route error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
