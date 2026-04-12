// Home page - 120426
"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import DashboardMockup from "@/components/utils/DashboardMockup";
import MentorMockup from "@/components/utils/MentorMockup";
import VCMockup from "@/components/utils/VCMockup";
import StudioMockup from "@/components/utils/StudioMockup";
import VCSimulationMockup from "@/components/utils/VCSimulationMockup";
import FeedbackMockup from "@/components/utils/FeedbackMockup";
import BetaMockup from "@/components/utils/BetaMockup";






function BenefitsSection() {
  return (
    <div className="py-24 sm:py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-10">

          <div>
            <h4 className="text-xl font-bold text-white mb-3">Advanced Tools for Building Your Venture</h4>
            <div className="space-y-2 pl-4">
              <p className="text-white/70 text-base leading-relaxed">• A built-in AI mentor that accompanies you through every section and task, providing guidance, feedback, and professional support at every step</p>
              <p className="text-white/70 text-base leading-relaxed">• A professional management dashboard and business planning tools to structure your strategy and financial model</p>
              <p className="text-white/70 text-base leading-relaxed">• Product development tools at different stages of your product, including a dedicated studio for building prototypes and mockups</p>
              <p className="text-white/70 text-base leading-relaxed">• Marketing tools, run campaigns, build your landing page, and promote your venture to early users</p>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-bold text-white mb-3">Fundraising</h4>
            <div className="space-y-2 pl-4">
              <p className="text-white/70 text-base leading-relaxed">• A wide range of virtual private and institutional investors you can approach and pitch to</p>
              <p className="text-white/70 text-base leading-relaxed">• A real simulation of raising capital, from angel investors to venture capital firms</p>
              <p className="text-white/70 text-base leading-relaxed">• Practice your pitch, choose the right investor for your stage, and negotiate your terms</p>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-bold text-white mb-3">Community & Users</h4>
            <div className="space-y-2 pl-4">
              <p className="text-white/70 text-base leading-relaxed">• Get structured feedback on your product from real community members</p>
              <p className="text-white/70 text-base leading-relaxed">• Run a beta testing program, invite users to sign up and test your product at different stages</p>
              <p className="text-white/70 text-base leading-relaxed">• Invite a co-founder to join your venture and build your team</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function WhoSection() {
  return (
    <div className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
              Who can benefit from StartZig?
            </span>
          </h2>
        </div>

        <div className="space-y-8">

          <div>
            <h3 className="text-xl font-bold text-white mb-3">Experience the Startup World</h3>
            <p className="text-white/80 text-base leading-relaxed">Ever wondered what it feels like to build a startup, pitch to investors, and close a funding round? StartZig puts you in the founder's seat, from your first product idea all the way to scaling your company and landing an exit.</p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-3">Entrepreneurs with an Idea</h3>
            <p className="text-white/80 text-base leading-relaxed">Whether you're just starting out or already have a product in mind, StartZig gives you a secured professional environment to build and grow your venture, with a dedicated AI mentor by your side. You stay in full control of your information, choosing what to share and with whom. More than just a building tool, StartZig is a marketing engine, helping you grow a viral community of founders and early adopters around your product.</p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-3">Students, Learners & Educators</h3>
            <p className="text-white/80 text-base leading-relaxed">The gap between theory and real-world entrepreneurship has never been harder to bridge. StartZig gives students hands-on experience of the full startup journey, from idea to exit. For educators, accelerators, and incubators, it's the perfect environment to run real startup simulations with built-in feedback loops, community engagement, and professional tools.</p>
          </div>

        </div>
      </div>
    </div>
  );
}

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

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center px-6 pt-4">
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-slideUp">
            Don't just start up.{" "}
            <span
              style={{
                background: "linear-gradient(to right, #ec4899, #a855f7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
              className="fade-in-startzig"
            >
              StartZig
            </span>
            .
          </h1>
          <p
            className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto animate-slideUp"
            style={{ animationDelay: "0.2s" }}
          >
            A complete startup ecosystem combining AI guidance, real user feedback, and structured venture building tools.
          </p>
          <div
            className="flex flex-col gap-4 items-center animate-slideUp"
            style={{ animationDelay: "0.4s" }}
          >
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
              <Button
                onClick={handleLogin}
                size="lg"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-full border border-white/30 w-full max-w-sm"
              >
                Start Your Journey
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Why StartZig ── */}
      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
              Why StartZig?
            </span>
          </h2>
          <p className="text-lg text-white/70 max-w-3xl mb-4">
            <span className="bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent font-semibold">Entrepreneurs</span> with an idea get a full suite of AI-powered tools to validate, build, and grow their venture — with a dedicated mentor and real community feedback at every step.
          </p>
          <p className="text-lg text-white/70 max-w-3xl">
            <span className="bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent font-semibold">Not a founder yet?</span> StartZig lets you experience the full startup journey through real simulation and challenges — and even if you don't have an idea, our idea bank lets you pick one and jump straight into the adventure.
          </p>
        </div>
      </div>

      {/* ── Everything You Need ── */}
      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
              Everything You Need to Build a Startup
            </span>
          </h2>
          <p className="text-lg text-white/70 max-w-3xl">
            We often hear about the big exits and the overnight success stories, but the reality is that fewer than 1 in 10 ideas ever reach commercial maturity. Most founders discover too late that turning a raw idea into something investable and market-ready is a completely different skill set. Knowing how to validate and shape a product, getting the right advice at the right moment, and walking into an investor meeting with a compelling story, these are things most people have never practiced.
          </p>
          <p className="text-lg text-white/70 max-w-3xl mt-4">
            StartZig's objective is to close that gap.
          </p>
        </div>
      </div>

      {/* ── MOCKUPS ── */}

      {/* 1. Dashboard */}
      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-white">
              A Professional Management Dashboard
            </span>
          </h2>
          <p className="text-white/55 text-sm">Manage your venture, track progress, and stay on top of every stage — all in one place.</p>
        </div>
        <DashboardMockup autoStart={false} />
      </div>

      {/* 2. Mentor */}
      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-white">
              A Mentor Companion at Every Step
            </span>
          </h2>
          <p className="text-white/55 text-sm">AI-driven strategic guidance for your venture, at every section and every task.</p>
        </div>
        <MentorMockup autoStart={false} />
      </div>

      {/* 3. Investor Marketplace */}
      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-white">
              Investor Marketplace
            </span>
          </h2>
          <p className="text-white/55 text-sm">Discover virtual angels and VC firms, each with their own focus and criteria, and choose who to pitch.</p>
        </div>
        <VCMockup autoStart={false} />
      </div>

      {/* 4. VC Simulation */}
      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-white">
              A Real Fundraising Simulation
            </span>
          </h2>
          <p className="text-white/55 text-sm">Driven by our own AI algorithms built to evaluate ventures across every stage — from screening to investment decision.</p>
        </div>
        <VCSimulationMockup autoStart={false} />
      </div>

      {/* 5. ZigForge Studio */}
      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-white">
              A Dedicated AI Studio for Building App Demos
            </span>
          </h2>
          <p className="text-white/55 text-sm">Build working mockups and demos in a few clicks — helping you shape your product and collect real feedback while you build.</p>
        </div>
        <StudioMockup autoStart={false} />
      </div>

      {/* 6. Feedback */}
      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-white">
              Real Feedback from Real Users
            </span>
          </h2>
          <p className="text-white/55 text-sm">Collected and analyzed through a dedicated feedback system at every stage of your product.</p>
        </div>
        <FeedbackMockup autoStart={false} />
      </div>

      {/* 7. Beta */}
      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-white">
              A Dedicated Beta Sign-Up Page
            </span>
          </h2>
          <p className="text-white/55 text-sm">Share it, collect testers, and grow your first user base.</p>
        </div>
        <BetaMockup autoStart={false} />
      </div>

      <WhoSection />

      {/* ── Full Features List ── */}
      <div id="features">
        <div className="pt-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-2">
              <span className="bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
                StartZig Features
              </span>
            </h2>
          </div>
        </div>
        <BenefitsSection />
      </div>
    </div>
  );
}
