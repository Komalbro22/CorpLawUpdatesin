import {
  getNormalMgt14Fee,
  getAdditionalFeeMultiplier,
  calculateMgt14Compliance,
  getCalendarDaysDiff,
  addCalendarDays,
  check446BEligibility,
  Mgt14CalculationInput
} from '../lib/rule-engine/mgt14-engine'

describe('MGT-14 Calculation Engine', () => {
  describe('Normal Fee Slabs (Table A)', () => {
    test('Company not having share capital is flat ₹200', () => {
      expect(getNormalMgt14Fee(false, 0)).toBe(200)
      expect(getNormalMgt14Fee(false, 50000000)).toBe(200)
    })

    test('Capital < ₹1,00,000 maps to ₹200', () => {
      expect(getNormalMgt14Fee(true, 0)).toBe(200)
      expect(getNormalMgt14Fee(true, 1)).toBe(200)
      expect(getNormalMgt14Fee(true, 99999)).toBe(200)
    })

    test('Capital ₹1,00,000 to ₹4,99,999 maps to ₹300', () => {
      expect(getNormalMgt14Fee(true, 100000)).toBe(300)
      expect(getNormalMgt14Fee(true, 250000)).toBe(300)
      expect(getNormalMgt14Fee(true, 499999)).toBe(300)
    })

    test('Capital ₹5,00,000 to ₹24,99,999 maps to ₹400', () => {
      expect(getNormalMgt14Fee(true, 500000)).toBe(400)
      expect(getNormalMgt14Fee(true, 1500000)).toBe(400)
      expect(getNormalMgt14Fee(true, 2499999)).toBe(400)
    })

    test('Capital ₹25,00,000 to ₹99,99,999 maps to ₹500', () => {
      expect(getNormalMgt14Fee(true, 2500000)).toBe(500)
      expect(getNormalMgt14Fee(true, 5000000)).toBe(500)
      expect(getNormalMgt14Fee(true, 9999999)).toBe(500)
    })

    test('Capital ₹1,00,00,000 (1 Crore+) or more maps to ₹600', () => {
      expect(getNormalMgt14Fee(true, 10000000)).toBe(600)
      expect(getNormalMgt14Fee(true, 50000000)).toBe(600)
      expect(getNormalMgt14Fee(true, 1000000000)).toBe(600)
    })
  })

  describe('Additional Fee Multipliers (Table B)', () => {
    test('0 delay days = 0x multiplier', () => {
      expect(getAdditionalFeeMultiplier(0)).toBe(0)
    })

    test('1 to 30 days delay = 2x multiplier', () => {
      expect(getAdditionalFeeMultiplier(1)).toBe(2)
      expect(getAdditionalFeeMultiplier(15)).toBe(2)
      expect(getAdditionalFeeMultiplier(30)).toBe(2)
    })

    test('31 to 60 days delay = 4x multiplier', () => {
      expect(getAdditionalFeeMultiplier(31)).toBe(4)
      expect(getAdditionalFeeMultiplier(45)).toBe(4)
      expect(getAdditionalFeeMultiplier(60)).toBe(4)
    })

    test('61 to 90 days delay = 6x multiplier', () => {
      expect(getAdditionalFeeMultiplier(61)).toBe(6)
      expect(getAdditionalFeeMultiplier(75)).toBe(6)
      expect(getAdditionalFeeMultiplier(90)).toBe(6)
    })

    test('91 to 180 days delay = 10x multiplier', () => {
      expect(getAdditionalFeeMultiplier(91)).toBe(10)
      expect(getAdditionalFeeMultiplier(120)).toBe(10)
      expect(getAdditionalFeeMultiplier(180)).toBe(10)
    })

    test('More than 180 days delay = 12x multiplier', () => {
      expect(getAdditionalFeeMultiplier(181)).toBe(12)
      expect(getAdditionalFeeMultiplier(300)).toBe(12)
      expect(getAdditionalFeeMultiplier(500)).toBe(12)
    })
  })

  describe('Calendar Date & Due Date Engine', () => {
    test('Standard company due date is 30 calendar days', () => {
      expect(addCalendarDays('2026-03-01', 30)).toBe('2026-03-31')
      expect(addCalendarDays('2026-10-01', 30)).toBe('2026-10-31')
    })

    test('IFSC company due date is 60 calendar days', () => {
      expect(addCalendarDays('2026-03-01', 60)).toBe('2026-04-30')
      expect(addCalendarDays('2026-10-01', 60)).toBe('2026-11-30')
    })

    test('Calendar difference across months handles leap years accurately', () => {
      expect(getCalendarDaysDiff('2026-02-01', '2026-03-01')).toBe(28) // 2026 is non-leap year
      expect(getCalendarDaysDiff('2024-02-01', '2024-03-01')).toBe(29) // 2024 is leap year
    })
  })

  describe('Section 446B Eligibility', () => {
    test('Small company, OPC, Startup, Producer are eligible', () => {
      expect(check446BEligibility('small_company')).toBe(true)
      expect(check446BEligibility('opc')).toBe(true)
      expect(check446BEligibility('startup')).toBe(true)
      expect(check446BEligibility('producer')).toBe(true)
      expect(check446BEligibility('normal')).toBe(false)
    })
  })

  describe('Full Compliance Calculations (Scenarios)', () => {
    test('Scenario 1: On-time filing (Normal Fee ₹400, Delay 0)', () => {
      const input: Mgt14CalculationInput = {
        hasShareCapital: true,
        nominalShareCapital: 1000000, // ₹10 Lakhs -> ₹400
        isIfscCompany: false,
        companyType: 'normal',
        eventType: 'special_resolution',
        eventDate: '2026-10-01',
        filingDate: '2026-10-25',
        numOfficersInDefault: 2
      }

      const res = calculateMgt14Compliance(input)
      expect(res.normalFee).toBe(400)
      expect(res.dueDate).toBe('2026-10-31')
      expect(res.delayDays).toBe(0)
      expect(res.additionalFeeMultiplier).toBe(0)
      expect(res.additionalFee).toBe(0)
      expect(res.totalPortalFee).toBe(400)
      expect(res.totalStatutoryPenaltyExposure).toBe(0)
      expect(res.filingStatus).toBe('on_time')
    })

    test('Scenario 2: 15-day delay for ₹10 Lakhs company (Table B 2x)', () => {
      const input: Mgt14CalculationInput = {
        hasShareCapital: true,
        nominalShareCapital: 1000000, // ₹10 Lakhs -> Normal fee ₹400
        isIfscCompany: false,
        companyType: 'normal',
        eventType: 'special_resolution',
        eventDate: '2026-10-01',
        filingDate: '2026-11-15', // Due 2026-10-31, 15 days delay
        numOfficersInDefault: 2
      }

      const res = calculateMgt14Compliance(input)
      expect(res.normalFee).toBe(400)
      expect(res.delayDays).toBe(15)
      expect(res.additionalFeeMultiplier).toBe(2)
      expect(res.additionalFee).toBe(800) // 2x ₹400
      expect(res.totalPortalFee).toBe(1200) // ₹400 + ₹800
      
      // Statutory penalty:
      // Company: ₹10,000 + 100 * (15 - 1) = ₹11,400
      // Officer: ₹10,000 + 100 * (15 - 1) = ₹11,400 each * 2 = ₹22,800
      // Total Penalty = ₹11,400 + ₹22,800 = ₹34,200
      expect(res.totalCompanyPenalty).toBe(11400)
      expect(res.totalOfficerPenaltyPerPerson).toBe(11400)
      expect(res.totalStatutoryPenaltyExposure).toBe(34200)
      expect(res.filingStatus).toBe('late')
    })

    test('Scenario 3: Small Company with Section 446B Relief (45-day delay, Table B 4x)', () => {
      const input: Mgt14CalculationInput = {
        hasShareCapital: true,
        nominalShareCapital: 2500000, // ₹25 Lakhs -> Normal fee ₹500
        isIfscCompany: false,
        companyType: 'small_company',
        eventType: 'special_resolution',
        eventDate: '2026-09-01',
        filingDate: '2026-11-15', // Due 2026-10-01, delay = 45 days
        numOfficersInDefault: 2
      }

      const res = calculateMgt14Compliance(input)
      expect(res.normalFee).toBe(500)
      expect(res.delayDays).toBe(45)
      expect(res.additionalFeeMultiplier).toBe(4)
      expect(res.additionalFee).toBe(2000) // 4x ₹500
      expect(res.totalPortalFee).toBe(2500) // ₹500 + ₹2,000
      
      // Base unreduced: ₹10,000 + 100 * 44 = ₹14,400
      // With Sec 446B: 50% = ₹7,200 per entity/person
      expect(res.is446BEligible).toBe(true)
      expect(res.totalCompanyPenalty).toBe(7200)
      expect(res.totalOfficerPenaltyPerPerson).toBe(7200)
      expect(res.totalAllOfficersPenalty).toBe(14400) // 2 * 7200
      expect(res.totalStatutoryPenaltyExposure).toBe(21600) // 7200 + 14400
    })

    test('Scenario 4: IFSC Company (60-day filing window)', () => {
      const input: Mgt14CalculationInput = {
        hasShareCapital: true,
        nominalShareCapital: 10000000, // ₹1 Crore -> Normal fee ₹600
        isIfscCompany: true,
        companyType: 'normal',
        eventType: 'special_resolution',
        eventDate: '2026-10-01',
        filingDate: '2026-11-25', // 55 days from event -> On time for IFSC!
        numOfficersInDefault: 1
      }

      const res = calculateMgt14Compliance(input)
      expect(res.filingWindowDays).toBe(60)
      expect(res.dueDate).toBe('2026-11-30')
      expect(res.delayDays).toBe(0)
      expect(res.totalPortalFee).toBe(600)
      expect(res.totalStatutoryPenaltyExposure).toBe(0)
      expect(res.filingStatus).toBe('on_time')
    })

    test('Scenario 5: 350-Day Extreme Delay triggers Condonation Warning (>300 Days)', () => {
      const input: Mgt14CalculationInput = {
        hasShareCapital: true,
        nominalShareCapital: 10000000, // ₹1 Crore -> ₹600
        isIfscCompany: false,
        companyType: 'normal',
        eventType: 'special_resolution',
        eventDate: '2025-10-01',
        filingDate: '2026-09-16', // 350 days from event
        numOfficersInDefault: 2
      }

      const res = calculateMgt14Compliance(input)
      expect(res.isExtendedDelay).toBe(true)
      expect(res.requiresCondonation).toBe(true)
      expect(res.filingStatus).toBe('condonation_required')
      expect(res.additionalFeeMultiplier).toBe(12) // > 180 days is 12x
      expect(res.additionalFee).toBe(7200) // 12 * 600
      expect(res.totalPortalFee).toBe(7800) // 600 + 7200
      expect(res.condonationNote).toBeDefined()
      expect(res.condonationNote).toContain('INC-28')
      expect(res.condonationNote).toContain('CG-1')
    })
  })
})
