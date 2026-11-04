// ============================================================
// FILE DESTINATION: components/auth/GoogleSignInButton.jsx (NEW file)
// ============================================================
// "Continue with Google" button. Works for both sign up and log in:
// Supabase creates the account on first use and signs in on later ones.
// Nothing else in the app is touched by this file.
"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.2C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
      <path fill="#FBBC05" d="M10.5 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.1.8-4.6l-7.9-6.2A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.2z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.9l-7.9 6.2C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

// Props:
//   next  — where to land after Google sends the person back (default: home page,
//           which already routes by sign-in state / venture). Pass the same
//           `next` value the login page already uses, if there is one.
//   label — button text.
export default function GoogleSignInButton({ next = '/', label = 'Continue with Google', className = '' }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async () => {
    setBusy(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}${next}` },
    });
    // On success the browser is redirected to Google, so nothing else runs here.
    if (err) {
      console.error('Google sign-in failed:', err);
      setError('Could not start Google sign-in. Please try again.');
      setBusy(false);
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className="w-full flex items-center justify-center gap-3 rounded-full border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60 transition-colors"
      >
        <GoogleLogo />
        {label}
      </button>
      {error && <p className="text-sm text-red-600 mt-2 text-center">{error}</p>}
    </div>
  );
}
