import { buildSlaDocx, buildSlaPdf, SLA_PRESETS, SlaType } from '@/lib/doc-generator/sla-generator'
import JSZip from 'jszip'

describe('Service Level Agreement (SLA) Document Generator Suite', () => {
  const presets: SlaType[] = [
    'cloud_computing',
    'it_saas',
    'vendor_customer',
    'software_maintenance',
    'recruitment_hr',
  ]

  presets.forEach(type => {
    it(`generates a valid DOCX buffer for preset: ${type}`, async () => {
      const p = SLA_PRESETS[type]
      const buffer = await buildSlaDocx({
        slaType: type,
        title: p.title,
        servicesDescription: p.servicesDefault,
        uptimeTarget: p.uptimeDefault,
        maintenanceWindow: p.maintenanceDefault,
        creditPercentage: p.creditDefault,
        penaltyCap: p.capDefault,
      })

      expect(buffer).toBeInstanceOf(Buffer)
      expect(buffer.length).toBeGreaterThan(2000)
    })
  })

  it('generates clean OpenXML document.xml without unescaped newlines or schema errors', async () => {
    const buffer = await buildSlaDocx({
      slaType: 'cloud_computing',
      clientName: 'Alpha Tech Ltd\nWith Subtitle',
      servicesDescription: 'Line 1\nLine 2\nLine 3',
    })

    const zip = await JSZip.loadAsync(buffer)
    const xml = await zip.file('word/document.xml')?.async('text')

    expect(xml).toBeDefined()
    // Verify no literal newline character inside text tags
    expect(xml).not.toMatch(/<w:t[^>]*>[^<]*\n[^<]*<\/w:t>/)
    // Verify valid DXA widths
    expect(xml).toContain('w:type="dxa"')
  })

  it('generates a valid PDF buffer for SLA', async () => {
    const pdfBytes = await buildSlaPdf({
      slaType: 'cloud_computing',
      clientName: 'Test Client Ltd',
      providerName: 'Test Cloud Provider Ltd',
    })

    expect(pdfBytes).toBeInstanceOf(Uint8Array)
    expect(pdfBytes.length).toBeGreaterThan(1000)
    // Check PDF header
    const header = Buffer.from(pdfBytes.slice(0, 5)).toString('ascii')
    expect(header).toBe('%PDF-')
  })

  it('renders custom AI clauses and language notes into DOCX and multi-page PDF', async () => {
    const customData = {
      slaType: 'it_saas' as SlaType,
      clientName: 'Enterprise FinTech Private Limited',
      providerName: 'Secure Cloud Platform Private Limited',
      customClauses: [
        {
          id: 'certin_1',
          title: 'CERT-In 6-Hour Cybersecurity Incident Notice',
          content: 'The Service Provider shall report any information security incident to the Client and CERT-In within six (6) hours.',
        },
        {
          id: 'bcp_2',
          title: 'Business Continuity & Disaster Recovery',
          content: 'The Service Provider commits to an RPO of 15 minutes and RTO of 2 hours.',
        },
      ],
      languageNote: 'यह अनुबंध भारतीय संविदा अधिनियम १८७२ के अंतर्गत विधिक रूप से मान्य है।',
    }

    // Check DOCX
    const docxBuffer = await buildSlaDocx(customData)
    expect(docxBuffer).toBeInstanceOf(Buffer)
    const zip = await JSZip.loadAsync(docxBuffer)
    const xml = await zip.file('word/document.xml')?.async('text')
    expect(xml).toContain('CERT-IN 6-HOUR CYBERSECURITY INCIDENT NOTICE')
    expect(xml).toContain('BUSINESS CONTINUITY &amp; DISASTER RECOVERY')
    expect(xml).toContain('ANNEXURE I: BILINGUAL STATUTORY NOTE')

    // Check PDF
    const pdfBytes = await buildSlaPdf(customData)
    expect(pdfBytes).toBeInstanceOf(Uint8Array)
    expect(pdfBytes.length).toBeGreaterThan(2000)
  })
})
