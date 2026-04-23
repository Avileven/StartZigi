'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { InvokeLLM } from '@/api/integrations';
import { Lock, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─── Constants ────────────────────────────────────────────────────────────────

const ELIGIBLE_PLANS = ['pro_founder', 'unicorn'];

const GOALS = [
  { val: 'Investor / Partner Pitch', icon: '🎯', desc: 'Show your vision — not production-ready code' },
  { val: 'Market Validation', icon: '🔍', desc: 'Test your core idea with real users' },
  { val: 'Full Product Development', icon: '🏗️', desc: 'Build a scalable, production-ready product' },
];

const PLATFORMS = [
  { val: 'Web', icon: '🌐' },
  { val: 'Mobile', icon: '📱' },
  { val: 'Both', icon: '🖥️📱' },
];

const AUDIENCES = [
  { val: 'B2C', desc: 'Direct to consumers' },
  { val: 'B2B', desc: 'Businesses as customers' },
];

const DEV_APPROACHES = [
  { val: 'Vibe Coding — with Claude', desc: 'Claude Code, Claude.ai' },
  { val: 'Vibe Coding — with ChatGPT', desc: 'ChatGPT, Codex' },
  { val: 'Vibe Coding — with Gemini', desc: 'Gemini, Google AI Studio' },
  { val: 'Vibe Coding — via a platform', desc: 'Lovable, Bolt, and similar' },
  { val: 'Solo Developer', desc: 'Traditional development without AI' },
];

const SCALE_LIMITS = [
  { val: 'demo', label: '🧪 Demo only', desc: 'A few people will see this' },
  { val: 'early', label: '👥 Early users', desc: 'Up to 100 users' },
  { val: 'growing', label: '📈 Growing product', desc: 'Up to 10K users' },
  { val: 'production', label: '🚀 Production', desc: 'Built to scale' },
];

const INFRA_FLAGS = [
  { val: 'auth', label: '🔐 User Authentication', desc: 'Login, registration, secure access' },
  { val: 'payments', label: '💳 Payments / Subscriptions', desc: 'Stripe, billing, subscription tiers' },
  { val: 'realtime', label: '⚡ Realtime Features', desc: 'Messaging, live feed, notifications' },
  { val: 'ai', label: '🤖 AI Integration', desc: 'AI features, chatbots, recommendations' },
];

// ─── Prompt Builder ───────────────────────────────────────────────────────────

const buildPrompt = ({ appName, appDescription, features, goal, platform, audience, devApproach, infraFlags, scaleLimit }) => {
  const flagLabels = { auth: 'User Authentication', payments: 'Payments/Subscriptions', realtime: 'Realtime Features', ai: 'AI Integration' };
  const selectedFlags = infraFlags.map(f => flagLabels[f]).join(', ') || 'None';

  const goalBlock = {
    'Investor / Partner Pitch': `Focus on visual quality and UX flow. Do not recommend complex backend infrastructure. Suggest mock data where possible. Flag clearly that this prototype is disposable and cannot be evolved into production without a full rebuild.`,
    'Market Validation': `Focus on one or two core features only. Recommend the simplest real database that allows future upgrade. Flag any feature that adds unnecessary complexity at this stage and suggest deferring it to V2.`,
    'Full Product Development': `Focus on architecture quality and scalability. Recommend tools with full code ownership and upgrade flexibility. Flag any shortcut that creates technical debt.`,
  }[goal] || '';

  const platformBlock = {
    'Web': `Recommend Next.js as frontend. Base time estimates on web development.`,
    'Mobile': `Recommend React Native with Expo. Add 30-50% to time estimates compared to web. Flag app store review time (1-2 weeks).`,
    'Both': `Flag high risk of shallow quality on both platforms. Recommend web-first approach and mobile in V2 unless there is a specific reason to build both simultaneously.`,
  }[platform] || '';

  const audienceBlock = {
    'B2C': `Focus on onboarding simplicity, social features, and consumer payment UX.`,
    'B2B': `Flag that roles, permissions, and admin dashboard add significant complexity. Recommend planning the data model before writing any code.`,
  }[audience] || '';

  const devBlock = {
    'Vibe Coding — with Claude': `Provide feature-specific prompts optimized for Claude. Flag which features Claude handles poorly and require human review.`,
    'Vibe Coding — with ChatGPT': `Provide feature-specific prompts optimized for ChatGPT. Flag which features require multiple correction rounds.`,
    'Vibe Coding — with Gemini': `Provide feature-specific prompts optimized for Gemini. Flag which features require multiple correction rounds.`,
    'Vibe Coding — via a platform': `Flag platform lock-in risk in every section. Warn that virtual databases cannot be upgraded. Recommend only for Investor Pitch goal.`,
    'Solo Developer': `Estimate time without AI assistance. Recommend hiring for complex areas like payments and security.`,
  }[devApproach] || '';

  const scaleBlock = {
    'demo': `Scale: Demo only. Mock data is acceptable. No upgrade path needed. Platform-based tools are perfectly suitable. Never use real payments or real user data.`,
    'early': `Scale: Up to 100 users. Must use a real database (Supabase free tier is sufficient). Platform tools are acceptable but warn about lock-in. Upgrade path is not urgent but should be mentioned.`,
    'growing': `Scale: Up to 10K users. Real database is mandatory. Platform tools are not recommended — lock-in will become painful at this scale. Upgrade path must be planned from day one.`,
    'production': `Scale: Production-ready. PostgreSQL with proper architecture. Platform tools are not acceptable under any circumstance. Upgrade path and scalability are central to every recommendation.`,
  }[scaleLimit] || '';

  const infraBlocks = [];
  if (infraFlags.includes('auth')) infraBlocks.push(`🔐 AUTH: Add 2-4 days to timeline. Recommend Supabase Auth. Flag that auth is infrastructure — it affects every part of the app.`);
  if (infraFlags.includes('payments')) infraBlocks.push(`💳 PAYMENTS: Add 3-5 days to timeline. Recommend Stripe. Flag that webhook handling requires human review — AI cannot be trusted here alone. If goal is Investor Pitch, recommend mocking payments entirely.`);
  if (infraFlags.includes('realtime')) infraBlocks.push(`⚡ REALTIME: Add 2-4 days to timeline. Recommend Supabase Realtime. Flag that AI often generates incorrect subscription logic — expect 2-3 correction rounds.`);
  if (infraFlags.includes('ai')) infraBlocks.push(`🤖 AI INTEGRATION: Add 2-3 days to timeline. Flag monthly API costs starting immediately ($20-100/month). Flag that prompt engineering requires ongoing human iteration.`);

  const scaleInfraWarnings = [];
  if (scaleLimit === 'demo' && infraFlags.includes('payments')) scaleInfraWarnings.push(`⚠️ Payments + Demo: Never use real Stripe in a demo — mock payments only.`);
  if (scaleLimit === 'production' && infraFlags.includes('realtime')) scaleInfraWarnings.push(`⚠️ Realtime + Production: Supabase Realtime has limits at scale — consider dedicated WebSocket infrastructure.`);
  if (scaleLimit === 'growing' && infraFlags.includes('auth')) scaleInfraWarnings.push(`⚠️ Auth + Growing: Plan user roles and permissions now — retrofitting them later is expensive.`);
  if ((scaleLimit === 'growing' || scaleLimit === 'production') && devApproach === 'Vibe Coding — via a platform') scaleInfraWarnings.push(`⚠️ Platform + ${scaleLimit === 'growing' ? '10K users' : 'Production'}: Platform lock-in becomes a serious problem at this scale. Strongly reconsider.`);

  const featureList = features.map(f => `- ${f.name}${f.description ? ': ' + f.description : ''} [${f.priority}]`).join('\n');

  return `You are a senior software architect and product strategist.
A founder wants to build a prototype for their product.
Generate a precise Development Plan based on all the data below.

---

## PRODUCT DATA:
- Name: ${appName}
- Description: ${appDescription}

## FEATURES (with founder priority):
${featureList}

## FOUNDER CHOICES:
- Goal: ${goal}
- Platform: ${platform}
- Target Audience: ${audience}
- Development Approach: ${devApproach}
- Infrastructure Requirements: ${selectedFlags}
- Scale Target: ${scaleLimit}

---

## ANALYSIS INSTRUCTIONS:

### GOAL CONTEXT:
${goalBlock}

### PLATFORM CONTEXT:
${platformBlock}

### AUDIENCE CONTEXT:
${audienceBlock}

### DEVELOPMENT APPROACH CONTEXT:
${devBlock}

### SCALE CONTEXT:
${scaleBlock}

${scaleInfraWarnings.length > 0 ? `### SCALE + INFRASTRUCTURE WARNINGS:\n${scaleInfraWarnings.join('\n')}` : ''}

${infraBlocks.length > 0 ? `### INFRASTRUCTURE ANALYSIS:\n${infraBlocks.join('\n')}` : ''}

### FEATURE ANALYSIS INSTRUCTIONS:
Review each feature independently. For every feature assess:
- Complexity level: Simple / Medium / Complex
- Hidden dependencies (auth, database, realtime, payments)
- Recommendation: Include now / Simplify / Defer to V2
Pay attention to the founder's priority — Must Have features should always be included unless they are dangerously complex for the chosen goal.
If a feature is marked Nice to Have or Future and is complex, recommend deferring it.
If too many Must Have features are selected, flag scope creep and suggest a cut.

---

## OUTPUT FORMAT — 4 SECTIONS:

### 1. EXECUTIVE SUMMARY
2-3 sentences only. Overall assessment, realistic timeline, biggest risk.

### 2. ANALYSIS BY PARAMETERS
For each parameter (Goal, Platform, Audience, Dev Approach, Scale, Infrastructure), 2-3 sentences on its specific impact on THIS product — no generic advice.

### 3. FEATURE ANALYSIS
For each feature:
**[Feature Name]** — [Simple/Medium/Complex] — Founder priority: [Must Have/Nice to Have/Future]
- What it requires technically
- Recommendation: Include / Simplify / Defer to V2
- If complex: what is needed and what is the alternative

### 4. READY-TO-USE AI PROMPT
Note: Copy and paste this prompt directly into your AI coding tool.

Include in the prompt:
- Product name and business purpose: ${appName} — ${appDescription}
- All included features with exact behavior descriptions
- UX flow between screens
- Data models needed
- Auth and realtime requirements
- Color scheme and style if applicable

Generate a detailed, copy-paste ready prompt. Be specific — not generic.

Also include at the end of this section a simple text diagram of the User Flow, like:
/auth → [Login] → /home → [Feature] → /detail
                        ↓
                  /dashboard

---

Keep the tone direct and professional. No fluff. Every recommendation must reference the actual product and features.`;
};

// ─── Download as DOCX ────────────────────────────────────────────────────────

async function downloadAsDocx(result, appName) {
  const { Document, Packer, Paragraph, TextRun, BorderStyle, AlignmentType } = await import('docx');

  const lines = result.split('\n');
  const children = [];

  for (const line of lines) {
    if (line.startsWith('## ')) {
      children.push(new Paragraph({
        children: [new TextRun({ text: line.replace('## ', ''), bold: true, size: 32, color: '4c1d95', font: 'Arial' })],
        spacing: { before: 400, after: 160 },
      }));
    } else if (line.startsWith('### ')) {
      children.push(new Paragraph({
        children: [new TextRun({ text: line.replace('### ', ''), bold: true, size: 24, color: '374151', font: 'Arial' })],
        spacing: { before: 280, after: 100 },
      }));
    } else if (line.startsWith('**') && line.endsWith('**')) {
      children.push(new Paragraph({
        children: [new TextRun({ text: line.replace(/\*\*/g, ''), bold: true, size: 20, font: 'Arial' })],
        spacing: { after: 80 },
      }));
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      children.push(new Paragraph({
        children: [new TextRun({ text: line.replace(/^[-*] /, ''), size: 20, font: 'Arial' })],
        indent: { left: 360 },
        spacing: { after: 60 },
      }));
    } else if (line.trim()) {
      children.push(new Paragraph({
        children: [new TextRun({ text: line, size: 20, font: 'Arial' })],
        spacing: { after: 80 },
      }));
    } else {
      children.push(new Paragraph({ children: [] }));
    }
  }

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      children: [
        new Paragraph({
          children: [new TextRun({ text: appName || 'ZigPlan', bold: true, size: 48, color: '4c1d95', font: 'Arial' })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 200 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Development Plan', size: 26, color: '6B7280', font: 'Arial' })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
        }),
        new Paragraph({
          children: [new TextRun({ text: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }), size: 20, color: '9CA3AF', font: 'Arial' })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
        }),
        ...children,
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(appName || 'ZigPlan').replace(/\s+/g, '_')}_DevelopmentPlan_${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).replace(' ', '_')}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ZigPlan() {
  const [userPlan, setUserPlan] = useState('');
  const [isEligible, setIsEligible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Venture data
  const [appName, setAppName] = useState('');
  const [appDescription, setAppDescription] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);

  // Features
  const [features, setFeatures] = useState([]);
  const [newFeature, setNewFeature] = useState({ name: '', description: '', priority: 'Must Have' });

  // Choices — kept in state so they persist after Generate
  const [goal, setGoal] = useState('');
  const [platform, setPlatform] = useState('');
  const [audience, setAudience] = useState('');
  const [devApproach, setDevApproach] = useState('');
  const [scaleLimit, setScaleLimit] = useState('');
  const [infraFlags, setInfraFlags] = useState([]);

  // Output
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showForm, setShowForm] = useState(true);

  // ── Load ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('plan')
          .eq('id', user.id)
          .single();

        const plan = profile?.plan || '';
        setUserPlan(plan);
        setIsEligible(ELIGIBLE_PLANS.includes(plan));

        if (!ELIGIBLE_PLANS.includes(plan)) { setLoading(false); return; }

        const { data: venture } = await supabase
          .from('ventures')
          .select('name, description')
          .eq('created_by', user.email)
          .order('created_date', { ascending: false })
          .limit(1)
          .single();

        if (venture) {
          setAppName(venture.name || '');
          setAppDescription(venture.description || '');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleInfra = (val) => setInfraFlags(prev => prev.includes(val) ? prev.filter(f => f !== val) : [...prev, val]);

  const addFeature = () => {
    if (!newFeature.name.trim()) return;
    setFeatures(prev => [...prev, { id: `f_${Date.now()}`, ...newFeature }]);
    setNewFeature({ name: '', description: '', priority: 'Must Have' });
  };

  const removeFeature = (id) => setFeatures(prev => prev.filter(f => f.id !== id));
  const updatePriority = (id, priority) => setFeatures(prev => prev.map(f => f.id === id ? { ...f, priority } : f));

  const canGenerate = appName.trim() && features.length > 0 && goal && platform && audience && devApproach && scaleLimit;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setIsGenerating(true);
    setResult('');
    setError('');
    setShowForm(false);
    try {
      const data = await InvokeLLM({
        prompt: buildPrompt({ appName, appDescription, features, goal, platform, audience, devApproach, infraFlags, scaleLimit }),
        creditType: 'prompt_generator',
      });
      setResult(data?.response || '');
    } catch (err) {
      setError(err.message === 'NO_CREDITS' ? 'Not enough credits. Please upgrade your plan.' : 'Something went wrong. Please try again.');
      setShowForm(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAgain = () => {
    setResult('');
    setError('');
    setShowForm(true);
  };

  const handleCopy = () => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadAsDocx(result, appName);
    } catch (e) {
      console.error('Download error:', e);
    } finally {
      setDownloading(false);
    }
  };

  const s = (selected) => ({
    padding: '12px 14px', borderRadius: 12, textAlign: 'left', cursor: 'pointer',
    border: `2px solid ${selected ? '#7c3aed' : '#e5e7eb'}`,
    background: selected ? '#f5f3ff' : 'white',
    width: '100%',
  });

  const priorityColor = { 'Must Have': '#7c3aed', 'Nice to Have': '#f59e0b', 'Future': '#9ca3af' };
  const priorityBg = { 'Must Have': '#f5f3ff', 'Nice to Have': '#fffbeb', 'Future': '#f9fafb' };

  // ── States ─────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <p style={{ color: '#9ca3af', fontSize: 15 }}>Loading...</p>
    </div>
  );

  if (!isEligible) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center space-y-5">
        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Upgrade to Access</h2>
        <p className="text-gray-500 leading-relaxed">
          ZigPlan is available exclusively on the <strong>Pro Founder</strong> plan and above.
        </p>
        <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2">
          <p className="text-sm font-semibold text-gray-700">Included with Pro Founder:</p>
          <p className="text-sm text-gray-600">✓ AI-generated development plan based on your product</p>
          <p className="text-sm text-gray-600">✓ Stack recommendations with upgrade path analysis</p>
          <p className="text-sm text-gray-600">✓ Feature complexity breakdown and risk flags</p>
          <p className="text-sm text-gray-600">✓ Ready-to-use prompt for your AI coding tool</p>
          <p className="text-sm text-gray-600">✓ Download as Word (.docx)</p>
        </div>
        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-base font-semibold">Upgrade Plan</Button>
        <p className="text-xs text-gray-400">Current plan: {userPlan || 'explorer'}</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 16px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Header */}
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1a1a3e', margin: 0 }}>ZigPlan</h1>
          <p style={{ fontSize: 13, color: '#7c3aed', fontWeight: 600, marginTop: 2, marginBottom: 10 }}>
            Available exclusively on the Pro Founder plan and above.
          </p>
          <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, margin: 0 }}>
            Ready to turn your mockup into a working prototype? We'll generate a detailed development plan — stack recommendations, risk analysis, feature breakdown, and a prompt ready to use with your AI coding tool.
          </p>
        </div>

        {/* Steps */}
        <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', gap: 16 }}>
          {[
            { n: '1', text: 'Confirm your product details and define the features you want to build' },
            { n: '2', text: 'Answer a few questions about your goal, platform, and development approach' },
            { n: '3', text: 'Get a detailed development plan with a ready-to-use AI coding prompt' },
          ].map(({ n, text }) => (
            <div key={n} style={{ flex: 1, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#7c3aed', color: 'white', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</div>
              <p style={{ fontSize: 12, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>{text}</p>
            </div>
          ))}
        </div>

        {showForm && (
          <>
            {/* Product Info */}
            <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Product</p>

              <div style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Venture Name</p>
                {editingName ? (
                  <input value={appName} onChange={e => setAppName(e.target.value)} onBlur={() => setEditingName(false)} autoFocus
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '2px solid #7c3aed', fontSize: 15, fontWeight: 700, outline: 'none', boxSizing: 'border-box' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#1f2937', margin: 0 }}>{appName || '—'}</p>
                    <button onClick={() => setEditingName(true)} style={{ fontSize: 12, color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Edit</button>
                  </div>
                )}
              </div>

              <div>
                <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Product Description</p>
                {editingDesc ? (
                  <textarea value={appDescription} onChange={e => setAppDescription(e.target.value)} onBlur={() => setEditingDesc(false)} autoFocus rows={3}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '2px solid #7c3aed', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <p style={{ fontSize: 14, color: '#374151', margin: 0, lineHeight: 1.6, flex: 1 }}>{appDescription || '—'}</p>
                    <button onClick={() => setEditingDesc(true)} style={{ fontSize: 12, color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', flexShrink: 0 }}>Edit</button>
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Features for this prototype</p>
              <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 14 }}>Add the features you want to include and set their priority.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                {features.map(f => (
                  <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: `2px solid ${priorityColor[f.priority]}`, background: priorityBg[f.priority] }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937' }}>{f.name}</div>
                      {f.description && <div style={{ fontSize: 12, color: '#9ca3af' }}>{f.description}</div>}
                    </div>
                    <select value={f.priority} onChange={e => updatePriority(f.id, e.target.value)}
                      style={{ fontSize: 12, fontWeight: 700, color: priorityColor[f.priority], border: `1px solid ${priorityColor[f.priority]}`, borderRadius: 6, padding: '3px 6px', background: 'white', cursor: 'pointer', outline: 'none' }}>
                      <option>Must Have</option>
                      <option>Nice to Have</option>
                      <option>Future</option>
                    </select>
                    <button onClick={() => removeFeature(f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 18, fontWeight: 700, lineHeight: 1 }}>×</button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={newFeature.name} onChange={e => setNewFeature(p => ({ ...p, name: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addFeature()} placeholder="Feature name..."
                  style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, outline: 'none' }} />
                <input value={newFeature.description} onChange={e => setNewFeature(p => ({ ...p, description: e.target.value }))} placeholder="Description (optional)"
                  style={{ flex: 2, padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, outline: 'none' }} />
                <select value={newFeature.priority} onChange={e => setNewFeature(p => ({ ...p, priority: e.target.value }))}
                  style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, outline: 'none', cursor: 'pointer' }}>
                  <option>Must Have</option>
                  <option>Nice to Have</option>
                  <option>Future</option>
                </select>
                <button onClick={addFeature} style={{ padding: '8px 14px', borderRadius: 8, background: '#7c3aed', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>+ Add</button>
              </div>
            </div>

            {/* Goal */}
            <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>What's your goal?</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {GOALS.map(({ val, icon, desc }) => (
                  <button key={val} onClick={() => setGoal(val)} style={s(goal === val)}>
                    <span style={{ fontSize: 18, marginRight: 10 }}>{icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1f2937' }}>{val}</span>
                    <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 8 }}>— {desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Platform */}
            <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Platform</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {PLATFORMS.map(({ val, icon }) => (
                  <button key={val} onClick={() => setPlatform(val)} style={{ ...s(platform === val), textAlign: 'center' }}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937' }}>{val}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Audience */}
            <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Audience</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {AUDIENCES.map(({ val, desc }) => (
                  <button key={val} onClick={() => setAudience(val)} style={s(audience === val)}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1f2937' }}>{val}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Dev Approach */}
            <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Development Approach</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {DEV_APPROACHES.map(({ val, desc }) => (
                  <button key={val} onClick={() => setDevApproach(val)} style={s(devApproach === val)}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1f2937' }}>{val}</span>
                    <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 8 }}>— {desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Scale */}
            <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>What scale are you building for?</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {SCALE_LIMITS.map(({ val, label, desc }) => (
                  <button key={val} onClick={() => setScaleLimit(val)} style={s(scaleLimit === val)}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937' }}>{label}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Infrastructure */}
            <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Does your app require any of the following?</p>
              <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 14 }}>Select all that apply — these affect your stack, timeline, and upgrade path.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {INFRA_FLAGS.map(({ val, label, desc }) => (
                  <button key={val} onClick={() => toggleInfra(val)} style={{ ...s(infraFlags.includes(val)), display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${infraFlags.includes(val) ? '#7c3aed' : '#d1d5db'}`, background: infraFlags.includes(val) ? '#7c3aed' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {infraFlags.includes(val) && <span style={{ color: 'white', fontSize: 11, fontWeight: 900 }}>✓</span>}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937' }}>{label}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>{desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#dc2626', fontWeight: 500 }}>⚠️ {error}</div>
            )}

            {/* Credits notice + Generate button */}
            <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <p style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 12 }}>
                This will use <strong style={{ color: '#7c3aed' }}>20 credits</strong> from your balance.
              </p>
              <button onClick={handleGenerate} disabled={!canGenerate}
                style={{ width: '100%', padding: '18px', fontSize: 16, fontWeight: 800, borderRadius: 12, border: 'none', cursor: canGenerate ? 'pointer' : 'not-allowed', background: canGenerate ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : '#d1d5db', color: 'white', boxShadow: canGenerate ? '0 4px 24px rgba(124,58,237,0.35)' : 'none' }}>
                Generate Development Plan
              </button>
            </div>
          </>
        )}

        {/* Loading */}
        {isGenerating && (
          <div style={{ background: 'white', borderRadius: 16, padding: 48, textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 44, marginBottom: 16 }}>⚙️</div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#374151' }}>Analyzing your product...</p>
            <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 6 }}>This takes about 15-20 seconds</p>
          </div>
        )}

        {/* Result */}
        {result && !isGenerating && (
          <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1f2937', margin: 0 }}>✅ Development Plan Ready</h3>
              <button onClick={handleGenerateAgain}
                style={{ fontSize: 12, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                Generate again
              </button>
            </div>
            <div style={{ background: '#f9fafb', borderRadius: 12, padding: 20, border: '1px solid #e5e7eb', maxHeight: 500, overflowY: 'auto' }}>
              <pre style={{ fontSize: 12, color: '#374151', whiteSpace: 'pre-wrap', fontFamily: 'monospace', lineHeight: 1.7, margin: 0 }}>{result}</pre>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button onClick={handleCopy} style={{ padding: '14px', fontSize: 14, fontWeight: 700, borderRadius: 12, border: 'none', cursor: 'pointer', background: '#1f2937', color: 'white' }}>
                {copied ? '✅ Copied!' : '📋 Copy'}
              </button>
              <button onClick={handleDownload} disabled={downloading}
                style={{ padding: '14px', fontSize: 14, fontWeight: 700, borderRadius: 12, border: 'none', cursor: downloading ? 'not-allowed' : 'pointer', background: downloading ? '#d1d5db' : 'linear-gradient(135deg, #10b981, #059669)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Download size={16} />
                {downloading ? 'Downloading...' : 'Download .docx'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
