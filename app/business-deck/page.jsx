'use client';

// app/business-deck/page.jsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { InvokeLLM } from '@/api/integrations';
import MentorModal from "@/components/mentor/MentorModal";
import { Button } from '@/components/ui/button';
import { Loader2, Download, FileText, Sparkles, RefreshCw, Lock } from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────────────

const SECTION_KEYS = [
  { key: 'executive_summary', title: 'Executive Summary', icon: '📋' },
  { key: 'problem',           title: 'The Problem',       icon: '⚠️' },
  { key: 'solution',          title: 'The Solution',      icon: '💡' },
  { key: 'product',           title: 'Product',           icon: '🛠️' },
  { key: 'market',            title: 'Market Opportunity',icon: '📈' },
  { key: 'business_model',    title: 'Business Model',    icon: '💰' },
  { key: 'traction',          title: 'Traction',          icon: '🚀' },
  { key: 'team',              title: 'Team',              icon: '👥' },
  { key: 'the_ask',           title: 'The Ask',           icon: '🎯' },
];

const COLOR_PALETTE = [
  { label: 'Indigo',  value: '#4F46E5' },
  { label: 'Blue',    value: '#2563EB' },
  { label: 'Teal',    value: '#0D9488' },
  { label: 'Green',   value: '#16A34A' },
  { label: 'Purple',  value: '#7C3AED' },
  { label: 'Black',   value: '#111827' },
];

const ELIGIBLE_PLANS = ['pro_founder', 'unicorn'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildAllFieldsAsText(data) {
  const {
    venture, businessPlan, budgets,
    betaTesters, productFeedback,
    mvpFeatureFeedback, suggestedFeatures,
  } = data;

  const v   = venture      || {};
  const bp  = businessPlan || {};
  const mvp = v.mvp_data   || {};
  const mlp = v.mlp_data   || {};
  const pit = v.pitch_data || {};
  const rev = v.revenue_model_data || {};
  const bet = v.beta_data  || {};

  const lines = [];

  // Stage 1 — Idea
  lines.push('=== STAGE 1 — IDEA ===');
  if (v.problem)   lines.push(`Problem (Idea): ${v.problem}`);
  if (v.solution)  lines.push(`Solution (Idea): ${v.solution}`);

  // Stage 2 — Business Plan
  lines.push('\n=== STAGE 2 — BUSINESS PLAN ===');
  if (bp.mission)                 lines.push(`Mission: ${bp.mission}`);
  if (bp.problem)                 lines.push(`Problem (Business Plan): ${bp.problem}`);
  if (bp.solution)                lines.push(`Solution (Business Plan): ${bp.solution}`);
  if (bp.product_details)         lines.push(`Product Details: ${bp.product_details}`);
  if (bp.market_size)             lines.push(`Market Size: ${bp.market_size}`);
  if (bp.target_customers)        lines.push(`Target Customers: ${bp.target_customers}`);
  if (bp.competition)             lines.push(`Competition: ${bp.competition}`);
  if (bp.entrepreneur_background) lines.push(`Founder Background: ${bp.entrepreneur_background}`);
  if (bp.revenue_model)           lines.push(`Revenue Model: ${bp.revenue_model}`);
  if (bp.funding_requirements)    lines.push(`Funding Requirements: ${bp.funding_requirements}`);

  // Budget
  if (budgets) {
    lines.push('\n=== BUDGET ===');
    if (budgets.salaries)           lines.push(`Salaries: ${JSON.stringify(budgets.salaries)}`);
    if (budgets.marketing_costs)    lines.push(`Marketing Costs: ${JSON.stringify(budgets.marketing_costs)}`);
    if (budgets.operational_costs)  lines.push(`Operational Costs: ${JSON.stringify(budgets.operational_costs)}`);
  }

  // Stage 3 — MVP
  lines.push('\n=== STAGE 3 — MVP ===');
  if (mvp.product_definition) lines.push(`MVP Product Definition: ${mvp.product_definition}`);
  if (mvp.technical_specs)    lines.push(`Technical Specs: ${mvp.technical_specs}`);
  if (mvp.user_testing)       lines.push(`User Testing: ${mvp.user_testing}`);
  if (mvp.feature_matrix)     lines.push(`Feature Matrix: ${JSON.stringify(mvp.feature_matrix)}`);

  // Stage 4 — Revenue Model
  lines.push('\n=== STAGE 4 — REVENUE MODEL ===');
  if (rev.businessModel)          lines.push(`Business Model Type: ${rev.businessModel}`);
  if (rev.tier1Price)             lines.push(`Tier 1 Price: ${rev.tier1Price}`);
  if (rev.tier2Price)             lines.push(`Tier 2 Price: ${rev.tier2Price}`);
  if (rev.monthlyMarketingBudget) lines.push(`Monthly Marketing Budget: ${rev.monthlyMarketingBudget}`);
  if (rev.acquisitionCost)        lines.push(`CAC: ${rev.acquisitionCost}`);
  if (rev.initialUsers)           lines.push(`Initial Users: ${rev.initialUsers}`);
  if (rev.churnRisk)              lines.push(`Monthly Churn: ${rev.churnRisk}`);
  if (rev.freeToPaidConversion)   lines.push(`Free to Paid Conversion: ${rev.freeToPaidConversion}`);
  if (rev.targetMarketFactor)     lines.push(`Target Market Factor: ${rev.targetMarketFactor}`);

  // Stage 5 — MLP
  lines.push('\n=== STAGE 5 — MLP ===');
  if (mlp.feedback_analysis)    lines.push(`MLP Feedback Analysis: ${mlp.feedback_analysis}`);
  if (mlp.enhancement_strategy) lines.push(`Enhancement Strategy: ${mlp.enhancement_strategy}`);
  if (mlp.wow_moments)          lines.push(`Wow Moments: ${mlp.wow_moments}`);
  if (mlp.user_journey)         lines.push(`User Journey: ${mlp.user_journey}`);
  if (mlp.technical_excellence) lines.push(`Technical Excellence: ${mlp.technical_excellence}`);

  // Stage 6 — Beta
  lines.push('\n=== STAGE 6 — BETA ===');
  if (bet.headline)    lines.push(`Beta Headline: ${bet.headline}`);
  if (bet.description) lines.push(`Beta Description: ${bet.description}`);
  if (bet.benefits)    lines.push(`Beta Benefits: ${JSON.stringify(bet.benefits)}`);

  // Stage 7 — Product Feedback
  if (productFeedback?.length) {
    lines.push('\n=== STAGE 7 — PRODUCT FEEDBACK ===');
    productFeedback.slice(0, 20).forEach(f => {
      lines.push(`Feedback (${f.feedback_type || 'general'}): ${f.feedback_text}`);
    });
  }
  if (mvpFeatureFeedback?.length) {
    lines.push('\nFeature Ratings:');
    const grouped = {};
    mvpFeatureFeedback.forEach(f => {
      if (!grouped[f.feature_name]) grouped[f.feature_name] = [];
      grouped[f.feature_name].push(f.rating);
    });
    Object.entries(grouped).forEach(([name, ratings]) => {
      const avg = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
      lines.push(`  ${name}: avg rating ${avg}/10 (${ratings.length} responses)`);
    });
  }
  if (suggestedFeatures?.length) {
    lines.push('\nSuggested Features:');
    suggestedFeatures.slice(0, 10).forEach(f => lines.push(`  - ${f.feature_name}`));
  }
  if (betaTesters?.length) {
    lines.push(`\nBeta Testers: ${betaTesters.length} sign-ups`);
  }

  // Stage 8 — Pitch (authoritative for problem, solution, market, team, the_ask)
  lines.push('\n=== STAGE 8 — PITCH (AUTHORITATIVE) ===');
  if (pit.tagline)  lines.push(`Tagline: ${pit.tagline}`);
  if (pit.problem)  lines.push(`Problem (AUTHORITATIVE): ${pit.problem}`);
  if (pit.solution) lines.push(`Solution (AUTHORITATIVE): ${pit.solution}`);
  if (pit.market)   lines.push(`Market (AUTHORITATIVE): ${pit.market}`);
  if (pit.team)     lines.push(`Team (AUTHORITATIVE): ${pit.team}`);
  if (pit.vision)   lines.push(`Vision: ${pit.vision}`);
  if (pit.the_ask)  lines.push(`The Ask (AUTHORITATIVE): ${pit.the_ask}`);

  return lines.join('\n');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

function countFilledSections(deckData) {
  if (!deckData) return 0;
  return SECTION_KEYS.filter(s => deckData[s.key] && deckData[s.key].trim()).length;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BusinessDeckPage() {
  const [loading, setLoading]           = useState(true);
  const [generating, setGenerating]     = useState(false);
  const [downloading, setDownloading]   = useState(false);
  const [error, setError]               = useState(null);

  // Auth & plan
  const [user, setUser]                 = useState(null);
  const [userPlan, setUserPlan]         = useState(null);
  const [isEligible, setIsEligible]     = useState(false);

  // Venture data
  const [venture, setVenture]           = useState(null);
  const [allSourceData, setAllSourceData] = useState(null);

  // Deck state
  const [deckRecord, setDeckRecord]     = useState(null);   // row from business_decks
  const [deckData, setDeckData]         = useState(null);   // the 9 sections object

  // Customization
  const [customization, setCustomization] = useState({
    heading_color: '#4F46E5',
    font_size: 'medium',
    company_name: '',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    logo_url: '',
  });

  // Mentor modal
  const [mentorOpen, setMentorOpen]     = useState(false);
  const [mentorSection, setMentorSection] = useState(null);

  // ── Load on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
    setLoading(true);
    setError(null);
    try {
      // 1. Get current user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { setError('not_logged_in'); setLoading(false); return; }
      setUser(authUser);

      // 2. Check plan
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('plan')
        .eq('id', authUser.id)
        .single();

      const plan = profile?.plan || '';
      setUserPlan(plan);
      if (!ELIGIBLE_PLANS.includes(plan)) {
        setIsEligible(false);
        setLoading(false);
        return;
      }
      setIsEligible(true);

      // 3. Get venture
      const { data: ventureData } = await supabase
        .from('ventures')
        .select('id, name, description, problem, solution, sector, phase, mvp_data, mlp_data, beta_data, pitch_data, revenue_model_data')
        .eq('created_by', authUser.email)
        .order('created_date', { ascending: false })
        .limit(1)
        .single();

      if (!ventureData) { setError('no_venture'); setLoading(false); return; }
      setVenture(ventureData);

      // 4. Check for existing deck
      const { data: existingDeck } = await supabase
        .from('business_decks')
        .select('*')
        .eq('venture_id', ventureData.id)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      if (existingDeck) {
        setDeckRecord(existingDeck);
        setDeckData(existingDeck.deck_data);
        if (existingDeck.customization) {
          setCustomization(prev => ({ ...prev, ...existingDeck.customization }));
        }
      }

      // 5. Set default company name
      setCustomization(prev => ({
        ...prev,
        company_name: prev.company_name || ventureData.name || '',
      }));

      // 6. Fetch all source data (for generation)
      const [bpRes, budgetRes, betaRes, feedbackRes, featureRes, suggestRes] = await Promise.all([
        supabase.from('business_plans').select('*').eq('venture_id', ventureData.id).single(),
        supabase.from('budgets').select('*').eq('venture_id', ventureData.id).single(),
        supabase.from('beta_testers').select('full_name, email, interest_reason').eq('venture_id', ventureData.id),
        supabase.from('product_feedback').select('feedback_text, visitor_name, feedback_type').eq('venture_id', ventureData.id),
        supabase.from('mvp_feature_feedback').select('feature_name, rating, usefulness_rating, satisfaction_rating').eq('venture_id', ventureData.id),
        supabase.from('suggested_features').select('feature_name').eq('venture_id', ventureData.id),
      ]);

      setAllSourceData({
        venture: ventureData,
        businessPlan: bpRes.data,
        budgets: budgetRes.data,
        betaTesters: betaRes.data || [],
        productFeedback: feedbackRes.data || [],
        mvpFeatureFeedback: featureRes.data || [],
        suggestedFeatures: suggestRes.data || [],
      });

    } catch (err) {
      console.error('loadPage error:', err);
      setError('load_failed');
    }
    setLoading(false);
  }

  // ── Generate ───────────────────────────────────────────────────────────────
  async function handleGenerate() {
    if (!venture || !allSourceData) return;
    setGenerating(true);
    setError(null);
    try {
      const allFieldsAsText = buildAllFieldsAsText(allSourceData);
      const prompt = `You are an expert startup advisor writing a professional investor business plan.

Venture: "${venture.name}" — ${venture.description}
Sector: ${venture.sector} | Phase: ${venture.phase}

Below is all the data this founder collected throughout their startup journey.
Synthesize it into a professional, concise investor business plan.
Write in clear, confident English. Do not invent information that was not provided.
Do not use markdown formatting.

IMPORTANT: Return ONLY a valid JSON object with exactly these keys (no other text before or after):
executive_summary, problem, solution, product, market, business_model, traction, team, the_ask

Each value should be a plain text string (no markdown, no bullet characters).

DATA:
${allFieldsAsText}`;

      const result = await InvokeLLM({ prompt, creditType: 'sys' });
      const rawText = result?.response || '';

      // Parse JSON — strip any markdown fences if present
      let parsed;
      try {
        const cleaned = rawText.replace(/```json|```/g, '').trim();
        parsed = JSON.parse(cleaned);
      } catch {
        throw new Error('AI returned invalid JSON. Please try again.');
      }

      // Validate all 9 keys exist
      const missingKeys = SECTION_KEYS.map(s => s.key).filter(k => !parsed[k]);
      if (missingKeys.length > 0) {
        throw new Error(`AI response missing sections: ${missingKeys.join(', ')}`);
      }

      const newVersion = (deckRecord?.version || 0) + 1;
      const now = new Date().toISOString();

      // Upsert to business_decks
      const upsertPayload = {
        venture_id: venture.id,
        user_email: user.email,
        plan: userPlan,
        version: newVersion,
        deck_data: parsed,
        customization,
        generated_at: deckRecord ? deckRecord.generated_at : now,
        updated_at: now,
      };

      let savedRecord;
      if (deckRecord?.id) {
        const { data } = await supabase
          .from('business_decks')
          .update(upsertPayload)
          .eq('id', deckRecord.id)
          .select()
          .single();
        savedRecord = data;
      } else {
        const { data } = await supabase
          .from('business_decks')
          .insert(upsertPayload)
          .select()
          .single();
        savedRecord = data;
      }

      setDeckRecord(savedRecord);
      setDeckData(parsed);

    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message === 'NO_CREDITS'
        ? 'no_credits'
        : err.message || 'generation_failed');
    }
    setGenerating(false);
  }

  // ── Save customization ─────────────────────────────────────────────────────
  async function saveCustomization(newCustomization) {
    if (!deckRecord?.id) return;
    await supabase
      .from('business_decks')
      .update({ customization: newCustomization, updated_at: new Date().toISOString() })
      .eq('id', deckRecord.id);
  }

  function updateCustomization(field, value) {
    const updated = { ...customization, [field]: value };
    setCustomization(updated);
    saveCustomization(updated);
  }

  // ── Download .docx ─────────────────────────────────────────────────────────
  async function handleDownload() {
    if (!deckData) return;
    setDownloading(true);
    try {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
              BorderStyle, Table, TableRow, TableCell, WidthType, ShadingType } = await import('docx');

      const fontSizeMap = { small: 20, medium: 24, large: 28 };
      const headingSizeMap = { small: 28, medium: 32, large: 38 };
      const bodySize  = fontSizeMap[customization.font_size] || 24;
      const headSize  = headingSizeMap[customization.font_size] || 32;
      const hexColor  = (customization.heading_color || '#4F46E5').replace('#', '');

      function makeHeading(text) {
        return new Paragraph({
          children: [new TextRun({ text, bold: true, size: headSize, color: hexColor, font: 'Arial' })],
          spacing: { before: 400, after: 160 },
        });
      }

      function makeBody(text) {
        return (text || '').split('\n').filter(Boolean).map(line =>
          new Paragraph({
            children: [new TextRun({ text: line, size: bodySize, font: 'Arial' })],
            spacing: { after: 120 },
          })
        );
      }

      function makeDivider() {
        return new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' } },
          spacing: { before: 200, after: 200 },
          children: [],
        });
      }

      const children = [];

      // Cover
      children.push(
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
      );

      // 9 sections
      SECTION_KEYS.forEach(({ key, title }) => {
        const content = deckData[key] || '';
        if (!content) return;
        children.push(makeHeading(title));
        children.push(...makeBody(content));
        children.push(makeDivider());
      });

      const doc = new Document({
        styles: {
          default: {
            document: { run: { font: 'Arial', size: bodySize } },
          },
        },
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
      const month = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }).replace(' ', '');
      a.href = url;
      a.download = `${(customization.company_name || venture?.name || 'BusinessPlan').replace(/\s+/g, '_')}_BusinessPlan_${month}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      setError('download_failed');
    }
    setDownloading(false);
  }

  // ── Mentor ─────────────────────────────────────────────────────────────────
  function openMentor(sectionKey) {
    const section = SECTION_KEYS.find(s => s.key === sectionKey);
    setMentorSection({
      sectionId: sectionKey,
      sectionTitle: section?.title || sectionKey,
      fieldValue: deckData?.[sectionKey] || '',
    });
    setMentorOpen(true);
  }

  // ── Render states ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
          <p className="text-sm">Loading your business deck...</p>
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
            Upgrade to generate your investor-ready business plan.
          </p>
          <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2">
            <p className="text-sm font-semibold text-gray-700">Included with Pro Founder:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ AI-generated investor business plan</li>
              <li>✓ 9 structured sections from your journey</li>
              <li>✓ Mentor feedback per section</li>
              <li>✓ Download as Word (.docx)</li>
            </ul>
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
        <div className="text-center space-y-3">
          <p className="text-gray-600 font-medium">No venture found. Please create a venture first.</p>
        </div>
      </div>
    );
  }

  const filledCount = countFilledSections(deckData);

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-indigo-600" />
              Business Deck
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {venture?.name} &nbsp;·&nbsp;
              <span className="capitalize">{venture?.phase}</span>
              {deckData && (
                <span className="ml-2 text-indigo-600 font-medium">
                  {filledCount} of {SECTION_KEYS.length} sections
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {deckRecord && (
              <span className="text-xs text-gray-400 hidden sm:block">
                Last generated: {formatDate(deckRecord.generated_at)}
              </span>
            )}
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 h-10"
            >
              {generating ? (
                <><Loader2 className="animate-spin w-4 h-4 mr-2" />Generating...</>
              ) : deckData ? (
                <><RefreshCw className="w-4 h-4 mr-2" />Regenerate</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" />Generate Business Plan</>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && !['not_logged_in', 'no_venture', 'no_credits'].includes(error) && (
        <div className="max-w-4xl mx-auto px-6 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            {error === 'download_failed'
              ? 'Download failed. Please try again.'
              : error === 'generation_failed'
              ? 'Generation failed. Please try again.'
              : error}
          </div>
        </div>
      )}

      {error === 'no_credits' && (
        <div className="max-w-4xl mx-auto px-6 mt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
            You have used all your mentor credits this month. Upgrade your plan to get more.
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* ── Empty state ── */}
        {!deckData && !generating && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-indigo-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Generate your Business Plan</h2>
            <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
              StartZig will synthesize all your work into a 9-section investor-ready business plan.
              Free on your first generation.
            </p>
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 h-12 text-base"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Business Plan
            </Button>
          </div>
        )}

        {/* ── Generating skeleton ── */}
        {generating && (
          <div className="space-y-4">
            {SECTION_KEYS.map(s => (
              <div key={s.key} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/4 mb-3" />
                <div className="space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-5/6" />
                  <div className="h-3 bg-slate-100 rounded w-4/6" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── 9 Section cards ── */}
        {deckData && !generating && (
          <div className="space-y-4">
            {SECTION_KEYS.map(({ key, title, icon }) => {
              const content = deckData[key];
              return (
                <div key={key} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <h2 className="font-bold text-gray-800 flex items-center gap-2">
                      <span>{icon}</span>
                      {title}
                    </h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openMentor(key)}
                      className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 text-xs font-semibold"
                    >
                      Mentor
                    </Button>
                  </div>
                  <div className="px-6 py-5">
                    {content ? (
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">{content}</p>
                    ) : (
                      <p className="text-gray-400 italic text-sm">
                        Not enough data to generate this section. Complete earlier stages to unlock it.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Customization + Download ── */}
        {deckData && !generating && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <h3 className="font-bold text-gray-800 text-base">Customize Document</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* Company name */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Company name in header</label>
                <input
                  type="text"
                  value={customization.company_name}
                  onChange={e => updateCustomization('company_name', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Date</label>
                <input
                  type="text"
                  value={customization.date}
                  onChange={e => updateCustomization('date', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Heading color */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Heading color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_PALETTE.map(c => (
                    <button
                      key={c.value}
                      title={c.label}
                      onClick={() => updateCustomization('heading_color', c.value)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        customization.heading_color === c.value
                          ? 'border-gray-900 scale-110'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              </div>

              {/* Font size */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Font size</label>
                <div className="flex gap-2">
                  {['small', 'medium', 'large'].map(size => (
                    <button
                      key={size}
                      onClick={() => updateCustomization('font_size', size)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium border capitalize transition-all ${
                        customization.font_size === size
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo URL — Unicorn only */}
              {userPlan === 'unicorn' && (
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    Logo URL <span className="text-xs text-amber-600 font-normal ml-1">Unicorn plan</span>
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

            {/* Download buttons */}
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
              <Button
                disabled
                variant="outline"
                className="text-gray-400 border-gray-200 cursor-not-allowed h-11 px-6"
                title="Coming soon"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
                <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Soon</span>
              </Button>
            </div>
          </div>
        )}

      </div>

      {/* ── Mentor Modal ── */}
      {mentorSection && (
        <MentorModal
          isOpen={mentorOpen}
          onClose={() => setMentorOpen(false)}
          sectionId={mentorSection.sectionId}
          sectionTitle={mentorSection.sectionTitle}
          fieldValue={mentorSection.fieldValue}
          onUpdateField={() => {}}
          ventureId={venture?.id}
        />
      )}
    </div>
  );
}
