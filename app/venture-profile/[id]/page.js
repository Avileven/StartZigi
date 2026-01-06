export const dynamic = 'force-dynamic';

import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { 
  Target, 
  Lightbulb, 
  AlertCircle, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Award 
} from 'lucide-react';

export default async function VentureProfilePoC({ params }) {
  const { id } = params;

  // יצירת הקליינט בתוך הפונקציה מונעת שגיאות בזמן ה-Build של Vercel
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  if (!id || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing ID or Service Key');
    return notFound();
  }

  const { data: plan, error } = await supabaseAdmin
    .from('business_plans')
    .select('*')
    .eq('venture_id', id)
    .single();

  if (error || !plan) {
    console.error('Data Fetch Error:', error);
    return notFound();
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8" dir="ltr text-left">
      <div className="max-w-5xl mx-auto font-sans">
        
        {/* Header Section */}
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-6 mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2 italic">Venture Profile</h1>
              <p className="text-gray-500 text-lg">Detailed Business Overview</p>
            </div>
            <div className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-bold tracking-wide">
              PROPOSAL ACTIVE
            </div>
          </div>

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
              <p className="text-xs text-purple-600 font-bold uppercase mb-1">Ref ID</p>
              <p className="text-xs font-mono text-gray-400 truncate px-2">{id.substring(0, 8)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8 text-left">
            {/* Mission */}
            <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-blue-600">
                <Target size={28} />
                <h2 className="text-2xl font-bold text-gray-900">Mission Statement</h2>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg italic border-l-4 border-blue-100 pl-4">"{plan.mission}"</p>
            </section>

            {/* Problem & Solution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3 text-red-500 font-bold border-b border-red-50 pb-2">
                  <AlertCircle size={20} />
                  <h3>THE PROBLEM</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{plan.problem}</p>
              </section>

              <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3 text-green-500 font-bold border-b border-green-50 pb-2">
                  <Lightbulb size={20} />
                  <h3>THE SOLUTION</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{plan.solution}</p>
              </section>
            </div>

            {/* Product Details */}
            <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-orange-500">
                <Award size={28} />
                <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
              </div>
              <div className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-6 rounded-lg text-sm leading-relaxed border border-gray-100">
                {plan.product_details}
              </div>
            </section>
          </div>

          <div className="space-y-8 text-left">
            {/* Market Side */}
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-blue-600 uppercase text-sm tracking-widest border-b pb-2">
                <TrendingUp size={18} /> Market & Competition
              </h3>
              <div className="space-y-5">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Market Size</p>
                  <p className="text-gray-700 text-sm mt-1">{plan.market_size}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Target Customers</p>
                  <p className="text-gray-700 text-sm mt-1">{plan.target_customers}</p>
                </div>
              </div>
            </section>

            {/* Business Model */}
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-green-600 uppercase text-sm tracking-widest border-b pb-2">
                <DollarSign size={18} /> Business Strategy
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">{plan.revenue_model}</p>
            </section>

            {/* Founder Background */}
            <section className="bg-gray-900 p-6 rounded-2xl shadow-xl text-white">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-blue-400 uppercase">
                <Users size={18} /> Founder Background
              </h3>
              <p className="text-gray-300 text-sm italic leading-relaxed">
                "{plan.entrepreneur_background}"
              </p>
            </section>
          </div>
        </div>

        {/* Action Footer */}
        <footer className="mt-12 bg-gray-50 border border-gray-200 p-10 rounded-3xl text-center shadow-inner">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Review this venture profile?</h2>
          <p className="text-gray-500 mb-8 max-w-xl mx-auto text-sm">
            This information is private and intended for potential partnership review only.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-10 py-4 bg-gray-900 text-white rounded-full font-bold text-lg hover:bg-black transition shadow-lg">
              Contact Founder
            </button>
            <button className="px-10 py-4 bg-white text-gray-700 border border-gray-200 rounded-full font-bold text-lg hover:bg-gray-50 transition">
              Provide Feedback
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}