
// app/promotion-center/page.jsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// [2026-01-10] FIX: make feedback invites identical to InviteCoFounder flow
import {
  Venture,
  PromotionCampaign,
  User,
  CoFounderInvitation,
  VentureMessage,
} from "@/api/entities.js";

import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPageUrl } from "@/utils";

import {
  ArrowLeft,
  Users,
  Mail,
  TrendingUp,
  DollarSign,
  BarChart3,
  Eye,
  MousePointerClick,
  X,
  Loader2,
  CheckCircle,
  Clock,
} from "lucide-react";

export default function PromotionCenter() {
  const [venture, setVenture] = useState(null);

  // existing campaigns (keep as-is)
  const [campaigns, setCampaigns] = useState([]);

  // [2026-01-10] FIX: store external feedback invites in the SAME table as cofounder, filtered by invitation_type
  const [feedbackInvites, setFeedbackInvites] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const router = useRouter();

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // [2026-01-10] FIX: identical to InviteCoFounder – load user once
      const user = await User.me();
      if (!user) {
        setVenture(null);
        setCampaigns([]);
        setFeedbackInvites([]);
        return;
      }

      // [2026-01-10] FIX: identical to InviteCoFounder – take latest venture (no created_by filter that can be undefined)
      const ventures = await Venture.list("-created_date");
      if (!ventures || ventures.length === 0) {
        setVenture(null);
        setCampaigns([]);
        setFeedbackInvites([]);
        return;
      }

      const currentVenture = ventures[0];
      setVenture(currentVenture);

      // keep original: campaigns list
      const ventureCampaigns = await PromotionCampaign.filter(
        { venture_id: currentVenture.id },
        "-created_date"
      );
      setCampaigns(ventureCampaigns || []);

      // [2026-01-10] FIX: load ONLY external_feedback invitations (so it won’t mix with cofounder invitations)
      const invites = await CoFounderInvitation.filter(
        { venture_id: currentVenture.id, invitation_type: "external_feedback" },
        "-created_date"
      );
      setFeedbackInvites(invites || []);
    } catch (error) {
      console.error("Error loading data:", error);
      setVenture(null);
      setCampaigns([]);
      setFeedbackInvites([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteChange = (field, value) => {
    setInviteForm((prev) => ({ ...prev, [field]: value }));
  };

  // [2026-01-10] FIX: status UI helpers (same idea as InviteCoFounder)
  const getStatusIcon = (status) => {
    switch (String(status || "").toLowerCase()) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "sent":
        return <Mail className="w-4 h-4 text-blue-500" />;
      case "accepted":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "declined":
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const s = String(status || "").toLowerCase();
    if (s === "pending") return "bg-yellow-100 text-yellow-800";
    if (s === "sent") return "bg-blue-100 text-blue-800";
    if (s === "accepted") return "bg-green-100 text-green-800";
    if (s === "declined") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  // [2026-01-10] FIX: identical invite flow to InviteCoFounder
  const sendFeedbackInvite = async (e) => {
    e.preventDefault();

    if (!venture || !inviteForm.email || !inviteForm.name) {
      alert("Please fill in name + email.");
      return;
    }

    setIsSending(true);

    try {
      const user = await User.me();
      if (!user) {
        alert("You must be logged in.");
        return;
      }

      const invitationToken = Math.random().toString(36).substring(2, 15);

      // 1) Create invitation as PENDING (same as InviteCoFounder)
      const invitation = await CoFounderInvitation.create({
        venture_id: venture.id,
        inviter_email: user.email,
        invitee_email: inviteForm.email,
        invitee_name: inviteForm.name,
        custom_message: inviteForm.message || null,

        invitation_token: invitationToken,

        // [2026-01-10] FIX: critical - mark type so this invite is treated as external feedback
        invitation_type: "external_feedback",

        status: "pending",
        created_by_id: user.id,
        created_by: user.email,
      });

      const tokenToUse = invitation?.invitation_token || invitationToken;

      // 2) Send email via API (same endpoint as cofounder)
      const emailResponse = await fetch("/api/send-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteForm.email,
          ventureName: venture.name,
          // [2026-01-10] FIX: prefer username if you added it; fallback to email
          inviterName: user.username || user.full_name || user.name || user.email,
          invitationToken: tokenToUse,
          ventureId: venture.id,

          // [2026-01-10] FIX: pass type so server can generate the correct link if you support it there
          type: "external_feedback",
        }),
      });

      if (!emailResponse.ok) {
        // Keep invitation as pending (same behavior as cofounder approach)
        alert("Invitation created but email sending failed.");
        return;
      }

      // 3) Update invitation to SENT only after successful email send
      const { error: updateErr } = await supabase
        .from("co_founder_invitations")
        .update({ status: "sent" })
        .eq("invitation_token", tokenToUse)
        .eq("venture_id", venture.id);

      if (updateErr) {
        console.error("Failed to update status:", updateErr);
      }

      // 4) Add dashboard message (with created_by + created_by_id so it can be dismissed later)
      await VentureMessage.create({
        venture_id: venture.id,
        message_type: "external_feedback_invite",
        title: "📧 Feedback Invite Sent",
        content: `Invitation sent to ${inviteForm.name} (${inviteForm.email}).`,
        priority: 2,
        is_dismissed: false,
        created_by: user.email,
        created_by_id: user.id,
      });

      alert("Success! Invite sent.");
      setShowEmailForm(false);
      setInviteForm({ name: "", email: "", message: "" });
      await loadData();
    } catch (error) {
      console.error("Error sending feedback invite:", error);
      alert("Failed to send invitation.");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!venture) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">No Venture Found</h2>
          <p className="text-gray-600 mb-6">
            Please create a venture before accessing the promotion center.
          </p>
          <Button onClick={() => router.push(createPageUrl("CreateVenture"))}>
            Create Venture
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8" dir="ltr">
      <div className="max-w-5xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.push(createPageUrl("Dashboard"))}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Promotion Center
          </h1>
          <p className="text-gray-600">
            Launch campaigns to market your venture and track results.
          </p>
        </div>

        <div className="mb-6 bg-white rounded-lg p-4 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Your Venture</p>
              <p className="text-lg font-semibold">{venture.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Virtual Capital</p>
              <p className="text-2xl font-bold text-green-600">
                ${(venture.virtual_capital || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Existing campaign results (unchanged) */}
        {campaigns.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Campaign Results
            </h2>
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="bg-white">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {campaign.campaign_type === "in-app"
                            ? "In-App Promotion"
                            : "Email Campaign"}
                        </CardTitle>
                        <CardDescription>
                          {campaign.campaign_type === "in-app" &&
                            campaign.tagline &&
                            `"${campaign.tagline}"`}
                          {campaign.campaign_type === "email" &&
                            campaign.sender_name &&
                            `From: ${campaign.sender_name}`}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Cost</p>
                        <p className="text-lg font-bold text-red-600">
                          -${(campaign.cost || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <BarChart3 className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-600">
                          {campaign.audience_size || 0}
                        </p>
                        <p className="text-xs text-gray-600">
                          {campaign.campaign_type === "in-app"
                            ? "Invites Sent"
                            : "Emails Sent"}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <Eye className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-purple-600">
                          {campaign.views || 0}
                        </p>
                        <p className="text-xs text-gray-600">
                          {campaign.campaign_type === "in-app"
                            ? "Invites Viewed"
                            : "Emails Opened"}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <MousePointerClick className="w-6 h-6 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-600">
                          {campaign.clicks || 0}
                        </p>
                        <p className="text-xs text-gray-600">
                          Landing Page Clicks
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-gray-500">
                        Launched on{" "}
                        {campaign.created_date
                          ? new Date(campaign.created_date).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* [2026-01-10] FIX: External feedback invites list (same look/behavior as InviteCoFounder) */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            External Feedback Invites
          </h2>

          {feedbackInvites.length === 0 ? (
            <div className="bg-white border rounded-lg p-4 text-gray-600">
              No external feedback invites yet.
            </div>
          ) : (
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Sent Invitations</CardTitle>
                
              </CardHeader>
              <CardContent className="p-0">
                {feedbackInvites.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3 border-b last:border-b-0 flex items-start justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(inv.status)}
                        <p className="font-medium">{inv.invitee_name}</p>
                      </div>
                      <p className="text-xs text-gray-500">{inv.invitee_email}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {inv.created_date
                          ? new Date(inv.created_date).toLocaleString()
                          : ""}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-semibold ${getStatusBadge(
                        inv.status
                      )}`}
                    >
                      {String(inv.status || "").toLowerCase()}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Launch new campaign */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Launch New Campaign
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* In-App package (unchanged navigation) */}
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push(createPageUrl("Promotion?type=in-app"))}
          >
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <CardTitle>In-App Promotion Package</CardTitle>
              <CardDescription>
                Reach registered platform users with targeted invitations to visit
                your landing page and provide feedback.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 mb-4">
                <li className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  Target platform community
                </li>
                <li className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-500" />
                  Choose audience size (50-500 users)
                </li>
                <li className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-yellow-500" />
                  Costs virtual currency
                </li>
              </ul>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                Select In-App Package
              </Button>
            </CardContent>
          </Card>

          {/* [2026-01-10] FIX: Email invite – same flow as InviteCoFounder, but external_feedback type */}
          <Card className={showEmailForm ? "ring-2 ring-green-500 shadow-md" : ""}>
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Invite a Friend (via Email)</CardTitle>
              <CardDescription>
                Send a personalized email invitation to external contacts for landing-page feedback.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {!showEmailForm ? (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <p className="text-sm font-semibold text-green-800">
                      This service is currently FREE!
                    </p>
                  </div>

                  <ul className="space-y-2 text-sm text-gray-600 mb-4">
                    <li className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-green-500" />
                      Reach external audiences
                    </li>
                    <li className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-500" />
                      Temporary access via token
                    </li>
                    <li className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      Completely free
                    </li>
                  </ul>

                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => setShowEmailForm(true)}
                  >
                    Create Email Invite
                  </Button>
                </>
              ) : (
                <form onSubmit={sendFeedbackInvite} className="space-y-4">
                  <div className="space-y-1">
                    <Label>Name *</Label>
                    <Input
                      placeholder="Recipient name"
                      value={inviteForm.name}
                      onChange={(e) => handleInviteChange("name", e.target.value)}
                      required
                      disabled={isSending}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={inviteForm.email}
                      onChange={(e) => handleInviteChange("email", e.target.value)}
                      required
                      disabled={isSending}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Message (optional)</Label>
                    <Textarea
                      value={inviteForm.message}
                      onChange={(e) => handleInviteChange("message", e.target.value)}
                      className="h-24"
                      disabled={isSending}
                      placeholder="Ask for specific feedback (pricing, market, UX, etc.)"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={isSending}
                    >
                      {isSending ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending...
                        </span>
                      ) : (
                        "Send Invite"
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowEmailForm(false)}
                      disabled={isSending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
