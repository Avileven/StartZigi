"use client";
import React, { useState, useEffect } from 'react';
import { Venture, PromotionCampaign, User, CoFounderInvitation, VentureMessage } from "@/api/entities.js";
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
  const [emailForm, setEmailForm] = useState({ email: "", name: "" });
  const [showEmailForm, setShowEmailForm] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const user = await User.me();
      const userVentures = await Venture.list("-created_date");
      if (userVentures?.length > 0) {
        setVenture(userVentures[0]);
        const results = await PromotionCampaign.filter({ venture_id: userVentures[0].id }, "-created_date");
        setCampaigns(results || []);
      }
    } catch (e) { console.error(e); }
    setIsLoading(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!venture || !emailForm.email) return;
    setIsSending(true);

    try {
      const user = await User.me(); // טעינת המשתמש [cite: 60]
      const token = Math.random().toString(36).substring(2, 15);

      // 1. יצירת הזמנה ב-DB (העתקה מדויקת משורה 63 בקוד ששלחת)
      const invitation = await CoFounderInvitation.create({
        venture_id: venture.id,
        inviter_email: user.email,
        invitee_email: emailForm.email,
        invitee_name: emailForm.name,
        invitation_token: token,
        invitation_type: 'external_feedback',
        status: "pending", // סטטוס ראשוני [cite: 70]
        created_by_id: user.id, // חובה [cite: 71]
        created_by: user.email // חובה [cite: 72]
      });

      // 2. שליחה ל-API (העתקה מדויקת משורה 75 שמונעת undefined)
      const emailResponse = await fetch("/api/send-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailForm.email,
          ventureName: venture.name,
          inviterName: user.full_name || user.name || user.email, // תיקון ה-undefined 
          invitationToken: invitation?.invitation_token || token,
          ventureId: venture.id
        }),
      });

      if (emailResponse.ok) {
        // 3. עדכון סטטוס ל-sent (כמו בשורה 92)
        await supabase.from("co_founder_invitations").update({ status: "sent" }).eq("invitation_token", token);

        // 4. יצירת קמפיין (פתרון ה-400 ע"י שליחת תאריכים מפורשים)
        await PromotionCampaign.create({
          venture_id: venture.id,
          campaign_type: 'email',
          campaign_name: `Feedback - ${emailForm.name}`,
          sender_name: emailForm.name,
          status: 'SENT',
          created_by: user.email,
          created_date: new Date().toISOString(), // פתרון ל-SQL NOT NULL
          updated_date: new Date().toISOString()  // פתרון ל-SQL NOT NULL
        });

        alert("Invitation sent!");
        setEmailForm({ email: "", name: "" });
        setShowEmailForm(false);
        loadData();
      }
    } catch (err) { alert("Failed to send."); }
    finally { setIsSending(false); }
  };

  // ... (שאר ה-JSX נשאר זהה, רק הלוגיקה של ה-handleSend השתנתה)
  if (isLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto" /></div>;
  return (
    <div className="max-w-4xl mx-auto p-6 text-left" dir="ltr">
        <Button variant="ghost" onClick={() => window.history.back()} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
        <h1 className="text-3xl font-bold mb-8">Promotion Center</h1>
        
        <div className="mb-10 space-y-4">
            {campaigns.map(c => (
                <Card key={c.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4 flex justify-between items-center">
                        <div><p className="font-bold">Sent to: {c.sender_name}</p></div>
                        <div className="font-bold">{c.clicks || 0} CLICKS</div>
                    </CardContent>
                </Card>
            ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <Card className="opacity-50 grayscale"><CardHeader><CardTitle>In-App</CardTitle></CardHeader></Card>
            <Card>
                <CardHeader><CardTitle>Email Invite</CardTitle></CardHeader>
                <CardContent>
                    {!showEmailForm ? <Button className="w-full" onClick={() => setShowEmailForm(true)}>Start</Button> : (
                        <form onSubmit={handleSend} className="space-y-4">
                            <Input placeholder="Name" value={emailForm.name} onChange={e => setEmailForm({...emailForm, name: e.target.value})} required />
                            <Input type="email" placeholder="Email" value={emailForm.email} onChange={e => setEmailForm({...emailForm, email: e.target.value})} required />
                            <Button type="submit" className="w-full bg-green-600" disabled={isSending}>Send</Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}