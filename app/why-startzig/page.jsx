// V 180426
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AnimatedBg from '@/components/common/AnimatedBg';

export default function WhyStartZig() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        setTimeout(() => setVisible(true), 80);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-950 to-purple-950 text-white font-sans relative overflow-x-hidden">

            <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
                <AnimatedBg />
            </div>

            <main className="relative z-10 min-h-screen pt-28 md:pt-36 pb-32 px-6">
                <div
                    className="max-w-4xl mx-auto space-y-10 text-xl text-white/80 leading-relaxed"
                    style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? 'translateY(0)' : 'translateY(24px)',
                        transition: 'opacity 0.9s ease, transform 0.9s ease',
                    }}
                >
                    <p className="text-white/40 italic text-2xl">
                        An idea. A product. Growth. Success.
                    </p>

                    <p>
                        Most startup stories are told like a straight line.
                    </p>

                    <p>
                        Reality doesn't work like that.
                    </p>

                    <p>
                        Startups don't move in straight lines — they move in <span className="text-blue-400 font-bold">Zigs</span>.
                    </p>

                    <p>
                        A Zig is the moment something breaks your assumptions. A customer uses your product differently than you expected. A feature you believed in gets ignored. A market you targeted doesn't respond. Or a completely unexpected opportunity appears.
                    </p>

                    <p>
                        Most founders experience these moments. Few know how to respond to them. Some ignore them. Some panic. Some pivot too late.
                    </p>

                    <p>
                        The best founders do something else: they recognize the Zig — and <span className="text-white font-semibold">move with it</span>.
                    </p>

                    <p>
                        To Zig is not just to pivot. It's to adapt with awareness. It means letting real behavior override assumptions, making decisions with incomplete data, and adjusting direction without losing momentum.
                    </p>

                    <p>
                        Zigging is not a failure of the plan. <span className="text-white font-semibold">It is the process.</span>
                    </p>

                    <p>
                        A founder builds a product for one clear problem. Then a user says: <span className="italic text-white">"I don't need that — I need something else."</span> That moment is the Zig. Not in the product. In the founder's thinking.
                    </p>

                    <p>
                        Ignore it — and you waste months. Chase it blindly — and you lose direction. Understand it — and everything changes.
                    </p>

                    <p>
                        StartZig exists to help founders experience these moments earlier — before they become expensive. Inside the platform, founders move through the real stages of building a startup, from idea to MVP to product-market fit and beyond. But more importantly — they encounter the Zigs. Moments where assumptions are challenged, decisions must be made, and direction is unclear. And instead of guessing in the real world, they learn how to navigate them.
                    </p>

                    <p>
                        <span className="text-white font-bold">"StartUp"</span> suggests a beginning. <span className="text-purple-400 font-bold">"StartZig"</span> suggests something else: that what defines a startup is not how it starts — but how it changes direction.
                    </p>

                </div>

                <div
                    className="max-w-4xl mx-auto text-center pt-40"
                    style={{
                        opacity: visible ? 1 : 0,
                        transition: 'opacity 1.2s ease 0.4s',
                    }}
                >
                    <Link href="/register" className="group inline-block">
                        <p className="text-3xl md:text-5xl font-bold text-white/70 leading-tight">
                            Startups don't succeed because they followed the plan.
                        </p>
                        <p className="text-xl md:text-2xl text-white/40 mt-4 font-normal">
                            They succeed because they learned when to Zig.
                        </p>
                        <p className="text-2xl md:text-4xl font-bold text-white/60 mt-10">Don't just start.</p>
                        <p className="text-5xl md:text-8xl font-black text-purple-400 mt-2 group-hover:scale-105 transition-transform duration-300">
                            StartZig.
                        </p>
                    </Link>
                </div>
            </main>
        </div>
    );
}
