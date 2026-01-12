"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { 
  Rocket, 
  Target, 
  Lightbulb, 
  DollarSign, 
  ArrowRight,
  TrendingUp,
  Gamepad2,
  GraduationCap,
  Users,
  BarChart3,
  CheckCircle2,
  FlaskConical,
  Briefcase
} from "lucide-react";
import AnimatedBg from "@/components/common/AnimatedBg";

export default function Home() {
  const [user, setUser] = useState(null);
  const [hasVenture, setHasVenture] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fundingFeed, setFundingFeed] = useState([]);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);
        if (currentUser) {
          const { data: ventures } = await supabase
            .from('ventures')
            .select('id')
            .eq('created_by', currentUser.email)
            .limit(1);
          setHasVenture(ventures && ventures.length > 0);
        }
      } catch (error) {
        setUser(null);
      }
      setIsLoading(false);
    };

    const loadFeed = async () => {
      try {
        const { data: events } = await supabase
          .from('funding_events')
          .select('*')
          .order('created_date', { ascending: false })
          .limit(5);
        setFundingFeed(events || []);
      } catch (error) {
        console.error("Error loading feed", error);
      }
    };
    
    checkUser();
    loadFeed();
  }, []);

  const handleLogin = () => {
    window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
  };

  return (
    <div className="bg-gray-900 text-white font-sans">
      <style>{`
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp {
            animation: slideUp 0.8s ease-out forwards;
        }
      `}</style>
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-md z-50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              StartZig
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#who-is-it-for" className="text-gray-300 hover:text-white text-sm">Target Audience</a>
              <a href="#journey" className="text-gray-300 hover:text-white text-sm">The Journey</a>
              <a href="#mentors" className="text-gray-300 hover:text-white text-sm">For Mentors</a>
              {user ? (
                <Link href="/dashboard"><Button className="bg-indigo-600">Dashboard</Button></Link>
              ) : (
                <Button onClick={handleLogin} variant="outline" className="text-white border-gray-700">Login</Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-950 via-gray-900 to-purple-950">
        <AnimatedBg />
        <div className="relative z-10 text-center px-4 max-w-5xl">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 animate-slideUp">
              Don't just start up. <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">StartZig</span>.
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-10 animate-slideUp [animation-delay:200ms]">
              Experience the Startup Journey. <br className="hidden md:block"/>
              The interactive platform where ideas become ventures, and ventures become experiences.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slideUp [animation-delay:400ms]">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg rounded-full">
                {user ? "Continue Your Journey" : "Start Your Experience"} <ArrowRight className="ml-2" />
              </Button>
            </div>
        </div>
      </div>

      {/* Who is it for Section (מבוסס על המסמך) */}
      <div id="who-is-it-for" className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-indigo-400 font-semibold tracking-wide uppercase">Who is it for?</h2>
            <p className="mt-2 text-3xl font-bold text-white">Three Ways to Experience StartZig</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="pt-8">
                <Gamepad2 className="h-12 w-12 text-purple-400 mb-6" />
                <h3 className="text-xl font-bold mb-4">Simulation Enthusiasts</h3>
                <p className="text-gray-400 leading-relaxed">
                  Experience the startup world as a simulation. Build ventures, make strategic decisions, and reach a virtual exit. No risk. No money. Just strategy and the thrill of building.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="pt-8">
                <Rocket className="h-12 w-12 text-indigo-400 mb-6" />
                <h3 className="text-xl font-bold mb-4">Entrepreneurs</h3>
                <p className="text-gray-400 leading-relaxed">
                  Validate and pressure-test your concept before you go all-in. Learn to think like an investor, improve your pitch, and prepare for real funding conversations.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="pt-8">
                <FlaskConical className="h-12 w-12 text-emerald-400 mb-6" />
                <h3 className="text-xl font-bold mb-4">Academic Laboratory</h3>
                <p className="text-gray-400 leading-relaxed">
                  Not a textbook – a laboratory. Build ventures as part of courses, practice market analysis, and experience how startups evolve across real stages.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* The Journey Section (מבוסס על המסמך) */}
      <div id="journey" className="py-24 bg-gray-800/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="lg:text-center mb-16">
            <h2 className="text-3xl font-bold text-white">The Structured Journey</h2>
            <p className="mt-4 text-gray-400 max-w-2xl lg:mx-auto">
              Each venture progresses through specific milestones, ensuring a realistic experience of growth and decision-making.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              { title: "Idea & MVP", desc: "Evaluate your idea and receive feedback before spending time or money.", icon: Lightbulb },
              { title: "Beta & Growth", desc: "Experiment, pivot, and improve. Attract early supporters and sharpen skills.", icon: TrendingUp },
              { title: "Investment", desc: "Experience investor interactions and practice pitching for virtual capital.", icon: DollarSign },
              { title: "Scale", desc: "Expand your reach and refine your business model in a competitive market.", icon: BarChart3 },
              { title: "Virtual Exit", desc: "The ultimate goal. See how your strategic decisions lead to a simulated acquisition.", icon: Target }
            ].map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <step.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">{step.title}</h4>
                  <p className="text-gray-400 text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* For Mentors Section (מבוסס על המסמך) */}
      <div id="mentors" className="py-24 bg-indigo-900/20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <GraduationCap className="h-16 w-16 text-indigo-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-6">For Mentors, Instructors & Programs</h2>
          <p className="text-xl text-gray-300 mb-10">
            StartZig is a training and evaluation platform for entrepreneurial development. 
            Perfect for accelerators, incubators, and academic programs.
          </p>
          <div className="grid sm:grid-cols-2 gap-6 text-right max-w-2xl mx-auto">
            <div className="flex items-center gap-3 text-gray-200">
              <CheckCircle2 className="text-indigo-500" /> Guide founders through structured stages
            </div>
            <div className="flex items-center gap-3 text-gray-200">
              <CheckCircle2 className="text-indigo-500" /> Deliver targeted feedback
            </div>
            <div className="flex items-center gap-3 text-gray-200">
              <CheckCircle2 className="text-indigo-500" /> Simulate investor interactions
            </div>
            <div className="flex items-center gap-3 text-gray-200">
              <CheckCircle2 className="text-indigo-500" /> Track decision-making over time
            </div>
          </div>
        </div>
      </div>

      {/* Ventures & Feed */}
      <div className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-8">Example Virtual Ventures</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { name: "QuitFlow", desc: "A behavioral AI app for smoking cessation", icon: Rocket },
                { name: "EcoWaste AI", desc: "Smart waste management for cities", icon: BarChart3 },
                { name: "Gezunt", desc: "A digital wellness and healthy lifestyle brand", icon: Users },
                { name: "PlantCare IoT", desc: "Sensors and apps for plant health monitoring", icon: Lightbulb }
              ].map((v, i) => (
                <div key={i} className="p-4 bg-gray-800 rounded-xl border border-gray-700 hover:border-indigo-500 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <v.icon className="h-5 w-5 text-indigo-400" />
                    <span className="font-bold">{v.name}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-8">Live Funding Feed</h2>
            <div className="space-y-6">
              {fundingFeed.map((event) => (
                <div key={event.id} className="flex gap-4 items-start">
                  <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                    <DollarSign className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-sm text-gray-400">
                    <span className="text-white font-medium">{event.venture_name}</span> raised a round from <span className="text-white">{event.investor_name}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer (מבוסס על המסמך) */}
      <footer className="bg-gray-950 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400 text-sm mb-4">
            StartZig gives you the startup experience. Experiment, learn, and compete.
          </p>
          <p className="text-gray-600 text-xs">
            &copy; 2024 StartZig. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}