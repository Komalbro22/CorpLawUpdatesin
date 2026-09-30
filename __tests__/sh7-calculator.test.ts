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

    test('Differential calculation between ₹20 Lakhs and ₹60 Lakhs for normal company is ₹1,00,000', () => {
      expect(calculateIncrementalCapitalFee(2000000, 6000000, 'normal')).toBe(100000)
    })

    test('MCA SH-7 Instruction Kit Example: OPC ₹10L to ₹60L is ₹1,64,000', () => {
      // Normal fee on ₹60L = ₹1,66,000 less OPC fee on ₹10L = ₹2,000 -> ₹1,64,000
      expect(calculateIncrementalCapitalFee(1000000, 6000000, 'opc')).toBe(164000)
    })

    test('Small Company ₹20L to ₹60L differential is ₹1,44,000', () => {
      // Normal fee on ₹60L = ₹1,66,000 less Small Co fee on ₹20L = ₹22,000 -> ₹1,44,000
      expect(calculateIncrementalCapitalFee(2000000, 6000000, 'small_company')).toBe(144000)
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
      expect(result.incrementalCapitalRegistrationFee).toBe(144000) // ₹1,66,000 (normal) - ₹22,000 (Small Co)
      expect(result.delayMonths).toBe(2)
      expect(result.lateFeePercentage).toBe(0.05) // 2 months @ 2.5% = 5%
      expect(result.additionalLateFee).toBe(7200) // 5% of ₹1,44,000
      expect(result.estimatedStampDuty).toBe(20000) // Karnataka: 4 blocks of ₹10L × ₹5,000 (Annexure A)
      expect(result.totalMcaChallanFee).toBe(171200) // 1,44,000 + 7,200 + 20,000

      // Section 446B Adjudication Exposure (50% Concession)
      expect(result.section446BApplied).toBe(true)
      expect(result.dailyPenaltyRate).toBe(250) // 50% of ₹500
      expect(result.companyPenaltyCap).toBe(200000)
      expect(result.officerPenaltyCap).toBe(100000) // Statutory ceiling under Section 446B
      expect(result.companyPenalty).toBe(11250) // 45 × 250
      expect(result.perOfficerPenalty).toBe(11250) // 45 × 250
      expect(result.totalOfficersPenalty).toBe(22500) // 2 × 11,250
      expect(result.totalAdjudicationPenalty).toBe(33750) // 11,250 + 22,500

      expect(result.totalFinancialExposure).toBe(204950) // 1,71,200 + 33,750
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

  describe('8. Table 7 Uniform Base Fee for Non-Capital Alterations', () => {
    test('Table 7 applies uniformly across Small Company, OPC, and Normal Company', () => {
      // Small Company with ₹50L capital doing sub-division gets ₹500 under Table 7 (not ₹200)
      expect(calculateSh7BaseFee(5000000, 'small_company').normalFee).toBe(500)
      expect(calculateSh7BaseFee(5000000, 'opc').normalFee).toBe(500)
      expect(calculateSh7BaseFee(5000000, 'normal').normalFee).toBe(500)

      // Boundaries under Table 7:
      expect(calculateSh7BaseFee(50000).normalFee).toBe(200) // < ₹1L
      expect(calculateSh7BaseFee(200000).normalFee).toBe(300) // ₹1L to < ₹5L
      expect(calculateSh7BaseFee(1000000).normalFee).toBe(400) // ₹5L to < ₹25L
      expect(calculateSh7BaseFee(5000000).normalFee).toBe(500) // ₹25L to < ₹1Cr
      expect(calculateSh7BaseFee(10000000).normalFee).toBe(600) // >= ₹1Cr
    })
  })

  describe('9. Annexure A State Stamp Duties', () => {
    test('Karnataka: ₹5,000 per ₹10,00,000 or part thereof, max ₹1 Crore', () => {
      expect(calculateEstimatedStampDuty('karnataka', 4000000)).toBe(20000) // 4 blocks × ₹5k
      expect(calculateEstimatedStampDuty('karnataka', 1000000)).toBe(5000)
      expect(calculateEstimatedStampDuty('karnataka', 2500000000)).toBe(10000000) // Capped at ₹1 Crore
    })

    test('Maharashtra: ₹1,000 per ₹5,00,000 or part thereof, max ₹50 Lakhs', () => {
      expect(calculateEstimatedStampDuty('maharashtra', 9000000)).toBe(18000) // 18 blocks × ₹1k
      expect(calculateEstimatedStampDuty('maharashtra', 3000000000)).toBe(5000000) // Capped at ₹50 Lakhs
    })

    test('Delhi: 0.15% on incremental capital, max ₹25 Lakhs', () => {
      expect(calculateEstimatedStampDuty('delhi', 4000000)).toBe(6000) // 0.15% on ₹40L
      expect(calculateEstimatedStampDuty('delhi', 2000000000)).toBe(2500000) // Capped at ₹25 Lakhs
    })

    test('Tamil Nadu: ₹500 per ₹10,00,000 or part thereof, max ₹5 Lakhs', () => {
      expect(calculateEstimatedStampDuty('tamil_nadu', 4000000)).toBe(2000) // 4 blocks × ₹500
      expect(calculateEstimatedStampDuty('tamil_nadu', 2000000000)).toBe(500000) // Capped at ₹5 Lakhs
    })

    test('Gujarat: 0.5% on incremental capital, max ₹5 Lakhs', () => {
      expect(calculateEstimatedStampDuty('gujarat', 2000000)).toBe(10000) // 0.5% of ₹20L
      expect(calculateEstimatedStampDuty('gujarat', 200000000)).toBe(500000) // Capped at ₹5 Lakhs
    })

    test('Telangana & Andhra Pradesh: 0.15%, min ₹1,000, max ₹5 Lakhs', () => {
      expect(calculateEstimatedStampDuty('telangana', 500000)).toBe(1000) // min ₹1,000
      expect(calculateEstimatedStampDuty('telangana', 4000000)).toBe(6000) // 0.15% of ₹40L
      expect(calculateEstimatedStampDuty('andhra_pradesh', 500000)).toBe(1000)
    })

    test('Rajasthan: 0.2%, max ₹25 Lakhs', () => {
      expect(calculateEstimatedStampDuty('rajasthan', 10000000)).toBe(20000) // 0.2% of ₹1Cr
    })

    test('Uttar Pradesh, West Bengal, Kerala, Haryana: NIL via MCA portal', () => {
      expect(calculateEstimatedStampDuty('uttar_pradesh', 4000000)).toBe(0)
      expect(calculateEstimatedStampDuty('west_bengal', 4000000)).toBe(0)
      expect(calculateEstimatedStampDuty('kerala', 4000000)).toBe(0)
      expect(calculateEstimatedStampDuty('haryana', 4000000)).toBe(0)
      expect(calculateEstimatedStampDuty('other', 4000000)).toBe(0)
    })
  })

  describe('10. calculateMCAFee in calculatorUtils integration', () => {
    test('calculateMCAFee returns identical differential and stamp duty for Normal Company in Delhi', () => {
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

    test('calculateMCAFee returns correct Case C figures for Small Company in Karnataka', () => {
      const res = calculateMCAFee({
        formSlug: 'sh-7',
        companyType: 'small_company',
        capital: 2000000,
        newCapital: 6000000,
        delayDays: 45,
        state: 'karnataka'
      })

      expect(res.baseFee).toBe(144000) // ₹1,66,000 - ₹22,000
      expect(res.lateFee).toBe(7200) // 2 months @ 2.5% = 5% of ₹1,44,000
      expect(res.stampDuty).toBe(20000) // 4 blocks of ₹10L × ₹5,000
      expect(res.total).toBe(171200) // 1,44,000 + 7,200 + 20,000
    })
  })
})
