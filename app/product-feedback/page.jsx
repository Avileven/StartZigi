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
import { Loader2, BarChart3, MessageSquare, TrendingUp, Lightbulb, Users, Star, MessageCircle, UserCircle2, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// [ADDED 020826] Small pill button showing a founder's name with a profile icon.
// Clicking it opens the shared profile preview panel via onSelect(founderId, name).
function FounderNameButton({ founderId, name, onSelect }) {
  if (!founderId || !name) {
    // No attribution available (e.g. legacy feedback given before the
    // attribution fix, or anonymous visitor) — nothing clickable to show.
    return null;
  }
  return (
    <button
      type="button"
      onClick={() => onSelect(founderId, name)}
      className="inline-flex items-center gap-1.5 border border-gray-200 bg-white rounded-full pl-1.5 pr-2.5 py-1 text-xs text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
    >
      <UserCircle2 className="w-4 h-4" />
      {name}
    </button>
  );
}

// [ADDED 020826] Resolves a display name for a founder-name button:
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

// [ADDED 020826] Inline profile preview panel — first version only.
// Shows what we can already display (username, early adopter). Once Part A's
// reputation groups (Spark/Plan/Demo/Beta, feedback tags, Zig Age, Ideas
// Started) exist in the DB, this panel is where they'll render.
// [ADDED 020826] Maps the venture's raw phase to the Group 1 tag names
// decided in the planning doc (Part A.2): Spark/Plan/Demo/Beta. Demo covers
// both mvp and mlp (the demo keeps evolving through MLP); growth falls back
// to Beta since Group 1 has no tag of its own for it.
function getJourneyTag(rawPhase) {
  const map = {
    idea: 'Spark',
    business_plan: 'Plan',
    mvp: 'Demo',
    mlp: 'Demo',
    beta: 'Beta',
    growth: 'Beta',
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

function ProfilePreviewPanel({ profile, onClose }) {
  if (!profile) return null;
  const initial = (profile.username || profile.email || '?')[0].toUpperCase();
  const journeyTag = getJourneyTag(profile.current_phase);
  const zigAge = getZigAge(profile.joined_date);
  return (
    <Card className="border-2 border-indigo-200 shadow-sm mb-6">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-700">
              {initial}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{profile.username || profile.name || 'Founder'}</p>
              <p className="text-xs text-gray-400">Zig profile preview</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">
            Close
          </button>
        </div>
        {profile.early_adopter && (
          <Badge className="bg-amber-100 text-amber-800 mt-3">Early Adopter</Badge>
        )}
        {/* [ADDED 020826] Groups 1/2/3 (Part A) — first real content in this panel */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400">Stage</p>
            <p className="text-sm font-semibold text-gray-900">{journeyTag || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Feedback given</p>
            <p className="text-sm font-semibold text-gray-900">{profile.feedback_count ?? 0}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Zig age</p>
            <p className="text-sm font-semibold text-gray-900">{zigAge || '—'}</p>
          </div>
        </div>
        {/* [NOTE 020826] Ideas Started intentionally left off this panel for now —
            this count (profile.ideas_count) currently only reflects ventures that
            still exist today, not the true lifetime count from Part B (which
            persists across deleted/replaced ventures via venture_history). Showing
            it now would be misleading once that ships and the number changes
            meaning. Add it once Part B's venture_history/profile counters exist. */}
      </CardContent>
    </Card>
  );
}

export default function ProductFeedbackPage() {
  const [venture, setVenture] = useState(null);
  const [featureFeedback, setFeatureFeedback] = useState([]);
  const [suggestedFeatures, setSuggestedFeatures] = useState([]);
  const [betaTesters, setBetaTesters] = useState([]);
  const [userPlan, setUserPlan] = useState(null);
  const [productFeedbacks, setProductFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [businessPlanData, setBusinessPlanData] = useState(null);

  // [ADDED 020826] username lookup cache + currently-open profile preview
  const [founderProfiles, setFounderProfiles] = useState({}); // { [founderId]: { username, early_adopter } }
  const [openProfileId, setOpenProfileId] = useState(null);

  // [ADDED 020826] expand/collapse state for the detail lists under each summary
  const [expanded, setExpanded] = useState({ mvpDetail: false, sf: false, mlp: false, beta: false });
  const toggle = (key) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

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

          const pfeedback = await ProductFeedbackEntity.filter({ venture_id: currentVenture.id }, '-created_date');
          console.log('[FeedbackHub] MLP product feedbacks:', pfeedback.length);
          setProductFeedbacks(pfeedback);

          const bp = await businessPlan.filter({ venture_id: currentVenture.id });
          if (bp.length > 0) setBusinessPlanData(bp[0]);

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
                  featureAnalytics[feature.id] = {
                    name: feature.featureName,
                    avgRating: avgRating.toFixed(1),
                    totalResponses: total,
                    responses: feedbackForFeature, // [ADDED 020826] keep individual rows for the detail list
                    breakdown: {
                      neverUse: ratings.filter(r => r >= 0 && r <= 2).length,
                      confusing: ratings.filter(r => r >= 3 && r <= 4).length,
                      niceToHave: ratings.filter(r => r >= 5 && r <= 7).length,
                      essential: ratings.filter(r => r >= 8 && r <= 10).length,
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
      const featureSummary = Object.entries(analytics).map(([, data]) =>
        'Feature: "' + data.name + '" - Avg: ' + data.avgRating + '/10 (' + data.totalResponses + ' responses). Never use: ' + data.breakdown.neverUse + ', Confusing: ' + data.breakdown.confusing + ', Nice to have: ' + data.breakdown.niceToHave + ', Essential: ' + data.breakdown.essential + '.'
      ).join('\n');
      const mlpSummary = productFeedbacks.map(fb => '- "' + fb.feedback_text + '"').join('\n');
      const suggestedSummary = suggestedFeatures.map(s => '- ' + s.feature_name).join('\n');
      const bpContext = businessPlanData
        ? 'Mission: ' + (businessPlanData.mission || 'N/A') + '\nProblem: ' + (businessPlanData.problem || 'N/A') + '\nSolution: ' + (businessPlanData.solution || 'N/A') + '\nTarget customers: ' + (businessPlanData.target_customers || 'N/A')
        : 'No business plan data available.';

      const prompt = 'You are a sharp product strategist. Analyze this startup feedback data and respond in exactly 3 short sections. Each section: 1 header line in caps followed by max 2-3 bullet points, one sentence each. No fluff, no explanations.\n\n'
        + 'Startup: "' + (venture?.name || '') + '"\n\n'
        + 'BUSINESS CONTEXT:\n' + bpContext + '\n\n'
        + 'MVP FEATURE RATINGS:\n' + (featureSummary || 'No feature ratings yet.') + '\n\n'
        + 'MLP USER FEEDBACK:\n' + (mlpSummary || 'No MLP feedback yet.') + '\n\n'
        + 'SUGGESTED FEATURES FROM USERS:\n' + (suggestedSummary || 'No suggestions yet.') + '\n\n'
        + 'Respond with EXACTLY this structure, nothing else:\n\n'
        + "WHAT'S WORKING:\n"
        + '- [one sentence]\n'
        + '- [one sentence]\n\n'
        + 'WHAT NEEDS ATTENTION:\n'
        + '- [one sentence]\n'
        + '- [one sentence]\n\n'
        + 'RECOMMENDED NEW FEATURES:\n'
        + '1. [feature name] — [one sentence reason, referencing business plan or user suggestions]\n'
        + '2. [feature name] — [one sentence reason]\n'
        + '3. [feature name] — [one sentence reason]\n\n'
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

  const getCategoryFromRating = (avgRating) => {
    const rating = parseFloat(avgRating);
    if (rating >= 8) return { label: 'Essential', color: 'bg-green-100 text-green-800', dot: 'bg-green-500' };
    if (rating >= 5) return { label: 'Nice To Have', color: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500' };
    if (rating >= 3) return { label: 'Confusing', color: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' };
    return { label: 'Never use', color: 'bg-red-100 text-red-800', dot: 'bg-red-500' };
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
  const reachedBeta = venture.phase === 'beta' || venture.phase === 'growth' || betaTesters.length > 0;

  const openProfile = (founderId) => setOpenProfileId(founderId);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Venture Feedback Hub</h1>
          <p className="text-gray-500 text-lg">All feedback collected across your startup journey</p>
        </div>

        {/* AI Analysis */}
        <div className="mb-10">
          <p className="text-sm text-gray-500 text-center mb-3">Strategic insights based on all your feedback data</p>
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-200 px-8 py-3 text-base"
            >
              {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
              {isAnalyzing ? 'Analyzing...' : 'Mentor'}
            </Button>
          </div>
          {aiAnalysis && (
            <Card className="border-0 shadow-sm mt-5">
              <CardContent className="p-5">
                {aiAnalysis.split('\n').map((line, i) => {
                  const trimmed = line.trim();
                  if (!trimmed) return null;
                  const isHeader = /^[A-Z][A-Z\s']+:/.test(trimmed);
                  return isHeader
                    ? <h4 key={i} className="font-bold text-indigo-800 mt-4 mb-1 text-sm">{trimmed}</h4>
                    : <p key={i} className="text-gray-700 leading-relaxed text-sm mb-1">{trimmed}</p>;
                })}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stats */}
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

        {/* ===================== MVP ===================== */}
        {reachedMVP && (
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">MVP</p>

            {Object.keys(analytics).length > 0 && (
              <div className="space-y-4 mb-4">
                {Object.entries(analytics).map(([featureId, data]) => {
                  const category = getCategoryFromRating(data.avgRating);
                  const total = data.totalResponses;
                  const pNever = Math.round((data.breakdown.neverUse / total) * 100);
                  const pConfusing = Math.round((data.breakdown.confusing / total) * 100);
                  const pNice = Math.round((data.breakdown.niceToHave / total) * 100);
                  const pEssential = Math.round((data.breakdown.essential / total) * 100);
                  const detailKey = 'mvpDetail_' + featureId;

                  return (
                    <Card key={featureId} className="border-0 shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${category.dot}`} />
                            <h3 className="font-semibold text-gray-900 text-lg">{data.name}</h3>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              <span className="font-bold text-gray-900 text-lg">{data.avgRating}</span>
                              <span className="text-gray-400 text-sm">/10</span>
                            </div>
                            <Badge className={category.color}>{category.label}</Badge>
                          </div>
                        </div>

                        <div className="h-3 rounded-full overflow-hidden flex mb-3">
                          {pNever > 0 && <div className="bg-red-400 h-full transition-all" style={{ width: `${pNever}%` }} title={`Never use: ${pNever}%`} />}
                          {pConfusing > 0 && <div className="bg-yellow-400 h-full transition-all" style={{ width: `${pConfusing}%` }} title={`Confusing: ${pConfusing}%`} />}
                          {pNice > 0 && <div className="bg-blue-400 h-full transition-all" style={{ width: `${pNice}%` }} title={`Nice to have: ${pNice}%`} />}
                          {pEssential > 0 && <div className="bg-green-400 h-full transition-all" style={{ width: `${pEssential}%` }} title={`Essential: ${pEssential}%`} />}
                        </div>

                        <div className="flex gap-4 text-xs text-gray-500 mb-3">
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Never use {pNever}%</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />Confusing {pConfusing}%</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />Nice to have {pNice}%</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" />Essential {pEssential}%</span>
                          <span className="ml-auto">{total} response{total !== 1 ? 's' : ''}</span>
                        </div>

                        {/* [ADDED 020826] Individual responses, collapsed by default */}
                        <button
                          type="button"
                          onClick={() => toggle(detailKey)}
                          className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                        >
                          {expanded[detailKey] ? 'Hide' : 'See'} individual responses
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded[detailKey] ? 'rotate-180' : ''}`} />
                        </button>
                        {expanded[detailKey] && (
                          <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                            {data.responses.map((r) => (
                              <React.Fragment key={r.id}>
                                <div className="flex items-center justify-between">
                                  <FounderNameButton
                                    founderId={r.created_by_id}
                                    name={getDisplayName(founderProfiles[r.created_by_id], r.user_email)}
                                    onSelect={openProfile}
                                  />
                                  <span className="text-sm font-semibold text-gray-700">{r.rating}/10</span>
                                </div>
                                {/* [FIX 020826] Was a single shared panel rendered at a fixed
                                    spot at the top of the page — jumped far away from whatever
                                    row you actually clicked. Now shown inline, right under the
                                    specific row, wherever that is in the page. */}
                                {openProfileId === r.created_by_id && (
                                  <ProfilePreviewPanel profile={founderProfiles[r.created_by_id]} onClose={() => setOpenProfileId(null)} />
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {suggestedFeatures.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    <h3 className="font-semibold text-gray-900">Suggested features</h3>
                    <Badge className="bg-yellow-100 text-yellow-800">{suggestedFeatures.length}</Badge>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {suggestedFeatures.map((suggestion) => (
                      <div key={suggestion.id} className="border border-gray-100 rounded-xl p-3">
                        <p className="font-medium text-gray-900 mb-1.5">{suggestion.feature_name}</p>
                        {/* [FIX 020826] Was showing raw email — now a clickable
                            founder-name button instead. Falls back to nothing
                            (not the email) if attribution is missing. */}
                        <FounderNameButton
                          founderId={suggestion.created_by_id}
                          name={getDisplayName(founderProfiles[suggestion.created_by_id], suggestion.user_email)}
                          onSelect={openProfile}
                        />
                        {openProfileId === suggestion.created_by_id && (
                          <div className="mt-2">
                            <ProfilePreviewPanel profile={founderProfiles[suggestion.created_by_id]} onClose={() => setOpenProfileId(null)} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
                  <div className="mt-3 space-y-3 border-t border-gray-100 pt-3">
                    {productFeedbacks.map((fb) => {
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
                                <FounderNameButton
                                  founderId={fb.created_by_id}
                                  name={getDisplayName(founderProfiles[fb.created_by_id], fb.created_by)}
                                  onSelect={openProfile}
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
                            {openProfileId === fb.created_by_id && (
                              <ProfilePreviewPanel profile={founderProfiles[fb.created_by_id]} onClose={() => setOpenProfileId(null)} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

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
                    <div className="mt-3 space-y-3 border-t border-gray-100 pt-3">
                      {betaTesters
                        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
                        .map((tester) => (
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
                                  <FounderNameButton
                                    founderId={tester.created_by_id}
                                    name={tester.full_name}
                                    onSelect={openProfile}
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
                              {openProfileId === tester.created_by_id && (
                                <ProfilePreviewPanel profile={founderProfiles[tester.created_by_id]} onClose={() => setOpenProfileId(null)} />
                              )}
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
        {!reachedMVP && !reachedMLP && !reachedBeta && (
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
