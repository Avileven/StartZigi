// FILE DESTINATION: app/api/outreach/route.js (new file; create the folders app/api/outreach)
// Outreach sender.
//   GET  -> admin email + every account with its current status (computed in the database)
//   POST -> { mode: "test", kind }            sends a preview of that email to the logged-in admin
//           { mode: "send", kind, userId }    sends that email to one person, then logs it
// Only accounts listed in the outreach_admins table are allowed (checked inside the database).
// The status is re-read from the database on every send, so a person can only receive the
// email that matches their current status, and never the same one twice.

import { Resend } from "resend";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { KINDS, renderEmail } from "@/lib/outreach/templates";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "StartZig <hello@startzig.com>";
const REPLY_TO = "hello@startzig.com";
const UNSUBSCRIBE_URL = "https://startzig.com/contact?topic=unsubscribe";

function clientFor(token) {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

// Returns { db, admin, people } for an allowed admin, otherwise null.
async function authorize(request) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return null;
  const db = clientFor(token);
  const { data: userData, error: userError } = await db.auth.getUser(token);
  const admin = userData?.user?.email;
  if (userError || !admin) return null;
  const { data: people, error } = await db.rpc("outreach_candidates");
  if (error) return null; // "not allowed" is raised in the database for non-admins
  return { db, admin, people: people || [] };
}

export async function GET(request) {
  const ctx = await authorize(request);
  if (!ctx) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  return NextResponse.json({ admin: ctx.admin, people: ctx.people });
}

export async function POST(request) {
  const ctx = await authorize(request);
  if (!ctx) return NextResponse.json({ error: "Not allowed" }, { status: 403 });

  try {
    const { mode, kind, userId } = (await request.json()) || {};
    if (!KINDS[kind]) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    // Test: preview sent to the admin only. Nothing is logged and no confirmation is re-sent.
    if (mode === "test") {
      const { subject, html, text } = renderEmail(kind, { name: "", email: ctx.admin });
      const { error } = await resend.emails.send({
        from: FROM,
        to: [ctx.admin],
        replyTo: REPLY_TO,
        subject: `[TEST] ${subject}`,
        html,
        text,
        headers: { "List-Unsubscribe": `<${UNSUBSCRIBE_URL}>` },
      });
      if (error) return NextResponse.json({ error: error.message || "Send failed" }, { status: 502 });
      return NextResponse.json({ ok: true, to: ctx.admin });
    }

    if (mode !== "send" || !userId) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    const person = ctx.people.find((p) => p.user_id === userId);
    if (!person) return NextResponse.json({ error: "Person not found" }, { status: 404 });
    if (person.status !== kind) {
      return NextResponse.json({ error: `Status changed to "${person.status}". Reload the page.` }, { status: 409 });
    }
    if (person.sent_at) return NextResponse.json({ error: "Already sent" }, { status: 409 });

    // Unconfirmed accounts: the email says a new confirmation was sent, so send it first.
    // If that fails, nothing is sent, so the email never makes a false claim.
    if (KINDS[kind].resendsConfirmation) {
      const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      const { error: resendError } = await anon.auth.resend({ type: "signup", email: person.email });
      if (resendError) {
        return NextResponse.json({ error: `Could not resend the confirmation: ${resendError.message}` }, { status: 502 });
      }
    }

    const { subject, html, text } = renderEmail(kind, { name: person.username || "", email: person.email });
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: [person.email],
      replyTo: REPLY_TO,
      subject,
      html,
      text,
      headers: { "List-Unsubscribe": `<${UNSUBSCRIBE_URL}>` },
    });
    if (error) return NextResponse.json({ error: error.message || "Send failed" }, { status: 502 });

    const { error: logError } = await ctx.db.rpc("outreach_log_insert", {
      p_user_id: person.user_id,
      p_email: person.email,
      p_kind: kind,
      p_subject: subject,
      p_resend_id: data?.id || null,
    });
    // The email was sent. If only the log failed, say so, so it is not sent again by hand.
    return NextResponse.json({ ok: true, to: person.email, warning: logError ? "Sent, but the log failed: " + logError.message : undefined });
  } catch (e) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
