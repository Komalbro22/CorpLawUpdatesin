import {
  buildPartnershipDeedDocx,
  buildPartnershipDeedPdf,
  buildRofForm1Docx,
  buildRofForm1Pdf,
  buildBankMandateDocx,
  buildBankMandatePdf,
  calculateSection40bRemuneration,
  PARTNERSHIP_PRESETS,
  DEFAULT_SAMPLE_PARTNERSHIP_DATA,
  FirmCategory,
  PartnershipDeedFormData,
} from '@/lib/doc-generator/partnership-deed-generator'

describe('Partnership Deed & Statutory Forms Generator Suite', () => {
  describe('Presets Configuration', () => {
    const expectedPresets: FirmCategory[] = [
      'general_at_will',
      'trading_retail',
      'professional_services',
      'manufacturing_industrial',
      'tech_ecommerce',
    ]

    it('contains all 5 required preset types with rich legal metadata', () => {
      expectedPresets.forEach((presetKey) => {
        const preset = PARTNERSHIP_PRESETS[presetKey]
        expect(preset).toBeDefined()
        expect(preset.label.length).toBeGreaterThan(3)
        expect(preset.shortBadge.length).toBeGreaterThan(3)
        expect(preset.defaultObjects.length).toBeGreaterThan(20)
        expect(preset.suggestedFirmName.length).toBeGreaterThan(5)
      })
    })

    it('validates default sample data structure and 100% profit ratio', () => {
      expect(DEFAULT_SAMPLE_PARTNERSHIP_DATA.firmName).toBeDefined()
      expect(DEFAULT_SAMPLE_PARTNERSHIP_DATA.partners.length).toBeGreaterThanOrEqual(2)
      const totalRatio = DEFAULT_SAMPLE_PARTNERSHIP_DATA.partners.reduce(
        (sum, p) => sum + p.profitShare,
        0
      )
      expect(totalRatio).toBe(100)
      expect(DEFAULT_SAMPLE_PARTNERSHIP_DATA.executionState).toBe('Delhi')
    })
  })

  describe('Section 40(b) Remuneration Engine (AY 2025-26)', () => {
    it('applies ₹3,00,000 statutory floor in case of financial loss', () => {
      const res = calculateSection40bRemuneration(-100000)
      expect(res.maxDeductible).toBe(300000)
      expect(res.explanation).toContain('Rs. 3,00,000')
    })

    it('applies ₹3,00,000 statutory floor when 90% of profit is less than ₹3,00,000', () => {
      // For book profit ₹2,00,000: 90% is ₹1,80,000. Floor is ₹3,00,000.
      const res = calculateSection40bRemuneration(200000)
      expect(res.maxDeductible).toBe(300000)
    })

    it('calculates 90% correctly within first ₹6,00,000 slab when above floor', () => {
      // For book profit ₹5,00,000: 90% is ₹4,50,000 > ₹3,00,000 floor.
      const res = calculateSection40bRemuneration(500000)
      expect(res.maxDeductible).toBe(450000)
      expect(res.firstSlab).toBe(450000)
      expect(res.balanceSlab).toBe(0)
    })

    it('calculates 90% on first ₹6,00,000 and 60% on balance profit', () => {
      // For book profit ₹10,00,000:
      // First ₹6,00,000 @ 90% = ₹5,40,000
      // Balance ₹4,00,000 @ 60% = ₹2,40,000
      // Total = ₹7,80,000
      const res = calculateSection40bRemuneration(1000000)
      expect(res.firstSlab).toBe(540000)
      expect(res.balanceSlab).toBe(240000)
      expect(res.maxDeductible).toBe(780000)
    })
  })

  describe('DOCX Document Generation', () => {
    it('generates valid Partnership Deed DOCX buffer with default data', async () => {
      const buffer = await buildPartnershipDeedDocx()
      expect(Buffer.isBuffer(buffer)).toBe(true)
      expect(buffer.length).toBeGreaterThan(2000)
    })

    it('generates valid ROF Form 1 DOCX buffer', async () => {
      const buffer = await buildRofForm1Docx()
      expect(Buffer.isBuffer(buffer)).toBe(true)
      expect(buffer.length).toBeGreaterThan(1000)
    })

    it('generates valid Bank Mandate DOCX buffer', async () => {
      const buffer = await buildBankMandateDocx()
      expect(Buffer.isBuffer(buffer)).toBe(true)
      expect(buffer.length).toBeGreaterThan(1000)
    })

    it('generates customized DOCX with 3 partners', async () => {
      const customData: PartnershipDeedFormData = {
        ...DEFAULT_SAMPLE_PARTNERSHIP_DATA,
        firmName: 'APEX VENTURES & ASSOCIATES',
        partners: [
          {
            name: 'Rajesh Kumar Verma',
            fatherOrSpouse: 'Suresh Chandra Verma',
            address: 'B-14, Green Park, New Delhi - 110016',
            pan: 'ABCDE1234F',
            aadhaarOrId: '123456789012',
            capitalAmount: 1000000,
            capitalPercentage: 50,
            profitShare: 50,
            lossShare: 50,
            isWorkingPartner: true,
          },
          {
            name: 'Sunita Mehra',
            fatherOrSpouse: 'Anand Mehra',
            address: 'C-22, Hauz Khas, New Delhi - 110016',
            pan: 'FGHIJ5678K',
            aadhaarOrId: '987654321098',
            capitalAmount: 600000,
            capitalPercentage: 30,
            profitShare: 30,
            lossShare: 30,
            isWorkingPartner: true,
          },
          {
            name: 'Vikramaditya Roy',
            fatherOrSpouse: 'Debabrata Roy',
            address: 'D-5, Vasant Vihar, New Delhi - 110057',
            pan: 'KLMNO9012P',
            aadhaarOrId: '456789012345',
            capitalAmount: 400000,
            capitalPercentage: 20,
            profitShare: 20,
            lossShare: 20,
            isWorkingPartner: false,
          },
        ],
      }

      const buffer = await buildPartnershipDeedDocx(customData)
      expect(Buffer.isBuffer(buffer)).toBe(true)
      expect(buffer.length).toBeGreaterThan(2000)
    })
  })

  describe('PDF Document Generation', () => {
    it('generates valid Partnership Deed PDF with standard PDF header', async () => {
      const pdfBytes = await buildPartnershipDeedPdf()
      expect(pdfBytes).toBeInstanceOf(Uint8Array)
      expect(pdfBytes.length).toBeGreaterThan(1000)

      // Verify PDF magic header %PDF- (0x25, 0x50, 0x44, 0x46, 0x2D)
      const header = String.fromCharCode(...pdfBytes.slice(0, 5))
      expect(header).toBe('%PDF-')
    })

    it('generates valid ROF Form 1 PDF with standard PDF header', async () => {
      const pdfBytes = await buildRofForm1Pdf()
      expect(pdfBytes).toBeInstanceOf(Uint8Array)
      expect(pdfBytes.length).toBeGreaterThan(500)

      const header = String.fromCharCode(...pdfBytes.slice(0, 5))
      expect(header).toBe('%PDF-')
    })

    it('generates valid Bank Mandate PDF with standard PDF header', async () => {
      const pdfBytes = await buildBankMandatePdf()
      expect(pdfBytes).toBeInstanceOf(Uint8Array)
      expect(pdfBytes.length).toBeGreaterThan(500)

      const header = String.fromCharCode(...pdfBytes.slice(0, 5))
      expect(header).toBe('%PDF-')
    })
  })
})
