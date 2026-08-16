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

export default function MobileHome({ venture, messages = [] }) {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [updateIndex, setUpdateIndex] = useState(0);
  const [showPhaseInfo, setShowPhaseInfo] = useState(false);

  const latestUpdate = messages[updateIndex] || null;
  const canGoNewer = updateIndex > 0;
  const canGoOlder = updateIndex < messages.length - 1;

  // [ADDED 020826] Continue card only for the one stage with a real mobile
  // workspace (Plan). Every other stage just gets the Companion view below
  // — no fake "Continue" leading somewhere that isn't mobile-ready yet.
  const showContinueToPlan = venture?.phase === 'idea' || venture?.phase === 'business_plan';

  return (
    <div className="min-h-screen bg-gray-50 p-4 relative">
      {/* [FIX 020826] Header now shows the StartZig logo, not the venture
          name — venture name + phase moved below, just above the clock. */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          </div>
          <span className="font-extrabold text-gray-900 text-lg tracking-tight">StartZig</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => router.push('/my-account')} className="p-2 rounded-full bg-white border border-gray-200">
            <span className="text-lg">👤</span>
          </button>
          <button onClick={() => setShowNotifications(v => !v)} className="relative p-2 rounded-full bg-white border border-gray-200">
            <span className="text-lg">🔔</span>
            {messages.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] min-w-[16px] h-4 rounded-full flex items-center justify-center px-1">
                {messages.length}
              </span>
            )}
          </button>
        </div>

        {showNotifications && (
          <div className="absolute top-14 right-4 left-4 bg-white border border-gray-200 rounded-xl shadow-lg z-40 max-h-80 overflow-y-auto">
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

      {/* [ADDED 020826] Venture name + phase (colored to match the clock),
          moved here from the header. */}
      <div className="mb-3">
        <p className="font-bold text-xl text-gray-900">{venture?.name || 'Your Venture'}</p>
        <p className="text-sm font-semibold" style={{ color: PHASE_HEX_COLORS[venture?.phase] || '#6b7280' }}>
          {PHASE_LABELS[venture?.phase] || ''}
        </p>
      </div>

      {/* [ADDED 020826] Explains what this screen is — especially important
          once past Plan, where there's no Continue card and it wouldn't
          otherwise be obvious what to do here. */}
      <p className="text-xs text-gray-400 mb-4">
        Your mobile companion — track updates and progress on the go.
        {venture?.phase && venture.phase !== 'idea' && venture.phase !== 'business_plan' && (
          <> You're all set on mobile — head to desktop to continue building your {PHASE_LABELS[venture.phase]}.</>
        )}
      </p>

      {/* Journey clock — full-size, responsive (not shrunk), per this
          session's decision. */}
      {venture?.phase && (
        <div className="mb-2 relative">
          <button
            onClick={() => setShowPhaseInfo(v => !v)}
            className="absolute top-0 right-0 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs text-gray-500 z-10"
          >
            i
          </button>
          {showPhaseInfo && (
            <div className="absolute top-8 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-56 z-20">
              <p className="text-xs font-semibold mb-1" style={{ color: PHASE_HEX_COLORS[venture.phase] }}>{PHASE_LABELS[venture.phase]}</p>
              <p className="text-xs text-gray-500">{PHASE_DESCRIPTIONS[venture.phase]}</p>
            </div>
          )}
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
  );
}
