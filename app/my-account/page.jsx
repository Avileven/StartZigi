// 100826
"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/api/entities';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserCircle, CreditCard, Calendar, Zap, ArrowUpRight, Rocket, MessageSquare, Clock, Star, AlertTriangle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// [ADDED 020826] Same phase-to-tag mapping used in the founder hover card
// (Part A.2) — kept in sync so "Stage" reads the same everywhere.
function getJourneyTag(rawPhase) {
  // [FIX] Same fix as dashboard-page.jsx and product-feedback-page.jsx —
  // was mapping growth -> 'Beta', hiding that the venture had reached
  // Growth. Third separate copy of this function found in this file.
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

// [FIX 020826] This section shows exactly what other founders see via the
// hover card (Part A.3.1) — a public-profile preview, not a private
// analytics view. So it uses the same status label, not the raw count.
// Insight Credits themselves (how many earned/available) aren't shown here
// either — that mechanism (Part E.7) isn't built yet.
function getInsightStatus(count) {
  if (count >= 50) return 'Insight Master';
  if (count >= 20) return 'Insight Champion';
  if (count >= 5) return 'Insight Builder';
  if (count >= 1) return 'Insight Starter';
  return 'Insight Seeker';
}

// [ADDED 020826] Same ring-badge system used in product-feedback-page.jsx's
// hover card — kept in sync so the profile looks identical everywhere it
// appears.
const STAGE_RING_COLORS = {
  Spark: { stroke: '#CEE8DE', text: '#0F6E56' },
  Plan: { stroke: '#9FE1CB', text: '#0F6E56' },
  Shape: { stroke: '#5DCAA5', text: '#0F6E56' },
  Beta: { stroke: '#1D9E75', text: '#04342C' },
  // [NEW] Was missing — after fixing getJourneyTag to return 'Growth'
  // instead of silently reusing 'Beta', this key needs its own color or
  // the ring falls back to plain gray. Continues the existing green
  // progression, one step further than Beta (the final stage).
  // [FIX] Text color was too light (#ECFDF5, near-white) against the ring's
  // white background — invisible, confirmed via screenshot. Every other
  // stage here uses dark text; matches that pattern now.
  Growth: { stroke: '#0C5132', text: '#04342C' },
};
const INSIGHT_RING_COLORS = {
  'Insight Seeker': { stroke: '#FAEEDA', text: '#633806' },
  'Insight Starter': { stroke: '#FAC775', text: '#633806' },
  'Insight Builder': { stroke: '#EF9F27', text: '#412402' },
  'Insight Champion': { stroke: '#BA7517', text: '#FAEEDA' },
  'Insight Master': { stroke: '#412402', text: '#FAEEDA' },
};
const ZIG_AGE_RING_COLOR = { stroke: '#378ADD', text: '#185FA5' };

function RingBadge({ value, label, stroke, text }) {
  const size = 64;
  const r = 28;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="absolute top-0 left-0 -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1EFE8" strokeWidth="5" />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={stroke} strokeWidth="5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset="0" />
        </svg>
        {/* [FIX] Threshold lowered from >8 to >5 — "Growth" (6 chars) was
            staying at the larger 12px size and not fitting the ring,
            confirmed via screenshot, even though it's only one character
            longer than "Spark"/"Shape" (likely just wider letterforms). */}
        <span className="font-medium text-center leading-tight" style={{ color: text, fontSize: value.length > 5 ? 9 : 12 }}>
          {value}
        </span>
      </div>
      <span className="text-[11px] text-gray-400">{label}</span>
    </div>
  );
}

// [MY ACCOUNT] מיפוי תכניות לקרדיטים
// [FIX — full pricing model update] Old tiers (explorer/pro_founder/
// unicorn) are gone — replaced with the new two-track model (Build an
// Idea: builder/builder_boost, Grow a Product: growth/growth_boost).
const PLAN_CREDITS = {
  builder: 100,
  builder_boost: 300,
  growth: 100,
  growth_boost: 200,
};

const PLAN_PRICES = {
  builder: '$0/month',
  builder_boost: '$12/month',
  growth: '$35/month',
  growth_boost: '$49/month',
};

// [NEW] Display names — the raw plan key doesn't render well on its own
// (`builder_boost` isn't a sentence, `growth` alone would read the same as
// the venture's own "Growth" phase shown elsewhere on this account, which
// is confusing since they're different things). "GrowthZig" is the
// confirmed display name for the Growth plan specifically.
const PLAN_DISPLAY_NAMES = {
  builder: 'Builder',
  builder_boost: 'Builder Boost',
  growth: 'GrowthZig',
  growth_boost: 'GrowthZig Boost',
};

export default function MyAccount() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // [ADDED 020826] Multi-venture reset ("Start a New Idea") — see the
  // separate project-definition doc for full scope/decisions.
  const [venture, setVenture] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  // [FIX 020826] Reputation fields (Part A) — fetched via the same
  // get_public_founder_profile RPC already used for the founder hover card.
  // This section shows the same public-facing view others see (status
  // label, not raw count) — corrected after an earlier version of this file
  // mistakenly showed raw numbers here as if this were a private view.
  const [reputation, setReputation] = useState(null);
  // [ADDED 020826] Insight Credits, step 3 — conversion to Feedback Request
  // Pool. Ratio is 1:3 (1 credit -> 3 requests), per this session's decision
  // — updates the earlier 1:1 figure noted in the planning doc.
  const [creditsToConvert, setCreditsToConvert] = useState(1);
  const [isConverting, setIsConverting] = useState(false);
  const [convertError, setConvertError] = useState('');
  const [convertSuccess, setConvertSuccess] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);

        const { data } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        setProfile(data);

        // [ADDED 020826] Self-view reputation data (Part A.6.2) — reuses the
        // RPC rather than querying ventures/feedback tables directly here,
        // since we already know that RPC safely bypasses the RLS gaps found
        // earlier without needing to check each table's policies individually.
        const { data: repData } = await supabase.rpc('get_public_founder_profile', {
          profile_id: currentUser.id,
        });
        if (repData?.[0]) setReputation(repData[0]);

        // [ADDED 020826] Load the founder's venture (name + id) — needed for
        // the "Start a New Idea" confirmation (type the venture's name) and
        // the delete call itself. Uses the same `created_by: email` pattern
        // already used in most other pages (D.7 in the main planning doc).
        const { data: ventures } = await supabase
          .from('ventures')
          .select('id, name')
          .eq('created_by', currentUser.email)
          .order('created_date', { ascending: false })
          .limit(1);
        if (ventures?.[0]) setVenture(ventures[0]);
      } catch (error) {
        console.error('Error loading profile:', error);
      }
      setIsLoading(false);
    };

    loadProfile();
  }, []);

  if (isLoading) return <div className="p-8 text-center font-bold">Loading...</div>;

  // [ADDED 020826] Calls the archive_and_delete_venture RPC (created this
  // session) — one atomic DB call: archives to venture_history, increments
  // ideas_started_count, deletes the venture and all its related rows.
  // No RLS/permissions are touched by this — the function runs as
  // security definer, exactly as scoped in the project-definition doc.
  const handleStartNewIdea = async () => {
    if (!venture || confirmText.trim() !== venture.name) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      const { error } = await supabase.rpc('archive_and_delete_venture', {
        p_venture_id: venture.id,
        p_founder_id: user.id,
      });
      if (error) throw error;
      router.push('/createventure');
    } catch (error) {
      console.error('Error deleting venture:', error);
      setDeleteError('Something went wrong. Please try again.');
      setIsDeleting(false);
    }
  };

  // [ADDED 020826] Insight Credits, step 3 — converts credits into the
  // active venture's Feedback Request Pool via the atomic RPC (checks
  // balance, decrements credits, increments pool — all server-side, no
  // read-then-write race condition from the client).
  const handleConvertCredits = async () => {
    if (!venture || !creditsToConvert || creditsToConvert < 1) return;
    setIsConverting(true);
    setConvertError('');
    setConvertSuccess(false);
    try {
      const { error } = await supabase.rpc('convert_insight_credits', {
        p_user_id: user.id,
        p_venture_id: venture.id,
        p_credits_to_convert: creditsToConvert,
      });
      if (error) throw error;
      setProfile(prev => ({ ...prev, insight_credits: (prev.insight_credits || 0) - creditsToConvert }));
      setConvertSuccess(true);
      setCreditsToConvert(1);
    } catch (error) {
      console.error('Error converting Insight Credits:', error);
      setConvertError(error?.message === 'Not enough Insight Credits' ? "You don't have enough Insight Credits for that." : 'Something went wrong. Please try again.');
    } finally {
      setIsConverting(false);
    }
  };

  // [FIX] Was defaulting to the literal string 'free', which was never
  // actually a real plan key (old or new) — now defaults to the actual
  // free-tier key.
  const plan = profile?.plan || 'builder';
  const creditsUsed = profile?.credits_used || 0;
  const creditsLimit = profile?.credits_limit || PLAN_CREDITS[plan] || PLAN_CREDITS.builder;
  const creditsLeft = creditsLimit - creditsUsed;
  const resetDate = profile?.credits_reset_date
    ? new Date(profile.credits_reset_date)
    : null;
  const nextReset = resetDate
    ? new Date(resetDate.getFullYear(), resetDate.getMonth() + 1, resetDate.getDate())
    : null;
  const joinedDate = profile?.accepted_tos_date
    ? new Date(profile.accepted_tos_date)
    : null;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <UserCircle className="w-8 h-8 text-indigo-600" />
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Account</h1>
      </div>

      {/* פרטי משתמש */}
      <Card className="border-t-4 border-t-indigo-500 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <UserCircle className="w-4 h-4" /> Account Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-gray-700"><span className="font-semibold">Email:</span> {user?.email || '—'}</p>
          <p className="text-gray-700">
            <span className="font-semibold">Member since:</span>{' '}
            {joinedDate ? joinedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
          </p>
        </CardContent>
      </Card>

      {/* [FIX 020826] Zig Profile — public-profile preview, showing exactly what
          other founders see via the hover card (same status label, per
          A.3.1), not raw numbers. Ideas Started intentionally omitted for now — see the
          same reasoning already noted in product-feedback-page.jsx: the count
          only reflects ventures that exist today, not the true lifetime count
          from Part B (venture_history), so showing it now would be misleading
          once that ships and the number's meaning changes. */}
      <Card className="border-t-4 border-t-indigo-500 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <UserCircle className="w-4 h-4" /> Zig Profile
          </CardTitle>
          {/* [FIX 020826] Made explicit: this is the same preview other founders
              see when they hover your name — not a private/self-only view. */}
          <p className="text-xs text-gray-400">Public Profile</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {profile?.early_adopter && (
            <Badge className="bg-amber-100 text-amber-800 flex items-center gap-1 w-fit">
              <Star className="w-3 h-3" />
              Early Adopter
            </Badge>
          )}
          <div className="grid grid-cols-4 gap-2">
            <RingBadge
              value={getJourneyTag(reputation?.current_phase) || '—'}
              label="Stage"
              stroke={STAGE_RING_COLORS[getJourneyTag(reputation?.current_phase)]?.stroke || '#F1EFE8'}
              text={STAGE_RING_COLORS[getJourneyTag(reputation?.current_phase)]?.text || '#888780'}
            />
            <RingBadge
              value={getInsightStatus(reputation?.feedback_count ?? 0).replace('Insight ', '')}
              label="Status"
              stroke={INSIGHT_RING_COLORS[getInsightStatus(reputation?.feedback_count ?? 0)]?.stroke || '#F1EFE8'}
              text={INSIGHT_RING_COLORS[getInsightStatus(reputation?.feedback_count ?? 0)]?.text || '#888780'}
            />
            <RingBadge
              value={
                joinedDate
                  ? (() => {
                      const days = Math.floor((Date.now() - joinedDate.getTime()) / 86400000);
                      if (days < 30) return `${days}d`;
                      if (days < 365) return `${Math.floor(days / 30)}mo`;
                      return `${Math.floor(days / 365)}y`;
                    })()
                  : '—'
              }
              label="Zig age"
              stroke={ZIG_AGE_RING_COLOR.stroke}
              text={ZIG_AGE_RING_COLOR.text}
            />
            {/* [ADDED 020826] Ideas Started — sourced from the real
                ideas_started_count column (Part B), not a live venture
                count, so it persists correctly across resets. Fixed neutral
                color, like Zig Age — a fact, not a shaded achievement. */}
            <RingBadge
              value={reputation?.ideas_count != null ? String(reputation.ideas_count) : '—'}
              label="Ideas"
              stroke={ZIG_AGE_RING_COLOR.stroke}
              text={ZIG_AGE_RING_COLOR.text}
            />
          </div>
        </CardContent>
      </Card>

      {/* [ADDED 020826] Insight Credits, step 3 — balance + conversion to
          Feedback Request Pool. Lives here (not the public Zig Profile card
          above), since the balance itself is private, self-only info — the
          public profile only ever shows the translated status label
          (Insight Starter/Builder/etc.), never the raw number, per A.6.2. */}
      <Card className="border-t-4 border-t-amber-400 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Insight Credits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-gray-900">{profile?.insight_credits || 0}</span>
            <span className="text-gray-500 text-lg mb-1">available</span>
          </div>
          <p className="text-xs text-gray-400">Earned by giving feedback to other founders — 3 credits per feedback given.</p>

          {venture && (
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <p className="text-sm font-medium text-gray-700">Convert to feedback requests <span className="text-gray-400 font-normal">(1 credit = 3 requests)</span></p>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={profile?.insight_credits || 0}
                  value={creditsToConvert}
                  onChange={(e) => setCreditsToConvert(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-24"
                  disabled={isConverting}
                />
                <span className="text-sm text-gray-400">credits → {creditsToConvert * 3} requests</span>
                <Button
                  onClick={handleConvertCredits}
                  disabled={isConverting || !profile?.insight_credits || creditsToConvert > (profile?.insight_credits || 0)}
                  className="ml-auto bg-amber-600 hover:bg-amber-700"
                  size="sm"
                >
                  {isConverting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Convert'}
                </Button>
              </div>
              {convertError && <p className="text-xs text-red-600">{convertError}</p>}
              {convertSuccess && <p className="text-xs text-green-600">Converted! Your Feedback Request Pool has been updated.</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* תכנית נוכחית */}
      <Card className="border-t-4 border-t-purple-500 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-3xl font-bold text-gray-900">{PLAN_DISPLAY_NAMES[plan] || plan}</p>
          <p className="text-gray-500 text-sm">
            {PLAN_PRICES[plan] || '$0/month'}
          </p>
        </CardContent>
      </Card>

      {/* קרדיטים */}
      <Card className="border-t-4 border-t-green-500 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <Zap className="w-4 h-4" /> AI Credits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-end gap-2">
            <span className={`text-4xl font-bold ${creditsLeft <= 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {creditsLeft}
            </span>
            <span className="text-gray-500 text-lg mb-1">/ {creditsLimit} remaining</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${creditsLeft <= 0 ? 'bg-red-500' : 'bg-green-500'}`}
              style={{ width: `${Math.max(0, (creditsLeft / creditsLimit) * 100)}%` }}
            />
          </div>

          {nextReset && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Resets on {nextReset.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          )}
        </CardContent>
      </Card>

      {/* כפתור שדרוג */}
      <Link href="/pricing">
        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 h-12 text-base">
          <ArrowUpRight className="w-5 h-5" />
          Upgrade Plan
        </Button>
      </Link>

      {/* [ADDED 020826] Start a New Idea — multi-venture reset (Part B).
          Positive framing per the project-definition doc: "Start a New Idea"
          is the primary action, not "Delete." Only shown if there's an
          active venture to reset. */}
      {venture && (
        <Card className="border-t-4 border-t-gray-300 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Rocket className="w-4 h-4" /> Start a New Idea
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-500">
              You can start a fresh idea at any time.
            </p>
            <Button
              variant="outline"
              onClick={() => setShowResetModal(true)}
              className="w-full border-gray-300"
            >
              Start a New Idea
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Confirmation modal */}
      {showResetModal && venture && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
          <Card className="max-w-md w-full bg-white shadow-2xl">
            <CardContent className="space-y-4 bg-white rounded-lg p-6">
              <h2 className="flex items-center gap-2 text-gray-900 font-semibold text-lg">
                <Rocket className="w-5 h-5 text-indigo-600" /> Start a New Idea
              </h2>
              <p className="text-sm text-gray-600">
                You can start a new idea at any time. To do that, your current idea will be permanently deleted.
              </p>

              <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 text-sm">
                <p className="font-medium text-gray-700">What happens next:</p>
                <p className="text-gray-600">• "{venture.name}" and all its content will be removed</p>
                <p className="text-gray-600">• Your profile, reputation, and feedback history will remain</p>
                <p className="text-gray-600">• Your AI Credits will remain available</p>
                <p className="text-gray-600">• You can immediately start building a new idea</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  This action is <span className="font-bold">permanent and cannot be undone</span>. To confirm you want to delete all data for <span className="font-bold">{venture.name}</span>, type its name below:
                </label>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={venture.name}
                  className="mt-1.5"
                />
              </div>

              {deleteError && (
                <div className="flex items-start gap-2 text-sm text-red-600">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {deleteError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => { setShowResetModal(false); setConfirmText(''); setDeleteError(''); }}
                  disabled={isDeleting}
                >
                  Not now
                </Button>
                <Button
                  onClick={handleStartNewIdea}
                  disabled={confirmText.trim() !== venture.name || isDeleting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Start New Idea
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
