// BUSINESSDECK 180426
"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

const SECTIONS = [
  { title: "Executive Summary", text: "MindBridge is an AI-powered mental wellness platform delivering personalized daily check-ins and evidence-based exercises adapted to each user's emotional patterns." },
  { title: "The Problem", text: "970 million people live with a mental health condition. Fewer than 30% receive treatment. Therapy costs $150–$300/session with 3–6 month waitlists. Existing apps are generic and fail to retain users." },
  { title: "Business Model", text: "Freemium at $12.99/month. Projects 9K users and $73K revenue in Year 1, growing to 16K users and $291K cumulative by Year 2." },
  { title: "The Ask", text: "MindBridge is seeking to raise $1.2M to fund the next 24 months. Funds: 45% product development, 25% user acquisition, 20% clinical validation, 10% operations." },
];

const BUDGET_ROWS = [
  { item: "CEO + CTO (founders)", type: "Salary", monthly: "$16,000", annual: "$192,000" },
  { item: "Developer + Designer", type: "Salary", monthly: "$11,000", annual: "$132,000" },
  { item: "Instagram + Influencer", type: "Marketing", monthly: "$3,500", annual: "$42,000" },
  { item: "Co-working + Cloud + Legal", type: "Operations", monthly: "$2,700", annual: "$32,400" },
  { item: "Total monthly burn", type: "", monthly: "$33,200", annual: "$398,400", bold: true },
];

const FORECAST_ROWS = [
  { metric: "Total Users", year1: "9K", year2: "16K" },
  { metric: "Paying Users", year1: "2K", year2: "4K" },
  { metric: "Revenue", year1: "$73K", year2: "$291K", bold: true },
];

export default function BusinessDeckMockup({ autoStart = false }) {
  const [step, setStep] = useState(0);
  const [visibleSections, setVisibleSections] = useState([]);
  const [showDownload, setShowDownload] = useState(false);
  const [showTables, setShowTables] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const activeRef = useRef(true);

  useEffect(() => {
    if (autoStart) {
      activeRef.current = true;
      setIsStarted(true);
      setStep(1);
    }
    return () => { activeRef.current = false; };
  }, [autoStart]);

  useEffect(() => {
    if (!isStarted) return;

    if (step === 1) {
      const t = setTimeout(() => { if (activeRef.current) setStep(2); }, 1800);
      return () => clearTimeout(t);
    }

    if (step === 2) {
      setVisibleSections([]);
      SECTIONS.forEach((_, i) => {
        setTimeout(() => { if (activeRef.current) setVisibleSections(prev => [...prev, i]); }, i * 700);
      });
      const t = setTimeout(() => { if (activeRef.current) setStep(3); }, SECTIONS.length * 700 + 1200);
      return () => clearTimeout(t);
    }

    if (step === 3) {
      setShowDownload(true);
      const t1 = setTimeout(() => { if (activeRef.current) setShowTables(true); }, 800);
      const t2 = setTimeout(() => { if (activeRef.current) setIsDone(true); }, 4500);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [step, isStarted]);

  function replay(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    activeRef.current = false;
    setIsDone(false);
    setStep(0);
    setVisibleSections([]);
    setShowDownload(false);
    setShowTables(false);
    setIsStarted(false);
    setTimeout(() => { activeRef.current = true; setIsStarted(true); setStep(1); }, 100);
  }

  // ── Static preview ────────────────────────────────────────────────────────
  if (!autoStart) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link href="/business-deck-mockup" className="block relative group cursor-pointer">

          {/* Mobile */}
          <div className="sm:hidden" style={{ height: 300, overflow: "hidden", borderRadius: 16, position: "relative", border: "0.5px solid #ddd" }}>
            <div style={{ pointerEvents: "none", userSelect: "none", background: "#f8f7ff", padding: 16 }}>
              <div style={{ textAlign: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#6c47ff" }}>MindBridge</div>
                <div style={{ fontSize: 11, color: "#aaa" }}>Investor Business Plan · April 2026</div>
              </div>
              {SECTIONS.slice(0, 3).map((s, i) => (
                <div key={i} style={{ background: "#fff", border: "0.5px solid #e8e8e8", borderRadius: 8, padding: "8px 10px", marginBottom: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6c47ff", marginBottom: 2 }}>{s.title}</div>
                  <div style={{ fontSize: 10, color: "#777" }}>{s.text.slice(0, 70)}...</div>
                </div>
              ))}
            </div>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(108,71,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(108,71,255,0.5)" }}>
                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[17px] border-l-white border-b-[10px] border-b-transparent ml-1" />
              </div>
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden sm:block relative">
            <div style={{ pointerEvents: "none", userSelect: "none" }}>
              <div style={{ maxWidth: 700, margin: "0 auto", borderRadius: 14, overflow: "hidden", border: "0.5px solid #ddd", background: "#f8f7ff" }}>
                <div style={{ background: "#fff", borderBottom: "0.5px solid #e8e8e8", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>Business Deck — MindBridge</div>
                  <div style={{ background: "#6c47ff", color: "#fff", fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 8 }}>Download .docx</div>
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ textAlign: "center", paddingBottom: 12, borderBottom: "0.5px solid #eee", marginBottom: 12 }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#6c47ff" }}>MindBridge</div>
                    <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>Investor Business Plan · April 2026</div>
                  </div>
                  {SECTIONS.map((s, i) => (
                    <div key={i} style={{ background: "#fff", border: "0.5px solid #e8e8e8", borderRadius: 8, padding: "8px 12px", marginBottom: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#6c47ff", marginBottom: 3 }}>{s.title}</div>
                      <div style={{ fontSize: 10, color: "#555", lineHeight: 1.5 }}>{s.text.slice(0, 100)}...</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110" style={{ background: "rgba(108,71,255,0.9)" }}>
                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1" />
              </div>
            </div>
          </div>

        </Link>
      </div>
    );
  }

  // ── Animated version ──────────────────────────────────────────────────────
  return (
    <div className="px-6">
      <div className="max-w-4xl mx-auto">
        <div style={{ background: "#f8f7ff", borderRadius: 14, overflow: "hidden", border: "0.5px solid #ddd" }}>

          {/* Top bar */}
          <div style={{ background: "#fff", borderBottom: "0.5px solid #e8e8e8", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>Business Deck — MindBridge</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {step >= 2 && (
                <div style={{ background: step === 2 ? "#f0edff" : "#f0fdf4", color: step === 2 ? "#6c47ff" : "#16a34a", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, animation: "deckFadeIn 0.4s ease" }}>
                  {step === 2 ? "GENERATING..." : "READY"}
                </div>
              )}
              <div style={{
                background: step === 1 ? "#e0e0e0" : showDownload ? "#22c55e" : "#6c47ff",
                color: "#fff", fontSize: 11, fontWeight: 600, padding: "4px 14px", borderRadius: 8,
                transition: "all 0.4s",
              }}>
                {step === 1 ? "Generate Business Plan" : showDownload ? "✓ Downloaded" : "Download .docx"}
              </div>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: 20, minHeight: 300 }}>

            {/* Step 1: empty placeholders */}
            {step === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ textAlign: "center", paddingBottom: 12, borderBottom: "0.5px solid #eee", marginBottom: 4 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#6c47ff" }}>MindBridge</div>
                  <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>Investor Business Plan · April 2026</div>
                </div>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{ background: "#f0f0f8", borderRadius: 8, padding: 12, animation: "deckPulse 1.5s ease infinite" }}>
                    <div style={{ height: 10, background: "#e0e0f0", borderRadius: 4, width: `${50 + i * 10}%`, marginBottom: 6 }} />
                    <div style={{ height: 8, background: "#e8e8f4", borderRadius: 4, width: "90%" }} />
                    <div style={{ height: 8, background: "#e8e8f4", borderRadius: 4, width: "70%", marginTop: 4 }} />
                  </div>
                ))}
              </div>
            )}

            {/* Step 2: sections appear */}
            {step === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ textAlign: "center", paddingBottom: 12, borderBottom: "0.5px solid #eee", marginBottom: 4 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#6c47ff" }}>MindBridge</div>
                  <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>Investor Business Plan · April 2026</div>
                </div>
                {SECTIONS.map((s, i) => visibleSections.includes(i) && (
                  <div key={i} style={{ background: "#fff", border: "0.5px solid #e8e8e8", borderRadius: 8, padding: "10px 14px", animation: "deckSlideIn 0.4s ease forwards" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#6c47ff" }}>{s.title}</div>
                      <div style={{ fontSize: 9, color: "#16a34a", fontWeight: 600 }}>✓ DONE</div>
                    </div>
                    <div style={{ fontSize: 10, color: "#555", lineHeight: 1.5 }}>{s.text}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 3: download view with tables */}
            {step === 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ textAlign: "center", paddingBottom: 12, borderBottom: "0.5px solid #eee" }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#6c47ff" }}>MindBridge</div>
                  <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>Investor Business Plan · April 2026</div>
                  <div style={{ fontSize: 10, color: "#ccc", fontStyle: "italic" }}>Confidential — Not for distribution</div>
                </div>

                <div style={{ background: "#fff", border: "0.5px solid #e8e8e8", borderRadius: 8, padding: "10px 14px", animation: "deckFadeIn 0.4s ease" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#6c47ff", marginBottom: 4 }}>Executive Summary</div>
                  <div style={{ fontSize: 10, color: "#555", lineHeight: 1.5 }}>MindBridge is an AI-powered mental wellness platform delivering personalized daily check-ins and evidence-based exercises. The company is in Beta with 47 sign-ups and is raising $1.2M seed to reach 10,000 paying users in 18 months.</div>
                </div>

                {showTables && (
                  <>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", borderTop: "0.5px solid #eee", paddingTop: 10, animation: "deckFadeIn 0.4s ease" }}>Appendices</div>

                    <div style={{ animation: "deckSlideIn 0.4s ease" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#6c47ff", marginBottom: 6 }}>Appendix A — Key Metrics & Forecast Highlights</div>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
                        <thead>
                          <tr style={{ background: "#f8fafc" }}>
                            {["Metric", "Year 1", "Year 2"].map(h => <th key={h} style={{ textAlign: "left", padding: "5px 8px", border: "0.5px solid #e5e7eb", color: "#374151" }}>{h}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {FORECAST_ROWS.map((r, i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                              <td style={{ padding: "5px 8px", border: "0.5px solid #e5e7eb", fontWeight: r.bold ? 700 : 400 }}>{r.metric}</td>
                              <td style={{ padding: "5px 8px", border: "0.5px solid #e5e7eb", fontWeight: r.bold ? 700 : 400, color: r.bold ? "#6c47ff" : "#374151" }}>{r.year1}</td>
                              <td style={{ padding: "5px 8px", border: "0.5px solid #e5e7eb", fontWeight: r.bold ? 700 : 400, color: r.bold ? "#6c47ff" : "#374151" }}>{r.year2}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div style={{ animation: "deckSlideIn 0.5s ease" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#6c47ff", marginBottom: 6 }}>Appendix B — Monthly Budget Breakdown</div>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
                        <thead>
                          <tr style={{ background: "#f8fafc" }}>
                            {["Item", "Type", "Monthly", "Annual"].map(h => <th key={h} style={{ textAlign: "left", padding: "5px 8px", border: "0.5px solid #e5e7eb", color: "#374151" }}>{h}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {BUDGET_ROWS.map((r, i) => (
                            <tr key={i} style={{ background: r.bold ? "#f8fafc" : i % 2 === 0 ? "#fff" : "#fafafa" }}>
                              <td style={{ padding: "5px 8px", border: "0.5px solid #e5e7eb", fontWeight: r.bold ? 700 : 400 }}>{r.item}</td>
                              <td style={{ padding: "5px 8px", border: "0.5px solid #e5e7eb", color: "#6b7280" }}>{r.type}</td>
                              <td style={{ padding: "5px 8px", border: "0.5px solid #e5e7eb", fontWeight: r.bold ? 700 : 400, color: r.bold ? "#6c47ff" : "#374151" }}>{r.monthly}</td>
                              <td style={{ padding: "5px 8px", border: "0.5px solid #e5e7eb", fontWeight: r.bold ? 700 : 400, color: r.bold ? "#6c47ff" : "#374151" }}>{r.annual}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {isDone && (
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button type="button" onClick={replay} style={{ background: "rgba(108,71,255,0.15)", border: "1px solid rgba(108,71,255,0.4)", color: "#6c47ff", fontSize: 12, fontWeight: 600, padding: "8px 24px", borderRadius: 20, cursor: "pointer" }}>↺ Replay</button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes deckSlideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes deckFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes deckPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}
