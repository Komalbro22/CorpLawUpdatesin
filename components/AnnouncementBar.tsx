import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export const revalidate = 0

export default async function AnnouncementBar() {
  const { data } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['announcement_bar', 'announcement_bar_url'])

  const text = data?.find(d => d.key === 'announcement_bar')?.value || ''
  const url = data?.find(d => d.key === 'announcement_bar_url')?.value || ''

  if (!text.trim()) return null

  return (
    <div className="bg-amber-400 text-navy text-sm font-medium text-center py-2 px-4 print:hidden">
      {url ? (
        <Link
          href={url}
          target={url.startsWith('http') ? '_blank' : '_self'}
          rel="noopener noreferrer"
          className="hover:underline"
        >
          📢 {text} →
        </Link>
      ) : (
        <span>📢 {text}</span>
      )}
    </div>
  )
}
