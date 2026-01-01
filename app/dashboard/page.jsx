// dashboard_311225.js / page.jsx (FULL FILE)
// =========================================
// NOTE: This file is pasted as a full replacement.
// FIXES are marked with: [2025-12-31] + explanation.

"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Venture, User } from "@/api/entities";

import {
  LayoutDashboard,
  Users,
  DollarSign,
  Trophy,
  ArrowRight,
  Sparkles,
  Lightbulb,
  FileText,
  TrendingUp,
  Rocket,
  Target,
  Shield,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Send,
  UserPlus,
  Mail,
  Settings,
  Loader2,
  Crown,
  Star,
  ChevronRight,
  Gift,
  ClipboardCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const PHASES = [
  { id: "idea", name: "Idea", icon: Lightbulb, color: "text-yellow-500" },
  { id: "business_plan", name: "Business Plan", icon: FileText, color: "text-blue-500" },
  { id: "mvp", name: "MVP", icon: Rocket, color: "text-purple-500" },
  { id: "mlp", name: "MLP", icon: Target, color: "text-green-500" },
  { id: "beta", name: "Beta", icon: Users, color: "text-indigo-500" },
  { id: "growth", name: "Growth", icon: TrendingUp, color: "text-pink-500" },
];

export default function Dashboard() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState(null);
  const [ventures, setVentures] = useState([]);
  const [selectedVenture, setSelectedVenture] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const user = await User.me();
        if (!user) {
          router.push("/login?next=/dashboard");
          return;
        }
        setCurrentUser(user);

        const adminSelectedVentureId = localStorage.getItem("admin_selected_venture_id");
        let userVentures = [];

        if (adminSelectedVentureId && user.role === "admin") {
          const specificVenture = await Venture.filter({ id: adminSelectedVentureId });
          if (specificVenture.length > 0) {
            userVentures = specificVenture;
            localStorage.removeItem("admin_selected_venture_id");
          } else {
            userVentures = await Venture.filter({ founder_user_id: user.id }, "-created_date");
            localStorage.removeItem("admin_selected_venture_id");
          }
        } else {
          userVentures = await Venture.filter({ founder_user_id: user.id }, "-created_date");
        }

        // [2025-12-31] SINGLE-VENTURE MODE:
        // המטרה: למנוע "ערבוב זהויות" בין משתמש חדש (אין מיזם) לבין משתמש שהוא כבר שותף במיזם אחר.
        // הפתרון: אם יש user_profiles.primary_venture_id — הדשבורד מציג רק אותו מיזם.
        // אם אין — אנחנו בוחרים את המיזם הראשון ומנסים לשמור אותו ל-primary (Best-effort).
        // הערה: אם העמודה primary_venture_id עדיין לא קיימת — זה לא מפיל כלום, פשוט ימשיך כמו קודם.
        if (!(adminSelectedVentureId && user.role === "admin")) {
          let primaryVentureId = null;

          try {
            const { data: profile, error: profileErr } = await supabase
              .from("user_profiles")
              .select("primary_venture_id")
              .eq("id", user.id)
              .single();

            if (!profileErr && profile?.primary_venture_id) {
              primaryVentureId = profile.primary_venture_id;
            }
          } catch (e) {
            // ignore (column might not exist yet)
          }

          if (primaryVentureId) {
            const byId = await Venture.filter({ id: primaryVentureId });
            if (byId && byId.length > 0) {
              userVentures = byId;
            }
          } else if (userVentures && userVentures.length > 0) {
            try {
              await supabase.from("user_profiles").upsert({
                id: user.id,
                primary_venture_id: userVentures[0].id,
              });
            } catch (e) {
              // ignore
            }
          }
        }

        setVentures(userVentures);
        setSelectedVenture(userVentures[0] || null);
      } catch (err) {
        console.error("Dashboard load error:", err);
        setLoadError(err?.message || "Failed to load dashboard.");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, [router]);

  const selectedPhase = selectedVenture?.phase || "idea";
  const selectedPhaseObj = PHASES.find((p) => p.id === selectedPhase) || PHASES[0];
  const PhaseIcon = selectedPhaseObj.icon;

  const openInviteModal = () => {
    setInviteEmail("");
    setInviteName("");
    setInviteMessage("");
    setInviteError("");
    setInviteSuccess("");
    setShowInviteModal(true);
  };

  const closeInviteModal = () => {
    setShowInviteModal(false);
  };

  const handleSendInvite = async () => {
    setInviteError("");
    setInviteSuccess("");

    if (!selectedVenture) {
      setInviteError("No venture selected.");
      return;
    }
    if (!inviteEmail || !inviteEmail.includes("@")) {
      setInviteError("Please enter a valid email.");
      return;
    }

    setIsSendingInvite(true);
    try {
      const res = await fetch("/api/invite-cofounder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ventureId: selectedVenture.id,
          inviteeEmail: inviteEmail.trim(),
          inviteeName: inviteName.trim(),
          customMessage: inviteMessage.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "Failed to send invite.");
      }

      setInviteSuccess("Invite sent!");
      setInviteEmail("");
      setInviteName("");
      setInviteMessage("");
    } catch (e) {
      setInviteError(e?.message || "Failed to send invite.");
    } finally {
      setIsSendingInvite(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Dashboard Error
            </CardTitle>
            <CardDescription>{loadError}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()} className="w-full">
              Reload
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!selectedVenture) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-xl w-full">
          <CardHeader>
            <CardTitle>No Venture Found</CardTitle>
            <CardDescription>
              You don't have a venture yet. Create one to see your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={() => router.push("/createVenture")} className="w-full">
              Create Venture
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-1">
                <CardTitle className="text-2xl md:text-3xl">{selectedVenture.name}</CardTitle>
                <CardDescription className="text-base">{selectedVenture.description}</CardDescription>

                <div className="flex items-center gap-3 mt-3">
                  <Badge variant="outline" className="flex items-center gap-2">
                    <PhaseIcon className={`w-4 h-4 ${selectedPhaseObj.color}`} />
                    <span>Phase: {selectedPhaseObj.name}</span>
                  </Badge>

                  <Badge variant="secondary" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Founders: {selectedVenture.founders_count ?? 1}</span>
                  </Badge>

                  <Badge variant="secondary" className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>${selectedVenture.virtual_capital ?? 0}</span>
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col gap-2 min-w-[220px]">
                <Button onClick={openInviteModal} className="w-full">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite a Co-Founder
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push(`/venture-landing?id=${selectedVenture.id}`)}
                  className="w-full"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Landing Page
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Content */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-indigo-600" />
                Dashboard
              </CardTitle>
              <CardDescription>Quick overview of your venture progress.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-600" />
                      Total Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-3xl font-bold">
                    {Math.round(selectedVenture.total_score ?? 0)}
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      Messages
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-3xl font-bold">
                    {selectedVenture.messages_count ?? 0}
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => router.push("/business-plan")}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Business Plan
                  <ChevronRight className="w-4 h-4" />
                </Button>

                <Button
                  onClick={() => router.push("/mvp")}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Rocket className="w-4 h-4" />
                  MVP
                  <ChevronRight className="w-4 h-4" />
                </Button>

                <Button
                  onClick={() => router.push("/mlp")}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Target className="w-4 h-4" />
                  MLP
                  <ChevronRight className="w-4 h-4" />
                </Button>

                {currentUser?.role === "admin" && (
                  <Button
                    onClick={() => router.push("/AdminDashboard")}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-600" />
                Quick Actions
              </CardTitle>
              <CardDescription>Shortcuts and settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                onClick={() => router.push("/settings")}
                className="w-full justify-start"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push("/angel-arena")}
                className="w-full justify-start"
              >
                <Crown className="w-4 h-4 mr-2" />
                Angel Arena
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push("/vcmarketplace")}
                className="w-full justify-start"
              >
                <Star className="w-4 h-4 mr-2" />
                VC Marketplace
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push("/rewards")}
                className="w-full justify-start"
              >
                <Gift className="w-4 h-4 mr-2" />
                Rewards
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <Card className="w-full max-w-lg shadow-xl">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-indigo-600" />
                  Invite a Co-Founder
                </CardTitle>
                <CardDescription>Send an invite email with a join link.</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="cofounder@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Optional"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    placeholder="Optional message..."
                  />
                </div>

                {inviteError && (
                  <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
                    {inviteError}
                  </div>
                )}

                {inviteSuccess && (
                  <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {inviteSuccess}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" onClick={closeInviteModal} className="w-full">
                    Cancel
                  </Button>
                  <Button onClick={handleSendInvite} disabled={isSendingInvite} className="w-full">
                    {isSendingInvite ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Invite
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}


