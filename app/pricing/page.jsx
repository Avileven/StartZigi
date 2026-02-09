"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

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
      price: isAnnual ? '$3.5' : '$5',
      description: 'Take your idea to the next level with more help from our mentor and basic AI tools.',
      features: [
        'Free access to grow your idea',
        'Free access to the virtual investment marketplace',
        'Basic community tools',
        '25 Mentor interactions',
        'StartZig Studio- basic AI'
      ],
      cta: 'Get Vision',
      featured: false,
    },
    {
      name: 'Impact',
      price: isAnnual ? '$7' : '$10',
      description: 'Access advanced tools and scale up your mentor support.',
      features: [
        'Free access to grow your idea',
        'Free access to the virtual investment marketplace',
        'Basic community tools',
        '100 Mentor interactions',
        'StartZig Studio- Boost AI',
        'Basic Social & media tools'
      ],
      cta: 'Get Impact',
      featured: true,
    },
    {
      name: 'Unicorn',
      price: isAnnual ? '$17.5' : '$25',
      description: 'Boost your venture guidance with top mentor credits and advanced social tools.',
      features: [
        'Free access to grow your idea',
        'Free access to the virtual investment marketplace',
        'Advanced community tools',
        '500 Mentor interactions',
        'StartZig Studio- Boost AI',
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
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          Ready to start <span className="text-indigo-400 italic">the zigzag?</span>
        </h1>
        
        {/* Annual/Monthly Toggle */}
        <div className="flex justify-center items-center gap-4 mb-12">
          <span className={`text-sm ${!isAnnual ? 'text-white' : 'text-gray-400'}`}>Monthly</span>
          <button 
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-12 h-6 bg-indigo-500/20 rounded-full relative p-1 transition-all"
          >
            <div className={`w-4 h-4 bg-indigo-500 rounded-full transition-all ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
          <span className={`text-sm ${isAnnual ? 'text-white' : 'text-gray-400'}`}>
            Annually <span className="text-indigo-400 font-bold text-xs ml-1">(Save 30%)</span>
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

              <button className={`mt-10 w-full py-3 rounded-xl font-bold transition-all ${
                tier.featured ? 'bg-indigo-500 hover:bg-indigo-400' : 'bg-white/10 hover:bg-white/20'
              }`}>
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}