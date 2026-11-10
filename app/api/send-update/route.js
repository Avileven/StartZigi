// FILE DESTINATION: app/api/send-update/route.js (new file)
// One-off mailing sender. GET returns the subject + recipient list, POST sends ONE email
// ({ mode: "test" } to the logged-in admin, or { mode: "one", index } to recipient #index).
// Only logged-in accounts listed in ADMIN_EMAILS (updateEmail.js) are allowed.
// Same pattern as send-feedback-request: Resend, from hello@startzig.com.

import { Resend } from "resend";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SUBJECT, RECIPIENTS, EMAIL_HTML, ADMIN_EMAILS } from "./updateEmail";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "StartZig <hello@startzig.com>";
const UNSUBSCRIBE_URL = "https://startzig.com/contact?topic=unsubscribe";

// Verifies the caller's Supabase login token and returns the email if it is an allowed admin.
async function getAdminEmail(request) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return null;
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data, error } = await client.auth.getUser(token);
  const email = data?.user?.email?.toLowerCase();
  if (error || !email || !ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(email)) return null;
  return email;
}

export async function GET(request) {
  const admin = await getAdminEmail(request);
  if (!admin) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  return NextResponse.json({ subject: SUBJECT, recipients: RECIPIENTS, admin });
}

export async function POST(request) {
  const admin = await getAdminEmail(request);
  if (!admin) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  try {
    const { mode, index } = (await request.json()) || {};
    let to;
    if (mode === "test") to = admin;
    else if (mode === "one" && Number.isInteger(index) && RECIPIENTS[index]) to = RECIPIENTS[index];
    else return NextResponse.json({ error: "Bad request" }, { status: 400 });

    const { data, error } = await resend.emails.send({
      from: FROM,
      to: [to],
      subject: mode === "test" ? `[TEST] ${SUBJECT}` : SUBJECT,
      html: EMAIL_HTML,
      headers: { "List-Unsubscribe": `<${UNSUBSCRIBE_URL}>` },
    });
    if (error) return NextResponse.json({ error: error.message || "Send failed" }, { status: 502 });
    return NextResponse.json({ ok: true, to, id: data?.id });
  } catch (e) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
