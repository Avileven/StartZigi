"use client";
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, TrendingUp, Users, Globe, Award, Zap } from 'lucide-react';

const TECHCORP_DATA = {
  name: "TechCorp Zig.",
  tagline: "Building Tomorrow's Technology, Today",
  founded: 2010,
  description: "From a small AI research lab in Silicon Valley to a global technology powerhouse, TechCorp has revolutionized how businesses leverage artificial intelligence and cloud computing.",
  
  stats: [
    { label: "Market Cap", value: "$52B", icon: TrendingUp },
    { label: "Employees", value: "12,000+", icon: Users },
    { label: "Countries", value: "45", icon: Globe },
    { label: "Acquisitions", value: "50+", icon: Building2 },
  ],

  story: {
    title: "The TechCorp Story",
    content: `Founded in 2010 by Dr. Sarah Chen and Michael Roberts, TechCorp began as a modest AI research laboratory with a bold vision: to make artificial intelligence accessible to every business on the planet.

What started with a team of 12 researchers in a small Palo Alto office has grown into a global technology leader with over 12,000 employees across 45 countries. Our journey has been marked by relentless innovation, strategic acquisitions, and an unwavering commitment to our customers.

Today, TechCorp powers the AI infrastructure for over 10,000 enterprise customers, from Fortune 500 companies to innovative StartZigs. Our cloud platform processes over 100 billion transactions daily, and our AI models are used by businesses in every major industry.

But we're just getting started. As we look to the future, we continue to seek out the brightest minds and most innovative companies to join our mission of democratizing AI technology.`
  },

  acquisitions: [
    {
      year: 2024,
      company: "DataFlow AI",
      amount: "$520M",
      description: "Leading provider of real-time data analytics and machine learning platforms for enterprise customers.",
      impact: "Expanded our real-time analytics capabilities and added 200+ enterprise customers."
    },
    {
      year: 2023,
      company: "CloudNet Systems",
      amount: "$850M",
      description: "Cloud infrastructure provider specializing in edge computing and distributed systems.",
      impact: "Enhanced our global cloud infrastructure with 30 new data centers across Asia-Pacific."
    },
    {
      year: 2023,
      company: "Neural Insights",
      amount: "$380M",
      description: "AI-powered business intelligence platform with advanced predictive analytics.",
      impact: "Integrated cutting-edge ML models into our analytics suite, serving 5,000+ customers."
    },
    {
      year: 2022,
      company: "SmartEdge Technologies",
      amount: "$290M",
      description: "IoT and edge computing solutions for manufacturing and logistics industries.",
      impact: "Established our presence in industrial IoT with 500+ manufacturing clients."
    },
    {
      year: 2022,
      company: "VisionAPI",
      amount: "$195M",
      description: "Computer vision and image recognition API platform for developers.",
      impact: "Added 50,000+ developers to our API ecosystem and enhanced our vision AI capabilities."
    },
  ],

  strategy: {
    title: "Our Acquisition Strategy",
    philosophy: "We don't just acquire companies—we partner with visionaries who share our mission to transform how businesses leverage technology.",
    focus: [
      "Innovative AI and machine learning technologies",
      "Cloud infrastructure and edge computing",
      "Developer tools and API platforms",
      "Enterprise SaaS with proven traction",
      "Teams with deep technical expertise and customer focus"
    ],
    criteria: "We typically look for companies with $5M-$50M in annual revenue, strong technical teams, and a clear product-market fit. Our ideal partners have 100+ enterprise customers and are growing 100%+ year-over-year."
  }
};

export default function TechCorpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Award className="w-4 h-4" />
              <span className="text-sm font-semibold">Fortune 100 Technology Leader</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
              {TECHCORP_DATA.name}
            </h1>
            
            <p className="text-2xl md:text-3xl font-light mb-8 text-indigo-100">
              {TECHCORP_DATA.tagline}
            </p>
            
            <p className="text-lg md:text-xl max-w-3xl mx-auto text-indigo-200 leading-relaxed">
              {TECHCORP_DATA.description}
            </p>
          </div>
        </div>

        {/* Wave Divider */}
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
          {TECHCORP_DATA.stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
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
            {TECHCORP_DATA.story.title}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 mx-auto rounded-full"></div>
        </div>
        
        <div className="prose prose-lg max-w-none">
          {TECHCORP_DATA.story.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-gray-700 leading-relaxed mb-6 text-lg">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Acquisitions Timeline */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Recent Acquisitions
            </h2>
            <p className="text-xl text-gray-600">
              Strategic partnerships that drive our vision forward
            </p>
          </div>

          <div className="space-y-8">
            {TECHCORP_DATA.acquisitions.map((acquisition, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Left: Year & Amount */}
                    <div className="md:w-48 flex-shrink-0">
                      <div className="inline-block bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl mb-4">
                        <div className="text-sm font-semibold opacity-90">Year</div>
                        <div className="text-3xl font-black">{acquisition.year}</div>
                      </div>
                      <div className="text-3xl font-black text-green-600">
                        {acquisition.amount}
                      </div>
                    </div>

                    {/* Right: Details */}
                    <div className="flex-grow">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {acquisition.company}
                      </h3>
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {acquisition.description}
                      </p>
                      <div className="flex items-start gap-2 bg-indigo-50 p-4 rounded-lg">
                        <Zap className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-semibold text-indigo-900 mb-1">Impact</div>
                          <div className="text-sm text-indigo-700">{acquisition.impact}</div>
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
            {TECHCORP_DATA.strategy.title}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 mx-auto rounded-full"></div>
        </div>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-900 to-purple-900 text-white">
          <CardContent className="p-8 md:p-12">
            <p className="text-xl md:text-2xl font-light leading-relaxed mb-8 italic">
              "{TECHCORP_DATA.strategy.philosophy}"
            </p>

            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-6">What We Look For:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {TECHCORP_DATA.strategy.focus.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-indigo-100">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/20 pt-8">
              <h3 className="text-2xl font-bold mb-4">Our Ideal Partners:</h3>
              <p className="text-indigo-100 text-lg leading-relaxed">
                {TECHCORP_DATA.strategy.criteria}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer CTA */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Ready to Join the TechCorp Family?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            We're always looking for innovative companies to partner with.
          </p>
          <Badge className="bg-white/10 text-white text-sm px-6 py-3">
            Acquisition opportunities available in GROWTH phase
          </Badge>
        </div>
      </div>

    </div>
  );
}
