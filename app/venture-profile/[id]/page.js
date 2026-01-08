// venture-profile/[id]/page.js
export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  Target,
  Lightbulb,
  AlertCircle,
  TrendingUp,
  Users,
  Lock,
  CheckCircle,
  DollarSign,
  Globe,
  Users2
} from "lucide-react";

function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, serviceKey);
}

export default async function VentureProfilePoC({ params, searchParams }) {
  const { id } = params;
  const token = searchParams?.token;

  if (!id || !process.env.SUPABASE_SERVICE_ROLE_KEY) return notFound();
  
  const supabaseAdmin = createSupabaseAdmin();

  // 1. אימות ההזמנה ושליפת שם המיזם ב-Join אחד
  const { data: invitation, error: authError } = await supabaseAdmin
    .from("co_founder_invitations")
    .select(`
      status, 
      invitation_token,
      ventures (
        name,
        founders_count
      )
    `)
    .eq("venture_id", id)
    .eq("invitation_token", token)
    .single();

  if (authError || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans text-center">
        <div className="max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <Lock className="mx-auto text-red-500 mb-4" size={48} />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Private Profile</h1>
          <p className="text-gray-600">Invalid or expired invitation link.</p>
        </div>
      </div>
    );
  }

  const ventureName = invitation.ventures?.name || "New Venture";

  // 2. Server Action להצטרפות
  async function handleAccept() {
    "use server";
    const admin = createSupabaseAdmin();
    await admin
      .from("co_founder_invitations")
      .update({ status: "accepted" })
      .eq("venture_id", id)
      .eq("invitation_token", token);

    await admin
      .from("ventures")
      .update({ founders_count: (invitation.ventures?.founders_count || 1) + 1 })
      .eq("id", id);

    revalidatePath(`/venture-profile/${id}`);
  }

  // 3. משיכת נתוני התוכנית
  const { data: plan } = await supabaseAdmin
    .from("business_plans")
    .select("*")
    .eq("venture_id", id)
    .single();

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-left" dir="ltr">
      <div className="max-w-5xl mx-auto font-sans">
        
        {/* Header Section */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="p-8 border-b border-slate-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <span className="text-blue-600 font-bold text-sm tracking-widest uppercase mb-2 block italic">Co-Founder Invitation</span>
                <h1 className="text-4xl font-black text-slate-900 italic leading-tight">
                  {ventureName}
                </h1>
              </div>
              
              {invitation.status === "accepted" ? (
                <div className="bg-emerald-50 text-emerald-700 px-6 py-3 rounded-2xl text-sm font-black flex items-center gap-2 border border-emerald-100">
                  <CheckCircle size={20} /> YOU ARE A PARTNER
                </div>
              ) : (
                <div className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-sm font-black tracking-wide shadow-lg shadow-blue-200">
                  AUTHORIZED VIEW
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-slate-50/50">
            <div className="p-6 flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-xl text-blue-600"><Globe size={24} /></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Market Size</p>
                <p className="text-sm font-bold text-slate-700">{plan?.market_size || "Not specified"}</p>
              </div>
            </div>
            <div className="p-6 flex items-center gap-4">
              <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600"><DollarSign size={24} /></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Revenue Model</p>
                <p className="text-sm font-bold text-slate-700">{plan?.revenue_model || "Not specified"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Join Action */}
        {invitation.status === "sent" && (
          <div className="mb-8 p-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 text-white transform hover:scale-[1.01] transition-transform">
            <div className="text-left">
              <h3 className="text-2xl font-black mb-1 italic">Ready to join the team?</h3>
              <p className="text-blue-100 text-sm opacity-90">Become a co-founder and start building {ventureName}.</p>
            </div>
            <form action={handleAccept}>
              <button type="submit" className="bg-white text-blue-700 hover:bg-slate-50 px-10 py-4 rounded-2xl font-black text-lg shadow-2xl active:scale-95 transition-all">
                JOIN AS CO-FOUNDER
              </button>
            </form>
          </div>
        )}

        {/* --- MAIN CONTENT: New Order --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. Problem & Solution (At the beginning) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm border-t-4 border-t-rose-500">
                <div className="flex items-center gap-2 mb-4 text-rose-500">
                  <AlertCircle size={22} />
                  <h3 className="font-black text-sm uppercase tracking-widest">The Problem</h3>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{plan?.problem || "Details pending."}</p>
              </section>

              <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm border-t-4 border-t-emerald-500">
                <div className="flex items-center gap-2 mb-4 text-emerald-500">
                  <Lightbulb size={22} />
                  <h3 className="font-black text-sm uppercase tracking-widest">The Solution</h3>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{plan?.solution || "Details pending."}</p>
              </section>
            </div>

            {/* 2. Mission (Following Problem/Solution) */}
            <section className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
              <div className="flex items-center gap-3 mb-6 text-blue-600">
                <Target size={32} />
                <h2 className="text-2xl font-black text-slate-900">The Mission</h2>
              </div>
              <p className="text-slate-600 leading-relaxed text-xl italic font-medium">
                "{plan?.mission || "Mission statement pending."}"
              </p>
            </section>

            {/* 3. Market Details (Consolidated Section) */}
            <section className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-8 text-indigo-600 border-b border-slate-50 pb-4">
                <TrendingUp size={32} />
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Market & Business Strategy</h2>
              </div>
              <div className="space-y-8">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-slate-400">
                    <Users2 size={18} />
                    <h4 className="text-xs font-black uppercase tracking-widest">Target Customers</h4>
                  </div>
                  <p className="text-slate-700 text-lg leading-relaxed">{plan?.target_customers || "Information pending."}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-50">
                   <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Market Size</h4>
                    <p className="text-slate-700 font-bold">{plan?.market_size || "Not specified"}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Revenue Model</h4>
                    <p className="text-slate-700 font-bold">{plan?.revenue_model || "Not specified"}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <section className="bg-slate-900 p-8 rounded-3xl shadow-2xl text-white relative overflow-hidden">
              <div className="absolute -right-4 -top-4 text-white/5 rotate-12">
                <Users size={120} />
              </div>
              <h3 className="text-xs font-black mb-4 flex items-center gap-2 text-blue-400 uppercase tracking-widest relative">
                <Users size={18} /> Founder DNA
              </h3>
              <p className="text-slate-300 text-sm italic leading-relaxed relative z-10">
                "{plan?.entrepreneur_background || "Founder bio is private."}"
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}