// invite-cofounder25036
"use client";

import React, { useState, useEffect } from "react";
import { Venture, CoFounderInvitation, VentureMessage, User } from "@/api/entities.js";
import { supabase } from "@/lib/supabase"; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input.jsx";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Mail, Users, CheckCircle, Clock, X, Loader2 } from "lucide-react";

export default function InviteCoFounder() {
  const [venture, setVenture] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const [inviteForm, setInviteForm] = useState({
    email: "",
    name: "",
    message: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await User.me();
      
      // [FIX] Previously used Venture.list() which returns ALL ventures in the system.
      // Now filtering only by the current user's email so we always get the correct venture.
      // Safety: if filter fails or returns empty, venture stays null and UI shows "No Venture Found".
      const userVentures = await Venture.filter({ created_by: user.email }, "-created_date");
      
      if (userVentures?.length > 0) {
        const currentVenture = userVentures[0];
        setVenture(currentVenture);

        const existingInvitations = await CoFounderInvitation.filter(
          { venture_id: currentVenture.id },
          "-created_date"
        );
        setInvitations(existingInvitations || []);
      } else {
        setVenture(null);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setVenture(null);
      setInvitations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setInviteForm((prev) => ({ ...prev, [field]: value }));
  };

  const sendInvitation = async (e) => {
    e.preventDefault();

    if (!venture || !inviteForm.email || !inviteForm.name) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSending(true);

    try {
      const user = await User.me();
      const invitationToken = Math.random().toString(36).substring(2, 15);

      const invitation = await CoFounderInvitation.create({
        venture_id: venture.id,
        inviter_email: user.email,
        invitee_email: inviteForm.email,
        invitee_name: inviteForm.name,
        custom_message: inviteForm.message,
        invitation_token: invitationToken,
        status: "pending",
        created_by_id: user.id,
        created_by: user.email, 
      });

      const emailResponse = await fetch("/api/send-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteForm.email,
          ventureName: venture.name,
          inviterName: user.full_name || user.name || user.email,
          invitationToken: invitation?.invitation_token || invitationToken,
          ventureId: venture.id 
        }),
      });

      if (emailResponse.ok) {
        const tokenToUpdate = invitation?.invitation_token || invitationToken;

        const { error: updateErr } = await supabase
          .from("co_founder_invitations")
          .update({ status: "sent" })
          .eq("invitation_token", tokenToUpdate)
          .eq("venture_id", venture.id);

        if (updateErr) {
          console.error("Failed to update status:", updateErr);
        } else {
          alert("Invitation sent! The candidate can now view the venture profile.");
        }
      } else {
        alert("Invitation created but email sending failed.");
      }

      await VentureMessage.create({
        venture_id: venture.id,
        message_type: "co_founder_invite",
        title: "👥 Co-Founder Invited!",
        content: `Invitation sent to ${inviteForm.name}. Link points to Venture Profile.`,
        priority: 2,
        is_dismissed: false,
        created_by: user.email,
        created_by_id: user.id
      });

      setInviteForm({ email: "", name: "", message: "" });
      await loadData();
    } catch (error) {
      console.error("Error sending invitation:", error);
      alert("Failed to send invitation.");
    } finally {
      setIsSending(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4 text-yellow-500" />;
      case "sent": return <Mail className="w-4 h-4 text-blue-500" />;
      case "accepted": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "declined": return <X className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "sent": return "bg-blue-100 text-blue-800";
      case "accepted": return "bg-green-100 text-green-800";
      case "declined": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) return <div className="p-8 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  if (!venture) return <div className="p-8 text-center"><h1>No Venture Found</h1></div>;

  const hasAcceptedCoFounder = invitations.some((inv) => inv.status === "accepted");

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-left" dir="ltr">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Invite a Co-Founder</h1>
          <p className="text-lg text-gray-600">Candidates will receive a link to view your Venture Profile.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-purple-600" /> Send Invitation
                </CardTitle>
                <CardDescription>Invite someone to join {venture.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={sendInvitation} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input id="name" value={inviteForm.name} onChange={(e) => handleInputChange("name", e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input id="email" type="email" value={inviteForm.email} onChange={(e) => handleInputChange("email", e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Personal Message (Optional)</Label>
                    <Textarea id="message" value={inviteForm.message} onChange={(e) => handleInputChange("message", e.target.value)} className="h-24" />
                  </div>
                  <Button type="submit" disabled={isSending} className="w-full bg-purple-600 hover:bg-purple-700">
                    {isSending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Send Invitation"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="mb-6">
              <CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> Team Status</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3 flex justify-between">
                  <span className="text-gray-600">Current Founders</span>
                  <Badge>{venture.founders_count || 1}</Badge>
                </div>
              </CardContent>
            </Card>

            {invitations.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-lg">Sent Invitations</CardTitle></CardHeader>
                <CardContent className="p-0">
                  {invitations.map((invitation) => (
                    <div key={invitation.id} className="p-3 border-b last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{invitation.invitee_name}</p>
                        <Badge className={getStatusColor(invitation.status)}>{invitation.status}</Badge>
                      </div>
                      <p className="text-xs text-gray-400">{new Date(invitation.created_date).toLocaleString()}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
