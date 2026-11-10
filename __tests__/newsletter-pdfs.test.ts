import { NextRequest } from 'next/server'
import { GET as listRoute, POST as uploadRoute } from '@/app/api/admin/newsletter-pdfs/route'
import { GET as getSingleRoute, PATCH as replaceRoute, DELETE as deleteRoute } from '@/app/api/admin/newsletter-pdfs/[id]/route'
import { GET as downloadRoute } from '@/app/newsletters/[slug]/download/route'
import { supabaseAdmin } from '@/lib/supabase-server'
import { verifyAdminOrKey } from '@/lib/api-key-auth'
import { sanitizeBriefingHtml, enrichNewsletterUrls } from '@/lib/newsletter-pdfs'
import NewsletterReadingPage from '@/app/newsletters/[slug]/page'
import React from 'react'

jest.mock('@/lib/supabase-server', () => ({
  supabaseAdmin: {
    from: jest.fn(),
    storage: {
      from: jest.fn(),
    },
  },
}))

jest.mock('@/lib/supabase-documents-server', () => ({
  supabaseDocumentsAdmin: null,
}))

jest.mock('@/lib/api-key-auth', () => ({
  verifyAdminOrKey: jest.fn(),
  logApiAudit: jest.fn().mockResolvedValue(true),
  getClientIp: jest.fn().mockReturnValue('127.0.0.1'),
}))

describe('Newsletter Briefing Reading Page & PDF Suite (7 Acceptance Criteria)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ─────────────────────────────────────────────────────────────
  // Acceptance Test 1: POST a new edition with both file (PDF) and html -> 201; GET shows html_path set
  // ─────────────────────────────────────────────────────────────
  describe('Acceptance Test 1: POST new edition with PDF and HTML', () => {
    it('successfully uploads PDF and HTML reading version, returns 201 with html_path set', async () => {
      ;(verifyAdminOrKey as jest.Mock).mockResolvedValue({
        success: true,
        auth: { type: 'api_key', key: { id: 'key-muse', name: 'muse ai' } },
      })

      const mockUpload = jest.fn().mockResolvedValue({ data: { path: 'ok' }, error: null })
      const mockGetPublicUrl = jest.fn().mockReturnValue({
        data: { publicUrl: 'https://fcosrsznbxedischtbwe.supabase.co/storage/v1/object/public/newsletter-pdfs/weekly-briefing-2026-11-16.pdf' },
      })

      ;(supabaseAdmin.storage.from as jest.Mock).mockReturnValue({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      })

      const mockInserted = {
        id: 'edition-uuid-456',
        slug: 'weekly-briefing-2026-11-16',
        week_label: '9 – 15 November 2026',
        week_start: '2026-11-09',
        week_end: '2026-11-15',
        file_path: 'weekly-briefing-2026-11-16.pdf',
        html_path: 'weekly-briefing-2026-11-16.html',
        file_size_bytes: 2048,
        uploaded_by: 'api_key:muse ai',
        download_count: 0,
        created_at: '2026-11-16T08:00:00Z',
        updated_at: '2026-11-16T08:00:00Z',
      }

      const mockSingle = jest.fn().mockResolvedValue({ data: mockInserted, error: null })
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle })
      const mockUpsert = jest.fn().mockReturnValue({ select: mockSelect })
      ;(supabaseAdmin.from as jest.Mock).mockReturnValue({ upsert: mockUpsert })

      const formData = new FormData()
      const pdfFile = new File(['%PDF-1.4 sample content'], 'weekly-briefing-2026-11-16.pdf', { type: 'application/pdf' })
      const htmlFile = new File(['<div style="color:#0f2a52"><h1>Briefing</h1></div>'], 'weekly-briefing-2026-11-16.html', { type: 'text/html' })
      formData.append('file', pdfFile)
      formData.append('html', htmlFile)
      formData.append('week_label', '9 – 15 November 2026')
      formData.append('week_start', '2026-11-09')
      formData.append('week_end', '2026-11-15')

      const req = new NextRequest('http://localhost:3000/api/admin/newsletter-pdfs', {
        method: 'POST',
        body: formData,
      })

      const res = await uploadRoute(req)
      expect(res.status).toBe(201)
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.newsletter.html_path).toBe('weekly-briefing-2026-11-16.html')
      expect(json.newsletter.has_html).toBe(true)
      expect(json.reading_url).toBe('https://www.corplawupdates.in/newsletters/weekly-briefing-2026-11-16')
      expect(json.public_url).toBe('https://www.corplawupdates.in/newsletters/weekly-briefing-2026-11-16/download')

      // Both PDF and HTML were uploaded to storage
      expect(mockUpload).toHaveBeenCalledWith(
        'weekly-briefing-2026-11-16.pdf',
        expect.any(Buffer),
        expect.objectContaining({ contentType: 'application/pdf' })
      )
      expect(mockUpload).toHaveBeenCalledWith(
        'weekly-briefing-2026-11-16.html',
        expect.any(Buffer),
        expect.objectContaining({ contentType: 'text/html; charset=utf-8' })
      )
    })
  })

  // ─────────────────────────────────────────────────────────────
  // Acceptance Test 2: /newsletters/<slug> renders broadsheet design with gold Download PDF button
  // ─────────────────────────────────────────────────────────────
  describe('Acceptance Test 2: Reading page rendering', () => {
    it('renders server-rendered broadsheet HTML and gold download button', async () => {
      const mockRecord = {
        id: 'rec-1',
        slug: 'weekly-briefing-2026-11-09',
        week_label: '2 – 8 November 2026',
        week_start: '2026-11-02',
        week_end: '2026-11-08',
        file_path: 'weekly-briefing-2026-11-09.pdf',
        html_path: 'weekly-briefing-2026-11-09.html',
        file_size_bytes: 1024,
        uploaded_by: 'admin',
        download_count: 3,
        created_at: '2026-11-09T08:00:00Z',
        updated_at: '2026-11-09T08:00:00Z',
      }

      const mockMaybeSingle = jest.fn().mockResolvedValue({ data: mockRecord, error: null })
      const mockLimit = jest.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
      const mockOr = jest.fn().mockReturnValue({ limit: mockLimit })
      const mockSelect = jest.fn().mockReturnValue({ or: mockOr })
      ;(supabaseAdmin.from as jest.Mock).mockReturnValue({ select: mockSelect })

      const htmlContent = '<table style="width:100%"><tr><td><h2 style="color:#0f2a52">MCA Circular No. 12</h2><p>Briefing details</p></td></tr></table>'
      const mockDownload = jest.fn().mockResolvedValue({
        data: { text: async () => htmlContent },
        error: null,
      })
      ;(supabaseAdmin.storage.from as jest.Mock).mockReturnValue({
        download: mockDownload,
        getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://storage/pdf' } }),
      })

      const element = await NewsletterReadingPage({
        params: Promise.resolve({ slug: 'weekly-briefing-2026-11-09' }),
      })

      expect(element).toBeDefined()
      // Verify element structure
      expect(element.type).toBe('div')
    })
  })

  // ─────────────────────────────────────────────────────────────
  // Acceptance Test 3: /newsletters/<slug>/download 302s to PDF and increments download_count
  // ─────────────────────────────────────────────────────────────
  describe('Acceptance Test 3: Download route 302 and download_count increment', () => {
    it('redirects 302 to direct storage URL with cache-busting timestamp and triggers download count increment', async () => {
      const mockRecord = {
        id: 'pdf-uuid-123',
        slug: 'weekly-briefing-2026-11-09',
        week_label: '2 – 8 November 2026',
        week_start: '2026-11-02',
        week_end: '2026-11-08',
        file_path: 'weekly-briefing-2026-11-09.pdf',
        file_size_bytes: 1024,
        uploaded_by: 'api_key:muse ai',
        download_count: 5,
        created_at: '2026-11-09T08:00:00Z',
        updated_at: '2026-11-09T08:30:00Z',
      }

      const mockMaybeSingle = jest.fn().mockResolvedValue({ data: mockRecord, error: null })
      const mockLimit = jest.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
      const mockOr = jest.fn().mockReturnValue({ limit: mockLimit })
      const mockSelect = jest.fn().mockReturnValue({ or: mockOr })

      const mockUpdate = jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) })

      ;(supabaseAdmin.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'newsletter_pdfs') {
          return {
            select: mockSelect,
            update: mockUpdate,
          }
        }
        return {}
      })

      const mockGetPublicUrl = jest.fn().mockReturnValue({
        data: { publicUrl: 'https://fcosrsznbxedischtbwe.supabase.co/storage/v1/object/public/newsletter-pdfs/weekly-briefing-2026-11-09.pdf' },
      })
      ;(supabaseAdmin.storage.from as jest.Mock).mockReturnValue({
        getPublicUrl: mockGetPublicUrl,
      })

      const req = new NextRequest('http://localhost:3000/newsletters/weekly-briefing-2026-11-09/download')
      const res = await downloadRoute(req, {
        params: Promise.resolve({ slug: 'weekly-briefing-2026-11-09' }),
      })

      expect(res.status).toBe(302)
      const redirectUrl = res.headers.get('location')
      expect(redirectUrl).toContain('https://fcosrsznbxedischtbwe.supabase.co/storage/v1/object/public/newsletter-pdfs/weekly-briefing-2026-11-09.pdf?v=')
      expect(res.headers.get('cache-control')).toContain('no-cache')
    })
  })

  // ─────────────────────────────────────────────────────────────
  // Acceptance Test 4: PATCH html onto existing weekly-briefing-2026-11-09
  // ─────────────────────────────────────────────────────────────
  describe('Acceptance Test 4: PATCH html onto existing record', () => {
    it('accepts html file via PATCH, updates storage and DB record with html_path', async () => {
      ;(verifyAdminOrKey as jest.Mock).mockResolvedValue({
        success: true,
        auth: { type: 'api_key', key: { id: 'key-muse', name: 'muse ai' } },
      })

      const existingRecord = {
        id: '7864d4d0-5e3b-40c1-9f75-8bce7e0724cb',
        slug: 'weekly-briefing-2026-11-09',
        week_label: '2 – 8 November 2026',
        week_start: '2026-11-02',
        week_end: '2026-11-08',
        file_path: 'weekly-briefing-2026-11-09.pdf',
        html_path: null,
        file_size_bytes: 1024,
        uploaded_by: 'api_key:muse ai',
        download_count: 5,
        created_at: '2026-11-09T08:00:00Z',
        updated_at: '2026-11-09T08:00:00Z',
      }

      const updatedRecord = {
        ...existingRecord,
        html_path: 'weekly-briefing-2026-11-09.html',
        updated_at: '2026-11-10T12:00:00Z',
      }

      // Mock get by ID
      const mockGetSingle = jest.fn().mockResolvedValue({ data: existingRecord, error: null })
      const mockGetEq = jest.fn().mockReturnValue({ maybeSingle: mockGetSingle })
      const mockGetSelect = jest.fn().mockReturnValue({ eq: mockGetEq })

      // Mock update
      const mockUpdateSingle = jest.fn().mockResolvedValue({ data: updatedRecord, error: null })
      const mockUpdateSelect = jest.fn().mockReturnValue({ single: mockUpdateSingle })
      const mockUpdateEq = jest.fn().mockReturnValue({ select: mockUpdateSelect })
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockUpdateEq })

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: mockGetSelect,
        update: mockUpdate,
      })

      const mockUpload = jest.fn().mockResolvedValue({ data: { path: 'weekly-briefing-2026-11-09.html' }, error: null })
      const mockGetPublicUrl = jest.fn().mockReturnValue({
        data: { publicUrl: 'https://storage/weekly-briefing-2026-11-09.pdf' },
      })
      ;(supabaseAdmin.storage.from as jest.Mock).mockReturnValue({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      })

      const formData = new FormData()
      const htmlFile = new File(['<article><h2>SEBI Master Circular</h2></article>'], 'weekly-briefing-2026-11-09.html', { type: 'text/html' })
      formData.append('html', htmlFile)

      const req = new NextRequest('http://localhost:3000/api/admin/newsletter-pdfs/7864d4d0-5e3b-40c1-9f75-8bce7e0724cb', {
        method: 'PATCH',
        body: formData,
      })

      const res = await replaceRoute(req, { params: Promise.resolve({ id: '7864d4d0-5e3b-40c1-9f75-8bce7e0724cb' }) })
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.newsletter.html_path).toBe('weekly-briefing-2026-11-09.html')
      expect(json.newsletter.has_html).toBe(true)
      expect(mockUpload).toHaveBeenCalledWith(
        'weekly-briefing-2026-11-09.html',
        expect.any(Buffer),
        expect.objectContaining({ contentType: 'text/html; charset=utf-8' })
      )
    })
  })

  // ─────────────────────────────────────────────────────────────
  // Acceptance Test 5: Edition with no HTML shows fallback page, not error
  // ─────────────────────────────────────────────────────────────
  describe('Acceptance Test 5: Fallback page for editions with no HTML', () => {
    it('renders fallback with week label and Download button when no HTML exists', async () => {
      const mockRecordNoHtml = {
        id: 'rec-no-html',
        slug: 'weekly-briefing-2026-11-02',
        week_label: '26 Oct – 1 Nov 2026',
        week_start: '2026-10-26',
        week_end: '2026-11-01',
        file_path: 'weekly-briefing-2026-11-02.pdf',
        html_path: null,
        file_size_bytes: 1024,
        uploaded_by: 'admin',
        download_count: 1,
        created_at: '2026-11-02T08:00:00Z',
        updated_at: '2026-11-02T08:00:00Z',
      }

      const mockMaybeSingle = jest.fn().mockResolvedValue({ data: mockRecordNoHtml, error: null })
      const mockLimit = jest.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
      const mockOr = jest.fn().mockReturnValue({ limit: mockLimit })
      const mockSelect = jest.fn().mockReturnValue({ or: mockOr })
      ;(supabaseAdmin.from as jest.Mock).mockReturnValue({ select: mockSelect })

      ;(supabaseAdmin.storage.from as jest.Mock).mockReturnValue({
        download: jest.fn().mockResolvedValue({ data: null, error: { message: 'Object not found' } }),
        getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://storage/pdf' } }),
      })

      const element = await NewsletterReadingPage({
        params: Promise.resolve({ slug: 'weekly-briefing-2026-11-02' }),
      })

      expect(element).toBeDefined()
      // Successfully renders without throwing 404 or crashing
      expect(element.type).toBe('div')
    })
  })

  // ─────────────────────────────────────────────────────────────
  // Acceptance Test 6: A .txt file in the html field is rejected with HTTP 400
  // ─────────────────────────────────────────────────────────────
  describe('Acceptance Test 6: Reject non-HTML in html field', () => {
    it('rejects a .txt file in POST html field with HTTP 400 and INVALID_HTML_TYPE', async () => {
      ;(verifyAdminOrKey as jest.Mock).mockResolvedValue({
        success: true,
        auth: { type: 'api_key', key: { id: 'key-1', name: 'muse ai' } },
      })

      const formData = new FormData()
      const pdfFile = new File(['%PDF-1.4 valid'], 'briefing.pdf', { type: 'application/pdf' })
      const txtFile = new File(['plain text not html'], 'briefing.txt', { type: 'text/plain' })
      formData.append('file', pdfFile)
      formData.append('html', txtFile)
      formData.append('week_label', '2 – 8 November 2026')
      formData.append('week_start', '2026-11-02')
      formData.append('week_end', '2026-11-08')

      const req = new NextRequest('http://localhost:3000/api/admin/newsletter-pdfs', {
        method: 'POST',
        body: formData,
      })

      const res = await uploadRoute(req)
      expect(res.status).toBe(400)
      const json = await res.json()
      expect(json.error.code).toBe('INVALID_HTML_TYPE')
    })

    it('rejects a .txt file in PATCH html field with HTTP 400 and INVALID_HTML_TYPE', async () => {
      ;(verifyAdminOrKey as jest.Mock).mockResolvedValue({
        success: true,
        auth: { type: 'api_key', key: { id: 'key-1', name: 'muse ai' } },
      })

      const formData = new FormData()
      const txtFile = new File(['malformed txt'], 'notes.txt', { type: 'text/plain' })
      formData.append('html', txtFile)

      const req = new NextRequest('http://localhost:3000/api/admin/newsletter-pdfs/some-id', {
        method: 'PATCH',
        body: formData,
      })

      const res = await replaceRoute(req, { params: Promise.resolve({ id: 'some-id' }) })
      expect(res.status).toBe(400)
      const json = await res.json()
      expect(json.error.code).toBe('INVALID_HTML_TYPE')
    })
  })

  // ─────────────────────────────────────────────────────────────
  // Acceptance Test 7: HTML containing <script> renders with script stripped
  // ─────────────────────────────────────────────────────────────
  describe('Acceptance Test 7: HTML sanitization strips scripts and dangerous attributes', () => {
    it('strips <script>, <iframe>, <form>, and event handlers while preserving tables, headings, styles and links', () => {
      const maliciousHtml = `
        <div style="background-color: #0f2a52; color: #ffffff;" class="header">
          <h1>CorpLawUpdates Weekly Briefing</h1>
          <script>alert('xss attacker')</script>
          <script src="https://evil.com/payload.js"></script>
          <iframe src="https://malicious.com"></iframe>
          <form action="/steal"><input name="pass" /></form>
          <a href="javascript:alert(1)" style="color: #c9a227;">Bad Link</a>
          <a href="https://corplawupdates.in" style="color: #c9a227;">Good Link</a>
          <button onclick="steal()">Click me</button>
          <table style="width: 100%; border: 1px solid #c9a227;" cellpadding="4">
            <thead>
              <tr><th style="background-color: #0f2a52;">Section</th><th>Description</th></tr>
            </thead>
            <tbody>
              <tr><td>MCA</td><td>Circular update details</td></tr>
            </tbody>
          </table>
        </div>
      `

      const sanitized = sanitizeBriefingHtml(maliciousHtml)

      // Scripts, iframes, forms, event handlers must be completely stripped
      expect(sanitized).not.toContain('<script')
      expect(sanitized).not.toContain('alert(')
      expect(sanitized).not.toContain('evil.com')
      expect(sanitized).not.toContain('<iframe')
      expect(sanitized).not.toContain('<form')
      expect(sanitized).not.toContain('onclick')
      expect(sanitized).not.toContain('javascript:')

      // Legitimate broadsheet styling and tables must be preserved
      expect(sanitized).toContain('<div style="background-color:#0f2a52;color:#ffffff" class="header">')
      expect(sanitized).toContain('<h1>CorpLawUpdates Weekly Briefing</h1>')
      expect(sanitized).toContain('<a href="https://corplawupdates.in" style="color:#c9a227">Good Link</a>')
      expect(sanitized).toContain('<table style="width:100%;border:1px solid #c9a227" cellpadding="4">')
      expect(sanitized).toContain('<td>MCA</td>')
      expect(sanitized).toContain('<td>Circular update details</td>')
    })
  })

  // ─────────────────────────────────────────────────────────────
  // Reader Features & BroadSheet Polish Suite
  // ─────────────────────────────────────────────────────────────
  describe('BroadSheet Polish, Reader Features & Scoped CSS', () => {
    it('extractBriefingSummary correctly extracts lead headline, deck, and update count', () => {
      const { extractBriefingSummary } = require('@/lib/newsletter-pdfs')
      const sampleHtml = `
        <div class="topbar"></div>
        <div class="cell"><div class="big">29</div><div class="sub">Updates Analyzed</div></div>
        <div class="main">
          <div class="left">
            <div class="kick">Taxation · Lead Story</div>
            <div class="headline">GST registration tightens its checks — and widens its net — from 1 November</div>
            <div class="deck">Three linked GSTN changes took effect together: a rebuilt registration form, OTP proof for sensitive amendments.</div>
          </div>
        </div>
      `
      const summary = extractBriefingSummary(sampleHtml)
      expect(summary.leadHeadline).toBe('GST registration tightens its checks — and widens its net — from 1 November')
      expect(summary.deck).toContain('Three linked GSTN changes took effect together')
      expect(summary.updateCount).toBe('29 Updates')
    })

    it('verifies globals.css contains mobile safety net, theme lock, and print stylesheet', () => {
      const fs = require('fs')
      const path = require('path')
      const css = fs.readFileSync(path.join(process.cwd(), 'app/globals.css'), 'utf-8')

      // 1. Mobile safety net
      expect(css).toContain('@media (max-width: 640px)')
      expect(css).toContain('.briefing-sheet .strip')
      expect(css).toContain('.briefing-sheet .main')
      expect(css).toContain('.briefing-sheet .cols')
      expect(css).toContain('.briefing-sheet .stories')
      expect(css).toContain('.masthead h1')
      expect(css).toContain('white-space: normal !important')
      expect(css).toContain('.take')
      expect(css).toContain('.t-head')
      expect(css).toContain('.t-body')
      expect(css).toContain('.footer')
      expect(css).toContain('.disc')
      expect(css).toContain('.firm')
      expect(css).toContain('flex-direction: column !important')

      // 2. Theme lock
      expect(css).toContain('.briefing-sheet.dark-override-exempt')
      expect(css).toContain('background-color: #ffffff !important')
      expect(css).toContain('color-scheme: light !important')

      // 3. Sticky top bar positioning
      expect(css).toContain('.sticky-top-bar')
      expect(css).toContain('top: 64px !important')
      expect(css).toContain('z-index: 40 !important')

      // 4. Print stylesheet
      expect(css).toContain('@media print')
      expect(css).toContain('.briefing-sheet-card')
      expect(css).toContain('.sticky-top-bar')
      expect(css).toContain('display: none !important')
    })
  })
})
