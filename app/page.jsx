// ניסיון
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Rocket, Lightbulb, Target, ArrowRight, 
  Gamepad2, FlaskConical, CheckCircle2, Users, GraduationCap, Briefcase
} from "lucide-react";

export default function Home() {
  return (
    <div className="bg-[#020617] text-slate-50 min-h-screen font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-bold tracking-tighter text-indigo-500">STARTZIG</div>
          <Button variant="ghost" className="text-slate-400 hover:text-white transition-colors">Login</Button>
        </div>
      </nav>

      {/* Hero Section - סלוגן בגודל מקורי */}
      <section className="relative pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
            Don't just start up. <span className="text-indigo-400">StartZig.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            The interactive platform where ideas become ventures, and ventures become experiences.
          </p>
          <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 h-12 rounded-lg font-bold">
            Start Your Journey <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* קבוצות משתמשים - כל ה-5 מהמסמך */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <h2 className="text-2xl font-bold mb-10 text-center text-slate-300 uppercase tracking-widest">Who is StartZig for?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* 1. Simulation Enthusiasts */}
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/10 flex flex-col h-full">
            <Gamepad2 className="text-indigo-400 mb-4" size={28} />
            <h3 className="text-xl font-bold mb-3 italic">Simulation Enthusiasts</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              "Could I do that too?" Experience the startup world with zero risk. Build ventures, make strategic decisions, and reach a virtual exit.
            </p>
          </div>

          {/* 2. Entrepreneurs With an Idea */}
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/10 flex flex-col h-full">
            <Rocket className="text-emerald-400 mb-4" size={28} />
            <h3 className="text-xl font-bold mb-3">Entrepreneurs</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Validate and pressure-test your concept before you go all-in. Test before you invest and gain smart exposure.
            </p>
          </div>

          {/* 3. Mentors & Programs */}
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/10 flex flex-col h-full">
            <Users className="text-purple-400 mb-4" size={28} />
            <h3 className="text-xl font-bold mb-3">Mentors & Programs</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              A training and evaluation platform for accelerators and incubators. Track decision-making and deliver targeted feedback.
            </p>
          </div>

          {/* 4. Academic & Hackathons */}
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/10 flex flex-col h-full">
            <GraduationCap className="text-blue-400 mb-4" size={28} />
            <h3 className="text-xl font-bold mb-3">Academic Institutions</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Perfect for business schools and hackathons. Experience how startups evolve across real stages through independent study.
            </p>
          </div>

          {/* 5. Independent Learners */}
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/10 flex flex-col h-full">
            <Briefcase className="text-orange-400 mb-4" size={28} />
            <h3 className="text-xl font-bold mb-3">Independent Study</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Practice pitching, market analysis, and business modeling in a structured, engaging environment.
            </p>
          </div>

        </div>
      </section>

      {/* What StartZig Gives You - תוכן מהמסמך */}
      <section className="py-16 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-10 text-center">What StartZig Gives You</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              "A structured entrepreneurial journey",
              "Simulation of growth & investment",
              "Exposure to a community of founders",
              "Continuous feedback and evaluation",
              "A space to experiment, learn, and compete"
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="text-indigo-500 shrink-0" size={20} />
                <span className="text-slate-300 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Laboratory Banner with Ventures */}
      <section className="py-20 px-6 text-center">
        <FlaskConical className="w-12 h-12 mx-auto mb-6 text-indigo-400 opacity-50" />
        <h2 className="text-2xl font-bold mb-4 italic">Not a textbook – a startup laboratory.</h2>
        <p className="text-slate-500 mb-10">Example Ventures: QuitFlow • EcoWaste AI • Gezunt • UrbanConnect</p>
        <Button className="bg-white text-black hover:bg-slate-200 px-10 h-12 rounded-full font-bold">
          Get Started
        </Button>
      </section>

      <footer className="py-12 border-t border-white/5 text-center text-slate-600 text-sm">
        StartZig gives you the startup experience.
      </footer>
    </div>
  );
}