// app/venture-landing/page.jsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { createClient } from "@supabase/supabase-js";
import {
  Lightbulb, Target, Heart, FileText, CheckCircle,
  Loader2, ExternalLink, Sparkles, MessageSquare, Send,
  DollarSign, Layers, Megaphone, ClipboardList, HelpCircle, Compass, X,
  Linkedin, Facebook, Twitter, Instagram, Globe,
} from "lucide-react";
import WelcomeOverlay from "@/components/ventures/WelcomeOverlay";
import InsightEarnedAnimation from "@/components/ventures/InsightEarnedAnimation";
import InteractiveFeedbackForm from "@/components/ventures/InteractiveFeedbackForm";
import { ProductFeedback as ProductFeedbackEntity } from "@/api/entities";

// [NEW — mobile fullscreen field editing, requirement #6 this session]
// Same pattern built for growth-development/page.jsx: on mobile, a slider
// question renders as a compact tappable summary; tapping opens the actual
// slider/textarea in a fullscreen sheet. On desktop, renders inline as
// before — this wrapper changes nothing there.
function useIsMobileViewport() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

function MobileQuestionSheet({ label, summary, isMobile, children }) {
  const [open, setOpen] = useState(false);
  if (!isMobile) return <>{children}</>;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="w-full flex items-center justify-between p-3 bg-white rounded-lg text-left">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{label}</p>
          {summary != null && <p className="text-xs text-indigo-600 font-semibold">{summary}</p>}
        </div>
        <span className="text-xs text-indigo-600 font-medium flex-shrink-0 ml-2">Answer →</span>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
            <h3 className="font-semibold text-gray-900 text-sm">{label}</h3>
            <button type="button" onClick={() => setOpen(false)} className="text-indigo-600 font-medium flex items-center gap-1">Done <X className="w-4 h-4" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">{children}</div>
        </div>
      )}
    </>
  );
}

const ReadMoreText = ({ text, maxLength = 300 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!text) return null;
  if (text.length <= maxLength) return <p className="text-gray-700 leading-relaxed">{text}</p>;
  // [FIX] Was cutting mid-word (substring at a raw character count) — now
  // trims back to the last complete word before maxLength, so truncated
  // text always ends cleanly.
  const truncateAtWord = (str, len) => {
    const cut = str.slice(0, len);
    const lastSpace = cut.lastIndexOf(' ');
    return lastSpace > 0 ? cut.slice(0, lastSpace) : cut;
  };
  const displayedText = isExpanded ? text : `${truncateAtWord(text, maxLength)}...`;
  return (
    <div>
      <p className="text-gray-700 leading-relaxed">{displayedText}</p>
      <Button variant="link" onClick={() => setIsExpanded(!isExpanded)} className="p-0 h-auto text-blue-600">
        {isExpanded ? "Read Less" : "Read More"}
      </Button>
    </div>
  );
};

// [FIX — scoped to Growth only, via the new optional 4th param] The
// filename header ("idea-to-product-ring.html") was showing above every
// file — fine for MVP/MLP where it's unchanged, but Growth explicitly
// doesn't want it. Defaults to false so MVP/MLP call sites are untouched.
const renderFile = (file, index, htmlContents, hideFileName = false) => {
  const fileName = file?.name || "";
  const fileUrl = file?.url || "";
  const fileExt = fileName.split(".").pop()?.toLowerCase();
  const isHTML = ["html", "htm"].includes(fileExt);
  const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(fileExt);
  const isPDF = fileExt === "pdf";

  if (isHTML) {
    const content = htmlContents[fileUrl];
    if (content) {
      return (
        <div key={index} className="border-2 rounded-xl overflow-hidden shadow-lg bg-white">
          {!hideFileName && (
            <div className="bg-gray-100 px-4 py-2 border-b">
              <h4 className="text-sm font-medium text-gray-900">{fileName}</h4>
            </div>
          )}
          <iframe srcDoc={content} className="w-full h-[600px] border-0" title={fileName}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals" loading="lazy" />
        </div>
      );
    }
    return (
      <div key={index} className="border-2 rounded-xl bg-white p-6 flex flex-col items-center justify-center h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        <p className="text-center text-gray-500 mt-2">Loading {fileName}...</p>
      </div>
    );
  }
  if (isImage) {
    return (
      <div key={index} className="border-2 rounded-xl overflow-hidden shadow-lg bg-white">
        {!hideFileName && (
          <div className="bg-gray-100 px-4 py-2 border-b">
            <h4 className="text-sm font-medium text-gray-900">{fileName}</h4>
          </div>
        )}
        <div className="p-4">
          <img src={fileUrl} alt={fileName} className="w-full h-auto" />
        </div>
      </div>
    );
  }
  if (isPDF) {
    return (
      <div key={index} className="border-2 rounded-xl overflow-hidden shadow-lg bg-white">
        {!hideFileName && (
          <div className="bg-gray-100 px-4 py-2 border-b">
            <h4 className="text-sm font-medium text-gray-900">{fileName}</h4>
          </div>
        )}
        <iframe src={fileUrl} className="w-full h-[600px] border-0" title={fileName} />
      </div>
    );
  }
  return (
    <div key={index} className="border-2 rounded-xl shadow-lg bg-white p-6">
      <a href={fileUrl} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-3 hover:bg-gray-50 transition-colors p-4 rounded-lg">
        <FileText className="w-12 h-12 text-indigo-500 flex-shrink-0" />
        <div className="flex-1">
          <span className="text-lg text-indigo-600 hover:underline font-medium block">{fileName}</span>
          <span className="text-sm text-gray-500">Click to view</span>
        </div>
      </a>
    </div>
  );
};

export default function VentureLanding() {
  const isMobileViewport = useIsMobileViewport();
  const [venture, setVenture] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [mvpHtmlContents, setMvpHtmlContents] = useState({});
  const [mlpHtmlContents, setMlpHtmlContents] = useState({});
  // [FIX — bug found during testing] Was missing entirely, which is why
  // Growth demo HTML files got stuck forever on "Loading...": renderFile
  // was called with a hardcoded {} instead of a real content map, so it
  // could never find the fetched content. Same pattern as MVP/MLP below.
  const [growthHtmlContents, setGrowthHtmlContents] = useState({});
  const [revenueHtmlContents, setRevenueHtmlContents] = useState({});
  const [businessPlanHtmlContents, setbusinessPlanHtmlContents] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [hasLiked, setHasLiked] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState(null);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [invitationToken, setInvitationToken] = useState(null);
  // [ADDED 020826] Identity of the invited feedback-giver, looked up directly
  // from the co_founder_invitations record by token — deliberately NOT tied
  // to supabase.auth/session, to avoid re-triggering the identity-mixup bug
  // that the session-based approach caused before (dashboard showing the
  // wrong venture). Used only as a fallback for feedback attribution.
  const [invitedIdentity, setInvitedIdentity] = useState(null);
  // [ADDED 020826] Needed for campaign-scoped duplicate-feedback checking.
  const [campaignId, setCampaignId] = useState(null);
  const [founderPlan, setFounderPlan] = useState(null);
  const [earlyAdopter, setEarlyAdopter] = useState(false); // [EARLY ADOPTER]
  // [NEW — Growth feedback, per project session] Mirrors the MLP rating
  // state below exactly (same slider pattern), one state pair per
  // founder-selectable category plus the fixed always-on questions.
  const [businessModelRating, setBusinessModelRating] = useState(5);
  const [businessModelNote, setBusinessModelNote] = useState('');
  const [coreFeaturesRating, setCoreFeaturesRating] = useState(5);
  const [coreFeaturesNote, setCoreFeaturesNote] = useState('');
  const [valuePropRating, setValuePropRating] = useState(5);
  const [valuePropNote, setValuePropNote] = useState('');
  const [productDefinitionRating, setProductDefinitionRating] = useState(5);
  const [productDefinitionNote, setProductDefinitionNote] = useState('');
  const GROWTH_LOW_SCORE_THRESHOLD = 6; // same threshold convention as PRICING_SCORE_THRESHOLD below
  const [visitedProduct, setVisitedProduct] = useState(null); // 'yes' | 'no' | null (unanswered)
  const [productMatchRating, setProductMatchRating] = useState(5);
  const [productMatchDiffText, setProductMatchDiffText] = useState('');
  const [finalChangeText, setFinalChangeText] = useState('');
  // [NEW] Answer to the founder's own optional custom question (growth_data.custom_question).
  const [customQuestionAnswer, setCustomQuestionAnswer] = useState('');
  const [wantsToFollowGrowth, setWantsToFollowGrowth] = useState(false);
  const [isSubmittingGrowthFeedback, setIsSubmittingGrowthFeedback] = useState(false);
  const [growthFeedbackSubmitted, setGrowthFeedbackSubmitted] = useState(false);

  const [mlpFeedbackText, setMlpFeedbackText] = useState("");
  const [featuresRating, setFeaturesRating] = useState(5);
  const [lookFeelRating, setLookFeelRating] = useState(5);
  const [uxRating, setUxRating] = useState(5);
  // [FIX 020826] Was missing entirely on this page — only the static
  // Pricing display existed here, the actual question was only ever added
  // to venture-feedback-page.jsx. Adding it here too for consistency.
  const PRICING_SCORE_THRESHOLD = 6;
  const [pricingScore, setPricingScore] = useState(null);
  const [pricingNote, setPricingNote] = useState('');
  // [ADDED 020826] Follower — only meaningful/shown for a real logged-in
  // visitor on this page (currentUser), not a token-invited anonymous one
  // (invitedIdentity only) — there's no account to later invite.
  const [wantsToFollow, setWantsToFollow] = useState(false);
  const [isSubmittingMlpFeedback, setIsSubmittingMlpFeedback] = useState(false);
  const [mlpFeedbackSubmitted, setMlpFeedbackSubmitted] = useState(false);
  // [ADDED 020826] Insight Credits project, step 2.
  const [showInsightAnimation, setShowInsightAnimation] = useState(false);

  const loadHtmlFiles = useCallback(async (files, setContentState, context) => {
    if (!files || files.length === 0) return;
    const htmlPromises = files.map(async (file) => {
      const fileName = file?.name || "";
      const fileUrl = file?.url || "";
      const fileExt = fileName.split(".").pop()?.toLowerCase();
      if (["html", "htm"].includes(fileExt) && fileUrl) {
        try {
          const response = await fetch(fileUrl);
          if (!response.ok) return null;
          const text = await response.text();
          return { url: fileUrl, content: text };
        } catch (err) {
          console.error(`Failed to load ${context} HTML from ${fileUrl}:`, err);
          return null;
        }
      }
      return null;
    });
    const results = await Promise.all(htmlPromises);
    const contentMap = {};
    results.forEach((result) => { if (result) contentMap[result.url] = result.content; });
    setContentState(contentMap);
  }, []);

  const loadVenture = useCallback(async (user) => {
    setIsLoading(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("invitation_token");
      const ventureId = urlParams.get("id");

      console.log("[venture-landing] loadVenture", { hasToken: !!token, ventureId, userEmail: user?.email ?? null });

      if (token) {
        const inviteClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          { global: { headers: { "invitation-token": token } } }
        );
        const { data: invite, error: inviteErr } = await inviteClient
          .from("co_founder_invitations")
          .select("venture_id,status,invitee_email,invitation_token,invitation_type")
          .eq("invitation_token", token)
          .maybeSingle();

        if (inviteErr || !invite) { setVenture(null); return; }
        if (!["sent", "accepted"].includes(invite.status)) { setVenture(null); return; }

        const { data: ventures, error: vErr } = await inviteClient
          .from("ventures").select("*").eq("id", String(invite.venture_id));

        if (vErr) { setVenture(null); return; }

        if (ventures && ventures.length > 0) {
          const v = ventures[0];
          setVenture(v);
          if (v.created_by_id) {
            const { data: fp } = await supabase.from('user_profiles').select('plan, early_adopter').eq('id', v.created_by_id).single();
            // [EARLY ADOPTER] load early_adopter flag
            if (fp) { setFounderPlan(fp.plan); setEarlyAdopter(fp.early_adopter === true); }
          }
          if (v.mvp_data?.uploaded_files) await loadHtmlFiles(v.mvp_data.uploaded_files, setMvpHtmlContents, "MVP");
          if (v.mlp_data?.uploaded_files) await loadHtmlFiles(v.mlp_data.uploaded_files, setMlpHtmlContents, "MLP");
          if (v.revenue_model_data?.uploaded_files) await loadHtmlFiles(v.revenue_model_data.uploaded_files, setRevenueHtmlContents, "Revenue");
          if (v.business_plan_data?.uploaded_files) await loadHtmlFiles(v.business_plan_data.uploaded_files, setbusinessPlanHtmlContents, "BP");
          if (v.growth_data?.uploaded_files) await loadHtmlFiles(v.growth_data.uploaded_files, setGrowthHtmlContents, "Growth");
        } else {
          setVenture(null);
        }
        return;
      }

      if (ventureId) {
        const { data: ventures, error } = await supabase.from("ventures").select("*").eq("id", ventureId);
        if (error) throw error;
        if (ventures && ventures.length > 0) {
          const v = ventures[0];
          setVenture(v);
          if (v.created_by_id) {
            const { data: fp } = await supabase.from('user_profiles').select('plan, early_adopter').eq('id', v.created_by_id).single();
            // [EARLY ADOPTER] load early_adopter flag
            if (fp) { setFounderPlan(fp.plan); setEarlyAdopter(fp.early_adopter === true); }
          }
          if (user) {
            setHasLiked(v.liked_by_users?.includes(user.id) || user.liked_venture_ids?.includes(v.id) || false);
          }
          if (v.mvp_data?.uploaded_files) await loadHtmlFiles(v.mvp_data.uploaded_files, setMvpHtmlContents, "MVP");
          if (v.mlp_data?.uploaded_files) await loadHtmlFiles(v.mlp_data.uploaded_files, setMlpHtmlContents, "MLP");
          if (v.revenue_model_data?.uploaded_files) await loadHtmlFiles(v.revenue_model_data.uploaded_files, setRevenueHtmlContents, "Revenue");
          if (v.business_plan_data?.uploaded_files) await loadHtmlFiles(v.business_plan_data.uploaded_files, setbusinessPlanHtmlContents, "BP");
          if (v.growth_data?.uploaded_files) await loadHtmlFiles(v.growth_data.uploaded_files, setGrowthHtmlContents, "Growth");
        } else {
          setVenture(null);
        }
      } else {
        setVenture(null);
      }
    } catch (error) {
      console.error("Error loading venture:", error);
      setVenture(null);
    } finally {
      setIsLoading(false);
    }
  }, [loadHtmlFiles]);

  const handleJoinAsCofounder = useCallback(async () => {
    setJoinError(null);
    if (!currentUser) {
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return;
    }
    if (!invitationToken) { setJoinError("Missing invitation token in URL."); return; }
    setIsJoining(true);
    try {
      const { data, error } = await supabase.rpc("accept_co_founder_invite", {
        p_user_id: String(currentUser.id),
        p_invitation_token: invitationToken,
      });
      if (error) throw error;
      if (data?.error) { setJoinError(data.error); return; }
      if (data?.status === "success") {
        setJoinSuccess(true);
        await loadVenture(currentUser);
        window.location.href = "/dashboard";
        return;
      }
      setJoinError("Unexpected response from server.");
    } catch (e) {
      setJoinError(e?.message || "Failed to join venture.");
    } finally {
      setIsJoining(false);
    }
  }, [currentUser, invitationToken, loadVenture]);

  useEffect(() => {
    const fetchUserAndVenture = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("invitation_token");
      setInvitationToken(token);
      if (token) {
        setCurrentUser(null);
        // [FIX 020826] Previously this branch only blanked the user and
        // stopped — feedback given via an invitation link had no way to be
        // attributed to anyone, even though the invitee's identity is
        // already known at this point (stored on the invitation record
        // itself when the invite was sent from promotion-center).
        // This looks that identity up directly by token, WITHOUT touching
        // supabase.auth/session — deliberately isolated from the mechanism
        // that caused the earlier dashboard identity-mixup bug.
        try {
          const { data: invitation } = await supabase
            .from('co_founder_invitations')
            .select('invitee_email, invitee_name')
            .eq('invitation_token', token)
            .single();
          if (invitation) {
            setInvitedIdentity({
              email: invitation.invitee_email || null,
              name: invitation.invitee_name || null,
            });
          }
        } catch (err) {
          console.error('[VentureLanding] Could not resolve invitation identity:', err);
        }
        await loadVenture(null);
        return;
      }
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      const user = userErr ? null : (userData?.user ?? null);
      setCurrentUser(user);
      setCampaignId(urlParams.get("campaign"));
      if (urlParams.get("welcome") === "true") {
        setShowWelcome(true);
        const ventureId = urlParams.get("id");
        window.history.replaceState({}, document.title, window.location.pathname + (ventureId ? `?id=${ventureId}` : ""));
      }
      await loadVenture(user);
    };
    fetchUserAndVenture();
  }, [loadVenture]);

  // [ADDED 020826] Insight Credits project, step 1 — same anti-abuse guards
  // as venture-feedback/page.jsx, adapted for this page's two visitor types:
  // a logged-in visitor (currentUser, matched by id) or a token-invited
  // visitor (invitedIdentity, matched by email only — there's no real user
  // id for an anonymous invitee).
  const [isOwnVenture, setIsOwnVenture] = useState(false);
  const [alreadyGaveMvpFeedback, setAlreadyGaveMvpFeedback] = useState(false);
  const [alreadyGaveMlpFeedback, setAlreadyGaveMlpFeedback] = useState(false);
  // [NEW — Growth] Per the implementation plan's Stage 2 decision: Growth
  // feedback lives in its own `growth_feedback` table, not product_feedback.
  // No `stage` column workaround needed anymore — this check is a plain,
  // separate query against the new table, same shape as the MVP/MLP checks.
  const [alreadyGaveGrowthFeedback, setAlreadyGaveGrowthFeedback] = useState(false);

  useEffect(() => {
    if (!venture || (!currentUser && !invitedIdentity?.email)) return;
    const checkAbuseGuards = async () => {
      const founderIds = venture.founder_user_ids || [];
      const isOwner = currentUser
        ? (venture.created_by_id === currentUser.id || founderIds.includes(currentUser.id))
        : (venture.created_by === invitedIdentity.email);
      setIsOwnVenture(isOwner);
      if (isOwner) return;

      // [FIX 020826] Duplicate feedback: now scoped by campaign_id, not
      // venture_id — a new campaign is a legitimate new opportunity to give
      // feedback again on the same venture. Falls back to venture-wide only
      // when there's no campaign context (e.g. a token invite with no
      // campaign attached).
      const identityFilter = (q) => currentUser ? q.eq('created_by_id', currentUser.id) : q.eq('created_by', invitedIdentity.email);
      const mvpBase = identityFilter(supabase.from('mvp_feature_feedback').select('id', { count: 'exact', head: true }));
      const mlpBase = identityFilter(supabase.from('product_feedback').select('id', { count: 'exact', head: true }));
      const growthBase = identityFilter(supabase.from('growth_feedback').select('id', { count: 'exact', head: true }));
      const [mvpCheck, mlpCheck, growthCheck] = campaignId
        ? await Promise.all([mvpBase.eq('campaign_id', campaignId), mlpBase.eq('campaign_id', campaignId), growthBase.eq('campaign_id', campaignId)])
        : await Promise.all([mvpBase.eq('venture_id', venture.id), mlpBase.eq('venture_id', venture.id), growthBase.eq('venture_id', venture.id)]);
      setAlreadyGaveMvpFeedback((mvpCheck.count || 0) > 0);
      setAlreadyGaveMlpFeedback((mlpCheck.count || 0) > 0);
      setAlreadyGaveGrowthFeedback((growthCheck.count || 0) > 0);
    };
    checkAbuseGuards();
  }, [venture, currentUser, invitedIdentity, campaignId]);


  const handleLike = async () => {
    if (!currentUser) { alert("Please log in to like this venture."); return; }
    if (venture.created_by === currentUser.email) { alert("You cannot like your own venture!"); return; }
    if (hasLiked) { alert("You have already liked this venture!"); return; }
    try {
      setHasLiked(true);
      const newLikesCount = (venture.likes_count || 0) + 1;
      setVenture((prev) => ({ ...prev, likes_count: newLikesCount }));
      const { error: updateError } = await supabase.from("ventures").update({ likes_count: newLikesCount }).eq("id", venture.id);
      if (updateError) throw updateError;
      const { error: messageError } = await supabase.from("venture_messages").insert([{
        venture_id: venture.id,
        message_type: "like_notification",
        title: "Someone Liked Your Venture!",
        content: `A user from the community liked your venture "${venture.name}". Keep up the great work!`,
        from_venture_id: null,
        from_venture_name: currentUser.full_name || currentUser.email,
        from_venture_landing_page_url: null,
        phase: venture.phase,
        priority: 1,
      }]);
      if (messageError) throw messageError;
      alert("Thank you for liking this venture!");
    } catch (error) {
      console.error("Error liking venture:", error);
      setHasLiked(false);
      setVenture((prev) => ({ ...prev, likes_count: (prev.likes_count || 1) - 1 }));
      alert("There was an error recording your like. Please try again.");
    }
  };

  const handleInteractiveFeedbackSubmitted = async () => { await loadVenture(currentUser); };

  const handleMlpFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!venture) return;
    setIsSubmittingMlpFeedback(true);
    try {
      const now = new Date().toISOString();
      // [FIX 020826] Bypassing ProductFeedbackEntity.create() entirely —
      // it appears to silently drop or mishandle created_date/updated_date
      // once created_by/created_by_id are present, and guessing at its
      // internal behavior twice didn't resolve it. Inserting directly via
      // supabase (already used elsewhere in this file) removes that
      // uncertainty — every column is explicit, nothing is auto-filled
      // behind the scenes.
      const { error: insertError } = await supabase.from('product_feedback').insert({
        id: crypto.randomUUID(),
        created_date: now,
        updated_date: now,
        venture_id: venture.id,
        feedback_text: mlpFeedbackText.trim(),
        feedback_type: "other",
        features_rating: featuresRating,
        look_feel_rating: lookFeelRating,
        ux_rating: uxRating,
        pricing_score: pricingScore,
        pricing_note: pricingScore !== null && pricingScore < PRICING_SCORE_THRESHOLD ? (pricingNote.trim() || null) : null,
        created_by: currentUser ? currentUser.email : (invitedIdentity?.email || null),
        created_by_id: currentUser ? currentUser.id : null,
      });
      if (insertError) throw insertError;
      setMlpFeedbackSubmitted(true);
      setMlpFeedbackText("");

      // [ADDED 020826] Follower — same fire-and-forget pattern as
      // venture-feedback/page.jsx. Only for a real logged-in visitor.
      if (wantsToFollow && currentUser) {
        supabase.from('venture_followers').insert({
          venture_id: venture.id,
          user_id: currentUser.id,
        }).then(({ error: followError }) => {
          if (followError && followError.code !== '23505') {
            console.error('Could not save Follower:', followError);
          }
        });
        // [ADDED 020826] Dashboard notification — created_by_id holds the
        // follower's own id, so clicking "View Profile" can look them up.
        supabase.from('venture_messages').insert({
          id: crypto.randomUUID(),
          created_date: new Date().toISOString(),
          venture_id: venture.id,
          message_type: 'follower_joined',
          title: '👋 New Follower!',
          content: 'Someone who reviewed your MLP wants to keep contributing to this venture.',
          priority: 3,
          is_dismissed: false,
          created_by_id: currentUser.id,
        }).then(({ error: msgError }) => {
          if (msgError) console.error('Could not create follower notification:', msgError);
        });
      }

      // [ADDED 020826] Insight Credits project, step 2 — only for a real
      // logged-in founder. Token-invited anonymous reviewers (invitedIdentity
      // only, currentUser null) have no profile to credit.
      if (currentUser) {
        supabase.rpc('increment_insight_credits', { p_user_id: currentUser.id, p_amount: 3 })
          .then(() => setShowInsightAnimation(true))
          .catch((err) => console.error('Could not award Insight Credits:', err));
      }
    } catch (err) {
      console.error("Error submitting MLP feedback:", err);
      alert("There was an error submitting your feedback. Please try again.");
    }
    setIsSubmittingMlpFeedback(false);
  };

  // [NEW — Growth] Mirrors handleMlpFeedbackSubmit's structure exactly:
  // direct supabase insert (not the entity helper, same reason noted above
  // it), Follower + Insight Credits as fire-and-forget side effects only for
  // a real logged-in currentUser.
  //
  // [FIX per implementation plan Stage 2] Writes to the new, separate
  // `growth_feedback` table instead of product_feedback — no more invented
  // `stage` column workaround. DB DEPENDENCY: this table needs to exist per
  // the plan's schema (see growth-feature-implementation-plan.md) — not yet
  // confirmed created in the real database.
  const handleGrowthFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!venture) return;
    const gd = venture.growth_data || {};
    // [FIX] Only require an answer to "did you visit the product?" when
    // there's actually a product_url to visit — a founder who journeyed
    // here without a live product yet shouldn't have this block submission.
    if (gd.product_url && !visitedProduct) {
      alert("Please answer whether you visited the actual product.");
      return;
    }
    setIsSubmittingGrowthFeedback(true);
    try {
      const now = new Date().toISOString();
      const selected = gd.selected_categories || [];
      const { error: insertError } = await supabase.from('growth_feedback').insert({
        id: crypto.randomUUID(),
        created_date: now,
        updated_date: now,
        venture_id: venture.id,
        business_model_rating: selected.includes('business_model') ? businessModelRating : null,
        business_model_note: selected.includes('business_model') && businessModelRating < GROWTH_LOW_SCORE_THRESHOLD ? (businessModelNote.trim() || null) : null,
        core_features_rating: selected.includes('core_features') ? coreFeaturesRating : null,
        core_features_note: selected.includes('core_features') && coreFeaturesRating < GROWTH_LOW_SCORE_THRESHOLD ? (coreFeaturesNote.trim() || null) : null,
        value_prop_rating: selected.includes('value_proposition') ? valuePropRating : null,
        value_prop_note: selected.includes('value_proposition') && valuePropRating < GROWTH_LOW_SCORE_THRESHOLD ? (valuePropNote.trim() || null) : null,
        product_definition_rating: selected.includes('product_definition') ? productDefinitionRating : null,
        product_definition_note: selected.includes('product_definition') && productDefinitionRating < GROWTH_LOW_SCORE_THRESHOLD ? (productDefinitionNote.trim() || null) : null,
        visited_product: gd.product_url ? visitedProduct : null,
        product_match_rating: gd.product_url && visitedProduct === 'yes' ? productMatchRating : null,
        product_match_diff_text: gd.product_url && visitedProduct === 'yes' ? (productMatchDiffText.trim() || null) : null,
        final_change_text: finalChangeText.trim() || null,
        custom_question_answer: gd.custom_question ? (customQuestionAnswer.trim() || null) : null,
        created_by: currentUser ? currentUser.email : (invitedIdentity?.email || null),
        created_by_id: currentUser ? currentUser.id : null,
        campaign_id: campaignId || null,
      });
      if (insertError) throw insertError;
      setGrowthFeedbackSubmitted(true);

      // Follower — identical pattern to the MLP handler above.
      if (wantsToFollowGrowth && currentUser) {
        supabase.from('venture_followers').insert({
          venture_id: venture.id,
          user_id: currentUser.id,
        }).then(({ error: followError }) => {
          if (followError && followError.code !== '23505') {
            console.error('Could not save Follower:', followError);
          }
        });
        supabase.from('venture_messages').insert({
          id: crypto.randomUUID(),
          created_date: new Date().toISOString(),
          venture_id: venture.id,
          message_type: 'follower_joined',
          title: '👋 New Follower!',
          content: 'Someone who reviewed your Growth page wants to keep contributing to this venture.',
          priority: 3,
          is_dismissed: false,
          created_by_id: currentUser.id,
        }).then(({ error: msgError }) => {
          if (msgError) console.error('Could not create follower notification:', msgError);
        });
      }

      // Insight Credits — identical pattern to the MLP handler above.
      if (currentUser) {
        supabase.rpc('increment_insight_credits', { p_user_id: currentUser.id, p_amount: 3 })
          .then(() => setShowInsightAnimation(true))
          .catch((err) => console.error('Could not award Insight Credits:', err));
      }
    } catch (err) {
      console.error("Error submitting Growth feedback:", err);
      alert("There was an error submitting your feedback. Please try again.");
    }
    setIsSubmittingGrowthFeedback(false);
  };

  const getSectorLabel = (sector) => {
    const labels = {
      ai_deep_tech: "AI / Deep Tech", fintech: "FinTech",
      digital_health_biotech: "Digital Health / Biotech", b2b_saas: "B2B SaaS",
      consumer_apps: "Consumer Apps / Marketplaces", climatetech_energy: "ClimateTech / Energy / AgriTech",
      web3_blockchain: "Web3 / Blockchain",
    };
    return labels[sector] || sector;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!venture) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Venture Not Found</h1>
          <p className="text-gray-600">The venture you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const isMLPMode = venture.mlp_development_completed && venture.mlp_data;
  // [NEW — Growth] No "_completed" flag, per this session's confirmation
  // that Beta has no equivalent flag either (mlp_development_completed is
  // the exception, not the pattern) — gated on having actually selected at
  // least one feedback category instead.
  const isGrowthMode = venture.growth_data && Array.isArray(venture.growth_data.selected_categories) && venture.growth_data.selected_categories.length > 0;
  const hasSelectedFeaturesForMVPFeedback =
    venture.mvp_uploaded && venture.mvp_data &&
    Array.isArray(venture.mvp_data.feature_matrix) &&
    venture.mvp_data.feature_matrix.some((f) => f.isSelected);

  return (
    <>
      {showWelcome && <WelcomeOverlay ventureName={venture.name} onClose={() => setShowWelcome(false)} />}

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <main className="max-w-5xl mx-auto p-4 md:p-8">

          {isMLPMode ? (
            <>
              {/* [FIX 020826] Redesigned per the same direction applied to
                  MVP mode — replaced the loud purple/pink/indigo gradient
                  hero with the same calm, centered header style, so both
                  modes feel like one consistent product, not two different
                  skins. Static content only — the feedback form below is
                  untouched. */}
              <div className="text-center border-b border-gray-200 pb-6 mb-10">
                <div className="flex items-center justify-center flex-wrap gap-3 mb-3">
                  <h1 className="text-2xl md:text-3xl font-semibold text-amber-600">{venture.name}</h1>
                  {venture.sector && venture.sector !== 'not_sure' && venture.sector !== 'other' && (
                    <span className="text-xs text-gray-500 border border-gray-300 px-3 py-1 rounded-full">
                      {getSectorLabel(venture.sector)}
                    </span>
                  )}
                </div>
                <p className="text-base md:text-lg font-medium text-indigo-600 max-w-xl mx-auto">{venture.description}</p>
              </div>

              {/* MLP Content — only the two fields marked public in the
                  builder show up here. feedback_analysis and
                  enhancement_plan are internal-only and never render. */}
              {venture.mlp_data.lovable_experience && (
                <div className="mb-10 border border-gray-200 rounded-xl p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 flex items-center gap-2 mb-3">
                    <Heart className="w-4 h-4 text-gray-400" />
                    Why you'll love this
                  </p>
                  <ReadMoreText text={venture.mlp_data.lovable_experience} />
                </div>
              )}

              {/* [ADDED 020826] Pricing — shown to visitors, matching the
                  same packages set in mlp-development-center and used in
                  ZigForge Studio's Business Model screen, so the story stays
                  consistent everywhere it appears. */}
              {venture.mlp_data.pricing_packages && venture.mlp_data.pricing_packages.length > 0 && (
                <div className="mb-10 border border-gray-200 rounded-xl p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 flex items-center gap-2 mb-4">
                    <span className="text-base">💰</span>
                    Pricing
                  </p>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {venture.mlp_data.pricing_packages.map((pkg, i) => (
                      <div key={i} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="font-semibold text-gray-900">{pkg.name}</p>
                          <p className="text-lg font-bold text-indigo-600">${pkg.price}</p>
                        </div>
                        <p className="text-sm text-gray-500">{pkg.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MLP Files */}
              {venture.mlp_data.uploaded_files && venture.mlp_data.uploaded_files.length > 0 && (
                <div className="mb-10">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2 text-center">Product showcase</h3>
                  {venture.mlp_data.visual_prototype && (
                    <p className="text-center text-gray-600 max-w-2xl mx-auto mb-6">{venture.mlp_data.visual_prototype}</p>
                  )}
                  <div className="space-y-4">
                    {venture.mlp_data.uploaded_files.map((file, index) => renderFile(file, index, mlpHtmlContents))}
                  </div>
                </div>
              )}

              {/* MLP Feedback Form */}
              <Card className="max-w-2xl mx-auto shadow-xl mb-12 border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-indigo-800">
                    <MessageSquare className="w-5 h-5 text-indigo-600" />
                    Share Your Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isOwnVenture ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 font-medium">You can't give feedback on your own venture.</p>
                    </div>
                  ) : alreadyGaveMlpFeedback && !mlpFeedbackSubmitted ? (
                    <div className="text-center py-6">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <p className="text-green-700 font-semibold text-lg">You've already given feedback on this MLP. Thank you!</p>
                    </div>
                  ) : mlpFeedbackSubmitted ? (
                    <div className="text-center py-6">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <p className="text-green-700 font-semibold text-lg">Thank you for your feedback!</p>
                      <p className="text-gray-500 text-sm mt-1">Your response helps the team improve their product.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleMlpFeedbackSubmit} className="space-y-6">
                      <div>
                        <Label className="text-sm">Features (1-10)</Label>
                        <Slider
                          value={[featuresRating]}
                          onValueChange={(value) => setFeaturesRating(value[0])}
                          max={10} min={1} step={1}
                          disabled={isSubmittingMlpFeedback}
                          className="mt-2 mb-1
                            [&>span]:h-2 [&>span]:bg-gray-200 [&>span]:rounded-full
                            [&>span>span]:bg-indigo-600 [&>span>span]:rounded-full
                            [&_[role=slider]]:h-5 [&_[role=slider]]:w-5
                            [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-indigo-600
                            [&_[role=slider]]:shadow-md"
                        />
                        <div className="text-center text-sm font-semibold text-indigo-600">{featuresRating}</div>
                      </div>
                      <div>
                        <Label className="text-sm">Look &amp; Feel (1-10)</Label>
                        <Slider
                          value={[lookFeelRating]}
                          onValueChange={(value) => setLookFeelRating(value[0])}
                          max={10} min={1} step={1}
                          disabled={isSubmittingMlpFeedback}
                          className="mt-2 mb-1
                            [&>span]:h-2 [&>span]:bg-gray-200 [&>span]:rounded-full
                            [&>span>span]:bg-indigo-600 [&>span>span]:rounded-full
                            [&_[role=slider]]:h-5 [&_[role=slider]]:w-5
                            [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-indigo-600
                            [&_[role=slider]]:shadow-md"
                        />
                        <div className="text-center text-sm font-semibold text-indigo-600">{lookFeelRating}</div>
                      </div>
                      <div>
                        <Label className="text-sm">User Experience (1-10)</Label>
                        <Slider
                          value={[uxRating]}
                          onValueChange={(value) => setUxRating(value[0])}
                          max={10} min={1} step={1}
                          disabled={isSubmittingMlpFeedback}
                          className="mt-2 mb-1
                            [&>span]:h-2 [&>span]:bg-gray-200 [&>span]:rounded-full
                            [&>span>span]:bg-indigo-600 [&>span>span]:rounded-full
                            [&_[role=slider]]:h-5 [&_[role=slider]]:w-5
                            [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-indigo-600
                            [&_[role=slider]]:shadow-md"
                        />
                        <div className="text-center text-sm font-semibold text-indigo-600">{uxRating}</div>
                      </div>
                      {/* [FIX 020826] Was missing entirely — the Pricing
                          section above already shows the packages, this is
                          just the question (no duplicate package list, same
                          fix applied to venture-feedback-page.jsx). */}
                      {venture.mlp_data?.pricing_packages && venture.mlp_data.pricing_packages.length > 0 && (
                        <div className="border border-gray-200 rounded-xl p-4">
                          <Label className="text-sm">Does this pricing feel reasonable and fitting for what you'd get? (1-10)</Label>
                          <Slider
                            value={[pricingScore ?? 5]}
                            onValueChange={(value) => setPricingScore(value[0])}
                            max={10} min={1} step={1}
                            disabled={isSubmittingMlpFeedback}
                            className="mt-2 mb-1
                              [&>span]:h-2 [&>span]:bg-gray-200 [&>span]:rounded-full
                              [&>span>span]:bg-indigo-600 [&>span>span]:rounded-full
                              [&_[role=slider]]:h-5 [&_[role=slider]]:w-5
                              [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-indigo-600
                              [&_[role=slider]]:shadow-md"
                          />
                          <div className="text-center text-sm font-semibold text-indigo-600">{pricingScore ?? 5}</div>
                          {pricingScore !== null && pricingScore < PRICING_SCORE_THRESHOLD && (
                            <div className="mt-2">
                              <Label className="text-xs text-gray-500">What would make this pricing feel more reasonable? (optional)</Label>
                              <Textarea
                                value={pricingNote}
                                onChange={(e) => setPricingNote(e.target.value)}
                                placeholder="Share your thoughts..."
                                className="min-h-[60px] mt-1 text-sm"
                                disabled={isSubmittingMlpFeedback}
                              />
                            </div>
                          )}
                        </div>
                      )}
                      {/* [ADDED 020826] Follower checkbox — only shown for a
                          real logged-in visitor (currentUser), since a
                          token-invited anonymous reviewer has no account to
                          later invite. Always unchecked by default. */}
                      {currentUser && (
                        <label className="flex items-start gap-2 text-sm text-gray-600 cursor-pointer select-none border border-gray-200 rounded-lg p-3">
                          <input
                            type="checkbox"
                            checked={wantsToFollow}
                            onChange={(e) => setWantsToFollow(e.target.checked)}
                            disabled={isSubmittingMlpFeedback}
                            className="w-4 h-4 mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>
                            <span className="font-medium text-gray-800">Become a Follower</span>
                            <br />
                            <span className="text-xs text-gray-400">Get invited to future feedback rounds or Beta testing.</span>
                          </span>
                        </label>
                      )}
                      <div>
                        <Label htmlFor="mlp-feedback">Anything specific you want to add? (optional)</Label>
                        <Textarea id="mlp-feedback" value={mlpFeedbackText}
                          onChange={(e) => setMlpFeedbackText(e.target.value)}
                          placeholder="Your feedback helps make this product even better..."
                          className="min-h-[80px] mt-2" disabled={isSubmittingMlpFeedback} />
                      </div>
                      <Button type="submit" disabled={isSubmittingMlpFeedback}
                        className="w-full bg-indigo-600 hover:bg-indigo-700">
                        {isSubmittingMlpFeedback
                          ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                          : <><Send className="w-4 h-4 mr-2" /> Send Feedback</>
                        }
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </>
          ) : isGrowthMode ? (
            <>
              {/* Header — venture name + social icons together, then
                  Slogan. [FIX] Social links were floating awkwardly below
                  the "Visit the actual product" button — moved to sit
                  right next to the venture name instead, where identity
                  info belongs. */}
              <div className="text-center pb-6 mb-8">
                <div className="flex items-center justify-center flex-wrap gap-3 mb-3">
                  <h1 className="text-2xl md:text-3xl font-semibold text-amber-600">{venture.name}</h1>
                  {venture.sector && venture.sector !== 'not_sure' && venture.sector !== 'other' && (
                    <span className="text-xs text-gray-500 border border-gray-300 px-3 py-1 rounded-full">
                      {getSectorLabel(venture.sector)}
                    </span>
                  )}
                  {venture.growth_data.social_links && Object.values(venture.growth_data.social_links).some(v => v) && (
                    <div className="flex items-center gap-2.5">
                      {venture.growth_data.social_links.linkedin && (
                        <a href={venture.growth_data.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-600" aria-label="LinkedIn">
                          <Linkedin className="w-4 h-4" />
                        </a>
                      )}
                      {venture.growth_data.social_links.facebook && (
                        <a href={venture.growth_data.social_links.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-600" aria-label="Facebook">
                          <Facebook className="w-4 h-4" />
                        </a>
                      )}
                      {venture.growth_data.social_links.twitter && (
                        <a href={venture.growth_data.social_links.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-600" aria-label="Twitter / X">
                          <Twitter className="w-4 h-4" />
                        </a>
                      )}
                      {venture.growth_data.social_links.instagram && (
                        <a href={venture.growth_data.social_links.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-600" aria-label="Instagram">
                          <Instagram className="w-4 h-4" />
                        </a>
                      )}
                      {venture.growth_data.social_links.website && (
                        <a href={venture.growth_data.social_links.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-600" aria-label="Website">
                          <Globe className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
                {venture.growth_data.headline && (
                  <p className="text-lg md:text-xl font-semibold text-indigo-700 max-w-xl mx-auto">{venture.growth_data.headline}</p>
                )}
              </div>

              {/* [ALWAYS SHOWN — not gated by selected_categories] */}
              {venture.growth_data.description && (
                <div className="mb-8 max-w-2xl mx-auto text-center">
                  <ReadMoreText text={venture.growth_data.description} />
                </div>
              )}
              {venture.growth_data.product_url && (
                <div className="text-center mb-8">
                  <a href={venture.growth_data.product_url} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      <ExternalLink className="w-4 h-4 mr-2" /> Visit the actual product
                    </Button>
                  </a>
                </div>
              )}

              {/* [FIX] "Demo" heading removed per explicit request. */}
              {venture.growth_data.uploaded_files && venture.growth_data.uploaded_files.length > 0 && (
                <div className="mb-10">
                  <div className="space-y-4">
                    {venture.growth_data.uploaded_files.map((file, index) => renderFile(file, index, growthHtmlContents, true))}
                  </div>
                </div>
              )}

              {/* Growth Feedback Form */}
              <Card className="max-w-2xl mx-auto shadow-xl mb-12 border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-indigo-800">
                    <MessageSquare className="w-5 h-5 text-indigo-600" />
                    Share Your Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* [TEMP — TESTING ONLY, MUST BE RESTORED] isOwnVenture
                      check disabled here because there's currently no way
                      to view this page as a non-owner (no separate
                      test/reviewer account or sharing flow set up yet).
                      Bypassed with `false &&` so the original condition is
                      still visible and easy to re-enable — just delete
                      `false && ` below to restore real behavior. */}
                  {false && isOwnVenture ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 font-medium">You can't give feedback on your own venture.</p>
                    </div>
                  ) : alreadyGaveGrowthFeedback && !growthFeedbackSubmitted ? (
                    <div className="text-center py-6">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <p className="text-green-700 font-semibold text-lg">You've already given feedback on this Growth page. Thank you!</p>
                    </div>
                  ) : growthFeedbackSubmitted ? (
                    <div className="text-center py-6">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <p className="text-green-700 font-semibold text-lg">Thank you for your feedback!</p>
                      <p className="text-gray-500 text-sm mt-1">Your response helps the founder communicate this product more accurately.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleGrowthFeedbackSubmit} className="space-y-5">

                      {/* --- Founder's own custom question — shown FIRST, per explicit request --- */}
                      {venture.growth_data.custom_question && (
                        <div className="border border-violet-200 bg-violet-50/50 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <HelpCircle className="w-5 h-5 text-violet-600" />
                            <p className="text-xs font-bold uppercase tracking-wide text-violet-700">A question from the founder</p>
                          </div>
                          <MobileQuestionSheet label={venture.growth_data.custom_question} summary={customQuestionAnswer ? "Answered" : null} isMobile={isMobileViewport}>
                            <p className="text-sm font-medium text-gray-900 mb-2">{venture.growth_data.custom_question}</p>
                            <Textarea value={customQuestionAnswer} onChange={(e) => setCustomQuestionAnswer(e.target.value)} className="min-h-[80px] text-sm" disabled={isSubmittingGrowthFeedback} placeholder="Your answer..." />
                          </MobileQuestionSheet>
                        </div>
                      )}

                      {/* --- Business Model (conditional on founder selection) --- */}
                      {venture.growth_data.selected_categories.includes('business_model') && venture.growth_data.business_model_data && (
                        <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <DollarSign className="w-5 h-5 text-emerald-600" />
                            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Business Model</p>
                          </div>
                          {(() => {
                            const bmd = venture.growth_data.business_model_data;
                            const modelLabels = { subscription: 'Subscription', freemium: 'Freemium', transactional: 'Transactional', 'ad-driven': 'Ad-Driven' };
                            return (
                              <div className="mb-3">
                                <p className="text-xs font-semibold text-gray-500 mb-2">{modelLabels[bmd.model_type] || bmd.model_type}</p>
                                {(bmd.model_type === 'subscription' || bmd.model_type === 'freemium') && (
                                  <div className="grid sm:grid-cols-2 gap-3">
                                    {bmd.tier1_price && (
                                      <div className="border border-emerald-200 bg-white rounded-lg p-3">
                                        <p className="font-semibold text-gray-900">{bmd.tier1_price}</p>
                                        <p className="text-sm text-gray-500">{bmd.tier1_description}</p>
                                      </div>
                                    )}
                                    {bmd.tier2_price && (
                                      <div className="border border-emerald-200 bg-white rounded-lg p-3">
                                        <p className="font-semibold text-gray-900">{bmd.tier2_price}</p>
                                        <p className="text-sm text-gray-500">{bmd.tier2_description}</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                                {bmd.model_type === 'transactional' && (
                                  <p className="text-sm text-gray-600">{bmd.transaction_fee_description}</p>
                                )}
                                {bmd.model_type === 'ad-driven' && (
                                  <p className="text-sm text-gray-600">Free to use.</p>
                                )}
                              </div>
                            );
                          })()}
                          <MobileQuestionSheet label="Business Model fit" summary={businessModelRating} isMobile={isMobileViewport}>
                            <Label className="text-sm">How well does this business model fit the product and the value it provides? (1-10)</Label>
                            <Slider
                              value={[businessModelRating]}
                              onValueChange={(value) => setBusinessModelRating(value[0])}
                              max={10} min={1} step={1}
                              disabled={isSubmittingGrowthFeedback}
                              className="mt-2 mb-1
                                [&>span]:h-2 [&>span]:bg-gray-200 [&>span]:rounded-full
                                [&>span>span]:bg-emerald-600 [&>span>span]:rounded-full
                                [&_[role=slider]]:h-5 [&_[role=slider]]:w-5
                                [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-emerald-600
                                [&_[role=slider]]:shadow-md"
                            />
                            <div className="text-center text-sm font-semibold text-emerald-700">{businessModelRating}</div>
                            {businessModelRating < GROWTH_LOW_SCORE_THRESHOLD && (
                              <div className="mt-2">
                                <Label className="text-xs text-gray-500">What doesn't feel right about it? (optional)</Label>
                                <Textarea value={businessModelNote} onChange={(e) => setBusinessModelNote(e.target.value)} className="min-h-[60px] mt-1 text-sm" disabled={isSubmittingGrowthFeedback} />
                              </div>
                            )}
                          </MobileQuestionSheet>
                        </div>
                      )}

                      {/* --- Core Features (conditional) — shown together, rated once --- */}
                      {venture.growth_data.selected_categories.includes('core_features') && venture.growth_data.core_features && venture.growth_data.core_features.length > 0 && (
                        <div className="border border-sky-200 bg-sky-50/40 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Layers className="w-5 h-5 text-sky-600" />
                            <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Core Features</p>
                          </div>
                          <div className="space-y-2 mb-3">
                            {venture.growth_data.core_features.map((f) => (
                              <div key={f.id} className="border border-sky-200 bg-white rounded-lg p-3">
                                <p className="font-semibold text-gray-900">{f.name}</p>
                                <p className="text-sm text-gray-500">{f.description}</p>
                              </div>
                            ))}
                          </div>
                          <MobileQuestionSheet label="Do these features fit?" summary={coreFeaturesRating} isMobile={isMobileViewport}>
                            <Label className="text-sm">How well do these features support what this product is meant to do? (1-10)</Label>
                            <Slider
                              value={[coreFeaturesRating]}
                              onValueChange={(value) => setCoreFeaturesRating(value[0])}
                              max={10} min={1} step={1}
                              disabled={isSubmittingGrowthFeedback}
                              className="mt-2 mb-1
                                [&>span]:h-2 [&>span]:bg-gray-200 [&>span]:rounded-full
                                [&>span>span]:bg-sky-600 [&>span>span]:rounded-full
                                [&_[role=slider]]:h-5 [&_[role=slider]]:w-5
                                [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-sky-600
                                [&_[role=slider]]:shadow-md"
                            />
                            <div className="text-center text-sm font-semibold text-sky-700">{coreFeaturesRating}</div>
                            {coreFeaturesRating < GROWTH_LOW_SCORE_THRESHOLD && (
                              <div className="mt-2">
                                <Label className="text-xs text-gray-500">What would you add, remove, or change about these features? (optional)</Label>
                                <Textarea value={coreFeaturesNote} onChange={(e) => setCoreFeaturesNote(e.target.value)} className="min-h-[60px] mt-1 text-sm" disabled={isSubmittingGrowthFeedback} />
                              </div>
                            )}
                          </MobileQuestionSheet>
                        </div>
                      )}

                      {/* --- Slogan (was "Value Proposition") — slogan shown again here, not just referenced --- */}
                      {venture.growth_data.selected_categories.includes('value_proposition') && (
                        <div className="border border-amber-200 bg-amber-50/40 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Megaphone className="w-5 h-5 text-amber-600" />
                            <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Slogan</p>
                          </div>
                          <blockquote className="border-l-4 border-amber-400 bg-white rounded-r-lg p-3 mb-3 italic text-gray-800">
                            "{venture.growth_data.headline}"
                          </blockquote>
                          <MobileQuestionSheet label="Does the slogan land?" summary={valuePropRating} isMobile={isMobileViewport}>
                            <Label className="text-sm">How accurately does this statement describe the product you just saw? (1-10)</Label>
                            <Slider
                              value={[valuePropRating]}
                              onValueChange={(value) => setValuePropRating(value[0])}
                              max={10} min={1} step={1}
                              disabled={isSubmittingGrowthFeedback}
                              className="mt-2 mb-1
                                [&>span]:h-2 [&>span]:bg-gray-200 [&>span]:rounded-full
                                [&>span>span]:bg-amber-500 [&>span>span]:rounded-full
                                [&_[role=slider]]:h-5 [&_[role=slider]]:w-5
                                [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-amber-500
                                [&_[role=slider]]:shadow-md"
                            />
                            <div className="text-center text-sm font-semibold text-amber-700">{valuePropRating}</div>
                            {valuePropRating < GROWTH_LOW_SCORE_THRESHOLD && (
                              <div className="mt-2">
                                <Label className="text-xs text-gray-500">What would you change? (optional)</Label>
                                <Textarea value={valuePropNote} onChange={(e) => setValuePropNote(e.target.value)} className="min-h-[60px] mt-1 text-sm" disabled={isSubmittingGrowthFeedback} />
                              </div>
                            )}
                          </MobileQuestionSheet>
                        </div>
                      )}

                      {/* --- Product Definition (conditional) --- */}

                      {venture.growth_data.selected_categories.includes('product_definition') && (
                        <div className="border border-rose-200 bg-rose-50/40 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <FileText className="w-5 h-5 text-rose-600" />
                            <p className="text-xs font-bold uppercase tracking-wide text-rose-700">Product Definition</p>
                          </div>
                          <MobileQuestionSheet label="Is the description clear?" summary={productDefinitionRating} isMobile={isMobileViewport}>
                          <Label className="text-sm">How clearly and accurately is this product defined? (1-10)</Label>
                          <p className="text-xs text-gray-400 mb-1">Referring to the description above.</p>
                          <Slider
                            value={[productDefinitionRating]}
                            onValueChange={(value) => setProductDefinitionRating(value[0])}
                            max={10} min={1} step={1}
                            disabled={isSubmittingGrowthFeedback}
                            className="mt-2 mb-1
                              [&>span]:h-2 [&>span]:bg-gray-200 [&>span]:rounded-full
                              [&>span>span]:bg-rose-500 [&>span>span]:rounded-full
                              [&_[role=slider]]:h-5 [&_[role=slider]]:w-5
                              [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-rose-500
                              [&_[role=slider]]:shadow-md"
                          />
                          <div className="text-center text-sm font-semibold text-rose-700">{productDefinitionRating}</div>
                          {productDefinitionRating < GROWTH_LOW_SCORE_THRESHOLD && (
                            <div className="mt-2">
                              <Label className="text-xs text-gray-500">What feels unclear or inaccurate? (optional)</Label>
                              <Textarea value={productDefinitionNote} onChange={(e) => setProductDefinitionNote(e.target.value)} className="min-h-[60px] mt-1 text-sm" disabled={isSubmittingGrowthFeedback} />
                            </div>
                          )}
                          </MobileQuestionSheet>
                        </div>
                      )}

                      {/* --- Always included, but ONLY when there's a product to visit --- */}
                      {/* [FIX per implementation plan Stage 2] A founder who
                          reached Growth through the normal journey may not
                          have a live product yet (only an MLP-style demo).
                          This whole question is meaningless without a
                          product_url, so it's gated on that rather than
                          always shown. */}
                      {venture.growth_data.product_url && (
                      <div className="border border-teal-200 bg-teal-50/40 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Compass className="w-5 h-5 text-teal-600" />
                          <p className="text-xs font-bold uppercase tracking-wide text-teal-700">The Real Thing</p>
                        </div>
                        <Label className="text-sm">Did you visit the actual product?</Label>
                        <div className="flex gap-2 mt-2">
                          {['yes', 'no'].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setVisitedProduct(opt)}
                              disabled={isSubmittingGrowthFeedback}
                              className={`px-4 py-2 rounded-lg border text-sm font-medium ${visitedProduct === opt ? 'border-teal-600 bg-teal-600 text-white' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
                            >
                              {opt === 'yes' ? 'Yes' : 'No'}
                            </button>
                          ))}
                        </div>

                        {visitedProduct === 'yes' && (
                          <MobileQuestionSheet label="Did it match your expectations?" summary={productMatchRating} isMobile={isMobileViewport}>
                          <div className="mt-4">
                            <Label className="text-sm">Now that you've seen the actual product, how well did it match what you expected from the description and demo? (1-10)</Label>
                            <Slider
                              value={[productMatchRating]}
                              onValueChange={(value) => setProductMatchRating(value[0])}
                              max={10} min={1} step={1}
                              disabled={isSubmittingGrowthFeedback}
                              className="mt-2 mb-1
                                [&>span]:h-2 [&>span]:bg-gray-200 [&>span]:rounded-full
                                [&>span>span]:bg-teal-600 [&>span>span]:rounded-full
                                [&_[role=slider]]:h-5 [&_[role=slider]]:w-5
                                [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-teal-600
                                [&_[role=slider]]:shadow-md"
                            />
                            <div className="text-center text-sm font-semibold text-teal-700">{productMatchRating}</div>
                            <div className="mt-2">
                              <Label className="text-xs text-gray-500">What was different from what you expected? (optional)</Label>
                              <Textarea value={productMatchDiffText} onChange={(e) => setProductMatchDiffText(e.target.value)} className="min-h-[60px] mt-1 text-sm" disabled={isSubmittingGrowthFeedback} />
                            </div>
                          </div>
                          </MobileQuestionSheet>
                        )}
                      </div>
                      )}

                      {/* --- Final open question, always shown regardless of category selection --- */}
                      <div className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <ClipboardList className="w-5 h-5 text-gray-500" />
                          <p className="text-xs font-bold uppercase tracking-wide text-gray-600">One Last Thing</p>
                        </div>
                        <MobileQuestionSheet label="One last thing" summary={finalChangeText ? "Answered" : null} isMobile={isMobileViewport}>
                        <Label htmlFor="growth-final-change">If you could change one thing about how this product is defined, what would it be?</Label>
                        <Textarea id="growth-final-change" value={finalChangeText}
                          onChange={(e) => setFinalChangeText(e.target.value)}
                          className="min-h-[80px] mt-2" disabled={isSubmittingGrowthFeedback} />
                        </MobileQuestionSheet>
                      </div>

                      {currentUser && (
                        <label className="flex items-start gap-2 text-sm text-gray-600 cursor-pointer select-none border border-gray-200 rounded-lg p-3">
                          <input
                            type="checkbox"
                            checked={wantsToFollowGrowth}
                            onChange={(e) => setWantsToFollowGrowth(e.target.checked)}
                            disabled={isSubmittingGrowthFeedback}
                            className="w-4 h-4 mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>
                            <span className="font-medium text-gray-800">Become a Follower</span>
                            <br />
                            <span className="text-xs text-gray-400">Get invited to future feedback rounds.</span>
                          </span>
                        </label>
                      )}

                      {/* [FIX] Only require visitedProduct when there's a
                          product_url — matches the same gate applied to the
                          question itself and to handleGrowthFeedbackSubmit. */}
                      <Button type="submit" disabled={isSubmittingGrowthFeedback || (venture.growth_data.product_url && !visitedProduct)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700">
                        {isSubmittingGrowthFeedback
                          ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                          : <><Send className="w-4 h-4 mr-2" /> Send Feedback</>
                        }
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {/* [FIX 020826] Redesigned per the mockup direction: less
                  boxes-within-boxes (was Card > CardHeader > gradient bg),
                  cleaner typography, centered, responsive (Tailwind classes
                  scale down on mobile by default). Venture name uses the
                  same amber tone as the Early Adopter badge; description is
                  the brand indigo, bold, centered. Sector is now a plain
                  neutral pill instead of the shadcn outline Badge. */}
              <div className="text-center border-b border-gray-200 pb-6 mb-8">
                <div className="flex items-center justify-center flex-wrap gap-3 mb-3">
                  <h1 className="text-2xl md:text-3xl font-semibold text-amber-600">{venture.name}</h1>
                  {venture.sector && venture.sector !== 'not_sure' && venture.sector !== 'other' && (
                    <span className="text-xs text-gray-500 border border-gray-300 px-3 py-1 rounded-full">
                      {getSectorLabel(venture.sector)}
                    </span>
                  )}
                  {['pro_founder', 'unicorn'].includes(founderPlan) && (
                    <span className="flex items-center gap-1 bg-purple-50 border border-purple-200 text-purple-700 font-semibold px-3 py-1 rounded-full">
                      <span className="text-[9px] text-purple-400 uppercase tracking-widest">StartZig</span>
                      <span className="text-xs">Pro Founder</span>
                    </span>
                  )}
                  {/* [EARLY ADOPTER] Show gold badge if user is an early adopter */}
                  {earlyAdopter && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40" width="120" height="40">
                      <defs>
                        <linearGradient id="gold4" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#FFD700"/>
                          <stop offset="50%" stopColor="#FFA500"/>
                          <stop offset="100%" stopColor="#CC8800"/>
                        </linearGradient>
                        <linearGradient id="bg4" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#1a1a2e"/>
                          <stop offset="100%" stopColor="#0f0f1a"/>
                        </linearGradient>
                      </defs>
                      <rect x="1" y="1" width="118" height="38" rx="6" fill="url(#bg4)"/>
                      <rect x="1" y="1" width="118" height="38" rx="6" fill="none" stroke="url(#gold4)" strokeWidth="1.2"/>
                      <rect x="5" y="5" width="110" height="30" rx="3" fill="none" stroke="url(#gold4)" strokeWidth="0.5" opacity="0.4"/>
                      <text x="60" y="16" fontFamily="Arial, serif" fontSize="6" fill="#FFD700" textAnchor="middle" letterSpacing="2" opacity="0.7">STARTZIG</text>
                      <line x1="12" y1="19" x2="108" y2="19" stroke="#FFD700" strokeWidth="0.5" opacity="0.3"/>
                      <text x="60" y="32" fontFamily="Arial, serif" fontSize="11" fontWeight="800" fill="#FFA500" textAnchor="middle" letterSpacing="0.5">Early Adopter</text>
                    </svg>
                  )}
                </div>
                <p className="text-base md:text-lg font-medium text-indigo-600 max-w-xl mx-auto">{venture.description}</p>
              </div>

              <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 border border-gray-200 rounded-xl overflow-hidden mb-8">
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-gray-400" />
                    The problem we solve
                  </p>
                  <ReadMoreText text={venture.problem} />
                </div>
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-gray-400" />
                    Our innovative solution
                  </p>
                  <ReadMoreText text={venture.solution} />
                </div>
              </div>

              {venture.mvp_uploaded && venture.mvp_data && (
                <div className="mb-12">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Our minimum viable product</h2>
                  {/* [FIX 020826] Removed product_definition / technical_specs /
                      user_testing — confirmed these are legacy fields from an
                      older MVP builder version. The current mvp-development
                      builder only ever saves feature_matrix and
                      uploaded_files, so these three were always empty and
                      rendering nothing (ReadMoreText returns null for empty
                      text) — not a redesign bug, dead fields with no writer. */}
                  {venture.mvp_data.uploaded_files && venture.mvp_data.uploaded_files.length > 0 && (
                    <div className="border border-gray-200 rounded-xl p-6 md:p-8">
                      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 mb-4">MVP artifacts</p>
                      <div className="space-y-4">
                        {venture.mvp_data.uploaded_files.map((file, index) => renderFile(file, index, mvpHtmlContents))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {hasSelectedFeaturesForMVPFeedback && (
                <div className="mb-12">
                  {isOwnVenture ? (
                    <div className="text-center py-8 border border-gray-200 rounded-xl bg-gray-50">
                      <p className="text-gray-500 font-medium">You can't give feedback on your own venture.</p>
                    </div>
                  ) : alreadyGaveMvpFeedback ? (
                    <div className="text-center py-8 border border-green-200 rounded-xl bg-green-50">
                      <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-green-700 font-semibold">You've already given feedback on this MVP. Thank you!</p>
                    </div>
                  ) : (
                    <InteractiveFeedbackForm venture={venture} onFeedbackSubmitted={handleInteractiveFeedbackSubmitted} />
                  )}
                </div>
              )}

              
            </>
          )}

        </main>
      </div>
      {showInsightAnimation && (
        <InsightEarnedAnimation onComplete={() => { window.location.href = '/dashboard'; }} />
      )}
    </>
  );
}
