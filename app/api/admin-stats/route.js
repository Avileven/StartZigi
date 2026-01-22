import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Fetch all data in parallel for efficiency
    const [
      { data: ventures },
      { data: profiles },
      { data: investors },
      { data: vcFirms },
      { data: funding }
    ] = await Promise.all([
      supabaseAdmin.from('ventures').select('*'),
      supabaseAdmin.from('user_profiles').select('*'),
      supabaseAdmin.from('investors').select('*'),
      supabaseAdmin.from('vc_firms').select('*'),
      supabaseAdmin.from('funding_events').select('*')
    ]);

    // Calculate aggregated stats
    const totalInvestment = funding?.reduce((sum, e) => sum + (Number(e.amount) || 0), 0) || 0;

    return NextResponse.json({
      success: true,
      stats: {
        venturesCount: ventures?.length || 0,
        usersCount: profiles?.length || 0,
        investorsCount: investors?.length || 0,
        vcCount: vcFirms?.length || 0,
        totalInvestment
      },
      data: {
        ventures: ventures || [],
        users: profiles || [],
        investors: investors || [],
        vcFirms: vcFirms || [],
        funding: funding || []
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}