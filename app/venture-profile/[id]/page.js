// venture-profile/[id]/page.js 812603
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
  Users2,
  DollarSign,
  Globe
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

  // 1. אימות ההזמנה
  const { data: invitation, error: authError } = await supabaseAdmin
    .from("co_founder_invitations")
    .select("status, invitation_token")
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

  // 2. שליפת שם המיזם
  const { data: ventureData } = await supabaseAdmin
    .from("ventures")
    .select("name, founders_count")
    .eq("id", id)
    .single();

  const ventureName = ventureData?.name || "The Venture";

  // 3. שליפת נתוני התוכנית
  const { data: plan } = await supabaseAdmin
    .from("business_plans")
    .select("*")
    .eq("venture_id", id)
    .single();

  // 4. Server Action להצטרפות
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
      .update({ founders_count: (ventureData?.founders_count || 1) + 1 })
      .eq("id", id);

    revalidatePath(`/venture-profile/${id}`);
  }

  // פונקציית עזר לעיצוב אחיד של כרטיסיות
  const InfoCard = ({ title, content, icon: Icon, colorClass, fullWidth = false }) => (
    <section className={`bg-white p-8 rounded-3xl border border-slate-200 shadow-sm border-t-4 ${colorClass} ${fullWidth ? 'md:col-span-2' : ''}`}>
      <div className="flex items-center gap-3 mb-4 opacity-80">
        <Icon size={22} />
        <h3 className="font-black text-xs uppercase tracking-widest text-slate-500">{title}</h3>
      </div>
      <p className="text-slate-700 text-sm leading-relaxed font-medium whitespace-pre-wrap">
        {content || "Information pending..."}
      </p>
    </section>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-left" dir="ltr">
      <div className="max-w-5xl mx-auto font-sans">
        
        {/* Header Section */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8 p-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <span className="text-blue-600 font-bold text-xs tracking-[0.3em] uppercase mb-2 block">PROFILE</span>
              <h1 className="text-4xl font-black text-slate-900 italic leading-tight">
                {ventureName}
              </h1>
            </div>
            
            {invitation.status === "accepted" ? (
              <div className="bg-emerald-50 text-emerald-700 px-6 py-3 rounded-2xl text-sm font-black flex items-center gap-2 border border-emerald-100">
                <CheckCircle size={20} /> PARTNER STATUS
              </div>
            ) : (
              <div className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-sm font-black tracking-wide shadow-lg shadow-blue-200">
                AUTHORIZED ACCESS
              </div>
            )}
          </div>
        </div>

        {/* CTA Section */}
        {invitation.status === "sent" && (
          <div className="mb-8 p-8 bg-blue-600 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 text-white">
            <div className="text-left">
              <h3 className="text-2xl font-black mb-1 italic">Join the founding team</h3>
              <p className="text-blue-100 text-sm opacity-90">Become a co-founder of {ventureName} today.</p>
            </div>
            <form action={handleAccept}>
              <button type="submit" className="bg-white text-blue-600 hover:bg-slate-50 px-10 py-4 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-lg">
                ACCEPT & JOIN
              </button>
            </form>
          </div>
        )}

        {/* --- GRID OF INFO CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <InfoCard 
            title="The Problem" 
            content={plan?.problem} 
            icon={AlertCircle} 
            colorClass="border-t-rose-500 text-rose-500" 
          />
          
          <InfoCard 
            title="The Solution" 
            content={plan?.solution} 
            icon={Lightbulb} 
            colorClass="border-t-emerald-500 text-emerald-500" 
          />

          <InfoCard 
            title="The Mission" 
            content={plan?.mission} 
            icon={Target} 
            colorClass="border-t-blue-600 text-blue-600" 
            fullWidth={true}
          />

          <InfoCard 
            title="Market Size" 
            content={plan?.market_size} 
            icon={Globe} 
            colorClass="border-t-indigo-500 text-indigo-500" 
          />

          <InfoCard 
            title="Revenue Model" 
            content={plan?.revenue_model} 
            icon={DollarSign} 
            colorClass="border-t-amber-500 text-amber-500" 
          />

          <InfoCard 
            title="Target Audience" 
            content={plan?.target_customers} 
            icon={Users2} 
            colorClass="border-t-purple-500 text-purple-500" 
            fullWidth={true}
          />

          {/* Founder DNA עכשיו באותו עיצוב בדיוק */}
          <InfoCard 
            title="Founder DNA" 
            content={plan?.entrepreneur_background} 
            icon={Users} 
            colorClass="border-t-slate-800 text-slate-800" 
            fullWidth={true}
          />
        </div>

      </div>
    </div>
  );
}