// VC 260426
"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

const STATUS_COLORS = {
  none:     "linear-gradient(135deg,#3b82f6,#6366f1)",
  pending:  "#facc15",
  interest: "#c084fc",
  meeting:  "#7c3aed",
  passed:   "#ef4444",
};

const FIRMS = [
  { name: "Apex Ridge Ventures",       fund: "$380M", check: "$3M–$25M",  founded: "Founded 2015", status: "none",     about: "Leading investment firm specializing in early-stage technology companies with global impact potential.", stages: ["Series A","Series B","Series C"], portfolio: [{name:"TechFlow",description:"Cloud infrastructure platform"},{name:"GreenWave",description:"Sustainable packaging solutions"},{name:"MindBridge",description:"Mental health platform"}] },
  { name: "Meridian Stone Capital",    fund: "$290M", check: "$4M–$30M",  founded: "Founded 2018", status: "meeting",  about: "Strategic investment partner focused on transformative technologies shaping tomorrow's economy.", stages: ["Series A","Series B","Series C"], portfolio: [{name:"NeuralPath",description:"ML platform for drug discovery"},{name:"CryptoSecure",description:"Blockchain identity verification"},{name:"MedAssist",description:"AI clinical decision support"}] },
  { name: "Velocity Wave Partners",    fund: "$520M", check: "$6M–$45M",  founded: "Founded 2011", status: "pending",  about: "Innovation-driven VC firm backing entrepreneurs building the next generation of market leaders.", stages: ["Series A","Series B","Series C"], portfolio: [{name:"SpaceLink",description:"Satellite communication network"},{name:"FoodTech Labs",description:"Plant-based protein platform"},{name:"EduCore",description:"Online learning for K-12"}] },
  { name: "Horizon Sky Growth",        fund: "$415M", check: "$5M–$35M",  founded: "Founded 2014", status: "none",     about: "Sector-agnostic investment firm with a track record of identifying breakthrough innovations.", stages: ["Series A","Series B","Series C"], portfolio: [{name:"GameForge",description:"Mobile gaming development studio"},{name:"SolarGrid",description:"Community solar energy platform"},{name:"CleanAir",description:"Carbon capture technology"}] },
  { name: "Pioneer Bridge Investments",fund: "$350M", check: "$4M–$28M",  founded: "Founded 2016", status: "passed",   about: "Forward-thinking VC firm partnering with visionary founders to scale disruptive technologies.", stages: ["Series A","Series B","Series C"], portfolio: [{name:"RoboMed",description:"Surgical robotics platform"},{name:"AgriTech Solutions",description:"Precision farming with IoT"},{name:"SportsTech",description:"Performance analytics"}] },
  { name: "Summit Peak Ventures",      fund: "$480M", check: "$5M–$40M",  founded: "Founded 2013", status: "interest", about: "Premier venture capital firm focused on backing exceptional entrepreneurs across high-growth sectors.", stages: ["Series A","Series B","Series C"], portfolio: [{name:"CloudOps",description:"DevOps automation for enterprise"},{name:"GenomeSeq",description:"Personalized medicine platform"},{name:"PayBridge",description:"Cross-border payments for SMBs"}] },
  { name: "Nexus Delta Capital",       fund: "$270M", check: "$3M–$22M",  founded: "Founded 2017", status: "none",     about: "Technology-focused investment firm committed to supporting innovative companies that reshape industries.", stages: ["Series A","Series B","Series C"], portfolio: [{name:"AutoDrive",description:"Autonomous vehicle software"},{name:"FashionTech",description:"AI fashion design platform"}] },
  { name: "Catalyst Prime Ventures",   fund: "$600M", check: "$7M–$55M",  founded: "Founded 2010", status: "none",     about: "Growth-stage investor specializing in scalable technology companies with strong market traction.", stages: ["Series A","Series B","Series C"], portfolio: [{name:"PlantBased",description:"Alternative protein startup"},{name:"EcoFashion",description:"Sustainable clothing brand"},{name:"FoodDelivery",description:"Hyperlocal food delivery platform"}] },
  { name: "Frontier Edge Ventures",    fund: "$390M", check: "$4M–$32M",  founded: "Founded 2015", status: "pending",  about: "Innovation-focused VC firm partnering with entrepreneurs to build category defining companies.", stages: ["Series A","Series B","Series C"], portfolio: [{name:"WindTech",description:"Next-gen wind turbine technology"},{name:"NeuralNet",description:"Deep learning for autonomous systems"},{name:"EnergyStorage",description:"Advanced battery technology"}] },
  { name: "Pinnacle Storm Capital",    fund: "$365M", check: "$5M–$35M",  founded: "Founded 2014", status: "none",     about: "Strategic investment firm focused on backing innovative companies that drive market transformation.", stages: ["Series A","Series B","Series C"], portfolio: [{name:"TelemedicineOS",description:"Remote healthcare for rural areas"},{name:"WorkflowSaaS",description:"Business process automation"},{name:"InsurTech",description:"Digital insurance for gig workers"}] },
  { name: "Compass Zenith Capital",    fund: "$475M", check: "$5M–$41M",  founded: "Founded 2012", status: "meeting",  about: "Growth-oriented venture capital firm investing in technology companies with strong competitive advantages.", stages: ["Series A","Series B","Series C"], portfolio: [{name:"SalesAutomation",description:"CRM with AI lead scoring"},{name:"WearableHealth",description:"Glucose monitoring for diabetics"},{name:"HealthAnalytics",description:"Population health management"}] },
  { name: "Ascent Vertex Partners",    fund: "$550M", check: "$6M–$48M",  founded: "Founded 2011", status: "none",     about: "Growth-stage VC focused on scaling innovative technology companies with global market potential.", stages: ["Series A","Series B","Series C"], portfolio: [{name:"MobileGaming",description:"Cross-platform multiplayer games"},{name:"NeoBank",description:"Digital banking for Gen Z"},{name:"CryptoWallet",description:"Multi-chain wallet with DeFi"}] },
  { name: "Kinetic Atlas Investments", fund: "$320M", check: "$4M–$27M",  founded: "Founded 2016", status: "passed",   about: "Innovation-focused VC firm partnering with visionary entrepreneurs to build market leading companies.", stages: ["Series A","Series B","Series C"], portfolio: [{name:"FusionEnergy",description:"Small modular nuclear reactors"},{name:"MarketingAutomation",description:"AI customer acquisition"},{name:"ComputerVision",description:"Image recognition for vehicles"}] },
];

const SIZES = [100,115,125,105,95,110,90,130,100,88,108,120,95];
const ORDER = [1, 5, 2, 8, 10, 0, 4, 6];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

export default function VCMockup({ autoStart = false }) {
  const [activeIdx, setActiveIdx] = useState(null);
  const [clickingIdx, setClickingIdx] = useState(null);
  const [isDone, setIsDone] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const activeRef = useRef(false);

  useEffect(() => {
    if (autoStart) setIsStarted(true);
  }, [autoStart]);

  useEffect(() => {
    if (!isStarted) return;
    activeRef.current = true;
    setIsDone(false);
    runLoop();
  }, [isStarted]);

  function replay(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    activeRef.current = false;
    setIsDone(false);
    setActiveIdx(null);
    setClickingIdx(null);
    setIsStarted(false);
    setTimeout(() => setIsStarted(true), 100);
  }

  async function runLoop() {
    for (let idx = 0; idx < ORDER.length; idx++) {
      if (!activeRef.current) return;
      const i = ORDER[idx];
      setClickingIdx(i);
      await sleep(220);
      setClickingIdx(null);
      await sleep(150);
      setActiveIdx(i);
      await sleep(4200);
      if (!activeRef.current) return;
      setActiveIdx(null);
      await sleep(500);
    }
    setIsDone(true);
  }

  const activeFirm = activeIdx !== null ? FIRMS[activeIdx] : null;

  const PREVIEW_FIRMS = [
    { name: "Meridian Stone Capital", initials: "MS", fund: "$290M", check: "$4M–$30M", founded: "Founded 2018", status: "meeting",  statusLabel: "Meeting",   statusBg: "#ede9fe", statusColor: "#7c3aed", cardBg: "#f5f3ff", accentColor: "#6c47ff", tagBg: "#ede9fe", tagColor: "#6c47ff", about: "Strategic investment partner focused on transformative technologies shaping tomorrow's economy.", avatarBg: "linear-gradient(135deg,#7c3aed,#6366f1)" },
    { name: "Velocity Wave Partners",  initials: "VW", fund: "$520M", check: "$6M–$45M", founded: "Founded 2011", status: "pending",  statusLabel: "Pending",   statusBg: "#fef9c3", statusColor: "#b45309", cardBg: "#fefce8", accentColor: "#b45309", tagBg: "#fef9c3", tagColor: "#b45309", about: "Innovation-driven VC firm backing entrepreneurs building the next generation of market leaders.", avatarBg: "linear-gradient(135deg,#f59e0b,#facc15)" },
    { name: "Summit Peak Ventures",    initials: "SP", fund: "$480M", check: "$5M–$40M", founded: "Founded 2013", status: "interest", statusLabel: "Interested", statusBg: "#f3e8ff", statusColor: "#7c3aed", cardBg: "#faf5ff", accentColor: "#7c3aed", tagBg: "#f3e8ff", tagColor: "#7c3aed", about: "Premier venture capital firm focused on backing exceptional entrepreneurs across high-growth sectors.", avatarBg: "linear-gradient(135deg,#c084fc,#a855f7)" },
  ];

  if (!autoStart) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link href="/vc-mockup" className="block relative group cursor-pointer">

          {/* Mobile */}
          <div className="sm:hidden" style={{ borderRadius: 16, overflow: "hidden", position: "relative" }}>
            <div style={{ pointerEvents: "none", userSelect: "none", background: "#f8f9fb", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              {PREVIEW_FIRMS.slice(0, 2).map((f, i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: f.avatarBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#fff" }}>{f.initials}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#111" }}>{f.name}</div>
                    </div>
                    <span style={{ fontSize: 8, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: f.statusBg, color: f.statusColor }}>● {f.statusLabel}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <div style={{ background: f.cardBg, borderRadius: 6, padding: "5px 8px", flex: 1 }}><div style={{ fontSize: 7, color: "#9ca3af" }}>Fund</div><div style={{ fontSize: 12, fontWeight: 700, color: f.accentColor }}>{f.fund}</div></div>
                    <div style={{ background: f.cardBg, borderRadius: 6, padding: "5px 8px", flex: 1 }}><div style={{ fontSize: 7, color: "#9ca3af" }}>Check</div><div style={{ fontSize: 10, fontWeight: 700, color: f.accentColor }}>{f.check}</div></div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(108,71,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(108,71,255,0.5)" }}>
                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[17px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
              </div>
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden sm:block relative">
            <div style={{ pointerEvents: "none", userSelect: "none", background: "#f8f9fb", borderRadius: 16, padding: 20 }}>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 14 }}>
                {[["Not contacted","#3b82f6"],["Pending","#facc15"],["Interested","#c084fc"],["Meeting","#7c3aed"],["Passed","#ef4444"]].map(([l,c]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#6b7280" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: c, flexShrink: 0 }} />{l}
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {PREVIEW_FIRMS.map((f, i) => (
                  <div key={i} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: f.avatarBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff" }}>{f.initials}</div>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: f.statusBg, color: f.statusColor }}>● {f.statusLabel}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 2 }}>{f.name}</div>
                    <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 10 }}>{f.founded}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
                      <div style={{ background: f.cardBg, borderRadius: 6, padding: "6px 8px" }}><div style={{ fontSize: 8, color: "#9ca3af", marginBottom: 1 }}>Fund</div><div style={{ fontSize: 13, fontWeight: 700, color: f.accentColor }}>{f.fund}</div></div>
                      <div style={{ background: f.cardBg, borderRadius: 6, padding: "6px 8px" }}><div style={{ fontSize: 8, color: "#9ca3af", marginBottom: 1 }}>Check</div><div style={{ fontSize: 11, fontWeight: 700, color: f.accentColor }}>{f.check}</div></div>
                    </div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
                      {["Series A","Series B","Series C"].map(s => <span key={s} style={{ background: f.tagBg, color: f.tagColor, fontSize: 8, fontWeight: 600, padding: "2px 7px", borderRadius: 20 }}>{s}</span>)}
                    </div>
                    <div style={{ fontSize: 10, color: "#6b7280", lineHeight: 1.5 }}>{f.about}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110" style={{ background: "rgba(108,71,255,0.9)" }}>
                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
              </div>
            </div>
          </div>

        </Link>
      </div>
    );
  }

  return (
    <div className="px-6">
      <div className="max-w-4xl mx-auto">
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, border: "0.5px solid rgba(255,255,255,0.12)", padding: "28px 24px" }}>
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 14, marginBottom: 24 }}>
            {[{ label: "Not contacted", color: "linear-gradient(135deg,#3b82f6,#6366f1)" },{ label: "Pending review", color: "#facc15" },{ label: "Interested", color: "#c084fc" },{ label: "Meeting scheduled", color: "#7c3aed" },{ label: "Passed", color: "#ef4444" }].map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                {item.label}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: 18, marginBottom: activeFirm ? 24 : 0 }}>
            {FIRMS.map((firm, i) => {
              const sz = SIZES[i % SIZES.length];
              const bg = STATUS_COLORS[firm.status];
              const isClicking = clickingIdx === i;
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
                  <div style={{ width: sz, height: sz, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", transform: isClicking ? "scale(0.88)" : "scale(1)", filter: isClicking ? "brightness(1.3)" : "none", transition: "transform 0.15s" }}>
                    <span style={{ fontSize: sz > 110 ? 12 : 10, fontWeight: 700, color: "#fff", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.35)", padding: 6, lineHeight: 1.2 }}>{firm.fund}</span>
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 500, color: "rgba(255,255,255,0.55)", textAlign: "center", maxWidth: 90 }}>{firm.name}</div>
                </div>
              );
            })}
          </div>
          {activeFirm && (
            <div style={{ background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: 20, maxWidth: 500, margin: "0 auto", animation: "vcFadeUp 0.4s ease forwards" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14, borderBottom: "0.5px solid rgba(255,255,255,0.1)", paddingBottom: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: STATUS_COLORS[activeFirm.status], display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#fff", textAlign: "center" }}>{activeFirm.fund}</span>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>{activeFirm.name}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{activeFirm.founded}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{activeFirm.about}</div>
              <button style={{ width: "100%", marginTop: 14, background: "linear-gradient(to right,#3b82f6,#6366f1)", color: "#fff", border: "none", borderRadius: 8, padding: 9, fontSize: 12, fontWeight: 500, cursor: "default" }}>Contact Firm</button>
            </div>
          )}
        </div>
        {isDone && (
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button type="button" onClick={replay} style={{ background: "rgba(255,255,255,0.1)", border: "0.5px solid rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 600, padding: "8px 24px", borderRadius: 20, cursor: "pointer" }}>↺ Replay</button>
          </div>
        )}
      </div>
      <style>{`@keyframes vcFadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
