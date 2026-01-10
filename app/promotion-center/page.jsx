"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Venture, PromotionCampaign, User, CoFounderInvitation, VentureMessage } from '@/api/entities.js'; 
import { supabase } from "@/lib/supabase"; 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Input } from "@/components/ui/input.jsx"; 
import { Label } from "@/components/ui/label"; 
import { ArrowLeft, Mail, BarChart3, Loader2, Send, X } from 'lucide-react';

export default function PromotionCenter() {
  const [venture, setVenture] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false); 
  const [showEmailForm, setShowEmailForm] = useState(false); 
  const [emailForm, setEmailForm] = useState({ email: "", name: "" }); 
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await User.me();
        if (!currentUser) return;
        
        const ventures = await Venture.filter({ created_by: currentUser.email }, "-created_date");
        if (ventures && ventures.length > 0) {
          setVenture(ventures[0]);
          const results = await PromotionCampaign.filter({ venture_id: ventures[0].id }, "-created_date");
          setCampaigns(results || []);
        }
      } catch (e) { console.error("Init error:", e); }
      setIsLoading(false);
    };
    init();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!venture || !emailForm.email) return;

    setIsSending(true);
    try {
      // 1. משיכת פרטי המשתמש המלאים כדי למנוע undefined במייל
      const currentUser = await User.me();
      if (!currentUser || !currentUser.email) {
        alert("Session error. Please login again.");
        return;
      }

      const token = Math.random().toString(36).substring(2, 15);
      const inviterDisplayName = currentUser.full_name || currentUser.email;

      // 2. יצירת ההזמנה בטבלת co_founder_invitations
      await CoFounderInvitation.create({
        venture_id: venture.id,
        inviter_email: currentUser.email,
        invitee_email: emailForm.email,
        invitee_name: emailForm.name,
        invitation_token: token,
        invitation_type: 'external_feedback',
        status: "sent",
        created_by: currentUser.email 
      });

      // 3. שליחה ל-API - כאן התיקון ל-undefined
      await fetch("/api/send-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailForm.email,
          ventureName: venture.name,
          inviterName: inviterDisplayName, // עכשיו זה לא יהיה undefined
          invitationToken: token,
          ventureId: venture.id,
          type: 'external_feedback' // הדגל שמנתב לדף הנחיתה
        }),
      });

      // 4. יצירת רשומת קמפיין - פתרון ה-400 ע"י שליחת אובייקט מלא
      await PromotionCampaign.create({
        venture_id: venture.id,
        campaign_type: 'email',
        campaign_name: `Feedback Request - ${emailForm.name}`,
        audience_size: 1,
        cost: 0,
        sender_name: emailForm.name,
        status: 'PENDING',
        created_by: currentUser.email 
      });

      // 5. הודעה למערכת
      await VentureMessage.create({
        venture_id: venture.id,
        message_type: "external_feedback_sent",
        title: "📧 Feedback Invite Sent",
        content: `Invitation sent to ${emailForm.name || emailForm.email}`,
        created_by: currentUser.email
      });

      alert("Success! Invitation sent.");
      setShowEmailForm(false);
      setEmailForm({ email: "", name: "" });
      
      // רענון רשימה
      const updated = await PromotionCampaign.filter({ venture_id: venture.id }, "-created_date");
      setCampaigns(updated || []);

    } catch (err) {
      console.error("Submit error:", err);
      alert("Database Error. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-green-600" /></div>;

  return (
    <div className="max-w-4xl mx-auto p-6 text-left" dir="ltr">
      <Button variant="ghost" onClick={() => router.push('/')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>
      
      <h1 className="text-3xl font-bold mb-6">Promotion Center</h1>

      {/* תצוגת הקמפיינים */}
      <div className="mb-10 space-y-4">
        {campaigns.length > 0 ? campaigns.map(c => (
          <Card key={c.id} className="border-l-4 border-l-green-500">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="font-bold">Feedback Link Sent to: {c.sender_name || 'Guest'}</p>
                <p className="text-sm text-gray-500">{new Date(c.created_date || Date.now()).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                    <p className="font-bold text-lg">{c.clicks || 0}</p>
                    <p className="text-[10px] text-gray-400 uppercase">Clicks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )) : (
          <p className="text-gray-500 italic">No feedback invites sent yet.</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="opacity-40 grayscale shadow-none">
          <CardHeader><CardTitle>In-App Promotion</CardTitle></CardHeader>
          <CardContent><Button disabled className="w-full">Coming Soon</Button></CardContent>
        </Card>

        <Card className={showEmailForm ? "ring-2 ring-green-500" : ""}>
          <CardHeader>
            <Mail className="w-8 h-8 text-green-600 mb-2" />
            <CardTitle>Invite a Friend</CardTitle>
            <CardDescription>Send a direct link to your Landing Page.</CardDescription>
          </CardHeader>
          <CardContent>
            {!showEmailForm ? (
              <Button className="w-full bg-green-600" onClick={() => setShowEmailForm(true)}>Send Feedback Invite</Button>
            ) : (
              <form onSubmit={handleSend} className="space-y-4">
                <div className="space-y-2">
                  <Label>Friend's Name</Label>
                  <Input placeholder="e.g. John Doe" value={emailForm.name} onChange={e => setEmailForm({...emailForm, name: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input type="email" placeholder="email@example.com" value={emailForm.email} onChange={e => setEmailForm({...emailForm, email: e.target.value})} required />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="flex-1 bg-green-600" disabled={isSending}>
                    {isSending ? <Loader2 className="animate-spin h-4 w-4" /> : "Send Now"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setShowEmailForm(false)}><X className="h-4 w-4" /></Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}