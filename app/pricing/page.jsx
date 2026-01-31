"use client";
import React, { useState } from 'react';
import Link from "next/link";
import { createPageUrl } from "@/lib/utils";
import { Check, Zap, Rocket, Crown } from 'lucide-react';

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  const tiers = [
    {
      name: 'Vision',
      id: 'tier-vision',
      price: '$5',
      description: '20 Mentor Credits',
      features: [
        '20 Mentor interactions',
        'Basic AI Mockup support',
        'Landing page creation',
        'Project dashboard access',
      ],
      featured: false,
      cta: 'Get Vision'
    },
    {
      name: 'Impact',
      id: 'tier-impact',
      price: isAnnual ? '$7' : '$10',
      description: '100 Mentor Credits',
      features: [
        '100 Mentor interactions',
        'Full Mentor guidance through all stages',
        'Direct Studio support & optimization',
        '20 Basic or 10 Advanced Mockups',
        'VC Marketplace access',
      ],
      featured: true,
      cta: 'Get Impact'
    },
    {
      name: 'Unicorn',
      id: 'tier-unicorn',
      price: isAnnual ? '$17.5' : '$25',
      description: '500 Mentor Credits',
      features: [
        '500 Mentor interactions',
        'Priority AI processing',
        'Unlimited Studio iterations',
        'Advanced analytics & simulations',
        'Dedicated founder support',
      ],
      featured: false,
      cta: 'Get Unicorn'
    },
  ];

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <nav className="sticky top-0 bg-gray-900/80 backdrop-blur-md z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href={createPageUrl("Home")} className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              StartZig
            </Link>
          </div>
        </div>
      </nav>

      <div className="py-24 px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Select Your Path</h1>
          <p className="mt-6 text-lg leading-8 text-gray-400">
            Choose the right level of mentorship and AI power for your venture.
          </p>

          {/* Toggle החודשי/שנתי */}
          <div className="mt-12 flex items-center justify-center gap-x-4">
            <span className={`text-sm ${!isAnnual ? 'text-white' : 'text-gray-400'}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-700 transition-colors focus:outline-none"
            >
              <span
                className={`${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-indigo-500 transition-transform`}
              />
            </button>
            <span className={`text-sm ${isAnnual ? 'text-white' : 'text-gray-400'}`}>
              Yearly <span className="text-indigo-400 font-semibold">(Save 30%)</span>
            </span>
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-y-6 lg:max-w-none lg:grid-cols-3 lg:gap-x-8">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`flex flex-col rounded-3xl p-8 ring-1 ring-white/10 transition-all duration-300 ${
                tier.featured ? 'bg-white/10 ring-2 ring-indigo-500 scale-105 shadow-2xl shadow-indigo-500/10' : 'bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between gap-x-4">
                <h3 className="text-lg font-semibold leading-8 text-indigo-400">{tier.name}</h3>
                {tier.featured && (
                  <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold leading-5 text-indigo-400">
                    Most Popular
                  </span>
                )}
              </div>
              <p className="mt-4 flex items-baseline gap-x-2">
                <span className="text-4xl font-bold tracking-tight text-white">{tier.price}</span>
                <span className="text-sm font-semibold text-gray-400">/month</span>
              </p>
              <p className="mt-2 text-sm text-gray-400">{tier.description}</p>
              
              <ul className="mt-8 space-y-3 text-sm leading-6 text-gray-300 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <Check className="h-6 w-5 text-indigo-400 flex-none" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`mt-8 block w-full rounded-md px-3 py-2 text-center text-sm font-semibold shadow-sm transition-all ${
                  tier.featured 
                    ? 'bg-indigo-500 text-white hover:bg-indigo-400' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}