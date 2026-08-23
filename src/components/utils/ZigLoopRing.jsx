"use client";
import React from 'react';

// [ADDED 020826] Converted from idea-to-product-ring.html, per this
// session's decision — replaces the plain text list under "The Zig Loop"
// on the Why StartZig page. Extended from 4 stages to 5 (Plan added before
// Build), positions recalculated for even 72-degree spacing.
export default function ZigLoopRing() {
  return (
    <div style={{ width: '100%', maxWidth: 420, margin: '0 auto' }}>
      <style>{`
        .zig-ring-sweep {
          animation: zigRingSpin 5s linear infinite;
          transform-origin: 190px 170px;
        }
        @keyframes zigRingSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .zig-ring-dot {
          transform-box: fill-box;
          transform-origin: center;
          animation: zigRingGrow 5s linear infinite;
        }
        .zig-dot-plan     { animation-delay: 0s; }
        .zig-dot-build    { animation-delay: 1s; }
        .zig-dot-feedback { animation-delay: 2s; }
        .zig-dot-analysis { animation-delay: 3s; }
        .zig-dot-update   { animation-delay: 4s; }
        @keyframes zigRingGrow {
          0%   { transform: scale(1); }
          4%   { transform: scale(1.8); }
          12%  { transform: scale(1.8); }
          22%  { transform: scale(1); }
          100% { transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .zig-ring-sweep, .zig-ring-dot {
            animation: none !important;
          }
        }
      `}</style>

      <svg viewBox="-20 -10 420 360" role="img" aria-label="The Zig Loop: a continuous cycle of plan, build, feedback, analysis, and update">

        <circle cx="190" cy="170" r="110" fill="none" stroke="#E5E3DC" strokeWidth="14" />

        <circle className="zig-ring-sweep" cx="190" cy="170" r="110" fill="none" stroke="#7F77DD"
          strokeWidth="14" strokeLinecap="round" strokeDasharray="70 621" />

        <circle cx="190" cy="170" r="62" fill="#FAFAF7" stroke="#E5E3DC" strokeWidth="1" />
        <text x="190" y="163" textAnchor="middle" fontSize="14" fontWeight="600" fill="#1A1A18">The Zig</text>
        <text x="190" y="181" textAnchor="middle" fontSize="14" fontWeight="600" fill="#1A1A18">Loop</text>

        {/* Plan */}
        <circle className="zig-ring-dot zig-dot-plan" cx="190" cy="60" r="9" fill="#534AB7" stroke="#ffffff" strokeWidth="2" />
        <text x="190" y="30" textAnchor="middle" fontSize="12" fontWeight="600" fill="#1A1A18">Plan</text>

        {/* Build */}
        <circle className="zig-ring-dot zig-dot-build" cx="295" cy="136" r="9" fill="#534AB7" stroke="#ffffff" strokeWidth="2" />
        <text x="313" y="130" textAnchor="start" dominantBaseline="central" fontSize="12" fontWeight="600" fill="#1A1A18">Build</text>

        {/* Feedback */}
        <circle className="zig-ring-dot zig-dot-feedback" cx="255" cy="259" r="9" fill="#534AB7" stroke="#ffffff" strokeWidth="2" />
        <text x="264" y="283" textAnchor="start" fontSize="12" fontWeight="600" fill="#1A1A18">Feedback</text>

        {/* Analysis */}
        <circle className="zig-ring-dot zig-dot-analysis" cx="125" cy="259" r="9" fill="#534AB7" stroke="#ffffff" strokeWidth="2" />
        <text x="116" y="283" textAnchor="end" fontSize="12" fontWeight="600" fill="#1A1A18">Analysis</text>

        {/* Update */}
        <circle className="zig-ring-dot zig-dot-update" cx="85" cy="136" r="9" fill="#D85A30" stroke="#ffffff" strokeWidth="2" />
        <text x="67" y="130" textAnchor="end" dominantBaseline="central" fontSize="12" fontWeight="600" fill="#1A1A18">Update</text>

      </svg>
    </div>
  );
}
