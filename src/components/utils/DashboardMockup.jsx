// DASHBOARD 090426
"use client";
import React, { useState, useEffect, useRef } from "react";

const PHASES = [
  {
    key: "plan",
    label: "PLAN",
    venture: { name: "NovaMed", messages: 8, balance: "$15,000", val: "$250K" },
    tools: ["Financials", "Business Plan", "Invite Co-Founder", "Promotion Center"],
    messages: [
      { id: "a", dot: "#6c47ff", title: "Welcome to Business Planning!", tag: "PHASE WELCOME", date: "Jan 25, 2026", body: "It's time to build a solid foundation. Complete your business plan to unlock the next phase." },
      { id: "b", dot: "#22c55e", title: "Capital Injection: $15,000", tag: "PHASE COMPLETE", date: "Jan 25, 2026", body: "Your business plan is 100% complete. A starting capital of $15,000 has been deposited. Monthly burn rate is now $5,000.", highlight: true },
    ],
  },
  {
    key: "mvp",
    label: "MVP",
    venture: { name: "NovaMed", messages: 14, balance: "$8,200", val: "$500K" },
    tools: ["Financials", "Business Plan", "Invite Co-Founder", "Promotion Center", "ZigForge Studio", "Product Feedback"],
    messages: [
      { id: "c", dot: "#f59e0b", title: "MVP Uploaded Successfully!", tag: "SYSTEM", date: "Feb 10, 2026", body: "Great work! Your MVP is live. Use the Promotion Center to collect user feedback." },
      { id: "d", dot: "#6c47ff", title: "Co-Founder Invited!", tag: "CO-FOUNDER INVITE", date: "Apr 6, 2026", body: "Invitation sent to DAN. Link points to Venture Profile.", highlight: false },
    ],
  },
  {
    key: "mlp",
    label: "MLP",
    venture: { name: "NovaMed", messages: 18, balance: "$2,400", val: "$1M" },
    tools: ["Financials", "Business Plan", "Invite Co-Founder", "Promotion Center", "ZigForge Studio", "Product Feedback", "Revenue Modeling", "MLP Dev Center"],
    messages: [
      { id: "e", dot: "#ec4899", title: "10 Feedback Responses Received", tag: "SYSTEM", date: "Mar 15, 2026", body: "You've collected 10+ feedback responses. You're now eligible to complete the MLP phase." },
      { id: "f", dot: "#22c55e", title: "MLP Phase Complete!", tag: "PHASE COMPLETE", date: "Mar 20, 2026", body: "Congratulations! Your MLP is complete. You're moving to the Beta phase.", highlight: true },
    ],
  },
  {
    key: "beta",
    label: "BETA",
    venture: { name: "NovaMed", messages: 20, balance: "$220,151", val: "$2M" },
    tools: ["Financials", "Business Plan", "Invite Co-Founder", "Promotion Center", "ZigForge Studio", "Product Feedback", "Revenue Modeling", "Beta Testing Page", "Venture Pitch"],
    messages: [
      { id: "g", dot: "#ec4899", title: "New Beta Tester", tag: "SYSTEM", date: "Mar 29, 2026", body: "You now have 5/50 beta sign-ups. Keep sharing your beta page to reach your goal." },
      { id: "h", dot: "#f59e0b", title: "Screening Meeting Scheduled", tag: "VC MARKETPLACE", date: "Apr 2, 2026", body: "Velocity Wave Partners agreed to a screening call. Prepare your pitch deck." },
      { id: "i", dot: "#22c55e", title: "VC Investment Offer Received", tag: "VC MARKETPLACE", date: "Just now", body: "Meridian Stone Capital is offering $1,500,000 at a $5M pre-money valuation. You have 48 hours to respond.", highlight: true, isNew: true },
    ],
  },
];

const NAV_ITEMS = ["Home", "Dashboard", "Exit Path", "Landing Page", "Beta Page", "Angel Arena", "VC Marketplace", "My Account"];

export default function DashboardMockup() {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [visibleMsgs, setVisibleMsgs] = useState([]);
  const [toolCount, setToolCount] = useState(4);

  const phase = PHASES[phaseIdx];

  const wrapRef = useRef(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const phaseCountRef = useRef(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isStarted) {
          setIsStarted(true);
          setPhaseIdx(0);
          phaseCountRef.current = 0;
          setIsDone(false);
        }
      },
      { threshold: 0.5 }
    );
    if (wrapRef.current) observer.observe(wrapRef.current);
    return () => observer.disconnect();
  }, [isStarted]);

  function replay(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setIsDone(false);
    setPhaseIdx(0);
    phaseCountRef.current = 0;
    setIsStarted(false);
    setTimeout(() => setIsStarted(true), 100);
  }

  useEffect(() => {
    if (!isStarted) return;
    setVisibleMsgs([]);
    setToolCount(4);

    const toolTarget = phase.tools.length;
    let t = 4;
    const toolInterval = setInterval(() => {
      t++;
      setToolCount(t);
      if (t >= toolTarget) clearInterval(toolInterval);
    }, 400);

    const msgs = [...phase.messages];
    msgs.forEach((msg, i) => {
      setTimeout(() => {
        setVisibleMsgs(prev => [...prev, msg]);
      }, 600 + i * 1000);
    });

    const totalTime = 600 + msgs.length * 1000 + 3000;
    const nextPhase = setTimeout(() => {
      phaseCountRef.current += 1;
      if (phaseCountRef.current < PHASES.length) {
        setPhaseIdx(prev => (prev + 1) % PHASES.length);
      } else {
        setIsDone(true);
      }
    }, totalTime);

    return () => {
      clearInterval(toolInterval);
      clearTimeout(nextPhase);
    };
  }, [phaseIdx, isStarted]);

  return (
    <div ref={wrapRef} style={{ padding: "24px 12px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", borderRadius: 14, overflow: "hidden", border: "0.5px solid #ddd" }}>
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <div style={{ minWidth: 600, background: "#f0f0f5" }}>

        {/* Topbar */}
        <div style={{ background: "#fff", borderBottom: "0.5px solid #e8e8e8", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#111" }}>Good morning, Sarah!</div>
            <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>Monday, April 6, 2026</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: "#aaa" }}>Current Phase</span>
            <span style={{ background: "#fff3e0", color: "#d97706", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, transition: "all 0.5s" }}>{phase.label}</span>
          </div>
        </div>

        {/* Body */}
        <div style={{ display: "grid", gridTemplateColumns: "160px 170px 1fr", overflowX: "auto" }}>

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
                <div style={{ fontSize: 10, fontWeight: 500, color: "#333" }}>sarah@novamed.io</div>
                <div style={{ fontSize: 9, color: "#aaa" }}>Impact Plan</div>
              </div>
            </div>
          </div>

          {/* Toolbox */}
          <div style={{ background: "#fafafa", borderRight: "0.5px solid #eee", padding: 12, display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={{ fontSize: 9, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Toolbox</div>
            {phase.tools.slice(0, toolCount).map((t) => (
              <div key={t} style={{ background: "#fff", border: "0.5px solid #e8e8e8", borderRadius: 7, padding: "7px 10px", fontSize: 11, color: "#444", transition: "opacity 0.4s", opacity: 1 }}>{t}</div>
            ))}
          </div>

          {/* Board */}
          <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ background: "#fff", border: "0.5px solid #e8e8e8", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 5 }}>{phase.venture.name}</div>
              <div style={{ display: "flex", gap: 6, fontSize: 10, color: "#999", flexWrap: "wrap" }}>
                <span>{phase.venture.messages} messages</span><span>·</span><span>1 founder</span><span>·</span><span>Balance: {phase.venture.balance}</span><span>·</span><span>Val: {phase.venture.val}</span>
              </div>
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: "#111" }}>Board</div>

            {visibleMsgs.map((msg) => (
              <div key={msg.id} style={{ background: msg.highlight ? "#f0fdf4" : "#fff", border: `0.5px solid ${msg.highlight ? "#22c55e" : "#e8e8e8"}`, borderRadius: 8, padding: "8px 10px", animation: "dashSlideIn 0.5s ease forwards" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, gap: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, color: "#111" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: msg.dot, flexShrink: 0 }} />
                    {msg.title}
                    {msg.isNew && <span style={{ fontSize: 8, background: "#dcfce7", color: "#16a34a", padding: "1px 5px", borderRadius: 4, fontWeight: 600 }}>NEW</span>}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 8, color: "#bbb", textTransform: "uppercase" }}>{msg.tag}</div>
                    <div style={{ fontSize: 8, color: "#ccc" }}>{msg.date}</div>
                  </div>
                </div>
                <div style={{ fontSize: 10, color: "#777", lineHeight: 1.4 }}>{msg.body}</div>
              </div>
            ))}
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
      <style>{`@keyframes dashSlideIn { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }`}</style>
    </div>
  );
}
