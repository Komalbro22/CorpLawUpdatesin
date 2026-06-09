import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE2_URL
const key = process.env.SUPABASE2_SERVICE_ROLE_KEY

if (!url || !key) {
  console.warn('Supabase2 server env vars not set')
}

export const supabaseDocumentsAdmin = url && key
  ? createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    })
  : null
