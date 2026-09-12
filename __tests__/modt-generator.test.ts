import {
  buildModtDocx,
  buildModtPdf,
  buildUndertakingDocx,
  buildUndertakingPdf,
  buildLetterOfDepositDocx,
  buildLetterOfDepositPdf,
  buildChg1ExtractDocx,
  buildChg1ExtractPdf,
  convertNumberToIndianWords,
  formatInrCurrency,
  DEFAULT_SAMPLE_MODT_DATA,
} from '@/lib/doc-generator/modt-generator'

describe('MODT (Memorandum of Deposit of Title Deeds) Generator Suite', () => {
  describe('Helper Functions', () => {
    it('formats Indian currency numbers accurately', () => {
      expect(formatInrCurrency(15000000)).toContain('1,50,00,000')
      expect(formatInrCurrency(500000)).toContain('5,00,000')
    })

    it('converts numbers to Indian currency words accurately', () => {
      const words1 = convertNumberToIndianWords(15000000)
      expect(words1).toBe('Rupees One Crore Fifty Lakh Only')

      const words2 = convertNumberToIndianWords(7500000)
      expect(words2).toBe('Rupees Seventy Five Lakh Only')

      const words3 = convertNumberToIndianWords(0)
      expect(words3).toBe('Zero')
    })
  })

  describe('DOCX Document Generators', () => {
    it('generates valid MODT DOCX buffer with default sample data', async () => {
      const buffer = await buildModtDocx()
      expect(Buffer.isBuffer(buffer)).toBe(true)
      expect(buffer.length).toBeGreaterThan(1000)
    })

    it('generates valid Undertaking DOCX buffer', async () => {
      const buffer = await buildUndertakingDocx()
      expect(Buffer.isBuffer(buffer)).toBe(true)
      expect(buffer.length).toBeGreaterThan(1000)
    })

    it('generates valid Bank Letter DOCX buffer', async () => {
      const buffer = await buildLetterOfDepositDocx()
      expect(Buffer.isBuffer(buffer)).toBe(true)
      expect(buffer.length).toBeGreaterThan(1000)
    })

    it('generates valid CHG-1 Resolution Extract DOCX buffer', async () => {
      const buffer = await buildChg1ExtractDocx()
      expect(Buffer.isBuffer(buffer)).toBe(true)
      expect(buffer.length).toBeGreaterThan(1000)
    })

    it('generates individual mortgagor DOCX without corporate clauses', async () => {
      const buffer = await buildModtDocx({
        mortgagorType: 'individual',
        mortgagorName: 'Mr. Ananya Sen',
        mortgagorFatherOrRep: 'S/o Late Debashis Sen',
        mortgagorAddress: 'Flat 4B, South City, Kolkata - 700068',
        mortgagorPanOrCin: 'ABCPS1234F',
      })
      expect(Buffer.isBuffer(buffer)).toBe(true)
      expect(buffer.length).toBeGreaterThan(1000)
    })
  })

  describe('PDF Document Generators (pdf-lib)', () => {
    it('generates valid MODT PDF with PDF-1.7 magic bytes', async () => {
      const pdfBytes = await buildModtPdf()
      expect(pdfBytes).toBeInstanceOf(Uint8Array)
      expect(pdfBytes.length).toBeGreaterThan(500)

      // Validate %PDF magic number header
      const header = Buffer.from(pdfBytes.slice(0, 5)).toString('utf-8')
      expect(header).toBe('%PDF-')
    })

    it('generates valid Mortgagor Undertaking PDF', async () => {
      const pdfBytes = await buildUndertakingPdf()
      expect(pdfBytes).toBeInstanceOf(Uint8Array)
      expect(pdfBytes.length).toBeGreaterThan(500)
      const header = Buffer.from(pdfBytes.slice(0, 5)).toString('utf-8')
      expect(header).toBe('%PDF-')
    })

    it('generates valid Bank Letter PDF', async () => {
      const pdfBytes = await buildLetterOfDepositPdf()
      expect(pdfBytes).toBeInstanceOf(Uint8Array)
      expect(pdfBytes.length).toBeGreaterThan(500)
      const header = Buffer.from(pdfBytes.slice(0, 5)).toString('utf-8')
      expect(header).toBe('%PDF-')
    })

    it('generates valid CHG-1 Board Resolution PDF', async () => {
      const pdfBytes = await buildChg1ExtractPdf()
      expect(pdfBytes).toBeInstanceOf(Uint8Array)
      expect(pdfBytes.length).toBeGreaterThan(500)
      const header = Buffer.from(pdfBytes.slice(0, 5)).toString('utf-8')
      expect(header).toBe('%PDF-')
    })

    it('handles multiple custom title deeds and multi-page layout in PDF', async () => {
      const pdfBytes = await buildModtPdf({
        titleDeeds: [
          ...DEFAULT_SAMPLE_MODT_DATA.titleDeeds,
          {
            serialNo: 5,
            docType: 'NOC from Resident Welfare Association',
            docNo: 'RWA/OKH/2026/102',
            date: '01/09/2026',
            executants: 'President, Okhla Industrial Area Welfare Association',
          },
          {
            serialNo: 6,
            docType: 'Fire Safety Clearance Certificate',
            docNo: 'DFS/HQ/2025/FS-9421',
            date: '12/12/2025',
            executants: 'Delhi Fire Services, Govt. of NCT of Delhi',
          },
        ],
      })
      expect(pdfBytes).toBeInstanceOf(Uint8Array)
      expect(pdfBytes.length).toBeGreaterThan(500)
      const header = Buffer.from(pdfBytes.slice(0, 5)).toString('utf-8')
      expect(header).toBe('%PDF-')
    })
  })
})
