import { createClient } from '@supabase/supabase-js'

// NEVER import this in client components
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase admin environment variables (NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY)');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
