
// C:\STRARTZIG\InAppPromotion 300326
// [GROWTH] This session split the old shared "beta || growth" branch into
// two separate branches — Growth ventures were being sent to the Beta
// signup page (/beta-testing) with "beta tester" copy, instead of to the
// venture-landing page with the Growth feedback categories built earlier
// this session. Search "[GROWTH]" below for every touch point.
"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; // ✅ [2026-01-11] FIX: need gte/count + fetch many ventures reliably

import { Venture, VentureMessage, PromotionCampaign, User } from "@/api/entities.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input.jsx";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Megaphone, AlertTriangle, ChevronRight, X } from "lucide-react";

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

function MobileFieldWrapper({ label, summary, isMobile, children }) {
  const [open, setOpen] = useState(false);
  if (!isMobile) return <>{children}</>;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white text-left">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          {summary ? <p className="text-xs text-gray-500 truncate">{summary}</p> : <p className="text-xs text-gray-400">Tap to fill in</p>}
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
            <h3 className="font-semibold text-gray-900">{label}</h3>
            <button type="button" onClick={() => setOpen(false)} className="text-emerald-600 font-medium flex items-center gap-1">Done <X className="w-4 h-4" /></button>
          </div>
          {/* Same fix as growth-development's version — forces any nested
              textarea to actually fill the screen instead of staying tiny. */}
          <div className="flex-1 overflow-y-auto p-4 [&_textarea]:min-h-[55vh] [&_input]:min-h-[35vh] [&_input]:text-2xl [&_input]:p-6">{children}</div>
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
      const { data: allVentures, error: venturesErr } = await supabase
        .from("ventures")
        .select("id,name,phase,landing_page_url,is_sample,created_date")
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
      const actualAudienceSize = Math.min(requestsToUse, eligibleVentures.length);
      const shuffled = [...eligibleVentures].sort(() => 0.5 - Math.random());
      const selectedTargets = shuffled.slice(0, actualAudienceSize);

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
        title: "📣 Campaign Launched!",
        // [CHANGED] Now shows the campaign name (tagline) in the message
        // and points to Promotion Center instead of "Promotion Reports"
        content: `Your campaign "${tagline}" has been launched successfully. Track results in the Promotion Center.`,
        phase: venture.phase,
        priority: 2,
        created_by: user?.email || null,
        created_by_id: user?.id || null,
        is_dismissed: false,
      });

      // [CHANGED] Alert now shows campaign name
      alert(`Campaign "${tagline}" launched successfully! Track results in the Promotion Center.`);
      goBack();
    } catch (error) {
      console.error("Error launching campaign:", error);
      alert("There was an error launching your campaign. Please try again.");
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
                  <li>Give your campaign a name (tagline)</li>
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

              {/* [CHANGED] Renamed from "Campaign Tagline" to "Campaign Name" — used as campaign identifier */}
              <div>
                <Label htmlFor="tagline">Campaign Name *</Label>
                <MobileFieldWrapper label="Campaign Name" summary={tagline} isMobile={isMobile}>
                  <Textarea
                    id="tagline"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="Give your campaign a name — this will appear in the invitation message..."
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
                    Launching Campaign...
                  </>
                ) : (
                  <>
                    <Megaphone className="w-4 h-4 mr-2" />
                    Launch Campaign
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


