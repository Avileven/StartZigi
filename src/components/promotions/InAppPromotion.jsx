
// C:\STRARTZIG\InAppPromotion 300326
// [GROWTH] This session split the old shared "beta || growth" branch into
// two separate branches — Growth ventures were being sent to the Beta
// signup page (/beta-testing) with "beta tester" copy, instead of to the
// venture-landing page with the Growth feedback categories built earlier
// this session. Search "[GROWTH]" below for every touch point.
//
// [NEW — Followers project] Founders can now choose to send their feedback
// requests to their own followers first — and pick exactly which followers
// — before the rest of the requested amount is filled randomly from the
// general pool, exactly as it worked before this change. Search
// "[NEW — Followers project]" below for every touch point.
"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; // ✅ [2026-01-11] FIX: need gte/count + fetch many ventures reliably

import { Venture, VentureMessage, PromotionCampaign, User } from "@/api/entities.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input.jsx";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Megaphone, AlertTriangle, ChevronRight, X, CheckCircle, Users } from "lucide-react";

// [NEW — mobile fix] This file had no mobile treatment at all — tapping a
// field didn't open it fullscreen, unlike growth-development/venture-landing
// which already have this pattern. Same MobileFieldWrapper implementation,
// copied here since this is a standalone file (not shared via import).
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

// [FIX — real root cause, not styling] Same fix as growth-development: a
// native <input> can never wrap/scroll vertically — text just extends
// sideways and disappears off-screen, no CSS fixes that. When value/
// onChange are passed, this renders a real <textarea> for editing instead.
function MobileFieldWrapper({ label, summary, isMobile, children, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  if (!isMobile) return <>{children}</>;
  const useOwnTextarea = value !== undefined && onChange !== undefined;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white text-left mt-2">
        <div className="min-w-0">
          {/* [FIX] No longer repeats {label} here — was duplicating the
              Label already shown above by the caller. */}
          {summary ? <p className="text-sm text-gray-900 truncate">{summary}</p> : <p className="text-sm text-gray-400">Tap to fill in</p>}
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
            <h3 className="font-semibold text-gray-900">{label}</h3>
            <button type="button" onClick={() => setOpen(false)} className="text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Save
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {useOwnTextarea ? (
              <textarea
                autoFocus
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full h-full min-h-[60vh] text-xl leading-relaxed border-0 focus:ring-0 focus:outline-none resize-none bg-transparent"
              />
            ) : (
              <div className="[&_textarea]:!min-h-[50vh] [&_textarea]:!border-0 [&_textarea]:!rounded-none [&_textarea]:!shadow-none [&_textarea]:!ring-0 [&_textarea]:!p-0 [&_textarea]:!text-xl
                [&_input]:!border-0 [&_input]:!rounded-none [&_input]:!shadow-none [&_input]:!ring-0">
                {children}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// [FIX 020826] Removed the 3-tier package picker (20/50/100 reach for
// $1,000/$1,500/$2,000 virtual_capital) — replaced by the Feedback Request
// Pool model (Part E.6): a fixed base allowance per venture, spent as the
// founder chooses per round, no dollar packages.

const MAX_MESSAGES_PER_VENTURE_PER_WEEK = 5; // [FIX 020826] Raised from 3 to 5, per this session's decision (Part D/E discussion).

// [GROWTH — anti-collision safeguard] Confirmed real occurrence this
// session: a real founder's In-App campaign randomly targeted PocketVet.zig
// (an example/demo venture, not a real founder). This was flagged as a
// known open item since the original session-summary doc ("Anti-collision
// safeguard... not yet implemented") and is now fixed here. ChartSense.zig
// (the planned Beta-stage example) does not exist yet, so it's not listed —
// add its id here once it's created.
const EXAMPLE_VENTURE_IDS = [
  'ab85b600-875b-4755-b7af-ee155b0bdc34', // PocketVet.zig (MVP example)
  '3ca810de-a754-412c-8905-94247b9d1e90', // GrandpaSays.zig (MLP example)
];

// [NEW — Followers project] Same phase-to-tag mapping used elsewhere
// (my-account-page.jsx, dashboard-page.jsx, product-feedback-page.jsx) —
// each file keeps its own copy, per the existing pattern in this codebase.
function getJourneyTag(rawPhase) {
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

export default function InAppPromotion({ goBack }) {
  const isMobile = useIsMobile();
  const [venture, setVenture] = useState(null);
  // [FIX 020826] Replaces selectedPackage — the founder now picks how many of
  // their remaining Feedback Request Pool to spend on this round, not a fixed
  // tier size.
  const [requestsToUse, setRequestsToUse] = useState(1);
  const [tagline, setTagline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // [NEW — Followers project] Followers of this venture, with enough profile
  // info to show in the picker; which of them are currently checked (all
  // checked by default when loaded).
  const [followers, setFollowers] = useState([]);
  const [selectedFollowerIds, setSelectedFollowerIds] = useState(new Set());
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);

  useEffect(() => {
    const loadVenture = async () => {
      setIsLoading(true);
      try {
        const user = await User.me();
        if (!user?.id) {
          setVenture(null);
          return;
        }

        // ✅ [2026-01-11] FIX: load my venture by founder_user_ids (NOT created_by email)
        // This matches your entities.js special filter for ventures.
        const ventures = await Venture.filter({ founder_user_id: user.id }, "-created_date");

        if (ventures?.length > 0) setVenture(ventures[0]);
        else setVenture(null);
      } catch (error) {
        console.error("Error loading venture:", error);
        setVenture(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadVenture();
  }, []);

  // [NEW — Followers project] Loads this venture's followers and their
  // public profile (same pattern as my-account-page.jsx's follower list).
  // All followers start checked, so "send to followers" works by default
  // without the founder having to pick anyone.
  useEffect(() => {
    const loadFollowers = async () => {
      if (!venture) { setFollowers([]); setSelectedFollowerIds(new Set()); return; }
      setIsLoadingFollowers(true);
      try {
        const { data: rows } = await supabase
          .from('venture_followers')
          .select('user_id')
          .eq('venture_id', venture.id);
        const ids = (rows || []).map((r) => r.user_id);
        if (ids.length === 0) {
          setFollowers([]);
          setSelectedFollowerIds(new Set());
          return;
        }
        const profiles = await Promise.all(
          ids.map((id) => supabase.rpc('get_public_founder_profile', { profile_id: id }))
        );
        const list = ids.map((id, i) => {
          const p = profiles[i]?.data?.[0];
          return {
            user_id: id,
            username: p?.username || 'Founder',
            current_phase: p?.current_phase || null,
          };
        });
        setFollowers(list);
        setSelectedFollowerIds(new Set(ids));
      } catch (error) {
        console.error('Error loading followers:', error);
        setFollowers([]);
        setSelectedFollowerIds(new Set());
      } finally {
        setIsLoadingFollowers(false);
      }
    };
    loadFollowers();
  }, [venture]);

  // [NEW — Followers project] Toggles one follower's checkbox.
  const toggleFollower = (userId) => {
    setSelectedFollowerIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleLaunchCampaign = async () => {
    if (!requestsToUse || requestsToUse < 1 || !tagline.trim() || !venture) {
      alert("Please choose how many requests to send and provide a tagline.");
      return;
    }

    const remainingPool = venture.feedback_request_pool ?? 20;
    if (remainingPool < requestsToUse) {
      alert("You don't have enough requests remaining in your Feedback Request Pool for this round.");
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await User.me();

      // ✅ [2026-01-11] FIX: Venture.list doesn't support limit param in your Entity.
      // Use supabase directly to fetch many ventures.
      // [NEW — Followers project] Added created_by_id and founder_user_ids to
      // the select — needed to match a selected follower (a user_id) back to
      // the venture that belongs to them.
      const { data: allVentures, error: venturesErr } = await supabase
        .from("ventures")
        .select("id,name,phase,landing_page_url,is_sample,created_date,created_by_id,founder_user_ids")
        .order("created_date", { ascending: false })
        .limit(1000);

      if (venturesErr) throw venturesErr;

      const targetVentures = (allVentures || [])
        .filter((v) => v?.id && v.id !== venture.id)
        .filter((v) => v.is_sample !== true)
        // [GROWTH — anti-collision safeguard] Confirmed bug fix: without
        // this, a real founder's campaign could randomly land on an
        // example/demo venture like PocketVet.zig, as it actually did.
        .filter((v) => !EXAMPLE_VENTURE_IDS.includes(v.id));

      if (targetVentures.length === 0) {
        alert("No other ventures available to promote to at this time.");
        setIsSubmitting(false);
        return;
      }

      // [NEW — Followers project] Which of these ventures belong to a
      // follower the founder has checked — matched by created_by_id or by
      // being listed as a co-founder (founder_user_ids).
      const selectedFollowerIdSet = selectedFollowerIds;
      const followerVentureIds = new Set(
        targetVentures
          .filter((v) =>
            selectedFollowerIdSet.has(v.created_by_id) ||
            (Array.isArray(v.founder_user_ids) && v.founder_user_ids.some((id) => selectedFollowerIdSet.has(id)))
          )
          .map((v) => v.id)
      );

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const oneWeekAgoISO = oneWeekAgo.toISOString();

      // ✅ [2026-01-11] FIX: Entity.filter DOES NOT support $gte.
      // We compute weekly cap using PostgREST count + gte.
      const eligibleVentures = [];
      for (const targetVenture of targetVentures) {
        const { count, error: countErr } = await supabase
          .from("venture_messages")
          .select("id", { count: "exact", head: true })
          .eq("venture_id", targetVenture.id)
          .eq("message_type", "feedback_request")
          .gte("created_date", oneWeekAgoISO);

        if (countErr) throw countErr;

        if ((count || 0) < MAX_MESSAGES_PER_VENTURE_PER_WEEK) {
          eligibleVentures.push(targetVenture);
        }
      }

      if (eligibleVentures.length === 0) {
        alert("All ventures have reached their weekly message limit. Please try again later.");
        setIsSubmitting(false);
        return;
      }

      // [FIX 020826] actualAudienceSize is still tracked internally (useful for
      // future success-rate measurement, Part E.5) but — per Part E.3 — is
      // never shown to the founder anywhere in this file's UI.
      // [NEW — Followers project] Checked followers' ventures (that are
      // still eligible under the weekly cap) go first; the rest of the
      // requested amount is filled randomly from the remaining eligible
      // pool, exactly as it worked before this change.
      const eligibleFollowerVentures = eligibleVentures.filter((v) => followerVentureIds.has(v.id));
      const eligibleRandomPool = eligibleVentures.filter((v) => !followerVentureIds.has(v.id));

      const actualAudienceSize = Math.min(requestsToUse, eligibleVentures.length);
      const priorityCount = Math.min(eligibleFollowerVentures.length, actualAudienceSize);
      const remainingCount = actualAudienceSize - priorityCount;
      const shuffledRandomPool = [...eligibleRandomPool].sort(() => 0.5 - Math.random());
      const selectedTargets = [
        ...eligibleFollowerVentures.slice(0, priorityCount),
        ...shuffledRandomPool.slice(0, remainingCount),
      ];

      // [FIX] Use supabase directly with a generated id — PromotionCampaign.create()
// does not auto-generate id, causing not-null constraint violation.
const campaignId = crypto.randomUUID();
const { data: campaign, error: campaignErr } = await supabase
  .from("promotion_campaigns")
  .insert({
    id: campaignId,
    venture_id: venture.id,
    campaign_type: "in-app",
    audience_size: actualAudienceSize,
    // [FIX 020826] No more dollar cost — cost field now stores the number of
    // Feedback Request Pool units spent (still not shown to the founder as a
    // "reach" figure anywhere; it's an internal spend record).
    cost: requestsToUse,
    tagline: tagline,
    status: "active",
    created_by: user?.email || null,
    created_by_id: user?.id || null,
  })
  .select()
  .single();
if (campaignErr) throw campaignErr;

      let messageTitle = "";
      let messageContent = "";

      // [FIX] tagline (the founder's internal "Campaign Name", e.g. "test
      // 1") was being injected verbatim at the start of the message every
      // recipient sees — confirmed real occurrence this session. tagline
      // stays as the campaign's internal label (stored on the campaign row,
      // shown back to the sender in their own launch confirmation below) but
      // is no longer part of what a recipient reads.
      if (venture.phase === "mvp" || venture.phase === "mlp") {
        messageTitle = `💡 Check out ${venture.name}!`;
        messageContent = `They're looking for feedback on their ${
          venture.phase === "mvp" ? "MVP" : "MLP"
        }. Visit their page and share your thoughts!`;
      } else if (venture.phase === "beta") {
        messageTitle = `🚀 Join ${venture.name}'s Beta Program!`;
        messageContent = `They're looking for beta testers! Sign up to be among the first to try their product.`;
      } else if (venture.phase === "growth") {
        // [GROWTH] Was sharing the "beta || growth" branch above (wrong —
        // sent people to sign up as beta testers instead of giving feedback
        // on the Growth page). Separate branch, feedback-oriented copy
        // matching the MVP/MLP tone rather than the Beta signup tone.
        messageTitle = `🌱 Check out ${venture.name}!`;
        messageContent = `They're looking for feedback on their product. Visit their page and share your thoughts!`;
      } else {
        messageTitle = `✨ Discover ${venture.name}!`;
        messageContent = `Check out what they're building!`;
      }

      // [CHANGED] Build the correct feedback URL based on venture phase.
      // MVP/MLP → /venture-feedback?id=X&from=TARGET_ID (dedicated feedback page, no auth conflict)
      // Beta → /beta-testing?id=X&campaign=CAMPAIGN_ID (public beta sign-up page)
      // [GROWTH] Growth → /venture-landing?id=X&campaign=CAMPAIGN_ID — a
      // separate case, no longer falling into the Beta branch above. No
      // invitation token needed here: venture-landing is fully public by
      // id, same principle as beta-testing already being public by id
      // (confirmed this session — neither page requires a token).
      const getFeedbackUrl = (targetVentureId) => {
        if (venture.phase === "mvp" || venture.phase === "mlp") {
          // [FIX 020826] Was missing &campaign=... entirely — this is why
          // feedback received via in-app rounds could never be linked back
          // to the campaign that generated it.
          return `/venture-feedback?id=${venture.id}&from=${targetVentureId}&campaign=${campaign.id}`;
        }
        if (venture.phase === "growth") {
          // [GROWTH] New branch — previously fell through to the
          // /beta-testing return below by accident.
          return `/venture-landing?id=${venture.id}&campaign=${campaign.id}`;
        }
        return `/beta-testing?id=${venture.id}&campaign=${campaign.id}`;
      };

      for (const target of selectedTargets) {
        await VentureMessage.create({
          venture_id: target.id,
          message_type: "feedback_request",
          title: messageTitle,
          content: messageContent,
          from_venture_id: venture.id,
          from_venture_name: venture.name,
          // [CHANGED] Use correct feedback URL instead of raw landing_page_url
          from_venture_landing_page_url: getFeedbackUrl(target.id),
          campaign_id: campaign.id,
          phase: target.phase,
          priority: 1,
          created_by: user?.email || null,
          created_by_id: user?.id || null,
          is_dismissed: false,
        });
      }

      // [FIX 020826] Deduct from feedback_request_pool instead of
      // virtual_capital — fetching fresh from DB first, same reasoning as
      // before (avoid stale frontend state causing a wrong balance).
      const { data: freshVenture } = await supabase
        .from("ventures")
        .select("feedback_request_pool")
        .eq("id", venture.id)
        .single();
      const freshPool = freshVenture?.feedback_request_pool ?? 20;
      await supabase
        .from("ventures")
        .update({ feedback_request_pool: freshPool - requestsToUse })
        .eq("id", venture.id);

      await VentureMessage.create({
        venture_id: venture.id,
        message_type: "system",
        title: "📣 Brief Launched!",
        // [CHANGED] Now shows the campaign name (tagline) in the message
        // and points to Promotion Center instead of "Promotion Reports"
        content: `Your brief "${tagline}" has been launched successfully. Track results in the Promotion Center.`,
        phase: venture.phase,
        priority: 2,
        created_by: user?.email || null,
        created_by_id: user?.id || null,
        is_dismissed: false,
      });

      // [CHANGED] Alert now shows campaign name
      alert(`Brief "${tagline}" launched successfully! Track results in the Promotion Center.`);
      goBack();
    } catch (error) {
      console.error("Error launching campaign:", error);
      alert("There was an error launching your brief. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!venture) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Venture Found</h2>
            <p className="text-gray-600 mb-4">You need to create a venture first.</p>
            <Button onClick={goBack}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* [FIX] "Back to Promotion Center" removed per explicit request —
            with the Growth auto-redirect now skipping the choice screen,
            you're conceptually already inside Promotion Center, so there's
            nowhere meaningful to "go back" to. */}

        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Megaphone className="w-8 h-8 text-indigo-600" />
              In-App Promotion Package
            </CardTitle>
          </CardHeader>

          <CardContent className="p-8">
            <div className="space-y-6">

              {/* [FIX 020826] Updated per Part E: no dollar cost, no reach
                  number promised to the founder — only how many requests
                  from their pool they're choosing to spend. */}
              <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl">
                <h4 className="font-semibold text-blue-900 mb-3">How It Works:</h4>
                <ol className="text-sm text-blue-800 space-y-2 list-decimal pl-5">
                  <li>Choose how many requests to spend from your Feedback Request Pool</li>
                  <li>Give your brief a name (tagline)</li>
                  <li>Launch the round and track results in the Validation Center</li>
                  <li>The round is active for 7 days — after that, invitations expire automatically</li>
                </ol>
              </div>

              <div className="text-center">
                <h3 className="font-semibold text-lg mb-2">Feedback Requests Remaining</h3>
                {/* [FIX] Was left-aligned with the number on its own line —
                    now centered, with the number in a bordered box, matching
                    the visual weight of other "stat" numbers in the app. */}
                <div className="inline-block border-2 border-indigo-200 rounded-xl px-6 py-3 mb-4">
                  <p className="text-3xl font-bold text-indigo-600">{venture.feedback_request_pool ?? 20}</p>
                </div>
                <Label htmlFor="requests-to-use" className="block">How many would you like to use for this round?</Label>
                <MobileFieldWrapper label="Requests to use" summary={String(requestsToUse)} isMobile={isMobile}>
                  {/* [FIX] Native number-input spin arrows don't render on
                      mobile browsers at all — replaced with explicit +/-
                      buttons that work everywhere. */}
                  <div className="flex items-center justify-center gap-3 mt-2">
                    <Button
                      type="button" variant="outline" size="icon"
                      onClick={() => setRequestsToUse(v => Math.max(1, v - 1))}
                    >-</Button>
                    <Input
                      id="requests-to-use"
                      type="number"
                      min={1}
                      max={venture.feedback_request_pool ?? 20}
                      value={requestsToUse}
                      onChange={(e) => setRequestsToUse(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="max-w-[100px] text-center"
                    />
                    <Button
                      type="button" variant="outline" size="icon"
                      onClick={() => setRequestsToUse(v => Math.min(venture.feedback_request_pool ?? 20, v + 1))}
                    >+</Button>
                  </div>
                </MobileFieldWrapper>
                {/* [FIX 020826] Earn-more framing (Part E.7/E.8) instead of a
                    "buy more" purchase flow — Insight Credits transfer 1:1
                    into this pool, they aren't spent on it. */}
                <p className="text-xs text-gray-500 mt-2">
                  Need more? Give feedback to other founders to earn Insight Credits — each one adds a request to this pool.
                </p>
              </div>

              {/* [NEW — Followers project] Only shown when this venture has
                  followers. All checked by default; unchecking one excludes
                  them from the priority group for this round only — doesn't
                  affect who follows the venture. */}
              {followers.length > 0 && (
                <div className="border border-indigo-100 bg-indigo-50/50 rounded-xl p-5">
                  <h4 className="font-semibold text-indigo-900 mb-1 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Send to your followers first
                  </h4>
                  <p className="text-xs text-indigo-700 mb-3">
                    Checked followers get this round's request first. If you ask for more than you have followers checked, the rest go out randomly as usual.
                  </p>
                  {isLoadingFollowers ? (
                    <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-indigo-400" /></div>
                  ) : (
                    <div className="space-y-1.5">
                      {followers.map((f) => (
                        <label key={f.user_id} className="flex items-center gap-2.5 text-sm text-gray-800 bg-white rounded-lg px-3 py-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={selectedFollowerIds.has(f.user_id)}
                            onChange={() => toggleFollower(f.user_id)}
                            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="font-medium">{f.username}</span>
                          {getJourneyTag(f.current_phase) && (
                            <span className="ml-auto text-xs text-indigo-600 border border-indigo-200 rounded-full px-2 py-0.5">
                              {getJourneyTag(f.current_phase)}
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* [CHANGED] Renamed from "Campaign Tagline" to "Campaign Name" — used as campaign identifier */}
              <div>
                <Label htmlFor="tagline">Brief Name *</Label>
                <MobileFieldWrapper label="Brief Name" summary={tagline} isMobile={isMobile}>
                  <Textarea
                    id="tagline"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="Give your brief a name — this will appear in the invitation message..."
                    className="mt-2 min-h-[100px]"
                  />
                </MobileFieldWrapper>
              </div>

              {/* [FIX 020826] Button active when: tagline filled, at least 1
                  request chosen, and enough remaining in the pool. No dollar
                  balance check anymore. */}
              <Button
                onClick={handleLaunchCampaign}
                disabled={
                  !requestsToUse ||
                  requestsToUse < 1 ||
                  !tagline.trim() ||
                  isSubmitting ||
                  (venture.feedback_request_pool ?? 20) < requestsToUse
                }
                className={`w-full transition-all ${
                  requestsToUse >= 1 && tagline.trim() && (venture.feedback_request_pool ?? 20) >= requestsToUse
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Launching Brief...
                  </>
                ) : (
                  <>
                    <Megaphone className="w-4 h-4 mr-2" />
                    Launch Brief
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

