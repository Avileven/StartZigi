"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// ייבוא ישויות המערכת שלך
import { Venture, PromotionCampaign, User, CoFounderInvitation } from '@/api/entities.js'; 
// ייבוא ישיר של supabase למניעת בעיות אמינות בנתוני משתמש
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

  // טעינת נתונים ראשונית
  useEffect(() => {
    const init = async () => {
      try {
        // שימוש ב-User.me לטעינה ראשונית
        const currentUser = await User.me();
        if (!currentUser) return;
        
        // משיכת המיזם של המשתמש
        const ventures = await Venture.filter({ created_by: currentUser.email }, "-created_date");
        if (ventures && ventures.length > 0) {
          setVenture(ventures[0]);
          // משיכת רשימת הקמפיינים הקיימים
          const results = await PromotionCampaign.filter({ venture_id: ventures[0].id }, "-created_date");
          setCampaigns(results || []);
        }
      } catch (e) {
        console.error("Init error:", e);
      }
      setIsLoading(false);
    };
    init();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!venture || !emailForm.email) return;

    setIsSending(true);
    try {
      // תיקון: משיכת ה-Session ישירות מ-Supabase כדי לוודא שאין undefined בשם או במייל
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      
      if (!user) {
        alert("Session error - please refresh page");
        return;
      }

      // פתרון ה-undefined: אם אין שם מלא ב-metadata, לוקח את הקידומת של המייל
      const userEmail = user.email;
      const inviterName = user.user_metadata?.full_name || userEmail.split('@')[0] || "A Founder";
      
      const token = Math.random().toString(36).substring(2, 15);

      // 1. יצירת ההזמנה בטבלת co_founder_invitations
      // שים לב: invitation_type מוגדר כ-external_feedback כדי להבדיל משותף
      await CoFounderInvitation.create({
        venture_id: venture.id,
        inviter_email: userEmail,
        invitee_email: emailForm.email,
        invitee_name: emailForm.name,
        invitation_token: token,
        invitation_type: 'external_feedback',
        status: "sent",
        created_by: userEmail
      });

      // 2. קריאה ל-API לשליחת המייל בפועל
      await fetch("/api/send-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailForm.email,
          ventureName: venture.name,
          inviterName: inviterName, // עכשיו זה לא יהיה undefined
          invitationToken: token,
          ventureId: venture.id,
          type: 'external_feedback' // הדגל שמנתב לדף הנחיתה במייל
        }),
      });

      // 3. יצירת רשומת קמפיין בטבלה promotion_campaigns
      // פתרון שגיאה 400: הוספת תאריכים מפורשים ושדות חובה
      await PromotionCampaign.create({
        venture_id: venture.id,
        campaign_type: 'email',
        campaign_name: `Feedback to ${emailForm.name}`,
        sender_name: emailForm.name,
        status: 'PENDING',
        created_by: userEmail,
        created_date: new Date().toISOString(), // תאריך יצירה (חובה)
        updated_date: new Date().toISOString()  // תאריך עדכון (חובה)
      });

      alert("Success! Invite sent to " + emailForm.email);
      
      // איפוס טופס וסגירה
      setShowEmailForm(false);
      setEmailForm({ email: "", name: "" });
      
      // רענון רשימת הקמפיינים המוצגת למטה
      const updated = await PromotionCampaign.filter({ venture_id: venture.id }, "-created_date");
      setCampaigns(updated || []);

    } catch (err) {
      console.error("Submit error:", err);
      alert("Something went wrong. Please check console.");
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
      
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Promotion Center</h1>

      {/* תצוגת קמפיינים קיימים */}
      <div className="mb-10 space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Recent Activity</h2>
        {campaigns.length > 0 ? campaigns.map(c => (
          <Card key={c.id} className="border-l-4 border-l-green-500 shadow-sm">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="font-bold">Email Invite: {c.sender_name || 'Guest'}</p>
                <p className="text-sm text-gray-500">{new Date(c.created_date).toLocaleDateString()}</p>
              </div>
              <div className="text-center bg-gray-50 p-2 rounded min-w-[80px]">
                  <p className="font-bold text-lg text-green-700">{c.clicks || 0}</p>
                  <p className="text-[10px] text-gray-400 uppercase font-medium">Clicks</p>
              </div>
            </CardContent>
          </Card>
        )) : (
          <p className="text-gray-400 italic">No feedback invites sent yet.</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* קמפיין שאינו זמין כרגע */}
        <Card className="opacity-40 grayscale bg-gray-50 shadow-none border-dashed">
          <CardHeader><CardTitle>In-App Promotion</CardTitle></CardHeader>
          <CardContent><Button disabled className="w-full">Coming Soon</Button></CardContent>
        </Card>

        {/* טופס שליחת ההזמנה */}
        <Card className={showEmailForm ? "ring-2 ring-green-500 shadow-lg" : "shadow-sm"}>
          <CardHeader>
            <Mail className="w-8 h-8 text-green-600 mb-2" />
            <CardTitle>Invite a Friend</CardTitle>
            <CardDescription>Send a link to your landing page for feedback.</CardDescription>
          </CardHeader>
          <CardContent>
            {!showEmailForm ? (
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => setShowEmailForm(true)}>
                Create New Invite
              </Button>
            ) : (
              <form onSubmit={handleSend} className="space-y-4">
                <div className="space-y-2 text-left">
                  <Label>Friend's Name</Label>
                  <Input 
                    placeholder="e.g. John Doe" 
                    value={emailForm.name} 
                    onChange={e => setEmailForm({...emailForm, name: e.target.value})} 
                    required 
                  />
                </div>
                <div className="space-y-2 text-left">
                  <Label>Email Address</Label>
                  <Input 
                    type="email" 
                    placeholder="email@example.com" 
                    value={emailForm.email} 
                    onChange={e => setEmailForm({...emailForm, email: e.target.value})} 
                    required 
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" disabled={isSending}>
                    {isSending ? <Loader2 className="animate-spin h-4 w-4" /> : "Send Now"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setShowEmailForm(false)}>
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