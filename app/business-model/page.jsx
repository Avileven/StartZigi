// ============================================================
// FILE DESTINATION: app/business-model/page.jsx (NEW file)
// ============================================================
// [NEW — ZigPulse] Standalone Revenue Model calculator for the short track
// (all stages: idea / prototype / product). A copy of
// app/revenue-modeling-experience adapted for ZigPulse:
//   - NOTHING is saved, no phase change, no messages, no emails.
//     It is a calculator the founder plays with; leaving the page resets it.
//   - Mobile-first layout, "How It Works" explainer at the top.
//   - The venture is only READ, for the small context card.
// The long-journey page (revenue-modeling-experience) is not touched.
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Venture, User } from '@/api/entities.js';
import ExplainerRows from '@/components/ventures/ExplainerRows';
import {
  CalendarDays, Gift, ShoppingCart, Tv, Settings, CreditCard,
  Layers, CircleDollarSign, TrendingUp, Calculator,
  Hand, Megaphone, Handshake, BarChart3, Info,
} from 'lucide-react';

const MONTHS = 12;

const BUSINESS_MODELS = [
  { key: 'subscription', Icon: CalendarDays, label: 'Subscription', description: "You charge a recurring monthly fee, and every user pays the same price. Like Netflix or Spotify Premium." },
  { key: 'freemium', Icon: Gift, label: 'Freemium', description: "Basic functionality is available for free, with the option to upgrade to premium packages for more. Like Spotify or Dropbox." },
  { key: 'transactional', Icon: ShoppingCart, label: 'Commission / Marketplace', description: "You take a cut of every transaction that happens on your platform. Like Uber or Etsy." },
  { key: 'ad-driven', Icon: Tv, label: 'Ad-Driven', description: "Your product is free forever, and you make money by showing ads. Like YouTube or Facebook." },
  { key: 'usage-based', Icon: Settings, label: 'Usage-Based', description: "You charge based on how much is actually used, not a flat fee. Like AWS or Twilio." },
  { key: 'one-time', Icon: CreditCard, label: 'One-Time Purchase', description: "The customer pays once and owns it, with no recurring charge. Like buying an app or a video game." },
];

// Same structured, non-AI recommendation as the long-journey page:
// each model has a predefined profile, the founder's answers are compared
// against every profile to produce a fit score.
const MODEL_PROFILES = {
  subscription: { usageIntensity: 9, networkEffect: 3, valueConcentration: 2, paymentMoment: 'ongoing' },
  freemium: { usageIntensity: 7, networkEffect: 5, valueConcentration: 3, paymentMoment: 'feature' },
  transactional: { usageIntensity: 2, networkEffect: 9, valueConcentration: 8, paymentMoment: 'transaction' },
  'ad-driven': { usageIntensity: 8, networkEffect: 6, valueConcentration: 3, paymentMoment: 'ongoing' },
  'usage-based': { usageIntensity: 6, networkEffect: 3, valueConcentration: 6, paymentMoment: 'feature' },
  'one-time': { usageIntensity: 1, networkEffect: 1, valueConcentration: 7, paymentMoment: 'before' },
};

const PAYMENT_MOMENT_OPTIONS = [
  { key: 'before', label: 'Before using the product' },
  { key: 'feature', label: 'When using a specific feature' },
  { key: 'transaction', label: 'When completing a transaction' },
  { key: 'ongoing', label: 'As long as they continue receiving value' },
];

function calculateFitScores(answers) {
  const numericKeys = ['usageIntensity', 'networkEffect', 'valueConcentration'];
  return BUSINESS_MODELS.map(model => {
    const profile = MODEL_PROFILES[model.key];
    const diffs = numericKeys.map(k => Math.abs(answers[k] - profile[k]));
    const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    const numericSimilarity = 100 - (avgDiff / 10 * 100);
    const paymentMatch = answers.paymentMoment === profile.paymentMoment ? 100 : 0;
    const score = Math.round(numericSimilarity * 0.8 + paymentMatch * 0.2);
    return { ...model, score: Math.max(0, Math.min(100, score)) };
  }).sort((a, b) => b.score - a.score);
}

const GROWTH_STRATEGIES = [
  {
    key: 'organic',
    Icon: Hand,
    label: 'Word-of-Mouth / Organic',
    description: 'Growth is slower since it relies on people recommending you to friends, but users who arrive this way tend to stick around.',
    growthRate: 0.05,
    churnRate: 0.015,
  },
  {
    key: 'marketing',
    Icon: Megaphone,
    label: 'Marketing-Driven / Paid Acquisition',
    description: "Growth is fast since you're paying to bring people in, but users acquired this way are typically less committed and leave sooner.",
    growthRate: 0.20,
    churnRate: 0.06,
  },
  {
    key: 'b2b',
    Icon: Handshake,
    label: 'B2B / Partnerships / Sales-Led',
    description: 'Growth is slow since B2B deals take time to close, but those relationships tend to be very sticky once in place.',
    growthRate: 0.03,
    churnRate: 0.01,
  },
  {
    key: 'steady',
    Icon: BarChart3,
    label: 'Steady / Industry Average',
    description: 'A balanced, typical pace for this kind of business, a reasonable default if none of the others feel like a clear fit.',
    growthRate: 0.08,
    churnRate: 0.03,
  },
];

const FREE_TO_PAID_CONVERSION = 0.05; // 5% — typical benchmark for self-serve freemium
const BASIC_VS_PRO_SPLIT = 0.7;
const ASSUMED_TRANSACTIONS_PER_USER_PER_MONTH = 1;

function formatMoney(n) {
  return `$${Math.round(n).toLocaleString()}`;
}
function formatUsers(n) {
  return Math.round(n).toLocaleString();
}

// Real month-by-month simulation (12 iterations), same engine as the
// long-journey page.
function simulateMonths({ newUsersMonth1, growthRate, churnRate }) {
  const data = [];
  let totalUsers = 0;
  let newUsersThisMonth = newUsersMonth1;
  for (let month = 1; month <= MONTHS; month++) {
    const churned = totalUsers * churnRate;
    totalUsers = Math.max(0, totalUsers - churned + newUsersThisMonth);
    data.push({ month, totalUsers, newUsers: newUsersThisMonth });
    newUsersThisMonth = newUsersThisMonth * (1 + growthRate);
  }
  return data;
}

function SectionTitle({ children, sub }) {
  return (
    <div className="mb-3">
      <h2 className="text-lg font-bold text-gray-900">{children}</h2>
      {sub && <p className="text-sm text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function SliderRow({ label, valueText, valueClass = 'text-indigo-600', ...inputProps }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
      <div className="flex items-baseline justify-between mb-2 gap-3">
        <span className="text-sm font-semibold text-gray-500">{label}</span>
        <span className={`text-xl font-extrabold ${valueClass}`}>{valueText}</span>
      </div>
      <input type="range" className="w-full accent-indigo-600" {...inputProps} />
    </div>
  );
}

export default function BusinessModelPage() {
  const [venture, setVenture] = useState(null);

  const [businessModel, setBusinessModel] = useState('freemium');

  const [subscriptionPrice, setSubscriptionPrice] = useState(15);
  const [basicPrice, setBasicPrice] = useState(9);
  const [proPrice, setProPrice] = useState(29);
  const [avgTransactionValue, setAvgTransactionValue] = useState(30);
  const [commissionPercent, setCommissionPercent] = useState(10);
  const [adRevenuePer1000, setAdRevenuePer1000] = useState(5);
  const [usageRevenuePer1000, setUsageRevenuePer1000] = useState(20);
  const [oneTimePrice, setOneTimePrice] = useState(25);

  // "Not sure?" selector state
  const [showSelector, setShowSelector] = useState(false);
  const [valueConcentrationInput, setValueConcentrationInput] = useState(5);
  const [paymentMoment, setPaymentMoment] = useState(null);
  const [usageIntensity, setUsageIntensity] = useState(5);
  const [networkEffect, setNetworkEffect] = useState(5);
  const [showFitResults, setShowFitResults] = useState(false);

  const [newUsersMonth1, setNewUsersMonth1] = useState(50);
  const [growthStrategy, setGrowthStrategy] = useState(null);

  const [hasCalculated, setHasCalculated] = useState(false);

  // READ ONLY — only for the small context card at the top.
  useEffect(() => {
    const fetchCurrentVenture = async () => {
      try {
        const currentUser = await User.me();
        const ventures = await Venture.filter({ created_by: currentUser.email }, "-created_date");
        if (ventures.length > 0) setVenture(ventures[0]);
      } catch (e) {
        console.error('Could not load venture for context card:', e);
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
  const newUsersAtMonth12 = monthlyData[MONTHS - 1]?.newUsers || 0;

  let projectedMonthlyRevenue = 0;
  let modelSpecificAssumption = null;
  if (businessModel === 'subscription') {
    projectedMonthlyRevenue = usersAtMonth12 * subscriptionPrice;
  } else if (businessModel === 'freemium') {
    const payingUsers = usersAtMonth12 * FREE_TO_PAID_CONVERSION;
    const basicPayingUsers = payingUsers * BASIC_VS_PRO_SPLIT;
    const proPayingUsers = payingUsers * (1 - BASIC_VS_PRO_SPLIT);
    projectedMonthlyRevenue = (basicPayingUsers * basicPrice) + (proPayingUsers * proPrice);
    modelSpecificAssumption = `Free-to-paid conversion: ${(FREE_TO_PAID_CONVERSION * 100).toFixed(0)}% · Basic vs. Pro split: ${(BASIC_VS_PRO_SPLIT * 100).toFixed(0)}% / ${((1 - BASIC_VS_PRO_SPLIT) * 100).toFixed(0)}%`;
  } else if (businessModel === 'transactional') {
    const monthlyTransactions = usersAtMonth12 * ASSUMED_TRANSACTIONS_PER_USER_PER_MONTH;
    projectedMonthlyRevenue = monthlyTransactions * avgTransactionValue * (commissionPercent / 100);
    modelSpecificAssumption = `Assumed ${ASSUMED_TRANSACTIONS_PER_USER_PER_MONTH} transaction per user per month`;
  } else if (businessModel === 'ad-driven') {
    projectedMonthlyRevenue = (usersAtMonth12 / 1000) * adRevenuePer1000;
  } else if (businessModel === 'usage-based') {
    projectedMonthlyRevenue = (usersAtMonth12 / 1000) * usageRevenuePer1000;
    modelSpecificAssumption = `Assumes usage volume scales in proportion to user count`;
  } else if (businessModel === 'one-time') {
    projectedMonthlyRevenue = newUsersAtMonth12 * oneTimePrice;
    modelSpecificAssumption = `Based on new buyers that month (${formatUsers(newUsersAtMonth12)}), not the running total — each customer only pays once`;
  }

  const reset = () => setHasCalculated(false);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">Revenue Model</h1>

        {venture?.name && (
          <div className="bg-white rounded-xl border border-indigo-100 p-4 mb-6 text-sm text-gray-600">
            <p className="font-semibold text-gray-900">{venture.name}</p>
            {venture.problem && (
              <p className="mt-1"><span className="font-semibold text-indigo-600">Problem:</span> {venture.problem}</p>
            )}
            {venture.solution && (
              <p className="mt-1"><span className="font-semibold text-indigo-600">Solution:</span> {venture.solution}</p>
            )}
          </div>
        )}

        {/* How It Works */}
        <div className="mb-8">
          <h3 className="font-semibold text-lg text-gray-900 text-center">How It Works</h3>
          <ExplainerRows rows={[
            { icon: <Layers className="w-6 h-6 text-indigo-600" />, text: <>Choose your business model. Not sure? Tap <b>Not sure?</b> and answer a few questions.</> },
            { icon: <CircleDollarSign className="w-6 h-6 text-indigo-600" />, text: 'Set your price and how many users you expect in the first month.' },
            { icon: <TrendingUp className="w-6 h-6 text-indigo-600" />, text: 'Pick the growth strategy that fits you.' },
            { icon: <Calculator className="w-6 h-6 text-indigo-600" />, text: <>Click <b>Calculate</b> to see your 12-month projection.</> },
          ]} />
        </div>

        {/* Business model */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3 gap-3">
            <h2 className="text-lg font-bold text-gray-900">What's your business model?</h2>
            <button onClick={() => setShowSelector(v => !v)} className="flex items-center gap-1 text-sm font-medium text-indigo-600 flex-shrink-0">
              <Info className="w-4 h-4" />
              Not sure?
            </button>
          </div>

          {showSelector && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-4 space-y-5">
              <div>
                <p className="font-semibold text-gray-800 mb-1">1. Is your product's value built around one key feature, or a set of features working together?</p>
                <p className="text-sm text-gray-500 mb-2">For example: a photo-editing app might make its money from one feature — the "remove background" tool. A fitness app usually needs everything (workouts, tracking, community) working together for people to feel it's worth paying for.</p>
                <input type="range" min="0" max="10" value={valueConcentrationInput} onChange={(e) => setValueConcentrationInput(Number(e.target.value))} className="w-full accent-indigo-600" />
                <div className="flex justify-between text-xs text-gray-400"><span>One specific feature</span><span>All features together</span></div>
              </div>

              <div>
                <p className="font-semibold text-gray-800 mb-1">2. When would the customer be willing to pay?</p>
                <div className="space-y-2 mt-2">
                  {PAYMENT_MOMENT_OPTIONS.map(opt => (
                    <label key={opt.key} className="flex items-center gap-2 text-sm text-gray-700">
                      <input type="radio" name="paymentMoment" checked={paymentMoment === opt.key}
                        onChange={() => setPaymentMoment(opt.key)} />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-semibold text-gray-800 mb-1">3. Is this something people use often, or only when a specific need comes up?</p>
                <p className="text-sm text-gray-500 mb-2">Think about products you use — some (like a messaging app) become part of your daily routine, while others (like calling a plumber) you only turn to when a specific problem shows up.</p>
                <input type="range" min="0" max="10" value={usageIntensity} onChange={(e) => setUsageIntensity(Number(e.target.value))} className="w-full accent-indigo-600" />
                <div className="flex justify-between text-xs text-gray-400"><span>Occasional need</span><span>Daily habit</span></div>
              </div>

              <div>
                <p className="font-semibold text-gray-800 mb-1">4. Does your product become more valuable as more people join?</p>
                <input type="range" min="0" max="10" value={networkEffect} onChange={(e) => setNetworkEffect(Number(e.target.value))} className="w-full accent-indigo-600" />
                <div className="flex justify-between text-xs text-gray-400"><span>No network effect</span><span>Strong network effect</span></div>
              </div>

              <Button
                onClick={() => setShowFitResults(true)}
                disabled={!paymentMoment}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                See Revenue Model Fit
              </Button>

              {showFitResults && paymentMoment && (() => {
                const fitScores = calculateFitScores({ usageIntensity, networkEffect, valueConcentration: valueConcentrationInput, paymentMoment });
                const top = fitScores[0];
                return (
                  <div className="bg-white rounded-xl p-4 mt-2">
                    <p className="font-semibold text-gray-800 mb-3">Revenue Model Fit</p>
                    <div className="space-y-2 mb-4">
                      {fitScores.map(m => (
                        <div key={m.key}>
                          <div className="flex justify-between text-xs text-gray-600 mb-0.5">
                            <span className="flex items-center gap-1.5"><m.Icon className="w-3.5 h-3.5 text-indigo-600" />{m.label}</span>
                            <span className="font-semibold">{m.score}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${m.score}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 italic mb-3">This is a recommendation based on the characteristics you've defined, not a rule — you still choose below.</p>
                    <Button
                      onClick={() => { setBusinessModel(top.key); reset(); setShowSelector(false); }}
                      variant="outline"
                      className="w-full"
                    >
                      Use {top.label}
                    </Button>
                  </div>
                );
              })()}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {BUSINESS_MODELS.map(model => {
              const selected = businessModel === model.key;
              return (
                <button
                  key={model.key}
                  onClick={() => { setBusinessModel(model.key); reset(); }}
                  className={`border-2 rounded-2xl px-2.5 py-3 flex flex-col items-center gap-2 text-center transition-all ${
                    selected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${selected ? 'bg-white' : 'bg-gray-100'}`}>
                    <model.Icon className="w-5 h-5 text-indigo-600" />
                  </span>
                  <span className="text-[13px] font-bold text-gray-900 leading-tight">{model.label}</span>
                </button>
              );
            })}
          </div>
          {selectedModel && (
            <p className="text-sm text-gray-600 mt-3 bg-indigo-50 rounded-xl p-3 leading-relaxed">{selectedModel.description}</p>
          )}
        </div>

        {/* Pricing, model-specific */}
        {businessModel && (
          <div className="mb-8">
            <SectionTitle>How will you price it?</SectionTitle>
            <div className="space-y-3">
              {businessModel === 'subscription' && (
                <SliderRow label="Monthly price" valueText={`$${subscriptionPrice}/mo`} min="1" max="200" value={subscriptionPrice}
                  onChange={(e) => { setSubscriptionPrice(Number(e.target.value)); reset(); }} />
              )}

              {businessModel === 'freemium' && (
                <>
                  <div className="flex items-center bg-white border border-gray-200 rounded-2xl px-4 py-3">
                    <span className="font-bold text-gray-500">Free</span>
                    <span className="ml-auto text-lg font-extrabold text-gray-400">$0</span>
                  </div>
                  <SliderRow label="Basic price" valueText={`$${basicPrice}/mo`} min="1" max="100" value={basicPrice}
                    onChange={(e) => { setBasicPrice(Number(e.target.value)); reset(); }} />
                  <SliderRow label="Pro price" valueText={`$${proPrice}/mo`} valueClass="text-purple-600" min="5" max="300" value={proPrice}
                    onChange={(e) => { setProPrice(Number(e.target.value)); reset(); }} />
                </>
              )}

              {businessModel === 'transactional' && (
                <>
                  <SliderRow label="Average transaction value" valueText={`$${avgTransactionValue}`} min="1" max="500" value={avgTransactionValue}
                    onChange={(e) => { setAvgTransactionValue(Number(e.target.value)); reset(); }} />
                  <SliderRow label="Your commission" valueText={`${commissionPercent}%`} valueClass="text-purple-600" min="1" max="30" value={commissionPercent}
                    onChange={(e) => { setCommissionPercent(Number(e.target.value)); reset(); }} />
                </>
              )}

              {businessModel === 'ad-driven' && (
                <SliderRow label="Estimated ad revenue per 1,000 users" valueText={`$${adRevenuePer1000}`} min="1" max="50" value={adRevenuePer1000}
                  onChange={(e) => { setAdRevenuePer1000(Number(e.target.value)); reset(); }} />
              )}

              {businessModel === 'usage-based' && (
                <SliderRow label="Estimated revenue per 1,000 uses" valueText={`$${usageRevenuePer1000}`} min="1" max="200" value={usageRevenuePer1000}
                  onChange={(e) => { setUsageRevenuePer1000(Number(e.target.value)); reset(); }} />
              )}

              {businessModel === 'one-time' && (
                <SliderRow label="One-time price" valueText={`$${oneTimePrice}`} min="1" max="500" value={oneTimePrice}
                  onChange={(e) => { setOneTimePrice(Number(e.target.value)); reset(); }} />
              )}
            </div>
          </div>
        )}

        {/* Initial users */}
        {businessModel && (
          <div className="mb-8">
            <SectionTitle>How many users in your first month?</SectionTitle>
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-4">
              <p className="text-center text-3xl font-extrabold text-indigo-600 mb-3">{formatUsers(newUsersMonth1)}</p>
              <input type="range" min="1" max="2000" value={newUsersMonth1}
                onChange={(e) => { setNewUsersMonth1(Number(e.target.value)); reset(); }}
                className="w-full accent-indigo-600" />
            </div>
          </div>
        )}

        {/* Growth strategy */}
        {businessModel && (
          <div className="mb-8">
            <SectionTitle sub="Pick the story that fits how you expect to grow.">What's your growth strategy?</SectionTitle>
            <div className="space-y-3">
              {GROWTH_STRATEGIES.map(strategy => {
                const selected = growthStrategy === strategy.key;
                return (
                  <button
                    key={strategy.key}
                    onClick={() => { setGrowthStrategy(strategy.key); reset(); }}
                    className={`w-full border-2 rounded-2xl p-3.5 text-left flex items-start gap-3 transition-all ${
                      selected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <span className={`flex-none w-10 h-10 rounded-xl flex items-center justify-center ${selected ? 'bg-white' : 'bg-gray-100'}`}>
                      <strategy.Icon className="w-5 h-5 text-indigo-600" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-gray-900">{strategy.label}</span>
                      <span className="block text-xs text-gray-500 mt-1 leading-snug">{strategy.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {businessModel && growthStrategy && (
          <div className="text-center mb-8">
            <Button
              onClick={() => setHasCalculated(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-base px-9 py-6 rounded-full shadow-lg"
            >
              Calculate Projection
            </Button>
          </div>
        )}

        {hasCalculated && selectedStrategy && (
          <div className="bg-white rounded-3xl p-6 mb-8 text-center border-2 border-indigo-200">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Projected users at month 12</p>
            <p className="text-2xl font-bold text-gray-700 mb-5">{formatUsers(usersAtMonth12)}</p>

            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Projected monthly revenue (month 12)</p>
            <p className="text-4xl font-extrabold text-indigo-600 mb-5">{formatMoney(projectedMonthlyRevenue)}</p>

            <div className="text-left bg-gray-50 rounded-xl p-4 text-xs text-gray-600 space-y-2 leading-relaxed">
              <p className="font-semibold text-gray-700">Model Assumptions</p>
              {modelSpecificAssumption && <p>{modelSpecificAssumption}</p>}
              <p>
                Growth strategy: <strong>{selectedStrategy.label}</strong> — growing {(selectedStrategy.growthRate * 100).toFixed(1)}% month over month, with a monthly churn (the percentage of users who stop using the product each month) of {(selectedStrategy.churnRate * 100).toFixed(1)}%.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
