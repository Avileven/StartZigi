// STUDIO 090426
"use client";
import React, { useState, useEffect, useRef } from "react";

const FEATURES = [
  { icon: "📊", name: "Progress Tracker",    desc: "Daily smoke-free streak and milestones" },
  { icon: "🤖", name: "AI Daily Coach",      desc: "Personalized tips and motivation each day" },
  { icon: "🗣", name: "Community Support",   desc: "Connect with others on the same journey" },
  { icon: "⚠️", name: "Craving Alerts",      desc: "Smart reminders when cravings peak" },
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

export default function StudioMockup() {
  const [title, setTitle]         = useState("");
  const [desc, setDesc]           = useState("");
  const [feats, setFeats]         = useState(FEATURES.map(() => false));
  const [btnBlue, setBtnBlue]     = useState(false);
  const [btnScale, setBtnScale]   = useState(false);
  const [modal, setModal]         = useState(false);
  const [selVT, setSelVT]         = useState("social");
  const [selCS, setSelCS]         = useState("colorful");
  const [selDS, setSelDS]         = useState("modern");
  const [phase, setPhase]         = useState("studio"); // studio | demo
  const activeRef = useRef(true);

  const wrapRef = useRef(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isStarted) {
          setIsStarted(true);
        }
      },
      { threshold: 0.2 }
    );
    if (wrapRef.current) observer.observe(wrapRef.current);
    return () => { observer.disconnect(); activeRef.current = false; };
  }, [isStarted]);

  useEffect(() => {
    if (!isStarted) return;
    activeRef.current = true;
    setIsDone(false);
    runLoop();
  }, [isStarted]);

  function replay() {
    activeRef.current = false;
    setIsDone(false);
    setPhase("studio");
    setTitle(""); setDesc("");
    setFeats(FEATURES.map(() => false));
    setBtnBlue(false); setBtnScale(false);
    setModal(false);
    setIsStarted(false);
    setTimeout(() => setIsStarted(true), 100);
  }

  async function typeText(setter, text, speed = 45) {
    setter("");
    for (let i = 0; i < text.length; i++) {
      if (!activeRef.current) return;
      setter(text.slice(0, i + 1));
      await sleep(speed);
    }
  }

  async function runLoop() {
    if (!activeRef.current) return;
    {
      // reset
      setPhase("studio");
      setTitle(""); setDesc("");
      setFeats(FEATURES.map(() => false));
      setBtnBlue(false); setBtnScale(false);
      setModal(false);
      setSelVT("social"); setSelCS("colorful"); setSelDS("modern");
      await sleep(400);

      // type
      await typeText(setTitle, "QuitAI", 60);
      await sleep(300);
      await typeText(setDesc, "AI-powered app to help you quit smoking for good", 35);
      await sleep(500);

      // activate features
      for (let i = 0; i < FEATURES.length; i++) {
        if (!activeRef.current) return;
        setFeats(prev => { const n = [...prev]; n[i] = true; return n; });
        await sleep(380);
      }
      await sleep(400);

      // click button
      setBtnBlue(true); setBtnScale(true);
      await sleep(250);
      setBtnScale(false);
      await sleep(100);
      setBtnBlue(false);

      // open modal
      setModal(true);
      await sleep(700);
      setSelVT("social");  await sleep(500);
      setSelCS("colorful"); await sleep(400);
      setSelDS("playful");  await sleep(500);
      await sleep(1800);

      // close modal → demo
      setModal(false);
      await sleep(300);
      setPhase("demo");
      await sleep(5000);
      setIsDone(true);
      return;
    }
  }

  const vtypes = [
    ["social",  "🗣", "Social / Community", "Feed, messages, profile"],
    ["saas",    "📊", "SaaS / Home",        "Metrics, management, data"],
    ["market",  "🛍", "Marketplace",        "Products, shopping, sellers"],
    ["service", "📅", "Service / Booking",  "Services, bookings, schedule"],
  ];
  const colorSchemes = [["colorful","🌈 Colorful"],["dark","🌑 Dark"],["light","☀️ Light"],["minimal","⬜ Minimal"]];
  const styles       = [["modern","🔷 Modern"],["business","💼 Business"],["playful","🎮 Playful"],["elegant","💎 Elegant"]];

  return (
    <div className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        {/* כותרת — מוכנסת מדף הבית */}

        <div className="flex justify-center">
          <div style={{ background: "#f8f7ff", borderRadius: 14, maxWidth: 460, width: "100%", overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.3)", position: "relative" }}>

            {/* Nav */}
            <div style={{ background: "#1a1a2e", padding: "12px 18px", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#ec4899" }}>ZigForge</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>How it works</div>
              <div style={{ fontSize: 11, color: "#fff", borderBottom: "2px solid #7c3aed", paddingBottom: 2 }}>Builder</div>
            </div>

            {phase === "studio" && (
              <div style={{ padding: 16 }}>
                {/* App Core Settings */}
                <div style={{ background: "#fff", borderRadius: 12, padding: 14, marginBottom: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1f2937", marginBottom: 10 }}>⚙️ App Core Settings</div>
                  <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 4 }}>App Title</div>
                  <div style={{ background: "#f3f4f6", borderRadius: 8, padding: "8px 10px", fontSize: 12, color: "#1f2937", marginBottom: 10, minHeight: 32 }}>
                    {title}{title.length < 6 && phase === "studio" && <span style={{ display: "inline-block", width: 1, height: 13, background: "#6366f1", marginLeft: 1, verticalAlign: "middle", animation: "studioBlinkCursor 0.8s infinite" }} />}
                  </div>
                  <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 4 }}>App Description (Tagline)</div>
                  <div style={{ background: "#f3f4f6", borderRadius: 8, padding: "8px 10px", fontSize: 12, color: "#1f2937", minHeight: 48, lineHeight: 1.5 }}>
                    {desc}{desc.length > 0 && desc.length < 48 && <span style={{ display: "inline-block", width: 1, height: 13, background: "#6366f1", marginLeft: 1, verticalAlign: "middle", animation: "studioBlinkCursor 0.8s infinite" }} />}
                  </div>
                </div>

                {/* Features */}
                <div style={{ background: "#fff", borderRadius: 12, padding: 14, marginBottom: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1f2937", marginBottom: 10 }}>📱 Features</div>
                  {FEATURES.map((f, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", borderRadius: 8, border: "1px solid #e5e7eb", marginBottom: 6, background: "#fff" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 14 }}>{f.icon}</span>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: "#1f2937" }}>{f.name}</div>
                          <div style={{ fontSize: 9, color: "#9ca3af" }}>{f.desc}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: feats[i] ? "#d1fae5" : "#f3f4f6", color: feats[i] ? "#065f46" : "#9ca3af", transition: "all 0.3s" }}>
                        {feats[i] ? "Active" : "Disabled"}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Button */}
                <button
                  disabled
                  style={{
                    width: "100%",
                    background: btnBlue ? "#2563eb" : "linear-gradient(to right,#f97316,#ec4899)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    padding: 11,
                    fontSize: 13,
                    fontWeight: 700,
                    transform: btnScale ? "scale(0.96)" : "scale(1)",
                    transition: "transform 0.1s, background 0.15s",
                    cursor: "default",
                  }}
                >
                  ✨ Upgrade with AI
                </button>
              </div>
            )}

            {phase === "demo" && (
              <div style={{ padding: 16, animation: "studioFadeUp 0.5s ease forwards" }}>
                <div style={{ background: "#fff", borderRadius: 12, padding: 14, textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", marginBottom: 12 }}>✅ Your prototype is ready!</div>
                  <div style={{ background: "#1a1a2e", borderRadius: 22, padding: 10, maxWidth: 200, margin: "0 auto", boxShadow: "0 8px 30px rgba(0,0,0,0.4)" }}>
                    <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden" }}>
                      <div style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)", padding: "12px 10px 10px", textAlign: "center" }}>
                        <div style={{ fontSize: 22, marginBottom: 2 }}>🚭</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>QuitAI</div>
                        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.7)" }}>AI-powered quit smoking coach</div>
                      </div>
                      <div style={{ padding: 10 }}>
                        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                          {[["14","Days smoke-free"],["$84","Money saved"]].map(([n,l]) => (
                            <div key={l} style={{ flex: 1, background: "#f5f3ff", borderRadius: 8, padding: 7, textAlign: "center" }}>
                              <div style={{ fontSize: 16, fontWeight: 800, color: "#7c3aed" }}>{n}</div>
                              <div style={{ fontSize: 8, color: "#6b7280" }}>{l}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{ background: "#fef9c3", borderRadius: 8, padding: "7px 8px", marginBottom: 6 }}>
                          <div style={{ fontSize: 9, fontWeight: 700, color: "#854d0e", marginBottom: 2 }}>🤖 AI Coach — Today's Tip</div>
                          <div style={{ fontSize: 9, color: "#92400e" }}>Drink water when cravings hit — it works in 3 minutes.</div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-around", paddingTop: 7, borderTop: "1px solid #f3f4f6" }}>
                          {["📊 Progress","🤖 Coach","🗣 Community"].map((item, i) => (
                            <div key={item} style={{ fontSize: 8, color: i === 0 ? "#7c3aed" : "#9ca3af", fontWeight: i === 0 ? 600 : 400, textAlign: "center" }}>{item}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: "#6b7280", marginTop: 10 }}>Generated in 47 seconds</div>
                </div>
              </div>
            )}

            {/* Modal */}
            {modal && (
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, borderRadius: 14, zIndex: 10 }}>
                <div style={{ background: "#fff", borderRadius: 14, width: "100%", maxWidth: 380, animation: "studioFadeUp 0.3s ease forwards", overflow: "hidden" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px 10px", borderBottom: "1px solid #f1f1f1" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1f2937" }}>✨ Generate Prototype</div>
                    <div style={{ fontSize: 13, color: "#9ca3af" }}>✕</div>
                  </div>
                  <div style={{ padding: "14px 16px" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 7 }}>Venture Type</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
                      {vtypes.map(([val, icon, label, d]) => (
                        <div key={val} style={{ padding: "8px 10px", borderRadius: 8, border: `2px solid ${selVT === val ? "#6366f1" : "#e5e7eb"}`, background: selVT === val ? "#eef2ff" : "#fff", transition: "all 0.25s" }}>
                          <div style={{ fontSize: 14, marginBottom: 2 }}>{icon}</div>
                          <div style={{ fontSize: 10, fontWeight: 600, color: "#1f2937" }}>{label}</div>
                          <div style={{ fontSize: 9, color: "#9ca3af" }}>{d}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 7 }}>Color Scheme</div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                      {colorSchemes.map(([val, label]) => (
                        <div key={val} style={{ padding: "3px 9px", borderRadius: 7, border: `2px solid ${selCS === val ? "#6366f1" : "#e5e7eb"}`, background: selCS === val ? "#eef2ff" : "#fff", color: selCS === val ? "#4f46e5" : "#6b7280", fontSize: 10, fontWeight: 600, transition: "all 0.25s" }}>{label}</div>
                      ))}
                    </div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 7 }}>Design Style</div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                      {styles.map(([val, label]) => (
                        <div key={val} style={{ padding: "3px 9px", borderRadius: 7, border: `2px solid ${selDS === val ? "#6366f1" : "#e5e7eb"}`, background: selDS === val ? "#eef2ff" : "#fff", color: selDS === val ? "#4f46e5" : "#6b7280", fontSize: 10, fontWeight: 600, transition: "all 0.25s" }}>{label}</div>
                      ))}
                    </div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 7 }}>Generation Mode</div>
                    <div style={{ padding: "9px 11px", borderRadius: 8, border: "2px solid #93c5fd", background: "#eff6ff" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#1f2937", display: "flex", justifyContent: "space-between" }}>
                        ⚡ BASIC <span style={{ fontSize: 9, padding: "1px 7px", borderRadius: 20, background: "#dbeafe", color: "#1d4ed8", fontWeight: 600 }}>5 credits</span>
                      </div>
                      <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>Clean, functional prototype with working navigation</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


      {isDone && (
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button onClick={replay} style={{ background: "rgba(108,71,255,0.1)", border: "1px solid rgba(108,71,255,0.3)", color: "#6c47ff", fontSize: 12, fontWeight: 600, padding: "8px 24px", borderRadius: 20, cursor: "pointer" }}>↺ Replay</button>
        </div>
      )}

      <style>{`
        @keyframes studioBlinkCursor { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes studioFadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}
