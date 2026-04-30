// 050426
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
      },
      {
        id: 3,
        title: "Financial Launch",
        description: "$15,000 added to your venture account. From now on, your monthly burn rate is $5,000"
      }
    ],
    
    estimatedTime: "2-3 weeks",
    badge: "Idea Champion"
  },
  
  business_plan: { // [UPDATED 300426] capitalInjection moved here from idea
    title: "PLAN Phase Complete!",
    subtitle: "Moving to MVP Development",
    emoji: "📋",
    nextPhase: "MVP",
    progressPercent: 40,
    clockRotation: 72, // PLAN at 1 o'clock (72 degrees)
    timeInPhase: "Completed",
    
    valuation: {
      before: 250000,
      after: 500000,
      equity: 100,
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
    ],
    
    estimatedTime: "Ongoing",
    badge: "Beta Master"
  }
};

// [CHANGED] Added venture and fundingEvents props to show real venture data.
// venture — the current venture object from DB (valuation, virtual_capital, founders_count)
// fundingEvents — list of investments received (to show in achievements)
// Safety: all real data access uses optional chaining so missing data never crashes the modal.
const PHASE_HEX_COLORS = {
  idea:          '#10b981',
  business_plan: '#f97316',
  mvp:           '#3b82f6',
  mlp:           '#a855f7',
  beta:          '#ec4899',
  growth:        '#eab308',
};

export default function PhaseCompletionModal({ 
  isOpen, 
  onClose, 
  completedPhase,
  venture,
  fundingEvents = [],
  liveBalance
}) {

  const [showClockOnly, setShowClockOnly] = useState(false);
  const [animatedArcOffset, setAnimatedArcOffset] = useState(879);
  const [animatedRotation, setAnimatedRotation] = useState(0);

  const content = completedPhase ? PHASE_CONTENT[completedPhase] : null;

  useEffect(() => {
    if (isOpen && content) {
      setShowClockOnly(true);
      setAnimatedArcOffset(879);
      setAnimatedRotation(0);
      const PHASES = ['idea','business_plan','mvp','mlp','beta','growth'];
      const t1 = setTimeout(() => {
        const seg = 879 / 6;
        const phaseIdx = PHASES.indexOf(completedPhase);
        setAnimatedArcOffset(879 - seg * (phaseIdx + 1));
        setAnimatedRotation(content.clockRotation);
      }, 100);
      const t2 = setTimeout(() => {
        setShowClockOnly(false);
      }, 3000);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [isOpen, completedPhase]);

  if (!isOpen || !completedPhase) return null;
  if (!content) return null;

  const realFoundersCount = venture?.founders_count || 1;

  // [ADDED] Check if there was an investment in the recent funding events
  const recentInvestment = fundingEvents?.[0] || null;

  // Exact clock from page.jsx marketing file
  if (showClockOnly) {
    const activeColor = PHASE_HEX_COLORS[completedPhase];
    const phases = ['idea','business_plan','mvp','mlp','beta','growth'];
    const labels = ['IDEA','PLAN','MVP','MLP','BETA','GROWTH'];
    const positions = [{x:160,y:64},{x:247,y:112},{x:247,y:216},{x:160,y:260},{x:73,y:216},{x:73,y:112}];
    const colors = phases.map(p => PHASE_HEX_COLORS[p]);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:'rgba(15,10,40,0.97)'}}>
        <div style={{textAlign:'center'}}>
          <svg width="380" height="380" viewBox="0 0 320 320">
            <circle cx="160" cy="160" r="140" fill="rgba(99,66,220,0.1)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
            <circle cx="160" cy="160" r="140" fill="none" stroke={activeColor} strokeWidth="12" strokeLinecap="round"
              strokeDasharray="879" strokeDashoffset={animatedArcOffset}
              style={{transform:'rotate(-90deg)',transformOrigin:'160px 160px',transition:'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)'}}/>
            <circle cx="160" cy="160" r="60" fill="rgba(60,40,160,0.45)"/>
            {labels.map((label, i) => (
              <text key={i} x={positions[i].x} y={positions[i].y}
                fontSize={phases[i]===completedPhase?'12':'10'}
                fill={phases[i]===completedPhase ? colors[i] : 'rgba(255,255,255,0.5)'}
                textAnchor="middle"
                fontWeight={phases[i]===completedPhase?'800':'600'}>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-8 duration-500">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6 text-center relative overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          <div className="text-5xl mb-2">{content.emoji}</div>
          <h1 className="text-3xl font-black text-white mb-2">{content.title}</h1>
          <p className="text-purple-100 text-sm">{content.subtitle}</p>
          
          {/* Capital Injection */}
          {content.valuation.capitalInjection > 0 && (
            <div className="mt-4 inline-block bg-yellow-400/20 border-2 border-yellow-300 rounded-full px-6 py-2">
              <div className="flex items-center gap-2 text-yellow-100">
                <span className="text-xl">💰</span>
                <span className="font-bold">Capital Injection: ${(content.valuation.capitalInjection).toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-2 gap-8 p-8">
          
          {/* Left: Next Challenges */}
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

              {/* [ADDED] Real dynamic achievements from venture data */}

              {/* Investment received */}
              {recentInvestment && (
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg animate-in slide-in-from-right duration-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">💰 Investment Received</h3>
                      <p className="text-xs text-gray-600 mt-1">From {recentInvestment.investor_name}</p>
                    </div>
                    <div className="text-sm font-bold text-yellow-700">
                      ${(recentInvestment.amount || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}

              {/* Co-founder joined */}
              {realFoundersCount > 1 && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg animate-in slide-in-from-right duration-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">🤝 Team Growing</h3>
                      <p className="text-xs text-gray-600 mt-1">Your venture now has {realFoundersCount} founders</p>
                    </div>
                    <div className="text-2xl">👥</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-6 flex items-center justify-between border-t">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Phase:</span> {content.timeInPhase}
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={onClose}
              className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              Close
            </Button>
            <Button 
              onClick={onClose}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg"
            >
              Continue to {content.nextPhase} Phase →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}