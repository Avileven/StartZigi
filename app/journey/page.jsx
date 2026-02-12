"use client"
import React, { useState, useEffect } from 'react';

// All 5 phases data - FULL content from PhaseCompletionModal
const PHASES = ['idea', 'business_plan', 'mvp', 'mlp', 'beta'];

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
        title: "Funding Plan & Budget Breakdown",
        description: "Plan your forecast monthly expenses and funding requirements"
      },
      {
        id: 3,
        title: "Revenue Model",
        description: "Define how your venture will make money"
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
        title: "Product Design & Features",
        description: "Define core features and user experience"
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
    subtitle: "Moving to Market Launch Prep",
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
      equity: 90,
      capitalInjection: 50000
    },
    
    achievements: [
      {
        id: 1,
        title: "MVP Launched",
        description: "First version live and functional",
        icon: "✓",
        value: null
      },
      {
        id: 2,
        title: "Early Users Acquired",
        description: "Initial traction achieved",
        icon: "👥",
        value: "50+ users"
      }
    ],
    
    challenges: [
      {
        id: 1,
        title: "Market Launch Preparation",
        description: "Prepare for full market launch"
      },
      {
        id: 2,
        title: "Marketing & Growth Strategy",
        description: "Plan your go-to-market approach"
      },
      {
        id: 3,
        title: "Scale Your Operations",
        description: "Build processes for growth"
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
      equity: 75,
      capitalInjection: 100000
    },
    
    achievements: [
      {
        id: 1,
        title: "Market Launch Successful",
        description: "Product in market with traction",
        icon: "✓",
        value: null
      },
      {
        id: 2,
        title: "Revenue Generated",
        description: "First paying customers acquired",
        icon: "💵",
        value: "$10K MRR"
      }
    ],
    
    challenges: [
      {
        id: 1,
        title: "Beta Testing Program",
        description: "Launch comprehensive beta testing"
      },
      {
        id: 2,
        title: "Product Refinement",
        description: "Iterate based on user feedback"
      },
      {
        id: 3,
        title: "Scale Customer Acquisition",
        description: "Ramp up marketing and sales"
      },
      {
        id: 4,
        title: "Enter the VC Marketplace",
        description: "Connect with venture capital firms for Series A funding"
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
      equity: 65,
      capitalInjection: 250000
    },
    
    achievements: [
      {
        id: 1,
        title: "Beta Complete",
        description: "Product validated by users",
        icon: "✓",
        value: null
      },
      {
        id: 2,
        title: "Product-Market Fit",
        description: "Strong market validation achieved",
        icon: "🎯",
        value: "Confirmed"
      },
      {
        id: 3,
        title: "Scale-Ready",
        description: "Infrastructure ready for growth",
        icon: "📈",
        value: "Ready"
      }
    ],
    
    challenges: [
      {
        id: 1,
        title: "Accelerate Growth",
        description: "Scale operations and revenue"
      },
      {
        id: 2,
        title: "Team Expansion",
        description: "Build your growth team"
      },
      {
        id: 3,
        title: "Series A Fundraising",
        description: "Secure growth capital"
      }
    ]
  }
};

export default function JourneyPage() {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentValuation, setCurrentValuation] = useState(0);
  const [currentEquity, setCurrentEquity] = useState(0);
  const [journeyComplete, setJourneyComplete] = useState(false);
  const [contentVisible, setContentVisible] = useState(true);

  const currentPhase = PHASES[currentPhaseIndex];
  const content = PHASE_CONTENT[currentPhase];

  // Phase title colors
  const phaseColors = {
    idea: 'text-green-400',
    business_plan: 'text-blue-400',
    mvp: 'text-orange-400',
    mlp: 'text-purple-400',
    beta: 'text-pink-400'
  };

  // Auto-play through phases
  useEffect(() => {
    if (!isPlaying) return;

    const phaseTimer = setTimeout(() => {
      // Fade out content before changing phase
      setContentVisible(false);
      
      setTimeout(() => {
        if (currentPhaseIndex < PHASES.length - 1) {
          setCurrentPhaseIndex(prev => prev + 1);
          setContentVisible(true); // Fade in new content
        } else {
          setIsPlaying(false);
          setJourneyComplete(true);
        }
      }, 500); // Wait for fade out
    }, 6000);

    return () => clearTimeout(phaseTimer);
  }, [isPlaying, currentPhaseIndex]);

  // Animate numbers
  useEffect(() => {
    setCurrentProgress(0);
    setCurrentValuation(content.valuation.before);
    setCurrentEquity(0);

    const duration = 5000;
    const startTime = Date.now();

    const animationFrame = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setCurrentProgress(Math.floor(content.progressPercent * easeOut));
      setCurrentValuation(Math.floor(content.valuation.before + (content.valuation.after - content.valuation.before) * easeOut));
      setCurrentEquity(Math.floor(content.valuation.equity * easeOut));

      if (progress < 1) {
        requestAnimationFrame(animationFrame);
      }
    };

    requestAnimationFrame(animationFrame);
  }, [currentPhaseIndex, content]);

  const formatValue = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${Math.floor(value / 1000)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  if (journeyComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
        <div className="text-center animate-in fade-in duration-700">
          <h1 className="text-6xl font-black text-white mb-4">Journey Complete!</h1>
          <p className="text-2xl text-purple-200 mb-8">You've experienced all phases of StartZig</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-white text-purple-600 font-bold px-8 py-4 rounded-xl text-xl hover:bg-purple-50 transition-colors"
          >
            Watch Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      
      {/* Progress Bar */}
      <div className="h-2 bg-purple-900">
        <div 
          className="h-full bg-yellow-400 transition-all duration-1000"
          style={{ width: `${((currentPhaseIndex + 1) / PHASES.length) * 100}%` }}
        />
      </div>

      <div className="flex-1 bg-white rounded-3xl shadow-2xl max-w-6xl w-full mx-auto my-4 overflow-hidden">
        
        {/* Header with X - Compact */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-2 flex items-center justify-end rounded-t-3xl">
          <button
            onClick={() => window.location.href = '/'}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
          >
            <span className="text-white text-xl">×</span>
          </button>
        </div>

        {/* Dashboard - Compact, Title Above 3 Indicators */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-3">
          {/* Title Centered Above */}
          <div className="text-center mb-3">
            <h1 className={`text-lg font-bold ${phaseColors[currentPhase]} transition-colors duration-500`}>
              {content.title}
            </h1>
          </div>

          <div className="grid grid-cols-4 gap-8 items-center">
            
            {/* EQUITY */}
            <div className="text-center">
              <div className="text-xs font-bold text-gray-300 mb-2 uppercase tracking-wider">Equity</div>
              <div className="text-4xl font-black text-gray-100">
                {currentEquity}%
              </div>
            </div>

            {/* VALUATION */}
            <div className="text-center">
              <div className="text-xs font-bold text-yellow-300 mb-2 uppercase tracking-wider">Valuation</div>
              <div className="text-4xl font-black text-yellow-400">
                {formatValue(currentValuation)}
              </div>
            </div>

            {/* PROGRESS */}
            <div className="text-center">
              <div className="text-xs font-bold text-green-300 mb-2 uppercase tracking-wider">Progress</div>
              <div className="text-4xl font-black text-green-400">
                {currentProgress}%
              </div>
            </div>

            {/* CLOCK - Smaller */}
            <div className="flex justify-center">
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

        {/* Main Content - Compact spacing */}
        <div 
          className={`grid grid-cols-2 gap-6 px-8 py-4 transition-opacity duration-500 ${
            contentVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          
          {/* Left: Next Challenges */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                <span className="text-white text-sm">🎯</span>
              </div>
              <h2 className="text-base font-bold text-gray-800">Next: {content.nextPhase}</h2>
            </div>

            <div className="space-y-2">
              {content.challenges.map((challenge, index) => (
                <div 
                  key={challenge.id}
                  className="bg-orange-50 border-l-4 border-orange-500 p-2 rounded-r-lg"
                >
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">{challenge.id}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-xs">{challenge.title}</h3>
                      <p className="text-xs text-gray-600 mt-0.5">{challenge.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-orange-100 p-2 rounded-lg mt-2">
              <div className="flex items-center gap-2 text-xs text-orange-800">
                <span>⏱️</span>
                <span className="font-medium">Estimated: {content.estimatedTime}</span>
              </div>
            </div>
          </div>

          {/* Right: Achievements */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-sm">✅</span>
              </div>
              <h2 className="text-base font-bold text-gray-800">Your Achievements</h2>
            </div>

            <div className="space-y-2">
              {content.achievements.map((achievement, index) => (
                <div 
                  key={achievement.id}
                  className="bg-green-50 border-l-4 border-green-500 p-2 rounded-r-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-xs">{achievement.title}</h3>
                      <p className="text-xs text-gray-600 mt-0.5">{achievement.description}</p>
                    </div>
                    <div className="text-lg">{achievement.icon}</div>
                  </div>
                  {achievement.value && (
                    <div className="mt-1 text-xs text-gray-500">
                      <span className="font-medium">{achievement.value}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Capital Injection */}
            {content.valuation.capitalInjection > 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-2 rounded-r-lg">
                <div>
                  <h3 className="font-semibold text-gray-800 text-xs">New Investment Received</h3>
                  <p className="text-xs text-gray-600 mt-0.5">Capital injection added to your venture</p>
                </div>
                <div className="mt-1 text-sm font-bold text-green-600">
                  ${(content.valuation.capitalInjection).toLocaleString()}
                </div>
              </div>
            )}

            <div className="bg-green-100 p-2 rounded-lg mt-2">
              <div className="flex items-center gap-2 text-xs text-green-800">
                <span>🏆</span>
                <span className="font-medium">Badge Unlocked: {content.badge}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phase Indicators */}
      <div className="bg-black px-8 py-6">
        <div className="flex items-center justify-center gap-3">
          {PHASES.map((phase, index) => (
            <div 
              key={phase}
              className={`w-3 h-3 rounded-full transition-all duration-500 ${
                index <= currentPhaseIndex ? 'bg-purple-400 scale-150' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
