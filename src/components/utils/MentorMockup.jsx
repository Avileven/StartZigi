"use client";
import React, { useState, useEffect, useRef } from "react";

const RUNS = [
  {
    draft:
      "We built an AI app that helps patients find specialist doctors faster. The app uses some kind of matching algorithm and you can book appointments through it.",
    stars: 4,
    analysis:
      "Your draft communicates the basic concept but stays surface-level. The phrase 'some kind of matching algorithm' signals vagueness that will concern investors. What makes the matching intelligent? Speed alone is not a differentiator — dozens of platforms book appointments faster than clinics.",
    hints:
      "Define the AI mechanism in one sentence. Quantify the improvement: how much faster? Anchor it to a specific patient pain point, not a general one. What do you do that Zocdoc or Teladoc cannot?",
    challenge:
      "If a VC asked you why your AI matching is better than a simple filter by specialty and insurance — what would you say?",
  },
  {
    draft:
      "NovaMed's platform uses symptom-based AI triage to match patients with the right specialist within 2 hours, reducing misdiagnosis risk and cutting ER overflow costs for hospital networks.",
    stars: 8,
    analysis:
      "Strong improvement. You have a mechanism (symptom-based triage), a time metric (2 hours), a clinical outcome (reduced misdiagnosis), and a B2B value prop (hospital network cost savings). This covers the what and the why. The remaining gap is the how — what data or model powers the triage, and what gives you defensibility.",
    hints:
      "Add one line on your data advantage or clinical validation. Mention whether you're FDA-regulated or positioned as a decision-support tool to pre-empt compliance questions. A pilot result or waitlist number would make this investor-ready.",
    challenge:
      "What stops a hospital network from building this internally in 18 months?",
  },
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export default function MentorMockup() {
  const [draftText, setDraftText] = useState("");
  const [phase, setPhase] = useState("typing"); // typing | clicking | loading | feedback
  const [feedback, setFeedback] = useState(null);
  const [analysisText, setAnalysisText] = useState("");
  const [hintsText, setHintsText] = useState("");
  const [challengeText, setChallengeText] = useState("");
  const [btnClicking, setBtnClicking] = useState(false);
  const runRef = useRef(0);
  const activeRef = useRef(false);
  const wrapRef = useRef(null);
  const hasStarted = useRef(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted.current) {
          hasStarted.current = true;
          activeRef.current = true;
          runRef.current = 0;
          setIsDone(false);
          runLoop();
        }
      },
      { threshold: 0.2 }
    );
    if (wrapRef.current) observer.observe(wrapRef.current);
    return () => { observer.disconnect(); activeRef.current = false; };
  }, []);

  function replay() {
    activeRef.current = false;
    hasStarted.current = false;
    setIsDone(false);
    setPhase("typing");
    setFeedback(null);
    setDraftText("");
    setAnalysisText(""); setHintsText(""); setChallengeText("");
    setTimeout(() => {
      hasStarted.current = true;
      activeRef.current = true;
      runRef.current = 0;
      runLoop();
    }, 100);
  }

  async function typeText(text, speed = 18) {
    setDraftText("");
    for (let i = 0; i < text.length; i++) {
      if (!activeRef.current) return;
      setDraftText(text.slice(0, i + 1));
      await sleep(speed);
    }
  }

  async function streamText(setter, text, speed = 14) {
    setter("");
    for (let i = 0; i < text.length; i++) {
      if (!activeRef.current) return;
      setter(text.slice(0, i + 1));
      await sleep(speed);
    }
  }

  async function runLoop() {
    while (activeRef.current) {
      const run = RUNS[runRef.current];

      // שלב 1: הקלדה
      setPhase("typing");
      setFeedback(null);
      setAnalysisText("");
      setHintsText("");
      setChallengeText("");
      await typeText(run.draft, 16);
      if (!activeRef.current) return;

      await sleep(900);

      // שלב 2: לחיצה
      setBtnClicking(true);
      await sleep(250);
      setBtnClicking(false);
      await sleep(100);

      // שלב 3: טעינה
      setPhase("loading");
      await sleep(1800);
      if (!activeRef.current) return;

      // שלב 4: פידבק
      setPhase("feedback");
      setFeedback(run);
      await streamText(setAnalysisText, run.analysis, 14);
      if (!activeRef.current) return;
      await streamText(setHintsText, run.hints, 14);
      if (!activeRef.current) return;
      await streamText(setChallengeText, run.challenge, 14);
      if (!activeRef.current) return;

      await sleep(3500);

      runRef.current = (runRef.current + 1) % RUNS.length;
      if (runRef.current === 0) {
        setIsDone(true);
        return;
      }
    }
  }

  const btnBg = btnClicking ? "#2563eb" : "#4f46e5";
  const btnScale = btnClicking ? "scale(0.96)" : "scale(1)";

  return (
    <div ref={wrapRef} className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        {/* חלון המנטור */}
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            borderRadius: 16,
            border: "0.5px solid rgba(255,255,255,0.12)",
            overflow: "hidden",
            maxWidth: 620,
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "rgba(255,255,255,0.06)",
              padding: "18px 22px",
              borderBottom: "0.5px solid rgba(255,255,255,0.1)",
            }}
          >
            <div style={{ fontSize: 17, fontWeight: 600, color: "#a5b4fc" }}>
              Mentor: Solution Overview
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>
              AI-driven strategic guidance for your venture.
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.55)" }}>
              Your Draft:
            </div>

            <textarea
              readOnly
              value={draftText}
              style={{
                width: "100%",
                fontSize: 13,
                color: "rgba(255,255,255,0.85)",
                background: "rgba(255,255,255,0.05)",
                border: "0.5px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                padding: "10px 12px",
                minHeight: 90,
                resize: "none",
                fontFamily: "inherit",
                lineHeight: 1.6,
                outline: "none",
              }}
            />

            {/* כפתור */}
            <button
              disabled
              style={{
                width: "100%",
                background: btnBg,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: 11,
                fontSize: 13,
                fontWeight: 500,
                cursor: "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transform: btnScale,
                transition: "transform 0.1s",
              }}
            >
              {phase === "loading" ? (
                <span style={{ display: "flex", gap: 5, alignItems: "center" }}>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#fff",
                        display: "inline-block",
                        animation: `mentorDot 1.2s ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </span>
              ) : (
                "Get Mentor Feedback"
              )}
            </button>

            {/* Feedback */}
            {phase === "feedback" && feedback && (
              <div
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "0.5px solid rgba(255,255,255,0.12)",
                  borderRadius: 10,
                  padding: "16px 18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  animation: "mentorFadeIn 0.5s ease forwards",
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 600, color: "#a5b4fc" }}>
                  Mentor Feedback
                </div>
                <div style={{ fontSize: 18, letterSpacing: 3, color: "#60a5fa" }}>
                  {Array.from({ length: 10 }, (_, i) =>
                    i < feedback.stars ? "★" : "☆"
                  ).join("")}
                </div>

                <div style={{ fontSize: 12, fontWeight: 500, color: "#a5b4fc", marginTop: 6 }}>
                  Analysis
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.7 }}>
                  {analysisText}
                </div>

                {hintsText && (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "#a5b4fc", marginTop: 4 }}>
                      Strategic Hints
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.7 }}>
                      {hintsText}
                    </div>
                  </>
                )}

                {challengeText && (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "#a5b4fc", marginTop: 4 }}>
                      Challenge Question
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.7 }}>
                      {challengeText}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "12px 22px",
              background: "rgba(255,255,255,0.03)",
              borderTop: "0.5px solid rgba(255,255,255,0.08)",
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
            }}
          >
            <button
              style={{
                fontSize: 12,
                padding: "6px 16px",
                border: "0.5px solid rgba(255,255,255,0.15)",
                borderRadius: 6,
                background: "transparent",
                color: "rgba(255,255,255,0.5)",
                cursor: "default",
              }}
            >
              Cancel
            </button>
            <button
              style={{
                fontSize: 12,
                padding: "6px 16px",
                borderRadius: 6,
                background: "#16a34a",
                color: "#fff",
                border: "none",
                cursor: "default",
                fontWeight: 500,
              }}
            >
              Save &amp; Close
            </button>
          </div>
        </div>
      </div>


      {isDone && (
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button onClick={replay} style={{ background: "rgba(255,255,255,0.1)", border: "0.5px solid rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 600, padding: "8px 24px", borderRadius: 20, cursor: "pointer" }}>↺ Replay</button>
        </div>
      )}

      <style>{`
        @keyframes mentorDot {
          0%, 80%, 100% { opacity: 0.2; }
          40% { opacity: 1; }
        }
        @keyframes mentorFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
