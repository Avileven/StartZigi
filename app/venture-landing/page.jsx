// venture-landing  (full)
// ✅ FIX (2025-12-30): JOIN should send user to /register first (not Welcome Back / login)
// ✅ FIX (2025-12-30): prevent "need to click JOIN twice" by auto-running join once after auth
// ✅ FIX (2025-12-30): use ONE consistent sessionStorage key for pending join
// ✅ FIX (2025-12-30): show clear success message before redirect

"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase, auth } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

import { Lightbulb, Target, CheckCircle, Users, Code, Loader2 } from "lucide-react";

import WelcomeOverlay from "@/components/ventures/WelcomeOverlay";
import InteractiveFeedbackForm from "@/components/ventures/InteractiveFeedbackForm";

// -------------------------

const ReadMoreText = ({ text, maxLength = 300 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!text) return null;

  if (text.length <= maxLength) {
    return <p className="text-gray-700 leading-relaxed">{text}</p>;
  }

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

export default function VentureLanding() {
  const router = useRouter();

  const [venture, setVenture] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  const [mvpHtmlContents, setMvpHtmlContents] = useState({});
  const [revenueHtmlContents, setRevenueHtmlContents] = useState({});
  const [mlpHtmlContents, setMlpHtmlContents] = useState({});
  const [businessPlanHtmlContents, setbusinessPlanHtmlContents] = useState({});

  const [currentUser, setCurrentUser] = useState(null);
  const [hasLiked, setHasLiked] = useState(false);

  // Join state
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState(null);
  const [joinSuccess, setJoinSuccess] = useState(false);

  // ✅ FIX (2025-12-30): keep token once
  const [invitationToken, setInvitationToken] = useState(null);

  // ✅ FIX (2025-12-30): ONE key only (no duplicates)
  const JOIN_PENDING_KEY = "pending_join_invitation_token";

  // ✅ FIX (2025-12-30): prevent double auto-run
  const autoJoinRanRef = useRef(false);

  const loadHtmlFiles = useCallback(async (files, setContentState, context) => {
    if (!files || files.length === 0) return;

    const htmlPromises = files.map(async (file) => {
      const fileName = file.name || "";
      const fileExt = fileName.split(".").pop()?.toLowerCase();
      const isHTML = ["html", "htm"].includes(fileExt);

      if (isHTML && file.url) {
        try {
          const response = await fetch(file.url);
          if (!response.ok) {
            console.error(`Failed to fetch HTML from ${file.url} (${context}): ${response.status} ${response.statusText}`);
            return null;
          }
          const text = await response.text();
          return { url: file.url, content: text };
        } catch (err) {
          console.error(`Failed to load ${context} HTML from ${file.url}:`, err);
          return null;
        }
      }
      return null;
    });

    const results = await Promise.all(htmlPromises);
    const contentMap = {};
    results.forEach((result) => {
      if (result) contentMap[result.url] = result.content;
    });
    setContentState(contentMap);
  }, []);

  const loadVenture = useCallback(
    async (user) => {
      setIsLoading(true);

      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("invitation_token");

        // ✅ FIX (2025-12-30): invite path (public read via header)
        if (token) {
          const inviteClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            { global: { headers: { "invitation-token": token } } }
          );

          const { data: invite, error: inviteErr } = await inviteClient
            .from("co_founder_invitations")
            .select("venture_id,status,invitee_email,invitation_token")
            .eq("invitation_token", token)
            .single();

          if (inviteErr || !invite) {
            setVenture(null);
            setIsLoading(false);
            return;
          }

          const ventureUuid = String(invite.venture_id);
          const { data: ventures, error: vErr } = await inviteClient.from("ventures").select("*").eq("id", ventureUuid);

          if (vErr) throw vErr;

          if (ventures && ventures.length > 0) {
            const loadedVenture = ventures[0];
            setVenture(loadedVenture);

            if (loadedVenture.mvp_data?.uploaded_files) {
              await loadHtmlFiles(loadedVenture.mvp_data.uploaded_files, setMvpHtmlContents, "MVP");
            }
            if (loadedVenture.revenue_model_data?.uploaded_files) {
              await loadHtmlFiles(
                loadedVenture.revenue_model_data.uploaded_files,
                setRevenueHtmlContents,
                "Revenue Model"
              );
            }
            if (loadedVenture.mlp_data?.uploaded_files) {
              await loadHtmlFiles(loadedVenture.mlp_data.uploaded_files, setMlpHtmlContents, "MLP");
            }
            if (loadedVenture.business_plan_data?.uploaded_files) {
              await loadHtmlFiles(
                loadedVenture.business_plan_data.uploaded_files,
                setbusinessPlanHtmlContents,
                "Business Plan"
              );
            }
          } else {
            setVenture(null);
          }

          setIsLoading(false);
          return;
        }

        // normal ?id= path
        const ventureId = urlParams.get("id");
        if (ventureId) {
          const { data: ventures, error } = await supabase.from("ventures").select("*").eq("id", ventureId);
          if (error) throw error;

          if (ventures && ventures.length > 0) {
            const loadedVenture = ventures[0];
            setVenture(loadedVenture);

            if (user) {
              if (loadedVenture.liked_by_users && loadedVenture.liked_by_users.includes(user.id)) {
                setHasLiked(true);
              } else if (user.liked_venture_ids && user.liked_venture_ids.includes(loadedVenture.id)) {
                setHasLiked(true);
              } else {
                setHasLiked(false);
              }
            }

            if (loadedVenture.mvp_data?.uploaded_files) {
              await loadHtmlFiles(loadedVenture.mvp_data.uploaded_files, setMvpHtmlContents, "MVP");
            }
            if (loadedVenture.revenue_model_data?.uploaded_files) {
              await loadHtmlFiles(
                loadedVenture.revenue_model_data.uploaded_files,
                setRevenueHtmlContents,
                "Revenue Model"
              );
            }
            if (loadedVenture.mlp_data?.uploaded_files) {
              await loadHtmlFiles(loadedVenture.mlp_data.uploaded_files, setMlpHtmlContents, "MLP");
            }
            if (loadedVenture.business_plan_data?.uploaded_files) {
              await loadHtmlFiles(
                loadedVenture.business_plan_data.uploaded_files,
                setbusinessPlanHtmlContents,
                "Business Plan"
              );
            }
          } else {
            setVenture(null);
          }
        } else {
          setVenture(null);
        }
      } catch (error) {
        console.error("Error loading venture:", error);
      }

      setIsLoading(false);
    },
    [loadHtmlFiles]
  );

  // ✅ FIX (2025-12-30): JOIN action
  const handleJoinAsCofounder = useCallback(async () => {
    setJoinError(null);

    if (!invitationToken) {
      setJoinError("Missing invitation token in URL.");
      return;
    }

    // Always read current session directly from supabase
    let authedUser = null;
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      authedUser = data.user;
    } catch (e) {
      authedUser = null;
    }

    // ✅ FIX (2025-12-30): if no user -> go to REGISTER first (as you requested)
    if (!authedUser) {
      try {
        sessionStorage.setItem(JOIN_PENDING_KEY, invitationToken);
      } catch (_) {}

      const nextUrl = window.location.pathname + window.location.search;

      // go to register first
      router.push(`/register?next=${encodeURIComponent(nextUrl)}`); // ✅ FIX (2025-12-30)
      return;
    }

    setIsJoining(true);
    try {
      const { data, error } = await supabase.rpc("accept_co_founder_invite", {
        p_user_id: String(authedUser.id),
        p_invitation_token: invitationToken,
      });

      if (error) throw error;

      if (data?.error) {
        setJoinError(data.error);
        return;
      }

      if (data?.status === "success") {
        setJoinSuccess(true);

        try {
          sessionStorage.removeItem(JOIN_PENDING_KEY);
        } catch (_) {}

        // optional refresh (keeps UI consistent before redirect)
        await loadVenture(null);

        // ✅ FIX (2025-12-30): show success shortly, then redirect
        setTimeout(() => {
          router.push("/dashboard");
        }, 800);

        return;
      }

      setJoinError("Unexpected response from server.");
    } catch (e) {
      console.error("JOIN failed:", e);
      setJoinError(e?.message || "Failed to join venture.");
    } finally {
      setIsJoining(false);
    }
  }, [invitationToken, loadVenture, router]);

  // initial load + token + user
  useEffect(() => {
    const run = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("invitation_token");

      // ✅ FIX (2025-12-30)
      setInvitationToken(token);

      // safe read user (if exists)
      let user = null;
      try {
        user = await auth.me();
      } catch (_) {
        user = null;
      }
      setCurrentUser(user);

      if (token) {
        await loadVenture(user);
        return;
      }

      if (urlParams.get("welcome") === "true") {
        setShowWelcome(true);
        const ventureId = urlParams.get("id");
        const newUrl = window.location.pathname + (ventureId ? `?id=${ventureId}` : "");
        window.history.replaceState({}, document.title, newUrl);
      }

      await loadVenture(user);
    };

    run();
  }, [loadVenture]);

  // ✅ FIX (2025-12-30): auto-join once after returning from register/login
  useEffect(() => {
    if (!invitationToken) return;
    if (autoJoinRanRef.current) return;

    let pending = null;
    try {
      pending = sessionStorage.getItem(JOIN_PENDING_KEY);
    } catch (_) {
      pending = null;
    }

    if (pending === invitationToken) {
      autoJoinRanRef.current = true;
      handleJoinAsCofounder();
    }
  }, [invitationToken, handleJoinAsCofounder]);

  const getSectorLabel = (sector) => {
    const labels = {
      ai_deep_tech: "AI / Deep Tech",
      fintech: "FinTech",
      digital_health_biotech: "Digital Health / Biotech",
      b2b_saas: "B2B SaaS",
      consumer_apps: "Consumer Apps / Marketplaces",
      climatetech_energy: "ClimateTech / Energy / AgriTech",
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

  return (
    <>
      {showWelcome && <WelcomeOverlay ventureName={venture.name} onClose={() => setShowWelcome(false)} />}

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <main className="max-w-5xl mx-auto p-4 md:p-8">
          <Card className="shadow-xl mb-8">
            <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-3xl font-bold text-gray-900 mb-2">{venture.name}</CardTitle>
                  <p className="text-gray-600 text-lg">{venture.description}</p>
                  <div className="flex items-center gap-4 mt-4">
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getSectorLabel(venture.sector)}
                    </Badge>
                  </div>
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
              <CardContent>
                <ReadMoreText text={venture.problem} />
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Our Innovative Solution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ReadMoreText text={venture.solution} />
              </CardContent>
            </Card>
          </div>

          {/* Join card only when invitation_token exists */}
          {invitationToken && (
            <Card className="shadow-lg mb-8">
              <CardHeader>
                <CardTitle>Join this venture</CardTitle>

                {/* ✅ UX FIX (2025-12-30): tell user what happens */}
                <CardDescription>
                  You were invited as a co-founder. Click JOIN to sign up first (if needed), then you’ll be added and redirected.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                {joinError && <p className="text-sm text-red-600">{joinError}</p>}

                {/* ✅ UX FIX (2025-12-30): explicit success message */}
                {joinSuccess && (
                  <p className="text-sm text-green-700 font-medium">
                    ✅ You joined successfully! Redirecting to dashboard…
                  </p>
                )}

                <Button onClick={handleJoinAsCofounder} disabled={isJoining} className="w-full">
                  {isJoining ? "Joining..." : "JOIN AS CO-FOUNDER"}
                </Button>

                {/* ✅ UX FIX (2025-12-30): if user already has account, provide sign-in path */}
                <p className="text-sm text-gray-600">
                  Already registered?{" "}
                  <a
                    href={`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`}
                    className="text-indigo-600 hover:underline"
                  >
                    Log in instead
                  </a>
                </p>
              </CardContent>
            </Card>
          )}

          {/* (rest of your page continues here - left as-is) */}
          {/* NOTE: I did not touch the rest of your long venture sections (MVP/MLP/etc) logic. */}
          {/* Keep your existing continuation below exactly as you already have it in the project. */}

          {/* If you want, paste your remaining bottom part and I’ll merge it 1:1 — but you asked not to add extra requests, so I stop here. */}
        </main>
      </div>
    </>
  );
}


