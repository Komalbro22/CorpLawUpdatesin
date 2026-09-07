import {
  calculateInc20aCompliance,
  INC20A_CAPITAL_SLABS,
  INC20A_DELAY_SLABS,
  INC20A_ROC_BENCHMARKS
} from '../lib/rule-engine/inc20a-engine';

describe('Form INC-20A Statutory Rule Engine (Section 10A & Rule 23A)', () => {
  describe('1. 180-Day Statutory Due Date & Exemption Logic', () => {
    test('Calculates exactly 180 calendar days from incorporation date', () => {
      // 10 January 2026 + 180 days:
      // Jan (21 days) + Feb (28) + Mar (31) + Apr (30) + May (31) + Jun (30) + Jul (9) = 180 days -> 9 July 2026
      const result = calculateInc20aCompliance({
        incorporationDate: '2026-01-10',
        filingDate: '2026-05-01',
        authorizedShareCapital: 1000000,
        companyClassification: 'standard_private',
        hasCommencedBusinessBeforeFiling: false,
        numberOfDirectors: 2
      });

      expect(result.statutoryDueDate).toBe('2026-07-09');
      expect(result.daysOfDelay).toBe(0);
      expect(result.isDelay).toBe(false);
      expect(result.isExempt).toBe(false);
      expect(result.statusBadge.variant).toBe('success');
    });

    test('Leap year calculation: 10 January 2024 has 29 days in Feb', () => {
      const result = calculateInc20aCompliance({
        incorporationDate: '2024-01-10',
        filingDate: '2024-04-01',
        authorizedShareCapital: 1000000,
        companyClassification: 'standard_private',
        hasCommencedBusinessBeforeFiling: false,
        numberOfDirectors: 2
      });

      expect(result.statutoryDueDate).toBe('2024-07-08');
      expect(result.daysOfDelay).toBe(0);
      expect(result.isDelay).toBe(false);
    });

    test('Exempts companies incorporated before 2 November 2018', () => {
      const result = calculateInc20aCompliance({
        incorporationDate: '2018-05-15',
        filingDate: '2026-01-01',
        authorizedShareCapital: 1000000,
        companyClassification: 'standard_private',
        hasCommencedBusinessBeforeFiling: false,
        numberOfDirectors: 2
      });

      expect(result.isExempt).toBe(true);
      expect(result.exemptionReason).toContain('prior to 2 November 2018');
      expect(result.totalMcaPortalFee).toBe(0);
      expect(result.totalAdjudicatedPenalty).toBe(0);
    });

    test('Exempts companies without share capital under Section 10A(1)(a)', () => {
      const result = calculateInc20aCompliance({
        incorporationDate: '2025-01-10',
        filingDate: '2025-09-01',
        authorizedShareCapital: 0,
        companyClassification: 'no_share_capital',
        hasCommencedBusinessBeforeFiling: false,
        numberOfDirectors: 2
      });

      expect(result.isExempt).toBe(true);
      expect(result.exemptionReason).toContain('company having a share capital');
      expect(result.totalMcaPortalFee).toBe(0);
    });
  });

  describe('2. Table A Base Filing Fees (Item 5)', () => {
    test('Capital < Rs. 1 Lakh -> Rs. 200 base fee', () => {
      const res = calculateInc20aCompliance({
        incorporationDate: '2026-01-01',
        filingDate: '2026-03-01',
        authorizedShareCapital: 50000,
        companyClassification: 'standard_private',
        hasCommencedBusinessBeforeFiling: false,
        numberOfDirectors: 2
      });
      expect(res.baseFilingFee).toBe(200);
      expect(res.totalMcaPortalFee).toBe(200);
    });

    test('Capital Rs. 1 Lakh to Rs. 4,99,999 -> Rs. 300 base fee', () => {
      const res = calculateInc20aCompliance({
        incorporationDate: '2026-01-01',
        filingDate: '2026-03-01',
        authorizedShareCapital: 200000,
        companyClassification: 'standard_private',
        hasCommencedBusinessBeforeFiling: false,
        numberOfDirectors: 2
      });
      expect(res.baseFilingFee).toBe(300);
    });

    test('Capital Rs. 5 Lakh to Rs. 24,99,999 -> Rs. 400 base fee', () => {
      const res = calculateInc20aCompliance({
        incorporationDate: '2026-01-01',
        filingDate: '2026-03-01',
        authorizedShareCapital: 1000000,
        companyClassification: 'standard_private',
        hasCommencedBusinessBeforeFiling: false,
        numberOfDirectors: 2
      });
      expect(res.baseFilingFee).toBe(400);
    });

    test('Capital Rs. 25 Lakh to Rs. 99,99,999 -> Rs. 500 base fee', () => {
      const res = calculateInc20aCompliance({
        incorporationDate: '2026-01-01',
        filingDate: '2026-03-01',
        authorizedShareCapital: 5000000,
        companyClassification: 'standard_private',
        hasCommencedBusinessBeforeFiling: false,
        numberOfDirectors: 2
      });
      expect(res.baseFilingFee).toBe(500);
    });

    test('Capital >= Rs. 1 Crore -> Rs. 600 base fee', () => {
      const res = calculateInc20aCompliance({
        incorporationDate: '2026-01-01',
        filingDate: '2026-03-01',
        authorizedShareCapital: 20000000,
        companyClassification: 'standard_private',
        hasCommencedBusinessBeforeFiling: false,
        numberOfDirectors: 2
      });
      expect(res.baseFilingFee).toBe(600);
    });
  });

  describe('3. Table B Late Fee Multipliers', () => {
    const incDate = '2025-01-01'; // Due date: 2025-06-30
    const baseCapital = 5000000;  // Base fee: Rs. 500

    test('15 days delay -> 2x multiplier (Rs. 500 + Rs. 1,000 = Rs. 1,500)', () => {
      const res = calculateInc20aCompliance({
        incorporationDate: incDate,
        filingDate: '2025-07-15', // 15 days late
        authorizedShareCapital: baseCapital,
        companyClassification: 'standard_private',
        hasCommencedBusinessBeforeFiling: false,
        numberOfDirectors: 2
      });
      expect(res.daysOfDelay).toBe(15);
      expect(res.additionalFeeMultiplier).toBe(2);
      expect(res.additionalLateFee).toBe(1000);
      expect(res.totalMcaPortalFee).toBe(1500);
    });

    test('45 days delay -> 4x multiplier (Rs. 500 + Rs. 2,000 = Rs. 2,500)', () => {
      const res = calculateInc20aCompliance({
        incorporationDate: incDate,
        filingDate: '2025-08-14', // 45 days late
        authorizedShareCapital: baseCapital,
        companyClassification: 'standard_private',
        hasCommencedBusinessBeforeFiling: false,
        numberOfDirectors: 2
      });
      expect(res.daysOfDelay).toBe(45);
      expect(res.additionalFeeMultiplier).toBe(4);
      expect(res.additionalLateFee).toBe(2000);
      expect(res.totalMcaPortalFee).toBe(2500);
    });

    test('75 days delay -> 6x multiplier (Rs. 500 + Rs. 3,000 = Rs. 3,500)', () => {
      const res = calculateInc20aCompliance({
        incorporationDate: incDate,
        filingDate: '2025-09-13', // 75 days late
        authorizedShareCapital: baseCapital,
        companyClassification: 'standard_private',
        hasCommencedBusinessBeforeFiling: false,
        numberOfDirectors: 2
      });
      expect(res.daysOfDelay).toBe(75);
      expect(res.additionalFeeMultiplier).toBe(6);
      expect(res.additionalLateFee).toBe(3000);
      expect(res.totalMcaPortalFee).toBe(3500);
    });

    test('120 days delay -> 10x multiplier (Rs. 500 + Rs. 5,000 = Rs. 5,500)', () => {
      const res = calculateInc20aCompliance({
        incorporationDate: incDate,
        filingDate: '2025-10-28', // 120 days late
        authorizedShareCapital: baseCapital,
        companyClassification: 'standard_private',
        hasCommencedBusinessBeforeFiling: false,
        numberOfDirectors: 2
      });
      expect(res.daysOfDelay).toBe(120);
      expect(res.additionalFeeMultiplier).toBe(10);
      expect(res.additionalLateFee).toBe(5000);
      expect(res.totalMcaPortalFee).toBe(5500);
    });

    test('200 days delay -> 12x multiplier (Rs. 500 + Rs. 6,000 = Rs. 6,500)', () => {
      const res = calculateInc20aCompliance({
        incorporationDate: incDate,
        filingDate: '2026-01-16', // 200 days late
        authorizedShareCapital: baseCapital,
        companyClassification: 'standard_private',
        hasCommencedBusinessBeforeFiling: false,
        numberOfDirectors: 2
      });
      expect(res.daysOfDelay).toBe(200);
      expect(res.additionalFeeMultiplier).toBe(12);
      expect(res.additionalLateFee).toBe(6000);
      expect(res.totalMcaPortalFee).toBe(6500);
      expect(res.strikeOffRiskTriggered).toBe(true);
    });
  });

  describe('4. Section 10A(2) Adjudication Penalties & Section 446B Relief', () => {
    test('Standard Company: Rs. 50,000 flat + Rs. 1,000/day capped at Rs. 1,00,000 per director', () => {
      const res = calculateInc20aCompliance({
        incorporationDate: '2025-01-01',
        filingDate: '2025-08-11', // 42 days delay
        authorizedShareCapital: 1000000,
        companyClassification: 'standard_private',
        hasCommencedBusinessBeforeFiling: false,
        numberOfDirectors: 2
      });

      expect(res.daysOfDelay).toBe(42);
      expect(res.isSection446BEligible).toBe(false);
      expect(res.companyPenalty).toBe(50000);
      expect(res.perDirectorDailyRate).toBe(1000);
      expect(res.perDirectorPenaltyCap).toBe(100000);
      expect(res.perDirectorPenalty).toBe(42000);
      expect(res.totalOfficersPenalty).toBe(84000); // 2 * 42,000
      expect(res.totalAdjudicatedPenalty).toBe(134000); // 50,000 + 84,000
    });

    test('Director penalty caps at Rs. 1,00,000 when delay exceeds 100 days for standard company', () => {
      const res = calculateInc20aCompliance({
        incorporationDate: '2025-01-01',
        filingDate: '2025-11-20', // ~143 days delay
        authorizedShareCapital: 1000000,
        companyClassification: 'standard_private',
        hasCommencedBusinessBeforeFiling: false,
        numberOfDirectors: 3
      });

      expect(res.daysOfDelay).toBeGreaterThan(100);
      expect(res.perDirectorPenalty).toBe(100000); // capped at 1,00,000
      expect(res.totalOfficersPenalty).toBe(300000); // 3 * 1,00,000
      expect(res.totalAdjudicatedPenalty).toBe(350000); // 50,000 + 3,00,000
    });

    test('Section 446B Relief: Small Company gets 50% penalty reduction', () => {
      const res = calculateInc20aCompliance({
        incorporationDate: '2025-01-01',
        filingDate: '2025-08-09', // 40 days delay
        authorizedShareCapital: 1000000,
        companyClassification: 'small_company',
        hasCommencedBusinessBeforeFiling: false,
        numberOfDirectors: 2
      });

      expect(res.isSection446BEligible).toBe(true);
      expect(res.companyPenalty).toBe(25000); // 50% of 50,000
      expect(res.perDirectorDailyRate).toBe(500); // 50% of 1,000
      expect(res.perDirectorPenaltyCap).toBe(50000); // 50% of 1,00,000
      expect(res.perDirectorPenalty).toBe(20000); // 40 * 500
      expect(res.totalOfficersPenalty).toBe(40000); // 2 * 20,000
      expect(res.totalAdjudicatedPenalty).toBe(65000); // 25,000 + 40,000
    });

    test('Section 446B Relief: DPIIT Startup gets 50% penalty reduction with Rs. 50,000 cap per director', () => {
      const res = calculateInc20aCompliance({
        incorporationDate: '2025-01-01',
        filingDate: '2025-11-20', // ~143 days delay
        authorizedShareCapital: 1000000,
        companyClassification: 'standard_private',
        isDpiitRecognizedStartup: true,
        hasCommencedBusinessBeforeFiling: false,
        numberOfDirectors: 2
      });

      expect(res.isSection446BEligible).toBe(true);
      expect(res.companyPenalty).toBe(25000);
      expect(res.perDirectorPenalty).toBe(50000); // Capped at 50,000 under 446B
      expect(res.totalOfficersPenalty).toBe(100000); // 2 * 50,000
      expect(res.totalAdjudicatedPenalty).toBe(125000); // 25,000 + 100,000
    });

    test('OPC and Producer Companies automatically qualify for Section 446B', () => {
      const opcRes = calculateInc20aCompliance({
        incorporationDate: '2025-01-01',
        filingDate: '2025-07-20',
        authorizedShareCapital: 100000,
        companyClassification: 'opc',
        hasCommencedBusinessBeforeFiling: false,
        numberOfDirectors: 1
      });
      expect(opcRes.isSection446BEligible).toBe(true);
      expect(opcRes.companyPenalty).toBe(25000);

      const producerRes = calculateInc20aCompliance({
        incorporationDate: '2025-01-01',
        filingDate: '2025-07-20',
        authorizedShareCapital: 1000000,
        companyClassification: 'producer',
        hasCommencedBusinessBeforeFiling: false,
        numberOfDirectors: 5
      });
      expect(producerRes.isSection446BEligible).toBe(true);
      expect(producerRes.companyPenalty).toBe(25000);
    });
  });

  describe('5. Statutory Risk & Warning Triggers', () => {
    test('Flags operational freeze if business commenced before filing', () => {
      const res = calculateInc20aCompliance({
        incorporationDate: '2025-01-01',
        filingDate: '2025-08-01',
        authorizedShareCapital: 1000000,
        companyClassification: 'standard_private',
        hasCommencedBusinessBeforeFiling: true,
        numberOfDirectors: 2
      });

      expect(res.operationalFreezeTriggered).toBe(true);
      expect(res.statutoryNotice).toContain('CRITICAL WARNING: Commencing business or exercising borrowing powers');
    });

    test('Flags strike-off risk under Section 248(1)(c) when delay exceeds 180 days', () => {
      const res = calculateInc20aCompliance({
        incorporationDate: '2025-01-01',
        filingDate: '2026-01-15', // > 180 days delay
        authorizedShareCapital: 1000000,
        companyClassification: 'standard_private',
        hasCommencedBusinessBeforeFiling: false,
        numberOfDirectors: 2
      });

      expect(res.strikeOffRiskTriggered).toBe(true);
      expect(res.statutoryNotice).toContain('STRIKE-OFF RISK');
    });

    test('Confirms CCFS-2026 amnesty scheme is NOT applicable to Section 10A', () => {
      const res = calculateInc20aCompliance({
        incorporationDate: '2025-01-01',
        filingDate: '2025-08-01',
        authorizedShareCapital: 1000000,
        companyClassification: 'standard_private',
        hasCommencedBusinessBeforeFiling: false,
        numberOfDirectors: 2
      });

      expect(res.ccfsSchemeApplicable).toBe(false);
      expect(res.statutoryNotice).toContain('EXCLUDED from CCFS-2026 amnesty');
    });
  });

  describe('6. ROC Adjudication Benchmark Fixtures Consistency', () => {
    test('Validates ROC benchmark array has 5 verified orders', () => {
      expect(INC20A_ROC_BENCHMARKS.length).toBe(5);
      const stalwart = INC20A_ROC_BENCHMARKS.find(b => b.id === 'roc-pune-2025-stalwart');
      expect(stalwart).toBeDefined();
      expect(stalwart?.companyPenalty).toBe(50000);
      expect(stalwart?.totalAdjudicatedLiability).toBe(134000);

      const metropolis = INC20A_ROC_BENCHMARKS.find(b => b.id === 'roc-bangalore-2026-metropolis');
      expect(metropolis).toBeDefined();
      expect(metropolis?.totalAdjudicatedLiability).toBe(350000);
    });
  });
});
