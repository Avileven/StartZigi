'use client';

// app/business-deck/page.jsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Loader2, Download, FileText, Lock, MessageSquare, ChevronDown, ChevronUp, Sparkles, RefreshCw } from 'lucide-react';

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

// ─── Build prompt data ────────────────────────────────────────────────────────

function buildAllFieldsAsText(data) {
  const { venture, businessPlan, budgets, betaTesters, productFeedback, mvpFeatureFeedback, suggestedFeatures } = data;
  const v   = venture      || {};
  const bp  = businessPlan || {};
  const mvp = v.mvp_data   || {};
  const mlp = v.mlp_data   || {};
  const pit = v.pitch_data || {};
  const rev = v.revenue_model_data || {};
  const bet = v.beta_data  || {};
  const lines = [];

  lines.push('=== STAGE 1 — IDEA ===');
  if (v.problem)  lines.push(`Problem (Idea): ${v.problem}`);
  if (v.solution) lines.push(`Solution (Idea): ${v.solution}`);

  lines.push('\n=== STAGE 2 — BUSINESS PLAN ===');
  if (bp.mission)                 lines.push(`Mission: ${bp.mission}`);
  if (bp.problem)                 lines.push(`Problem (Business Plan): ${bp.problem}`);
  if (bp.solution)                lines.push(`Solution (Business Plan): ${bp.solution}`);
  if (bp.product_details)         lines.push(`Product Details: ${bp.product_details}`);
  if (bp.market_size)             lines.push(`Market Size: ${bp.market_size}`);
  if (bp.target_customers)        lines.push(`Target Customers: ${bp.target_customers}`);
  if (bp.competition)             lines.push(`Competitive Landscape: ${bp.competition}`);
  if (bp.entrepreneur_background) lines.push(`Founder Background: ${bp.entrepreneur_background}`);
  if (bp.revenue_model)           lines.push(`Revenue Model: ${bp.revenue_model}`);
  if (bp.funding_requirements)    lines.push(`Funding Requirements: ${bp.funding_requirements}`);

  if (budgets) {
    lines.push('\n=== BUDGET ===');
    if (budgets.salaries)          lines.push(`Salaries: ${JSON.stringify(budgets.salaries)}`);
    if (budgets.marketing_costs)   lines.push(`Marketing Costs: ${JSON.stringify(budgets.marketing_costs)}`);
    if (budgets.operational_costs) lines.push(`Operational Costs: ${JSON.stringify(budgets.operational_costs)}`);
  }

  lines.push('\n=== STAGE 3 — MVP ===');
  if (mvp.product_definition) lines.push(`MVP Product Definition: ${mvp.product_definition}`);
  if (mvp.technical_specs)    lines.push(`Technical Specs: ${mvp.technical_specs}`);
  if (mvp.user_testing)       lines.push(`User Testing: ${mvp.user_testing}`);
  if (mvp.feature_matrix)     lines.push(`Feature Matrix: ${JSON.stringify(mvp.feature_matrix)}`);

  lines.push('\n=== STAGE 4 — REVENUE MODEL ===');
  if (rev.businessModel)          lines.push(`Business Model Type: ${rev.businessModel}`);
  if (rev.tier1Price)             lines.push(`Free Tier Price: ${rev.tier1Price}`);
  if (rev.tier2Price)             lines.push(`Premium Price: ${rev.tier2Price}`);
  if (rev.monthlyMarketingBudget) lines.push(`Monthly Marketing Budget: ${rev.monthlyMarketingBudget}`);
  if (rev.acquisitionCost)        lines.push(`CAC: ${rev.acquisitionCost}`);
  if (rev.initialUsers)           lines.push(`Initial Users: ${rev.initialUsers}`);
  if (rev.churnRisk)              lines.push(`Monthly Churn: ${rev.churnRisk}`);
  if (rev.freeToPaidConversion)   lines.push(`Free to Paid Conversion: ${rev.freeToPaidConversion}`);
  if (rev.targetMarketFactor)     lines.push(`Target Market Factor: ${rev.targetMarketFactor}`);

  lines.push('\n=== STAGE 5 — MLP ===');
  if (mlp.feedback_analysis)    lines.push(`MVP Feedback Analysis: ${mlp.feedback_analysis}`);
  if (mlp.enhancement_strategy) lines.push(`Enhancement Strategy: ${mlp.enhancement_strategy}`);
  if (mlp.wow_moments)          lines.push(`Wow Moments: ${mlp.wow_moments}`);
  if (mlp.user_journey)         lines.push(`User Journey: ${mlp.user_journey}`);
  if (mlp.technical_excellence) lines.push(`Technical Excellence: ${mlp.technical_excellence}`);

  lines.push('\n=== STAGE 6 — BETA ===');
  if (bet.headline)    lines.push(`Beta Headline: ${bet.headline}`);
  if (bet.description) lines.push(`Beta Description: ${bet.description}`);
  if (bet.user_acquisition_strategy) lines.push(`User Acquisition Strategy: ${bet.user_acquisition_strategy}`);

  lines.push('\n=== STAGE 7 — PRODUCT FEEDBACK ===');
  if (betaTesters?.length) lines.push(`Beta Testers: ${betaTesters.length} sign-ups`);

  if (mvpFeatureFeedback?.length) {
    const grouped = {};
    mvpFeatureFeedback.forEach(f => {
      if (!grouped[f.feature_name]) grouped[f.feature_name] = [];
      grouped[f.feature_name].push(f.rating);
    });
    lines.push('Feature Ratings:');
    Object.entries(grouped).forEach(([name, ratings]) => {
      const avg = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
      lines.push(`  ${name}: ${avg}/10 average (${ratings.length} responses)`);
    });
  }

  if (suggestedFeatures?.length) {
    lines.push('Most Requested Features:');
    suggestedFeatures.slice(0, 10).forEach(f => lines.push(`  - ${f.feature_name}`));
  }

  if (productFeedback?.length) {
    const meaningful = productFeedback.filter(f => f.feedback_text && f.feedback_text.length >= 10);
    if (meaningful.length) {
      lines.push(`Free-text Feedback (${meaningful.length} meaningful responses):`);
      meaningful.slice(0, 10).forEach(f => lines.push(`  - "${f.feedback_text}"`));
    }
  }

  lines.push('\n=== STAGE 8 — PITCH (AUTHORITATIVE) ===');
  if (pit.tagline)  lines.push(`Tagline: ${pit.tagline}`);
  if (pit.problem)  lines.push(`Problem (USE THIS VERSION — most refined): ${pit.problem}`);
  if (pit.solution) lines.push(`Solution (USE THIS VERSION — most refined): ${pit.solution}`);
  if (pit.market)   lines.push(`Market (USE THIS VERSION — most refined): ${pit.market}`);
  if (pit.team)     lines.push(`Team (USE THIS VERSION): ${pit.team}`);
  if (pit.vision)   lines.push(`Vision: ${pit.vision}`);
  if (pit.the_ask)  lines.push(`The Ask (USE THIS VERSION): ${pit.the_ask}`);

  return lines.join('\n');
}

function detectConflicts(data) {
  const v   = data.venture      || {};
  const bp  = data.businessPlan || {};
  const pit = v.pitch_data      || {};
  const rev = v.revenue_model_data || {};
  const conflicts = { problem: [], solution: [], market: [], the_ask: [] };

  if (v.problem && pit.problem && v.problem !== pit.problem)
    conflicts.problem.push({ stage: 'Idea stage', text: v.problem });
  if (bp.problem && pit.problem && bp.problem !== pit.problem)
    conflicts.problem.push({ stage: 'Business Plan stage', text: bp.problem });

  if (v.solution && pit.solution && v.solution !== pit.solution)
    conflicts.solution.push({ stage: 'Idea stage', text: v.solution });
  if (bp.solution && pit.solution && bp.solution !== pit.solution)
    conflicts.solution.push({ stage: 'Business Plan stage', text: bp.solution });

  if (bp.market_size && pit.market && bp.market_size !== pit.market)
    conflicts.market.push({ stage: 'Business Plan stage', text: bp.market_size });
  if (rev.targetMarketFactor)
    conflicts.market.push({ stage: 'Revenue Model (targetMarketFactor)', text: String(rev.targetMarketFactor) });

  if (bp.funding_requirements && pit.the_ask && bp.funding_requirements !== pit.the_ask)
    conflicts.the_ask.push({ stage: 'Business Plan stage', text: bp.funding_requirements });

  return conflicts;
}

function buildAppendix(data) {
  const mvp = data.venture?.mvp_data || {};
  const rev = data.venture?.revenue_model_data || {};
  return {
    budget: data.budgets || null,
    feature_matrix: mvp.feature_matrix || null,
    revenue_params: Object.keys(rev).length ? rev : null,
  };
}

// ─── Mentor Feedback ──────────────────────────────────────────────────────────

function MentorFeedback({ feedback }) {
  if (!feedback) return null;
  return (
    <div className="mt-4 p-6 bg-indigo-50 border border-indigo-200 rounded-xl">
      <div className="space-y-3">
        {feedback.split('\n').map((line, i) => {
          const t = line.trim();
          if (!t) return null;
          if (t.includes('★') || t.includes('☆'))
            return <div key={i} className="text-2xl tracking-widest text-blue-600 font-mono">{t}</div>;
          if (t === 'Mentor Feedback')
            return <h3 key={i} className="text-lg font-bold text-indigo-900">{t}</h3>;
          if (['Analysis:', 'Strategic Hints:', 'Challenge Question:'].some(h => t.startsWith(h)))
            return <h4 key={i} className="text-base font-bold text-indigo-800 mt-4">{t.replace(':', '')}</h4>;
          return <p key={i} className="text-gray-700 text-sm leading-relaxed">{t}</p>;
        })}
      </div>
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({ sectionKey, title, icon, text: rawText, conflicts, ventureInfo, onTextChange }) {
  const text = typeof rawText === 'string' ? rawText : rawText ? JSON.stringify(rawText) : '';
  const [mentorLoading, setMentorLoading] = useState(false);
  const [mentorFeedback, setMentorFeedback] = useState(null);
  const [mentorError, setMentorError] = useState(null);
  const [showConflicts, setShowConflicts] = useState(false);

  async function handleMentor() {
    if (!text?.trim()) return;
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
      setMentorError(err.message === 'NO_CREDITS'
        ? 'You have used all your mentor credits this month. Upgrade your plan to get more.'
        : 'Error getting mentor feedback. Please try again.');
    }
    setMentorLoading(false);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
        <h2 className="font-bold text-gray-800 flex items-center gap-2"><span>{icon}</span>{title}</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 hidden sm:block">Click Mentor for expert feedback (1 credit)</span>
          <Button variant="outline" size="sm" onClick={handleMentor} disabled={mentorLoading || !text?.trim()}
            className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 text-xs font-semibold gap-1.5">
            {mentorLoading ? <><Loader2 className="animate-spin w-3 h-3" />Reviewing...</> : <><MessageSquare className="w-3 h-3" />Mentor</>}
          </Button>
        </div>
      </div>
      <div className="px-6 py-5">
        {text ? (
          <textarea value={text} onChange={e => onTextChange(sectionKey, e.target.value)}
            className="w-full min-h-[140px] text-sm text-gray-700 leading-relaxed border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-y bg-gray-50" />
        ) : (
          <p className="text-gray-400 italic text-sm">No data found for this section. Complete the relevant stages to populate it.</p>
        )}
        {mentorError && <p className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">{mentorError}</p>}
        <MentorFeedback feedback={mentorFeedback} />
        {conflicts?.length > 0 && (
          <div className="mt-4">
            <button onClick={() => setShowConflicts(v => !v)}
              className="flex items-center gap-1.5 text-xs text-amber-600 font-medium hover:text-amber-800">
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

// ─── Appendix Card ────────────────────────────────────────────────────────────

function AppendixCard({ appendix }) {
  if (!appendix) return null;
  const { budget, feature_matrix, revenue_params } = appendix;
  const hasBudget   = budget && (budget.salaries?.length || budget.marketing_costs?.length || budget.operational_costs?.length);
  const hasFeatures = feature_matrix && (Array.isArray(feature_matrix) ? feature_matrix.length : Object.keys(feature_matrix).length);
  const hasRev      = revenue_params && Object.keys(revenue_params).length;
  if (!hasBudget && !hasFeatures && !hasRev) return null;

  const thClass = "text-left px-3 py-2 border border-slate-200 font-semibold bg-slate-50 text-xs";
  const tdClass = "px-3 py-2 border border-slate-200 text-xs";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
        <h2 className="font-bold text-gray-800">📎 Appendix</h2>
      </div>
      <div className="px-6 py-5 space-y-8">

        {hasBudget && (
          <div>
            <h3 className="font-semibold text-gray-700 mb-3 text-sm">A. Monthly Budget Breakdown</h3>
            <table className="w-full text-xs border-collapse">
              <thead><tr>
                <th className={thClass}>Item</th>
                <th className={thClass}>Type</th>
                <th className={thClass}>Monthly Cost</th>
              </tr></thead>
              <tbody>
                {(budget.salaries || []).map((s, i) => (
                  <tr key={`s${i}`}>
                    <td className={tdClass}>{s.role || s.name || JSON.stringify(s)}</td>
                    <td className={tdClass}>Salary</td>
                    <td className={tdClass}>{s.monthly_cost || s.amount || s.salary || '—'}</td>
                  </tr>
                ))}
                {(budget.marketing_costs || []).map((m, i) => (
                  <tr key={`m${i}`}>
                    <td className={tdClass}>{m.channel || m.name || JSON.stringify(m)}</td>
                    <td className={tdClass}>Marketing</td>
                    <td className={tdClass}>{m.monthly_cost || m.amount || '—'}</td>
                  </tr>
                ))}
                {(budget.operational_costs || []).map((o, i) => (
                  <tr key={`o${i}`}>
                    <td className={tdClass}>{o.item || o.name || JSON.stringify(o)}</td>
                    <td className={tdClass}>Operations</td>
                    <td className={tdClass}>{o.monthly_cost || o.amount || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {hasFeatures && (
          <div>
            <h3 className="font-semibold text-gray-700 mb-3 text-sm">B. Feature Priority Matrix</h3>
            <table className="w-full text-xs border-collapse">
              <thead><tr>
                <th className={thClass}>Feature</th>
                <th className={thClass}>User Priority</th>
                <th className={thClass}>Impl. Ease</th>
                <th className={thClass}>Score</th>
              </tr></thead>
              <tbody>
                {(Array.isArray(feature_matrix) ? feature_matrix : Object.entries(feature_matrix).map(([k, v]) => ({ name: k, ...v }))).map((f, i) => (
                  <tr key={i}>
                    <td className={tdClass}>{f.name || f.feature || JSON.stringify(f)}</td>
                    <td className={tdClass}>{f.user_priority || f.priority || '—'}</td>
                    <td className={tdClass}>{f.impl_ease || f.ease || '—'}</td>
                    <td className={tdClass}>{f.score || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {hasRev && (
          <div>
            <h3 className="font-semibold text-gray-700 mb-3 text-sm">C. Revenue Model Parameters</h3>
            <table className="w-full text-xs border-collapse">
              <thead><tr>
                <th className={thClass}>Parameter</th>
                <th className={thClass}>Value</th>
              </tr></thead>
              <tbody>
                {Object.entries(revenue_params).map(([k, v]) => (
                  <tr key={k}>
                    <td className={tdClass + ' font-medium'}>{k}</td>
                    <td className={tdClass}>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BusinessDeckPage() {
  const [loading, setLoading]         = useState(true);
  const [generating, setGenerating]   = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError]             = useState(null);

  const [user, setUser]               = useState(null);
  const [userPlan, setUserPlan]       = useState(null);
  const [isEligible, setIsEligible]   = useState(false);
  const [venture, setVenture]         = useState(null);
  const [sourceData, setSourceData]   = useState(null);
  const [deckData, setDeckData]       = useState(null);  // { executive_summary, problem, ... }
  const [conflicts, setConflicts]     = useState({});
  const [appendix, setAppendix]       = useState(null);
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
      setAppendix(buildAppendix(sd));

      // Load saved deck if exists
      const { data: existingDeck } = await supabase
        .from('business_decks')
        .select('*')
        .eq('venture_id', ventureData.id)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingDeck?.deck_data) {
        setDeckData(existingDeck.deck_data);
        setDeckRecord(existingDeck);
        if (existingDeck.customization) setCustomization(prev => ({ ...prev, ...existingDeck.customization }));
      }

    } catch (err) {
      console.error('loadPage error:', err);
      setError('load_failed');
    }
    setLoading(false);
  }

  // ── Generate (one AI call, creditType: 'sys', free) ───────────────────────

  async function handleGenerate() {
    if (!venture || !sourceData) return;
    setGenerating(true);
    setError(null);
    try {
      const allFieldsAsText = buildAllFieldsAsText(sourceData);
      const prompt = `You are an expert startup advisor writing a professional investor business plan.

Venture: "${venture.name}" — ${venture.description}
Sector: ${venture.sector} | Phase: ${venture.phase}

Below is all the data this founder collected throughout their startup journey across all stages.
Your job: synthesize this data into a professional investor business plan.
Rules:
- Use ONLY the data provided. Do not invent anything not in the data.
- For fields that appear in multiple stages (problem, solution, market, the_ask) — use the PITCH stage version marked as AUTHORITATIVE.
- Write in clear, confident English. No markdown formatting.
- The "product" section must include: overview, current status with phase and key metrics, technology stack, and what users say.
- The "business_model" section must include: revenue streams description AND a unit economics summary with all available numbers.
- The "traction" section must include: all available milestones, metrics, beta sign-ups, feedback analysis, and wow moments.
- Keep each section concise and investor-ready.

Return ONLY a valid JSON object with exactly these keys (no other text before or after):
executive_summary, problem, solution, product, market, business_model, traction, team, the_ask

DATA:
${allFieldsAsText}`;

      const result = await InvokeLLM({ prompt, creditType: 'sys' });
      const rawText = result?.response || '';

      let parsed;
      try {
        const cleaned = rawText.replace(/```json|```/g, '').trim();
        // Try direct parse first
        try {
          parsed = JSON.parse(cleaned);
        } catch {
          // Try to extract JSON object from the response
          const match = cleaned.match(/\{[\s\S]*\}/);
          if (match) {
            parsed = JSON.parse(match[0]);
          } else {
            throw new Error('no JSON found');
          }
        }
      } catch {
        throw new Error('AI returned invalid JSON. Please try again.');
      }

      // Ensure all keys exist
      SECTION_META.forEach(({ key }) => { if (!parsed[key]) parsed[key] = ''; });

      const now = new Date().toISOString();
      const newVersion = (deckRecord?.version || 0) + 1;
      const payload = {
        venture_id: venture.id,
        user_email: user.email,
        plan: userPlan,
        version: newVersion,
        deck_data: parsed,
        customization,
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

      setDeckData(parsed);
      if (saved) setDeckRecord(saved);

    } catch (err) {
      console.error('Generate error:', err);
      setError(err.message === 'NO_CREDITS' ? 'no_credits' : err.message || 'generation_failed');
    }
    setGenerating(false);
  }

  function handleTextChange(sectionKey, newText) {
    setDeckData(prev => ({ ...prev, [sectionKey]: newText }));
  }

  async function handleSave() {
    if (!deckData || !venture || !user) return;
    const now = new Date().toISOString();
    const payload = { deck_data: deckData, customization, updated_at: now };
    if (deckRecord?.id) {
      const { data } = await supabase.from('business_decks').update(payload).eq('id', deckRecord.id).select().single();
      if (data) setDeckRecord(data);
    }
  }

  function updateCustomization(field, value) {
    const updated = { ...customization, [field]: value };
    setCustomization(updated);
    if (deckRecord?.id) {
      supabase.from('business_decks').update({ customization: updated, updated_at: new Date().toISOString() }).eq('id', deckRecord.id);
    }
  }

  // ── Download .docx ─────────────────────────────────────────────────────────

  async function handleDownload() {
    if (!deckData) return;
    setDownloading(true);
    try {
      const { Document, Packer, Paragraph, TextRun, BorderStyle, AlignmentType, Table, TableRow, TableCell, WidthType, ShadingType } = await import('docx');

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
        new Paragraph({ children: [new TextRun({ text: line, size: bodySize, font: 'Arial' })], spacing: { after: 100 } })
      );
      const makeDivider = () => new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' } },
        spacing: { before: 160, after: 160 }, children: [],
      });

      const children = [
        new Paragraph({
          children: [new TextRun({ text: customization.company_name || venture?.name || '', bold: true, size: 56, color: hexColor, font: 'Arial' })],
          alignment: AlignmentType.CENTER, spacing: { before: 800, after: 200 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Investor Business Plan', size: 32, color: '666666', font: 'Arial' })],
          alignment: AlignmentType.CENTER, spacing: { after: 160 },
        }),
        new Paragraph({
          children: [new TextRun({ text: customization.date || '', size: 24, color: '888888', font: 'Arial' })],
          alignment: AlignmentType.CENTER, spacing: { after: 160 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Confidential — Not for distribution', size: 20, color: 'AAAAAA', italics: true, font: 'Arial' })],
          alignment: AlignmentType.CENTER, spacing: { after: 800 },
        }),
        makeDivider(),
      ];

      // 9 sections — no conflict notes
      SECTION_META.forEach(({ key, title }) => {
        const text = deckData[key] || '';
        if (!text.trim()) return;
        children.push(makeHeading(title));
        children.push(...makeBody(text));
        children.push(makeDivider());
      });

      // Appendix
      if (appendix) {
        children.push(makeHeading('Appendix'));

        // A. Budget
        if (appendix.budget) {
          children.push(new Paragraph({ children: [new TextRun({ text: 'A. Monthly Budget Breakdown', bold: true, size: bodySize, font: 'Arial' })], spacing: { before: 200, after: 120 } }));
          const allRows = [
            ...(appendix.budget.salaries || []).map(s => [s.role || s.name || '', 'Salary', String(s.monthly_cost || s.amount || s.salary || '')]),
            ...(appendix.budget.marketing_costs || []).map(m => [m.channel || m.name || '', 'Marketing', String(m.monthly_cost || m.amount || '')]),
            ...(appendix.budget.operational_costs || []).map(o => [o.item || o.name || '', 'Operations', String(o.monthly_cost || o.amount || '')]),
          ];
          if (allRows.length) {
            const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
            const borders = { top: border, bottom: border, left: border, right: border };
            const makeCell = (text, bold = false) => new TableCell({
              borders, width: { size: 3120, type: WidthType.DXA },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [new Paragraph({ children: [new TextRun({ text, size: 20, font: 'Arial', bold })] })],
            });
            children.push(new Table({
              width: { size: 9360, type: WidthType.DXA },
              columnWidths: [3120, 3120, 3120],
              rows: [
                new TableRow({ children: [makeCell('Item', true), makeCell('Type', true), makeCell('Monthly Cost', true)] }),
                ...allRows.map(r => new TableRow({ children: r.map(c => makeCell(c)) })),
              ],
            }));
          }
        }

        // C. Revenue Model
        if (appendix.revenue_params) {
          children.push(new Paragraph({ children: [new TextRun({ text: 'C. Revenue Model Parameters', bold: true, size: bodySize, font: 'Arial' })], spacing: { before: 200, after: 120 } }));
          Object.entries(appendix.revenue_params).forEach(([k, v]) => {
            children.push(new Paragraph({ children: [new TextRun({ text: `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`, size: 20, font: 'Arial' })], spacing: { after: 80 } }));
          });
        }
      }

      const doc = new Document({
        styles: { default: { document: { run: { font: 'Arial', size: bodySize } } } },
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
        <p className="text-gray-500 leading-relaxed">The Business Deck Builder is available on the <strong>Pro Founder</strong> plan and above.</p>
        <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2">
          <p className="text-sm font-semibold text-gray-700">Included with Pro Founder:</p>
          <p className="text-sm text-gray-600">✓ AI-generated investor-ready business plan from your data</p>
          <p className="text-sm text-gray-600">✓ Editable sections with Mentor feedback per section</p>
          <p className="text-sm text-gray-600">✓ Conflict detection across stages</p>
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

  const filledCount = deckData ? SECTION_META.filter(s => typeof deckData[s.key] === 'string' && deckData[s.key].trim()).length : 0;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-indigo-600" />Business Deck
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {venture?.name} · <span className="capitalize">{venture?.phase}</span>
              {deckData && <span className="ml-2 text-indigo-600 font-medium">{filledCount} of {SECTION_META.length} sections</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {deckRecord && (
              <span className="text-xs text-gray-400 hidden sm:block">
                Last generated: {new Date(deckRecord.generated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
            {deckData && (
              <Button variant="outline" size="sm" onClick={handleSave} className="text-gray-600 border-gray-300 text-xs">Save</Button>
            )}
            <Button onClick={handleGenerate} disabled={generating}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 h-10 gap-2">
              {generating
                ? <><Loader2 className="animate-spin w-4 h-4" />Generating...</>
                : deckData
                  ? <><RefreshCw className="w-4 h-4" />Regenerate</>
                  : <><Sparkles className="w-4 h-4" />Generate Business Plan</>}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* How it works */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
          <h2 className="font-bold text-indigo-900 text-base mb-4">How the Business Deck works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { n: '1️⃣', title: 'Generate your plan', desc: 'Click "Generate Business Plan". StartZig sends all your data to AI, which synthesizes it into 9 professional sections. Free on first generation.' },
              { n: '2️⃣', title: 'Edit and improve', desc: 'Each section is fully editable. Use the Mentor button for expert feedback, a score, and strategic hints. Edit, then ask the Mentor again.' },
              { n: '3️⃣', title: 'Download for investors', desc: 'Customize the look and download a professional Word document with appendices, ready to share with investors.' },
            ].map(({ n, title, desc }) => (
              <div key={n} className="bg-white rounded-xl p-4 border border-indigo-100">
                <div className="text-2xl mb-2">{n}</div>
                <p className="text-sm font-semibold text-gray-800 mb-1">{title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-indigo-400 mt-4">
            ⚠️ Sections with earlier versions show conflicts between stages — visible on screen only, not included in your download.
          </p>
        </div>

        {/* Errors */}
        {error && !['not_logged_in', 'no_venture'].includes(error) && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            {error === 'download_failed' ? 'Download failed. Please try again.'
              : error === 'no_credits' ? 'You have used all your credits this month.'
              : error}
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
              StartZig will synthesize all your work across all stages into a 9-section investor-ready business plan. Free on first generation.
            </p>
            <Button onClick={handleGenerate} disabled={generating}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 h-12 text-base gap-2">
              <Sparkles className="w-5 h-5" />Generate Business Plan
            </Button>
          </div>
        )}

        {/* Generating skeleton */}
        {generating && (
          <div className="space-y-4">
            {SECTION_META.map(s => (
              <div key={s.key} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/4 mb-4" />
                <div className="space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-5/6" />
                  <div className="h-3 bg-slate-100 rounded w-4/6" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 9 Section cards */}
        {deckData && !generating && SECTION_META.map(({ key, title, icon }) => (
          <SectionCard
            key={key}
            sectionKey={key}
            title={title}
            icon={icon}
            text={deckData[key] || ''}
            conflicts={conflicts[key] || []}
            ventureInfo={{ name: venture?.name, description: venture?.description }}
            onTextChange={handleTextChange}
          />
        ))}

        {/* Appendix */}
        {deckData && !generating && <AppendixCard appendix={appendix} />}

        {/* Customization + Download */}
        {deckData && !generating && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <h3 className="font-bold text-gray-800 text-base">Customize & Download</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Company name in header</label>
                <input type="text" value={customization.company_name}
                  onChange={e => updateCustomization('company_name', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Date</label>
                <input type="text" value={customization.date}
                  onChange={e => updateCustomization('date', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Heading color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_PALETTE.map(c => (
                    <button key={c.value} title={c.label} onClick={() => updateCustomization('heading_color', c.value)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${customization.heading_color === c.value ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c.value }} />
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Font size</label>
                <div className="flex gap-2">
                  {['small', 'medium', 'large'].map(size => (
                    <button key={size} onClick={() => updateCustomization('font_size', size)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium border capitalize transition-all ${customization.font_size === size ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-300'}`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              {userPlan === 'unicorn' && (
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Logo URL <span className="text-xs text-amber-600 ml-1">Unicorn plan</span></label>
                  <input type="url" value={customization.logo_url}
                    onChange={e => updateCustomization('logo_url', e.target.value)}
                    placeholder="https://..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleDownload} disabled={downloading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 h-11">
                {downloading ? <><Loader2 className="animate-spin w-4 h-4 mr-2" />Preparing...</> : <><Download className="w-4 h-4 mr-2" />Download Word (.docx)</>}
              </Button>
              <Button disabled variant="outline" className="text-gray-400 border-gray-200 cursor-not-allowed h-11 px-6">
                <Download className="w-4 h-4 mr-2" />Download PDF
                <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Soon</span>
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
