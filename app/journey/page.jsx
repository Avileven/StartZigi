"use client"
import React, { useState, useEffect } from 'react';

// All 5 phases data
const PHASES = ['idea', 'business_plan', 'mvp', 'mlp', 'beta'];

const PHASE_DATA = {
  idea: {
    title: "IDEA Phase Complete!",
    emoji: "💡",
    progressPercent: 20,
    clockRotation: 0,
    valuation: { before: 0, after: 250000, equity: 100 }
  },
  business_plan: {
    title: "PLAN Phase Complete!",
    emoji: "📊",
    progressPercent: 40,
    clockRotation: 72,
    valuation: { before: 250000, after: 500000, equity: 100 }
  },
  mvp: {
    title: "MVP Phase Complete!",
    emoji: "🛠️",
    progressPercent: 60,
    clockRotation: 144,
    valuation: { before: 500000, after: 1000000, equity: 90 }
  },
  mlp: {
    title: "MLP Phase Complete!",
    emoji: "🚀",
    progressPercent: 80,
    clockRotation: 216,
    valuation: { before: 1000000, after: 2500000, equity: 75 }
  },
  beta: {
    title: "BETA Phase Complete!",
    emoji: "🎯",
    progressPercent: 100,
    clockRotation: 288,
    valuation: { before: 2500000, after: 5000000, equity: 65 }
  }
};

export default function JourneyPage() {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true); // Auto-play on load
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentValuation, setCurrentValuation] = useState(0);
  const [currentEquity, setCurrentEquity] = useState(0);
  const [journeyComplete, setJourneyComplete] = useState(false);

  const currentPhase = PHASES[currentPhaseIndex];
  const phaseData = PHASE_DATA[currentPhase];

  // Auto-play through phases
  useEffect(() => {
    if (!isPlaying) return;

    const phaseTimer = setTimeout(() => {
      if (currentPhaseIndex < PHASES.length - 1) {
        setCurrentPhaseIndex(prev => prev + 1);
      } else {
        setIsPlaying(false);
        setJourneyComplete(true);
      }
    }, 6000); // 5 seconds animation + 1 second pause

    return () => clearTimeout(phaseTimer);
  }, [isPlaying, currentPhaseIndex]);

  // Animate numbers when phase changes
  useEffect(() => {
    setCurrentProgress(0);
    setCurrentValuation(phaseData.valuation.before);
    setCurrentEquity(0);

    const duration = 5000;
    const startTime = Date.now();
    const targetProgress = phaseData.progressPercent;
    const targetValuation = phaseData.valuation.after;
    const targetEquity = phaseData.valuation.equity;

    const animationFrame = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setCurrentProgress(Math.floor(targetProgress * easeOut));
      setCurrentValuation(Math.floor(phaseData.valuation.before + (targetValuation - phaseData.valuation.before) * easeOut));
      setCurrentEquity(Math.floor(targetEquity * easeOut));

      if (progress < 1) {
        requestAnimationFrame(animationFrame);
      }
    };

    requestAnimationFrame(animationFrame);
  }, [currentPhaseIndex, phaseData]);

  const formatValue = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${Math.floor(value / 1000)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 to-indigo-600 flex flex-col">
      
      {/* Progress Bar */}
      <div className="h-2 bg-purple-800">
        <div 
          className="h-full bg-yellow-400 transition-all duration-1000"
          style={{ width: `${((currentPhaseIndex + 1) / PHASES.length) * 100}%` }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="max-w-6xl w-full">
          
          {!journeyComplete ? (
            <>
              {/* Phase Title */}
              <div className="text-center mb-12">
                <h1 className="text-4xl font-black text-white mb-2">{phaseData.title}</h1>
                <p className="text-purple-200">Phase {currentPhaseIndex + 1} of {PHASES.length}</p>
              </div>

              {/* Dashboard Stats */}
              <div className="grid grid-cols-4 gap-12 items-center">
                
                {/* EQUITY */}
                <div className="text-center">
                  <div className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Equity</div>
                  <div className="text-6xl font-black text-gray-100">
                    {currentEquity}%
                  </div>
                </div>

                {/* VALUATION */}
                <div className="text-center">
                  <div className="text-sm font-bold text-yellow-300 mb-3 uppercase tracking-wider">Valuation</div>
                  <div className="text-6xl font-black text-yellow-400">
                    {formatValue(currentValuation)}
                  </div>
                </div>

                {/* PROGRESS */}
                <div className="text-center">
                  <div className="text-sm font-bold text-green-300 mb-3 uppercase tracking-wider">Progress</div>
                  <div className="text-6xl font-black text-green-400">
                    {currentProgress}%
                  </div>
                </div>

                {/* CLOCK */}
                <div className="flex justify-center">
                  <svg viewBox="0 0 200 200" className="w-56 h-56">
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
                        transform: `rotate(${phaseData.clockRotation}deg)`,
                        transformOrigin: '100px 100px',
                        transition: 'transform 5s cubic-bezier(0.4, 0.0, 0.2, 1)'
                      }}
                    />
                    <circle cx="100" cy="100" r="4" fill="rgba(156, 163, 175, 0.8)" />
                  </svg>
                </div>
              </div>
            </>
          ) : (
            /* Journey Complete */
            <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="text-8xl mb-6">🎉</div>
              <h1 className="text-6xl font-black text-white mb-4">Journey Complete!</h1>
              <p className="text-2xl text-purple-200 mb-8">You've experienced all phases of StartZig</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-white text-purple-600 font-bold px-8 py-4 rounded-xl text-xl hover:bg-purple-50 transition-colors"
              >
                Watch Again
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Phase Indicators */}
      <div className="bg-purple-800 px-8 py-4">
        <div className="flex items-center justify-center gap-3">
          {PHASES.map((phase, index) => (
            <div 
              key={phase}
              className={`w-3 h-3 rounded-full transition-all duration-500 ${
                index <= currentPhaseIndex ? 'bg-white scale-150' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
