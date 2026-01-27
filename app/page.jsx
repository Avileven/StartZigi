// home 13126 - 1230 UPDATED FILE
"use client";
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
} from "lucide-react";
import AnimatedBg from "@/components/common/AnimatedBg";
export default function Home() {
  const [user, setUser] = useState(null);
  const [hasVenture, setHasVenture] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // [2026-01-13] FIX: removed fundingFeed state & loading logic (Live Funding Feed removed)
  // const [fundingFeed, setFundingFeed] = useState([]);
  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();
        setUser(currentUser);
        // בדיקה אם למשתמש יש venture
        if (currentUser) {
          const { data: ventures } = await supabase
            .from("ventures")
            .select("id")
            .eq("created_by", currentUser.email)
            .limit(1);
          setHasVenture(ventures && ventures.length > 0);
        }
      } catch (error) {
        setUser(null);
        setHasVenture(false);
      }
      setIsLoading(false);
    };
    // [2026-01-13] REMOVE: Live Funding Feed loader (feature removed)
    /*
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
    */
    checkUser();
    // loadFeed(); // [2026-01-13] REMOVE
  }, []);
  // [2026-01-02] FIX: אין לנו /api/auth/login (זה של NextAuth). אצלנו דף ההתחברות הוא /login
  const handleLogin = () => {
    const next = window.location.pathname + window.location.search;
    window.location.href = `/login?next=${encodeURIComponent(next)}`;
  };
  const handleLogout = async () => {
    // [2026-01-02] FIX: Logout של Supabase ואז הפניה נקייה לדף הבית (לא reload שמחזיר ללופים)
    await supabase.auth.signOut();
    window.location.href = "/";
  };
  // [2026-01-13] REMOVE: formatMoney helper (Live Funding Feed removed)
  /*
  const formatMoney = (amount) => {
    if (!amount) return '$0';
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${Math.round(amount / 1000)}K`;
    return `$${amount}`;
  };
  */
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
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent cursor-pointer">
                    StartZig
                  </span>
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a
                  href="#benefits"
                  className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Benefits
                </a>
                <Link
                  href="/community"
                  className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Community
                </Link>
                <Link
                  href="/pricing"
                  className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Pricing
                </Link>
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
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="text-white hover:bg-gray-700"
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      onClick={handleLogin}
                      className="text-white hover:bg-gray-700"
                    >
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
      {/* Hero Section (Slogan unchanged) */}
      <div className="relative isolate overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-800 min-h-screen flex items-center justify-center">
        <AnimatedBg />
        <div className="relative text-center z-10 p-4">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl animate-slideUp">
            Don't just start up.{" "}
            <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              StartZig
            </span>
            .
          </h1>
          <p
            className="mt-6 text-lg leading-8 text-gray-300 animate-slideUp"
            style={{ animationDelay: "0.2s" }}
          >
            The ultimate simulator to test your ideas, build your plan, and
            secure funding—risk-free.
          </p>
          <div
            className="mt-10 flex items-center justify-center gap-x-6 animate-slideUp"
            style={{ animationDelay: "0.4s" }}
          >
            {user ? (
              hasVenture ? (
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg"
                  >
                    Go to dashboard <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              ) : (
                <Link href="/createventure">
                  <Button
                    size="lg"
                    className="bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg"
                  >
                    Create Your Venture <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )
            ) : (
              <Button
                onClick={handleLogin}
                size="lg"
                className="bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg"
              >
                Start Your Journey <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
      {/* [2026-01-13] REMOVE: Stats Section (Total Ventures Launched / Value / Funding Raised) */}
      {/*
      <div className="bg-gray-800 py-12 sm:py-16">
        ...
      </div>
      */}
      {/* [2026-01-13] MOVE: Benefits FIRST after slogan */}
      <div id="benefits" className="bg-gray-800/50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-400">
              Why StartZig?
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Your Entrepreneurial Flight Simulator
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Practice makes perfect. We provide the tools and environment to
              hone your skills before you take the real-world plunge.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-none">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Card 1 */}
              <div className="group relative bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-8 hover:scale-105 transition-transform duration-300 cursor-pointer overflow-hidden">
                <div className="absolute top-0 right-0 text-9xl font-bold text-white/10">01</div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <ShieldCheck className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Test Without Risk</h3>
                  <p className="text-white/90 mb-4">
                    Validate your ideas in a realistic market simulation without risking your own capital. Make mistakes, pivot, and learn in a safe environment.
                  </p>
                  <div className="text-sm font-semibold text-white/70">90% Success Rate</div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="group relative bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-8 hover:scale-105 transition-transform duration-300 cursor-pointer overflow-hidden">
                <div className="absolute top-0 right-0 text-9xl font-bold text-white/10">02</div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Learn from the Best</h3>
                  <p className="text-white/90 mb-4">
                    Interact with AI-driven investors modeled after real-world personas. Understand what they look for and refine your pitch based on their feedback.
                  </p>
                  <div className="text-sm font-semibold text-white/70">500+ Founders Trained</div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="group relative bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-8 hover:scale-105 transition-transform duration-300 cursor-pointer overflow-hidden">
                <div className="absolute top-0 right-0 text-9xl font-bold text-white/10">03</div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Build Real Skills</h3>
                  <p className="text-white/90 mb-4">
                    From business planning and MVP development to fundraising, you'll go through the startup lifecycle and gain practical, hands-on experience.
                  </p>
                  <div className="text-sm font-semibold text-white/70">6 Core Skills</div>
                </div>
              </div>

              {/* Card 4 */}
              <div className="group relative bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-8 hover:scale-105 transition-transform duration-300 cursor-pointer overflow-hidden">
                <div className="absolute top-0 right-0 text-9xl font-bold text-white/10">04</div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Secure Simulated Funding</h3>
                  <p className="text-white/90 mb-4">
                    Prove your model, gain traction, and raise virtual capital from a network of angel and VC simulators to fuel growth.
                  </p>
                  <div className="text-sm font-semibold text-white/70">Virtual Investment</div>
                </div>
              </div>

              {/* Card 5 */}
              <div className="group relative bg-gradient-to-br from-pink-600 to-purple-600 rounded-2xl p-8 hover:scale-105 transition-transform duration-300 cursor-pointer overflow-hidden">
                <div className="absolute top-0 right-0 text-9xl font-bold text-white/10">05</div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Join a Thriving Community</h3>
                  <p className="text-white/90 mb-4">
                    Connect with other founders. Share strategies, give feedback, and build your network in a collaborative ecosystem.
                  </p>
                  <div className="text-sm font-semibold text-white/70">Active Community</div>
                </div>
              </div>

              {/* Card 6 */}
              <div className="group relative bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl p-8 hover:scale-105 transition-transform duration-300 cursor-pointer overflow-hidden">
                <div className="absolute top-0 right-0 text-9xl font-bold text-white/10">06</div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <Network className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Grow Your Network</h3>
                  <p className="text-white/90 mb-4">
                    Practice networking and build relationships in a simulated environment, preparing you for real-world meetings.
                  </p>
                  <div className="text-sm font-semibold text-white/70">Network Building</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      {/* [2026-01-13] ADD/UPDATE: "Who can benefit" section (no "For", light-blue background, extra lines requested) */}
      <div className="bg-gradient-to-b from-indigo-900/40 to-gray-900 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Who can benefit from StartZig?
            </h2>
            <p className="mt-3 text-lg text-gray-200/90">
              StartZig is built for learning, testing, and momentum—whether you're exploring, building, or teaching.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 border border-emerald-500/30 rounded-2xl p-8 hover:border-emerald-400 transition-all group">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-3xl font-bold shrink-0 group-hover:scale-110 transition-transform">
                  🎯
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">Experience the Startup World</h3>
                  <p className="text-gray-200/90 leading-relaxed">
                    Build ventures just like in the real world. <span className="text-emerald-300 font-semibold">Reach that sweet exit.</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-500/30 rounded-2xl p-8 hover:border-purple-400 transition-all group">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-3xl font-bold shrink-0 group-hover:scale-110 transition-transform">
                  💡
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">Entrepreneurs with an Idea</h3>
                  <p className="text-gray-200/90 leading-relaxed">
                    StartZig helps you test, refine, and validate your concept before you invest time and money.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-500/30 rounded-2xl p-8 hover:border-blue-400 transition-all group">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-3xl font-bold shrink-0 group-hover:scale-110 transition-transform">
                  🎓
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">Students & Learners</h3>
                  <p className="text-gray-200/90 leading-relaxed">
                    StartZig turns theory into real practice. <span className="text-blue-300 font-semibold">Experience how startups evolve through real stages.</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-900/40 to-amber-800/20 border border-amber-500/30 rounded-2xl p-8 hover:border-amber-400 transition-all group">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-3xl font-bold shrink-0 group-hover:scale-110 transition-transform">
                  👨‍🏫
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">Mentors, Instructors & Programs</h3>
                  <p className="text-gray-200/90 leading-relaxed">
                    The perfect platform for accelerators, incubators, and academic programs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      {/* [2026-01-13] REMOVE: How It Works Section (entire section deleted) */}
      {/*
      <div className="py-24 sm:py-32">
        ...
      </div>
      */}
      {/* [2026-01-13] UPDATE: Featured Ventures FULL WIDTH, 3 stacked, links to /public HTML demos with .html */}
      <div className="bg-gray-800/50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-10 text-center lg:text-left">
            Featured Venture Demos
          </h2>
          <div className="space-y-6">
            {/* Demo 1 */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-purple-500 transition-all flex flex-col md:flex-row gap-6 items-center group">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center text-5xl shrink-0 group-hover:scale-105 transition-transform">
                <Rocket className="w-16 h-16 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold">ShelfSense</span>
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs font-semibold rounded">Retail Tech</span>
                </div>
                <p className="text-gray-400 mb-3">
                  Smart retail shelf intelligence that helps stores prevent out-of-stocks and optimize product placement.
                  Includes a sample MVP page with onboarding + value proposition + feedback section.
                </p>
                <div className="flex items-center gap-6 text-sm text-gray-400">
                  <span>👥 50 Testers</span>
                  <span>💰 $2M Raised</span>
                  <span>📈 Growing Fast</span>
                </div>
              </div>
              <Link href="/ShelfSense-demo.html" target="_blank">
                <Button className="bg-purple-600 hover:bg-purple-700 w-full md:w-auto shrink-0">
                  Open Demo <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Demo 2 */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-emerald-500 transition-all flex flex-col md:flex-row gap-6 items-center group">
              <div className="w-32 h-32 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center text-5xl shrink-0 group-hover:scale-105 transition-transform">
                <Lightbulb className="w-16 h-16 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold">Smokefree</span>
                  <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded">Health</span>
                </div>
                <p className="text-gray-400 mb-3">
                  A structured quit-smoking journey built around micro-habits, daily wins, and social reinforcement.
                  See the MVP demo page and example feedback loops.
                </p>
                <div className="flex items-center gap-6 text-sm text-gray-400">
                  <span>👥 120 Users</span>
                  <span>💰 $1.5M Raised</span>
                  <span>🎯 Proven Model</span>
                </div>
              </div>
              <Link href="/Smokefree-demo.html" target="_blank">
                <Button className="bg-emerald-600 hover:bg-emerald-700 w-full md:w-auto shrink-0">
                  Open Demo <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Demo 3 */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-blue-500 transition-all flex flex-col md:flex-row gap-6 items-center group">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center text-5xl shrink-0 group-hover:scale-105 transition-transform">
                <Target className="w-16 h-16 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold">UrbanPulse</span>
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded">Smart City</span>
                </div>
                <p className="text-gray-400 mb-3">
                  A city insights platform that turns local signals into actionable opportunities for communities and small businesses.
                  Demo includes positioning + MVP preview + feedback CTA.
                </p>
                <div className="flex items-center gap-6 text-sm text-gray-400">
                  <span>👥 300+ Businesses</span>
                  <span>💰 $5M Raised</span>
                  <span>🚀 Scaling</span>
                </div>
              </div>
              <Link href="/urbanpulse-demo.html" target="_blank">
                <Button className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto shrink-0">
                  Open Demo <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="mt-12 text-center">
            <Link href="/register">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                Start Building Yours <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
      </div>
      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 lg:px-8">
          <p className="text-center text-xs leading-5 text-gray-400">
            &copy; 2026 StartZig. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
