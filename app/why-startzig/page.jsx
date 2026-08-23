"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import ZigLoopRing from "@/components/utils/ZigLoopRing";

export default function WhyStartZig() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans">
            <main className="min-h-screen pt-28 md:pt-36 pb-32 px-6">
                <div className="max-w-4xl mx-auto w-full">

                    <h1 className="text-4xl md:text-5xl font-bold mb-16 pb-3 leading-relaxed">
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent inline-block pb-2">
                            Why StartZig
                        </span>
                    </h1>

                    <div className="space-y-16 text-xl text-gray-600 leading-relaxed">

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">What Is Zigging All About?</h2>
                            <div className="space-y-6">
                                <p>
                                    Every startup journey looks straight on paper: Idea, Product, Launch, Growth. But in reality, the path is never as straight as it looks. You start with an idea. You define a product, make assumptions about what people will want, and begin building. Then reality starts talking back. A feature you thought was essential turns out to matter less than expected. Something you considered secondary gets the strongest reaction. Users misunderstand something you thought was obvious. That's not a problem with the process. It's a process of continuous discovery.
                                </p>
                                <p>
                                    A <span className="text-blue-600 font-semibold">Zig</span> is the moment when what you learn changes what you build next. You remove what isn't working, strengthen what is, rethink your assumptions, and move forward with a better definition of the product.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">The Zig Loop</h2>
                            <p className="text-base text-gray-500 mb-6">A continuous cycle that keeps your product moving toward reality.</p>
                            <ZigLoopRing />
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">The StartZig Ecosystem</h2>
                            <div className="space-y-6">
                                <p>
                                    StartZig brings the people, tools, and feedback needed for that process into one ecosystem.
                                </p>
                                <div className="space-y-3">
                                    <p><span className="font-bold text-gray-900">FOUNDERS.</span> Define ideas, shape products, make decisions, and learn through the process.</p>
                                    <p><span className="font-bold text-gray-900">COMMUNITY.</span> Other founders and users are invited to provide structured feedback on product demos and features.</p>
                                    <p><span className="font-bold text-gray-900">AI.</span> Helps founders make sense of the information they collect, identify patterns, and see signals that may be difficult to spot on their own.</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Founders Helping Founders</h2>
                            <div className="space-y-6">
                                <p>
                                    The ecosystem works both ways.
                                </p>
                                <p>
                                    The person building your product doesn't have to be the only person thinking about it. A founder can review another founder's idea, evaluate an MVP, test a Beta, or share an insight based on their own experience. That creates a two way ecosystem. Today, you help someone else understand their product. Tomorrow, someone else can help you understand yours. And by contributing, founders develop their own ability to evaluate products, recognize opportunities, and think through problems.
                                </p>
                                <p>
                                    The community becomes part of the learning process.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Feedback Is Only Useful If You Can Learn From It</h2>
                            <div className="space-y-6">
                                <p>
                                    Getting feedback isn't difficult. Understanding what to do with it is. Unstructured feedback like "Looks good" or "I'm not sure I'd use this" may be honest, but it's difficult to turn into a product decision.
                                </p>
                                <p>
                                    StartZig structures feedback around the questions that matter at each stage of the journey. Instead of giving a founder a collection of disconnected opinions, structured feedback can reveal patterns, like which features people love, which raise concerns, and where their expectations don't match what you built, and in the end make a real insight about the product's functionality.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">From Community to Early Users</h2>
                            <div className="space-y-6">
                                <p>
                                    The ecosystem has another effect. The people who discover and interact with a product while it's being built can become more than sources of feedback. They can become early adopters. Someone who discovers an idea at the MVP stage might follow its progress, return to see the MLP, test the Beta, and eventually become one of its first users. This means the process of validating a product can also begin the process of building its audience.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Finds the Signal. You Make the Zig.</h2>
                            <div className="space-y-6">
                                <p>
                                    Community feedback provides the human perspective. AI can help identify patterns across that feedback, highlight recurring signals, and help the founder understand what deserves attention. But AI doesn't decide what the product should become. You do.
                                </p>
                            </div>
                        </section>

                    </div>

                    {/* CTA */}
                    <div className="text-center pt-32">
                        <p className="text-gray-400 italic text-2xl mb-12">
                            Ready to Zig?
                        </p>
                        <Link href="/register">
                            <button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full text-lg font-medium transition-all">
                                Start Your Journey
                            </button>
                        </Link>
                    </div>

                </div>
            </main>
        </div>
    );
}
