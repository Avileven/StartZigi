//BETA 090426
"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

const COACH_MSGS = [
  "Good morning! You're on day 14. Friday evenings are tough for you — I've scheduled a check-in at 6pm.",
  "Craving detected? Try the 4-7-8 breathing technique. Tap here to start.",
  "You've saved $84 this week. That's a dinner for two 🍽️",
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

export default function BetaMockup({ autoStart = false }) {
  const [days, setDays]         = useState(0);
  const [saved, setSaved]       = useState(0);
  const [crav, setCrav]         = useState(0);
  const [progPct, setProgPct]   = useState(0);
  const [coachText, setCoachText] = useState("");
  const [fieldName, setFieldName]     = useState("");
  const [fieldEmail, setFieldEmail]   = useState("");
  const [fieldReason, setFieldReason] = useState("");
  const [btnClicking, setBtnClicking] = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const activeRef = useRef(true);
  const msgIdxRef = useRef(0);

  const hasStarted = useRef(false);
  const [isDone, setIsDone] = useState(false);
  if (!autoStart) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div style={{ height: "clamp(260px, 50vw, 400px)", overflow: "hidden", borderRadius: 16, position: "relative" }}>
          <Link href="/beta-mockup" className="block relative group cursor-pointer">
          <div style={{ pointerEvents: "none", userSelect: "none" }}>
            <div className="flex justify-center px-6">
              <div style={{ background: "#f9fafb", borderRadius: 14, maxWidth: 720, width: "100%", overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "min(50%, 340px) 1fr", gap: 16, padding: "24px 20px", background: "#fff", borderBottom: "1px solid #e5e7eb", alignItems: "center" }}>
                  <div>
                    <div style={{ display: "inline-block", background: "#e0e7ff", color: "#4338ca", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, marginBottom: 10 }}>QuitAI Beta Program</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#111", lineHeight: 1.3, marginBottom: 8 }}>The AI coach that helps you quit smoking — for good.</div>
                    <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6, marginBottom: 14 }}>Be the first to experience QuitAI. Join our exclusive beta.</div>
                    <div style={{ display: "inline-block", background: "#4f46e5", color: "#fff", fontSize: 12, fontWeight: 600, padding: "8px 20px", borderRadius: 8 }}>Join the Beta</div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <div style={{ background: "#1a1a2e", borderRadius: 24, padding: 10, width: 140 }}>
                      <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden" }}>
                        <div style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", padding: "12px 10px", textAlign: "center" }}>
                          <div style={{ fontSize: 20, marginBottom: 2 }}>🚭</div>
                          <div style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>QuitAI</div>
                        </div>
                        <div style={{ padding: 8 }}>
                          <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                            {[["0","Days free"],["$0","Saved"],["0","Cravings"]].map(([n,l]) => (
                              <div key={l} style={{ flex: 1, background: "#f5f3ff", borderRadius: 6, padding: "4px 2px", textAlign: "center" }}>
                                <div style={{ fontSize: 12, fontWeight: 800, color: "#6c47ff" }}>{n}</div>
                                <div style={{ fontSize: 6, color: "#9ca3af" }}>{l}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110" style={{ background: "rgba(108,71,255,0.9)" }}>
              <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
            </div>
          </div>
        </Link>
        </div>
      </div>
    );
  }


  useEffect(() => {
    if (autoStart && !hasStarted.current) {
      hasStarted.current = true;
      activeRef.current = true;
      setIsDone(false);
      runPhoneLoop();
      runFormLoop();
    }
  }, [autoStart]);

  function replay(e) {
    e.preventDefault();
    e.stopPropagation();
    activeRef.current = false;
    hasStarted.current = false;
    setIsDone(false);
    setSubmitted(false);
    setFieldName(""); setFieldEmail(""); setFieldReason("");
    setDays(0); setSaved(0); setCrav(0); setProgPct(0);
    setCoachText("");
    msgIdxRef.current = 0;
    setTimeout(() => {
      hasStarted.current = true;
      activeRef.current = true;
      runPhoneLoop();
      runFormLoop();
    }, 100);
  }

  async function typeText(setter, text, speed = 40) {
    setter("");
    for (let i = 0; i < text.length; i++) {
      if (!activeRef.current) return;
      setter(text.slice(0, i + 1));
      await sleep(speed);
    }
  }

  async function animateStats() {
    for (let i = 0; i <= 14; i++) {
      if (!activeRef.current) return;
      setDays(i);
      setSaved(i * 6);
      setCrav(i * 2);
      setProgPct(Math.round(i / 14 * 85));
      await sleep(60);
    }
  }

  async function runPhoneLoop() {
    await animateStats();
    for (let i = 0; i < COACH_MSGS.length; i++) {
      if (!activeRef.current) return;
      const msg = COACH_MSGS[msgIdxRef.current % COACH_MSGS.length];
      await typeText(setCoachText, msg, 22);
      msgIdxRef.current++;
      await sleep(3500);
    }
  }

  async function runFormLoop() {
    if (!activeRef.current) return;
    setSubmitted(false);
    setFieldName(""); setFieldEmail(""); setFieldReason("");
    await sleep(800);
    await typeText(setFieldName, "Amy Lawson", 45);
    await sleep(300);
    await typeText(setFieldEmail, "amy.lawson@gmail.com", 32);
    await sleep(300);
    await typeText(setFieldReason, "I've tried 4 apps. An AI that actually learns my triggers sounds different.", 20);
    await sleep(600);
    setBtnClicking(true);
    await sleep(220);
    setBtnClicking(false);
    await sleep(300);
    setSubmitted(true);
    await sleep(1000);
    setIsDone(true);
  }

  return (
    <div className="flex justify-center px-6">
      <div style={{ background: "#f9fafb", borderRadius: 14, maxWidth: 720, width: "100%", overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }}>

        {/* Hero */}
        <div style={{ display: "grid", gridTemplateColumns: "min(50%, 340px) 1fr", gap: 16, padding: "24px 20px", background: "#fff", borderBottom: "1px solid #e5e7eb", alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "inline-block", background: "#e0e7ff", color: "#4338ca", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, marginBottom: 10 }}>QuitAI Beta Program</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#111", lineHeight: 1.3, marginBottom: 8 }}>The AI coach that helps you quit smoking — for good.</div>
            <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6, marginBottom: 14 }}>Be the first to experience QuitAI. Join our exclusive beta and help shape the future of AI-powered quit support.</div>
            <div style={{ display: "inline-block", background: "#4f46e5", color: "#fff", fontSize: 12, fontWeight: 600, padding: "8px 20px", borderRadius: 8 }}>Join the Beta</div>
          </div>

          {/* Phone */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ background: "#1a1a2e", borderRadius: 24, padding: 10, width: 180, boxShadow: "0 8px 30px rgba(0,0,0,0.4)" }}>
              <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden" }}>
                <div style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", padding: "14px 12px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: 24, marginBottom: 3 }}>🚭</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>QuitAI</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.7)", marginTop: 1 }}>Your personal quit coach</div>
                </div>
                <div style={{ padding: 10 }}>
                  <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
                    {[[days, "Days free"],["$"+saved, "Saved"],[crav, "Cravings beat"]].map(([n,l]) => (
                      <div key={l} style={{ flex: 1, background: "#f5f3ff", borderRadius: 7, padding: "5px 4px", textAlign: "center" }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "#6c47ff" }}>{n}</div>
                        <div style={{ fontSize: 7, color: "#9ca3af" }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "7px 8px", marginBottom: 7 }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: "#15803d", marginBottom: 2 }}>🤖 AI Coach</div>
                    <div style={{ fontSize: 9, color: "#166534", lineHeight: 1.4, minHeight: 24 }}>{coachText}</div>
                  </div>
                  <div style={{ fontSize: 8, fontWeight: 600, color: "#374151", marginBottom: 3 }}>Weekly Goal: 7 craving-free days</div>
                  <div style={{ height: 6, background: "#f3f4f6", borderRadius: 3, overflow: "hidden", marginBottom: 7 }}>
                    <div style={{ height: "100%", width: `${progPct}%`, background: "linear-gradient(to right,#7c3aed,#6366f1)", borderRadius: 3, transition: "width 0.5s ease" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-around", paddingTop: 7, borderTop: "1px solid #f3f4f6" }}>
                    {["📊 Progress","🤖 Coach","🗣 Community"].map((item, i) => (
                      <div key={item} style={{ fontSize: 8, color: i === 0 ? "#6c47ff" : "#9ca3af", fontWeight: i === 0 ? 600 : 400, textAlign: "center" }}>{item}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div style={{ padding: "20px 28px", background: "#fff", borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#111", textAlign: "center", marginBottom: 14 }}>Why Should You Join?</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
            {[["🚀","First Access","Try new features before anyone else."],["🤖","AI That Learns","Personalized to your triggers and habits."],["👥","Community","Join a private group of beta testers."],["💡","Shape the App","Your feedback influences what gets built."]].map(([icon,name,desc]) => (
              <div key={name} style={{ textAlign: "center", padding: "10px 6px", background: "#f9fafb", borderRadius: 10 }}>
                <div style={{ fontSize: 18, marginBottom: 5 }}>{icon}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#111", marginBottom: 2 }}>{name}</div>
                <div style={{ fontSize: 8, color: "#6b7280", lineHeight: 1.4 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: "20px 28px" }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", maxWidth: 460, margin: "0 auto" }}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: 16, animation: "betaFadeIn 0.4s ease forwards" }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#111", marginBottom: 6 }}>You're on the list!</div>
                <div style={{ fontSize: 11, color: "#6b7280" }}>Thank you for joining the QuitAI beta program.<br />We'll be in touch soon with next steps.</div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#111", textAlign: "center", marginBottom: 3 }}>Become a Beta Tester</div>
                <div style={{ fontSize: 10, color: "#6b7280", textAlign: "center", marginBottom: 14 }}>Influence the development and receive special benefits at launch.</div>
                {[["Full Name", fieldName, false],["Email", fieldEmail, false],["Why are you interested in joining?", fieldReason, true]].map(([label, val, isArea]) => (
                  <div key={label} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "#374151", marginBottom: 3 }}>{label}</div>
                    <div style={{ width: "100%", background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 7, padding: "7px 9px", fontSize: 11, color: "#1f2937", minHeight: isArea ? 52 : 30 }}>{val}</div>
                  </div>
                ))}
                <button
                  disabled
                  style={{
                    width: "100%", padding: 10, borderRadius: 8, fontSize: 12, fontWeight: 700, border: "none", cursor: "default",
                    background: btnClicking ? "#2563eb" : "linear-gradient(to right,#4f46e5,#7c3aed)",
                    color: "#fff",
                    transform: btnClicking ? "scale(0.97)" : "scale(1)",
                    transition: "transform 0.1s, background 0.15s",
                  }}
                >
                  Join Now
                </button>
                <div style={{ textAlign: "center", fontSize: 9, color: "#9ca3af", marginTop: 8 }}>Already 338 people joined!</div>
              </>
            )}
          </div>
        </div>
        {isDone && (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <button type="button" onClick={replay} style={{ background: "rgba(79,70,229,0.1)", border: "1px solid rgba(79,70,229,0.3)", color: "#4f46e5", fontSize: 12, fontWeight: 600, padding: "8px 24px", borderRadius: 20, cursor: "pointer" }}>↺ Replay</button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes betaFadeIn { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}
