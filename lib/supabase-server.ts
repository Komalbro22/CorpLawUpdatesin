import { getSupabaseAdminClient } from '@/lib/supabase-factory'

// NEVER import this in client components
export const supabaseAdmin = getSupabaseAdminClient()
