"use client";
// src/app/zigforge/page.jsx
import React, { useEffect, useRef } from 'react';

export default function ZigForgePage() {
  const fadeRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('visible');
        });
      },
      { threshold: 0.08 }
    );
    fadeRefs.current.forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  const addFadeRef = (el) => {
    if (el && !fadeRefs.current.includes(el)) fadeRefs.current.push(el);
  };

  return (
    <>
      <style>{`
        .zf-fade-in {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .zf-fade-in.visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      <div style={{ background: '#1a1a3e', color: '#e8e8f0', fontFamily: 'Inter, sans-serif', lineHeight: 1.6, overflowX: 'hidden', minHeight: '100vh' }}>

        {/* HERO */}
        <div style={{
          minHeight: '100vh',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '120px 24px 80px',
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,58,237,0.25) 0%, transparent 70%), linear-gradient(180deg, #1a1a3e 0%, #1e1d50 100%)',
        }}>
          <h1 style={{ fontSize: 'clamp(44px, 7vw, 90px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.03em', marginBottom: 12, color: 'white' }}>
            <span style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              ZigForge
            </span>
          </h1>
          <div style={{ fontSize: 'clamp(18px, 2.5vw, 26px)', fontWeight: 600, color: 'rgba(232,232,240,0.5)', marginBottom: 24, letterSpacing: '-0.01em' }}>
            Zig it. Then build it.
          </div>
          <p style={{ fontSize: 17, color: 'rgba(232,232,240,0.55)', maxWidth: 580, margin: '0 auto 48px', lineHeight: 1.7 }}>
            A prototype builder designed for early-stage founders — visualize your app idea at every stage of development, from first sketch to investor-ready mockup, before writing a single line of code.
          </p>
          <a href="#journey" style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            color: 'white', fontSize: 16, fontWeight: 700,
            padding: '16px 40px', borderRadius: 12, textDecoration: 'none',
            boxShadow: '0 0 40px rgba(124,58,237,0.3)',
          }}>
            See how it works
          </a>
        </div>

        {/* DIVIDER */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', maxWidth: 960, margin: '0 auto' }} />

        {/* PHILOSOPHY */}
        <div ref={addFadeRef} className="zf-fade-in" style={{ maxWidth: 960, margin: '0 auto', padding: '100px 24px' }}>
          <h2 style={{ fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20, color: 'white' }}>
            You don't need to know<br />what you want{' '}
            <span style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>yet</span>
          </h2>
          <div style={{ maxWidth: 720 }}>
            <p style={{ fontSize: 17, color: 'rgba(232,232,240,0.6)', lineHeight: 1.8, marginBottom: 16 }}>
              A prototype is a visual, interactive mockup of your app — not the real product, but a realistic representation of how it will look and feel. ZigForge lets you build prototypes at any stage: to clarify your own thinking, to test with real users, or to present to investors.
            </p>
            <p style={{ fontSize: 17, color: 'rgba(232,232,240,0.6)', lineHeight: 1.8, marginBottom: 16 }}>
              Many founders come with an idea but without a clear picture of what their product should look like. That's completely normal.{' '}
              <strong style={{ color: '#c4b5fd', fontWeight: 600 }}>The path to building the right product often goes through seeing it first.</strong>
            </p>
            <p style={{ fontSize: 17, color: 'rgba(232,232,240,0.6)', lineHeight: 1.8 }}>
              Start for free — no credits, no commitment. Build skeleton versions, try different screens, download and compare. Only when you have a clear direction does it make sense to bring in AI. And even then —{' '}
              <strong style={{ color: '#c4b5fd', fontWeight: 600 }}>start with BASIC, iterate, then upgrade to BOOST</strong> only when you know exactly what you want.
            </p>
          </div>
        </div>

        {/* DIVIDER */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', maxWidth: 960, margin: '0 auto' }} />

        {/* JOURNEY */}
        <div id="journey" style={{ maxWidth: 960, margin: '0 auto', padding: '100px 24px' }}>
          <div ref={addFadeRef} className="zf-fade-in">
            <h2 style={{ fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20, color: 'white' }}>
              Three stages,<br />
              <span style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>your pace</span>
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(232,232,240,0.5)', maxWidth: 580, marginBottom: 64, lineHeight: 1.7 }}>
              Each stage builds on the previous one. There's no rush — and no wrong order.
            </p>
          </div>

          {/* PHASES */}
          <div ref={addFadeRef} className="zf-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>

            {/* FREE */}
            <Phase
              badge="Free" badgeStyle={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }}
              title="Explore & understand"
              subtitle="No credits needed — build as many versions as you want"
              credits="0" creditsLabel="credits"
              steps={[
                { num: 1, text: <><strong>Describe your app</strong> — Enter your App Title, a short Tagline, and an Overview: who is it for, what problem does it solve, what makes it different.</> },
                { num: 2, text: <><strong>Choose your screens</strong> — Activate the features you want. Each feature becomes one screen. You can also add custom screens with your own name and description.</> },
                { num: 3, text: <><strong>Preview in real time</strong> — See a functional prototype instantly. No AI yet — just your structure, your content, your navigation.</> },
                { num: 4, text: <><strong>Download and compare</strong> — Build several versions, share them, gather feedback. Repeat until you have a clear direction.</> },
              ]}
              note="This stage is about clarity. Don't rush to AI until you have a good sense of your screens, your flow, and your content direction."
            />

            {/* BASIC */}
            <Phase
              badge="BASIC · MVP" badgeStyle={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', color: '#a78bfa' }}
              title="Validate with AI"
              subtitle="Professional prototype — up to 4 screens, real design"
              credits="5" creditsLabel="credits / run"
              steps={[
                { num: 1, text: <><strong>Choose your visual direction</strong> — Select a venture type (Social, SaaS, Marketplace, Service) and a design style. This guides the AI on layout, imagery, and tone.</> },
                { num: 2, text: <><strong>AI builds each screen individually</strong> — The AI uses your structure, content and design preferences to generate a professional mockup. Takes 1–3 minutes.</> },
                { num: 3, text: <><strong>Download and test</strong> — Share with users, mentors, or your team. Get real feedback on a real-looking prototype.</> },
                { num: 4, text: <><strong>Improve as many times as needed</strong> — Write short feedback and re-generate. Each improvement costs 5 credits and rebuilds all screens from scratch.</> },
              ]}
              note="Iterate here as much as you need. BASIC is designed for affordable, fast cycles until you're confident in the result."
            />

            {/* BOOST */}
            <Phase
              badge="BOOST · MLP" badgeStyle={{ background: 'rgba(236,72,153,0.12)', border: '1px solid rgba(236,72,153,0.25)', color: '#f472b6' }}
              title="Present with confidence"
              subtitle="Investor-ready — up to 8 screens, rich design, full polish"
              credits="10" creditsLabel="credits / run"
              steps={[
                { num: 1, text: <><strong>Only when you're ready</strong> — Use BOOST after you've validated your direction with BASIC. Don't spend 10 credits on a first draft.</> },
                { num: 2, text: <><strong>Up to 8 screens</strong> — A more complete product story. Richer content, more sophisticated layout, stronger visual impact.</> },
                { num: 3, text: <><strong>Built for high-stakes moments</strong> — Investor meetings, demo days, team alignment, or any moment where first impressions matter.</> },
              ]}
              note="Our recommendation: reach BOOST only after at least one solid BASIC iteration. The result will be dramatically better when you already know what you want."
            />

          </div>
        </div>

        {/* DIVIDER */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', maxWidth: 960, margin: '0 auto' }} />

        {/* ITERATIONS */}
        <div ref={addFadeRef} className="zf-fade-in" style={{ maxWidth: 960, margin: '0 auto', padding: '100px 24px' }}>
          <h2 style={{ fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20, color: 'white' }}>
            What the AI can<br />
            <span style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>and cannot do</span>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(232,232,240,0.5)', maxWidth: 580, marginBottom: 40, lineHeight: 1.7 }}>
            Every re-run rebuilds all screens from scratch. The AI starts fresh each time — it has no memory of previous versions.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { yes: true,  text: <><strong>Works:</strong> "Make the colors darker and more corporate"</> },
              { yes: true,  text: <><strong>Works:</strong> "Add more detail to the pricing screen" or "Make the home page feel more premium"</> },
              { yes: true,  text: <><strong>Works:</strong> "Change the tone — more startup energy, less corporate"</> },
              { yes: true,  text: <><strong>Works:</strong> "Focus more on the community angle, less on features"</> },
              { yes: false, text: <><strong>Won't work:</strong> "Add a new screen" — to add a screen, go back to the feature list, activate it, then re-run. On BASIC the limit is 4 screens; on BOOST up to 8.</> },
              { yes: false, text: <><strong>Won't work:</strong> "Keep what you did last time but change X" — the AI has no memory between runs.</> },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 7, background: item.yes ? '#4ade80' : '#f472b6' }} />
                <p style={{ fontSize: 14, color: 'rgba(232,232,240,0.55)', lineHeight: 1.6 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* DIVIDER */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', maxWidth: 960, margin: '0 auto' }} />

        {/* BETA / STARTZIG CONNECTION */}
        <div ref={addFadeRef} className="zf-fade-in" style={{ maxWidth: 960, margin: '0 auto', padding: '100px 24px' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(236,72,153,0.08))',
            border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: 20, padding: '56px 48px', textAlign: 'center',
          }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 16, color: 'white' }}>
              From prototype to{' '}
              <span style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>real traction</span>
            </h2>
            <p style={{ fontSize: 17, color: 'rgba(232,232,240,0.55)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
              ZigForge is where your idea takes shape. StartZig is where it takes off. Upload your prototype to your venture page, invite early users and fellow founders to explore it, and start collecting real feedback — before you write a single line of code.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/zigforge" style={{
                display: 'inline-block', background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                color: 'white', fontSize: 15, fontWeight: 700, padding: '14px 32px',
                borderRadius: 10, textDecoration: 'none', boxShadow: '0 0 30px rgba(124,58,237,0.25)',
              }}>
                Launch ZigForge
              </a>
              <a href="/" style={{
                display: 'inline-block', background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(232,232,240,0.8)',
                fontSize: 15, fontWeight: 600, padding: '14px 32px', borderRadius: 10, textDecoration: 'none',
              }}>
                Back to StartZig
              </a>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer style={{ textAlign: 'center', padding: '60px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', color: 'rgba(232,232,240,0.35)', fontSize: 14 }}>
          <p>ZigForge · Part of <a href="/" style={{ color: '#a78bfa', textDecoration: 'none' }}>StartZig</a> — the startup ecosystem for early-stage founders</p>
          <p style={{ marginTop: 8, fontSize: 12, opacity: 0.6 }}>Questions? Reach us through the app.</p>
        </footer>

      </div>
    </>
  );
}

// ── Phase sub-component ──────────────────────────────────────────
function Phase({ badge, badgeStyle, title, subtitle, credits, creditsLabel, steps, note }) {
  return (
    <div style={{ background: '#1a1a3e' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '28px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap' }}>
        <span style={{ flexShrink: 0, padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', whiteSpace: 'nowrap', ...badgeStyle }}>
          {badge}
        </span>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'white', marginBottom: 3 }}>{title}</h3>
          <p style={{ fontSize: 13, color: 'rgba(232,232,240,0.4)' }}>{subtitle}</p>
        </div>
        <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: 24, fontWeight: 900, color: 'white', display: 'block', letterSpacing: '-0.02em' }}>{credits}</span>
          <span style={{ fontSize: 12, color: 'rgba(232,232,240,0.4)' }}>{creditsLabel}</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '32px', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 24 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{
                width: 26, height: 26, borderRadius: 7, background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'rgba(232,232,240,0.4)',
                flexShrink: 0, marginTop: 1,
              }}>
                {s.num}
              </div>
              <p style={{ fontSize: 15, color: 'rgba(232,232,240,0.55)', lineHeight: 1.6 }}>{s.text}</p>
            </div>
          ))}
        </div>
        <div style={{ padding: '14px 18px', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 10, fontSize: 13, color: 'rgba(232,232,240,0.5)', lineHeight: 1.6 }}>
          {note}
        </div>
      </div>
    </div>
  );
}
