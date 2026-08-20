// ============================================================
// FILE DESTINATION: app/revenue-modeling-experience/page.jsx (replaces existing file)
// ============================================================
// [REWRITE 020826] Simplified per this session's decision — the previous
// version (9 sliders across 4 business models, enterprise-scale examples,
// 24-month charts) was built for a founder raising real money, not a first
// rough sketch right after finishing an MVP. Rebuilt as a short, guided
// flow: pick your business model (with a real-world example), answer the
// 1-2 pricing questions that actually apply to that model, estimate users
// after 12 months, estimate growth pace — then get one clear number.
//
// What was deliberately KEPT unchanged: all phase-transition logic —
// updating the venture's phase to 'mlp' on first completion, the
// VentureMessage.create calls (phase_complete, phase_welcome,
// example_project invite), and the combined phase-transition email sent via
// /api/send-phase-transition. This file is still the real gateway from MVP
// to MLP; only the on-screen experience for building the revenue model
// itself changed.
"use client";
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from "@/utils";
import { useRouter } from "next/navigation";
import { Venture, User, VentureMessage } from '@/api/entities.js';

const BUSINESS_MODELS = [
  { key: 'subscription', icon: '📅', label: 'Subscription', description: "Like Netflix or Spotify Premium. Recurring monthly fee, same price for everyone." },
  { key: 'freemium', icon: '🎁', label: 'Freemium', description: "Like Spotify or Dropbox. Free to start, upgrade for more." },
  { key: 'transactional', icon: '🛒', label: 'Transactional', description: "Like Uber or Etsy. You take a cut of every transaction." },
  { key: 'ad-driven', icon: '📺', label: 'Ad-Driven', description: "Like YouTube or Facebook. Free forever, revenue from ads." },
  { key: 'usage-based', icon: '⚙️', label: 'Usage-Based', description: "Like AWS or Twilio. You pay based on how much is actually used, not a flat fee." },
];

const GROWTH_PACE_OPTIONS = [
  { key: 'average', icon: '📊', label: 'Industry Average', description: 'Steady, typical growth for this kind of business.', churnRate: 0.03 },
  { key: 'viral', icon: '🌱', label: 'Viral Growth', description: 'Banking on word-of-mouth and network effects.', churnRate: 0.015 },
  { key: 'aggressive', icon: '📢', label: 'Aggressive, Marketing-Driven', description: 'Fast growth, fueled by paid acquisition spend.', churnRate: 0.05 },
];

const USER_MILESTONES = [100, 1000, 10000, 100000, 1000000];
const FREE_TO_PAID_CONVERSION = 0.03;
const BASIC_VS_PRO_SPLIT = 0.7;
const ASSUMED_TRANSACTIONS_PER_USER_PER_MONTH = 1;

function formatUserCount(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return `${n}`;
}
function formatMoney(n) {
  return `$${Math.round(n).toLocaleString()}`;
}

export default function RevenueModelingExperience() {
  const router = useRouter();
  const [venture, setVenture] = useState(null);
  const [founderName, setFounderName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [businessModel, setBusinessModel] = useState(null);

  const [subscriptionPrice, setSubscriptionPrice] = useState(15);
  const [basicPrice, setBasicPrice] = useState(9);
  const [proPrice, setProPrice] = useState(29);
  const [avgTransactionValue, setAvgTransactionValue] = useState(30);
  const [commissionPercent, setCommissionPercent] = useState(10);
  const [adRevenuePer1000, setAdRevenuePer1000] = useState(5);
  const [usageRevenuePer1000, setUsageRevenuePer1000] = useState(20);

  const [userMilestoneIndex, setUserMilestoneIndex] = useState(2);
  const [growthPace, setGrowthPace] = useState('average');
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
          if (d.projectedUsers != null) {
            const idx = USER_MILESTONES.indexOf(d.projectedUsers);
            if (idx >= 0) setUserMilestoneIndex(idx);
          }
          if (d.growthPace) setGrowthPace(d.growthPace);
        }
      }
    };
    fetchCurrentVenture();
  }, []);

  const projectedUsers = USER_MILESTONES[userMilestoneIndex];
  const selectedPace = GROWTH_PACE_OPTIONS.find(p => p.key === growthPace);
  const churnRate = selectedPace.churnRate;
  const selectedModel = BUSINESS_MODELS.find(m => m.key === businessModel);

  let projectedMonthlyRevenue = 0;
  let modelSpecificAssumption = null;
  if (businessModel === 'subscription') {
    projectedMonthlyRevenue = projectedUsers * subscriptionPrice;
  } else if (businessModel === 'freemium') {
    const payingUsers = projectedUsers * FREE_TO_PAID_CONVERSION;
    const basicPayingUsers = payingUsers * BASIC_VS_PRO_SPLIT;
    const proPayingUsers = payingUsers * (1 - BASIC_VS_PRO_SPLIT);
    projectedMonthlyRevenue = (basicPayingUsers * basicPrice) + (proPayingUsers * proPrice);
    modelSpecificAssumption = `Free-to-paid conversion: ${(FREE_TO_PAID_CONVERSION * 100).toFixed(0)}% (industry average) \u00b7 Basic vs. Pro split: ${(BASIC_VS_PRO_SPLIT * 100).toFixed(0)}% / ${((1 - BASIC_VS_PRO_SPLIT) * 100).toFixed(0)}%`;
  } else if (businessModel === 'transactional') {
    const monthlyTransactions = projectedUsers * ASSUMED_TRANSACTIONS_PER_USER_PER_MONTH;
    projectedMonthlyRevenue = monthlyTransactions * avgTransactionValue * (commissionPercent / 100);
    modelSpecificAssumption = `Assumed ${ASSUMED_TRANSACTIONS_PER_USER_PER_MONTH} transaction per user per month`;
  } else if (businessModel === 'ad-driven') {
    projectedMonthlyRevenue = (projectedUsers / 1000) * adRevenuePer1000;
  } else if (businessModel === 'usage-based') {
    projectedMonthlyRevenue = (projectedUsers / 1000) * usageRevenuePer1000;
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
          projectedUsers,
          growthPace,
          projectedMonthlyRevenue,
          assumptions: {
            monthlyChurn: churnRate,
            modelSpecificAssumption,
          },
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
    return <div className="p-8 text-center text-gray-400">Loading\u2026</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-3 text-center">First Revenue Sketch</h1>
        <p className="text-gray-600 text-center mb-10 leading-relaxed">
          Even at this early stage, it's worth starting to think about how your product will make money, especially as it shapes how you build it going forward. This is just a first sketch, not a final plan.
        </p>

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

        {businessModel && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">\ud83d\udcb0 How will you price it?</h2>

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
              <div className="grid grid-cols-2 gap-6">
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

        {businessModel && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-1">\ud83d\udcc8 How many users after 12 months?</h2>
            <p className="text-center text-3xl font-bold text-indigo-600 my-4">{formatUserCount(projectedUsers)}</p>
            <input
              type="range" min="0" max={USER_MILESTONES.length - 1} step="1"
              value={userMilestoneIndex}
              onChange={(e) => { setUserMilestoneIndex(Number(e.target.value)); setHasCalculated(false); }}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>100 \u2014 a solid start!</span>
              <span>1M+ \u2014 viral! \ud83d\udd25</span>
            </div>
          </div>
        )}

        {businessModel && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-1">\u26a1 What's your estimated growth pace?</h2>
            <p className="text-sm text-gray-500 mb-4">How do you expect to get to that user count?</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {GROWTH_PACE_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => { setGrowthPace(opt.key); setHasCalculated(false); }}
                  className={`border-2 rounded-xl p-4 text-left transition-all ${
                    growthPace === opt.key ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="text-2xl mb-1">{opt.icon}</p>
                  <p className="font-semibold text-gray-800 text-sm">{opt.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{opt.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {businessModel && (
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
            <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">Projected Monthly Revenue</p>
            <p className="text-5xl font-extrabold text-indigo-600 mb-6">{formatMoney(projectedMonthlyRevenue)}</p>

            <div className="text-left bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-1">
              <p className="font-semibold text-gray-700 mb-2">Model Assumptions</p>
              {modelSpecificAssumption && <p>{modelSpecificAssumption}</p>}
              <p>Monthly churn: {(churnRate * 100).toFixed(1)}% (based on your selected growth pace)</p>
            </div>
          </div>
        )}

        {businessModel && (
          <div className="text-center">
            <Button
              onClick={handleFinalizeModel}
              disabled={isSubmitting || !hasCalculated}
              className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-10 py-6 rounded-full shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Finalizing\u2026' : 'Finalize Revenue Model'}
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
