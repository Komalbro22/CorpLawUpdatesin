import {
  generateEmploymentAgreementMarkdown,
  buildEmploymentAgreementDocx,
  buildEmploymentAgreementPdf,
  checkWageFiftyPercentRule,
  formatInr,
  numberToWordsInr,
  STATE_STAMP_SCHEDULE,
  DEFAULT_SAMPLE_EMPLOYMENT_DATA,
  EmploymentAgreementFormData,
} from '@/lib/doc-generator/employment-agreement-generator'

describe('Employment Agreement Generator & Statutory Compliance', () => {
  test('generates complete markdown for standard permanent employee', () => {
    const data: EmploymentAgreementFormData = {
      ...DEFAULT_SAMPLE_EMPLOYMENT_DATA,
      employeeName: 'Amit Sharma',
      designation: 'Lead Software Architect',
      annualCtc: 2400000,
      monthlyGross: 200000,
      salaryStructure: {
        basicMonthly: 100000,
        hraMonthly: 50000,
        specialAllowanceMonthly: 50000,
        pfEmployerMonthly: 12000,
        statutoryBonusMonthly: 0,
        otherAllowancesMonthly: 0,
        grossMonthly: 200000,
        annualCtc: 2544000,
      },
    }

    const md = generateEmploymentAgreementMarkdown(data)

    expect(md).toContain('# EMPLOYMENT AGREEMENT')
    expect(md).toContain('Amit Sharma')
    expect(md).toContain('Lead Software Architect')
    expect(md).toContain('Apex Infotech Solutions Private Limited')
    expect(md).toContain('Section 17(c) of the Copyright Act, 1957')
    expect(md).toContain('Section 27 of the Indian Contract Act, 1872')
    expect(md).toContain('Occupational Safety, Health and Working Conditions Code, 2020')
    expect(md).toContain('ANNEXURE A: ITEMISED SALARY STRUCTURE')
    expect(md).toContain('ANNEXURE B: KEY RESULT AREAS')
    expect(md).toContain('ANNEXURE C: COMPANY ASSET & DEVICE HANDOVER')
  })

  test('generates fixed-term employment clauses under IR Code 2020 and Social Security Code', () => {
    const data: EmploymentAgreementFormData = {
      ...DEFAULT_SAMPLE_EMPLOYMENT_DATA,
      presetType: 'fixed_term',
      isFixedTerm: true,
      fixedTermDurationMonths: 24,
      fixedTermEndDate: '2028-10-01',
    }

    const md = generateEmploymentAgreementMarkdown(data)

    expect(md).toContain('FIXED-TERM EMPLOYMENT (STATUTORY PARITY & EXPIRY)')
    expect(md).toContain('Section 2(o) of the Industrial Relations Code, 2020')
    expect(md).toContain('Section 53 of the Code on Social Security, 2020')
    expect(md).toContain('pro-rata gratuity')
    expect(md).toContain('constitute retrenchment')
  })

  test('generates specialized remote work and DPDP Act provisions', () => {
    const data: EmploymentAgreementFormData = {
      ...DEFAULT_SAMPLE_EMPLOYMENT_DATA,
      workMode: 'fully_remote',
    }

    const md = generateEmploymentAgreementMarkdown(data)

    expect(md).toContain('Remote Working Arrangement')
    expect(md).toContain('Digital Personal Data Protection Act, 2023 (DPDP Act)')
    expect(md).toContain('home workstation')
  })

  test('validates Section 74 training bond recovery limits', () => {
    const data: EmploymentAgreementFormData = {
      ...DEFAULT_SAMPLE_EMPLOYMENT_DATA,
      hasTrainingBond: true,
      bondDurationMonths: 18,
      trainingCostAmount: 150000,
      trainingSpecialityDescription: 'Advanced Machine Learning Pipeline Certification',
    }

    const md = generateEmploymentAgreementMarkdown(data)

    expect(md).toContain('SPECIALIZED TRAINING COMMITMENT & RECOVERY OF COSTS (SECTION 74)')
    expect(md).toContain('Section 74 of the Indian Contract Act, 1872')
    expect(md).toContain('Sicpa India Ltd. v. Manas Pratim Deb')
    expect(md).toContain('under no circumstances shall the Company retain original educational certificates')
  })

  test('verifies Code on Wages 2019 "50% rule" calculations', () => {
    const compliant = checkWageFiftyPercentRule({
      basicMonthly: 60000,
      hraMonthly: 20000,
      specialAllowanceMonthly: 20000,
      pfEmployerMonthly: 7200,
      statutoryBonusMonthly: 0,
      otherAllowancesMonthly: 0,
      grossMonthly: 100000,
      annualCtc: 1200000,
    })
    expect(compliant.isCompliant).toBe(true)
    expect(compliant.basicPercentage).toBe(60)

    const nonCompliant = checkWageFiftyPercentRule({
      basicMonthly: 30000,
      hraMonthly: 30000,
      specialAllowanceMonthly: 40000,
      pfEmployerMonthly: 3600,
      statutoryBonusMonthly: 0,
      otherAllowancesMonthly: 0,
      grossMonthly: 100000,
      annualCtc: 1200000,
    })
    expect(nonCompliant.isCompliant).toBe(false)
    expect(nonCompliant.basicPercentage).toBe(30)
    expect(nonCompliant.recommendedBasic).toBe(50000)
    expect(nonCompliant.message).toContain('Statutory Warning under Code on Wages, 2019')
  })

  test('validates state stamp duty lookup schedule', () => {
    expect(STATE_STAMP_SCHEDULE.maharashtra.stampDutyAmount).toBe(500)
    expect(STATE_STAMP_SCHEDULE.maharashtra.articleRef).toContain('Article 5(h)(B)')

    expect(STATE_STAMP_SCHEDULE.delhi.stampDutyAmount).toBe(100)
    expect(STATE_STAMP_SCHEDULE.delhi.articleRef).toContain('Article 5(c)')

    expect(STATE_STAMP_SCHEDULE.karnataka.stampDutyAmount).toBe(200)
    expect(STATE_STAMP_SCHEDULE.karnataka.articleRef).toContain('Article 5(j)')
  })

  test('formats numbers to Indian words accurately', () => {
    expect(numberToWordsInr(1200000)).toBe('Twelve Lakh Rupees Only')
    expect(numberToWordsInr(50000)).toBe('Fifty Thousand Rupees Only')
    expect(numberToWordsInr(15000000)).toBe('One Crore Fifty Lakh Rupees Only')
    expect(formatInr(1200000)).toBe('₹12,00,000')
  })

  test('builds valid Microsoft Word (.docx) binary buffer and valid XML', async () => {
    const buffer = await buildEmploymentAgreementDocx(DEFAULT_SAMPLE_EMPLOYMENT_DATA)
    expect(buffer).toBeInstanceOf(Buffer)
    expect(buffer.length).toBeGreaterThan(5000)

    // Unzip and verify document.xml has dxa tables, not percentage
    const JSZip = require('jszip')
    const zip = await JSZip.loadAsync(buffer)
    const xml = await zip.file('word/document.xml').async('text')
    expect(xml).toContain('w:type="dxa"')
    expect(xml).not.toContain('w:type="pct"')
  })

  test('builds valid PDF binary document with %PDF header', async () => {
    const pdfBytes = await buildEmploymentAgreementPdf(DEFAULT_SAMPLE_EMPLOYMENT_DATA)
    expect(pdfBytes).toBeInstanceOf(Uint8Array)
    expect(pdfBytes.length).toBeGreaterThan(1000)

    // Check PDF magic header "%PDF"
    const header = String.fromCharCode(...pdfBytes.slice(0, 4))
    expect(header).toBe('%PDF')
  })
})
