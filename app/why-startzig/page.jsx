"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function WhyStartZig() {
    const [user, setUser] = useState(null);
    const [textState, setTextState] = useState('up'); // 'up', 'fade', 'zig'

    useEffect(() => {
        const timer1 = setTimeout(() => setTextState('fade'), 1500);
        const timer2 = setTimeout(() => setTextState('zig'), 2000);
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans overflow-x-hidden">
            {/* Navbar מעודכן - כולל Why StartZig ראשון משמאל */}
            <nav className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-md z-50 border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        
                        <div className="flex-shrink-0">
                            <Link href="/">
                                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent cursor-pointer">
                                    StartZig
                                </span>
                            </Link>
                        </div>

                        <div className="hidden md:flex items-center space-x-8">
                            <div className="flex items-center space-x-4 border-r border-white/10 pr-4">
                                {/* הלינק החדש שביקשת */}
                                <Link href="/why-startzig" className="text-white bg-gray-800/50 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                    Why StartZig
                                </Link>
                                <Link href="/community" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                    Community
                                </Link>
                                <Link href="/pricing" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                    Pricing
                                </Link>
                            </div>

                            <div className="flex items-center space-x-4">
                                {user ? (
                                    <Link href="/dashboard">
                                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors">
                                            Go to dashboard
                                        </button>
                                    </Link>
                                ) : (
                                    <>
                                        <button className="text-white hover:bg-gray-700 px-4 py-2 rounded-md font-medium text-sm transition-colors">
                                            Login
                                        </button>
                                        <Link href="/register">
                                            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors">
                                                Sign Up
                                            </button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* תוכן ראשי */}
            <main className="relative z-10 flex flex-col items-center justify-center pt-40 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl w-full text-center">
                    
                    {/* כותרת אנימטיבית */}
                    <div className="mb-16 h-24 sm:h-32">
                        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-tight">
                            Why Start
                            <span className={`inline-block ml-3 transition-all duration-500 ${
                                textState === 'up' ? 'text-gray-400 opacity-100' : 
                                textState === 'fade' ? 'opacity-0' : 
                                'text-blue-400 opacity-100'
                            }`}>
                                {textState === 'zig' ? 'Zig' : 'Up'}
                            </span>
                            ?
                        </h1>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-12 text-slate-200">
                        <p className="text-lg sm:text-xl leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-forwards">
                            The name <span className="text-white font-bold">"StartUp"</span> implies a linear beginning. But starting is easy; staying alive through the turns is where the winners are decided.
                        </p>

                        <p className="text-lg sm:text-xl leading-relaxed animate-in fade-in slide-in-from-bottom-4 delay-300 duration-700 fill-mode-forwards">
                            Real startups don't fly; they navigate. They stumble. They <span className="text-white font-bold">zig</span> when everyone expects them to <span className="text-white font-bold">zag</span>.
                        </p>

                        {/* סיפור מאיה */}
                        <div className="my-12 pl-6 border-l-4 border-blue-400 bg-white/5 p-8 rounded-r-xl text-left animate-in fade-in slide-in-from-bottom-4 delay-500 duration-700 fill-mode-forwards">
                            <div className="space-y-4 text-base sm:text-lg leading-relaxed text-slate-300">
                                <p><span className="text-white font-bold">Maya</span> wanted to build <span className="text-blue-400 font-semibold">FreshCast</span> - AI for food waste.</p>
                                <p>19 investors rejected her. After a year, a customer said: <span className="italic">"Solve my staffing problem."</span></p>
                                <p>Maya did a <span className="text-amber-400 font-semibold text-xl">complete pivot</span>. 18 months later: $47M exit.</p>
                            </div>
                        </div>

                        <p className="text-xl sm:text-2xl text-white font-semibold italic py-8 border-y border-white/10 animate-in fade-in duration-1000 fill-mode-forwards">
                            "This isn't a deviation from the plan. This is the journey. This is the zigzag."
                        </p>

                        {/* Footer CTA */}
                        <div className="text-center pt-16">
                            <Link href="/register" className="group">
                                <p className="text-4xl sm:text-6xl font-black text-white leading-tight">
                                    Don't just start up.
                                </p>
                                <p className="text-4xl sm:text-6xl font-black text-purple-400 mt-2 group-hover:scale-105 transition-transform duration-300">
                                    StartZig.
                                </p>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}