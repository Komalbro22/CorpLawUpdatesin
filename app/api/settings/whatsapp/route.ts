import { supabase } from '@/lib/supabase'

export const revalidate = 3600

export async function GET() {
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'whatsapp_channel')
    .single()

  return Response.json({ 
    url: data?.value || '' 
  })
}
