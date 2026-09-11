import {
  calculatePas3Compliance,
  calculatePas3BaseFee,
  getTableBLateMultiplier,
  formatInr
} from '../lib/rule-engine/pas3-engine'

describe('Form PAS-3 Rule Engine Tests', () => {
  describe('Base Filing Fee (Table A)', () => {
    it('calculates correct base fee for standard capital slabs', () => {
      expect(calculatePas3BaseFee(50000, 'normal').normalFee).toBe(200)
      expect(calculatePas3BaseFee(200000, 'normal').normalFee).toBe(300)
      expect(calculatePas3BaseFee(1000000, 'normal').normalFee).toBe(400)
      expect(calculatePas3BaseFee(5000000, 'normal').normalFee).toBe(500)
      expect(calculatePas3BaseFee(20000000, 'normal').normalFee).toBe(600)
    })

    it('returns flat ₹200 for company without share capital', () => {
      const res = calculatePas3BaseFee(0, 'without_share_capital')
      expect(res.normalFee).toBe(200)
    })

    it('calculates fee for Nidhi company based on ₹1 per ₹100 nominal value capped at capital slab', () => {
      // 50,000 nominal value -> 500 / 100 = 500, cap for ₹10L capital is ₹400
      const res = calculatePas3BaseFee(1000000, 'nidhi', 50000)
      expect(res.normalFee).toBe(400)
    })
  })

  describe('Table B Escalation Multipliers', () => {
    it('returns 0 for timely filings', () => {
      expect(getTableBLateMultiplier(0)).toBe(0)
      expect(getTableBLateMultiplier(-5)).toBe(0)
    })

    it('returns correct slab multipliers for delays', () => {
      expect(getTableBLateMultiplier(15)).toBe(2)
      expect(getTableBLateMultiplier(30)).toBe(2)
      expect(getTableBLateMultiplier(31)).toBe(4)
      expect(getTableBLateMultiplier(60)).toBe(4)
      expect(getTableBLateMultiplier(61)).toBe(6)
      expect(getTableBLateMultiplier(90)).toBe(6)
      expect(getTableBLateMultiplier(91)).toBe(10)
      expect(getTableBLateMultiplier(180)).toBe(10)
      expect(getTableBLateMultiplier(181)).toBe(12)
      expect(getTableBLateMultiplier(500)).toBe(12)
    })
  })

  describe('Scenario 1: Ordinary Allotment (Section 39) - 30 Days Window', () => {
    it('calculates timely filing correctly with 30-day window', () => {
      const res = calculatePas3Compliance({
        allotmentMode: 'ordinary_allotment',
        companyType: 'normal',
        authorisedCapital: 1000000, // ₹10 Lakhs -> ₹400
        allotmentDate: '2026-10-01',
        filingDate: '2026-10-20'
      })

      expect(res.statutoryDeadlineDays).toBe(30)
      expect(res.statutoryDueDate).toBe('2026-10-31')
      expect(res.isDelayed).toBe(false)
      expect(res.delayDays).toBe(0)
      expect(res.normalFee).toBe(400)
      expect(res.additionalLateFee).toBe(0)
      expect(res.totalMcaChallanFee).toBe(400)
      expect(res.totalAdjudicationPenalty).toBe(0)
      expect(res.totalFinancialExposure).toBe(400)
    })

    it('calculates 45-day delay under Section 39(5)', () => {
      const res = calculatePas3Compliance({
        allotmentMode: 'ordinary_allotment',
        companyType: 'normal',
        authorisedCapital: 1000000, // ₹400
        allotmentDate: '2026-10-01',
        filingDate: '2026-12-15', // Due 2026-10-31 -> 45 days late
        numPromotersDirectors: 2
      })

      expect(res.isDelayed).toBe(true)
      expect(res.delayDays).toBe(45)
      expect(res.lateMultiplier).toBe(4) // 31-60 days slab
      expect(res.additionalLateFee).toBe(1600)
      expect(res.totalMcaChallanFee).toBe(2000)

      // Section 39(5) penalty: ₹1,000/day capped at ₹1,00,000
      expect(res.companyPenalty).toBe(45000)
      expect(res.perIndividualPenalty).toBe(45000)
      expect(res.totalIndividualPenalty).toBe(90000)
      expect(res.totalAdjudicationPenalty).toBe(135000)
      expect(res.totalFinancialExposure).toBe(137000)
    })

    it('enforces Section 39(5) ₹1,00,000 statutory cap', () => {
      const res = calculatePas3Compliance({
        allotmentMode: 'ordinary_allotment',
        companyType: 'normal',
        authorisedCapital: 1000000,
        allotmentDate: '2026-01-01',
        filingDate: '2026-08-01', // ~180+ days late
        numPromotersDirectors: 3
      })

      expect(res.companyPenalty).toBe(100000)
      expect(res.perIndividualPenalty).toBe(100000)
      expect(res.totalIndividualPenalty).toBe(300000)
      expect(res.totalAdjudicationPenalty).toBe(400000)
    })
  })

  describe('Scenario 2: Private Placement (Section 42) - 15 Days Window', () => {
    it('applies strict 15-day deadline from date of allotment', () => {
      const res = calculatePas3Compliance({
        allotmentMode: 'private_placement',
        companyType: 'normal',
        authorisedCapital: 20000000, // ₹2 Cr -> ₹600
        allotmentDate: '2026-10-01',
        filingDate: '2026-10-15' // Within 15 days
      })

      expect(res.statutoryDeadlineDays).toBe(15)
      expect(res.statutoryDueDate).toBe('2026-10-16')
      expect(res.isDelayed).toBe(false)
      expect(res.delayDays).toBe(0)
      expect(res.totalMcaChallanFee).toBe(600)
      expect(res.totalAdjudicationPenalty).toBe(0)
    })

    it('flags Day 20 as 5 days in default (ROC Chennai warning)', () => {
      const res = calculatePas3Compliance({
        allotmentMode: 'private_placement',
        companyType: 'normal',
        authorisedCapital: 20000000,
        allotmentDate: '2026-10-01',
        filingDate: '2026-10-21' // 5 days late past 15-day window
      })

      expect(res.isDelayed).toBe(true)
      expect(res.delayDays).toBe(5)
      expect(res.lateMultiplier).toBe(2)
      expect(res.additionalLateFee).toBe(1200)
      expect(res.totalMcaChallanFee).toBe(1800)
      // ₹1,000/day on company + promoters + directors
      expect(res.companyPenalty).toBe(5000)
      expect(res.perIndividualPenalty).toBe(5000)
    })

    it('matches the ROC Chennai 2026 order scenario (46 days delay)', () => {
      const res = calculatePas3Compliance({
        allotmentMode: 'private_placement',
        companyType: 'normal',
        authorisedCapital: 20000000, // ₹600 base
        allotmentDate: '2026-01-01',
        filingDate: '2026-03-03', // Due 2026-01-16 -> 46 days delay
        numPromotersDirectors: 2
      })

      expect(res.delayDays).toBe(46)
      expect(res.lateMultiplier).toBe(4) // 31-60 days slab
      expect(res.totalMcaChallanFee).toBe(3000) // 600 + 2400
      expect(res.companyPenalty).toBe(46000)
      expect(res.perIndividualPenalty).toBe(46000)
      expect(res.totalIndividualPenalty).toBe(92000)
      expect(res.totalAdjudicationPenalty).toBe(138000)
      expect(res.companyPenaltyCap).toBe(2500000)
    })

    it('enforces Section 42(9) ₹25 Lakh cap per person on large delay', () => {
      const res = calculatePas3Compliance({
        allotmentMode: 'private_placement',
        companyType: 'normal',
        authorisedCapital: 20000000,
        allotmentDate: '2018-01-01',
        filingDate: '2026-01-01', // > 2,900 days
        numPromotersDirectors: 2
      })

      expect(res.companyPenalty).toBe(2500000)
      expect(res.perIndividualPenalty).toBe(2500000)
      expect(res.totalIndividualPenalty).toBe(5000000)
      expect(res.totalAdjudicationPenalty).toBe(7500000)
    })
  })

  describe('Scenario 3: Section 446B Concession (Startup / Small Company)', () => {
    it('applies half penalty with ₹2L company cap and ₹1L promoter/director cap for startups', () => {
      const res = calculatePas3Compliance({
        allotmentMode: 'private_placement',
        companyType: 'startup',
        authorisedCapital: 1000000,
        allotmentDate: '2026-01-01',
        filingDate: '2026-03-03', // 46 days delay
        numPromotersDirectors: 2
      })

      expect(res.section446BApplied).toBe(true)
      // Raw penalty = 46,000. Half penalty = 23,000 (well within ₹2L / ₹1L cap)
      expect(res.companyPenalty).toBe(23000)
      expect(res.perIndividualPenalty).toBe(23000)
      expect(res.totalAdjudicationPenalty).toBe(69000) // 23k + 2 * 23k
      expect(res.savingsFrom446B).toBe(69000) // 138k - 69k
    })

    it('caps penalty at ₹2L (company) and ₹1L (per director) for large delay under 446B', () => {
      const res = calculatePas3Compliance({
        allotmentMode: 'private_placement',
        companyType: 'small_company',
        authorisedCapital: 1000000,
        allotmentDate: '2024-01-01',
        filingDate: '2026-01-01', // 700+ days delay
        numPromotersDirectors: 2
      })

      expect(res.companyPenalty).toBe(200000)
      expect(res.perIndividualPenalty).toBe(100000)
      expect(res.totalAdjudicationPenalty).toBe(400000) // 200k + 2 * 100k
    })
  })

  describe('Upstream Checks & Red Flags', () => {
    it('flags critical breach when application money is utilised prior to PAS-3 filing', () => {
      const res = calculatePas3Compliance({
        allotmentMode: 'private_placement',
        companyType: 'normal',
        authorisedCapital: 1000000,
        allotmentDate: '2026-10-01',
        filingDate: '2026-10-25',
        fundsUtilisedBeforeFiling: true
      })

      const found = res.criticalBreaches.some(b => b.includes('Section 42(6) Proviso'))
      expect(found).toBe(true)
    })

    it('flags breach when 60-day allotment window from application money is exceeded', () => {
      const res = calculatePas3Compliance({
        allotmentMode: 'private_placement',
        companyType: 'normal',
        authorisedCapital: 1000000,
        applicationMoneyReceivedDate: '2026-07-01',
        allotmentDate: '2026-09-15', // 76 days later (>60d)
        filingDate: '2026-09-20'
      })

      const found = res.criticalBreaches.some(b => b.includes('Section 42(6) Window Exceeded'))
      expect(found).toBe(true)
    })

    it('flags batching warning if more than 5 allotment dates or older than 30 days', () => {
      const res = calculatePas3Compliance({
        allotmentMode: 'ordinary_allotment',
        companyType: 'normal',
        authorisedCapital: 1000000,
        allotmentDate: '2026-10-15',
        filingDate: '2026-10-20',
        allotmentCount: 6,
        oldestAllotmentDate: '2026-09-01' // 49 days before filing (>30d)
      })

      expect(res.warnings.some(w => w.includes('A maximum of 5 allotment dates'))).toBe(true)
      expect(res.warnings.some(w => w.includes('MCA V3 30-Day Window Rule'))).toBe(true)
    })
  })
})
