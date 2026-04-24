// ZIGPLAN MOCKUP 110426
"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

const VENTURE = {
  name: "MindBridge",
  description: "An AI-powered platform that helps people understand and improve their mental wellness through daily check-ins, personalized insights, and evidence-based exercises.",
};

const FEATURES = [
  { name: "User Profile", priority: "Must Have", color: "#7c3aed", bg: "#f5f3ff" },
  { name: "AI Mental Mentor", priority: "Must Have", color: "#7c3aed", bg: "#f5f3ff" },
  { name: "Daily Check-in", priority: "Must Have", color: "#7c3aed", bg: "#f5f3ff" },
  { name: "Communities", priority: "Nice to Have", color: "#f59e0b", bg: "#fffbeb" },
];

const CHOICES = [
  { label: "Goal", value: "Investor / Partner Pitch", icon: "🎯" },
  { label: "Platform", value: "Web", icon: "🌐" },
  { label: "Audience", value: "B2C", icon: "👥" },
  { label: "Dev Approach", value: "Vibe Coding — via a platform", icon: "💻" },
  { label: "Scale", value: "Early users (up to 100)", icon: "📈" },
  { label: "Infrastructure", value: "Auth + AI Integration", icon: "🔐" },
];

const DEMO_OUTPUT = `## 1. EXECUTIVE SUMMARY

The MindBridge prototype will focus on showcasing the core "Profile" and "AI Mental Mentor" experiences with high visual quality and smooth UX. Estimated timeline: 3-4 weeks. Biggest risk: platform lock-in and the disposable nature of the prototype.

## 2. ANALYSIS BY PARAMETERS

**Goal: Investor / Partner Pitch**
Prioritize visual quality and intuitive UX flow. Mock data will simulate personalized insights. This prototype is disposable and cannot be evolved into production without a full rebuild.

**Platform: Web-First (Recommended)**
Attempting both platforms simultaneously risks shallow quality. Web-first is strongly recommended for maximum visual polish. Mobile deferred to V2.

**Dev Approach: Vibe Coding — via a platform**
Suitable for pitch goal but carries significant platform lock-in risk. Virtual databases cannot be upgraded or scaled beyond sandbox.

**Infrastructure: Auth + AI Integration**
🔐 Auth adds 2-4 days. Supabase Auth recommended.
🤖 AI Integration adds 2-3 days. Gemini offers a free tier — verify current limits at ai.google.dev before budgeting.

## 3. FEATURE ANALYSIS

**User Profile** — Medium — Must Have
Include. Foundational for personalized AI insights.

**AI Mental Mentor** — Medium — Must Have
Include. Core value proposition. Simplify to daily check-in + single AI response for V1.

**Communities** — Complex — Nice to Have
⚠️ Defer to V2. Adds realtime, moderation and backend complexity not needed for a pitch prototype.

## 4. READY-TO-USE AI PROMPT

Copy and paste this prompt directly into your AI coding tool:

---

Build me a wellness web app called MindBridge.

Purpose: An AI-powered platform that helps people understand and improve their mental wellness through daily check-ins and personalized insights.

Color scheme: primary #6699CC, secondary #A8DADC, background #F8F8F8, text #333333. Use Inter font. Style: clean, calming, modern with rounded corners.

Screens and features:
1. /auth — Sign Up and Log In with email/password via Supabase Auth. On sign-up redirect to /onboarding. On log-in redirect to /home.
2. /onboarding — Profile setup form: Age, Occupation, Wellness Goals (multi-select), Mental Health Background (optional textarea). Submit saves to Supabase and redirects to /home.
3. /home — Daily check-in prompt: mood slider (1-5) + text input (max 250 chars). Submit triggers AI response.
4. /ai-response — Displays personalized AI insight based on mood + text + profile goals. Shows mock 7-day mood chart. "Continue Chat" button leads to /ai-chat.
5. /ai-chat — Persistent chat with AI mentor. Calm, supportive persona.
6. /profile — View and edit profile data.

User flow:
/auth → /onboarding → /home → /ai-response → /ai-chat
                              ↓
                          /profile

Data models: users, profiles (age, occupation, wellness_goals, mental_health_background), checkins (mood_score, text_input), ai_chat_messages (sender_type, message_text, conversation_id).

Auth: Supabase Auth. Realtime: not required.`;

// Split output into lines for typing effect
const OUTPUT_LINES = DEMO_OUTPUT.split('\n');

const STAGES = ["product", "features", "choices", "generating", "output"];

export default function ZigPlanMockup({ autoStart = false }) {
  const [stageIdx, setStageIdx] = useState(0);
  const [visibleFeatures, setVisibleFeatures] = useState(0);
  const [visibleChoices, setVisibleChoices] = useState(0);
  const [outputLines, setOutputLines] = useState([]);
  const [isStarted, setIsStarted] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const outputRef = useRef(null);
  const stageRef = useRef(0);

  useEffect(() => {
    if (autoStart) {
      setIsStarted(true);
      stageRef.current = 0;
      setStageIdx(0);
      setIsDone(false);
    }
  }, [autoStart]);

  useEffect(() => {
    if (!isStarted) return;

    setVisibleFeatures(0);
    setVisibleChoices(0);
    setOutputLines([]);

    const stage = STAGES[stageIdx];

    if (stage === "product") {
      const t = setTimeout(() => {
        stageRef.current += 1;
        setStageIdx(1);
      }, 2000);
      return () => clearTimeout(t);
    }

    if (stage === "features") {
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setVisibleFeatures(i);
        if (i >= FEATURES.length) {
          clearInterval(interval);
          setTimeout(() => {
            stageRef.current += 1;
            setStageIdx(2);
          }, 1000);
        }
      }, 400);
      return () => clearInterval(interval);
    }

    if (stage === "choices") {
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setVisibleChoices(i);
        if (i >= CHOICES.length) {
          clearInterval(interval);
          setTimeout(() => {
            stageRef.current += 1;
            setStageIdx(3);
          }, 1200);
        }
      }, 350);
      return () => clearInterval(interval);
    }

    if (stage === "generating") {
      const t = setTimeout(() => {
        stageRef.current += 1;
        setStageIdx(4);
      }, 2000);
      return () => clearTimeout(t);
    }

    if (stage === "output") {
      let i = 0;
      const interval = setInterval(() => {
        setOutputLines(prev => [...prev, OUTPUT_LINES[i]]);
        i++;
        // Auto-scroll
        if (outputRef.current) {
          outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
        // Stop at the AI Prompt section
        if (i >= OUTPUT_LINES.length || OUTPUT_LINES[i]?.includes('Copy and paste this prompt')) {
          clearInterval(interval);
          // Scroll to show the prompt header
          setTimeout(() => {
            if (outputRef.current) {
              outputRef.current.scrollTop = outputRef.current.scrollHeight;
            }
            setIsDone(true);
          }, 500);
        }
      }, 60);
      return () => clearInterval(interval);
    }
  }, [stageIdx, isStarted]);

  function replay(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setIsDone(false);
    setStageIdx(0);
    stageRef.current = 0;
    setVisibleFeatures(0);
    setVisibleChoices(0);
    setOutputLines([]);
    setIsStarted(false);
    setTimeout(() => setIsStarted(true), 100);
  }

  const stage = STAGES[stageIdx];

  // ── Static preview (before autoStart) ────────────────────────────────────
  if (!autoStart) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link href="/zigplan-demo" className="block relative group cursor-pointer">

          {/* Mobile preview */}
          <div className="sm:hidden" style={{ height: 300, overflow: "hidden", borderRadius: 16, position: "relative", border: "0.5px solid #ddd", background: "#f8fafc" }}>
            <div style={{ pointerEvents: "none", userSelect: "none", padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#1a1a3e", marginBottom: 4 }}>MindBridge</div>
              <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 12 }}>AI wellness platform</div>
              {FEATURES.slice(0, 2).map(f => (
                <div key={f.name} style={{ background: f.bg, border: `1px solid ${f.color}`, borderRadius: 8, padding: "6px 10px", marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#1f2937" }}>{f.name}</span>
                  <span style={{ fontSize: 10, color: f.color, fontWeight: 600 }}>{f.priority}</span>
                </div>
              ))}
            </div>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(124,58,237,0.9)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(124,58,237,0.5)" }}>
                <div className="w-0 h-0 border-t-[9px] border-t-transparent border-l-[16px] border-l-white border-b-[9px] border-b-transparent ml-1"></div>
              </div>
            </div>
          </div>

          {/* Desktop preview */}
          <div className="hidden sm:block relative">
            <div style={{ pointerEvents: "none", userSelect: "none", padding: "24px 12px" }}>
              <div style={{ maxWidth: 860, margin: "0 auto", borderRadius: 14, overflow: "hidden", border: "0.5px solid #ddd", background: "#f8fafc" }}>
                <div style={{ background: "white", borderBottom: "0.5px solid #e8e8e8", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#1a1a3e" }}>ZigPlan</div>
                  <div style={{ fontSize: 11, color: "#7c3aed", fontWeight: 600 }}>Available exclusively on the Pro Founder plan and above.</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                  <div style={{ padding: 16, borderRight: "0.5px solid #e8e8e8" }}>
                    <div style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Product</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1f2937", marginBottom: 4 }}>{VENTURE.name}</div>
                    <div style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.5, marginBottom: 12 }}>{VENTURE.description.slice(0, 80)}...</div>
                    <div style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Features</div>
                    {FEATURES.map(f => (
                      <div key={f.name} style={{ background: f.bg, border: `1px solid ${f.color}30`, borderRadius: 8, padding: "6px 10px", marginBottom: 5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#1f2937" }}>{f.name}</span>
                        <span style={{ fontSize: 10, color: f.color, fontWeight: 700 }}>{f.priority}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: 16 }}>
                    <div style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Parameters</div>
                    {CHOICES.map(c => (
                      <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "0.5px solid #f3f4f6" }}>
                        <span style={{ fontSize: 14 }}>{c.icon}</span>
                        <div>
                          <div style={{ fontSize: 9, color: "#9ca3af", textTransform: "uppercase" }}>{c.label}</div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: "#1f2937" }}>{c.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110" style={{ background: "rgba(124,58,237,0.9)" }}>
                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
              </div>
            </div>
          </div>

        </Link>
      </div>
    );
  }

  // ── Animated demo ─────────────────────────────────────────────────────────
  return (
    <div style={{ padding: "24px 12px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto", borderRadius: 14, overflow: "hidden", border: "0.5px solid #ddd", background: "#f8fafc" }}>

        {/* Header */}
        <div style={{ background: "white", borderBottom: "0.5px solid #e8e8e8", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#1a1a3e" }}>ZigPlan</div>
          <div style={{ fontSize: 11, color: "#7c3aed", fontWeight: 600 }}>Available exclusively on the Pro Founder plan and above.</div>
        </div>

        {/* Body */}
        {stage !== "output" ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 380 }}>

            {/* Left — Product + Features */}
            <div style={{ padding: 16, borderRight: "0.5px solid #e8e8e8" }}>
              <div style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Your Product</div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#1f2937", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                  {VENTURE.name}
                  {stage !== "product" && <span style={{ fontSize: 9, color: "#22c55e", background: "#f0fdf4", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>✓</span>}
                </div>
                <div style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.5 }}>{VENTURE.description.slice(0, 100)}...</div>
              </div>

              {(stage === "features" || stage === "choices" || stage === "generating") && (
                <>
                  <div style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Features</div>
                  {FEATURES.slice(0, visibleFeatures).map(f => (
                    <div key={f.name} style={{ background: f.bg, border: `1.5px solid ${f.color}`, borderRadius: 8, padding: "7px 10px", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center", animation: "slideIn 0.3s ease" }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#1f2937" }}>{f.name}</span>
                      <span style={{ fontSize: 10, color: f.color, fontWeight: 700 }}>{f.priority}</span>
                    </div>
                  ))}
                </>
              )}

              {stage === "generating" && (
                <div style={{ marginTop: 16, background: "linear-gradient(135deg, #7c3aed, #a855f7)", borderRadius: 10, padding: "12px 16px", color: "white", textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>⚙️ Analyzing your product...</div>
                  <div style={{ fontSize: 11, opacity: 0.8 }}>This takes about 15-20 seconds</div>
                  <div style={{ marginTop: 8, height: 4, background: "rgba(255,255,255,0.2)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", background: "white", borderRadius: 4, animation: "progress 2s linear forwards" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Right — Choices */}
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Parameters</div>

              {(stage === "choices" || stage === "generating") && CHOICES.slice(0, visibleChoices).map(c => (
                <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "0.5px solid #f3f4f6", animation: "slideIn 0.3s ease" }}>
                  <span style={{ fontSize: 16 }}>{c.icon}</span>
                  <div>
                    <div style={{ fontSize: 9, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>{c.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#1f2937" }}>{c.value}</div>
                  </div>
                  <div style={{ marginLeft: "auto", width: 16, height: 16, borderRadius: "50%", background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "white", fontSize: 9, fontWeight: 900 }}>✓</span>
                  </div>
                </div>
              ))}

              {stage === "choices" && visibleChoices >= CHOICES.length && (
                <div style={{ marginTop: 16, background: "linear-gradient(135deg, #7c3aed, #a855f7)", borderRadius: 10, padding: "12px 16px", color: "white", textAlign: "center", animation: "slideIn 0.4s ease" }}>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>Generate Development Plan</div>
                  <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>20 credits</div>
                </div>
              )}
            </div>

          </div>
        ) : (
          /* Output */
          <div ref={outputRef} style={{ padding: 20, maxHeight: 420, overflowY: "auto" }}>
            {outputLines.map((line, i) => {
              if (line.startsWith('## ')) {
                return <div key={i} style={{ fontSize: 14, fontWeight: 800, color: "#4c1d95", marginTop: 18, marginBottom: 6, paddingBottom: 4, borderBottom: "1px solid #e9d5ff" }}>{line.replace('## ', '')}</div>;
              } else if (line.startsWith('**') && line.endsWith('**')) {
                return <div key={i} style={{ fontSize: 12, fontWeight: 700, color: "#1f2937", marginTop: 8, marginBottom: 2 }}>{line.replace(/\*\*/g, '')}</div>;
              } else if (line.startsWith('---')) {
                return <hr key={i} style={{ border: "none", borderTop: "0.5px solid #e5e7eb", margin: "10px 0" }} />;
              } else if (line.startsWith('⚠️') || line.startsWith('🔐') || line.startsWith('🤖')) {
                return <div key={i} style={{ fontSize: 11, color: "#d97706", background: "#fffbeb", padding: "4px 8px", borderRadius: 6, marginBottom: 3 }}>{line}</div>;
              } else if (line.trim()) {
                return <div key={i} style={{ fontSize: 11, color: "#374151", lineHeight: 1.6, marginBottom: 2 }}>{line}</div>;
              }
              return <div key={i} style={{ height: 6 }} />;
            })}
            {!isDone && <span style={{ display: "inline-block", width: 8, height: 14, background: "#7c3aed", borderRadius: 2, animation: "blink 0.8s infinite", verticalAlign: "middle", marginLeft: 2 }} />}
          </div>
        )}

      </div>

      {isDone && (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button type="button" onClick={replay} style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.4)", color: "#7c3aed", fontSize: 12, fontWeight: 600, padding: "8px 24px", borderRadius: 20, cursor: "pointer" }}>↺ Replay</button>
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes progress { from { width: 0%; } to { width: 100%; } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}
