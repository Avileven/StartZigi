"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import AnimatedBg from '@/components/common/AnimatedBg';

export default function HowItWorks() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans relative overflow-x-hidden">
            
            {/* אנימציה ברקע של כל הדף */}
            <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
                <AnimatedBg />
            </div>

            <main className="relative z-10 min-h-screen pt-24 md:pt-32 pb-24 px-6 sm:px-10 lg:px-16">
                <div className="max-w-6xl mx-auto w-full">
                    
                    {/* כותרת הדף */}
                    <div className="max-w-4xl mb-20 text-left">
                        <h1 className="text-4xl md:text-6xl font-black mb-6">How it Works</h1>
                        <p className="text-xl text-white/70 leading-relaxed">
                            StartZig is more than a tool—it's a high-fidelity startup simulator. 
                            From your first idea to a simulated exit, here is how you'll build your venture.
                        </p>
                    </div>

                    <div className="space-y-40">
                        
                        {/* Slide 1: Your Dashboard */}
                        <section className="flex flex-col lg:flex-row gap-12 items-center">
                            <div className="lg:w-1/3 space-y-4 text-left">
                                <div className="text-blue-400 font-bold tracking-widest uppercase text-xs">Step 01</div>
                                <h3 className="text-3xl font-bold text-white">Your Control Center</h3>
                                <p className="text-xl text-white/70 leading-relaxed">
                                    Everything you need to navigate your startup in one place. 
                                    Manage financials, edit your landing page, and track your progress through the venture phases.
                                </p>
                            </div>

                            <div className="lg:w-2/3 w-full bg-gray-100 rounded-2xl p-4 md:p-8 shadow-2xl overflow-hidden text-left">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Sidebar */}
                                    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center shrink-0">
                                                <span className="text-white font-bold">S</span>
                                            </div>
                                            <div className="overflow-hidden">
                                                <h4 className="font-bold text-gray-900 truncate">StartZig</h4>
                                            </div>
                                        </div>
                                        <div className="space-y-1 text-sm text-gray-600">
                                            {['Financials', 'Business Plan', 'Invite Co-Founder', 'Revenue Modeling'].map((item) => (
                                                <div key={item} className="p-2 hover:bg-white rounded-md cursor-default">{item}</div>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Main Content */}
                                    <div className="md:col-span-2 space-y-4">
                                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                            <h3 className="text-2xl font-black text-gray-900 mb-1">Good morning, Dan!</h3>
                                            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">🧪 BETA PHASE</div>
                                        </div>
                                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xl">🎉</span>
                                                <span className="font-bold text-gray-900 text-sm">MLP Complete!</span>
                                            </div>
                                            <p className="text-xs text-gray-600 leading-relaxed">You've successfully built your Minimum Lovable Product.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Slide 2: Invite a Co-Founder */}
                        <section className="flex flex-col lg:flex-row-reverse gap-12 items-center">
                            <div className="lg:w-1/3 space-y-4 text-left">
                                <div className="text-purple-400 font-bold tracking-widest uppercase text-xs">Step 02</div>
                                <h3 className="text-3xl font-bold text-white">Build Your Dream Team</h3>
                                <p className="text-xl text-white/70 leading-relaxed">
                                    Founding a startup is rarely a solo mission. Invite co-founders, share your vision, and manage team permissions as you grow.
                                </p>
                            </div>

                            <div className="lg:w-2/3 w-full bg-slate-50 rounded-2xl p-6 md:p-10 shadow-2xl text-left">
                                <div className="max-w-xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                        </div>
                                        <h4 className="text-lg font-bold text-slate-900">Send Invitation</h4>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-slate-50 p-2 rounded border border-slate-200 text-xs text-slate-400 font-bold uppercase">Don Mandel</div>
                                            <div className="bg-slate-50 p-2 rounded border border-slate-200 text-xs text-slate-400 font-bold uppercase">don@startzig.com</div>
                                        </div>
                                        <div className="bg-indigo-600 text-white font-bold py-3 rounded-lg text-sm text-center">Send Invitation</div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Slide 3: Pitch to Investors */}
                        <section className="flex flex-col lg:flex-row gap-12 items-center">
                            <div className="lg:w-1/3 space-y-4 text-left">
                                <div className="text-emerald-400 font-bold tracking-widest uppercase text-xs">Step 03</div>
                                <h3 className="text-3xl font-bold text-white">Battle-Test Your Vision</h3>
                                <p className="text-xl text-white/70 leading-relaxed">
                                    Engage with AI-driven investors who challenge your business model and probe your technical roadmap.
                                </p>
                            </div>

                            <div className="lg:w-2/3 w-full bg-slate-100 rounded-2xl p-6 md:p-10 shadow-2xl text-left min-h-[400px] flex items-center">
                                <div className="space-y-4 w-full max-w-lg mx-auto">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-slate-300 rounded-full shrink-0 flex items-center justify-center font-bold text-slate-600 text-xs italic">I</div>
                                        <div className="bg-white text-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 border border-slate-200 text-sm shadow-sm">
                                            What is the biggest technical challenge you anticipate?
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <div className="bg-blue-600 text-white rounded-2xl rounded-br-sm px-4 py-3 text-sm shadow-lg max-w-[85%]">
                                            Scaling our AI matching algorithm while maintaining HIPAA compliance is our top priority.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                    </div>

                    {/* סיומת */}
                    <div className="text-center pt-40">
                        <Link href="/register" className="group inline-block">
                            <p className="text-3xl md:text-6xl font-black text-white leading-tight">Ready to build?</p>
                            <p className="text-4xl md:text-7xl font-black text-purple-400 mt-2 group-hover:scale-105 transition-transform duration-300">Start Your Zig.</p>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}