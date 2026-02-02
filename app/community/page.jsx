"use client";
import React, { useState } from 'react';
import Link from "next/link";
import { Menu, X, Rocket, Users, MessageSquare, Briefcase, ChevronRight, Award } from 'lucide-react';

const projectUpdates = [
  {
    name: 'AquaChain',
    type: 'MVP',
    description: 'AI-powered smart management for residential water consumption.',
    callToAction: 'Inviting early adopters to test our MVP and provide initial feedback.',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10'
  },
  {
    name: 'EduPath',
    type: 'MLP',
    description: 'A personalized learning platform focused on the "Minimum Lovable Product" experience.',
    callToAction: 'Looking for founders to try our MLP and help us refine the Vibe.',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10'
  },
  {
    name: 'GreenTrack',
    type: 'BETA',
    description: 'Real-time carbon footprint tracking for consumer products.',
    callToAction: 'Registration for our closed BETA is now open. Limited spots available.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10'
  }
];

export default function Community() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-slate-900 text-white min-h-screen font-sans">
      {/* Consistent Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-slate-900/80 backdrop-blur-md z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex-shrink-0">
              <Link href="/"><span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent cursor-pointer">StartZig</span></Link>
            </div>
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-300 p-2">
                {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
              </button>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <div className="flex items-center space-x-4 border-r border-white/10 pr-4">
                <Link href="/why-startzig" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">Why StartZig</Link>
                <Link href="/community" className="text-white bg-white/10 px-3 py-2 rounded-md text-sm font-medium">Community</Link>
                <Link href="/pricing" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">Pricing</Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">Login</Link>
                <Link href="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-all shadow-lg shadow-indigo-500/20">Sign Up</Link>
              </div>
            </div>
          </div>
        </div>
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-900 border-t border-white/10 px-4 py-6 space-y-4">
            <Link href="/why-startzig" className="block text-gray-300 text-lg">Why StartZig</Link>
            <Link href="/community" className="block text-white text-lg font-bold">Community</Link>
            <Link href="/pricing" className="block text-gray-300 text-lg">Pricing</Link>
            <div className="pt-4 border-t border-white/10 flex flex-col space-y-3">
              <Link href="/login" className="text-center text-white py-3 rounded-xl border border-white/10">Login</Link>
              <Link href="/register" className="text-center bg-indigo-600 text-white py-3 rounded-xl font-bold">Sign Up</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-16 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-black mb-6">
            Startup <span className="text-indigo-500">Feed</span>
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed">
            Real-time updates from the StartZig ecosystem: new ventures, pivots, and funding opportunities.
          </p>
        </div>
      </section>

      {/* VC Announcement */}
      <section className="max-w-5xl mx-auto px-6 mb-20">
        <div className="bg-gradient-to-r from-indigo-900/40 to-slate-800 border border-indigo-500/30 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-indigo-500/10">
          <div className="flex items-center gap-6">
            <div className="bg-indigo-500 p-4 rounded-2xl shrink-0">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">New VC Alert: Nexus Capital</h3>
              <p className="text-indigo-200 opacity-80 mt-1">A leading Early-Stage fund has joined as an official StartZig partner.</p>
            </div>
          </div>
          <button className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap hover:bg-indigo-100 transition-colors">
            View VC Profile
          </button>
        </div>
      </section>

      {/* Projects Feed */}
      <section className="max-w-5xl mx-auto px-6 pb-32">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
          <Rocket className="w-6 h-6 text-indigo-400" />
          Hot Venture Updates
        </h2>
        <div className="grid grid-cols-1 gap-6">
          {projectUpdates.map((project) => (
            <div key={project.name} className="group bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold">{project.name}</h3>
                  <span className={`text-[10px] font-black tracking-widest px-2 py-0.5 rounded border ${project.color} border-current opacity-70`}>
                    {project.type}
                  </span>
                </div>
                <p className="text-slate-400 text-sm max-w-xl">{project.description}</p>
                <p className="text-indigo-400 text-sm font-semibold mt-1 flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {project.callToAction}
                </p>
              </div>
              <button className="flex items-center gap-2 text-white bg-white/10 px-5 py-3 rounded-xl text-sm font-bold hover:bg-indigo-600 transition-all group-hover:translate-x-1">
                Connect <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Paul Graham Quote */}
      <section className="py-20 px-6 bg-indigo-600/5 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-2xl italic text-slate-300 leading-relaxed mb-6 font-serif">
            "The way to do really great work is to love what you do. In startups, that means loving the Zig."
          </p>
          <p className="font-bold text-white uppercase tracking-widest text-sm">— Paul Graham, Y Combinator</p>
        </div>
      </section>
    </div>
  );
}