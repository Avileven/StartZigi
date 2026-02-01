"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function WhyStartZig() {
    // לוגיקת משתמש בסיסית עבור ה-Navbar
    const [user, setUser] = useState(null);

    // לוגיקת אנימציה לטקסט (מעבר מ-StartUp ל-StartZig)
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
            {/* סגנון אנימציות (העתקה מה-HTML המקורי) */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
                
                .fade-in {
                    opacity: 0;
                    animation: fadeIn 1s ease-out forwards;
                }
                @keyframes fadeIn { to { opacity: 1; } }

                .slide-up {
                    opacity: 0;
                    transform: translateY(30px);
                    animation: slideUp 0.8s ease-out forwards;
                }
                @keyframes slideUp {
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .delay-1 { animation-delay: 0.2s; }
                .delay-2 { animation-delay: 0.4s; }
                .delay-3 { animation-delay: 0.6s; }
                .delay-4 { animation-delay: 0.8s; }
                .delay-5 { animation-delay: 1s; }
                .delay-6 { animation-delay: 1.2s; }
            `}</style>

            {/* סרגל ניווט - מבוסס בדיוק על הקוד שסיפקת  */}
            <nav className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-md z-50 border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        
                        {/* לוגו - צד שמאל [cite: 4-11] */}
                        <div className="flex-shrink-0">
                            <Link href="/">
                                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent cursor-pointer">
                                    StartZig
                                </span>
                            </Link>
                        </div>

                        {/* קבוצת כפתורים - מוצמד לימין [cite: 12-63] */}
                        <div className="hidden md:flex items-center space-x-8">
                            {/* קישורי ניווט [cite: 14-28] */}
                            <div className="flex items-center space-x-4 border-r border-white/10 pr-4">
                                <Link href="/community" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                    Community
                                </Link>
                                <Link href="/pricing" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                    Pricing
                                </Link>
                            </div>

                            {/* כפתורי Auth / Dashboard [cite: 29-62] */}
                            <div className="flex items-center space-x-4">
                                {user ? (
                                    <Link href="/dashboard">
                                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
                                            Go to dashboard
                                        </button>
                                    </Link>
                                ) : (
                                    <>
                                        <button className="text-white hover:bg-gray-700 px-4 py-2 rounded-md font-medium transition-colors">
                                            Login
                                        </button>
                                        <Link href="/register">
                                            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
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

            {/* תוכן ראשי [cite: 502-611] */}
            <main className="relative z-10 flex flex-col items-center justify-center pt-32 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl w-full">
                    
                    {/* כותרת אנימטיבית [cite: 505-521] */}
                    <div className="text-center mb-16 relative">
                        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-6 fade-in">
                            Why Start
                            {textState === 'up' && <span className="text-gray-400 transition-opacity duration-500">Up</span>}
                            {textState === 'fade' && <span className="text-gray-400 opacity-0 transition-opacity duration-500">Up</span>}
                            {textState === 'zig' && <span className="text-blue-400 opacity-100 transition-opacity duration-500">Zig</span>}
                            ?
                        </h1>
                    </div>

                    {/* גוף התוכן [cite: 538-592] */}
                    <div className="max-w-3xl mx-auto space-y-8 text-slate-200">
                        <div className="slide-up delay-1">
                            <p className="text-lg sm:text-xl leading-relaxed">
                                The name <span className="text-white font-bold">"StartUp"</span> implies a linear beginning. But starting is easy; staying alive through the turns is where the winners are decided. [cite: 543-544]
                            </p>
                        </div>

                        <div className="slide-up delay-2">
                            <p className="text-lg sm:text-xl leading-relaxed">
                                Real startups don't fly; they navigate. They stumble. They <span className="text-white font-bold">zig</span> when everyone expects them to <span className="text-white font-bold">zag</span>. [cite: 550]
                            </p>
                        </div>

                        {/* סיפור מקרה - מאיה [cite: 561-583] */}
                        <div className="my-12 pl-6 border-l-4 border-blue-400 slide-up delay-4 bg-white/5 p-6 rounded-r-lg">
                            <div className="space-y-4 text-base sm:text-lg leading-relaxed text-slate-300">
                                <p><span className="text-white font-bold">Maya</span> wanted to build <span className="text-blue-400 font-semibold">FreshCast</span> - AI for food waste. [cite: 565]</p>
                                <p>19 investors rejected her. After a year, a customer said: <span className="italic">"Solve my staffing problem."</span> [cite: 568, 571]</p>
                                <p>Maya did a <span className="text-amber-400 font-semibold">complete pivot</span>. 18 months later: $47M exit. [cite: 574, 580]</p>
                            </div>
                        </div>

                        <div className="slide-up delay-5">
                            <p className="text-lg sm:text-xl leading-relaxed text-white font-semibold italic">
                                "This isn't a deviation from the plan. This is the journey. This is the zigzag." [cite: 587]
                            </p>
                        </div>

                        {/* Footer CTA [cite: 593-608] */}
                        <div className="text-center pt-16 pb-8 slide-up delay-6">
                            <Link href="/" className="block hover:opacity-90 transition-opacity">
                                <p className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight">
                                    Don't just start up. [cite: 597]
                                </p>
                                <p className="text-4xl sm:text-5xl md:text-6xl font-black text-purple-400 mt-2">
                                    StartZig. [cite: 600]
                                </p>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}