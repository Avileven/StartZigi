"use client";
// [ADDED 020826] Insight Credits project, step 2 — fires when a logged-in
// founder successfully submits feedback (MVP or MLP). Deliberately matches
// StageUnlockAnimation.jsx's visual language (a ring fills in around a
// short label) so the two feel like the same reward system, not two
// different UI patterns. Unlike StageUnlockAnimation, this shows no number
// and no running total — per this session's decision, the balance itself
// belongs in My Account, not in this confirmation moment. Auto-dismisses
// after ~4 seconds (shorter than the 10s stage animation — this fires far
// more often, once per feedback submission, so it needs to be quick and
// unobtrusive, not a big moment).
import React, { useEffect, useState } from "react";

const INSIGHT_COLOR = "#EF9F27";
const CIRCUMFERENCE = 2 * Math.PI * 52; // r=52, matches the SVG circle below

export default function InsightEarnedAnimation({ onComplete, displayMs = 4000 }) {
  const [dashoffset, setDashoffset] = useState(CIRCUMFERENCE);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setDashoffset(0));
    });
    const timeout = setTimeout(() => {
      onComplete?.();
    }, displayMs);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
  }, [displayMs, onComplete]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3 bg-white rounded-2xl shadow-xl border border-gray-100 px-8 py-6 pointer-events-auto">
        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg width="112" height="112" className="absolute top-0 left-0 -rotate-90">
            <circle cx="56" cy="56" r="52" fill="none" stroke="#F1EFE8" strokeWidth="6" />
            <circle
              cx="56"
              cy="56"
              r="52"
              fill="none"
              stroke={INSIGHT_COLOR}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashoffset}
              style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.65, 0, 0.35, 1)" }}
            />
          </svg>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">Earned</span>
            <span className="text-lg font-medium" style={{ color: "#854F0B" }}>
              Insight
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
