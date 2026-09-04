// pricing page - updated
// UPDATE 200426: Block plan downgrade — user cannot select a plan lower than their current one.
// [FULL REBUILD] Per "New pricing.docx" — replaced the flat 4-tier grid
// with two tabs (Build an Idea / Grow a Product), each with a free-ish and
// a "Boost" tier. Pro Founder and Unicorn are gone entirely. The 6-month
// price still uses the existing separate Monthly/6-Months toggle (not
// embedded in the card text, despite how the doc formatted it) — confirmed
// explicitly this session. "Most Popular" replaced with "Recommended",
// and only Growth Boost carries it now.
"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// [CREDITS] credit limits per plan
const PLAN_CREDITS = {
  builder: 100,
  builder_boost: 300,
  growth: 100,
  growth_boost: 200,
};

// [DOWNGRADE] Plan hierarchy — used to block downgrades. Only meaningful
// within a track (Idea vs Growth); the two Growth tiers don't currently
// reach this check at all (see handleSelectPlan — both are launch-locked
// or informational), kept here only for the Idea track / future use.
const PLAN_ORDER = { builder: 0, builder_boost: 1 };

export default function Pricing() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState('sixMonth'); // 'monthly' | 'sixMonth'
  // [NEW] Tab state — 'idea' (Build an Idea) or 'product' (Grow a Product).
  const [activeTab, setActiveTab] = useState('idea');
  const router = useRouter();

  const handleSelectPlan = async (planKey) => {
    if (planKey === 'builder') {
      router.push('/dashboard');
      return;
    }

    // [LAUNCH LOCK] During launch period — paid plans are locked
    if (planKey === 'builder_boost') {
      alert('Available after launch. Stay tuned!');
      return;
    }
    // [NEW] Growth isn't purchased here at all — it's assigned
    // automatically the moment a venture reaches the Growth stage (via the
    // regular journey or by registering with an existing product). This
    // card is informational only.
    if (planKey === 'growth') {
      alert('Growth is included automatically when your venture reaches the Growth stage — nothing to select here.');
      return;
    }
    if (planKey === 'growth_boost') {
      alert('Available after launch. Stay tuned!');
      return;
    }

    setIsUpdating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // [DOWNGRADE] Fetch current plan and block if user tries to select a lower tier
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('plan')
        .eq('id', user.id)
        .single();

      if (profile && PLAN_ORDER[planKey] < PLAN_ORDER[profile.plan]) {
        alert('You cannot downgrade to a lower plan. Please contact support if you need to make changes to your subscription.');
        setIsUpdating(false);
        return;
      }

      await supabase.from('user_profiles').update({
        plan: planKey,
        credits_limit: PLAN_CREDITS[planKey],
      }).eq('id', user.id);

      alert(`Plan updated! Redirecting to dashboard...`);
      router.push('/dashboard');
    } catch (error) {
      console.error('Plan update error:', error);
      alert('Failed to update plan. Please try again.');
    }
    setIsUpdating(false);
  };

  const ideaTiers = [
    {
      key: 'builder',
      name: 'Builder',
      emoji: '🔨',
      price: '$0',
      sixMonthPrice: '$0',
      priceNote: 'forever',
      subtitle: 'Try it out, no pressure',
      description: "StartZig's journey is free forever. No credit card, no pressure. Develop your idea and get feedback from the community.",
      features: [
        'Full startup journey',
        'Free use of a variety of product development tools',
        '20 feedback requests a month (at least)*',
        '100 AI credits a month',
      ],
      cta: 'Start Free',
      featured: false,
    },
    {
      key: 'builder_boost',
      name: 'Builder Boost',
      emoji: '⚡',
      price: '$12',
      sixMonthPrice: '$9',
      priceNote: '/ month',
      subtitle: 'For founders who rely on AI regularly',
      description: 'Built for founders who want to move faster — more AI support for continuous building, planning, and validating.',
      features: [
        'Full startup journey',
        'Free use of a variety of product development tools',
        '30 feedback requests a month (at least)*',
        '300 AI credits a month',
      ],
      cta: 'Get Builder Boost',
      featured: false,
    },
  ];

  const growthTiers = [
    {
      key: 'growth',
      name: 'Growth',
      emoji: '🚀',
      price: '$35',
      sixMonthPrice: '$28',
      priceNote: '/ month',
      subtitle: 'For founders who already have a product',
      description: 'Expose your product to the community and collect feedback on it.',
      features: [
        'Product landing page',
        '20 feedback requests a month (at least)*',
        '100 AI credits a month',
      ],
      cta: 'Get Growth',
      featured: false,
    },
    {
      key: 'growth_boost',
      name: 'Growth Boost',
      emoji: '🚀',
      price: '$49',
      sixMonthPrice: '$39',
      priceNote: '/ month',
      subtitle: 'For founders who need more reach',
      description: 'More visibility, more feedback, more support for products actively growing their user base.',
      features: [
        'Product landing page',
        '50 feedback requests a month (at least)*',
        '200 AI credits a month',
      ],
      cta: 'Get Growth Boost',
      featured: true,
    },
  ];

  const tiers = activeTab === 'idea' ? ideaTiers : growthTiers;

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        {/* [FIX — full rebuild] Replaced the old gradient headline with the
            approved quote from the pricing doc, shown as an italic intro
            line rather than a giant styled heading. */}
        <p className="text-lg md:text-xl italic text-gray-700 max-w-3xl mx-auto mb-10 leading-relaxed">
          Our objective is to help early stage founders. That's why the entire journey, from idea to demo, is free. No credit card, no trial that runs out.
        </p>

        {/* [NEW] Tabs — Build an Idea / Grow a Product */}
        <div className="inline-flex items-center bg-gray-100 rounded-full p-1 mb-6">
          <button
            onClick={() => setActiveTab('idea')}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
              activeTab === 'idea' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Build an Idea
          </button>
          <button
            onClick={() => setActiveTab('product')}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
              activeTab === 'product' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Grow a Product
          </button>
        </div>

        <p className="text-gray-600 text-sm mb-4">
          All plans include monthly credits. Need more? Top up anytime.
        </p>

        <div className="inline-flex items-center bg-gray-100 rounded-full p-1 mb-4">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              billingPeriod === 'monthly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('sixMonth')}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              billingPeriod === 'sixMonth' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            6 Months <span className="text-xs font-normal">(Full journey)</span>
          </button>
        </div>

        {/* [FIX] max-w-3xl + 2-column grid — was 4-column, now only 2 tiers
            per tab, a 4-column grid would leave two empty columns. */}
        <div className="grid md:grid-cols-2 gap-6 mt-12 max-w-3xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.key}
              className={`relative flex flex-col p-8 rounded-3xl border transition-all ${
                tier.featured
                  ? 'bg-blue-50 border-blue-300 shadow-xl scale-105 z-10'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-left text-gray-900">{tier.name}</h3>
                {/* [FIX] "Most Popular" replaced with "Recommended", per
                    explicit request — only Growth Boost carries it now. */}
                {tier.featured && (
                  <span className="bg-blue-600 text-white text-[10px] uppercase px-2 py-1 rounded-full font-bold whitespace-nowrap">Recommended</span>
                )}
              </div>

              <p className="text-xs text-blue-600 italic text-left mb-4">{tier.subtitle}</p>

              <p className="text-sm text-gray-600 text-left mb-6 min-h-[48px]">
                {tier.description}
              </p>

              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-bold text-gray-900">
                  {billingPeriod === 'sixMonth' ? tier.sixMonthPrice : tier.price}
                </span>
                <span className="text-gray-500 text-sm">{tier.priceNote}</span>
              </div>

              <div className="flex-1">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 text-left">
                  Plan highlights:
                </p>
                <ul className="space-y-4 text-sm text-left">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-gray-700">
                      <Check className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleSelectPlan(tier.key)}
                disabled={isUpdating}
                className={`mt-10 w-full py-3 rounded-xl font-bold transition-all ${
                  tier.featured ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-900 hover:bg-gray-800 text-white'
                } disabled:opacity-50`}
              >
                {isUpdating ? 'Updating...' : tier.cta}
              </button>
            </div>
          ))}
        </div>

        {/* [NEW] Footnote from the doc, explaining the "(at least)*" marker
            on feedback request counts. */}
        <p className="text-xs text-gray-400 mt-8 max-w-2xl mx-auto">
          * You can scale up your feedback balance by earning Insight Credits — each time you give feedback to another product.
        </p>
      </div>
    </div>
  );
}
