"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
// ייבוא רכיב האנימציה שביקשת
import AnimatedBg from '@/components/common/AnimatedBg';

export default function WhyStartZig() {
    const [textState, setTextState] = useState('up');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const timer1 = setTimeout(() => setTextState('fade'), 1500);
        const timer2 = setTimeout(() => setTextState('zig'), 2000);
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans relative overflow-x-hidden">
            
            <main className="relative z-10 min-h-screen pt-24 md:pt-32 pb-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto w-full text-center">
                    
                    {/* Hero Title */}
                    <div className="mb-12 md:mb-16">
                        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white mb-6 whitespace-nowrap inline-block">
                            Why Start
                            <span className={`inline-block ml-2 transition-opacity duration-500 ${textState === 'fade' ? 'opacity-0' : 'opacity-100'}`}>
                                <span className={textState === 'zig' ? 'text-blue-400' : 'text-gray-400'}>
                                    {textState === 'zig' ? 'Zig' : 'Up'}
                                </span>
                            </span>
                            <span>?</span>
                        </h1>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-12 text-slate-200">
                        
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <p className="text-xl md:text-2xl leading-relaxed font-light">
                                The name <span className="text-white font-bold">"StartUp"</span> implies a linear beginning. <br className="hidden md:block" />
                                But starting is easy; staying alive through the turns is where the winners are decided.
                            </p>
                        </div>

                        <section className="py-10 md:py-12 px-6 md:px-10 bg-indigo-600/5 border-t border-white/5 rounded-2xl">
                            <p className="text-xl md:text-2xl italic text-slate-300 leading-relaxed mb-6 font-serif">
                                "The way to do really great work is to love what you do. In startups, that means loving the Zig."
                            </p>
                            <p className="font-bold text-white uppercase tracking-widest text-xs md:text-sm">— Paul Graham, Y Combinator</p>
                        </section>

                        <div className="space-y-6 md:space-y-8">
                            <p className="text-lg md:text-xl leading-relaxed">
                                Real startups don't fly; they navigate. They stumble. <br className="hidden md:block" />
                                They <span className="text-white font-bold text-blue-400">zig</span> when everyone expects them to <span className="text-white font-bold">zag</span>. <br className="hidden md:block" />
                                They learn, adapt, and find unexpected paths to success.
                            </p>
                        </div>

                        {/* שילוב האנימציה - מופיעה כאן ברצף הויזואלי */}
                        <div className="relative h-64 w-full overflow-hidden rounded-3xl border border-white/5 bg-slate-900/50">
                            <AnimatedBg />
                        </div>

                        {/* סיפור מאיה - המשפט שהיה בחוץ הוכנס פנימה */}
                        <section className="py-10 md:py-12 px-6 md:px-10 bg-indigo-600/5 border-t border-white/5 rounded-2xl text-center">
                            <div className="mb-8">
                                <p className="text-blue-400 font-medium tracking-wide uppercase text-xs md:text-sm">
                                    Here is a classic example of how the zigzag journey looks in the real world:
                                </p>
                            </div>

                            <div className="space-y-6 text-base md:text-lg leading-relaxed text-slate-300">
                                <p>
                                    <span className="text-white font-bold">Maya</span> spent two years developing <span className="text-blue-400 font-semibold">FreshCast</span>. Her vision was clear: using AI to predict demand and help high-end restaurants eliminate food waste.
                                </p>
                                <p>
                                    But the market didn't care. After pitching to <span className="text-white font-bold">19 investors</span>, her runway was disappearing. The 20th investor wrote a check for <span className="text-white font-bold">₪300K</span>, but even that wasn't enough to scale.
                                </p>
                                <p>
                                    With three months of cash left, a client told her: <br />
                                    <span className="italic text-white underline decoration-blue-500/50">"I don't care about food waste. I'm losing revenue because I can't manage my kitchen shifts."</span>
                                </p>
                                
                                <div className="flex justify-center">
                                    <p className="bg-amber-400/10 p-4 border-l-4 border-amber-400 italic text-center max-w-md">
                                        In that moment, Maya embraced the <span className="text-amber-400 font-bold">Zig</span>. 
                                    </p>
                                </div>

                                <p>
                                    She rebuilt her AI to solve <span className="text-white font-bold">staffing logistics</span>. The resistance vanished. Sales cycles dropped from months to days.
                                </p>
                                
                                <div className="pt-6 border-t border-white/10 flex flex-col items-center justify-center gap-2">
                                    <span className="text-white font-bold text-xl uppercase tracking-widest">18 months later:</span>
                                    <span className="text-blue-400 text-4xl md:text-5xl font-black">$47M EXIT</span>
                                </div>
                            </div>
                        </section>

                        <div className="pt-10">
                            <Link href="/register" className="group inline-block">
                                <p className="text-3xl md:text-6xl font-black text-white leading-tight">Don't just start up.</p>
                                <p className="text-4xl md:text-7xl font-black text-purple-400 mt-2 group-hover:scale-105 transition-transform duration-300">StartZig.</p>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}