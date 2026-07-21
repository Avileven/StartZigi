// Home page - 240426
"use client";
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronDown } from "lucide-react"; // [ADDED] FAQ accordion icon

// [ADDED] Auto-cycling phase clock — adapted from the PhaseCompletionDemo clock visual
const CLOCK_PHASES = ['idea', 'business_plan', 'mvp', 'mlp', 'beta', 'growth'];
const CLOCK_LABELS = ['IDEA', 'PLAN', 'MVP', 'MLP', 'BETA', 'GROWTH'];
const CLOCK_POSITIONS = [{ x: 160, y: 64 }, { x: 247, y: 112 }, { x: 247, y: 216 }, { x: 160, y: 260 }, { x: 73, y: 216 }, { x: 73, y: 112 }];
const CLOCK_ROTATIONS = [0, 60, 120, 180, 240, 300];
const CLOCK_COLORS = {
  idea: "#10b981",
  business_plan: "#f97316",
  mvp: "#3b82f6",
  mlp: "#a855f7",
  beta: "#ec4899",
  growth: "#eab308",
};

function PhaseClock() {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % CLOCK_PHASES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const currentPhase = CLOCK_PHASES[phaseIndex];
  const activeColor = CLOCK_COLORS[currentPhase];
  const seg = 879 / 6;
  const arcOffset = 879 - seg * (phaseIndex + 1);
  const rotation = CLOCK_ROTATIONS[phaseIndex];

  return (
    <div className="flex flex-col items-center py-10">
      <svg width="320" height="320" viewBox="0 0 320 320">
        <circle cx="160" cy="160" r="140" fill="#F6F7FB" stroke="#E9E9F0" strokeWidth="1.5" />
        <circle
          cx="160" cy="160" r="140" fill="none" stroke={activeColor} strokeWidth="12" strokeLinecap="round"
          strokeDasharray="879" strokeDashoffset={arcOffset}
          style={{ transform: "rotate(-90deg)", transformOrigin: "160px 160px", transition: "stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1), stroke 1.5s ease" }}
        />
        <circle cx="160" cy="160" r="60" fill="#EFEFF7" />
        {CLOCK_LABELS.map((label, i) => (
          <text
            key={i}
            x={CLOCK_POSITIONS[i].x} y={CLOCK_POSITIONS[i].y}
            fontSize={CLOCK_PHASES[i] === currentPhase ? "13" : "11"}
            fill={CLOCK_PHASES[i] === currentPhase ? CLOCK_COLORS[CLOCK_PHASES[i]] : "#9CA3AF"}
            textAnchor="middle"
            fontWeight={CLOCK_PHASES[i] === currentPhase ? "800" : "600"}
            fontFamily="Inter, sans-serif"
          >
            {label}
          </text>
        ))}
        <path
          fill="#4C3FA8"
          d="M158 160 L162 160 L162 75 L158 75 Z"
          style={{ transform: `rotate(${rotation}deg)`, transformOrigin: "160px 160px", transition: "transform 1.5s cubic-bezier(0.4,0,0.2,1)" }}
        />
        <circle cx="160" cy="160" r="6" fill="#3457D5" />
      </svg>
      <p className="text-gray-500 text-sm mt-2">The clock is ticking. Ready to Zig?</p>
    </div>
  );
}

// [ADDED] "Spark Shape Ship" typewriter — types once, weight increases per word
function SparkShapeShip() {
  const [w1, setW1] = useState("");
  const [w2, setW2] = useState("");
  const [w3, setW3] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const hasStarted = useRef(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasStarted.current) {
            hasStarted.current = true;
            startTyping();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const startTyping = () => {
    const words = [
      { text: "Spark ", setter: setW1 },
      { text: "Shape ", setter: setW2 },
      { text: "Ship", setter: setW3 },
    ];
    let wIdx = 0;
    let cIdx = 0;
    function tick() {
      if (wIdx >= words.length) {
        setShowCursor(false);
        return;
      }
      const current = words[wIdx];
      if (cIdx <= current.text.length) {
        current.setter(current.text.slice(0, cIdx));
        cIdx++;
        setTimeout(tick, 120);
      } else {
        wIdx++;
        cIdx = 0;
        setTimeout(tick, 120);
      }
    }
    tick();
  };

  return (
    <h2 ref={sectionRef} className="text-4xl md:text-5xl mb-6 text-gray-900" style={{ minHeight: "1.2em" }}>
      <span style={{ fontWeight: 300 }}>{w1}</span>
      <span style={{ fontWeight: 500 }}>{w2}</span>
      <span style={{ fontWeight: 700 }}>{w3}</span>
      {showCursor && <span style={{ borderRight: "2px solid #111827" }}>&nbsp;</span>}
    </h2>
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
            A training platform for growing raw ideas into startups, and inventors into founders. The platform combines a dedicated toolset, community wisdom, and AI-powered&nbsp;technical&nbsp;support.
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
          <SparkShapeShip />

          <div className="mb-10">
            <p className="text-lg text-gray-600 max-w-3xl">
              StartZig lets you follow a structured, practical process for turning a raw idea into something you'd actually stake a business on — built from the ground up around one person, working alone, from the very first spark of an idea to a validated, demo-ready product.
            </p>
            <p className="text-lg text-gray-600 max-w-3xl mt-4">
              StartZig is designed for a variety of needs and stages — <strong className="text-gray-900">Explorers</strong>, who want to experience the startup journey, supported by a built-in idea bank to get started, <strong className="text-gray-900">Inventors</strong>, ready to turn their ideas into reality, and early-stage <strong className="text-gray-900">Founders</strong>, seeking real feedback and access to potential users.
            </p>
          </div>

          <h3 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">Our DNA</span>
          </h3>

          <div className="space-y-6">
            {[
              {
                title: "Built by founders for the next generation.",
                body: "Not theory, not an academic framework. Grounded in real, hands-on research: watching how ideas actually develop, across dozens of founders, private ventures, accelerators and investor feedback.",
              },
              {
                title: "Not just a startup. A founder.",
                body: "During your journey with StartZig, you'll shape your idea into something real and build up real knowledge and experience along the way. By the end, both the idea and you will be far more ready to raise funding and start development.",
              },
              {
                title: "Hard work. No shortcuts.",
                body: "Every successful founder will tell you the same thing first: it took hard work. A mentor or AI magic won't do it for you — they're just tools. You're the one who gets your hands dirty and drives the process forward.",
              },
              {
                title: "Turning you into a product manager",
                body: (
                  <>
                    We give you access to professional tools that strengthen your product management skills, especially in the earliest stages, helping you navigate between product decisions, creativity, and mental flexibility. For more, see everything inside the{" "}
                    <Link href="/the-toolkit" className="text-blue-600 font-semibold hover:underline">Toolkit</Link>.
                  </>
                ),
              },
              {
                title: "Community feedback, built into the process",
                body: "There's no feedback more valuable than hearing it from peer founders — real cross-pollination, not a courtesy comment. That's why it's built directly into the product-definition process, not bolted on.",
              },
              {
                title: "Visual thinking, at every stage",
                body: "Founders used to sketch ideas on napkins just to make them visual :) It's a basic, critical instinct for anyone shaping an idea. So we built a dedicated tool for creating mockups of ideas — one that stays with you throughout the entire process.",
              },
              {
                title: "Transparency is not just a slogan",
                body: "No surprises here. Your entire journey, from idea to pitching investors, is free, and always will be, with no trial days and no gimmicks. You only pay if you want an extra layer of AI power along the way.",
              },
              {
                title: "Full control over your information",
                body: "We keep your information secure in the system. Only you decide whether to release part of it to the community to get feedback on your progress. And keep in mind — some of the people giving you that feedback could become your future customers :)",
              },
            ].map((item, i) => (
              <div key={i}>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h4>
                <p className="text-gray-600 text-base leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <PhaseClock />

      {/* CTA — copied from the WhyStartZig page */}
      <div className="text-center py-6 px-6">
        <Link href="/register">
          <button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full text-lg font-medium transition-all">
            Start Your Journey
          </button>
        </Link>
      </div>

      {/* [ADDED] FAQ Section */}
      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-10">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
              Frequently Asked Questions
            </span>
          </h2>
          <FAQItems />
        </div>
      </div>
    </div>
  );
}
