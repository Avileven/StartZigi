// ============================================================
// FILE DESTINATION: app/revenue-modeling-experience/page.jsx (replaces existing file)
// ============================================================
// [REWRITE 020826] Full simplification, per this session's explicit
// decision — the previous version (9 sliders across 4 business models,
// enterprise-scale examples like Palantir/SAP/Workday, 24-month charts) was
// built for a founder raising real money, not for a first rough sketch
// right after finishing an MVP. Replaced with 3 quick questions and one
// result number — a few clicks, meant to feel fun, not intimidating.
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

// --- Simple, fixed industry-benchmark assumptions (not asked of the founder) ---
const FREE_TO_PAID_CONVERSION = 0.03; // 3% — typical for freemium apps
const BASIC_VS_PRO_SPLIT = 0.7; // 70% choose the cheaper tier
const GROWTH_PACE_OPTIONS = [
  { key: 'slow', label: 'Slow', icon: '🐢', churnRate: 0.05 },
  { key: 'steady', label: 'Steady', icon: '🚶', churnRate: 0.03 },
  { key: 'fast', label: 'Fast', icon: '🚀', churnRate: 0.015 },
];
const USER_MILESTONES = [100, 1000, 10000, 100000, 1000000];

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

  // The three questions
  const [basicPrice, setBasicPrice] = useState(9);
  const [proPrice, setProPrice] = useState(29);
  const [userMilestoneIndex, setUserMilestoneIndex] = useState(2); // defaults to 10,000
  const [growthPace, setGrowthPace] = useState('steady');

  const [hasCalculated, setHasCalculated] = useState(false);

  useEffect(() => {
    const fetchCurrentVenture = async () => {
      const currentUser = await User.me();
      setFounderName(currentUser.full_name || currentUser.username || '');
      const ventures = await Venture.filter({ created_by: currentUser.email }, "-created_date");
      if (ventures.length > 0) {
        const currentVenture = ventures[0];
        setVenture(currentVenture);
        if (currentVenture.revenue_model_data) {
          const d = currentVenture.revenue_model_data;
          if (d.basicPrice != null) setBasicPrice(d.basicPrice);
          if (d.proPrice != null) setProPrice(d.proPrice);
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

  const payingUsers = projectedUsers * FREE_TO_PAID_CONVERSION;
  const basicPayingUsers = payingUsers * BASIC_VS_PRO_SPLIT;
  const proPayingUsers = payingUsers * (1 - BASIC_VS_PRO_SPLIT);
  const projectedMonthlyRevenue = (basicPayingUsers * basicPrice) + (proPayingUsers * proPrice);

  const canFinalize = () => hasCalculated;

  const handleFinalizeModel = async () => {
    if (!canFinalize()) {
      alert("Give it a first calculation before finalizing — click \"Show me the money\" above.");
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
          basicPrice,
          proPrice,
          projectedUsers,
          growthPace,
          projectedMonthlyRevenue,
          assumptions: {
            freeToPaidConversion: FREE_TO_PAID_CONVERSION,
            basicVsProSplit: BASIC_VS_PRO_SPLIT,
            monthlyChurn: churnRate,
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
          title: '✅ Revenue Model Finalized!',
          content: `You've sketched your first revenue model. Estimated monthly revenue: ${formatMoney(projectedMonthlyRevenue)}.`,
          phase: 'business_plan',
          priority: 2,
        });

        await VentureMessage.create({
          venture_id: venture.id,
          message_type: 'phase_welcome',
          title: '💖 Welcome to the MLP Phase!',
          content: `Great progress! You're now in the Minimum Lovable Product phase. Your mission is to gather user feedback and make your product truly lovable.

Key tasks:
• Complete the MLP Development Center to plan your enhancements
• Enter the Promotion Center and share your landing page to collect feedback from users
• Collect at least 10 pieces of feedback to unlock the Beta phase
• Analyze feedback in the Product Feedback Center

Once you've completed MLP development phase, you'll be ready to move to the Beta phase.`,
          phase: 'mlp',
          priority: 3,
        });

        // [ADDED 020826] Example Projects — unchanged from before.
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

        // [ADDED 020826] Combined phase-transition + demo-invite email — unchanged from before.
        fetch('/api/send-phase-transition', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: venture.created_by,
            founderName: founderName,
            ventureName: venture.name,
            newPhaseTitle: "Great progress! You've completed the MVP stage. You're now in the Minimum Lovable Product phase. Your mission is to gather user feedback and make your product truly lovable.",
            newPhaseMessage: `Key tasks:
• Complete the MLP Development Center to plan your enhancements
• Enter the Promotion Center and share your landing page to collect feedback from users
• Collect at least 10 pieces of feedback to unlock the Beta phase
• Analyze feedback in the Product Feedback Center`,
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
    return <div className="p-8 text-center text-gray-400">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-3 text-center">First Revenue Sketch</h1>
        <p className="text-gray-600 text-center mb-10 leading-relaxed">
          Even at this early stage, it's worth starting to think about how your product will make money, especially as it shapes how you build it going forward. This is just a first sketch, not a final plan.
        </p>

        {/* Question 1 — Pricing */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">💰 How will you price it?</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="border-2 border-gray-200 rounded-xl p-4 text-center">
              <p className="text-2xl mb-1">🆓</p>
              <p className="font-semibold text-gray-700">Free</p>
              <p className="text-lg font-bold text-gray-400 mt-1">$0</p>
            </div>
            <div className="border-2 border-indigo-300 rounded-xl p-4 text-center bg-indigo-50">
              <p className="text-2xl mb-1">⭐</p>
              <p className="font-semibold text-gray-700">Basic</p>
              <p className="text-xl font-bold text-indigo-600 mt-1">${basicPrice}<span className="text-xs font-normal">/mo</span></p>
              <input
                type="range" min="1" max="100" value={basicPrice}
                onChange={(e) => { setBasicPrice(Number(e.target.value)); setHasCalculated(false); }}
                className="w-full mt-2"
              />
            </div>
            <div className="border-2 border-purple-300 rounded-xl p-4 text-center bg-purple-50">
              <p className="text-2xl mb-1">💎</p>
              <p className="font-semibold text-gray-700">Pro</p>
              <p className="text-xl font-bold text-purple-600 mt-1">${proPrice}<span className="text-xs font-normal">/mo</span></p>
              <input
                type="range" min="5" max="300" value={proPrice}
                onChange={(e) => { setProPrice(Number(e.target.value)); setHasCalculated(false); }}
                className="w-full mt-2"
              />
            </div>
          </div>
        </div>

        {/* Question 2 — Users in a year */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-1">📈 How many users in a year?</h2>
          <p className="text-center text-3xl font-bold text-indigo-600 my-4">{formatUserCount(projectedUsers)}</p>
          <input
            type="range" min="0" max={USER_MILESTONES.length - 1} step="1"
            value={userMilestoneIndex}
            onChange={(e) => { setUserMilestoneIndex(Number(e.target.value)); setHasCalculated(false); }}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>100 — a solid start!</span>
            <span>1M+ — viral! 🔥</span>
          </div>
        </div>

        {/* Question 3 — Growth pace */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">⚡ How fast will you get there?</h2>
          <div className="grid grid-cols-3 gap-3">
            {GROWTH_PACE_OPTIONS.map(opt => (
              <button
                key={opt.key}
                onClick={() => { setGrowthPace(opt.key); setHasCalculated(false); }}
                className={`border-2 rounded-xl p-4 text-center transition-all ${
                  growthPace === opt.key ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="text-2xl mb-1">{opt.icon}</p>
                <p className="font-semibold text-gray-700">{opt.label}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="text-center mb-8">
          <Button
            onClick={() => setHasCalculated(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg px-10 py-6 rounded-full shadow-lg"
          >
            Show me the money 💰
          </Button>
        </div>

        {hasCalculated && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-center border-2 border-indigo-200">
            <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">Projected Monthly Revenue</p>
            <p className="text-5xl font-extrabold text-indigo-600 mb-6">{formatMoney(projectedMonthlyRevenue)}</p>

            <div className="text-left bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
              <p className="font-semibold text-gray-700 mb-2">Model Assumptions</p>
              <p>Free-to-paid conversion: {(FREE_TO_PAID_CONVERSION * 100).toFixed(0)}% (industry average for freemium apps)</p>
              <p>Basic vs. Pro split: {(BASIC_VS_PRO_SPLIT * 100).toFixed(0)}% / {((1 - BASIC_VS_PRO_SPLIT) * 100).toFixed(0)}%</p>
              <p>Monthly churn: {(churnRate * 100).toFixed(1)}% (based on your selected growth pace)</p>
            </div>
          </div>
        )}

        <div className="text-center">
          <Button
            onClick={handleFinalizeModel}
            disabled={isSubmitting || !hasCalculated}
            className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-10 py-6 rounded-full shadow-lg disabled:opacity-50"
          >
            {isSubmitting ? 'Finalizing…' : 'Finalize Revenue Model'}
          </Button>
        </div>
      </div>
    </div>
  );
}
