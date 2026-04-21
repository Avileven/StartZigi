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
import BusinessDeckMockup from "@/components/utils/BusinessDeckMockup";






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

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-gray-900/80 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-2">
          <svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="700 700 620 620" preserveAspectRatio="xMidYMid meet">
            <g fill="#949597FF"><path d="M 874.42 1040.08 C 874.19 1039.85 874.00 990.02 874.00 929.33 L 874.00 819.00 L 999.23 819.00 L 1124.45 819.00 L 1116.48 827.25 C 1112.09 831.79 1104.46 839.66 1099.52 844.75 L 1090.54 854.00 L 999.77 854.00 L 909.00 854.00 L 909.00 930.00 L 909.00 1006.00 L 935.55 1006.00 C 958.14 1006.00 961.98 1006.21 961.30 1007.41 C 960.86 1008.19 953.66 1015.79 945.29 1024.31 L 930.08 1039.79 L 902.46 1040.14 C 887.26 1040.34 874.65 1040.31 874.42 1040.08Z"/></g>
            <g fill="#949597FF"><path d="M 814.11 1236.20 C 813.36 1235.95 813.00 1230.41 813.00 1218.92 L 813.00 1202.00 L 816.75 1201.87 C 818.81 1201.80 888.90 1201.69 972.50 1201.62 L 1124.50 1201.50 L 1124.50 1121.00 L 1124.50 1040.50 L 1044.50 1040.49 C 992.20 1040.48 964.61 1040.14 964.81 1039.49 C 964.98 1038.95 972.35 1031.19 981.19 1022.25 L 997.26 1006.00 L 1078.63 1006.00 L 1160.01 1006.00 L 1159.75 1121.25 L 1159.50 1236.50 L 987.36 1236.54 C 892.68 1236.56 814.72 1236.41 814.11 1236.20Z"/></g>
            <g fill="#B83B35FF"><path d="M 1008.00 995.00 C 1008.00 993.90 1011.93 989.41 1021.87 979.16 C 1025.51 975.40 1040.20 960.02 1054.50 944.99 C 1068.80 929.96 1083.88 914.16 1088.00 909.88 C 1129.34 866.93 1139.94 855.71 1139.97 854.86 C 1140.03 853.50 1134.66 852.98 1127.12 853.61 C 1117.19 854.44 1110.00 853.47 1110.00 851.30 C 1110.00 850.44 1111.01 848.74 1112.25 847.53 C 1113.49 846.32 1120.30 839.42 1127.40 832.19 L 1140.30 819.04 L 1180.25 818.77 C 1202.22 818.62 1220.65 818.79 1221.22 819.13 C 1221.78 819.48 1222.08 820.25 1221.87 820.83 C 1221.67 821.41 1215.42 828.29 1208.00 836.10 C 1200.58 843.92 1193.15 851.74 1191.50 853.49 C 1189.85 855.24 1182.15 863.38 1174.40 871.58 C 1166.64 879.79 1159.21 887.68 1157.90 889.11 C 1154.52 892.79 1125.55 923.34 1112.96 936.49 C 1107.17 942.55 1098.39 951.72 1093.46 956.88 C 1088.53 962.04 1081.14 969.69 1077.04 973.88 C 1072.94 978.07 1067.12 984.20 1064.11 987.50 C 1061.09 990.80 1057.70 994.05 1056.56 994.71 C 1053.94 996.26 1008.00 996.53 1008.00 995.00Z"/></g>
            <g fill="#B83B35FF"><path d="M 824.00 1190.83 C 824.00 1190.18 829.78 1183.77 836.84 1176.58 C 843.89 1169.39 853.23 1159.70 857.59 1155.06 C 861.94 1150.42 866.89 1145.24 868.59 1143.56 C 870.29 1141.88 877.02 1134.88 883.54 1128.00 C 890.06 1121.12 900.83 1109.88 907.46 1103.00 C 914.10 1096.12 927.56 1082.09 937.39 1071.81 C 947.22 1061.53 955.99 1052.84 956.87 1052.49 C 959.31 1051.56 1003.20 1051.80 1004.16 1052.76 C 1004.61 1053.21 1002.40 1056.30 999.24 1059.62 C 992.21 1067.01 978.20 1081.81 960.13 1100.91 C 952.63 1108.84 944.70 1117.18 942.50 1119.44 C 938.59 1123.47 926.65 1135.95 906.60 1157.00 C 901.09 1162.78 891.24 1173.01 884.69 1179.75 L 872.80 1192.00 L 848.40 1192.00 C 830.42 1192.00 824.00 1191.69 824.00 1190.83Z"/></g>
          </svg>
          <span className="text-white font-bold text-lg tracking-wide">StartZig</span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <button onClick={handleLogout} className="text-white/70 hover:text-white text-sm transition-colors">Sign out</button>
          ) : (
            <button onClick={handleLogin} className="text-white/70 hover:text-white text-sm transition-colors">Sign in</button>
          )}
        </div>
      </nav>

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
            A complete startup ecosystem combining AI guidance, real user feedback and structured venture building tools.
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
{/* 8. Business Deck */}
<div className="py-16 px-6">
  <div className="max-w-4xl mx-auto mb-8">
    <h2 className="text-3xl md:text-4xl font-bold mb-2">
      <span className="text-white">
        Your Investor Business Plan, Generated
      </span>
    </h2>
    <p className="text-white/55 text-sm">
      StartZig assembles everything you've built into a professional investor-ready business plan — with AI analysis, revenue forecast, and break-even analysis. Available on Pro Founder and above.
    </p>
  </div>
  <BusinessDeckMockup autoStart={false} />
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
