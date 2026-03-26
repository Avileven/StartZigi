// api/link-cofounder/route.js
// [NEW FILE] Server-side API route that:
// 1. Confirms the co-founder's email — so they don't need to click a confirmation link
// 2. Links them to the venture via founder_user_ids
// 3. Marks the invitation as accepted
// 4. Notifies the original founder
//
// Uses service role key to bypass auth — necessary because the user
// has no active session immediately after signUp.

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

    if (!userId || !token || !ventureId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const admin = createSupabaseAdmin();

    // Step 1: Confirm the user's email server-side
    // [ADDED] This skips email confirmation only for invited co-founders,
    // without changing the global Supabase email confirmation setting.
    const { error: confirmError } = await admin.auth.admin.updateUserById(userId, {
      email_confirm: true,
    });
    if (confirmError) {
      console.error("Email confirmation failed:", confirmError);
      // Non-fatal — continue anyway
    }

    // Step 2: Validate invitation token
    const { data: invitation, error: inviteError } = await admin
      .from("co_founder_invitations")
      .select("id, status")
      .eq("invitation_token", token)
      .eq("venture_id", ventureId)
      .single();

    if (inviteError || !invitation) {
      return NextResponse.json({ error: "Invalid invitation token" }, { status: 400 });
    }

    // Step 3: Add user_id to founder_user_ids
    const { data: ventureData } = await admin
      .from("ventures")
      .select("founder_user_ids, founders_count")
      .eq("id", ventureId)
      .single();

    const currentIds = ventureData?.founder_user_ids || [];
    // Prevent duplicate entries
    if (!currentIds.includes(userId)) {
      const updatedIds = [...currentIds, userId];
      await admin
        .from("ventures")
        .update({
          founder_user_ids: updatedIds,
          founders_count: (ventureData?.founders_count || 1) + 1,
        })
        .eq("id", ventureId);
    }

    // Step 4: Mark invitation as accepted
    await admin
      .from("co_founder_invitations")
      .update({ status: "accepted" })
      .eq("invitation_token", token)
      .eq("venture_id", ventureId);

    // Step 5: Notify the original founder
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
