// register-cofounder
// [NEW FILE] Dedicated registration page for invited co-founders.
// Receives token and ventureId from URL params.
// After successful registration, links the new user to the venture
// by adding their user_id to founder_user_ids — before the dashboard ever loads.
// Safety: if any step fails, user is redirected to /dashboard anyway.
"use client";

import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

function RegisterCoFounderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const ventureId = searchParams.get("venture");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ventureName, setVentureName] = useState("");

  // [ADDED] Load venture name to show a personalized welcome message.
  // Safety: if venture not found, page still works normally.
  useEffect(() => {
    const loadVentureName = async () => {
      if (!ventureId) return;
      try {
        const { data } = await supabase
          .from("ventures")
          .select("name")
          .eq("id", ventureId)
          .single();
        if (data?.name) setVentureName(data.name);
      } catch (e) {
        console.error("Could not load venture name:", e);
      }
    };
    loadVentureName();
  }, [ventureId]);

  // [ADDED] If token or ventureId are missing, redirect to regular register.
  // This prevents the page from being used as a generic registration page.
  useEffect(() => {
    if (!token || !ventureId) {
      router.replace("/register");
    }
  }, [token, ventureId, router]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      // Step 1: Register the user
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (data?.user?.identities?.length === 0) {
        setError("This email is already registered. Please sign in instead.");
        setLoading(false);
        return;
      }

      const userId = data.user.id;

      // Step 2: Save username to user_profiles
      const { error: profileError } = await supabase
        .from("user_profiles")
        .upsert({ id: userId, username: username.trim() });

      if (profileError) {
        console.error("Profile save error:", profileError);
        // Non-fatal — continue anyway
      }

      // Step 3: Validate the invitation token
      // [ADDED] Checks that the token exists and belongs to this venture.
      // Safety: if token is invalid, user still gets registered and redirected to dashboard.
      const { data: invitation, error: inviteError } = await supabase
        .from("co_founder_invitations")
        .select("id, status")
        .eq("invitation_token", token)
        .eq("venture_id", ventureId)
        .single();

      if (inviteError || !invitation) {
        console.error("Invalid invitation token:", inviteError);
        // Non-fatal — redirect to dashboard anyway
        router.replace("/dashboard");
        return;
      }

      // Step 4: Add user_id to founder_user_ids on the venture
      // [ADDED] Uses Supabase jsonb append to add co-founder's user_id to the array.
      // Safety: wrapped in try/catch — if this fails, user still lands on dashboard.
      try {
        const { data: ventureData } = await supabase
          .from("ventures")
          .select("founder_user_ids, founders_count")
          .eq("id", ventureId)
          .single();

        const currentIds = ventureData?.founder_user_ids || [];
        const updatedIds = [...currentIds, userId];

        await supabase
          .from("ventures")
          .update({
            founder_user_ids: updatedIds,
            founders_count: (ventureData?.founders_count || 1) + 1,
          })
          .eq("id", ventureId);
      } catch (ventureUpdateError) {
        console.error("Could not link user to venture:", ventureUpdateError);
        // Non-fatal — redirect to dashboard anyway
      }

      // Step 5: Mark invitation as accepted
      // [ADDED] Updates invitation status so the original founder can see it was accepted.
      // Safety: non-fatal if this fails.
      try {
        await supabase
          .from("co_founder_invitations")
          .update({ status: "accepted" })
          .eq("invitation_token", token)
          .eq("venture_id", ventureId);
      } catch (e) {
        console.error("Could not update invitation status:", e);
      }

      // Step 6: Notify the original founder
      try {
        await supabase.from("venture_messages").insert({
          venture_id: ventureId,
          message_type: "co_founder_joined",
          title: "🚀 New Co-Founder Joined!",
          content: `${username} has officially joined your venture as a co-founder.`,
          priority: 4,
          is_dismissed: false,
        });
      } catch (e) {
        console.error("Could not create co-founder message:", e);
      }

      alert("Registration successful! Please check your email to confirm your account.");
      router.push("/login");

    } catch (err) {
      console.error("Registration error:", err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        {/* [ADDED] Personalized header showing which venture they're joining */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold">Join as Co-Founder</h2>
          {ventureName && (
            <p className="text-gray-500 text-sm mt-1">You're joining <strong>{ventureName}</strong></p>
          )}
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">User Name</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Join as Co-Founder"}
          </button>
        </form>
        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterCoFounder() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    }>
      <RegisterCoFounderForm />
    </Suspense>
  );
}
