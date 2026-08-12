// Home page - 010826
"use client";
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronDown } from "lucide-react"; // [ADDED] FAQ accordion icon

// [ADDED] Auto-cycling phase clock, adapted from the PhaseCompletionDemo clock visual
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

// [ADDED] "Spark Shape Ship" typewriter, types once, weight increases per word
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
    <h2 ref={sectionRef} className="text-4xl md:text-5xl mb-6" style={{ minHeight: "1.2em" }}>
      <span className="text-blue-600">
        <span style={{ fontWeight: 300 }}>{w1}</span>
        <span style={{ fontWeight: 500 }}>{w2}</span>
        <span style={{ fontWeight: 700 }}>{w3}</span>
        {showCursor && <span style={{ borderRight: "2px solid #2563EB" }}>&nbsp;</span>}
      </span>
    </h2>
  );
}

// [ADDED] Fade-in-on-scroll wrapper, triggers once when the section enters the viewport
function FadeInSection({ children, className }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 1s ease-out, transform 1s ease-out",
      }}
    >
      {children}
    </div>
  );
}

// [ADDED] FAQ accordion component
function FAQItems() {
  const [openFaq, setOpenFaq] = useState(null);
  const FAQS = [
    { q: "Do I need technical knowledge to use StartZig?", a: "No. StartZig is designed for founders, not developers. The tools guide you step by step through idea validation, business planning, MVP thinking, and investor preparation." },
    { q: "Can I switch to a different idea or product?", a: "Yes, at any time. StartZig keeps you focused on one active idea at a time, so go to My Account and choose \"Start a New Idea.\" Your current idea will be permanently deleted, but your profile, reputation, feedback history, and AI credits all stay with you for whatever you build next." },
    { q: "How does Zig Profile work?", a: "Every founder has a Zig Profile, visible to other founders you interact with. It shows your current stage (Spark, Plan, Shape, or Beta), your Insight status based on how much feedback you've given other founders, your Zig Age (how long you've been part of the community), and how many ideas you've started. You can view your own profile from My Account, and click on any founder's name to see theirs." },
    { q: "How long does the journey take?", a: "It depends on how intensively you work. A single idea's journey, from first spark to a validated, demo-ready product, takes about 6 months on average. But your journey on StartZig doesn't end there. Once you're ready, you can start a new idea, and stay active in between by giving feedback to other founders." },
    { q: "How is my venture data protected and who can see it?", a: "Your venture data is stored securely using industry-standard security practices. We recommend exercising caution about sharing sensitive proprietary information. StartZig does not accept liability for data breaches. You choose when and with whom to share it, whether that's inviting a co-founder, sharing your beta sign-up page to recruit testers, or sharing your venture landing page to collect community feedback." },
    { q: "What's the difference between the plans?", a: "All plans include the full startup journey. The main differences are the number of monthly AI credits (5 / 100 / 300 / 500) and access to advanced tools like Business Deck and ZigPlan, available on Pro Founder and Unicorn." },
    { q: "What are credits and how do they work?", a: "Credits power the AI features on StartZig. Using Zig it costs 1 credit per interaction. Other AI-powered tools specify their credit cost clearly before you use them. Credits are included in your monthly plan and reset each month. You can top up anytime if you need more." },
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
            className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto animate-slideUp italic"
            style={{ animationDelay: "0.2s" }}
          >
            Where ideas take shape and founders grow.
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
      <div className="pt-2 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Intro, not just another AI tool for startups */}
          <FadeInSection className="mb-10">
            <p className="text-lg text-gray-600">
              StartZig is more than just an AI tool, a founder community, or a business plan generator. It's an ecosystem where founders shape their ideas, get structured feedback from a community of users, and start building an audience of people who can grow with their product.
            </p>
          </FadeInSection>

          {/* Your Idea. Your Community. Your Next Zig. */}
          <FadeInSection className="mb-10">
            <h3 className="text-3xl md:text-4xl font-bold mb-6">
              <span className="text-blue-600 inline-block leading-relaxed pb-2">Your Idea. Your Community. Your Next Zig.</span>
            </h3>
            <p className="text-lg text-gray-600 mb-4">
              You don't need to build alone, or wait until launch to find your first users. Start with an idea. Shape it, share it with the community, and get structured feedback. As your product develops, the same community can become the beginning of your audience, people who follow your progress, engage with what you're building, and may become your first users.
            </p>
            <p className="text-lg text-gray-900 font-semibold text-center">
              Build. Share. Get feedback. Grow your community. Zig again.
            </p>
          </FadeInSection>

          {/* Built for Different Starting Points */}
          <FadeInSection className="mb-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Built for Different Starting Points</h3>
            <div className="space-y-4">
              <p className="text-lg text-gray-600">
                <strong className="text-gray-900">Explorers.</strong> Curious about startups? Experience the journey, explore ideas, and learn by doing.
              </p>
              <p className="text-lg text-gray-600">
                <strong className="text-gray-900">Inventors.</strong> Have an idea? Give it structure, explore possibilities, and turn it into something people can see and react to.
              </p>
              <p className="text-lg text-gray-600">
                <strong className="text-gray-900">Founders.</strong> Already building something? Develop your product, get structured feedback, make better decisions, and start building your first community of users.
              </p>
            </div>
          </FadeInSection>

          <PhaseClock />

          {/* CTA, copied from the WhyStartZig page */}
          <div className="text-center py-6">
            <Link href="/register">
              <button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full text-lg font-medium transition-all">
                Start Your Journey
              </button>
            </Link>
          </div>

          {/* Human Insight. AI Intelligence. Founder Decisions, standalone heading, same style as other big headings */}
          <FadeInSection className="mt-20 mb-10">
            <h3 className="text-3xl md:text-4xl font-bold mb-6">
              <span className="text-blue-600 inline-block leading-relaxed pb-2">Human Insight. AI Intelligence. Founder Decisions.</span>
            </h3>
            <p className="text-lg text-gray-600">
              The AI revolution is transforming the way we create, analyze, and make decisions. But AI is still not human, it lacks the intuition, feelings, experience, and judgment that are so important when it comes to understanding products and the people who use them. StartZig developed a multi-layer system that brings community insight, AI intelligence, and founder decision-making into one continuous product-building process. The community provides the perspective. AI finds the patterns. Founders make the decisions. The cycle repeats throughout the journey, turning real community feedback into deeper product insights and helping founders decide what to focus on next.
            </p>
          </FadeInSection>

          {/* Our DNA, heading for the feature list below */}
          <FadeInSection>
            <h3 className="text-3xl md:text-4xl font-bold mb-6 mt-20">
              <span className="text-blue-600 inline-block leading-relaxed pb-2">Our DNA</span>
            </h3>

            <div className="space-y-6">
              {[
                {
                  title: "Not just a startup. A founder.",
                  body: "StartZig is not a one-time experience. The experience you build today helps your next venture. Every idea you develop, every insight you share, and every founder you help builds your experience and reputation over time.",
                },
                {
                  title: "Think like a product manager",
                  body: (
                    <>
                      StartZig gives you access to professional tools that help you think through your product, especially in the earliest stages. Define your idea. Explore your options. Visualize what you're building. Collect feedback. Understand what users are telling you. Make decisions. The{" "}
                      <Link href="/the-toolkit" className="text-blue-600 font-semibold hover:underline">Toolkit</Link> brings professional tools, community insight, and AI-powered support together in one place.
                    </>
                  ),
                },
                {
                  title: "Visual thinking, at every stage",
                  body: "Ideas become easier to understand when you can see them. StartZig includes tools for creating mockups and demos that evolve with your idea, giving the community something real to react to and giving you something concrete to improve.",
                },
                {
                  title: "Simple. Transparent.",
                  body: "Your journey from idea to defined product and demo is free. No trials. No gimmicks. You only pay if you choose additional AI capabilities or advanced features.",
                },
                {
                  title: "You control your ideas",
                  body: "Your work stays yours. Only you decide what to share, when to share it, and how much exposure you want. You decide when your idea is ready for feedback, what you want the community to see, and how you use the insights you receive. The community contributes. AI finds the patterns. You decide. Then you Zig.",
                },
              ].map((item, i) => (
                <div key={i}>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h4>
                  <p className="text-gray-600 text-base leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </FadeInSection>
        </div>
      </div>

      {/* [ADDED] FAQ Section */}
      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-16">
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
