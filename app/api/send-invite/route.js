
// app/api/send-invite/route.js

import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    // ✅ שינוי #1: מקבלים גם invitationToken מהקליינט (חובה כדי לבנות לינק נכון)
    const { email, ventureName, inviterName, invitationToken } = await request.json();

    // (השארתי לך את לוג הבדיקה שהיה)
    console.log("נתונים שהגיעו לשרת:", { email, ventureName, inviterName, invitationToken });

    // ✅ שינוי #2: ולידציה כדי שלא ישלח מייל בלי טוקן
    if (!email || !ventureName || !inviterName || !invitationToken) {
      return NextResponse.json(
        { error: "Missing required fields (email, ventureName, inviterName, invitationToken)" },
        { status: 400 }
      );
    }

    // ✅ שינוי #3: בסיס דומיין מהבקשה (עובד גם בדומיין מותאם)
    // ב-Vercel בדרך כלל זה קיים, ואם לא - נופלים לברירת מחדל
    const origin =
      request.headers.get("origin") ||
      (process.env.NEXT_PUBLIC_SITE_URL ? process.env.NEXT_PUBLIC_SITE_URL : "https://startzig.vercel.app");

    // ✅ שינוי #4: הלינק הנכון לדף הנחיתה עם הטוקן
    const joinUrl = `${origin}/venture-landing?invitation_token=${encodeURIComponent(invitationToken)}`;

    const { data, error } = await resend.emails.send({
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
          <p style="margin-top: 14px; font-size: 12px; color: #666;">
            If the button doesn’t work, copy this link: ${joinUrl}
          </p>
        </div>
      `,
    });

    if (error) {
      // השארתי לך את הלוג המפורט
      console.error("שגיאת Resend מפורטת:", error);
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

