
// app/venture-profile/[id]/page.jsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import {
  Target,
  Lightbulb,
  AlertCircle,
  TrendingUp,
  Users,
  Lock,
  CheckCircle,
} from 'lucide-react';

// [2026-01-08] FIX: This page MUST be client-side.
// Reason: JOIN requires the logged-in user (auth session). Server Action didn't have user context
// and relied on service role key → caused 500 crashes on Vercel.
export default function VentureProfilePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const id = params?.id; // venture id from route /venture-profile/[id]
  const token = searchParams?.get('token') || ''; // invitation token from URL

  const [loading, setLoading] = useState(true);
  const [authBlocked, setAuthBlocked] = useState(false);
  const [plan, setPlan] = useState(null);
  const [venture, setVenture] = useState(null);
  const [invitation, setInvitation] = useState(null);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState('');

  // [2026-01-08] FIX: Create a *local* Supabase client instance that sends `invitation-token`
  // on every request so your RLS "Public Read Access via Invitation Token" policies work.
  const supabase = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    // Basic guard
    if (!supabaseUrl || !supabaseAnonKey) return null;

    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: token ? { 'invitation-token': token } : {},
      },
    });
  }, [token]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setJoinError('');

        if (!id || !token || !supabase) {
          // Missing params → treat as private / invalid link
          setAuthBlocked(true);
          setLoading(false);
          return;
        }

        // 1) Validate invitation (public read via invitation-token header)
        const { data: invite, error: inviteErr } = await supabase
          .from('co_founder_invitations')
          .select('id, venture_id, status, invitation_token, invitee_email, invitee_name')
          .eq('venture_id', String(id))
          .eq('invitation_token', token)
          .single();

        if (inviteErr || !invite) {
          setAuthBlocked(true);
          setLoading(false);
          return;
        }
        setInvitation(invite);

        // 2) Pull venture (again via invitation-token policy)
        const { data: v, error: vErr } = await supabase
          .from('ventures')
          .select('id, name, description, problem, solution, sector, founders_count, founder_user_ids, created_date')
          .eq('id', id)
          .single();

        // Some DBs store venture_id in invitations as text; still ok because we read by id from route.
        if (vErr || !v) {
          setAuthBlocked(true);
          setLoading(false);
          return;
        }
        setVenture(v);

        // 3) Pull business plan (if exists)
        const { data: bp } = await supabase
          .from('business_plans')
          .select('*')
          .eq('venture_id', id)
          .maybeSingle();

        setPlan(bp || null);

        setLoading(false);
      } catch (e) {
        console.error('VentureProfile fetch error:', e);
        setAuthBlocked(true);
        setLoading(false);
      }
    };

    fetchAll();
  }, [id, token, supabase]);

  const redirectToLoginWithReturn = () => {
    // [2026-01-08] FIX: Keep the token in the return URL so after login the user comes back
    // to the same invitation link and can click JOIN again (or you can auto-join later).
    const next = `/venture-profile/${id}?token=${encodeURIComponent(token)}`;
    router.push(`/login?next=${encodeURIComponent(next)}`);
  };

  const handleJoin = async () => {
    try {
      setJoinLoading(true);
      setJoinError('');

      if (!supabase) {
        setJoinError('Supabase client not initialized (missing env vars).');
        setJoinLoading(false);
        return;
      }

      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();

      // Not logged in → must login first
      if (userErr || !user) {
        redirectToLoginWithReturn();
        return;
      }

      // [2026-01-08] FIX: Real join happens via DB function (single source of truth)
      // This function should:
      // - validate invitation token
      // - set invitation accepted + accepted_by_user_id/co_founder_user_id
      // - add user to ventures.founder_user_ids and update founders_count
      // - enforce "one venture per user" if you kept that rule
      const { data: res, error: rpcErr } = await supabase.rpc('accept_co_founder_invite', {
        p_invitation_token: token,
        p_user_id: user.id,
      });

      if (rpcErr) throw rpcErr;

      if (res?.error) {
        // your function returns json with 'error'
        setJoinError(String(res.error));
        setJoinLoading(false);
        return;
      }

      // Refresh data after join
      // [2026-01-08] FIX: re-fetch invitation + venture to reflect accepted state.
      const { data: invite2 } = await supabase
        .from('co_founder_invitations')
        .select('id, venture_id, status, invitation_token, invitee_email, invitee_name, accepted_by_user_id, co_founder_user_id')
        .eq('venture_id', String(id))
        .eq('invitation_token', token)
        .single();

      setInvitation(invite2 || invitation);

      const { data: v2 } = await supabase
        .from('ventures')
        .select('id, name, description, problem, solution, sector, founders_count, founder_user_ids, created_date')
        .eq('id', id)
        .single();

      if (v2) setVenture(v2);

      // Optional: go straight to dashboard after successful join
      // [2026-01-08] CHANGE: you can keep them here (profile) or send to dashboard.
      router.push('/dashboard');
    } catch (e) {
      console.error('JOIN error:', e);
      setJoinError(e?.message || 'Failed to join venture.');
    } finally {
      setJoinLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="animate-pulse text-gray-700">Loading venture profile…</div>
        </div>
      </div>
    );
  }

  if (authBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans text-center">
        <div className="max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <Lock className="mx-auto text-red-500 mb-4" size={48} />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Private Profile</h1>
          <p className="text-gray-600">
            This profile is only accessible via a valid co-founder invitation link.
          </p>
        </div>
      </div>
    );
  }

  const isAccepted = invitation?.status === 'accepted';

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 text-left" dir="ltr">
      <div className="max-w-5xl mx-auto font-sans">
        {/* Header */}
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6 mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2 italic">Venture Profile</h1>
              <p className="text-gray-500 text-lg font-light">Confidential Partnership Overview</p>
            </div>

            {isAccepted ? (
              <div className="bg-green-100 text-green-700 px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                <CheckCircle size={16} /> YOU ARE A PARTNER
              </div>
            ) : (
              <div className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-bold tracking-wide">
                AUTHORIZED VIEW
              </div>
            )}
          </div>

          {/* JOIN block */}
          {!isAccepted && (
            <div className="mb-2 p-6 bg-blue-50 border border-blue-100 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-blue-900 font-bold text-lg">Ready to join this venture?</h3>
                <p className="text-blue-700 text-sm">
                  By clicking join, you confirm your interest as a co-founder.
                </p>
                {joinError ? (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {joinError}
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={handleJoin}
                disabled={joinLoading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl font-bold shadow-sm"
              >
                {joinLoading ? 'Joining…' : 'JOIN'}
              </button>
            </div>
          )}
        </div>

        {/* Venture basics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <Target className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-gray-900">Venture</h2>
            </div>
            <p className="text-gray-900 font-semibold text-xl">{venture?.name || '—'}</p>
            <p className="text-gray-600 mt-2">{venture?.description || '—'}</p>
            <div className="mt-4 text-sm text-gray-500 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Founders: <span className="font-semibold text-gray-700">{venture?.founders_count ?? 1}</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <Lightbulb className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-bold text-gray-900">Problem & Solution</h2>
            </div>
            <p className="text-gray-800 font-semibold">Problem</p>
            <p className="text-gray-600 mb-4">{venture?.problem || '—'}</p>
            <p className="text-gray-800 font-semibold">Solution</p>
            <p className="text-gray-600">{venture?.solution || '—'}</p>
          </div>
        </div>

        {/* Business plan summary (if exists) */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-bold text-gray-900">Business Plan</h2>
          </div>

          {!plan ? (
            <p className="text-gray-600">
              No business plan data was found yet for this venture.
            </p>
          ) : (
            <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed bg-gray-50 border border-gray-200 rounded-xl p-4 overflow-x-auto">
              {JSON.stringify(plan, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
