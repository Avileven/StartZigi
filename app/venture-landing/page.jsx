// venture-landing 261225


import React, { useState, useEffect, useCallback } from "react";
import { supabase, auth } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@supabase/supabase-js";


import {
  Lightbulb,
  Target,
  Heart,
  FileText,
  CheckCircle,
  Users,
  Code,
  Loader2,
  ExternalLink,
} from "lucide-react";


import WelcomeOverlay from "@/components/ventures/WelcomeOverlay";
import InteractiveFeedbackForm from "@/components/ventures/InteractiveFeedbackForm";


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
      <Button
        variant="link"
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-0 h-auto text-blue-600"
      >
        {isExpanded ? "Read Less" : "Read More"}
      </Button>
    </div>
  );
};


export default function VentureLanding() {
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


  // FIX: שומרים invitation_token פעם אחת, ולא מחשבים בתוך JSX
  const [invitationToken, setInvitationToken] = useState(null);


  // FIX: פונקציה אחת לטעינת HTML — זמינה לשני המסלולים (id וגם invitation_token)
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
            console.error(
              `Failed to fetch HTML from ${file.url} (${context}): ${response.status} ${response.statusText}`
            );
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


        // FIX: מסלול הזמנה (אנונימי)
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
          const { data: ventures, error: vErr } = await inviteClient
            .from("ventures")
            .select("*")
            .eq("id", ventureUuid);


          if (vErr) throw vErr;


          if (ventures && ventures.length > 0) {
            const loadedVenture = ventures[0];
            setVenture(loadedVenture);


            // FIX: טען גם קבצי HTML במסלול invitation_token
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


        // מסלול רגיל לפי ?id=
        const ventureId = urlParams.get("id");
        if (ventureId) {
          const { data: ventures, error } = await supabase
            .from("ventures")
            .select("*")
            .eq("id", ventureId);


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


            // טעינת HTML במסלול id
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


  // FIX: handleJoinAsCofounder חייב להיות בסקופ של הקומפוננטה (לא בתוך loadVenture)
  const handleJoinAsCofounder = useCallback(async () => {
    setJoinError(null);


    // 1) חייב להיות משתמש מחובר
    if (!currentUser) {
      const nextUrl = window.location.pathname + window.location.search;
      window.location.href = `/login?next=${encodeURIComponent(nextUrl)}`;
      return;
    }


    if (!invitationToken) {
      setJoinError("Missing invitation token in URL.");
      return;
    }


    setIsJoining(true);
    try {
      const { data, error } = await supabase.rpc("accept_co_founder_invite", {
        p_user_id: String(currentUser.id),
        p_invitation_token: invitationToken,
      });


      if (error) throw error;


      if (data?.error) {
        setJoinError(data.error);
        return;
      }


      if (data?.status === "success") {
        setJoinSuccess(true);


        // אופציונלי: לרענן venture כדי להציג את המצב החדש
        await loadVenture(currentUser);


        // שלב הבא: להעיף לדשבורד
        window.location.href = "/dashboard";
        return;
      }


      setJoinError("Unexpected response from server.");
    } catch (e) {
      console.error("JOIN failed:", e);
      setJoinError(e?.message || "Failed to join venture.");
    } finally {
      setIsJoining(false);
    }
  }, [currentUser, invitationToken, loadVenture]);


  useEffect(() => {
    const fetchUserAndVenture = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("invitation_token");


      // FIX: שומרים token ב-state
      setInvitationToken(token);


      // FIX: אם זה דף הזמנה – לא קוראים auth.me() בכלל
      if (token) {
        setCurrentUser(null);
        await loadVenture(null);
        return;
      }


      // במסלול רגיל: כן מנסים להביא משתמש, אבל לא מפילים את הכל אם אין session
      let user = null;
      try {
        user = await auth.me();
      } catch (e) {
        user = null;
      }
      setCurrentUser(user);


      if (urlParams.get("welcome") === "true") {
        setShowWelcome(true);
        const ventureId = urlParams.get("id");
        const newUrl = window.location.pathname + (ventureId ? `?id=${ventureId}` : "");
        window.history.replaceState({}, document.title, newUrl);
      }


      await loadVenture(user);
    };


    fetchUserAndVenture();
  }, [loadVenture]);


  const handleLike = async () => {
    if (!currentUser) {
      alert("Please log in to like this venture.");
      return;
    }


    if (venture.created_by === currentUser.email) {
      alert("You cannot like your own venture!");
      return;
    }


    if (hasLiked) {
      alert("You have already liked this venture!");
      return;
    }


    try {
      setHasLiked(true);
      const newLikesCount = (venture.likes_count || 0) + 1;
      setVenture((prev) => ({ ...prev, likes_count: newLikesCount }));


      const { error: updateError } = await supabase
        .from("ventures")
        .update({ likes_count: newLikesCount })
        .eq("id", venture.id);


      if (updateError) throw updateError;


      const { error: messageError } = await supabase.from("venture_messages").insert([
        {
          venture_id: venture.id,
          message_type: "like_notification",
          title: "Someone Liked Your Venture!",
          content: `A user from the community liked your venture "${venture.name}". Keep up the great work!`,
          from_venture_id: null,
          from_venture_name: currentUser.full_name || currentUser.email,
          from_venture_landing_page_url: null,
          phase: venture.phase,
          priority: 1,
        },
      ]);


      if (messageError) throw messageError;


      alert("Thank you for liking this venture!");
    } catch (error) {
      console.error("Error liking venture:", error);
      setHasLiked(false);
      setVenture((prev) => ({ ...prev, likes_count: (prev.likes_count || 1) - 1 }));
      alert("There was an error recording your like. Please try again.");
    }
  };


  const handleInteractiveFeedbackSubmitted = async () => {
    await loadVenture(currentUser);
  };


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


  const hasSelectedFeaturesForMVPFeedback =
    venture.mvp_uploaded &&
    venture.mvp_data &&
    Array.isArray(venture.mvp_data.feature_matrix) &&
    venture.mvp_data.feature_matrix.some((f) => f.isSelected);


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
                <CardDescription>You were invited as a co-founder. Click to accept and join the team.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {joinError && <p className="text-sm text-red-600">{joinError}</p>}
                {joinSuccess && <p className="text-sm text-green-600">Joined successfully! Redirecting…</p>}


                <Button onClick={handleJoinAsCofounder} disabled={isJoining} className="w-full">
                  {isJoining ? "Joining..." : "Accept & Join Venture"}
                </Button>
              </CardContent>
            </Card>
          )}


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
                          {venture.mvp_data.uploaded_files.map((file, index) => {
                            const fileName = file.name || "";
                            const fileUrl = file.url || "";
                            const fileExt = fileName.split(".").pop()?.toLowerCase();


                            const isHTML = ["html", "htm"].includes(fileExt);
                            const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(fileExt);
                            const isPDF = fileExt === "pdf";


                            if (isHTML) {
                              const content = mvpHtmlContents[fileUrl];
                              if (content) {
                                return (
                                  <div key={index} className="border rounded-lg overflow-hidden shadow-md bg-white">
                                    <div className="bg-gray-100 px-4 py-2 border-b">
                                      <h4 className="text-sm font-medium text-gray-900">{fileName}</h4>
                                    </div>
                                    <iframe
                                      srcDoc={content}
                                      className="w-full h-[600px] border-0"
                                      title={fileName}
                                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                                      loading="lazy"
                                    />
                                  </div>
                                );
                              }


                              return (
                                <div
                                  key={index}
                                  className="border rounded-lg bg-white p-6 flex flex-col items-center justify-center h-[200px]"
                                >
                                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                                  <p className="text-center text-gray-500 mt-2">Loading {fileName}...</p>
                                </div>
                              );
                            }


                            if (isImage) {
                              return (
                                <div key={index} className="border rounded-lg overflow-hidden shadow-md bg-white">
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
                                <div key={index} className="border rounded-lg overflow-hidden shadow-md bg-white">
                                  <div className="bg-gray-100 px-4 py-2 border-b">
                                    <h4 className="text-sm font-medium text-gray-900">{fileName}</h4>
                                  </div>
                                  <iframe src={fileUrl} className="w-full h-[600px] border-0" title={fileName} />
                                </div>
                              );
                            }


                            return (
                              <div key={index} className="border rounded-lg bg-white p-4 shadow-md">
                                {/* FIX: href__ -> href */}
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-3 hover:bg-gray-50 transition-colors p-2 rounded-lg"
                                >
                                  <FileText className="w-8 h-8 text-blue-500 flex-shrink-0" />
                                  <div>
                                    <span className="text-sm text-blue-600 hover:underline block font-medium">
                                      {fileName}
                                    </span>
                                    <span className="text-xs text-gray-500">Click to view</span>
                                  </div>
                                  <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                                </a>
                              </div>
                            );
                          })}
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
              <InteractiveFeedbackForm venture={venture} onFeedbackSubmitted={handleInteractiveFeedbackSubmitted} />
            </div>
          )}


          <Card className="shadow-lg mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Support This Venture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Show your support for {venture.name} by liking this venture!</p>
              <Button
                onClick={handleLike}
                disabled={hasLiked || (currentUser && venture.created_by === currentUser.email)}
                className={hasLiked ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"}
              >
                <Heart className={`w-4 h-4 mr-2 ${hasLiked ? "fill-current" : ""}`} />
                {hasLiked ? "Liked!" : "Like This Venture"}
              </Button>


              {hasLiked && <p className="text-sm text-green-600 mt-2">Thank you for your support!</p>}
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}



