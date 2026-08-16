"use client";
// [ADDED 020826] Mobile Companion project — the mobile home screen shown
// instead of the full desktop dashboard, per this session's explicit
// decision to keep this in its own file rather than growing
// dashboard-page.jsx (already very large) with another big conditional
// branch. dashboard-page.jsx only needs to check isMobile and render this
// component with the venture/messages/stats it already has loaded.
//
// [FIX 020826] Rebuilt this session's UI iteration, per direct feedback:
// - No more popup/overlay windows (Info, Profile, Notifications). Icons now
//   toggle an inline panel that appears within the page's own flow, right
//   below the icon row — not an absolutely-positioned dropdown/drawer.
// - Icons show a visual "active" state matching whichever panel (if any) is
//   currently open, so it's clear what's showing and how to get back (tap
//   Home, or tap the same icon again).
// - Logout removed from the icon row entirely (a stray tap = instant,
//   confusing logout) — replaced with Home there, and a plain text Logout
//   link at the bottom of the page instead.
// - "Latest Update" replaced with a Venture Profile card: the same stats
//   already shown on the desktop dashboard (messages/founders/age/balance/
//   valuation), plus the fields filled in at venture creation
//   (description/problem/solution/industry), collapsible, not always
//   expanded.
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { differenceInDays } from 'date-fns';
import { Home, Info, User, Bell, MessageSquare, Users, Clock, Wallet, BarChart3, ChevronDown } from 'lucide-react';
import JourneyClock, { PHASE_HEX_COLORS } from '@/components/ventures/JourneyClock';

const PHASE_LABELS = { idea: 'Idea', business_plan: 'Plan', mvp: 'MVP', mlp: 'MLP', beta: 'Beta', growth: 'Growth' };
const PHASE_DESCRIPTIONS = {
  idea: 'Turn your spark into a clear venture concept.',
  business_plan: 'Define your mission, market, and business model.',
  mvp: 'Build a minimum viable product and test it with real users.',
  mlp: 'Turn feedback into a more lovable, polished product.',
  beta: 'Open your product to real beta testers.',
  growth: 'Scale what is already working.',
};

// Same helpers used in product-feedback-page.jsx and my-account-page.jsx,
// kept in sync so the profile summary reads identically everywhere.
function getJourneyTag(rawPhase) {
  const map = { idea: 'Spark', business_plan: 'Plan', mvp: 'Shape', mlp: 'Shape', beta: 'Beta', growth: 'Beta' };
  return map[rawPhase] || null;
}
function getInsightStatus(count) {
  if (count >= 50) return 'Master';
  if (count >= 20) return 'Champion';
  if (count >= 5) return 'Builder';
  if (count >= 1) return 'Starter';
  return 'Seeker';
}
function getVentureAge(venture) {
  if (!venture?.created_date) return 0;
  return differenceInDays(new Date(), new Date(venture.created_date));
}
function formatValuation(val) {
  if (!val) return '$0';
  return val >= 1000000 ? `$${Math.floor(val / 1000000)}M` : `$${Math.floor(val / 1000)}K`;
}

export default function MobileHome({ venture, messages = [], userEmail, liveBalance = 0, currentValuation = 0 }) {
  const router = useRouter();
  const [activeView, setActiveView] = useState('home'); // 'home' | 'info' | 'profile' | 'notifications'
  const [updateIndex, setUpdateIndex] = useState(0);
  const [showCreationDetails, setShowCreationDetails] = useState(false);
  const [profileSummary, setProfileSummary] = useState(null);

  React.useEffect(() => {
    const loadProfile = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id;
      if (!uid) return;
      const { data } = await supabase.rpc('get_public_founder_profile', { profile_id: uid });
      if (data?.[0]) setProfileSummary(data[0]);
    };
    loadProfile();
  }, []);

  const latestUpdate = messages[updateIndex] || null;
  const canGoOlder = updateIndex < messages.length - 1;
  const showContinueToPlan = venture?.phase === 'idea' || venture?.phase === 'business_plan';

  const toggleView = (view) => setActiveView(prev => (prev === view ? 'home' : view));

  const iconBtnClass = (view) =>
    `w-11 h-11 rounded-full flex items-center justify-center border transition-colors ${
      activeView === view ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-700'
    }`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Icon row — Home / Info / Profile / Notifications. Each shows an
          active state (filled indigo) when its panel is open. */}
      <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-3">
        <button onClick={() => setActiveView('home')} className={iconBtnClass('home')}>
          <Home className="w-5 h-5" />
        </button>
        <button onClick={() => toggleView('info')} className={iconBtnClass('info')}>
          <Info className="w-5 h-5" />
        </button>
        <button onClick={() => toggleView('profile')} className={iconBtnClass('profile')}>
          <User className="w-5 h-5" />
        </button>
        <button onClick={() => toggleView('notifications')} className={`relative ${iconBtnClass('notifications')}`}>
          <Bell className="w-5 h-5" />
          {messages.length > 0 && activeView !== 'notifications' && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] min-w-[16px] h-4 rounded-full flex items-center justify-center px-1">
              {messages.length}
            </span>
          )}
        </button>
      </div>
      <div className="border-b border-gray-200" />

      {/* Inline panels — appear within the page flow, not as overlays. */}
      {activeView === 'info' && venture?.phase && (
        <div className="mx-4 mt-4 bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-semibold mb-1" style={{ color: PHASE_HEX_COLORS[venture.phase] }}>{PHASE_LABELS[venture.phase]}</p>
          <p className="text-sm text-gray-600">{PHASE_DESCRIPTIONS[venture.phase]}</p>
        </div>
      )}

      {activeView === 'profile' && (
        <div className="mx-4 mt-4 bg-white border border-gray-200 rounded-xl p-4">
          <p className="font-semibold text-gray-900">{profileSummary?.username || userEmail || 'Your profile'}</p>
          {profileSummary?.early_adopter && <p className="text-xs text-amber-600 font-medium mt-0.5">⭐ Early Adopter</p>}
          {profileSummary && (
            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
              <div className="bg-gray-50 rounded-lg py-3">
                <p className="text-sm font-semibold text-gray-900">{getJourneyTag(profileSummary.current_phase) || '—'}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Stage</p>
              </div>
              <div className="bg-gray-50 rounded-lg py-3">
                <p className="text-sm font-semibold text-gray-900">{getInsightStatus(profileSummary.feedback_count ?? 0)}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Status</p>
              </div>
              <div className="bg-gray-50 rounded-lg py-3">
                <p className="text-sm font-semibold text-gray-900">
                  {profileSummary.joined_date
                    ? (() => {
                        const days = Math.floor((Date.now() - new Date(profileSummary.joined_date).getTime()) / 86400000);
                        if (days < 30) return `${days}d`;
                        if (days < 365) return `${Math.floor(days / 30)}mo`;
                        return `${Math.floor(days / 365)}y`;
                      })()
                    : '—'}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">Zig age</p>
              </div>
            </div>
          )}
          <button
            onClick={() => router.push('/my-account')}
            className="w-full text-center border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-indigo-600 mt-4"
          >
            View full account →
          </button>
        </div>
      )}

      {activeView === 'notifications' && (
        <div className="mx-4 mt-4 bg-white border border-gray-200 rounded-xl p-4">
          {latestUpdate ? (
            <>
              <p className="font-semibold text-gray-900 mb-1">{latestUpdate.title}</p>
              <p className="text-sm text-gray-600 mb-3">{latestUpdate.content}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{updateIndex + 1} / {messages.length}</span>
                <button
                  onClick={() => setUpdateIndex(i => Math.min(i + 1, messages.length - 1))}
                  disabled={!canGoOlder}
                  className="text-sm font-medium text-indigo-600 disabled:opacity-30 disabled:text-gray-400"
                >
                  Next ›
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400 text-center">No updates yet.</p>
          )}
        </div>
      )}

      {/* Home content — always the base layer; the panels above appear
          before it, not instead of it. */}
      <div className="p-4">
        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 mb-3">
          <div style={{ width: 26, height: 26, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          </div>
          <span className="font-extrabold text-gray-900 text-base tracking-tight">StartZig Mobile Companion</span>
        </button>

        <p className="text-xs text-gray-400 mb-4">
          Your mobile companion. Track updates and progress on the go.
          {venture?.phase && venture.phase !== 'idea' && venture.phase !== 'business_plan' && (
            <> You are all set on mobile. Head to desktop to continue building your {PHASE_LABELS[venture.phase]}.</>
          )}
        </p>

        <div className="mb-3 text-center">
          <p className="font-bold text-xl text-gray-900">{venture?.name || 'Your Venture'}</p>
          <p className="text-sm font-semibold" style={{ color: PHASE_HEX_COLORS[venture?.phase] || '#6b7280' }}>
            {PHASE_LABELS[venture?.phase] || ''}
          </p>
        </div>

        {venture?.phase && (
          <div className="mb-4 flex justify-center">
            <JourneyClock currentPhase={venture.phase} maxWidth={160} />
          </div>
        )}

        {/* [ADDED 020826] Venture Profile — replaces Latest Update. Part A:
            same stats already shown on the desktop dashboard. Part B: the
            fields filled in at venture creation, collapsed by default. */}
        {venture && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
            <p className="font-semibold text-gray-900 mb-2">{venture.name}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 mb-1">
              <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" />{messages.length} messages</span>
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{(venture.founder_user_ids || []).length || 1} founders</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{getVentureAge(venture)} days old</span>
            </div>
            <div className="flex items-center gap-x-4 text-xs text-gray-500 mb-3">
              <span className="flex items-center gap-1"><Wallet className="w-3.5 h-3.5" />Balance: <span className="font-mono">${liveBalance?.toLocaleString()}</span></span>
              <span className="flex items-center gap-1 border-l border-gray-200 pl-4"><BarChart3 className="w-3.5 h-3.5" />Val: {formatValuation(currentValuation)}</span>
            </div>

            <button
              onClick={() => setShowCreationDetails(v => !v)}
              className="flex items-center gap-1 text-xs font-medium text-indigo-600 pt-2 border-t border-gray-100 w-full"
            >
              {showCreationDetails ? 'Hide' : 'Show'} details
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCreationDetails ? 'rotate-180' : ''}`} />
            </button>

            {showCreationDetails && (
              <div className="mt-3 space-y-3">
                {venture.description && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Description</p>
                    <p className="text-sm text-gray-700">{venture.description}</p>
                  </div>
                )}
                {venture.problem && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Problem</p>
                    <p className="text-sm text-gray-700">{venture.problem}</p>
                  </div>
                )}
                {venture.solution && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Solution</p>
                    <p className="text-sm text-gray-700">{venture.solution}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

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

        {/* [FIX 020826] Logout moved here — a plain text link at the bottom,
            not an icon that could be tapped by accident. */}
        <div className="text-center mt-8 pb-4">
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}
            className="text-sm text-gray-400 underline"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
