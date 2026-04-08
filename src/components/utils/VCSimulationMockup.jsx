"use client";
import React, { useState, useEffect, useRef } from "react";

const NAV = ["Home","Dashboard","Exit Path","Landing Page","Beta Page","Angel Arena","VC Marketplace","My Account"];
const TOOLS = ["Financials","Business Plan","Invite Co-Founder","Promotion Center","ZigForge Studio","Product Feedback","Revenue Modeling","Beta Testing Page","Venture Pitch"];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

export default function VCSimulationMockup() {
  const [phase, setPhase] = useState("screening"); // screening | advanced | dashboard
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [inputTyping, setInputTyping] = useState(false);
  const [showOffer, setShowOffer] = useState(false);
  const chatRef = useRef(null);
  const activeRef = useRef(true);

  useEffect(() => {
    activeRef.current = true;
    runLoop();
    return () => { activeRef.current = false; };
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  function addMsg(type, text) {
    setMessages(prev => [...prev, { type, text, id: Date.now() + Math.random() }]);
  }

  async function vcSay(text) {
    if (!activeRef.current) return;
    addMsg("typing", "");
    await sleep(1100);
    if (!activeRef.current) return;
    setMessages(prev => prev.filter(m => m.type !== "typing"));
    addMsg("vc", text);
    await sleep(500);
  }

  async function userSay(text) {
    if (!activeRef.current) return;
    setInputTyping(true);
    setInputText(text);
    await sleep(text.length * 15);
    if (!activeRef.current) return;
    setInputTyping(false);
    setInputText("");
    addMsg("user", text);
    await sleep(400);
  }

  async function runScreening() {
    setPhase("screening");
    setMessages([]);
    setShowOffer(false);
    await sleep(600);
    await vcSay("Hello from Meridian Stone Capital. I've reviewed your materials for NovaMed and have a few questions.");
    await vcSay("What specific problem are you solving, and how do you know patients actually experience this pain today?");
    await userSay("Patients with rare conditions wait 4–6 weeks for a specialist. We interviewed 200+ patients — the wait causes misdiagnosis and avoidable ER visits.");
    await vcSay("Got it.");
    await vcSay("What makes your AI matching approach meaningfully different from existing tools?");
    await userSay("Existing tools match on availability. We match on symptom clusters and urgency scores, trained on 1.2M anonymized patient records.");
    await vcSay("Understood. Last question — what's your go-to-market strategy for the first 12 months?");
    await userSay("B2B first — signed LOIs with 3 hospital networks covering 180K patients. Direct-to-consumer comes in month 10.");
    await vcSay("Thank you. We will review everything and be in touch within a few days.");
    await sleep(3000);
  }

  async function runAdvanced() {
    setPhase("advanced");
    setMessages([]);
    await sleep(600);
    await vcSay("Nice to see you again. We've reviewed your funding plan. How much are you looking to raise in this round?");
    setInputTyping(true);
    setInputText("$1,500,000");
    await sleep(1000);
    setInputTyping(false);
    setInputText("");
    addMsg("user", "We are looking to raise $1,500,000 in this round.");
    await sleep(400);
    await vcSay("Got it. Tell me about your founding team — what experience does each member bring?");
    await userSay("Our CEO has 12 years in health-tech. Our CTO led engineering at two Series B companies. Our CMO is a practicing specialist with 18 years of clinical experience.");
    await vcSay("Strong team. Last question — walk me through your revenue model and path to profitability.");
    await userSay("We charge hospitals $8 per active patient slot per month. At 10% penetration of our signed networks, that's $1.4M ARR. Break-even at month 18.");
    await vcSay("Thank you. We have everything we need. We will be in touch shortly.");
    await sleep(1500);
  }

  async function runLoop() {
    while (activeRef.current) {
      await runScreening();
      if (!activeRef.current) return;
      await runAdvanced();
      if (!activeRef.current) return;
      setPhase("dashboard");
      setShowOffer(true);
      await sleep(6000);
    }
  }

  const modalTitle = phase === "screening"
    ? "Meeting with Meridian Stone Capital"
    : "Advanced Meeting with Meridian Stone Capital";
  const modalSub = phase === "screening"
    ? "Screening Interview · NovaMed"
    : "Investment Discussion · NovaMed";

  return (
    <div className="py-24 px-6">
      <div className="max-w-4xl mx-auto">

        {/* Chat phases */}
        {(phase === "screening" || phase === "advanced") && (
          <div style={{ background: "#fff", borderRadius: 14, maxWidth: 520, margin: "0 auto", overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", height: 520 }}>
            {/* Header */}
            <div style={{ background: "#f8fafc", padding: "14px 18px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#1f2937" }}>{modalTitle}</div>
                <div style={{ fontSize: 10, color: "#6b7280", marginTop: 1 }}>{modalSub}</div>
              </div>
              <div style={{ fontSize: 13, color: "#9ca3af" }}>✕</div>
            </div>

            {/* Chat */}
            <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
              {messages.map(msg => (
                <div key={msg.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, flexDirection: msg.type === "user" ? "row-reverse" : "row" }}>
                  {msg.type !== "typing" && (
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: msg.type === "vc" ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                      {msg.type === "vc" ? "MS" : "AV"}
                    </div>
                  )}
                  {msg.type === "typing" ? (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>MS</div>
                      <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "9px 12px", background: "#f1f5f9", borderRadius: 12, borderBottomLeftRadius: 3 }}>
                        {[0,1,2].map(i => (
                          <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#9ca3af", display: "inline-block", animation: `vcDot 1.2s ${i*0.2}s infinite` }} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ maxWidth: "75%", padding: "9px 12px", borderRadius: 12, fontSize: 12, lineHeight: 1.55, background: msg.type === "user" ? "#3b82f6" : "#f1f5f9", color: msg.type === "user" ? "#fff" : "#1f2937", borderBottomLeftRadius: msg.type === "vc" ? 3 : 12, borderBottomRightRadius: msg.type === "user" ? 3 : 12 }}>
                      {msg.text}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Input */}
            <div style={{ padding: "10px 14px", borderTop: "1px solid #e5e7eb", display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
              <div style={{ flex: 1, background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 10px", fontSize: 12, color: inputTyping ? "#1f2937" : "#9ca3af" }}>
                {inputTyping ? inputText : "Type your answer..."}
              </div>
              <div style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "7px 12px", fontSize: 11, fontWeight: 600, flexShrink: 0 }}>Send</div>
            </div>
          </div>
        )}

        {/* Dashboard phase */}
        {phase === "dashboard" && (
          <div style={{ maxWidth: 900, margin: "0 auto", background: "#f0f0f5", borderRadius: 14, overflow: "hidden", border: "0.5px solid #ddd", animation: "vcFadeUp 0.6s ease forwards" }}>
            {/* Topbar */}
            <div style={{ background: "#fff", borderBottom: "0.5px solid #e8e8e8", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#111" }}>Good morning, Sarah!</div>
                <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>Monday, April 6, 2026</div>
              </div>
              <span style={{ background: "#fff3e0", color: "#d97706", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>BETA</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "160px 170px 1fr" }}>
              {/* Nav */}
              <div style={{ background: "#fff", borderRight: "0.5px solid #eee", padding: "12px 0", display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 9, color: "#ccc", textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 14px 8px" }}>Navigation</div>
                {NAV.map(item => (
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
                {TOOLS.slice(0, 7).map(t => (
                  <div key={t} style={{ background: "#fff", border: "0.5px solid #e8e8e8", borderRadius: 7, padding: "7px 10px", fontSize: 11, color: "#444" }}>{t}</div>
                ))}
              </div>

              {/* Board */}
              <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ background: "#fff", border: "0.5px solid #e8e8e8", borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 5 }}>NovaMed</div>
                  <div style={{ display: "flex", gap: 6, fontSize: 10, color: "#999", flexWrap: "wrap" }}>
                    <span>20 messages</span><span>·</span><span>1 founder</span><span>·</span><span>Balance: $220,151</span><span>·</span><span>Val: $2M</span>
                  </div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#111" }}>Board</div>

                {/* Offer message — בולט */}
                {showOffer && (
                  <div style={{ background: "#fefce8", border: "2px solid #f59e0b", borderRadius: 8, padding: "10px 12px", boxShadow: "0 2px 12px rgba(245,158,11,0.2)", animation: "vcSlideIn 0.5s ease forwards" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, gap: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, color: "#111" }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", flexShrink: 0 }} />
                        💼 Investment Proposal from Meridian Stone Capital
                        <span style={{ fontSize: 8, background: "#fef9c3", color: "#b45309", padding: "1px 5px", borderRadius: 4, fontWeight: 700 }}>ACTION REQUIRED</span>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 8, color: "#bbb", textTransform: "uppercase" }}>VC MARKETPLACE</div>
                        <div style={{ fontSize: 8, color: "#ccc" }}>Just now</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 10, color: "#777", lineHeight: 1.4, marginBottom: 8 }}>We are pleased to present our investment proposal for NovaMed. Please review the terms and let us know your decision within 48 hours.</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
                      {[["Investment Amount","$1,500,000"],["Pre-Money Valuation","$6,000,000"],["Post-Money Valuation","$7,500,000"],["VC Equity","20.0%"]].map(([label, val]) => (
                        <div key={label} style={{ background: "#fef3c7", borderRadius: 5, padding: "4px 7px" }}>
                          <div style={{ fontSize: 8, color: "#92400e" }}>{label}</div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#b45309" }}>{val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* הודעות רגילות */}
                <div style={{ background: "#fff", border: "0.5px solid #e8e8e8", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, color: "#111" }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", flexShrink: 0 }} />
                      Screening Meeting Scheduled
                    </div>
                    <div style={{ fontSize: 8, color: "#bbb", textTransform: "uppercase" }}>VC MARKETPLACE</div>
                  </div>
                  <div style={{ fontSize: 10, color: "#777" }}>Velocity Wave Partners agreed to a screening call. Prepare your pitch deck.</div>
                </div>

                <div style={{ background: "#fff", border: "0.5px solid #e8e8e8", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, color: "#111" }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ec4899", flexShrink: 0 }} />
                      New Beta Tester
                    </div>
                    <div style={{ fontSize: 8, color: "#bbb", textTransform: "uppercase" }}>SYSTEM</div>
                  </div>
                  <div style={{ fontSize: 10, color: "#777" }}>You now have 5/50 beta sign-ups. Keep sharing your beta page to reach your goal.</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes vcDot { 0%,80%,100%{opacity:0.2} 40%{opacity:1} }
        @keyframes vcFadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes vcSlideIn { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
      `}</style>
    </div>
  );
}
