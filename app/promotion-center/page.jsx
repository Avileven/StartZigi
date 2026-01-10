"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// שימוש בדיוק באותם ייבואים מהקובץ שעובד לך
import { Venture, CoFounderInvitation, VentureMessage, User, PromotionCampaign } from "@/api/entities.js";
import { supabase } from "@/lib/supabase"; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, BarChart3, Eye, MousePointerClick, Loader2, Send, X } from 'lucide-react';

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
  }, []);

  // העתקה של לוגיקת טעינת הנתונים מהקובץ שעובד (invite-cofounder)
  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me(); 
      // שימוש ב-list כפי שמופיע בקובץ שלך
      const userVentures = await Venture.list("-created_date");
      if (userVentures?.length > 0) {
        const currentVenture = userVentures[0];
        setVenture(currentVenture);

        // טעינת הקמפיינים
        const ventureCampaigns = await PromotionCampaign.filter({ venture_id: currentVenture.id }, "-created_date");
        setCampaigns(ventureCampaigns || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const sendExternalFeedbackInvite = async (e) => {
    e.preventDefault();
    if (!venture || !emailForm.email) return;

    setIsSending(true);
    try {
      // וידוא משתמש בדיוק כמו בדף שעובד
      const user = await User.me();
      if (!user) throw new Error("No user found");

      const token = Math.random().toString(36).substring(2, 15);

      // 1. יצירת ההזמנה - העתקה של המבנה מהקובץ המוצלח
      // הוספנו invitation_type כדי להבדיל
      const invitation = await CoFounderInvitation.create({
        venture_id: venture.id,
        inviter_email: user.email,
        invitee_email: emailForm.email,
        invitee_name: emailForm.name || "Guest",
        invitation_token: token,
        invitation_type: 'external_feedback', 
        status: "pending",
        created_by: user.email // השדה הקריטי
      });

      // 2. שליחת המייל
      const emailResponse = await fetch("/api/send-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailForm.email,
          ventureName: venture.name,
          inviterName: user.full_name || user.email,
          invitationToken: token,
          ventureId: venture.id,
          type: 'external_feedback'
        }),
      });

      if (emailResponse.ok) {
        // עדכון סטטוס ב-Supabase כפי שמופיע בקוד שלך
        await supabase.from("co_founder_invitations").update({ status: "sent" }).eq("invitation_token", token);

        // 3. יצירת רשומת קמפיין - כאן התיקון לפי השגיאה
        // אנחנו מוודאים ש-created_by נלקח ישירות מהאובייקט שהרגע חזר מ-User.me()
        await PromotionCampaign.create({
          venture_id: venture.id,
          campaign_type: 'email',
          audience_size: 1,
          cost: 0,
          sender_name: emailForm.name,
          created_by: user.email // התיקון לשגיאת ה-not-null
        });

        // 4. הודעה למערכת
        await VentureMessage.create({
          venture_id: venture.id,
          message_type: "external_feedback_sent",
          title: "📧 Feedback Invite Sent",
          content: `Sent to ${emailForm.name}`,
          created_by: user.email
        });

        alert("Sent successfully!");
        setEmailForm({ email: "", name: "" });
        setShowEmailForm(false);
        loadData(); // רענון נתונים
      }
    } catch (error) {
      console.error("Error sending invitations: ", error);
      alert("Error: check console");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-left" dir="ltr">
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => router.push('/')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <h1 className="text-3xl font-bold mb-8">Promotion Center</h1>

        {/* תצוגת תוצאות קמפיינים */}
        <div className="grid gap-4 mb-10">
          {campaigns.map((c) => (
            <Card key={c.id} className="border-l-4 border-l-green-500">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold">Email Campaign: {c.sender_name}</p>
                  <p className="text-sm text-gray-500">{new Date(c.created_date || Date.now()).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-4">
                  <div className="text-center"><p className="font-bold">{c.clicks || 0}</p><p className="text-xs">Clicks</p></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="opacity-50 grayscale shadow-none">
            <CardHeader><CardTitle>In-App Promotion</CardTitle></CardHeader>
            <CardContent><Button disabled className="w-full">Coming Soon</Button></CardContent>
          </Card>

          <Card className={showEmailForm ? "ring-2 ring-green-500" : ""}>
            <CardHeader>
              <Mail className="w-8 h-8 text-green-600 mb-2" />
              <CardTitle>Invite a Friend</CardTitle>
              <CardDescription>Send email for feedback</CardDescription>
            </CardHeader>
            <CardContent>
              {!showEmailForm ? (
                <Button className="w-full bg-green-600" onClick={() => setShowEmailForm(true)}>Create Invite</Button>
              ) : (
                <form onSubmit={sendExternalFeedbackInvite} className="space-y-4">
                  <Input placeholder="Name" value={emailForm.name} onChange={e => setEmailForm({...emailForm, name: e.target.value})} required />
                  <Input type="email" placeholder="Email" value={emailForm.email} onChange={e => setEmailForm({...emailForm, email: e.target.value})} required />
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1 bg-green-600" disabled={isSending}>
                      {isSending ? "Sending..." : "Send"}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setShowEmailForm(false)}><X /></Button>
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