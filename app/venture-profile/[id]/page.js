// --- לוגיקת השרת המתוקנת ---
  async function handleAccept(formData) {
    'use server';
    const ventureId = formData.get('ventureId');
    const inviteToken = formData.get('token');

    // 1. עדכון סטטוס ההזמנה (לפי השם invitation_token שמופיע בפוליסות שלך)
    const { error: inviteUpdateErr } = await supabaseAdmin
      .from('co_founder_invitations')
      .update({ status: 'accepted' })
      .eq('invitation_token', inviteToken);

    if (inviteUpdateErr) throw inviteUpdateErr;

    // 2. עדכון מונה המייסדים בטבלת ventures
    const { data: v } = await supabaseAdmin
      .from('ventures')
      .select('founders_count')
      .eq('id', ventureId)
      .single();

    await supabaseAdmin
      .from('ventures')
      .update({ founders_count: (v?.founders_count || 1) + 1 })
      .eq('id', ventureId);

    revalidatePath(`/venture-profile/${ventureId}`);
    redirect(`/venture-profile/${ventureId}?token=${inviteToken}&accepted=true`);
  }