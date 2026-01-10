"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Venture, PromotionCampaign, User, CoFounderInvitation } from '@/api/entities.js'; 
import { supabase } from "@/lib/supabase"; 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Input } from "@/components/ui/input.jsx"; 
import { Label } from "@/components/ui/label"; 
import { ArrowLeft, Mail, Loader2, X } from 'lucide-react';

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
      } catch (e) { console.error(e); }
      setIsLoading(false);
    };
    init();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!venture || !emailForm.email) return;

    setIsSending(true);
    try {
      const currentUser = await User.me();
      if (!currentUser) throw new Error("No user");

      // --- FIX 1: פתרון ה-undefined בשם השולח ---
      // אם full_name ריק, לוקח את החלק שלפני ה-@ באימייל (avibmax)
      const inviterDisplayName = currentUser.full_name || currentUser.email.split('@')[0] || "Someone";

      const token = Math.random().toString(36).substring(2, 15);

      // 1. יצירת הזמנה
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

      // 2. שליחה ל-API
      await fetch("/api/send-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailForm.email,
          ventureName: venture.name,
          inviterName: inviterDisplayName, // התיקון שמונע undefined במייל
          invitationToken: token,
          ventureId: venture.id,
          type: 'external_feedback'
        }),
      });

      // 3. יצירת רשומת קמפיין
      // --- FIX 2: הוספת שדות חובה למניעת שגיאה 400 ---
      await PromotionCampaign.create({
        venture_id: venture.id,
        campaign_type: 'email',
        sender_name: emailForm.name,
        status: 'PENDING',
        created_by: currentUser.email,
        // הוספת תאריכים ידנית למקרה שה-SQL default לא נתפס מיד
        created_date: new Date().toISOString(), 
        updated_date: new Date().toISOString()
      });

      alert("Invite sent to " + emailForm.email);
      setShowEmailForm(false);
      setEmailForm({ email: "", name: "" });
      
      // רענון רשימה
      const updated = await PromotionCampaign.filter({ venture_id: venture.id }, "-created_date");
      setCampaigns(updated || []);

    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-green-600" /></div>;

  return (
    <div className="max-w-4xl mx-auto p-6 text-left" dir="ltr">
      <Button variant="ghost" onClick={() => router.push('/')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      
      <h1 className="text-3xl font-bold mb-6">Promotion Center</h1>

      <div className="mb-10 space-y-4">
        {campaigns.map(c => (
          <Card key={c.id} className="border-l-4 border-l-green-500">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="font-bold">Feedback invite to: {c.sender_name}</p>
                <p className="text-sm text-gray-500">{new Date(c.created_date).toLocaleDateString()}</p>
              </div>
              <div className="text-center font-bold">{c.clicks || 0} CLICKS</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="opacity-40 grayscale shadow-none">
          <CardHeader><CardTitle>In-App Ads</CardTitle></CardHeader>
          <CardContent><Button disabled className="w-full">Coming Soon</Button></CardContent>
        </Card>

        <Card className={showEmailForm ? "ring-2 ring-green-500" : ""}>
          <CardHeader>
            <Mail className="w-8 h-8 text-green-600 mb-2" />
            <CardTitle>Invite a Friend</CardTitle>
            <CardDescription>Get feedback on your Landing Page</CardDescription>
          </CardHeader>
          <CardContent>
            {!showEmailForm ? (
              <Button className="w-full bg-green-600" onClick={() => setShowEmailForm(true)}>Send Feedback Invite</Button>
            ) : (
              <form onSubmit={handleSend} className="space-y-4">
                <Input placeholder="Recipient Name" value={emailForm.name} onChange={e => setEmailForm({...emailForm, name: e.target.value})} required />
                <Input type="email" placeholder="email@example.com" value={emailForm.email} onChange={e => setEmailForm({...emailForm, email: e.target.value})} required />
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 bg-green-600" disabled={isSending}>
                    {isSending ? "Sending..." : "Send Invite"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setShowEmailForm(false)}><X /></Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}