"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function WhyStartZig() {
    const [user, setUser] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [textState, setTextState] = useState('up');
    const bgPathRef = useRef(null);

    // לוגיקת האנימציה של הזיגזג ברקע
    useEffect(() => {
        let animationFrameId;
        const duration = 8000;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = (elapsed % duration) / duration;

            const points = [];
            const segments = 20;

            for (let i = 0; i <= segments; i++) {
                const t = i / segments;
                const x = 100 + (600 * t);
                const y = 300 + Math.sin((t * 8 + progress * 2) * Math.PI) * 120;
                points.push(`${x} ${y}`);
            }

            if (bgPathRef.current) {
                const pathData = 'M ' + points.join(' L ');
                bgPathRef.current.setAttribute('d', pathData);
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();
        return () => cancelAnimationFrame(animationFrameId);
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
        <div className="min-h-screen bg-slate-900 text-white font-sans overflow-hidden relative">
            
            {/* רקע הזיגזג המונפש */}
            <div className="fixed inset-0 pointer-events-none opacity-10 z-0">
                <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
                    <path 
                        ref={bgPathRef}
                        stroke="#3b82f6" 
                        strokeWidth="8" 
                        fill="none" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    />
                </svg>
            </div>

            {/* סרגל ניווט - במבנה המדויק של דף Community */}
            <nav className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-md z-50 border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        
                        {/* לוגו - צד שמאל */}
                        <div className="flex-shrink-0">
                            <Link href="/">
                                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent cursor-pointer">
                                    StartZig
                                </span>
                            </Link>
                        </div>

                        {/* קישורי ניווט וכפתורי Auth - צד ימין */}
                       <nav className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-md z-50 border-b border-white/10">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-20">
      
      {/* לוגו */}
      <div className="flex-shrink-0">
        <Link href="/">
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent cursor-pointer">
            StartZig
          </span>
        </Link>
      </div>

      {/* כפתור המבורגר לנייד - מופיע רק כשקטן */}
      <div className="md:hidden flex items-center">
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-300 hover:text-white p-2">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* תפריט מחשב - הקוד המקורי שלך (hidden md:flex) */}
      <div className="hidden md:flex items-center space-x-8">
        <div className="flex items-center space-x-4 border-r border-white/10 pr-4">
          <Link href="/why-startzig" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
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
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Go to dashboard
              </button>
            </Link>
          ) : (
            <>
              <button onClick={handleLogin} className="text-white hover:bg-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Login
              </button>
              <Link href="/register">
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  </div>

  {/* תפריט נייד - מופיע רק כשלחוצים על ההמבורגר */}
  {isMenuOpen && (
    <div className="md:hidden bg-gray-900 border-t border-white/10 px-4 pt-2 pb-6 space-y-1">
      <Link href="/why-startzig" onClick={() => setIsMenuOpen(false)} className="block text-gray-300 hover:text-white px-3 py-3 rounded-md text-base font-medium">Why StartZig</Link>
      <Link href="/community" onClick={() => setIsMenuOpen(false)} className="block text-gray-300 hover:text-white px-3 py-3 rounded-md text-base font-medium">Community</Link>
      <Link href="/pricing" onClick={() => setIsMenuOpen(false)} className="block text-gray-300 hover:text-white px-3 py-3 rounded-md text-base font-medium">Pricing</Link>
      <div className="pt-4 border-t border-white/10 flex flex-col space-y-3">
        {user ? (
          <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
            <button className="w-full bg-indigo-600 text-white py-3 rounded-md font-medium text-center">Go to dashboard</button>
          </Link>
        ) : (
          <>
            <button onClick={() => { handleLogin(); setIsMenuOpen(false); }} className="w-full text-white bg-gray-800 py-3 rounded-md font-medium text-center">Login</button>
            <Link href="/register" onClick={() => setIsMenuOpen(false)}>
              <button className="w-full bg-indigo-600 text-white py-3 rounded-md font-medium text-center">Sign Up</button>
            </Link>
          </>
        )}
      </div>
    </div>
  )}
</nav>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 mt-20">
                <div className="max-w-4xl w-full">
                    
                    {/* כותרת עם הזיגזג הסטטי */}
                    <div className="text-center mb-16 relative">
                        <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 600 200">
                            <path d="M 50 150 L 120 120 L 110 80 L 180 100 L 170 60 L 240 80 L 230 40 L 300 60 L 290 30 L 360 50 L 550 20"
                                stroke="#3b82f6" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>

                        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-6 relative z-10">
                            Why Start
                            <span className={`inline-block ml-3 transition-opacity duration-500 ${textState === 'fade' ? 'opacity-0' : 'opacity-100'}`}>
                                <span className={textState === 'zig' ? 'text-blue-400' : 'text-gray-400'}>
                                    {textState === 'zig' ? 'Zig' : 'Up'}
                                </span>
                            </span>
                            ?
                        </h1>
                    </div>

                    {/* גוף התוכן המלא */}
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

                        <div className="animate-in fade-in slide-in-from-bottom-4 delay-500 duration-700">
                            <p className="text-lg sm:text-xl leading-relaxed">
                                Anyone familiar with the startup world — or who's been an entrepreneur — knows the zigzag of the entrepreneurial journey. Here's an example:
                            </p>
                        </div>

                        {/* סיפור מאיה המקורי */}
                        <div className="my-12 pl-6 border-l-4 border-blue-400 bg-white/5 p-8 rounded-r-xl">
                            <div className="space-y-4 text-base sm:text-lg leading-relaxed text-slate-300 text-left">
                                <p><span className="text-white font-bold">Maya</span> wanted to build <span className="text-blue-400 font-semibold">FreshCast</span> - an AI system helping restaurants prevent food waste.</p>
                                <p>19 investors rejected her. The 20th believed and invested <span className="text-white font-bold">₪300K</span>.</p>
                                <p>After a year stuck at 30 customers, one customer told her: <span className="italic">"Solve my staffing problem, not food waste."</span></p>
                                <p>Maya did a <span className="text-amber-400 font-semibold text-xl">complete pivot</span> - from food waste to smart staff scheduling.</p>
                                <p>Lost 43% of customers in the transition, but the new product exploded.</p>
                                <p className="text-white font-bold text-xl pt-2">18 months later: $47M exit.</p>
                            </div>
                        </div>

                        <div className="animate-in fade-in slide-in-from-bottom-4 delay-700">
                            <p className="text-lg sm:text-xl leading-relaxed text-white font-semibold italic">
                                This isn't a deviation from the plan. This is the journey. This is the zigzag.
                            </p>
                            <p className="text-lg sm:text-xl leading-relaxed mt-4">
                                And this is exactly what you practice at <span className="text-blue-400 font-bold">StartZig</span>.
                            </p>
                        </div>

                        <div className="text-center pt-20">
                            <Link href="/register" className="group">
                                <p className="text-4xl sm:text-6xl font-black text-white leading-tight">Don't just start up.</p>
                                <p className="text-4xl sm:text-6xl font-black text-purple-400 mt-2 group-hover:scale-105 transition-transform duration-300">StartZig.</p>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}