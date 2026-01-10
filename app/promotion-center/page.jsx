"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Venture, PromotionCampaign, User, CoFounderInvitation, VentureMessage } from '@/api/entities.js'; 
import { supabase } from "@/lib/supabase"; 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Input } from "@/components/ui/input.jsx"; 
import { Label } from "@/components/ui/label"; 
import { createPageUrl } from '@/utils';
import { ArrowLeft, Users, Mail, BarChart3, Eye, MousePointerClick, Loader2, Send, X } from 'lucide-react';

export default function PromotionCenter() {
  const [venture, setVenture] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false); 
  const [showEmailForm, setShowEmailForm] = useState(false); 
  const [emailForm, setEmailForm] = useState({ email: "", name: "" }); 
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const user = await User.me();
        if (!user) return;
        const ventures = await Venture.filter({ created_by: user.email }, "-created_date");
        if (ventures?.length > 0) {
          setVenture(ventures[0]);
          const ventureCampaigns = await PromotionCampaign.filter({ venture_id: ventures[0].id }, "-created_date");
          setCampaigns(ventureCampaigns || []);
        }
      } catch (e) { console.error(e); }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const sendExternalFeedbackInvite = async (e) => {
    if (e) e.preventDefault();
    
    // הגנה על ה-Trim
    const cleanEmail = (emailForm.email || "").toString().trim();
    const cleanName = (emailForm.name || "").toString().trim();

    if (!venture || !cleanEmail) {
      alert("Please enter an email");
      return;
    }

    setIsSending(true);
    try {
      const user = await User.me();
      if (!user?.email) throw new Error("No user session");

      const token = Math.random().toString(36).substring(2, 15);

      // 1. יצירת ההזמנה (כמו בשותף)
      const { error: invError } = await supabase.from('co_founder_invitations').insert([{
        venture_id: venture.id,
        inviter_email: user.email,
        invitee_email: cleanEmail,
        invitee_name: cleanName || "Guest",
        invitation_token: token,
        invitation_type: 'external_feedback',
        status: "sent",
        created_by: user.email
      }]);
      if (invError) throw invError;

      // 2. שליחת המייל
      const emailResponse = await fetch("/api/send-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          ventureName: venture.name,
          inviterName: user.full_name || user.email,
          invitationToken: token,
          ventureId: venture.id,
          type: 'external_feedback'
        }),
      });

      // 3. יצירת רשומת קמפיין - שימוש ב-Supabase ישיר כדי למנוע שגיאות Entity
      const { error: campError } = await supabase.from('promotion_campaigns').insert([{
        venture_id: venture.id,
        campaign_type: 'email',
        audience_size: 1,
        cost: 0,
        sender_name: cleanName,
        status: 'PENDING',
        created_by: user.email // השדה שגרם ל-400
      }]);
      if (campError) throw campError;

      // 4. הודעה
      await VentureMessage.create({
        venture_id: venture.id,
        message_type: "external_feedback_sent",
        title: "📧 Feedback Sent",
        content: `Invite sent to ${cleanName}`,
        created_by: user.email
      });

      alert("Success!");
      setEmailForm({ email: "", name: "" });
      setShowEmailForm(false);
      
      // רענון
      const updated = await PromotionCampaign.filter({ venture_id: venture.id }, "-created_date");
      setCampaigns(updated || []);

    } catch (error) {
      console.error("Error:", error);
      alert("Error: " + (error.message || "Unknown error"));
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="max-w-5xl mx-auto p-6" dir="ltr">
      <Button variant="ghost" onClick={() => router.push(createPageUrl('Dashboard'))} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>

      <h1 className="text-3xl font-bold mb-6">Promotion Center</h1>

      {campaigns.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          <div className="grid gap-4">
            {campaigns.map(c => (
              <Card key={c.id} className="border-l-4 border-l-green-500">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-bold">Email to: {c.sender_name || 'Guest'}</p>
                    <p className="text-sm text-gray-500">{new Date(c.created_at || Date.now()).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-6">
                    <div className="text-center"><p className="text-lg font-bold">{c.clicks || 0}</p><p className="text-xs">Clicks</p></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
         <Card className="opacity-50"><CardHeader><CardTitle>In-App</CardTitle></CardHeader><CardContent><Button disabled className="w-full">Soon</Button></CardContent></Card>

         <Card className={showEmailForm ? "ring-2 ring-green-500" : ""}>
          <CardHeader>
            <Mail className="w-8 h-8 text-green-600 mb-2" />
            <CardTitle>Email Invite</CardTitle>
            <CardDescription>Invite for feedback</CardDescription>
          </CardHeader>
          <CardContent>
            {!showEmailForm ? (
              <Button className="w-full bg-green-600" onClick={() => setShowEmailForm(true)}>Create Invite</Button>
            ) : (
              <div className="space-y-4">
                <Input placeholder="Name" value={emailForm.name} onChange={e => setEmailForm({...emailForm, name: e.target.value})} />
                <Input placeholder="Email" value={emailForm.email} onChange={e => setEmailForm({...emailForm, email: e.target.value})} />
                <div className="flex gap-2">
                  <Button onClick={sendExternalFeedbackInvite} className="flex-1 bg-green-600" disabled={isSending}>
                    {isSending ? "Sending..." : "Send"}
                  </Button>
                  <Button variant="ghost" onClick={() => setShowEmailForm(false)}>X</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}