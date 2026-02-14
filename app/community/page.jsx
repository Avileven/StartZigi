"use client";
import React from 'react';
import Link from "next/link";
import { Rocket, MessageSquare, Briefcase, ArrowRight } from 'lucide-react';

const projectUpdates = [
  {
    name: 'ShelfSense',
    type: 'RAISED $2M',
    description: 'Smart retail shelf intelligence platform using computer vision to optimize inventory.',
    callToAction: 'Check out the interactive retail dashboard demo.',
    link: '/ShelfSense-demo.html',
    color: 'text-blue-400',
  },
  {
    name: 'Smokefree',
    type: 'RAISED $1.5M',
    description: 'A behavioral science-backed platform helping users quit smoking through personalized journeys.',
    callToAction: 'Experience the mobile app flow and user milestone tracking.',
    link: '/smokefree-demo.html',
    color: 'text-purple-400',
  },
  {
    name: 'UrbanPulse',
    type: 'RAISED $5M',
    description: 'Comprehensive city insights platform for urban planners and smart city developers.',
    callToAction: 'Explore the live data visualization and city heatmaps.',
    link: '/urbanpulse-demo.html',
    color: 'text-emerald-400',
  }
];

export default function Community() {
  return (
    <div className="bg-slate-900 text-white min-h-screen font-sans">
      
      {/* Hero Section */}
      <section className="pt-40 pb-16 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-black mb-6">
            StartZig <span className="text-indigo-500">Feed</span>
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed">
            Real-time updates from the StartZig ecosystem: new ventures, pivots, and funding opportunities.
          </p>
        </div>
      </section>

      {/* 1. Hot Venture Updates (NOW FIRST) */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
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
              <Link href={project.link} target="_blank" className="w-full md:w-auto">
                <button className="w-full flex items-center justify-center gap-2 text-white bg-white/10 px-6 py-3 rounded-xl text-sm font-bold hover:bg-indigo-600 transition-all group-hover:translate-x-1">
                  View Demo <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 2. VC Announcement (NOW AFTER UPDATES) */}
      <section className="max-w-5xl mx-auto px-6 mb-32">
        <div className="bg-gradient-to-r from-indigo-900/40 to-slate-800 border border-indigo-500/30 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-indigo-500/10">
          <div className="flex items-center gap-6">
            <div className="bg-indigo-500 p-4 rounded-2xl shrink-0">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">New VC Alert: Nexus Capital</h3>
              <p className="text-indigo-200 opacity-80 mt-1">Official StartZig partner for Early-Stage funding.</p>
            </div>
          </div>
          <button className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-colors">
            View VC Profile
          </button>
        </div>
      </section>

      {/* Quote Section */}
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