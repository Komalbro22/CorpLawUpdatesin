import {
  calculateDpt3NormalFilingFee,
  getDpt3TableBMultiplier,
  computeDpt3DatesAndDelay,
  calculateDpt3Rule21Penalty,
  evaluateDpt3Section76AExposure,
  evaluateDpt3AuditorCert,
  getDpt3DepositCeilings,
  calculateDpt3Compliance,
  RULE_2_1_C_EXCLUSIONS
} from '../lib/rule-engine/dpt3-engine'

describe('Form DPT-3 Statutory Determination Engine', () => {
  describe('1. Table A Normal Filing Fees (Items 5 & 6)', () => {
    it('returns ₹200 for company without share capital (Item 6)', () => {
      expect(calculateDpt3NormalFilingFee(0, false)).toBe(200)
      expect(calculateDpt3NormalFilingFee(10000000, false)).toBe(200)
    })

    it('returns ₹200 for nominal capital less than ₹1,00,000', () => {
      expect(calculateDpt3NormalFilingFee(0, true)).toBe(200)
      expect(calculateDpt3NormalFilingFee(50000, true)).toBe(200)
      expect(calculateDpt3NormalFilingFee(99999, true)).toBe(200)
    })

    it('returns ₹300 for nominal capital ₹1,00,000 to ₹4,99,999', () => {
      expect(calculateDpt3NormalFilingFee(100000, true)).toBe(300)
      expect(calculateDpt3NormalFilingFee(250000, true)).toBe(300)
      expect(calculateDpt3NormalFilingFee(499999, true)).toBe(300)
    })

    it('returns ₹400 for nominal capital ₹5,00,000 to ₹24,99,999', () => {
      expect(calculateDpt3NormalFilingFee(500000, true)).toBe(400)
      expect(calculateDpt3NormalFilingFee(1000000, true)).toBe(400)
      expect(calculateDpt3NormalFilingFee(2499999, true)).toBe(400)
    })

    it('returns ₹500 for nominal capital ₹25,00,000 to ₹99,99,999', () => {
      expect(calculateDpt3NormalFilingFee(2500000, true)).toBe(500)
      expect(calculateDpt3NormalFilingFee(5000000, true)).toBe(500)
      expect(calculateDpt3NormalFilingFee(9999999, true)).toBe(500)
    })

    it('returns ₹600 for nominal capital ₹1,00,00,000 or more (≥ ₹1 Crore)', () => {
      expect(calculateDpt3NormalFilingFee(10000000, true)).toBe(600)
      expect(calculateDpt3NormalFilingFee(50000000, true)).toBe(600)
      expect(calculateDpt3NormalFilingFee(1000000000, true)).toBe(600)
    })
  })

  describe('2. Table B Delay Multipliers (Not ₹100/day)', () => {
    it('returns 0× multiplier for 0 or negative delay', () => {
      const res0 = getDpt3TableBMultiplier(0)
      expect(res0.multiplier).toBe(0)
      expect(res0.slabIndex).toBe(-1)
      expect(res0.isMaxTier).toBe(false)

      const resNeg = getDpt3TableBMultiplier(-5)
      expect(resNeg.multiplier).toBe(0)
    })

    it('returns 2× multiplier for delay up to 30 days', () => {
      const day1 = getDpt3TableBMultiplier(1)
      expect(day1.multiplier).toBe(2)
      expect(day1.slabIndex).toBe(0)

      const day30 = getDpt3TableBMultiplier(30)
      expect(day30.multiplier).toBe(2)
      expect(day30.slabIndex).toBe(0)
      expect(day30.isMaxTier).toBe(false)
    })

    it('returns 4× multiplier for delay 31 to 60 days', () => {
      const day31 = getDpt3TableBMultiplier(31)
      expect(day31.multiplier).toBe(4)
      expect(day31.slabIndex).toBe(1)

      const day60 = getDpt3TableBMultiplier(60)
      expect(day60.multiplier).toBe(4)
      expect(day60.slabIndex).toBe(1)
    })

    it('returns 6× multiplier for delay 61 to 90 days', () => {
      const day61 = getDpt3TableBMultiplier(61)
      expect(day61.multiplier).toBe(6)
      expect(day61.slabIndex).toBe(2)

      const day90 = getDpt3TableBMultiplier(90)
      expect(day90.multiplier).toBe(6)
      expect(day90.slabIndex).toBe(2)
    })

    it('returns 10× multiplier for delay 91 to 180 days', () => {
      const day91 = getDpt3TableBMultiplier(91)
      expect(day91.multiplier).toBe(10)
      expect(day91.slabIndex).toBe(3)

      const day180 = getDpt3TableBMultiplier(180)
      expect(day180.multiplier).toBe(10)
      expect(day180.slabIndex).toBe(3)
    })

    it('returns 12× multiplier for delay more than 180 days', () => {
      const day181 = getDpt3TableBMultiplier(181)
      expect(day181.multiplier).toBe(12)
      expect(day181.slabIndex).toBe(4)
      expect(day181.isMaxTier).toBe(true)
      expect(day181.requiresSection403CondonationNotice).toBe(false)

      const day300 = getDpt3TableBMultiplier(300)
      expect(day300.multiplier).toBe(12)
      expect(day300.requiresSection403CondonationNotice).toBe(true)
    })
  })

  describe('3. Circular 02/2026 Fee Waiver & Date Arithmetic (FY 2025-26)', () => {
    it('sets statutory due date as 30 June', () => {
      const res = computeDpt3DatesAndDelay({
        financialYear: '2025-26',
        calcMode: 'date',
        filingDate: '2026-06-25'
      })
      expect(res.statutoryDueDate).toBe('2026-06-30')
      expect(res.waiverEndDate).toBe('2026-07-31')
      expect(res.effectiveDelayDays).toBe(0)
      expect(res.isWaivedUnderCircular).toBe(false)
    })

    it('applies fee waiver for filings between 1 July 2026 and 31 July 2026 (Circular 02/2026)', () => {
      const midJuly = computeDpt3DatesAndDelay({
        financialYear: '2025-26',
        calcMode: 'date',
        filingDate: '2026-07-15'
      })
      expect(midJuly.effectiveDelayDays).toBe(0)
      expect(midJuly.isWaivedUnderCircular).toBe(true)

      const lastDay = computeDpt3DatesAndDelay({
        financialYear: '2025-26',
        calcMode: 'date',
        filingDate: '2026-07-31'
      })
      expect(lastDay.effectiveDelayDays).toBe(0)
      expect(lastDay.isWaivedUnderCircular).toBe(true)
    })

    it('calculates delay from ORIGINAL due date (30 June) when filing on or after 1 August 2026', () => {
      // 1 August is 32 days from 30 June
      const aug1 = computeDpt3DatesAndDelay({
        financialYear: '2025-26',
        calcMode: 'date',
        filingDate: '2026-08-01'
      })
      expect(aug1.isWaivedUnderCircular).toBe(false)
      expect(aug1.effectiveDelayDays).toBe(32)

      // 20 August is 51 days from 30 June
      const aug20 = computeDpt3DatesAndDelay({
        financialYear: '2025-26',
        calcMode: 'date',
        filingDate: '2026-08-20'
      })
      expect(aug20.effectiveDelayDays).toBe(51)
    })

    it('computes standard delay for other FYs without circular 02/2026 waiver', () => {
      const fy2425 = computeDpt3DatesAndDelay({
        financialYear: '2024-25',
        calcMode: 'date',
        filingDate: '2025-07-15'
      })
      expect(fy2425.statutoryDueDate).toBe('2025-06-30')
      expect(fy2425.waiverEndDate).toBeNull()
      expect(fy2425.isWaivedUnderCircular).toBe(false)
      expect(fy2425.effectiveDelayDays).toBe(15)
    })

    it('supports direct delay days calculation mode', () => {
      const res = computeDpt3DatesAndDelay({
        financialYear: '2025-26',
        calcMode: 'days',
        directDelayDays: 45
      })
      expect(res.effectiveDelayDays).toBe(45)
      expect(res.actualFilingDateDisplay).toBe('+45 Calendar Days Delay')
    })
  })

  describe('4. Rule 21 Procedural Fine Engine', () => {
    it('returns ₹0 for zero delay', () => {
      const fine = calculateDpt3Rule21Penalty(0, 2)
      expect(fine.totalRule21Exposure).toBe(0)
    })

    it('calculates base fine + per officer fine + daily continuing fine', () => {
      // 10 days delay with 2 officers:
      // Co: 5,000 + Officers: 2 * 5,000 + Daily: 10 * 500 = 20,000
      const fine10 = calculateDpt3Rule21Penalty(10, 2)
      expect(fine10.companyBaseFine).toBe(5000)
      expect(fine10.officersBaseFine).toBe(10000)
      expect(fine10.continuingFineTotal).toBe(5000)
      expect(fine10.totalRule21Exposure).toBe(20000)

      // 51 days delay with 1 officer:
      // Co: 5,000 + Officer: 5,000 + Daily: 51 * 500 = 25,500 => Total: 35,500
      const fine51 = calculateDpt3Rule21Penalty(51, 1)
      expect(fine51.companyBaseFine).toBe(5000)
      expect(fine51.officersBaseFine).toBe(5000)
      expect(fine51.continuingFineTotal).toBe(25500)
      expect(fine51.totalRule21Exposure).toBe(35500)
    })
  })

  describe('5. Section 76A Substantive Penalties & Auditor Certificate Rules', () => {
    it('exempts non-deposit receipts from Section 76A', () => {
      const res = evaluateDpt3Section76AExposure('exempted', false)
      expect(res.isApplicable).toBe(false)
    })

    it('activates Section 76A for actual deposit returns', () => {
      const resDep = evaluateDpt3Section76AExposure('deposits', true)
      expect(resDep.isApplicable).toBe(true)
      expect(resDep.companyMinFine).toContain('1 Crore')

      const resBoth = evaluateDpt3Section76AExposure('both', true)
      expect(resBoth.isApplicable).toBe(true)
    })

    it('requires Auditor Certificate only for deposit returns', () => {
      expect(evaluateDpt3AuditorCert('deposits').isMandatory).toBe(true)
      expect(evaluateDpt3AuditorCert('both').isMandatory).toBe(true)
      expect(evaluateDpt3AuditorCert('exempted').isMandatory).toBe(false)
      expect(evaluateDpt3AuditorCert('nil').isMandatory).toBe(false)
      expect(evaluateDpt3AuditorCert('one_time_loan').isMandatory).toBe(false)
    })
  })

  describe('6. Deposit Ceilings (Sections 73 & 76)', () => {
    it('returns unlimited ceiling for DPIIT startups during first 10 years', () => {
      const startup = getDpt3DepositCeilings(true, true, false)
      expect(startup.companyType).toBe('private_startup_exempt')
      expect(startup.maxDepositPercentage).toBe(Infinity)
    })

    it('returns 100% ceiling for standard private companies', () => {
      const pvt = getDpt3DepositCeilings(true, false, false)
      expect(pvt.companyType).toBe('private_standard')
      expect(pvt.maxDepositPercentage).toBe(100)
    })

    it('identifies eligible public companies based on net worth / turnover', () => {
      const eligible = getDpt3DepositCeilings(false, false, false, 150, 600)
      expect(eligible.companyType).toBe('eligible_public')
      expect(eligible.maxDepositPercentage).toBe(35)

      const nonEligible = getDpt3DepositCeilings(false, false, false, 50, 100)
      expect(nonEligible.companyType).toBe('other_public')
      expect(nonEligible.maxDepositPercentage).toBe(35)
    })
  })

  describe('7. Master Compliance Orchestrator (calculateDpt3Compliance)', () => {
    it('computes exact challan and penalties for worked example scenario', () => {
      // Scenario: Private company, ₹10L capital, filed on 20 Aug 2026 for FY 2025-26
      const assessment = calculateDpt3Compliance({
        companyName: 'Test Tech Pvt Ltd',
        nominalCapital: 1000000,
        hasShareCapital: true,
        filingPurpose: 'exempted',
        financialYear: '2025-26',
        calcMode: 'date',
        filingDate: '2026-08-20',
        officerCount: 1
      })

      expect(assessment.mcaPortalPayable.normalFilingFee).toBe(400)
      expect(assessment.metadata.effectiveDelayDays).toBe(51)
      expect(assessment.mcaPortalPayable.tableBMultiplier).toBe(4)
      expect(assessment.mcaPortalPayable.additionalLateFee).toBe(1600) // 4 * 400
      expect(assessment.mcaPortalPayable.totalPortalPayable).toBe(2000) // 400 + 1600
      expect(assessment.rule21ProceduralFine.totalRule21Exposure).toBe(35500) // 5000 + 5000 + (51 * 500)
      expect(assessment.auditorCertificate.isMandatory).toBe(false)
      expect(assessment.section76ASubstantivePenalty.isApplicable).toBe(false)
    })

    it('handles Circular 02/2026 fee waiver window cleanly', () => {
      const assessment = calculateDpt3Compliance({
        nominalCapital: 5000000,
        hasShareCapital: true,
        filingPurpose: 'exempted',
        financialYear: '2025-26',
        calcMode: 'date',
        filingDate: '2026-07-20',
        officerCount: 2
      })

      expect(assessment.mcaPortalPayable.normalFilingFee).toBe(500)
      expect(assessment.metadata.isWaivedUnderCircular).toBe(true)
      expect(assessment.metadata.effectiveDelayDays).toBe(0)
      expect(assessment.mcaPortalPayable.tableBMultiplier).toBe(0)
      expect(assessment.mcaPortalPayable.additionalLateFee).toBe(0)
      expect(assessment.mcaPortalPayable.totalPortalPayable).toBe(500)
      expect(assessment.rule21ProceduralFine.totalRule21Exposure).toBe(0)
    })
  })

  describe('8. Rule 2(1)(c) Master Registry', () => {
    it('contains all 18 statutory excluded categories', () => {
      expect(RULE_2_1_C_EXCLUSIONS.length).toBe(18)
      const ids = RULE_2_1_C_EXCLUSIONS.map(c => c.id)
      for (let i = 1; i <= 18; i++) {
        expect(ids).toContain(i)
      }
    })
  })
})
