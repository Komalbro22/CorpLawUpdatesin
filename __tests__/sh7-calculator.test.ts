import {
  calculateSh7Compliance,
  calculateIncrementalCapitalFee,
  calculateCapitalIncreaseLateFee,
  calculateSh7BaseFee,
  calculateSh7LateMultiplier,
  calculateEstimatedStampDuty
} from '@/lib/rule-engine/sh7-engine'
import { getOtherCompanyIncorporationFee } from '@/lib/fee-calculator-core'
import { calculateMCAFee } from '@/lib/calculatorUtils'

describe('Form SH-7 Statutory Compliance & Fee Engine', () => {
  describe('1. Table of Fees Item II — Registration Fee Scale', () => {
    test('Boundary: Capital <= ₹1,00,000 is flat ₹5,000', () => {
      expect(getOtherCompanyIncorporationFee(100000, false)).toBe(5000)
      expect(getOtherCompanyIncorporationFee(50000, false)).toBe(5000)
    })

    test('Boundary: Capital ₹5,00,000 is ₹21,000', () => {
      // 5,000 + 40 blocks of ₹10,000 @ ₹400 = 5,000 + 16,000 = 21,000
      expect(getOtherCompanyIncorporationFee(500000, false)).toBe(21000)
    })

    test('Boundary: Capital ₹10,00,000 is ₹36,000', () => {
      // 21,000 + 50 blocks of ₹10,000 @ ₹300 = 21,000 + 15,000 = 36,000
      expect(getOtherCompanyIncorporationFee(1000000, false)).toBe(36000)
    })

    test('Boundary: Capital ₹20,00,000 is ₹66,000', () => {
      // 21,000 + 150 blocks of ₹10,000 @ ₹300 = 21,000 + 45,000 = 66,000
      expect(getOtherCompanyIncorporationFee(2000000, false)).toBe(66000)
    })

    test('Boundary: Capital ₹50,00,000 is ₹1,56,000', () => {
      // 21,000 + 450 blocks of ₹10,000 @ ₹300 = 21,000 + 1,35,000 = 1,56,000
      expect(getOtherCompanyIncorporationFee(5000000, false)).toBe(156000)
    })

    test('Boundary: Capital ₹60,00,000 is ₹1,66,000', () => {
      // 1,56,000 + 100 blocks of ₹10,000 @ ₹100 = 1,56,000 + 10,000 = 1,66,000
      expect(getOtherCompanyIncorporationFee(6000000, false)).toBe(166000)
    })

    test('Boundary: Capital ₹1,00,00,000 (₹1 Crore) is ₹2,06,000', () => {
      // 1,56,000 + 500 blocks of ₹10,000 @ ₹100 = 1,56,000 + 50,000 = 2,06,000
      expect(getOtherCompanyIncorporationFee(10000000, false)).toBe(206000)
    })

    test('Differential calculation between ₹10 Lakhs and ₹50 Lakhs is ₹1,20,000', () => {
      expect(calculateIncrementalCapitalFee(1000000, 5000000)).toBe(120000)
    })

    test('Differential calculation between ₹10 Lakhs and ₹1 Crore is ₹1,70,000', () => {
      expect(calculateIncrementalCapitalFee(1000000, 10000000)).toBe(170000)
    })

    test('Differential calculation between ₹20 Lakhs and ₹60 Lakhs is ₹1,00,000', () => {
      expect(calculateIncrementalCapitalFee(2000000, 6000000)).toBe(100000)
    })
  })

  describe('2. Test Case A: ₹10L to ₹50L (Delhi, Timely Filing)', () => {
    test('Matches exact statutory arithmetic for on-time capital hike in Delhi', () => {
      const result = calculateSh7Compliance({
        alterationType: 'increase_authorised_capital',
        companyType: 'normal',
        state: 'delhi',
        existingAuthorisedCapital: 1000000,
        newAuthorisedCapital: 5000000,
        resolutionDate: '2026-03-01',
        filingDate: '2026-03-20', // within 30 days
        numOfficersInDefault: 2,
        requiresAoaAmendment: false
      })

      expect(result.delayDays).toBe(0)
      expect(result.isDelayed).toBe(false)
      expect(result.incrementalCapitalRegistrationFee).toBe(120000)
      expect(result.normalFee).toBe(0) // Replaced by differential fee
      expect(result.additionalLateFee).toBe(0)
      expect(result.estimatedStampDuty).toBe(6000) // 0.15% on ₹40L
      expect(result.totalMcaChallanFee).toBe(126000)
      expect(result.companyPenalty).toBe(0)
      expect(result.totalOfficersPenalty).toBe(0)
      expect(result.totalAdjudicationPenalty).toBe(0)
      expect(result.totalFinancialExposure).toBe(126000)
    })
  })

  describe('3. Test Case B: ₹10L to ₹1 Cr (Maharashtra, 15d Delay, 2 Officers)', () => {
    test('Matches exact statutory arithmetic for 15-day delay in Maharashtra', () => {
      const result = calculateSh7Compliance({
        alterationType: 'increase_authorised_capital',
        companyType: 'normal',
        state: 'maharashtra',
        existingAuthorisedCapital: 1000000,
        newAuthorisedCapital: 10000000,
        resolutionDate: '2026-01-01',
        filingDate: '2026-02-15', // Due Jan 31; delay = 15 days
        numOfficersInDefault: 2,
        requiresAoaAmendment: false
      })

      expect(result.delayDays).toBe(15)
      expect(result.isDelayed).toBe(true)
      expect(result.incrementalCapitalRegistrationFee).toBe(170000) // ₹2,06,000 - ₹36,000
      expect(result.delayMonths).toBe(1)
      expect(result.lateFeePercentage).toBe(0.025) // 1 month @ 2.5%
      expect(result.additionalLateFee).toBe(4250) // 2.5% of ₹1,70,000
      expect(result.estimatedStampDuty).toBe(18000) // 18 slabs of ₹5L × ₹1,000
      expect(result.totalMcaChallanFee).toBe(192250) // 1,70,000 + 4,250 + 18,000

      // Section 64(2) Adjudication Exposure
      expect(result.dailyPenaltyRate).toBe(500)
      expect(result.companyPenalty).toBe(7500) // 15 × 500
      expect(result.perOfficerPenalty).toBe(7500) // 15 × 500
      expect(result.totalOfficersPenalty).toBe(15000) // 2 × 7,500
      expect(result.totalAdjudicationPenalty).toBe(22500) // 7,500 + 15,000

      expect(result.totalFinancialExposure).toBe(214750) // 1,92,250 + 22,500
    })
  })

  describe('4. Test Case C: Small Company ₹20L to ₹60L (Karnataka, 45d Delay, Sec 446B)', () => {
    test('Matches exact statutory arithmetic for Small Company with Section 446B relief', () => {
      const result = calculateSh7Compliance({
        alterationType: 'increase_authorised_capital',
        companyType: 'small_company',
        state: 'karnataka',
        existingAuthorisedCapital: 2000000,
        newAuthorisedCapital: 6000000,
        resolutionDate: '2026-01-01',
        filingDate: '2026-03-17', // Due Jan 31; delay = 45 days
        numOfficersInDefault: 2,
        requiresAoaAmendment: false
      })

      expect(result.delayDays).toBe(45)
      expect(result.isDelayed).toBe(true)
      expect(result.incrementalCapitalRegistrationFee).toBe(100000) // ₹1,66,000 - ₹66,000
      expect(result.delayMonths).toBe(2)
      expect(result.lateFeePercentage).toBe(0.05) // 2 months @ 2.5% = 5%
      expect(result.additionalLateFee).toBe(5000) // 5% of ₹1,00,000
      expect(result.estimatedStampDuty).toBe(8000) // 8 slabs of ₹5L × ₹1,000
      expect(result.totalMcaChallanFee).toBe(113000) // 1,00,000 + 5,000 + 8,000

      // Section 446B Adjudication Exposure (50% Concession)
      expect(result.section446BApplied).toBe(true)
      expect(result.dailyPenaltyRate).toBe(250) // 50% of ₹500
      expect(result.companyPenaltyCap).toBe(200000)
      expect(result.officerPenaltyCap).toBe(50000) // 50% of ₹1,00,000 cap
      expect(result.companyPenalty).toBe(11250) // 45 × 250
      expect(result.perOfficerPenalty).toBe(11250) // 45 × 250
      expect(result.totalOfficersPenalty).toBe(22500) // 2 × 11,250
      expect(result.totalAdjudicationPenalty).toBe(33750) // 11,250 + 22,500
      expect(result.savingsFrom446B).toBe(33750) // Standard 67,500 - 33,750

      expect(result.totalFinancialExposure).toBe(146750) // 1,13,000 + 33,750
    })
  })

  describe('5. Test Case D: Extended Default (425 Days, 3 Officers)', () => {
    test('Tests company cap (₹5L) and officer individual cap (₹1L) under Section 64(2)', () => {
      const result = calculateSh7Compliance({
        alterationType: 'increase_authorised_capital',
        companyType: 'normal',
        state: 'delhi',
        existingAuthorisedCapital: 1000000,
        newAuthorisedCapital: 5000000,
        resolutionDate: '2024-01-01',
        filingDate: '2025-03-31', // 425 days delay
        numOfficersInDefault: 3,
        requiresAoaAmendment: false
      })

      expect(result.delayDays).toBe(425)
      // Raw company penalty: 425 × ₹500 = ₹2,12,500 (does not reach ₹5,00,000 cap)
      expect(result.companyPenalty).toBe(212500)
      // Raw officer penalty: 425 × ₹500 = ₹2,12,500 -> hits ₹1,00,000 cap!
      expect(result.perOfficerPenalty).toBe(100000)
      expect(result.totalOfficersPenalty).toBe(300000) // 3 × 1,00,000
      expect(result.totalAdjudicationPenalty).toBe(512500) // 2,12,500 + 3,00,000
    })
  })

  describe('6. Test Case E: Stock Split / Sub-division (On-time, ₹50L Capital)', () => {
    test('Non-capital alteration incurs zero incremental capital fee and Table A normal fee', () => {
      const result = calculateSh7Compliance({
        alterationType: 'sub_division',
        companyType: 'normal',
        state: 'maharashtra',
        existingAuthorisedCapital: 5000000,
        newAuthorisedCapital: 5000000,
        resolutionDate: '2026-03-01',
        filingDate: '2026-03-20',
        numOfficersInDefault: 2,
        requiresAoaAmendment: false
      })

      expect(result.delayDays).toBe(0)
      expect(result.incrementalCapitalRegistrationFee).toBe(0)
      expect(result.normalFee).toBe(500) // Table A for ₹50L capital
      expect(result.additionalLateFee).toBe(0)
      expect(result.estimatedStampDuty).toBe(0)
      expect(result.totalMcaChallanFee).toBe(500)
      expect(result.totalAdjudicationPenalty).toBe(0)
      expect(result.totalFinancialExposure).toBe(500)
    })

    test('Non-capital alteration with delay uses Table B multipliers (2× to 12×)', () => {
      const result = calculateSh7Compliance({
        alterationType: 'sub_division',
        companyType: 'normal',
        state: 'maharashtra',
        existingAuthorisedCapital: 5000000,
        newAuthorisedCapital: 5000000,
        resolutionDate: '2026-01-01',
        filingDate: '2026-03-17', // 45 days delay -> 31-60 days slab = 4×
        numOfficersInDefault: 2,
        requiresAoaAmendment: false
      })

      expect(result.delayDays).toBe(45)
      expect(result.normalFee).toBe(500)
      expect(result.lateMultiplier).toBe(4)
      expect(result.additionalLateFee).toBe(2000) // 4 × 500
      expect(result.totalMcaChallanFee).toBe(2500) // 500 + 2000
    })
  })

  describe('7. MGT-14 Prerequisite Conditionality', () => {
    test('When AOA already authorizes alteration, Ordinary Resolution under Sec 61(1) does not breach MGT-14', () => {
      const result = calculateSh7Compliance({
        alterationType: 'increase_authorised_capital',
        companyType: 'normal',
        existingAuthorisedCapital: 1000000,
        newAuthorisedCapital: 5000000,
        resolutionDate: '2026-03-01',
        filingDate: '2026-03-20',
        requiresAoaAmendment: false,
        mgt14Filed: false // Not filed, but not required!
      })

      expect(result.criticalBreaches.length).toBe(0)
      expect(result.passedChecks.some(c => c.includes('does not require filing Form MGT-14'))).toBe(true)
    })

    test('When AOA amendment is required, Special Resolution under Sec 14 mandates Form MGT-14', () => {
      const result = calculateSh7Compliance({
        alterationType: 'increase_authorised_capital',
        companyType: 'normal',
        existingAuthorisedCapital: 1000000,
        newAuthorisedCapital: 5000000,
        resolutionDate: '2026-03-01',
        filingDate: '2026-03-20',
        requiresAoaAmendment: true,
        mgt14Filed: false
      })

      expect(result.criticalBreaches.some(b => b.includes('Form MGT-14 has not been filed'))).toBe(true)
    })
  })

  describe('8. calculateMCAFee in calculatorUtils integration', () => {
    test('calculateMCAFee returns identical differential and stamp duty for SH-7', () => {
      const res = calculateMCAFee({
        formSlug: 'sh-7',
        companyType: 'normal',
        capital: 1000000,
        newCapital: 5000000,
        delayDays: 0,
        state: 'delhi'
      })

      expect(res.baseFee).toBe(120000)
      expect(res.lateFee).toBe(0)
      expect(res.stampDuty).toBe(6000)
      expect(res.total).toBe(126000)
    })
  })
})
