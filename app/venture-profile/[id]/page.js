// venture-profile/[id]/page.js
export const dynamic = 'force-dynamic';

import { createClient } from '@supabase/supabase-js';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Target, Lightbulb, AlertCircle, TrendingUp, Users, Lock, CheckCircle } from 'lucide-react';

export default async function VentureProfilePoC({ params, searchParams }) {
  const { id } = params;
  const token = searchParams?.token;
  const isAcceptedStatus = searchParams?.accepted === 'true';

  // יצירת הקליינט בצורה מפורשת עבור השרת בלבד
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    {
      auth: {
        persistSession: false, // קריטי למניעת שגיאות בשרת
      },
    }
  );

  // 1. אימות ההזמנה ומשיכת נתוני המיזם בבת אחת (Join)
  // אנחנו מושכים את ההזמנה ואת נתוני התוכנית העסקית
  const { data: invitation, error: inviteError } = await supabase
    .from('co_founder_invitations')
    .select(`
      status,
      ventures (
        id,
        founders_count,
        business_plans (*)
      )
    `)
    .eq('venture_id', id)
    .eq('invitation_token', token)
    .single();

  // אם יש שגיאה כאן - זה מה שגורם ל-500. נבדוק את זה.
  if (inviteError || !invitation) {
    console.error("Auth Error:", inviteError);
    return notFound();
  }

  const venture = invitation.ventures;
  const plan = venture?.business_plans?.[0]; // Supabase מחזיר מערך ב-Join

  // 2. פונקציית האישור
  async function handleAccept() {
    'use server';
    
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );

    // עדכון סטטוס
    await admin
      .from('co_founder_invitations')
      .update({ status: 'accepted' })
      .eq('invitation_token', token);

    // עדכון מונה
    await admin
      .from('ventures')
      .update({ founders_count: (venture.founders_count || 1) + 1 })
      .eq('id', id);

    revalidatePath(`/venture-profile/${id}`);
    redirect(`/venture-profile/${id}?token=${token}&accepted=true`);
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 font-sans" dir="ltr text-left">
      
      {/* מודאל הצלחה */}
      {isAcceptedStatus && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center border border-green-100">
            <CheckCircle className="text-green-600 mx-auto mb-4" size={60} />
            <h2 className="text-2xl font-black text-gray-900 mb-2">Success!</h2>
            <p className="text-gray-600 mb-8 text-sm">You are now a co-founder of this venture.</p>
            <a href="/dashboard" className="block w-full bg-blue-600 text-white font-bold py-4 rounded-xl text-center">
              Go to Dashboard
            </a>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8 mb-8 text-left">
          <div className="flex justify-between items-center border-b pb-6 mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 italic">Venture Profile</h1>
              <p className="text-gray-500 text-sm font-light">Confidential Overview</p>
            </div>
            <div className={`px-5 py-2 rounded-full text-xs font-bold ${invitation.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-blue-600 text-white'}`}>
              {invitation.status === 'accepted' ? 'PARTNER STATUS' : 'AUTHORIZED VIEW'}
            </div>
          </div>

          {invitation.status === 'sent' && !isAcceptedStatus && (
            <div className="mb-8 p-8 bg-blue-600 rounded-3xl shadow-xl flex items-center justify-between text-white">
              <div className="text-left">
                <h3 className="text-2xl font-bold italic text-white">Join the Team</h3>
                <p className="text-blue-100 text-sm italic">Accept the invitation to become a co-founder.</p>
              </div>
              <form action={handleAccept}>
                <button type="submit" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all">
                  ACCEPT & JOIN
                </button>
              </form>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm text-center">
              <p className="text-xs text-blue-600 font-bold uppercase mb-1">Completion</p>
              <p className="text-2xl font-black text-gray-900">{plan?.completion_percentage || 0}%</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm text-center">
              <p className="text-xs text-green-600 font-bold uppercase mb-1">Status</p>
              <p className="text-lg font-bold text-gray-900 italic uppercase">PoC Stage</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm text-center">
              <p className="text-xs text-purple-600 font-bold uppercase mb-1">Verified Token</p>
              <p className="text-[10px] font-mono text-gray-400 truncate px-2">{token}</p>
            </div>
          </div>
        </div>

        {/* Content Body - השדות העסקיים המקוריים */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-left">
              <div className="flex items-center gap-3 mb-4 text-blue-600">
                <Target size={28} />
                <h2 className="text-2xl font-bold text-gray-900">Mission</h2>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg italic border-l-4 border-blue-50 pl-4">
                "{plan?.mission || 'No mission defined'}"
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-left">
                <h3 className="text-red-500 font-bold border-b pb-2 mb-3 text-xs flex items-center gap-2"><AlertCircle size={16}/> THE PROBLEM</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{plan?.problem}</p>
              </section>
              <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-left">
                <h3 className="text-green-500 font-bold border-b pb-2 mb-3 text-xs flex items-center gap-2"><Lightbulb size={16}/> THE SOLUTION</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{plan?.solution}</p>
              </section>
            </div>
          </div>

          <div className="space-y-8">
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-left">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-blue-600 uppercase text-xs border-b pb-2">
                <TrendingUp size={18} /> Market Size
              </h3>
              <p className="text-gray-700 text-sm">{plan?.market_size}</p>
            </section>

            <section className="bg-gray-900 p-6 rounded-2xl shadow-xl text-white text-left">
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