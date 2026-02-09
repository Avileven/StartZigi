"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AnimatedBg from "@/components/common/AnimatedBg"; 

export default function WhyStartZig() {
    const [textState, setTextState] = useState('up');

    // תיקון: מבטיח שהדף תמיד ייטען מלמעלה
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // אנימציית החלפת הטקסט (StartUp -> StartZig)
    useEffect(() => {
        const timer1 = setTimeout(() => setTextState('fade'), 1500);
        const timer2 = setTimeout(() => setTextState('zig'), 2000);
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans relative">
            
            {/* רקע מונפש */}
            <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                <AnimatedBg />
            </div>

            {/* שינוי מ-mt-20 ל-pt-32 כדי למנוע קפיצות גלילה */}
            <main className="relative z-10 min-h-screen pt-32 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto w-full">
                    
                    {/* כותרת */}
                    <div className="text-center mb-16 relative">
                        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-6 relative z-10 whitespace-nowrap">
                            Why Start
                            <span className={`inline-block ml-2 transition-opacity duration-500 ${textState === 'fade' ? 'opacity-0' : 'opacity-100'}`}>
                                <span className={textState === 'zig' ? 'text-blue-400' : 'text-gray-400'}>
                                    {textState === 'zig' ? 'Zig' : 'Up'}
                                </span>
                            </span>
                            <span className="ml-1">?</span>
                        </h1>
                    </div>

                    {/* גוף התוכן */}
                    <div className="max-w-3xl mx-auto space-y-8 text-slate-200">
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <p className="text-lg sm:text-xl leading-relaxed">
                                The name <span className="text-white font-bold">"StartUp"</span> implies a linear beginning. But starting is easy; staying alive through the turns is where the winners are decided.
                            </p>
                        </div>

                        <div className="animate-in fade-in slide-in-from-bottom-4 delay-300 duration-700">
                            <p className="text-lg sm:text-xl leading-relaxed">
                                Real startups don't fly; they navigate. They stumble. They <span className="text-white font-bold">zig</span> when everyone expects them to <span className="text-white font-bold">zag</span>. They learn, adapt, and find unexpected paths to success.
                            </p>
                        </div>

                        {/* סיפור מאיה */}
                        <div className="my-12 pl-6 border-l-4 border-blue-400 bg-white/5 p-8 rounded-r-xl text-left">
                            <div className="space-y-4 text-base sm:text-lg leading-relaxed text-slate-300">
                                <p><span className="text-white font-bold">Maya</span> wanted to build <span className="text-blue-400 font-semibold">FreshCast</span> - an AI system helping restaurants prevent food waste.</p>
                                <p>19 investors rejected her. The 20th believed and invested <span className="text-white font-bold">₪300K</span>.</p>
                                <p>After a year stuck at 30 customers, one customer told her: <span className="italic">"Solve my staffing problem, not food waste."</span></p>
                                <p>Maya did a <span className="text-amber-400 font-semibold text-xl">complete pivot</span>.</p>
                                <p className="text-white font-bold text-xl pt-2">18 months later: $47M exit.</p>
                            </div>
                        </div>

                        {/* קריאה לפעולה */}
                        <div className="text-center pt-10 mb-20">
                            <Link href="/register" className="group inline-block">
                                <p className="text-4xl sm:text-6xl font-black text-white leading-tight">Don't just start up.</p>
                                <p className="text-4xl sm:text-6xl font-black text-purple-400 mt-2 group-hover:scale-105 transition-transform duration-300">StartZig.</p>
                            </Link>
                        </div>

                        {/* Paul Graham Quote */}
                        <section className="py-20 px-6 bg-indigo-600/5 border-t border-white/5 rounded-2xl">
                            <div className="max-w-4xl mx-auto text-center">
                                <p className="text-2xl italic text-slate-300 leading-relaxed mb-6 font-serif">
                                    "The way to do really great work is to love what you do. In startups, that means loving the Zig."
                                </p>
                                <p className="font-bold text-white uppercase tracking-widest text-sm">— Paul Graham, Y Combinator</p>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}