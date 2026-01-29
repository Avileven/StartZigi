// home 270126
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
  className="mt-6 text-3xl font-bold leading-9 text-white animate-slideUp"
  style={{ animationDelay: "0.2s" }}
>
  A complete startup ecosystem for growing ideas backed by AI guidance and community wisdom.
</p>
         <div
            className="mt-10 flex items-center justify-center gap-x-6 animate-slideUp"
            style={{ animationDelay: "0.4s" }}
          >
            {/* כאן נמצא הקוד הקיים שלך של הכפתור הראשי - אל תיגע בו! */}
            {user ? (
              hasVenture ? (
                <Link href="/dashboard">...</Link>
              ) : (
                <Link href="/createventure">...</Link>
              )
            ) : (
              <Button onClick={handleLogin}>...</Button>
            )}

            {/* פשוט תדביק את הכפתור הזה כאן, מחוץ לסוגריים של ה-user */}
            <a href="/HOW-IT-WORKS.html" target="_blank">
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm shadow-lg"
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                See How It Works
              </Button>
            </a>
          </div>
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
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 hover:border-indigo-500 transition-colors">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white pt-1">Test Without Risk</h3>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  Validate your ideas in a realistic market simulation without risking your own capital. Make mistakes, pivot, and learn in a safe environment.
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 hover:border-indigo-500 transition-colors">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white pt-1">Learn from the Best</h3>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  Interact with AI-driven investors modeled after real-world personas. Understand what they look for and refine your pitch based on their feedback.
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 hover:border-indigo-500 transition-colors">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <BarChart3 className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white pt-1">Build Real Skills</h3>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  From business planning and MVP development to fundraising, you'll go through the startup lifecycle and gain practical, hands-on experience.
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 hover:border-indigo-500 transition-colors">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <DollarSign className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white pt-1">Secure Simulated Funding</h3>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  Prove your model, gain traction, and raise virtual capital from a network of angel and VC simulators to fuel growth.
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 hover:border-indigo-500 transition-colors">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white pt-1">Join a Thriving Community</h3>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  Connect with other founders. Share strategies, give feedback, and build your network in a collaborative ecosystem.
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 hover:border-indigo-500 transition-colors">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <Network className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white pt-1">Grow Your Network</h3>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  Practice networking and build relationships in a simulated environment, preparing you for real-world meetings.
                </p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-emerald-500 transition-colors">
              <div className="flex items-start gap-4 mb-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center shrink-0">
                  <Target className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white pt-1">Experience the Startup World</h3>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Build ventures just like in the real world. Experience the full startup lifecycle from ideation to exit. Learn what it takes to grow a company, manage burn rate, and reach that sweet exit moment.
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-purple-500 transition-colors">
              <div className="flex items-start gap-4 mb-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center shrink-0">
                  <Lightbulb className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white pt-1">Entrepreneurs with an Idea</h3>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Test, refine, and validate your concept before investing time and money. Experiment with different business models, pitch to AI investors, and pivot without real-world consequences. Expose your venture to the community, get feedback, and find potential early users.
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors">
              <div className="flex items-start gap-4 mb-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white pt-1">Students & Learners</h3>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Turn theory into practice. Experience how startups evolve through real stages—from MVP to scaling. Build your resume with hands-on entrepreneurial experience before graduation.
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-amber-500 transition-colors">
              <div className="flex items-start gap-4 mb-3">
                <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-white pt-1">Mentors, Instructors & Programs</h3>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                The perfect platform for accelerators, incubators, and academic programs. Give your students a safe environment to practice entrepreneurship with real feedback loops.
              </p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-purple-900/50 to-gray-800 border border-purple-500/30 rounded-xl p-6 hover:border-purple-400 transition-all cursor-pointer group">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl">📱</div>
                <h3 className="text-xl font-bold group-hover:text-purple-400 transition-colors">ShelfSense</h3>
              </div>
              <p className="text-sm text-gray-400 mb-4">Smart retail shelf intelligence platform</p>
              <div className="flex items-center gap-2 text-xs mb-4">
                <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded">Retail Tech</span>
                <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded">$2M Raised</span>
              </div>
              <Link href="/ShelfSense-demo.html" target="_blank">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-sm">
                  View Demo <ArrowRight className="w-3 h-3 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="bg-gradient-to-br from-emerald-900/50 to-gray-800 border border-emerald-500/30 rounded-xl p-6 hover:border-emerald-400 transition-all cursor-pointer group">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl">🚭</div>
                <h3 className="text-xl font-bold group-hover:text-emerald-400 transition-colors">Smokefree</h3>
              </div>
              <p className="text-sm text-gray-400 mb-4">Quit-smoking journey app</p>
              <div className="flex items-center gap-2 text-xs mb-4">
                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded">Health</span>
                <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded">$1.5M Raised</span>
              </div>
              <Link href="/smokefree-demo.html" target="_blank">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-sm">
                  View Demo <ArrowRight className="w-3 h-3 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="bg-gradient-to-br from-blue-900/50 to-gray-800 border border-blue-500/30 rounded-xl p-6 hover:border-blue-400 transition-all cursor-pointer group">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl">🏙️</div>
                <h3 className="text-xl font-bold group-hover:text-blue-400 transition-colors">UrbanPulse</h3>
              </div>
              <p className="text-sm text-gray-400 mb-4">City insights platform</p>
              <div className="flex items-center gap-2 text-xs mb-4">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded">Smart City</span>
                <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded">$5M Raised</span>
              </div>
              <Link href="/urbanpulse-demo.html" target="_blank">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm">
                  View Demo <ArrowRight className="w-3 h-3 ml-2" />
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

