// venture-profile/[id]/page.js
export const dynamic = 'force-dynamic';

import { createClient } from '@supabase/supabase-js';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Target, Lightbulb, AlertCircle, TrendingUp, Users, Lock, CheckCircle } from 'lucide-react';

export default async function VentureProfilePoC({ params, searchParams }) {
  const { id } = params;
  const token = searchParams?.token;
  
  // בדיקה האם הגענו לדף אחרי לחיצה על אישור (בשביל להציג את המודאל)
  const isAcceptedStatus = searchParams?.accepted === 'true';

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  if (!id || !process.env.SUPABASE_SERVICE_ROLE_KEY) return notFound();

  // --- 1. אימות ההזמנה מול הדאטאבייס ---
  const { data: invitation, error: authError } = await supabaseAdmin
    .from('co_founder_invitations')
    .select('status, invitation_token')
    .eq('venture_id', id)
    .eq('invitation_token', token)
    .single();

  // חסימת גישה אם אין טוקן תקין
  if (authError || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 text-center font-sans">
        <div className="max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <Lock className="mx-auto text-red-500 mb-4" size={48} />
          <h1 className="text-xl font-bold mb-2 text-gray-900">Private Profile</h1>
          <p className="text-gray-600">Access denied. Invalid or expired invitation link.</p>
        </div>
      </div>
    );
  }

  // --- 2. לוגיקת השרת (Server Action) ---
  // הפונקציה הזו תופעל בלחיצה על הכפתור ותעדכן את ה-DB
  async function handleAccept() {
    'use server';
    
    // א. עדכון סטטוס ההזמנה ל-accepted
    const { error: inviteUpdateErr } = await supabaseAdmin
      .from('co_founder_invitations')
      .update({ status: 'accepted' })
      .eq('invitation_token', token);

    if (inviteUpdateErr) {
      console.error("Error updating invitation:", inviteUpdateErr);
      return;
    }

    // ב. משיכת מספר המייסדים הנוכחי ועדכון (increment)
    const { data: venture } = await supabaseAdmin
      .from('ventures')
      .select('founders_count')
      .eq('id', id)
      .single();

    const currentCount = venture?.founders_count || 1;

    const { error: ventureUpdateErr } = await supabaseAdmin
      .from('ventures')
      .update({ founders_count: currentCount + 1 })
      .eq('id', id);

    if (ventureUpdateErr) {
      console.error("Error updating venture count:", ventureUpdateErr);
      return;
    }

    // ג. רענון הנתונים והצגת הודעת הצלחה דרך ה-URL
    revalidatePath(`/venture-profile/${id}`);
    redirect(`/venture-profile/${id}?token=${token}&accepted=true`);
  }

  // --- 3. משיכת נתוני התוכנית העסקית ---
  const { data: plan } = await supabaseAdmin
    .from('business_plans')
    .select('*')
    .eq('venture_id', id)
    .single();

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 text-left" dir="ltr">
      
      {/* --- Windows On Top (Modal): מופיע אחרי הלחיצה על אישור --- */}
      {isAcceptedStatus && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center border border-green-100 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-600" size={40} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">You're In!</h2>
            <p className="text-gray-600 mb-8">
              The database has been updated successfully. You are now a co-founder of this venture.
            </p>
            <a 
              href="/dashboard" 
              className="block w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg active:scale-95"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto font-sans">
        
        {/* Header Section */}
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6 mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2 italic">Venture Profile</h1>
              <p className="text-gray-500 text-lg font-light">Confidential Partnership Overview</p>
            </div>
            
            {/* הצגת סטטוס: האם כבר שותף או רק צופה */}
            {invitation.status === 'accepted' ? (
              <div className="bg-green-100 text-green-700 px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                <CheckCircle size={16} /> PARTNER ACCESS ACTIVE
              </div>
            ) : (
              <div className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-bold tracking-wide">
                AUTHORIZED VIEW
              </div>
            )}
          </div>

          {/* --- כפתור ההצטרפות: מופיע רק אם ההזמנה טרם אושרה --- */}
          {invitation.status === 'sent' && !isAcceptedStatus && (
            <div className="mb-8 p-8 bg-blue-600 rounded-3xl shadow-xl shadow-blue-100 flex flex-col md:flex-row items-center justify-between gap-6 text-white transition-all">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold mb-1 italic text-white">Ready to join the team?</h3>
                <p className="text-blue-100 opacity-90">Confirm your interest to become a co-founder in the database.</p>
              </div>
              <form action={handleAccept}>
                <button 
                  type="submit"
                  className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-4 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-lg whitespace-nowrap"
                >
                  JOIN AS CO-FOUNDER
                </button>
              </form>
            </div>
          )}

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs text-blue-600 font-bold uppercase mb-1">Completion</p>
              <p className="text-2xl font-black text-gray-900">{plan?.completion_percentage || 0}%</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs text-green-600 font-bold uppercase mb-1">Last Updated</p>
              <p className="text-lg font-bold text-gray-900">
                {plan?.updated_date ? new Date(plan.updated_date).toLocaleDateString('en-US') : 'N/A'}
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs text-purple-600 font-bold uppercase mb-1">Verification Token</p>
              <p className="text-xs font-mono text-gray-400 truncate px-2">{token?.substring(0, 12)}...</p>
            </div>
          </div>
        </div>

        {/* Content Body - נתוני המיזם */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-blue-600">
                <Target size={28} />
                <h2 className="text-2xl font-bold text-gray-900">Mission</h2>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg italic border-l-4 border-blue-50 pl-4">
                "{plan?.mission || 'Mission statement not provided.'}"
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3 text-red-500 font-bold border-b pb-2">
                  <AlertCircle size={20} />
                  <h3>THE PROBLEM</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{plan?.problem}</p>
              </section>

              <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3 text-green-500 font-bold border-b pb-2">
                  <Lightbulb size={20} />
                  <h3>THE SOLUTION</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{plan?.solution}</p>
              </section>
            </div>
          </div>

          <div className="space-y-8">
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-blue-600 uppercase text-sm border-b pb-2">
                <TrendingUp size={18} /> Market Size
              </h3>
              <p className="text-gray-700 text-sm">{plan?.market_size}</p>
            </section>

            <section className="bg-gray-900 p-6 rounded-2xl shadow-xl text-white">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-blue-400 uppercase">
                <Users size={18} /> About the Founder
              </h3>
              <p className="text-gray-300 text-sm italic leading-relaxed">
                "{plan?.entrepreneur_background || 'Background details are confidential.'}"
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}