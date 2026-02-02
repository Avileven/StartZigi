"use client";
import React, { useState } from 'react';
import Link from "next/link";
import { ArrowRight, MessageSquare, Users, Menu, X, Zap, Target, Award } from 'lucide-react';

const articles = [
  {
    title: 'How to Craft the Perfect One-Minute Pitch',
    author: 'Nexus Ventures',
    description: 'Nail your first impression with a pitch that is concise, compelling, and memorable.',
    icon: <Zap className="w-6 h-6 text-amber-400" />
  },
  {
    title: '5 Common Mistakes First-Time Founders Make',
    author: 'Serial Entrepreneur',
    description: 'Learn from the experiences of those who have been there. Avoid these common pitfalls.',
    icon: <Target className="w-6 h-6 text-red-400" />
  },
  {
    title: 'Finding Your First 100 Customers',
    author: 'Growth Marketer',
    description: 'Traction is everything. Discover actionable strategies to acquire your first users.',
    icon: <Users className="w-6 h-6 text-blue-400" />
  },
];

export default function Community() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = null;

  return (
    <div className="bg-slate-900 text-white min-h-screen font-sans">
      {/* סרגל ניווט תומך מובייל */}
      <nav className="fixed top-0 left-0 right-0 bg-slate-900/80 backdrop-blur-md z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex-shrink-0">
              <Link href="/">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent cursor-pointer">
                  StartZig
                </span>
              </Link>
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-300 p-2">
                {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
              </button>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <div className="flex items-center space-x-4 border-r border-white/10 pr-4">
                <Link href="/why-startzig" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">Why StartZig</Link>
                <Link href="/community" className="text-white bg-white/10 px-3 py-2 rounded-md text-sm font-medium">Community</Link>
                <Link href="/pricing" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">Pricing</Link>
              </div>
              <Link href="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-all">
                Sign Up
              </Link>
            </div>
          </div>
        </div>

        {/* תפריט מובייל */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-900 border-t border-white/10 px-4 py-6 space-y-4">
            <Link href="/why-startzig" className="block text-gray-300 text-lg">Why StartZig</Link>
            <Link href="/community" className="block text-white text-lg font-bold">Community</Link>
            <Link href="/pricing" className="block text-gray-300 text-lg">Pricing</Link>
            <Link href="/register" className="block w-full text-center bg-indigo-600 py-3 rounded-xl font-bold">Sign Up</Link>
          </div>
        )}
      </nav>

      {/* Hero Section - מינימליסטי ויוקרתי */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-indigo-500/10 text-indigo-400 ring-1 ring-inset ring-indigo-500/20 mb-8">
            The Founder Network
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
            Think. Build. <span className="text-indigo-500 font-serif italic">Zig.</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            The exclusive community for founders who refuse to follow the straight line. Share insights, find pivots, and grow.
          </p>
        </div>
      </section>

      {/* Articles Section - כרטיסיות נקיות בלי תמונות סטוק */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articles.map((article) => (
              <div key={article.title} className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="mb-6">{article.icon}</div>
                  <h3 className="text-xl font-bold mb-4 group-hover:text-indigo-400 transition-colors">{article.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">{article.description}</p>
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500">{article.author}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

    
      {/* Spotlight - פאונדר אמיתי ומוכר */}
      <section className="py-24 px-6 bg-indigo-600/5 border-y border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5">
           <Zap className="w-64 h-64" />
        </div>
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="bg-slate-800 w-32 h-32 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 shadow-2xl">
            <span className="text-4xl font-serif italic text-indigo-400">PG</span>
          </div>
          <div>
            <h2 className="text-indigo-400 font-bold mb-3 uppercase tracking-[0.2em] text-xs">The Vision</h2>
            <p className="text-2xl md:text-3xl font-medium leading-tight text-slate-200">
              "Most successful startups end up doing something different than they originally intended."
            </p>
            <p className="mt-6 font-bold text-white flex items-center gap-2">
              Paul Graham <span className="text-slate-500 font-normal">— Co-founder, Y Combinator</span>
            </p>
          </div>
        </div>
      </section>

      {/* CTA - הכי פשוט, הכי חזק */}
      <section className="py-32 px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-black mb-8">Ready to join?</h2>
        <Link href="/register">
          <button className="bg-white text-slate-900 px-10 py-4 rounded-full font-bold text-lg hover:bg-indigo-400 hover:text-white transition-all duration-300 shadow-xl">
            Get Started Free
          </button>
        </Link>
      </section>
    </div>
  );
}