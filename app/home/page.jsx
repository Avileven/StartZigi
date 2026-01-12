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
  Gamepad2,
  GraduationCap,
  Briefcase
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
        <div className="max-w-77xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <a href="#journey" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">The Journey</a>
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
              Experience the startup journey. [cite_start]Build, test, and grow ventures in a structured, engaging environment—whether for real validation or simulation. [cite: 223, 224]
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
                      Start Your Venture <ArrowRight className="w-4 h-4 ml-2" />
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

      {/* Intro Section - Who is it for? */}
      <div id="journey" className="py-24 bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-y-12 lg:grid-cols-3 lg:gap-x-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6">
                <Gamepad2 className="h-10 w-10 text-purple-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Simulation Enthusiasts</h3>
                <p className="text-gray-400">Experience the thrill of building. [cite_start]Make strategic decisions, attract virtual investors, and reach a virtual exit—no risk, no money. [cite: 231, 232]</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6">
                <Rocket className="h-10 w-10 text-indigo-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Entrepreneurs</h3>
                <p className="text-gray-400">Pressure-test your concept before going all-in. [cite_start]Learn to think like an investor and improve your pitch in a safe environment. [cite: 238, 242]</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6">
                <GraduationCap className="h-10 w-10 text-emerald-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Students & Mentors</h3>
                <p className="text-gray-400">A startup laboratory for academic programs. [cite_start]Track decision-making and guide founders through structured stages. [cite: 255, 262]</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* How It Works Section - The Journey */}
      <div className="py-24 sm:py-32 bg-gray-800/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-400">The Journey</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">From Idea to Exit</p>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              [cite_start]Every venture on StartZig progresses through structured stages, turning theory into hands-on practice. [cite: 251, 271]
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-white">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500">
                    <Lightbulb className="h-6 w-6 text-white" />
                  </div>
                  Idea & MVP
                </dt>
                [cite_start]<dd className="mt-2 text-base leading-7 text-gray-300">Evaluate your idea and receive meaningful feedback before spending time or money. [cite: 240, 272]</dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-white">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  Beta & Growth
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-300">Experiment, pivot, and improve. [cite_start]Attract early supporters and sharpen your startup skills. [cite: 224, 247]</dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-white">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  Simulated Investment
                </dt>
                [cite_start]<dd className="mt-2 text-base leading-7 text-gray-300">Experience investor interactions and practice pitching to secure virtual capital. [cite: 231, 261]</dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-white">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  Virtual Exit
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-300">The ultimate goal. [cite_start]See how your strategic decisions lead to a successful simulated acquisition. [cite: 231]</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Example Ventures Section */}
      <div className="bg-gray-800/50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
                <h2 className="text-3xl font-bold text-white mb-4">Example Virtual Ventures</h2>
                [cite_start]<p className="text-gray-400 mb-8">See what others are building in the laboratory. [cite: 255, 265]</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-gray-800 text-white border-gray-700 shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-5 h-5 text-indigo-400" />
                        <span className="font-semibold">QuitFlow</span>
                        </div>
                        [cite_start]<p className="text-gray-400 text-sm">A behavioral AI app for smoking cessation. [cite: 266]</p>
                    </CardContent>
                    </Card>

                    <Card className="bg-gray-800 text-white border-gray-700 shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                        <BarChart3 className="w-5 h-5 text-indigo-400" />
                        <span className="font-semibold">EcoWaste AI</span>
                        </div>
                        [cite_start]<p className="text-gray-400 text-sm">Smart waste management solutions for modern cities. [cite: 267]</p>
                    </CardContent>
                    </Card>
                </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-white mb-8">Funding Feed</h2>
              <div className="flow-root">
                <ul role="list" className="-mb-8">
                  {fundingFeed.map((event, eventIdx) => (
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
                  ))}
                </ul>
              </div>
            </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 lg:px-8">
          <p className="text-center text-xs leading-5 text-gray-400">
            &copy; 2024 StartZig. [cite_start]Experiment, learn, and compete in the startup world. [cite: 279]
          </p>
        </div>
      </footer>
    </div>
  );
}