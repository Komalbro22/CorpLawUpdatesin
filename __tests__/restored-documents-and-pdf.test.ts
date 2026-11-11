import { PDFDocument } from 'pdf-lib'
import { POST as downloadPost } from '@/app/api/documents/download/route'
import { DOCUMENT_SEO_GUIDES, getDocumentSeoGuide } from '@/lib/documents-seo-guides'

const RESTORED_SLUGS = [
  'board-resolution-alteration-moa',
  'board-resolution-appoint-company-secretary',
  'board-resolution-bank-account',
  'board-resolution-common-seal',
  'board-resolution-employee-loan',
  'board-resolution-increase-authorized-capital',
  'board-resolution-investment',
  'board-resolution-name-change',
  'board-resolution-related-party-transaction',
  'special-resolution-registered-office-shifting',
  'english-mortgage-deed',
  'mortgage-conditional-sale',
  'simple-mortgage-deed',
  'usufructuary-mortgage-deed',
  'public-notice-financial-results',
  'public-notice-trading-member-expulsion',
  'consultancy-agreement',
] as const

describe('Restored 17 Document Pages SEO/GEO & Export Parity', () => {
  test('every one of the 17 restored slugs has complete SEO & GEO guide data', () => {
    expect(Object.keys(DOCUMENT_SEO_GUIDES).length).toBeGreaterThanOrEqual(17)

    for (const slug of RESTORED_SLUGS) {
      const guide = getDocumentSeoGuide(slug)
      expect(guide).not.toBeNull()
      if (!guide) continue

      expect(guide.slug).toBe(slug)
      expect(guide.seoTitle.length).toBeGreaterThan(25)
      expect(guide.metaDescription.length).toBeGreaterThanOrEqual(80)
      expect(guide.h1.length).toBeGreaterThan(25)
      expect(guide.keywords.length).toBeGreaterThanOrEqual(4)
      expect(guide.quickSummary.length).toBeGreaterThanOrEqual(4)
      expect(guide.whenRequired.length).toBeGreaterThanOrEqual(3)
      expect(guide.clausesExplained.length).toBeGreaterThanOrEqual(4)
      for (const clause of guide.clausesExplained) {
        expect(clause).toBeDefined()
        expect(clause.title.length).toBeGreaterThan(3)
        expect(clause.summary.length).toBeGreaterThan(15)
      }
      expect(guide.executionChecklist.length).toBeGreaterThanOrEqual(3)
      expect(guide.relatedDocs.length).toBeGreaterThanOrEqual(2)
      expect(guide.relatedGlossary.length).toBeGreaterThanOrEqual(2)
      expect(guide.faqs.length).toBeGreaterThanOrEqual(4)
    }
  })

  test('HTML document content with tables and long tokens renders valid PDF and DOCX without crashing', async () => {
    const sampleHtml = `
      <div class="legal-doc">
        <h1>PUBLIC NOTICE — UNAUDITED FINANCIAL RESULTS</h1>
        <p><strong>ACME INFRASTRUCTURE PRIVATE LIMITED</strong> &amp; ASSOCIATES (CIN: U45200MH2020PTC123456)</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr><th style="width: 50%;">Particulars</th><th style="width: 25%;">Quarter Ended 30.09.2026</th><th style="width: 25%;">Year Ended 31.03.2026</th></tr>
          </thead>
          <tbody>
            <tr><td style="width: 50%; vertical-align: top;">Total Income from Operations</td><td style="width: 25%;">₹ 4,250.00 Lakhs</td><td style="width: 25%;">₹ 16,800.00 Lakhs</td></tr>
            <tr><td style="width: 50%;">Net Profit / (Loss) for the period</td><td style="width: 25%;">₹ 312.50 Lakhs</td><td style="width: 25%;">₹ 1,190.25 Lakhs</td></tr>
          </tbody>
        </table>
        <ol>
          <li>Published under Regulation 47 &amp; Regulation 33 of SEBI (LODR) Regulations, 2015.</li>
          <li>Detailed filing reference URL: https://www.corplawupdates.in/documents/public-notice-financial-results?ver=20261111_very_long_token_segment_to_verify_wrapping</li>
        </ol>
      </div>
    `

    const pdfReq = new Request('http://localhost/api/documents/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: sampleHtml,
        document_name: 'Public Notice Financial Results',
        format: 'pdf',
      }),
    })
    const pdfRes = await downloadPost(pdfReq)
    expect(pdfRes.status).toBe(200)
    expect(pdfRes.headers.get('content-type')).toContain('application/pdf')
    const pdfBytes = new Uint8Array(await pdfRes.arrayBuffer())
    expect(Buffer.from(pdfBytes.slice(0, 5)).toString('ascii')).toBe('%PDF-')
    const pdfDoc = await PDFDocument.load(pdfBytes)
    expect(pdfDoc.getPageCount()).toBeGreaterThanOrEqual(1)

    const docxReq = new Request('http://localhost/api/documents/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: sampleHtml,
        document_name: 'Public Notice Financial Results',
        format: 'docx',
      }),
    })
    const docxRes = await downloadPost(docxReq)
    expect(docxRes.status).toBe(200)
    expect(docxRes.headers.get('content-type')).toContain(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
    const docxBytes = new Uint8Array(await docxRes.arrayBuffer())
    expect(Buffer.from(docxBytes.slice(0, 2)).toString('ascii')).toBe('PK')
    expect(docxBytes.byteLength).toBeGreaterThan(2000)
  })
})
