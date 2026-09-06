import {
  cleanPdfText,
  cleanTableData,
  renderDocumentHeader,
  renderSafeDisclaimer,
  renderPageFooters
} from '@/lib/pdf/pdfUtils'
import jsPDF from 'jspdf'
import { generateDpt3Pdf } from '@/lib/pdf/generateDpt3Pdf'
import { generateAdt1Pdf } from '@/lib/pdf/generateAdt1Pdf'
import { generateChg1Pdf } from '@/lib/pdf/generateChg1Pdf'
import { generateDir3KycPdf } from '@/lib/pdf/generateDir3KycPdf'
import { generateAoc4Pdf } from '@/lib/pdf/generateAoc4Pdf'
import { generateMgt7Pdf } from '@/lib/pdf/generateMgt7Pdf'
import { generateLlpPdf } from '@/lib/pdf/generateLlpPdf'
import { generateCompanyPdfBuffer, generateCinDecoderPdfBuffer } from '@/lib/pdf/generateCompanyPdf'
import { generateMsmePdf } from '@/lib/pdf/generateMsmePdf'

describe('PDF Layout, Encoding & Sanitization Suite', () => {
  describe('cleanPdfText utility', () => {
    test('converts Indian Rupee symbol ₹ to INR or Rs without double spacing', () => {
      expect(cleanPdfText('₹5,000')).toBe('INR 5,000')
      expect(cleanPdfText('₹ 5,000')).toBe('INR 5,000')
      expect(cleanPdfText('Fee: ₹100/day')).toBe('Fee: INR 100/day')
      expect(cleanPdfText('₹5,000', 'Rs')).toBe('Rs. 5,000')
    })

    test('converts dashes, hyphens, and math symbols to standard ASCII', () => {
      expect(cleanPdfText('FORM DPT-3 — STATUTORY RETURN')).toBe('FORM DPT-3 - STATUTORY RETURN')
      expect(cleanPdfText('Days 61–120 Window')).toBe('Days 61 - 120 Window')
      expect(cleanPdfText('3× Normal Fee')).toBe('3x Normal Fee')
      expect(cleanPdfText('Capital ≤ Rs 4.00 Cr and ≥ 10 Lakhs')).toBe('Capital <= Rs 4.00 Cr and >= 10 Lakhs')
      expect(cleanPdfText('“Quoted” and ‘Single’')).toBe('"Quoted" and \'Single\'')
      expect(cleanPdfText('✓ Compliant • Point 1')).toBe('[Y] Compliant - Point 1')
    })

    test('handles empty, null, and undefined strings gracefully', () => {
      expect(cleanPdfText('')).toBe('')
      expect(cleanPdfText(null)).toBe('')
      expect(cleanPdfText(undefined)).toBe('')
    })
  })

  describe('cleanTableData utility', () => {
    test('deeply sanitizes rows with raw strings, numbers, and styled cell objects', () => {
      const input = [
        ['Normal Fee', '₹ 600', 12345],
        [
          { content: 'Total — ₹1,200', styles: { fontStyle: 'bold' } },
          { content: '4× Multiplier', styles: {} },
          null
        ]
      ]

      const output = cleanTableData(input)
      expect(output[0][0]).toBe('Normal Fee')
      expect(output[0][1]).toBe('INR 600')
      expect(output[0][2]).toBe(12345)
      expect((output[1][0] as any).content).toBe('Total - INR 1,200')
      expect((output[1][1] as any).content).toBe('4x Multiplier')
      expect(output[1][2]).toBe('')
    })
  })

  describe('renderDocumentHeader utility', () => {
    test('renders without crashing and returns safe startY > 35', () => {
      const doc = new jsPDF()
      const startY = renderDocumentHeader(doc, {
        title: 'FORM DPT-3 — STATUTORY RETURN OF DEPOSITS & FEE ASSESSMENT MEMORANDUM',
        subtitle: 'Section 73 & Rule 16, Companies (Acceptance of Deposits) Rules, 2014',
        dateLabel: 'Assessment Date'
      })

      expect(startY).toBeGreaterThan(35)
      expect(startY).toBeLessThan(60)
    })
  })

  describe('renderSafeDisclaimer utility', () => {
    test('renders disclaimer without overflow and adds page when bottom budget exceeded', () => {
      const doc = new jsPDF()
      const longDisclaimer = 'STATUTORY NOTICE: '.repeat(20)
      
      // Starting near the bottom: should trigger a clean page break
      const finalY = renderSafeDisclaimer(doc, longDisclaimer, 280, { fontSize: 7 })
      expect((doc as any).internal.getNumberOfPages()).toBe(2)
      expect(finalY).toBeGreaterThan(15)
    })
  })

  describe('Form PDF Generators Execution', () => {
    test('generateDpt3Pdf generates valid PDF with clean strings', () => {
      const doc = generateDpt3Pdf({
        companyName: 'Acme Technologies Private Limited',
        nominalCapital: 10000000,
        hasShareCapital: true,
        filingPurpose: 'both',
        selectedFY: '2025-26',
        statutoryDueDate: '30-Jun-2026',
        waiverEndDate: '31-Jul-2026',
        actualFilingDate: '15-Aug-2026',
        calculatedDelayDays: 46,
        normalFee: 600,
        multiplier: 6,
        additionalFee: 3600,
        totalFee: 4200,
        rule21Penalty: 33000,
        officersCount: 2,
        isAuditorCertRequired: true
      })

      expect((doc as any).internal.getNumberOfPages()).toBeGreaterThanOrEqual(1)
      const pdfString = doc.output()
      expect(pdfString).toContain('%PDF')
      expect(pdfString).not.toContain('â‚¹')
    })

    test('generateAdt1Pdf generates valid PDF without throwing', () => {
      const doc = generateAdt1Pdf({
        companyName: 'Apex Industrial Corp Ltd',
        nominalCapital: 25000000,
        hasShareCapital: true,
        appointmentType: 'agm',
        calcMode: 'date',
        meetingDate: '30-Sep-2026',
        statutoryDueDate: '15-Oct-2026',
        actualFilingDate: '25-Oct-2026',
        calculatedDelayDays: 10,
        normalFee: 600,
        multiplier: 1,
        additionalFee: 600,
        totalFee: 1200,
        isCondonation: false
      })

      expect((doc as any).internal.getNumberOfPages()).toBeGreaterThanOrEqual(1)
      expect(doc.output()).toContain('%PDF')
    })

    test('generateDir3KycPdf generates valid PDF without throwing', () => {
      const doc = generateDir3KycPdf({
        directorName: 'Rajesh Kumar',
        dinNumber: '01234567',
        dinStatus: 'active',
        filingType: 'routine',
        anchorFy: 'FY 2024-25',
        nextDueWindow: 'April - 30 June 2028',
        nextDueDate: '30 June 2028',
        isDueThisYear: false,
        totalFee: 0,
        cascadingRiskLevel: 'LOW',
        companyFilingBlocked: false
      })

      expect((doc as any).internal.getNumberOfPages()).toBeGreaterThanOrEqual(1)
      expect(doc.output()).toContain('%PDF')
    })

    test('generateAoc4Pdf generates valid PDF with Section 446B relief', () => {
      const mockResult: any = {
        metadata: {
          formCode: 'AOC-4',
          formName: 'Form for filing financial statement and other documents with the Registrar',
          financialYear: '2025-26',
          companyClassification: 'Small Company',
          isSmallCompany: true,
          hasShareCapital: true,
          nominalCapital: 1000000,
          agmType: 'subsequent',
          agmStatus: 'held',
          statutoryDueDate: '29-Oct-2026',
          actualFilingDate: '15-Nov-2026',
          daysDelayed: 17,
          continuingDaysAfterFirst: 16,
          section446BEligible: true
        },
        smallCompanyAssessment: {
          isSmallCompany: true,
          thresholdApplied: { notificationReference: 'Sec 2(85)' }
        },
        cashFlowExemption: { isExempt: true, note: 'Small company exempt' },
        xbrlAssessment: { mustFileXbrl: false, reason: 'Exempt' },
        mcaPortalPayable: {
          basisNormalFee: 'Table A Item 5',
          normalFilingFee: 300,
          basisAdditionalFee: 'INR 100 per day delay',
          additionalFilingFee: 1700,
          totalPortalPayable: 2000
        },
        statutoryPenaltyExposure: {
          companyStandardExposure: 11600,
          officersStandardExposure: 11600,
          totalStandardExposure: 23200,
          reliefCeilingExplanation: '50% relief applied under Section 446B',
          totalIndicativeMaximumExposure: 11600
        }
      }

      const doc = generateAoc4Pdf(mockResult, 'Sample Co Pvt Ltd')
      expect((doc as any).internal.getNumberOfPages()).toBeGreaterThanOrEqual(1)
      expect(doc.output()).toContain('%PDF')
    })

    test('generateMgt7Pdf generates valid PDF', () => {
      const mockResult: any = {
        metadata: {
          formCode: 'MGT-7',
          formName: 'Annual Return',
          financialYear: '2025-26',
          companyClassification: 'Standard Company',
          isSmallCompany: false,
          hasShareCapital: true,
          nominalCapital: 5000000,
          agmType: 'subsequent',
          agmStatus: 'held',
          statutoryDueDate: '29-Nov-2026',
          actualFilingDate: '29-Nov-2026',
          daysDelayed: 0,
          continuingDaysAfterFirst: 0,
          section446BEligible: false
        },
        smallCompanyAssessment: {
          isSmallCompany: false,
          thresholdApplied: { notificationReference: 'Sec 2(85)' }
        },
        pcsCertification: { pcsCertificationRequired: false, basisExplanation: 'Standard' },
        mcaPortalPayable: {
          basisNormalFee: 'Table A Item 5',
          normalFilingFee: 400,
          basisAdditionalFee: '0 delay',
          additionalFilingFee: 0,
          totalPortalPayable: 400
        },
        statutoryPenaltyExposure: {
          companyStandardExposure: 0,
          officersStandardExposure: 0,
          totalStandardExposure: 0,
          reliefCeilingExplanation: 'None',
          totalIndicativeMaximumExposure: 0
        }
      }

      const doc = generateMgt7Pdf(mockResult, 'Global Ventures Ltd')
      expect((doc as any).internal.getNumberOfPages()).toBeGreaterThanOrEqual(1)
      expect(doc.output()).toContain('%PDF')
    })

    test('generateCompanyPdfBuffer and generateCinDecoderPdfBuffer produce valid buffers', () => {
      const mockCompany: any = {
        cin: 'U72200MH2020PTC123456',
        company_name: 'GLOBAL SOFTWARE TECHNOLOGIES AND CONSULTING SOLUTIONS PRIVATE LIMITED',
        company_status: 'Active',
        date_of_registration: '2020-01-01',
        company_class: 'Private',
        authorised_capital: 1000000,
        paid_up_capital: 500000,
        directors: [],
        charges: []
      }

      const buf1 = generateCompanyPdfBuffer(mockCompany, [])
      expect(Buffer.isBuffer(buf1)).toBe(true)
      expect(buf1.length).toBeGreaterThan(1000)

      const mockBreakdown: any = {
        cin: 'U72200MH2020PTC123456',
        listingStatus: { code: 'U', label: 'Unlisted', description: 'Unlisted company' },
        nicCode: { code: '72200', sectorGroup: 'IT', industry: 'Software' },
        state: { code: 'MH', name: 'Maharashtra', rocOffice: 'Mumbai' },
        incorporationYear: 2020,
        companyType: { code: 'PTC', label: 'Private Limited', description: 'Private company' },
        registrationNumber: '123456'
      }

      const buf2 = generateCinDecoderPdfBuffer(mockBreakdown)
      expect(Buffer.isBuffer(buf2)).toBe(true)
      expect(buf2.length).toBeGreaterThan(1000)
    })
  })
})
