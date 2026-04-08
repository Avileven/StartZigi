// Home page - static version v4
"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import JourneyPreview from "@/components/utils/JourneyPreview";
import MentorMockup from "@/components/utils/MentorMockup";
import VCMockup from "@/components/utils/VCMockup";
import StudioMockup from "@/components/utils/StudioMockup";
import VCSimulationMockup from "@/components/utils/VCSimulationMockup";
import FeedbackMockup from "@/components/utils/FeedbackMockup";




const PHASES = [
  {
    key: "plan",
    label: "PLAN",
    venture: { name: "NovaMed", messages: 8, balance: "$15,000", val: "$250K" },
    tools: ["Financials", "Business Plan", "Invite Co-Founder", "Promotion Center"],
    messages: [
      { id: "a", dot: "#6c47ff", title: "Welcome to Business Planning!", tag: "PHASE WELCOME", date: "Jan 25, 2026", body: "It's time to build a solid foundation. Complete your business plan to unlock the next phase." },
      { id: "b", dot: "#22c55e", title: "Capital Injection: $15,000", tag: "PHASE COMPLETE", date: "Jan 25, 2026", body: "Your business plan is 100% complete. A starting capital of $15,000 has been deposited. Monthly burn rate is now $5,000.", highlight: true },
    ],
  },
  {
    key: "mvp",
    label: "MVP",
    venture: { name: "NovaMed", messages: 14, balance: "$8,200", val: "$500K" },
    tools: ["Financials", "Business Plan", "Invite Co-Founder", "Promotion Center", "ZigForge Studio", "Product Feedback"],
    messages: [
      { id: "c", dot: "#f59e0b", title: "MVP Uploaded Successfully!", tag: "SYSTEM", date: "Feb 10, 2026", body: "Great work! Your MVP is live. Use the Promotion Center to collect user feedback." },
      { id: "d", dot: "#6c47ff", title: "Co-Founder Invited!", tag: "CO-FOUNDER INVITE", date: "Apr 6, 2026", body: "Invitation sent to DAN. Link points to Venture Profile.", highlight: false },
    ],
  },
  {
    key: "mlp",
    label: "MLP",
    venture: { name: "NovaMed", messages: 18, balance: "$2,400", val: "$1M" },
    tools: ["Financials", "Business Plan", "Invite Co-Founder", "Promotion Center", "ZigForge Studio", "Product Feedback", "Revenue Modeling", "MLP Dev Center"],
    messages: [
      { id: "e", dot: "#ec4899", title: "10 Feedback Responses Received", tag: "SYSTEM", date: "Mar 15, 2026", body: "You've collected 10+ feedback responses. You're now eligible to complete the MLP phase." },
      { id: "f", dot: "#22c55e", title: "MLP Phase Complete!", tag: "PHASE COMPLETE", date: "Mar 20, 2026", body: "Congratulations! Your MLP is complete. You're moving to the Beta phase.", highlight: true },
    ],
  },
  {
    key: "beta",
    label: "BETA",
    venture: { name: "NovaMed", messages: 20, balance: "$220,151", val: "$2M" },
    tools: ["Financials", "Business Plan", "Invite Co-Founder", "Promotion Center", "ZigForge Studio", "Product Feedback", "Revenue Modeling", "Beta Testing Page", "Venture Pitch"],
    messages: [
      { id: "g", dot: "#ec4899", title: "New Beta Tester", tag: "SYSTEM", date: "Mar 29, 2026", body: "You now have 5/50 beta sign-ups. Keep sharing your beta page to reach your goal." },
      { id: "h", dot: "#f59e0b", title: "Screening Meeting Scheduled", tag: "VC MARKETPLACE", date: "Apr 2, 2026", body: "Velocity Wave Partners agreed to a screening call. Prepare your pitch deck." },
      { id: "i", dot: "#22c55e", title: "VC Investment Offer Received", tag: "VC MARKETPLACE", date: "Just now", body: "Meridian Stone Capital is offering $1,500,000 at a $5M pre-money valuation. You have 48 hours to respond.", highlight: true, isNew: true },
    ],
  },
];

const NAV_ITEMS = ["Home", "Dashboard", "Exit Path", "Landing Page", "Beta Page", "Angel Arena", "VC Marketplace", "My Account"];

function DashboardMockup() {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [visibleMsgs, setVisibleMsgs] = useState([]);
  const [toolCount, setToolCount] = useState(4);

  const phase = PHASES[phaseIdx];

  useEffect(() => {
    setVisibleMsgs([]);
    setToolCount(4);

    // Animate toolbox items in
    const toolTarget = phase.tools.length;
    let t = 4;
    const toolInterval = setInterval(() => {
      t++;
      setToolCount(t);
      if (t >= toolTarget) clearInterval(toolInterval);
    }, 400);

    // Animate messages in from bottom to top
    const msgs = [...phase.messages];
    msgs.forEach((msg, i) => {
      setTimeout(() => {
        setVisibleMsgs(prev => [...prev, msg]);
      }, 600 + i * 1000);
    });

    // Total cycle time: wait then move to next phase
    const totalTime = 600 + msgs.length * 1000 + 3000;
    const nextPhase = setTimeout(() => {
      setPhaseIdx(prev => (prev + 1) % PHASES.length);
    }, totalTime);

    return () => {
      clearInterval(toolInterval);
      clearTimeout(nextPhase);
    };
  }, [phaseIdx]);

  return (
    <div style={{ padding: "48px 24px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", background: "#f0f0f5", borderRadius: 14, overflow: "hidden", border: "0.5px solid #ddd" }}>

        {/* Topbar */}
        <div style={{ background: "#fff", borderBottom: "0.5px solid #e8e8e8", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#111" }}>Good morning, Sarah!</div>
            <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>Monday, April 6, 2026</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: "#aaa" }}>Current Phase</span>
            <span style={{ background: "#fff3e0", color: "#d97706", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, transition: "all 0.5s" }}>{phase.label}</span>
          </div>
        </div>

        {/* Body */}
        <div style={{ display: "grid", gridTemplateColumns: "160px 170px 1fr" }}>

          {/* Nav */}
          <div style={{ background: "#fff", borderRight: "0.5px solid #eee", padding: "12px 0", display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 9, color: "#ccc", textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 14px 8px" }}>Navigation</div>
            {NAV_ITEMS.map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 14px", fontSize: 12, color: item === "Dashboard" ? "#6c47ff" : "#666", fontWeight: item === "Dashboard" ? 600 : 400, background: item === "Dashboard" ? "#f3f0ff" : "transparent" }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: item === "Dashboard" ? "#6c47ff22" : "#f0f0f0", flexShrink: 0 }} />
                {item}
              </div>
            ))}
            <div style={{ marginTop: "auto", borderTop: "0.5px solid #f0f0f0", padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#ede9ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "#6c47ff", flexShrink: 0 }}>S</div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 500, color: "#333" }}>sarah@novamed.io</div>
                <div style={{ fontSize: 9, color: "#aaa" }}>Impact Plan</div>
              </div>
            </div>
          </div>

          {/* Toolbox */}
          <div style={{ background: "#fafafa", borderRight: "0.5px solid #eee", padding: 12, display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={{ fontSize: 9, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Toolbox</div>
            {phase.tools.slice(0, toolCount).map((t) => (
              <div key={t} style={{ background: "#fff", border: "0.5px solid #e8e8e8", borderRadius: 7, padding: "7px 10px", fontSize: 11, color: "#444", transition: "opacity 0.4s", opacity: 1 }}>{t}</div>
            ))}
          </div>

          {/* Board */}
          <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ background: "#fff", border: "0.5px solid #e8e8e8", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 5 }}>{phase.venture.name}</div>
              <div style={{ display: "flex", gap: 6, fontSize: 10, color: "#999", flexWrap: "wrap" }}>
                <span>{phase.venture.messages} messages</span><span>·</span><span>1 founder</span><span>·</span><span>Balance: {phase.venture.balance}</span><span>·</span><span>Val: {phase.venture.val}</span>
              </div>
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: "#111" }}>Board</div>

            {visibleMsgs.map((msg) => (
              <div key={msg.id} style={{ background: msg.highlight ? "#f0fdf4" : "#fff", border: `0.5px solid ${msg.highlight ? "#22c55e" : "#e8e8e8"}`, borderRadius: 8, padding: "8px 10px", animation: "slideIn 0.5s ease forwards" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, gap: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, color: "#111" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: msg.dot, flexShrink: 0 }} />
                    {msg.title}
                    {msg.isNew && <span style={{ fontSize: 8, background: "#dcfce7", color: "#16a34a", padding: "1px 5px", borderRadius: 4, fontWeight: 600 }}>NEW</span>}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 8, color: "#bbb", textTransform: "uppercase" }}>{msg.tag}</div>
                    <div style={{ fontSize: 8, color: "#ccc" }}>{msg.date}</div>
                  </div>
                </div>
                <div style={{ fontSize: 10, color: "#777", lineHeight: 1.4 }}>{msg.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes slideIn { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }`}</style>
    </div>
  );
}

function BenefitsSection() {
  return (
    <div className="py-24 sm:py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h3 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
              Everything You Need to Build a Startup
            </span>
          </h3>
          <p className="text-lg text-white/70 max-w-3xl">
            We often hear about the big exits and the overnight success stories, but the reality is that fewer than 1 in 10 ideas ever reach commercial maturity. Most founders discover too late that turning a raw idea into something investable and market-ready is a completely different skill set. Knowing how to validate and shape a product, getting the right advice at the right moment, and walking into an investor meeting with a compelling story, these are things most people have never practiced. StartZig is a complete startup ecosystem where AI guidance and community wisdom come together to help you close that gap.
          </p>
        </div>

        <div className="space-y-10">

          <div>
            <h4 className="text-xl font-bold text-white mb-3">Advanced Tools for Building Your Venture</h4>
            <div className="space-y-2 pl-4">
              <p className="text-white/70 text-base leading-relaxed">• A built-in AI mentor that accompanies you through every section and task, providing guidance, feedback, and professional support at every step — <a href="#mentor-mockup" className="text-purple-300 hover:text-purple-200 underline underline-offset-2 transition-colors">see it in action ↓</a></p>
              <p className="text-white/70 text-base leading-relaxed">• A professional management dashboard and business planning tools to structure your strategy and financial model — <a href="#dashboard-mockup" className="text-purple-300 hover:text-purple-200 underline underline-offset-2 transition-colors">see it in action ↓</a></p>
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

      <JourneyPreview />
      <BenefitsSection />
      <WhoSection />
      <div id="mentor-mockup" className="flex justify-center">
        <MentorMockup />
      </div>
      <div id="dashboard-mockup">
        <div className="py-24 px-6">
          <div className="max-w-4xl mx-auto mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
                A Professional Management Dashboard
              </span>
            </h2>
          </div>
        </div>
        <DashboardMockup />
      </div>
      <VCMockup />
      <div className="py-24 px-6">
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
              A dedicated AI studio for building app demos and mockups in a few clicks
            </span>
          </h2>
          <p className="text-white/70 text-base leading-relaxed">
            Helping you shape your product and collect real feedback while you plan and build.
          </p>
        </div>
        <StudioMockup />
      </div>
      <div className="py-24 px-6">
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
              A real fundraising simulation, driven by our own AI algorithms built to evaluate ventures across every stage — from screening to investment decision.
            </span>
          </h2>
        </div>
        <VCSimulationMockup />
      </div>
      <div className="py-24 px-6">
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
              Real feedback from real users — collected and analyzed through a dedicated feedback system at every stage of your product.
            </span>
          </h2>
        </div>
        <FeedbackMockup />
      </div>
    </div>
  );
}
