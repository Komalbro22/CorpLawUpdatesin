import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE2_URL
const key = process.env.NEXT_PUBLIC_SUPABASE2_ANON_KEY

if (!url || !key) {
  console.warn('Supabase2 client env vars not set')
}

export const supabaseDocuments = url && key 
  ? createClient(url, key)
  : null
