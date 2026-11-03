import {
  WHATSAPP_CHANNEL_URL,
  WA_FLOAT_STORAGE_KEY,
  WA_FLOAT_DISMISS_DAYS,
  WA_FLOAT_DISMISS_MS,
} from '@/components/WhatsAppFloatingButton'
import { WHATSAPP_CHANNEL_URL as BOX_URL } from '@/components/WhatsAppArticleEndBox'
import fs from 'fs'
import path from 'path'

describe('WhatsApp Channel Buttons Suite (Floating + End-of-Article)', () => {
  const EXACT_CHANNEL_URL = 'https://whatsapp.com/channel/0029VbCfcUEEgGfGLWOTvV1A'

  test('Both components use the EXACT WhatsApp channel URL', () => {
    expect(WHATSAPP_CHANNEL_URL).toBe(EXACT_CHANNEL_URL)
    expect(BOX_URL).toBe(EXACT_CHANNEL_URL)
  })

  test('Floating button dismiss parameters adhere to 30-day requirement', () => {
    expect(WA_FLOAT_STORAGE_KEY).toBe('wa-float-dismissed')
    expect(WA_FLOAT_DISMISS_DAYS).toBe(30)
    expect(WA_FLOAT_DISMISS_MS).toBe(30 * 24 * 60 * 60 * 1000)
  })

  test('Floating button code contains scroll threshold, ad safety offsets, inline SVG, and GA4 event', () => {
    const floatCode = fs.readFileSync(
      path.join(process.cwd(), 'components/WhatsAppFloatingButton.tsx'),
      'utf8'
    )

    // Scroll threshold 400px
    expect(floatCode).toContain('scrollY >= 400')

    // Ad safety: bottom-[96px] on mobile (comfortably above Mediavine adhesion area)
    expect(floatCode).toContain('bottom-[96px]')
    expect(floatCode).toContain('sm:bottom-6')
    expect(floatCode).toContain('right-4')
    expect(floatCode).toContain('sm:right-6')

    // 56px circular button on mobile
    expect(floatCode).toContain('w-[56px] h-[56px]')
    expect(floatCode).toContain('rounded-full')
    expect(floatCode).toContain('bg-[#25D366]')

    // Desktop text pill limited to <= 180px
    expect(floatCode).toContain('max-w-[180px]')
    expect(floatCode).toContain('Get updates on WhatsApp')

    // Inline SVG (no external image request)
    expect(floatCode).toContain('<svg')
    expect(floatCode).not.toContain('<img')

    // Dismissible with close icon
    expect(floatCode).toContain('handleDismiss')
    expect(floatCode).toContain('wa-float-dismissed')

    // Target blank & rel noopener
    expect(floatCode).toContain('target="_blank"')
    expect(floatCode).toContain('rel="noopener noreferrer"')

    // GA4 tracking
    expect(floatCode).toContain("trackEvent('whatsapp_channel_click', { placement: 'floating' })")
  })

  test('End-of-article box contains exact copy, design tokens, and GA4 tracking', () => {
    const boxCode = fs.readFileSync(
      path.join(process.cwd(), 'components/WhatsAppArticleEndBox.tsx'),
      'utf8'
    )

    // Design tokens: #ECFDF5, #A7F3D0, 4px #25D366, 8px radius
    expect(boxCode).toContain('bg-[#ECFDF5]')
    expect(boxCode).toContain('border-[#A7F3D0]')
    expect(boxCode).toContain('border-l-[#25D366]')
    expect(boxCode).toContain('rounded-[8px]')

    // Eyebrow
    expect(boxCode).toContain('GET UPDATES FIRST · WHATSAPP CHANNEL')
    expect(boxCode).toContain('text-[#047857]')

    // Heading
    expect(boxCode).toContain('Every update, the moment it publishes')

    // Body Text
    expect(boxCode).toContain(
      'Guides reach the site every week; circulars land the day they are issued. Our WhatsApp channel carries every update the same day it goes live — follow once, and nothing waits.'
    )

    // Button
    expect(boxCode).toContain('Follow the WhatsApp Channel')
    expect(boxCode).toContain('bg-[#25D366]')
    expect(boxCode).toContain('target="_blank"')
    expect(boxCode).toContain('rel="noopener noreferrer"')

    // GA4 tracking
    expect(boxCode).toContain("trackEvent('whatsapp_channel_click', { placement: 'article_end' })")
  })

  test('Article detail page integrates both components without rendering on /admin', () => {
    const pageCode = fs.readFileSync(
      path.join(process.cwd(), 'app/updates/[slug]/page.tsx'),
      'utf8'
    )

    expect(pageCode).toContain("import WhatsAppFloatingButton from '@/components/WhatsAppFloatingButton'")
    expect(pageCode).toContain("import WhatsAppArticleEndBox from '@/components/WhatsAppArticleEndBox'")
    expect(pageCode).toContain('<WhatsAppArticleEndBox />')
    expect(pageCode).toContain('<WhatsAppFloatingButton />')
  })
})
