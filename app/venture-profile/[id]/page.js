// venture-profile/[id]/page.js
export const dynamic = 'force-dynamic';

import { createClient } from '@supabase/supabase-js';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Target, Lightbulb, AlertCircle, TrendingUp, Users, Lock, CheckCircle } from 'lucide-react';

export default async function VentureProfilePoC({ params, searchParams }) {
  // פירוק הנתונים מה-URL
  const { id } = params;
  const token = searchParams?.token;
  const isAccepted = searchParams?.accepted === 'true';

  // יצירת קליינט אדמין לעקיפת פוליסות
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  // הגנה בסיסית
  if (!id || !process.env.SUPABASE_SERVICE_ROLE_KEY) return notFound();

  // --- 1. אימות ההזמנה (משיכת סטטוס נוכחי) ---
  const { data: invitation, error: authError } = await supabase
    .from('co_founder_invitations')
    .select('status')
    .eq('venture_id', id)
    .eq('invitation_token', token)
    .single();

  // אם הלינק לא תקין - חוסמים
  if (authError || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-sm border text-center">
          <Lock className="mx-auto text-red-500 mb-4" size={48} />
          <h1 className="text-xl font-bold mb-2 text-gray-900">Private Profile</h1>
          <p className="text-gray-600">Access denied. Invalid link.</p>
        </div>
      </div>
    );
  }

  // --- 2. פעולת השרת (Server Action) ---
  async function joinAction() {
    'use server';

    // א. עדכון ההזמנה לסטטוס מאושר
    await supabase
      .from('co_founder_invitations')
      .update({ status: 'accepted' })
      .eq('invitation_token', token);

    // ב. משיכת מספר המייסדים ועדכון מונה
    const { data: v } = await supabase
      .from('ventures')
      .select('founders_count')
      .eq('id', id)
      .single();

    const currentCount = v?.founders_count || 1;

    await supabase
      .from('ventures')
      .update({ founders_count: currentCount + 1 })
      .eq('id', id);

    // ג. רענון והצגת הודעת הצלחה
    revalidatePath(`/venture-profile/${id}`);
    redirect(`/venture-profile/${id}?token=${token}&accepted=true`);
  }

  // --- 3. משיכת נתוני הפרופיל ---
  const { data: plan } = await supabase
    .from('business_plans')
    .select('*')
    .eq('venture_id', id)
    .single();

  return (
    <div className="min-h-screen bg-white py-12 px-4 font-sans text-left" dir="ltr">
      
      {/* מודאל הודעת הצלחה (Window on top) */}
      {isAccepted && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center border border-green-100 animate-in fade-in zoom-in duration-300">
            <CheckCircle className="text-green-600 mx-auto mb-4" size={60} />
            <h2 className="text-2xl font-black text-gray-900 mb-2">You're In!</h2>
            <p className="text-gray-600 mb-8">The database has been updated. You are now a co-founder of this venture.</p>
            <a href="/dashboard" className="block w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg">
              Go to Dashboard
            </a>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6 mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-1 italic">Venture Profile</h1>
              <p className="text-gray-500 font-light">Confidential Partnership Overview</p>
            </div>
            
            <div className={`px-5 py-2 rounded-full text-sm font-bold ${invitation.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-blue-600 text-white'}`}>
              {invitation.status === 'accepted' ? 'PARTNER STATUS' : 'AUTHORIZED VIEW'}
            </div>
          </div>

          {/* כפתור ה-JOIN: מופיע רק אם הסטטוס הוא 'sent' ועדיין לא אישרנו */}
          {invitation.status === 'sent' && !isAccepted && (
            <div className="mb-8 p-8 bg-blue-600 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 text-white">
              <div>
                <h3 className="text-2xl font-bold mb-1 italic">Join the Founding Team</h3>
                <p className="text-blue-100 opacity-90 italic text-sm">Review the business plan and click to accept the invitation.</p>
              </div>
              <form action={joinAction}>
                <button type="submit" className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-4 rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all">
                  ACCEPT & JOIN
                </button>
              </form>
            </div>
          )}

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm text-center">
              <p className="text-xs text-blue-600 font-bold uppercase mb-1">Completion</p>
              <p className="text-2xl font-black text-gray-900">{plan?.completion_percentage || 0}%</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm text-center">
              <p className="text-xs text-green-600 font-bold uppercase mb-1">Last Update</p>
              <p className="text-lg font-bold text-gray-900">{plan?.updated_date || 'N/A'}</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm text-center">
              <p className="text-xs text-purple-600 font-bold uppercase mb-1">Verified Token</p>
              <p className="text-xs font-mono text-gray-400 truncate px-2">{token?.substring(0, 15)}...</p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8 text-left">
            <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-blue-600">
                <Target size={28} />
                <h2 className="text-2xl font-bold text-gray-900">Mission</h2>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg italic border-l-4 border-blue-50 pl-4 italic">
                "{plan?.mission || 'Mission statement not provided.'}"
              </p>
            </section>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3 text-red-500 font-bold border-b pb-2 text-xs">
                  <AlertCircle size={18} /> THE PROBLEM
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{plan?.problem}</p>
              </section>
              <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3 text-green-500 font-bold border-b pb-2 text-xs">
                  <Lightbulb size={18} /> THE SOLUTION
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{plan?.solution}</p>
              </section>
            </div>
          </div>

          <div className="space-y-8">
            <section className="bg-gray-900 p-6 rounded-2xl shadow-xl text-white">
              <h3 className="text-xs font-bold mb-3 flex items-center gap-2 text-blue-400 uppercase">
                <Users size={18} /> Founder Background
              </h3>
              <p className="text-gray-300 text-sm italic leading-relaxed">
                "{plan?.entrepreneur_background}"
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}