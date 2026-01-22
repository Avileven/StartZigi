import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  try {
    const [ventures, profiles, investors, vcFirms, funding] = await Promise.all([
      supabaseAdmin.from('ventures').select('*'),
      supabaseAdmin.from('user_profiles').select('*'),
      supabaseAdmin.from('investors').select('*'),
      supabaseAdmin.from('vc_firms').select('*'),
      supabaseAdmin.from('funding_events').select('*')
    ]);

    const totalInvestment = funding.data?.reduce((sum, e) => sum + (Number(e.amount) || 0), 0) || 0;

    return NextResponse.json({
      success: true,
      stats: {
        venturesCount: ventures.data?.length || 0,
        usersCount: profiles.data?.length || 0,
        investorsCount: investors.data?.length || 0,
        vcCount: vcFirms.data?.length || 0,
        totalInvestment
      },
      data: {
        ventures: ventures.data || [],
        users: profiles.data || [],
        investors: investors.data || [],
        vcFirms: vcFirms.data || [],
        funding: funding.data || []
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const now = new Date().toISOString();

    const payload = {
      id: crypto.randomUUID(),
      name: body.name,
      investor_type: body.investor_type,
      created_by: 'Admin_Manual',
      created_date: now,
      updated_date: now,
      focus_sectors: body.focus_sectors || [],
      typical_check_min: body.typical_check_min ? Number(body.typical_check_min) : null,
      typical_check_max: body.typical_check_max ? Number(body.typical_check_max) : null,
      preferred_valuation_min: body.preferred_valuation_min ? Number(body.preferred_valuation_min) : null,
      preferred_valuation_max: body.preferred_valuation_max ? Number(body.preferred_valuation_max) : null,
      background: body.background || null,
      avatar_url: body.avatar_url || null,
      is_sample: false,
      assigned_question_ids: []
    };

    const { data, error } = await supabaseAdmin.from('investors').insert([payload]).select();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}