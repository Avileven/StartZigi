// V 180426
"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import AnimatedBg from '@/components/common/AnimatedBg';

export default function WhyStartZig() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        setTimeout(() => setVisible(true), 100);
    }, []);

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans relative overflow-x-hidden">

            {/* Animated background */}
            <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
                <AnimatedBg />
            </div>

            <main className="relative z-10 min-h-screen pt-24 md:pt-32 pb-24 px-6 sm:px-10 lg:px-16">
                <div className="max-w-4xl mx-auto w-full">
                    <div
                        className="text-left space-y-10 text-xl text-white/70 leading-relaxed"
                        style={{
                            opacity: visible ? 1 : 0,
                            transform: visible ? 'translateY(0)' : 'translateY(20px)',
                            transition: 'opacity 0.8s ease, transform 0.8s ease',
                        }}
                    >

                        {/* Opening */}
                        <p>
                            Most startup stories are told like a straight line.
                        </p>
                        <p className="text-white/40 italic">
                            An idea. A product. Growth. Success.
                        </p>
                        <p>
                            Reality doesn't work like that.
                        </p>
                        <p>
                            Startups don't move in straight lines — they move in <span className="text-blue-400 font-bold">Zigs</span>.
                        </p>

                        {/* What is a Zig */}
                        <div className="border-l-2 border-white/10 pl-6 space-y-4">
                            <p className="text-white font-semibold">A Zig is the moment something breaks your assumptions:</p>
                            <ul className="space-y-2 text-white/60">
                                <li>— A customer uses your product differently than you expected</li>
                                <li>— A feature you believed in gets ignored</li>
                                <li>— A market you targeted doesn't respond</li>
                                <li>— Or a completely unexpected opportunity appears</li>
                            </ul>
                        </div>

                        <p>Most founders experience these moments. Few know how to respond to them.</p>

                        <div className="space-y-2 text-white/50">
                            <p>Some ignore them.</p>
                            <p>Some panic.</p>
                            <p>Some pivot too late.</p>
                        </div>

                        <p>
                            The best founders do something else: they recognize the Zig — and <span className="text-white font-semibold">move with it</span>.
                        </p>

                        {/* What does it mean to Zig */}
                        <div className="pt-4 space-y-6">
                            <p className="text-blue-400 font-bold tracking-widest uppercase text-xs">What does it mean to "Zig"?</p>
                            <p>
                                To Zig is not just to pivot. It's to <span className="text-white font-semibold">adapt with awareness</span>.
                            </p>
                            <div className="border-l-2 border-blue-400/30 pl-6 space-y-2 text-white/60">
                                <p>— Letting real behavior override assumptions</p>
                                <p>— Making decisions with incomplete data</p>
                                <p>— Adjusting direction without losing momentum</p>
                            </div>
                            <p>
                                Zigging is not a failure of the plan.<br />
                                <span className="text-white">It is the process.</span>
                            </p>
                        </div>

                        {/* Simple Zig example */}
                        <div className="pt-4 space-y-4 bg-white/[0.03] rounded-2xl p-6 border border-white/[0.06]">
                            <p className="text-blue-400 font-bold tracking-widest uppercase text-xs">A Simple Zig</p>
                            <p>A founder builds a product for one clear problem.</p>
                            <p>Then a user says:</p>
                            <p className="text-white italic text-lg pl-4 border-l-2 border-white/20">
                                "I don't need that — I need something else."
                            </p>
                            <p>That moment is the Zig.</p>
                            <p className="text-white/40">Not in the product. In the founder's thinking.</p>
                            <div className="grid grid-cols-3 gap-4 pt-2 text-sm">
                                <div className="text-center p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                    <p className="text-red-400 font-semibold">Ignore it</p>
                                    <p className="text-white/40 mt-1">waste months</p>
                                </div>
                                <div className="text-center p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                    <p className="text-yellow-400 font-semibold">Chase blindly</p>
                                    <p className="text-white/40 mt-1">lose direction</p>
                                </div>
                                <div className="text-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                    <p className="text-emerald-400 font-semibold">Understand it</p>
                                    <p className="text-white/40 mt-1">everything changes</p>
                                </div>
                            </div>
                        </div>

                        {/* Why StartZig */}
                        <div className="pt-4 space-y-6">
                            <p className="text-blue-400 font-bold tracking-widest uppercase text-xs">Why StartZig</p>
                            <p>
                                StartZig exists to help founders experience these moments earlier — before they become expensive.
                            </p>
                            <p>
                                Inside the platform, founders move through the real stages of building a startup: from idea, to MVP, to product-market fit and beyond.
                            </p>
                            <p>
                                But more importantly — they encounter the <span className="text-blue-400 font-bold">Zigs</span>.
                            </p>
                            <div className="border-l-2 border-white/10 pl-6 space-y-2 text-white/60">
                                <p>— Moments where assumptions are challenged</p>
                                <p>— Decisions must be made</p>
                                <p>— Direction is unclear</p>
                            </div>
                            <p>
                                And instead of guessing in the real world, they learn how to navigate them.
                            </p>
                        </div>

                        {/* The name */}
                        <div className="pt-4 space-y-4">
                            <p className="text-blue-400 font-bold tracking-widest uppercase text-xs">The Meaning Behind the Name</p>
                            <p>
                                <span className="text-white font-bold">"StartUp"</span> suggests a beginning.
                            </p>
                            <p>
                                <span className="text-purple-400 font-bold">"StartZig"</span> suggests something else: that what defines a startup is not how it starts — but <span className="text-white font-semibold">how it changes direction</span>.
                            </p>
                        </div>

                    </div>

                    {/* Final CTA */}
                    <div className="text-center pt-40">
                        <Link href="/register" className="group inline-block">
                            <p className="text-3xl md:text-6xl font-black text-white leading-tight">
                                Startups don't succeed because they followed the plan.
                            </p>
                            <p className="text-xl md:text-2xl text-white/50 mt-4 font-normal">
                                They succeed because they learned when to Zig.
                            </p>
                            <p className="text-2xl md:text-4xl font-black text-white/60 mt-8">Don't just start.</p>
                            <p className="text-4xl md:text-7xl font-black text-purple-400 mt-2 group-hover:scale-105 transition-transform duration-300">StartZig.</p>
                        </Link>
                    </div>

                </div>
            </main>
        </div>
    );
}
