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
    color: 'text-blue-600',
  },
  {
    name: 'Smokefree',
    type: 'RAISED $1.5M',
    description: 'A behavioral science-backed platform helping users quit smoking through personalized journeys.',
    callToAction: 'Experience the mobile app flow and user milestone tracking.',
    link: '/smokefree-demo.html',
    color: 'text-purple-600',
  },
  {
    name: 'UrbanPulse',
    type: 'RAISED $5M',
    description: 'Comprehensive city insights platform for urban planners and smart city developers.',
    callToAction: 'Explore the live data visualization and city heatmaps.',
    link: '/urbanpulse-demo.html',
    color: 'text-emerald-600',
  }
];

export default function Community() {
  return (
    <div className="bg-white text-gray-900 min-h-screen font-sans">
      
      {/* Hero Section */}
      <section className="pt-40 pb-16 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-black mb-6">
            StartZig <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Feed</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Real-time updates from the StartZig ecosystem: new ventures, pivots, and funding opportunities.
          </p>
        </div>
      </section>

      {/* 1. Hot Venture Updates (NOW FIRST) */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2 text-gray-900">
          <Rocket className="w-6 h-6 text-blue-600" />
          Hot Venture Updates
        </h2>
        <div className="grid grid-cols-1 gap-6">
          {projectUpdates.map((project) => (
            <div key={project.name} className="group bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:bg-gray-100 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-gray-900">{project.name}</h3>
                  <span className={`text-[10px] font-black tracking-widest px-2 py-0.5 rounded border ${project.color} border-current opacity-70`}>
                    {project.type}
                  </span>
                </div>
                <p className="text-gray-600 text-sm max-w-xl">{project.description}</p>
                <p className="text-blue-600 text-sm font-semibold mt-1 flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {project.callToAction}
                </p>
              </div>
              <Link href={project.link} target="_blank" className="w-full md:w-auto">
                <button className="w-full flex items-center justify-center gap-2 text-white bg-gray-900 px-6 py-3 rounded-xl text-sm font-bold hover:bg-blue-600 transition-all group-hover:translate-x-1">
                  View Demo <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
