// 220226
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
  const map = {
    idea: 'Spark',
    business_plan: 'Plan',
    mvp: 'Shape',
    mlp: 'Shape',
    beta: 'Beta',
    growth: 'Beta',
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
        <span className="font-medium text-center leading-tight" style={{ color: text, fontSize: value.length > 8 ? 9 : 12 }}>
          {value}
        </span>
      </div>
      <span className="text-[11px] text-gray-400">{label}</span>
    </div>
  );
}

// [MY ACCOUNT] מיפוי תכניות לקרדיטים
const PLAN_CREDITS = {
  explorer: 5,
  builder: 100,
  pro_founder: 300,
  unicorn: 500,
};

const PLAN_PRICES = {
  explorer: '$0/month',
  builder: '$9/month',
  pro_founder: '$18/month',
  unicorn: '$28/month',
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

  const plan = profile?.plan || 'free';
  const creditsUsed = profile?.credits_used || 0;
  const creditsLimit = profile?.credits_limit || PLAN_CREDITS[plan] || 5;
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
          <div className="grid grid-cols-3 gap-2">
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
          </div>
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
          <p className="text-3xl font-bold text-gray-900 capitalize">{plan}</p>
          <p className="text-gray-500 text-sm">
            {PLAN_PRICES[plan] || '$0/month'}
          </p>
        </CardContent>
      </Card>

      {/* קרדיטים */}
      <Card className="border-t-4 border-t-green-500 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <Zap className="w-4 h-4" /> Mentor Credits
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
              Ready for something new? You can start a fresh idea at any time. Your current idea, "{venture.name}," will be permanently deleted — but your profile, reputation, and credits stay with you.
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Rocket className="w-5 h-5 text-indigo-600" /> Start a New Idea
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                You can start a new idea at any time. To do that, your current idea will be permanently deleted.
              </p>

              <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 text-sm">
                <p className="font-medium text-gray-700">What happens next:</p>
                <p className="text-gray-600">• "{venture.name}" and all its content will be removed</p>
                <p className="text-gray-600">• Your profile, reputation, and feedback history will remain</p>
                <p className="text-gray-600">• Your Mentor Credits will remain available</p>
                <p className="text-gray-600">• You can immediately start building a new idea</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  To continue, type <span className="font-bold">{venture.name}</span>
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
