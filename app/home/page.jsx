// גרסה נסיונית
"use client";
export const dynamic = 'force-dynamic';
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { 
  Rocket, 
  Target, 
  Lightbulb, 
  DollarSign, 
  ArrowRight,
  TrendingUp,
  Check,
  Zap,
  ShieldCheck,
  Layers,
  BookOpen,
  Users,
  BarChart3,
  Network,
  Gamepad2,
  GraduationCap,
  FlaskConical,
  CheckCircle2
} from "lucide-react";
import AnimatedBg from "@/components/common/AnimatedBg";

export default function Home() {
  const [user, setUser] = useState(null);
  const [hasVenture, setHasVenture] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fundingFeed, setFundingFeed] = useState([]);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);
        
        if (currentUser) {
          const { data: ventures } = await supabase
            .from('ventures')
            .select('id')
            .eq('created_by', currentUser.email)
            .limit(1);
          
          setHasVenture(ventures && ventures.length > 0);
        }
      } catch (error) {
        setUser(null);
        setHasVenture(false);
      }
      setIsLoading(false);
    };

    const loadFeed = async () => {
    try {
        const { data: events, error } = await supabase
          .from('funding_events')
          .select('*')
          .order('created_date', { ascending: false })
          .limit(5);
        
        if (error) {
            console.error("Error fetching funding events:", error);
            setFundingFeed([]);
        } else {
            setFundingFeed(events || []);
        }
    } catch (error) {
        console.error("Error loading funding feed:", error);
        setFundingFeed([]);
    }
};
    
    checkUser();
    loadFeed();
  }, []);

const handleLogin = () => {
  const next = window.location.pathname + window.location.search;
  window.location.href = `/login?next=${encodeURIComponent(next)}`;
};

const handleLogout = async () => {
  await supabase.auth.signOut();
  window.location.href = "/";
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
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent cursor-pointer">StartZig</span>
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
                          Go to dashboard
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
                      <Link href="/register">
                      <Button className="bg-indigo-600 hover:bg-indigo-700">
                      Sign Up
                      </Button>
                      </Link>
                    </>
                  )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative isolate overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-800 min-h-screen flex items-center justify-center">
        <AnimatedBg />
        <div className="relative text-center z-10 p-4 max-w-4xl">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl animate-slideUp">
              Don't just start up. <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">StartZig</span>.
            </h1>
            <p className="mt-6 text-xl leading-8 text-gray-200 animate-slideUp" style={{ animationDelay: '0.2s' }}>
              The interactive platform where ideas become ventures, and ventures become experiences.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6 animate-slideUp" style={{ animationDelay: '0.4s' }}>
              {user ? (
                hasVenture ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg px-8 py-6 text-lg">
                      Go to dashboard <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/createventure">
                    <Button size="lg" className="bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg px-8 py-6 text-lg">
                      Create Your Venture <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                )
              ) : (
                 <Button onClick={handleLogin} size="lg" className="bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg px-8 py-6 text-lg">
                    Start Your Journey <ArrowRight className="w-5 h-5 ml-2" />
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

      {/* Target Audiences Section (from document) */}
      <div className="py-24 bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* For Simulation Enthusiasts */}
            <div className="bg-gray-800/40 p-8 rounded-2xl border border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <Gamepad2 className="text-indigo-400 h-8 w-8" />
                <h3 className="text-2xl font-bold">For Simulation Enthusiasts</h3>
              </div>
              <p className="text-gray-300 mb-6 italic">"Ever read about a massive tech exit and thought: 'Could I do that too?' Now you can."</p>
              <ul className="space-y-4 text-gray-400">
                <li className="flex gap-2"><CheckCircle2 className="text-indigo-500 shrink-0" /> Build ventures and make strategic decisions</li>
                <li className="flex gap-2"><CheckCircle2 className="text-indigo-500 shrink-0" /> Advance through stages and attract virtual investors</li>
                <li className="flex gap-2"><CheckCircle2 className="text-indigo-500 shrink-0" /> Reach a virtual exit – No risk. No money. Just strategy.</li>
              </ul>
            </div>

            {/* For Entrepreneurs */}
            <div className="bg-gray-800/40 p-8 rounded-2xl border border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <Rocket className="text-purple-400 h-8 w-8" />
                <h3 className="text-2xl font-bold">For Entrepreneurs</h3>
              </div>
              <p className="text-gray-300 mb-6">Have a business idea but not sure if it’s worth the time and investment? StartZig helps you validate and pressure-test your concept.</p>
              <ul className="space-y-4 text-gray-400">
                <li className="flex gap-2"><CheckCircle2 className="text-purple-500 shrink-0" /> <b>Test Before You Invest:</b> Receive meaningful feedback before spending money</li>
                <li className="flex gap-2"><CheckCircle2 className="text-purple-500 shrink-0" /> <b>Develop as an Entrepreneur:</b> Learn to think like an investor and build models</li>
                <li className="flex gap-2"><CheckCircle2 className="text-purple-500 shrink-0" /> <b>Gain Smart Exposure:</b> Present to a community and attract supporters</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Academic & Mentors (from document) */}
      <div className="py-24 bg-gray-800/20 border-y border-gray-800">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-base font-semibold text-indigo-400">Education & Mentorship</h2>
              <p className="mt-2 text-3xl font-bold text-white sm:text-4xl italic">"Not a textbook – a startup laboratory."</p>
              <p className="mt-6 text-lg text-gray-300">
                Studying entrepreneurship, management, or innovation? StartZig turns theory into hands-on practice for students and provides a robust evaluation platform for instructors.
              </p>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-800 p-4 rounded-lg flex items-center gap-3">
                  <GraduationCap className="text-indigo-400" /> <span>Hands-on Practice</span>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg flex items-center gap-3">
                  <FlaskConical className="text-indigo-400" /> <span>Startup Laboratory</span>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg flex items-center gap-3">
                  <Users className="text-indigo-400" /> <span>Targeted Feedback</span>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg flex items-center gap-3">
                  <BarChart3 className="text-indigo-400" /> <span>Track Decision-making</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-8 rounded-3xl border border-indigo-500/20">
              <h3 className="text-xl font-bold mb-4">The Venture Journey Stages</h3>
              <div className="space-y-4">
                {[
                  { s: "Idea", d: "Conceptualize your business" },
                  { s: "MVP", d: "Minimum Viable Product" },
                  { s: "MLP", d: "Minimum Lovable Product" },
                  { s: "Beta", d: "Testing with early adopters" },
                  { s: "Growth", d: "Scaling and investment" },
                  { s: "Exit", d: "Strategic acquisition" }
                ].map((step, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                    <div>
                      <span className="font-bold text-white">{step.s}</span>
                      <span className="text-gray-400 ml-2">— {step.d}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Ventures (from document examples) */}
      <div id="benefits" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center mb-16">
            <h2 className="text-base font-semibold leading-7 text-indigo-400">Explore the Community</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Example Virtual Ventures</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <Card className="bg-gray-800 text-white border-gray-700 shadow-lg">
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-indigo-400" />
                    <span className="font-semibold">QuitFlow</span>
                    </div>
                    <p className="text-gray-400 text-sm">A behavioral AI app for smoking cessation.</p>
                </CardContent>
            </Card>
            <Card className="bg-gray-800 text-white border-gray-700 shadow-lg">
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                    <Layers className="w-5 h-5 text-purple-400" />
                    <span className="font-semibold">EcoWaste AI</span>
                    </div>
                    <p className="text-gray-400 text-sm">Smart waste management for cities.</p>
                </CardContent>
            </Card>
            <Card className="bg-gray-800 text-white border-gray-700 shadow-lg">
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                    <Target className="w-5 h-5 text-green-400" />
                    <span className="font-semibold">Gezunt</span>
                    </div>
                    <p className="text-gray-400 text-sm">A digital wellness and healthy lifestyle brand.</p>
                </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Funding Feed Section */}
      <div className="bg-gray-800/50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-bold text-white mb-8">What StartZig Gives You</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex gap-3 text-gray-300"><Check className="text-indigo-500" /> A structured entrepreneurial journey</div>
                <div className="flex gap-3 text-gray-300"><Check className="text-indigo-500" /> Simulation of growth and investment</div>
                <div className="flex gap-3 text-gray-300"><Check className="text-indigo-500" /> Exposure to founders and investors</div>
                <div className="flex gap-3 text-gray-300"><Check className="text-indigo-500" /> Continuous feedback and evaluation</div>
                <div className="flex gap-3 text-gray-300"><Check className="text-indigo-500" /> Space to experiment, learn, and compete</div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-white mb-8">Live Funding Feed</h2>
              <div className="flow-root">
                <ul role="list" className="-mb-8">
                  {fundingFeed.length > 0 ? fundingFeed.map((event, eventIdx) => (
                    <li key={event.id}>
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
                                <span className="font-medium text-white">{event.venture_name}</span> secured <span className="font-medium">{formatMoney(event.amount)}</span> from {event.investor_name}.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  )) : (
                    <p className="text-gray-500 text-sm">No recent funding activity.</p>
                  )}
                </ul>
              </div>
            </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 lg:px-8 text-center">
          <p className="text-base leading-5 text-gray-400 mb-4">StartZig gives you the startup experience. Want to play, learn, or build something real?</p>
          <p className="text-xs leading-5 text-gray-500">&copy; 2024 StartZig. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}