'use client';

// app/business-deck/page.jsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Loader2, Download, FileText, Lock, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const ELIGIBLE_PLANS = ['pro_founder', 'unicorn'];

const COLOR_PALETTE = [
  { label: 'Indigo', value: '#4F46E5' },
  { label: 'Blue',   value: '#2563EB' },
  { label: 'Teal',   value: '#0D9488' },
  { label: 'Green',  value: '#16A34A' },
  { label: 'Purple', value: '#7C3AED' },
  { label: 'Black',  value: '#111827' },
];

const SECTION_META = [
  { key: 'executive_summary', title: 'Executive Summary',  icon: '📋' },
  { key: 'problem',           title: 'The Problem',        icon: '⚠️' },
  { key: 'solution',          title: 'The Solution',       icon: '💡' },
  { key: 'product',           title: 'Product',            icon: '🛠️' },
  { key: 'market',            title: 'Market Opportunity', icon: '📈' },
  { key: 'business_model',    title: 'Business Model',     icon: '💰' },
  { key: 'traction',          title: 'Traction',           icon: '🚀' },
  { key: 'team',              title: 'Team',               icon: '👥' },
  { key: 'the_ask',           title: 'The Ask',            icon: '🎯' },
];

// ─── Build sections from raw DB data (no AI) ─────────────────────────────────

function buildSections(data) {
  const { venture, businessPlan, budgets, betaTesters, productFeedback, mvpFeatureFeedback, suggestedFeatures } = data;

  const v   = venture      || {};
  const bp  = businessPlan || {};
  const mvp = v.mvp_data   || {};
  const mlp = v.mlp_data   || {};
  const pit = v.pitch_data || {};
  const rev = v.revenue_model_data || {};

  // ── 1. Executive Summary ──
  const execParts = [];
  if (v.name && v.description) execParts.push(`${v.name} — ${v.description}`);
  if (pit.tagline)   execParts.push(pit.tagline);
  if (pit.solution)  execParts.push(pit.solution);
  const betaCount = betaTesters?.length || 0;
  if (betaCount > 0) execParts.push(`Currently in ${v.phase || 'Beta'} phase with ${betaCount} beta sign-ups.`);
  if (pit.the_ask)   execParts.push(pit.the_ask);

  // ── 2. Problem — authoritative: pitch_data.problem ──
  const problemConflicts = [];
  if (v.problem && v.problem !== pit.problem)   problemConflicts.push({ stage: 'Idea stage', text: v.problem });
  if (bp.problem && bp.problem !== pit.problem) problemConflicts.push({ stage: 'Business Plan stage', text: bp.problem });

  // ── 3. Solution — authoritative: pitch_data.solution ──
  const solutionConflicts = [];
  if (v.solution && v.solution !== pit.solution)   solutionConflicts.push({ stage: 'Idea stage', text: v.solution });
  if (bp.solution && bp.solution !== pit.solution) solutionConflicts.push({ stage: 'Business Plan stage', text: bp.solution });

  // ── 4. Product ──
  const productParts = [];
  if (bp.product_details) productParts.push(bp.product_details);

  const statusParts = [];
  if (v.phase) statusParts.push(`Current phase: ${v.phase}.`);
  if (mlp.feedback_analysis) statusParts.push(mlp.feedback_analysis);
  if (betaCount > 0) statusParts.push(`Beta sign-ups: ${betaCount}.`);
  if (statusParts.length) productParts.push('Current Status:\n' + statusParts.join('\n'));

  const techParts = [];
  if (mvp.technical_specs)      techParts.push(mvp.technical_specs);
  if (mlp.technical_excellence) techParts.push(mlp.technical_excellence);
  if (techParts.length) productParts.push('Technology:\n' + techParts.join('\n'));

  if (mvpFeatureFeedback?.length) {
    const grouped = {};
    mvpFeatureFeedback.forEach(f => {
      if (!grouped[f.feature_name]) grouped[f.feature_name] = [];
      grouped[f.feature_name].push(f.rating);
    });
    const featureLines = Object.entries(grouped).map(([name, ratings]) => {
      const avg = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
      return `${name}: ${avg}/10 avg (${ratings.length} responses)`;
    });
    productParts.push('Feature Ratings:\n' + featureLines.join('\n'));
  }

  const suggested = (suggestedFeatures || []).slice(0, 5).map(f => f.feature_name);
  if (suggested.length) productParts.push('Most Requested Features:\n' + suggested.join('\n'));

  // ── 5. Market — authoritative: pitch_data.market ──
  const marketConflicts = [];
  if (bp.market_size && bp.market_size !== pit.market) marketConflicts.push({ stage: 'Business Plan stage', text: bp.market_size });
  if (rev.targetMarketFactor) marketConflicts.push({ stage: 'Revenue Model (targetMarketFactor)', text: String(rev.targetMarketFactor) });

  // ── 6. Business Model ──
  const bizParts = [];
  if (bp.revenue_model) bizParts.push(bp.revenue_model);
  const unitEcon = [];
  if (rev.businessModel)          unitEcon.push(`Business model: ${rev.businessModel}`);
  if (rev.tier1Price)             unitEcon.push(`Free tier: ${rev.tier1Price}`);
  if (rev.tier2Price)             unitEcon.push(`Premium: ${rev.tier2Price}`);
  if (rev.acquisitionCost)        unitEcon.push(`CAC: ${rev.acquisitionCost}`);
  if (rev.freeToPaidConversion)   unitEcon.push(`Free to paid conversion: ${rev.freeToPaidConversion}`);
  if (rev.churnRisk)              unitEcon.push(`Monthly churn: ${rev.churnRisk}`);
  if (rev.monthlyMarketingBudget) unitEcon.push(`Monthly marketing budget: ${rev.monthlyMarketingBudget}`);
  if (rev.initialUsers)           unitEcon.push(`Initial users at launch: ${rev.initialUsers}`);
  if (unitEcon.length) bizParts.push('Unit Economics:\n' + unitEcon.join('\n'));

  // ── 7. Traction ──
  const tractionParts = [];
  if (mlp.feedback_analysis) tractionParts.push(mlp.feedback_analysis);
  if (mlp.wow_moments)       tractionParts.push(mlp.wow_moments);
  if (betaCount > 0)         tractionParts.push(`Beta sign-ups: ${betaCount}`);
  if (productFeedback?.length) {
    tractionParts.push(`Product feedback: ${productFeedback.length} responses`);
    productFeedback.slice(0, 5).forEach(f => {
      if (f.feedback_text) tractionParts.push(`- "${f.feedback_text}"`);
    });
  }

  // ── 8. Team — authoritative: pitch_data.team ──
  const teamText = pit.team || bp.entrepreneur_background || '';

  // ── 9. The Ask — authoritative: pitch_data.the_ask ──
  const askConflicts = [];
  if (bp.funding_requirements && bp.funding_requirements !== pit.the_ask) {
    askConflicts.push({ stage: 'Business Plan stage', text: bp.funding_requirements });
  }

  return {
    executive_summary: { text: execParts.join('\n'),     conflicts: [] },
    problem:           { text: pit.problem || v.problem || bp.problem || '', conflicts: problemConflicts },
    solution:          { text: pit.solution || v.solution || bp.solution || '', conflicts: solutionConflicts },
    product:           { text: productParts.join('\n\n'), conflicts: [] },
    market:            { text: pit.market || bp.market_size || '', conflicts: marketConflicts },
    business_model:    { text: bizParts.join('\n\n'),     conflicts: [] },
    traction:          { text: tractionParts.join('\n'),  conflicts: [] },
    team:              { text: teamText,                  conflicts: [] },
    the_ask:           { text: pit.the_ask || bp.funding_requirements || '', conflicts: askConflicts },
  };
}

// ─── Mentor Feedback Display ──────────────────────────────────────────────────

function MentorFeedback({ feedback }) {
  if (!feedback) return null;
  return (
    <div className="mt-4 p-6 bg-indigo-50 border border-indigo-200 rounded-xl">
      <div className="space-y-3 text-left">
        {feedback.split('\n').map((line, i) => {
          const t = line.trim();
          if (!t) return null;
          if (t.includes('★') || t.includes('☆')) {
            return <div key={i} className="text-2xl tracking-widest text-blue-600 font-mono">{t}</div>;
          }
          if (t === 'Mentor Feedback') {
            return <h3 key={i} className="text-lg font-bold text-indigo-900">{t}</h3>;
          }
          if (['Analysis:', 'Strategic Hints:', 'Challenge Question:'].some(h => t.startsWith(h))) {
            return <h4 key={i} className="text-base font-bold text-indigo-800 mt-4">{t.replace(':', '')}</h4>;
          }
          return <p key={i} className="text-gray-700 text-sm leading-relaxed">{t}</p>;
        })}
      </div>
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({ sectionKey, title, icon, sectionData, ventureInfo, onTextChange }) {
  const [mentorLoading, setMentorLoading] = useState(false);
  const [mentorFeedback, setMentorFeedback] = useState(null);
  const [mentorError, setMentorError] = useState(null);
  const [showConflicts, setShowConflicts] = useState(false);

  const text = sectionData?.text || '';
  const conflicts = sectionData?.conflicts || [];

  async function handleMentor() {
    if (!text.trim()) return;
    setMentorLoading(true);
    setMentorFeedback(null);
    setMentorError(null);
    try {
      const prompt = `You are an expert startup mentor reviewing an investor business plan.

Venture: "${ventureInfo.name}" — ${ventureInfo.description}
Section: "${title}"
Current content: "${text}"

Instruction:
1. Start with the text "Mentor Feedback" exactly.
2. On the very next line, provide a 10-star rating using ★ and ☆ (e.g. ★★★★★☆☆☆☆☆).
3. Provide sections: "Analysis:", "Strategic Hints:", "Challenge Question:"
4. Do NOT use markdown formatting. Plain text only.
5. Do NOT rewrite the content. Hints and questions only.

Language: English.`;

      const result = await InvokeLLM({ prompt, creditType: 'mentor' });
      setMentorFeedback(result?.response || 'No response.');
    } catch (err) {
      if (err.message === 'NO_CREDITS') {
        setMentorError('You have used all your mentor credits this month. Upgrade your plan to get more.');
      } else {
        setMentorError('Error getting mentor feedback. Please try again.');
      }
    }
    setMentorLoading(false);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <span>{icon}</span>
          {title}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 hidden sm:block">Click Mentor to get expert feedback on this section</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMentor}
            disabled={mentorLoading || !text.trim()}
            className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 text-xs font-semibold gap-1.5"
          >
            {mentorLoading
              ? <><Loader2 className="animate-spin w-3 h-3" />Reviewing...</>
              : <><MessageSquare className="w-3 h-3" />Mentor</>
            }
          </Button>
        </div>
      </div>

      <div className="px-6 py-5">
        {text ? (
          <textarea
            value={text}
            onChange={e => onTextChange(sectionKey, e.target.value)}
            className="w-full min-h-[140px] text-sm text-gray-700 leading-relaxed border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-y bg-gray-50"
          />
        ) : (
          <p className="text-gray-400 italic text-sm">
            No data found for this section. Complete the relevant stages to populate it.
          </p>
        )}

        {mentorError && (
          <p className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
            {mentorError}
          </p>
        )}

        <MentorFeedback feedback={mentorFeedback} />

        {conflicts.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowConflicts(v => !v)}
              className="flex items-center gap-1.5 text-xs text-amber-600 font-medium hover:text-amber-800"
            >
              {showConflicts ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              ⚠️ {conflicts.length} earlier version{conflicts.length > 1 ? 's' : ''} found — not included in download
            </button>
            {showConflicts && (
              <div className="mt-2 space-y-2">
                {conflicts.map((c, i) => (
                  <div key={i} className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                    <p className="text-xs font-semibold text-amber-700 mb-1">{c.stage}:</p>
                    <p className="text-xs text-gray-600 leading-relaxed">{c.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BusinessDeckPage() {
  const [loading, setLoading]         = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError]             = useState(null);

  const [user, setUser]               = useState(null);
  const [userPlan, setUserPlan]       = useState(null);
  const [isEligible, setIsEligible]   = useState(false);
  const [venture, setVenture]         = useState(null);
  const [sections, setSections]       = useState(null);
  const [deckRecord, setDeckRecord]   = useState(null);

  const [customization, setCustomization] = useState({
    heading_color: '#4F46E5',
    font_size: 'medium',
    company_name: '',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    logo_url: '',
  });

  useEffect(() => { loadPage(); }, []);

  async function loadPage() {
    setLoading(true);
    setError(null);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { setError('not_logged_in'); setLoading(false); return; }
      setUser(authUser);

      const { data: profile } = await supabase
        .from('user_profiles').select('plan').eq('id', authUser.id).single();

      const plan = profile?.plan || '';
      setUserPlan(plan);
      if (!ELIGIBLE_PLANS.includes(plan)) { setIsEligible(false); setLoading(false); return; }
      setIsEligible(true);

      const { data: ventureData } = await supabase
        .from('ventures')
        .select('id, name, description, problem, solution, sector, phase, mvp_data, mlp_data, beta_data, pitch_data, revenue_model_data')
        .eq('created_by', authUser.email)
        .order('created_date', { ascending: false })
        .limit(1)
        .single();

      if (!ventureData) { setError('no_venture'); setLoading(false); return; }
      setVenture(ventureData);
      setCustomization(prev => ({ ...prev, company_name: prev.company_name || ventureData.name || '' }));

      const [bpRes, budgetRes, betaRes, feedbackRes, featureRes, suggestRes] = await Promise.all([
        supabase.from('business_plans').select('*').eq('venture_id', ventureData.id).single(),
        supabase.from('budgets').select('*').eq('venture_id', ventureData.id).single(),
        supabase.from('beta_testers').select('full_name, email, interest_reason').eq('venture_id', ventureData.id),
        supabase.from('product_feedback').select('feedback_text, visitor_name, feedback_type').eq('venture_id', ventureData.id),
        supabase.from('mvp_feature_feedback').select('feature_name, rating, usefulness_rating, satisfaction_rating').eq('venture_id', ventureData.id),
        supabase.from('suggested_features').select('feature_name').eq('venture_id', ventureData.id),
      ]);

      const sourceData = {
        venture: ventureData,
        businessPlan: bpRes.data,
        budgets: budgetRes.data,
        betaTesters: betaRes.data || [],
        productFeedback: feedbackRes.data || [],
        mvpFeatureFeedback: featureRes.data || [],
        suggestedFeatures: suggestRes.data || [],
      };

      const freshSections = buildSections(sourceData);

      const { data: existingDeck } = await supabase
        .from('business_decks')
        .select('*')
        .eq('venture_id', ventureData.id)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      if (existingDeck?.deck_data) {
        // Restore saved edits, rebuild conflicts fresh
        const merged = {};
        SECTION_META.forEach(({ key }) => {
          merged[key] = {
            text: existingDeck.deck_data[key] ?? freshSections[key].text,
            conflicts: freshSections[key].conflicts,
          };
        });
        setSections(merged);
        setDeckRecord(existingDeck);
        if (existingDeck.customization) {
          setCustomization(prev => ({ ...prev, ...existingDeck.customization }));
        }
      } else {
        setSections(freshSections);
      }

    } catch (err) {
      console.error('loadPage error:', err);
      setError('load_failed');
    }
    setLoading(false);
  }

  function handleTextChange(sectionKey, newText) {
    setSections(prev => ({ ...prev, [sectionKey]: { ...prev[sectionKey], text: newText } }));
  }

  async function saveDeck(sectionsToSave, customizationToSave) {
    if (!venture || !user) return;
    const deckDataToSave = {};
    SECTION_META.forEach(({ key }) => { deckDataToSave[key] = sectionsToSave[key]?.text || ''; });
    const now = new Date().toISOString();
    const payload = {
      venture_id: venture.id,
      user_email: user.email,
      plan: userPlan,
      version: (deckRecord?.version || 0) + 1,
      deck_data: deckDataToSave,
      customization: customizationToSave,
      generated_at: deckRecord?.generated_at || now,
      updated_at: now,
    };
    try {
      if (deckRecord?.id) {
        const { data } = await supabase.from('business_decks').update(payload).eq('id', deckRecord.id).select().single();
        if (data) setDeckRecord(data);
      } else {
        const { data } = await supabase.from('business_decks').insert(payload).select().single();
        if (data) setDeckRecord(data);
      }
    } catch (err) {
      console.error('Save error:', err);
    }
  }

  function updateCustomization(field, value) {
    const updated = { ...customization, [field]: value };
    setCustomization(updated);
    if (sections) saveDeck(sections, updated);
  }

  async function handleSave() {
    if (sections) await saveDeck(sections, customization);
  }

  async function handleDownload() {
    if (!sections) return;
    setDownloading(true);
    try {
      const { Document, Packer, Paragraph, TextRun, BorderStyle, AlignmentType } = await import('docx');
      const fontSizeMap = { small: 20, medium: 24, large: 28 };
      const headSizeMap = { small: 28, medium: 32, large: 38 };
      const bodySize = fontSizeMap[customization.font_size] || 24;
      const headSize = headSizeMap[customization.font_size] || 32;
      const hexColor = (customization.heading_color || '#4F46E5').replace('#', '');

      const makeHeading = text => new Paragraph({
        children: [new TextRun({ text, bold: true, size: headSize, color: hexColor, font: 'Arial' })],
        spacing: { before: 400, after: 160 },
      });
      const makeBody = text => (text || '').split('\n').filter(Boolean).map(line =>
        new Paragraph({
          children: [new TextRun({ text: line, size: bodySize, font: 'Arial' })],
          spacing: { after: 100 },
        })
      );
      const makeDivider = () => new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' } },
        spacing: { before: 160, after: 160 },
        children: [],
      });

      const children = [
        new Paragraph({
          children: [new TextRun({ text: customization.company_name || venture?.name || '', bold: true, size: 56, color: hexColor, font: 'Arial' })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 800, after: 200 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Investor Business Plan', size: 32, color: '666666', font: 'Arial' })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 160 },
        }),
        new Paragraph({
          children: [new TextRun({ text: customization.date || '', size: 24, color: '888888', font: 'Arial' })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 160 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Confidential — Not for distribution', size: 20, color: 'AAAAAA', italics: true, font: 'Arial' })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 800 },
        }),
        makeDivider(),
      ];

      SECTION_META.forEach(({ key, title }) => {
        const text = sections[key]?.text || '';
        if (!text.trim()) return;
        children.push(makeHeading(title));
        children.push(...makeBody(text));
        children.push(makeDivider());
      });

      const doc = new Document({
        styles: { default: { document: { run: { font: 'Arial', size: bodySize } } } },
        sections: [{
          properties: {
            page: {
              size: { width: 12240, height: 15840 },
              margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
            },
          },
          children,
        }],
      });

      const buffer = await Packer.toBuffer(doc);
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const monthYear = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }).replace(' ', '');
      a.href = url;
      a.download = `${(customization.company_name || venture?.name || 'BusinessPlan').replace(/\s+/g, '_')}_BusinessPlan_${monthYear}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      setError('download_failed');
    }
    setDownloading(false);
  }

  // ── Render states ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
          <p className="text-sm text-gray-500">Loading your business deck...</p>
        </div>
      </div>
    );
  }

  if (error === 'not_logged_in') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <Lock className="w-10 h-10 text-gray-400 mx-auto" />
          <p className="text-gray-600 font-medium">Please log in to access the Business Deck.</p>
        </div>
      </div>
    );
  }

  if (!isEligible) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center space-y-5">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Upgrade to Access</h2>
          <p className="text-gray-500 leading-relaxed">
            The Business Deck Builder is available on the <strong>Pro Founder</strong> plan and above.
          </p>
          <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2">
            <p className="text-sm font-semibold text-gray-700">Included with Pro Founder:</p>
            <p className="text-sm text-gray-600">✓ Your data assembled into an investor-ready business plan</p>
            <p className="text-sm text-gray-600">✓ Editable sections with Mentor feedback per section</p>
            <p className="text-sm text-gray-600">✓ Conflict detection across stages</p>
            <p className="text-sm text-gray-600">✓ Download as Word (.docx)</p>
          </div>
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-base font-semibold">
            Upgrade Plan
          </Button>
          <p className="text-xs text-gray-400">Current plan: {userPlan || 'explorer'}</p>
        </div>
      </div>
    );
  }

  if (error === 'no_venture') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-gray-600 font-medium">No venture found. Please create a venture first.</p>
      </div>
    );
  }

  const filledCount = sections ? SECTION_META.filter(s => sections[s.key]?.text?.trim()).length : 0;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-indigo-600" />
              Business Deck
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {venture?.name} · <span className="capitalize">{venture?.phase}</span>
              {sections && (
                <span className="ml-2 text-indigo-600 font-medium">
                  {filledCount} of {SECTION_META.length} sections populated
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {deckRecord && (
              <span className="text-xs text-gray-400 hidden sm:block">
                Saved {new Date(deckRecord.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={handleSave} className="text-gray-600 border-gray-300 text-xs">
              Save
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* How it works */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
          <h2 className="font-bold text-indigo-900 text-base mb-4">How the Business Deck works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 border border-indigo-100">
              <div className="text-2xl mb-2">1️⃣</div>
              <p className="text-sm font-semibold text-gray-800 mb-1">Review your data</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                StartZig has assembled all the information you entered across your journey into 9 investor-ready sections. This is your data — exactly as you wrote it.
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-indigo-100">
              <div className="text-2xl mb-2">2️⃣</div>
              <p className="text-sm font-semibold text-gray-800 mb-1">Edit and improve</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Each section is fully editable. Use the Mentor button to get expert feedback, a score, and strategic hints — then edit and ask again.
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-indigo-100">
              <div className="text-2xl mb-2">3️⃣</div>
              <p className="text-sm font-semibold text-gray-800 mb-1">Download for investors</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                When you're happy with the content, customize the look and download a professional Word document ready to share with investors.
              </p>
            </div>
          </div>
          <p className="text-xs text-indigo-400 mt-4">
            ⚠️ Sections with earlier versions show conflicts between stages — these are visible on screen only and are not included in your download.
          </p>
        </div>

        {/* Error */}
        {error && !['not_logged_in', 'no_venture'].includes(error) && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            {error === 'download_failed' ? 'Download failed. Please try again.' : error}
          </div>
        )}

        {/* 9 sections */}
        {sections && SECTION_META.map(({ key, title, icon }) => (
          <SectionCard
            key={key}
            sectionKey={key}
            title={title}
            icon={icon}
            sectionData={sections[key]}
            ventureInfo={{ name: venture?.name, description: venture?.description }}
            onTextChange={handleTextChange}
          />
        ))}

        {/* Customization + Download */}
        {sections && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <h3 className="font-bold text-gray-800 text-base">Customize & Download</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Company name in header</label>
                <input
                  type="text"
                  value={customization.company_name}
                  onChange={e => updateCustomization('company_name', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Date</label>
                <input
                  type="text"
                  value={customization.date}
                  onChange={e => updateCustomization('date', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Heading color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_PALETTE.map(c => (
                    <button
                      key={c.value}
                      title={c.label}
                      onClick={() => updateCustomization('heading_color', c.value)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${customization.heading_color === c.value ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Font size</label>
                <div className="flex gap-2">
                  {['small', 'medium', 'large'].map(size => (
                    <button
                      key={size}
                      onClick={() => updateCustomization('font_size', size)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium border capitalize transition-all ${customization.font_size === size ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-300'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              {userPlan === 'unicorn' && (
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    Logo URL <span className="text-xs text-amber-600 ml-1">Unicorn plan</span>
                  </label>
                  <input
                    type="url"
                    value={customization.logo_url}
                    onChange={e => updateCustomization('logo_url', e.target.value)}
                    placeholder="https://..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleDownload}
                disabled={downloading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 h-11"
              >
                {downloading
                  ? <><Loader2 className="animate-spin w-4 h-4 mr-2" />Preparing...</>
                  : <><Download className="w-4 h-4 mr-2" />Download Word (.docx)</>
                }
              </Button>
              <Button disabled variant="outline" className="text-gray-400 border-gray-200 cursor-not-allowed h-11 px-6">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
                <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Soon</span>
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
