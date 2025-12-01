// ============================================
// FILE: api/integrations.js (Replace entire file)
// ============================================

import { supabase } from '@/lib/supabase'

// ============================================
// InvokeLLM - AI Chat (using OpenAI)
// ============================================
export async function InvokeLLM({ prompt, model = 'gpt-4' }) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      response: data.choices[0].message.content,
      usage: data.usage,
    }
  } catch (error) {
    console.error('InvokeLLM error:', error)
    throw error
  }
}

// ============================================
// UploadFile - File Upload (using Supabase Storage)
// ============================================
export async function UploadFile({ file, bucket = 'uploads' }) {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${fileName}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) throw error

    // Get public URL
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
// SendEmail - Email sending (using Resend)
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
// GenerateImage - AI Image Generation (using DALL-E)
// ============================================
export async function GenerateImage({ prompt, size = '1024x1024' }) {
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        n: 1,
        size,
      }),
    })

    if (!response.ok) {
      throw new Error(`Image API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      image_url: data.data[0].url,
    }
  } catch (error) {
    console.error('GenerateImage error:', error)
    throw error
  }
}

// ============================================
// ExtractDataFromUploadedFile - OCR/Document parsing
// ============================================
export async function ExtractDataFromUploadedFile({ fileUrl }) {
  // This would require a service like:
  // - AWS Textract
  // - Google Document AI
  // - Azure Form Recognizer
  // For now, return placeholder
  console.warn('ExtractDataFromUploadedFile not implemented yet')
  return { extracted_text: '' }
}

// ============================================
// CreateFileSignedUrl - Private file access
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

// ============================================
// UploadPrivateFile - Upload to private bucket
// ============================================
export async function UploadPrivateFile({ file, bucket = 'private' }) {
  return UploadFile({ file, bucket })
}

// Legacy exports for backward compatibility
export const Core = {
  InvokeLLM,
  SendEmail,
  UploadFile,
  GenerateImage,
  ExtractDataFromUploadedFile,
  CreateFileSignedUrl,
  UploadPrivateFile,
}


// ============================================
// SETUP INSTRUCTIONS
// ============================================

/*
1. Add to .env.local:

NEXT_PUBLIC_OPENAI_API_KEY=sk-your-openai-key
RESEND_API_KEY=re_your-resend-key (optional, for SendEmail)
EMAIL_FROM=noreply@yourdomain.com (optional)


2. Create Supabase Storage bucket:
   - Go to Supabase Dashboard → Storage
   - Create new bucket: "uploads"
   - Set it to PUBLIC (or PRIVATE if you prefer signed URLs)


3. If bucket is PRIVATE, use signed URLs:
   const { signed_url } = await CreateFileSignedUrl({ filePath: result.file_path })


4. Get OpenAI API Key:
   - Go to: https://platform.openai.com/api-keys
   - Create new key
   - Add to .env.local


5. (Optional) For SendEmail, get Resend key:
   - Go to: https://resend.com
   - Free tier: 100 emails/day
*/