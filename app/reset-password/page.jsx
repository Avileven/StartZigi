
// app/reset-password/page.jsx 170126
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // [ADD] new password input
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isUpdateMode, setIsUpdateMode] = useState(false); 
  // [ADD] true = user came from email with access_token

  /**
   * [ADD] Detect if this page was opened from Supabase reset link
   * Supabase sends access_token + type=recovery in URL hash
   */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash;
    if (hash.includes("access_token") && hash.includes("type=recovery")) {
      setIsUpdateMode(true);
    }
  }, []);

  /**
   * [FIX] Send reset email with correct redirect (Vercel-safe)
   */
  const handleResetRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const redirectTo = `${window.location.origin}/reset-password`; // ✅ FIX

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("If this email exists, a reset link has been sent.");
    }

    setLoading(false);
  };

  /**
   * [ADD] Handle actual password update after user clicks email link
   */
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Password updated successfully. You can now log in.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-6">
          {isUpdateMode ? "Set New Password" : "Reset Password"}
        </h2>

        {/* ===== MODE 1: REQUEST RESET EMAIL ===== */}
        {!isUpdateMode && (
          <form onSubmit={handleResetRequest} className="space-y-4">
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

            {message && <p className="text-green-600 text-sm">{message}</p>}
            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        {/* ===== MODE 2: UPDATE PASSWORD ===== */}
        {isUpdateMode && (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {message && <p className="text-green-600 text-sm">{message}</p>}
            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}

        <p className="text-sm text-center mt-4">
          <Link href="/login" className="text-indigo-600 hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
