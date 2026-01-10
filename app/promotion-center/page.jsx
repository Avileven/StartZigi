"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// שימוש בייבוא המדויק מהקובץ שעובד (Cofounder)
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
import { ArrowLeft, Mail, Loader2, X } from "lucide-react";

export default function PromotionCenter() {
  const [venture, setVenture] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailForm, setEmailForm] = useState({ email: "", name: "" });

  const router = useRouter();

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      // [2026-01-10] FIX: לשמור את המשתמש שמוחזר (לפני כן לא השתמשת בו)
      const user = await User.me();

      // [2026-01-10] FIX: אם אין משתמש – לא להמשיך (מונע undefined)
      if (!user?.id) {
        router.push("/login");
        return;
      }

      // [2026-01-10] FIX: לא להשתמש ב-Venture.list() (מביא את כל המיזמים)
      // מביא רק מיזמים שהמשתמש הוא founder בהם
      const userVentures = await Venture.filter(
        { founder_user_id: user.id },
        "-created_date"
      );

      if (userVentures?.length > 0) {
        const currentVenture = userVentures[0];
        setVenture(currentVenture);

        // טעינת הקמפיינים הקיימים
        const results = await PromotionCampaign.filter(
          { venture_id: currentVenture.id },
          "-created_date"
        );
        setCampaigns(results || []);
      } else {
        setVenture(null);
        setCampaigns([]);
      }
    } catch (e) {
      console.error("Error loading:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!venture?.id || !emailForm.email) return;

    setIsSending(true);

    try {
      // [2026-01-10] FIX: טעינת משתמש עם בדיקות
      const user = await User.me();

      if (!user?.id || !user?.email) {
        alert("You must be logged in to send an invite.");
        return;
      }

      // [2026-01-10] FIX: יצירת טוקן יציב
      const token =
        globalThis.crypto?.randomUUID?.() ||
        Math.random().toString(36).substring(2, 15);

      // 1️⃣ יצירת רשומת הזמנה
      const invitation = await CoFounderInvitation.create({
        venture_id: venture.id,
        inviter_email: user.email,
        invitee_email: emailForm.email,
        invitee_name: emailForm.name,
        invitation_token: token,
        invitation_type: "external_feedback",
        status: "pending",
        created_by_id: user.id,
        created_by: user.email,
      });

      // 2️⃣ שליחת המייל דרך ה-API
      const emailResponse = await fetch("/api/send-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailForm.email,
          ventureName: venture.name,

          // [2026-01-10] FIX: לא להשתמש ב-full_name (לא קיים אצלך)
          inviterName: user.username || user.email,

          // [2026-01-10] FIX: תמיד לשלוח את הטוקן מה-DB אם קיים
          invitationToken: invitation?.invitation_token || token,

          ventureId: venture.id,
          type: "external_feedback",
        }),
      });

      // [2026-01-10] FIX: טיפול בשגיאות שרת
      if (!emailResponse.ok) {
        const errTxt = await emailResponse.text().catch(() => "");
        console.error("send-invite failed:", emailResponse.status, errTxt);
        alert("Failed to send email. Please check server logs.");
        return;
      }

      // 3️⃣ עדכון סטטוס ל-sent
      await supabase
        .from("co_founder_invitations")
        .update({ status: "sent" })
        .eq("invitation_token", invitation?.invitation_token || token);

      // 4️⃣ יצירת קמפיין
      await PromotionCampaign.create({
        venture_id: venture.id,
        campaign_type: "email",
        campaign_name: `Feedback - ${emailForm.name}`,
        sender_name: emailForm.name,
        status: "SENT",
        created_by: user.email,
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
      });

      // 5️⃣ הוספת הודעה לדשבורד
      await VentureMessage.create({
        venture_id: venture.id,
        message_type: "external_feedback",
        title: "📧 Feedback Invite Sent",
        content: `Invitation sent to ${emailForm.name}`,
        created_by: user.email,
        created_by_id: user.id,
      });

      alert("Success! Invite sent.");
      setShowEmailForm(false);
      setEmailForm({ email: "", name: "" });
      loadData();
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to send.");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading)
    return (
      <div className="p-20 text-center">
        <Loader2 className="animate-spin mx-auto text-green-600" />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 text-left" dir="ltr">
      <Button
        variant="ghost"
        onClick={() => router.push("/")}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <h1 className="text-3xl font-bold mb-6">Promotion Center</h1>

      <div className="mb-10 space-y-4">
        {campaigns.map((c) => (
          <Card key={c.id} className="border-l-4 border-l-green-500">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="font-bold">Feedback Sent: {c.sender_name}</p>
                <p className="text-sm text-gray-500">
                  {new Date(c.created_date).toLocaleDateString()}
                </p>
              </div>
              <div className="text-center font-bold text-lg">
                {c.clicks || 0}
                <span className="text-xs block text-gray-400 uppercase">
                  Clicks
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="opacity-40 grayscale">
          <CardHeader>
            <CardTitle>In-App Promotion</CardTitle>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full">
              Soon
            </Button>
          </CardContent>
        </Card>

        <Card className={showEmailForm ? "ring-2 ring-green-500 shadow-md" : ""}>
          <CardHeader>
            <Mail className="w-8 h-8 text-green-600 mb-2" />
            <CardTitle>Invite Friend</CardTitle>
            <CardDescription>
              Get feedback on your landing page
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showEmailForm ? (
              <Button
                className="w-full bg-green-600"
                onClick={() => setShowEmailForm(true)}
              >
                Send Invite
              </Button>
            ) : (
              <form onSubmit={handleSend} className="space-y-4 text-left">
                <div className="space-y-1">
                  <Label>Name</Label>
                  <Input
                    placeholder="Recipient Name"
                    value={emailForm.name}
                    onChange={(e) =>
                      setEmailForm({ ...emailForm, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={emailForm.email}
                    onChange={(e) =>
                      setEmailForm({ ...emailForm, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1 bg-green-600"
                    disabled={isSending}
                  >
                    {isSending ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      "Send"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowEmailForm(false)}
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
  );
}
