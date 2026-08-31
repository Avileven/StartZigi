"use client";
// [ADDED 020826] Mobile Companion project — the mobile home screen shown
// instead of the full desktop dashboard, per this session's explicit
// decision to keep this in its own file rather than growing
// dashboard-page.jsx with another big conditional branch.
//
// [FIX 020826] Simplified this session — the icon row and Info/Profile/
// Notifications panels moved to ClientLayout.jsx (the global layout, so it
// persists across real navigation to /info-mobile, /my-account,
// /notifications). This file is now just the Home content: venture name +
// phase, the journey clock, a styled Venture Profile card, and the
// Continue-to-Plan card.
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { differenceInDays } from 'date-fns';
import { MessageSquare, Users, Clock, Wallet, BarChart3, ChevronDown, Target, Lightbulb, FileText } from 'lucide-react';
import JourneyClock, { PHASE_HEX_COLORS } from '@/components/ventures/JourneyClock';

const PHASE_LABELS = { idea: 'Idea', business_plan: 'Plan', mvp: 'MVP', mlp: 'MLP', beta: 'Beta', growth: 'Growth' };

function getVentureAge(venture) {
  if (!venture?.created_date) return 0;
  return differenceInDays(new Date(), new Date(venture.created_date));
}
function formatValuation(val) {
  if (!val) return '$0';
  return val >= 1000000 ? `$${Math.floor(val / 1000000)}M` : `$${Math.floor(val / 1000)}K`;
}

export default function MobileHome({ venture, messages = [], liveBalance = 0, currentValuation = 0 }) {
  const router = useRouter();
  const [showCreationDetails, setShowCreationDetails] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const showContinueToPlan = venture?.phase === 'idea' || venture?.phase === 'business_plan';
  // [NEW] Mirrors showContinueToPlan exactly — was completely missing, so
  // a founder reaching Growth on mobile had no way in from this screen at
  // all except the generic "go to desktop" text below (also being fixed).
  const showContinueToGrowth = venture?.phase === 'growth';

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* [FIX 020826] Title now centered (was left-aligned). */}
      <button onClick={() => router.push('/dashboard')} className="flex items-center justify-center gap-2 mb-3 w-full">
        <div style={{ width: 26, height: 26, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
        </div>
        <span className="font-extrabold text-gray-900 text-base tracking-tight">StartZig Mobile Companion</span>
      </button>

      {/* [FIX 020826] Explanation is now collapsible (was always shown
          plainly) — stays in place, toggled with a small indicator. */}
      <button
        onClick={() => setShowExplanation(v => !v)}
        className="flex items-center justify-center w-full mb-2"
      >
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showExplanation ? 'rotate-180' : ''}`} />
      </button>
      {showExplanation && (
        <p className="text-xs text-gray-400 mb-4 text-left leading-relaxed px-2">
          Your mobile companion. Track updates and progress on the go.
          {/* [FIX] Growth removed from this condition — mobile now has
              real functionality for Growth (growth-development is fully
              usable on mobile), so it no longer belongs in the "you're all
              set here, go to desktop" list. */}
          {venture?.phase && venture.phase !== 'idea' && venture.phase !== 'business_plan' && venture.phase !== 'growth' && (
            <> You are all set on mobile. Head to desktop to continue building your {PHASE_LABELS[venture.phase]}.</>
          )}
        </p>
      )}

      <div className="mb-3 text-center">
        {/* [FIX 020826] Venture name now blue. */}
        <p className="font-bold text-xl text-blue-600">{venture?.name || 'Your Venture'}</p>
        <p className="text-sm font-semibold" style={{ color: PHASE_HEX_COLORS[venture?.phase] || '#6b7280' }}>
          {PHASE_LABELS[venture?.phase] || ''}
        </p>
      </div>

      {/* [FIX 020826] Clock enlarged back up (was 160, shrinking it earlier
          made it illegible/pointless — reverted, closer to original size). */}
      {/* [FIX] JourneyClock skipped for growth — per explicit request, a
          venture in Growth is no longer "on the journey" (Idea→...→Beta),
          so showing a clock pointing back at that journey (and the
          confirmed "Next: IDEA" wrap-around bug that came with it) doesn't
          make sense here. */}
      {venture?.phase && venture.phase !== 'growth' && (
        <div className="mb-4 flex justify-center">
          <JourneyClock currentPhase={venture.phase} maxWidth={260} />
        </div>
      )}

      {/* [FIX 020826] Continue now appears before Venture Profile — so it's
          clear what to do first, per this session's decision. */}
      {showContinueToPlan && (
        <button
          onClick={() => router.push('/plan')}
          className="w-full text-left bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between mb-4"
        >
          <div>
            <p className="text-xs text-indigo-600 mb-0.5">Continue</p>
            <p className="font-semibold text-gray-900">Complete your Plan</p>
          </div>
          <span className="text-indigo-600">→</span>
        </button>
      )}

      {/* [NEW] Mirrors the Plan button above exactly. */}
      {showContinueToGrowth && (
        <button
          onClick={() => router.push('/growth-development')}
          className="w-full text-left bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between mb-4"
        >
          <div>
            <p className="text-xs text-emerald-600 mb-0.5">Continue</p>
            <p className="font-semibold text-gray-900">Set up your Growth page</p>
          </div>
          <span className="text-emerald-600">→</span>
        </button>
      )}

      {/* [FIX 020826] Venture Profile card — was styled like plain printed
          text; each creation-field now has a colored icon + label heading,
          matching the visual language already used everywhere else in the
          app (Problem/Solution sections on the landing page, etc.). */}
      {venture && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
          <p className="font-semibold text-blue-600 mb-2">{venture.name}</p>
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
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 flex items-center gap-1.5 mb-1">
                    <FileText className="w-3.5 h-3.5 text-gray-400" /> Description
                  </p>
                  <p className="text-sm text-gray-700">{venture.description}</p>
                </div>
              )}
              {venture.problem && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 flex items-center gap-1.5 mb-1">
                    <Target className="w-3.5 h-3.5 text-gray-400" /> Problem
                  </p>
                  <p className="text-sm text-gray-700">{venture.problem}</p>
                </div>
              )}
              {venture.solution && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 flex items-center gap-1.5 mb-1">
                    <Lightbulb className="w-3.5 h-3.5 text-gray-400" /> Solution
                  </p>
                  <p className="text-sm text-gray-700">{venture.solution}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* [FIX 020826] Logout stays here, as a plain text link — not an icon
          in the shared row, per this session's decision. */}
      <div className="text-center mt-8 pb-4">
        <button
          onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}
          className="text-sm text-gray-400 underline"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
