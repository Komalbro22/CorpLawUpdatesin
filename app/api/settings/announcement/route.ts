import { supabase } from '@/lib/supabase'

export const revalidate = 0

export async function GET() {
    const { data } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['announcement_bar', 'announcement_bar_url'])

    const text = data?.find(d => d.key === 'announcement_bar')?.value || ''
    const url = data?.find(d => d.key === 'announcement_bar_url')?.value || ''

    return Response.json({ text, url })
}
