// FEEDBACK 090426
"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

const PHASES = [
  {
    key: "mvp",
    label: "MVP Phase",
    stats: [
      { icon: "💬", num: 12, label: "Total Feedback" },
      { icon: "📈", num: 3,  label: "Features Analyzed" },
      { icon: "💡", num: 2,  label: "Suggested Features" },
      { icon: "👥", num: 0,  label: "Beta Sign-ups" },
    ],
    features: [
      { name: "Daily Craving Tracker", color: "#22c55e", score: "8.4", tag: "Essential",    tagBg: "#d1fae5", tagColor: "#065f46", barColor: "#22c55e", barPct: 85, breakdown: [0,  5,  15, 80] },
      { name: "AI Coach Messages",     color: "#6366f1", score: "7.1", tag: "Nice to have", tagBg: "#e0e7ff", tagColor: "#3730a3", barColor: "#6366f1", barPct: 70, breakdown: [5,  10, 65, 20] },
      { name: "Social Check-ins",      color: "#f59e0b", score: "4.2", tag: "Confusing",    tagBg: "#fef9c3", tagColor: "#854d0e", barColor: "#f59e0b", barPct: 42, breakdown: [15, 55, 25,  5] },
    ],
    feedbackTitle: "MVP Feature Feedback",
    feedbacks: [
      { initials: "JM", color: "#6366f1", name: "James M.", date: "Mar 12, 2026", text: "The craving tracker is exactly what I needed. Simple and effective. Would love push notifications when I log a craving." },
      { initials: "SR", color: "#ec4899", name: "Sara R.",  date: "Mar 10, 2026", text: "AI coach messages feel generic. I want it to know my specific triggers — work stress and coffee breaks are my worst times." },
    ],
    suggested: [
      { name: "Breathing Exercise Module", by: "by james.m@gmail.com" },
      { name: "Weekly Progress Report",    by: "by sara.r@outlook.com" },
    ],
  },
  {
    key: "mlp",
    label: "MLP Phase",
    stats: [
      { icon: "💬", num: 31, label: "Total Feedback" },
      { icon: "📈", num: 5,  label: "Features Analyzed" },
      { icon: "💡", num: 4,  label: "Suggested Features" },
      { icon: "👥", num: 0,  label: "Beta Sign-ups" },
    ],
    features: [
      { name: "Daily Craving Tracker",    color: "#22c55e", score: "9.1", tag: "Essential",    tagBg: "#d1fae5", tagColor: "#065f46", barColor: "#22c55e", barPct: 92, breakdown: [0, 2,  8,  90] },
      { name: "Personalized AI Coach",    color: "#6366f1", score: "8.6", tag: "Essential",    tagBg: "#d1fae5", tagColor: "#065f46", barColor: "#6366f1", barPct: 86, breakdown: [2, 5,  10, 83] },
      { name: "Community Support Feed",   color: "#ec4899", score: "7.8", tag: "Nice to have", tagBg: "#e0e7ff", tagColor: "#3730a3", barColor: "#ec4899", barPct: 78, breakdown: [3, 8,  45, 44] },
    ],
    feedbackTitle: "MLP User Feedback",
    feedbacks: [
      { initials: "DK", color: "#0ea5e9", name: "David K.", date: "Apr 1, 2026",  text: "The AI coach finally feels personal. It remembered I mentioned work stress last week and checked in on a Monday morning. That level of awareness is what makes this special." },
      { initials: "NG", color: "#22c55e", name: "Noa G.",   date: "Mar 28, 2026", text: "Community feed is good but I only want to see people at my same quit stage. Random posts from day 1 when I'm on day 60 feel irrelevant." },
    ],
    suggested: [
      { name: "Nicotine Replacement Tracker", by: "by david.k@gmail.com" },
      { name: "Doctor Consultation Booking",  by: "by noa.g@gmail.com" },
      { name: "Family Accountability Mode",   by: "by mike.t@hotmail.com" },
    ],
  },
  {
    key: "beta",
    label: "Beta Phase",
    stats: [
      { icon: "💬", num: 58, label: "Total Feedback" },
      { icon: "📈", num: 6,  label: "Features Analyzed" },
      { icon: "💡", num: 6,  label: "Suggested Features" },
      { icon: "👥", num: 47, label: "Beta Sign-ups" },
    ],
    features: [
      { name: "Daily Craving Tracker",    color: "#22c55e", score: "9.4", tag: "Essential", tagBg: "#d1fae5", tagColor: "#065f46", barColor: "#22c55e", barPct: 94, breakdown: [0, 1,  5,  94] },
      { name: "Personalized AI Coach",    color: "#6366f1", score: "9.0", tag: "Essential", tagBg: "#d1fae5", tagColor: "#065f46", barColor: "#6366f1", barPct: 90, breakdown: [1, 2,  8,  89] },
      { name: "Smart Relapse Prevention", color: "#f59e0b", score: "8.3", tag: "Essential", tagBg: "#d1fae5", tagColor: "#065f46", barColor: "#f59e0b", barPct: 83, breakdown: [2, 5,  12, 81] },
    ],
    feedbackTitle: "Beta User Feedback",
    feedbacks: [
      { initials: "AL", color: "#6366f1", name: "Amy L.", date: "Apr 5, 2026", text: "47 days smoke-free and QuitAI is the only app that kept me going. The relapse prevention alert on Friday evenings literally stopped me three times." },
      { initials: "TW", color: "#0ea5e9", name: "Tom W.", date: "Apr 3, 2026", text: "I gave this to 6 friends who are trying to quit. All of them stayed on it past day 10 which is usually when everyone drops off. The AI nudges are the key differentiator." },
    ],
    suggested: [
      { name: "Nicotine Replacement Tracker", by: "by amy.l@gmail.com" },
      { name: "Doctor Consultation Booking",  by: "by tom.w@gmail.com" },
      { name: "Family Accountability Mode",   by: "by maria.r@hotmail.com" },
    ],
    testers: [
      { initials: "AL", color: "#6366f1", name: "Amy L.",   date: "Mar 8, 2026", msg: '"I\'ve tried 4 apps. This one actually works."' },
      { initials: "TW", color: "#0ea5e9", name: "Tom W.",   date: "Mar 7, 2026", msg: '"Shared with 6 friends. All still active."' },
      { initials: "MR", color: "#ec4899", name: "Maria R.", date: "Mar 5, 2026", msg: '"The AI timing is uncanny. It knows when I\'m vulnerable."' },
    ],
  },
];

const BADGE_COLORS = {
  mvp:  { bg: "#dbeafe", color: "#1d4ed8" },
  mlp:  { bg: "#ede9fe", color: "#6d28d9" },
  beta: { bg: "#d1fae5", color: "#065f46" },
};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

export default function FeedbackMockup({ autoStart = false }) {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [isDone, setIsDone] = useState(false);
  if (!autoStart) {
    const p = PHASES[0];
    const badge = BADGE_COLORS[p.key];
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link href="/feedback-mockup" className="block relative group cursor-pointer">
          <div style={{ pointerEvents: "none", userSelect: "none", background: "#f8f9fb", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ background: "#fff", padding: "20px 24px 16px", textAlign: "center", borderBottom: "1px solid #e5e7eb" }}>
              <div style={{ display: "inline-block", fontSize: 10, fontWeight: 700, padding: "3px 12px", borderRadius: 20, marginBottom: 8, background: badge.bg, color: badge.color }}>{p.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#111", marginBottom: 2 }}>Venture Feedback Hub</div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>QuitAI · All feedback collected across your startup journey</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", background: "#fff", borderBottom: "1px solid #e5e7eb" }}>
              {p.stats.map((s, i) => (
                <div key={i} style={{ padding: "14px 10px", textAlign: "center" }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#111" }}>{s.num}</div>
                  <div style={{ fontSize: 10, color: "#9ca3af" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110" style={{ background: "rgba(108,71,255,0.9)" }}>
              <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  const hasStarted = useRef(false);
  const activeRef = useRef(false);

  useEffect(() => {
    if (autoStart && !hasStarted.current) {
      hasStarted.current = true;
      activeRef.current = true;
      setIsDone(false);
      runLoop();
    }
  }, [autoStart]);

  function replay(e) {
    e.preventDefault();
    e.stopPropagation();
    activeRef.current = false;
    hasStarted.current = false;
    setIsDone(false);
    setPhaseIdx(0);
    hasStarted.current = true;
    activeRef.current = true;
    runLoop();
  }

  async function runLoop() {
    for (let i = 0; i < PHASES.length; i++) {
      if (!activeRef.current) return;
      setPhaseIdx(i);
      await sleep(6000);
    }
    if (activeRef.current) setIsDone(true);
  }

  const p = PHASES[phaseIdx];
  const badge = BADGE_COLORS[p.key];

  return (
    <div className="flex justify-center px-6">
      <div style={{ background: "#f8f9fb", borderRadius: 14, maxWidth: 720, width: "100%", overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }}>

        {/* Header */}
        <div style={{ background: "#fff", padding: "20px 24px 16px", textAlign: "center", borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ display: "inline-block", fontSize: 10, fontWeight: 700, padding: "3px 12px", borderRadius: 20, marginBottom: 8, background: badge.bg, color: badge.color }}>
            {p.label}
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#111", marginBottom: 2 }}>Venture Feedback Hub</div>
          <div style={{ fontSize: 11, color: "#6b7280" }}>QuitAI · All feedback collected across your startup journey</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 10, border: "1px solid #e5e7eb", borderRadius: 8, padding: "5px 14px", fontSize: 11, color: "#6c47ff", fontWeight: 600 }}>
            💬 Mentor
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", background: "#fff", borderBottom: "1px solid #e5e7eb" }}>
          {p.stats.map((s, i) => (
            <div key={i} style={{ padding: "14px 10px", textAlign: "center", borderRight: i < 3 ? "1px solid #f0f0f0" : "none" }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#111" }}>{s.num}</div>
              <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Feature Ratings */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#111", paddingLeft: 10, borderLeft: "3px solid #6c47ff", marginBottom: 10 }}>MVP Feature Ratings</div>
            {p.features.map((f, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "12px 14px", border: "1px solid #e5e7eb", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, color: "#111" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: f.color, flexShrink: 0 }} />
                    {f.name}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ color: "#f59e0b", fontSize: 12 }}>★</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>{f.score} /10</span>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: f.tagBg, color: f.tagColor }}>{f.tag}</span>
                  </div>
                </div>
                <div style={{ height: 8, background: "#f3f4f6", borderRadius: 4, overflow: "hidden", marginBottom: 6 }}>
                  <div style={{ height: "100%", width: `${f.barPct}%`, background: f.barColor, borderRadius: 4 }} />
                </div>
                <div style={{ display: "flex", gap: 10, fontSize: 9, color: "#9ca3af" }}>
                  {[["#ef4444","Never use",0],["#f59e0b","Confusing",1],["#6366f1","Nice to have",2],["#22c55e","Essential",3]].map(([c,l,idx]) => (
                    <span key={l} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c, display: "inline-block" }} />
                      {l} {f.breakdown[idx]}%
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Feedback */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#111", paddingLeft: 10, borderLeft: "3px solid #6c47ff", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
              {p.feedbackTitle}
              <span style={{ fontSize: 10, fontWeight: 700, background: "#ede9fe", color: "#6c47ff", padding: "2px 8px", borderRadius: 12 }}>{p.feedbacks.length}</span>
            </div>
            {p.feedbacks.map((f, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "12px 14px", border: "1px solid #e5e7eb", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: f.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{f.initials}</div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#111" }}>{f.name}</div>
                    <div style={{ fontSize: 9, color: "#9ca3af" }}>{f.date}</div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "#4b5563", lineHeight: 1.5 }}>{f.text}</div>
              </div>
            ))}
          </div>

          {/* Suggested */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#111", paddingLeft: 10, borderLeft: "3px solid #6c47ff", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
              Suggested Features
              <span style={{ fontSize: 10, fontWeight: 700, background: "#ede9fe", color: "#6c47ff", padding: "2px 8px", borderRadius: 12 }}>{p.suggested.length}</span>
            </div>
            <div style={{ background: "#fff", borderRadius: 10, padding: "12px 14px", border: "1px solid #e5e7eb" }}>
              {p.suggested.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < p.suggested.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <span style={{ fontSize: 16 }}>💡</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#111" }}>{s.name}</div>
                    <div style={{ fontSize: 10, color: "#9ca3af" }}>{s.by}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Beta Testers */}
          {p.testers && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111", paddingLeft: 10, borderLeft: "3px solid #6c47ff", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                Beta Sign-ups
                <span style={{ fontSize: 10, fontWeight: 700, background: "#ede9fe", color: "#6c47ff", padding: "2px 8px", borderRadius: 12 }}>{p.stats[3].num}</span>
              </div>
              <div style={{ background: "#fff", borderRadius: 10, padding: "12px 14px", border: "1px solid #e5e7eb" }}>
                {p.testers.map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: i < p.testers.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: t.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{t.initials}</div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#111" }}>{t.name}</div>
                      <div style={{ fontSize: 10, color: "#9ca3af" }}>{t.date}</div>
                      <div style={{ fontSize: 10, color: "#6b7280", fontStyle: "italic" }}>{t.msg}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {isDone && (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <button type="button" onClick={replay} style={{ background: "rgba(108,71,255,0.1)", border: "1px solid rgba(108,71,255,0.3)", color: "#6c47ff", fontSize: 12, fontWeight: 600, padding: "8px 24px", borderRadius: 20, cursor: "pointer" }}>↺ Replay</button>
          </div>
        )}
      </div>
    </div>
  );
}