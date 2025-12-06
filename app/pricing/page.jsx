
"use client";
import React from 'react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createPageUrl } from "@/lib/utils";
import { Check, ArrowRight, Star, Rocket, Zap } from 'lucide-react';

const tiers = [
  {
    name: 'Explorer',
    id: 'tier-explorer',
    href: '#',
    price: { monthly: '$0', annually: '$0' },
    description: 'The essentials to start your entrepreneurial journey, completely free.',
    features: [
      'Create and manage one venture',
      'Full access to Idea and Business Plan modules',
      'Landing page creation',
      'Access to community forum',
    ],
    featured: false,
    cta: 'Start for Free'
  },
  {
    name: 'Founder',
    id: 'tier-founder',
    href: '#',
    price: { monthly: '$29', annually: '$290' },
    description: 'A plan that scales with your venture, unlocking key growth tools.',
    features: [
      'Everything in Explorer, plus:',
      'MVP and Pitch development modules',
      'Engage with Angel and VC simulators',
      'Advanced promotion tools',
      'Detailed performance analytics',
    ],
    featured: true,
    cta: 'Get Started'
  },
  {
    name: 'Scale',
    id: 'tier-scale',
    href: '#',
    price: { monthly: '$79', annually: '$790' },
    description: 'Dedicated support and resources for ventures ready for hyper-growth.',
    features: [
      'Everything in Founder, plus:',
      'Manage up to three ventures',
      'Priority access to new simulation modules',
      '1-on-1 simulated board meetings',
      'Dedicated support',
    ],
    featured: false,
    cta: 'Contact Sales'
  },
]

export default function Pricing() {
  return (
    <div className="bg-gray-900 text-white">
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
              <h2 className="text-base font-semibold leading-7 text-indigo-400">Pricing</h2>
              <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                The right price for you, <br className="hidden sm:inline lg:hidden" />
                whoever you are
              </p>
            </div>
            <div className="relative mt-6">
              <p className="mx-auto max-w-2xl text-lg leading-8 text-white/60">
                Our simulation is free to start. As you grow, our plans provide the tools you need to take your venture to the next level.
              </p>
            </div>
          </div>
          <div className="flow-root bg-gray-900 pb-24 sm:pb-32">
            <div className="-mt-80">
              <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto grid max-w-md grid-cols-1 gap-8 lg:max-w-4xl lg:grid-cols-2">
                  {tiers.map((tier) => (
                    <div
                      key={tier.id}
                      className={`flex flex-col justify-between rounded-3xl p-8 shadow-xl ring-1 ring-white/10 ${
                        tier.featured ? 'bg-white/5' : ''
                      }`}
                    >
                      <div>
                        <h3 id={tier.id} className="text-base font-semibold leading-7 text-indigo-400">
                          {tier.name}
                        </h3>
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
                        className={`mt-8 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
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
            <p className="text-center text-xs leading-5 text-gray-400">&copy; 2024 StartZig. All rights reserved.</p>
            </div>
        </footer>
    </div>
  )
}