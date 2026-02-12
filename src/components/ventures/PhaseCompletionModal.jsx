"use client"
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Phase content based on your table
const PHASE_CONTENT = {
  idea: {
    title: "IDEA Phase Complete!",
    subtitle: "Moving to Business Plan Phase",
    emoji: "💡",
    nextPhase: "PLAN",
    progressPercent: 20,
    clockRotation: 0, // IDEA at top
    timeInPhase: "Completed",
    
    valuation: {
      before: 0,
      after: 250000,
      equity: 100,
      capitalInjection: 15000
    },
    
    achievements: [
      {
        id: 1,
        title: "Venture Created",
        description: "Clear value proposition created",
        icon: "✓",
        value: null
      },
      {
        id: 2,
        title: "Landing Page Live",
        description: "Your venture is now online",
        icon: "🌐",
        value: "Live"
      }
    ],
    
    challenges: [
      {
        id: 1,
        title: "Create Your Business Plan",
        description: "Plan your venture business highlights"
      },
      {
        id: 2,
        title: "Funding Plan & Budget Breakdown",
        description: "Plan your forecast monthly expenses and funding requirements for your first two years"
      }
    ],
    
    estimatedTime: "2-3 weeks",
    badge: "Idea Champion"
  },
  
  business_plan: {
    title: "PLAN Phase Complete!",
    subtitle: "Moving to MVP Development",
    emoji: "📋",
    nextPhase: "MVP",
    progressPercent: 40,
    clockRotation: 72, // PLAN at 1 o'clock (72 degrees)
    timeInPhase: "Completed",
    
    // Angel Arena Feature
    featureImage: "/images/angel-arena-screenshot.png",
    featureTitle: "🎯 Angel Arena Unlocked!",
    featureDescription: "Connect with experienced angel investors. Meet with them personally to pitch your venture and secure the seed funding you need to grow.",
    
    valuation: {
      before: 250000,
      after: 500000,
      equity: 100,
      capitalInjection: 0
    },
    
    achievements: [
      {
        id: 1,
        title: "Business Plan Completed",
        description: "Comprehensive plan documented",
        icon: "📄",
        value: "100%"
      },
      {
        id: 2,
        title: "Budget Completed",
        description: "2-year financial plan ready",
        icon: "💰",
        value: "Complete"
      }
    ],
    
    challenges: [
      {
        id: 1,
        title: "Complete Minimum Viable Product",
        description: "Build your working prototype"
      },
      {
        id: 2,
        title: "Enter StartZig Studio",
        description: "Access development tools and resources"
      },
      {
        id: 3,
        title: "Enter the Angel Arena",
        description: "Start talking with investors"
      }
    ],
    
    estimatedTime: "4-6 weeks",
    badge: "Planning Master"
  },
  
  mvp: {
    title: "MVP Phase Complete!",
    subtitle: "Moving to MLP Development",
    emoji: "🚀",
    nextPhase: "MLP",
    progressPercent: 60,
    clockRotation: 144, // MVP at 4 o'clock (144 degrees)
    timeInPhase: "Completed",
    
    valuation: {
      before: 500000,
      after: 1000000,
      equity: 100,
      capitalInjection: 0
    },
    
    achievements: [
      {
        id: 1,
        title: "MVP Built",
        description: "Working prototype completed",
        icon: "⚙️",
        value: "100%"
      },
      {
        id: 2,
        title: "Business Plan Complete",
        description: "Your business strategy is ready",
        icon: "📋",
        value: "Complete"
      },
      {
        id: 3,
        title: "Revenue Model Defined",
        description: "Pricing and monetization strategy set",
        icon: "💰",
        value: "Complete"
      }
    ],
    
    challenges: [
      {
        id: 1,
        title: "Complete MLP Development Center",
        description: "Plan your enhancements"
      },
      {
        id: 2,
        title: "Analyze Feedback",
        description: "Use Product Feedback Center and scale up your MVP demo"
      },
      {
        id: 3,
        title: "Invite Users for Feedback",
        description: "Use the Promotion Center to get early user insights"
      }
    ],
    
    estimatedTime: "3-4 weeks",
    badge: "MVP Builder"
  },
  
  mlp: {
    title: "MLP Phase Complete!",
    subtitle: "Moving to Beta Testing",
    emoji: "💝",
    nextPhase: "BETA",
    progressPercent: 75,
    clockRotation: 216, // MLP at 7 o'clock (216 degrees)
    timeInPhase: "Completed",
    
    // VC Marketplace Feature
    featureImage: "/images/vc-marketplace-screenshot.png",
    featureTitle: "💼 VC Marketplace Unlocked!",
    featureDescription: "Access leading venture capital firms. Connect with VCs specialized in your industry and stage to raise Series A funding.",
    
    valuation: {
      before: 1000000,
      after: 2000000,
      equity: 100,
      capitalInjection: 0
    },
    
    achievements: [
      {
        id: 1,
        title: "MLP Launched",
        description: "Lovable product live",
        icon: "🎨",
        value: "100%"
      },
      {
        id: 2,
        title: "User Feedback Analyzed",
        description: "Product improvements implemented",
        icon: "💬",
        value: "Complete"
      },
      {
        id: 3,
        title: "MVP Scaled Up",
        description: "Demo enhanced based on feedback",
        icon: "📈",
        value: "Complete"
      }
    ],
    
    challenges: [
      {
        id: 1,
        title: "Set Up Beta Testing Page",
        description: "Prepare for beta user recruitment"
      },
      {
        id: 2,
        title: "Analyze Feedback & Scale MLP",
        description: "Use Product Feedback Center to enhance your MLP demo"
      },
      {
        id: 3,
        title: "Complete Venture Pitch",
        description: "Prepare your pitch before approaching the VC marketplace"
      },
      {
        id: 4,
        title: "Enter the VC Marketplace",
        description: "Connect with venture capital firms for Series A funding"
      },
      {
        id: 5,
        title: "Recruit 50 Beta Testers",
        description: "You need 50 beta sign-ups to move to Growth phase"
      }
    ],
    
    estimatedTime: "2-3 weeks",
    badge: "Product Champion"
  },
  
  beta: {
    title: "BETA Phase Complete!",
    subtitle: "Moving to Growth Phase",
    emoji: "🎯",
    nextPhase: "GROWTH",
    progressPercent: 90,
    clockRotation: 288, // BETA at 10 o'clock (288 degrees)
    timeInPhase: "Completed",
    
    valuation: {
      before: 2000000,
      after: 5000000,
      equity: 100,
      capitalInjection: 0
    },
    
    achievements: [
      {
        id: 1,
        title: "Beta Testing Done",
        description: "Extensive user feedback collected",
        icon: "✓",
        value: "100%"
      },
      {
        id: 2,
        title: "Beta Testers",
        description: "Active testing community",
        icon: "👥",
        value: "50+"
      }
    ],
    
    challenges: [
      {
        id: 1,
        title: "Growth Strategy",
        description: "Plan for user acquisition and scaling"
      },
      {
        id: 2,
        title: "Marketing Channels",
        description: "Identify best channels for growth"
      }
    ],
    
    estimatedTime: "Ongoing",
    badge: "Beta Master"
  }
};

export default function PhaseCompletionModal({ 
  isOpen, 
  onClose, 
  completedPhase 
}) {
  const [autoCloseTimer, setAutoCloseTimer] = useState(10);
  const [valuationAnimated, setValuationAnimated] = useState(false);
  const [showAngelArenaPreview, setShowAngelArenaPreview] = useState(false);
  const [showVCPreview, setShowVCPreview] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setAutoCloseTimer(prev => {
        if (prev <= 1) {
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setAutoCloseTimer(10);
      setValuationAnimated(false);
      
      // Start valuation animation after delay
      setTimeout(() => {
        setValuationAnimated(true);
      }, 800);
    }
  }, [isOpen]);

  if (!isOpen || !completedPhase) return null;

  const content = PHASE_CONTENT[completedPhase];
  if (!content) return null;

  const calculateStakeValue = () => {
    return (content.valuation.after * content.valuation.equity) / 100;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-8 duration-500">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-8 relative overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center z-10"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          <div className="grid grid-cols-2 gap-8 items-start">
            {/* Left: Title + Valuation */}
            <div>
              <div className="text-5xl mb-3">{content.emoji}</div>
              <h1 className="text-3xl font-black text-white mb-2">{content.title}</h1>
              <p className="text-purple-100 text-sm mb-6">{content.subtitle}</p>
              
              {/* Valuation in Header */}
              <ValuationCounter
                before={content.valuation.before}
                after={content.valuation.after}
                equity={content.valuation.equity}
                stakeValue={calculateStakeValue()}
                animate={valuationAnimated}
                inHeader={true}
              />
            </div>

            {/* Right: Clock */}
            <div className="flex flex-col items-center justify-start pt-4">
              <div className="rounded-full p-2 bg-white/10 shadow-lg">
                <svg viewBox="0 0 200 200" className="w-48 h-48">
                  <circle cx="100" cy="100" r="90" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="12" />
                  <circle 
                    cx="100" cy="100" r="90" 
                    fill="none" 
                    stroke="#8b5cf6" 
                    strokeWidth="12" 
                    strokeLinecap="round"
                    strokeDasharray="565"
                    strokeDashoffset={565 * (1 - content.progressPercent / 100)}
                    style={{
                      transform: 'rotate(-90deg)',
                      transformOrigin: '100px 100px',
                      transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0.0, 0.2, 1)'
                    }}
                  />
                  <circle cx="100" cy="100" r="70" fill="white" />
                  <text x="100" y="30" className="text-xs font-bold" fill={completedPhase === 'idea' ? '#16a34a' : '#9ca3af'} textAnchor="middle">IDEA</text>
                  <text x="160" y="80" className="text-xs font-bold" fill={completedPhase === 'business_plan' ? '#f97316' : '#9ca3af'} textAnchor="middle">PLAN</text>
                  <text x="140" y="155" className="text-xs font-bold" fill={completedPhase === 'mvp' ? '#f97316' : '#9ca3af'} textAnchor="middle">MVP</text>
                  <text x="60" y="155" className="text-xs font-bold" fill={completedPhase === 'mlp' ? '#f97316' : '#9ca3af'} textAnchor="middle">MLP</text>
                  <text x="40" y="80" className="text-xs font-bold" fill={completedPhase === 'beta' ? '#f97316' : '#9ca3af'} textAnchor="middle">BETA</text>
                  <path 
                    fill="#6b7280" 
                    opacity="0.7"
                    d="M97 100 L103 100 L103 30 L97 30 Z"
                    style={{
                      transform: `rotate(${content.clockRotation}deg)`,
                      transformOrigin: '100px 100px',
                      transition: 'transform 1.5s cubic-bezier(0.4, 0.0, 0.2, 1)'
                    }}
                  />
                  <circle cx="100" cy="100" r="5" fill="#8b5cf6" />
                </svg>
              </div>
              
              <div className="text-center mt-3">
                <div className="text-4xl font-black text-white">
                  {content.progressPercent}%
                </div>
                <div className="text-sm text-purple-200 font-medium mt-1">Overall Progress</div>
              </div>
            </div>
          </div>

          {/* New Investment Notification */}
          {content.valuation.capitalInjection > 0 && (
            <div className="mt-6 text-center animate-in slide-in-from-bottom-4 duration-700">
              <div className="inline-flex items-center gap-3 bg-yellow-400/20 border-2 border-yellow-300 rounded-full px-8 py-3 shadow-lg backdrop-blur-sm">
                <span className="text-2xl animate-bounce">🎉</span>
                <span className="font-bold text-yellow-100 text-lg">New Investment: ${(content.valuation.capitalInjection).toLocaleString()}</span>
                <span className="text-2xl animate-bounce">🎉</span>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-2 gap-8 p-8">
          
          {/* Left: Next Challenges + Preview Buttons */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                <span className="text-white text-xl">🎯</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Next: {content.nextPhase}</h2>
            </div>

            <div className="space-y-3">
              {content.challenges.map((challenge, index) => (
                <div 
                  key={challenge.id}
                  className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg animate-in slide-in-from-left duration-500"
                  style={{ animationDelay: `${300 + index * 100}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">{challenge.id}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">{challenge.title}</h3>
                      <p className="text-xs text-gray-600 mt-1">{challenge.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-orange-100 p-3 rounded-lg mt-4">
              <div className="flex items-center gap-2 text-sm text-orange-800">
                <span>⏱️</span>
                <span className="font-medium">Estimated: {content.estimatedTime}</span>
              </div>
            </div>

            {/* Feature Preview Buttons */}
            {content.featureImage && (
              <div className="mt-4">
                {completedPhase === 'business_plan' && (
                  <button
                    onClick={() => setShowAngelArenaPreview(true)}
                    className="w-full bg-gradient-to-r from-orange-500 to-purple-500 hover:from-orange-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <span className="text-lg">👁️</span>
                    <span>Preview Angel Arena</span>
                  </button>
                )}
                {completedPhase === 'mlp' && (
                  <button
                    onClick={() => setShowVCPreview(true)}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <span className="text-lg">👁️</span>
                    <span>Preview VC Marketplace</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right: Achievements */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-xl">✅</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Your Achievements</h2>
            </div>

            <div className="space-y-3">
              {content.achievements.map((achievement, index) => (
                <div 
                  key={achievement.id}
                  className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg animate-in slide-in-from-right duration-500"
                  style={{ animationDelay: `${300 + index * 100}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">{achievement.title}</h3>
                      <p className="text-xs text-gray-600 mt-1">{achievement.description}</p>
                    </div>
                    <div className="text-2xl">{achievement.icon}</div>
                  </div>
                  {achievement.value && (
                    <div className="mt-2 text-xs text-gray-500">
                      <span className="font-medium">{achievement.value}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-green-100 p-3 rounded-lg mt-4">
              <div className="flex items-center gap-2 text-sm text-green-800">
                <span>🏆</span>
                <span className="font-medium">Badge Unlocked: {content.badge}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Angel Arena Preview Modal */}
      {showAngelArenaPreview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowAngelArenaPreview(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-purple-500 p-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">Angel Arena</h3>
              <button
                onClick={() => setShowAngelArenaPreview(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-6">
              <AngelArenaPreview />
            </div>
          </div>
        </div>
      )}

      {/* VC Marketplace Preview Modal */}
      {showVCPreview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowVCPreview(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-500 p-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">VC Marketplace</h3>
              <button
                onClick={() => setShowVCPreview(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-6">
              <VCMarketplacePreview />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Angel Arena Preview Component
function AngelArenaPreview() {
  const investors = [
    {
      name: "Isabella Rossi",
      description: "Serial entrepreneur in the food industry.",
      investment: "$50K - $150K",
      focus: ["Food And Beverage", "Sustainable Fashion"]
    },
    {
      name: "Kenji Sato",
      description: "Former lead game designer at a major Japanese studio.",
      investment: "$50K - $150K",
      focus: ["Gaming", "Consumer Apps"]
    },
    {
      name: "Maria Lopez",
      description: "Ph.D. in education and a former B2C SaaS executive.",
      investment: "$50K - $150K",
      focus: ["B2b Saas", "Digital Health Biotech"]
    }
  ];

  return (
    <div className="bg-white rounded-lg border-2 border-orange-200 p-4 shadow-sm">
      <div className="flex items-center justify-center mb-3">
        <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
          <span className="text-white text-xl">👥</span>
        </div>
      </div>
      <h3 className="text-center text-lg font-bold text-gray-800 mb-2">Angel Arena</h3>
      <p className="text-center text-xs text-gray-600 mb-4">
        Connect with experienced angel investors
      </p>
      
      <div className="space-y-2">
        {investors.map((investor, idx) => (
          <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-start gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 text-sm">👤</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-800 text-xs">{investor.name}</h4>
                <p className="text-xs text-gray-600 line-clamp-1">{investor.description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-xs text-green-600 mb-2">
              <span>💰</span>
              <span className="font-medium">{investor.investment}</span>
            </div>
            
            <div className="flex flex-wrap gap-1 mb-2">
              {investor.focus.map((area, i) => (
                <span key={i} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                  {area}
                </span>
              ))}
            </div>
            
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium py-1.5 px-3 rounded-lg transition-colors">
              🚀 Meet with Investor
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// VC Marketplace Preview Component
function VCMarketplacePreview() {
  const vcFirms = [
    {
      name: "Apex Ridge Ventures",
      description: "Leading investment firm specializing in early-stage technology companies with global impact potential.",
      check: "$3M - $25M",
      stages: ["Series A", "Series B", "Series C"],
      focus: ["Sector Agnostic"],
      since: "2015"
    },
    {
      name: "Meridian Stone Capital",
      description: "Strategic investment partner focused on transformative technologies shaping tomorrow's economy.",
      check: "$4M - $30M",
      stages: ["Series A", "Series B", "Series C"],
      focus: ["ai deep tech", "digital health biotech", "fintech"],
      since: "2018"
    },
    {
      name: "Velocity Wave Partners",
      description: "Innovation-driven VC firm backing entrepreneurs building the next generation of market leaders.",
      check: "$6M - $45M",
      stages: ["Series A", "Series B", "Series C"],
      focus: ["Sector Agnostic"],
      since: "2011"
    }
  ];

  return (
    <div className="bg-white rounded-lg border-2 border-orange-200 p-4 shadow-sm">
      <div className="flex items-center justify-center mb-3">
        <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
          <span className="text-white text-xl">💼</span>
        </div>
      </div>
      <h3 className="text-center text-lg font-bold text-gray-800 mb-2">VC Marketplace</h3>
      <p className="text-center text-xs text-gray-600 mb-4">
        Access leading venture capital firms
      </p>
      
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {vcFirms.map((firm, idx) => (
          <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-start gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">🏢</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-gray-800 text-xs">{firm.name}</h4>
                  <span className="text-xs text-gray-500">Since {firm.since}</span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">{firm.description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-xs text-green-600 mb-2">
              <span>💰</span>
              <span className="font-medium">Check: {firm.check}</span>
            </div>
            
            <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
              <span>📊</span>
              <span>Stages: {firm.stages.join(", ")}</span>
            </div>
            
            <div className="flex flex-wrap gap-1 mb-2">
              {firm.focus.map((area, i) => (
                <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {area}
                </span>
              ))}
            </div>
            
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium py-1.5 px-3 rounded-lg transition-colors">
              View Firm Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Valuation Counter Component
function ValuationCounter({ before, after, equity, stakeValue, animate, inHeader = false }) {
  const [currentValuation, setCurrentValuation] = useState(0);
  const [currentStake, setCurrentStake] = useState(0);

  useEffect(() => {
    if (!animate) {
      setCurrentValuation(0);
      setCurrentStake(0);
      return;
    }

    const duration = 2000;
    const startTime = Date.now();

    const animationFrame = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setCurrentValuation(Math.floor(after * easeOut));
      setCurrentStake(Math.floor(stakeValue * easeOut));

      if (progress < 1) {
        requestAnimationFrame(animationFrame);
      }
    };

    requestAnimationFrame(animationFrame);
  }, [animate, after, stakeValue]);

  const formatValue = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${Math.floor(value / 1000)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  if (inHeader) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-2xl p-4 shadow-lg">
        <div className="text-white text-sm font-semibold mb-3">💰 VENTURE VALUATION</div>
        
        <div className="flex items-center gap-4 mb-3">
          <div className="text-center">
            <div className="text-purple-200 text-xs mb-1">Before</div>
            <div className="text-xl font-bold text-purple-200 line-through">{formatValue(before)}</div>
          </div>
          
          <div className="text-2xl text-white">→</div>
          
          <div className="text-center">
            <div className="text-yellow-200 text-xs mb-1">After</div>
            <div className="text-3xl font-black text-white">
              {formatValue(currentValuation)}
            </div>
          </div>
        </div>

        <div className="border-t-2 border-white/30 pt-3">
          <div className="flex items-center justify-between text-sm text-white">
            <span>Your Equity:</span>
            <span className="font-bold">{equity}%</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2 text-white">
            <span>Your Stake Value:</span>
            <span className="font-bold text-yellow-200">{formatValue(currentStake)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-2xl p-6 w-full shadow-lg">
      <div className="text-center">
        <div className="text-yellow-600 text-sm font-semibold mb-3">💰 VENTURE VALUATION</div>
        
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="text-center">
            <div className="text-gray-400 text-xs mb-1">Before</div>
            <div className="text-2xl font-bold text-gray-400 line-through">{formatValue(before)}</div>
          </div>
          
          <div className="text-3xl text-yellow-500">→</div>
          
          <div className="text-center">
            <div className="text-yellow-600 text-xs mb-1">After</div>
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">
              {formatValue(currentValuation)}
            </div>
          </div>
        </div>

        <div className="border-t-2 border-yellow-200 pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Your Equity:</span>
            <span className="font-bold text-gray-800">{equity}%</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-600">Your Stake Value:</span>
            <span className="font-bold text-green-600">{formatValue(currentStake)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
