// Home page - static version, no expand/collapse
"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import JourneyPreview from "@/components/utils/JourneyPreview";

function BenefitsSection() {
  return (
    <div className="py-24 sm:py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
              Everything You Need to Build a Startup
            </span>
          </h3>
          <p className="text-lg text-white/70 max-w-3xl mx-auto">
            Taking an idea to market is one of the loneliest and most complex journeys a founder can take. It demands professional knowledge, community support, constant pressure, tough decisions — and often multiple rounds of funding. StartZig was built for exactly this.
          </p>
          <p className="text-base text-white/50 mt-4">Here is a partial list of what the platform gives you:</p>
        </div>

        <div className="space-y-10">

          <div className="border-t border-white/10 pt-8">
            <h4 className="text-xl font-bold text-white mb-4">Advanced Tools for Building Your Venture</h4>
            <p className="text-white/80 text-base leading-relaxed mb-4">From planning to product — we provide the tools founders need at every stage of their venture's development.</p>
            <div className="space-y-3 pl-6">
              <p className="text-white/70 text-base leading-relaxed">Business planning tools to structure your strategy and financial model</p>
              <p className="text-white/70 text-base leading-relaxed">Product development tools at different stages of your product — including a dedicated studio for building prototypes and mockups</p>
              <p className="text-white/70 text-base leading-relaxed">Marketing tools — run campaigns, build your landing page, and promote your venture to early users</p>
              <p className="text-white/70 text-base leading-relaxed">A built-in AI mentor that accompanies you through every section and task — providing guidance, feedback, and professional support at every step</p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8">
            <h4 className="text-xl font-bold text-white mb-4">Fundraising</h4>
            <p className="text-white/80 text-base leading-relaxed mb-4">A wide range of virtual private and institutional investors you can approach and pitch to.</p>
            <div className="space-y-3 pl-6">
              <p className="text-white/70 text-base leading-relaxed">A real simulation of raising capital — from angel investors to venture capital firms</p>
              <p className="text-white/70 text-base leading-relaxed">Practice your pitch, choose the right investor for your stage, and negotiate your terms</p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8">
            <h4 className="text-xl font-bold text-white mb-4">Community & Users</h4>
            <p className="text-white/80 text-base leading-relaxed mb-4">Get structured feedback on your product from real community members.</p>
            <div className="space-y-3 pl-6">
              <p className="text-white/70 text-base leading-relaxed">Run a beta testing program — invite users to sign up and test your product at different stages</p>
              <p className="text-white/70 text-base leading-relaxed">Invite a co-founder to join your venture and build your team</p>
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
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
              Who can benefit from StartZig?
            </span>
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            StartZig is built for learning, testing, and momentum — whether you're exploring, building, or teaching.
          </p>
        </div>

        <div className="space-y-8">

          <div className="border-t border-white/10 pt-6">
            <h3 className="text-xl font-bold text-white mb-3">Experience the Startup World</h3>
            <p className="text-white/80 text-base leading-relaxed">Ever wondered what it feels like to build a startup, pitch to investors, and close a funding round?</p>
            <p className="text-white/70 text-base leading-relaxed mt-3 pl-6">StartZig puts you in the founder's seat — from your first product idea all the way to scaling your company and landing an exit.</p>
          </div>

          <div className="border-t border-white/10 pt-6">
            <h3 className="text-xl font-bold text-white mb-3">Entrepreneurs with an Idea</h3>
            <p className="text-white/80 text-base leading-relaxed">Whether you're just starting out or already have a product in mind, StartZig gives you a secured professional environment to build and grow your venture — with a dedicated AI mentor by your side.</p>
            <p className="text-white/70 text-base leading-relaxed mt-3 pl-6">You stay in full control of your information, choosing what to share and with whom. More than just a building tool, StartZig is a marketing engine — helping you grow a viral community of founders and early adopters around your product.</p>
          </div>

          <div className="border-t border-white/10 pt-6">
            <h3 className="text-xl font-bold text-white mb-3">Students, Learners & Educators</h3>
            <p className="text-white/80 text-base leading-relaxed">The gap between theory and real-world entrepreneurship has never been harder to bridge.</p>
            <p className="text-white/70 text-base leading-relaxed mt-3 pl-6">StartZig gives students hands-on experience of the full startup journey — from idea to exit. For educators, accelerators, and incubators, it's the perfect environment to run real startup simulations with built-in feedback loops, community engagement, and professional tools.</p>
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
      <div className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="relative z-10 text-center max-w-4xl mx-auto mt-8">
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
            A complete startup ecosystem for growing ideas, backed by AI guidance and community wisdom.
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

      <BenefitsSection />
      <JourneyPreview />
      <WhoSection />
    </div>
  );
}
