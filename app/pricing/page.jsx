"use client";
import React from 'react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createPageUrl } from "@/lib/utils";
import { Check, Zap, Star, Trophy } from 'lucide-react';

const tiers = [
  {
    name: 'Basic',
    id: 'tier-basic',
    href: '#',
    price: { monthly: '$5' },
    description: 'Perfect for testing the waters and getting initial feedback.',
    features: [
      '20 Mentor Credits',
      '4 Basic AI Mockups (or 2 Advanced)',
      'Landing page creation',
      'Community forum access',
    ],
    featured: false,
    cta: 'Start Building',
    icon: <Zap className="h-6 w-5 text-indigo-400" />
  },
  {
    name: 'Pro',
    id: 'tier-pro',
    href: '#',
    price: { monthly: '$10' },
    description: 'The sweet spot for serious founders building their MVP.',
    features: [
      '100 Mentor Credits',
      '20 Basic AI Mockups (or 10 Advanced)',
      'Advanced Studio access',
      'VC Marketplace (Virtual) access',
      'Detailed performance analytics',
    ],
    featured: true, // המודל שרוב האנשים יבחרו
    cta: 'Most Popular',
    icon: <Star className="h-6 w-5 text-indigo-400" />
  },
  {
    name: 'Gold',
    id: 'tier-gold',
    href: '#',
    price: { monthly: '$25' },
    description: 'Unlimited power for high-growth ventures and heavy builders.',
    features: [
      '500 Mentor Credits',
      '100 Basic AI Mockups (or 50 Advanced)',
      'Priority AI rendering',
      '1-on-1 simulated board meetings',
      'Dedicated support',
    ],
    featured: false,
    cta: 'Go Gold',
    icon: <Trophy className="h-6 w-5 text-indigo-400" />
  },
]

export default function Pricing() {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
        <nav className="sticky top-0 bg-gray-900/80 backdrop-blur-md z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center">
                <Link href={createPageUrl("Home")} className="flex-shrink-0">
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">StartZig</span>
                </Link>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <a href={createPageUrl("Home") + "#benefits"} className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Benefits</a>
                  <Link href={createPageUrl("Community")} className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Community</Link>
                  <Link href={createPageUrl("Pricing")} className="bg-gray-800 text-white px-3 py-2 rounded-md text-sm font-medium">Pricing</Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Pricing Section */}
        <div className="isolate overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 pb-96 pt-24 text-center sm:pt-32 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-base font-semibold leading-7 text-indigo-400">Flexible Credits</h2>
              <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Fuel your venture with <br />
                StartZig Credits
              </p>
            </div>
            <div className="relative mt-6">
              <p className="mx-auto max-w-2xl text-lg leading-8 text-white/60">
                1 Credit = 1 Mentor Consultation. Use them for expert advice or high-fidelity AI mockups in the Studio.
              </p>
            </div>
          </div>
          
          <div className="flow-root bg-gray-900 pb-24 sm:pb-32">
            <div className="-mt-80">
              <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* שינוי ה-Grid ל-3 עמודות */}
                <div className="mx-auto grid max-w-md grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
                  {tiers.map((tier) => (
                    <div
                      key={tier.id}
                      className={`flex flex-col justify-between rounded-3xl p-8 shadow-xl ring-1 ring-white/10 transition-transform hover:scale-105 ${
                        tier.featured ? 'bg-white/10 ring-indigo-500 scale-105 z-10' : 'bg-white/5'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                            <h3 id={tier.id} className="text-lg font-semibold leading-7 text-indigo-400">
                            {tier.name}
                            </h3>
                            {tier.icon}
                        </div>
                        <div className="mt-4 flex items-baseline gap-x-2">
                          <span className="text-5xl font-bold tracking-tight text-white">{tier.price.monthly}</span>
                          <span className="text-base font-semibold leading-7 text-white/60">/month</span>
                        </div>
                        <p className="mt-6 text-base leading-7 text-white/60">{tier.description}</p>
                        <ul role="list" className="mt-10 space-y-4 text-sm leading-6 text-white">
                          {tier.features.map((feature) => (
                            <li key={feature} className="flex gap-x-3">
                              <Check className="h-6 w-5 flex-none text-indigo-400" aria-hidden="true" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <a
                        href={tier.href}
                        aria-describedby={tier.id}
                        className={`mt-8 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                          tier.featured
                            ? 'bg-indigo-500 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline-indigo-500'
                            : 'bg-white/10 text-white hover:bg-white/20 focus-visible:outline-white'
                        }`}
                      >
                        {tier.cta}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="bg-gray-900">
            <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 lg:px-8">
            <p className="text-center text-xs leading-5 text-gray-400">&copy; 2026 StartZig. All rights reserved.</p>
            </div>
        </footer>
    </div>
  )
}