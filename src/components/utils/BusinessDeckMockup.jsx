// BUSINESS DECK MOCKUP
"use client";
import React, { useState, useEffect, useRef } from "react";

const STEPS = [
  {
    key: "empty",
    label: "GENERATING",
    badge: { text: "Pro Founder", color: "#6c47ff", bg: "#f0edff" },
    sections: [],
    status: { text: "Analyzing your data across all stages...", color: "#6c47ff", dot: "#6c47ff" },
  },
  {
    key: "problem",
    label: "GENERATING",
    badge: { text: "Pro Founder", color: "#6c47ff", bg: "#f0edff" },
    sections: [
      { num: "1", title: "Executive Summary", text: "MindBridge is an AI-powered mental wellness platform targeting working professionals aged 25–45 experiencing stress and anxiety. A seed round of $1.2M is being raised to reach 10,000 paying users within 18 months.", done: false },
      { num: "2", title: "The Problem", text: "970 million people live with a mental health condition. Fewer than 30% receive treatment. Therapy costs $150–$300/session with 3–6 month waitlists. Existing apps are generic — they do not adapt, do not learn, and fail to retain users past day 7.", done: true },
    ],
    status: { text: "Writing sections...", color: "#f59e0b", dot: "#f59e0b" },
  },
  {
    key: "business_model",
    label: "GENERATING",
    badge: { text: "Pro Founder", color: "#6c47ff", bg: "#f0edff" },
    sections: [
      { num: "1", title: "Executive Summary", text: "MindBridge is an AI-powered mental wellness platform targeting working professionals aged 25–45 experiencing stress and anxiety. A seed round of $1.2M is being raised to reach 10,000 paying users within 18 months.", done: false },
      { num: "2", title: "The Problem", text: "970 million people live with a mental health condition. Fewer than 30% receive treatment. Therapy costs $150–$300/session with 3–6 month waitlists.", done: true },
      { num: "3", title: "The Solution", text: "MindBridge is a 3-minute daily AI check-in that learns your patterns, identifies triggers, and delivers personalized CBT-based exercises before a crisis develops. It is not a meditation app. It is a system that knows you.", done: true },
      { num: "6", title: "Business Model", text: "The company operates on a freemium model with premium subscription at $12.99/month. Based on current parameters, the company projects 9K total users by end of Year 1 with revenues of $73K, growing to 16K users by Year 2 with cumulative revenues of $291K.", done: true },
    ],
    status: { text: "Calculating revenue forecast...", color: "#f59e0b", dot: "#f59e0b" },
  },
  {
    key: "complete",
    label: "READY",
    badge: { text: "Pro Founder", color: "#16a34a", bg: "#f0fdf4" },
    sections: [
      { num: "1", title: "Executive Summary", text: "MindBridge is an AI-powered mental wellness platform delivering personalized daily check-ins and evidence-based exercises. The company is in Beta with 47 sign-ups and is raising $1.2M seed to reach 10,000 paying users in 18 months.", done: true },
      { num: "2", title: "The Problem", text: "970 million people live with a mental health condition. Fewer than 30% receive treatment. Therapy costs $150–$300/session with 3–6 month waitlists.", done: true },
      { num: "3", title: "The Solution", text: "A 3-minute daily AI check-in that learns your patterns and delivers personalized CBT-based exercises before a crisis develops.", done: true },
      { num: "6", title: "Business Model", text: "Freemium at $12.99/month. Projects 9K users and $73K revenue in Year 1, growing to 16K users and $291K cumulative by Year 2.", done: true },
      { num: "9", title: "The Ask", text: "MindBridge is seeking to raise $1.2M to fund the next 24 months of operations. Funds allocated: 45% product, 25% acquisition, 20% clinical validation, 10% operations.", done: true },
    ],
    status: { text: "Business plan ready — 9 sections generated", color: "#16a34a", dot: "#16a34a" },
  },
  {
    key: "mentor",
    label: "MENTOR REVIEW",
    badge: { text: "Pro Founder", color: "#6c47ff", bg: "#f0edff" },
    sections: [
      { num: "1", title: "Executive Summary", text: "MindBridge is an AI-powered mental wellness platform delivering personalized daily check-ins and evidence-based exercises. The company is in Beta with 47 sign-ups and is raising $1.2M seed to reach 10,000 paying users in 18 months.", done: true },
      { num: "2", title: "The Problem", text: "970 million people live with a mental health condition. Fewer than 30% receive treatment. Therapy costs $150–$300/session with 3–6 month waitlists.", done: true },
      { num: "6", title: "Business Model", text: "Freemium at $12.99/month. Projects 9K users and $73K revenue in Year 1, growing to 16K users and $291K cumulative by Year 2.", done: true },
    ],
    mentor: {
      score: "★★★★★★★☆☆☆",
      analysis: "Strong problem definition and clear unit economics. The business model section is well-structured with realistic projections.",
      improve: "Market Opportunity: Add TAM/SAM/SOM breakdown with sources. Competition section needs more differentiation depth.",
      missing: "No churn reduction strategy mentioned. Clinical validation timeline not specified.",
    },
    status: { text: "Mentor review complete", color: "#6c47ff", dot: "#6c47ff" },
  },
];

const NAV_ITEMS = ["Home", "Dashboard", "Exit Path", "Landing Page", "Beta Page", "Angel Arena", "VC Marketplace", "My Account"];

export default function BusinessDeckMockup({ autoStart = false }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [visibleSections, setVisibleSections] = useState([]);
  const [showMentor, setShowMentor] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const stepCountRef = useRef(0);

  const step = STEPS[stepIdx];

  useEffect(() => {
    if (autoStart) {
      setIsStarted(true);
      setStepIdx(0);
      stepCountRef.current = 0;
      setIsDone(false);
    }
  }, [autoStart]);

  useEffect(() => {
    if (!isStarted) return;
    setVisibleSections([]);
    setShowMentor(false);

    const sections = step.sections || [];
    sections.forEach((sec, i) => {
      setTimeout(() => {
        setVisibleSections(prev => [...prev, sec]);
      }, 300 + i * 600);
    });

    if (step.key === "mentor") {
      setTimeout(() => setShowMentor(true), 300 + sections.length * 600 + 400);
    }

    const totalTime = 300 + sections.length * 600 + (step.key === "mentor" ? 1800 : 1200);
    const nextStep = setTimeout(() => {
      stepCountRef.current += 1;
      if (stepCountRef.current < STEPS.length) {
        setStepIdx(prev => prev + 1);
      } else {
        setIsDone(true);
      }
    }, totalTime);

    return () => clearTimeout(nextStep);
  }, [stepIdx, isStarted]);

  function replay(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setIsDone(false);
    setStepIdx(0);
    stepCountRef.current = 0;
    setIsStarted(false);
    setVisibleSections([]);
    setShowMentor(false);
    setTimeout(() => setIsStarted(true), 100);
  }

  // Static preview (before start)
  if (!autoStart) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="relative group cursor-pointer" onClick={() => { setIsStarted(true); }}>
          {/* Mobile preview */}
          <div className="sm:hidden" style={{ height: 300, overflow: "hidden", borderRadius: 16, position: "relative", border: "0.5px solid #ddd" }}>
            <div style={{ pointerEvents: "none", userSelect: "none", background: "#f8f7ff" }}>
              <div style={{ background: "#fff", borderBottom: "0.5px solid #e8e8e8", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>Business Deck</div>
                <span style={{ background: "#f0edff", color: "#6c47ff", fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>Pro Founder</span>
              </div>
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 11, color: "#6c47ff", fontWeight: 600, marginBottom: 8 }}>MindBridge — Investor Business Plan</div>
                {STEPS[3].sections.slice(0, 3).map((s) => (
                  <div key={s.num} style={{ background: "#fff", border: "0.5px solid #e8e8e8", borderRadius: 8, padding: "8px 10px", marginBottom: 6 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#6c47ff", marginBottom: 3 }}>{s.num}. {s.title}</div>
                    <div style={{ fontSize: 10, color: "#777", lineHeight: 1.4 }}>{s.text.slice(0, 80)}...</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(108,71,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(108,71,255,0.5)" }}>
                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[17px] border-l-white border-b-[10px] border-b-transparent ml-1" />
              </div>
            </div>
          </div>

          {/* Desktop preview */}
          <div className="hidden sm:block relative">
            <div style={{ pointerEvents: "none", userSelect: "none" }}>
              <div style={{ maxWidth: 900, margin: "0 auto", borderRadius: 14, overflow: "hidden", border: "0.5px solid #ddd" }}>
                <div style={{ background: "#f8f7ff" }}>
                  {/* Top bar */}
                  <div style={{ background: "#fff", borderBottom: "0.5px solid #e8e8e8", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#111" }}>Business Deck — MindBridge</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ background: "#f0edff", color: "#6c47ff", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>READY</span>
                      <div style={{ background: "#6c47ff", color: "#fff", fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 8 }}>Download .docx</div>
                    </div>
                  </div>
                  {/* Body */}
                  <div style={{ display: "grid", gridTemplateColumns: "160px 1fr" }}>
                    {/* Nav */}
                    <div style={{ background: "#fff", borderRight: "0.5px solid #eee", padding: "12px 0" }}>
                      <div style={{ fontSize: 9, color: "#ccc", textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 14px 8px" }}>Navigation</div>
                      {NAV_ITEMS.map((item) => (
                        <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 14px", fontSize: 12, color: item === "Dashboard" ? "#6c47ff" : "#666", fontWeight: item === "Dashboard" ? 600 : 400, background: item === "Dashboard" ? "#f3f0ff" : "transparent" }}>
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: item === "Dashboard" ? "#6c47ff22" : "#f0f0f0", flexShrink: 0 }} />
                          {item}
                        </div>
                      ))}
                    </div>
                    {/* Document */}
                    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ textAlign: "center", paddingBottom: 12, borderBottom: "0.5px solid #eee" }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "#6c47ff" }}>MindBridge</div>
                        <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>Investor Business Plan · April 2026</div>
                      </div>
                      {STEPS[3].sections.map((s) => (
                        <div key={s.num} style={{ background: "#fff", border: "0.5px solid #e8e8e8", borderRadius: 8, padding: "8px 12px" }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#6c47ff", marginBottom: 4 }}>{s.num}. {s.title}</div>
                          <div style={{ fontSize: 10, color: "#555", lineHeight: 1.5 }}>{s.text.slice(0, 100)}...</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110" style={{ background: "rgba(108,71,255,0.9)" }}>
                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Animated version
  return (
    <div className="px-6">
      <div style={{ maxWidth: 900, margin: "0 auto", borderRadius: 14, overflow: "hidden", border: "0.5px solid #ddd" }}>
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <div style={{ minWidth: 600, background: "#f8f7ff" }}>

            {/* Top bar */}
            <div style={{ background: "#fff", borderBottom: "0.5px solid #e8e8e8", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#111" }}>Business Deck — MindBridge</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ background: step.badge.bg, color: step.badge.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, transition: "all 0.5s" }}>{step.label}</span>
                {step.key === "complete" || step.key === "mentor" ? (
                  <div style={{ background: "#6c47ff", color: "#fff", fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 8 }}>Download .docx</div>
                ) : (
                  <div style={{ background: "#f0f0f0", color: "#bbb", fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 8 }}>Generating...</div>
                )}
              </div>
            </div>

            {/* Body */}
            <div style={{ display: "grid", gridTemplateColumns: "160px 1fr" }}>

              {/* Nav */}
              <div style={{ background: "#fff", borderRight: "0.5px solid #eee", padding: "12px 0", display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 9, color: "#ccc", textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 14px 8px" }}>Navigation</div>
                {NAV_ITEMS.map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 14px", fontSize: 12, color: item === "Dashboard" ? "#6c47ff" : "#666", fontWeight: item === "Dashboard" ? 600 : 400, background: item === "Dashboard" ? "#f3f0ff" : "transparent" }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: item === "Dashboard" ? "#6c47ff22" : "#f0f0f0", flexShrink: 0 }} />
                    {item}
                  </div>
                ))}
                <div style={{ marginTop: "auto", borderTop: "0.5px solid #f0f0f0", padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#ede9ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "#6c47ff", flexShrink: 0 }}>S</div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 500, color: "#333" }}>sarah@mindbridge.io</div>
                    <div style={{ fontSize: 9, color: "#6c47ff", fontWeight: 600 }}>Pro Founder</div>
                  </div>
                </div>
              </div>

              {/* Document area */}
              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>

                {/* Status bar */}
                <div style={{ background: "#fff", border: `0.5px solid ${step.status.color}22`, borderRadius: 8, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: step.status.dot, flexShrink: 0 }} />
                  <div style={{ fontSize: 11, color: step.status.color, fontWeight: 600 }}>{step.status.text}</div>
                </div>

                {/* Document header */}
                {(step.key === "complete" || step.key === "mentor") && (
                  <div style={{ textAlign: "center", paddingBottom: 10, borderBottom: "0.5px solid #eee", animation: "deckFadeIn 0.5s ease" }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#6c47ff" }}>MindBridge</div>
                    <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>Investor Business Plan · April 2026</div>
                    <div style={{ fontSize: 10, color: "#ccc", marginTop: 1, fontStyle: "italic" }}>Confidential — Not for distribution</div>
                  </div>
                )}

                {/* Sections */}
                {visibleSections.map((s) => (
                  <div key={s.num} style={{ background: s.done ? "#fff" : "#fffbf0", border: `0.5px solid ${s.done ? "#e8e8e8" : "#f59e0b44"}`, borderRadius: 8, padding: "8px 12px", animation: "deckSlideIn 0.4s ease forwards" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#6c47ff" }}>{s.num}. {s.title}</div>
                      {s.done && <div style={{ fontSize: 9, color: "#16a34a", fontWeight: 600 }}>✓ DONE</div>}
                    </div>
                    <div style={{ fontSize: 10, color: "#555", lineHeight: 1.5 }}>{s.text}</div>
                  </div>
                ))}

                {/* Generating placeholders */}
                {step.key === "empty" && (
                  <>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ background: "#f0f0f8", borderRadius: 8, padding: "12px", animation: "deckPulse 1.5s ease infinite" }}>
                        <div style={{ height: 10, background: "#e0e0f0", borderRadius: 4, width: `${60 + i * 8}%`, marginBottom: 6 }} />
                        <div style={{ height: 8, background: "#e8e8f4", borderRadius: 4, width: "90%" }} />
                        <div style={{ height: 8, background: "#e8e8f4", borderRadius: 4, width: "75%", marginTop: 4 }} />
                      </div>
                    ))}
                  </>
                )}

                {/* Mentor review */}
                {showMentor && step.mentor && (
                  <div style={{ background: "#f5f0ff", border: "0.5px solid #6c47ff33", borderRadius: 10, padding: "12px", animation: "deckFadeIn 0.5s ease" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#6c47ff", marginBottom: 6 }}>Mentor Review</div>
                    <div style={{ fontSize: 18, letterSpacing: 2, color: "#6c47ff", marginBottom: 8 }}>{step.mentor.score}</div>
                    <div style={{ fontSize: 10, color: "#555", marginBottom: 6, lineHeight: 1.5 }}>{step.mentor.analysis}</div>
                    <div style={{ fontSize: 10, color: "#d97706", background: "#fffbf0", borderRadius: 6, padding: "6px 8px", marginBottom: 4 }}>
                      <span style={{ fontWeight: 600 }}>Improve: </span>{step.mentor.improve}
                    </div>
                    <div style={{ fontSize: 10, color: "#dc2626", background: "#fff5f5", borderRadius: 6, padding: "6px 8px" }}>
                      <span style={{ fontWeight: 600 }}>Missing: </span>{step.mentor.missing}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>

      {isDone && (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button type="button" onClick={replay} style={{ background: "rgba(108,71,255,0.15)", border: "1px solid rgba(108,71,255,0.4)", color: "#6c47ff", fontSize: 12, fontWeight: 600, padding: "8px 24px", borderRadius: 20, cursor: "pointer" }}>↺ Replay</button>
        </div>
      )}

      <style>{`
        @keyframes deckSlideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes deckFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes deckPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}
