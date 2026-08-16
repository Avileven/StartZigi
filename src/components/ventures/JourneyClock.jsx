"use client";
// [FIX 020826] Rebuilt using the actual working clock implementation found
// in the homepage file (page.jsx's PhaseClock, an auto-cycling marketing
// demo) — same fixed SVG coordinates (viewBox 0 0 320 320), not the earlier
// version of this file, which tried to manually recompute font sizes at
// smaller pixel sizes and came out distorted. This version stays
// undistorted at any size because it relies on the browser's native SVG
// scaling (viewBox + a responsive width via CSS), not on recalculated
// pixel math. Per this session's decision: show it full-size and
// responsive for now — a genuinely compact version is a later, separate
// piece of work, not attempted here.
import React from 'react';

const PHASE_HEX_COLORS = {
  idea: '#10b981',
  business_plan: '#f97316',
  mvp: '#3b82f6',
  mlp: '#a855f7',
  beta: '#ec4899',
  growth: '#eab308',
};

const PHASES = ['idea', 'business_plan', 'mvp', 'mlp', 'beta', 'growth'];
const LABELS = ['IDEA', 'PLAN', 'MVP', 'MLP', 'BETA', 'GROWTH'];
const POSITIONS = [{ x: 160, y: 64 }, { x: 247, y: 112 }, { x: 247, y: 216 }, { x: 160, y: 260 }, { x: 73, y: 216 }, { x: 73, y: 112 }];
const ROTATIONS = [0, 60, 120, 180, 240, 300];

export default function JourneyClock({ currentPhase, maxWidth = 320 }) {
  const phaseIndex = Math.max(0, PHASES.indexOf(currentPhase));
  const activeColor = PHASE_HEX_COLORS[currentPhase] || PHASE_HEX_COLORS.idea;
  const seg = 879 / 6;
  const arcOffset = 879 - seg * (phaseIndex + 1);
  const rotation = ROTATIONS[phaseIndex];
  const nextLabel = LABELS[(phaseIndex + 1) % LABELS.length];

  return (
    <div className="flex flex-col items-center" style={{ width: '100%', maxWidth: `${maxWidth}px`, margin: '0 auto' }}>
      <svg width="100%" viewBox="0 0 320 320" style={{ display: 'block' }}>
        <circle cx="160" cy="160" r="140" fill="#F6F7FB" stroke="#E9E9F0" strokeWidth="1.5" />
        <circle
          cx="160" cy="160" r="140" fill="none" stroke={activeColor} strokeWidth="12" strokeLinecap="round"
          strokeDasharray="879" strokeDashoffset={arcOffset}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '160px 160px', transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1), stroke 1.5s ease' }}
        />
        <circle cx="160" cy="160" r="60" fill="#EFEFF7" />
        {LABELS.map((label, i) => (
          <text
            key={i}
            x={POSITIONS[i].x} y={POSITIONS[i].y}
            fontSize={PHASES[i] === currentPhase ? '13' : '11'}
            fill={PHASES[i] === currentPhase ? PHASE_HEX_COLORS[PHASES[i]] : '#9CA3AF'}
            textAnchor="middle"
            fontWeight={PHASES[i] === currentPhase ? '800' : '600'}
            fontFamily="Inter, sans-serif"
          >
            {label}
          </text>
        ))}
        <path
          fill="#4C3FA8"
          d="M158 160 L162 160 L162 75 L158 75 Z"
          style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '160px 160px', transition: 'transform 1.5s cubic-bezier(0.4,0,0.2,1)' }}
        />
        <circle cx="160" cy="160" r="6" fill="#3457D5" />
      </svg>
      <p className="text-gray-500 text-sm mt-2">Next: {nextLabel}</p>
    </div>
  );
}
