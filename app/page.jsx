// Home page - 170726
"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronDown } from "lucide-react"; // [ADDED] FAQ accordion icon







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
      <style>{`
        @keyframes ring28 { 0%,19%{opacity:0} 21%,100%{opacity:1} }
        @keyframes ring42 { 0%,39%{opacity:0} 41%,100%{opacity:1} }
        @keyframes ring56 { 0%,59%{opacity:0} 61%,100%{opacity:1} }
        @keyframes ring70 { 0%,79%{opacity:0} 81%,100%{opacity:1} }
        .sz-r28{animation:ring28 6s linear infinite;} .sz-r42{animation:ring42 6s linear infinite;}
        .sz-r56{animation:ring56 6s linear infinite;} .sz-r70{animation:ring70 6s linear infinite;}
        @keyframes pTop    { 0%,12%{opacity:0} 15%{opacity:1} 20%{opacity:0} 100%{opacity:0} }
        @keyframes pBottom { 0%,32%{opacity:0} 35%{opacity:1} 40%{opacity:0} 100%{opacity:0} }
        @keyframes pRight  { 0%,52%{opacity:0} 55%{opacity:1} 60%{opacity:0} 100%{opacity:0} }
        @keyframes pLeft   { 0%,72%{opacity:0} 75%{opacity:1} 80%{opacity:0} 100%{opacity:0} }
        @keyframes moveTop    { 0%,15%{transform:translateY(0)} 20%{transform:translateY(101px)} 100%{transform:translateY(101px)} }
        @keyframes moveBottom { 0%,35%{transform:translateY(0)} 40%{transform:translateY(-111px)} 100%{transform:translateY(-111px)} }
        @keyframes moveRight  { 0%,55%{transform:translateX(0)} 60%{transform:translateX(-121px)} 100%{transform:translateX(-121px)} }
        @keyframes moveLeft   { 0%,75%{transform:translateX(0)} 80%{transform:translateX(121px)} 100%{transform:translateX(121px)} }
        .sz-pt{animation:pTop 6s linear infinite;} .sz-pb{animation:pBottom 6s linear infinite;}
        .sz-pr{animation:pRight 6s linear infinite;} .sz-pl{animation:pLeft 6s linear infinite;}
        .sz-mt{animation:moveTop 6s linear infinite;} .sz-mb{animation:moveBottom 6s linear infinite;}
        .sz-mr{animation:moveRight 6s linear infinite;} .sz-ml{animation:moveLeft 6s linear infinite;}
        @keyframes lblIdea  { 0%,16%{opacity:1} 20%{opacity:0} 100%{opacity:0} }
        @keyframes lblFinal { 0%,82%{opacity:0} 86%,100%{opacity:1} }
        .sz-li{animation:lblIdea 6s linear infinite;} .sz-lf{animation:lblFinal 6s linear infinite;}
        @media (prefers-reduced-motion: reduce) {
          .sz-r28,.sz-r42,.sz-r56,.sz-r70{animation:none;opacity:1;}
          .sz-pt,.sz-pb,.sz-pr,.sz-pl,.sz-mt,.sz-mb,.sz-mr,.sz-ml{animation:none;opacity:0;}
          .sz-li{animation:none;opacity:0;} .sz-lf{animation:none;opacity:1;}
        }
      `}</style>
      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
              Not another AI tool someone thought would be nice to have.
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mb-10">
            StartZig is a real, structured practical process for turning a raw idea into something you'd actually stake a business on — built from the ground up around one person, working alone, from the very first spark of an idea to a validated, demo-ready product.
          </p>

          {/* [PLACEHOLDER — content flying into the center is still being finalized] */}
          <div className="w-full flex justify-center mb-10">
            <svg width="100%" viewBox="0 0 680 420" style={{ maxWidth: 560 }} role="img">
              <title>An idea growing new rings as each stage merges into it</title>
              <g className="sz-mt"><circle className="sz-pt" fill="#3457D5" cx="340" cy="99" r="6" /></g>
              <text x="340" y="64" textAnchor="middle" className="sz-pt" style={{ fontSize: 13, fill: "#55596B", fontFamily: "Inter, sans-serif" }}>Business foundation</text>
              <g className="sz-mb"><circle className="sz-pb" fill="#3457D5" cx="340" cy="311" r="6" /></g>
              <text x="340" y="351" textAnchor="middle" className="sz-pb" style={{ fontSize: 13, fill: "#55596B", fontFamily: "Inter, sans-serif" }}>Minimum viable product</text>
              <g className="sz-mr"><circle className="sz-pr" fill="#3457D5" cx="461" cy="200" r="6" /></g>
              <text x="476" y="204" textAnchor="start" className="sz-pr" style={{ fontSize: 13, fill: "#55596B", fontFamily: "Inter, sans-serif" }}>Community feedback</text>
              <g className="sz-ml"><circle className="sz-pl" fill="#3457D5" cx="219" cy="200" r="6" /></g>
              <text x="204" y="204" textAnchor="end" className="sz-pl" style={{ fontSize: 13, fill: "#55596B", fontFamily: "Inter, sans-serif" }}>Mockup</text>
              <g className="sz-r70"><circle cx="340" cy="200" r="70" fill="#6E5AD6" opacity="0.14" /></g>
              <g className="sz-r56"><circle cx="340" cy="200" r="56" fill="#6E5AD6" opacity="0.20" /></g>
              <g className="sz-r42"><circle cx="340" cy="200" r="42" fill="#6E5AD6" opacity="0.30" /></g>
              <g className="sz-r28"><circle cx="340" cy="200" r="28" fill="#6E5AD6" opacity="0.45" /></g>
              <circle cx="340" cy="200" r="14" fill="#6E5AD6" />
              <text x="340" y="300" textAnchor="middle" className="sz-li" style={{ fontSize: 14, fill: "#12131A", fontWeight: 600, fontFamily: "Inter, sans-serif" }}>Idea</text>
              <text x="340" y="300" textAnchor="middle" className="sz-lf" style={{ fontSize: 14, fill: "#12131A", fontWeight: 600, fontFamily: "Inter, sans-serif" }}>Validated product</text>
            </svg>
          </div>

          <div className="space-y-5">
            {[
              {
                title: "Not just a startup. A founder.",
                body: "The goal isn't just growing a venture — it's growing the founder behind it. By the end, you're not just holding a validated idea; you're ready for what's next: full development, or raising a seed round.",
              },
              {
                title: "Transparency is not just a slogan",
                body: "No surprises here. Your entire journey, from idea to pitching investors, is free, and always will be, with no trial days and no gimmicks. You only pay if you want an extra layer of AI power along the way.",
              },
              {
                title: "Built by founders for the next generation.",
                body: "Not theory, not an academic framework. StartZig reflects the real, hands-on experience of founders who've built and evaluated startups themselves.",
              },
              {
                title: "Hard work. No shortcuts.",
                body: "Every successful founder will tell you the same thing first: it took hard work. A mentor or AI magic won't do it for you — they're just tools. You're the one who gets your hands dirty and drives the process forward.",
              },
              {
                title: "Community feedback, built into the process",
                body: "There's no feedback more valuable than hearing it from peer founders — real cross-pollination, not a courtesy comment. That's why it's built directly into the product-definition process, not bolted on.",
              },
              {
                title: "Full control over your information",
                body: "We keep your information secure in the system. Only you decide whether to release part of it to the community to get feedback on your progress. And keep in mind — some of the people giving you that feedback could become your future customers :)",
              },
              {
                title: "Visual thinking, at every stage",
                body: "Founders used to sketch ideas on napkins just to make them visual :) It's a basic, critical instinct for anyone shaping an idea. So we built a dedicated tool for creating mockups of ideas — one that stays with you throughout the entire process.",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-gray-900 mt-2.5"></div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1.5">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Full Features List ── */}
      <div id="features">
        <div className="pt-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-2">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
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
