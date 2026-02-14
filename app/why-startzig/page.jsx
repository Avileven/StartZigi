"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import AnimatedBg from '@/components/common/AnimatedBg';

export default function WhyStartZig() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans relative overflow-x-hidden">
            <main className="relative z-10 min-h-screen pt-24 md:pt-32 pb-24 px-6 sm:px-10 lg:px-16">
                <div className="max-w-4xl mx-auto w-full text-left">
                    
                    {/* פסקת פתיחה - מיושרת לשמאל, ללא כותרת */}
                    <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <p className="text-xl md:text-2xl leading-relaxed font-light text-slate-200">
                            The name <span className="text-white font-bold">"StartUp"</span> implies a linear beginning. <br />
                            But starting is easy; staying alive through the turns is where the winners are decided.
                        </p>
                    </div>

                    {/* אזור האנימציה - הטקסט זורם כחלק מהדף ללא מסגרת כרטיס */}
                    <div className="relative mb-20">
                        {/* האנימציה רצה ברקע של הטקסט הספציפי הזה */}
                        <div className="absolute inset-0 z-0 opacity-30 h-64">
                            <AnimatedBg />
                        </div>
                        
                        <div className="relative z-10 py-10">
                            <p className="text-xl md:text-2xl leading-relaxed font-medium text-slate-100 mb-6">
                                Real startups don't fly; they navigate. They stumble. <br />
                                They <span className="text-blue-400 font-extrabold italic">zig</span> when everyone expects them to <span className="text-white font-bold">zag</span>. <br />
                                They learn, adapt, and find unexpected paths to success.
                            </p>
                            
                            {/* הציטוט של פול גרהאם מוטמע כאן באותו סגנון */}
                            <p className="text-xl md:text-2xl leading-relaxed font-medium text-slate-100">
                                "The way to do really great work is to love what you do. In startups, that means loving the Zig." <br />
                                <span className="text-sm uppercase tracking-widest font-bold opacity-60">— Paul Graham, Y Combinator</span>
                            </p>
                        </div>
                    </div>

                    {/* סיפור מאיה - טקסט נקי, ללא רקע או מסגרת, מיושר לשמאל */}
                    <section className="space-y-8 text-lg md:text-xl leading-relaxed text-slate-300">
                        <div>
                            <p className="text-blue-400 font-bold tracking-widest uppercase text-xs mb-4">
                                A Classic Zigzag Example
                            </p>
                            <p>
                                <span className="text-white font-bold">Maya</span> spent two years developing <span className="text-blue-400 font-semibold">FreshCast</span>. Her vision was clear: using AI to predict demand and help high-end restaurants eliminate food waste.
                            </p>
                        </div>

                        <p>
                            But the market didn't care. After pitching to <span className="text-white font-bold">19 investors</span>, her runway was disappearing.
                        </p>

                        <p className="italic text-white border-l-2 border-blue-500 pl-6 py-2">
                            "I don't care about food waste. I'm losing revenue because I can't manage my kitchen shifts."
                        </p>
                        
                        <p>
                            In that moment, Maya embraced the <span className="text-amber-400 font-bold">Zig</span>. She rebuilt her AI to solve <span className="text-white font-bold">staffing logistics</span>. The resistance vanished. Sales cycles dropped from months to days.
                        </p>
                        
                        <div className="pt-6">
                            <p className="text-white/60 text-sm uppercase tracking-widest mb-1">The Result:</p>
                            <p className="text-emerald-400 text-5xl md:text-6xl font-black">$47M EXIT</p>
                        </div>
                    </section>

                    {/* CTA סופי */}
                    <div className="pt-20">
                        <Link href="/register" className="group inline-block">
                            <p className="text-3xl md:text-6xl font-black text-white leading-tight">Don't just start up.</p>
                            <p className="text-4xl md:text-7xl font-black text-purple-400 mt-2 group-hover:translate-x-4 transition-transform duration-300">StartZig.</p>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}