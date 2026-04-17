// pricing page - updated
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

export default function Pricing() {
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleSelectPlan = async (planKey) => {
    if (planKey === 'explorer') {
      router.push('/dashboard');
      return;
    }
    setIsUpdating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
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
      priceNote: 'forever',
      subtitle: 'Just looking around',
      description: 'StartZig is free to explore forever. No credit card, no pressure. Use the simulator, play with ideas, learn how startups work.',
      features: [
        'Full startup journey',
        'Community & investment marketplace browsing',
        'AI: 5 free credits for Mentor only',
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
      priceNote: '/ month',
      subtitle: 'For users starting to seriously validate ideas',
      description: 'When you\'re ready to get serious, we give you the tools to think, plan, and move like a real founder — without bureaucracy or upfront costs.',
      features: [
        'Full startup journey',
        'Community & investment marketplace browsing',
        'AI: 100 credits for Mentor & Demo Builder (StartZig Studio)',
        'Beta — simulation tools',
      ],
      cta: 'Get Builder',
      featured: false,
    },
    {
      key: 'pro_founder',
      name: 'Pro Founder',
      emoji: '🚀',
      price: '$18',
      priceNote: '/ month',
      subtitle: 'Designed for continuous building with AI support',
      description: 'Built for users who rely on the mentor regularly and are serious about growing a real venture.',
      features: [
        'Full startup journey',
        'Community & investment marketplace browsing',
        'AI: 300 credits for Mentor & Demo Builder (StartZig Studio)',
        'Beta — simulation tools',
        'Founder badge — visible to community and invited guests',
        'Business Deck — AI-generated investor business plan',
      ],
      cta: 'Get Pro Founder',
      featured: true,
    },
    {
      key: 'unicorn',
      name: 'Unicorn',
      emoji: '🦄',
      price: '$28',
      priceNote: '/ month',
      subtitle: 'For high-usage users running advanced simulations and testing at scale',
      description: 'Maximum AI power, advanced beta tools, and full platform visibility for founders scaling to the top.',
      features: [
        'Full startup journey',
        'Community & investment marketplace browsing',
        'AI: 500 credits for Mentor & Demo Builder (StartZig Studio)',
        'Founder badge — visible to community and invited guests',
        'Beta — advanced tools for real beta management (tester list, export & more)',
        'Business Deck — AI-generated investor business plan',
      ],
      cta: 'Get Unicorn',
      featured: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-sans">
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">
          Start your <span className="text-indigo-400 italic">journey for free</span> and upgrade when you need more power.
        </h1>
        <p className="text-gray-400 text-sm mb-4">
          All plans include monthly credits. Need more? Top up anytime.
        </p>

        <div className="grid md:grid-cols-4 gap-6 mt-12">
          {tiers.map((tier) => (
            <div
              key={tier.key}
              className={`relative flex flex-col p-8 rounded-3xl border transition-all ${
                tier.featured
                  ? 'bg-[#1E293B] border-indigo-500 shadow-xl scale-105 z-10'
                  : 'bg-[#1E293B]/50 border-white/10'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-left">{tier.name}</h3>
                {tier.featured && (
                  <span className="bg-indigo-500 text-[10px] uppercase px-2 py-1 rounded-full font-bold whitespace-nowrap">Most Popular</span>
                )}
              </div>

              <p className="text-xs text-indigo-300 italic text-left mb-4">{tier.subtitle}</p>

              <p className="text-sm text-gray-400 text-left mb-6 min-h-[48px]">
                {tier.description}
              </p>

              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-bold">{tier.price}</span>
                <span className="text-gray-400 text-sm">{tier.priceNote}</span>
              </div>

              <div className="flex-1">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 text-left">
                  Plan highlights:
                </p>
                <ul className="space-y-4 text-sm text-left">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-gray-300">
                      <Check className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleSelectPlan(tier.key)}
                disabled={isUpdating}
                className={`mt-10 w-full py-3 rounded-xl font-bold transition-all ${
                  tier.featured ? 'bg-indigo-500 hover:bg-indigo-400' : 'bg-white/10 hover:bg-white/20'
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
