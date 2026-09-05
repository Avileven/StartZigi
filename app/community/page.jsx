"use client";
import React from 'react';
import Link from "next/link";
import { Rocket, MessageSquare, Briefcase, ArrowRight, UserCircle2, ArrowRight as ArrowRightIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// [NEW] Ring component for the Zig Profile guide section below — same
// visual pattern used in my-account.jsx and product-feedback-page.jsx, so
// the preview here matches what founders actually see on their profile.
function RingPreview({ value, label, stroke, text }) {
  const size = 56;
  const r = 24;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="absolute top-0 left-0 -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1EFE8" strokeWidth="5" />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={stroke} strokeWidth="5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset="0" />
        </svg>
        <span className="font-medium text-center leading-tight" style={{ color: text, fontSize: value.length > 5 ? 9 : 12 }}>
          {value}
        </span>
      </div>
      <span className="text-[11px] text-gray-400">{label}</span>
    </div>
  );
}

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

      {/* [NEW] Zig Profile guide — explains the public profile rings and
          the Insight Credits system, per explicit request to place this
          content inside the existing Community page rather than a
          separate route. */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCircle2 className="w-7 h-7 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Zig Profile</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            A quick guide to what's shown on your public profile, and how the Insight system works.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserCircle2 className="w-5 h-5 text-indigo-600" />
              What is the Zig Profile?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 leading-relaxed">
              This is the public side of your account — the part other founders in the StartZig community can see
              when you give feedback on their product, or when they check out your own venture. It shows four
              things at a glance: your Stage, your Status, your Zig age, and how many Ideas you've explored.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">The four rings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">

            <div className="flex items-start gap-4">
              <RingPreview value="Growth" label="Stage" stroke="#0C5132" text="#04342C" />
              <div>
                <p className="font-semibold text-gray-900 text-sm mb-1">Stage</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Where your venture is on the founder journey right now: Spark → Plan → Shape → Beta → Growth.
                  This always reflects your current stage — it's not something you set yourself, it updates
                  automatically as you move forward.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <RingPreview value="Seeker" label="Status" stroke="#FAEEDA" text="#633806" />
              <div>
                <p className="font-semibold text-gray-900 text-sm mb-1">Status</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Your standing in the feedback community, based on how many times you've given feedback to other
                  founders: Insight Seeker (0) → Insight Starter (1+) → Insight Builder (5+) → Insight Champion
                  (20+) → Insight Master (50+). Give feedback to move up.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <RingPreview value="14d" label="Zig age" stroke="#378ADD" text="#185FA5" />
              <div>
                <p className="font-semibold text-gray-900 text-sm mb-1">Zig age</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Simply how many days it's been since you joined StartZig.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <RingPreview value="3" label="Ideas" stroke="#378ADD" text="#185FA5" />
              <div>
                <p className="font-semibold text-gray-900 text-sm mb-1">Ideas</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  How many ventures you've explored or started on StartZig.
                </p>
              </div>
            </div>

          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="w-5 h-5 text-amber-600" />
              What are Insight Credits?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              Insight Credits are what you earn for helping other founders. Every time you give real, thoughtful
              feedback on someone else's product, you earn <strong>3 Insight Credits</strong>.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-amber-900 mb-1">What can you do with them?</p>
              <p className="text-sm text-amber-800 leading-relaxed">
                Convert Insight Credits into feedback requests for your own venture — <strong>1 credit = 3
                requests</strong>. Feedback requests are what let you invite the community to review your own
                product through the Promotion Center.
              </p>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              In short: the more you help other founders, the more feedback you can bring back to your own
              product. It's built to go both ways.
            </p>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Link href="/my-account" className="inline-flex items-center gap-2 text-indigo-600 font-medium text-sm hover:text-indigo-700">
            Go to your account
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
