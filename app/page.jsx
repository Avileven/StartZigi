
// home 11126
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
  Network
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
        
        // בדיקה אם למשתמש יש venture
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
          .from('funding_events') // שם הטבלה ב-Supabase עבור אירועי מימון
          .select('*')
          .order('created_date', { ascending: false }) // מיון לפי תאריך יצירה יורד
          .limit(5); // הגבל ל-5 אירועים אחרונים
        
        if (error) {
          console.error("Error fetching funding events:", error);
          setFundingFeed([]); // במקרה של שגיאה, נגדיר מערך ריק
        } else {
          setFundingFeed(events || []);
        }
      } catch (error) {
        console.error("Error loading funding feed:", error);
        setFundingFeed([]); // במקרה של שגיאה, נגדיר מערך ריק
      }
    };
    
    checkUser();
    loadFeed();
  }, []);

  
// [2026-01-02] FIX: אין לנו /api/auth/login (זה של NextAuth). אצלנו דף ההתחברות הוא /login
const handleLogin = () => {
  // אופציונלי: תחזיר את המשתמש לעמוד שהוא היה בו אחרי login
  const next = window.location.pathname + window.location.search;
  window.location.href = `/login?next=${encodeURIComponent(next)}`;
};

const handleLogout = async () => {
  // [2026-01-02] FIX: Logout של Supabase ואז הפניה נקייה לדף הבית (לא reload שמחזיר ללופים)
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
        <div className="relative text-center z-10 p-4">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl animate-slideUp">
              Don't just start up. <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">StartZig</span>.
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300 animate-slideUp" style={{ animationDelay: '0.2s' }}>
              Ever read about a massive tech exit and thought: “I want to try that too”?  
              StartZig lets you experience the full startup journey — from idea to funding — in a powerful simulation environment.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6 animate-slideUp" style={{ animationDelay: '0.4s' }}>
              {user ? (
                hasVenture ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg">
                      Go to dashboard <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/createventure">
                    <Button size="lg" className="bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg">
                      Create Your Venture <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                )
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
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Everything you need to go from idea to exit</p>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              StartZig guides you step by step: validate ideas, build business plans, launch MVPs, attract investors, and grow — all inside a realistic entrepreneurial simulation.
            </p>
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
              Whether you're here to play, learn, or prepare for the real world — StartZig gives you a professional environment to experiment, sharpen your skills, and build smarter ventures.
            </p>
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

