// 300326 app/venture-feedback/page.jsx
// [NEW] Public feedback page — no auth, loads venture by ?id= only.
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createClient } from "@supabase/supabase-js";
import {
  Lightbulb, Target, Heart, FileText, CheckCircle, Users, Code,
  Loader2, ExternalLink, Sparkles, MessageSquare, Send,
} from "lucide-react";
import WelcomeOverlay from "@/components/ventures/WelcomeOverlay";
import InteractiveFeedbackForm from "@/components/ventures/InteractiveFeedbackForm";
import { ProductFeedback as ProductFeedbackEntity } from "@/api/entities";

const ReadMoreText = ({ text, maxLength = 300 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!text) return null;
  if (text.length <= maxLength) return <p className="text-gray-700 leading-relaxed">{text}</p>;
  const displayedText = isExpanded ? text : `${text.substring(0, maxLength)}...`;
  return (
    <div>
      <p className="text-gray-700 leading-relaxed">{displayedText}</p>
      <Button variant="link" onClick={() => setIsExpanded(!isExpanded)} className="p-0 h-auto text-blue-600">
        {isExpanded ? "Read Less" : "Read More"}
      </Button>
    </div>
  );
};

const renderFile = (file, index, htmlContents) => {
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
          <div className="bg-gray-100 px-4 py-2 border-b">
            <h4 className="text-sm font-medium text-gray-900">{fileName}</h4>
          </div>
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
        <div className="bg-gray-100 px-4 py-2 border-b">
          <h4 className="text-sm font-medium text-gray-900">{fileName}</h4>
        </div>
        <div className="p-4">
          <img src={fileUrl} alt={fileName} className="w-full h-auto" />
        </div>
      </div>
    );
  }
  if (isPDF) {
    return (
      <div key={index} className="border-2 rounded-xl overflow-hidden shadow-lg bg-white">
        <div className="bg-gray-100 px-4 py-2 border-b">
          <h4 className="text-sm font-medium text-gray-900">{fileName}</h4>
        </div>
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
  const [venture, setVenture] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [mvpHtmlContents, setMvpHtmlContents] = useState({});
  const [mlpHtmlContents, setMlpHtmlContents] = useState({});
  const [revenueHtmlContents, setRevenueHtmlContents] = useState({});
  const [businessPlanHtmlContents, setbusinessPlanHtmlContents] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [hasLiked, setHasLiked] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState(null);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [invitationToken, setInvitationToken] = useState(null);
  const [mlpFeedbackText, setMlpFeedbackText] = useState("");
  const [isSubmittingMlpFeedback, setIsSubmittingMlpFeedback] = useState(false);
  const [mlpFeedbackSubmitted, setMlpFeedbackSubmitted] = useState(false);
  // [ADDED] Reviewer venture data — loaded from ?from=VENTURE_ID in the URL.
  // This identifies which venture gave the feedback, for tracking inter-venture interactions.
  const [reviewerVenture, setReviewerVenture] = useState(null);
  // [ADDED] Authorization state — user must be logged in AND have a valid ?from= venture.
  // null = still checking, true = authorized, false = not authorized.
  const [isAuthorized, setIsAuthorized] = useState(null);

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
          if (v.mvp_data?.uploaded_files) await loadHtmlFiles(v.mvp_data.uploaded_files, setMvpHtmlContents, "MVP");
          if (v.mlp_data?.uploaded_files) await loadHtmlFiles(v.mlp_data.uploaded_files, setMlpHtmlContents, "MLP");
          if (v.revenue_model_data?.uploaded_files) await loadHtmlFiles(v.revenue_model_data.uploaded_files, setRevenueHtmlContents, "Revenue");
          if (v.business_plan_data?.uploaded_files) await loadHtmlFiles(v.business_plan_data.uploaded_files, setbusinessPlanHtmlContents, "BP");
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
          if (user) {
            setHasLiked(v.liked_by_users?.includes(user.id) || user.liked_venture_ids?.includes(v.id) || false);
          }
          if (v.mvp_data?.uploaded_files) await loadHtmlFiles(v.mvp_data.uploaded_files, setMvpHtmlContents, "MVP");
          if (v.mlp_data?.uploaded_files) await loadHtmlFiles(v.mlp_data.uploaded_files, setMlpHtmlContents, "MLP");
          if (v.revenue_model_data?.uploaded_files) await loadHtmlFiles(v.revenue_model_data.uploaded_files, setRevenueHtmlContents, "Revenue");
          if (v.business_plan_data?.uploaded_files) await loadHtmlFiles(v.business_plan_data.uploaded_files, setbusinessPlanHtmlContents, "BP");
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
    const init = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const fromId = urlParams.get("from");

      // [ADDED] Check if user is logged in.
      // If not — redirect to login page.
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
        return;
      }

      // [ADDED] Check if ?from= param exists and matches a real venture.
      // Only ventures that were invited (have a valid from= param) can see this page.
      // Safety: if from is missing or venture not found — show unauthorized message, do not load content.
      if (!fromId) {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      try {
        const { data: reviewerData } = await supabase
          .from("ventures")
          .select("id, name")
          .eq("id", fromId)
          .single();

        if (!reviewerData) {
          // from= param exists but venture not found — not authorized
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        // All checks passed — authorized
        setReviewerVenture(reviewerData);
        setIsAuthorized(true);

        // Load the venture content
        loadVenture(null);
      } catch (e) {
        console.error("Authorization check failed:", e);
        setIsAuthorized(false);
        setIsLoading(false);
      }
    };
    init();
  }, [loadVenture]);

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

  // [CHANGED] After MVP feedback is submitted:
  // 1. Notify the venture owner that they received feedback
  // 2. Auto-close the page after 3 seconds (redirect to dashboard)
  // [REMOVED] loadVenture call — was resetting the form before the Thank You screen appeared
  const handleInteractiveFeedbackSubmitted = async () => {
    try {
      // [ADDED] Notify the venture owner that feedback was received
      if (venture?.id && reviewerVenture?.name) {
        await supabase.from("venture_messages").insert({
          venture_id: venture.id,
          message_type: "system",
          title: "📝 New MVP Feedback Received!",
          content: `${reviewerVenture.name} has reviewed your MVP and submitted feedback. Check your feedback reports for details.`,
          phase: venture.phase,
          priority: 3,
          is_dismissed: false,
        });
      }
    } catch (e) {
      console.error("Could not send feedback notification:", e);
      // Non-fatal — Thank You screen still shows
    }
    // [ADDED] Auto-redirect to dashboard after 3 seconds
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 3000);
  };

  const handleMlpFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!mlpFeedbackText.trim() || !venture) return;
    setIsSubmittingMlpFeedback(true);
    try {
      // [CHANGED] Using supabase directly instead of ProductFeedbackEntity.create()
      // because this page has no auth session — the Entity class would fail with 400.
      // [ADDED] reviewer_venture_id and reviewer_venture_name saved from ?from= param
      // to track which venture gave the feedback.
      const { error } = await supabase.from("product_feedback").insert({
        venture_id: venture.id,
        feedback_text: mlpFeedbackText.trim(),
        feedback_type: "other",
        created_by: null,
        created_by_id: null,
        // [ADDED] Reviewer identity — null if not invited via in-app promotion
        reviewer_venture_id: reviewerVenture?.id || null,
        reviewer_venture_name: reviewerVenture?.name || null,
      });
      if (error) throw error;
      
      // [ADDED] Notify the venture owner that MLP feedback was received
      try {
        if (venture?.id && reviewerVenture?.name) {
          await supabase.from("venture_messages").insert({
            venture_id: venture.id,
            message_type: "system",
            title: "📝 New MLP Feedback Received!",
            content: `${reviewerVenture.name} has reviewed your MLP and submitted feedback. Check your feedback reports for details.`,
            phase: venture.phase,
            priority: 3,
            is_dismissed: false,
          });
        }
      } catch (e) {
        console.error("Could not send MLP feedback notification:", e);
        // Non-fatal — Thank You screen still shows
      }

      setMlpFeedbackSubmitted(true);
      setMlpFeedbackText("");

      // [ADDED] Auto-redirect to dashboard after 3 seconds
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 3000);

    } catch (err) {
      console.error("Error submitting MLP feedback:", err);
      alert("There was an error submitting your feedback. Please try again.");
    }
    setIsSubmittingMlpFeedback(false);
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

  if (isLoading || isAuthorized === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  // [ADDED] Show unauthorized message if user is not logged in or does not have a valid ?from= venture.
  // This prevents bots and unauthorized users from accessing the feedback page.
  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔒</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Access Restricted</h1>
          <p className="text-gray-600">This page is only available to ventures that have been invited to give feedback. If you received an invitation, please make sure you are logged in.</p>
        </div>
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
              {/* MLP Hero */}
              <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-600 rounded-2xl flex flex-col items-center justify-center text-center px-8 py-16 mb-10 shadow-xl">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-5">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-5xl font-extrabold text-white mb-3 tracking-tight">{venture.name}</h1>
                <p className="text-xl text-white/80 max-w-2xl leading-relaxed">{venture.description}</p>
              </div>

              {/* MLP Content Cards */}
              <div className="space-y-6 mb-10">
                {venture.mlp_data.feedback_analysis && (
                  <Card className="shadow-md bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-indigo-800">
                        <Sparkles className="w-5 h-5 text-indigo-500" />
                        What We Learned from Users
                      </CardTitle>
                    </CardHeader>
                    <CardContent><ReadMoreText text={venture.mlp_data.feedback_analysis} /></CardContent>
                  </Card>
                )}
                {venture.mlp_data.enhancement_strategy && (
                  <Card className="shadow-md bg-gradient-to-br from-green-50 to-emerald-50 border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-emerald-800">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        How We're Making It Better
                      </CardTitle>
                    </CardHeader>
                    <CardContent><ReadMoreText text={venture.mlp_data.enhancement_strategy} /></CardContent>
                  </Card>
                )}
                {venture.mlp_data.wow_moments && (
                  <Card className="shadow-md bg-gradient-to-br from-yellow-50 to-amber-50 border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-amber-800">
                        <Heart className="w-5 h-5 text-amber-500" />
                        Delightful Moments You'll Love
                      </CardTitle>
                    </CardHeader>
                    <CardContent><ReadMoreText text={venture.mlp_data.wow_moments} /></CardContent>
                  </Card>
                )}
                {venture.mlp_data.user_journey && (
                  <Card className="shadow-md bg-gradient-to-br from-purple-50 to-pink-50 border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-purple-800">
                        <Users className="w-5 h-5 text-purple-500" />
                        Your Journey with Us
                      </CardTitle>
                    </CardHeader>
                    <CardContent><ReadMoreText text={venture.mlp_data.user_journey} /></CardContent>
                  </Card>
                )}
              </div>

              {/* MLP Files */}
              {venture.mlp_data.uploaded_files && venture.mlp_data.uploaded_files.length > 0 && (
                <div className="mb-10">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Product Showcase</h3>
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
                  {mlpFeedbackSubmitted ? (
                    // [CHANGED] Added auto-redirect message so user knows the page will close
                    <div className="text-center py-6">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <p className="text-green-700 font-semibold text-lg">Thank you for your feedback!</p>
                      <p className="text-gray-500 text-sm mt-1">Your response helps the team improve their product.</p>
                      <p className="text-gray-400 text-xs mt-3">Redirecting you back to your dashboard in a few seconds...</p>
                    </div>
                  ) : (
                    <form onSubmit={handleMlpFeedbackSubmit} className="space-y-4">
                      {/* [ADDED] Show reviewer venture name so user can confirm their identity is correct */}
                      {reviewerVenture && (
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2 text-sm text-indigo-700">
                          Giving feedback as: <strong>{reviewerVenture.name}</strong>
                        </div>
                      )}
                      <div>
                        <Label htmlFor="mlp-feedback">What do you think about this product?</Label>
                        <Textarea id="mlp-feedback" value={mlpFeedbackText}
                          onChange={(e) => setMlpFeedbackText(e.target.value)}
                          placeholder="Your feedback helps make this product even better..."
                          className="min-h-[100px] mt-2" required disabled={isSubmittingMlpFeedback} />
                      </div>
                      <Button type="submit" disabled={isSubmittingMlpFeedback || !mlpFeedbackText.trim()}
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
          ) : (
            <>
              {/* MVP Header */}
              <Card className="shadow-xl mb-8">
                <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-purple-50">
                  <div>
                    <CardTitle className="text-3xl font-bold text-gray-900 mb-2">{venture.name}</CardTitle>
                    <p className="text-gray-600 text-lg">{venture.description}</p>
                    <div className="flex items-center gap-4 mt-4">
                      <Badge variant="outline">{getSectorLabel(venture.sector)}</Badge>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-red-500" />
                      The Problem We Solve
                    </CardTitle>
                  </CardHeader>
                  <CardContent><ReadMoreText text={venture.problem} /></CardContent>
                </Card>
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                      Our Innovative Solution
                    </CardTitle>
                  </CardHeader>
                  <CardContent><ReadMoreText text={venture.solution} /></CardContent>
                </Card>
              </div>

              {venture.mvp_uploaded && venture.mvp_data && (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Minimum Viable Product (MVP)</h2>
                  <div className="bg-white/60 backdrop-blur-sm p-8 rounded-xl shadow-lg">
                    <div className="grid lg:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                            <CheckCircle className="w-5 h-5 text-purple-600" />
                            Product Definition
                          </h3>
                          <ReadMoreText text={venture.mvp_data.product_definition} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                            <Code className="w-5 h-5 text-blue-600" />
                            Technical Approach
                          </h3>
                          <ReadMoreText text={venture.mvp_data.technical_specs} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                            <Users className="w-5 h-5 text-green-600" />
                            User Testing & Validation
                          </h3>
                          <ReadMoreText text={venture.mvp_data.user_testing} />
                        </div>
                      </div>
                      <div className="space-y-6">
                        {venture.mvp_data.uploaded_files && venture.mvp_data.uploaded_files.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold mb-2">MVP Artifacts</h3>
                            <div className="space-y-4">
                              {venture.mvp_data.uploaded_files.map((file, index) => renderFile(file, index, mvpHtmlContents))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {hasSelectedFeaturesForMVPFeedback && (
                <div className="mb-12">
                  {/* [CHANGED] Added reviewerVenture prop so the form knows who is giving the feedback */}
                  <InteractiveFeedbackForm venture={venture} onFeedbackSubmitted={handleInteractiveFeedbackSubmitted} reviewerVenture={reviewerVenture} />
                </div>
              )}

              {/* [REMOVED] Like button removed — no longer relevant for the feedback flow */}
            </>
          )}

        </main>
      </div>
    </>
  );
}
