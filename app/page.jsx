// Home page - No cards, dark blue-purple background, with footer
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
    <div className="bg-gradient-to-b from-gray-900 via-indigo-950 to-purple-950 text-white min-h-screen">
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp {
          animation: slideUp 0.8s ease-out forwards;
        }
      `}</style>

      {/* Navigation - 2 level gradient */}
<nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10" style={{background: 'linear-gradient(180deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.9) 100%)', backdropFilter: 'blur(12px)'}}>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-20">
      
      <div className="flex-shrink-0">
        <Link href="/">
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent cursor-pointer">
            StartZig
          </span>
        </Link>
      </div>

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

      {/* Hero Section - NO CARD, DIRECT ON BACKGROUND */}
      <div className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <AnimatedBg />
        
        <div className="relative z-10 text-center max-w-4xl mx-auto mt-8">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-slideUp">
            Don't just start up.{" "}
            <span className="bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
              StartZig
            </span>
            .
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto animate-slideUp" style={{ animationDelay: "0.2s" }}>
            A complete startup ecosystem for growing ideas, backed by AI guidance and community wisdom.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slideUp" style={{ animationDelay: "0.4s" }}>
            {user ? (
              hasVenture ? (
                <Link href="/dashboard">
                  <Button size="lg" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20">
                    Go to dashboard <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              ) : (
                <Link href="/createventure">
                  <Button size="lg" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20">
                    Create Your Venture <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )
            ) : (
              <Button onClick={handleLogin} size="lg" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20">
                Start Your Journey <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
            
            <a href="/how-it-works.html" target="_blank">
              <Button size="lg" className="bg-transparent hover:bg-white/10 border border-white/30">
                <PlayCircle className="w-4 h-4 mr-2" />
                See How It Works
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Benefits Section - NO CARDS */}
      <div className="py-24 sm:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-xl font-semibold text-white/60 mb-2">Why StartZig?</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-4">Your Entrepreneurial Flight Simulator</h3>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Practice makes perfect. We provide the tools and environment to hone your skills before you take the real-world plunge.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Test Without Risk</h3>
              <p className="text-white/70 leading-relaxed">
                Validate your ideas in a realistic market simulation without risking your own capital. Make mistakes, pivot, and learn in a safe environment.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Learn from the Best</h3>
              <p className="text-white/70 leading-relaxed">
                Interact with AI-driven investors modeled after real-world personas. Understand what they look for and refine your pitch based on their feedback.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Build Real Skills</h3>
              <p className="text-white/70 leading-relaxed">
                From business planning and MVP development to fundraising, you'll go through the startup lifecycle and gain practical, hands-on experience.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Secure Simulated Funding</h3>
              <p className="text-white/70 leading-relaxed">
                Prove your model, gain traction, and raise virtual capital from a network of angel and VC simulators to fuel growth.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Join a Thriving Community</h3>
              <p className="text-white/70 leading-relaxed">
                Connect with other founders. Share strategies, give feedback, and build your network in a collaborative ecosystem.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Network className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Grow Your Network</h3>
              <p className="text-white/70 leading-relaxed">
                Practice networking and build relationships in a simulated environment, preparing you for real-world meetings.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Who Can Benefit Section - NO CARDS */}
      <div className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Who can benefit from StartZig?
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              StartZig is built for learning, testing, and momentum—whether you're exploring, building, or teaching.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-3">Experience the Startup World</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Build ventures just like in the real world. Experience the full startup lifecycle from ideation to exit. Learn what it takes to grow a company, manage burn rate, and reach that sweet exit moment.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-3">Entrepreneurs with an Idea</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Test, refine, and validate your concept before investing time and money. Experiment with different business models, pitch to AI investors, and pivot without real-world consequences. Expose your venture to the community, get feedback, and find potential early users.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-3">Students & Learners</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Turn theory into practice. Experience how startups evolve through real stages—from MVP to scaling. Build your resume with hands-on entrepreneurial experience before graduation.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-3">Mentors, Instructors & Programs</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                The perfect platform for accelerators, incubators, and academic programs. Give your students a safe environment to practice entrepreneurship with real feedback loops.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Ventures Section - NO CARDS */}
      <div className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-10 text-center">
            Featured Venture Demos
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-6xl mb-4">📱</div>
              <h3 className="text-xl font-bold mb-2">ShelfSense</h3>
              <p className="text-sm text-white/70 mb-3">Smart retail shelf intelligence platform</p>
              <div className="flex items-center justify-center gap-2 text-xs mb-4">
                <span className="px-3 py-1 bg-white/10 rounded">Retail Tech</span>
                <span className="px-3 py-1 bg-white/10 rounded">$2M Raised</span>
              </div>
              <Link href="/ShelfSense-demo.html" target="_blank">
                <Button className="bg-white/10 hover:bg-white/20 border-0">
                  View Demo <ArrowRight className="w-3 h-3 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="text-center">
              <div className="text-6xl mb-4">🚭</div>
              <h3 className="text-xl font-bold mb-2">Smokefree</h3>
              <p className="text-sm text-white/70 mb-3">Quit-smoking journey app</p>
              <div className="flex items-center justify-center gap-2 text-xs mb-4">
                <span className="px-3 py-1 bg-white/10 rounded">Health</span>
                <span className="px-3 py-1 bg-white/10 rounded">$1.5M Raised</span>
              </div>
              <Link href="/smokefree-demo.html" target="_blank">
                <Button className="bg-white/10 hover:bg-white/20 border-0">
                  View Demo <ArrowRight className="w-3 h-3 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="text-center">
              <div className="text-6xl mb-4">🏙️</div>
              <h3 className="text-xl font-bold mb-2">UrbanPulse</h3>
              <p className="text-sm text-white/70 mb-3">City insights platform</p>
              <div className="flex items-center justify-center gap-2 text-xs mb-4">
                <span className="px-3 py-1 bg-white/10 rounded">Smart City</span>
                <span className="px-3 py-1 bg-white/10 rounded">$5M Raised</span>
              </div>
              <Link href="/urbanpulse-demo.html" target="_blank">
                <Button className="bg-white/10 hover:bg-white/20 border-0">
                  View Demo <ArrowRight className="w-3 h-3 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="mt-12 text-center">
            <Link href="/register">
              <Button size="lg" className="bg-white/10 hover:bg-white/20 border border-white/20">
                Start Building Yours <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer - removed, using Footer component instead */}
    </div>
  );
}
