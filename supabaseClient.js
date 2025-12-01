import { createClient } from '@supabase/supabase-js'
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if(!url || !key){ console.warn('Supabase env not set: check .env.local based on .env.example') }
export const supabase = createClient(url || '', key || '')
export default supabase
