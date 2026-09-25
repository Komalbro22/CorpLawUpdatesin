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
})
