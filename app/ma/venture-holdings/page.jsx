"use client";
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Globe, Award, Zap, Target, DollarSign, Building2 } from 'lucide-react';

const VENTURE_HOLDINGS_DATA = {
  name: "Venture Holdings Zig.",
  tagline: "Building Value Through Strategic Growth",
  founded: 2015,
  description: "A leading private equity firm specializing in acquiring promising technology companies, accelerating their growth through operational expertise, and creating exceptional value for all stakeholders.",
  
  stats: [
    { label: "Assets Under Management", value: "$8.5B", icon: DollarSign },
    { label: "Portfolio Companies", value: "35", icon: Building2 },
    { label: "Successful Exits", value: "42", icon: TrendingUp },
    { label: "Average IRR", value: "38%", icon: Target },
  ],

  story: {
    title: "The Venture Holdings Story",
    content: `Founded in 2015 by veterans from Goldman Sachs and McKinsey, Venture Holdings was born from a simple insight: many brilliant technology companies struggle not from lack of innovation, but from lack of operational excellence and strategic resources.

We saw an opportunity to bridge that gap—to partner with founders who've built incredible products but need help scaling operations, entering new markets, or optimizing their business models. Our approach is hands-on but founder-friendly: we bring capital, expertise, and a powerful network, while respecting the vision and culture that made these companies special in the first place.

Over the past nine years, we've acquired 35 technology companies across SaaS, fintech, and healthcare IT. Our portfolio companies have collectively grown revenue by 400%, expanded into 60+ countries, and created over 15,000 jobs. We've successfully exited 42 investments, delivering an average IRR of 38% to our limited partners.

What sets us apart is our "build and nurture" philosophy. We don't just buy companies—we invest deeply in their people, processes, and potential. Our operating partners work side-by-side with management teams to implement best practices in sales, marketing, product development, and finance. We open doors to strategic customers and partners. We help recruit world-class talent.

The result? Companies that don't just grow—they thrive. And when the time comes for an exit, whether through IPO or strategic sale, we've built something genuinely valuable and sustainable.`
  },

  acquisitions: [
    {
      year: 2023,
      company: "HealthMetrics Pro",
      amount: "$180M",
      description: "Healthcare analytics SaaS platform serving 500+ hospitals and medical centers.",
      impact: "3x revenue growth in 18 months. Expanded from US to EU markets. Acquired by Optum for $620M in 2024.",
      exitMultiple: "3.4x"
    },
    {
      year: 2023,
      company: "PayFlow Solutions",
      amount: "$145M",
      description: "B2B payment processing and invoicing platform for mid-market companies.",
      impact: "Consolidated 3 competitors. Grew customer base from 2,000 to 8,500. Preparing for 2025 IPO.",
      exitMultiple: "TBD"
    },
    {
      year: 2022,
      company: "DataVault Security",
      amount: "$95M",
      description: "Enterprise data encryption and compliance management software.",
      impact: "Expanded sales team from 8 to 45. Achieved SOC 2 Type II. Sold to Palo Alto Networks for $380M.",
      exitMultiple: "4.0x"
    },
    {
      year: 2022,
      company: "CloudOps Analytics",
      amount: "$78M",
      description: "Cloud infrastructure monitoring and optimization platform.",
      impact: "Grew ARR from $12M to $65M. Expanded from AWS-only to multi-cloud. Acquired by Datadog for $350M.",
      exitMultiple: "4.5x"
    },
    {
      year: 2021,
      company: "TalentHub AI",
      amount: "$52M",
      description: "AI-powered recruiting and talent management software for enterprise.",
      impact: "Scaled from 200 to 2,000 customers. Built integration ecosystem. IPO in 2023 at $420M valuation.",
      exitMultiple: "8.1x"
    },
  ],

  strategy: {
    title: "Our Investment Strategy",
    philosophy: "We partner with founders and management teams to unlock the full potential of their businesses through strategic capital, operational expertise, and our extensive network.",
    focus: [
      "B2B SaaS companies with $5M-$30M in ARR",
      "Proven product-market fit with 100+ paying customers",
      "Strong unit economics and path to profitability",
      "Scalable technology infrastructure",
      "Talented, coachable management teams",
      "Large addressable markets ($1B+)"
    ],
    criteria: "We typically invest $50M-$200M for majority or significant minority stakes. Our sweet spot is companies that have achieved initial traction but need capital and expertise to scale from $10M to $100M+ in revenue. We're patient investors with a 4-7 year hold period, focused on building lasting value rather than quick flips."
  },

  valueAdd: [
    {
      title: "Operational Excellence",
      description: "Our operating partners bring decades of experience scaling technology companies. We help optimize sales processes, implement financial controls, build scalable infrastructure, and recruit top talent.",
      icon: Target
    },
    {
      title: "Strategic Growth",
      description: "We open doors to enterprise customers, facilitate strategic partnerships, and guide international expansion. Our network includes C-level executives at Fortune 500 companies across every major industry.",
      icon: Globe
    },
    {
      title: "M&A Expertise",
      description: "We help portfolio companies make strategic acquisitions to accelerate growth, consolidate market position, and acquire critical capabilities. We've facilitated over 60 add-on acquisitions.",
      icon: Building2
    },
    {
      title: "Exit Optimization",
      description: "When the time is right, we leverage our relationships with strategic buyers and investment banks to maximize exit value. Our average exit multiple of 3.8x speaks to our execution track record.",
      icon: TrendingUp
    }
  ]
};

export default function VentureHoldingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(30deg, #ffffff 12%, transparent 12.5%, transparent 87%, #ffffff 87.5%, #ffffff), linear-gradient(150deg, #ffffff 12%, transparent 12.5%, transparent 87%, #ffffff 87.5%, #ffffff), linear-gradient(30deg, #ffffff 12%, transparent 12.5%, transparent 87%, #ffffff 87.5%, #ffffff), linear-gradient(150deg, #ffffff 12%, transparent 12.5%, transparent 87%, #ffffff 87.5%, #ffffff)',
            backgroundSize: '80px 140px',
            backgroundPosition: '0 0, 0 0, 40px 70px, 40px 70px'
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Award className="w-4 h-4" />
              <span className="text-sm font-semibold">Top-Quartile PE Firm Since 2015</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
              {VENTURE_HOLDINGS_DATA.name}
            </h1>
            
            <p className="text-2xl md:text-3xl font-light mb-8 text-emerald-100">
              {VENTURE_HOLDINGS_DATA.tagline}
            </p>
            
            <p className="text-lg md:text-xl max-w-3xl mx-auto text-emerald-200 leading-relaxed">
              {VENTURE_HOLDINGS_DATA.description}
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 md:h-24">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" className="fill-gray-50"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" className="fill-gray-50"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="fill-gray-50"></path>
          </svg>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {VENTURE_HOLDINGS_DATA.stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Story Section */}
      <div className="max-w-5xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            {VENTURE_HOLDINGS_DATA.story.title}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 mx-auto rounded-full"></div>
        </div>
        
        <div className="prose prose-lg max-w-none">
          {VENTURE_HOLDINGS_DATA.story.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-gray-700 leading-relaxed mb-6 text-lg">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Value Add Section */}
      <div className="bg-emerald-50 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              How We Add Value
            </h2>
            <p className="text-xl text-gray-600">
              More than capital—we're partners in growth
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {VENTURE_HOLDINGS_DATA.valueAdd.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-6">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {item.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Acquisitions Timeline */}
      <div className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Portfolio Success Stories
            </h2>
            <p className="text-xl text-gray-600">
              Building value through strategic acquisition and operational excellence
            </p>
          </div>

          <div className="space-y-8">
            {VENTURE_HOLDINGS_DATA.acquisitions.map((acquisition, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-56 flex-shrink-0">
                      <div className="inline-block bg-gradient-to-br from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl mb-4">
                        <div className="text-sm font-semibold opacity-90">Acquired</div>
                        <div className="text-3xl font-black">{acquisition.year}</div>
                      </div>
                      <div className="text-3xl font-black text-green-600 mb-2">
                        {acquisition.amount}
                      </div>
                      {acquisition.exitMultiple && (
                        <Badge className="bg-emerald-100 text-emerald-800 text-lg px-3 py-1">
                          {acquisition.exitMultiple} Return
                        </Badge>
                      )}
                    </div>

                    <div className="flex-grow">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {acquisition.company}
                      </h3>
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {acquisition.description}
                      </p>
                      <div className="flex items-start gap-2 bg-emerald-50 p-4 rounded-lg">
                        <Zap className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-semibold text-emerald-900 mb-1">Value Creation</div>
                          <div className="text-sm text-emerald-700">{acquisition.impact}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Strategy Section */}
      <div className="max-w-5xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            {VENTURE_HOLDINGS_DATA.strategy.title}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 mx-auto rounded-full"></div>
        </div>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-900 to-teal-900 text-white">
          <CardContent className="p-8 md:p-12">
            <p className="text-xl md:text-2xl font-light leading-relaxed mb-8 italic">
              "{VENTURE_HOLDINGS_DATA.strategy.philosophy}"
            </p>

            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-6">Investment Criteria:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {VENTURE_HOLDINGS_DATA.strategy.focus.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-emerald-100">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/20 pt-8">
              <h3 className="text-2xl font-bold mb-4">Our Sweet Spot:</h3>
              <p className="text-emerald-100 text-lg leading-relaxed">
                {VENTURE_HOLDINGS_DATA.strategy.criteria}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer CTA */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Ready to Scale Your Business?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Let's explore how Venture Holdings can help you achieve your growth potential.
          </p>
          <Badge className="bg-white/10 text-white text-sm px-6 py-3">
            Acquisition opportunities available in GROWTH phase
          </Badge>
        </div>
      </div>

    </div>
  );
}
