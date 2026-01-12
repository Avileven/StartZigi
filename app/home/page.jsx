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
  Briefcase,
  SearchCheck,
  BrainCircuit,
  Settings2
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
        setFundingFeed([]);
      }
    };
    
    checkUser();
    loadFeed();
  }, []);

  const handleLogin = () => {
    window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
  };

  return (
    <div className="bg-gray-900 text-white">
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
      <nav className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              StartZig
            </Link>
            <div className="hidden md:flex space-x-4">
              <Button variant="ghost" onClick={handleLogin}>Login</Button>
              <Link href="/register"><Button className="bg-indigo-600">Sign Up</Button></Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - מבוסס על פתיח המסמך */}
      <div className="relative isolate overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-800 min-h-screen flex items-center justify-center">
        <AnimatedBg />
        <div className="relative text-center z-10 p-4 max-w-4xl">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl animate-slideUp">
              Don't just start up. <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">StartZig</span>.
            </h1>
            <p className="mt-6 text-xl leading-8 text-gray-200 animate-slideUp" style={{ animationDelay: '0.2s' }}>
              The interactive platform where ideas become ventures, and ventures become experiences. 
              Whether you're here to explore entrepreneurship as a game or validate a real business idea.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6 animate-slideUp" style={{ animationDelay: '0.4s' }}>
              <Button size="lg" className="bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg px-8 py-6 text-lg">
                Start Your Experience <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
        </div>
      </div>

      {/* Who is it for - תוכן ישיר מהמסמך */}
      <div className="py-24 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Gamepad2 className="text-purple-400 h-8 w-8" />
                <h2 className="text-2xl font-bold">For Simulation & Startup Enthusiasts</h2>
              </div>
              <p className="text-gray-300 text-lg mb-4">Ever read about a massive tech exit and thought: “Could I do that too?” Now you can.</p>
              <ul className="space-y-2 text-gray-400">
                <li>• Build ventures and make strategic decisions</li>
                <li>• Advance through stages and attract virtual investors</li>
                <li>• Reach a virtual exit – No risk. No money. Just strategy.</li>
              </ul>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Rocket className="text-indigo-400 h-8 w-8" />
                <h2 className="text-2xl font-bold">For Entrepreneurs With an Idea</h2>
              </div>
              <p className="text-gray-300 text-lg mb-4">Have a business idea but not sure if it’s worth the time and investment?</p>
              <ul className="space-y-2 text-gray-400">
                <li>✔ Test Before You Invest – Receive meaningful feedback</li>
                <li>✔ Develop as an Entrepreneur – Learn to think like an investor</li>
                <li>✔ Gain Smart Exposure – Present to a community of enthusiasts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Lab - תוכן ישיר מהמסמך */}
      <div className="py-24 bg-gray-900 border-y border-gray-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FlaskConical className="h-12 w-12 text-emerald-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-6">A Startup Laboratory for Academic Programs</h2>
          <p className="text-xl text-gray-300 mb-8 italic">"Not a textbook – a startup laboratory."</p>
          <div className="grid sm:grid-cols-2 gap-4 text-left">
            <div className="bg-gray-800 p-4 rounded-lg">• Build ventures as part of courses</div>
            <div className="bg-gray-800 p-4 rounded-lg">• Practice pitching and market analysis</div>
            <div className="bg-gray-800 p-4 rounded-lg">• Business modeling & market evolution</div>
            <div className="bg-gray-800 p-4 rounded-lg">• Experience evolution across real stages</div>
          </div>
        </div>
      </div>

      {/* Mentors Section - תוכן ישיר מהמסמך */}
      <div className="py-24 bg-indigo-900/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-6">🧠 For Mentors, Instructors & Programs</h2>
              <p className="text-gray-300 mb-6">StartZig is a training and evaluation platform for entrepreneurial development. Perfect for accelerators, incubators, and hackathons.</p>
              <div className="space-y-4">
                <div className="flex items-center gap-3"><CheckCircle2 className="text-indigo-500" /> Guide founders through structured stages</div>
                <div className="flex items-center gap-3"><CheckCircle2 className="text-indigo-500" /> Deliver targeted feedback</div>
                <div className="flex items-center gap-3"><CheckCircle2 className="text-indigo-500" /> Simulate investor interactions</div>
                <div className="flex items-center gap-3"><CheckCircle2 className="text-indigo-500" /> Track decision-making over time</div>
              </div>
            </div>
            <div className="flex-1 bg-gray-800 p-8 rounded-2xl border border-indigo-500/30">
               <h3 className="text-xl font-bold mb-4">The Venture Lifecycle</h3>
               <div className="flex flex-wrap gap-2">
                 {["Idea", "MVP", "MLP", "Beta", "Growth", "Exit"].map(stage => (
                   <span key={stage} className="px-3 py-1 bg-indigo-600 rounded-full text-sm font-bold">{stage}</span>
                 ))}
               </div>
               <p className="mt-6 text-sm text-gray-400">Structured growth from concept to acquisition.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Example Ventures - שמות מדויקים מהמסמך */}
      <div className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">🌍 Example Virtual Ventures on StartZig</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2 font-bold text-indigo-400">
                  <BrainCircuit /> QuitFlow
                </div>
                <p className="text-gray-400 text-sm">A behavioral AI app for smoking cessation.</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2 font-bold text-indigo-400">
                  <Settings2 /> EcoWaste AI
                </div>
                <p className="text-gray-400 text-sm">Smart waste management for cities.</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2 font-bold text-indigo-400">
                  <Users /> UrbanConnect
                </div>
                <p className="text-gray-400 text-sm">Community-driven local services.</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2 font-bold text-indigo-400">
                  <Target /> Gezunt
                </div>
                <p className="text-gray-400 text-sm">A digital wellness and healthy lifestyle brand.</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2 font-bold text-indigo-400">
                  <SearchCheck /> PlantCare IoT
                </div>
                <p className="text-gray-400 text-sm">Sensors and apps for plant health monitoring.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* What StartZig Gives You - סיום מהמסמך */}
      <div className="py-24 bg-indigo-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-8">✨ What StartZig Gives You</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left mb-12">
            <div className="flex items-center gap-2"><CheckCircle2 /> A structured entrepreneurial journey</div>
            <div className="flex items-center gap-2"><CheckCircle2 /> Simulation of growth and investment</div>
            <div className="flex items-center gap-2"><CheckCircle2 /> Exposure to founders and investors</div>
            <div className="flex items-center gap-2"><CheckCircle2 /> Continuous feedback and evaluation</div>
          </div>
          <p className="text-2xl font-bold mb-8">Want to play, learn, or build something real? StartZig gives you the startup experience.</p>
          <Button size="lg" variant="secondary" className="px-10 py-6 text-lg font-bold">Launch Your Venture</Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500">
          <p>&copy; 2024 StartZig. Experiment, learn, and compete in the startup world.</p>
        </div>
      </footer>
    </div>
  );
}