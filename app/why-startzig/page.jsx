// V 180426
"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

const STAGES = ["An idea.", "A product.", "Funding.", "An exit."];

export default function WhyStartZig() {
    const [activeStage, setActiveStage] = useState(-1);
    const [showText, setShowText] = useState(false);
    const [doneStages, setDoneStages] = useState([]);
    const hasRun = useRef(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (hasRun.current) return;
        hasRun.current = true;

        let i = 0;
        function nextStage() {
            if (i < STAGES.length) {
                setActiveStage(i);
                setDoneStages(prev => [...prev, i - 1].filter(x => x >= 0));
                i++;
                setTimeout(nextStage, 1400);
            } else {
                setDoneStages([0, 1, 2, 3]);
                setActiveStage(-1);
                setTimeout(() => setShowText(true), 600);
            }
        }
        setTimeout(nextStage, 600);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-950 to-purple-950 text-white font-sans relative overflow-x-hidden">

            <main className="relative z-10 min-h-screen pt-28 md:pt-36 pb-32 px-6">
                <div className="max-w-4xl mx-auto w-full">

                    {/* Animation */}
                    <div className="flex flex-wrap gap-3 md:gap-5 mb-16 items-baseline">
                        {STAGES.map((stage, i) => (
                            <span
                                key={i}
                                className="italic transition-all duration-700"
                                style={{
                                    fontSize: `${2 + i * 0.4}rem`,
                                    fontWeight: [300, 400, 600, 700][i],
                                    color: activeStage === i
                                        ? 'rgba(255,255,255,0.92)'
                                        : doneStages.includes(i)
                                        ? 'rgba(255,255,255,0.30)'
                                        : 'rgba(255,255,255,0.10)',
                                    transform: activeStage === i ? 'scale(1.05)' : 'scale(1)',
                                    display: 'inline-block',
                                }}
                            >
                                {stage}
                            </span>
                        ))}
                    </div>

                    {/* Body text */}
                    <div
                        className="space-y-10 text-xl text-white/70 leading-relaxed"
                        style={{
                            opacity: showText ? 1 : 0,
                            transform: showText ? 'translateY(0)' : 'translateY(20px)',
                            transition: 'opacity 1s ease, transform 1s ease',
                        }}
                    >
                        <p>
                            Those are the stages. And yes, that's the real order. But inside each one, the path Zigs.
                        </p>

                        <p>
                            <span className="text-blue-400 font-semibold">The idea</span> Zigs. A founder spends months on a concept, convinced there's a market. Then one conversation reveals the real problem is somewhere else entirely. Back to the beginning, not because of failure, but because reality showed up.
                        </p>

                        <p>
                            <span className="text-blue-400 font-semibold">The product</span> Zigs. Built for retail. Launched, pushed, marketed. The market doesn't respond. Then a single enterprise client tries it and sees exactly what they need. The entire direction shifts. New market, new pricing, new pitch. The product didn't change. The understanding did.
                        </p>

                        <p>
                            <span className="text-blue-400 font-semibold">Funding</span> Zigs. Forty rejections. Runway shrinking. Then one yes, and a $5M round closes six months later. Or the opposite: a large raise, confidence, scale, and then the realization that the unit economics don't work. A down round. A rebuild.
                        </p>

                        <p>
                            <span className="text-blue-400 font-semibold">The exit</span> Zigs. You spend a year preparing for an acquisition that never closes. The strategic buyer walks away, the valuation drops, the timing feels wrong. Then out of nowhere. A player you never approached reaches out. They've been watching. They want to integrate what you built into something much bigger. The exit you get is never the one you planned for.
                        </p>

                        <p>
                            The Zig is not the exception. It's the pattern.
                        </p>

                        <p className="italic text-white/50">
                            Zigging is not a failure of the plan. It is the process.
                        </p>

                        <p>
                            Inside StartZig, you don't read about the Zig. You experience it. At each stage from idea to exit, the platform challenges your assumptions with real feedback from a live community, an AI mentor, and simulated investors. Three perspectives: the market, the expertise, and the capital. Before you spend a single dollar.
                        </p>

                    </div>

                    {/* CTA */}
                    <div
                        className="text-center pt-40"
                        style={{
                            opacity: showText ? 1 : 0,
                            transition: 'opacity 1.4s ease 0.6s',
                        }}
                    >
                        <p className="text-white/40 italic text-2xl mb-12">
                            Ready to Zig?
                        </p>
                        <Link href="/register">
                            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-full border border-white/30 text-lg font-medium transition-all">
                                Start Your Journey
                            </button>
                        </Link>
                    </div>

                </div>
            </main>
        </div>
    );
}
