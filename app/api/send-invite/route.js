
// send-invite/route
import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    // ✅ מקבל גם invitationToken
    const { email, ventureName, inviterName, invitationToken } = await request.json();

    if (!email || !ventureName || !inviterName || !invitationToken) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ✅ FIX (היחיד כאן): origin יציב מתוך request.url (Origin header לא תמיד קיים)
    const origin = new URL(request.url).origin;

    // ✅ לינק נכון לדף הנחיתה עם הטוקן
    const joinUrl = `${origin}/venture-landing?invitation_token=${encodeURIComponent(invitationToken)}`;

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
