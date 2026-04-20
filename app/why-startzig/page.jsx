// V 180426
"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

const STAGES = ["Idea.", "Product.", "Funding.", "Exit."];

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

            <style>{`
                @keyframes zigPulse {
                    0%, 100% { transform: translateX(0); opacity: 1; }
                    25% { transform: translateX(3px); opacity: 0.7; }
                    75% { transform: translateX(-3px); opacity: 0.7; }
                }
                .zig-word {
                    display: inline-block;
                    color: #93c5fd;
                    font-weight: 600;
                    animation: zigPulse 1.8s ease-in-out infinite;
                }
            `}</style>
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
                            These are the stages we usually associate with the development of a startup. A clear, structured progression from concept to outcome.
                        </p>

                        <p>
                            But in reality, the journey is rarely a straight upward path. It is filled with uncertainties, challenges, and unexpected moments that force both the startup and its founders to Zig, to adapt, adjust, and respond to change. At every stage, something can shift.
                        </p>

                        <p>
                            This is what we call a <span className="text-blue-400 font-semibold">Zig</span>.
                        </p>

                        <p>
                            A Zig is not failure, and it is not a deviation from the journey. It is the moment when reality interacts with assumptions and forces clarity. Some founders ignore these signals. Some react too late. And some adjust early, refine their direction, and move forward stronger.
                        </p>

                        <p>
                            <span className="text-blue-400 font-semibold">The idea</span> <span className="zig-word">Zigs</span>. A founder spends months on a concept, convinced there is a market. Then one conversation reveals the real problem is somewhere else entirely. Back to the beginning, not because of failure, but because reality showed up.
                        </p>

                        <p>
                            <span className="text-blue-400 font-semibold">The product</span> <span className="zig-word">Zigs</span>. Built for retail. Launched, pushed, marketed. The market doesn't respond. Then a single enterprise client tries it and sees exactly what they need. The entire direction shifts. New market, new pricing, new pitch. The product didn't change. The understanding did.
                        </p>

                        <p>
                            <span className="text-blue-400 font-semibold">Funding</span> <span className="zig-word">Zigs</span>. Forty rejections. Runway shrinking. Then one yes, and a $5M round closes six months later. Or the opposite: a large raise, confidence, scale, and then the realization that the unit economics don't work. A down round. A rebuild.
                        </p>

                        <p>
                            <span className="text-blue-400 font-semibold">The exit</span> <span className="zig-word">Zigs</span>. You spend a year preparing for an acquisition that never closes. The strategic buyer walks away, the valuation drops, the timing feels wrong. Then a player you never approached reaches out. They've been watching. They want to integrate what you built into something much bigger. The exit you get is never the one you planned for.
                        </p>

                        <p>
                            StartZig is built around these moments. It helps founders navigate each stage of their journey, not as a straight line, but as a continuous process of building, learning, and refining. From idea definition, to product shaping, to preparing for investment and beyond, each step is structured, but never final.
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
