// 030426
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
      capitalInjection: 0
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
        description: ""
      }
    ]
  },
  
  business_plan: {
    title: "PLAN Phase Complete!",
    subtitle: "Moving to MVP Development",
    emoji: "📊",
    nextPhase: "MVP",
    progressPercent: 40,
    clockRotation: 60,
    timeInPhase: "Completed",
    estimatedTime: "3-4 weeks",
    badge: "Business Strategist",
    featureImage: true,
    
    valuation: {
      before: 250000,
      after: 500000,
      equity: 100,
      // [CHANGED] Capital injection moved here from idea phase — $15,000 is received after completing the business plan
      capitalInjection: 15000
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
      },
      {
        id: 3,
        title: "💰 Capital Injection",
        description: "$15,000 added to your venture account. Monthly burn rate is now $5,000",
        icon: "💵",
        value: "$15,000"
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
    clockRotation: 120,
    timeInPhase: "Completed",
    estimatedTime: "4-6 weeks",
    badge: "Builder",
    
    valuation: {
      before: 500000,
      // [CHANGED] After angel investment from Nia Sharma ($120K), valuation reflects the new equity structure
      after: 1000000,
      equity: 100,
      capitalInjection: 120000
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
        description: "Built initial application prototype",
        icon: "🛠️",
        value: "Complete"
      },
      {
        // [ADDED] Angel investment example — Nia Sharma invested $120,000
        id: 3,
        title: "💰 Angel Investment",
        description: "Nia Sharma (Angel Investor) invested in your venture",
        icon: "🤝",
        value: "$120,000"
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
        description: "Create your Minimum Lovable Product and Received 10 feedbacks from the community"
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
    clockRotation: 180,
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
      },
      {
        // [ADDED] Co-founder joined at MLP phase (moved from beta)
        id: 3,
        title: "🤝 Co-Founder Joined",
        description: "A co-founder joined your venture — your team is growing",
        icon: "👥",
        value: "2 Founders"
      },
      {
        // [ADDED] 10+ feedback responses required to complete MLP phase
        id: 4,
        title: "📝 Community Feedback",
        description: "Received 10+ feedback responses from the platform community",
        icon: "📊",
        value: "10+ Responses"
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
        description: "Invite at least 50 users to sign into your beta"
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
    clockRotation: 240,
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
      },
      {
        id: 3,
        title: "🧪 10 Beta Testers",
        description: "Reached 10 beta sign-ups — milestone required to enter Growth phase",
        icon: "🎯",
        value: "10 Testers"
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
    clockRotation: 300,
    timeInPhase: "Active",
    estimatedTime: "Ongoing",
    badge: "Growth Stage",
    
    valuation: {
      // [CHANGED] Pre-money valuation $3M + VC investment $1.5M = post-money $4.5M
      // Velocity Wave Partners invested $1.5M at $3M pre-money valuation
      // equity: founder retains ~67% ($3M / $4.5M post-money)
      before: 5000000,
      after: 10000000,
      equity: 67,
      capitalInjection: 1500000
    },
    
    achievements: [
      {
        id: 1,
        title: "🏦 VC Investment Secured",
        description: "Velocity Wave Partners invested $5M at $5M pre-money valuation",
        icon: "💼",
        value: "$1,500,000"
      },
      {
        id: 2,
        title: "👥 200 Beta Users",
        description: "Scaled beta community to 200 active users",
        icon: "🚀",
        value: "200 Users"
      },
      {
        id: 3,
        title: "✨ New Features Shipped",
        description: "Product enhanced based on user feedback and market demand",
        icon: "🛠️",
        value: "Live"
      }
    ],
    challenges: [
      {
        id: 1,
        title: "Scale User Acquisition",
        description: "Keep growing your user base and expanding into new markets"
      },
      {
        id: 2,
        title: "Negotiate Exit",
        description: "Engage with strategic buyers and negotiate an acquisition opportunity"
      }
    ],
    
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

// Unique color per phase — used for clock arc, hand, and active label
const PHASE_HEX_COLORS = {
  idea:          '#10b981',
  business_plan: '#f97316',
  mvp:           '#3b82f6',
  mlp:           '#a855f7',
  beta:          '#ec4899',
  growth:        '#eab308',
};


// [ADDED] Separate component so DOM persists and CSS transitions work correctly

// [ADDED] Demo data for the intro slide — simulates a user filling in their venture details
const DEMO_VENTURE = {
  name: "MentalPlus",
  sector: "Digital Health / Biotech",
  description: "An AI-powered mental wellness platform that helps users track, understand and improve their emotional health"
};

export default function PhaseCompletionDemo() {
  // [ADDED] Intro slide state
  const [showIntro, setShowIntro] = useState(true);
  const [typedName, setTypedName] = useState("");
  const [typedSector, setTypedSector] = useState("");
  const [typedDescription, setTypedDescription] = useState("");
  const [introStep, setIntroStep] = useState(0);

  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [contentVisible, setContentVisible] = useState(false);
  // [ADDED] showClockOnly — starts true so clock shows on first load (IDEA phase), then 3s before each transition
  const [showClockOnly, setShowClockOnly] = useState(false);
  // [ADDED] Animated arc — starts at 879 (empty) then animates to target value
  const [animatedArcOffset, setAnimatedArcOffset] = useState(879);
  const [animatedRotation, setAnimatedRotation] = useState(0);

  // [MOVED UP] These must be declared before useEffects that reference them
  const currentPhase = PHASES[currentPhaseIndex];
  const content = PHASE_CONTENT[currentPhase];

  // [FIXED] Show clock for 3 seconds after intro ends, with animation
  useEffect(() => {
    if (!showIntro) {
      setShowClockOnly(true);
      // Start from empty then animate to correct position
      setAnimatedArcOffset(879);
      setAnimatedRotation(0);
      const t1 = setTimeout(() => {
        const seg = 879/6;
        const phaseIdx = PHASES.indexOf(PHASES[0]);
        setAnimatedArcOffset(879 - seg * (phaseIdx + 1));
        setAnimatedRotation(PHASE_CONTENT[PHASES[0]].clockRotation);
      }, 100);
      const t2 = setTimeout(() => setShowClockOnly(false), 3000);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [showIntro]);

  // [ADDED] When phase changes during clock display, animate to new position
  useEffect(() => {
    if (showClockOnly) {
      setAnimatedArcOffset(879);
      setAnimatedRotation(0);
      const seg = 879/6;
      const phaseIdx = PHASES.indexOf(currentPhase);
      const t = setTimeout(() => {
        setAnimatedArcOffset(879 - seg * (phaseIdx + 1));
        setAnimatedRotation(content.clockRotation);
      }, 100);
      return () => clearTimeout(t);
    }
  }, [currentPhase, showClockOnly]);
  const [currentValuation, setCurrentValuation] = useState(0);
  const [currentEquity, setCurrentEquity] = useState(100);
  const [currentProgress, setCurrentProgress] = useState(0);

  // (currentPhase and content declared above useEffects)

  // [ADDED] Typing animation — runs on mount, types each field then advances to phase slides after ~5 seconds
  useEffect(() => {
    if (!showIntro) return;
    const typeText = (text, setter, onDone, speed = 40) => {
      let i = 0;
      setter("");
      const interval = setInterval(() => {
        setter(text.slice(0, i + 1));
        i++;
        if (i >= text.length) {
          clearInterval(interval);
          setTimeout(onDone, 300);
        }
      }, speed);
      return interval;
    };
    const t1 = setTimeout(() => {
      typeText(DEMO_VENTURE.name, setTypedName, () => {
        setIntroStep(1);
        typeText(DEMO_VENTURE.sector, setTypedSector, () => {
          setIntroStep(2);
          typeText(DEMO_VENTURE.description, setTypedDescription, () => {
            setIntroStep(3);
            setTimeout(() => setShowIntro(false), 800);
          }, 20);
        }, 60);
      });
    }, 600);
    return () => clearTimeout(t1);
  }, [showIntro]);

  // Runs after clock disappears so animation is visible
  useEffect(() => {
    if (showClockOnly) return;

    setContentVisible(false);
    setCurrentValuation(content.valuation.before);
    setCurrentProgress(0);

    const timer1 = setTimeout(() => setContentVisible(true), 200);
    const duration = 2000;
    const steps = 60;
    const intervalMs = duration / steps;
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    let step = 0;
    const timer2 = setInterval(() => {
      step++;
      const easedProgress = easeOut(step / steps);
      setCurrentValuation(Math.floor(content.valuation.before + (content.valuation.after - content.valuation.before) * easedProgress));
      setCurrentProgress(Math.floor(content.progressPercent * easedProgress));
      if (step >= steps) {
        clearInterval(timer2);
        setCurrentValuation(content.valuation.after);
        setCurrentProgress(content.progressPercent);
      }
    }, intervalMs);

    return () => { clearTimeout(timer1); clearInterval(timer2); };
  }, [showClockOnly, currentPhaseIndex]);

  const formatValue = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val}`;
  };

  const handleNext = () => {
    if (currentPhaseIndex < PHASES.length - 1) {
      setContentVisible(false);
      // [CHANGED] Show clock only for 3 seconds before advancing to next slide
      setTimeout(() => {
        setCurrentPhaseIndex(currentPhaseIndex + 1);
        setShowClockOnly(true);
        setTimeout(() => setShowClockOnly(false), 3000);
      }, 300);
    }
  };

  const handlePrev = () => {
    if (currentPhaseIndex > 0) {
      setContentVisible(false);
      // [CHANGED] Show clock only for 3 seconds before going to previous slide
      setTimeout(() => {
        setCurrentPhaseIndex(currentPhaseIndex - 1);
        setShowClockOnly(true);
        setTimeout(() => setShowClockOnly(false), 3000);
      }, 300);
    }
  };

  // Regular phase rendering
  // [ADDED] Intro slide — shown before phase slides, auto-advances after ~5 seconds
  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💡</span>
            </div>
            <h1 className="text-3xl font-black text-white mb-2">Start Your Venture</h1>
            <p className="text-purple-200 text-sm">Every great startup begins with an idea. Tell us about yours.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Venture Name</label>
              <div className="relative">
                <input readOnly value={typedName}
                  className="w-full border-2 border-indigo-200 rounded-lg px-4 py-3 text-lg font-semibold text-indigo-800 bg-indigo-50 focus:outline-none"
                  placeholder="e.g. MentalPlus, EcoWaste AI..." />
                {introStep === 0 && typedName.length > 0 && <span className="absolute right-4 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-600 animate-pulse" />}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sector</label>
              <div className="relative">
                <input readOnly value={typedSector}
                  className="w-full border-2 border-purple-200 rounded-lg px-4 py-3 text-gray-800 bg-purple-50 focus:outline-none"
                  placeholder="Select your industry..." />
                {introStep === 1 && typedSector.length > 0 && <span className="absolute right-4 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-purple-600 animate-pulse" />}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">What does your venture do?</label>
              <div className="relative">
                <textarea readOnly value={typedDescription} rows={3}
                  className="w-full border-2 border-pink-200 rounded-lg px-4 py-3 text-gray-800 bg-pink-50 focus:outline-none resize-none text-sm"
                  placeholder="Describe your venture in one sentence..." />
                {introStep === 2 && typedDescription.length > 0 && <span className="absolute right-4 bottom-4 w-0.5 h-4 bg-pink-600 animate-pulse" />}
              </div>
            </div>
            <button
              disabled={introStep < 3}
              onClick={() => setShowIntro(false)}
              className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all duration-500 ${
                introStep >= 3
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}>
              {introStep >= 3 ? "🚀 Launch My Venture →" : "Filling in details..."}
            </button>
          </div>
          <div className="flex justify-center gap-4 mt-6">
            {["Name", "Sector", "Description"].map((label, i) => (
              <div key={i} className={`flex items-center gap-1 text-xs transition-all duration-300 ${introStep > i ? "text-green-400" : "text-white/40"}`}>
                <span>{introStep > i ? "✓" : "○"}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // [FIXED] Fullscreen clock — uses animatedArcOffset + animatedRotation from state
  // so CSS transitions actually fire (previously used static computed values which skip animation)
  if (showClockOnly) {
    const activeColor = PHASE_HEX_COLORS[currentPhase];
    const phases = ['idea','business_plan','mvp','mlp','beta','growth'];
    const labels = ['IDEA','PLAN','MVP','MLP','BETA','GROWTH'];
    const positions = [{x:160,y:64},{x:247,y:112},{x:247,y:216},{x:160,y:260},{x:73,y:216},{x:73,y:112}];
    const colors = phases.map(p => PHASE_HEX_COLORS[p]);
    return (
      <div style={{minHeight:'100vh',background:'rgba(15,10,40,0.97)',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{textAlign:'center'}}>
          <svg width="380" height="380" viewBox="0 0 320 320">
            <circle cx="160" cy="160" r="140" fill="rgba(99,66,220,0.1)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
            <circle cx="160" cy="160" r="140" fill="none" stroke={activeColor} strokeWidth="12" strokeLinecap="round"
              strokeDasharray="879" strokeDashoffset={animatedArcOffset}
              style={{transform:'rotate(-90deg)',transformOrigin:'160px 160px',transition:'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)'}}/>
            <circle cx="160" cy="160" r="60" fill="rgba(60,40,160,0.45)"/>
            {labels.map((label, i) => (
              <text key={i} x={positions[i].x} y={positions[i].y}
                fontSize={phases[i]===currentPhase?'12':'10'}
                fill={phases[i]===currentPhase ? colors[i] : 'rgba(255,255,255,0.5)'}
                textAnchor="middle"
                fontWeight={phases[i]===currentPhase?'800':'600'}>
                {label}
              </text>
            ))}
            <path fill="rgba(200,190,255,0.85)" d="M158 160 L162 160 L162 75 L158 75 Z"
              style={{
                transform:`rotate(${animatedRotation}deg)`,
                transformOrigin:'160px 160px',
                transition:'transform 1.5s cubic-bezier(0.4,0,0.2,1)'
              }}/>
            <circle cx="160" cy="160" r="6" fill="#8b5cf6"/>
          </svg>
          <div style={{color:activeColor,fontSize:'22px',fontWeight:'700',marginTop:'12px'}}>{content.title}</div>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:'14px',marginTop:'4px'}}>{content.subtitle}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Hero Section - RESPONSIVE */}
          <div className="px-4 md:px-8 py-6">
            <div className="flex flex-col items-center">
              
              {/* Left: Title + 3 Indicators */}
              <div className="w-full text-center">
                {/* Title */}
                <div className="text-center mb-3">
                  <h1 className={`text-base md:text-lg font-bold ${phaseColors[currentPhase]} transition-colors duration-500`}>
                    {content.title}
                  </h1>
                </div>

                {/* 2 Indicators — Equity removed */}
                <div className="grid grid-cols-2 gap-3 md:gap-8">
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
