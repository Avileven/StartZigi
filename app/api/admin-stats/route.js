import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const { data: ventures, error: vError } = await supabaseAdmin.from('ventures').select('*');
    const { data: profiles, error: pError } = await supabaseAdmin.from('user_profiles').select('*');

    if (vError || pError) throw new Error(vError?.message || pError?.message);

    return NextResponse.json({
      success: true,
      allVentures: ventures || [],
      allUsers: profiles || []
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}