// Home page - 160726
"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronDown } from "lucide-react"; // [ADDED] FAQ accordion icon
import DashboardMockup from "@/components/utils/DashboardMockup";
import MentorMockup from "@/components/utils/MentorMockup";
import VCMockup from "@/components/utils/VCMockup";
import StudioMockup from "@/components/utils/StudioMockup";
import VCSimulationMockup from "@/components/utils/VCSimulationMockup";
import FeedbackMockup from "@/components/utils/FeedbackMockup";
import BetaMockup from "@/components/utils/BetaMockup";
import BusinessDeckMockup from "@/components/utils/BusinessDeckMockup";
import ZigPlanMockup from "@/components/utils/ZigPlanMockup";







function BenefitsSection() {
  return (
    <div className="py-24 sm:py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-10">

          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-3">Advanced Tools for Building Your Venture</h4>
            <div className="space-y-2 pl-4">
              <p className="text-gray-600 text-base leading-relaxed">• A built-in AI mentor that accompanies you through every section and task, providing guidance, feedback, and professional support at every step</p>
              <p className="text-gray-600 text-base leading-relaxed">• A professional management dashboard and business planning tools to structure your strategy and financial model</p>
              <p className="text-gray-600 text-base leading-relaxed">• Product development tools at different stages of your product, including a dedicated studio for building prototypes and mockups</p>
              <p className="text-gray-600 text-base leading-relaxed">• Marketing tools, run campaigns, build your landing page, and promote your venture to early users</p>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-3">Fundraising</h4>
            <div className="space-y-2 pl-4">
              <p className="text-gray-600 text-base leading-relaxed">• A wide range of virtual private and institutional investors you can approach and pitch to</p>
              <p className="text-gray-600 text-base leading-relaxed">• A real simulation of raising capital, from angel investors to venture capital firms</p>
              <p className="text-gray-600 text-base leading-relaxed">• Practice your pitch, choose the right investor for your stage, and negotiate your terms</p>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-3">Community & Users</h4>
            <div className="space-y-2 pl-4">
              <p className="text-gray-600 text-base leading-relaxed">• Get structured feedback on your product from real community members</p>
              <p className="text-gray-600 text-base leading-relaxed">• Run a beta testing program, invite users to sign up and test your product at different stages</p>
              <p className="text-gray-600 text-base leading-relaxed">• Invite a co-founder to join your venture and build your team</p>
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
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Who can benefit from StartZig?
            </span>
          </h2>
        </div>

        <div className="space-y-8">

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Experience the Startup World</h3>
            <p className="text-gray-600 text-base leading-relaxed">Ever wondered what it feels like to build a startup, pitch to investors, and close a funding round? StartZig puts you in the founder's seat, from your first product idea all the way to scaling your company and landing an exit.</p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Entrepreneurs with an Idea</h3>
            <p className="text-gray-600 text-base leading-relaxed">Whether you're just starting out or already have a product in mind, StartZig gives you a secured professional environment to build and grow your venture, with a dedicated AI mentor by your side. You stay in full control of your information, choosing what to share and with whom. More than just a building tool, StartZig is a marketing engine, helping you grow a viral community of founders and early adopters around your product.</p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Students, Learners & Educators</h3>
            <p className="text-gray-600 text-base leading-relaxed">The gap between theory and real-world entrepreneurship has never been harder to bridge. StartZig gives students hands-on experience of the full startup journey, from idea to exit. For educators, accelerators, and incubators, it's the perfect environment to run real startup simulations with built-in feedback loops, community engagement, and professional tools.</p>
          </div>

        </div>
      </div>
    </div>
  );
}


// [ADDED] FAQ accordion component
function FAQItems() {
  const [openFaq, setOpenFaq] = useState(null);
  const FAQS = [
    { q: "Is this a real startup platform or a simulation?", a: "Both. The journey, tools, and AI guidance are real and built for serious founders. The investment simulations and virtual capital are simulated — designed to help you practice and prepare before facing real investors." },
    { q: "Is StartZig free to use?", a: "Yes. The Explorer plan is free forever — no credit card required. You get full access to the startup journey simulation and 5 AI mentor credits to get started." },
    { q: "Do I need technical knowledge to use StartZig?", a: "No. StartZig is designed for founders, not developers. The tools guide you step by step through idea validation, business planning, MVP thinking, and investor preparation." },
    { q: "What's the difference between the plans?", a: "All plans include the full startup journey. The main differences are the number of monthly AI credits (5 / 100 / 300 / 500) and access to advanced tools like Business Deck and ZigPlan — available on Pro Founder and Unicorn." },
    { q: "What are credits and how do they work?", a: "Credits power the AI features on StartZig. Using the AI Mentor costs 1 credit per interaction. Other AI-powered tools specify their credit cost clearly before you use them. Credits are included in your monthly plan and reset each month. You can top up anytime if you need more." },
    { q: "How is my venture data protected and who can see it?", a: "Your venture data is stored securely using industry-standard security practices. We recommend exercising caution about sharing sensitive proprietary information — StartZig does not accept liability for data breaches. You choose when and with whom to share it — whether that's inviting a co-founder, sharing your beta sign-up page to recruit testers, or sharing your venture landing page to collect community feedback." },
    { q: "Can I join as an investor?", a: "Not at the moment. Investor accounts are not yet available, but we plan to open this up in the future. Stay tuned." },
  ];
  return (
    <div className="space-y-3">
      {FAQS.map((item, i) => (
        <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
          <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-6 py-4 text-left text-gray-900 font-semibold text-base hover:bg-gray-50 transition-colors">
            <span>{item.q}</span>
            <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
          </button>
          {openFaq === i && (
            <div className="px-6 pb-5 text-gray-500 text-sm leading-relaxed">{item.a}</div>
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
    <div className="bg-white text-gray-900 min-h-screen">
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
                background: "linear-gradient(to right, #3457D5, #6E5AD6)",
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
            className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto animate-slideUp"
            style={{ animationDelay: "0.2s" }}
          >
            A training platform for growing raw ideas into startups, and inventors into founders. The platform combines a dedicated toolset, community wisdom, and technical support from AI.
          </p>
          <div
            className="flex flex-col gap-4 items-center animate-slideUp"
            style={{ animationDelay: "0.4s" }}
          >
            {user ? (
              hasVenture ? (
                <Link href="/dashboard" className="w-full max-w-sm">
                  <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full w-full">
                    Go to dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/createventure" className="w-full max-w-sm">
                  <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full w-full">
                    Create Your Venture
                  </Button>
                </Link>
              )
            ) : (
              <Button
                onClick={handleLogin}
                size="lg"
                className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full w-full max-w-sm"
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
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Not another AI tool someone thought would be nice to have.
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mb-10">
            StartZig is a real, structured methodology for turning a raw idea into something you'd actually stake a business on — built from the ground up around one person, working alone, from the very first spark of an idea to a validated, demo-ready product.
          </p>

          <div className="space-y-5">
            {[
              {
                title: "Built by founders who've actually done it, for founders who haven't yet",
                body: "Not theory, not an academic framework — StartZig reflects the real, hands-on experience of founders who've built and evaluated startups themselves. It's not \u201Canother AI tool someone thought would be nice to have\u201D — it's a methodology born from real wins and real failures.",
              },
              {
                title: "Idea development and founder development, together",
                body: "StartZig doesn't just help you build a specific idea — it builds your ability to think and act like a founder. That's what lets two different people use it the exact same way: someone with a real idea building it for real, and someone who just wants to experience what founding actually feels like. Both walk away stronger.",
              },
              {
                title: "Visual thinking, at every stage — not just at the end",
                body: "The Studio isn't a design step tacked on late in the process. At any point in the journey, you can turn your thinking into something visual — see it, shape it, react to it — instead of staying stuck in your head or in a wall of text. Visual thinking is a tool you can reach for whenever you need it, not a phase you pass through once.",
              },
              {
                title: "Refinement, not just documentation",
                body: "The goal isn't a polished write-up of your idea — it's refining it: stripping away what doesn't hold up, sharpening what does, until what's left is an actual venture, not a general concept.",
              },
              {
                title: "No shortcuts",
                body: "AI is a technical tool in service of the process — it never replaces the analysis, the thinking, or the hard work every founder who's ever succeeded had to go through. StartZig doesn't promise fast and easy. It promises real, because that's the only thing that actually works.",
              },
              {
                title: "Transparency and fairness as a built-in principle, not a slogan",
                body: "What's free stays free, with no surprises and no hidden conditions. You always know exactly where you stand and what's ahead.",
              },
              {
                title: "Community feedback, built into the process — not bolted on",
                body: "Feedback from fellow founders isn't an add-on feature. It's woven directly into the methodology, at the exact points where it matters most.",
              },
              {
                title: "Your privacy stays yours",
                body: "All your information is kept private to you. You decide what to share, with whom, and when — you shouldn't have to expose your startup to get value from the process.",
              },
              {
                title: "What you leave with: a founder, not just a pitch",
                body: "The end goal isn't a document or a deck — it's a founder who went through a real, structured process with no shortcuts, holding an idea that's already market-validated and ready for the next step: development or fundraising.",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-200">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-900 text-white text-sm font-bold flex items-center justify-center">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1.5">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl bg-gray-900 text-white p-7">
            <p className="text-base leading-relaxed text-gray-200">
              <span className="text-white font-semibold">No surprises here.</span> Your entire journey — from idea to pitching investors — is free, and always will be, with no trial days and no gimmicks. You only pay if you want an extra layer of AI power along the way.
            </p>
          </div>
        </div>
      </div>

      {/* ── Everything You Need ── */}
      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Everything You Need to Build a Startup
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl">
            We often hear about the big exits and the overnight success stories, but the reality is that fewer than 1 in 10 ideas ever reach commercial maturity. Most founders discover too late that turning a raw idea into something investable and market-ready is a completely different skill set. Knowing how to validate and shape a product, getting the right advice at the right moment, and walking into an investor meeting with a compelling story, these are things most people have never practiced.
          </p>
          <p className="text-lg text-gray-600 max-w-3xl mt-4">
            StartZig's objective is to close that gap.
          </p>
        </div>
      </div>

      {/* ── MOCKUPS ── */}

      {/* 1. Dashboard */}
      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-gray-900">
              A Professional Management Dashboard
            </span>
          </h2>
          <p className="text-gray-500 text-sm">Manage your venture, track progress, and stay on top of every stage — all in one place.</p>
        </div>
        <DashboardMockup autoStart={false} />
      </div>

      {/* 2. Mentor */}
      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-gray-900">
              A Mentor Companion at Every Step
            </span>
          </h2>
          <p className="text-gray-500 text-sm">AI-driven strategic guidance for your venture, at every section and every task.</p>
        </div>
        <MentorMockup autoStart={false} />
      </div>

      {/* 3. Investor Marketplace */}
      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-gray-900">
              Investor Marketplace
            </span>
          </h2>
          <p className="text-gray-500 text-sm">Discover virtual angels and VC firms, each with their own focus and criteria, and choose who to pitch.</p>
        </div>
        <VCMockup autoStart={false} />
      </div>

      {/* 4. VC Simulation */}
      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-gray-900">
              A Real Fundraising Simulation
            </span>
          </h2>
          <p className="text-gray-500 text-sm">Driven by our own AI algorithms built to evaluate ventures across every stage — from screening to investment decision.</p>
        </div>
        <VCSimulationMockup autoStart={false} />
      </div>

      {/* 5. ZigForge Studio */}
      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-gray-900">
              A Dedicated AI Studio for Building App Demos
            </span>
          </h2>
          <p className="text-gray-500 text-sm">Build working mockups and demos in a few clicks — helping you shape your product and collect real feedback while you build.</p>
        </div>
        <StudioMockup autoStart={false} />
      </div>

      {/* 6. Feedback */}
      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-gray-900">
              Real Feedback from Real Users
            </span>
          </h2>
          <p className="text-gray-500 text-sm">Collected and analyzed through a dedicated feedback system at every stage of your product.</p>
        </div>
        <FeedbackMockup autoStart={false} />
      </div>

      {/* 7. Beta */}
      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-gray-900">
              A Dedicated Beta Sign-Up Page
            </span>
          </h2>
          <p className="text-gray-500 text-sm">Share it, collect testers, and grow your first user base.</p>
        </div>
        <BetaMockup autoStart={false} />
      </div>
{/* 8. Business Deck */}
<div className="py-16 px-6">
  <div className="max-w-4xl mx-auto mb-8">
    <h2 className="text-3xl md:text-4xl font-bold mb-2">
      <span className="text-gray-900">
        Your Investor Business Plan, Generated
      </span>
    </h2>
    <p className="text-gray-500 text-sm">
      StartZig assembles everything you've built into a professional investor-ready business plan — with AI analysis, revenue forecast, and break-even analysis. Available on Pro Founder and above.
    </p>
  </div>
  <BusinessDeckMockup autoStart={false} />
</div>

{/* 9. ZigPlan */}
<div className="py-16 px-6">
  <div className="max-w-4xl mx-auto mb-8">
    <h2 className="text-3xl md:text-4xl font-bold mb-2">
      <span className="text-gray-900">
        Meet ZigPlan, Your Personal Business Analyst
      </span>
    </h2>
    <p className="text-gray-500 text-sm">
      From idea to execution — ZigPlan analyzes your product, features, and goals to generate a concise Product Requirements Document with a ready-to-use AI development prompt. Available on Pro Founder and above.
    </p>
  </div>
  <ZigPlanMockup autoStart={false} />
</div>
      <WhoSection />

      

      {/* ── Full Features List ── */}
      <div id="features">
        <div className="pt-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-2">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                StartZig Features
              </span>
            </h2>
          </div>
        </div>
        <BenefitsSection />
      </div>
      {/* [ADDED] FAQ Section */}
      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-10">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Frequently Asked Questions
            </span>
          </h2>
          <FAQItems />
        </div>
      </div>
    </div>
  );
}
