import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // שליפת כל המיזמים עם העמודות הספציפיות שראינו ב-SQL
    const { data: ventures, error: vError } = await supabaseAdmin
      .from('ventures')
      .select('id, name, created_by, phase, total_score, created_date');

    // שליפת המשתמשים
    const { data: users, error: uError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, username, accepted_tos_date');

    if (vError || uError) throw new Error(vError?.message || uError?.message);

    return res.status(200).json({
      success: true,
      stats: {
        venturesCount: ventures?.length || 0,
        usersCount: users?.length || 0
      },
      allVentures: ventures,
      allUsers: users
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}