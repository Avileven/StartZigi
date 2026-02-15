"use client";
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Building2, DollarSign, Target, Calendar, Award, ArrowRight } from 'lucide-react';

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
      type: "Strategic Acquirer",
      focus: "AI & Cloud Computing",
      recentDeals: 5,
      totalSpent: "$2.5B",
      description: "Global technology leader acquiring innovative AI and cloud companies to strengthen market position.",
      slug: "techcorp"
    },
    {
      name: "Venture Holdings Zig.",
      type: "Private Equity",
      focus: "B2B SaaS Growth",
      recentDeals: 7,
      totalSpent: "$850M",
      description: "PE firm specializing in acquiring and scaling mid-market SaaS companies with proven traction.",
      slug: "venture-holdings"
    },
    {
      name: "CyberShield Zig.",
      type: "Strategic Acquirer",
      focus: "Cybersecurity",
      recentDeals: 6,
      totalSpent: "$1.8B",
      description: "Leading cybersecurity platform consolidating threat intelligence and cloud security capabilities.",
      slug: "cybershield"
    }
  ]
};

export default function MAArticlePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Article Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-red-600 text-white">M&A ANALYSIS</Badge>
            <span className="text-sm text-gray-500">{MA_ARTICLE_DATA.date}</span>
            <span className="text-sm text-gray-400">•</span>
            <span className="text-sm text-gray-500">{MA_ARTICLE_DATA.readTime}</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">
            {MA_ARTICLE_DATA.title}
          </h1>
          
          <p className="text-xl text-gray-600 mb-6">
            {MA_ARTICLE_DATA.subtitle}
          </p>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                DC
              </div>
              <div>
                <div className="font-semibold text-gray-900">{MA_ARTICLE_DATA.author}</div>
                <div className="text-gray-500">{MA_ARTICLE_DATA.publication}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        
        {/* Opening Quote */}
        <div className="mb-12">
          <div className="border-l-4 border-indigo-600 pl-6 py-4 bg-indigo-50 rounded-r-lg">
            <p className="text-xl text-gray-800 leading-relaxed italic">
              {MA_ARTICLE_DATA.openingQuote}
            </p>
          </div>
        </div>

        {/* Market Stats */}
        <div className="mb-16">
          <h2 className="text-3xl font-black text-gray-900 mb-8">M&A Market at a Glance</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-black mb-2">{MA_ARTICLE_DATA.marketStats.totalDeals}</div>
                <div className="text-sm opacity-90">Total Deals</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-black mb-2">{MA_ARTICLE_DATA.marketStats.totalValue}</div>
                <div className="text-sm opacity-90">Total Value</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-black mb-2">{MA_ARTICLE_DATA.marketStats.avgDealSize}</div>
                <div className="text-sm opacity-90">Avg Deal Size</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-600 text-white">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-black mb-2">{MA_ARTICLE_DATA.marketStats.growthYoY}</div>
                <div className="text-sm opacity-90">YoY Growth</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Article Body */}
        <div className="prose prose-lg max-w-none mb-16">
          <p className="text-gray-700 leading-relaxed mb-6">
            The technology M&A landscape has undergone a dramatic transformation over the past 24 months. Driven by intense competition for AI capabilities, cloud infrastructure, and cybersecurity expertise, strategic acquirers and private equity firms have deployed unprecedented capital to acquire innovative StartZigs.
          </p>
          
          <p className="text-gray-700 leading-relaxed mb-6">
            According to our analysis of 2,847 transactions completed between January 2023 and December 2024, the total value of tech M&A reached $524 billion—a 34% increase from the previous two-year period. This surge is being driven by three key factors: digital transformation acceleration, AI arms race, and cybersecurity imperatives.
          </p>
        </div>

        {/* Sector Breakdown Chart */}
        <div className="mb-16">
          <h2 className="text-3xl font-black text-gray-900 mb-8">Deals by Sector</h2>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="space-y-6">
                {MA_ARTICLE_DATA.sectorBreakdown.map((sector, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-900">{sector.sector}</span>
                        <span className="text-sm text-gray-500">{sector.deals} deals</span>
                      </div>
                      <span className="font-bold text-gray-900">{sector.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-full ${sector.color} transition-all duration-500`}
                        style={{ width: `${sector.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notable Transactions */}
        <div className="mb-16">
          <h2 className="text-3xl font-black text-gray-900 mb-8">Notable Transactions (2023-2024)</h2>
          <div className="space-y-6">
            {MA_ARTICLE_DATA.recentDeals.map((deal, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-48 flex-shrink-0">
                      <Badge className="mb-2">{deal.sector}</Badge>
                      <div className="text-3xl font-black text-green-600 mb-1">{deal.amount}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {deal.date}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        <span className="text-indigo-600">{deal.acquirer}</span> acquires <span className="text-gray-900">{deal.target}</span>
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {deal.rationale}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Analysis */}
        <div className="prose prose-lg max-w-none mb-16">
          <h2 className="text-3xl font-black text-gray-900 mb-6">What's Driving the M&A Boom?</h2>
          
          <p className="text-gray-700 leading-relaxed mb-6">
            Our analysis reveals three primary drivers behind this unprecedented M&A activity:
          </p>

          <div className="bg-gray-50 rounded-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">1. The AI Arms Race</h3>
            <p className="text-gray-700 leading-relaxed">
              Companies across every sector are racing to build AI capabilities. Rather than developing these technologies in-house—a process that can take years—strategic acquirers are opting to acquire proven AI platforms with existing customers and revenue. TechCorp's $520M acquisition of DataFlow AI exemplifies this trend: immediate access to real-time analytics capabilities and 200+ enterprise relationships.
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">2. Cybersecurity Imperatives</h3>
            <p className="text-gray-700 leading-relaxed">
              With cyber attacks increasing 156% year-over-year, organizations are under intense pressure to strengthen their security posture. CyberShield Zig.' aggressive acquisition strategy—$1.8B deployed across six deals—reflects the critical need for comprehensive security platforms. The company's $425M ThreatIntel Pro acquisition brought proprietary dark web monitoring capabilities that would have taken years to develop internally.
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">3. Private Equity's Build-and-Scale Model</h3>
            <p className="text-gray-700 leading-relaxed">
              PE firms like Venture Holdings are taking a patient, value-creation approach. Their $180M acquisition of HealthMetrics Pro demonstrates the model: acquire a promising SaaS company, apply operational expertise to accelerate growth, then exit at a multiple. The HealthMetrics deal delivered a 3.4x return in just 18 months through focused execution on sales expansion and product development.
            </p>
          </div>
        </div>

        {/* Key Players Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-black text-gray-900 mb-8">The Major Acquirers</h2>
          <p className="text-xl text-gray-600 mb-8">
            Three companies have emerged as the most active acquirers in the tech StartZig ecosystem:
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {MA_ARTICLE_DATA.keyPlayers.map((player, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all group">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                    <Building2 className="w-7 h-7 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{player.name}</h3>
                  <Badge className="mb-4">{player.type}</Badge>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Focus:</span>
                      <span className="font-semibold text-gray-900">{player.focus}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Recent Deals:</span>
                      <span className="font-semibold text-gray-900">{player.recentDeals}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Spent:</span>
                      <span className="font-semibold text-green-600">{player.totalSpent}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    {player.description}
                  </p>
                  
                  <Button 
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => window.location.href = `/ma/${player.slug}`}
                  >
                    Learn More <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Conclusion */}
        <div className="prose prose-lg max-w-none mb-16">
          <h2 className="text-3xl font-black text-gray-900 mb-6">What This Means for Founders</h2>
          
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
        <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                DC
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{MA_ARTICLE_DATA.author}</h3>
                <p className="text-gray-700 mb-2">
                  Mark Jay Anderson is a Senior M&A Analyst at ZIG Business Journal, covering technology acquisitions and strategic transactions. With over 15 years of experience in investment banking and corporate development, he has advised on $50B+ in tech M&A deals.
                </p>
                <p className="text-sm text-gray-600">
                  Follow on LinkedIn • Email: dchen@zigbusiness.com
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

    </div>
  );
}
