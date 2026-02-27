// 220226 WITH CREDIT
"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// [CREDITS] מיפוי תכניות לקרדיטים
const PLAN_CREDITS = {
  free: 5,
  vision: 25,
  impact: 100,
  unicorn: 500,
};

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  // [CREDITS] עדכון תכנית המשתמש בDB
  const handleSelectPlan = async (planName) => {
    const plan = planName.toLowerCase();
    if (plan === 'free') {
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
        plan,
        credits_limit: PLAN_CREDITS[plan],
        credits_used: 0,
        credits_reset_date: new Date().toISOString()
      }).eq('id', user.id);

      // TODO: כאן יתווסף Stripe בעתיד
      alert(`Plan updated to ${planName}! Redirecting to dashboard...`);
      router.push('/dashboard');
    } catch (error) {
      console.error('Plan update error:', error);
      alert('Failed to update plan. Please try again.');
    }
    setIsUpdating(false);
  };

  const tiers = [
    {
      name: 'Free',
      price: '$0',
      description: 'Access all of StartZig’s core features at no cost and see what it can do.',
      features: [
        'Free access to grow your idea',
        'Free access to the virtual investment marketplace',
        'Basic community tools',
        '5 Mentor interactions'
      ],
      cta: 'Start Free',
      featured: false,
    },
    {
      name: 'Vision',
      // נשאר 5 דולר תמיד
      price: '$5',
      description: 'Take your idea to the next level with more help from our mentor and basic AI tools.',
      features: [
        'Free access to grow your idea',
        'Free access to the virtual investment marketplace',
        'Basic community tools',
        '25 Mentor interactions',
        'zigforge Studio- basic AI'
      ],
      cta: 'Get Vision',
      featured: false,
    },
    {
      name: 'Impact',
      // 12 חודשי, 9.6 שנתי (20% הנחה)
      price: isAnnual ? '$9.6' : '$12',
      description: 'Access advanced tools and scale up your mentor support.',
      features: [
        'Free access to grow your idea',
        'Free access to the virtual investment marketplace',
        'Basic community tools',
        '100 Mentor interactions',
        'zigforge Studio- Boost AI',
        'Basic Social & media tools'
      ],
      cta: 'Get Impact',
      featured: true,
    },
    {
      name: 'Unicorn',
      // 35 חודשי, 28 שנתי (20% הנחה)
      price: isAnnual ? '$28' : '$35',
      description: 'Boost your venture guidance with top mentor credits and advanced social tools.',
      features: [
        'Free access to grow your idea',
        'Free access to the virtual investment marketplace',
        'Advanced community tools',
        '500 Mentor interactions',
        'zigforge Studio- Boost AI',
        'Advanced Social & media tools'
      ],
      cta: 'Get Unicorn',
      featured: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-sans">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between bg-[#0F172A]">
        <Link href="/" className="text-2xl font-bold tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl">S</span>
          </div>
          StartZig
        </Link>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">
  Start your <span className="text-indigo-400 italic">journey for free</span> and upgrade when you need more power.
</h1>
        
        {/* Toggle - Default is Annual */}
        <div className="flex justify-center items-center gap-4 mb-16">
          <span className={`text-sm ${!isAnnual ? 'text-white' : 'text-gray-400'}`}>Monthly</span>
          <button 
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-12 h-6 bg-indigo-500/20 rounded-full relative p-1 transition-all"
          >
            <div className={`w-4 h-4 bg-indigo-500 rounded-full transition-all ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
          <span className={`text-sm ${isAnnual ? 'text-white' : 'text-gray-400'}`}>
            Annually <span className="text-indigo-400 font-bold text-xs ml-1">(Save 20%)</span>
          </span>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col p-8 rounded-3xl border transition-all ${
                tier.featured 
                ? 'bg-[#1E293B] border-indigo-500 shadow-xl scale-105 z-10' 
                : 'bg-[#1E293B]/50 border-white/10'
              }`}
            >
              <div className="flex justify-between items-start mb-4 text-left">
                <h3 className="text-xl font-bold">{tier.name}</h3>
                {tier.featured && (
                  <span className="bg-indigo-500 text-[10px] uppercase px-2 py-1 rounded-full font-bold">Most Popular</span>
                )}
              </div>

              <p className="text-sm text-gray-400 text-left mb-6 min-h-[40px]">
                {tier.description}
              </p>

              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-bold">{tier.price}</span>
                <span className="text-gray-400 text-sm">/month</span>
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

              {/* [CREDITS] כפתור בחירת תכנית - מעדכן user_profiles בDB */}
              <button
                onClick={() => handleSelectPlan(tier.name)}
                disabled={isUpdating}
                className={`mt-10 w-full py-3 rounded-xl font-bold transition-all ${
                tier.featured ? 'bg-indigo-500 hover:bg-indigo-400' : 'bg-white/10 hover:bg-white/20'
              } disabled:opacity-50`}>
                {isUpdating ? 'Updating...' : tier.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}