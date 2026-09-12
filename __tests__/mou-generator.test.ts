import {
  buildMouDocx,
  buildMouPdf,
  buildNdaAddendumDocx,
  buildNdaAddendumPdf,
  MOU_TYPE_PRESETS,
  DEFAULT_SAMPLE_MOU_DATA,
  MouType,
} from '@/lib/doc-generator/mou-generator'

describe('MoU (Memorandum of Understanding) Generator Suite', () => {
  describe('Presets Configuration', () => {
    const expectedPresets: MouType[] = [
      'business_partnership',
      'joint_venture',
      'vendor_services',
      'research_tech',
      'startup_founders',
      'inter_company',
    ]

    it('contains all 6 required preset types with rich legal metadata', () => {
      expectedPresets.forEach(presetKey => {
        const preset = MOU_TYPE_PRESETS[presetKey]
        expect(preset).toBeDefined()
        expect(preset.label.length).toBeGreaterThan(3)
        expect(preset.title.length).toBeGreaterThan(10)
        expect(preset.defaultPurpose.length).toBeGreaterThan(20)
        expect(preset.scope.length).toBeGreaterThan(20)
        expect(preset.obligationsA.length).toBeGreaterThan(0)
        expect(preset.obligationsB.length).toBeGreaterThan(0)
        expect(preset.ipTerms.length).toBeGreaterThan(10)
        expect(preset.exclusivity.length).toBeGreaterThan(10)
      })
    })

    it('validates default sample data properties', () => {
      expect(DEFAULT_SAMPLE_MOU_DATA.partyA.name).toBeDefined()
      expect(DEFAULT_SAMPLE_MOU_DATA.partyB.name).toBeDefined()
      expect(DEFAULT_SAMPLE_MOU_DATA.collaborationPurpose).toBeDefined()
      expect(DEFAULT_SAMPLE_MOU_DATA.backgroundRecitals.length).toBeGreaterThan(0)
      expect(DEFAULT_SAMPLE_MOU_DATA.obligationsPartyA.length).toBeGreaterThan(0)
      expect(DEFAULT_SAMPLE_MOU_DATA.obligationsPartyB.length).toBeGreaterThan(0)
    })
  })

  describe('DOCX Document Generation', () => {
    it('generates valid MoU DOCX buffer with default sample data', async () => {
      const buffer = await buildMouDocx()
      expect(Buffer.isBuffer(buffer)).toBe(true)
      expect(buffer.length).toBeGreaterThan(1000)
    })

    it('generates valid NDA Addendum DOCX buffer', async () => {
      const buffer = await buildNdaAddendumDocx()
      expect(Buffer.isBuffer(buffer)).toBe(true)
      expect(buffer.length).toBeGreaterThan(1000)
    })

    it('generates valid DOCX across all 6 presets', async () => {
      const presets: MouType[] = [
        'business_partnership',
        'joint_venture',
        'vendor_services',
        'research_tech',
        'startup_founders',
        'inter_company',
      ]

      for (const presetKey of presets) {
        const preset = MOU_TYPE_PRESETS[presetKey]
        const buffer = await buildMouDocx({
          mouType: presetKey,
          title: preset.title,
          collaborationPurpose: preset.defaultPurpose,
          scopeOfWork: preset.scope,
          obligationsPartyA: preset.obligationsA,
          obligationsPartyB: preset.obligationsB,
          intellectualPropertyTerms: preset.ipTerms,
          exclusivityTerms: preset.exclusivity,
          financialTermsDescription: preset.financials,
          hasFinancialTerms: Boolean(preset.financials),
        })
        expect(Buffer.isBuffer(buffer)).toBe(true)
        expect(buffer.length).toBeGreaterThan(1000)
      }
    })

    it('handles non-financial MoU configuration correctly', async () => {
      const buffer = await buildMouDocx({
        hasFinancialTerms: false,
        financialTermsDescription: '',
      })
      expect(Buffer.isBuffer(buffer)).toBe(true)
      expect(buffer.length).toBeGreaterThan(1000)
    })
  })

  describe('PDF Document Generation (pdf-lib)', () => {
    it('generates valid MoU PDF with %PDF magic header', async () => {
      const pdfBytes = await buildMouPdf()
      expect(pdfBytes).toBeInstanceOf(Uint8Array)
      expect(pdfBytes.length).toBeGreaterThan(500)

      const header = Buffer.from(pdfBytes.slice(0, 5)).toString('utf-8')
      expect(header).toBe('%PDF-')
    })

    it('generates valid NDA Addendum PDF with %PDF magic header', async () => {
      const pdfBytes = await buildNdaAddendumPdf()
      expect(pdfBytes).toBeInstanceOf(Uint8Array)
      expect(pdfBytes.length).toBeGreaterThan(500)

      const header = Buffer.from(pdfBytes.slice(0, 5)).toString('utf-8')
      expect(header).toBe('%PDF-')
    })

    it('generates valid PDF across all 6 presets without throwing encoding errors', async () => {
      const presets: MouType[] = [
        'business_partnership',
        'joint_venture',
        'vendor_services',
        'research_tech',
        'startup_founders',
        'inter_company',
      ]

      for (const presetKey of presets) {
        const preset = MOU_TYPE_PRESETS[presetKey]
        const pdfBytes = await buildMouPdf({
          mouType: presetKey,
          title: preset.title,
          collaborationPurpose: preset.defaultPurpose,
          scopeOfWork: preset.scope,
          obligationsPartyA: preset.obligationsA,
          obligationsPartyB: preset.obligationsB,
          intellectualPropertyTerms: preset.ipTerms,
          exclusivityTerms: preset.exclusivity,
          financialTermsDescription: preset.financials,
          hasFinancialTerms: Boolean(preset.financials),
        })
        expect(pdfBytes).toBeInstanceOf(Uint8Array)
        expect(pdfBytes.length).toBeGreaterThan(500)

        const header = Buffer.from(pdfBytes.slice(0, 5)).toString('utf-8')
        expect(header).toBe('%PDF-')
      }
    })
  })
})
