"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Rocket, Lightbulb, Target, ArrowRight, TrendingUp, 
  Gamepad2, FlaskConical, CheckCircle2, Award, Heart, Zap, ChevronRight 
} from "lucide-react";

export default function Home() {
  const stages = [
    { name: "Idea", icon: Lightbulb, color: "text-yellow-400", bg: "bg-yellow-400/10" },
    { name: "MVP", icon: Zap, color: "text-blue-400", bg: "bg-blue-400/10" },
    { name: "MLP", icon: Heart, color: "text-rose-400", bg: "bg-rose-400/10" },
    { name: "Beta", icon: Target, color: "text-indigo-400", bg: "bg-indigo-400/10" },
    { name: "Growth", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { name: "Exit", icon: Award, color: "text-purple-400", bg: "bg-purple-400/10" }
  ];

  return (
    <div className="bg-[#020617] text-slate-50 min-h-screen selection:bg-indigo-500/30 font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-2xl font-black tracking-tighter italic text-indigo-500">STARTZIG</div>
          <div className="flex gap-4">
            <Button variant="ghost" className="text-slate-400 hover:text-white transition-colors">Login</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-500 px-6">Join Beta</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px]" />
          <div className="absolute -top-[25%] -right-[10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-8 leading-tight">
            DON'T JUST START UP. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              STARTZIG.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            The interactive platform where <span className="text-slate-200 font-medium">ideas become ventures</span>, and ventures become experiences.
          </p>
          <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 h-16 rounded-full text-xl font-bold shadow-2xl shadow-indigo-500/20">
            Start Your Journey <ChevronRight className="ml-2" />
          </Button>
        </div>
      </section>

      {/* The Venture Lifecycle - רצועה מעוצבת */}
      <section className="py-20 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stages.map((stage, i) => (
              <div key={i} className="flex flex-col items-center p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group">
                <div className={`w-12 h-12 rounded-full ${stage.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <stage.icon className={`w-6 h-6 ${stage.color}`} />
                </div>
                <span className="font-bold text-sm tracking-widest uppercase text-slate-300">{stage.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audiences - גובה אחיד וסימטריה */}
      <section className="py-32 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Card 1 */}
          <div className="relative group p-12 rounded-[2.5rem] bg-slate-900/50 border border-white/10 flex flex-col min-h-[480px]">
            <div className="mb-8">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400">
                <Gamepad2 size={32} />
              </div>
              <h3 className="text-4xl font-bold mb-6 italic">“Could I do that too?”</h3>
              <p className="text-lg text-slate-400 leading-relaxed">
                Ever read about a massive tech exit? Now you can experience it. 
                StartZig lets you build ventures and attract virtual investors with <span className="text-white">zero risk</span>.
              </p>
            </div>
            <div className="mt-auto">
              <span className="text-indigo-400 font-bold flex items-center tracking-widest uppercase text-xs">
                For Simulation Enthusiasts <div className="h-px w-12 bg-indigo-400/30 ml-3" />
              </span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="relative group p-12 rounded-[2.5rem] bg-indigo-950/20 border border-indigo-500/20 flex flex-col min-h-[480px]">
            <div className="mb-8">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-6 text-emerald-400">
                <Rocket size={32} />
              </div>
              <h3 className="text-4xl font-bold mb-6">Test Before You Invest.</h3>
              <div className="space-y-4">
                {[
                  "Validate your concept in a structured environment",
                  "Prepare for real-world funding conversations",
                  "Gain exposure to a community of experts"
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    <p className="text-slate-300 text-lg">{text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-auto">
              <span className="text-emerald-400 font-bold flex items-center tracking-widest uppercase text-xs">
                For Serious Entrepreneurs <div className="h-px w-12 bg-emerald-400/30 ml-3" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Lab Banner - Clean & Impactful */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <FlaskConical className="w-16 h-16 mx-auto mb-8 text-white/40" />
            <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">
              Not a textbook – <br className="md:hidden" /> a startup laboratory.
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {["QuitFlow", "EcoWaste AI", "Gezunt", "UrbanConnect"].map((v) => (
                <div key={v} className="bg-black/20 backdrop-blur-sm border border-white/10 px-6 py-2 rounded-full text-sm font-bold tracking-widest">
                  {v}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="py-20 border-t border-white/5 text-center">
        <p className="text-slate-500 font-medium tracking-wide">
          StartZig &copy; 2024 — EXPERIENCE THE STARTUP JOURNEY.
        </p>
      </footer>
    </div>
  );
}