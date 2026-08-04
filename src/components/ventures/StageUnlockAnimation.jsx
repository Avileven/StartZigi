"use client";
// [ADDED 020826] New lightweight component replacing the old
// PhaseCompletionModal "Achievements/Next Challenges" slide content for
// Group 1 stage transitions (Spark/Plan/Shape/Beta). Deliberately NOT reusing
// PhaseCompletionModal.jsx's two-column layout — per the founder's explicit
// decision, that content is dropped. This is a simple, auto-dismissing
// stage-unlock animation: a ring fills in around the stage name (colored to
// match, muted for early stages, richer for later ones), with an
// "Achievement unlocked" caption. Shows for ~10 seconds, then calls
// onComplete so the caller (dashboard/page.jsx) can hide it and mark the
// triggering VentureMessage as dismissed — reusing that existing,
// already-correct show-once logic (is_dismissed + 24h freshness window),
// not rebuilding it.
import React, { useEffect, useRef, useState } from "react";

// Same phase -> Group 1 tag mapping used elsewhere (product-feedback-page.jsx,
// my-account-page.jsx) — kept in sync so "Stage" reads the same everywhere.
const STAGE_ORDER = ["Spark", "Plan", "Shape", "Beta"];
const STAGE_COLORS = {
  Spark: "#CEE8DE",
  Plan: "#9FE1CB",
  Shape: "#5DCAA5",
  Beta: "#1D9E75",
};

const CIRCUMFERENCE = 2 * Math.PI * 52; // r=52, matches the SVG circle below

export default function StageUnlockAnimation({ stageName, onComplete, displayMs = 10000 }) {
  const [dashoffset, setDashoffset] = useState(CIRCUMFERENCE);
  const timeoutRef = useRef(null);

  const color = STAGE_COLORS[stageName] || STAGE_COLORS.Spark;

  useEffect(() => {
    // Kick off the fill animation on mount (next frame, so the initial
    // "empty" state actually paints before transitioning).
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setDashoffset(0));
    });

    // Auto-dismiss after displayMs (~10s default).
    timeoutRef.current = setTimeout(() => {
      onComplete?.();
    }, displayMs);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeoutRef.current);
    };
  }, [displayMs, onComplete]);

  if (!STAGE_ORDER.includes(stageName)) return null;

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
              stroke={color}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashoffset}
              style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.65, 0, 0.35, 1)" }}
            />
          </svg>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">Stage</span>
            <span className="text-lg font-medium" style={{ color }}>
              {stageName}
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-500">Achievement unlocked</p>
      </div>
    </div>
  );
}
