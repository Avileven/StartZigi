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
                <div className="max-w-4xl mx-auto w-full">
                    
                    {/* גוף הטקסט ברצף שוטף עם הפונט של דף הבית */}
                    <div className="text-left space-y-6 text-xl text-white/70 leading-relaxed">
                        
                        <p>
                            The name <span className="text-white font-bold">"StartUp"</span> implies a linear beginning. 
                            But starting is easy; staying alive through the turns is where the winners are decided.
                        </p>

                        <div className="relative">
                            {/* אנימציה משולבת בעדינות ברקע */}
                            <div className="absolute inset-0 z-0 opacity-20">
                                <AnimatedBg />
                            </div>
                            
                            <div className="relative z-10 space-y-6">
                                <p>
                                    Real startups don't fly; they navigate. They stumble. 
                                    They <span className="text-blue-400 font-bold italic">zig</span> when everyone expects them to <span className="text-white font-bold">zag</span>. 
                                    They learn, adapt, and find unexpected paths to success.
                                </p>
                                
                                <p>
                                    "The way to do really great work is to love what you do. In startups, that means loving the Zig." <br />
                                    <span className="text-sm uppercase tracking-widest font-bold opacity-60">— Paul Graham, Y Combinator</span>
                                </p>
                            </div>
                        </div>

                        {/* סיפור מאיה - המשך רציף באותו פונט */}
                        <div className="pt-4 space-y-6">
                            <p className="text-blue-400 font-bold tracking-widest uppercase text-xs">
                                A Classic Zigzag Example
                            </p>
                            <p>
                                <span className="text-white font-bold">Maya</span> spent two years developing <span className="text-blue-400 font-semibold">FreshCast</span>. Her vision was clear: using AI to predict demand and help high-end restaurants eliminate food waste.
                            </p>
                            <p>
                                But the market didn't care. After pitching to <span className="text-white font-bold">19 investors</span>, her runway was disappearing. 
                                A client told her: <span className="italic text-white">"I don't care about food waste. I'm losing revenue because I can't manage my kitchen shifts."</span>
                            </p>
                            <p>
                                In that moment, Maya embraced the <span className="text-amber-400 font-bold">Zig</span>. She rebuilt her AI to solve <span className="text-white font-bold">staffing logistics</span>. The resistance vanished. Sales cycles dropped from months to days.
                            </p>
                            
                            {/* האקזיט מוטמע כחלק מהסיפור, קטן ואלגנטי */}
                            <p>
                                <span className="text-white/40 text-sm uppercase tracking-widest mr-2">18 Months Later:</span>
                                <span className="text-emerald-400 font-bold">$47M EXIT</span>
                            </p>
                        </div>
                    </div>

                    {/* סלוגן סופי - נשאר גדול וממורכז לאימפקט */}
                    <div className="text-center pt-32">
                        <Link href="/register" className="group inline-block">
                            <p className="text-3xl md:text-6xl font-black text-white leading-tight">Don't just start up.</p>
                            <p className="text-4xl md:text-7xl font-black text-purple-400 mt-2 group-hover:scale-105 transition-transform duration-300">StartZig.</p>
                        </Link>
                    </div>

                </div>
            </main>
        </div>
    );
}