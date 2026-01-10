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

// קומפוננטת עזר פנימית כדי למנוע שגיאות ייבוא
const Badge = ({ children, className = "" }) => (
  <span className={`px-2 py-1 text-[10px] font-bold rounded-full border ${className}`}>
    {children}
  </span>
);

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
        if (!user || !user.email) {
            setIsLoading(false);
            return;
        }

        const ventures = await Venture.filter({ created_by: user.email }, "-created_date");
        if (ventures && ventures.length > 0) {
          const currentVenture = ventures[0];
          setVenture(currentVenture);
          const ventureCampaigns = await PromotionCampaign.filter({ venture_id: currentVenture.id }, "-created_date");
          setCampaigns(ventureCampaigns || []);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const sendExternalFeedbackInvite = async (e) => {
    if (e) e.preventDefault();
    
    // הגנה מפני שגיאת trim על ערכים ריקים
    const cleanEmail = (emailForm.email || "").trim();
    const cleanName = (emailForm.name || "").trim();

    if (!venture || !cleanEmail) {
      alert("Please enter a valid email address.");
      return;
    }

    setIsSending(true);
    try {
      const user = await User.me();
      if (!user || !user.email) throw new Error("You must be logged in");

      const token = Math.random().toString(36).substring(2, 15);

      // 1. יצירת ההזמנה בטבלה הקיימת
      await CoFounderInvitation.create({
        venture_id: venture.id,
        inviter_email: user.email,
        invitee_email: cleanEmail,
        invitee_name: cleanName || "Guest",
        invitation_token: token,
        invitation_type: 'external_feedback', // הסוג החדש
        status: "pending",
        created_by: user.email // חובה למניעת שגיאה 400
      });

      // 2. קריאה ל-API לשליחת המייל
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

      if (emailResponse.ok) {
        // עדכון סטטוס ב-Supabase
        await supabase.from("co_founder_invitations").update({ status: "sent" }).eq("invitation_token", token);

        // 3. יצירת רשומת קמפיין עם כל שדות החובה
        await PromotionCampaign.create({
          venture_id: venture.id,
          campaign_type: 'email',
          audience_size: 1,
          cost: 0,
          sender_name: cleanName,
          status: 'PENDING',
          created_by: user.email // השדה הקריטי
        });

        // 4. הודעה לדשבורד
        await VentureMessage.create({
          venture_id: venture.id,
          message_type: "external_feedback_sent",
          title: "📧 Feedback Invite Sent",
          content: `Sent to ${cleanName || cleanEmail}.`,
          created_by: user.email
        });

        alert("Invitation sent successfully!");
        setEmailForm({ email: "", name: "" });
        setShowEmailForm(false);
        
        // רענון רשימת הקמפיינים
        const updated = await PromotionCampaign.filter({ venture_id: venture.id }, "-created_date");
        setCampaigns(updated || []);
      } else {
          throw new Error("API failed to send email");
      }
    } catch (error) {
      console.error("Full Error Object:", error);
      alert("Error: " + (error.message || "Unknown error occurred"));
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>;

  if (!venture) return <div className="p-8 text-center"><h2 className="text-2xl font-bold mb-4">No Venture Found</h2><Button onClick={() => router.push(createPageUrl('CreateVenture'))}>Create Venture</Button></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 text-left" dir="ltr">
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => router.push(createPageUrl('Dashboard'))} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Promotion Center</h1>
          <p className="text-gray-600">Track and manage your feedback invitations.</p>
        </div>

        <div className="mb-6 bg-white rounded-lg p-4 border">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">Your Venture</p><p className="text-lg font-semibold">{venture.name}</p></div>
            <div><p className="text-sm text-gray-500">Virtual Capital</p><p className="text-2xl font-bold text-green-600">${(venture.virtual_capital || 0).toLocaleString()}</p></div>
          </div>
        </div>

        {campaigns.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Campaign Results</h2>
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="bg-white border-l-4 border-l-green-500">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-md">📧 Feedback Email: {campaign.sender_name || 'Contact'}</CardTitle>
                      <Badge className="text-green-600 border-green-200 bg-green-50">FREE</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-2 bg-gray-50 rounded"><p className="text-lg font-bold">{campaign.audience_size}</p><p className="text-[10px] uppercase text-gray-500">Sent</p></div>
                      <div className="text-center p-2 bg-gray-50 rounded"><p className="text-lg font-bold">{campaign.views || 0}</p><p className="text-[10px] uppercase text-gray-500">Opened</p></div>
                      <div className="text-center p-2 bg-gray-50 rounded"><p className="text-lg font-bold">{campaign.clicks || 0}</p><p className="text-[10px] uppercase text-gray-500">Clicks</p></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="opacity-50 grayscale shadow-none">
            <CardHeader>
              <Users className="w-8 h-8 text-gray-400 mb-2" />
              <CardTitle className="text-gray-400">In-App Promotion</CardTitle>
            </CardHeader>
            <CardContent><Button disabled variant="outline" className="w-full">Coming Soon</Button></CardContent>
          </Card>

          <Card className={`transition-all ${showEmailForm ? 'ring-2 ring-green-500' : ''}`}>
            <CardHeader>
              <Mail className="w-8 h-8 text-green-600 mb-2" />
              <CardTitle>Invite a Friend (via Email)</CardTitle>
              <CardDescription>Get feedback on your Landing Page.</CardDescription>
            </CardHeader>
            <CardContent>
              {!showEmailForm ? (
                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => setShowEmailForm(true)}>
                  Create Email Invite
                </Button>
              ) : (
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>Contact Name</Label>
                    <Input 
                      value={emailForm.name} 
                      onChange={(e) => setEmailForm({...emailForm, name: e.target.value})} 
                      placeholder="e.g. John Doe" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input 
                      type="email" 
                      value={emailForm.email} 
                      onChange={(e) => setEmailForm({...emailForm, email: e.target.value})} 
                      placeholder="email@example.com" 
                    />
                  </div>
                  <div className="flex gap-2 text-left">
                    <Button onClick={sendExternalFeedbackInvite} className="flex-1 bg-green-600" disabled={isSending}>
                      {isSending ? <Loader2 className="animate-spin" /> : "Send Invite"}
                    </Button>
                    <Button variant="ghost" onClick={() => setShowEmailForm(false)}>Cancel</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}