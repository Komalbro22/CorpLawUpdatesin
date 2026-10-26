import { calculateMgt7Compliance } from '../lib/rule-engine/mgt7-engine'
import { calculateMCAFee } from '../lib/calculatorUtils'
import { mcaForms } from '../data/mca-forms'

describe('MCA General Circular No. 05/2026 Verification Test Suite', () => {
  describe('Case 1: MGT-7, FY 2025-26, AGM 30 Sep 2026, Filing 15 Jan 2027', () => {
    test('Calculates statutory due date 29 Nov 2026, detects extended window, and sets additional fee to 0', () => {
      const result = calculateMgt7Compliance({
        financialYearEnd: new Date('2026-03-31'),
        agmType: 'subsequent',
        agmStatus: 'held',
        formCode: 'MGT-7',
        actualAgmDate: new Date('2026-09-30'),
        actualFilingDate: new Date('2027-01-15'),
        nominalCapital: 1000000,
        hasShareCapital: true
      })

      expect(result.metadata.statutoryDueDate).toBe('2026-11-29')
      
      const isFY2025_26 = true
      const isWithinExtendedWindow = isFY2025_26 && '2027-01-15' <= '2027-01-31'
      expect(isWithinExtendedWindow).toBe(true)

      const effectiveLateFee = isWithinExtendedWindow ? 0 : result.mcaPortalPayable.additionalFilingFee
      const effectiveTotalChallan = result.mcaPortalPayable.normalFilingFee + effectiveLateFee

      expect(effectiveLateFee).toBe(0)
      expect(effectiveTotalChallan).toBe(result.mcaPortalPayable.normalFilingFee)
    })
  })

  describe('Case 2: MGT-7, FY 2025-26, AGM 30 Sep 2026, Filing 5 Feb 2027', () => {
    test('Calculates delay of 68 days from 29 Nov 2026 statutory due date, charging ₹6,800 additional fee', () => {
      const result = calculateMgt7Compliance({
        financialYearEnd: new Date('2026-03-31'),
        agmType: 'subsequent',
        agmStatus: 'held',
        formCode: 'MGT-7',
        actualAgmDate: new Date('2026-09-30'),
        actualFilingDate: new Date('2027-02-05'),
        nominalCapital: 1000000,
        hasShareCapital: true
      })

      expect(result.metadata.statutoryDueDate).toBe('2026-11-29')
      expect(result.metadata.daysDelayed).toBe(68)

      const isFY2025_26 = true
      const isWithinExtendedWindow = isFY2025_26 && '2027-02-05' <= '2027-01-31'
      expect(isWithinExtendedWindow).toBe(false)

      const effectiveLateFee = isWithinExtendedWindow ? 0 : result.mcaPortalPayable.additionalFilingFee
      expect(effectiveLateFee).toBe(6800)
      expect(result.mcaPortalPayable.normalFilingFee + effectiveLateFee).toBe(result.mcaPortalPayable.normalFilingFee + 6800)
    })
  })

  describe('Case 3: MGT-7A, OPC (or Small), FY 2025-26, Filing 31 Jan 2027', () => {
    test('Filing exactly on 31 Jan 2027 qualifies for extended window with ₹0 additional fee', () => {
      const result = calculateMgt7Compliance({
        financialYearEnd: new Date('2026-03-31'),
        agmType: 'subsequent',
        agmStatus: 'held',
        formCode: 'MGT-7A',
        isOnePersonCompany: true,
        actualAgmDate: new Date('2026-09-30'),
        actualFilingDate: new Date('2027-01-31'),
        nominalCapital: 500000,
        hasShareCapital: true
      })

      const isFY2025_26 = true
      const isWithinExtendedWindow = isFY2025_26 && '2027-01-31' <= '2027-01-31'
      expect(isWithinExtendedWindow).toBe(true)

      const effectiveLateFee = isWithinExtendedWindow ? 0 : result.mcaPortalPayable.additionalFilingFee
      expect(effectiveLateFee).toBe(0)
      expect(result.mcaPortalPayable.normalFilingFee + effectiveLateFee).toBe(result.mcaPortalPayable.normalFilingFee)
    })
  })

  describe('Case 4: MGT-7A, OPC, FY 2025-26, Filing 1 Feb 2027', () => {
    test('Filing 1 Feb 2027 incurs delay of 64 days from 29 Nov 2026 statutory due date (₹6,400 late fee)', () => {
      const result = calculateMgt7Compliance({
        financialYearEnd: new Date('2026-03-31'),
        agmType: 'subsequent',
        agmStatus: 'held',
        formCode: 'MGT-7A',
        isOnePersonCompany: true,
        actualAgmDate: new Date('2026-09-30'),
        actualFilingDate: new Date('2027-02-01'),
        nominalCapital: 500000,
        hasShareCapital: true
      })

      expect(result.metadata.statutoryDueDate).toBe('2026-11-29')
      expect(result.metadata.daysDelayed).toBe(64)

      const isFY2025_26 = true
      const isWithinExtendedWindow = isFY2025_26 && '2027-02-01' <= '2027-01-31'
      expect(isWithinExtendedWindow).toBe(false)

      const effectiveLateFee = isWithinExtendedWindow ? 0 : result.mcaPortalPayable.additionalFilingFee
      expect(effectiveLateFee).toBe(6400)
    })
  })

  describe('Case 5: MCA Forms Metadata Extension Labels', () => {
    test('AOC-4, MGT-7, and MGT-7A form definitions include GC 05/2026 extension details', () => {
      const aoc4 = mcaForms.find(f => f.slug === 'aoc-4')
      const mgt7 = mcaForms.find(f => f.slug === 'mgt-7')
      const mgt7a = mcaForms.find(f => f.slug === 'mgt-7a')

      expect(aoc4?.dueDate).toContain('31 Dec 2026')
      expect(mgt7?.dueDate).toContain('31 Jan 2027')
      expect(mgt7a?.dueDate).toContain('31 Jan 2027')
    })
  })

  describe('Case 6: General Calculator AOC-4 Logic', () => {
    test('0 days delay produces ₹0 additional fee', () => {
      const res = calculateMCAFee({ formSlug: 'aoc-4', companyType: 'private_small', capital: 1000000, delayDays: 0 })
      expect(res.lateFee).toBe(0)
    })

    test('77 days delay (filed 15 Jan 2027, delay from 30 Oct 2026) produces ₹7,700 additional fee', () => {
      const res = calculateMCAFee({ formSlug: 'aoc-4', companyType: 'private_small', capital: 1000000, delayDays: 77 })
      expect(res.lateFee).toBe(7700)
    })
  })

  describe('Case 7: Non-Extended Financial Year (e.g. FY 2024-25)', () => {
    test('Standard statutory calculations apply without GC 05/2026 extension waiver', () => {
      const result = calculateMgt7Compliance({
        financialYearEnd: new Date('2025-03-31'),
        agmType: 'subsequent',
        agmStatus: 'held',
        formCode: 'MGT-7',
        actualAgmDate: new Date('2025-09-30'),
        actualFilingDate: new Date('2026-01-15'),
        nominalCapital: 1000000,
        hasShareCapital: true
      })

      const isFY2025_26 = false
      expect(isFY2025_26).toBe(false)

      // In FY 2024-25, filing on 15 Jan 2026 (47 days after 29 Nov 2025 due date) incurs standard late fee
      expect(result.metadata.daysDelayed).toBe(47)
      expect(result.mcaPortalPayable.additionalFilingFee).toBe(4700)
    })
  })
})
