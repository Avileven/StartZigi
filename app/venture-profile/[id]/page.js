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

// Admin client to bypass RLS on server-side only
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function VentureProfilePoC({ params }) {
  const { id } = params;

  // Fetch data from business_plans table
  const { data: plan, error } = await supabaseAdmin
    .from('business_plans')
    .select('*')
    .eq('venture_id', id)
    .single();

  if (error || !plan) {
    console.error('PoC Data Fetch Error:', error);
    return notFound();
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 font-sans" dir="ltr">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-6 mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Venture Profile</h1>
              <p className="text-gray-500 text-lg">Strategic overview for potential partners</p>
            </div>
            <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold">
              Status: Active Proposal
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-4 bg-white rounded-xl border border-gray-100">
              <p className="text-sm text-blue-600 font-bold mb-1">Completion</p>
              <p className="text-2xl font-black text-gray-900">{plan.completion_percentage}%</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-gray-100">
              <p className="text-sm text-green-600 font-bold mb-1">Last Updated</p>
              <p className="text-lg font-bold text-gray-900">
                {new Date(plan.updated_date).toLocaleDateString('en-US')}
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-gray-100">
              <p className="text-sm text-purple-600 font-bold mb-1">Venture ID</p>
              <p className="text-xs font-mono text-gray-500 truncate">{id}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Mission Section */}
            <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-blue-600">
                <Target size={28} />
                <h2 className="text-2xl font-bold text-gray-900">Mission</h2>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg italic">"{plan.mission}"</p>
            </section>

            {/* Problem & Solution Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm border-t-4 border-t-red-500">
                <div className="flex items-center gap-2 mb-3 text-red-500">
                  <AlertCircle size={24} />
                  <h3 className="text-xl font-bold text-gray-900">Problem</h3>
                </div>
                <p className="text-gray-600 leading-relaxed text-sm">{plan.problem}</p>
              </section>

              <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm border-t-4 border-t-green-500">
                <div className="flex items-center gap-2 mb-3 text-green-500">
                  <Lightbulb size={24} />
                  <h3 className="text-xl font-bold text-gray-900">Solution</h3>
                </div>
                <p className="text-gray-600 leading-relaxed text-sm">{plan.solution}</p>
              </section>
            </div>

            {/* Product Details Section */}
            <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-orange-500">
                <Award size={28} />
                <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
              </div>
              <div className="text-gray-700 whitespace-pre-wrap bg-orange-50/20 p-6 rounded-lg border border-orange-100 text-sm leading-relaxed">
                {plan.product_details}
              </div>
            </section>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            
            {/* Market Analysis */}
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 text-blue-600">
                <TrendingUp size={20} /> Market Analysis
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Market Size</p>
                  <p className="text-gray-700 mt-1 text-sm">{plan.market_size}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Target Customers</p>
                  <p className="text-gray-700 mt-1 text-sm">{plan.target_customers}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Competition</p>
                  <p className="text-gray-700 mt-1 text-sm">{plan.competition}</p>
                </div>
              </div>
            </section>

            {/* Revenue & Funding */}
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 text-green-600">
                <DollarSign size={20} /> Business Model
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Revenue Model</p>
                  <p className="text-gray-700 mt-1 text-sm">{plan.revenue_model}</p>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Funding Requirements</p>
                  <p className="text-gray-700 mt-1 text-sm font-semibold">{plan.funding_requirements}</p>
                </div>
              </div>
            </section>

            {/* Entrepreneur Background */}
            <section className="bg-gray-900 p-6 rounded-2xl shadow-xl text-white">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-blue-400">
                <Users size={20} /> About the Founder
              </h3>
              <p className="text-gray-300 text-sm italic leading-relaxed">
                "{plan.entrepreneur_background}"
              </p>
            </section>
          </div>
        </div>

        {/* Footer Action Bar */}
        <footer className="mt-12 bg-blue-50 border border-blue-100 p-10 rounded-3xl text-center">
          <h2 className="text-2xl font-black text-gray-900 mb-2">Interested in joining this journey?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            This profile was generated for a potential co-founder invitation. Review the details above and take the next step.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-10 py-4 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200">
              Apply to Join
            </button>
            <button className="px-10 py-4 bg-white text-gray-700 border border-gray-300 rounded-full font-bold text-lg hover:bg-gray-50 transition">
              Provide Feedback
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}