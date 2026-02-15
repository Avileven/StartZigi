"use client";
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Globe, Award, Zap, Lock, AlertTriangle, Server } from 'lucide-react';

const CYBERSHIELD_DATA = {
  name: "CyberShield Zig.",
  tagline: "Defending the Digital Frontier",
  founded: 2012,
  description: "A global leader in enterprise cybersecurity solutions, protecting the world's most critical infrastructure from sophisticated cyber threats through cutting-edge technology and unparalleled expertise.",
  
  stats: [
    { label: "Protected Networks", value: "15,000+", icon: Server },
    { label: "Security Experts", value: "3,200", icon: Users },
    { label: "Countries Served", value: "85", icon: Globe },
    { label: "Threats Blocked Daily", value: "50M+", icon: Shield },
  ],

  story: {
    title: "The CyberShield Story",
    content: `In 2012, a team of former NSA cybersecurity analysts and white-hat hackers came together with a mission: to level the playing field between enterprise organizations and the increasingly sophisticated cyber threat actors targeting them.

What began as a boutique security consultancy has evolved into a global cybersecurity powerhouse. Today, CyberShield Systems protects over 15,000 organizations worldwide—from Fortune 500 enterprises to critical infrastructure providers—against ransomware, advanced persistent threats, zero-day exploits, and nation-state attacks.

Our journey has been defined by innovation and urgency. In 2015, we developed the industry's first AI-powered threat detection system, capable of identifying novel attack patterns in real-time. In 2018, our rapid response team thwarted a coordinated attack on North American power grids. In 2021, we acquired three leading security StartZigs to build the world's most comprehensive threat intelligence network.

The threat landscape evolves daily, and so do we. Our 3,200 security researchers, analysts, and engineers operate from 24 global Security Operations Centers, monitoring threats around the clock. We analyze over 500 billion security events daily, identifying and neutralizing threats before they can cause harm.

But technology alone isn't enough. We believe in empowering our clients through education, training, and partnership. When you work with CyberShield, you're not just buying software—you're gaining a team of world-class experts committed to your security.`
  },

  acquisitions: [
    {
      year: 2024,
      company: "ThreatIntel Pro",
      amount: "$425M",
      description: "Leading threat intelligence platform with proprietary dark web monitoring and attribution capabilities.",
      impact: "Integrated threat intelligence feeds covering 150+ adversary groups. Enhanced our predictive threat modeling by 300%."
    },
    {
      year: 2023,
      company: "SecureCloud Networks",
      amount: "$380M",
      description: "Cloud-native security platform specializing in multi-cloud and hybrid infrastructure protection.",
      impact: "Expanded cloud security capabilities across AWS, Azure, and GCP. Added 2,000+ cloud-first customers."
    },
    {
      year: 2023,
      company: "Identity Guard Systems",
      amount: "$295M",
      description: "Zero-trust identity and access management solution for enterprise environments.",
      impact: "Strengthened identity security portfolio. Reduced average customer breach risk by 75%."
    },
    {
      year: 2022,
      company: "EndpointDefense AI",
      amount: "$210M",
      description: "Next-generation endpoint detection and response (EDR) powered by machine learning.",
      impact: "Achieved industry-leading 99.7% threat detection rate. Protected 5M+ endpoints globally."
    },
    {
      year: 2021,
      company: "CyberForensics Lab",
      amount: "$165M",
      description: "Digital forensics and incident response specialists with government-grade capabilities.",
      impact: "Built world-class IR team. Average breach containment time reduced from 287 days to 23 days."
    },
  ],

  strategy: {
    title: "Our Acquisition Strategy",
    philosophy: "In the war against cyber threats, we need the best weapons, the best intel, and the best soldiers. We acquire companies that give us a decisive edge in protecting our clients.",
    focus: [
      "Advanced threat detection and AI/ML security technologies",
      "Cloud security and zero-trust architecture solutions",
      "Identity and access management platforms",
      "Security operations and automation tools",
      "Threat intelligence and dark web monitoring",
      "Incident response and forensics capabilities"
    ],
    criteria: "We seek companies with proven technology protecting 100+ enterprise customers, strong technical teams with deep security expertise, and capabilities that complement our existing portfolio. Typical deal size: $100M-$500M. We move fast—security can't wait."
  },

  threatLandscape: [
    {
      threat: "Ransomware Attacks",
      stat: "156% increase YoY",
      description: "Sophisticated ransomware gangs targeting critical infrastructure with double-extortion tactics.",
      icon: Lock
    },
    {
      threat: "Supply Chain Compromises",
      stat: "3x more prevalent",
      description: "Nation-state actors infiltrating software supply chains to gain access to thousands of organizations.",
      icon: AlertTriangle
    },
    {
      threat: "Zero-Day Exploits",
      stat: "$2.5M average",
      description: "Unknown vulnerabilities being weaponized faster than ever, with sophisticated exploit chains.",
      icon: Zap
    },
    {
      threat: "Insider Threats",
      stat: "34% of breaches",
      description: "Malicious insiders and compromised credentials remain a top attack vector.",
      icon: Users
    }
  ]
};

export default function CyberShieldPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white overflow-hidden">
        {/* Cyber grid background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        {/* Animated elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
          <div className="absolute top-40 right-20 w-2 h-2 bg-cyan-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/30 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-semibold text-red-200">CRITICAL INFRASTRUCTURE PROTECTED</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
              {CYBERSHIELD_DATA.name}
            </h1>
            
            <p className="text-2xl md:text-3xl font-light mb-8 text-blue-100">
              {CYBERSHIELD_DATA.tagline}
            </p>
            
            <p className="text-lg md:text-xl max-w-3xl mx-auto text-blue-200 leading-relaxed">
              {CYBERSHIELD_DATA.description}
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
          {CYBERSHIELD_DATA.stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-shadow bg-white">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
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

      {/* Threat Landscape Alert */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Card className="border-2 border-red-200 bg-red-50">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-2xl font-bold text-red-900 mb-2">The Threat is Real and Growing</h3>
                <p className="text-red-800 text-lg">
                  Cyber attacks are increasing in frequency, sophistication, and impact. In 2024, the average cost of a data breach reached <span className="font-bold">$4.88M</span>, with <span className="font-bold">73% of organizations</span> experiencing a successful attack in the past year.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Story Section */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            {CYBERSHIELD_DATA.story.title}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-cyan-600 mx-auto rounded-full"></div>
        </div>
        
        <div className="prose prose-lg max-w-none">
          {CYBERSHIELD_DATA.story.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-gray-700 leading-relaxed mb-6 text-lg">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Threat Landscape */}
      <div className="bg-slate-900 text-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Current Threat Landscape
            </h2>
            <p className="text-xl text-blue-200">
              Understanding the enemy is the first step to defense
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {CYBERSHIELD_DATA.threatLandscape.map((threat, index) => {
              const Icon = threat.icon;
              return (
                <Card key={index} className="border-0 bg-slate-800 text-white">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-red-600/20 border border-red-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-1">{threat.threat}</h3>
                        <Badge className="bg-red-600/20 text-red-300 border border-red-500/30">
                          {threat.stat}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-slate-300">
                      {threat.description}
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
              Strategic Acquisitions
            </h2>
            <p className="text-xl text-gray-600">
              Building the world's most comprehensive security platform
            </p>
          </div>

          <div className="space-y-8">
            {CYBERSHIELD_DATA.acquisitions.map((acquisition, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-48 flex-shrink-0">
                      <div className="inline-block bg-gradient-to-br from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl mb-4">
                        <div className="text-sm font-semibold opacity-90">Acquired</div>
                        <div className="text-3xl font-black">{acquisition.year}</div>
                      </div>
                      <div className="text-3xl font-black text-blue-600">
                        {acquisition.amount}
                      </div>
                    </div>

                    <div className="flex-grow">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {acquisition.company}
                      </h3>
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {acquisition.description}
                      </p>
                      <div className="flex items-start gap-2 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
                        <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-semibold text-blue-900 mb-1">Security Impact</div>
                          <div className="text-sm text-blue-700">{acquisition.impact}</div>
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
            {CYBERSHIELD_DATA.strategy.title}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-cyan-600 mx-auto rounded-full"></div>
        </div>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-900 to-blue-900 text-white">
          <CardContent className="p-8 md:p-12">
            <p className="text-xl md:text-2xl font-light leading-relaxed mb-8 italic">
              "{CYBERSHIELD_DATA.strategy.philosophy}"
            </p>

            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-6">Acquisition Focus Areas:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {CYBERSHIELD_DATA.strategy.focus.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500/20 border border-blue-400/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Shield className="w-3 h-3 text-blue-300" />
                    </div>
                    <span className="text-blue-100">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/20 pt-8">
              <h3 className="text-2xl font-bold mb-4">What We're Looking For:</h3>
              <p className="text-blue-100 text-lg leading-relaxed">
                {CYBERSHIELD_DATA.strategy.criteria}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer CTA */}
      <div className="bg-slate-900 text-white py-16 border-t-4 border-blue-600">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <Shield className="w-16 h-16 text-blue-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Join the CyberShield Family
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            If you've built innovative security technology that's protecting real organizations from real threats, let's talk.
          </p>
          <Badge className="bg-blue-600/20 border border-blue-500/30 text-blue-200 text-sm px-6 py-3">
            Acquisition opportunities available in GROWTH phase
          </Badge>
        </div>
      </div>

    </div>
  );
}
