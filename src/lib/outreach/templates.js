// FILE DESTINATION: lib/outreach/templates.js (new file; create the folders lib/outreach)
// All outreach emails live here: one entry per status. To add a new situation later,
// add a status in outreach.sql (outreach_candidates) and one entry in KINDS below.
// Pure JavaScript, no server code, so the admin page can also use it for the preview.

const SITE = "https://startzig.com";
const FONT = "font-family:Arial,Helvetica,sans-serif;";

const WORDMARK_ROW = "<tr><td align=\"center\" style=\"padding:34px 40px 6px 40px;font-family:Arial,Helvetica,sans-serif;font-size:34px;font-weight:800;letter-spacing:-0.5px;\"><span style=\"color:#3457D5\">S</span><span style=\"color:#4358D5\">t</span><span style=\"color:#5159D6\">a</span><span style=\"color:#5F59D6\">r</span><span style=\"color:#6E5AD6\">t</span><span style=\"color:#F9D9A6\">Z</span><span style=\"color:#F5BD63\">i</span><span style=\"color:#F0A020\">g</span></td></tr>";
const TAGLINE_ROW = "<tr><td align=\"center\" style=\"padding:0 40px 22px 40px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-style:italic;color:#64748b;\">Build Better. Grow Together.</td></tr>";

// Paragraphs are HTML. {{account}} is replaced with the My Account link.
export const KINDS = {
  unconfirmed: {
    label: "Did not confirm email",
    subject: "Your StartZig account",
    // The sender must also trigger a new Supabase confirmation email for this status.
    resendsConfirmation: true,
    paragraphs: [
      "Hi,",
      "You recently signed up for StartZig but haven’t confirmed your email yet.",
      "We’ve just sent you a new confirmation email. To be on the safe side, please check your spam folder too.",
      "You’re one step away from building your venture profile and collecting feedback from the community.",
      "Did the email not arrive before, or was anything unclear in the process? Your feedback helps us improve.",
    ],
  },
  no_terms: {
    label: "Did not accept terms",
    subject: "Your StartZig account",
    paragraphs: [
      "Hi,",
      "You recently signed up for StartZig and logged in, but haven’t accepted the terms of use, which is the last step before creating your venture profile.",
      "Was anything unclear on that screen, or did something get in the way? Your feedback helps us improve.",
    ],
  },
  no_venture: {
    label: "No venture yet",
    subject: "Your StartZig account",
    paragraphs: [
      "Hi,",
      "You recently signed up for StartZig but haven’t created your venture profile yet.",
      "Feedback on your venture is just one step away. We recommend completing the process.",
      "If anything stopped you from continuing, we’d be glad to hear your feedback so we can improve.",
    ],
  },
  long_track: {
    label: "Long track, offer the short track",
    subject: "Another way to develop your product",
    paragraphs: [
      "Hi,",
      "You started your venture on StartZig with ZigJourney, the full path from first idea to growth. Several founders told us the full path didn’t fit everyone, so we added ZigPulse: a shorter track where you focus only on your own stage, whether it’s an idea, a prototype or demo, or a live product. At any stage, a few clicks are enough to introduce your venture to the community.",
      "Already started with ZigJourney? You can switch whenever you like. In {{account}}, choose “Start a New Idea.” Your current idea is deleted. Then choose ZigPulse. If you prefer a fresh start, you can also sign up with a different email address.",
      "Your feedback helps us improve.",
    ],
  },
};

export const KIND_ORDER = ["unconfirmed", "no_terms", "no_venture", "long_track"];

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Link to the contact form with name and email already filled in.
export function feedbackLink({ name, email }) {
  const q = [];
  if (name) q.push("name=" + encodeURIComponent(name));
  if (email) q.push("email=" + encodeURIComponent(email));
  return SITE + "/contact" + (q.length ? "?" + q.join("&") : "");
}

function stripTags(html) {
  return html.replace(/<a [^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g, "$2 ($1)").replace(/<[^>]+>/g, "");
}

// Returns { subject, html, text } for one person.
export function renderEmail(kind, { name, email }) {
  const k = KINDS[kind];
  if (!k) throw new Error("Unknown kind: " + kind);
  const accountLink = `<a href="${SITE}/my-account" style="color:#6E5AD6;font-weight:700;">My Account</a>`;
  const paragraphs = k.paragraphs.map((p) => p.replace("{{account}}", accountLink));
  const link = feedbackLink({ name, email });

  const body = paragraphs
    .map((p, i) => `<p style="margin:${i === 0 ? 14 : 0}px 0 14px 0;${FONT}font-size:16px;line-height:1.65;color:#475569;">${p}</p>`)
    .join("");

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(k.subject)}</title></head>
<body style="margin:0;padding:0;background:#f3f5fb;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f5fb;"><tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
<tr><td style="height:6px;background:linear-gradient(90deg,#3457D5,#6E5AD6,#F0A020);font-size:0;line-height:0;">&nbsp;</td></tr>
${WORDMARK_ROW}
${TAGLINE_ROW}
<tr><td style="padding:0 40px 8px 40px;">${body}</td></tr>
<tr><td align="center" style="padding:6px 40px 10px 40px;"><a href="${link}" style="display:inline-block;background:#6E5AD6;color:#ffffff;border:2px solid #6E5AD6;${FONT}font-size:16px;font-weight:700;text-decoration:none;padding:13px 28px;border-radius:999px;">Write your feedback</a></td></tr>
<tr><td style="padding:14px 40px 26px 40px;"><p style="margin:0;${FONT}font-size:16px;line-height:1.65;color:#475569;">Thanks for your time!</p></td></tr>
<tr><td style="padding:20px 40px 26px 40px;background:#f8fafc;border-top:1px solid #e2e8f0;${FONT}font-size:13px;line-height:1.6;color:#64748b;text-align:center;">You are receiving this because you created a StartZig account. Don&rsquo;t want these emails? <a href="${SITE}/contact?topic=unsubscribe" style="color:#6E5AD6;font-weight:700;">Let us know here</a>.</td></tr>
</table></td></tr></table></body></html>`;

  const text =
    paragraphs.map(stripTags).join("\n\n") +
    `\n\nWrite your feedback: ${link}\n\nThanks for your time!`;

  return { subject: k.subject, html, text };
}
