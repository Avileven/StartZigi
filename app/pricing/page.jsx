// pricing page - updated
// UPDATE 200426: Block plan downgrade — user cannot select a plan lower than their current one.
"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// [CREDITS] credit limits per plan
const PLAN_CREDITS = {
  explorer: 5,
  builder: 100,
  pro_founder: 300,
  unicorn: 500,
};

// [DOWNGRADE] Plan hierarchy — used to block downgrades
const PLAN_ORDER = { explorer: 0, builder: 1, pro_founder: 2, unicorn: 3 };

export default function Pricing() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState('sixMonth'); // 'monthly' | 'sixMonth'
  const router = useRouter();

  const handleSelectPlan = async (planKey) => {
    if (planKey === 'explorer') {
      router.push('/dashboard');
      return;
    }

    // [LAUNCH LOCK] During launch period — paid plans are locked
    if (planKey === 'builder') {
      alert("You're already on the Builder plan as an Early Adopter — enjoy your free month!");
      return;
    }
    if (planKey === 'pro_founder' || planKey === 'unicorn') {
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

  const tiers = [
    {
      key: 'explorer',
      name: 'Explorer',
      emoji: '🧭',
      price: '$0',
      sixMonthPrice: '$0',
      priceNote: 'forever',
      subtitle: 'Try it out, no pressure',
      description: 'StartZig is free to explore forever. No credit card, no pressure. Use the simulator, play with ideas, learn how startups work.',
      features: [
        'Full startup journey',
        'Community & investment marketplace browsing',
        '5 AI credits',
        'Beta — simulation tools',
      ],
      cta: 'Start Free',
      featured: false,
    },
    {
      key: 'builder',
      name: 'Builder',
      emoji: '🔨',
      price: '$9',
      sixMonthPrice: '$7',
      priceNote: '/ month',
      subtitle: 'For users starting to seriously validate ideas',
      description: 'When you\'re ready to get serious, we give you the tools to think, plan, and move like a real founder — without bureaucracy or upfront costs.',
      features: [
        'Full startup journey',
        'Community & investment marketplace browsing',
        '100 AI credits',
        'Beta — simulation tools',
      ],
      cta: 'Get Builder',
      featured: false,
    },
    {
      key: 'pro_founder',
      name: 'Pro Founder',
      emoji: '🚀',
      price: '$19',
      sixMonthPrice: '$15',
      priceNote: '/ month',
      subtitle: 'Designed for continuous building with AI support',
      description: 'Built for users who rely on the coach regularly and are serious about growing a real venture.',
      features: [
        'Full startup journey',
        'Community & investment marketplace browsing',
        '300 AI credits',
        'Beta — simulation tools',
        'Business Deck — AI-generated investor business plan',
        'ZigPlan — AI-generated Product Requirements Document',
        'Founder badge — visible to community and invited guests',
      ],
      cta: 'Get Pro Founder',
      featured: true,
    },
    {
      key: 'unicorn',
      name: 'Unicorn',
      emoji: '🦄',
      price: '$28',
      sixMonthPrice: '$19',
      priceNote: '/ month',
      subtitle: 'For high-usage users running advanced simulations and testing at scale',
      description: 'Maximum AI power, advanced beta tools, and full platform visibility for founders scaling to the top.',
      features: [
        'Full startup journey',
        'Community & investment marketplace browsing',
        '500 AI credits',
        'Business Deck — AI-generated investor business plan',
        'ZigPlan — AI-generated Product Requirements Document',
        'Founder badge — visible to community and invited guests',
        'Beta — advanced tools for real beta management (tester list, export & more)',
      ],
      cta: 'Get Unicorn',
      featured: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">
          Start your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent italic">journey for free</span> and upgrade when you need more power.
        </h1>
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

        <div className="grid md:grid-cols-4 gap-6 mt-12">
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
                {tier.featured && (
                  <span className="bg-blue-600 text-white text-[10px] uppercase px-2 py-1 rounded-full font-bold whitespace-nowrap">Most Popular</span>
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
      </div>
    </div>
  );
}
