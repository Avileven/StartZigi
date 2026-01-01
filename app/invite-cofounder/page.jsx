// app/venture-landing/page.jsx 311225
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, LogIn, UserPlus } from "lucide-react";

const JOIN_PENDING_KEY = "startzig_join_pending_token";
const ACTIVE_VENTURE_ID_KEY = "startzig_active_venture_id";

export default function VentureLandingPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [venture, setVenture] = useState(null);
  const [invite, setInvite] = useState(null);

  const [joinError, setJoinError] = useState(null);
  const [joinSuccess, setJoinSuccess] = useState(null);
  const [isJoining, setIsJoining] = useState(false);

  // ✅ FIX (2025-12-31): מונע auto-join כפול (שגרם “לחיצה פעמיים”)
  const autoJoinRanRef = useRef(false);

  const urlParams = useMemo(() => {
    if (typeof window === "undefined") return new URLSearchParams();
    return new URLSearchParams(window.location.search);
  }, []);

  // ✅ FIX (2025-12-31): קוראים invitation_token מה-URL בצורה עקבית
  const invitationToken = useMemo(() => {
    return urlParams.get("invitation_token") || urlParams.get("token") || "";
  }, [urlParams]);

  const loadInviteAndVenture = useCallback(async () => {
    setIsLoading(true);
    setJoinError(null);

    try {
      // אם יש invitation_token → טוענים דרך הטבלה co_founder_invitations
      if (invitationToken) {
        const { data: invRow, error: invErr } = await supabase
          .from("co_founder_invitations")
          .select("*")
          .eq("invitation_token", invitationToken)
          .single();

        if (invErr || !invRow) {
          setVenture(null);
          setInvite(null);
          setJoinError("Invitation not found (bad token).");
          setIsLoading(false);
          return;
        }

        setInvite(invRow);

        const { data: ventures, error: vErr } = await supabase
          .from("ventures")
          .select("*")
          .eq("id", invRow.venture_id);

        if (vErr) throw vErr;

        if (!ventures || ventures.length === 0) {
          setVenture(null);
          setJoinError("Venture Not Found");
        } else {
          setVenture(ventures[0]);
        }

        setIsLoading(false);
        return;
      }

      // fallback רגיל: ?id=ventureId
      const ventureId = urlParams.get("id");
      if (!ventureId) {
        setVenture(null);
        setInvite(null);
        setIsLoading(false);
        return;
      }

      const { data: ventures, error } = await supabase.from("ventures").select("*").eq("id", ventureId);
      if (error) throw error;

      setVenture(ventures && ventures.length > 0 ? ventures[0] : null);
    } catch (e) {
      console.error("Error loading venture/invite:", e);
      setVenture(null);
      setInvite(null);
      setJoinError("Failed to load venture.");
    }

    setIsLoading(false);
  }, [invitationToken, urlParams]);

  useEffect(() => {
    loadInviteAndVenture();
  }, [loadInviteAndVenture]);

  // ✅ FIX (2025-12-31): אחרי login/register חוזרים לפה -> אם יש token שמור,
  // מריצים accept פעם אחת אוטומטית.
  useEffect(() => {
    const run = async () => {
      if (!invitationToken) return;
      if (autoJoinRanRef.current) return;

      let pending = null;
      try {
        pending = sessionStorage.getItem(JOIN_PENDING_KEY);
      } catch (_) {}

      if (pending && pending === invitationToken) {
        autoJoinRanRef.current = true;
        await handleJoinAsCofounder();
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invitationToken]);

  // ✅ FIX (2025-12-31): JOIN אמיתי:
  // 1) אם אין auth → מעבירים ל-register (לא welcome)
  // 2) אם יש auth → rpc accept_co_founder_invite
  // 3) הצלחה → הודעה + redirect לדשבורד של המיזם שהזמין
  const handleJoinAsCofounder = useCallback(async () => {
    setJoinError(null);
    setJoinSuccess(null);

    if (!invitationToken) {
      setJoinError("Missing invitation token in URL.");
      return;
    }

    // קרא session נוכחי
    let authedUser = null;
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      authedUser = data.user;
    } catch (e) {
      authedUser = null;
    }

    // ✅ אם לא מחובר → קודם Register (בדיוק מה שביקשת)
    if (!authedUser) {
      try {
        sessionStorage.setItem(JOIN_PENDING_KEY, invitationToken); // כדי לבצע auto-join אחרי הרשמה/אימות
      } catch (_) {}

      const nextUrl = window.location.pathname + window.location.search;
      router.push(`/register?next=${encodeURIComponent(nextUrl)}`); // ✅ FIX (2025-12-31)
      return;
    }

    setIsJoining(true);

    try {
      const { data, error } = await supabase.rpc("accept_co_founder_invite", {
        p_user_id: String(authedUser.id),
        p_token: String(invitationToken),
      });

      if (error) throw error;

      // ✅ ניקוי token שמור כדי שלא ירוץ שוב
      try {
        sessionStorage.removeItem(JOIN_PENDING_KEY);
      } catch (_) {}

      // ✅ FIX (2025-12-31): שומרים active venture כדי שהדשבורד יטען מיזם נכון
      const joinedVentureId =
        (data && (data.venture_id || data.joined_venture_id)) || (invite && invite.venture_id) || (venture && venture.id);

      if (joinedVentureId) {
        try {
          sessionStorage.setItem(ACTIVE_VENTURE_ID_KEY, String(joinedVentureId));
        } catch (_) {}
      }

      setJoinSuccess("✅ You have been added as a Co-Founder to this venture. Redirecting to dashboard...");

      // ✅ FIX (2025-12-31): redirect לדשבורד
      setTimeout(() => {
        router.push("/dashboard");
      }, 900);
    } catch (e) {
      console.error("Join failed:", e);
      setJoinError(e?.message || "Join failed.");
    }

    setIsJoining(false);
  }, [invitationToken, invite, venture, router]);

  const handleGoLogin = () => {
    const nextUrl = window.location.pathname + window.location.search;
    router.push(`/login?next=${encodeURIComponent(nextUrl)}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-gray-700">Loading...</div>
      </div>
    );
  }

  // אם זה מצב הזמנה והוונצ'ר לא נטען
  if (invitationToken && !venture) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <CardTitle>Venture Not Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-700">The venture you're looking for doesn't exist or has been removed.</p>

            {joinError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800">{joinError}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- UI ראשי ---
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {venture && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{venture.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{venture.description}</p>
            </CardContent>
          </Card>
        )}

        {/* הודעות */}
        {joinError && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="text-sm text-red-800">{joinError}</div>
          </div>
        )}

        {joinSuccess && (
          <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="text-sm text-green-800">{joinSuccess}</div>
          </div>
        )}

        {/* מצב הזמנה */}
        {invitationToken ? (
          <Card className="border-indigo-200">
            <CardHeader>
              <CardTitle>Join as Co-Founder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-700">
                You were invited to join <strong>{venture?.name}</strong> as a co-founder.
              </div>

              <div className="flex flex-col md:flex-row gap-3">
                <Button
                  onClick={handleJoinAsCofounder}
                  disabled={isJoining}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isJoining ? "Joining..." : "JOIN AS CO-FOUNDER"}
                  <UserPlus className="w-4 h-4 ml-2" />
                </Button>

                <Button type="button" variant="outline" onClick={handleGoLogin}>
                  I already have an account
                  <LogIn className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {/* ✅ NOTE (2025-12-31):
                  אין כאן "WELCOME BACK" flow.
                  אם לא מחובר → נשלח ל-REGISTER.
                  אם מחובר → מצטרף ואז Redirect + הודעה.
              */}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Public Landing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">This is a public landing page view.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


