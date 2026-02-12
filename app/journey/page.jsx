"use client"
import React, { useState, useEffect } from 'react';
import { X, Play, Pause, SkipBack, SkipForward } from 'lucide-react';

// All 5 phases data
const PHASES = ['idea', 'business_plan', 'mvp', 'mlp', 'beta'];

const PHASE_DATA = {
  idea: {
    title: "IDEA Phase",
    emoji: "💡",
    progressPercent: 20,
    clockRotation: 0,
    valuation: { before: 0, after: 250000, equity: 100, capitalInjection: 15000 }
  },
  business_plan: {
    title: "PLAN Phase",
    emoji: "📊",
    progressPercent: 40,
    clockRotation: 72,
    valuation: { before: 250000, after: 500000, equity: 100, capitalInjection: 0 }
  },
  mvp: {
    title: "MVP Phase",
    emoji: "🛠️",
    progressPercent: 60,
    clockRotation: 144,
    valuation: { before: 500000, after: 1000000, equity: 90, capitalInjection: 50000 }
  },
  mlp: {
    title: "MLP Phase",
    emoji: "🚀",
    progressPercent: 80,
    clockRotation: 216,
    valuation: { before: 1000000, after: 2500000, equity: 75, capitalInjection: 100000 }
  },
  beta: {
    title: "BETA Phase",
    emoji: "🎯",
    progressPercent: 100,
    clockRotation: 288,
    valuation: { before: 2500000, after: 5000000, equity: 65, capitalInjection: 250000 }
  }
};

export default function StartZigJourney({ isOpen, onClose }) {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentValuation, setCurrentValuation] = useState(0);
  const [currentEquity, setCurrentEquity] = useState(0);

  const currentPhase = PHASES[currentPhaseIndex];
  const phaseData = PHASE_DATA[currentPhase];

  // Auto-play through phases
  useEffect(() => {
    if (!isPlaying || !isOpen) return;

    const phaseTimer = setTimeout(() => {
      if (currentPhaseIndex < PHASES.length - 1) {
        setCurrentPhaseIndex(prev => prev + 1);
      } else {
        setIsPlaying(false); // Stop at the end
      }
    }, 6000); // 5 seconds animation + 1 second pause

    return () => clearTimeout(phaseTimer);
  }, [isPlaying, currentPhaseIndex, isOpen]);

  // Animate numbers when phase changes
  useEffect(() => {
    if (!isOpen) return;

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
  }, [currentPhaseIndex, isOpen, phaseData]);

  const formatValue = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${Math.floor(value / 1000)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handlePrevious = () => {
    if (currentPhaseIndex > 0) {
      setCurrentPhaseIndex(prev => prev - 1);
      setIsPlaying(false);
    }
  };
  const handleNext = () => {
    if (currentPhaseIndex < PHASES.length - 1) {
      setCurrentPhaseIndex(prev => prev + 1);
      setIsPlaying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="h-full flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">StartZig Journey</h1>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Timeline */}
        <div className="bg-gradient-to-r from-purple-700 to-indigo-700 px-8 py-6">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {PHASES.map((phase, index) => (
              <div key={phase} className="flex items-center">
                <div className="text-center">
                  <div 
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-500 ${
                      index <= currentPhaseIndex 
                        ? 'bg-white text-purple-600 scale-110' 
                        : 'bg-white/20 text-white/50'
                    }`}
                  >
                    {PHASE_DATA[phase].emoji}
                  </div>
                  <div className={`mt-2 text-sm font-semibold ${
                    index === currentPhaseIndex ? 'text-yellow-300' : 'text-white/70'
                  }`}>
                    {PHASE_DATA[phase].title}
                  </div>
                </div>
                {index < PHASES.length - 1 && (
                  <div className={`w-24 h-1 mx-4 transition-all duration-500 ${
                    index < currentPhaseIndex ? 'bg-white' : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Display */}
        <div className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-12 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            
            {/* Phase Title */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-white">{phaseData.title} Complete!</h2>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-4 gap-12 items-center mb-8">
              
              {/* EQUITY */}
              <div className="text-center">
                <div className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Equity</div>
                <div className="text-5xl font-black text-gray-100">
                  {currentEquity}%
                </div>
              </div>

              {/* VALUATION */}
              <div className="text-center">
                <div className="text-sm font-bold text-yellow-300 mb-3 uppercase tracking-wider">Valuation</div>
                <div className="text-5xl font-black text-yellow-400">
                  {formatValue(currentValuation)}
                </div>
              </div>

              {/* PROGRESS */}
              <div className="text-center">
                <div className="text-sm font-bold text-green-300 mb-3 uppercase tracking-wider">Progress</div>
                <div className="text-5xl font-black text-green-400">
                  {currentProgress}%
                </div>
              </div>

              {/* CLOCK */}
              <div className="flex justify-center">
                <svg viewBox="0 0 200 200" className="w-48 h-48">
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

            {/* Journey Complete Message */}
            {currentPhaseIndex === PHASES.length - 1 && !isPlaying && (
              <div className="text-center mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-4xl font-black text-white mb-2">Journey Complete!</h3>
                <p className="text-xl text-purple-200">You've completed all phases of StartZig</p>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gradient-to-r from-purple-700 to-indigo-700 px-8 py-6">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentPhaseIndex === 0}
              className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <SkipBack className="w-6 h-6 text-white" />
            </button>

            {!isPlaying ? (
              <button
                onClick={handlePlay}
                className="w-16 h-16 rounded-full bg-white hover:bg-white/90 transition-all flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                <Play className="w-8 h-8 text-purple-600 ml-1" />
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="w-16 h-16 rounded-full bg-white hover:bg-white/90 transition-all flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                <Pause className="w-8 h-8 text-purple-600" />
              </button>
            )}

            <button
              onClick={handleNext}
              disabled={currentPhaseIndex === PHASES.length - 1}
              className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <SkipForward className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
