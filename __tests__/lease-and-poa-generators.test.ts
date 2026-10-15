import {
  calculateMaharashtraStampDuty,
  generateLeaseMarkdown,
  buildLeaseDocx,
  buildLeasePdf,
  DEFAULT_SAMPLE_LEASE_DATA,
} from '@/lib/doc-generator/lease-generator'

import {
  generatePoaMarkdown,
  buildPoaDocx,
  buildPoaPdf,
  DEFAULT_SAMPLE_POA_DATA,
} from '@/lib/doc-generator/poa-generator'

describe('Lease / Rent Agreement Generator & Maharashtra Stamp Duty', () => {
  it('correctly calculates Maharashtra 0.25% stamp duty for 24-month lease verified example', () => {
    // Verified example in brief:
    // ₹25,000/month × 24 months = ₹6,00,000 rent
    // 10% notional interest on ₹2,00,000 deposit for 2 years = ₹40,000
    // Taxable base = ₹6,40,000 × 0.25% = ₹1,600
    const result = calculateMaharashtraStampDuty(25000, 24, 200000, 0)
    expect(result.totalRent).toBe(600000)
    expect(result.notionalInterest).toBe(40000)
    expect(result.taxableBase).toBe(640000)
    expect(result.ratePercent).toBe(0.25)
    expect(result.stampDuty).toBe(1600)
    expect(result.registrationFeeUrban).toBe(1000)
    expect(result.registrationFeeRural).toBe(500)
    expect(result.digitalStampingCompulsory).toBe(true)
  })

  it('correctly calculates stamp duty for standard 11-month agreement', () => {
    const result = calculateMaharashtraStampDuty(35000, 11, 100000, 0)
    expect(result.totalRent).toBe(385000)
    expect(result.stampDuty).toBeGreaterThan(0)
  })

  it('generates complete markdown with statutory citations and custom clauses', () => {
    const dataWithClause = {
      ...DEFAULT_SAMPLE_LEASE_DATA,
      customClauses: [
        {
          id: 'c1',
          title: 'Pet Permission',
          text: 'The Licensee is permitted to keep one domestic cat with an additional refundable cleaning deposit.',
        },
      ],
    }

    const md = generateLeaseMarkdown(dataWithClause)
    expect(md).toContain('LEAVE AND LICENSE AGREEMENT')
    expect(md).toContain('Indian Easements Act, 1882')
    expect(md).toContain('Rameshwar Nath Kulkarni')
    expect(md).toContain('Arjun Somesh Sharma')
    expect(md).toContain('PET PERMISSION')
    expect(md).toContain('[AI-Drafted Custom Clause — review before signing]')
    expect(md).toContain('WITNESSES')
  })

  it('builds valid docx buffer and pdf bytes for Lease Agreement', async () => {
    const docxBuffer = await buildLeaseDocx(DEFAULT_SAMPLE_LEASE_DATA)
    expect(Buffer.isBuffer(docxBuffer)).toBe(true)
    expect(docxBuffer.length).toBeGreaterThan(1000)

    const pdfBytes = await buildLeasePdf(DEFAULT_SAMPLE_LEASE_DATA)
    expect(pdfBytes).toBeInstanceOf(Uint8Array)
    expect(pdfBytes.length).toBeGreaterThan(1000)
  })
})

describe('General Power of Attorney (POA) Generator', () => {
  it('generates complete markdown with Suraj Lamp (2011) doctrine and powers', () => {
    const dataWithClause = {
      ...DEFAULT_SAMPLE_POA_DATA,
      customClauses: [
        {
          id: 'p1',
          title: 'Sub-Registrar Representation',
          text: 'The Attorney is empowered to sign and admit execution before the Sub-Registrar.',
        },
      ],
    }

    const md = generatePoaMarkdown(dataWithClause)
    expect(md).toContain('GENERAL POWER OF ATTORNEY')
    expect(md).toContain('Powers of Attorney Act, 1882')
    expect(md).toContain('Suraj Lamp & Industries')
    expect(md).toContain('Devendra Chandrakant Patil')
    expect(md).toContain('Aditya Devendra Patil')
    expect(md).toContain('SUB-REGISTRAR REPRESENTATION')
    expect(md).toContain('[AI-Drafted Custom Clause — review before signing]')
    expect(md).toContain('WITNESSES TO EXECUTION')
  })

  it('builds valid docx buffer and pdf bytes for Power of Attorney', async () => {
    const docxBuffer = await buildPoaDocx(DEFAULT_SAMPLE_POA_DATA)
    expect(Buffer.isBuffer(docxBuffer)).toBe(true)
    expect(docxBuffer.length).toBeGreaterThan(1000)

    const pdfBytes = await buildPoaPdf(DEFAULT_SAMPLE_POA_DATA)
    expect(pdfBytes).toBeInstanceOf(Uint8Array)
    expect(pdfBytes.length).toBeGreaterThan(1000)
  })
})
