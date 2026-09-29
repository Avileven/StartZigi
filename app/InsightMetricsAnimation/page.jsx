// [NEW] Home page demo of two Insight Metrics score cards (Business Model,
// Core Features) — mirrors the score-card design used in the real Growth AI
// dashboard (rounded card, colored border by satisfaction signal, gradient
// meter bar with a dot at the score's position). Values are fixed demo
// numbers (7 and 8), not live data — this is a marketing illustration, not
// a real venture's stats.
//
// Counts up from 0 and the meter dot slides into position once the section
// scrolls into view (matching the scroll-triggered pattern already used by
// SparkShapeShip on this page); the signal badge (Mixed / Strong) fades in
// only after the count finishes. The badge values follow the same 5-level
// scale as the real dashboard (<3 Poor, 3-5 Weak, 5-7.5 Mixed, 7.5-9 Strong,
// 9+ Elite) — 7 -> Mixed, 8 -> Strong.
//
// Place this file at: ./InsightMetricsAnimation/page.jsx (same pattern as
// ProductGrowthAnimation and CommunityAiFounderLoop), then import it in the
// home page with:
//   import InsightMetricsAnimation from "./InsightMetricsAnimation/page";
"use client";
import React, { useEffect, useRef, useState } from "react";

const METRICS = [
  { title: "Business Model", target: 7, accent: "#0F6E56", bg: "#ECFDF5", signal: "Mixed", signalColor: "#d97706" },
  { title: "Core Features", target: 8, accent: "#0369A1", bg: "#EFF6FF", signal: "Strong", signalColor: "#16a34a" },
];

function AnimatedMetricCard({ title, target, accent, bg, signal, signalColor, play }) {
  const [value, setValue] = useState(0);
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    if (!play) return;
    const duration = 1400;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setValue(eased * target);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setValue(target);
        setTimeout(() => setShowBadge(true), 150);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [play, target]);

  const displayValue = value.toFixed(1);
  const pct = Math.max(0, Math.min(100, value * 10));

  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3.5" style={{ background: bg, border: `2px solid ${signalColor}` }}>
      <span className="text-sm font-bold text-gray-700">{title}</span>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-extrabold text-gray-900">{displayValue}</span>
        <span className="text-sm text-gray-400">/ 10</span>
      </div>
      <span
        className="self-start text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded"
        style={{ color: signalColor, background: "rgba(255,255,255,0.6)", opacity: showBadge ? 1 : 0, transition: "opacity 0.4s ease" }}
      >
        {signal}
      </span>
      <div className="relative w-full rounded-full" style={{ height: 12, background: "linear-gradient(to right, #ef4444, #f59e0b, #22c55e)" }}>
        <div
          className="absolute rounded-full bg-white"
          style={{ top: "50%", left: `${pct}%`, transform: "translate(-50%, -50%)", width: 20, height: 20, border: `4px solid ${accent}`, boxShadow: "0 2px 6px rgba(0,0,0,0.25)" }}
        />
      </div>
    </div>
  );
}

export default function InsightMetricsAnimation({ className = "" }) {
  const [play, setPlay] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setPlay(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      <div className="rounded-[28px] p-[2px]" style={{ background: "linear-gradient(120deg, #818cf8, #c084fc, #f0abfc)" }}>
        <div className="rounded-[26px] bg-white p-6 sm:p-8">
          <div className="grid grid-cols-2 gap-4 sm:gap-5">
            {METRICS.map((m) => (
              <AnimatedMetricCard key={m.title} {...m} play={play} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
