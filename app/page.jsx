// v 020226 with glass design - Blue hero with AnimatedBg
"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Target,
  Lightbulb,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Users,
  BarChart3,
  Network,
  PlayCircle,
} from "lucide-react";
import AnimatedBg from "@/components/common/AnimatedBg";

export default function Home() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasVenture, setHasVenture] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();
        setUser(currentUser);

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

    checkUser();
  }, []);

  const handleLogin = () => {
    const next = window.location.pathname + window.location.search;
    window.location.href = `/login?next=${encodeURIComponent(next)}`;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 via-blue-950 to-indigo-950 text-white">
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
<nav className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-md z-50 border-b border-white/10">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-20">
      
      {/* לוגו - צד שמאל */}
      <div className="flex-shrink-0">
        <Link href="/">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent cursor-pointer">
            StartZig
          </span>
        </Link>
      </div>

      {/* כפתור המבורגר לנייד - מופיע רק ב-sm/xs */}
      <div className="md:hidden flex items-center">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-gray-300 hover:text-white p-2"
        >
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* קבוצת כפתורים וניווט - למחשב בלבד (md:flex) */}
      <div className="hidden md:flex items-center space-x-8">
        <div className="flex items-center space-x-4 border-r border-white/10 pr-4">
          <Link href="/why-startzig" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
            Why StartZig
          </Link>
          <Link href="/community" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
            Community
          </Link>
          <Link href="/pricing" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
            Pricing
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link href="/dashboard">
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Go to dashboard
                </button>
              </Link>
              <button onClick={handleLogout} className="text-white hover:bg-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={handleLogin} className="text-white hover:bg-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Login
              </button>
              <Link href="/register">
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  </div>

  {/* תפריט נייד נפתח - מוצג רק כשיש לחיצה ורק במובייל */}
  {isMenuOpen && (
    <div className="md:hidden bg-gray-900 border-b border-white/10 px-4 pt-2 pb-6 space-y-2">
      <Link href="/why-startzig" onClick={() => setIsMenuOpen(false)} className="block text-gray-300 hover:text-white px-3 py-3 rounded-md text-base font-medium">
        Why StartZig
      </Link>
      <Link href="/community" onClick={() => setIsMenuOpen(false)} className="block text-gray-300 hover:text-white px-3 py-3 rounded-md text-base font-medium">
        Community
      </Link>
      <Link href="/pricing" onClick={() => setIsMenuOpen(false)} className="block text-gray-300 hover:text-white px-3 py-3 rounded-md text-base font-medium">
        Pricing
      </Link>
      <div className="pt-4 border-t border-white/10 flex flex-col space-y-3">
        {user ? (
          <>
            <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="w-full">
              <button className="w-full bg-indigo-600 text-white py-3 rounded-md font-medium">Go to dashboard</button>
            </Link>
            <button onClick={handleLogout} className="w-full text-white bg-gray-700 hover:bg-gray-600 py-3 rounded-md font-medium">Logout</button>
          </>
        ) : (
          <>
            <button onClick={handleLogin} className="w-full text-white bg-gray-700 hover:bg-gray-600 py-3 rounded-md font-medium">Login</button>
            <Link href="/register" onClick={() => setIsMenuOpen(false)} className="w-full">
              <button className="w-full bg-indigo-600 text-white py-3 rounded-md font-medium">Sign Up</button>
            </Link>
          </>
        )}
      </div>
    </div>
  )}
</nav>

      {/* Hero Section - BLUE BACKGROUND WITH ANIMATEDBG */}
      <div className="relative isolate overflow-hidden min-h-screen flex items-center justify-center pt-20">
        {/* Blue Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-700 to-indigo-800"></div>
        
        <AnimatedBg />
        
        {/* Glass Container */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 mt-8">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-12 shadow-2xl">
            <div className="text-center">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 animate-slideUp">
                Don't just start up.{" "}
                <span className="bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
                  StartZig
                </span>
                .
              </h1>
              <p
                className="text-xl md:text-2xl leading-relaxed text-white/90 animate-slideUp max-w-3xl mx-auto mb-10"
                style={{ animationDelay: "0.2s" }}
              >
                A complete startup ecosystem for growing ideas, backed by AI guidance and community wisdom.
              </p>
              <div
                className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slideUp"
                style={{ animationDelay: "0.4s" }}
              >
                {user ? (
                  hasVenture ? (
                    <Link href="/dashboard">
                      <Button
                        size="lg"
                        className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/30 shadow-lg transition-all"
                      >
                        Go to dashboard <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/createventure">
                      <Button
                        size="lg"
                        className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/30 shadow-lg transition-all"
                      >
                        Create Your Venture <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  )
                ) : (
                  <Button
                    onClick={handleLogin}
                    size="lg"
                    className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/30 shadow-lg transition-all"
                  >
                    Start Your Journey <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
                
                <a href="/how-it-works.html" target="_blank">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm shadow-lg transition-all"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    See How It Works
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section - GLASS STYLE */}
      <div id="benefits" className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 to-indigo-900/40"></div>
        <div className="absolute inset-0 backdrop-blur-sm"></div>
        
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-300">
              Why StartZig?
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Your Entrepreneurial Flight Simulator
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-200">
              Practice makes perfect. We provide the tools and environment to
              hone your skills before you take the real-world plunge.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-none">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all hover:scale-105 duration-300 shadow-xl">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0 border border-blue-400/30">
                    <ShieldCheck className="w-6 h-6 text-blue-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white pt-2">Test Without Risk</h3>
                </div>
                <p className="text-gray-200 leading-relaxed">
                  Validate your ideas in a realistic market simulation without risking your own capital. Make mistakes, pivot, and learn in a safe environment.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all hover:scale-105 duration-300 shadow-xl">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-indigo-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0 border border-indigo-400/30">
                    <BookOpen className="w-6 h-6 text-indigo-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white pt-2">Learn from the Best</h3>
                </div>
                <p className="text-gray-200 leading-relaxed">
                  Interact with AI-driven investors modeled after real-world personas. Understand what they look for and refine your pitch based on their feedback.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all hover:scale-105 duration-300 shadow-xl">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0 border border-purple-400/30">
                    <BarChart3 className="w-6 h-6 text-purple-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white pt-2">Build Real Skills</h3>
                </div>
                <p className="text-gray-200 leading-relaxed">
                  From business planning and MVP development to fundraising, you'll go through the startup lifecycle and gain practical, hands-on experience.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all hover:scale-105 duration-300 shadow-xl">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-pink-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0 border border-pink-400/30">
                    <DollarSign className="w-6 h-6 text-pink-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white pt-2">Secure Simulated Funding</h3>
                </div>
                <p className="text-gray-200 leading-relaxed">
                  Prove your model, gain traction, and raise virtual capital from a network of angel and VC simulators to fuel growth.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all hover:scale-105 duration-300 shadow-xl">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-emerald-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0 border border-emerald-400/30">
                    <Users className="w-6 h-6 text-emerald-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white pt-2">Join a Thriving Community</h3>
                </div>
                <p className="text-gray-200 leading-relaxed">
                  Connect with other founders. Share strategies, give feedback, and build your network in a collaborative ecosystem.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all hover:scale-105 duration-300 shadow-xl">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-cyan-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0 border border-cyan-400/30">
                    <Network className="w-6 h-6 text-cyan-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white pt-2">Grow Your Network</h3>
                </div>
                <p className="text-gray-200 leading-relaxed">
                  Practice networking and build relationships in a simulated environment, preparing you for real-world meetings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Who can benefit Section - GLASS STYLE */}
      <div className="relative py-20 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/40 to-blue-900/40"></div>
        <div className="absolute inset-0 backdrop-blur-sm"></div>
        
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Who can benefit from StartZig?
            </h2>
            <p className="mt-3 text-lg text-gray-200/90">
              StartZig is built for learning, testing, and momentum—whether you're exploring, building, or teaching.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 hover:border-emerald-400/50 transition-all hover:scale-105 duration-300 shadow-xl">
              <div className="flex items-start gap-4 mb-3">
                <div className="w-12 h-12 bg-emerald-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0 border border-emerald-400/30">
                  <Target className="w-6 h-6 text-emerald-300" />
                </div>
                <h3 className="text-lg font-bold text-white pt-1">Experience the Startup World</h3>
              </div>
              <p className="text-sm text-gray-200 leading-relaxed">
                Build ventures just like in the real world. Experience the full startup lifecycle from ideation to exit. Learn what it takes to grow a company, manage burn rate, and reach that sweet exit moment.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 hover:border-purple-400/50 transition-all hover:scale-105 duration-300 shadow-xl">
              <div className="flex items-start gap-4 mb-3">
                <div className="w-12 h-12 bg-purple-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0 border border-purple-400/30">
                  <Lightbulb className="w-6 h-6 text-purple-300" />
                </div>
                <h3 className="text-lg font-bold text-white pt-1">Entrepreneurs with an Idea</h3>
              </div>
              <p className="text-sm text-gray-200 leading-relaxed">
                Test, refine, and validate your concept before investing time and money. Experiment with different business models, pitch to AI investors, and pivot without real-world consequences. Expose your venture to the community, get feedback, and find potential early users.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 hover:border-blue-400/50 transition-all hover:scale-105 duration-300 shadow-xl">
              <div className="flex items-start gap-4 mb-3">
                <div className="w-12 h-12 bg-blue-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0 border border-blue-400/30">
                  <BookOpen className="w-6 h-6 text-blue-300" />
                </div>
                <h3 className="text-lg font-bold text-white pt-1">Students & Learners</h3>
              </div>
              <p className="text-sm text-gray-200 leading-relaxed">
                Turn theory into practice. Experience how startups evolve through real stages—from MVP to scaling. Build your resume with hands-on entrepreneurial experience before graduation.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 hover:border-amber-400/50 transition-all hover:scale-105 duration-300 shadow-xl">
              <div className="flex items-start gap-4 mb-3">
                <div className="w-12 h-12 bg-amber-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0 border border-amber-400/30">
                  <Users className="w-6 h-6 text-amber-300" />
                </div>
                <h3 className="text-lg font-bold text-white pt-1">Mentors, Instructors & Programs</h3>
              </div>
              <p className="text-sm text-gray-200 leading-relaxed">
                The perfect platform for accelerators, incubators, and academic programs. Give your students a safe environment to practice entrepreneurship with real feedback loops.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Ventures Section - GLASS STYLE */}
      <div className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 to-indigo-900/40"></div>
        <div className="absolute inset-0 backdrop-blur-sm"></div>
        
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-10 text-center lg:text-left">
            Featured Venture Demos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-lg border border-purple-400/30 rounded-2xl p-6 hover:bg-white/15 hover:border-purple-400/60 transition-all hover:scale-105 duration-300 shadow-xl cursor-pointer group">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl">📱</div>
                <h3 className="text-xl font-bold group-hover:text-purple-300 transition-colors">ShelfSense</h3>
              </div>
              <p className="text-sm text-gray-200 mb-4">Smart retail shelf intelligence platform</p>
              <div className="flex items-center gap-2 text-xs mb-4">
                <span className="px-2 py-1 bg-purple-500/30 text-purple-200 rounded backdrop-blur-sm">Retail Tech</span>
                <span className="px-2 py-1 bg-white/20 text-gray-200 rounded backdrop-blur-sm">$2M Raised</span>
              </div>
              <Link href="/ShelfSense-demo.html" target="_blank">
                <Button className="w-full bg-purple-600/80 backdrop-blur-sm hover:bg-purple-600 text-sm border border-purple-400/30">
                  View Demo <ArrowRight className="w-3 h-3 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="bg-white/10 backdrop-blur-lg border border-emerald-400/30 rounded-2xl p-6 hover:bg-white/15 hover:border-emerald-400/60 transition-all hover:scale-105 duration-300 shadow-xl cursor-pointer group">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl">🚭</div>
                <h3 className="text-xl font-bold group-hover:text-emerald-300 transition-colors">Smokefree</h3>
              </div>
              <p className="text-sm text-gray-200 mb-4">Quit-smoking journey app</p>
              <div className="flex items-center gap-2 text-xs mb-4">
                <span className="px-2 py-1 bg-emerald-500/30 text-emerald-200 rounded backdrop-blur-sm">Health</span>
                <span className="px-2 py-1 bg-white/20 text-gray-200 rounded backdrop-blur-sm">$1.5M Raised</span>
              </div>
              <Link href="/smokefree-demo.html" target="_blank">
                <Button className="w-full bg-emerald-600/80 backdrop-blur-sm hover:bg-emerald-600 text-sm border border-emerald-400/30">
                  View Demo <ArrowRight className="w-3 h-3 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="bg-white/10 backdrop-blur-lg border border-blue-400/30 rounded-2xl p-6 hover:bg-white/15 hover:border-blue-400/60 transition-all hover:scale-105 duration-300 shadow-xl cursor-pointer group">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl">🏙️</div>
                <h3 className="text-xl font-bold group-hover:text-blue-300 transition-colors">UrbanPulse</h3>
              </div>
              <p className="text-sm text-gray-200 mb-4">City insights platform</p>
              <div className="flex items-center gap-2 text-xs mb-4">
                <span className="px-2 py-1 bg-blue-500/30 text-blue-200 rounded backdrop-blur-sm">Smart City</span>
                <span className="px-2 py-1 bg-white/20 text-gray-200 rounded backdrop-blur-sm">$5M Raised</span>
              </div>
              <Link href="/urbanpulse-demo.html" target="_blank">
                <Button className="w-full bg-blue-600/80 backdrop-blur-sm hover:bg-blue-600 text-sm border border-blue-400/30">
                  View Demo <ArrowRight className="w-3 h-3 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="mt-12 text-center">
            <Link href="/register">
              <Button size="lg" className="bg-white/20 backdrop-blur-lg hover:bg-white/30 border border-white/30 transition-all shadow-xl">
                Start Building Yours <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
      {/* Footer */}
      
    </div>
  );
}
