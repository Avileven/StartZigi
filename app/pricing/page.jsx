"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Check, Menu, X } from 'lucide-react';

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = null; 

  const tiers = [
    {
      name: 'Free',
      price: '$0',
      description: 'Free access to grow your idea',
      features: ['Use pro tools', 'Basic mentor access'],
      cta: 'Start Free',
      featured: false,
    },
    {
      name: 'Vision',
      price: '$5',
      description: '20 Mentor Credits',
      features: ['20 Mentor interactions', 'StartZig Studio- basic AI'],
      cta: 'Get Vision',
      featured: false,
    },
    {
      name: 'Impact',
      price: isAnnual ? '$7' : '$10',
      description: '100 Mentor Credits',
      features: [
        '100 Mentor interactions',
        'Full Mentor guidance',
        'StartZig Studio- Boost AI',
      ],
      cta: 'Get Impact',
      featured: true,
    },
    {
      name: 'Unicorn',
      price: isAnnual ? '$17.5' : '$25',
      description: '500 Mentor Credits',
      features: [
        '500 Mentor interactions',
        'Full Mentor guidance',
        'StartZig Studio- All tools',
        'Social & media tools',
      ],
      cta: 'Get Unicorn',
      featured: false,
    },
  ];

  return (
    <div className="bg-gray-900 text-white min-h-screen">
    
      {/* תוכן Pricing */}
      <div className="pt-32 pb-24 px-6">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-4xl font-bold">Pricing Plans</h2>

          <div className="mt-8 flex items-center justify-center gap-x-4">
            <span className={!isAnnual ? 'text-white' : 'text-gray-400'}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative h-6 w-11 rounded-full bg-gray-700 transition-colors"
            >
              <span className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-indigo-500 transition-transform ${isAnnual ? 'translate-x-5' : ''}`} />
            </button>
            <span className={isAnnual ? 'text-white' : 'text-gray-400'}>
              Yearly <span className="text-indigo-400 font-medium">(30% Off)</span>
            </span>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`flex flex-col rounded-3xl p-8 ring-1 ring-white/10 ${
                  tier.featured ? 'bg-white/10 ring-2 ring-indigo-500 scale-105 shadow-xl' : 'bg-white/5'
                }`}
              >
                <h3 className="text-lg font-semibold text-indigo-400">{tier.name}</h3>
                {tier.featured && <p className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold mt-1">Most Popular</p>}
                
                <div className="mt-4 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-sm text-gray-400">/month</span>
                </div>
                <p className="mt-2 text-sm text-gray-300 h-10">{tier.description}</p>
                
                <ul className="mt-8 space-y-3 text-sm text-left flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3 text-gray-300">
                      <Check className="h-5 w-5 text-indigo-400 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button className={`mt-8 w-full py-2 rounded-lg font-semibold transition-all ${
                  tier.featured ? 'bg-indigo-500 hover:bg-indigo-400' : 'bg-white/10 hover:bg-white/20'
                }`}>
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}