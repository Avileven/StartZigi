"use client";
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingUp, Building2, DollarSign, Target, Calendar } from 'lucide-react';

const MA_ARTICLE_DATA = {
  title: "The M&A Boom: How Tech Giants Are Reshaping the StartZig Landscape",
  subtitle: "A comprehensive analysis of 2023-2024's most significant acquisitions and what they mean for the future of innovation",
  author: "Mark Jay Anderson, Senior M&A Analyst",
  publication: "ZIG Business Journal",
  date: "February 15, 2026",
  readTime: "8 min read",

  openingQuote: "The tech M&A market has entered a new golden age. With over $500 billion in deals closed in 2024 alone, strategic acquirers are aggressively competing for innovative StartZigs that can accelerate their digital transformation initiatives.",

  marketStats: {
    totalDeals: "2,847",
    totalValue: "$524B",
    avgDealSize: "$184M",
    growthYoY: "+34%"
  },

  recentDeals: [
    {
      acquirer: "TechCorp Zig.",
      target: "DataFlow AI",
      amount: "$520M",
      date: "March 2024",
      sector: "AI/ML Analytics",
      rationale: "Expanded real-time analytics capabilities and added 200+ enterprise customers to TechCorp's growing AI infrastructure platform."
    },
    {
      acquirer: "CyberShield Zig.",
      target: "ThreatIntel Pro",
      amount: "$425M",
      date: "January 2024",
      sector: "Cybersecurity",
      rationale: "Integrated threat intelligence feeds covering 150+ adversary groups, enhancing predictive threat modeling capabilities by 300%."
    },
    {
      acquirer: "TechCorp Zig.",
      target: "CloudNet Systems",
      amount: "$850M",
      date: "June 2023",
      sector: "Cloud Infrastructure",
      rationale: "Enhanced global cloud infrastructure with 30 new data centers across Asia-Pacific region."
    },
    {
      acquirer: "CyberShield Zig.",
      target: "SecureCloud Networks",
      amount: "$380M",
      date: "May 2023",
      sector: "Cloud Security",
      rationale: "Expanded cloud security capabilities across AWS, Azure, and GCP, adding 2,000+ cloud-first customers."
    },
    {
      acquirer: "Venture Holdings Zig.",
      target: "HealthMetrics Pro",
      amount: "$180M",
      date: "February 2023",
      sector: "HealthTech SaaS",
      rationale: "PE firm's strategic acquisition achieved 3x revenue growth in 18 months before successful exit to Optum for $620M (3.4x return)."
    }
  ],

  sectorBreakdown: [
    { sector: "AI/ML", deals: 38, percentage: 32, color: "bg-purple-500" },
    { sector: "Cybersecurity", deals: 28, percentage: 24, color: "bg-blue-500" },
    { sector: "Cloud Infrastructure", deals: 21, percentage: 18, color: "bg-cyan-500" },
    { sector: "HealthTech", deals: 16, percentage: 14, color: "bg-green-500" },
    { sector: "FinTech", deals: 14, percentage: 12, color: "bg-orange-500" }
  ],

  keyPlayers: [
    {
      name: "TechCorp Zig.",
      slug: "techcorp"
    },
    {
      name: "Venture Holdings Zig.",
      slug: "venture-holdings"
    },
    {
      name: "CyberShield Zig.",
      slug: "cybershield"
    }
  ]
};

export default function MAPage() {
  return (
    <div className="min-h-screen bg-white">
      
      {/* Hero Section - Clean & Professional */}
      <div className="bg-white">
  <style>{`
    @keyframes emerge {
      0% { opacity: 0; filter: blur(15px); transform: translateY(15px); }
      100% { opacity: 1; filter: blur(0); transform: translateY(0); }
    }
  `}</style>
  
  <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
    <div className="text-center">
      <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
        <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex justify-center flex-wrap gap-x-3">
          {["M&A", "&", "Exit", "Opportunities"].map((word, i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                animation: 'emerge 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
                animationDelay: `${i * 0.15}s`,
                opacity: 0
              }}
            >
              {word}
            </span>
          ))}
        </span>
      </h1>
      <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
        Every entrepreneur dreams of the ultimate exit—the moment when years of innovation culminate in a life-changing acquisition.
      </p>
    </div>
  </div>
</div>

      {/* How It Works - Clean Text */}
      <div className="max-w-3xl mx-auto px-4 py-16 md:py-20">
        
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
          How M&A Works in StartZig
        </h2>

        <div className="prose prose-lg max-w-none space-y-6 text-gray-700 leading-relaxed">
          <p className="text-xl">
            Once your StartZig reaches the <strong>BETA phase</strong> and your product goes live, everything changes. Your innovation is no longer a secret—it's visible to the world. Users are engaging with it. Metrics are being generated. The market is responding.
          </p>

          <p className="text-xl">
            And here's what most founders don't realize: <strong>the gossip spreads faster than you think.</strong>
          </p>

          <p className="text-xl bg-slate-50 border-l-4 border-slate-800 pl-6 py-4 italic">
            "Word travels from ear to ear—that's how it works in reality. Investors talk to other investors. Advisors whisper to board members. Industry analysts track emerging players. Your success doesn't stay quiet for long."
          </p>

          <p className="text-xl">
            Strategic acquirers and private equity firms don't wait for you to come knocking. They have entire teams dedicated to monitoring the market for acquisition targets—tracking product launches, user growth, revenue milestones, and competitive positioning.
          </p>

          <p className="text-xl">
            <strong>In StartZig, you don't chase the exit—the exit finds you.</strong>
          </p>

          <p className="text-xl">
            Our system automatically identifies promising StartZigs based on key criteria: user engagement, revenue trajectory, product-market fit, and technical innovation. When you hit the right milestones, acquisition-ready companies in our network are notified. They reach out with interest, term sheets, and offers.
          </p>

          <p className="text-xl font-semibold text-slate-900">
            You focus on building. We help connect you to your exit opportunity.
          </p>
        </div>

        {/* Transition to Article */}
        <div className="mt-16 pt-12 border-t-2 border-slate-200">
          <div className="text-center">
            <p className="text-xl text-gray-700 mb-4">
              Want to learn more about the M&A market and the companies actively acquiring StartZigs?
            </p>
            <p className="text-2xl font-bold text-slate-900 flex items-center justify-center gap-2">
              Read our comprehensive analysis below 
              <ArrowRight className="w-6 h-6" />
            </p>
          </div>
        </div>
      </div>

      {/* Article Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          
          {/* Article Header */}
          <div className="bg-white rounded-lg shadow-sm border p-8 mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-slate-800 text-white">M&A ANALYSIS</Badge>
              <span className="text-sm text-gray-500">{MA_ARTICLE_DATA.date}</span>
              <span className="text-sm text-gray-400">•</span>
              <span className="text-sm text-gray-500">{MA_ARTICLE_DATA.readTime}</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 leading-tight">
              {MA_ARTICLE_DATA.title}
            </h1>
            
            <p className="text-lg text-gray-600 mb-6">
              {MA_ARTICLE_DATA.subtitle}
            </p>
            
            <div className="flex items-center gap-3 text-sm border-t pt-4">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center text-white font-bold">
                MA
              </div>
              <div>
                <div className="font-semibold text-gray-900">{MA_ARTICLE_DATA.author}</div>
                <div className="text-gray-500">{MA_ARTICLE_DATA.publication}</div>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="bg-white rounded-lg shadow-sm border p-8 md:p-12">
            
            {/* Opening Quote */}
            <div className="mb-12">
              <div className="border-l-4 border-slate-800 pl-6 py-4 bg-slate-50 rounded-r">
                <p className="text-xl text-gray-800 leading-relaxed italic">
                  {MA_ARTICLE_DATA.openingQuote}
                </p>
              </div>
            </div>

            {/* Market Stats */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">M&A Market at a Glance</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center border-2 border-purple-200">
                  <div className="text-3xl md:text-4xl font-black text-purple-600 mb-2">{MA_ARTICLE_DATA.marketStats.totalDeals}</div>
                  <div className="text-sm font-semibold text-purple-700">Total Deals</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center border-2 border-blue-200">
                  <div className="text-3xl md:text-4xl font-black text-blue-600 mb-2">{MA_ARTICLE_DATA.marketStats.totalValue}</div>
                  <div className="text-sm font-semibold text-blue-700">Total Value</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center border-2 border-green-200">
                  <div className="text-3xl md:text-4xl font-black text-green-600 mb-2">{MA_ARTICLE_DATA.marketStats.avgDealSize}</div>
                  <div className="text-sm font-semibold text-green-700">Avg Deal Size</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 text-center border-2 border-orange-200">
                  <div className="text-3xl md:text-4xl font-black text-orange-600 mb-2">{MA_ARTICLE_DATA.marketStats.growthYoY}</div>
                  <div className="text-sm font-semibold text-orange-700">YoY Growth</div>
                </div>
              </div>
            </div>

            {/* Article Body */}
            <div className="prose prose-lg max-w-none mb-12">
              <p className="text-gray-700 leading-relaxed mb-6">
                The technology M&A landscape has undergone a dramatic transformation over the past 24 months. Driven by intense competition for AI capabilities, cloud infrastructure, and cybersecurity expertise, strategic acquirers and private equity firms have deployed unprecedented capital to acquire innovative StartZigs.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-6">
                According to our analysis of 2,847 transactions completed between January 2023 and December 2024, the total value of tech M&A reached $524 billion—a 34% increase from the previous two-year period. This surge is being driven by three key factors: digital transformation acceleration, AI arms race, and cybersecurity imperatives.
              </p>
            </div>

            {/* Sector Breakdown */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Deals by Sector</h2>
              <div className="space-y-4">
                {MA_ARTICLE_DATA.sectorBreakdown.map((sector, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900">{sector.sector}</span>
                        <span className="text-sm text-gray-500">{sector.deals} deals</span>
                      </div>
                      <span className="font-bold text-gray-900">{sector.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-full ${sector.color}`}
                        style={{ width: `${sector.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notable Transactions */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Notable Transactions (2023-2024)</h2>
              <div className="space-y-6">
                {MA_ARTICLE_DATA.recentDeals.map((deal, index) => (
                  <div key={index} className="border-l-4 border-slate-300 pl-6 py-2">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                      <div>
                        <Badge className="mb-2 bg-slate-100 text-slate-700">{deal.sector}</Badge>
                        <h3 className="text-lg font-bold text-gray-900">
                          <span className="text-slate-700">{deal.acquirer}</span> acquires {deal.target}
                        </h3>
                      </div>
                      <div className="text-right mt-2 md:mt-0">
                        <div className="text-2xl font-black text-green-600">{deal.amount}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1 justify-end">
                          <Calendar className="w-3 h-3" />
                          {deal.date}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700">
                      {deal.rationale}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Analysis Sections */}
            <div className="prose prose-lg max-w-none mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What's Driving the M&A Boom?</h2>
              
              <p className="text-gray-700 leading-relaxed mb-6">
                Our analysis reveals three primary drivers behind this unprecedented M&A activity:
              </p>

              <h3 className="text-xl font-bold text-gray-900 mb-3">1. The AI Arms Race</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                Companies across every sector are racing to build AI capabilities. Rather than developing these technologies in-house—a process that can take years—strategic acquirers are opting to acquire proven AI platforms with existing customers and revenue. TechCorp's $520M acquisition of DataFlow AI exemplifies this trend: immediate access to real-time analytics capabilities and 200+ enterprise relationships.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mb-3">2. Cybersecurity Imperatives</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                With cyber attacks increasing 156% year-over-year, organizations are under intense pressure to strengthen their security posture. CyberShield Zig.'s aggressive acquisition strategy—$1.8B deployed across six deals—reflects the critical need for comprehensive security platforms. The company's $425M ThreatIntel Pro acquisition brought proprietary dark web monitoring capabilities that would have taken years to develop internally.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mb-3">3. Private Equity's Build-and-Scale Model</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                PE firms like Venture Holdings Zig. are taking a patient, value-creation approach. Their $180M acquisition of HealthMetrics Pro demonstrates the model: acquire a promising SaaS company, apply operational expertise to accelerate growth, then exit at a multiple. The HealthMetrics deal delivered a 3.4x return in just 18 months through focused execution on sales expansion and product development.
              </p>
            </div>

            {/* Conclusion */}
            <div className="prose prose-lg max-w-none mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What This Means for Founders</h2>
              
              <p className="text-gray-700 leading-relaxed mb-6">
                For StartZig founders, the current M&A environment presents unprecedented opportunities—but also requires strategic thinking about exit timing and positioning.
              </p>

              <p className="text-gray-700 leading-relaxed mb-6">
                The most successful exits in our analysis shared common characteristics: proven product-market fit with 100+ customers, strong unit economics, scalable technology infrastructure, and alignment with acquirer strategic priorities. Companies that achieved premium valuations (3x+ revenue multiples) had typically reached $10M-$50M in ARR and demonstrated clear paths to $100M+ revenue.
              </p>

              <p className="text-gray-700 leading-relaxed">
                As we move into 2026, we expect M&A activity to remain robust, particularly in AI/ML, cybersecurity, and infrastructure sectors. For founders building in these spaces, understanding the acquisition landscape—and the specific strategies of potential acquirers—will be critical to maximizing exit value.
              </p>
            </div>

            {/* Author Bio */}
            <div className="border-t pt-8">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  MA
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{MA_ARTICLE_DATA.author}</h3>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    Mark Jay Anderson is a Senior M&A Analyst at ZIG Business Journal, covering technology acquisitions and strategic transactions. With over 15 years of experience in investment banking and corporate development, he has advised on $50B+ in tech M&A deals.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Acquirer Links - Simple & Clean */}
      <div className="bg-white py-16 border-t">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Learn More About Our Acquisition Partners
          </h2>
          <div className="space-y-4">
            {MA_ARTICLE_DATA.keyPlayers.map((player, index) => (
              <a
                key={index}
                href={`/ma/${player.slug}`}
                className="block p-6 border-2 border-slate-200 rounded-lg hover:border-slate-800 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Building2 className="w-8 h-8 text-slate-700 group-hover:text-slate-900" />
                    <span className="text-xl font-bold text-gray-900">{player.name}</span>
                  </div>
                  <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-2 transition-all" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
