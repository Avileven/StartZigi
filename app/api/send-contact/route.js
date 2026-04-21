// app/api/send-contact/route.js
// UPDATE 200426: API route for contact form submissions.
//                Sends an email notification to the admin with the sender's details.

import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "avi@leventhal.co.il";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, message } = body || {};

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // [EMAIL] Send notification to admin with full submission details
    const { data, error } = await resend.emails.send({
      from: "StartZig Contact <invite@startzig.com>",
      to: [ADMIN_EMAIL],
      replyTo: email,
      subject: `New contact message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 600px; margin: auto;">
          <h2 style="color: #4F46E5; margin-bottom: 4px;">New Contact Message</h2>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 0;">Received via StartZig contact form</p>

          <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0 0 8px;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 0 0 8px;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #6366f1;">${email}</a></p>
          </div>

          <div style="margin: 20px 0;">
            <p style="font-weight: bold; color: #374151; margin-bottom: 8px;">Message:</p>
            <p style="color: #475569; line-height: 1.6; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
              ${message.replace(/\n/g, "<br/>")}
            </p>
          </div>

          <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">
            Reply directly to this email to respond to ${name}.
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
    console.error("send-contact route failed:", err);
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 });
  }
}
