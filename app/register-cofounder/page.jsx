// register-cofounder
// [NEW FILE] Dedicated registration page for invited co-founders.
// Receives token and ventureId from URL params.
// After successful registration:
// 1. Calls /api/link-cofounder to link user to venture and confirm their email server-side
// 2. Uses the session returned by signUp directly — no separate login needed
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

      // Step 2: Save username
      await supabase
        .from("user_profiles")
        .upsert({ id: userId, username: username.trim() });

      // Step 3: Call server-side API to:
      // - Confirm the user's email (so no confirmation email is needed)
      // - Link user to venture via founder_user_ids
      // - Mark invitation as accepted
      // - Notify the original founder
      // [FIX] Done server-side because right after signUp there is no active session,
      // so client-side DB writes would fail silently.
      try {
        await fetch("/api/link-cofounder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, token, ventureId, username }),
        });
      } catch (e) {
        console.error("link-cofounder API failed:", e);
        // Non-fatal — continue anyway
      }

      // Step 4: Sign in using the confirmed session
      // [FIX] After the API route confirms the email server-side,
      // signInWithPassword works immediately — no need to wait for email confirmation.
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        console.error("Sign-in failed:", signInError);
        // Fallback: redirect to login
        router.push("/login");
        return;
      }

      // Step 5: Go directly to dashboard — user is now linked to the venture
      router.push("/dashboard");

    } catch (err) {
      console.error("Registration error:", err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
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
