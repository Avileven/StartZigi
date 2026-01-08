// venture-profile/[id]/page.js
export const dynamic = 'force-dynamic';

import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache'; // לייבוא רענון הדף
import { Target, Lightbulb, AlertCircle, TrendingUp, Users, Lock, CheckCircle } from 'lucide-react';

export default async function VentureProfilePoC({ params, searchParams }) {
  const { id } = params;
  const token = searchParams?.token;

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  if (!id || !process.env.SUPABASE_SERVICE_ROLE_KEY) return notFound();

  // --- שלב האימות ---
  // אנחנו בודקים את ההזמנה. אם היא קיימת (לא משנה אם sent או accepted) אנחנו מאפשרים צפייה
  const { data: invitation, error: authError } = await supabaseAdmin
    .from('co_founder_invitations')
    .select('status, invitation_token')
    .eq('venture_id', id)
    .eq('invitation_token', token)
    .single();

  // חסימת גישה אם אין טוקן תקין ב-DB
  if (authError || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans text-center">
        <div className="max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <Lock className="mx-auto text-red-500 mb-4" size={48} />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Private Profile</h1>
          <p className="text-gray-600">This profile is only accessible via a valid co-founder invitation link.</p>
        </div>
      </div>
    );
  }

  // --- לוגיקת הצטרפות (Server Action) ---
  // פונקציה שרצה בשרת בלחיצה על הכפתור
  async function handleAccept() {
    'use server';
    
    // 1. עדכון סטטוס ההזמנה
    const { error: inviteUpdateErr } = await supabaseAdmin
      .from('co_founder_invitations')
      .update({ status: 'accepted' })
      .eq('invitation_token', token);

    if (inviteUpdateErr) return;

    // 2. משיכת הנתונים הנוכחיים של המיזם כדי לעדכן מונה
    const { data: venture } = await supabaseAdmin
      .from('ventures')
      .select('founders_count')
      .eq('id', id)
      .single();

    // 3. עדכון מספר המייסדים (מעלים ב-1)
    await supabaseAdmin
      .from('ventures')
      .update({ founders_count: (venture?.founders_count || 1) + 1 })
      .eq('id', id);

    // רענון הדף כדי להעלים את הכפתור ולהציג סטטוס שותף
    revalidatePath(`/venture-profile/${id}`);
  }

  // --- משיכת נתוני המיזם ---
  const { data: plan, error: planError } = await supabaseAdmin
    .from('business_plans')
    .select('*')
    .eq('venture_id', id)
    .single();

  if (planError || !plan) return notFound();

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 text-left" dir="ltr">
      <div className="max-w-5xl mx-auto font-sans">
        
        {/* Header Section */}
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6 mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2 italic">Venture Profile</h1>
              <p className="text-gray-500 text-lg font-light">Confidential Partnership Overview</p>
            </div>
            
            {/* סטטוס צפייה/שותף */}
            {invitation.status === 'accepted' ? (
              <div className="bg-green-100 text-green-700 px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                <CheckCircle size={16} /> YOU ARE A PARTNER
              </div>
            ) : (
              <div className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-bold tracking-wide">
                AUTHORIZED VIEW
              </div>
            )}
          </div>

          {/* כפתור הצטרפות - מופיע רק אם הסטטוס הוא 'sent' */}
          {invitation.status === 'sent' && (
            <div className="mb-8 p-6 bg-blue-50 border border-blue-100 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-blue-900 font-bold text-lg">Ready to join this venture?</h3>
                <p className="text-blue-700 text-sm">By clicking join, you confirm your interest as a co-founder.</p>
              </div>
              <form action={handleAccept}>
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-200 active:scale-95"
                >
                  Join as Co-Founder
                </button>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs text-blue-600 font-bold uppercase mb-1">Completion</p>
              <p className="text-2xl font-black text-gray-900">{plan.completion_percentage}%</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs text-green-600 font-bold uppercase mb-1">Last Updated</p>
              <p className="text-lg font-bold text-gray-900">
                {plan.updated_date ? new Date(plan.updated_date).toLocaleDateString('en-US') : 'N/A'}
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs text-purple-600 font-bold uppercase mb-1">Verified Invitation</p>
              <p className="text-xs font-mono text-gray-400 truncate px-2">{token?.substring(0, 10)}...</p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-blue-600">
                <Target size={28} />
                <h2 className="text-2xl font-bold text-gray-900">Mission</h2>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg italic border-l-4 border-blue-50 pl-4">"{plan.mission}"</p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3 text-red-500 font-bold border-b pb-2">
                  <AlertCircle size={20} />
                  <h3>THE PROBLEM</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{plan.problem}</p>
              </section>

              <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3 text-green-500 font-bold border-b pb-2">
                  <Lightbulb size={20} />
                  <h3>THE SOLUTION</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{plan.solution}</p>
              </section>
            </div>
          </div>

          <div className="space-y-8">
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-blue-600 uppercase text-sm border-b pb-2">
                <TrendingUp size={18} /> Market Size
              </h3>
              <p className="text-gray-700 text-sm">{plan.market_size}</p>
            </section>

            <section className="bg-gray-900 p-6 rounded-2xl shadow-xl text-white">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-blue-400 uppercase">
                <Users size={18} /> About the Founder
              </h3>
              <p className="text-gray-300 text-sm italic leading-relaxed">
                "{plan.entrepreneur_background}"
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}