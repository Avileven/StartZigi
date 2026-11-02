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
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { differenceInDays } from 'date-fns';
import { MessageSquare, Users, Clock, Wallet, BarChart3, ChevronDown, Target, Lightbulb, FileText } from 'lucide-react';
import JourneyClock, { PHASE_HEX_COLORS } from '@/components/ventures/JourneyClock';

const PHASE_LABELS = { idea: 'Idea', business_plan: 'Plan', mvp: 'MVP', mlp: 'MLP', beta: 'Beta', growth: 'Pulse' };

function getVentureAge(venture) {
  if (!venture?.created_date) return 0;
  return differenceInDays(new Date(), new Date(venture.created_date));
}
function formatValuation(val) {
  if (!val) return '$0';
  return val >= 1000000 ? `$${Math.floor(val / 1000000)}M` : `$${Math.floor(val / 1000)}K`;
}

// [NEW — ZigPulse mobile] Home for Growth (ZigPulse) ventures.
function GrowthHome({ venture }) {
  const stage = venture.growth_data?.stage || 'idea';
  const stageLabel = { idea: 'Idea stage', prototype: 'Prototype stage', product: 'Product stage' }[stage] || 'Idea stage';
  const joined = venture.created_date
    ? new Date(venture.created_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null;
  const steps = [
    { title: 'Venture Profile', text: 'Click into the Feedback tab to set up and update the insights you are seeking.' },
    { title: 'Promotion Center', text: 'Plan your promotion strategy, how many people to send a feedback request to, and your preferences.' },
    { title: 'Product Feedback', text: 'All the insight collected and analyzed across your journey.' },
    { title: 'Public page', text: 'Your public page, visible only to people invited to give feedback.' },
    { title: 'My account', text: 'Manage your account details, your profile and your Zigback balance.' },
    ...(stage === 'idea' ? [{ title: 'Idea Analysis', text: 'Analyze your idea step by step, with tips and AI feedback on every part.' }] : []),
  ];
  return (
    <div className="px-4 pt-4 pb-6 bg-gray-50">
      <div className="rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
        <p className="text-xs uppercase tracking-widest opacity-80">Your venture</p>
        <h1 className="text-3xl font-bold mt-1 mb-3 break-words">{venture.name}</h1>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full px-3 py-1.5 text-sm font-semibold" style={{ background: 'rgba(255,255,255,0.18)' }}>{stageLabel}</span>
          {joined && <span className="rounded-full px-3 py-1.5 text-sm font-semibold" style={{ background: 'rgba(255,255,255,0.18)' }}>Joined {joined}</span>}
        </div>
      </div>

      <h2 className="text-lg font-bold text-gray-900 mt-6 mb-3">About StartZig</h2>
      <div className="bg-white border border-gray-200 rounded-2xl p-4 text-sm leading-relaxed text-gray-700">
        StartZig helps you increase your chances of success by giving you the tools, insights and community to make better decisions at every stage of your entrepreneurial journey, reach the right people and build an audience as your venture evolves. Don't just build and hope. Learn, improve and grow with people who can help move your venture forward.
      </div>

      <h2 className="text-lg font-bold text-gray-900 mt-6 mb-3">Your Journey</h2>
      <div className="space-y-2.5">
        {steps.map((st, i) => (
          <div key={st.title} className="flex gap-3.5 bg-white border border-gray-200 rounded-2xl p-4">
            <div className="flex-none w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center">{i + 1}</div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900">{st.title}</p>
              <p className="text-sm text-gray-600 mt-1 leading-snug">{st.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MobileHome({ venture, messages = [], liveBalance = 0, currentValuation = 0 }) {
  const router = useRouter();
  const [showCreationDetails, setShowCreationDetails] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const showContinueToPlan = venture?.phase === 'idea' || venture?.phase === 'business_plan';
  const showContinueToGrowth = venture?.phase === 'growth';
  // [NEW] "Setup complete" signal for Growth — matches the same field
  // (selected_categories) used elsewhere to determine whether the founder
  // has actually finished configuring their Growth page.
  const growthSetupComplete = venture?.growth_data?.selected_categories?.length > 0;
  const [showGrowthDescription, setShowGrowthDescription] = useState(false);

  // [NEW — ZigPulse mobile] Growth ventures get their own home (below);
  // navigation lives in the scrollable bar in ClientLayout.
  if (venture?.phase === 'growth') return <GrowthHome venture={venture} />;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* [FIX 020826] Title now centered (was left-aligned). */}
      <button onClick={() => router.push('/dashboard')} className="flex items-center justify-center gap-2 mb-3 w-full">
        <div style={{ width: 26, height: 26, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
        </div>
        <span className="font-extrabold text-purple-700 text-lg tracking-tight">StartZig Mobile Companion</span>
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

      {/* [FIX] Only shown if setup isn't done yet — per explicit feedback,
          showing "Set up your Growth page" after it's already configured
          was confusing (looked like nothing had been saved). */}
      {showContinueToGrowth && !growthSetupComplete && (
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

      {/* [NEW] Growth navigation — once setup is done, this replaces the
          Venture Profile card below with a compact profile + 3 links to
          the tools actually used day-to-day in Growth. Neither
          promotion-center nor product-feedback have their own dedicated
          mobile screens, so these just deep-link to them (marked
          "best-effort responsive" — see those files' own fixes). */}
      {showContinueToGrowth && growthSetupComplete && (
        <>
          {/* [FIX] Venture name removed — already shown above ("Fugkthesys
              / Growth"), duplicating it here was pointless. Shows a
              snippet of the description instead (not the slogan), so the
              card isn't empty, with a toggle for the rest — not the whole
              text dumped in at once. */}
          {venture.growth_data?.description && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-600 mb-1.5">Profile</p>
              <p className="text-sm text-gray-600">
                {showGrowthDescription ? venture.growth_data.description : `${venture.growth_data.description.slice(0, 100)}${venture.growth_data.description.length > 100 ? '…' : ''}`}
              </p>
              {venture.growth_data.description.length > 100 && (
                <button
                  onClick={() => setShowGrowthDescription(v => !v)}
                  className="text-xs font-medium text-indigo-600 mt-1 flex items-center gap-1"
                >
                  {showGrowthDescription ? 'Less' : 'More'}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showGrowthDescription ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>
          )}
          <div className="space-y-2 mb-4">
            <button
              onClick={() => router.push('/promotion-center')}
              className="w-full text-left bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between"
            >
              <p className="font-semibold text-gray-900">Promotion Center</p>
              <span className="text-amber-600">→</span>
            </button>
            <button
              onClick={() => router.push('/growth-development')}
              className="w-full text-left bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between"
            >
              <p className="font-semibold text-gray-900">Growth Page</p>
              <span className="text-emerald-600">→</span>
            </button>
            <button
              onClick={() => router.push('/product-feedback')}
              className="w-full text-left bg-sky-50 border border-sky-200 rounded-xl p-4 flex items-center justify-between"
            >
              <p className="font-semibold text-gray-900">Product Feedback</p>
              <span className="text-sky-600">→</span>
            </button>
          </div>
        </>
      )}

      {/* [FIX 020826] Venture Profile card — was styled like plain printed
          text; each creation-field now has a colored icon + label heading,
          matching the visual language already used everywhere else in the
          app (Problem/Solution sections on the landing page, etc.). */}
      {/* [FIX] Skipped once the Growth-specific compact profile above is
          shown — avoids showing two venture profile blocks stacked. */}
      {venture && !(showContinueToGrowth && growthSetupComplete) && (
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
