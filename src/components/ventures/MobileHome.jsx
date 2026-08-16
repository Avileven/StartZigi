"use client";
// [ADDED 020826] Mobile Companion project — the mobile home screen shown
// instead of the full desktop dashboard, per this session's explicit
// decision to keep this in its own file rather than growing
// dashboard-page.jsx (already very large) with another big conditional
// branch. dashboard-page.jsx only needs to check isMobile and render this
// component with the venture/messages it already has loaded.
//
// Scope for this version, per this session: Plan is the only stage with a
// mobile-native workspace so far. Everything past Plan is
// "Companion mode" only — journey clock, latest update, notifications,
// a link to My Account. No Continue card once past business_plan (no MVP/
// MLP/Beta mobile workspace exists yet).
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import JourneyClock, { PHASE_HEX_COLORS } from '@/components/ventures/JourneyClock';

// [ADDED 020826] Per-stage explanation for the (i) info icon.
const PHASE_LABELS = { idea: 'Idea', business_plan: 'Plan', mvp: 'MVP', mlp: 'MLP', beta: 'Beta', growth: 'Growth' };
const PHASE_DESCRIPTIONS = {
  idea: 'Turn your spark into a clear venture concept.',
  business_plan: 'Define your mission, market, and business model.',
  mvp: 'Build a minimum viable product and test it with real users.',
  mlp: 'Turn feedback into a more lovable, polished product.',
  beta: 'Open your product to real beta testers.',
  growth: 'Scale what\'s already working.',
};

export default function MobileHome({ venture, messages = [], userEmail }) {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [updateIndex, setUpdateIndex] = useState(0);
  const [showPhaseInfo, setShowPhaseInfo] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const latestUpdate = messages[updateIndex] || null;
  const canGoNewer = updateIndex > 0;
  const canGoOlder = updateIndex < messages.length - 1;

  const showContinueToPlan = venture?.phase === 'idea' || venture?.phase === 'business_plan';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* [FIX 020826] New top row — Logout / Info / Profile / Notifications,
          replacing the old ClientLayout Navigation/Toolbox buttons that
          were hidden on /dashboard for this reason. Thin divider below,
          separating it from the rest of the screen. */}
      <div className="flex items-center justify-end gap-2 px-4 pt-3 pb-3">
        <button onClick={handleLogout} className="p-2 rounded-full bg-white border border-gray-200">
          <span className="text-base">🔐</span>
        </button>
        <div className="relative">
          <button
            onClick={() => setShowPhaseInfo(v => !v)}
            className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-sm text-gray-500"
          >
            i
          </button>
          {showPhaseInfo && venture?.phase && (
            <div className="absolute top-11 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-56 z-30">
              <p className="text-xs font-semibold mb-1" style={{ color: PHASE_HEX_COLORS[venture.phase] }}>{PHASE_LABELS[venture.phase]}</p>
              <p className="text-xs text-gray-500">{PHASE_DESCRIPTIONS[venture.phase]}</p>
            </div>
          )}
        </div>
        <button onClick={() => setShowProfile(true)} className="p-2 rounded-full bg-white border border-gray-200">
          <span className="text-base">👤</span>
        </button>
        <div className="relative">
          <button onClick={() => setShowNotifications(v => !v)} className="relative p-2 rounded-full bg-white border border-gray-200">
            <span className="text-base">🔔</span>
            {messages.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] min-w-[16px] h-4 rounded-full flex items-center justify-center px-1">
                {messages.length}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute top-11 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-30 w-72 max-h-80 overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <p className="font-semibold text-sm">Updates</p>
                <button onClick={() => setShowNotifications(false)} className="text-gray-400">✕</button>
              </div>
              {messages.length === 0 ? (
                <p className="text-sm text-gray-400 p-4 text-center">No updates.</p>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="p-3 border-b border-gray-50 last:border-0">
                    <p className="text-sm font-medium">{msg.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{msg.content}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      <div className="border-b border-gray-200" />

      {/* [ADDED 020826] Short profile overlay — deliberately brief (name/
          email only, per this session's decision), not the full My Account
          page. A link at the bottom goes there for anyone who wants more. */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end" onClick={() => setShowProfile(false)}>
          <div className="bg-white rounded-t-2xl w-full p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-gray-900">Profile</p>
              <button onClick={() => setShowProfile(false)} className="text-gray-400 text-lg">✕</button>
            </div>
            <p className="text-sm text-gray-600 mb-4">{userEmail || 'Signed in'}</p>
            <button
              onClick={() => { setShowProfile(false); router.push('/my-account'); }}
              className="w-full text-center border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-indigo-600"
            >
              View full account →
            </button>
          </div>
        </div>
      )}

      <div className="p-4">
        {/* [FIX 020826] Title is now clickable — takes the place of a
            separate Home icon, per this session's decision. */}
        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 mb-3">
          <div style={{ width: 26, height: 26, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          </div>
          <span className="font-extrabold text-gray-900 text-base tracking-tight">StartZig Mobile Companion</span>
        </button>

        <p className="text-xs text-gray-400 mb-4">
          Your mobile companion — track updates and progress on the go.
          {venture?.phase && venture.phase !== 'idea' && venture.phase !== 'business_plan' && (
            <> You're all set on mobile — head to desktop to continue building your {PHASE_LABELS[venture.phase]}.</>
          )}
        </p>

        {/* [ADDED 020826] Venture name + phase, right above the clock. */}
        <div className="mb-3">
          <p className="font-bold text-xl text-gray-900">{venture?.name || 'Your Venture'}</p>
          <p className="text-sm font-semibold" style={{ color: PHASE_HEX_COLORS[venture?.phase] || '#6b7280' }}>
            {PHASE_LABELS[venture?.phase] || ''}
          </p>
        </div>

        {venture?.phase && (
          <div className="mb-2">
            <JourneyClock currentPhase={venture.phase} maxWidth={160} />
          </div>
        )}

      {/* Latest Update — always visible, separate from the notification
          dropdown above, with paging through recent messages. */}
      {latestUpdate && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Latest update</p>
          <p className="font-semibold text-gray-900 mb-1">{latestUpdate.title}</p>
          <p className="text-sm text-gray-600 mb-3">{latestUpdate.content}</p>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setUpdateIndex(i => Math.min(i + 1, messages.length - 1))}
              disabled={!canGoOlder}
              className="text-sm text-gray-400 disabled:opacity-30"
            >
              ‹
            </button>
            <span className="text-xs text-gray-400">{updateIndex + 1} / {messages.length}</span>
            <button
              onClick={() => setUpdateIndex(i => Math.max(i - 1, 0))}
              disabled={!canGoNewer}
              className="text-sm text-gray-400 disabled:opacity-30"
            >
              ›
            </button>
          </div>
        </div>
      )}

      {/* Continue card — only for Plan (the one stage with a mobile
          workspace so far). */}
      {showContinueToPlan && (
        <button
          onClick={() => router.push('/plan')}
          className="w-full text-left bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between"
        >
          <div>
            <p className="text-xs text-indigo-600 mb-0.5">Continue</p>
            <p className="font-semibold text-gray-900">Complete your Plan</p>
          </div>
          <span className="text-indigo-600">→</span>
        </button>
      )}
      </div>
    </div>
  );
}
