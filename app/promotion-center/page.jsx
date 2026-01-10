"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Venture, PromotionCampaign, User, CoFounderInvitation, VentureMessage } from '@/api/entities.js'; // הוספנו ישויות לניהול ההזמנה
import { supabase } from "@/lib/supabase"; 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Input } from "@/components/ui/input.jsx"; // הוספנו עבור טופס האימייל
import { Label } from "@/components/ui/label"; // הוספנו עבור טופס האימייל
import { createPageUrl } from '@/utils';
import { ArrowLeft, Users, Mail, TrendingUp, DollarSign, BarChart3, Eye, MousePointerClick, Loader2, Send, X } from 'lucide-react';

export default function PromotionCenter() {
  const [venture, setVenture] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false); // סטייט חדש לשליחת המייל
  const [showEmailForm, setShowEmailForm] = useState(false); // סטייט לפתיחת הטופס בכרטיס הירוק
  const [emailForm, setEmailForm] = useState({ email: "", name: "" }); // שדות הטופס
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const user = await User.me();
        const ventures = await Venture.filter({ created_by: user.email }, "-created_date");
        if (ventures.length > 0) {
          const currentVenture = ventures[0];
          setVenture(currentVenture);
          const ventureCampaigns = await PromotionCampaign.filter({ venture_id: currentVenture.id }, "-created_date");
          setCampaigns(ventureCampaigns);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  // פונקציית השליחה - "רוכבת" על הלוגיקה של הזמנת שותף עם התאמות לסוג פידבק
  const sendExternalFeedbackInvite = async (e) => {
    e.preventDefault();
    if (!venture || !emailForm.email) return;

    setIsSending(true);
    try {
      const user = await User.me();
      const token = Math.random().toString(36).substring(2, 15);

      // 1. יצירת ההזמנה בטבלת co_founder_invitations עם הסוג החדש
      await CoFounderInvitation.create({
        venture_id: venture.id,
        inviter_email: user.email,
        invitee_email: emailForm.email,
        invitee_name: emailForm.name,
        invitation_token: token,
        invitation_type: 'external_feedback', // שינוי: הזרקת הסוג החדש לעמודה הקיימת
        status: "pending",
        created_by: user.email
      });

      // 2. קריאה ל-API לשליחת המייל
      const emailResponse = await fetch("/api/send-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailForm.email,
          ventureName: venture.name,
          inviterName: user.full_name || user.email,
          invitationToken: token,
          ventureId: venture.id,
          type: 'external_feedback' // דגל ל-API שידע לנתב לדף הנחיתה
        }),
      });

      if (emailResponse.ok) {
        // עדכון סטטוס ל-"sent" ב-Supabase
        await supabase.from("co_founder_invitations").update({ status: "sent" }).eq("invitation_token", token);

        // 3. יצירת רשומת קמפיין - כאן הוספנו את ה-created_by שפתר את שגיאה 400
        await PromotionCampaign.create({
          venture_id: venture.id,
          campaign_type: 'email',
          audience_size: 1,
          cost: 0,
          sender_name: emailForm.name,
          created_by: user.email // תיקון ה-Not-Null Constraint
        });

        // 4. יצירת הודעה לדשבורד
        await VentureMessage.create({
          venture_id: venture.id,
          message_type: "external_feedback_sent",
          title: "📧 Feedback Invite Sent",
          content: `Sent to ${emailForm.name}. Link points to Landing Page.`,
          created_by: user.email
        });

        alert("Invitation sent successfully!");
        setEmailForm({ email: "", name: "" }); // איפוס טופס
        setShowEmailForm(false); // סגירת טופס
        
        // רענון רשימת הקמפיינים המוצגת בדף
        const updated = await PromotionCampaign.filter({ venture_id: venture.id }, "-created_date");
        setCampaigns(updated);
      }
    } catch (error) {
      console.error("Error sending invite:", error);
      alert("Failed to send invitation.");
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
          <p className="text-gray-600">Launch campaigns to market your venture and track results.</p>
        </div>

        {/* סטטיסטיקה וקמפיינים קיימים - ללא שינוי מבני */}
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
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {campaign.campaign_type === 'email' ? '📧 Email Feedback Campaign' : 'In-App Promotion'}
                        </CardTitle>
                        <CardDescription>
                          {campaign.sender_name ? `Invited: ${campaign.sender_name}` : 'External Outreach'}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Cost</p>
                        <p className="text-lg font-bold text-green-600">FREE</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg"><BarChart3 className="w-6 h-6 text-blue-600 mx-auto mb-2" /><p className="text-2xl font-bold text-blue-600">{campaign.audience_size}</p><p className="text-xs text-gray-600">Sent</p></div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg"><Eye className="w-6 h-6 text-purple-600 mx-auto mb-2" /><p className="text-2xl font-bold text-purple-600">{campaign.views || 0}</p><p className="text-xs text-gray-600">Opened</p></div>
                      <div className="text-center p-4 bg-green-50 rounded-lg"><MousePointerClick className="w-6 h-6 text-green-600 mx-auto mb-2" /><p className="text-2xl font-bold text-green-600">{campaign.clicks || 0}</p><p className="text-xs text-gray-600">Landing Page Clicks</p></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="opacity-60 grayscale cursor-not-allowed">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4"><Users className="w-6 h-6 text-indigo-600" /></div>
              <CardTitle>In-App Promotion</CardTitle>
              <CardDescription>Reach users already inside the platform.</CardDescription>
            </CardHeader>
            <CardContent><Button disabled className="w-full">Coming Soon</Button></CardContent>
          </Card>

          {/* הכרטיס הירוק - עבר שינוי להכלת טופס פנימי */}
          <Card className={`hover:shadow-lg transition-all ${showEmailForm ? 'ring-2 ring-green-500 shadow-md' : ''}`}>
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Invite a Friend (via Email)</CardTitle>
              <CardDescription>Send a link to your landing page to get external feedback.</CardDescription>
            </CardHeader>
            <CardContent>
              {!showEmailForm ? (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <p className="text-sm font-semibold text-green-800">This service is currently FREE!</p>
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => setShowEmailForm(true)}>
                    Create Email Invite
                  </Button>
                </>
              ) : (
                <form onSubmit={sendExternalFeedbackInvite} className="space-y-4 border-t pt-4">
                  <div className="space-y-2">
                    <Label>Friend's Name</Label>
                    <Input 
                      value={emailForm.name} 
                      onChange={(e) => setEmailForm({...emailForm, name: e.target.value})} 
                      required 
                      placeholder="e.g. John Smith" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input 
                      type="email" 
                      value={emailForm.email} 
                      onChange={(e) => setEmailForm({...emailForm, email: e.target.value})} 
                      required 
                      placeholder="john@example.com" 
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1 bg-green-600" disabled={isSending}>
                      {isSending ? <Loader2 className="animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Send Invite</>}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setShowEmailForm(false)}>
                      <X className="w-4 h-4" />
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