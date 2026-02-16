"use client"
import React, { useState, useEffect } from 'react';

// All 6 phases data
const PHASES = ['idea', 'business_plan', 'mvp', 'mlp', 'beta', 'growth'];

const PHASE_CONTENT = {
  idea: {
    title: "IDEA Phase Complete!",
    subtitle: "Moving to Business Plan Phase",
    emoji: "💡",
    nextPhase: "PLAN",
    progressPercent: 20,
    clockRotation: 0,
    timeInPhase: "Completed",
    estimatedTime: "2-3 weeks",
    badge: "Idea Validated",
    
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
        title: "Funding Plan & Budget",
        description: "Plan your expenses and revenue model"
      },
      {
        id: 3,
        title: "New Investment Recorded",
        description: "$15,000 added to your venture account"
      }
    ]
  },
  
  business_plan: {
    title: "PLAN Phase Complete!",
    subtitle: "Moving to MVP Development",
    emoji: "📊",
    nextPhase: "MVP",
    progressPercent: 40,
    clockRotation: 72,
    timeInPhase: "Completed",
    estimatedTime: "3-4 weeks",
    badge: "Business Strategist",
    featureImage: true,
    
    valuation: {
      before: 250000,
      after: 500000,
      equity: 100,
      capitalInjection: 0
    },
    
    achievements: [
      {
        id: 1,
        title: "Business Plan Complete",
        description: "Comprehensive strategy documented",
        icon: "✓",
        value: null
      },
      {
        id: 2,
        title: "Financial Model Ready",
        description: "Revenue projections validated",
        icon: "💰",
        value: "Complete"
      }
    ],
    
    challenges: [
      {
        id: 1,
        title: "Build Your MVP",
        description: "Create your minimum viable product"
      },
      {
        id: 2,
        title: "Enter the Promotion Center",
        description: "Prepare for user feedback collection"
      },
      {
        id: 3,
        title: "Enter the Angel Arena",
        description: "Start talking with investors"
      }
    ]
  },
  
  mvp: {
    title: "MVP Phase Complete!",
    subtitle: "Moving to MLP Development",
    emoji: "🛠️",
    nextPhase: "MLP",
    progressPercent: 60,
    clockRotation: 144,
    timeInPhase: "Completed",
    estimatedTime: "4-6 weeks",
    badge: "Builder",
    
    valuation: {
      before: 500000,
      after: 1000000,
      equity: 100,
      capitalInjection: 0
    },
    
    achievements: [
      {
        id: 1,
        title: "MVP Launched",
        description: "First version of product deployed",
        icon: "✓",
        value: null
      },
      {
        id: 2,
        title: "Core Features Built",
        description: "Essential functionality completed",
        icon: "🛠️",
        value: "Complete"
      }
    ],
    
    challenges: [
      {
        id: 1,
        title: "Optimize User Experience",
        description: "Refine product based on user feedback"
      },
      {
        id: 2,
        title: "Build Your MLP",
        description: "Create your Minimum Lovable Product"
      },
      {
        id: 3,
        title: "Enter the Promotion Center",
        description: "Collect product feedback from early users"
      }
    ]
  },
  
  mlp: {
    title: "MLP Phase Complete!",
    subtitle: "Moving to Beta Testing",
    emoji: "🚀",
    nextPhase: "BETA",
    progressPercent: 80,
    clockRotation: 216,
    timeInPhase: "Completed",
    estimatedTime: "6-8 weeks",
    badge: "Market Ready",
    featureImage: true,
    
    valuation: {
      before: 1000000,
      after: 2500000,
      equity: 100,
      capitalInjection: 0
    },
    
    achievements: [
      {
        id: 1,
        title: "MLP Launched",
        description: "Upgraded version of product deployed",
        icon: "✓",
        value: null
      },
      {
        id: 2,
        title: "Demo Updated",
        description: "Your updated demo version was loaded to your landing page",
        icon: null,
        value: null
      }
    ],
    
    challenges: [
      {
        id: 1,
        title: "Build Your BETA version",
        description: "Prepare your BETA based on community feedback"
      },
      {
        id: 2,
        title: "Beta registration",
        description: "Invite users to sign into your beta"
      },
      {
        id: 3,
        title: "Create your Pitch",
        description: "Create your pitch before approaching professional investors"
      },
      {
        id: 4,
        title: "Secure funding",
        description: "Enter the VC Marketplace and secure funding"
      }
    ]
  },
  
  beta: {
    title: "BETA Phase Complete!",
    subtitle: "Ready for Growth",
    emoji: "🎯",
    nextPhase: "GROWTH",
    progressPercent: 100,
    clockRotation: 288,
    timeInPhase: "Completed",
    estimatedTime: "8-12 weeks",
    badge: "Scale Master",
    
    valuation: {
      before: 2500000,
      after: 5000000,
      equity: 100,
      capitalInjection: 0
    },
    
    achievements: [
      {
        id: 1,
        title: "Product in Beta",
        description: "Public testing phase launched",
        icon: "✓",
        value: null
      },
      {
        id: 2,
        title: "User Feedback Loop",
        description: "Active beta testing community",
        icon: "👥",
        value: "Active"
      }
    ],
    
    challenges: [
      {
        id: 1,
        title: "Finalize Product",
        description: "Move from beta to production"
      },
      {
        id: 2,
        title: "Acquire 50 beta users",
        description: "Validate product-market fit with real users"
      }
    ]
  },
  
  // GROWTH PHASE - Success Milestone
  growth: {
    title: "Welcome to the Growth Phase! 🚀",
    subtitle: "Your StartZig is Thriving",
    emoji: "🚀",
    nextPhase: null,
    progressPercent: 100,
    clockRotation: 360,
    timeInPhase: "Active",
    estimatedTime: "Ongoing",
    badge: "Growth Stage",
    isSuccessMessage: true,
    
    valuation: {
      before: 5000000,
      after: 10000000,
      equity: 100,
      capitalInjection: 0
    },
    
    achievements: [],
    challenges: [],
    
    successMessage: {
      title: "Congratulations!",
      content: `Your StartZig has evolved from an idea to a thriving business with real users and proven traction.

You've entered the Growth phase—where the market takes notice.

**What's happening now:**
Industry leaders are actively scouting for innovative companies like yours. Your progress has positioned you as a potential acquisition target, and market leaders in your sector may approach you with exit opportunities.

**Explore your options:**
Visit the **Exit Path** to learn about companies interested in acquiring promising StartZigs in the Growth phase. This could be your opportunity for a life-changing exit.

Keep building, keep growing—the best is yet to come.`
    }
  }
};

const phaseColors = {
  idea: 'text-green-500',
  business_plan: 'text-orange-500',
  mvp: 'text-orange-500',
  mlp: 'text-orange-500',
  beta: 'text-orange-500',
  growth: 'text-green-500'
};

export default function PhaseCompletionDemo() {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [contentVisible, setContentVisible] = useState(false);
  const [currentValuation, setCurrentValuation] = useState(0);
  const [currentEquity, setCurrentEquity] = useState(100);
  const [currentProgress, setCurrentProgress] = useState(0);

  const currentPhase = PHASES[currentPhaseIndex];
  const content = PHASE_CONTENT[currentPhase];

  useEffect(() => {
    const timer1 = setTimeout(() => setContentVisible(true), 500);
    
    const duration = 3000;
    const steps = 60;
    const interval = duration / steps;

    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    let step = 0;
    const timer2 = setInterval(() => {
      step++;
      const progress = step / steps;
      const easedProgress = easeOut(progress);

      setCurrentValuation(Math.floor(content.valuation.before + (content.valuation.after - content.valuation.before) * easedProgress));
      setCurrentEquity(Math.floor(content.valuation.equity));
      setCurrentProgress(Math.floor(content.progressPercent * easedProgress));

      if (step >= steps) {
        clearInterval(timer2);
        setCurrentValuation(content.valuation.after);
        setCurrentProgress(content.progressPercent);
      }
    }, interval);

    return () => {
      clearTimeout(timer1);
      clearInterval(timer2);
    };
  }, [currentPhaseIndex]);

  const formatValue = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val}`;
  };

  const handleNext = () => {
    if (currentPhaseIndex < PHASES.length - 1) {
      setContentVisible(false);
      setTimeout(() => {
        setCurrentPhaseIndex(currentPhaseIndex + 1);
      }, 300);
    }
  };

  const handlePrev = () => {
    if (currentPhaseIndex > 0) {
      setContentVisible(false);
      setTimeout(() => {
        setCurrentPhaseIndex(currentPhaseIndex - 1);
      }, 300);
    }
  };

  // Special rendering for GROWTH phase
  if (content.isSuccessMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            <div className="text-6xl mb-6">{content.emoji}</div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              {content.title}
            </h1>
            <p className="text-xl text-gray-600 mb-8">{content.subtitle}</p>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 mb-8 text-left">
              <div className="prose prose-lg max-w-none">
                {content.successMessage.content.split('\n\n').map((paragraph, index) => {
                  if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                    return (
                      <h3 key={index} className="text-xl font-bold text-gray-900 mt-6 mb-3">
                        {paragraph.replace(/\*\*/g, '')}
                      </h3>
                    );
                  }
                  return (
                    <p key={index} className="text-gray-700 leading-relaxed mb-4">
                      {paragraph.split('**').map((part, i) => 
                        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                      )}
                    </p>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={handlePrev}
                className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition-colors"
              >
                ← Previous Phase
              </button>
              <a
                href="/ma"
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-colors"
              >
                Visit Exit Path →
              </a>
            </div>
          </div>

          {/* Phase Navigator */}
          <div className="flex justify-center gap-2 mt-6">
            {PHASES.map((phase, index) => (
              <button
                key={phase}
                onClick={() => {
                  setContentVisible(false);
                  setTimeout(() => setCurrentPhaseIndex(index), 300);
                }}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentPhaseIndex
                    ? 'bg-white w-8'
                    : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Regular phase rendering
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Hero Section - RESPONSIVE */}
          <div className="px-4 md:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8 items-start">
              
              {/* Left: Title + 3 Indicators */}
              <div className="col-span-1 md:col-span-3">
                {/* Title */}
                <div className="text-center mb-3">
                  <h1 className={`text-base md:text-lg font-bold ${phaseColors[currentPhase]} transition-colors duration-500`}>
                    {content.title}
                  </h1>
                </div>

                {/* 3 Indicators */}
                <div className="grid grid-cols-3 gap-3 md:gap-8">
                  {/* EQUITY */}
                  <div className="text-center">
                    <div className="text-[10px] md:text-xs font-bold text-gray-300 mb-1 uppercase tracking-wider">Equity</div>
                    <div className="text-2xl md:text-4xl font-black text-gray-100">
                      {currentEquity}%
                    </div>
                  </div>

                  {/* VALUATION */}
                  <div className="text-center">
                    <div className="text-[10px] md:text-xs font-bold text-yellow-300 mb-1 uppercase tracking-wider">Valuation</div>
                    <div className="text-2xl md:text-4xl font-black text-yellow-400">
                      {formatValue(currentValuation)}
                    </div>
                  </div>

                  {/* PROGRESS */}
                  <div className="text-center">
                    <div className="text-[10px] md:text-xs font-bold text-green-300 mb-1 uppercase tracking-wider">Progress</div>
                    <div className="text-2xl md:text-4xl font-black text-green-400">
                      {currentProgress}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: CLOCK - hidden on mobile */}
              <div className="hidden md:flex justify-center items-center">
                <svg viewBox="0 0 200 200" className="w-36 h-36">
                  <circle cx="100" cy="100" r="90" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" strokeWidth="8" />
                  <circle 
                    cx="100" cy="100" r="90" 
                    fill="none" 
                    stroke="#fb923c"
                    strokeWidth="8" 
                    strokeLinecap="round"
                    strokeDasharray="565"
                    strokeDashoffset={565 * (1 - currentProgress / 100)}
                    style={{
                      transform: 'rotate(-90deg)',
                      transformOrigin: '100px 100px',
                      transition: 'none'
                    }}
                  />
                  <circle cx="100" cy="100" r="70" fill="rgba(147,51,234,0.3)" />
                  <text x="100" y="30" className="text-xs font-bold" fill={currentPhase === 'idea' ? '#10b981' : 'rgba(255,255,255,0.5)'} textAnchor="middle">IDEA</text>
                  <text x="160" y="80" className="text-xs font-bold" fill={currentPhase === 'business_plan' ? '#f97316' : 'rgba(255,255,255,0.5)'} textAnchor="middle">PLAN</text>
                  <text x="140" y="155" className="text-xs font-bold" fill={currentPhase === 'mvp' ? '#f97316' : 'rgba(255,255,255,0.5)'} textAnchor="middle">MVP</text>
                  <text x="60" y="155" className="text-xs font-bold" fill={currentPhase === 'mlp' ? '#f97316' : 'rgba(255,255,255,0.5)'} textAnchor="middle">MLP</text>
                  <text x="40" y="80" className="text-xs font-bold" fill={currentPhase === 'beta' ? '#f97316' : 'rgba(255,255,255,0.5)'} textAnchor="middle">BETA</text>
                  <path 
                    fill="rgba(156, 163, 175, 0.6)"
                    d="M98 100 L102 100 L102 35 L98 35 Z"
                    style={{
                      transform: `rotate(${content.clockRotation}deg)`,
                      transformOrigin: '100px 100px',
                      transition: 'transform 5s cubic-bezier(0.4, 0.0, 0.2, 1)'
                    }}
                  />
                  <circle cx="100" cy="100" r="4" fill="rgba(156, 163, 175, 0.8)" />
                </svg>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div 
            className={`grid grid-cols-1 md:grid-cols-2 gap-6 px-4 md:px-8 py-3 transition-opacity duration-500 ${
              contentVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            
            {/* Left: Next Challenges */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🎯</span>
                <h2 className="font-bold text-white text-sm">Next: {content.nextPhase} Phase</h2>
              </div>
              
              {content.challenges.map((challenge) => (
                <div key={challenge.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-2 hover:bg-gray-700/50 transition-colors">
                  <h3 className="font-semibold text-white text-xs mb-1">{challenge.title}</h3>
                  <p className="text-[10px] text-gray-400">{challenge.description}</p>
                </div>
              ))}
            </div>

            {/* Right: Achievements */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🏆</span>
                <h2 className="font-bold text-white text-sm">Achievements Unlocked</h2>
              </div>

              {content.achievements.map((achievement) => (
                <div key={achievement.id} className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700/50 rounded-lg p-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-300 text-xs mb-1">{achievement.title}</h3>
                      <p className="text-[10px] text-green-200/80">{achievement.description}</p>
                    </div>
                    {achievement.value && (
                      <span className="text-xs font-bold text-green-400 ml-2">{achievement.value}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Capital Injection - ONLY IN IDEA PHASE */}
            {currentPhase === 'idea' && content.valuation.capitalInjection > 0 && (
              <div className="md:col-span-2 bg-yellow-50 border-l-4 border-yellow-500 p-2 rounded-r-lg">
                <div>
                  <h3 className="font-semibold text-gray-800 text-xs">New Investment Received</h3>
                  <p className="text-xs text-gray-600 mt-0.5">Initial capital injection added to your venture</p>
                </div>
                <div className="mt-1 text-sm font-bold text-green-600">
                  ${(content.valuation.capitalInjection).toLocaleString()}
                </div>
              </div>
            )}

            <div className="md:col-span-2 bg-green-100 p-2 rounded-lg mt-2">
              <div className="flex items-center gap-2 text-xs text-green-800">
                <span>🏆</span>
                <span className="font-semibold">Badge Earned:</span>
                <span className="font-bold">{content.badge}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 md:px-8 py-4 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
            <button
              onClick={handlePrev}
              disabled={currentPhaseIndex === 0}
              className="w-full md:w-auto px-6 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              ← Previous Phase
            </button>
            
            <div className="flex gap-2">
              {PHASES.map((phase, index) => (
                <button
                  key={phase}
                  onClick={() => {
                    setContentVisible(false);
                    setTimeout(() => setCurrentPhaseIndex(index), 300);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentPhaseIndex
                      ? 'bg-orange-500 w-6'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={handleNext}
              disabled={currentPhaseIndex === PHASES.length - 1}
              className="w-full md:w-auto px-6 py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              Next Phase →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
