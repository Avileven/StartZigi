"use client";
import React, { useState } from 'react';
import { InvokeLLM } from '@/api/integrations';

const buildPrompt = (data) => `
You are a senior software architect and product strategist.
A founder has just built an app mockup using a visual studio tool.
Your job is to generate a precise Development Blueprint based on their mockup data.

## MOCKUP DATA:
- App Name: ${data.appTitle}
- App Description: ${data.appDescription}
- Venture Type: ${data.ventureType}
- Selected Features: ${data.features.map(f => `${f.name}: ${f.description}`).join(' | ')}
- Design: Color scheme: ${data.colorScheme}, Style: ${data.style}
- Build Goal: ${data.buildGoal}
- AI Tool Preference: ${data.aiTool}

---

## YOUR OUTPUT — 3 SECTIONS:

### SECTION 1: READY-TO-USE AI PROMPT
Write a detailed, copy-paste ready prompt the founder can paste into any AI coding tool.

Structure it like this — replace with the actual app data:

"Build me a [ventureType] app called [appTitle].

Purpose: [one sentence from appDescription]

Color scheme: primary [hex], secondary [hex], background [hex], cards [hex].
Use Inter font. Style: [style] with rounded corners and subtle shadows.

Screens and features:
1. [Feature Name] — [exact behavior: what user sees, what they can do, what happens on click]
2. [Feature Name] — [same level of detail]
(continue for all features)

User flow: User lands on [first screen] → [describe navigation path] → [describe key actions]

Data needed: [list what needs to be stored]
Auth: [yes/no, what type]
Realtime: [yes/no, which features need live updates]"

Be specific. Do not write vague instructions like "add a feed" —
write "display a scrollable list of posts with avatar, username, timestamp,
and like button. Clicking a post opens a detail view."

---

### SECTION 2: RECOMMENDED TECH STACK

For each layer, use this exact format:

**[Layer]: [Tool name]**
- What it does in this app: [specific to THIS app's features, not generic]
- Why it fits: [one concrete reason based on the features chosen]
- Monthly cost: [free / $X]
- Exit flexibility: [how easy to migrate or own the code fully]

Cover: Frontend, Backend & Database, Auth, Hosting.
Add Payments only if the app has a business model or payments feature.
Add Realtime only if the app has messaging or live feed features.
Do NOT recommend tools the app doesn't need.

---

### SECTION 3: AI-ASSISTED EXECUTION PLAN

Assume the founder builds using ${data.aiTool === 'Not sure yet' ? 'an AI coding tool (Cursor, Claude Code, or v0)' : data.aiTool}.

**Phase 1 — Definition (1-2 days)**
- Refine and test the AI prompt from Section 1
- Set up project structure and connect database
- Define data models: list the specific tables needed for THIS app's features

**Phase 2 — Core Build (~2-4 hours per feature with AI)**
For each feature in this app, write:
- [Feature name]: what to prompt the AI to build, what edge cases to watch for
Mark complex features with ⚠️ and explain why. Example:
"⚠️ Realtime messaging — AI often gets subscription logic wrong, expect 2-3 correction rounds."

**Phase 3 — Iterations & Fixes (2-5 days)**
- What AI handles well in this app: [based on chosen features]
- What needs human judgment: [specific — auth edge cases, payment webhooks, mobile layout, etc.]
- Estimated total time: [realistic based on feature count and complexity]

**Phase 4 — Upgrade Path**
- Current setup works until: [specific threshold — users, features, or scale]
- Signs you've outgrown it: [2-3 concrete signals for this app]
- Clean exit strategy: [exact steps to take]
- What NOT to rebuild: [what stays the same when upgrading]

---

Keep the tone direct and practical. No fluff.
Every recommendation must reference the actual app features — no generic advice.
`;

export default function PromptGenerator({ appState, ventureType, designPrefs }) {
  const [buildGoal, setBuildGoal] = useState('');
  const [aiTool, setAiTool] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [blueprint, setBlueprint] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const activeFeatures = appState.features.filter(f => f.isActive);
  const canGenerate = buildGoal && aiTool && appState.appTitle?.trim();

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setIsGenerating(true);
    setBlueprint('');
    setError('');

    try {
      const data = await InvokeLLM({
        prompt: buildPrompt({
          appTitle: appState.appTitle,
          appDescription: appState.appDescription || 'No description provided',
          ventureType: ventureType || 'general',
          features: activeFeatures,
          colorScheme: designPrefs?.colorScheme || 'colorful',
          style: designPrefs?.style || 'modern',
          buildGoal,
          aiTool,
        }),
        creditType: 'prompt_generator',
      });
      setBlueprint(data?.response || '');
    } catch (err) {
      if (err.message === 'NO_CREDITS') {
        setError('Not enough credits. Please upgrade your plan.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(blueprint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([blueprint], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${appState.appTitle || 'blueprint'}_development_blueprint.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: 24, marginTop: 16 }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a3e', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          🗺️ Development Blueprint
          <span style={{ fontSize: 11, fontWeight: 700, background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: 'white', padding: '2px 8px', borderRadius: 20 }}>10 credits</span>
        </h2>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 6, marginBottom: 0 }}>
          Generate a ready-to-use AI prompt, tech stack recommendation, and execution plan based on your mockup.
        </p>
      </div>

      {/* Questions — only show if no blueprint yet */}
      {!blueprint && !isGenerating && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Build Goal */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>What's your build goal?</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { val: 'Quick MVP — validate the idea fast', icon: '⚡', desc: 'Ship in days, iterate on feedback' },
                { val: 'Long-term product — build and scale', icon: '🏗️', desc: 'Solid foundation for growth' },
              ].map(({ val, icon, desc }) => (
                <button
                  key={val}
                  onClick={() => setBuildGoal(val)}
                  style={{
                    padding: '12px', borderRadius: 12, textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s',
                    border: buildGoal === val ? '2px solid #7c3aed' : '2px solid #e5e7eb',
                    background: buildGoal === val ? '#f5f3ff' : 'white',
                  }}
                >
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937' }}>{val.split('—')[0].trim()}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* AI Tool */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Which AI coding tool will you use?</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { val: 'Cursor', desc: 'VS Code + AI, full control' },
                { val: 'Claude Code', desc: 'Terminal-based, powerful' },
                { val: 'v0 by Vercel', desc: 'UI-first, fast prototyping' },
                { val: 'Not sure yet', desc: "I'll decide later" },
              ].map(({ val, desc }) => (
                <button
                  key={val}
                  onClick={() => setAiTool(val)}
                  style={{
                    padding: '12px', borderRadius: 12, textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s',
                    border: aiTool === val ? '2px solid #7c3aed' : '2px solid #e5e7eb',
                    background: aiTool === val ? '#f5f3ff' : 'white',
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937' }}>{val}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626', fontWeight: 500 }}>
              ⚠️ {error}
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            style={{
              width: '100%', padding: '16px', fontSize: 16, fontWeight: 800, borderRadius: 12, border: 'none', cursor: canGenerate ? 'pointer' : 'not-allowed',
              background: canGenerate ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : '#d1d5db',
              color: 'white', boxShadow: canGenerate ? '0 4px 20px rgba(124,58,237,0.3)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            🗺️ Generate Blueprint — 10 credits
          </button>
        </div>
      )}

      {/* Loading */}
      {isGenerating && (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚙️</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#374151' }}>Analyzing your mockup...</p>
          <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>This takes about 15-20 seconds</p>
        </div>
      )}

      {/* Result */}
      {blueprint && !isGenerating && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1f2937', margin: 0 }}>✅ Blueprint Ready</h3>
            <button
              onClick={() => { setBlueprint(''); setBuildGoal(''); setAiTool(''); setError(''); }}
              style={{ fontSize: 12, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Start over
            </button>
          </div>

          <div style={{ background: '#f9fafb', borderRadius: 12, padding: 16, border: '1px solid #e5e7eb', maxHeight: 380, overflowY: 'auto' }}>
            <pre style={{ fontSize: 12, color: '#374151', whiteSpace: 'pre-wrap', fontFamily: 'monospace', lineHeight: 1.6, margin: 0 }}>
              {blueprint}
            </pre>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button
              onClick={handleCopy}
              style={{ padding: '14px', fontSize: 14, fontWeight: 700, borderRadius: 12, border: 'none', cursor: 'pointer', background: '#1f2937', color: 'white' }}
            >
              {copied ? '✅ Copied!' : '📋 Copy'}
            </button>
            <button
              onClick={handleDownload}
              style={{ padding: '14px', fontSize: 14, fontWeight: 700, borderRadius: 12, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white' }}
            >
              📥 Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
