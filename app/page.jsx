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
import JourneyPreview from "@/components/utils/JourneyPreview";

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
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .fade-in-startzig {
          animation: fadeIn 2s ease-in forwards;
        }
      `}</style>

      {/* Navigation - 2 level gradient */}


      {/* Hero Section - NO CARD, DIRECT ON BACKGROUND */}
      <div className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        
        <div className="relative z-10 text-center max-w-4xl mx-auto mt-8">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-slideUp">
            Don't just start up.{" "}
            <span style={{background: 'linear-gradient(to right, #ec4899, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}} className="fade-in-startzig">
              StartZig
            </span>
            .
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto animate-slideUp" style={{ animationDelay: "0.2s" }}>
            A complete startup ecosystem for growing ideas, backed by AI guidance and community wisdom.
          </p>
          <div className="flex flex-col gap-4 items-center animate-slideUp" style={{ animationDelay: "0.4s" }}>
            {user ? (
              hasVenture ? (
                <Link href="/dashboard" className="w-full max-w-sm">
                  <Button size="lg" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-full border border-white/30 w-full">
                    Go to dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/createventure" className="w-full max-w-sm">
                  <Button size="lg" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-full border border-white/30 w-full">
                    Create Your Venture
                  </Button>
                </Link>
              )
            ) : (
              <Button onClick={handleLogin} size="lg" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-full border border-white/30 w-full max-w-sm">
                Start Your Journey
              </Button>
            )}
            
            
          </div>
        </div>
      </div>

      {/* Benefits Section - NO CARDS */}
      <div className="py-24 sm:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
                Your Entrepreneurial Flight Simulator
              </span>
            </h3>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Practice makes perfect. We provide the tools and environment to hone your skills before you take the real-world plunge.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-pink-300" />
                Test Without Risk
              </h3>
              <p className="text-white/70 leading-relaxed text-sm">
                Validate your ideas in a realistic market simulation without risking your own capital. Make mistakes, pivot, and learn in a safe environment.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-pink-300" />
                Learn from the Best
              </h3>
              <p className="text-white/70 leading-relaxed text-sm">
                Interact with AI-driven investors modeled after real-world personas. Understand what they look for and refine your pitch based on their feedback.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-pink-300" />
                Build Real Skills
              </h3>
              <p className="text-white/70 leading-relaxed text-sm">
                From business planning and MVP development to fundraising, you'll go through the startup lifecycle and gain practical, hands-on experience.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-pink-300" />
                Secure Simulated Funding
              </h3>
              <p className="text-white/70 leading-relaxed text-sm">
                Prove your model, gain traction, and raise virtual capital from a network of angel and VC simulators to fuel growth.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-pink-300" />
                Join a Thriving Community
              </h3>
              <p className="text-white/70 leading-relaxed text-sm">
                Connect with other founders. Share strategies, give feedback, and build your network in a collaborative ecosystem.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <Network className="w-5 h-5 text-pink-300" />
                Grow Your Network
              </h3>
              <p className="text-white/70 leading-relaxed text-sm">
                Practice networking and build relationships in a simulated environment, preparing you for real-world meetings.
              </p>
            </div>
          </div>
        </div>
      </div>
<JourneyPreview />
      {/* Who Can Benefit Section - NO CARDS */}
      <div className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
                Who can benefit from StartZig?
              </span>
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              StartZig is built for learning, testing, and momentum—whether you're exploring, building, or teaching.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h3 className="text-base font-bold mb-2 flex items-center gap-2">
                <Target className="w-5 h-5 text-pink-300" />
                Experience the Startup World
              </h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Build ventures just like in the real world. Experience the full startup lifecycle from ideation to exit. Learn what it takes to grow a company, manage burn rate, and reach that sweet exit moment.
              </p>
            </div>

            <div>
              <h3 className="text-base font-bold mb-2 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-pink-300" />
                Entrepreneurs with an Idea
              </h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Test, refine, and validate your concept before investing time and money. Experiment with different business models, pitch to AI investors, and pivot without real-world consequences. Expose your venture to the community, get feedback, and find potential early users.
              </p>
            </div>

            <div>
              <h3 className="text-base font-bold mb-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-pink-300" />
                Students & Learners
              </h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Turn theory into practice. Experience how startups evolve through real stages—from MVP to scaling. Build your resume with hands-on entrepreneurial experience before graduation.
              </p>
            </div>

            <div>
              <h3 className="text-base font-bold mb-2 flex items-center gap-2">
                <Users className="w-5 h-5 text-pink-300" />
                Mentors, Instructors & Programs
              </h3>
              <p className="text-sm text-white/70 leading-relaxed">
                The perfect platform for accelerators, incubators, and academic programs. Give your students a safe environment to practice entrepreneurship with real feedback loops.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Ventures Section - NO CARDS */}
      <div className="py-24 px-6 bg-gradient-to-b from-indigo-950 to-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-10 text-center">
            <span style={{background: 'linear-gradient(to right, #ec4899, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
              Featured Venture Demos
            </span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6 justify-items-center">
            <div className="text-center">
              <h3 className="text-lg font-bold mb-1 flex items-center justify-center gap-2">
                <span className="text-2xl">📱</span>
                ShelfSense
              </h3>
              <p className="text-xs text-white/70 mb-2">Smart retail shelf intelligence platform</p>
              <div className="flex justify-center gap-2 text-xs mb-3">
                <span className="px-2 py-1 bg-white/10 rounded">Retail Tech</span>
                <span className="px-2 py-1 bg-white/10 rounded">$2M Raised</span>
              </div>
              <Link href="/ShelfSense-demo.html" target="_blank">
                <Button size="sm" className="bg-white/10 hover:bg-white/20 border-0 text-xs">
                  View Demo <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold mb-1 flex items-center justify-center gap-2">
                <span className="text-2xl">🚭</span>
                Smokefree
              </h3>
              <p className="text-xs text-white/70 mb-2">Quit-smoking journey app</p>
              <div className="flex justify-center gap-2 text-xs mb-3">
                <span className="px-2 py-1 bg-white/10 rounded">Health</span>
                <span className="px-2 py-1 bg-white/10 rounded">$1.5M Raised</span>
              </div>
              <Link href="/smokefree-demo.html" target="_blank">
                <Button size="sm" className="bg-white/10 hover:bg-white/20 border-0 text-xs">
                  View Demo <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold mb-1 flex items-center justify-center gap-2">
                <span className="text-2xl">🏙️</span>
                UrbanPulse
              </h3>
              <p className="text-xs text-white/70 mb-2">City insights platform</p>
              <div className="flex justify-center gap-2 text-xs mb-3">
                <span className="px-2 py-1 bg-white/10 rounded">Smart City</span>
                <span className="px-2 py-1 bg-white/10 rounded">$5M Raised</span>
              </div>
              <Link href="/urbanpulse-demo.html" target="_blank">
                <Button size="sm" className="bg-white/10 hover:bg-white/20 border-0 text-xs">
                  View Demo <ArrowRight className="w-3 h-3 ml-1" />
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
