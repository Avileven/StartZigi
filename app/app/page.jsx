"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { auth } from "@/lib/supabase";
import { FundingEvent } from "@/src/api/entities";
import { Textarea } from "@/components/ui/textarea";


import { 
  Rocket, 
  Target, 
  Lightbulb, 
  DollarSign, 
  ArrowRight,
  TrendingUp,
  Zap,
  ShieldCheck,
  Layers,
  BookOpen,
  Users,
  BarChart3,
  Network
} from "lucide-react";

export default function Home() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fundingFeed, setFundingFeed] = useState([]);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await auth.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      }
      setIsLoading(false);
    };

    const loadFeed = async () => {
        try {
            const events = await FundingEvent.list("-created_date", 5); 
            setFundingFeed(events || []);
        } catch (error) {
            console.error("Error loading funding feed:", error);
            setFundingFeed([]);
        }
    };
    
    checkUser();
    loadFeed();
  }, []);

  const handleLogin = async () => {
    auth.redirectToLogin();
  };

  const handleLogout = async () => {
    await auth.logout();
  };

  const formatMoney = (amount) => {
    if (!amount) return '$0';
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${Math.round(amount / 1000)}K`;
    return `$${amount}`;
  };

  return (
    <div className="bg-gray-900 text-white">
      <style>{`
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp {
            animation: slideUp 0.8s ease-out forwards;
        }
      `}</style>
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link href="/">
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">StartZig</span>
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#benefits" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Benefits</a>
                <Link href="/community" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Community</Link>
                <Link href="/pricing" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Pricing</Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6 space-x-4">
                 {user ? (
                    <>
                      <Link href="/dashboard">
                        <Button className="bg-indigo-600 hover:bg-indigo-700">
                          Go to Dashboard
                        </Button>
                      </Link>
                      <Button variant="ghost" onClick={handleLogout} className="text-white hover:bg-gray-700">
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" onClick={handleLogin} className="text-white hover:bg-gray-700">
                        Login
                      </Button>
                      <Button onClick={handleLogin} className="bg-indigo-600 hover:bg-indigo-700">
                        Sign Up
                      </Button>
                    </>
                  )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative isolate overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-800 min-h-screen flex items-center justify-center">
        <div className="relative text-center z-10 p-4">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl animate-slideUp">
              Don't just start up. <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">StartZig</span>.
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300 animate-slideUp" style={{ animationDelay: '0.2s' }}>
              The ultimate simulator to test your ideas, build your plan, and secure funding—risk-free.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6 animate-slideUp" style={{ animationDelay: '0.4s' }}>
              {user ? (
                 <Link href="/CreateVenture">
                  <Button size="lg" className="bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg">
                    Create Your Venture <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              ) : (
                 <Button onClick={handleLogin} size="lg" className="bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg">
                    Start Your Journey <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
              )}
            </div>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="bg-gray-800 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
            <div className="mx-auto flex max-w-xs flex-col gap-y-4">
              <dt className="text-base leading-7 text-gray-400">Total Ventures Launched</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">4,321</dd>
            </div>
            <div className="mx-auto flex max-w-xs flex-col gap-y-4">
              <dt className="text-base leading-7 text-gray-400">Total Simulated Company Value</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">$1.2B</dd>
            </div>
            <div className="mx-auto flex max-w-xs flex-col gap-y-4">
              <dt className="text-base leading-7 text-gray-400">Total Funding Raised</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">$500M+</dd>
            </div>
          </dl>
        </div>
      </div>

       {/* How It Works Section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-400">How It Works</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Everything you need to go from idea to IPO</p>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              StartZig guides you through a proven framework, helping you make smart decisions at every stage of your startup journey.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-white">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500">
                    <Lightbulb className="h-6 w-6 text-white" />
                  </div>
                  Develop Your Idea
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-300">Flesh out your concept, define your target market, and build a compelling landing page to validate your initial assumptions.</dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-white">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500">
                    <Layers className="h-6 w-6 text-white" />
                  </div>
                  Build Your Business Plan
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-300">Create a comprehensive business plan covering your mission, market analysis, revenue model, and team background.</dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-white">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  Create Your MVP
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-300">Develop and upload a Minimum Viable Product to test your core functionality with users and gather critical feedback.</dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-white">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  Secure Funding
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-300">Pitch to a network of simulated angel investors and venture capitalists to raise the capital you need to grow.</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div id="benefits" className="bg-gray-800/50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-400">Why StartZig?</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Your Entrepreneurial Flight Simulator</p>
            <p className="mt-6 text-lg leading-8 text-gray-300">
                Practice makes perfect. We provide the tools and environment to hone your skills before you take the real-world plunge.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-none">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex gap-x-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500">
                  <ShieldCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold leading-7 text-white">Test Without Risk</h3>
                  <p className="mt-2 text-base leading-7 text-gray-400">Validate your ideas in a realistic market simulation without risking your own capital. Make mistakes, pivot, and learn in a safe environment.</p>
                </div>
              </div>
              <div className="flex gap-x-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold leading-7 text-white">Learn from the Best</h3>
                  <p className="mt-2 text-base leading-7 text-gray-400">Interact with AI-driven investors modeled after real-world personas. Understand what they look for and refine your pitch based on their feedback.</p>
                </div>
              </div>
              <div className="flex gap-x-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold leading-7 text-white">Build Real Skills</h3>
                  <p className="mt-2 text-base leading-7 text-gray-400">From business planning and MVP development to fundraising, you'll go through the entire startup lifecycle, gaining practical, hands-on experience.</p>
                </div>
              </div>
              <div className="flex gap-x-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold leading-7 text-white">Secure Simulated Funding</h3>
                  <p className="mt-2 text-base leading-7 text-gray-400">Prove your model, gain traction, and raise virtual capital from a network of angel and VC simulators to fuel your growth.</p>
                </div>
              </div>
              <div className="flex gap-x-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold leading-7 text-white">Join a Thriving Community</h3>
                  <p className="mt-2 text-base leading-7 text-gray-400">Connect with other ambitious founders. Share strategies, give feedback, and build your network in a collaborative ecosystem.</p>
                </div>
              </div>
              <div className="flex gap-x-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500">
                  <Network className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold leading-7 text-white">Grow Your Network</h3>
                  <p className="mt-2 text-base leading-7 text-gray-400">Practice networking and build relationships in a simulated environment, preparing you for real-world investor and co-founder meetings.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Featured Ventures */}
            <div className="lg:col-span-2">
                <h2 className="text-3xl font-bold text-white mb-8">Featured Ventures</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-gray-800 text-white border-gray-700 shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                        <Rocket className="w-5 h-5 text-indigo-400" />
                        <span className="font-semibold">EcoHarvest</span>
                        </div>
                        <p className="text-gray-400 mb-4 text-sm">A sustainable tech company developing hydroponic systems for urban farming.</p>
                    </CardContent>
                    </Card>

                    <Card className="bg-gray-800 text-white border-gray-700 shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-5 h-5 text-indigo-400" />
                        <span className="font-semibold">Aura Health</span>
                        </div>
                        <p className="text-gray-400 mb-4 text-sm">A personalized wellness app using AI to create custom meditation and fitness plans.</p>
                    </CardContent>
                    </Card>
                </div>
            </div>

            {/* Live Funding Feed */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-8">Live Funding Feed</h2>
              <div className="flow-root">
                <ul role="list" className="-mb-8">
                  {fundingFeed.length === 0 ? (
                    <li className="text-center text-gray-400 py-8">
                      No funding events yet
                    </li>
                  ) : (
                    fundingFeed.map((event, eventIdx) => (
                      <li key={event.id || eventIdx}>
                        <div className="relative pb-8">
                          {eventIdx !== fundingFeed.length - 1 ? (
                            <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-600" aria-hidden="true" />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-gray-800/50">
                                <DollarSign className="h-5 w-5 text-white" aria-hidden="true" />
                              </span>
                            </div>
                            <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                              <div>
                                <p className="text-sm text-gray-300">
                                  {event.venture_landing_page_url ? (
                                    <Link href={event.venture_landing_page_url} className="font-medium text-white hover:underline">
                                      {event.venture_name || 'Unknown Venture'}
                                    </Link>
                                  ) : (
                                    <span className="font-medium text-white">{event.venture_name || 'Unknown Venture'}</span>
                                  )}
                                  {' '}secured a <span className="font-medium">{formatMoney(event.amount)}</span> {event.investment_type} round from {event.investor_name}.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 lg:px-8">
          <p className="text-center text-xs leading-5 text-gray-400">&copy; 2024 StartZig. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}