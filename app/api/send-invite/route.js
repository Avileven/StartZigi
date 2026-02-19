// api/send-invite/route.js
// [2026-01-10] FIX: Support multiple invite targets (co_founder -> venture-profile, external_feedback -> venture-landing)
//                 without breaking existing co-founder flow.
// [UPDATED 180226] ADDED: beta_testing type for public beta sign-up page invitations

import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

function getBaseUrl(request) {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");

  const proto = request.headers.get("x-forwarded-proto") || "https";
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (!host) return "https://www.startzig.com";

  return `${proto}://${host}`;
}

// [2026-01-10] FIX: Build link by invite type (default keeps previous behavior)
// [UPDATED 180226] ADDED: beta_testing case
function buildInviteLink({ baseUrl, ventureId, invitationToken, inviteType }) {
  const token = encodeURIComponent(invitationToken);
  
  // Normalize type
  const t = String(inviteType || "co_founder").toLowerCase();

  // ✅ Default (existing behavior): co-founder invites -> venture-profile/[id]?token=
  if (t === "co_founder") {
    return {
      url: `${baseUrl}/venture-profile/${ventureId}?token=${token}`,
      ctaText: "View Venture Profile",
      headline: "has invited you to explore their venture and discuss a potential co-founder partnership:",
    };
  }

  // ✅ New: external feedback invites -> venture-landing (public landing) with token
  // [2026-01-10] FIX: include both token params for backward compatibility with older landing implementations
  if (t === "external_feedback") {
    const url = `${baseUrl}/venture-landing?id=${encodeURIComponent(
      ventureId
    )}&token=${token}&invitation_token=${token}`;
    return {
      url,
      ctaText: "Open Venture Landing Page",
      headline: "has invited you to review their venture and share feedback:",
    };
  }

  // ✅ UPDATED [180226]: beta testing invites -> public beta page (no token needed, just venture ID)
  if (t === "beta_testing") {
    return {
      url: `${baseUrl}/beta-testing?id=${encodeURIComponent(ventureId)}`,
      ctaText: "Join Beta Program",
      headline: "has invited you to join the beta testing program for:",
    };
  }

  // Fallback: keep safe default (profile)
  return {
    url: `${baseUrl}/venture-profile/${ventureId}?token=${token}`,
    ctaText: "View Venture Profile",
    headline: "has invited you to view the venture:",
  };
}

export async function POST(request) {
  try {
    const body = await request.json();

    // ✅ [2026-01-10] FIX: accept optional "type"/"invitationType" to choose the target page
    const {
      email,
      ventureName,
      inviterName,
      invitationToken,
      ventureId,
      type, // e.g. "external_feedback" or "beta_testing"
      invitationType, // optional alias
    } = body || {};

    const resolvedType = invitationType || type || "co_founder";

    console.log("send-invite payload:", {
      email,
      ventureName,
      inviterName,
      hasToken: !!invitationToken,
      ventureId,
      type: resolvedType,
    });

    if (!email || !ventureName || !inviterName || !invitationToken || !ventureId) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: {
            email: !!email,
            ventureName: !!ventureName,
            inviterName: !!inviterName,
            invitationToken: !!invitationToken,
            ventureId: !!ventureId,
          },
        },
        { status: 400 }
      );
    }

    const baseUrl = getBaseUrl(request);

    // ✅ [2026-01-10] FIX: choose link by invite type (keeps old co-founder behavior as default)
    // ✅ UPDATED [180226]: now supports beta_testing type
    const { url: inviteUrl, ctaText, headline } = buildInviteLink({
      baseUrl,
      ventureId,
      invitationToken,
      inviteType: resolvedType,
    });

    // ✅ UPDATED [180226]: Different subject line for beta testing
    const { data, error } = await resend.emails.send({
      from: "StartZig <invite@startzig.com>",
      to: [email],
      subject:
        resolvedType === "beta_testing"
          ? `${inviterName} invited you to join ${ventureName} Beta!`
          : resolvedType === "external_feedback"
          ? `${inviterName} invited you to review: ${ventureName}`
          : `${inviterName} invited you to view the venture: ${ventureName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 600px; margin: auto;">
          <h1 style="color: #1e293b; font-size: 24px;">Hello!</h1>
          <p style="color: #475569; font-size: 16px;">
            <strong>${inviterName}</strong> ${headline}
          </p>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h2 style="color: #6366f1; margin: 0;">${ventureName}</h2>
          </div>
          <p style="color: #475569; font-size: 16px;">Click the button below:</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${inviteUrl}"
               style="background-color: #6366f1; color: white; padding: 14px 32px;
                      text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              ${ctaText}
            </a>
          </div>
          <p style="margin-top: 30px; font-size: 12px; color: #94a3b8; line-height: 1.5;">
            This is a private invitation. If the button doesn't work, copy and paste this link into your browser:<br/>
            <span style="color: #6366f1;">${inviteUrl}</span>
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error }, { status: 400 });
    }

    // [2026-01-10] FIX: return the resolved link for easier debugging on client side if needed
    return NextResponse.json({ data, inviteUrl, type: resolvedType });
  } catch (error) {
    console.error("send-invite route failed:", error);
    return NextResponse.json({ error: error?.message || "Unknown error" }, { status: 500 });
  }
}
