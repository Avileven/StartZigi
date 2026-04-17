'use client';

// app/business-deck/page.jsx
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Loader2, Download, FileText, Lock, MessageSquare, Sparkles, RefreshCw, Info } from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const ELIGIBLE_PLANS = ['pro_founder', 'unicorn'];
const MONTHS = 24;
const ORGANIC_K_FACTOR = 0.65;
const TARGET_MARKET_SCALING = 10000000;
const FUNDING_BUFFER = 1.3; // 30% overhead on top of funding gap

const SECTION_KEYS = ['executive_summary', 'problem', 'solution', 'product', 'market', 'business_model', 'team', 'the_ask'];

const SECTION_TITLES = {
  executive_summary: 'Executive Summary',
  problem: 'The Problem',
  solution: 'The Solution',
  product: 'Product',
  market: 'Market Opportunity',
  business_model: 'Business Model',
  team: 'Team',
  the_ask: 'The Ask *',
};

// Source map — screen only, not in download
const SECTION_SOURCES = {
  executive_summary: 'Source: Generated from all sections below',
  problem: 'Source: business_plans.problem',
  solution: 'Source: ventures.solution',
  product: 'Source: business_plans.product_details → ventures.solution | mvp_data.feature_matrix | mvp_data.technical_specs',
  market: 'Source: business_plans.market_size / target_customers / competition',
  business_model: 'Source: revenue_model_data (businessModel, tier2Price, CAC, conversion, churn)',
  team: 'Source: business_plans.entrepreneur_background',
  the_ask: 'Source: Calculated from budgets + revenue forecast × 1.3 buffer',
};

// Sections where AI synthesizes data (show asterisk)
const AI_SYNTHESIZED_SECTIONS = ['executive_summary', 'product', 'market', 'business_model', 'the_ask'];

const COLOR_PALETTE = [
  { label: 'Indigo', value: '#4F46E5' },
  { label: 'Blue',   value: '#2563EB' },
  { label: 'Teal',   value: '#0D9488' },
  { label: 'Green',  value: '#16A34A' },
  { label: 'Purple', value: '#7C3AED' },
  { label: 'Black',  value: '#111827' },
];

// Fix AI returning object instead of string for a section
function normalizeSection(val) {
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null) {
    return Object.entries(val).map(([k, v]) => k + ':\n' + v).join('\n\n');
  }
  return '';
}

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
    const monthRev = t1Users * tier1Price + t2Users * tier2Price +
      ((businessModel === 'ad-driven' || businessModel === 'freemium') ? (freeUsers / 1000) * adRevenuePer1000 : 0);

    if (month <= 12) {
      year1Revenue += monthRev;
      if (month === 12) { year1TotalUsers = totalUsers; year1PayingUsers = payingUsers; }
    } else { year2Revenue += monthRev; }
  }

  const fmt = n => n >= 1000000 ? `$${(n/1000000).toFixed(1)}M` : n >= 1000 ? `$${(n/1000).toFixed(0)}K` : `$${Math.round(n)}`;
  const fmtN = n => n >= 1000 ? `${(n/1000).toFixed(0)}K` : String(Math.round(n));

  return {
    year1Revenue: Math.round(year1Revenue),
    year2Revenue: Math.round(year2Revenue),
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

// ─── Calculate funding ask ────────────────────────────────────────────────────

function calculateFundingAsk(budgets, forecast) {
  if (!budgets || !forecast) return null;

  const allRows = [
    ...(budgets.salaries || []).map(s => (parseFloat(s.avg_salary || s.monthly_cost || 0)) * (parseInt(s.count) || 1)),
    ...(budgets.marketing_costs || []).map(m => parseFloat(m.cost || m.monthly_cost || 0)),
    ...(budgets.operational_costs || []).map(o => parseFloat(o.cost || o.monthly_cost || 0)),
  ];
  const monthlyBurn = allRows.reduce((sum, c) => sum + (c || 0), 0);
  if (!monthlyBurn) return null;

  const totalCosts = monthlyBurn * 24;
  const totalRevenue = forecast.year1Revenue + forecast.year2Revenue;
  const gap = totalCosts - totalRevenue;
  const ask = gap > 0 ? Math.round(gap * FUNDING_BUFFER / 1000) * 1000 : 0;
  const surplus = gap < 0 ? Math.abs(gap) : 0;
  const isUnrealistic = totalRevenue > totalCosts * 10;

  const fmt = n => n >= 1000000 ? `$${(n/1000000).toFixed(1)}M` : `$${(n/1000).toFixed(0)}K`;

  return {
    monthlyBurn,
    totalCosts,
    totalRevenue,
    gap,
    ask,
    surplus,
    isUnrealistic,
    askFormatted: ask > 0 ? fmt(ask) : fmt(monthlyBurn * 24),
    surplusFormatted: surplus > 0 ? fmt(surplus) : null,
    monthlyBurnFormatted: fmt(monthlyBurn),
  };
}


// Filter out placeholder/meaningless founder text
function isMeaningfulContent(text) {
  if (!text || text.trim().length < 15) return false;
  const lower = text.toLowerCase();
  const placeholders = ['not sure', 'will follow', 'tbd', 'todo', 'n/a', 'to be', 'coming soon', 'will add', 'will fill'];
  return !placeholders.some(p => lower.includes(p));
}

function meaningfulOrFallback(text) {
  return isMeaningfulContent(text) ? text : null;
}

// ─── Build prompt data ────────────────────────────────────────────────────────

function buildPromptData(data, forecast, fundingAsk) {
  const { venture, businessPlan, budgets, betaTesters, productFeedback, mvpFeatureFeedback, suggestedFeatures } = data;
  const v   = venture || {};
  const bp  = businessPlan || {};
  const mvp = v.mvp_data || {};
  const mlp = v.mlp_data || {};
  const rev = v.revenue_model_data || {};
  const lines = [];

  lines.push('=== VENTURE ===');
  if (v.name)        lines.push(`Name: ${v.name}`);
  if (v.description) lines.push(`Description: ${v.description}`);
  if (v.solution)    lines.push(`Solution (use for Overview if product_details empty): ${v.solution}`);
  if (v.sector)      lines.push(`Sector: ${v.sector}`);
  if (v.phase)       lines.push(`Phase: ${v.phase}`);

  lines.push('\n=== BUSINESS PLAN ===');
  if (meaningfulOrFallback(bp.product_details)) lines.push(`Product Details: ${bp.product_details}`);
  if (meaningfulOrFallback(bp.market_size)) lines.push(`Market Size: ${bp.market_size}`);
  if (meaningfulOrFallback(bp.target_customers)) lines.push(`Target Customers: ${bp.target_customers}`);
  if (meaningfulOrFallback(bp.competition)) lines.push(`Competition: ${bp.competition}`);
  if (meaningfulOrFallback(bp.entrepreneur_background)) lines.push(`Founder Background: ${bp.entrepreneur_background}`);

  lines.push('\n=== REVENUE MODEL DATA (use these numbers — not text descriptions) ===');
  if (rev.businessModel)          lines.push(`Model type: ${rev.businessModel}`);
  // tier1Price intentionally excluded from prompt to avoid misinterpretation
  if (rev.tier2Price)             lines.push(`Premium price: $${rev.tier2Price}/month`);
  if (rev.acquisitionCost)        lines.push(`CAC: $${rev.acquisitionCost}`);
  if (rev.freeToPaidConversion)   lines.push(`Free to paid conversion: ${rev.freeToPaidConversion}%`);
  if (rev.churnRisk)              lines.push(`Monthly churn: ${rev.churnRisk}%`);
  if (rev.monthlyMarketingBudget) lines.push(`Monthly marketing spend: $${rev.monthlyMarketingBudget}`);
  if (rev.initialUsers)           lines.push(`Initial users: ${rev.initialUsers}`);

  if (forecast) {
    lines.push('\n=== REVENUE FORECAST (pre-calculated — use these exact numbers) ===');
    lines.push(`Year 1 total users: ${forecast.year1TotalFormatted}`);
    lines.push(`Year 1 paying users: ${forecast.year1PayingFormatted}`);
    lines.push(`Year 1 revenue: ${forecast.year1RevenueFormatted}`);
    lines.push(`Year 2 total users: ${forecast.year2TotalFormatted}`);
    lines.push(`Year 2 paying users: ${forecast.year2PayingFormatted}`);
    lines.push(`Year 2 cumulative revenue: ${forecast.year2CumulativeFormatted}`);
  }

  if (fundingAsk) {
    lines.push('\n=== FUNDING ASK (pre-calculated) ===');
    lines.push(`Monthly burn rate: ${fundingAsk.monthlyBurnFormatted}`);
    lines.push(`Funding ask (24-month gap + 30% buffer): ${fundingAsk.askFormatted}`);
  }

  lines.push('\n=== TECHNOLOGY ===');
  if (mvp.technical_specs)      lines.push(`Tech stack: ${mvp.technical_specs}`);
  if (mlp.technical_excellence) lines.push(`Performance: ${mlp.technical_excellence}`);
  if (mlp.enhancement_strategy) lines.push(`Product improvements: ${mlp.enhancement_strategy}`);

  // Selected features
  if (mvp.feature_matrix) {
    const selected = (Array.isArray(mvp.feature_matrix) ? mvp.feature_matrix : [])
      .filter(f => f.isSelected)
      .map(f => f.featureName || f.name)
      .filter(Boolean);
    if (selected.length) lines.push(`Selected features: ${selected.join(', ')}`);
  }

  lines.push('\n=== TRACTION ===');
  if (betaTesters?.length) lines.push(`Beta sign-ups: ${betaTesters.length}`);
  if (mlp.wow_moments)     lines.push(`Organic growth moments: ${mlp.wow_moments}`);

  // Only meaningful product feedback
  const meaningful = (productFeedback || []).filter(f => f.feedback_text && f.feedback_text.length >= 15);
  if (meaningful.length) {
    lines.push(`User feedback (${meaningful.length} meaningful responses):`);
    meaningful.slice(0, 5).forEach(f => lines.push(`  - "${f.feedback_text}"`));
  }

  if (suggestedFeatures?.length) {
    lines.push(`Most requested features: ${suggestedFeatures.slice(0, 5).map(f => f.feature_name).join(', ')}`);
  }

  lines.push('\n=== FOUNDER BACKGROUND ===');
  if (meaningfulOrFallback(bp.entrepreneur_background)) lines.push(`Team: ${bp.entrepreneur_background}`);

  return lines.join('\n');
}

// ─── Detect conflicts ─────────────────────────────────────────────────────────

function detectConflicts(data) {
  const v   = data.venture || {};
  const bp  = data.businessPlan || {};
  const conflicts = {};

  const isMeaningful = text => {
    if (!text || text.length < 20) return false;
    const lower = text.toLowerCase();
    if (lower.includes('not sure') || lower.includes('will follow') || lower.includes('tbd') || lower.includes('todo')) return false;
    return true;
  };

  if (isMeaningful(v.problem) && isMeaningful(bp.problem) && v.problem !== bp.problem)
    conflicts.problem = [{ stage: 'Idea stage', text: v.problem }, { stage: 'Business Plan stage', text: bp.problem }];

  if (isMeaningful(v.solution) && isMeaningful(bp.solution) && v.solution !== bp.solution)
    conflicts.solution = [{ stage: 'Idea stage', text: v.solution }, { stage: 'Business Plan stage', text: bp.solution }];

  return conflicts;
}

// ─── Budget rows ──────────────────────────────────────────────────────────────

function buildBudgetRows(budgets) {
  if (!budgets) return [];
  return [
    ...(budgets.salaries || []).map(s => {
      const count = parseInt(s.count) || 1;
      const monthlyCost = (parseFloat(s.avg_salary || s.monthly_cost || s.amount || 0)) * count;
      const label = count > 1 ? `${s.role || s.name || ''} (×${count})` : (s.role || s.name || '');
      return { item: label, type: 'Salary', monthly: monthlyCost, annual: monthlyCost * 12 };
    }),
    ...(budgets.marketing_costs || []).map(m => {
      const monthly = parseFloat(m.cost || m.monthly_cost || m.amount || 0);
      return { item: m.channel || m.name || '', type: 'Marketing', monthly, annual: monthly * 12 };
    }),
    ...(budgets.operational_costs || []).map(o => {
      const monthly = parseFloat(o.cost || o.monthly_cost || o.amount || 0);
      return { item: o.item || o.name || '', type: 'Operations', monthly, annual: monthly * 12 };
    }),
  ];
}

function calculateBreakeven(budgets, revenueModelData) {
  if (!budgets || !revenueModelData) return null;
  const rows = buildBudgetRows(budgets);
  const monthlyBurn = rows.reduce((sum, r) => sum + (r.monthly || 0), 0);
  if (!monthlyBurn) return null;

  // Run forecast month by month to find break-even
  const MONTHS = 24;
  const ORGANIC_K_FACTOR = 0.65;
  const TARGET_MARKET_SCALING = 10000000;
  const {
    businessModel = 'freemium', tier1Price = 0, tier2Price = 0,
    tier2ConversionSplit = 0, adRevenuePer1000 = 0,
    initialUsers = 0, churnRisk = 0, targetMarketFactor = 0,
    freeToPaidConversion = 0, monthlyMarketingBudget = 0, acquisitionCost = 0.01,
  } = revenueModelData;

  const targetMarketSize = targetMarketFactor * TARGET_MARKET_SCALING;
  let totalUsers = initialUsers;
  let payingUsers = businessModel === 'transactional' ? totalUsers : 0;
  const churnRateDecimal = churnRisk / 100;
  const tier2SplitDecimal = tier2ConversionSplit / 100;
  const conversionRateDecimal = freeToPaidConversion / 100;
  const effectiveCAC = Math.max(0.01, acquisitionCost);
  const fmt = n => n >= 1000000 ? '$' + (n/1000000).toFixed(1) + 'M' : n >= 1000 ? '$' + (n/1000).toFixed(0) + 'K' : '$' + Math.round(n);
  const fmtN = n => n >= 1000 ? (n/1000).toFixed(0) + 'K' : String(Math.round(n));

  const data = [];
  let breakevenMonth = null;
  let cumulativeCosts = 0;
  let cumulativeRevenue = 0;

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
    const monthRev = t1Users * tier1Price + t2Users * tier2Price +
      ((businessModel === 'ad-driven' || businessModel === 'freemium') ? (freeUsers / 1000) * adRevenuePer1000 : 0);

    cumulativeCosts += monthlyBurn;
    cumulativeRevenue += monthRev;

    if (breakevenMonth === null && monthRev >= monthlyBurn) {
      breakevenMonth = month;
    }

    data.push({
      month,
      expenses: monthlyBurn,
      revenue: Math.round(monthRev),
      cumulativeCosts: Math.round(cumulativeCosts),
      cumulativeRevenue: Math.round(cumulativeRevenue),
      gap: Math.round(cumulativeRevenue - cumulativeCosts),
      expensesFormatted: fmt(monthlyBurn),
      revenueFormatted: fmt(monthRev),
      gapFormatted: fmt(cumulativeRevenue - cumulativeCosts),
    });
  }

  return { data, breakevenMonth, monthlyBurn, monthlyBurnFormatted: fmt(monthlyBurn) };
}

function buildRevenueParamsRows(rev) {
  if (!rev) return [];
  const labels = {
    businessModel: 'Business model', tier2Price: 'Premium price (Tier 2)',
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
  const [loading, setLoading]           = useState(true);
  const [generating, setGenerating]     = useState(false);
  const autoSaveTimer = useRef(null);
  const [downloading, setDownloading]   = useState(false);
  const [mentorLoading, setMentorLoading] = useState(false);
  const [error, setError]               = useState(null);
  const [mentorFeedback, setMentorFeedback] = useState(null);
  const [mentorError, setMentorError]   = useState(null);

  const [user, setUser]                 = useState(null);
  const [userPlan, setUserPlan]         = useState(null);
  const [isEligible, setIsEligible]     = useState(false);
  const [venture, setVenture]           = useState(null);
  const [sourceData, setSourceData]     = useState(null);
  const [forecast, setForecast]         = useState(null);
  const [fundingAsk, setFundingAsk]     = useState(null);
  const [deckData, setDeckData]         = useState(null);
  const [conflicts, setConflicts]       = useState({});
  const [deckRecord, setDeckRecord]     = useState(null);

  const [customization, setCustomization] = useState({
    heading_color: '#4F46E5',
    font_size: 'medium',
    company_name: '',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
    logo_url: '',
  });

  const [contactInfo, setContactInfo] = useState({
    enabled: false,
    email: '',
    website: '',
  });

  const [appendixConfig, setAppendixConfig] = useState({
    forecast: true,
    budget: true,
    revenueParams: true,
    breakeven: true,
  });
  const [breakevenData, setBreakevenData] = useState(null);

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
      setCustomization(prev => ({ ...prev, company_name: prev.company_name || ventureData.name || '' }));

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

      // Calculate break-even
      if (budgetRes.data && ventureData.revenue_model_data) {
        const be = calculateBreakeven(budgetRes.data, ventureData.revenue_model_data);
        setBreakevenData(be);
      }

      const fa = calculateFundingAsk(budgetRes.data, fc);
      setFundingAsk(fa);

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
          normalized[k] = normalizeSection(existingDeck.deck_data[k]);
        });
        setDeckData(normalized);
        setDeckRecord(existingDeck);
        if (existingDeck.customization) {
          setCustomization(prev => ({ ...prev, ...existingDeck.customization }));
        }
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
      const allFields = buildPromptData(sourceData, forecast, fundingAsk);

      const prompt = `You are an expert startup advisor writing a concise, professional investor business plan.

Venture: "${venture.name}" — ${venture.description}
Sector: ${venture.sector} | Phase: ${venture.phase}

RULES:
- Use ONLY the data provided below. Never invent information not in the data.
- Do NOT use pitch_data at all — it is not provided.
- Write in investor language: confident, concise, forward-looking.
- No markdown formatting. No bold text. No bullet points. Plain text paragraphs only.
- Sub-section labels (Overview, Current Status, etc.) should appear on their own line followed by a colon, then a new line with the content.
- Do NOT use the words "Certainly", "Sure", "Of course" or any AI preamble.
- If a field is empty or missing, write: "No meaningful data found for this section. Please complete the relevant stage or edit directly."

SECTION-SPECIFIC INSTRUCTIONS:

executive_summary:
[Leave this field as an empty string "" — it will be generated separately from the other sections.]

problem:
Use business_plans.problem with minimal grammar edits only. Preserve the founder's language.
If empty — write: "No meaningful data found for this section. Please complete the Business Plan stage or edit directly."

solution:
Copy exact text from ventures.solution only — no paraphrasing, no expansion.
If ventures.solution is empty — copy ventures.description exactly.
If both empty — write: "No meaningful data found for this section. Please complete the relevant stage or edit directly."
Do NOT add any information not in the source field.

product:
Write exactly 3 sub-sections, each label on its own line:

Overview:
[Use business_plans.product_details as-is. If empty or not meaningful — use the EXACT text from ventures.solution field in the DATA section. If both empty — write: "No meaningful data found for this section. Please complete the relevant stage or edit directly."]

Current Status:
[State current phase. If mlp_data.enhancement_strategy exists and is meaningful — summarize key improvements in 2 sentences. If mlp_data.enhancement_strategy is empty or missing — do NOT invent improvements, skip this part entirely. Write: "The current version is built around [list feature names where isSelected is true from feature_matrix]." End with beta sign-up count. If product_feedback has meaningful responses (>15 chars) — add 1 sentence on what users highlighted. If not — omit.]

Technology:
[This sub-section is built by the system — leave it empty in your response. Write nothing here.]

market:
Write exactly 3 sub-sections, each label on its own line followed by a colon, then content on the next line:

Market Size & Opportunity:
[Use business_plans.market_size. One paragraph on total market size and growth. If empty — write: "No meaningful data found for this section. Please complete the Business Plan stage or edit directly."]

Target Customers:
[Use business_plans.target_customers. One paragraph on primary, secondary, and tertiary segments. If empty — write: "No meaningful data found for this section. Please complete the Business Plan stage or edit directly."]

Competitive Landscape:
[Use business_plans.competition. Name main competitors and one sentence on key differentiator. If empty — write: "No meaningful data found for this section. Please complete the Business Plan stage or edit directly."]

business_model:
Write exactly 3 sub-sections, each label on its own line:

Model:
[Use ONLY revenue_model_data fields — do NOT use business_plans.revenue_model text. Do NOT mention tier1Price. Describe: model type (businessModel) and premium price (tier2Price) only. Write as one professional paragraph. Example: "The company operates on a subscription model with a premium tier at $X/month."]

Revenue Forecast:
[Write exactly: "Based on a [businessModel] model at $[tier2Price]/month premium pricing, the company projects [year1TotalUsers] total users by end of Year 1 with revenues of [year1Revenue], growing to [year2TotalUsers] total users by end of Year 2 with cumulative revenues of [year2CumulativeRevenue]."]

Traction:
[Write 3 sentences using ONLY revenue_model_data numbers: (1) CAC vs tier2Price — payback period implication. (2) freeToPaidConversion + churnRisk — what they mean together for LTV. (3) One forward-looking scalability statement.]

traction:
Write based ONLY on actual verifiable data:
- State beta sign-up count.
- If mlp_data.wow_moments mentions specific organic behaviors (e.g. users sharing screenshots) — include it as one sentence.
- If freeToPaidConversion is available — mention it as validation of user intent.
- Do NOT use mlp_data.feedback_analysis — it may contain sample data.
- Do NOT fabricate retention rates, NPS scores, or metrics not explicitly provided.
- If there is no meaningful traction data — write: "The platform is currently in [phase] with [count] sign-ups. Traction metrics will be updated as the beta progresses."

team:
Use business_plans.entrepreneur_background with minimal grammar edits only.
If empty — write: "No meaningful data found for this section. Please complete the Business Plan stage or edit directly."

the_ask:
Write: "Based on the business model, revenue forecast, and venture budget, [venture name] is seeking to raise [askFormatted] to fund the next 24 months of operations."
Then add one sentence on how the funds will be used (if business_plans.funding_requirements mentions allocation — use it, otherwise write generally: "Funds will be allocated to product development, user acquisition, and operations.").

Return ONLY a valid JSON object — no text before or after — with exactly these keys:
executive_summary, problem, solution, product, market, business_model, team, the_ask

DATA:
${allFields}`;

      const result = await InvokeLLM({ prompt, creditType: 'mentor' });
      const rawText = result?.response || '';

      let parsed;
      try {
        // Strip markdown fences and trim
        let cleaned = rawText.replace(/```json|```/g, '').trim();
        // Remove any text before first { and after last }
        const firstBrace = cleaned.indexOf('{');
        const lastBrace = cleaned.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
          cleaned = cleaned.substring(firstBrace, lastBrace + 1);
        }
        // Fix common AI JSON issues: trailing commas
        cleaned = cleaned.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
        try { parsed = JSON.parse(cleaned); }
        catch {
          // Last resort: extract just the keys we need
          parsed = {};
          const keys = ['executive_summary','problem','solution','product','market','business_model','team','the_ask'];
          keys.forEach(k => {
            const re = new RegExp('"' + k + '"\\s*:\\s*"([\\s\\S]*?)(?<!\\\\)"');
            const m = cleaned.match(re);
            if (m) parsed[k] = m[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
          });
        }
      } catch (e) { throw new Error('AI returned invalid JSON. Please try again.'); }

      const normalized = {};
      SECTION_KEYS.forEach(k => {
        normalized[k] = normalizeSection(parsed[k]);
      });

      // Build Technology sub-section in code (not AI)
      const mvpData = venture.mvp_data || {};
      const mlpData = venture.mlp_data || {};
      const techSpecRaw = mvpData.technical_specs || null;
      const techSpec = (techSpecRaw && isMeaningfulContent(techSpecRaw)) ? techSpecRaw : null;
      const techExcRaw = mlpData.technical_excellence || null;
      const techExc = (techExcRaw && isMeaningfulContent(techExcRaw)) ? techExcRaw : null;
      const techParts2 = [techSpec, techExc].filter(Boolean);
      const techText = techParts2.length > 0
        ? techParts2.join('\n')
        : 'No meaningful data found for this section. Please complete the relevant stage or edit directly.';

      // Inject Technology — cut at Technology: label and replace everything after
      if (normalized.product) {
        const techIdx = normalized.product.indexOf('Technology:');
        if (techIdx !== -1) {
          normalized.product = normalized.product.substring(0, techIdx) + 'Technology:\n' + techText;
        } else {
          normalized.product += '\n\nTechnology:\n' + techText;
        }
      }

      // Second AI call — generate Executive Summary from the 8 sections
      try {
        const sectionsText = [
          'Problem: ' + (normalized.problem || ''),
          'Solution: ' + (normalized.solution || ''),
          'Product: ' + (normalized.product || ''),
          'Market: ' + (normalized.market || ''),
          'Business Model: ' + (normalized.business_model || ''),
          'Team: ' + (normalized.team || ''),
          'The Ask: ' + (normalized.the_ask || ''),
        ].filter(s => s.trim().length > 10).join('\n\n');

        const execPrompt = `You are writing the Executive Summary for an investor business plan.
Based ONLY on the sections below — do not invent anything not present.
Write exactly 2 paragraphs:
Paragraph 1: what the company does, who it serves, and what problem it solves.
Paragraph 2: current status (phase and sign-ups: ${sourceData?.betaTesters?.length || 0} sign-ups in ${venture.phase} phase), funding ask (${fundingAsk?.askFormatted || ''}), and 24-month revenue goal (${forecast?.year2CumulativeFormatted || ''}).
No markdown. Plain text only.

SECTIONS:
${sectionsText}`;

        const execResult = await InvokeLLM({ prompt: execPrompt, creditType: 'sys' });
        const rawExec = execResult?.response?.trim() || '';
        normalized.executive_summary = rawExec.replace(/```json|```/g, '').trim();
      } catch (e) {
        console.error('Executive summary generation failed:', e);
        normalized.executive_summary = venture.name + ' is seeking ' + (fundingAsk?.askFormatted || 'funding') + ' to fund its next 24 months of operations.';
      }

      const now = new Date().toISOString();
      const payload = {
        venture_id: venture.id,
        user_email: user.email,
        plan: userPlan,
        version: (deckRecord?.version || 0) + 1,
        deck_data: normalized,
        customization: customization,
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

  // ── Auto-save ──────────────────────────────────────────────────────────────

  function triggerAutoSave() {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      if (!deckRecord?.id) return;
      const updated = { ...deckData };
      SECTION_KEYS.forEach(k => {
        if (sectionRefs.current[k]) updated[k] = sectionRefs.current[k].innerText || '';
      });
      setDeckData(updated);
      await supabase.from('business_decks')
        .update({ deck_data: updated, updated_at: new Date().toISOString() })
        .eq('id', deckRecord.id);
    }, 3000);
  }

  // ── Mentor ─────────────────────────────────────────────────────────────────

  async function handleMentor() {
    if (!deckData || !venture) return;
    setMentorLoading(true);
    setMentorFeedback(null);
    setMentorError(null);
    try {
      const currentText = {};
      SECTION_KEYS.forEach(k => {
        currentText[k] = sectionRefs.current[k]?.innerText || deckData[k] || '';
      });
      const fullDoc = SECTION_KEYS.map(k => `${SECTION_TITLES[k]}:\n${currentText[k]}`).join('\n\n');

      const prompt = `You are an expert startup mentor reviewing a complete investor business plan.

Venture: "${venture.name}" — ${venture.description}

FULL DOCUMENT:
${fullDoc}

Instruction:
1. Start with the text "Mentor Feedback" exactly.
2. On the very next line, provide an overall 10-star rating using ★ and ☆.
3. Write section "Overall Analysis:" — 2-3 sentences on overall quality and investor-readiness.
4. Write section "Sections to Improve:" — for each section that needs work, write the section name followed by a specific note. If a section is strong, skip it.
5. Write section "Missing Information:" — list critical information an investor would expect that is not present.
6. Write section "Challenge Question:" — one sharp question the founder should be able to answer before meeting investors.
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
              Table, TableRow, TableCell, WidthType, ShadingType, PageBreak } = await import('docx');

      const fontSizeMap = { small: 20, medium: 24, large: 28 };
      const headSizeMap = { small: 28, medium: 32, large: 38 };
      const bodySize = fontSizeMap[customization.font_size] || 24;
      const headSize = headSizeMap[customization.font_size] || 32;
      const hexColor = (customization.heading_color || '#4F46E5').replace('#', '');
      const makeH1 = text => new Paragraph({
        children: [new TextRun({ text, bold: true, size: headSize, color: hexColor, font: 'Arial' })],
        spacing: { before: 400, after: 160 },
      });
      const makeH2 = text => new Paragraph({
        children: [new TextRun({ text, bold: true, size: Math.round(headSize * 0.75), color: '374151', font: 'Arial' })],
        spacing: { before: 240, after: 100 },
      });
      const makeBody = text => new Paragraph({
        children: [new TextRun({ text, size: bodySize, font: 'Arial' })],
        spacing: { after: 100 },
      });
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

      const getText = k => {
        const raw = sectionRefs.current[k]?.innerText || deckData[k] || '';
        // Strip source labels from docx output
        return raw.split('\n').filter(line => !line.trim().startsWith('Source:')).join('\n');
      };

      const children = [
        new Paragraph({
          children: [new TextRun({ text: customization.company_name || venture?.name || '', bold: true, size: 56, color: hexColor, font: 'Arial' })],
          alignment: AlignmentType.CENTER, spacing: { before: 800, after: 200 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Investor Business Plan', size: 28, color: '6B7280', font: 'Arial' })],
          alignment: AlignmentType.CENTER, spacing: { after: 120 },
        }),
        new Paragraph({
          children: [new TextRun({ text: customization.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }), size: 22, color: '9CA3AF', font: 'Arial' })],
          alignment: AlignmentType.CENTER, spacing: { after: 120 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Confidential — Not for distribution', size: 20, color: 'D1D5DB', italics: true, font: 'Arial' })],
          alignment: AlignmentType.CENTER, spacing: { after: contactInfo.enabled ? 200 : 800 },
        }),
        ...(contactInfo.enabled ? [
          new Paragraph({
            children: [
              ...(contactInfo.email ? [new TextRun({ text: contactInfo.email, size: 20, color: '6B7280', font: 'Arial' })] : []),
              ...(contactInfo.email && contactInfo.website ? [new TextRun({ text: '  |  ', size: 20, color: 'D1D5DB', font: 'Arial' })] : []),
              ...(contactInfo.website ? [new TextRun({ text: contactInfo.website, size: 20, color: '6B7280', font: 'Arial' })] : []),
            ],
            alignment: AlignmentType.RIGHT, spacing: { after: 800 },
          }),
        ] : []),
        makeDivider(),
      ];

      SECTION_KEYS.forEach((k, i) => {
        const text = getText(k);
        if (!text.trim()) return;
        children.push(makeH1(`${i + 1}. ${SECTION_TITLES[k]}`));
        const lines = text.split('\n').filter(Boolean);
        lines.forEach(line => {
          const trimmed = line.trim();
          if (/^(Overview|Current Status|Technology|Model|Revenue Forecast|Traction|Market Size & Opportunity|Target Customers|Competitive Landscape):$/.test(trimmed)) {
            children.push(makeH2(trimmed.replace(':', '')));
          } else {
            children.push(makeBody(trimmed));
          }
        });
        children.push(makeDivider());
      });

      // Appendices section header
      children.push(new Paragraph({ children: [new PageBreak()] }));
      children.push(new Paragraph({
        children: [new TextRun({ text: 'Appendices', bold: true, size: 40, color: hexColor, font: 'Arial' })],
        spacing: { before: 200, after: 400 },
      }));

      // Appendix A — Key Metrics & Forecast Highlights
      if (appendixConfig.forecast && forecast) {
        children.push(makeH1('Appendix A — Key Metrics & Forecast Highlights'));
        children.push(new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [4680, 2340, 2340],
          rows: [
            new TableRow({ children: [makeCell('Metric', true, true), makeCell('Year 1', true, true), makeCell('Year 2', true, true)] }),
            new TableRow({ children: [makeCell('Total Users'), makeCell(forecast.year1TotalFormatted), makeCell(forecast.year2TotalFormatted)] }),
            new TableRow({ children: [makeCell('Paying Users'), makeCell(forecast.year1PayingFormatted), makeCell(forecast.year2PayingFormatted)] }),
            new TableRow({ children: [makeCell('Revenue', true), makeCell(forecast.year1RevenueFormatted, true), makeCell(forecast.year2CumulativeFormatted, true)] }),
          ],
        }));
        children.push(makeDivider());
      }

      // Appendix B
      const budgetRows = buildBudgetRows(sourceData?.budgets);
      if (budgetRows.length) {
        children.push(makeH1('Appendix B — Monthly Budget Breakdown'));
        const total = budgetRows.reduce((sum, r) => sum + (r.monthly || 0), 0);
        children.push(new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [3120, 1560, 2340, 2340],
          rows: [
            new TableRow({ children: [makeCell('Item', true, true), makeCell('Type', true, true), makeCell('Monthly', true, true), makeCell('Annual', true, true)] }),
            ...budgetRows.map(r => new TableRow({ children: [makeCell(String(r.item||'')), makeCell(String(r.type||'')), makeCell('$' + Number(r.monthly||0).toLocaleString()), makeCell('$' + Number(r.annual||0).toLocaleString())] })),
            new TableRow({ children: [makeCell('Total burn', true, true), makeCell('', false, true), makeCell('$' + total.toLocaleString(), true, true), makeCell('$' + (total*12).toLocaleString(), true, true)] }),
          ],
        }));
        children.push(makeDivider());
      }

      // Appendix B
      if (appendixConfig.revenueParams) {
      const revRows = buildRevenueParamsRows(venture?.revenue_model_data);
      if (revRows.length) {
        children.push(new Paragraph({ spacing: { before: 600 }, children: [] }));
        children.push(makeH1('Appendix C — Revenue Model Assumptions'));
        children.push(new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [5460, 3900],
          rows: [
            new TableRow({ children: [makeCell('Parameter', true, true), makeCell('Value', true, true)] }),
            ...revRows.map(r => new TableRow({ children: [makeCell(r.param), makeCell(r.value)] })),
          ],
        }));
      }
      } // end appendixConfig.revenueParams

      // Appendix C — Break-even
      if (appendixConfig.breakeven && breakevenData) {
        children.push(new Paragraph({ spacing: { before: 600 }, children: [] }));
        children.push(makeH1('Appendix D — Break-even Analysis'));
        if (breakevenData.breakevenMonth) {
          children.push(makeBody(`Based on current projections, the company reaches break-even at month ${breakevenData.breakevenMonth}.`));
        } else {
          children.push(makeBody('Based on current projections, the company does not reach break-even within 24 months.'));
        }
        children.push(new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [1560, 2600, 2600, 2600],
          rows: [
            new TableRow({ children: [makeCell('Month', true, true), makeCell('Monthly Expenses', true, true), makeCell('Monthly Revenue', true, true), makeCell('Cumulative Gap', true, true)] }),
            ...breakevenData.data
              .filter((_, i) => i % 3 === 0 || breakevenData.data[i].month === breakevenData.breakevenMonth)
              .map(r => new TableRow({ children: [
                makeCell(r.month === breakevenData.breakevenMonth ? `Month ${r.month} ✓` : `Month ${r.month}`),
                makeCell(r.expensesFormatted),
                makeCell(r.revenueFormatted),
                makeCell(r.gapFormatted),
              ]})),
          ],
        }));
        children.push(makeDivider());
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

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-3">
          <h1 className="text-2xl font-bold text-gray-900 text-center flex items-center justify-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Business Deck — {venture?.name}
          </h1>
          <div className="flex items-center justify-center gap-2 flex-wrap mt-2">
            {deckRecord && (
              <span className="text-xs text-gray-400">
                Last updated: {new Date(deckRecord.updated_at || deckRecord.generated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}

            {deckData && (
              <Button variant="outline" size="sm" onClick={handleMentor} disabled={mentorLoading}
                className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 text-xs font-semibold gap-1.5">
                {mentorLoading
                  ? <><Loader2 className="animate-spin w-3 h-3" />Reviewing...</>
                  : <><MessageSquare className="w-3 h-3" />Mentor Review</>}
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

          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Page description */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
            <div className="space-y-2">
              <p className="text-sm font-semibold text-indigo-900">About the Business Deck</p>
              <p className="text-sm text-indigo-700 leading-relaxed">
                This tool assembles all the information you have entered throughout your StartZig journey into a professional investor-ready business plan.
                Available exclusively on the <strong>Pro Founder</strong> plan and above.
              </p>
              <p className="text-sm text-indigo-700 leading-relaxed">
                The business plan you see here is a starting point — not a final document. Investors may challenge your numbers, suggest a different funding amount, or push you to expand certain areas. What matters most is that you understand your own data and can explain your thinking clearly in a meeting.
              </p>
              <p className="text-sm text-indigo-600 font-medium">
                ✏️ Click on any text in the preview below to edit it directly. Use Mentor Review to get expert feedback on the full document. See details in appendix
              </p>
              <p className="text-xs text-indigo-500 mt-1">Each generation and Mentor Review costs 1 credit.
              </p>
            </div>
          </div>
        </div>

        {/* Errors */}
        {error && !['not_logged_in', 'no_venture'].includes(error) && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            {error === 'download_failed' ? 'Download failed. Please try again.'
              : error === 'no_credits' ? 'You have used all your credits this month.'
              : error}
          </div>
        )}

        {/* Conflict notes */}
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



        {/* Mentor feedback */}
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

        {/* Empty state */}
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

        {/* Generating skeleton */}
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

        {/* Document preview */}
        {deckData && !generating && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">

            {/* Document cover */}
            <div className="border-b border-slate-100 px-12 py-8 text-center bg-slate-50 rounded-t-2xl">
              <h1 className="text-4xl font-bold text-indigo-600">{venture?.name}</h1>
              <p className="text-gray-500 mt-2 text-base">Investor Business Plan</p>
              <p className="text-gray-400 text-sm mt-1">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
              <p className="text-gray-300 text-xs mt-1 italic">Confidential — Not for distribution</p>
            </div>

            {/* Document body */}
            <div className="px-12 py-8 space-y-8">

              {SECTION_KEYS.map((key, index) => {
                const text = deckData[key] || '';
                const isAISynthesized = AI_SYNTHESIZED_SECTIONS.includes(key);
                return (
                  <div key={key} className="space-y-2">
                    <div className="border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-indigo-600">
                          {index + 1}. {SECTION_TITLES[key]}
                        </h2>
                        {isAISynthesized && (
                          <span className="text-xs text-gray-400 font-normal">See details in appendix</span>
                        )}
                      </div>
                      {SECTION_SOURCES[key] && (
                        <p className="text-xs text-indigo-400 mt-0.5 italic">{SECTION_SOURCES[key]}</p>
                      )}
                    </div>

                    {/* Editable content */}
                    <div
                      ref={el => { sectionRefs.current[key] = el; }}
                      contentEditable
                      suppressContentEditableWarning
                      onInput={triggerAutoSave}
                      className="text-gray-700 text-sm leading-relaxed outline-none focus:bg-indigo-50 focus:rounded-lg focus:px-3 focus:py-2 transition-all cursor-text whitespace-pre-wrap min-h-[60px]"
                      style={{ caretColor: '#4F46E5' }}
                    >
                      {text.split('\n').map((line, i) => {
                        const trimmed = line.trim();
                        if (!trimmed) return <br key={i} />;
                        // Sub-section headers
                        if (/^(Overview|Current Status|Technology|Model|Revenue Forecast|Traction|Market Size & Opportunity|Target Customers|Competitive Landscape):$/.test(trimmed)) {
                          const subSources = {
                            'Overview:': 'Source: business_plans.product_details → ventures.solution',
                            'Current Status:': 'Source: mvp_data.feature_matrix + mlp_data.enhancement_strategy',
                            'Technology:': 'Source: mvp_data.technical_specs + mlp_data.technical_excellence',
                            'Model:': 'Source: revenue_model_data.businessModel + tier2Price',
                            'Revenue Forecast:': 'Source: Calculated from revenue_model_data',
                            'Traction:': 'Source: revenue_model_data (CAC, conversion, churn)',
                            'Market Size & Opportunity:': 'Source: business_plans.market_size',
                            'Target Customers:': 'Source: business_plans.target_customers',
                            'Competitive Landscape:': 'Source: business_plans.competition',
                          };
                          return (
                            <div key={i} className="mt-3 mb-1">
                              <span className="font-semibold text-gray-800">{trimmed}</span>
                              {subSources[trimmed] && (
                                <span className="ml-2 text-xs text-indigo-300 italic">{subSources[trimmed]}</span>
                              )}
                            </div>
                          );
                        }
                        return <div key={i}>{trimmed}</div>;
                      })}
                    </div>

                    {/* The Ask note */}
                    {key === 'the_ask' && fundingAsk && (
                      <p className="text-xs text-blue-500 italic mt-1">
                        💡 This amount was calculated based on your 24-month budget and revenue forecast. You can edit it directly.
                      </p>
                    )}
                  </div>
                );
              })}



              {/* Appendices header */}
              <div className="pt-6 border-t-2 border-slate-300 mt-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Appendices</h2>
              </div>

              {/* Appendix A — Key Metrics & Forecast */}
              {appendixConfig.forecast && forecast && (
                <div className="space-y-3 pt-8">
                  <h2 className="text-xl font-bold text-indigo-600">Appendix A — Key Metrics & Forecast Highlights</h2>
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="text-left px-4 py-2 border border-slate-200 font-semibold">Metric</th>
                        <th className="text-left px-4 py-2 border border-slate-200 font-semibold">Year 1</th>
                        <th className="text-left px-4 py-2 border border-slate-200 font-semibold">Year 2</th>
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
                const total = rows.reduce((sum, r) => sum + (r.monthly || 0), 0);
                return (
                  <div className="space-y-3 pt-8">
                    <h2 className="text-xl font-bold text-indigo-600">Appendix B — Monthly Budget Breakdown</h2>
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="text-left px-4 py-2 border border-slate-200 font-semibold">Item</th>
                          <th className="text-left px-4 py-2 border border-slate-200 font-semibold">Type</th>
                          <th className="text-left px-4 py-2 border border-slate-200 font-semibold">Monthly</th>
                          <th className="text-left px-4 py-2 border border-slate-200 font-semibold">Annual</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r, i) => (
                          <tr key={i} className={i % 2 === 0 ? '' : 'bg-slate-50'}>
                            <td className="px-4 py-2 border border-slate-200">{r.item}</td>
                            <td className="px-4 py-2 border border-slate-200">{r.type}</td>
                            <td className="px-4 py-2 border border-slate-200">${(r.monthly || 0).toLocaleString()}</td>
                            <td className="px-4 py-2 border border-slate-200">${(r.annual || 0).toLocaleString()}</td>
                          </tr>
                        ))}
                        <tr className="bg-slate-100 font-semibold">
                          <td className="px-4 py-2 border border-slate-200">Total burn</td>
                          <td className="px-4 py-2 border border-slate-200"></td>
                          <td className="px-4 py-2 border border-slate-200 text-indigo-600">${total.toLocaleString()}</td>
                          <td className="px-4 py-2 border border-slate-200 text-indigo-600">${(total * 12).toLocaleString()}</td>
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
                  <div className="space-y-3 pt-8">
                    <h2 className="text-xl font-bold text-indigo-600">Appendix C — Revenue Model Assumptions</h2>
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

              {/* Appendix C — Break-even */}
              {appendixConfig.breakeven && breakevenData && (
                <div className="space-y-3 pt-8">
                  <h2 className="text-xl font-bold text-indigo-600">Appendix D — Break-even Analysis</h2>
                  {breakevenData.breakevenMonth ? (
                    <p className="text-sm text-green-700 font-medium bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                      ✓ Based on current projections, the company reaches break-even at month {breakevenData.breakevenMonth}.
                    </p>
                  ) : (
                    <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
                      ⚠️ Based on current projections, the company does not reach break-even within 24 months.
                    </p>
                  )}
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="text-left px-4 py-2 border border-slate-200 font-semibold">Month</th>
                        <th className="text-left px-4 py-2 border border-slate-200 font-semibold">Monthly Expenses</th>
                        <th className="text-left px-4 py-2 border border-slate-200 font-semibold">Monthly Revenue</th>
                        <th className="text-left px-4 py-2 border border-slate-200 font-semibold">Cumulative Gap</th>
                      </tr>
                    </thead>
                    <tbody>
                      {breakevenData.data.filter((_, i) => i % 3 === 0 || breakevenData.data[i].month === breakevenData.breakevenMonth).map((r) => (
                        <tr key={r.month}
                          className={r.month === breakevenData.breakevenMonth ? 'bg-green-50 font-semibold' : r.month % 2 === 0 ? 'bg-slate-50' : ''}>
                          <td className="px-4 py-2 border border-slate-200">{r.month === breakevenData.breakevenMonth ? `Month ${r.month} ✓` : `Month ${r.month}`}</td>
                          <td className="px-4 py-2 border border-slate-200">{r.expensesFormatted}</td>
                          <td className="px-4 py-2 border border-slate-200">{r.revenueFormatted}</td>
                          <td className={"px-4 py-2 border border-slate-200 " + (r.gap >= 0 ? 'text-green-600' : 'text-red-500')}>{r.gapFormatted}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Bottom notes */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <p className="text-xs text-gray-400 italic">See details in appendix</p>
                {fundingAsk && (
                  <div className={"text-xs rounded-lg px-4 py-2 " + (fundingAsk.ask > 0 ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700")}>
                    {fundingAsk.ask > 0 ? (
                      <span>* The Ask amount was calculated as follows: monthly burn ({fundingAsk.monthlyBurnFormatted}) × 24 months − projected revenue = gap × 1.3 buffer = <strong>{fundingAsk.askFormatted}</strong>. You can edit this amount directly in the document.</span>
                    ) : (
                      <span>* Your revenue forecast shows projected income exceeding 24-month operating costs by <strong>{fundingAsk.surplusFormatted}</strong>. This suggests external funding may not be required. We recommend reviewing your revenue model parameters before presenting to investors.{fundingAsk.isUnrealistic && " Your revenue projections appear significantly higher than your costs."}</span>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Customization panel */}
        {deckData && !generating && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <h3 className="font-bold text-gray-800 text-base">Customize & Download</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Company name in header</label>
                <input type="text" value={customization.company_name}
                  onChange={e => setCustomization(prev => ({ ...prev, company_name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Date</label>
                <input type="text" value={customization.date}
                  onChange={e => setCustomization(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Heading color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_PALETTE.map(c => (
                    <button key={c.value} title={c.label}
                      onClick={() => setCustomization(prev => ({ ...prev, heading_color: c.value }))}
                      className={"w-8 h-8 rounded-full border-2 transition-all " + (customization.heading_color === c.value ? 'border-gray-900 scale-110' : 'border-transparent')}
                      style={{ backgroundColor: c.value }} />
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Font size</label>
                <div className="flex gap-2">
                  {['small', 'medium', 'large'].map(size => (
                    <button key={size} onClick={() => setCustomization(prev => ({ ...prev, font_size: size }))}
                      className={"px-4 py-1.5 rounded-lg text-sm font-medium border capitalize transition-all " + (customization.font_size === size ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-300')}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              {userPlan === 'unicorn' && (
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Logo URL <span className="text-xs text-amber-600 ml-1">Unicorn plan</span></label>
                  <input type="url" value={customization.logo_url}
                    onChange={e => setCustomization(prev => ({ ...prev, logo_url: e.target.value }))}
                    placeholder="https://..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              )}
            </div>
            {/* Contact details */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={contactInfo.enabled}
                  onChange={e => setContactInfo(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="w-4 h-4 text-indigo-600 rounded" />
                <p className="text-sm font-medium text-gray-700">Include contact details in download</p>
              </div>
              {contactInfo.enabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ml-6">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">Email</label>
                    <input type="email" value={contactInfo.email}
                      onChange={e => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="founder@company.com"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">Website</label>
                    <input type="url" value={contactInfo.website}
                      onChange={e => setContactInfo(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://company.com"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
              )}
            </div>

            {/* Appendix selection */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <p className="text-sm font-medium text-gray-700">Include in download:</p>
              <div className="flex flex-col gap-2">
                {[
                  { key: 'forecast', label: 'Appendix A — Key Metrics & Forecast Highlights' },
                  { key: 'budget', label: 'Appendix B — Monthly Budget Breakdown' },
                  { key: 'revenueParams', label: 'Appendix C — Revenue Model Assumptions' },
                  { key: 'breakeven', label: 'Appendix D — Break-even Analysis' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={appendixConfig[key]}
                      onChange={e => setAppendixConfig(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="w-4 h-4 text-indigo-600 rounded" />
                    <span className="text-sm text-gray-600">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleDownload} disabled={downloading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 h-11">
                {downloading
                  ? <><Loader2 className="animate-spin w-4 h-4 mr-2" />Preparing...</>
                  : <><Download className="w-4 h-4 mr-2" />Download Word (.docx)</>}
              </Button>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
