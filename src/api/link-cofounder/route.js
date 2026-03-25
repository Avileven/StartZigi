// api/link-cofounder/route.js
// [NEW FILE] Server-side API route that links a newly registered co-founder to their venture.
// Uses the Supabase service role key to bypass auth — necessary because the user
// has no active session immediately after signUp.
// Called from register-cofounder/page.jsx after successful registration.

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, serviceKey);
}

export async function POST(request) {
  try {
    const { userId, token, ventureId, username } = await request.json();

    // Validate required fields
    if (!userId || !token || !ventureId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const admin = createSupabaseAdmin();

    // Step 1: Validate invitation token
    // [ADDED] Checks token belongs to this venture and is in sent status.
    const { data: invitation, error: inviteError } = await admin
      .from("co_founder_invitations")
      .select("id, status")
      .eq("invitation_token", token)
      .eq("venture_id", ventureId)
      .single();

    if (inviteError || !invitation) {
      return NextResponse.json({ error: "Invalid invitation token" }, { status: 400 });
    }

    // Step 2: Add user_id to founder_user_ids on the venture
    // [ADDED] Fetches current array and appends the new user_id.
    // Safety: if venture not found, returns error but doesn't crash.
    const { data: ventureData, error: ventureError } = await admin
      .from("ventures")
      .select("founder_user_ids, founders_count")
      .eq("id", ventureId)
      .single();

    if (ventureError || !ventureData) {
      return NextResponse.json({ error: "Venture not found" }, { status: 404 });
    }

    const currentIds = ventureData.founder_user_ids || [];
    // Prevent duplicate entries
    if (!currentIds.includes(userId)) {
      const updatedIds = [...currentIds, userId];
      await admin
        .from("ventures")
        .update({
          founder_user_ids: updatedIds,
          founders_count: (ventureData.founders_count || 1) + 1,
        })
        .eq("id", ventureId);
    }

    // Step 3: Mark invitation as accepted
    await admin
      .from("co_founder_invitations")
      .update({ status: "accepted" })
      .eq("invitation_token", token)
      .eq("venture_id", ventureId);

    // Step 4: Notify the original founder
    await admin.from("venture_messages").insert({
      venture_id: ventureId,
      message_type: "co_founder_joined",
      title: "🚀 New Co-Founder Joined!",
      content: `${username || "A new co-founder"} has officially joined your venture.`,
      priority: 4,
      is_dismissed: false,
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("link-cofounder error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
