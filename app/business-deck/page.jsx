'use client';

// app/business-deck/page.jsx
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Loader2, Download, FileText, Lock, MessageSquare, Sparkles, RefreshCw, Info, Save } from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const ELIGIBLE_PLANS = ['pro_founder', 'unicorn'];
const MONTHS = 24;
const ORGANIC_K_FACTOR = 0.65;
const TARGET_MARKET_SCALING = 10000000;

const SECTION_KEYS = ['executive_summary', 'problem', 'solution', 'product', 'market', 'business_model', 'traction', 'team', 'the_ask'];

const SECTION_TITLES = {
  executive_summary: 'Executive Summary',
  problem: 'The Problem',
  solution: 'The Solution',
  product: 'Product',
  market: 'Market Opportunity',
  business_model: 'Business Model',
  traction: 'Traction',
  team: 'Team',
  the_ask: 'The Ask',
};

// ─── Revenue forecast (same formula as Revenue Model page) ───────────────────

function calculateForecast(rev) {
  if (!rev) return null;
  const {
    businessModel = 'freemium', tier1Price = 0, tier2Price = 0,
    tier2ConversionSplit = 0, adRevenuePer1000 = 0,
    initialUsers = 0, churnRisk = 0, targetMarketFactor = 0,
    freeToPaidConversion = 0, monthlyMarketingBudget = 0, acquisitionCost = 0.01,
  } = rev;

  const targetMarketSize = targetMarketFactor * TARGET_MARKET_SCALING;
  let totalUsers = initialUsers;
  let payingUsers = businessModel === 'transactional' ? totalUsers : 0;
  const churnRateDecimal = churnRisk / 100;
  const tier2SplitDecimal = tier2ConversionSplit / 100;
  const conversionRateDecimal = freeToPaidConversion / 100;
  const effectiveCAC = Math.max(0.01, acquisitionCost);

  let year1Revenue = 0, year2Revenue = 0;
  let year1TotalUsers = 0, year1PayingUsers = 0;

  for (let month = 1; month <= MONTHS; month++) {
    const mktSat = targetMarketSize > 0 ? (1 - totalUsers / targetMarketSize) : 1;
    const newPaid = Math.floor(monthlyMarketingBudget / effectiveCAC);
    const newOrganic = Math.floor(totalUsers * 0.15 * ORGANIC_K_FACTOR * mktSat);
    const newUsers = newPaid + newOrganic;
    const churned = Math.floor(totalUsers * churnRateDecimal);
    totalUsers = Math.max(initialUsers, totalUsers + newUsers - churned);
    let freeUsers = totalUsers - payingUsers;

    if (businessModel === 'freemium' || businessModel === 'subscription') {
      const newlyPaid = Math.floor(freeUsers * conversionRateDecimal);
      const churnedPaid = Math.floor(payingUsers * churnRateDecimal);
      payingUsers = Math.max(0, payingUsers + newlyPaid - churnedPaid);
      freeUsers = totalUsers - payingUsers;
    } else if (businessModel === 'ad-driven') {
      payingUsers = 0; freeUsers = totalUsers;
    }

    const paidForRev = (businessModel === 'subscription' || businessModel === 'freemium') ? payingUsers : 0;
    const t2Users = Math.floor(paidForRev * tier2SplitDecimal);
    const t1Users = paidForRev - t2Users;
    const rev = t1Users * tier1Price + t2Users * tier2Price +
      ((businessModel === 'ad-driven' || businessModel === 'freemium') ? (freeUsers / 1000) * adRevenuePer1000 : 0);

    if (month <= 12) {
      year1Revenue += rev;
      if (month === 12) { year1TotalUsers = totalUsers; year1PayingUsers = payingUsers; }
    } else { year2Revenue += rev; }
  }

  const fmt = n => n >= 1000000 ? `$${(n/1000000).toFixed(1)}M` : n >= 1000 ? `$${(n/1000).toFixed(0)}K` : `$${Math.round(n)}`;
  const fmtN = n => n >= 1000 ? `${(n/1000).toFixed(0)}K` : String(n);

  return {
    year1Revenue: Math.round(year1Revenue),
    year2CumulativeRevenue: Math.round(year1Revenue + year2Revenue),
    year1TotalUsers, year1PayingUsers,
    year2TotalUsers: totalUsers, year2PayingUsers: payingUsers,
    year1RevenueFormatted: fmt(year1Revenue),
    year2CumulativeFormatted: fmt(year1Revenue + year2Revenue),
    year1TotalFormatted: fmtN(year1TotalUsers),
    year1PayingFormatted: fmtN(year1PayingUsers),
    year2TotalFormatted: fmtN(totalUsers),
    year2PayingFormatted: fmtN(payingUsers),
  };
}

// ─── Build allFieldsAsText for AI prompt ─────────────────────────────────────

function buildPromptData(data, forecast) {
  const { venture, businessPlan, budgets, betaTesters, productFeedback, mvpFeatureFeedback, suggestedFeatures } = data;
  const v   = venture || {};
  const bp  = businessPlan || {};
  const mvp = v.mvp_data || {};
  const mlp = v.mlp_data || {};
  const pit = v.pitch_data || {};
  const rev = v.revenue_model_data || {};
  const phase = (v.phase || '').toLowerCase();
  const isLateStage = ['beta', 'growth', 'scale'].includes(phase);
  const lines = [];

  lines.push('=== VENTURE ===');
  if (v.name)        lines.push(`Name: ${v.name}`);
  if (v.description) lines.push(`Description: ${v.description}`);
  if (v.sector)      lines.push(`Sector: ${v.sector}`);
  if (v.phase)       lines.push(`Phase: ${v.phase}`);

  lines.push('\n=== BUSINESS PLAN ===');
  if (bp.product_details)         lines.push(`Product Details: ${bp.product_details}`);
  if (bp.market_size)             lines.push(`Market Size: ${bp.market_size}`);
  if (bp.target_customers)        lines.push(`Target Customers: ${bp.target_customers}`);
  if (bp.competition)             lines.push(`Competition: ${bp.competition}`);
  if (bp.entrepreneur_background) lines.push(`Founder Background: ${bp.entrepreneur_background}`);
  if (bp.revenue_model)           lines.push(`Revenue Model: ${bp.revenue_model}`);
  if (bp.funding_requirements)    lines.push(`Funding Requirements: ${bp.funding_requirements}`);

  lines.push('\n=== REVENUE MODEL ===');
  if (rev.businessModel)          lines.push(`Model type: ${rev.businessModel}`);
  if (rev.tier1Price)             lines.push(`Free tier price: ${rev.tier1Price}`);
  if (rev.tier2Price)             lines.push(`Premium price: $${rev.tier2Price}/month`);
  if (rev.acquisitionCost)        lines.push(`CAC: $${rev.acquisitionCost}`);
  if (rev.freeToPaidConversion)   lines.push(`Free to paid conversion: ${rev.freeToPaidConversion}%`);
  if (rev.churnRisk)              lines.push(`Monthly churn: ${rev.churnRisk}%`);
  if (rev.monthlyMarketingBudget) lines.push(`Monthly marketing spend: $${rev.monthlyMarketingBudget}`);
  if (rev.initialUsers)           lines.push(`Initial users: ${rev.initialUsers}`);

  if (forecast) {
    lines.push('\n=== REVENUE FORECAST (pre-calculated) ===');
    lines.push(`Year 1 total users: ${forecast.year1TotalFormatted}`);
    lines.push(`Year 1 paying users: ${forecast.year1PayingFormatted}`);
    lines.push(`Year 1 revenue: ${forecast.year1RevenueFormatted}`);
    lines.push(`Year 2 total users: ${forecast.year2TotalFormatted}`);
    lines.push(`Year 2 paying users: ${forecast.year2PayingFormatted}`);
    lines.push(`Year 2 cumulative revenue: ${forecast.year2CumulativeFormatted}`);
  }

  lines.push('\n=== TECHNOLOGY ===');
  if (mvp.technical_specs)      lines.push(`Tech stack: ${mvp.technical_specs}`);
  if (mlp.technical_excellence) lines.push(`Performance: ${mlp.technical_excellence}`);

  if (!isLateStage && mlp.enhancement_strategy) {
    lines.push(`Product improvements: ${mlp.enhancement_strategy}`);
  } else if (isLateStage && mlp.enhancement_strategy) {
    lines.push(`Product improvements: ${mlp.enhancement_strategy}`);
  }

  // Selected features from feature_matrix
  if (mvp.feature_matrix) {
    const selected = (Array.isArray(mvp.feature_matrix) ? mvp.feature_matrix : [])
      .filter(f => f.isSelected)
      .map(f => f.featureName || f.name)
      .filter(Boolean);
    if (selected.length) lines.push(`Current focused features: ${selected.join(', ')}`);
  }

  lines.push('\n=== TRACTION ===');
  if (betaTesters?.length) lines.push(`Beta sign-ups: ${betaTesters.length}`);
  if (mlp.feedback_analysis) lines.push(`User feedback summary: ${mlp.feedback_analysis}`);
  if (mlp.wow_moments)       lines.push(`Key engagement moments: ${mlp.wow_moments}`);

  if (mvpFeatureFeedback?.length) {
    const grouped = {};
    mvpFeatureFeedback.forEach(f => {
      if (!grouped[f.feature_name]) grouped[f.feature_name] = [];
      grouped[f.feature_name].push(f.rating);
    });
    const top = Object.entries(grouped)
      .map(([name, ratings]) => ({ name, avg: ratings.reduce((a, b) => a + b, 0) / ratings.length }))
      .sort((a, b) => b.avg - a.avg).slice(0, 3);
    if (top.length) lines.push(`Top rated features: ${top.map(f => `${f.name} (${f.avg.toFixed(1)}/10)`).join(', ')}`);
  }

  const meaningful = (productFeedback || []).filter(f => f.feedback_text && f.feedback_text.length >= 15);
  if (meaningful.length) {
    lines.push(`User feedback (${meaningful.length} responses):`);
    meaningful.slice(0, 5).forEach(f => lines.push(`  - "${f.feedback_text}"`));
  }

  if (suggestedFeatures?.length) {
    lines.push(`Most requested features: ${suggestedFeatures.slice(0, 5).map(f => f.feature_name).join(', ')}`);
  }

  lines.push('\n=== PITCH — USE THESE VERSIONS (most refined) ===');
  if (pit.tagline)  lines.push(`Tagline: ${pit.tagline}`);
  if (pit.problem)  lines.push(`Problem: ${pit.problem}`);
  if (pit.solution) lines.push(`Solution: ${pit.solution}`);
  if (pit.market)   lines.push(`Market: ${pit.market}`);
  if (pit.team)     lines.push(`Team: ${pit.team}`);
  if (pit.vision)   lines.push(`Vision: ${pit.vision}`);
  if (pit.the_ask)  lines.push(`The Ask: ${pit.the_ask}`);

  return lines.join('\n');
}

// ─── Detect conflicts ─────────────────────────────────────────────────────────

function detectConflicts(data) {
  const v   = data.venture || {};
  const bp  = data.businessPlan || {};
  const pit = v.pitch_data || {};
  const rev = v.revenue_model_data || {};
  const conflicts = {};

  if (v.problem && pit.problem && v.problem !== pit.problem)
    conflicts.problem = [{ stage: 'Idea stage', text: v.problem }];
  if (bp.problem && pit.problem && bp.problem !== pit.problem)
    conflicts.problem = [...(conflicts.problem || []), { stage: 'Business Plan stage', text: bp.problem }];

  if (v.solution && pit.solution && v.solution !== pit.solution)
    conflicts.solution = [{ stage: 'Idea stage', text: v.solution }];
  if (bp.solution && pit.solution && bp.solution !== pit.solution)
    conflicts.solution = [...(conflicts.solution || []), { stage: 'Business Plan stage', text: bp.solution }];

  if (bp.market_size && pit.market && bp.market_size !== pit.market)
    conflicts.market = [{ stage: 'Business Plan stage', text: bp.market_size }];
  if (rev.targetMarketFactor)
    conflicts.market = [...(conflicts.market || []), { stage: 'Revenue Model', text: `targetMarketFactor: ${rev.targetMarketFactor}` }];

  if (bp.funding_requirements && pit.the_ask && bp.funding_requirements !== pit.the_ask)
    conflicts.the_ask = [{ stage: 'Business Plan stage', text: bp.funding_requirements }];

  return conflicts;
}

// ─── Build appendix tables ────────────────────────────────────────────────────

function buildBudgetRows(budgets) {
  if (!budgets) return [];
  return [
    ...(budgets.salaries || []).map(s => ({ item: s.role || s.name || '', type: 'Salary', cost: s.monthly_cost || s.amount || s.salary || '' })),
    ...(budgets.marketing_costs || []).map(m => ({ item: m.channel || m.name || '', type: 'Marketing', cost: m.monthly_cost || m.amount || '' })),
    ...(budgets.operational_costs || []).map(o => ({ item: o.item || o.name || '', type: 'Operations', cost: o.monthly_cost || o.amount || '' })),
  ];
}

function buildRevenueParamsRows(rev) {
  if (!rev) return [];
  const labels = {
    businessModel: 'Business model', tier2Price: 'Premium price (Tier 2)', tier1Price: 'Free tier price',
    freeToPaidConversion: 'Free to paid conversion (%)', churnRisk: 'Monthly churn (%)',
    acquisitionCost: 'CAC (blended)', initialUsers: 'Initial users at launch',
    monthlyMarketingBudget: 'Monthly marketing budget', targetMarketFactor: 'Target market factor',
    tier2ConversionSplit: 'Tier 2 conversion split (%)',
  };
  return Object.entries(labels)
    .filter(([k]) => rev[k] !== undefined && rev[k] !== 0 && rev[k] !== '')
    .map(([k, label]) => ({ param: label, value: String(rev[k]) }));
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BusinessDeckPage() {
  const [loading, setLoading]         = useState(true);
  const [generating, setGenerating]   = useState(false);
  const [saving, setSaving]           = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [mentorLoading, setMentorLoading] = useState(false);
  const [error, setError]             = useState(null);
  const [mentorFeedback, setMentorFeedback] = useState(null);
  const [mentorError, setMentorError] = useState(null);

  const [user, setUser]               = useState(null);
  const [userPlan, setUserPlan]       = useState(null);
  const [isEligible, setIsEligible]   = useState(false);
  const [venture, setVenture]         = useState(null);
  const [sourceData, setSourceData]   = useState(null);
  const [forecast, setForecast]       = useState(null);
  const [deckData, setDeckData]       = useState(null);
  const [conflicts, setConflicts]     = useState({});
  const [deckRecord, setDeckRecord]   = useState(null);

  // Refs for contentEditable sections
  const sectionRefs = useRef({});

  useEffect(() => { loadPage(); }, []);

  async function loadPage() {
    setLoading(true);
    setError(null);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { setError('not_logged_in'); setLoading(false); return; }
      setUser(authUser);

      const { data: profile } = await supabase.from('user_profiles').select('plan').eq('id', authUser.id).single();
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

      const fc = calculateForecast(ventureData.revenue_model_data);
      setForecast(fc);

      const [bpRes, budgetRes, betaRes, feedbackRes, featureRes, suggestRes] = await Promise.all([
        supabase.from('business_plans').select('*').eq('venture_id', ventureData.id).maybeSingle(),
        supabase.from('budgets').select('*').eq('venture_id', ventureData.id).maybeSingle(),
        supabase.from('beta_testers').select('full_name, email, interest_reason').eq('venture_id', ventureData.id),
        supabase.from('product_feedback').select('feedback_text, visitor_name, feedback_type').eq('venture_id', ventureData.id),
        supabase.from('mvp_feature_feedback').select('feature_name, rating').eq('venture_id', ventureData.id),
        supabase.from('suggested_features').select('feature_name').eq('venture_id', ventureData.id),
      ]);

      const sd = {
        venture: ventureData,
        businessPlan: bpRes.data,
        budgets: budgetRes.data,
        betaTesters: betaRes.data || [],
        productFeedback: feedbackRes.data || [],
        mvpFeatureFeedback: featureRes.data || [],
        suggestedFeatures: suggestRes.data || [],
      };
      setSourceData(sd);
      setConflicts(detectConflicts(sd));

      const { data: existingDeck } = await supabase
        .from('business_decks')
        .select('*')
        .eq('venture_id', ventureData.id)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingDeck?.deck_data) {
        const normalized = {};
        SECTION_KEYS.forEach(k => {
          const val = existingDeck.deck_data[k];
          normalized[k] = typeof val === 'string' ? val : val ? JSON.stringify(val) : '';
        });
        setDeckData(normalized);
        setDeckRecord(existingDeck);
      }

    } catch (err) {
      console.error('loadPage error:', err);
      setError('load_failed');
    }
    setLoading(false);
  }

  // ── Generate ───────────────────────────────────────────────────────────────

  async function handleGenerate() {
    if (!venture || !sourceData) return;
    setGenerating(true);
    setError(null);
    setMentorFeedback(null);
    try {
      const allFields = buildPromptData(sourceData, forecast);
      const rev = venture.revenue_model_data || {};

      const prompt = `You are an expert startup advisor writing a concise, professional investor business plan.

Venture: "${venture.name}" — ${venture.description}
Sector: ${venture.sector} | Phase: ${venture.phase}

RULES:
- Use ONLY the data provided below. Never invent information not in the data.
- For problem, solution, market, team, the_ask: use the PITCH section versions — they are the most refined.
- If the PITCH version is empty, use Business Plan version. If both empty, write: "Complete the relevant stage to populate this section."
- Write in investor language: confident, concise, forward-looking. No markdown. No bullet points. Plain text paragraphs only.
- Do NOT use the words "Certainly", "Sure", "Of course", "I'll" or any AI preamble.

SECTION-SPECIFIC INSTRUCTIONS:

executive_summary: 2 paragraphs. Para 1: what the company does + target audience (synthesize tagline + solution). Para 2: current phase + sign-up count + raise amount + 18-month goal.

problem: Use pitch_data.problem with minimal grammar edits only. Preserve the founder's language exactly.

solution: Use pitch_data.solution as base. Add one technical detail from mvp_data.product_definition only if it adds something not already in pitch solution.

product: Write 3 sub-sections separated by newlines:
  "Overview:" — product_details from Business Plan, one paragraph.
  "Current Status:" — current phase, key improvements from enhancement_strategy in 2 sentences, then "The current version focuses on: [list selected features from feature_matrix where isSelected is true]." End with beta sign-up count.
  "Technology:" — tech stack in one sentence. Performance numbers in one sentence.

market: 3 paragraphs. Para 1: total market size + growth rate. Para 2: beachhead market + specific segment + validated conversion rate. Para 3: competition — name competitors + one sentence on key differentiator.

business_model: Write 3 sub-sections separated by newlines:
  "Revenue Streams:" — synthesize revenue_model into one paragraph including pricing tiers and revenue mix goal.
  "Revenue Forecast:" — write exactly this sentence using the pre-calculated forecast numbers: "Based on a [businessModel] model at $[tier2Price]/month premium pricing, the company projects [year1TotalUsers] total users by end of Year 1 with revenues of [year1Revenue], growing to [year2TotalUsers] total users by end of Year 2 with cumulative revenues of [year2CumulativeRevenue]."
  "Unit Economics:" — 3 sentences: (1) CAC vs price — payback period implication, (2) conversion rate + churn — LTV implication, (3) forward-looking scalability statement.

traction: One narrative paragraph covering: MVP milestone (retention + NPS), MLP improvement (most significant metric change), current beta status (sign-ups), organic growth signal from wow_moments. Do NOT quote individual feedback. Do NOT list raw parameters.

team: Use pitch_data.team with minimal grammar edits only. Keep advisory board if mentioned.

the_ask: Structure as: raise amount, use of funds with percentages and dollar amounts, runway duration, key milestones.

Return ONLY a valid JSON object — no text before or after — with exactly these keys:
executive_summary, problem, solution, product, market, business_model, traction, team, the_ask

DATA:
${allFields}`;

      const result = await InvokeLLM({ prompt, creditType: 'sys' });
      const rawText = result?.response || '';

      let parsed;
      try {
        const cleaned = rawText.replace(/```json|```/g, '').trim();
        try { parsed = JSON.parse(cleaned); }
        catch {
          const match = cleaned.match(/\{[\s\S]*\}/);
          if (match) parsed = JSON.parse(match[0]);
          else throw new Error('no JSON');
        }
      } catch { throw new Error('AI returned invalid JSON. Please try again.'); }

      const normalized = {};
      SECTION_KEYS.forEach(k => {
        const val = parsed[k];
        normalized[k] = typeof val === 'string' ? val : val ? JSON.stringify(val) : '';
      });

      const now = new Date().toISOString();
      const payload = {
        venture_id: venture.id,
        user_email: user.email,
        plan: userPlan,
        version: (deckRecord?.version || 0) + 1,
        deck_data: normalized,
        customization: {},
        generated_at: deckRecord?.generated_at || now,
        updated_at: now,
      };

      let saved;
      if (deckRecord?.id) {
        const { data } = await supabase.from('business_decks').update(payload).eq('id', deckRecord.id).select().single();
        saved = data;
      } else {
        const { data } = await supabase.from('business_decks').insert(payload).select().single();
        saved = data;
      }

      setDeckData(normalized);
      if (saved) setDeckRecord(saved);

    } catch (err) {
      console.error('Generate error:', err);
      setError(err.message === 'NO_CREDITS' ? 'no_credits' : err.message || 'generation_failed');
    }
    setGenerating(false);
  }

  // ── Save ───────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!deckData || !deckRecord?.id) return;
    setSaving(true);
    // Collect current text from contentEditable refs
    const updated = { ...deckData };
    SECTION_KEYS.forEach(k => {
      if (sectionRefs.current[k]) {
        updated[k] = sectionRefs.current[k].innerText || '';
      }
    });
    setDeckData(updated);
    await supabase.from('business_decks')
      .update({ deck_data: updated, updated_at: new Date().toISOString() })
      .eq('id', deckRecord.id);
    setSaving(false);
  }

  // ── Mentor ─────────────────────────────────────────────────────────────────

  async function handleMentor() {
    if (!deckData || !venture) return;
    setMentorLoading(true);
    setMentorFeedback(null);
    setMentorError(null);

    // Collect current text from contentEditable refs
    const currentText = {};
    SECTION_KEYS.forEach(k => {
      currentText[k] = sectionRefs.current[k]?.innerText || deckData[k] || '';
    });

    try {
      const fullDoc = SECTION_KEYS.map(k => `${SECTION_TITLES[k]}:\n${currentText[k]}`).join('\n\n');
      const prompt = `You are an expert startup mentor reviewing a complete investor business plan.

Venture: "${venture.name}" — ${venture.description}

FULL DOCUMENT:
${fullDoc}

Instruction:
1. Start with the text "Mentor Feedback" exactly.
2. On the very next line, provide an overall 10-star rating using ★ and ☆ (e.g. ★★★★★☆☆☆☆☆).
3. Write section "Overall Analysis:" — 2-3 sentences on the overall quality and investor-readiness.
4. Write section "Sections to Improve:" — for each section that needs work, write the section name followed by a specific note. Be direct. If a section is strong, skip it.
5. Write section "Missing Information:" — list any critical information an investor would expect that is not present.
6. Write section "Challenge Question:" — one sharp question the founder should be able to answer before presenting to investors.
7. Do NOT use markdown formatting. Plain text only.
8. Do NOT rewrite any content. Feedback and questions only.

Language: English.`;

      const result = await InvokeLLM({ prompt, creditType: 'mentor' });
      setMentorFeedback(result?.response || 'No response.');
    } catch (err) {
      setMentorError(err.message === 'NO_CREDITS'
        ? 'You have used all your mentor credits this month. Upgrade your plan to get more.'
        : 'Error getting mentor feedback. Please try again.');
    }
    setMentorLoading(false);
  }

  // ── Download ───────────────────────────────────────────────────────────────

  async function handleDownload() {
    if (!deckData) return;
    setDownloading(true);
    try {
      const { Document, Packer, Paragraph, TextRun, BorderStyle, AlignmentType,
              Table, TableRow, TableCell, WidthType, ShadingType } = await import('docx');

      const hexColor = '2563EB';
      const makeH1 = text => new Paragraph({
        children: [new TextRun({ text, bold: true, size: 32, color: hexColor, font: 'Arial' })],
        spacing: { before: 400, after: 160 },
      });
      const makeH2 = text => new Paragraph({
        children: [new TextRun({ text, bold: true, size: 24, color: '374151', font: 'Arial' })],
        spacing: { before: 240, after: 100 },
      });
      const makeBody = text => (text || '').split('\n').filter(Boolean).map(line =>
        new Paragraph({ children: [new TextRun({ text: line, size: 22, font: 'Arial' })], spacing: { after: 100 } })
      );
      const makeDivider = () => new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' } },
        spacing: { before: 160, after: 160 }, children: [],
      });

      const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
      const borders = { top: border, bottom: border, left: border, right: border };
      const makeCell = (text, bold = false, shade = false) => new TableCell({
        borders,
        shading: shade ? { fill: 'F8FAFC', type: ShadingType.CLEAR } : undefined,
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: String(text), size: 20, font: 'Arial', bold })] })],
      });

      // Get current text (from refs or deckData)
      const getText = k => sectionRefs.current[k]?.innerText || deckData[k] || '';

      const children = [
        // Cover
        new Paragraph({
          children: [new TextRun({ text: venture?.name || '', bold: true, size: 56, color: hexColor, font: 'Arial' })],
          alignment: AlignmentType.CENTER, spacing: { before: 800, after: 200 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Investor Business Plan', size: 28, color: '6B7280', font: 'Arial' })],
          alignment: AlignmentType.CENTER, spacing: { after: 120 },
        }),
        new Paragraph({
          children: [new TextRun({ text: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }), size: 22, color: '9CA3AF', font: 'Arial' })],
          alignment: AlignmentType.CENTER, spacing: { after: 120 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Confidential — Not for distribution', size: 20, color: 'D1D5DB', italics: true, font: 'Arial' })],
          alignment: AlignmentType.CENTER, spacing: { after: 800 },
        }),
        makeDivider(),
      ];

      // 9 sections — no conflict notes
      SECTION_KEYS.forEach((k, i) => {
        const text = getText(k);
        if (!text.trim()) return;
        children.push(makeH1(`${i + 1}. ${SECTION_TITLES[k]}`));
        // Handle sub-sections (Overview:, Current Status:, etc.)
        const lines = text.split('\n');
        lines.forEach(line => {
          if (!line.trim()) return;
          if (/^(Overview|Current Status|Technology|Revenue Streams|Revenue Forecast|Unit Economics):/.test(line.trim())) {
            children.push(makeH2(line.trim().replace(':', '')));
          } else {
            children.push(...makeBody(line));
          }
        });
        children.push(makeDivider());
      });

      // Appendix A — Budget
      const budgetRows = buildBudgetRows(sourceData?.budgets);
      if (budgetRows.length) {
        children.push(makeH1('Appendix A — Monthly Budget Breakdown'));
        const total = budgetRows.reduce((sum, r) => {
          const n = parseFloat(String(r.cost).replace(/[^0-9.]/g, ''));
          return sum + (isNaN(n) ? 0 : n);
        }, 0);
        children.push(new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [4680, 2340, 2340],
          rows: [
            new TableRow({ children: [makeCell('Item', true, true), makeCell('Type', true, true), makeCell('Monthly Cost', true, true)] }),
            ...budgetRows.map(r => new TableRow({ children: [makeCell(r.item), makeCell(r.type), makeCell(r.cost)] })),
            new TableRow({ children: [makeCell('Total monthly burn', true, true), makeCell('', false, true), makeCell(`$${total.toLocaleString()}`, true, true)] }),
          ],
        }));
        children.push(makeDivider());
      }

      // Appendix B — Revenue Model Assumptions
      const revRows = buildRevenueParamsRows(venture?.revenue_model_data);
      if (revRows.length) {
        children.push(makeH1('Appendix B — Revenue Model Assumptions'));
        children.push(new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [5460, 3900],
          rows: [
            new TableRow({ children: [makeCell('Parameter', true, true), makeCell('Value', true, true)] }),
            ...revRows.map(r => new TableRow({ children: [makeCell(r.param), makeCell(r.value)] })),
          ],
        }));
      }

      const doc = new Document({
        styles: { default: { document: { run: { font: 'Arial', size: 22 } } } },
        sections: [{
          properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
          children,
        }],
      });

      const buffer = await Packer.toBuffer(doc);
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const monthYear = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }).replace(' ', '');
      a.href = url;
      a.download = `${(venture?.name || 'BusinessPlan').replace(/\s+/g, '_')}_BusinessPlan_${monthYear}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      setError('download_failed');
    }
    setDownloading(false);
  }

  // ── Render states ──────────────────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
        <p className="text-sm text-gray-500">Loading your business deck...</p>
      </div>
    </div>
  );

  if (error === 'not_logged_in') return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-3">
        <Lock className="w-10 h-10 text-gray-400 mx-auto" />
        <p className="text-gray-600 font-medium">Please log in to access the Business Deck.</p>
      </div>
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
          The Business Deck Builder is available on the <strong>Pro Founder</strong> plan and above.
        </p>
        <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2">
          <p className="text-sm font-semibold text-gray-700">Included with Pro Founder:</p>
          <p className="text-sm text-gray-600">✓ AI-generated investor-ready business plan from your data</p>
          <p className="text-sm text-gray-600">✓ Full document preview with inline editing</p>
          <p className="text-sm text-gray-600">✓ Mentor review of the full document</p>
          <p className="text-sm text-gray-600">✓ Download as Word (.docx) with appendices</p>
        </div>
        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-base font-semibold">Upgrade Plan</Button>
        <p className="text-xs text-gray-400">Current plan: {userPlan || 'explorer'}</p>
      </div>
    </div>
  );

  if (error === 'no_venture') return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="text-gray-600 font-medium">No venture found. Please create a venture first.</p>
    </div>
  );

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Top bar ── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Business Deck — {venture?.name}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5 capitalize">{venture?.phase} phase</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {deckRecord && (
              <span className="text-xs text-gray-400 hidden sm:block">
                Generated: {new Date(deckRecord.generated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
            {deckData && (
              <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}
                className="text-gray-600 border-gray-300 text-xs gap-1.5">
                {saving ? <Loader2 className="animate-spin w-3 h-3" /> : <Save className="w-3 h-3" />}
                Save
              </Button>
            )}
            {deckData && (
              <Button variant="outline" size="sm" onClick={handleMentor} disabled={mentorLoading}
                className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 text-xs font-semibold gap-1.5">
                {mentorLoading
                  ? <><Loader2 className="animate-spin w-3 h-3" />Reviewing...</>
                  : <><MessageSquare className="w-3 h-3" />Mentor Review (1 credit)</>}
              </Button>
            )}
            <Button onClick={handleGenerate} disabled={generating}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 h-9 text-sm gap-1.5">
              {generating
                ? <><Loader2 className="animate-spin w-4 h-4" />Generating...</>
                : deckData
                  ? <><RefreshCw className="w-4 h-4" />Regenerate</>
                  : <><Sparkles className="w-4 h-4" />Generate Business Plan</>}
            </Button>
            {deckData && (
              <Button onClick={handleDownload} disabled={downloading}
                className="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-4 h-9 text-sm gap-1.5">
                {downloading
                  ? <><Loader2 className="animate-spin w-4 h-4" />Preparing...</>
                  : <><Download className="w-4 h-4" />Download .docx</>}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* ── Page description ── */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
            <div className="space-y-2">
              <p className="text-sm font-semibold text-indigo-900">About the Business Deck</p>
              <p className="text-sm text-indigo-700 leading-relaxed">
                This tool assembles all the information you have entered throughout your StartZig journey into a professional investor-ready business plan.
                It is available exclusively on the <strong>Pro Founder</strong> plan and above.
              </p>
              <p className="text-sm text-indigo-700 leading-relaxed">
                <strong>How to use it:</strong> Click <em>Generate Business Plan</em> to create your first version. The plan will appear below as a live document — you can click on any text to edit it directly. Use <em>Mentor Review</em> to get expert feedback on the full document. When you are satisfied, download it as a Word file.
              </p>
              <p className="text-sm text-indigo-600 font-medium">
                ✏️ You can edit any part of the text directly in the preview below, or paste in new content. Use Mentor Review to get feedback on your changes.
              </p>
            </div>
          </div>
        </div>

        {/* ── Errors ── */}
        {error && !['not_logged_in', 'no_venture'].includes(error) && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            {error === 'download_failed' ? 'Download failed. Please try again.'
              : error === 'no_credits' ? 'You have used all your credits this month.'
              : error}
          </div>
        )}

        {/* ── Conflict notes ── */}
        {Object.keys(conflicts).length > 0 && deckData && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-amber-700 mb-2">⚠️ Earlier versions found — screen only, not included in download:</p>
            {Object.entries(conflicts).map(([field, versions]) => (
              <div key={field} className="mb-2">
                <p className="text-xs font-medium text-amber-600 capitalize">{field.replace('_', ' ')}:</p>
                {versions.map((v, i) => (
                  <p key={i} className="text-xs text-gray-600 ml-3">{v.stage}: {v.text.slice(0, 100)}{v.text.length > 100 ? '...' : ''}</p>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ── Mentor feedback ── */}
        {mentorError && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">{mentorError}</div>
        )}
        {mentorFeedback && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6">
            <div className="space-y-3">
              {mentorFeedback.split('\n').map((line, i) => {
                const t = line.trim();
                if (!t) return null;
                if (t.includes('★') || t.includes('☆'))
                  return <div key={i} className="text-2xl tracking-widest text-blue-600 font-mono">{t}</div>;
                if (t === 'Mentor Feedback')
                  return <h3 key={i} className="text-lg font-bold text-indigo-900">{t}</h3>;
                if (['Overall Analysis:', 'Sections to Improve:', 'Missing Information:', 'Challenge Question:'].some(h => t.startsWith(h)))
                  return <h4 key={i} className="text-base font-bold text-indigo-800 mt-4">{t.replace(':', '')}</h4>;
                return <p key={i} className="text-gray-700 text-sm leading-relaxed">{t}</p>;
              })}
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {!deckData && !generating && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-indigo-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Generate your Business Plan</h2>
            <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
              StartZig will synthesize all your work into a professional investor-ready business plan. Free on first generation.
            </p>
            <Button onClick={handleGenerate} disabled={generating}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 h-12 text-base gap-2">
              <Sparkles className="w-5 h-5" />Generate Business Plan
            </Button>
          </div>
        )}

        {/* ── Generating skeleton ── */}
        {generating && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 animate-pulse space-y-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-5 bg-slate-200 rounded w-1/4" />
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-5/6" />
                <div className="h-3 bg-slate-100 rounded w-4/6" />
              </div>
            ))}
          </div>
        )}

        {/* ── Document preview ── */}
        {deckData && !generating && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            {/* Document header */}
            <div className="border-b border-slate-100 px-12 py-8 text-center bg-slate-50 rounded-t-2xl">
              <h1 className="text-4xl font-bold text-indigo-600">{venture?.name}</h1>
              <p className="text-gray-500 mt-2 text-base">Investor Business Plan</p>
              <p className="text-gray-400 text-sm mt-1">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
              <p className="text-gray-300 text-xs mt-1 italic">Confidential — Not for distribution</p>
            </div>

            {/* Document body — inline editable */}
            <div className="px-12 py-8 space-y-8">
              {SECTION_KEYS.map((key, index) => {
                const text = deckData[key] || '';
                return (
                  <div key={key} className="space-y-3">
                    <h2 className="text-xl font-bold text-indigo-600 border-b border-slate-100 pb-2">
                      {index + 1}. {SECTION_TITLES[key]}
                    </h2>
                    <div
                      ref={el => { sectionRefs.current[key] = el; }}
                      contentEditable
                      suppressContentEditableWarning
                      className="text-gray-700 text-sm leading-relaxed outline-none focus:bg-indigo-50 focus:rounded-lg focus:px-3 focus:py-2 transition-all cursor-text whitespace-pre-wrap min-h-[60px]"
                      style={{ caretColor: '#4F46E5' }}
                      data-placeholder="No content generated for this section."
                    >
                      {text}
                    </div>
                  </div>
                );
              })}

              {/* Forecast table */}
              {forecast && (
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-gray-700">Key Metrics & Forecast Highlights</h3>
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="text-left px-4 py-2 border border-slate-200 font-semibold text-gray-700">Metric</th>
                        <th className="text-left px-4 py-2 border border-slate-200 font-semibold text-gray-700">Year 1</th>
                        <th className="text-left px-4 py-2 border border-slate-200 font-semibold text-gray-700">Year 2</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td className="px-4 py-2 border border-slate-200">Total Users</td><td className="px-4 py-2 border border-slate-200">{forecast.year1TotalFormatted}</td><td className="px-4 py-2 border border-slate-200">{forecast.year2TotalFormatted}</td></tr>
                      <tr className="bg-slate-50"><td className="px-4 py-2 border border-slate-200">Paying Users</td><td className="px-4 py-2 border border-slate-200">{forecast.year1PayingFormatted}</td><td className="px-4 py-2 border border-slate-200">{forecast.year2PayingFormatted}</td></tr>
                      <tr><td className="px-4 py-2 border border-slate-200 font-semibold">Revenue</td><td className="px-4 py-2 border border-slate-200 font-semibold text-indigo-600">{forecast.year1RevenueFormatted}</td><td className="px-4 py-2 border border-slate-200 font-semibold text-indigo-600">{forecast.year2CumulativeFormatted}</td></tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Appendix A */}
              {(() => {
                const rows = buildBudgetRows(sourceData?.budgets);
                if (!rows.length) return null;
                const total = rows.reduce((sum, r) => {
                  const n = parseFloat(String(r.cost).replace(/[^0-9.]/g, ''));
                  return sum + (isNaN(n) ? 0 : n);
                }, 0);
                return (
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <h2 className="text-xl font-bold text-indigo-600">Appendix A — Monthly Budget Breakdown</h2>
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="text-left px-4 py-2 border border-slate-200 font-semibold">Item</th>
                          <th className="text-left px-4 py-2 border border-slate-200 font-semibold">Type</th>
                          <th className="text-left px-4 py-2 border border-slate-200 font-semibold">Monthly Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r, i) => (
                          <tr key={i} className={i % 2 === 0 ? '' : 'bg-slate-50'}>
                            <td className="px-4 py-2 border border-slate-200">{r.item}</td>
                            <td className="px-4 py-2 border border-slate-200">{r.type}</td>
                            <td className="px-4 py-2 border border-slate-200">{r.cost}</td>
                          </tr>
                        ))}
                        <tr className="bg-slate-100 font-semibold">
                          <td className="px-4 py-2 border border-slate-200">Total monthly burn</td>
                          <td className="px-4 py-2 border border-slate-200"></td>
                          <td className="px-4 py-2 border border-slate-200 text-indigo-600">${total.toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                );
              })()}

              {/* Appendix B */}
              {(() => {
                const rows = buildRevenueParamsRows(venture?.revenue_model_data);
                if (!rows.length) return null;
                return (
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <h2 className="text-xl font-bold text-indigo-600">Appendix B — Revenue Model Assumptions</h2>
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="text-left px-4 py-2 border border-slate-200 font-semibold">Parameter</th>
                          <th className="text-left px-4 py-2 border border-slate-200 font-semibold">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r, i) => (
                          <tr key={i} className={i % 2 === 0 ? '' : 'bg-slate-50'}>
                            <td className="px-4 py-2 border border-slate-200">{r.param}</td>
                            <td className="px-4 py-2 border border-slate-200">{r.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
