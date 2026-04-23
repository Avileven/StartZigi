// src\api\integrations.js 170326 UPDATE CREDIT
import { supabase } from '@/lib/supabase'


// ============================================
// InvokeLLM - AI Chat (שימוש ב-Google Gemini)
// ============================================
// [CREDITS] creditType קובע כמה קרדיטים יורדו:
//   'mentor'       = 1 קרדיט  (פידבק מנטור)
//   'studio_basic' = 5 קרדיטים (Studio BASIC)
//   'studio_boost' = 10 קרדיטים (Studio BOOST)
// אם בדיקת הקרדיטים נכשלת מסיבה טכנית - ה-AI עדיין עובד (fail-safe)
//
// [MODEL SELECTION]
//   mentor       → gemini-2.5-flash (fast, cheap)
//   studio_basic → gemini-2.5-pro   (higher quality)
//   studio_boost → gemini-2.5-pro   (higher quality)
export async function InvokeLLM({ prompt, creditType = 'sys' }) {
  try {


    // ============================================
    // [CREDITS] בדיקת קרדיטים לפני קריאה ל-AI
    // ============================================
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('credits_used, credits_limit, credits_reset_date, plan')
          .eq('id', user.id)
          .single();


        if (profile) {
          // [CREDITS] איפוס חודשי אוטומטי אם עבר חודש מה-reset_date
          const resetDate = new Date(profile.credits_reset_date);
          const now = new Date();
          const nextReset = new Date(resetDate.getFullYear(), resetDate.getMonth() + 1, resetDate.getDate());
          if (now > nextReset) {
            await supabase.from('user_profiles').update({
              credits_used: 0,
              credits_reset_date: now.toISOString()
            }).eq('id', user.id);
            profile.credits_used = 0;
          }


          // [CREDITS] עלות לפי סוג פעולה
          const costs = { mentor: 1, studio_basic: 5, studio_boost: 10,prompt_generator: 20, sys: 0 };
          const cost = costs[creditType] || 1;


          // [CREDITS] חסימה אם אין מספיק קרדיטים
          if (profile.credits_used + cost > profile.credits_limit) {
            throw new Error('NO_CREDITS');
          }


          // [CREDITS] הורדת קרדיטים אחרי אישור
          await supabase.from('user_profiles').update({
            credits_used: profile.credits_used + cost
          }).eq('id', user.id);
        }
      }
    } catch (creditError) {
      // [CREDITS] אם זו שגיאת NO_CREDITS - חוסמים
      if (creditError.message === 'NO_CREDITS') throw creditError;
      // [CREDITS] כל שגיאה טכנית אחרת - ממשיכים בכל זאת (fail-safe)
      console.warn('Credits check failed, continuing anyway:', creditError);
    }
    // ============================================
    // סוף בדיקת קרדיטים
    // ============================================


    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    // [MODEL SELECTION] Studio → Pro (quality), Mentor → Flash (speed/cost)
    const model = (creditType === 'studio_basic' || creditType === 'studio_boost')
      ? 'gemini-2.5-pro'
      : 'gemini-2.5-flash';

    console.log(`📡 Calling Gemini (${model})...`);
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      }),
    });

    console.log('✅ Gemini responded, status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
    }


    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI";


    return {
      response: aiText,
      usage: {},
    };
  } catch (error) {
    console.error('InvokeLLM error:', error);
    throw error;
  }
}


// ============================================
// UploadFile - העלאת קבצים ל-Supabase
// ============================================
export async function UploadFile({ file, bucket = 'uploads' }) {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${fileName}`


    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })


    if (error) throw error


    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)


    return {
      file_url: publicUrl,
      file_path: filePath,
      file_name: file.name,
    }
  } catch (error) {
    console.error('UploadFile error:', error)
    throw error
  }
}


// ============================================
// SendEmail - שליחת מייל דרך Resend
// ============================================
export async function SendEmail({ to, subject, html }) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to,
        subject,
        html,
      }),
    })


    if (!response.ok) {
      throw new Error(`Email API error: ${response.statusText}`)
    }


    const data = await response.json()
    return data
  } catch (error) {
    console.error('SendEmail error:', error)
    throw error
  }
}


// ============================================
// CreateFileSignedUrl - גישה לקבצים פרטיים
// ============================================
export async function CreateFileSignedUrl({ filePath, bucket = 'uploads', expiresIn = 3600 }) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn)


    if (error) throw error


    return {
      signed_url: data.signedUrl,
      expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
    }
  } catch (error) {
    console.error('CreateFileSignedUrl error:', error)
    throw error
  }
}


// פונקציות עזר נוספות
export async function GenerateImage() { return { image_url: '' }; }
export async function ExtractDataFromUploadedFile() { return { extracted_text: '' }; }
export async function UploadPrivateFile({ file, bucket = 'private' }) { return UploadFile({ file, bucket }); }


export const Core = {
  InvokeLLM,
  SendEmail,
  UploadFile,
  GenerateImage,
  ExtractDataFromUploadedFile,
  CreateFileSignedUrl,
  UploadPrivateFile,
}
