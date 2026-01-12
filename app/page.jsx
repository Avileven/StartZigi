//גרסה נסיונית 2
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Rocket, Lightbulb, Target, ArrowRight, TrendingUp, 
  Gamepad2, FlaskConical, CheckCircle2, Award, Heart, Zap 
} from "lucide-react";
import AnimatedBg from "@/components/common/AnimatedBg";

export default function Home() {
  const stages = [
    { name: "Idea", icon: Lightbulb, desc: "Concept validation", color: "from-yellow-400 to-orange-500" },
    { name: "MVP", icon: Zap, desc: "Initial product", color: "from-blue-400 to-cyan-500" },
    { name: "MLP", icon: Heart, desc: "Lovable product", color: "from-pink-400 to-rose-500" },
    { name: "Beta", icon: Target, desc: "Market testing", color: "from-purple-400 to-indigo-500" },
    { name: "Growth", icon: TrendingUp, desc: "Scaling up", color: "from-orange-400 to-red-500" },
    { name: "Exit", icon: Award, desc: "The big finish", color: "from-green-400 to-emerald-500" }
  ];

  return (
    <div className="bg-[#0B0F1A] text-white min-h-screen selection:bg-indigo-500/30">
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0B0F1A]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-2xl font-black tracking-tighter bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            STARTZIG
          </div>
          <Button variant="ghost" className="text-gray-400 hover:text-white">Login</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <AnimatedBg />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Experience the Startup Journey
          </div>
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8 leading-[1.1]">
            Don't just start up. <br/>
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              StartZig.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            The interactive platform where ideas become ventures, and ventures become experiences. Build, test, and grow in a structured environment.
          </p>
          <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 h-14 rounded-xl text-lg font-bold shadow-lg shadow-indigo-500/20 transition-all hover:scale-105">
            Start Your Journey <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* The Venture Journey Stages - עיצוב מחודש */}
      <section className="py-24 relative bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">The Venture Lifecycle</h2>
            <p className="text-gray-500">From a spark of an idea to a massive virtual exit</p>
          </div>
          
          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-gray-700 to-transparent -translate-y-1/2 hidden lg:block" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8 relative z-10">
              {stages.map((stage, i) => (
                <div key={i} className="group flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-2xl bg-gray-900 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-indigo-500/50 transition-all duration-500 shadow-2xl`}>
                    <stage.icon className={`w-8 h-8 bg-gradient-to-br ${stage.color} bg-clip-text text-indigo-400`} />
                  </div>
                  <h3 className="font-bold text-lg mb-1">{stage.name}</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">{stage.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Target Audiences - סימטריה מלאה */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {/* Enthusiasts */}
          <div className="group p-10 rounded-[2rem] bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 hover:border-indigo-500/30 transition-all flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-8">
              <Gamepad2 className="text-indigo-400" />
            </div>
            <h3 className="text-3xl font-bold mb-4 leading-tight">For Simulation <br/> Enthusiasts</h3>
            <p className="text-gray-400 italic mb-8 text-lg leading-relaxed">"Ever read about a massive tech exit and thought: 'Could I do that too?'"</p>
            <div className="mt-auto pt-8 border-t border-white/5">
              <p className="text-gray-300 leading-relaxed">Experience the startup world as a simulation. No risk, no money—just pure strategy and competition.</p>
            </div>
          </div>

          {/* Entrepreneurs */}
          <div className="group p-10 rounded-[2rem] bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 hover:border-purple-500/30 transition-all flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-8">
              <Rocket className="text-purple-400" />
            </div>
            <h3 className="text-3xl font-bold mb-4 leading-tight">For Entrepreneurs <br/> With an Idea</h3>
            <div className="space-y-4 mb-8 flex-1">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                <p className="text-gray-300"><span className="font-bold text-white">Test Before You Invest:</span> Validate before spending real money.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                <p className="text-gray-300"><span className="font-bold text-white">Gain Smart Exposure:</span> Present to a community of experts.</p>
              </div>
            </div>
            <div className="mt-auto pt-8 border-t border-white/5">
              <p className="text-gray-400">Refine and pressure-test your concept until it's ready for the real world.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Lab Section */}
      <section className="py-24 bg-indigo-600 rounded-[3rem] mx-6 mb-24 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <FlaskConical className="w-16 h-16 mx-auto mb-8 text-white/90" />
          <h2 className="text-4xl font-black mb-6">Not a textbook – a startup laboratory.</h2>
          <p className="text-xl text-indigo-100/80 leading-relaxed mb-10">
            A training and evaluation platform for accelerators, incubators, and academic programs to track decision-making over time.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {["QuitFlow", "EcoWaste AI", "Gezunt", "UrbanConnect"].map((v) => (
              <span key={v} className="px-4 py-2 bg-black/20 backdrop-blur-md rounded-lg text-sm font-semibold border border-white/10 uppercase tracking-widest">{v}</span>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-12 text-center text-gray-600 border-t border-white/5">
        <p className="text-sm font-medium">StartZig gives you the startup experience.</p>
      </footer>
    </div>
  );
}