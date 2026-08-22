// Features page — split out from the homepage
"use client";
import React from "react";
import DashboardMockup from "@/components/utils/DashboardMockup";
import VCMockup from "@/components/utils/VCMockup";
import VCSimulationMockup from "@/components/utils/VCSimulationMockup";
import FeedbackMockup from "@/components/utils/FeedbackMockup";
import BetaMockup from "@/components/utils/BetaMockup";
import BusinessDeckMockup from "@/components/utils/BusinessDeckMockup";
import ZigPlanMockup from "@/components/utils/ZigPlanMockup";

function BenefitsSection() {
  return (
    <div className="py-24 sm:py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-10">

          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-3">Advanced Tools for Building Your Venture</h4>
            <div className="space-y-2 pl-4">
              <p className="text-gray-600 text-base leading-relaxed">A built-in AI coach that accompanies you through every section and task, providing guidance, feedback, and professional support at every step</p>
              <p className="text-gray-600 text-base leading-relaxed">A professional management dashboard and business planning tools to structure your strategy and financial model</p>
              <p className="text-gray-600 text-base leading-relaxed">Product development tools at different stages of your product, including a dedicated studio for building prototypes and mockups</p>
              <p className="text-gray-600 text-base leading-relaxed">Marketing tools, run campaigns, build your landing page, and promote your venture to early users</p>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-3">Fundraising</h4>
            <div className="space-y-2 pl-4">
              <p className="text-gray-600 text-base leading-relaxed">A wide range of virtual private and institutional investors you can approach and pitch to</p>
              <p className="text-gray-600 text-base leading-relaxed">A real simulation of raising capital, from angel investors to venture capital firms</p>
              <p className="text-gray-600 text-base leading-relaxed">Practice your pitch, choose the right investor for your stage, and negotiate your terms</p>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-3">Community & Users</h4>
            <div className="space-y-2 pl-4">
              <p className="text-gray-600 text-base leading-relaxed">Get structured feedback on your product from real community members</p>
              <p className="text-gray-600 text-base leading-relaxed">Run a beta testing program, invite users to sign up and test your product at different stages</p>
              <p className="text-gray-600 text-base leading-relaxed">Invite a co-founder to join your venture and build your team</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <div className="bg-white text-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
          The Toolkit
        </h1>
        <p className="text-gray-600 text-lg">A closer look at every tool along the journey.</p>
      </div>

      {/* 1. Dashboard */}
      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-gray-900">A Professional Management Dashboard</span>
          </h2>
          <p className="text-gray-500 text-sm">Manage your venture, track progress, and stay on top of every stage — all in one place.</p>
        </div>
        <DashboardMockup autoStart={false} />
      </div>

      {/* 2. Feedback */}
      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-gray-900">Real Feedback from Real Users</span>
          </h2>
          <p className="text-gray-500 text-sm">Collected and analyzed through a dedicated feedback system at every stage of your product.</p>
        </div>
        <FeedbackMockup autoStart={false} />
      </div>

      {/* 3. Beta */}
      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-gray-900">A Dedicated Beta Sign-Up Page</span>
          </h2>
          <p className="text-gray-500 text-sm">Share it, collect testers, and grow your first user base.</p>
        </div>
        <BetaMockup autoStart={false} />
      </div>

      {/* 4. Investor Marketplace */}
      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-gray-900">Investor Marketplace</span>
          </h2>
          <p className="text-gray-500 text-sm">Discover virtual angels and VC firms, each with their own focus and criteria, and choose who to pitch.</p>
        </div>
        <VCMockup autoStart={false} />
      </div>

      {/* 5. VC Simulation */}
      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-gray-900">A Real Fundraising Simulation</span>
          </h2>
          <p className="text-gray-500 text-sm">Driven by our own AI algorithms built to evaluate ventures across every stage — from screening to investment decision.</p>
        </div>
        <VCSimulationMockup autoStart={false} />
      </div>

      {/* 6. Business Deck */}
      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-gray-900">Your Investor Business Plan, Generated</span>
          </h2>
          <p className="text-gray-500 text-sm">
            StartZig assembles everything you've built into a professional investor-ready business plan — with AI analysis, revenue forecast, and break-even analysis. Available on Pro Founder and above.
          </p>
        </div>
        <BusinessDeckMockup autoStart={false} />
      </div>

      {/* 7. ZigPlan */}
      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-gray-900">Meet ZigPlan, Your Personal Business Analyst</span>
          </h2>
          <p className="text-gray-500 text-sm">
            From idea to execution — ZigPlan analyzes your product, features, and goals to generate a concise Product Requirements Document with a ready-to-use AI development prompt. Available on Pro Founder and above.
          </p>
        </div>
        <ZigPlanMockup autoStart={false} />
      </div>

      <BenefitsSection />
    </div>
  );
}
