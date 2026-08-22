"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';

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
                                    Every startup journey looks straight on paper: idea, product, funding, exit. In practice, it never is.
                                </p>
                                <p>
                                    Say you define five features for your first version, each one feels essential while you're building it. You share it with the community, and real feedback comes back. Two of those features people love. Two others get a lukewarm reaction, or worse, people say they'd never miss them. That's not proof you failed. It's proof your assumptions just met reality.
                                </p>
                                <p>
                                    That moment is what we call a <span className="text-blue-600 font-semibold">Zig</span>. You cut what isn't landing, sharpen what is, and move forward with a product actually shaped by real signal, not just your own conviction. StartZig is built around that reality. Not a straight line from idea to launch, but a process of building, hearing real reactions, and adjusting, again and again, until what you're building actually matches what people want.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">How StartZig Makes It Work</h2>
                            <div className="space-y-6">
                                <p>
                                    StartZig combines several layers of analysis into one continuous process. Community feedback gives you real human perspective. AI helps you find the patterns inside that feedback. And you, the founder, make the actual decisions.
                                </p>
                                <p>
                                    The goal isn't just feedback for its own sake. It's precision. Defining a product that genuinely fits a real market need, not one that sounds good in a pitch but misses what people actually want. Every layer exists to sharpen that definition, again and again, as you learn.
                                </p>
                                <p>
                                    There's a second layer to this that most tools ignore completely. Every founder who reviews your idea, tries your MVP, or gives you feedback is also a potential early user. Long before your product is fully built, StartZig helps you start building the audience around it. So that by the time you're ready to launch, you're not starting from zero.
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
