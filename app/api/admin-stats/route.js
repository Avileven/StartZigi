import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const { data: ventures } = await supabaseAdmin.from('ventures').select('*');
    const { data: profiles } = await supabaseAdmin.from('user_profiles').select('*');

    // זה המבנה המדויק שהדף שלך מחפש כדי לא לקרוס
    return NextResponse.json({
      success: true,
      stats: {
        venturesCount: ventures?.length || 0,
        usersCount: profiles?.length || 0,
        activeProjects: ventures?.filter(v => v.status === 'active').length || 0
      },
      allVentures: ventures || [],
      allUsers: profiles || []
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}