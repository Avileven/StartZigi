// Home page - static version v4
"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import JourneyPreview from "@/components/utils/JourneyPreview";


function DashboardMockup() {
  useEffect(() => {
    const msg3 = document.getElementById('sz-msg3');
    const msg2 = document.getElementById('sz-msg2');
    const msg1 = document.getElementById('sz-msg1');
    if (msg3) msg3.style.opacity = '1';
    if (msg3) msg3.style.transform = 'translateX(0)';
    if (msg2) setTimeout(() => { msg2.style.opacity = '1'; msg2.style.transform = 'translateX(0)'; }, 1000);
    if (msg1) setTimeout(() => { msg1.style.opacity = '1'; msg1.style.transform = 'translateX(0)'; }, 2000);
  }, []);

  const navItems = [
    { label: 'Home', path: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10' },
    { label: 'Dashboard', active: true, path: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z' },
    { label: 'Exit Path', path: 'M23 6L13.5 15.5 8.5 10.5 1 18 M17 6h6v6' },
    { label: 'Landing Page', path: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6 M15 3h6v6 M10 14L21 3' },
    { label: 'Beta Page', path: 'M12 2L2 7l10 5 10-5-10-5M2 17l10 5 10-5M2 12l10 5 10-5' },
    { label: 'Angel Arena', path: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8' },
    { label: 'VC Marketplace', path: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
    { label: 'My Account', path: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8' },
  ];

  const tools = ['Financials', 'Business Plan', 'Invite Co-Founder', 'Promotion Center', 'ZigForge Studio', 'Product Feedback', 'Revenue Modeling', 'Beta Testing Page', 'Venture Pitch'];

  const msgStyle = { background: '#fff', border: '0.5px solid #e8e8e8', borderRadius: 8, padding: '8px 10px', opacity: 0, transform: 'translateX(-20px)', transition: 'opacity 0.6s ease, transform 0.6s ease' };

  return (
    <div className="py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div style={{ background: '#f0f0f5', borderRadius: 14, overflow: 'hidden', border: '0.5px solid #ddd' }}>
          
          {/* Topbar */}
          <div style={{ background: '#fff', borderBottom: '0.5px solid #e8e8e8', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>Good morning, Sarah!</div>
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>Monday, April 6, 2026</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: '#aaa' }}>Current Phase</span>
              <span style={{ background: '#fff3e0', color: '#d97706', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>BETA</span>
            </div>
          </div>

          {/* Body */}
          <div style={{ display: 'grid', gridTemplateColumns: '170px 170px 1fr' }}>
            
            {/* Nav */}
            <div style={{ background: '#fff', borderRight: '0.5px solid #eee', padding: '12px 0', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 9, color: '#ccc', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 14px 8px' }}>Navigation</div>
              {navItems.map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', fontSize: 12, color: item.active ? '#6c47ff' : '#666', fontWeight: item.active ? 600 : 400, background: item.active ? '#f3f0ff' : 'transparent' }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, flexShrink: 0 }}>
                    <path d={item.path}/>
                  </svg>
                  {item.label}
                </div>
              ))}
              <div style={{ marginTop: 'auto', borderTop: '0.5px solid #f0f0f0', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#ede9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#6c47ff', flexShrink: 0 }}>S</div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 500, color: '#333' }}>sarah@novamed.io</div>
                  <div style={{ fontSize: 9, color: '#aaa' }}>Impact Plan</div>
                </div>
              </div>
            </div>

            {/* Toolbox */}
            <div style={{ background: '#fafafa', borderRight: '0.5px solid #eee', padding: 12, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ fontSize: 9, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Toolbox</div>
              {tools.map((t) => (
                <div key={t} style={{ background: '#fff', border: '0.5px solid #e8e8e8', borderRadius: 7, padding: '7px 10px', fontSize: 11, color: '#444' }}>{t}</div>
              ))}
            </div>

            {/* Board */}
            <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ background: '#fff', border: '0.5px solid #e8e8e8', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 5 }}>NovaMed</div>
                <div style={{ display: 'flex', gap: 6, fontSize: 10, color: '#999' }}>
                  <span>20 messages</span><span>·</span><span>1 founder</span><span>·</span><span>Balance: $220,151</span><span>·</span><span>Val: $2M</span>
                </div>
              </div>

              <div style={{ fontSize: 12, fontWeight: 700, color: '#111' }}>Board</div>

              <div id="sz-msg3" style={msgStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, color: '#111' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ec4899', flexShrink: 0 }}></div>New Beta Tester
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 8, color: '#bbb', textTransform: 'uppercase' }}>System</div>
                    <div style={{ fontSize: 8, color: '#ccc' }}>Mar 29, 2026</div>
                  </div>
                </div>
                <div style={{ fontSize: 10, color: '#777', lineHeight: 1.4 }}>You now have 5/50 beta sign-ups. Keep sharing your beta page to reach your goal.</div>
              </div>

              <div id="sz-msg2" style={msgStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, color: '#111' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }}></div>Screening Meeting Scheduled
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 8, color: '#bbb', textTransform: 'uppercase' }}>VC Marketplace</div>
                    <div style={{ fontSize: 8, color: '#ccc' }}>Apr 2, 2026</div>
                  </div>
                </div>
                <div style={{ fontSize: 10, color: '#777', lineHeight: 1.4 }}>Velocity Wave Partners agreed to a screening call. Prepare your pitch deck before the meeting.</div>
              </div>

              <div id="sz-msg1" style={{ ...msgStyle, borderColor: '#22c55e', background: '#f0fdf4' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, color: '#111' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }}></div>
                    VC Investment Offer Received
                    <span style={{ fontSize: 8, background: '#dcfce7', color: '#16a34a', padding: '1px 5px', borderRadius: 4, fontWeight: 600 }}>NEW</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 8, color: '#bbb', textTransform: 'uppercase' }}>VC Marketplace</div>
                    <div style={{ fontSize: 8, color: '#ccc' }}>Just now</div>
                  </div>
                </div>
                <div style={{ fontSize: 10, color: '#777', lineHeight: 1.4 }}>Meridian Stone Capital is offering $1,500,000 at a $5M pre-money valuation. You have 48 hours to accept or negotiate.</div>
              </div>

            </div>
          </div>
        </div>
      </div>
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
              <p className="text-white/70 text-base leading-relaxed">• Business planning tools to structure your strategy and financial model</p>
              <p className="text-white/70 text-base leading-relaxed">• Product development tools at different stages of your product, including a dedicated studio for building prototypes and mockups</p>
              <p className="text-white/70 text-base leading-relaxed">• Marketing tools, run campaigns, build your landing page, and promote your venture to early users</p>
              <p className="text-white/70 text-base leading-relaxed">• A built-in AI mentor that accompanies you through every section and task, providing guidance, feedback, and professional support at every step</p>
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

      <DashboardMockup />
      <BenefitsSection />
      <JourneyPreview />
      <WhoSection />
    </div>
  );
}
