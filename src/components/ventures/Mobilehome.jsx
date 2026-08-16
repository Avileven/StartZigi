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
import { createPageUrl } from '@/lib/utils';
import JourneyClock from '@/components/ventures/JourneyClock';

export default function MobileHome({ venture, messages = [] }) {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [updateIndex, setUpdateIndex] = useState(0);

  const latestUpdate = messages[updateIndex] || null;
  const canGoNewer = updateIndex > 0;
  const canGoOlder = updateIndex < messages.length - 1;

  // [ADDED 020826] Continue card only for the one stage with a real mobile
  // workspace (Plan). Every other stage just gets the Companion view below
  // — no fake "Continue" leading somewhere that isn't mobile-ready yet.
  const showContinueToPlan = venture?.phase === 'idea' || venture?.phase === 'business_plan';

  return (
    <div className="min-h-screen bg-gray-50 p-4 relative">
      {/* Header — venture name/phase, notification bell, My Account link.
          No hamburger menu, per this session's explicit direction. */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-bold text-lg text-gray-900">{venture?.name || 'StartZig'}</p>
          <p className="text-xs text-gray-400 capitalize">{(venture?.phase || '').replace('_', ' ')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => router.push(createPageUrl('MyAccount'))} className="p-2 rounded-full bg-white border border-gray-200">
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

      {/* Journey clock — full-size, responsive (not shrunk), per this
          session's decision. */}
      {venture?.phase && (
        <div className="mb-6">
          <JourneyClock currentPhase={venture.phase} maxWidth={260} />
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
