//ניסיון אחרון.
"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { 
  Rocket, Lightbulb, ArrowRight, Gamepad2, FlaskConical, 
  CheckCircle2, Users, GraduationCap, Briefcase, Globe, MessageSquare 
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  return (
    <div className="bg-[#020617] text-slate-50 min-h-screen">
      {/* Navigation - המבנה המקורי שלך */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tighter text-indigo-500">STARTZIG</Link>
          <div className="flex gap-4">
            {user ? (
              <Link href="/dashboard"><Button className="bg-indigo-600">Dashboard</Button></Link>
            ) : (
              <>
                <Link href="/login"><Button variant="ghost">Login</Button></Link>
                <Link href="/register"><Button className="bg-indigo-600">Join Beta</Button></Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-6">
          Don't just start up. <span className="text-indigo-400">StartZig.</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
          The interactive platform where ideas become ventures, and ventures become experiences.
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" className="bg-indigo-600 px-8 h-12 rounded-lg font-bold">
            Start Your Journey <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Target Audiences - כל 5 הקבוצות מהמסמך בתצוגה נקייה */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <h2 className="text-2xl font-bold mb-10 text-center uppercase tracking-widest text-slate-500">Target Audiences</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/10">
            <Gamepad2 className="text-indigo-400 mb-4" />
            <h3 className="text-lg font-bold mb-2 italic">Simulation Enthusiasts</h3>
            <p className="text-slate-400 text-sm">"Could I do that too?" Experience the startup world with zero risk. Build ventures and reach a virtual exit.</p>
          </div>
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/10">
            <Rocket className="text-emerald-400 mb-4" />
            <h3 className="text-lg font-bold mb-2">Entrepreneurs</h3>
            <p className="text-slate-400 text-sm">Validate and pressure-test your concept before you go all-in. Test before you invest.</p>
          </div>
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/10">
            <Users className="text-purple-400 mb-4" />
            <h3 className="text-lg font-bold mb-2">Mentors & Programs</h3>
            <p className="text-slate-400 text-sm">A training platform for accelerators and incubators to track decision-making over time.</p>
          </div>
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/10">
            <GraduationCap className="text-blue-400 mb-4" />
            <h3 className="text-lg font-bold mb-2">Academic Institutions</h3>
            <p className="text-slate-400 text-sm">Perfect for business schools and hackathons to experience how startups evolve through stages.</p>
          </div>
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/10">
            <Briefcase className="text-orange-400 mb-4" />
            <h3 className="text-lg font-bold mb-2">Independent Study</h3>
            <p className="text-slate-400 text-sm">Practice pitching, market analysis, and business modeling in a structured environment.</p>
          </div>
        </div>
      </section>

      {/* Community Section - משוחזר */}
      <section className="py-16 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">Community & Networking</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-center gap-4 p-6 bg-slate-900/40 rounded-xl border border-white/10">
              <Globe className="text-indigo-400 w-8 h-8" />
              <div>
                <h4 className="font-bold text-lg">Global Network</h4>
                <p className="text-slate-400">Exposure to a community of founders and investors worldwide.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-slate-900/40 rounded-xl border border-white/10">
              <MessageSquare className="text-indigo-400 w-8 h-8" />
              <div>
                <h4 className="font-bold text-lg">Continuous Feedback</h4>
                <p className="text-slate-400">Get insights and evaluation from industry experts and peers.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - משוחזר */}
      <section className="py-24 max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">Pricing Plans</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-8 rounded-3xl border border-white/10 bg-slate-900/50">
            <h3 className="text-xl font-bold mb-2">Starter</h3>
            <div className="text-3xl font-bold mb-6">$0 <span className="text-sm text-slate-500 font-normal">/ month</span></div>
            <ul className="space-y-4 mb-8 text-slate-400">
              <li className="flex gap-2"><CheckCircle2 size={18} className="text-indigo-500"/> 1 Virtual Venture</li>
              <li className="flex gap-2"><CheckCircle2 size={18} className="text-indigo-500"/> Community Access</li>
            </ul>
            <Button className="w-full" variant="outline">Get Started</Button>
          </div>
          <div className="p-8 rounded-3xl border border-indigo-500 bg-indigo-500/5">
            <h3 className="text-xl font-bold mb-2">Pro</h3>
            <div className="text-3xl font-bold mb-6">$19 <span className="text-sm text-slate-500 font-normal">/ month</span></div>
            <ul className="space-y-4 mb-8 text-slate-400">
              <li className="flex gap-2"><CheckCircle2 size={18} className="text-indigo-500"/> Unlimited Ventures</li>
              <li className="flex gap-2"><CheckCircle2 size={18} className="text-indigo-500"/> Advanced Analytics</li>
              <li className="flex gap-2"><CheckCircle2 size={18} className="text-indigo-500"/> Investor Matching</li>
            </ul>
            <Button className="w-full bg-indigo-600 shadow-lg shadow-indigo-500/20">Go Pro</Button>
          </div>
        </div>
      </section>

      {/* Lab Banner & Ventures */}
      <section className="py-20 px-6 text-center border-t border-white/5">
        <FlaskConical className="w-12 h-12 mx-auto mb-6 text-indigo-400 opacity-60" />
        <h2 className="text-2xl font-bold mb-2 italic">Not a textbook – a startup laboratory.</h2>
        <p className="text-slate-500 mb-8 max-w-xl mx-auto italic text-sm">
          QuitFlow • EcoWaste AI • UrbanConnect • PlantCare IoT • Gezunt
        </p>
        <p className="text-slate-400 font-medium">StartZig gives you the startup experience.</p>
      </section>
    </div>
  );
}