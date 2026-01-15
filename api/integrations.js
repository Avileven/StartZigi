// 140126
import { supabase } from '@/lib/supabase'

// ============================================
// InvokeLLM - AI Chat (שימוש ב-Google Gemini במקום OpenAI)
// ============================================
export async function InvokeLLM({ prompt }) {
  try {
    // שליחת בקשה ישירות לגוגל ג'מיני עם המפתח שהגדרת בורסל
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    console.log("API Key exists:", !!apiKey);
console.log("API Key length:", apiKey?.length);
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    // שליפת התשובה מהמבנה הספציפי של גוגל
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