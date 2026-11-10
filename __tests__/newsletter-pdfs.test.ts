import { NextRequest } from 'next/server'
import { GET as listRoute, POST as uploadRoute } from '@/app/api/admin/newsletter-pdfs/route'
import { GET as getSingleRoute, PATCH as replaceRoute, DELETE as deleteRoute } from '@/app/api/admin/newsletter-pdfs/[id]/route'
import { GET as brandedDownloadRoute } from '@/app/newsletters/[slug]/route'
import { supabaseAdmin } from '@/lib/supabase-server'
import { verifyAdminOrKey } from '@/lib/api-key-auth'

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

describe('Newsletter PDF Hosting Feature Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('1. File Type and Size Validation (Acceptance Test 6)', () => {
    it('rejects a non-PDF file upload with HTTP 400', async () => {
      ;(verifyAdminOrKey as jest.Mock).mockResolvedValue({
        success: true,
        auth: { type: 'api_key', key: { id: 'key-1', name: 'muse ai' } },
      })

      const formData = new FormData()
      const textFile = new File(['hello world text content'], 'briefing.txt', { type: 'text/plain' })
      formData.append('file', textFile)
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
      expect(json.error.code).toBe('INVALID_FILE_TYPE')
    })

    it('rejects files larger than 10 MB with HTTP 400', async () => {
      ;(verifyAdminOrKey as jest.Mock).mockResolvedValue({
        success: true,
        auth: { type: 'api_key', key: { id: 'key-1', name: 'muse ai' } },
      })

      // Create a dummy buffer slightly over 10 MB
      const bigBuffer = new Uint8Array(10 * 1024 * 1024 + 1024)
      const bigFile = new File([bigBuffer], 'giant.pdf', { type: 'application/pdf' })

      const formData = new FormData()
      formData.append('file', bigFile)
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
      expect(json.error.code).toBe('FILE_TOO_LARGE')
    })

    it('rejects missing metadata fields with HTTP 400', async () => {
      ;(verifyAdminOrKey as jest.Mock).mockResolvedValue({
        success: true,
        auth: { type: 'api_key', key: { id: 'key-1', name: 'muse ai' } },
      })

      const formData = new FormData()
      const pdfFile = new File(['%PDF-1.4 dummy'], 'briefing.pdf', { type: 'application/pdf' })
      formData.append('file', pdfFile)
      // Missing week_label, week_start, week_end

      const req = new NextRequest('http://localhost:3000/api/admin/newsletter-pdfs', {
        method: 'POST',
        body: formData,
      })

      const res = await uploadRoute(req)
      expect(res.status).toBe(400)
      const json = await res.json()
      expect(json.error.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('2. Valid PDF Upload via API Key (Acceptance Test 1)', () => {
    it('uploads PDF to storage bucket, writes DB record and returns working public URL', async () => {
      ;(verifyAdminOrKey as jest.Mock).mockResolvedValue({
        success: true,
        auth: { type: 'api_key', key: { id: 'key-muse', name: 'muse ai' } },
      })

      const mockUpload = jest.fn().mockResolvedValue({ data: { path: 'weekly-briefing-2026-11-09.pdf' }, error: null })
      const mockGetPublicUrl = jest.fn().mockReturnValue({
        data: { publicUrl: 'https://fcosrsznbxedischtbwe.supabase.co/storage/v1/object/public/newsletter-pdfs/weekly-briefing-2026-11-09.pdf' },
      })

      ;(supabaseAdmin.storage.from as jest.Mock).mockReturnValue({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      })

      const mockInsertRecord = {
        id: 'pdf-uuid-123',
        slug: 'weekly-briefing-2026-11-09',
        week_label: '2 – 8 November 2026',
        week_start: '2026-11-02',
        week_end: '2026-11-08',
        file_path: 'weekly-briefing-2026-11-09.pdf',
        file_size_bytes: 1024,
        uploaded_by: 'api_key:muse ai',
        download_count: 0,
        created_at: '2026-11-09T08:00:00Z',
        updated_at: '2026-11-09T08:00:00Z',
      }

      const mockSingle = jest.fn().mockResolvedValue({ data: mockInsertRecord, error: null })
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle })
      const mockUpsert = jest.fn().mockReturnValue({ select: mockSelect })

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue({
        upsert: mockUpsert,
      })

      const formData = new FormData()
      const pdfFile = new File(['%PDF-1.4 valid content'], 'weekly-briefing-2026-11-09.pdf', { type: 'application/pdf' })
      formData.append('file', pdfFile)
      formData.append('week_label', '2 – 8 November 2026')
      formData.append('week_start', '2026-11-02')
      formData.append('week_end', '2026-11-08')

      const req = new NextRequest('http://localhost:3000/api/admin/newsletter-pdfs', {
        method: 'POST',
        body: formData,
      })

      const res = await uploadRoute(req)
      expect(res.status).toBe(201)
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.newsletter.slug).toBe('weekly-briefing-2026-11-09')
      expect(json.public_url).toBe('https://www.corplawupdates.in/newsletters/weekly-briefing-2026-11-09')

      expect(mockUpload).toHaveBeenCalledWith(
        'weekly-briefing-2026-11-09.pdf',
        expect.any(Buffer),
        expect.objectContaining({ contentType: 'application/pdf', upsert: true })
      )
    })
  })

  describe('3. Branded Download Route (/newsletters/[slug]) (Acceptance Test 2)', () => {
    it('redirects 302 to direct storage URL with cache-busting timestamp without login or interstitial', async () => {
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

      // Mock increment download count
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

      const req = new NextRequest('http://localhost:3000/newsletters/weekly-briefing-2026-11-09')
      const res = await brandedDownloadRoute(req, {
        params: Promise.resolve({ slug: 'weekly-briefing-2026-11-09' }),
      })

      expect(res.status).toBe(302)
      const redirectUrl = res.headers.get('location')
      expect(redirectUrl).toContain('https://fcosrsznbxedischtbwe.supabase.co/storage/v1/object/public/newsletter-pdfs/weekly-briefing-2026-11-09.pdf?v=')
      expect(res.headers.get('cache-control')).toContain('no-cache')
    })
  })

  describe('4. File Replacement via API (Acceptance Test 3)', () => {
    it('replaces PDF file, preserves slug and public link with updated timestamp cache-buster', async () => {
      ;(verifyAdminOrKey as jest.Mock).mockResolvedValue({
        success: true,
        auth: { type: 'api_key', key: { id: 'key-muse', name: 'muse ai' } },
      })

      const existingRecord = {
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
        updated_at: '2026-11-09T08:00:00Z',
      }

      const updatedRecord = {
        ...existingRecord,
        file_size_bytes: 2048,
        updated_at: '2026-11-09T09:00:00Z',
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

      const mockUpload = jest.fn().mockResolvedValue({ data: { path: 'weekly-briefing-2026-11-09.pdf' }, error: null })
      const mockGetPublicUrl = jest.fn().mockReturnValue({
        data: { publicUrl: 'https://fcosrsznbxedischtbwe.supabase.co/storage/v1/object/public/newsletter-pdfs/weekly-briefing-2026-11-09.pdf' },
      })
      ;(supabaseAdmin.storage.from as jest.Mock).mockReturnValue({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      })

      const formData = new FormData()
      const newPdfFile = new File(['%PDF-1.4 updated content'], 'new.pdf', { type: 'application/pdf' })
      formData.append('file', newPdfFile)

      const req = new NextRequest('http://localhost:3000/api/admin/newsletter-pdfs/pdf-uuid-123', {
        method: 'PATCH',
        body: formData,
      })

      const res = await replaceRoute(req, { params: Promise.resolve({ id: 'pdf-uuid-123' }) })
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.newsletter.slug).toBe('weekly-briefing-2026-11-09') // same slug
      expect(json.public_url).toBe('https://www.corplawupdates.in/newsletters/weekly-briefing-2026-11-09')

      expect(mockUpload).toHaveBeenCalledWith(
        'weekly-briefing-2026-11-09.pdf',
        expect.any(Buffer),
        expect.objectContaining({ upsert: true })
      )
    })
  })

  describe('5. PDF Deletion via API', () => {
    it('deletes storage asset and database record', async () => {
      ;(verifyAdminOrKey as jest.Mock).mockResolvedValue({
        success: true,
        auth: { type: 'api_key', key: { id: 'key-muse', name: 'muse ai' } },
      })

      const existingRecord = {
        id: 'pdf-uuid-123',
        slug: 'weekly-briefing-2026-11-09',
        file_path: 'weekly-briefing-2026-11-09.pdf',
      }

      // Mock get by ID
      const mockGetSingle = jest.fn().mockResolvedValue({ data: existingRecord, error: null })
      const mockGetEq = jest.fn().mockReturnValue({ maybeSingle: mockGetSingle })
      const mockGetSelect = jest.fn().mockReturnValue({ eq: mockGetEq })

      // Mock delete
      const mockDeleteEq = jest.fn().mockResolvedValue({ error: null })
      const mockDelete = jest.fn().mockReturnValue({ eq: mockDeleteEq })

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: mockGetSelect,
        delete: mockDelete,
      })

      const mockRemove = jest.fn().mockResolvedValue({ data: [], error: null })
      const mockGetPublicUrl = jest.fn().mockReturnValue({ data: { publicUrl: '' } })
      ;(supabaseAdmin.storage.from as jest.Mock).mockReturnValue({
        remove: mockRemove,
        getPublicUrl: mockGetPublicUrl,
      })

      const req = new NextRequest('http://localhost:3000/api/admin/newsletter-pdfs/pdf-uuid-123', {
        method: 'DELETE',
      })

      const res = await deleteRoute(req, { params: Promise.resolve({ id: 'pdf-uuid-123' }) })
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.success).toBe(true)

      expect(mockRemove).toHaveBeenCalledWith(['weekly-briefing-2026-11-09.pdf'])
      expect(mockDeleteEq).toHaveBeenCalledWith('id', 'pdf-uuid-123')
    })
  })

  describe('6. Listing All Editions', () => {
    it('GET /api/admin/newsletter-pdfs returns list of all newsletters', async () => {
      ;(verifyAdminOrKey as jest.Mock).mockResolvedValue({
        success: true,
        auth: { type: 'api_key', key: { id: 'key-muse', name: 'muse ai' } },
      })

      const mockItems = [
        {
          id: '1',
          slug: 'weekly-briefing-2026-11-09',
          week_label: '2 – 8 November 2026',
          week_start: '2026-11-02',
          week_end: '2026-11-08',
          file_path: 'weekly-briefing-2026-11-09.pdf',
          file_size_bytes: 1024,
          uploaded_by: 'admin',
          download_count: 10,
          created_at: '2026-11-09T08:00:00Z',
          updated_at: '2026-11-09T08:00:00Z',
        },
      ]

      const mockOrder = jest.fn().mockResolvedValue({ data: mockItems, error: null })
      const mockSelect = jest.fn().mockReturnValue({ order: mockOrder })
      ;(supabaseAdmin.from as jest.Mock).mockReturnValue({ select: mockSelect })

      const mockGetPublicUrl = jest.fn().mockReturnValue({
        data: { publicUrl: 'https://storage/briefing.pdf' },
      })
      ;(supabaseAdmin.storage.from as jest.Mock).mockReturnValue({
        getPublicUrl: mockGetPublicUrl,
      })

      const req = new NextRequest('http://localhost:3000/api/admin/newsletter-pdfs')
      const res = await listRoute(req)
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.newsletters).toHaveLength(1)
      expect(json.newsletters[0].public_url).toBe('https://www.corplawupdates.in/newsletters/weekly-briefing-2026-11-09')
    })
  })
})
