// app/api/send-reply/route.js
// UPDATE 200426: API route for admin replies to contact form submissions.
//                Sends reply email from team@startzig.com to the user who submitted the form.

import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { to, name, message } = body || {};

    if (!to || !name || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: "StartZig Team <team@startzig.com>",
      to: [to],
      subject: `Re: Your message to StartZig`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 600px; margin: auto;">
          <h2 style="color: #4F46E5; margin-bottom: 4px;">StartZig</h2>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 0;">Response from the StartZig team</p>

          <p style="color: #374151; font-size: 16px; margin-top: 24px;">Hi ${name},</p>

          <div style="color: #475569; font-size: 15px; line-height: 1.7; margin: 16px 0; background: #f8fafc; border-radius: 8px; padding: 16px;">
            ${message.replace(/\n/g, "<br/>")}
          </div>

          <p style="color: #374151; font-size: 15px; margin-top: 24px;">
            Best,<br/>
            <strong>The StartZig Team</strong>
          </p>

          <p style="font-size: 12px; color: #94a3b8; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
            You're receiving this because you reached out to us at startzig.com
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });

  } catch (err) {
    console.error("send-reply route failed:", err);
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 });
  }
}
