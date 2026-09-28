// 130426
// [140426] CHANGES:
//   - Export CSV button: now always visible, disabled with tooltip for non-Unicorn users
//   - Added comments throughout Unicorn-only section for clarity
// [020826] CHANGES:
//   - Reorganized into phase-based sections (MVP / MLP / Beta), each shown only if
//     the founder has actually reached that phase — no empty placeholders.
//   - Suggested Features: removed raw email display (privacy fix) — now shows a
//     clickable founder-name button instead, matching MLP/Beta.
//   - Added a shared "founder profile preview" panel: clicking any founder-name
//     button (MVP responses, Suggested Features, MLP feedback, Beta sign-ups)
//     opens an inline panel with what we can show today (username, early adopter).
//     NOTE: richer profile data (Zig Age, Ideas Started, reputation tags) will
//     populate here once Part A's reputation groups actually exist in the DB —
//     this is a first version, not the final Zig Profile page.
"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Venture } from '@/api/entities.js';
import { MVPFeatureFeedback } from '@/api/entities.js';
import { SuggestedFeature } from '@/api/entities.js';
import { BetaTester } from '@/api/entities.js';
import { ProductFeedback as ProductFeedbackEntity } from '@/api/entities.js';
import { User } from '@/api/entities.js';
import { businessPlan } from '@/api/entities.js';
import { InvokeLLM } from '@/api/integrations';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Loader2, BarChart3, MessageSquare, TrendingUp, Lightbulb, Users, Star, MessageCircle, UserCircle2, ChevronDown, Rocket, Clock, AlertTriangle, DollarSign, Layers, Megaphone, FileText, Compass, HelpCircle, ClipboardList, Home, Target, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// [ADDED 020826] Small pill button showing a founder's name with a profile icon.
// Clicking it opens the shared profile preview panel via onSelect(founderId, name).
// [ADDED 020826] Resolves a display name for the hover card trigger:
// prefer the real username; if it's not set, derive a friendly name from
// the local part of their email (e.g. "avi@leventhal.co.il" -> "Avi") —
// deliberately NOT the raw email address, to keep the earlier privacy fix
// intact while still showing *something* instead of nothing.
function getDisplayName(profile, emailFallback) {
  if (profile?.username) return profile.username;
  if (emailFallback) {
    const local = emailFallback.split('@')[0];
    if (local) return local.charAt(0).toUpperCase() + local.slice(1);
  }
  return null;
}

// [ADDED 020826] Maps the venture's raw phase to the Group 1 tag names
// decided in the planning doc (Part A.2): Spark/Plan/Demo/Beta. Demo covers
// both mvp and mlp (the demo keeps evolving through MLP); growth falls back
// to Beta since Group 1 has no tag of its own for it.
function getJourneyTag(rawPhase) {
  // [FIX] Same fix as dashboard-page.jsx — was mapping growth -> 'Beta'.
  const map = {
    idea: 'Spark',
    business_plan: 'Plan',
    mvp: 'Shape',
    mlp: 'Shape',
    beta: 'Beta',
    growth: 'Growth',
  };
  return map[rawPhase] || null;
}

// [ADDED 020826] "Zig Age" (Part A.4) — a plain relative duration like
// Reddit Age, not a named tier.
function getZigAge(joinedDate) {
  if (!joinedDate) return null;
  const days = Math.floor((Date.now() - new Date(joinedDate).getTime()) / 86400000);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'}`;
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} month${months === 1 ? '' : 's'}`;
  }
  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? '' : 's'}`;
}

// [FIX 020826] Part A.3.1 — the raw feedback-given count is never shown to
// other founders, only a translated public status label. (The founder's own
// "Zig Profile" self-view, per A.6.2, is a separate place that CAN show the
// raw number — not built yet, out of scope for this hover card.)
function getInsightStatus(count) {
  if (count >= 50) return 'Insight Master';
  if (count >= 20) return 'Insight Champion';
  if (count >= 5) return 'Insight Builder';
  if (count >= 1) return 'Insight Starter';
  return 'Insight Seeker';
}

// [FIX 020826] Replaces the old click-to-open FounderNameButton +
// ProfilePreviewPanel + openProfileId state machinery entirely. This is now
// a single self-contained component: the name pill IS the hover trigger, and
// the card is positioned relative to it via CSS (group-hover), so it always
// appears right next to whichever row you're actually looking at — no more
// jumping to a fixed spot on the page (A.6.1).
// [ADDED 020826] Ring-badge color mapping, matching StageUnlockAnimation.jsx's
// ramp (muted for early stages, richer for later ones) — reused here so the
// profile display and the unlock animation feel like the same system.
const STAGE_RING_COLORS = {
  Spark: { stroke: '#CEE8DE', text: '#0F6E56' },
  Plan: { stroke: '#9FE1CB', text: '#0F6E56' },
  Shape: { stroke: '#5DCAA5', text: '#0F6E56' },
  Beta: { stroke: '#1D9E75', text: '#04342C' },
  // [FIX] Was missing entirely — same bug as my-account.jsx, found by
  // searching every file with this same ring-color pattern instead of
  // fixing reactively one at a time.
  Growth: { stroke: '#0C5132', text: '#04342C' },
};
// Insight status uses its own (amber) ramp — deliberately different from
// Stage's (green/teal) so the two badges are never confused for the same
// kind of progress at a glance.
const INSIGHT_RING_COLORS = {
  'Insight Seeker': { stroke: '#FAEEDA', text: '#633806' },
  'Insight Starter': { stroke: '#FAC775', text: '#633806' },
  'Insight Builder': { stroke: '#EF9F27', text: '#412402' },
  'Insight Champion': { stroke: '#BA7517', text: '#FAEEDA' },
  'Insight Master': { stroke: '#412402', text: '#FAEEDA' },
};
// Zig Age is a fact, not an achievement — fixed neutral color for everyone,
// not a progress shade (deciding otherwise would wrongly imply "older = better").
const ZIG_AGE_RING_COLOR = { stroke: '#378ADD', text: '#185FA5' };

// [ADDED 020826] Small reusable ring badge — SVG circle stroke filled to
// 100% (this is a static display, not the animated reveal used in
// StageUnlockAnimation.jsx), with a label below.
function RingBadge({ value, label, stroke, text, small }) {
  const size = small ? 56 : 64;
  const r = small ? 24 : 28;
  const c = 2 * Math.PI * r;
  // [FIX — confirmed real bug via screenshot] Values like "25 days" or
  // "3 month" (7 chars) were staying at fontSize 12 because the old
  // threshold only dropped to 9 above 8 characters — at 12px, a 7-character
  // two-word value doesn't actually fit inside a 56px circle on one line.
  // Now: any value with a space splits onto two stacked lines (number on
  // top, unit below), which fits far better than shrinking font size ever
  // could. Single-word values keep the old shrink-if-long behavior.
  const parts = value.includes(' ') ? value.split(' ') : null;
  // [FIX] Threshold lowered from >8 to >5 — "Growth" (6 chars) didn't fit
  // at the larger size, same issue confirmed via screenshot in my-account.jsx.
  const fontSize = value.length > 5 ? 9 : 12;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="absolute top-0 left-0 -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1EFE8" strokeWidth="5" />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={stroke} strokeWidth="5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset="0" />
        </svg>
        {parts ? (
          <span className="font-medium text-center leading-tight flex flex-col" style={{ color: text, fontSize: small ? 10 : 12 }}>
            <span>{parts[0]}</span>
            <span style={{ fontSize: small ? 8 : 10 }}>{parts.slice(1).join(' ')}</span>
          </span>
        ) : (
          <span className="font-medium text-center leading-tight" style={{ color: text, fontSize }}>
            {value}
          </span>
        )}
      </div>
      <span className="text-[11px] text-gray-400">{label}</span>
    </div>
  );
}

// [GROWTH — visual stats] Replaces plain "5.5/10" text with a filled
// progress ring, per explicit request ("don't show statistics as a boring
// number, put it in a circle/gauge"). Distinct from RingBadge above (which
// is a fixed-style profile badge, not a proportional gauge) — this one's
// fill percentage actually represents the rating value out of 10.
function CircularGauge({ value, label, color = '#059669', showLabel = true }) {
  const size = 60;
  const r = 24;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, Number(value) / 10));
  const offset = c * (1 - pct);
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="absolute top-0 left-0 -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1EFE8" strokeWidth="6" />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="6"
            strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.4s ease' }}
          />
        </svg>
        <span className="font-bold text-gray-900" style={{ fontSize: 15 }}>{value}</span>
      </div>
      {showLabel && <span className="text-xs text-gray-500 text-center">{label}</span>}
    </div>
  );
}

// [GROWTH — approved design, replaces the shared-background ring layout]
// Each category gets its own card (own background + colored top border)
// with a red→yellow→green scale and a marker at the current value, instead
// of a plain progress ring. Approved via a design-artifact mockup before
// implementation.
// [FIX — Growth AI visual layer] Optional `signal` (Strong/Mixed/Weak,
// code-computed) — only present once an AI analysis has been run and
// saved. Without it the card looks exactly as it did before (plain accent
// color). The per-card trend arrow was tried and dropped (confusing,
// unclear what it meant) — trend now lives in one place: the "Overall
// Product Satisfaction" chart below the cards, computed straight from the
// data with no AI involved.
function GrowthScaleCard({ title, count, value, accent, bg, signal }) {
  if (value == null) return null;
  const pct = Math.max(0, Math.min(100, Number(value) * 10));
  const signalColors = { Elite: '#7C3AED', Strong: '#16a34a', Mixed: '#d97706', Weak: '#dc2626', Poor: '#991b1b' };
  // [FIX — per explicit feedback] Was just a 5px top accent — now a full
  // border in the signal color, so the card's satisfaction level reads at
  // a glance, not just as a thin strip along the top edge.
  const frameColor = signal ? signalColors[signal] : accent;
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3.5" style={{ background: bg, border: `2px solid ${frameColor}` }}>
      {/* [FIX — per explicit feedback] A long title ("Product Definition")
          wrapped to 2 lines while its neighbors stayed on 1, so that one
          card grew taller and everything below it (down to the meter bar)
          drifted out of alignment with the row. The title area now always
          reserves 2 lines of height, wrap or not, so every card in the row
          lines up the same regardless of its title length. */}
      <div className="flex justify-between items-start gap-2" style={{ minHeight: '2.3rem' }}>
        <span className="text-sm font-bold text-gray-700 leading-tight">{title}</span>
        {/* [FIX — per explicit feedback] "23 resp." was long enough to run
            past the card's right edge on mobile. Shortened to a number +
            asterisk, explained once in a footnote below all 4 cards. */}
        <span className="text-xs text-gray-400 flex-shrink-0">{count}*</span>
      </div>
      {/* [FIX — real mobile bug] On a narrow 2-column card, value + "/10" +
          the signal badge on one "ml-auto" row had nowhere to shrink to —
          the badge ran past the card's edge. The badge now sits on its own
          line, so the row above never has to fit more than the number. */}
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span className="text-3xl font-extrabold text-gray-900">{value}</span>
        <span className="text-sm text-gray-400">/ 10</span>
      </div>
      {signal && (
        <span
          className="self-start text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded -mt-2"
          style={{ color: signalColors[signal], background: 'rgba(255,255,255,0.6)' }}
        >
          {signal}
        </span>
      )}
      <div className="relative w-full rounded-full" style={{ height: 12, background: 'linear-gradient(to right, #ef4444, #f59e0b, #22c55e)' }}>
        <div
          className="absolute rounded-full bg-white"
          style={{ top: '50%', left: `${pct}%`, transform: 'translate(-50%, -50%)', width: 20, height: 20, border: `4px solid ${accent}`, boxShadow: '0 2px 6px rgba(0,0,0,0.25)' }}
        />
      </div>
    </div>
  );
}

function FounderHoverCard({ founderId, name, profile }) {
  if (!founderId || !name) {
    // No attribution available (e.g. legacy feedback given before the
    // attribution fix, or anonymous visitor) — nothing clickable to show.
    return null;
  }
  // [FIX — real mobile bug found this session] Was pure CSS `group-hover`,
  // which never triggers on touch devices at all — this popup was
  // completely inaccessible on mobile, with no way to see it. Added a
  // click/tap toggle that works everywhere; hover still also works on
  // desktop as a bonus, not a replacement.
  const [isOpen, setIsOpen] = useState(false);
  const initial = name[0].toUpperCase();
  const journeyTag = getJourneyTag(profile?.current_phase);
  const zigAge = getZigAge(profile?.joined_date);
  const insightStatus = getInsightStatus(profile?.feedback_count ?? 0);
  // [NEW — Followers project] Following count — fetched locally (not part
  // of the get_public_founder_profile RPC payload), only once when the
  // card is actually opened, to avoid firing a query per hover-card render.
  const [followingCount, setFollowingCount] = useState(null);
  useEffect(() => {
    if (!isOpen || followingCount !== null) return;
    (async () => {
      const { count } = await supabase
        .from('venture_followers')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', founderId);
      setFollowingCount(count || 0);
    })();
  }, [isOpen, founderId, followingCount]);

  return (
    <span className="relative inline-block group">
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 border border-gray-200 bg-white rounded-full pl-1.5 pr-2.5 py-1 text-xs text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
      >
        <UserCircle2 className="w-4 h-4" />
        {name}
      </button>

      {/* Hover card — shown on desktop hover (group-hover) OR mobile tap (isOpen) */}
      <div className={`${isOpen ? 'block' : 'hidden'} group-hover:block absolute z-50 top-full left-0 mt-2 w-80`}>
        <Card className="border-2 border-indigo-200 shadow-xl bg-white">
          <CardContent className="p-4 bg-white rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-700 flex-shrink-0">
                {initial}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{profile?.username || name}</p>
                <p className="text-[11px] text-gray-400">Zig profile preview</p>
              </div>
            </div>
            {profile?.early_adopter && (
              <Badge className="bg-amber-100 text-amber-800 mt-2 flex items-center gap-1 w-fit">
                <Star className="w-3 h-3" />
                Early Adopter
              </Badge>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-gray-100">
              <RingBadge
                value={journeyTag || '—'}
                label="Stage"
                stroke={STAGE_RING_COLORS[journeyTag]?.stroke || '#F1EFE8'}
                text={STAGE_RING_COLORS[journeyTag]?.text || '#888780'}
                small
              />
              <RingBadge
                value={insightStatus ? insightStatus.replace('Insight ', '') : '—'}
                label="Status"
                stroke={INSIGHT_RING_COLORS[insightStatus]?.stroke || '#F1EFE8'}
                text={INSIGHT_RING_COLORS[insightStatus]?.text || '#888780'}
                small
              />
              <RingBadge
                value={zigAge || '—'}
                label="Zig age"
                stroke={ZIG_AGE_RING_COLOR.stroke}
                text={ZIG_AGE_RING_COLOR.text}
                small
              />
              {/* [ADDED 020826] Ideas Started — now sourced from the real
                  ideas_started_count column (Part B) instead of counting
                  live ventures, so it correctly persists across resets.
                  Fixed neutral color, like Zig Age — it's a fact, not an
                  achievement to shade by progress. */}
              <RingBadge
                value={profile?.ideas_count != null ? String(profile.ideas_count) : '—'}
                label="Ideas"
                stroke={ZIG_AGE_RING_COLOR.stroke}
                text={ZIG_AGE_RING_COLOR.text}
                small
              />
            </div>
            {/* [NEW — Followers project] Following count. */}
            <p className="text-[11px] text-gray-400 pt-2 text-center">
              Following {followingCount ?? '—'} {followingCount === 1 ? 'venture' : 'ventures'}
            </p>
          </CardContent>
        </Card>
      </div>
    </span>
  );
}

export default function ProductFeedbackPage() {
  const [venture, setVenture] = useState(null);
  const [featureFeedback, setFeatureFeedback] = useState([]);
  const [suggestedFeatures, setSuggestedFeatures] = useState([]);
  const [betaTesters, setBetaTesters] = useState([]);
  // [ADDED 020826] Followers — people who opted in on the MLP feedback form
  // to be invited when Beta opens (Part: "רשום ביטה.docx"). Separate table
  // from beta_testers (that's actual Beta sign-up, this is earlier-stage
  // interest).
  const [followers, setFollowers] = useState([]);
  const [userPlan, setUserPlan] = useState(null);
  const [productFeedbacks, setProductFeedbacks] = useState([]);
  // [GROWTH] New — mirrors productFeedbacks exactly. Was entirely missing
  // before this session: Growth feedback was being collected successfully
  // (confirmed — a founder submitted it and got Insight Credits) but never
  // displayed anywhere on this page, because this table was never queried.
  const [growthFeedbacks, setGrowthFeedbacks] = useState([]);
  // [FIX — campaign grouping] { [campaign_id]: { id, tagline, created_date } }
  const [campaignsById, setCampaignsById] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState({});
  // [ADDED 020826] Part G.6 — the product-level question's aggregated
  // results (average score + any open-text follow-ups).
  const [productLevelFeedback, setProductLevelFeedback] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  // [NEW — Growth AI] Separate from the MVP/MLP AI state above — its own
  // pipeline, its own storage (growth_brief_analysis).
  const [isAnalyzingGrowth, setIsAnalyzingGrowth] = useState(false);
  const [growthAiAnalysis, setGrowthAiAnalysis] = useState(null);
  const [growthAnalysisMeta, setGrowthAnalysisMeta] = useState(null);
  const [growthChangesText, setGrowthChangesText] = useState('');
  const [showGrowthChangesPrompt, setShowGrowthChangesPrompt] = useState(false);
  const [growthAnalysisError, setGrowthAnalysisError] = useState(null);
  // [NEW — Growth AI visual layer] Whether the full analysis (themes,
  // action plan, per-dimension patterns/evidence) is expanded. Collapsed
  // by default — only the executive summary shows until clicked.
  const [showGrowthAnalysisDetails, setShowGrowthAnalysisDetails] = useState(false);
  // [NEW — per explicit request] The per-brief pill list was always shown
  // in full under "All Briefs" — collapsed by default now, toggled by a
  // small button next to the "All Briefs" pill.
  const [showGrowthBriefList, setShowGrowthBriefList] = useState(false);
  // [NEW — per explicit request] Page reorganized into two zones: raw
  // feedback data (collapsed behind one master toggle) and a separate AI
  // zone (whose Recommended Actions is its own collapsed tab).
  const [showGrowthFeedbackDetails, setShowGrowthFeedbackDetails] = useState(false);
  const [showGrowthRecommendedActions, setShowGrowthRecommendedActions] = useState(false);
  // [NEW — Growth AI visual layer] A second, deeper level of disclosure —
  // the raw supporting evidence (themes + full per-dimension analysis) is
  // one more click past the recommended changes, per explicit feedback
  // that showing everything at once was too much data to act on.
  const [showGrowthEvidence, setShowGrowthEvidence] = useState(false);
  const [businessPlanData, setBusinessPlanData] = useState(null);

  // [ADDED 020826] username lookup cache + currently-open profile preview
  const [founderProfiles, setFounderProfiles] = useState({}); // { [founderId]: { username, early_adopter } }
  // [FIX 020826] openProfileId/openProfile removed — the hover card
  // (FounderHoverCard) no longer needs click-based open/close state.

  // [ADDED 020826] expand/collapse state for the detail lists under each summary
  const [expanded, setExpanded] = useState({ mvpDetail: false, sf: false, mlp: false, beta: false, growth: false });
  const toggle = (key) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  // [GROWTH — qualitative Q&A block] Separate expand state, one entry per
  // open-text question, keyed by the field name on growth_feedback. Lets
  // each question expand independently instead of one all-or-nothing toggle.
  const [expandedGrowthQ, setExpandedGrowthQ] = useState({});
  const toggleGrowthQ = (key) => setExpandedGrowthQ((prev) => ({ ...prev, [key]: !prev[key] }));
  // [NEW — testimonials] Toggling is a write action (unlike everything else
  // on this page, which is read-only) — updates growth_feedback directly,
  // then reflects the change locally so the button updates immediately
  // without a full data reload.
  const toggleTestimonialFeatured = async (feedbackId, currentValue) => {
    const { error } = await supabase
      .from('growth_feedback')
      .update({ is_featured_testimonial: !currentValue })
      .eq('id', feedbackId);
    if (error) {
      console.error('Could not update testimonial:', error);
      return;
    }
    setGrowthFeedbacks((prev) => prev.map((fb) => fb.id === feedbackId ? { ...fb, is_featured_testimonial: !currentValue } : fb));
  };
  // [FIX — campaign-first view] null = "not explicitly chosen yet", which
  // means "use the latest campaign" (computed at render time below, not
  // stored here — avoids a load-order race with campaignsById/growthFeedbacks).
  // '__all__' is the explicit "View all campaigns" (cumulative) choice.
  const [growthSelectedCampaign, setGrowthSelectedCampaign] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await User.me();
        console.log('[FeedbackHub] user:', user?.email);

        // Fetch user plan for Export button visibility
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('plan')
          .eq('id', user.id)
          .single();
        if (profile) setUserPlan(profile.plan);

        const ventures = await Venture.filter({ created_by: user.email }, "-created_date");
        console.log('[FeedbackHub] ventures found:', ventures.length);

        if (ventures.length > 0) {
          const currentVenture = ventures[0];
          console.log('[FeedbackHub] venture id:', currentVenture.id, 'name:', currentVenture.name);
          setVenture(currentVenture);

          const feedback = await MVPFeatureFeedback.filter({ venture_id: currentVenture.id });
          console.log('[FeedbackHub] MVP feature feedback:', feedback.length);
          setFeatureFeedback(feedback);

          const suggestions = await SuggestedFeature.filter({ venture_id: currentVenture.id });
          setSuggestedFeatures(suggestions);

          const testers = await BetaTester.filter({ venture_id: currentVenture.id });
          setBetaTesters(testers);

          // [ADDED 020826] Followers — no entity wrapper exists for this new
          // table, queried directly.
          const { data: followerRows } = await supabase
            .from('venture_followers')
            .select('id, user_id, created_date')
            .eq('venture_id', currentVenture.id)
            .order('created_date', { ascending: false });
          setFollowers(followerRows || []);

          const pfeedback = await ProductFeedbackEntity.filter({ venture_id: currentVenture.id }, '-created_date');
          console.log('[FeedbackHub] MLP product feedbacks:', pfeedback.length);
          setProductFeedbacks(pfeedback);

          // [GROWTH] No entity wrapper exists for this new table (same
          // situation as venture_followers above), queried directly.
          const { data: growthRows } = await supabase
            .from('growth_feedback')
            .select('*')
            .eq('venture_id', currentVenture.id)
            .order('created_date', { ascending: false });
          console.log('[FeedbackHub] Growth feedbacks:', (growthRows || []).length);
          setGrowthFeedbacks(growthRows || []);

          const bp = await businessPlan.filter({ venture_id: currentVenture.id });
          if (bp.length > 0) setBusinessPlanData(bp[0]);

          // [FIX — campaign grouping] Loads every campaign this venture has
          // run, so feedback lists below can be grouped by "campaign name +
          // start date" instead of shown as one flat list. No entity
          // wrapper needed — same direct-supabase pattern already used for
          // venture_followers/growth_feedback above.
          const { data: campaignRows } = await supabase
            .from('promotion_campaigns')
            .select('id, tagline, created_date')
            .eq('venture_id', currentVenture.id);
          const campaignMap = {};
          (campaignRows || []).forEach(c => { campaignMap[c.id] = c; });
          setCampaignsById(campaignMap);

          // [NEW — Growth AI] Load whatever analysis was last saved (if any),
          // so it's shown as-is without re-running anything — per the "only
          // the Analyze click triggers work" rule (project definition, section 2).
          if ((campaignRows || []).length > 0) {
            const campaignIds = campaignRows.map(c => c.id);
            const { data: analysisRows } = await supabase
              .from('growth_brief_analysis')
              .select('*')
              .in('campaign_id', campaignIds)
              .order('analyzed_date', { ascending: false })
              .limit(1);
            if (analysisRows && analysisRows.length > 0) {
              setGrowthAiAnalysis(analysisRows[0].analysis || null);
              setGrowthAnalysisMeta({ campaignId: analysisRows[0].campaign_id, analyzedDate: analysisRows[0].analyzed_date });
            }
          }

          // [ADDED 020826] Part G.6 — the product-level question is stored as
          // a sentinel row (feature_id: 'product_overall') in the same
          // table. Pulled out separately here so it doesn't get treated as
          // a real feature anywhere below.
          const productLevelRows = feedback.filter(f => f.feature_id === 'product_overall');
          if (productLevelRows.length > 0) {
            const scores = productLevelRows.map(r => r.rating);
            const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
            const notes = productLevelRows.map(r => r.note).filter(Boolean);
            setProductLevelFeedback({ avgScore: avg.toFixed(1), totalResponses: scores.length, notes, responses: productLevelRows });
          }

          if (currentVenture.mvp_data && currentVenture.mvp_data.feature_matrix) {
            const featureAnalytics = {};
            currentVenture.mvp_data.feature_matrix
              .filter(f => f.isSelected)
              .forEach(feature => {
                const feedbackForFeature = feedback.filter(f => f.feature_id === feature.id);
                if (feedbackForFeature.length > 0) {
                  const ratings = feedbackForFeature.map(f => f.rating);
                  const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
                  const total = ratings.length;
                  // [FIX 020826] Part G.6 — 3 bands instead of 4, matching
                  // the redefined importance scale in InteractiveFeedbackForm.jsx.
                  featureAnalytics[feature.id] = {
                    name: feature.featureName,
                    description: feature.description || '',
                    avgRating: avgRating.toFixed(1),
                    totalResponses: total,
                    responses: feedbackForFeature, // [ADDED 020826] keep individual rows for the detail list
                    hardToSeeCount: feedbackForFeature.filter(f => f.hard_to_see_in_mockup).length,
                    breakdown: {
                      unnecessary: ratings.filter(r => r >= 0 && r <= 3).length,
                      somewhatImportant: ratings.filter(r => r >= 4 && r <= 7).length,
                      critical: ratings.filter(r => r >= 8 && r <= 10).length,
                    }
                  };
                }
              });
            setAnalytics(featureAnalytics);
          }

          // [ADDED 020826] Batch-fetch usernames for everyone who gave attributed
          // feedback, so name buttons don't need a query per click.
          // [FIX 020826] Beta testers DO carry created_by_id (confirmed in schema) —
          // an earlier version of this file incorrectly assumed they didn't.
          const founderIds = new Set();
          feedback.forEach(f => f.created_by_id && founderIds.add(f.created_by_id));
          suggestions.forEach(s => s.created_by_id && founderIds.add(s.created_by_id));
          pfeedback.forEach(f => f.created_by_id && founderIds.add(f.created_by_id));
          testers.forEach(t => t.created_by_id && founderIds.add(t.created_by_id));
          (followerRows || []).forEach(f => f.user_id && founderIds.add(f.user_id));
          // [GROWTH] Added — without this, anyone who gave Growth feedback
          // while logged in would show up unattributed (no hover card),
          // same bug pattern already fixed for beta testers previously.
          (growthRows || []).forEach(g => g.created_by_id && founderIds.add(g.created_by_id));
          if (founderIds.size > 0) {
            // [FIX 020826] Was a direct user_profiles query — blocked by RLS
            // (user_profiles_select_own only allows id = auth.uid()), so it
            // silently returned nothing for anyone else's profile. Now uses
            // the get_public_founder_profile RPC (security definer), which
            // safely exposes only username/early_adopter for any founder id.
            const ids = Array.from(founderIds);
            const results = await Promise.all(
              ids.map(id => supabase.rpc('get_public_founder_profile', { profile_id: id }))
            );
            const map = {};
            results.forEach((res, i) => {
              const row = res?.data?.[0];
              if (row) map[ids[i]] = row;
            });
            setFounderProfiles(map);
          }
        }
      } catch (error) {
        console.error('[FeedbackHub] Error loading feedback data:', error);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      // [FIX 020826] Part G.7 — now includes each feature's description
      // (the AI needs this to reason about what a feature actually *means*,
      // not just its name/score — this is the core dependency this whole
      // redesign relies on).
      const featureSummary = Object.entries(analytics).map(([, data]) =>
        'Feature: "' + data.name + '" — described by the founder as: "' + (data.description || 'no description provided') + '". Avg rating: ' + data.avgRating + '/10 (' + data.totalResponses + ' responses). Unnecessary: ' + data.breakdown.unnecessary + ', Somewhat important: ' + data.breakdown.somewhatImportant + ', Critical: ' + data.breakdown.critical + '.'
      ).join('\n');
      const mlpSummary = productFeedbacks.map(fb => '- "' + fb.feedback_text + '"').join('\n');
      const suggestedSummary = suggestedFeatures.map(s => '- ' + s.feature_name).join('\n');
      const bpContext = businessPlanData
        ? 'Mission: ' + (businessPlanData.mission || 'N/A') + '\nProblem: ' + (businessPlanData.problem || 'N/A') + '\nSolution: ' + (businessPlanData.solution || 'N/A') + '\nTarget customers: ' + (businessPlanData.target_customers || 'N/A')
        : 'No business plan data available.';

      // [ADDED 020826] Part G.7 — the product-representation score (does the
      // mockup capture the idea?), used for the Representation Gap check
      // (Section 15 of the spec): comparing what users value against what
      // the mockup actually communicates.
      const representationContext = productLevelFeedback
        ? 'Mockup representation score: ' + productLevelFeedback.avgScore + '/10 (' + productLevelFeedback.totalResponses + ' responses). Reviewer notes on the mockup: ' + (productLevelFeedback.notes.length > 0 ? productLevelFeedback.notes.map(n => '"' + n + '"').join('; ') : 'none.')
        : 'No product-representation data yet.';

      // [ADDED 020826] Part G.7, Sections 20-22 — confidence/evidence-strength
      // is rule-based on response count AND consistency, not left to the AI's
      // own judgment. Computed here and handed to the AI as a fact to phrase
      // correctly, not something for it to estimate itself.
      const responseCount = productLevelFeedback?.totalResponses || 0;
      let confidenceLevel;
      if (responseCount >= 6) confidenceLevel = 'Strong (6+ responses) — use language like "the feedback consistently indicates..."';
      else if (responseCount >= 3) confidenceLevel = 'Early/Emerging (3-5 responses) — use language like "this may indicate..." or "the feedback suggests..." and explicitly recommend collecting more responses before major decisions.';
      else confidenceLevel = 'Basic (1-2 responses) — do not draw a product-direction conclusion yet, only note early signals and recommend more responses.';

      const prompt = 'You are a product strategist analyzing structured startup feedback. Follow this exact reasoning sequence, per the StartZig AI Product Direction methodology:\n'
        + 'Level 1 (Feature): individual feature ratings.\n'
        + 'Level 2 (Capability): group features with similar ratings AND similar founder-described meaning into an underlying capability — do not just repeat feature names, identify what they have in common in terms of user value.\n'
        + 'Level 3 (Product Direction): what type of product capability is the strongest signal pointing toward (e.g. decision support, validation, discovery, automation, communication, collaboration, creation, organization, monitoring, education, or a more fitting description you generate).\n\n'
        + 'CRITICAL RULES:\n'
        + '- Never just say "keep A and B, remove C and D" — always explain what A and B have in common, and what that implies about product direction.\n'
        + '- Distinguish evidence (from users) from recommendation (your interpretation) — be explicit about which is which.\n'
        + '- Never imply statistical certainty the data cannot support. Match your confidence language to: ' + confidenceLevel + '\n'
        + '- If a Representation Gap exists (users value a capability highly but the mockup score is low, or vice versa), call it out explicitly.\n'
        + '- Suggested features are strategic signals, not a backlog — only mention ones that reinforce or reveal the emerging direction, and explain how.\n'
        + '- Never suggest generic features (dark mode, notifications, social sharing) unless they demonstrably connect to the identified direction.\n\n'
        + 'Startup: "' + (venture?.name || '') + '"\n\n'
        + 'BUSINESS CONTEXT:\n' + bpContext + '\n\n'
        + 'MVP FEATURE RATINGS AND DESCRIPTIONS:\n' + (featureSummary || 'No feature ratings yet.') + '\n\n'
        + 'PRODUCT REPRESENTATION (MOCKUP FIT):\n' + representationContext + '\n\n'
        + 'MLP USER FEEDBACK:\n' + (mlpSummary || 'No MLP feedback yet.') + '\n\n'
        + 'SUGGESTED FEATURES FROM USERS:\n' + (suggestedSummary || 'No suggestions yet.') + '\n\n'
        + 'Respond with EXACTLY this structure, nothing else:\n\n'
        + 'EMERGING PRODUCT DIRECTION:\n'
        + '- [one to two sentences: the Level 3 conclusion, or "not enough data yet" if confidence is Basic]\n\n'
        + 'WHY WE THINK THIS:\n'
        + '- [the Level 2 capability grouping — what the well-rated features have in common, in the founder\'s own terms]\n'
        + '- [what the lower-rated features have in common, if a pattern exists]\n\n'
        + 'PRODUCT REPRESENTATION:\n'
        + '- [one sentence: does the mockup score match what users seem to value, or is there a gap]\n\n'
        + 'USER SUGGESTIONS:\n'
        + '- [how suggested features relate to the emerging direction, or "no suggestions yet"]\n\n'
        + 'RECOMMENDED FOCUS:\n'
        + '- Strengthen: [one specific area]\n'
        + '- Deprioritize: [one specific area, if evidence supports it]\n\n'
        + 'CONFIDENCE:\n'
        + '- [state the confidence level and response count, matching the rules above]\n\n'
        + 'Plain text only. No markdown. No extra commentary.';

      const data = await InvokeLLM({ prompt, creditType: 'mentor' });
      setAiAnalysis(data?.response || 'No analysis generated.');
    } catch (error) {
      if (error.message === 'NO_CREDITS') {
        setAiAnalysis('You have used all your mentor credits this month. Upgrade your plan to get more.');
      } else {
        setAiAnalysis('Error generating analysis. Please try again.');
      }
    }
    setIsAnalyzing(false);
  };

  // [FIX 020826] getCategoryFromRating (dot/color badge) removed — no
  // longer used since the Feature Decisions view merged with the detailed
  // breakdown (this session); getFeatureDecision below covers the same
  // rating, styled for the merged card instead.
  // [ADDED 020826] Part G v1 (approved this session): rule-based decision
  // mapping from the existing avgRating — no AI, no new questions, no schema
  // change.
  // [FIX 020826] Part G.6 — boundaries aligned to the new 3-band importance
  // scale (0-3/4-7/8-10). Removed the old "Confusing" branch — that signal
  // now lives separately in the "Hard to see in the mockup" toggle
  // (hardToSeeCount, surfaced separately on the card, not folded into the
  // micro-text here).
  const getFeatureDecision = (avgRating) => {
    const rating = parseFloat(avgRating);
    if (rating >= 8) {
      return { signal: 'Strong', action: 'Keep', micro: "Users see this as essential to the product.",
        border: 'border-l-emerald-500', badge: 'bg-emerald-100 text-emerald-700', actionColor: 'text-emerald-600' };
    }
    if (rating >= 4) {
      return { signal: 'Mixed', action: 'Improve', micro: "Users like this, but it's not yet a must-have.",
        border: 'border-l-amber-500', badge: 'bg-amber-100 text-amber-700', actionColor: 'text-amber-600' };
    }
    return { signal: 'Weak', action: 'Remove', micro: "Users don't see enough value in this feature.",
      border: 'border-l-red-500', badge: 'bg-red-100 text-red-700', actionColor: 'text-red-600' };
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!venture) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">No venture found.</p>
      </div>
    );
  }

  const totalFeedback = productFeedbacks.length + (venture.mvp_feedback_count || 0);

  // [ADDED 020826] Which phase-sections has this founder actually reached?
  // No empty placeholders for phases not yet reached.
  const reachedMVP = Boolean(venture.mvp_uploaded) || Object.keys(analytics).length > 0 || suggestedFeatures.length > 0;
  const reachedMLP = Boolean(venture.mlp_completed || venture.mlp_development_completed) || productFeedbacks.length > 0;
  // [GROWTH FIX] Was `venture.phase === 'beta' || venture.phase === 'growth' || betaTesters.length > 0`
  // — a Growth-phase venture was falling into the Beta section (showing
  // beta signups, not Growth feedback) because this flag never
  // distinguished the two. Confirmed as the actual cause this session.
  const reachedBeta = venture.phase === 'beta' || betaTesters.length > 0;
  const reachedGrowth = venture.phase === 'growth' || growthFeedbacks.length > 0;


  // [ADDED 020826] MLP average ratings across all responses, for the summary row.
  const mlpAverages = (() => {
    const withRatings = productFeedbacks.filter(fb => fb.features_rating != null || fb.look_feel_rating != null || fb.ux_rating != null);
    if (withRatings.length === 0) return null;
    const avg = (key) => {
      const vals = withRatings.map(fb => fb[key]).filter(v => v != null);
      return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null;
    };
    return { features: avg('features_rating'), lookFeel: avg('look_feel_rating'), ux: avg('ux_rating') };
  })();

  // [FIX — campaign-first view] Converted from a fixed constant (computed
  // once over all growthFeedbacks) into a function, so it can be
  // recomputed for whichever campaign's subset is currently selected.
  // [NEW — Growth AI, project-definition section 3] Signal-strength
  // classification is always computed in code, never left to the AI —
  // same "don't let the model grade its own confidence" principle as the
  // existing MVP confidence-level logic, but combining BOTH response
  // count and score spread (std. deviation), per the definition doc.
  // Thresholds below are a first-cut assumption — flag for review once
  // we see it against real response volumes.
  // [FIX — per explicit feedback] Was confidence-based (response count +
  // spread of opinions), which read to the founder as if "Strong" meant
  // "people are satisfied" when it actually meant "we trust this number" —
  // and the threshold was so loose it showed "Strong" on almost everything.
  // Now a plain 5-level read of the average itself (1-10 scale), agreed
  // with the founder: <3 Poor, 3-5 Weak, 5-7.5 Mixed, 7.5-9 Strong, 9+ Elite.
  const satisfactionLevel = (value) => {
    if (value == null) return null;
    const v = Number(value);
    if (v < 3) return 'Poor';
    if (v < 5) return 'Weak';
    if (v < 7.5) return 'Mixed';
    if (v < 9) return 'Strong';
    return 'Elite';
  };

  // [FIX — Growth AI] Also returns `signal` per category (satisfactionLevel
  // above) alongside the existing `value`/`count`.
  const computeGrowthAverages = (feedbackArr) => {
    const withRatings = feedbackArr.filter(fb =>
      fb.business_model_rating != null || fb.core_features_rating != null ||
      fb.value_prop_rating != null || fb.product_definition_rating != null
    );
    if (withRatings.length === 0) return null;
    const statsFor = (key) => {
      const vals = withRatings.map(fb => fb[key]).filter(v => v != null);
      if (vals.length === 0) return { value: null, count: 0, signal: null };
      const value = (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
      return { value, count: vals.length, signal: satisfactionLevel(value) };
    };
    return {
      businessModel: statsFor('business_model_rating'),
      coreFeatures: statsFor('core_features_rating'),
      valueProp: statsFor('value_prop_rating'),
      productDefinition: statsFor('product_definition_rating'),
    };
  };

  // [NEW — Growth AI, project-definition section 5] Pure data assembly for
  // one Growth AI analysis run — no prompt text, no LLM call. Gathers every
  // brief of this venture chronologically (each with its own code-computed
  // snapshot + raw feedback + its saved "what changed" note), the aggregate
  // snapshot across all briefs, and business context. `targetCampaignId` is
  // the brief this run will be saved against in `growth_brief_analysis`.
  const buildGrowthAnalysisInput = async (targetCampaignId) => {
    const briefIds = Array.from(new Set(growthFeedbacks.map(fb => fb.campaign_id).filter(Boolean)));
    const briefsChronological = briefIds
      .map(id => ({ id, tagline: campaignsById[id]?.tagline || 'Untitled brief', date: campaignsById[id]?.created_date }))
      .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));

    // Previous "what changed since last brief" notes — fetched fresh from
    // growth_brief_analysis since that table isn't part of this page's
    // regular loaded state.
    let changesById = {};
    if (briefIds.length > 0) {
      const { data: pastAnalyses, error } = await supabase
        .from('growth_brief_analysis')
        .select('campaign_id, changes_since_last_analysis, analyzed_date')
        .in('campaign_id', briefIds);
      if (error) {
        console.error('Failed to load past growth brief analyses:', error);
      } else {
        (pastAnalyses || []).forEach(row => {
          changesById[row.campaign_id] = {
            changes: row.changes_since_last_analysis || null,
            analyzedDate: row.analyzed_date || null,
          };
        });
      }
    }

    const briefs = briefsChronological.map(b => {
      const items = growthFeedbacks.filter(fb => fb.campaign_id === b.id);
      return {
        campaignId: b.id,
        tagline: b.tagline,
        date: b.date,
        isTarget: b.id === targetCampaignId,
        changesSinceLastAnalysis: changesById[b.id]?.changes || null,
        previouslyAnalyzedDate: changesById[b.id]?.analyzedDate || null,
        snapshot: computeGrowthAverages(items),
        feedback: items.map(fb => ({
          id: fb.id,
          date: fb.created_date,
          businessModelRating: fb.business_model_rating,
          businessModelNote: fb.business_model_note,
          coreFeaturesRating: fb.core_features_rating,
          coreFeaturesNote: fb.core_features_note,
          valuePropRating: fb.value_prop_rating,
          valuePropNote: fb.value_prop_note,
          productDefinitionRating: fb.product_definition_rating,
          productDefinitionNote: fb.product_definition_note,
          productMatchDiffText: fb.product_match_diff_text,
          customQuestionAnswer: fb.custom_question_answer,
          finalChangeText: fb.final_change_text,
          visitedProduct: fb.visited_product,
          productMatchChoice: fb.product_match_choice,
        })),
      };
    });

    const aggregateSnapshot = computeGrowthAverages(growthFeedbacks);

    const businessContext = businessPlanData
      ? {
          mission: businessPlanData.mission || null,
          problem: businessPlanData.problem || null,
          solution: businessPlanData.solution || null,
          targetCustomers: businessPlanData.target_customers || null,
        }
      : null;

    return {
      ventureName: venture?.name || null,
      businessContext,
      aggregateSnapshot,
      briefs,
      targetCampaignId,
    };
  };

  // [NEW — Growth AI] Which brief a fresh Analyze run is saved against —
  // always the most recently created brief, regardless of which pill the
  // founder currently has selected in the "All Briefs" view. The aggregate
  // view is just for browsing; growth_brief_analysis is still 1 row per brief.
  const getLatestGrowthBriefId = () => {
    const ids = Array.from(new Set(growthFeedbacks.map(fb => fb.campaign_id).filter(Boolean)));
    if (ids.length === 0) return null;
    return ids
      .map(id => ({ id, date: campaignsById[id]?.created_date }))
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))[0].id;
  };

  // [NEW — Growth AI] The free-text fields tagged by CALL 1, one row per
  // growth_feedback field that can hold a free-text answer.
  const GROWTH_TEXT_FIELDS = [
    { key: 'businessModelNote', label: 'Business model concern' },
    { key: 'coreFeaturesNote', label: 'Feature suggestion' },
    { key: 'valuePropNote', label: 'Slogan/value prop feedback' },
    { key: 'productDefinitionNote', label: 'Product definition feedback' },
    { key: 'productMatchDiffText', label: 'What was different than expected' },
    { key: 'customQuestionAnswer', label: 'Custom question answer' },
    { key: 'finalChangeText', label: 'One thing to improve' },
  ];

  // [NEW — Growth AI] Count-only signal strength for a tagged theme (no
  // numeric spread to measure for a categorical tag) — same bands as the
  // original MVP confidence-level logic. Always code, never the AI.
  const strengthByCount = (n) => {
    if (n >= 6) return 'Strong';
    if (n < 3) return 'Weak';
    return 'Mixed';
  };

  // [NEW — Growth AI] InvokeLLM (confirmed from src/api/integrations.js) has
  // NO structured-output option — it always returns raw Gemini text under
  // `response`. So every JSON-producing prompt below explicitly asks for
  // JSON-only text, and this helper parses it back, stripping ``` fences
  // Gemini sometimes adds despite instructions not to. Returns null (never
  // throws) on unparseable output, logging the raw text for debugging.
  const parseJsonFromLLM = (rawText) => {
    if (!rawText) return null;
    let cleaned = rawText.trim();
    const fenceMatch = cleaned.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
    if (fenceMatch) cleaned = fenceMatch[1].trim();
    try {
      return JSON.parse(cleaned);
    } catch (e) {
      console.error('Growth AI: failed to parse JSON from LLM response:', e, '\nRaw text was:', rawText);
      return null;
    }
  };

  // [NEW — Growth AI, project-definition section 3] The full two-call
  // pipeline: CALL 1 tags free text to themes (semantic judgment only —
  // no counting, no confidence). CODE counts tags per theme and grades
  // signal strength. CALL 2 interprets — receives ONLY pre-computed facts
  // (numeric snapshot + signal, tagged/counted/graded themes, "what
  // changed" notes, business context) and produces the actual analysis +
  // action plan. Saves the combined result to growth_brief_analysis.
  const runGrowthAnalysis = async (changesText) => {
    setIsAnalyzingGrowth(true);
    setGrowthAnalysisError(null);
    try {
      const targetCampaignId = getLatestGrowthBriefId();
      if (!targetCampaignId) {
        setGrowthAnalysisError('No brief to analyze yet.');
        setIsAnalyzingGrowth(false);
        return;
      }

      const input = await buildGrowthAnalysisInput(targetCampaignId);

      // [FIX — Growth AI] The "what changed" text the founder just typed
      // describes what changed to arrive at THIS (target) brief — it must
      // be used in THIS run's analysis, not only saved for the next one.
      // buildGrowthAnalysisInput only knows about notes already saved from
      // PAST runs (none exist yet for a brief being analyzed for the first
      // time), so the freshly-typed text has to be patched in here.
      if (changesText) {
        const targetBrief = input.briefs.find(b => b.campaignId === targetCampaignId);
        if (targetBrief) targetBrief.changesSinceLastAnalysis = changesText;
      }

      // ---------- CALL 1: tag free-text responses to semantic themes ----------
      const textItems = [];
      input.briefs.forEach(brief => {
        brief.feedback.forEach(fb => {
          GROWTH_TEXT_FIELDS.forEach(({ key, label }) => {
            const text = fb[key];
            if (text && text.trim()) {
              textItems.push({ id: `${fb.id}__${key}`, briefTagline: brief.tagline, fieldLabel: label, text: text.trim() });
            }
          });
        });
      });

      let themeTags = [];
      if (textItems.length > 0) {
        const taggingPrompt = 'You are tagging free-text user feedback responses about a startup, one theme per response.\n\n'
          + 'Read each response below and assign it ONE short semantic theme (2-5 words, e.g. "lack of social proof", "pricing concern", "onboarding confusion") that captures what the person is really saying — even if it does not match the question that was asked (e.g. a price complaint inside a feature-suggestion field is still a pricing theme).\n'
          + 'Use the SAME theme label (verbatim) for responses that express the same underlying idea, so they can be counted together. Do not invent a new theme for every response — group similar ones under a shared label.\n\n'
          + 'RESPONSES:\n'
          + textItems.map(item => `[${item.id}] (${item.fieldLabel}, brief: "${item.briefTagline}"): "${item.text}"`).join('\n')
          + '\n\nReturn a tag for every response id listed above.\n\n'
          + 'Respond with ONLY valid JSON, no markdown, no code fences, no commentary — exactly this shape:\n'
          + '{"tags": [{"id": "<response id>", "theme": "<short theme label>"}, ...]}';

        const taggingResult = await InvokeLLM({ prompt: taggingPrompt, creditType: 'mentor' });
        const taggingParsed = parseJsonFromLLM(taggingResult?.response);
        themeTags = taggingParsed?.tags || [];
      }

      // ---------- CODE: count tags per theme, grade signal strength ----------
      const tagsById = {};
      themeTags.forEach(t => { tagsById[t.id] = t.theme; });
      const themeGroups = {};
      textItems.forEach(item => {
        const theme = tagsById[item.id];
        if (!theme) return;
        if (!themeGroups[theme]) themeGroups[theme] = [];
        themeGroups[theme].push(item);
      });
      const themes = Object.entries(themeGroups)
        .map(([theme, items]) => ({
          theme,
          count: items.length,
          signal: strengthByCount(items.length),
          examples: items.slice(0, 5).map(i => ({ text: i.text, briefTagline: i.briefTagline, fieldLabel: i.fieldLabel })),
        }))
        .sort((a, b) => b.count - a.count);

      // ---------- CALL 2: interpretation, using only pre-computed facts ----------
      const briefsSummary = input.briefs.map(b =>
        `Brief "${b.tagline}" (${b.date || 'no date'})${b.isTarget ? ' [current/most recent]' : ''}:\n`
        + `  Snapshot: ${b.snapshot ? JSON.stringify(b.snapshot) : 'no ratings yet'}\n`
        + `  What changed since the previous brief (founder's own words): ${b.changesSinceLastAnalysis || 'not provided'}`
      ).join('\n\n');

      const themesSummary = themes.length > 0
        ? themes.map(t => `- "${t.theme}" — ${t.count} response(s), signal: ${t.signal}. Examples: ${t.examples.map(e => `"${e.text}"`).join('; ')}`).join('\n')
        : 'No free-text themes tagged yet.';

      const analysisPrompt = 'You are a product strategist analyzing Growth-stage startup feedback, following the StartZig Insight Brief methodology.\n\n'
        + 'You are given ONLY pre-computed facts — numeric averages, response counts, and signal strength (Strong/Mixed/Weak) were already calculated in code. Do NOT invent or restate a confidence/signal level yourself anywhere — always use the ones given to you, phrased in words.\n\n'
        + 'CRITICAL RULES:\n'
        + '- Separate Evidence (what was actually said/measured) from Recommendation (your interpretation) explicitly, everywhere.\n'
        + '- Use the "what changed since last brief" notes to explain real changes between briefs — do not guess a cause the founder did not mention.\n'
        + '- You do not know implementation cost or founder resources — base "act now" vs "plan for later" ONLY on signal strength and how central the topic is to the business\'s core value proposition, and say so explicitly if relevant.\n'
        + '- Call out unexpected insights — things mentioned in the wrong field or not asked about at all.\n\n'
        + 'STARTUP: ' + (input.ventureName || 'Unknown') + '\n\n'
        + 'BUSINESS CONTEXT:\n' + (input.businessContext ? JSON.stringify(input.businessContext) : 'Not available') + '\n\n'
        + 'AGGREGATE SNAPSHOT (across all briefs, code-computed):\n' + (input.aggregateSnapshot ? JSON.stringify(input.aggregateSnapshot) : 'No ratings yet') + '\n\n'
        + 'BRIEFS, CHRONOLOGICAL (oldest to newest):\n' + briefsSummary + '\n\n'
        + 'TAGGED THEMES FROM FREE-TEXT FEEDBACK (code-counted, code-graded):\n' + themesSummary + '\n\n'
        + 'Produce a structured analysis covering: patterns, agreement/disagreement, unexpected insights, product clarity, feature insights, changes over time (if more than one brief exists), and a behavior split (visited_product / product_match_choice) if that data is meaningful. Then produce an action plan split into "now" and "later". Finally, produce a one-to-two sentence executive summary — the single most important finding plus the single most urgent action, in plain language a busy founder can read in 5 seconds. It must not just restate a category name; it must say what to actually do.\n\n'
        + 'Respond with ONLY valid JSON, no markdown, no code fences, no commentary — exactly this shape:\n'
        + '{"executiveSummary": "...", "analysis": {"patterns": "...", "agreement": "...", "unexpectedInsights": "...", "productClarity": "...", "featureInsights": "...", "changesOverTime": "...", "behaviorSplit": "..."}, "actionPlan": {"now": ["..."], "later": ["..."]}}';

      const analysisResult = await InvokeLLM({ prompt: analysisPrompt, creditType: 'mentor' });
      const analysisParsed = parseJsonFromLLM(analysisResult?.response);

      // [NEW — Growth AI visual layer] Trend per category — always code,
      // never asked of the AI: compares the target brief's own snapshot to
      // the immediately preceding brief's own snapshot (not the aggregate),
      // so it's a fair apples-to-apples comparison.
      const targetIdx = input.briefs.findIndex(b => b.campaignId === targetCampaignId);
      const prevBrief = targetIdx > 0 ? input.briefs[targetIdx - 1] : null;
      const targetBrief = targetIdx >= 0 ? input.briefs[targetIdx] : null;
      const TREND_CATEGORIES = ['businessModel', 'coreFeatures', 'valueProp', 'productDefinition'];
      const trend = {};
      TREND_CATEGORIES.forEach(cat => {
        const curVal = targetBrief?.snapshot?.[cat]?.value;
        const prevVal = prevBrief?.snapshot?.[cat]?.value;
        if (curVal == null || prevVal == null) { trend[cat] = null; return; }
        const diff = parseFloat(curVal) - parseFloat(prevVal);
        trend[cat] = diff > 0.3 ? 'up' : diff < -0.3 ? 'down' : 'flat';
      });

      const fullAnalysis = {
        snapshot: input.aggregateSnapshot,
        trend,
        executive_summary: analysisParsed?.executiveSummary || null,
        themes,
        analysis: analysisParsed?.analysis || null,
        action_plan: analysisParsed?.actionPlan || null,
      };

      const analyzedDate = new Date().toISOString();
      const { error: saveError } = await supabase
        .from('growth_brief_analysis')
        .upsert({
          campaign_id: targetCampaignId,
          changes_since_last_analysis: changesText || null,
          analysis: fullAnalysis,
          analyzed_date: analyzedDate,
        }, { onConflict: 'campaign_id' });

      if (saveError) throw saveError;

      // [NEW — Growth AI] Surface a parsing failure explicitly instead of
      // silently showing an empty result box (this is what happened the
      // first time, before this check existed).
      if (!fullAnalysis.analysis && themes.length === 0) {
        setGrowthAnalysisError('The AI response could not be read. Check the browser console for the raw text, then try again.');
      }

      setGrowthAiAnalysis(fullAnalysis);
      setGrowthAnalysisMeta({ campaignId: targetCampaignId, analyzedDate });
    } catch (err) {
      console.error('Growth analysis failed:', err);
      setGrowthAnalysisError('Something went wrong generating the analysis. Please try again.');
    }
    setIsAnalyzingGrowth(false);
  };

  // [NEW — Growth AI, project-definition section 2] Only asks "what changed
  // since the last brief" when this isn't the founder's first brief.
  const handleAnalyzeGrowthClick = () => {
    const briefIds = Array.from(new Set(growthFeedbacks.map(fb => fb.campaign_id).filter(Boolean)));
    if (briefIds.length > 1) {
      setShowGrowthChangesPrompt(true);
    } else {
      runGrowthAnalysis('');
    }
  };

  const submitGrowthChangesAndAnalyze = () => {
    setShowGrowthChangesPrompt(false);
    runGrowthAnalysis(growthChangesText);
    setGrowthChangesText('');
  };

  // [FIX — campaign grouping] Shared helper: groups any feedback array (must
  // have a `campaign_id` field) into per-campaign buckets using
  // campaignsById, sorted newest campaign first, with a "Direct" bucket
  // (no campaign_id — e.g. someone found the page on their own) always last.
  // [GROWTH — Brief terminology] Underlying data/queries still use
  // "campaign" everywhere (no DB/schema rename, explicit decision) — this
  // helper stays shared with MVP/Beta, which still display "campaign".
  // Optional label overrides let the Growth section display "Brief"
  // without touching MVP/Beta's own wording or any query.
  const groupByCampaign = (items, { untitledLabel = 'Untitled campaign', directLabel = 'Direct (no campaign)' } = {}) => {
    const groups = {};
    items.forEach((item) => {
      const cid = item.campaign_id || '__direct__';
      if (!groups[cid]) groups[cid] = [];
      groups[cid].push(item);
    });
    const campaignGroups = Object.entries(groups)
      .filter(([cid]) => cid !== '__direct__')
      .map(([cid, groupItems]) => ({
        campaignId: cid,
        campaignName: campaignsById[cid]?.tagline || untitledLabel,
        campaignDate: campaignsById[cid]?.created_date || null,
        items: groupItems,
      }))
      .sort((a, b) => new Date(b.campaignDate || 0) - new Date(a.campaignDate || 0));
    const direct = groups['__direct__'];
    if (direct && direct.length > 0) {
      campaignGroups.push({ campaignId: '__direct__', campaignName: directLabel, campaignDate: null, items: direct });
    }
    return campaignGroups;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        {/* [FIX] "Hub" removed from the title per explicit request; icon and
            title now share one row instead of icon-above-title (which took
            up much more vertical space than needed), title shrunk and
            colored purple to match the icon. */}
        <div className="text-center mb-10">
          {/* [FIX — per explicit feedback] Icon removed per explicit request. */}
          <h1 className="text-2xl font-extrabold text-purple-700 mb-2">Venture Feedback</h1>
          <p className="text-lg" style={{ color: '#15803D' }}>All Insight collected across your startup journey</p>
        </div>

        {/* AI Analysis */}
        {/* [GROWTH] This whole block (title, "Get Product Insights" button,
            and any existing analysis) is MVP/MLP-oriented and not built for
            Growth data yet — hidden for a Growth-phase venture per explicit
            request. Same pattern as hiding the 4 summary cards below. */}
        {venture.phase !== 'growth' && (
        <div className="mb-10">
          {/* [FIX 020826] Part G.7.3 — renamed "Mentor" to "Get Product
              Insights," per both source specs' explicit instruction: "Use:
              Get Product Insights. Not: Ask AI." Positions this as a product
              advisor, not a chatbot. */}
          <p className="text-sm text-gray-500 text-center mb-3">Understand what your feedback means for your product's direction</p>
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-200 px-8 py-3 text-base"
            >
              {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
              {isAnalyzing ? 'Analyzing...' : 'Get Product Insights'}
            </Button>
          </div>
          {aiAnalysis && (() => {
            // [ADDED 020826] Restyled per the approved mockup — grouped into
            // bordered sections with colored labels (green/amber/indigo)
            // instead of a flat list of h4/p pairs. Parsing logic unchanged
            // (same header-detection regex), only the rendering changed.
            const sectionColors = [
              { text: 'text-emerald-600' },
              { text: 'text-amber-600' },
              { text: 'text-indigo-600' },
            ];
            const lines = aiAnalysis.split('\n').map(l => l.trim()).filter(Boolean);
            const sections = [];
            lines.forEach((line) => {
              const isHeader = /^[A-Z][A-Z\s']+:/.test(line);
              if (isHeader) {
                sections.push({ header: line, body: [] });
              } else if (sections.length > 0) {
                sections[sections.length - 1].body.push(line);
              }
            });
            return (
              <div className="border border-gray-200 rounded-xl overflow-hidden mt-5">
                {sections.map((section, i) => (
                  <div key={i} className={`p-5 ${i < sections.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${sectionColors[i % 3].text}`}>
                      {section.header}
                    </p>
                    {section.body.map((line, j) => (
                      <p key={j} className="text-sm text-gray-700 leading-relaxed mb-1">{line}</p>
                    ))}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
        )}

        {/* Stats */}
        {/* [GROWTH FIX] These 4 cards (Features Analyzed, Beta Sign-ups,
            etc.) are MVP/MLP/Beta-specific and don't apply to a venture in
            Growth phase — confirmed as not wanted there. Growth has its own
            stats (the circular gauges) inside its own section below. */}
        {venture.phase !== 'growth' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Feedback', value: totalFeedback, icon: <MessageSquare className="w-5 h-5 text-indigo-500" />, bg: 'bg-indigo-50' },
            { label: 'Features Analyzed', value: Object.keys(analytics).length, icon: <TrendingUp className="w-5 h-5 text-green-500" />, bg: 'bg-green-50' },
            { label: 'Suggested Features', value: suggestedFeatures.length, icon: <Lightbulb className="w-5 h-5 text-yellow-500" />, bg: 'bg-yellow-50' },
            { label: 'Beta Sign-ups', value: betaTesters.length, icon: <Users className="w-5 h-5 text-purple-500" />, bg: 'bg-purple-50' },
          ].map((stat, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                  {stat.icon}
                </div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        )}

        {/* ===================== FOLLOWERS ===================== */}
        {/* [FIX 020826] Moved out of the MLP-gated section — Followers can
            now opt in from MVP too (extended this session), so this must
            not be hidden behind reachedMLP. Shown at the top, independent of
            venture phase, whenever there's at least one follower. */}
        {followers.length > 0 && (
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Followers</p>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{followers.length}</p>
                    <p className="text-xs text-gray-400">Founders who want to keep contributing to this venture</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggle('followers')}
                    className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Zoom in
                    <ChevronDown className={`w-4 h-4 transition-transform ${expanded.followers ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                {expanded.followers && (
                  <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                    {followers.map((f) => (
                      <FounderHoverCard
                        key={f.id}
                        founderId={f.user_id}
                        name={getDisplayName(founderProfiles[f.user_id], null)}
                        profile={founderProfiles[f.user_id]}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ===================== MVP ===================== */}
        {reachedMVP && (
          <div className="mb-10">
            {/* [FIX] Visible "MVP" label removed per explicit request — the
                comment marker above still identifies this section in code. */}

            {/* [ADDED 020826] Part G.6 — product-level feedback, shown first
                (matches the order reviewers actually answer it in: mockup
                fit before feature-level details). */}
            {productLevelFeedback && (
              <div className="mb-6 border-2 border-indigo-200 rounded-xl p-5 bg-indigo-50/40">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 mb-2">Does the mockup capture the idea?</p>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-3xl font-bold text-indigo-700">{productLevelFeedback.avgScore}</span>
                  <span className="text-gray-400 text-sm">/10 average · {productLevelFeedback.totalResponses} response{productLevelFeedback.totalResponses !== 1 ? 's' : ''}</span>
                </div>
                {productLevelFeedback.notes.length > 0 && (
                  <div className="space-y-2 border-t border-indigo-100 pt-3">
                    {productLevelFeedback.notes.map((note, i) => (
                      <p key={i} className="text-sm text-gray-700 italic">"{note}"</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* [ADDED 020826] Feature Decisions — Part G v1, approved this
                session: decision-first summary (Keep/Improve/Remove) sitting
                above the existing detailed rating breakdown. Rule-based only,
                derived from the same avgRating already computed below — no
                AI, no new data. */}
            {/* [FIX 020826] Merged with what used to be a separate detailed
                section below — was two disconnected views of the same data,
                confusing. Now one card per feature: the decision summary is
                always visible, and a "Zoom in" toggle reveals the detailed
                breakdown (bar, hard-to-see warning, individual responses)
                inline, right where it belongs. Nothing was deleted, only
                relocated and merged. */}
            {Object.keys(analytics).length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Feature decisions</p>
                <div className="space-y-2.5">
                  {Object.entries(analytics).map(([featureId, data]) => {
                    const decision = getFeatureDecision(data.avgRating);
                    const total = data.totalResponses;
                    const pUnnecessary = Math.round((data.breakdown.unnecessary / total) * 100);
                    const pSomewhat = Math.round((data.breakdown.somewhatImportant / total) * 100);
                    const pCritical = Math.round((data.breakdown.critical / total) * 100);
                    const detailKey = 'mvpDetail_' + featureId;
                    return (
                      <div key={featureId} className={`border border-gray-200 border-l-4 ${decision.border} rounded-lg`}>
                        <div className="flex items-center justify-between gap-4 px-5 py-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900">{data.name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${decision.badge}`}>{decision.signal}</span>
                            </div>
                            <p className="text-sm text-gray-500">{decision.micro}</p>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className={`text-sm font-semibold whitespace-nowrap ${decision.actionColor}`}>{decision.action}</span>
                            <button
                              type="button"
                              onClick={() => toggle(detailKey)}
                              className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 whitespace-nowrap"
                            >
                              Zoom in
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded[detailKey] ? 'rotate-180' : ''}`} />
                            </button>
                          </div>
                        </div>

                        {expanded[detailKey] && (
                          <div className="px-5 pb-5 pt-1 border-t border-gray-100">
                            <div className="flex items-center gap-1 mb-3 mt-3">
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              <span className="font-bold text-gray-900">{data.avgRating}</span>
                              <span className="text-gray-400 text-sm">/10 average</span>
                            </div>

                            {data.hardToSeeCount > 0 && (
                              <p className="text-xs text-amber-600 mb-3 flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                {data.hardToSeeCount} of {total} reviewer{data.hardToSeeCount !== 1 ? 's' : ''} found this hard to see in the mockup
                              </p>
                            )}

                            <div className="h-3 rounded-full overflow-hidden flex mb-3">
                              {pUnnecessary > 0 && <div className="bg-red-400 h-full transition-all" style={{ width: `${pUnnecessary}%` }} title={`Unnecessary: ${pUnnecessary}%`} />}
                              {pSomewhat > 0 && <div className="bg-blue-400 h-full transition-all" style={{ width: `${pSomewhat}%` }} title={`Somewhat important: ${pSomewhat}%`} />}
                              {pCritical > 0 && <div className="bg-green-400 h-full transition-all" style={{ width: `${pCritical}%` }} title={`Critical: ${pCritical}%`} />}
                            </div>

                            <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-4">
                              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Unnecessary {pUnnecessary}%</span>
                              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />Somewhat important {pSomewhat}%</span>
                              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" />Critical {pCritical}%</span>
                              <span className="ml-auto">{total} response{total !== 1 ? 's' : ''}</span>
                            </div>

                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Individual responses</p>
                            <div className="space-y-2">
                              {data.responses.map((r) => (
                                <div key={r.id} className="flex items-center justify-between">
                                  <FounderHoverCard
                                    founderId={r.created_by_id}
                                    name={getDisplayName(founderProfiles[r.created_by_id], r.user_email)}
                                    profile={founderProfiles[r.created_by_id]}
                                  />
                                  <span className="text-sm font-semibold text-gray-700">{r.rating}/10</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {suggestedFeatures.length > 0 && (
              <div className="mb-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Consider adding</p>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  {suggestedFeatures.map((suggestion, i) => (
                    <div
                      key={suggestion.id}
                      className={`flex items-center gap-3 px-5 py-3.5 ${i < suggestedFeatures.length - 1 ? 'border-b border-gray-100' : ''}`}
                    >
                      <Lightbulb className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <p className="font-medium text-gray-900 flex-1">{suggestion.feature_name}</p>
                      {/* [FIX 020826] Was showing raw email — now a clickable
                          founder-name hover card instead. Falls back to nothing
                          (not the email) if attribution is missing. */}
                      <FounderHoverCard
                        founderId={suggestion.created_by_id}
                        name={getDisplayName(founderProfiles[suggestion.created_by_id], suggestion.user_email)}
                        profile={founderProfiles[suggestion.created_by_id]}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== MLP ===================== */}
        {reachedMLP && (
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">MLP</p>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                {mlpAverages && (
                  <div className="flex flex-wrap gap-6 mb-4 pb-4 border-b border-gray-100">
                    {mlpAverages.features != null && (
                      <div><p className="text-xs text-gray-400">Features</p><p className="text-lg font-bold text-gray-900">{mlpAverages.features}/10</p></div>
                    )}
                    {mlpAverages.lookFeel != null && (
                      <div><p className="text-xs text-gray-400">Look &amp; feel</p><p className="text-lg font-bold text-gray-900">{mlpAverages.lookFeel}/10</p></div>
                    )}
                    {mlpAverages.ux != null && (
                      <div><p className="text-xs text-gray-400">UX</p><p className="text-lg font-bold text-gray-900">{mlpAverages.ux}/10</p></div>
                    )}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => toggle('mlp')}
                  className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  {productFeedbacks.length} response{productFeedbacks.length !== 1 ? 's' : ''}
                  <ChevronDown className={`w-4 h-4 transition-transform ${expanded.mlp ? 'rotate-180' : ''}`} />
                </button>
                {expanded.mlp && (
                  <div className="mt-3 space-y-4 border-t border-gray-100 pt-3">
                    {/* [FIX — campaign grouping] Same pattern as Growth below. */}
                    {groupByCampaign(productFeedbacks).map((group) => (
                      <div key={group.campaignId}>
                        <div className="flex items-baseline gap-2 mb-2">
                          <p className="text-xs font-semibold text-gray-600">{group.campaignName}</p>
                          {group.campaignDate && (
                            <p className="text-xs text-gray-400">
                              started {new Date(group.campaignDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </p>
                          )}
                        </div>
                        <div className="space-y-3">
                    {group.items.map((fb) => {
                      const hasRatings = fb.features_rating != null || fb.look_feel_rating != null || fb.ux_rating != null;
                      return (
                        <div key={fb.id} className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-pink-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <MessageSquare className="w-4 h-4 text-pink-500" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              {/* [FIX 020826] External invitees (arrived via a token invite
                                  link, no platform account) legitimately have no
                                  created_by_id — that's expected, not a bug. Previously
                                  FounderNameButton rendered nothing at all in that case,
                                  making their feedback disappear from view entirely. Now
                                  falls back to plain text (name/email, no profile link),
                                  matching the same pattern already used for Beta sign-ups. */}
                              {fb.created_by_id ? (
                                <FounderHoverCard
                                  founderId={fb.created_by_id}
                                  name={getDisplayName(founderProfiles[fb.created_by_id], fb.created_by)}
                                  profile={founderProfiles[fb.created_by_id]}
                                />
                              ) : fb.created_by ? (
                                <p className="text-xs text-gray-500">{fb.created_by}</p>
                              ) : null}
                              <span className="text-xs text-gray-400">
                                {new Date(fb.created_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            {hasRatings ? (
                              <div className="flex flex-wrap gap-4">
                                {fb.features_rating != null && <span className="text-sm"><span className="text-gray-400">Features:</span> <span className="font-semibold text-indigo-600">{fb.features_rating}/10</span></span>}
                                {fb.look_feel_rating != null && <span className="text-sm"><span className="text-gray-400">Look &amp; Feel:</span> <span className="font-semibold text-indigo-600">{fb.look_feel_rating}/10</span></span>}
                                {fb.ux_rating != null && <span className="text-sm"><span className="text-gray-400">UX:</span> <span className="font-semibold text-indigo-600">{fb.ux_rating}/10</span></span>}
                              </div>
                            ) : (
                              <span className="inline-block text-[10px] uppercase tracking-wide text-gray-400 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5">
                                Legacy feedback — no ratings
                              </span>
                            )}
                            {fb.feedback_text && <p className="text-gray-700 mt-1">{fb.feedback_text}</p>}
                          </div>
                        </div>
                      );
                    })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ===================== GROWTH ===================== */}
        {/* [GROWTH — redesign] Default view is now the AGGREGATED picture
            across every brief ("All Briefs"), not a single brief — explicit
            decision so the founder sees the cumulative signal first, with
            the option to drill into one brief. "Campaign" stays the
            underlying data/query concept (no DB rename); everything the
            founder sees here says "Brief" instead. */}
        {reachedGrowth && (() => {
          // Build the list of briefs actually present in growth feedback,
          // newest first, plus whether any "direct" (no brief) responses exist.
          const growthCampaignOptions = (() => {
            const ids = new Set(growthFeedbacks.map(fb => fb.campaign_id).filter(Boolean));
            return Array.from(ids)
              .map(id => ({ id, tagline: campaignsById[id]?.tagline || 'Untitled brief', date: campaignsById[id]?.created_date }))
              .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
          })();
          const growthHasDirect = growthFeedbacks.some(fb => !fb.campaign_id);
          // [GROWTH — default changed to All Briefs] Was: default to
          // whichever brief contains the single most recent feedback row.
          // Now: default is always the aggregated view across every brief;
          // a specific brief is only shown once the founder picks one.
          const defaultGrowthCampaignId = growthFeedbacks.length === 0 ? null : '__all__';
          const effectiveGrowthCampaignId = growthSelectedCampaign ?? defaultGrowthCampaignId;
          const growthViewAll = effectiveGrowthCampaignId === '__all__';
          const growthFilteredFeedbacks = growthViewAll
            ? growthFeedbacks
            : growthFeedbacks.filter(fb => (fb.campaign_id || '__direct__') === effectiveGrowthCampaignId);

          const growthStats = computeGrowthAverages(growthFilteredFeedbacks);

          const qualQuestions = [
            { key: 'business_model_note', label: "What doesn't feel right about the business model?", icon: DollarSign },
            { key: 'core_features_note', label: "Features people would add", icon: Layers },
            { key: 'value_prop_note', label: "What would you change about the slogan?", icon: Megaphone },
            { key: 'product_definition_note', label: "What feels unclear or inaccurate about the description?", icon: Target },
            { key: 'product_match_diff_text', label: "What was different from what you expected?", icon: Home },
            ...(venture.growth_data?.custom_question
              ? [{ key: 'custom_question_answer', label: venture.growth_data.custom_question, icon: HelpCircle }]
              : []),
            { key: 'final_change_text', label: "What's the one thing you'd improve about this product?", icon: ClipboardList },
          ];
          const questionsWithAnswers = qualQuestions
            .map(q => ({ ...q, answers: growthFilteredFeedbacks.filter(fb => fb[q.key] && fb[q.key].trim()) }))
            .filter(q => q.answers.length > 0);

          const responseRows = growthViewAll
            ? groupByCampaign(growthFilteredFeedbacks, { untitledLabel: 'Untitled brief', directLabel: 'Direct (no brief)' })
            : null;

          return (
            <div className="mb-10">
              {/* [NEW — per explicit request] Section title for the whole
                  Growth view — sits above everything else (brief selector,
                  scores, chart, raw feedback, AI zone). */}
              <div className="text-center mb-6">
                {/* [FIX — per explicit feedback] "Venture Feedback" at the
                    very top of the page is the biggest title on the page.
                    This and the other section titles below (Feedback
                    Details, AI Insights Analysis) are all one size smaller
                    than that, and match each other. */}
                <span
                  className="text-xl font-extrabold"
                  style={{ background: 'linear-gradient(90deg, #6366F1, #A855F7, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                >
                  INSIGHT DASHBOARD
                </span>
              </div>

              {/* Brief selector — "All Briefs" is the default (aggregated
                  across every brief); picking a specific brief pill filters
                  down to just that one. */}
              {(growthCampaignOptions.length > 0 || growthHasDirect) && (
                <div className="mb-4">
                  <div className="flex items-center justify-center flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={() => setGrowthSelectedCampaign('__all__')}
                      className={`text-sm font-bold px-5 py-2.5 rounded-full ${
                        effectiveGrowthCampaignId === '__all__' ? 'text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200'
                      }`}
                      style={effectiveGrowthCampaignId === '__all__' ? { background: 'linear-gradient(135deg, #6366f1, #9333ea)' } : undefined}
                    >
                      All Briefs{growthFeedbacks.length > 0 && ` · ${growthFeedbacks.length} responses`}
                    </button>
                    {/* [NEW — per explicit request] The full pill list is
                        collapsed by default — this toggles it, and its own
                        label says whether a specific brief is picked so the
                        button isn't just a bare chevron. */}
                    <button
                      type="button"
                      onClick={() => setShowGrowthBriefList(v => !v)}
                      className="flex items-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-full border border-gray-200 bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    >
                      {effectiveGrowthCampaignId !== '__all__'
                        ? (growthCampaignOptions.find(c => c.id === effectiveGrowthCampaignId)?.tagline || 'Direct (no brief)')
                        : 'Browse briefs'}
                      <ChevronDown className="w-4 h-4 transition-transform" style={{ transform: showGrowthBriefList ? 'rotate(180deg)' : 'none' }} />
                    </button>
                  </div>

                  {showGrowthBriefList && (
                    <div className="flex items-center justify-center flex-wrap gap-2.5 mt-2.5">
                      {growthCampaignOptions.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => { setGrowthSelectedCampaign(c.id); setShowGrowthBriefList(false); }}
                          className={`text-sm font-medium px-5 py-2.5 rounded-full border ${
                            effectiveGrowthCampaignId === c.id
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : 'bg-white text-gray-500 border-gray-200'
                          }`}
                        >
                          {c.tagline}{c.date && ` · ${new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                        </button>
                      ))}
                      {growthHasDirect && (
                        <button
                          type="button"
                          onClick={() => { setGrowthSelectedCampaign('__direct__'); setShowGrowthBriefList(false); }}
                          className={`text-sm font-medium px-5 py-2.5 rounded-full border ${
                            effectiveGrowthCampaignId === '__direct__'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : 'bg-white text-gray-500 border-gray-200'
                          }`}
                        >
                          Direct (no brief)
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Stats — approved design: colorful gradient frame wrapping
                  4 individually-colored scale cards (red→yellow→green),
                  replacing the old shared-background ring layout. */}
              {growthStats && (() => {
                // [FIX — per explicit feedback] The badge now reads the
                // satisfaction level straight off each category's own
                // average (satisfactionLevel, code-only) — always available,
                // no dependency on ever having run an AI analysis, and no
                // longer tied to the "All Briefs" view since it just
                // describes that number, not an AI finding about the whole.
                return (
                <div className="rounded-[28px] p-[2px] mb-3" style={{ background: 'linear-gradient(120deg, #818cf8, #c084fc, #f0abfc)' }}>
                  <div className="rounded-[26px] bg-white p-6 sm:p-8">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
                      <GrowthScaleCard title="Business Model" count={growthStats.businessModel.count} value={growthStats.businessModel.value} accent="#0F6E56" bg="#ECFDF5" signal={growthStats.businessModel.signal} />
                      <GrowthScaleCard title="Core Features" count={growthStats.coreFeatures.count} value={growthStats.coreFeatures.value} accent="#0369A1" bg="#EFF6FF" signal={growthStats.coreFeatures.signal} />
                      <GrowthScaleCard title="Slogan" count={growthStats.valueProp.count} value={growthStats.valueProp.value} accent="#B45309" bg="#FFFBEB" signal={growthStats.valueProp.signal} />
                      <GrowthScaleCard title="Product Definition" count={growthStats.productDefinition.count} value={growthStats.productDefinition.value} accent="#BE123C" bg="#FFF1F2" signal={growthStats.productDefinition.signal} />
                    </div>
                    <p className="text-[11px] text-gray-400 text-left mt-3">* number of responses this average is based on</p>
                  </div>
                </div>
                );
              })()}

              {/* [NEW — Growth AI visual layer] "Overall Product
                  Satisfaction" — a single trend across every brief this
                  venture has run, computed purely from growth_feedback
                  (average of the 4 categories per brief). No AI involved
                  and no dependency on ever having clicked "Analyze" — the
                  data exists as soon as there are 2+ briefs with ratings. */}
              {(() => {
                const BRIEF_COLORS = ['#6366F1', '#EC4899', '#F59E0B', '#10B981', '#0EA5E9', '#8B5CF6', '#EF4444', '#14B8A6'];
                const history = growthCampaignOptions
                  .slice()
                  .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0))
                  .map((c, i) => {
                    const items = growthFeedbacks.filter(fb => fb.campaign_id === c.id);
                    const stats = computeGrowthAverages(items);
                    if (!stats) return null;
                    const vals = [stats.businessModel.value, stats.coreFeatures.value, stats.valueProp.value, stats.productDefinition.value]
                      .filter(v => v != null)
                      .map(Number);
                    if (vals.length === 0) return null;
                    const overall = vals.reduce((a, b) => a + b, 0) / vals.length;
                    return { id: c.id, tagline: c.tagline, date: c.date, overall, color: BRIEF_COLORS[i % BRIEF_COLORS.length] };
                  })
                  .filter(Boolean);

                if (history.length < 2) return null;

                const first = history[0].overall;
                const last = history[history.length - 1].overall;
                const diff = last - first;

                return (
                  // [FIX — per explicit feedback] Matches the same purple
                  // gradient frame used around the 4 score cards above, so
                  // the two sections read as one visual family.
                  <div className="rounded-[24px] p-[2px] mb-3" style={{ background: 'linear-gradient(120deg, #818cf8, #c084fc, #f0abfc)' }}>
                  <div className="rounded-[22px] bg-white p-6">
                    <div className="flex items-baseline justify-between flex-wrap gap-2 mb-2">
                      <span
                        className="text-base font-extrabold"
                        style={{ background: 'linear-gradient(90deg, #6366F1, #EC4899, #F59E0B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                      >
                        Overall Product Satisfaction
                      </span>
                      <span className="flex items-baseline gap-2">
                        <span className="text-2xl font-extrabold text-gray-900">{last.toFixed(1)}</span>
                        <span className="text-xs text-gray-400">/ 10</span>
                        {Math.abs(diff) >= 0.1 && (
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={diff > 0 ? { color: '#16A34A', background: '#DCFCE7' } : { color: '#DC2626', background: '#FEE2E2' }}
                          >
                            {diff > 0 ? '▲' : '▼'} {Math.abs(diff).toFixed(1)} since first brief
                          </span>
                        )}
                      </span>
                    </div>
                    {/* [FIX — per explicit feedback] The line chart read as
                        thin and characterless on any screen, and its legend
                        ate space with long name+number tags. Switched to a
                        plain CSS bar chart — no SVG scaling to fight at all,
                        each bar sized by pure percentage height so it never
                        crops or shrinks unreadably on mobile, and it reads
                        as "real data" rather than a faint line. */}
                    <div className="flex items-end gap-1.5 sm:gap-3" style={{ height: 130 }}>
                      {history.map((h, i) => {
                        const isLast = i === history.length - 1;
                        const heightPct = Math.max(6, (h.overall / 10) * 100);
                        return (
                          <div key={h.id} className="flex-1 h-full flex flex-col items-center justify-end min-w-0">
                            <span className="text-[11px] sm:text-xs font-extrabold mb-1" style={{ color: h.color }}>
                              {h.overall.toFixed(1)}
                            </span>
                            <div
                              className="w-full rounded-t-lg"
                              style={{
                                height: `${heightPct}%`,
                                background: h.color,
                                boxShadow: isLast ? `0 0 0 2px white, 0 0 0 4px ${h.color}` : 'none',
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-start gap-1.5 sm:gap-3 mt-2">
                      {history.map((h) => (
                        <div
                          key={h.id}
                          title={h.tagline}
                          className="flex-1 min-w-0 text-center text-[10px] sm:text-xs font-semibold truncate"
                          style={{ color: h.color }}
                        >
                          {h.tagline}
                        </div>
                      ))}
                    </div>
                  </div>
                  </div>
                );
              })()}

              {/* [NEW — per explicit request] Everything below is raw
                  feedback data (no AI) — a colorful section title, and one
                  master toggle that opens/closes the whole area. Each
                  question inside still has its own drill-down, unchanged. */}
              {/* [FIX — per explicit feedback] Same size as "INSIGHT
                  DASHBOARD"/"AI Insights Analysis" (one size below "Venture
                  Feedback"), and more breathing room above/below — was
                  sitting right on top of the pills/button around it. */}
              <div className="text-center mb-5 mt-8">
                <span
                  className="text-xl font-extrabold"
                  style={{ background: 'linear-gradient(90deg, #0EA5E9, #6366F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                >
                  Feedback Details
                </span>
              </div>
              {/* [FIX — per explicit feedback] Label colored to match the
                  "Feedback Details" heading above it (blue), instead of
                  plain gray. */}
              <div className="flex justify-center mb-4">
                <button
                  type="button"
                  onClick={() => setShowGrowthFeedbackDetails(v => !v)}
                  className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full border bg-white hover:bg-sky-50"
                  style={{ color: '#0369A1', borderColor: '#BAE6FD' }}
                >
                  {showGrowthFeedbackDetails ? 'Hide feedback details' : 'Show feedback details'}
                  <ChevronDown className="w-4 h-4 transition-transform" style={{ transform: showGrowthFeedbackDetails ? 'rotate(180deg)' : 'none' }} />
                </button>
              </div>

              {showGrowthFeedbackDetails && (
              <div>
              {/* [NEW — Product Experience] The one piece of data collected
                  on the public form that had NO summary category anywhere —
                  "did you visit the product?" and the follow-up choice were
                  only visible buried inside each individual response. This
                  is the third data "shape" on this page (not a number like
                  the gauges, not free text like the question cards — a set
                  of categorical choices), so it gets its own summary style:
                  counts per choice, not an average and not a text list. */}
              {(() => {
                const withVisit = growthFilteredFeedbacks.filter(fb => fb.visited_product);
                if (withVisit.length === 0) return null;
                const yesCount = withVisit.filter(fb => fb.visited_product === 'yes').length;
                const noCount = withVisit.filter(fb => fb.visited_product === 'no').length;
                const choiceCounts = { signed_up: 0, not_focus: 0, not_attractive: 0 };
                withVisit.forEach(fb => { if (fb.product_match_choice && choiceCounts[fb.product_match_choice] != null) choiceCounts[fb.product_match_choice]++; });
                const choiceLabels = { signed_up: 'Signed up', not_focus: 'Interesting, not their focus', not_attractive: 'Not attractive enough yet' };
                return (
                  <div className="mb-3">
                    <button
                      type="button"
                      onClick={() => toggleGrowthQ('__product_experience__')}
                      className="w-full text-left rounded-xl px-5 py-6 flex items-center justify-between gap-3 min-h-[92px]"
                      style={{ background: '#CFFAFE' }}
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <Home className="w-5 h-5 text-cyan-700 flex-shrink-0" />
                        <span className="text-base font-medium text-gray-800">
                          Product Experience <span className="font-normal text-gray-500">({withVisit.length})</span>
                        </span>
                      </span>
                      <ChevronDown className="w-4 h-4 text-cyan-700 flex-shrink-0 transition-transform" style={{ transform: expandedGrowthQ['__product_experience__'] ? 'rotate(180deg)' : 'none' }} />
                    </button>
                    {expandedGrowthQ['__product_experience__'] && (
                      <div className="mt-2 px-4 py-3 rounded-lg bg-cyan-50/60 text-sm text-gray-700 space-y-1">
                        <p><span className="font-semibold text-cyan-800">{yesCount}</span> visited the actual product, <span className="font-semibold text-cyan-800">{noCount}</span> did not.</p>
                        {Object.entries(choiceCounts).filter(([, c]) => c > 0).map(([key, count]) => (
                          <p key={key}>· <span className="font-semibold text-cyan-800">{count}</span> {choiceLabels[key]}</p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* [FIX] Each question is its own category with its own
                  distinct background color (cycling through a palette) —
                  left-aligned title with a subtle (non-colorful) icon,
                  count next to the title. Was: all questions sharing one
                  purple background, centered text. */}
              {questionsWithAnswers.map((q, qIndex) => {
                const QUESTION_BG_COLORS = ['#EEEDFE', '#FCE7F3', '#FEF3C7', '#DBEAFE', '#D1FAE5', '#FFE4E6', '#E0E7FF'];
                const bg = QUESTION_BG_COLORS[qIndex % QUESTION_BG_COLORS.length];
                const QIcon = q.icon || MessageSquare;
                return (
                <div key={q.key} className="mb-3">
                  {/* [FIX] Larger vertical padding + bigger title, so this
                      card's height roughly matches the stats card's height
                      (which we also shrank slightly) — was noticeably
                      shorter/thinner before, looked inconsistent. */}
                  <button
                    type="button"
                    onClick={() => toggleGrowthQ(q.key)}
                    className="w-full text-left rounded-xl px-5 py-6 flex items-center justify-between gap-3 min-h-[92px]"
                    style={{ background: bg }}
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <QIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      <span className="text-base font-medium text-gray-800">
                        {q.label}
                        <span className="font-normal text-gray-500"> ({q.answers.length})</span>
                      </span>
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 transition-transform" style={{ transform: expandedGrowthQ[q.key] ? 'rotate(180deg)' : 'none' }} />
                  </button>
                  {expandedGrowthQ[q.key] && (
                    <div className="mt-2 space-y-2 px-2">
                      {q.answers.map((fb) => (
                        <div key={fb.id} className="border-l-2 border-gray-200 pl-3">
                          <div className="flex items-center justify-between mb-0.5">
                            {fb.created_by_id ? (
                              <FounderHoverCard
                                founderId={fb.created_by_id}
                                name={getDisplayName(founderProfiles[fb.created_by_id], fb.created_by)}
                                profile={founderProfiles[fb.created_by_id]}
                              />
                            ) : fb.created_by ? (
                              <p className="text-xs text-gray-500">{fb.created_by}</p>
                            ) : <span />}
                            <span className="text-xs text-gray-400">
                              {new Date(fb.created_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{fb[q.key]}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                );
              })}

              {/* [FIX] Now behaves like the question cards: collapsed by
                  default, shows only a count, click to expand. Was always
                  showing everything immediately. Same height/padding
                  treatment for visual consistency. */}
              {/* [NEW — testimonials] Distinct from the qualitative
                  question cards above: this one is actionable (the founder
                  can feature/unfeature), not just readable, so it gets its
                  own dedicated card rather than being folded into the
                  generic Q&A list. */}
              {(() => {
                const withTestimonials = growthFilteredFeedbacks.filter(fb => fb.testimonial_text && fb.testimonial_text.trim());
                if (withTestimonials.length === 0) return null;
                return (
                  <div className="mb-3">
                    <button
                      type="button"
                      onClick={() => toggleGrowthQ('__testimonials__')}
                      className="w-full text-left rounded-xl px-5 py-6 flex items-center justify-between gap-3 min-h-[92px]"
                      style={{ background: '#FFF7ED' }}
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <Star className="w-5 h-5 flex-shrink-0" style={{ color: '#C2620A' }} />
                        <span className="text-base font-medium text-gray-800">
                          Testimonials <span className="font-normal text-gray-500">({withTestimonials.length})</span>
                        </span>
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 transition-transform" style={{ transform: expandedGrowthQ['__testimonials__'] ? 'rotate(180deg)' : 'none' }} />
                    </button>
                    {expandedGrowthQ['__testimonials__'] && (
                      <div className="mt-2 space-y-2 px-2">
                        {withTestimonials.map((fb) => (
                          <div key={fb.id} className="border-l-2 border-orange-200 pl-3 py-1">
                            <div className="flex items-center justify-between mb-0.5">
                              <p className="text-xs font-medium text-gray-700">{fb.testimonial_author_name || 'Anonymous'}</p>
                              <span className="text-xs text-gray-400">
                                {new Date(fb.created_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 italic mb-2">"{fb.testimonial_text}"</p>
                            <button
                              type="button"
                              onClick={() => toggleTestimonialFeatured(fb.id, fb.is_featured_testimonial)}
                              className={`text-xs font-medium px-3 py-1 rounded-full border ${
                                fb.is_featured_testimonial
                                  ? 'bg-orange-100 text-orange-800 border-orange-300'
                                  : 'bg-white text-gray-500 border-gray-200'
                              }`}
                            >
                              {fb.is_featured_testimonial ? '★ Featured on your page' : 'Feature on your page'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {growthFilteredFeedbacks.length > 0 && (
                <div>
                  <button
                    type="button"
                    onClick={() => toggleGrowthQ('__individual__')}
                    className="w-full text-left rounded-xl px-5 py-6 flex items-center justify-between gap-3 min-h-[92px]"
                    style={{ background: '#FAECE7' }}
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <Users className="w-5 h-5 flex-shrink-0" style={{ color: '#9A5B3A' }} />
                      <span className="text-base font-medium" style={{ color: '#4A1B0C' }}>
                        Individual responses <span className="font-normal">({growthFilteredFeedbacks.length})</span>
                      </span>
                    </span>
                    <ChevronDown className="w-4 h-4 flex-shrink-0 transition-transform" style={{ color: '#9A5B3A', transform: expandedGrowthQ['__individual__'] ? 'rotate(180deg)' : 'none' }} />
                  </button>
                  {expandedGrowthQ['__individual__'] && (
                  <div className="rounded-xl p-4 mt-2" style={{ background: '#FAECE7' }}>
                  <div className="space-y-3">
                    {(growthViewAll ? responseRows : [{ campaignId: 'single', campaignName: null, campaignDate: null, items: growthFilteredFeedbacks }]).map((group) => (
                      <div key={group.campaignId}>
                        {growthViewAll && (
                          <div className="flex items-baseline gap-2 mb-2">
                            <p className="text-xs font-semibold text-gray-600">{group.campaignName}</p>
                            {group.campaignDate && (
                              <p className="text-xs text-gray-400">
                                started {new Date(group.campaignDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </p>
                            )}
                          </div>
                        )}
                        <div className="space-y-2">
                          {group.items.map((fb) => (
                            <div key={fb.id} className="flex items-start gap-3 bg-white rounded-lg p-3">
                              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <TrendingUp className="w-4 h-4 text-orange-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  {fb.created_by_id ? (
                                    <FounderHoverCard
                                      founderId={fb.created_by_id}
                                      name={getDisplayName(founderProfiles[fb.created_by_id], fb.created_by)}
                                      profile={founderProfiles[fb.created_by_id]}
                                    />
                                  ) : fb.created_by ? (
                                    <p className="text-xs text-gray-500">{fb.created_by}</p>
                                  ) : null}
                                  <span className="text-xs text-gray-400">
                                    {new Date(fb.created_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-3 text-sm">
                                  {fb.business_model_rating != null && <span><span className="text-gray-400">Business Model:</span> <span className="font-semibold text-emerald-700">{fb.business_model_rating}/10</span></span>}
                                  {fb.core_features_rating != null && <span><span className="text-gray-400">Core Features:</span> <span className="font-semibold text-sky-700">{fb.core_features_rating}/10</span></span>}
                                  {fb.value_prop_rating != null && <span><span className="text-gray-400">Slogan:</span> <span className="font-semibold text-amber-700">{fb.value_prop_rating}/10</span></span>}
                                  {fb.product_definition_rating != null && <span><span className="text-gray-400">Product Definition:</span> <span className="font-semibold text-rose-700">{fb.product_definition_rating}/10</span></span>}
                                </div>
                                {fb.visited_product && (
                                  <p className="text-gray-600 mt-1 text-sm">
                                    Visited actual product: {fb.visited_product === 'yes' ? 'Yes' : 'No'}
                                    {/* [FIX] Was product_match_rating (old 1-10 slider, no longer
                                        written). Now shows the categorical choice instead. */}
                                    {fb.product_match_choice && <> — <span className="font-semibold text-emerald-700">
                                      {{ signed_up: 'Signed up', not_focus: 'Interesting, not their focus', not_attractive: 'Not attractive enough yet' }[fb.product_match_choice] || fb.product_match_choice}
                                    </span></>}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  </div>
                  )}
                </div>
              )}
              </div>
              )}

              {/* [NEW — per explicit request] AI zone, fully separate from
                  the raw feedback above — only what the AI generated lives
                  here. */}
              <div className="text-center mb-1 mt-8">
                <span
                  className="text-xl font-extrabold"
                  style={{ background: 'linear-gradient(90deg, #6366F1, #A855F7, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                >
                  AI Insights Analysis
                </span>
                <p className="text-xs text-gray-400 mt-0.5">
                  {growthAnalysisMeta?.analyzedDate
                    ? `Last analysis: ${new Date(growthAnalysisMeta.analyzedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`
                    : 'No analysis yet'}
                </p>
              </div>

              <div className="mb-6 mt-4">
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAnalyzeGrowthClick}
                    disabled={isAnalyzingGrowth || growthFeedbacks.length === 0}
                    className="group relative flex items-center gap-2 rounded-full px-7 py-3 sm:px-8 sm:py-3.5 text-sm sm:text-base font-bold text-white shadow-lg shadow-indigo-500/30 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                    style={{ background: 'linear-gradient(120deg, #6366F1, #A855F7, #EC4899)', backgroundSize: '160% 160%' }}
                  >
                    {isAnalyzingGrowth ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Sparkles className="w-5 h-5 transition-transform group-hover:rotate-12" />
                    )}
                    {isAnalyzingGrowth ? 'Thinking...' : 'AI Insight'}
                  </button>
                  {/* [NEW — per explicit request] Short line explaining what
                      the button does. */}
                  <p className="text-xs text-gray-400 text-center max-w-xs">
                    Runs an AI read of all your feedback — a short summary and a prioritized list of what to change.
                  </p>
                </div>

                {growthAnalysisError && (
                  <p className="text-sm text-red-600 text-center mt-3">{growthAnalysisError}</p>
                )}

                {showGrowthChangesPrompt && (
                  <div className="mt-4 max-w-lg mx-auto rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                    <p className="text-sm font-semibold text-indigo-900 mb-2">What did you change since the last brief? (optional)</p>
                    <textarea
                      value={growthChangesText}
                      onChange={(e) => setGrowthChangesText(e.target.value)}
                      className="w-full rounded-lg border border-indigo-200 p-2 text-sm"
                      rows={3}
                      placeholder="e.g. lowered the price, rewrote the slogan, added a demo video..."
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <Button type="button" variant="ghost" onClick={() => { setShowGrowthChangesPrompt(false); setGrowthChangesText(''); }}>
                        Cancel
                      </Button>
                      <Button type="button" onClick={submitGrowthChangesAndAnalyze} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        Continue
                      </Button>
                    </div>
                  </div>
                )}

                {growthAiAnalysis && !showGrowthChangesPrompt && (() => {
                  const signalDot = { Strong: '#16a34a', Mixed: '#d97706', Weak: '#dc2626' };
                  const actionRows = growthAiAnalysis.action_plan ? [
                    ...(growthAiAnalysis.action_plan.now || []).map(text => ({ text, priority: 'Now' })),
                    ...(growthAiAnalysis.action_plan.later || []).map(text => ({ text, priority: 'Later' })),
                  ] : [];
                  // [FIX — per explicit feedback] Orange = urgent, green =
                  // less urgent.
                  const priorityStyle = {
                    Now: { color: '#9A3412', background: '#FFEDD5', border: '#FDBA74', dot: '#F97316' },
                    Later: { color: '#166534', background: '#DCFCE7', border: '#86EFAC', dot: '#16A34A' },
                  };
                  return (
                  <div className="max-w-2xl mx-auto mt-5">
                    {/* [NEW — Growth AI visual layer] Executive summary is the
                        only thing shown by default — everything else (full
                        per-dimension analysis, themes, action plan) is one
                        click away, not shown up front. */}
                    <button
                      type="button"
                      onClick={() => setShowGrowthAnalysisDetails(v => !v)}
                      className="w-full text-left rounded-xl border border-indigo-200 bg-indigo-50 p-5 flex items-start justify-between gap-3"
                    >
                      <div>
                        {growthAnalysisMeta?.analyzedDate && (
                          <p className="text-xs text-indigo-400 mb-1">
                            Last analyzed {new Date(growthAnalysisMeta.analyzedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                        )}
                        <p className="text-sm font-semibold text-indigo-900 leading-relaxed">
                          {growthAiAnalysis.executive_summary || 'Analysis ready — click to view full details.'}
                        </p>
                      </div>
                      <ChevronDown className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-1 transition-transform" style={{ transform: showGrowthAnalysisDetails ? 'rotate(180deg)' : 'none' }} />
                    </button>

                    {showGrowthAnalysisDetails && (
                      <div className="border border-gray-200 border-t-0 rounded-b-xl overflow-hidden -mt-1">
                        {/* [NEW — per explicit request] Recommended Actions is
                            its own collapsed tab inside the AI zone now,
                            rather than always shown. */}
                        {actionRows.length > 0 && (
                          <div className="border-b border-gray-100">
                            <button
                              type="button"
                              onClick={() => setShowGrowthRecommendedActions(v => !v)}
                              className="w-full text-left px-5 py-3 flex items-center justify-between gap-3"
                            >
                              <span
                                className="text-sm font-extrabold"
                                style={{ background: 'linear-gradient(90deg, #6366F1, #DB2777)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                              >
                                Recommended Actions
                              </span>
                              <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 transition-transform" style={{ transform: showGrowthRecommendedActions ? 'rotate(180deg)' : 'none' }} />
                            </button>
                            {showGrowthRecommendedActions && (
                              <div className="divide-y divide-gray-100 border-t border-gray-100">
                                {actionRows.map((r, i) => {
                                  const s = priorityStyle[r.priority];
                                  return (
                                    <div key={i} className="flex items-start gap-3 px-5 py-3">
                                      <span
                                        className="flex-shrink-0 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full flex items-center gap-1.5"
                                        style={{ color: s.color, background: s.background, border: `1px solid ${s.border}` }}
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                                        {r.priority}
                                      </span>
                                      <p className="text-sm text-gray-700 leading-relaxed">{r.text}</p>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                        {/* [FIX — per explicit feedback] Themes + the full
                            per-dimension analysis (Patterns/Agreement/etc.)
                            were "too much data, hard to know what to do with
                            it" as a default view — now a second, optional
                            level of disclosure. Renamed per explicit
                            feedback: the short part above is already the
                            analysis summary, so this opens the "full report". */}
                        {/* [FIX — per explicit feedback] Now styled exactly
                            like "Recommended Actions" above it (same size,
                            weight, gradient) instead of small plain gray
                            text. */}
                        <button
                          type="button"
                          onClick={() => setShowGrowthEvidence(v => !v)}
                          className="w-full text-left px-5 py-3 flex items-center justify-between"
                        >
                          <span
                            className="text-sm font-extrabold"
                            style={{ background: 'linear-gradient(90deg, #6366F1, #DB2777)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                          >
                            View full report
                          </span>
                          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 transition-transform" style={{ transform: showGrowthEvidence ? 'rotate(180deg)' : 'none' }} />
                        </button>

                        {showGrowthEvidence && (
                          <div className="border-t border-gray-100">
                            {growthAiAnalysis.themes && growthAiAnalysis.themes.length > 0 && (
                              <div className="p-5 border-b border-gray-100">
                                <p className="text-xs font-semibold uppercase tracking-wide mb-2 text-amber-600">Themes in the feedback</p>
                                <div className="flex flex-wrap gap-2">
                                  {growthAiAnalysis.themes.map((t, i) => (
                                    <span key={i} className="inline-flex items-center gap-1.5 text-xs font-medium bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
                                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: signalDot[t.signal] || '#9ca3af' }} />
                                      {t.theme} · {t.count}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {growthAiAnalysis.analysis && Object.entries(growthAiAnalysis.analysis)
                              .filter(([, text]) => text && String(text).trim())
                              .map(([key, text]) => (
                                <div key={key} className="p-5 border-b border-gray-100 last:border-b-0">
                                  <p className="text-xs font-semibold uppercase tracking-wide mb-2 text-indigo-600">
                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase())}
                                  </p>
                                  <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  );
                })()}
              </div>
            </div>
          );
        })()}

        {/* ===================== BETA ===================== */}
        {reachedBeta && betaTesters.length > 0 && (() => {
          const exportCSV = () => {
            const rows = [
              ['Full Name', 'Email', 'Date', 'Interest Reason'],
              ...betaTesters.map(t => [
                t.full_name || '',
                t.email || '',
                new Date(t.created_date).toLocaleDateString('en-US'),
                t.interest_reason || ''
              ])
            ];
            const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'beta-testers.csv';
            a.click();
            URL.revokeObjectURL(url);
          };

          return (
            <div className="mb-10">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Beta</p>
                <div className="flex items-center gap-2">
                  {userPlan !== 'unicorn' && (
                    <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">Unicorn only</span>
                  )}
                  <Button
                    onClick={exportCSV}
                    size="sm"
                    variant="outline"
                    disabled={userPlan !== 'unicorn'}
                    className={userPlan === 'unicorn' ? "border-purple-300 text-purple-700 hover:bg-purple-50" : "border-gray-200 text-gray-400 cursor-not-allowed opacity-50"}
                    title={userPlan !== 'unicorn' ? 'Available on Unicorn plan only' : ''}
                  >
                    Export CSV
                  </Button>
                </div>
              </div>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <button
                    type="button"
                    onClick={() => toggle('beta')}
                    className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    {betaTesters.length} sign-up{betaTesters.length !== 1 ? 's' : ''}
                    <ChevronDown className={`w-4 h-4 transition-transform ${expanded.beta ? 'rotate-180' : ''}`} />
                  </button>
                  {expanded.beta && (
                    <div className="mt-3 space-y-4 border-t border-gray-100 pt-3">
                      {/* [FIX — campaign grouping] Same pattern as MLP/Growth. */}
                      {groupByCampaign(betaTesters.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))).map((group) => (
                        <div key={group.campaignId}>
                          <div className="flex items-baseline gap-2 mb-2">
                            <p className="text-xs font-semibold text-gray-600">{group.campaignName}</p>
                            {group.campaignDate && (
                              <p className="text-xs text-gray-400">
                                started {new Date(group.campaignDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </p>
                            )}
                          </div>
                          <div className="space-y-3">
                      {group.items.map((tester) => (
                          <div key={tester.id} className="flex items-start gap-3">
                            <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-purple-700">
                              {tester.full_name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                {/* [FIX 020826] Beta sign-ups now carry created_by_id when the
                                    person was logged in at sign-up time (see the companion fix
                                    in beta-testing/page.jsx). Show a profile-linked button in
                                    that case; fall back to plain text for genuinely anonymous
                                    sign-ups (no account to link to). */}
                                {tester.created_by_id ? (
                                  <FounderHoverCard
                                    founderId={tester.created_by_id}
                                    name={tester.full_name}
                                    profile={founderProfiles[tester.created_by_id]}
                                  />
                                ) : (
                                  <p className="font-semibold text-gray-900">{tester.full_name}</p>
                                )}
                                <span className="text-xs text-gray-400">
                                  {new Date(tester.created_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                              {tester.interest_reason && (
                                <p className="text-sm text-gray-600 mt-1 italic">"{tester.interest_reason}"</p>
                              )}
                            </div>
                          </div>
                        ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })()}

        {/* Empty state */}
        {!reachedMVP && !reachedMLP && !reachedBeta && !reachedGrowth && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No feedback yet</h3>
              <p className="text-gray-400">Share your landing page to start collecting feedback from users.</p>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
