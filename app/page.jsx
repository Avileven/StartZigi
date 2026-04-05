// Home page - 050426
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


function AccordionSection({ sections }) {
  const [openIndex, setOpenIndex] = React.useState(0);
  return (
    <div className="mt-10 space-y-3">
      {sections.map((section, i) => (
        <div key={i} className="border border-white/10 rounded-2xl overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/5 transition-colors"
          >
            <span className="flex items-center gap-3 text-lg font-bold text-white">
              <span className="text-2xl">{section.icon}</span>
              {section.title}
            </span>
            <span className="text-pink-300 text-xl transition-transform duration-300" style={{transform: openIndex === i ? 'rotate(45deg)' : 'rotate(0deg)'}}>+</span>
          </button>
          {openIndex === i && (
            <div className="px-6 pb-5">
              <ul className="space-y-3 mt-2">
                {section.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-3 text-white/70 text-sm leading-relaxed">
                    <span className="text-pink-300 mt-1 flex-shrink-0">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
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

      {/* Benefits Section - Accordion */}
      <div className="py-24 sm:py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
                Everything You Need to Build a Startup
              </span>
            </h3>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Taking an idea to market is one of the loneliest and most complex journeys a founder can take. It demands professional knowledge, community support, constant pressure, tough decisions — and often multiple rounds of funding. StartZig was built for exactly this.
            </p>
            <p className="text-lg text-white/50 mt-4">Here is a partial list of what the platform gives you:</p>
          </div>

          <AccordionSection
            sections={[
              {
                title: "Advanced Tools for Building Your Venture",
                icon: "🛠️",
                items: [
                  "Business planning tools to structure your strategy and financial model",
                  "Product development tools at different stages of your product — including a dedicated studio for building prototypes and mockups",
                  "Marketing tools — run campaigns, build your landing page, and promote your venture to early users",
                  "A built-in AI mentor that accompanies you through every section and task — providing guidance, feedback, and professional support at every step",
                ]
              },
              {
                title: "Fundraising",
                icon: "💰",
                items: [
                  "A wide range of virtual private and institutional investors you can approach and pitch to",
                  "A real simulation of raising capital — from angel investors to venture capital firms",
                  "Practice your pitch, choose the right investor for your stage, and negotiate your terms",
                ]
              },
              {
                title: "Community & Users",
                icon: "🌐",
                items: [
                  "Get structured feedback on your product from real community members",
                  "Run a beta testing program — invite users to sign up and test your product at different stages",
                  "Invite a co-founder to join your venture and build your team",
                ]
              },
            ]}
          />
        </div>
      </div>
<JourneyPreview />
      {/* Who Can Benefit Section */}
      <div className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
                Who can benefit from StartZig?
              </span>
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              StartZig is built for learning, testing, and momentum — whether you're exploring, building, or teaching.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="border border-white/10 rounded-2xl p-6 hover:border-pink-400/40 transition-colors">
              <div className="text-3xl mb-4">🚀</div>
              <h3 className="text-lg font-bold mb-3 text-white">Experience the Startup World</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Ever wondered what it feels like to build a startup, pitch to investors, and close a funding round? StartZig puts you in the founder&#39;s seat — from your first product idea all the way to scaling your company and landing an exit.
              </p>
            </div>

            <div className="border border-white/10 rounded-2xl p-6 hover:border-pink-400/40 transition-colors">
              <div className="text-3xl mb-4">💡</div>
              <h3 className="text-lg font-bold mb-3 text-white">Entrepreneurs with an Idea</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Whether you&#39;re just starting out or already have a product in mind, StartZig gives you a secured professional environment to build and grow your venture — with a dedicated AI mentor by your side. You stay in full control of your information, choosing what to share and with whom. More than just a building tool, StartZig is a marketing engine — helping you grow a viral community of founders and early adopters around your product.
              </p>
            </div>

            <div className="border border-white/10 rounded-2xl p-6 hover:border-pink-400/40 transition-colors">
              <div className="text-3xl mb-4">🎓</div>
              <h3 className="text-lg font-bold mb-3 text-white">Students, Learners & Educators</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                The gap between theory and real-world entrepreneurship has never been harder to bridge. StartZig gives students hands-on experience of the full startup journey — from idea to exit. For educators, accelerators, and incubators, it&#39;s the perfect environment to run real startup simulations with built-in feedback loops, community engagement, and professional tools.
              </p>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
}
