//login
"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ support both ?next= and ?redirect=
  const [redirectPath, setRedirectPath] = useState("/dashboard");

  useEffect(() => {
  const searchParams = new URLSearchParams(window.location.search);

  // תומך גם ב-next וגם ב-redirect
  const redirect =
    searchParams.get('next') ||
    searchParams.get('redirect') ||
    '/dashboard';

  setRedirectPath(redirect.startsWith('/') ? redirect : '/dashboard');
}, []);

  // ✅ אם כבר מחובר, לא להציג לוגין בכלל — להעיף ישר ליעד
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        // replace כדי לא להשאיר את /login בהיסטוריה
        window.location.assign(redirectPath);
        router.refresh?.();
      }
    };
    checkSession();
  }, [redirectPath, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    // ✅ הכי יציב: קודם replace, ואז hard redirect כדי לוודא שלא נשאר overlay
    try {
      router.replace(redirectPath);
      router.refresh?.();
    } finally {
      // hard navigation — מבטיח שהמסך הקודם נטען מחדש בלי "חלון" לוגין שנשאר
      window.location.href = redirectPath;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
  

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              autoComplete="email"
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <p className="text-right mt-1">
            <Link href="/reset-password" className="text-indigo-600 text-sm hover:underline">
              Forgot your password?
            </Link>
          </p>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Don't have an account?{" "}
          <Link href="/register" className="text-indigo-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
