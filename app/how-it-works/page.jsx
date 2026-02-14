"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';


export default function HowItWorks() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans relative overflow-x-hidden">
            
            

            <main className="relative z-10 min-h-screen pt-24 md:pt-32 pb-24 px-6 sm:px-10 lg:px-16">
                <div className="max-w-6xl mx-auto w-full">
                    
                    
                    <div className="space-y-48">
                        
                        {/* Slide 1: Your Dashboard */}
                        <section className="flex flex-col lg:flex-row gap-12 items-start">
                            <div className="lg:w-1/3 space-y-4 text-left lg:sticky lg:top-32">
                                <div className="text-blue-400 font-bold tracking-widest uppercase text-xs"></div>
                                <h3 className="text-3xl font-bold text-white">Your Control Center</h3>
                                <p className="text-xl text-white/70 leading-relaxed">
                                    Professional dashboard for managing your venture. Access your toolbox, monitor revenue, and track your startup's lifecycle from one central hub.It guides you through every critical milestone—from Initial Idea and Business Planning to MVP, MLP, Beta, and Growth stages.

It integrates advanced tools for crafting a comprehensive business plan, modeling your revenue, and managing investor communications. Through the dashboard, you can monitor your venture’s financial health in real-time, manage budgets, and maintain total control over your startup’s strategic roadmap.
                                </p>
                            </div>

                            <div className="lg:w-2/3 w-full bg-gray-100 rounded-2xl p-4 md:p-8 shadow-2xl text-left">
                                <p className="text-gray-700 text-lg mb-6 text-center font-medium">Professional dashboard for managing your venture</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Sidebar */}
                                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center shrink-0">
                                                <span className="text-white font-bold">S</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">StartZig</h4>
                                                <p className="text-[10px] text-gray-600 uppercase">Build your startup</p>
                                            </div>
                                        </div>
                                        <h5 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-tighter">Toolbox</h5>
                                        <div className="space-y-2 text-sm text-gray-700">
                                            {['💡 Edit Landing Page', '💰 Financials', '📄 Business Plan', '👥 Invite Co-Founder', '📢 Promotion Center', '📊 Revenue Modeling'].map((item) => (
                                                <div key={item} className="p-2 hover:bg-white rounded transition-colors">{item}</div>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Main Content */}
                                    <div className="md:col-span-2 space-y-4">
                                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                            <h3 className="text-3xl font-bold text-gray-900 mb-1">Good morning, Dan!</h3>
                                            <p className="text-gray-600 text-sm">Sunday, February 1, 2026</p>
                                            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                                                🧪 Current Phase: BETA
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                            <h4 className="font-bold text-xl text-gray-900 mb-3">Smartech</h4>
                                            <div className="flex flex-wrap gap-4 text-xs text-gray-600 mb-6 font-medium">
                                                <span>💬 7 messages</span><span>❤️ 0 likes</span><span>📅 6 days old</span><span className="text-gray-900 font-bold">💰 Balance: $13,823</span>
                                            </div>
                                            <h5 className="font-bold text-lg text-gray-900 mb-3">Board</h5>
                                            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-2xl">🎉</span>
                                                        <span className="font-bold text-gray-900">MLP Phase Complete!</span>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <div className="text-[10px] font-bold text-green-700 uppercase">PHASE COMPLETE</div>
                                                        <div className="text-[10px] text-gray-500">Jan 28, 2026</div>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-700 mb-3 leading-relaxed">Congratulations! You've successfully completed your Minimum Lovable Product. You are now entering the Beta phase.</p>
                                                <button className="text-xs text-gray-500 hover:text-gray-800 font-bold uppercase tracking-wider">✕ Dismiss</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Slide 2: Invite a Co-Founder */}
                        <section className="flex flex-col lg:flex-row-reverse gap-12 items-start">
                            <div className="lg:w-1/3 space-y-4 text-left lg:sticky lg:top-32">
                                <div className="text-purple-400 font-bold tracking-widest uppercase text-xs"></div>
                                <h3 className="text-3xl font-bold text-white">Collaborative Growth</h3>
                                <p className="text-xl text-white/70 leading-relaxed">
                                    StartZig allows you to invite co-founders and engage users from both inside and outside the platform to provide feedback on your venture. From the initial concept to the advanced stages, you can gather insights on your landing page and product, manage team access, and grow your startup’s community through every phase of development.
                                </p>
                            </div>

                            <div className="lg:w-2/3 w-full bg-slate-50 rounded-2xl p-6 md:p-10 shadow-2xl text-left">
                                <div className="text-center mb-8">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Invite a Co-Founder</h3>
                                    <p className="text-base text-gray-600">Candidates will receive a link to view your Venture Profile.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2">
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                                </div>
                                                <h4 className="text-lg font-bold text-gray-900">Send Invitation</h4>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name *</label>
                                                        <div className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-600">Don Mandel</div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address *</label>
                                                        <div className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-600">don@startzig.com</div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Personal Message (Optional)</label>
                                                    <div className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-600 h-24 italic whitespace-pre-wrap">
                                                        Hi don,{"\n"}come and join my venture.{"\n"}John k
                                                    </div>
                                                </div>
                                                <button className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg text-sm shadow-md">Send Invitation</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                            </div>
                                            <h5 className="text-base font-bold text-gray-900">Team Status</h5>
                                        </div>
                                        <div className="flex items-center justify-between py-4 border-t border-gray-200">
                                            <span className="text-sm text-gray-600">Current Founders</span>
                                            <span className="text-2xl font-bold text-gray-900">1</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Slide 3: Pitch to Investors */}
                        <section className="flex flex-col lg:flex-row gap-12 items-start">
                            <div className="lg:w-1/3 space-y-4 text-left lg:sticky lg:top-32">
                                <div className="text-emerald-400 font-bold tracking-widest uppercase text-xs"></div>
                                <h3 className="text-3xl font-bold text-white">Complete Fundraising Expirence</h3>
                                <p className="text-xl text-white/70 leading-relaxed">
                                    The system facilitates the fundraising experience through outreach to Angel investors and Venture Capital firms.Simulate the real pressure. Answer tough questions from AI investors and refine your strategy based on their critical feedback.
                                </p>
                            </div>

                            <div className="lg:w-2/3 w-full bg-gray-200 rounded-2xl p-6 md:p-10 shadow-2xl text-left">
                                <div className="space-y-6 max-w-2xl mx-auto">
                                    {/* User Message */}
                                    <div className="flex justify-end">
                                        <div className="flex items-end gap-3">
                                            <div className="bg-blue-600 text-white rounded-2xl rounded-br-sm px-4 py-3 max-w-md shadow-md">
                                                <p className="text-sm">great thanks</p>
                                            </div>
                                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shrink-0 shadow-lg">
                                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Isabella Message 1 */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-gray-400 rounded-full shrink-0 shadow-inner flex items-center justify-center font-bold text-white text-xs italic">I</div>
                                        <div className="bg-white text-gray-900 rounded-2xl rounded-tl-sm px-4 py-3 max-w-md shadow-sm border border-gray-100">
                                            <p className="text-sm">I've gone over your business plan and have a few questions for you.</p>
                                        </div>
                                    </div>
                                    {/* Isabella Message 2 */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-gray-400 rounded-full shrink-0 shadow-inner flex items-center justify-center font-bold text-white text-xs italic">I</div>
                                        <div className="bg-white text-gray-900 rounded-2xl rounded-tl-sm px-4 py-3 max-w-md shadow-sm border border-gray-100">
                                            <p className="text-sm">Regarding your solution: not sure yet what should be, but will follow next steps... What is the biggest technical challenge you anticipate in building this specifically, and how will you overcome it?</p>
                                        </div>
                                    </div>
                                    {/* User Response */}
                                    <div className="flex justify-end pt-2">
                                        <div className="flex items-end gap-3">
                                            <div className="bg-blue-600 text-white rounded-2xl rounded-br-sm px-4 py-4 max-w-md shadow-xl">
                                                <p className="text-sm leading-relaxed">The biggest challenge is scaling our AI matching algorithm while maintaining HIPAA compliance. We're addressing this by partnering with AWS for secure cloud infrastructure and hiring a dedicated security engineer. We've already completed our initial security audit and have a clear 6-month roadmap.</p>
                                            </div>
                                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shrink-0 shadow-lg">
                                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                    </div>

                    {/* Footer CTA */}
                    <div className="text-center pt-48">
                        <Link href="/register" className="group inline-block">
                            <p className="text-3xl md:text-6xl font-black text-white leading-tight">Ready to build?</p>
                            <p className="text-4xl md:text-7xl font-black text-purple-400 mt-2 group-hover:scale-105 transition-transform duration-300">Start Your Zig.</p>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}