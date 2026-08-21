// ============================================================
// FILE DESTINATION: app/revenue-modeling-experience/page.jsx (replaces existing file)
// ============================================================
// [REWRITE 020826, v3] Growth is now chosen as one of 4 real-world
// strategies (Word-of-Mouth, Marketing-Driven, B2B/Partnerships, Steady),
// not raw growth-rate/churn sliders — a founder shouldn't need to guess
// numbers at this stage, just pick the strategy that matches their
// venture. Each strategy maps to real growth/churn assumptions behind the
// scenes, fully disclosed afterward in "Model Assumptions." The underlying
// engine is still a genuine 12-month compounding simulation (see
// simulateMonths) — categories just replace how the two real numbers get
// chosen, not the math itself.
//
// What was deliberately KEPT unchanged: all phase-transition logic —
// updating the venture's phase to 'mlp' on first completion, the
// VentureMessage.create calls (phase_complete, phase_welcome,
// example_project invite), and the combined phase-transition email sent via
// /api/send-phase-transition.
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from "@/utils";
import { useRouter } from "next/navigation";
import { Venture, User, VentureMessage } from '@/api/entities.js';

const MONTHS = 12;

const BUSINESS_MODELS = [
  { key: 'subscription', icon: '📅', label: 'Subscription', description: "You charge a recurring monthly fee, and every user pays the same price. Like Netflix or Spotify Premium." },
  { key: 'freemium', icon: '🎁', label: 'Freemium', description: "Basic functionality is available for free, with the option to upgrade to premium packages for more. Like Spotify or Dropbox." },
  { key: 'transactional', icon: '🛒', label: 'Transactional', description: "You take a cut of every transaction that happens on your platform. Like Uber or Etsy." },
  { key: 'ad-driven', icon: '📺', label: 'Ad-Driven', description: "Your product is free forever, and you make money by showing ads. Like YouTube or Facebook." },
  { key: 'usage-based', icon: '⚙️', label: 'Usage-Based', description: "You charge based on how much is actually used, not a flat fee. Like AWS or Twilio." },
];

// [ADDED 020826] Growth strategies — a founder picks the story that fits
// their venture, not a raw percentage. Each maps to real, disclosed
// numbers used in the actual 12-month simulation below.
const GROWTH_STRATEGIES = [
  {
    key: 'organic',
    icon: '🗣️',
    label: 'Word-of-Mouth / Organic',
    description: 'Growth is slower since it relies on people recommending you to friends, but users who arrive this way tend to stick around.',
    growthRate: 0.05,
    churnRate: 0.015,
  },
  {
    key: 'marketing',
    icon: '📢',
    label: 'Marketing-Driven / Paid Acquisition',
    description: "Growth is fast since you're paying to bring people in, but users acquired this way are typically less committed and leave sooner.",
    growthRate: 0.20,
    churnRate: 0.06,
  },
  {
    key: 'b2b',
    icon: '🤝',
    label: 'B2B / Partnerships / Sales-Led',
    description: 'Growth is slow since B2B deals take time to close, but those relationships tend to be very sticky once in place.',
    growthRate: 0.03,
    churnRate: 0.01,
  },
  {
    key: 'steady',
    icon: '📊',
    label: 'Steady / Industry Average',
    description: 'A balanced, typical pace for this kind of business — a reasonable default if none of the others feel like a clear fit.',
    growthRate: 0.08,
    churnRate: 0.03,
  },
];

const FREE_TO_PAID_CONVERSION = 0.05; // 5% — good/typical benchmark for self-serve freemium (Growth Unhinged 2026 report)
const BASIC_VS_PRO_SPLIT = 0.7;
const ASSUMED_TRANSACTIONS_PER_USER_PER_MONTH = 1;

function formatMoney(n) {
  return `$${Math.round(n).toLocaleString()}`;
}
function formatUsers(n) {
  return Math.round(n).toLocaleString();
}

// [ADDED 020826] Real month-by-month simulation — each month's total users
// depends on last month's (churn removed, new users added), and the
// new-users figure itself compounds by growthRate each month. This is a
// genuine 12-iteration loop, not a single-step formula dressed up to look
// like one.
function simulateMonths({ newUsersMonth1, growthRate, churnRate }) {
  const data = [];
  let totalUsers = 0;
  let newUsersThisMonth = newUsersMonth1;
  for (let month = 1; month <= MONTHS; month++) {
    const churned = totalUsers * churnRate;
    totalUsers = Math.max(0, totalUsers - churned + newUsersThisMonth);
    data.push({ month, totalUsers });
    newUsersThisMonth = newUsersThisMonth * (1 + growthRate);
  }
  return data;
}

export default function RevenueModelingExperience() {
  const router = useRouter();
  const [venture, setVenture] = useState(null);
  const [founderName, setFounderName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [businessModel, setBusinessModel] = useState('freemium');

  const [subscriptionPrice, setSubscriptionPrice] = useState(15);
  const [basicPrice, setBasicPrice] = useState(9);
  const [proPrice, setProPrice] = useState(29);
  const [avgTransactionValue, setAvgTransactionValue] = useState(30);
  const [commissionPercent, setCommissionPercent] = useState(10);
  const [adRevenuePer1000, setAdRevenuePer1000] = useState(5);
  const [usageRevenuePer1000, setUsageRevenuePer1000] = useState(20);

  const [newUsersMonth1, setNewUsersMonth1] = useState(50);
  const [growthStrategy, setGrowthStrategy] = useState(null);

  const [hasCalculated, setHasCalculated] = useState(false);

  useEffect(() => {
    const fetchCurrentVenture = async () => {
      const currentUser = await User.me();
      setFounderName(currentUser.full_name || currentUser.username || '');
      const ventures = await Venture.filter({ created_by: currentUser.email }, "-created_date");
      if (ventures.length > 0) {
        const currentVenture = ventures[0];
        setVenture(currentVenture);
        const d = currentVenture.revenue_model_data;
        if (d) {
          if (d.businessModel) setBusinessModel(d.businessModel);
          if (d.subscriptionPrice != null) setSubscriptionPrice(d.subscriptionPrice);
          if (d.basicPrice != null) setBasicPrice(d.basicPrice);
          if (d.proPrice != null) setProPrice(d.proPrice);
          if (d.avgTransactionValue != null) setAvgTransactionValue(d.avgTransactionValue);
          if (d.commissionPercent != null) setCommissionPercent(d.commissionPercent);
          if (d.adRevenuePer1000 != null) setAdRevenuePer1000(d.adRevenuePer1000);
          if (d.usageRevenuePer1000 != null) setUsageRevenuePer1000(d.usageRevenuePer1000);
          if (d.newUsersMonth1 != null) setNewUsersMonth1(d.newUsersMonth1);
          if (d.growthStrategy) setGrowthStrategy(d.growthStrategy);
        }
      }
    };
    fetchCurrentVenture();
  }, []);

  const selectedModel = BUSINESS_MODELS.find(m => m.key === businessModel);
  const selectedStrategy = GROWTH_STRATEGIES.find(s => s.key === growthStrategy);

  const monthlyData = useMemo(() => {
    if (!selectedStrategy) return [];
    return simulateMonths({
      newUsersMonth1,
      growthRate: selectedStrategy.growthRate,
      churnRate: selectedStrategy.churnRate,
    });
  }, [newUsersMonth1, selectedStrategy]);

  const usersAtMonth12 = monthlyData[MONTHS - 1]?.totalUsers || 0;

  let projectedMonthlyRevenue = 0;
  let modelSpecificAssumption = null;
  if (businessModel === 'subscription') {
    projectedMonthlyRevenue = usersAtMonth12 * subscriptionPrice;
  } else if (businessModel === 'freemium') {
    const payingUsers = usersAtMonth12 * FREE_TO_PAID_CONVERSION;
    const basicPayingUsers = payingUsers * BASIC_VS_PRO_SPLIT;
    const proPayingUsers = payingUsers * (1 - BASIC_VS_PRO_SPLIT);
    projectedMonthlyRevenue = (basicPayingUsers * basicPrice) + (proPayingUsers * proPrice);
    modelSpecificAssumption = `Free-to-paid conversion: ${(FREE_TO_PAID_CONVERSION * 100).toFixed(0)}% \u00b7 Basic vs. Pro split: ${(BASIC_VS_PRO_SPLIT * 100).toFixed(0)}% / ${((1 - BASIC_VS_PRO_SPLIT) * 100).toFixed(0)}%`;
  } else if (businessModel === 'transactional') {
    const monthlyTransactions = usersAtMonth12 * ASSUMED_TRANSACTIONS_PER_USER_PER_MONTH;
    projectedMonthlyRevenue = monthlyTransactions * avgTransactionValue * (commissionPercent / 100);
    modelSpecificAssumption = `Assumed ${ASSUMED_TRANSACTIONS_PER_USER_PER_MONTH} transaction per user per month`;
  } else if (businessModel === 'ad-driven') {
    projectedMonthlyRevenue = (usersAtMonth12 / 1000) * adRevenuePer1000;
  } else if (businessModel === 'usage-based') {
    projectedMonthlyRevenue = (usersAtMonth12 / 1000) * usageRevenuePer1000;
    modelSpecificAssumption = `Assumes usage volume scales in proportion to user count`;
  }

  const canFinalize = () => hasCalculated;

  const handleFinalizeModel = async () => {
    if (!canFinalize()) {
      alert("Calculate your projection above before finalizing.");
      return;
    }
    setIsSubmitting(true);
    try {
      if (!venture) {
        alert("No venture found. Please refresh and try again.");
        setIsSubmitting(false);
        return;
      }

      const isFirstTime = !venture.revenue_model_completed;

      const updateData = {
        revenue_model_data: {
          businessModel,
          subscriptionPrice, basicPrice, proPrice, avgTransactionValue, commissionPercent, adRevenuePer1000, usageRevenuePer1000,
          newUsersMonth1, growthStrategy,
          usersAtMonth12,
          projectedMonthlyRevenue,
          assumptions: { modelSpecificAssumption },
          finalized_date: new Date().toISOString(),
        },
        revenue_model_completed: true,
      };

      if (isFirstTime && venture.phase === 'mvp') {
        updateData.phase = 'mlp';
      }

      await Venture.update(venture.id, updateData);

      if (isFirstTime && updateData.phase === 'mlp') {
        await VentureMessage.create({
          venture_id: venture.id,
          message_type: 'phase_complete',
          title: '\u2705 Revenue Model Finalized!',
          content: `You've sketched your first revenue model. Estimated monthly revenue: ${formatMoney(projectedMonthlyRevenue)}.`,
          phase: 'business_plan',
          priority: 2,
        });

        await VentureMessage.create({
          venture_id: venture.id,
          message_type: 'phase_welcome',
          title: '\ud83d\udc96 Welcome to the MLP Phase!',
          content: `Great progress! You're now in the Minimum Lovable Product phase. Your mission is to gather user feedback and make your product truly lovable.

Key tasks:
\u2022 Complete the MLP Development Center to plan your enhancements
\u2022 Enter the Promotion Center and share your landing page to collect feedback from users
\u2022 Collect at least 10 pieces of feedback to unlock the Beta phase
\u2022 Analyze feedback in the Product Feedback Center

Once you've completed MLP development phase, you'll be ready to move to the Beta phase.`,
          phase: 'mlp',
          priority: 3,
        });

        await VentureMessage.create({
          venture_id: venture.id,
          message_type: 'example_project',
          title: "You're invited to give feedback",
          content: "GrandpaSays.zig is at the MLP stage. It's recommended to watch it to learn how it looks after this stage, and also to practice giving feedback and earning Insight.",
          phase: 'mlp',
          priority: 3,
          from_venture_id: '3ca810de-a754-412c-8905-94247b9d1e90',
          from_venture_name: 'GrandpaSays.zig',
          from_venture_landing_page_url: '/venture-landing?id=3ca810de-a754-412c-8905-94247b9d1e90',
          is_sample: true,
          created_by: venture.created_by,
          created_by_id: venture.created_by_id || null
        });

        fetch('/api/send-phase-transition', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: venture.created_by,
            founderName: founderName,
            ventureName: venture.name,
            newPhaseTitle: "Great progress! You've completed the MVP stage. You're now in the Minimum Lovable Product phase. Your mission is to gather user feedback and make your product truly lovable.",
            newPhaseMessage: `Key tasks:
\u2022 Complete the MLP Development Center to plan your enhancements
\u2022 Enter the Promotion Center and share your landing page to collect feedback from users
\u2022 Collect at least 10 pieces of feedback to unlock the Beta phase
\u2022 Analyze feedback in the Product Feedback Center`,
            exampleVentureName: 'GrandpaSays.zig',
            exampleVentureId: '3ca810de-a754-412c-8905-94247b9d1e90',
            exampleStage: 'MLP',
          }),
        }).catch((err) => console.error('Could not send phase-transition email:', err));

        alert('Revenue model finalized successfully! You\'ve progressed to the MLP phase. Redirecting to dashboard...');
      } else {
        alert('Revenue model updated successfully!');
      }

      router.push(createPageUrl('Dashboard'));
    } catch (error) {
      console.error("Error finalizing revenue model:", error);
      alert("There was an error finalizing your revenue model. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!venture) {
    return <div className="p-8 text-center text-gray-400">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-3 text-center">Revenue Model</h1>
        <p className="text-gray-600 text-center mb-6 leading-relaxed">
          Even in the early stages of product planning, it's important to start thinking about your revenue model. It can shape your product decisions, at least in its first version. There are a few ways to approach this: look at competitors or similar products in your space, or think about what your customers are already used to paying for.
        </p>

        {/* [FIX 020826] Venture context card — icon added, Problem/Solution
            labels now blue (matching the field-label style used everywhere
            else in the app), not plain gray. */}
        {(venture.problem || venture.solution) && (
          <div className="bg-white/70 rounded-xl border border-indigo-100 p-4 mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div style={{ width: 24, height: 24, borderRadius: 7, background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              </div>
              <p className="font-semibold text-gray-800">{venture.name}</p>
            </div>
            {venture.problem && (
              <p className="text-sm text-gray-600 mb-1"><span className="font-semibold text-indigo-600">Problem:</span> {venture.problem}</p>
            )}
            {venture.solution && (
              <p className="text-sm text-gray-600"><span className="font-semibold text-indigo-600">Solution:</span> {venture.solution}</p>
            )}
          </div>
        )}

        {/* Business model */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">What's your business model?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BUSINESS_MODELS.map(model => (
              <button
                key={model.key}
                onClick={() => { setBusinessModel(model.key); setHasCalculated(false); }}
                className={`border-2 rounded-xl p-4 text-left transition-all ${
                  businessModel === model.key ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="text-2xl mb-1">{model.icon}</p>
                <p className="font-semibold text-gray-800">{model.label}</p>
              </button>
            ))}
          </div>
          {selectedModel && (
            <p className="text-sm text-gray-600 mt-4 bg-indigo-50 rounded-lg p-3">{selectedModel.description}</p>
          )}
        </div>

        {/* Pricing, model-specific */}
        {businessModel && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">How will you price it?</h2>

            {businessModel === 'subscription' && (
              <div>
                <Label>What's your monthly price?</Label>
                <p className="text-2xl font-bold text-indigo-600 my-2">${subscriptionPrice}/mo</p>
                <input type="range" min="1" max="200" value={subscriptionPrice}
                  onChange={(e) => { setSubscriptionPrice(Number(e.target.value)); setHasCalculated(false); }}
                  className="w-full" />
              </div>
            )}

            {businessModel === 'freemium' && (
              <div className="grid grid-cols-3 gap-4">
                <div className="border-2 border-gray-200 rounded-xl p-3 text-center">
                  <p className="text-lg mb-1">🆓</p>
                  <p className="text-xs font-semibold text-gray-600 mb-1">Free</p>
                  <p className="text-lg font-bold text-gray-400">$0</p>
                </div>
                <div>
                  <Label>Basic price?</Label>
                  <p className="text-xl font-bold text-indigo-600 my-2">${basicPrice}/mo</p>
                  <input type="range" min="1" max="100" value={basicPrice}
                    onChange={(e) => { setBasicPrice(Number(e.target.value)); setHasCalculated(false); }}
                    className="w-full" />
                </div>
                <div>
                  <Label>Pro price?</Label>
                  <p className="text-xl font-bold text-purple-600 my-2">${proPrice}/mo</p>
                  <input type="range" min="5" max="300" value={proPrice}
                    onChange={(e) => { setProPrice(Number(e.target.value)); setHasCalculated(false); }}
                    className="w-full" />
                </div>
              </div>
            )}

            {businessModel === 'transactional' && (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label>Average transaction value?</Label>
                  <p className="text-xl font-bold text-indigo-600 my-2">${avgTransactionValue}</p>
                  <input type="range" min="1" max="500" value={avgTransactionValue}
                    onChange={(e) => { setAvgTransactionValue(Number(e.target.value)); setHasCalculated(false); }}
                    className="w-full" />
                </div>
                <div>
                  <Label>Your commission %?</Label>
                  <p className="text-xl font-bold text-purple-600 my-2">{commissionPercent}%</p>
                  <input type="range" min="1" max="30" value={commissionPercent}
                    onChange={(e) => { setCommissionPercent(Number(e.target.value)); setHasCalculated(false); }}
                    className="w-full" />
                </div>
              </div>
            )}

            {businessModel === 'ad-driven' && (
              <div>
                <Label>Estimated ad revenue per 1,000 users?</Label>
                <p className="text-2xl font-bold text-indigo-600 my-2">${adRevenuePer1000} / 1,000 users</p>
                <input type="range" min="1" max="50" value={adRevenuePer1000}
                  onChange={(e) => { setAdRevenuePer1000(Number(e.target.value)); setHasCalculated(false); }}
                  className="w-full" />
              </div>
            )}

            {businessModel === 'usage-based' && (
              <div>
                <Label>Estimated revenue per 1,000 uses?</Label>
                <p className="text-2xl font-bold text-indigo-600 my-2">${usageRevenuePer1000} / 1,000 uses</p>
                <input type="range" min="1" max="200" value={usageRevenuePer1000}
                  onChange={(e) => { setUsageRevenuePer1000(Number(e.target.value)); setHasCalculated(false); }}
                  className="w-full" />
              </div>
            )}
          </div>
        )}

        {/* Initial users — slider, not a raw number field */}
        {businessModel && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-1">How many users in your first month?</h2>
            <p className="text-center text-3xl font-bold text-indigo-600 my-4">{formatUsers(newUsersMonth1)}</p>
            <input type="range" min="1" max="2000" value={newUsersMonth1}
              onChange={(e) => { setNewUsersMonth1(Number(e.target.value)); setHasCalculated(false); }}
              className="w-full" />
          </div>
        )}

        {/* Growth strategy — categories, not raw sliders */}
        {businessModel && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-1">What's your growth strategy?</h2>
            <p className="text-sm text-gray-500 mb-4">Pick the story that fits how you expect to grow.</p>
            <div className="grid grid-cols-1 gap-3">
              {GROWTH_STRATEGIES.map(strategy => (
                <button
                  key={strategy.key}
                  onClick={() => { setGrowthStrategy(strategy.key); setHasCalculated(false); }}
                  className={`border-2 rounded-xl p-4 text-left transition-all ${
                    growthStrategy === strategy.key ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{strategy.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{strategy.label}</p>
                      <p className="text-xs text-gray-500 mt-1">{strategy.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {businessModel && growthStrategy && (
          <div className="text-center mb-8">
            <Button
              onClick={() => setHasCalculated(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg px-10 py-6 rounded-full shadow-lg"
            >
              Calculate Projection
            </Button>
          </div>
        )}

        {hasCalculated && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-center border-2 border-indigo-200">
            <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Projected users at month 12</p>
            <p className="text-2xl font-bold text-gray-700 mb-6">{formatUsers(usersAtMonth12)}</p>

            <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">Projected Monthly Revenue (month 12)</p>
            <p className="text-5xl font-extrabold text-indigo-600 mb-6">{formatMoney(projectedMonthlyRevenue)}</p>

            <div className="text-left bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-2">
              <p className="font-semibold text-gray-700 mb-1">Model Assumptions</p>
              {modelSpecificAssumption && <p>{modelSpecificAssumption}</p>}
              <p>
                Growth strategy: <strong>{selectedStrategy.label}</strong> — growing {(selectedStrategy.growthRate * 100).toFixed(1)}% month over month, with a monthly churn (the percentage of users who stop using the product each month) of {(selectedStrategy.churnRate * 100).toFixed(1)}%.
              </p>
            </div>
          </div>
        )}

        {businessModel && growthStrategy && (
          <div className="text-center">
            <Button
              onClick={handleFinalizeModel}
              disabled={isSubmitting || !hasCalculated}
              className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-10 py-6 rounded-full shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Finalizing...' : 'Finalize Revenue Model'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Label({ children }) {
  return <p className="text-sm font-semibold text-gray-600">{children}</p>;
}
