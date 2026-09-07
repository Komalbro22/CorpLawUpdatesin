import {
  getPas6DueDate,
  getPas6NormalFee,
  getPas6LateMultiplier,
  evaluatePas6Exemption,
  calculateSection450Penalty,
  calculatePas6Compliance,
  PAS6_DELAY_SLABS,
  PAS6_COMPLIANCE_ROADMAP,
  HalfYearPeriod,
  CompanyClassification
} from '../lib/rule-engine/pas6-engine';

describe('Form PAS-6 Statutory Determination Engine', () => {
  describe('1. Statutory Due Date Calculation (Rule 9A & 9B)', () => {
    it('calculates H1 (Apr-Sep) due date as 29 November (60 calendar days from 30 Sep)', () => {
      expect(getPas6DueDate(2025, 'apr_sep')).toBe('2025-11-29');
      expect(getPas6DueDate(2026, 'apr_sep')).toBe('2026-11-29');
      expect(getPas6DueDate(2027, 'apr_sep')).toBe('2027-11-29');
    });

    it('calculates H2 (Oct-Mar) due date as 30 May of following calendar year (60 calendar days from 31 Mar)', () => {
      expect(getPas6DueDate(2025, 'oct_mar')).toBe('2026-05-30');
      expect(getPas6DueDate(2026, 'oct_mar')).toBe('2027-05-30');
    });
  });

  describe('2. Table A Normal Filing Fees (Companies Fees Rules, 2014)', () => {
    it('returns ₹0 for negative capital', () => {
      expect(getPas6NormalFee(-1000)).toBe(0);
    });

    it('returns ₹200 for nominal share capital less than ₹1,00,000', () => {
      expect(getPas6NormalFee(0)).toBe(200);
      expect(getPas6NormalFee(50000)).toBe(200);
      expect(getPas6NormalFee(99999)).toBe(200);
    });

    it('returns ₹300 for nominal share capital ₹1,00,000 to ₹4,99,999', () => {
      expect(getPas6NormalFee(100000)).toBe(300);
      expect(getPas6NormalFee(250000)).toBe(300);
      expect(getPas6NormalFee(499999)).toBe(300);
    });

    it('returns ₹400 for nominal share capital ₹5,00,000 to ₹24,99,999', () => {
      expect(getPas6NormalFee(500000)).toBe(400);
      expect(getPas6NormalFee(1000000)).toBe(400);
      expect(getPas6NormalFee(2499999)).toBe(400);
    });

    it('returns ₹500 for nominal share capital ₹25,00,000 to ₹99,99,999', () => {
      expect(getPas6NormalFee(2500000)).toBe(500);
      expect(getPas6NormalFee(5000000)).toBe(500);
      expect(getPas6NormalFee(9999999)).toBe(500);
    });

    it('returns ₹600 for nominal share capital ₹1,00,00,000 or more (≥ ₹1 Crore)', () => {
      expect(getPas6NormalFee(10000000)).toBe(600);
      expect(getPas6NormalFee(50000000)).toBe(600);
      expect(getPas6NormalFee(1000000000)).toBe(600);
    });
  });

  describe('3. Table B Late Fee Multipliers (Not ₹100/day AOC-4)', () => {
    it('returns 0× multiplier for on-time or advance filing (<= 0 days)', () => {
      expect(getPas6LateMultiplier(0)).toEqual({ multiplier: 0, label: 'On Time' });
      expect(getPas6LateMultiplier(-5)).toEqual({ multiplier: 0, label: 'On Time' });
    });

    it('returns 2× multiplier for delay up to 30 days', () => {
      expect(getPas6LateMultiplier(1).multiplier).toBe(2);
      expect(getPas6LateMultiplier(15).multiplier).toBe(2);
      expect(getPas6LateMultiplier(30).multiplier).toBe(2);
    });

    it('returns 4× multiplier for delay between 31 and 60 days', () => {
      expect(getPas6LateMultiplier(31).multiplier).toBe(4);
      expect(getPas6LateMultiplier(45).multiplier).toBe(4);
      expect(getPas6LateMultiplier(60).multiplier).toBe(4);
    });

    it('returns 6× multiplier for delay between 61 and 90 days', () => {
      expect(getPas6LateMultiplier(61).multiplier).toBe(6);
      expect(getPas6LateMultiplier(75).multiplier).toBe(6);
      expect(getPas6LateMultiplier(90).multiplier).toBe(6);
    });

    it('returns 10× multiplier for delay between 91 and 180 days', () => {
      expect(getPas6LateMultiplier(91).multiplier).toBe(10);
      expect(getPas6LateMultiplier(120).multiplier).toBe(10);
      expect(getPas6LateMultiplier(180).multiplier).toBe(10);
    });

    it('returns 12× multiplier for delay exceeding 180 days', () => {
      expect(getPas6LateMultiplier(181).multiplier).toBe(12);
      expect(getPas6LateMultiplier(365).multiplier).toBe(12);
      expect(getPas6LateMultiplier(500).multiplier).toBe(12);
    });
  });

  describe('4. Statutory Exemptions (Rules 9A(11) & 9B(7))', () => {
    it('exempts Small Companies under Section 2(85) / G.S.R. 880(E)', () => {
      const result = evaluatePas6Exemption('small_company', 50000000);
      expect(result.isExempt).toBe(true);
      expect(result.reason).toContain('Small Companies');
    });

    it('exempts Nidhi Companies under Rule 9A(11)', () => {
      const result = evaluatePas6Exemption('nidhi', 10000000);
      expect(result.isExempt).toBe(true);
      expect(result.reason).toContain('Nidhi Companies');
    });

    it('exempts Government Companies', () => {
      const result = evaluatePas6Exemption('govt_company', 100000000);
      expect(result.isExempt).toBe(true);
      expect(result.reason).toContain('Government Companies');
    });

    it('exempts Wholly-Owned Subsidiaries (WOS)', () => {
      const result = evaluatePas6Exemption('wholly_owned_sub', 10000000);
      expect(result.isExempt).toBe(true);
      expect(result.reason).toContain('Wholly-Owned Subsidiaries');
    });

    it('does NOT exempt unlisted public companies', () => {
      expect(evaluatePas6Exemption('unlisted_public', 10000000).isExempt).toBe(false);
    });

    it('does NOT exempt non-small private companies', () => {
      expect(evaluatePas6Exemption('non_small_private', 10000000).isExempt).toBe(false);
    });

    it('does NOT exempt holding/subsidiary entities (disqualified from small co status)', () => {
      expect(evaluatePas6Exemption('holding_subsidiary', 1000000).isExempt).toBe(false);
    });
  });

  describe('5. Section 450 Civil Adjudication Liability', () => {
    it('returns ₹0 penalties when delay is 0 days', () => {
      const res = calculateSection450Penalty(0, 3, false);
      expect(res.companyPenalty).toBe(0);
      expect(res.officerPenaltyPerOfficer).toBe(0);
      expect(res.totalOfficerPenalty).toBe(0);
      expect(res.totalAdjudication).toBe(0);
    });

    it('calculates standard Section 450 penalties accurately for 10 days delay and 2 officers', () => {
      // Company: ₹10,000 base + 10 * ₹1,000 = ₹20,000
      // Officer each: ₹10,000 base + 10 * ₹1,000 = ₹20,000
      // Total Officers (2): ₹40,000
      // Total: ₹60,000
      const res = calculateSection450Penalty(10, 2, false);
      expect(res.companyPenalty).toBe(20000);
      expect(res.officerPenaltyPerOfficer).toBe(20000);
      expect(res.totalOfficerPenalty).toBe(40000);
      expect(res.totalAdjudication).toBe(60000);
      expect(res.isSection446BApplied).toBe(false);
    });

    it('enforces statutory ceilings for prolonged defaults (Company ₹2,00,000; Officer ₹50,000)', () => {
      const res = calculateSection450Penalty(300, 3, false);
      expect(res.companyPenalty).toBe(200000);
      expect(res.officerPenaltyPerOfficer).toBe(50000);
      expect(res.totalOfficerPenalty).toBe(150000); // 3 * 50,000
      expect(res.totalAdjudication).toBe(350000);
    });

    it('applies Section 446B 50% concession for eligible startups/producer companies', () => {
      // Section 446B: base ₹5,000 + ₹500/day, company max ₹25,000, officer max ₹25,000
      const res = calculateSection450Penalty(10, 2, true);
      expect(res.companyPenalty).toBe(10000); // 5000 + 10 * 500
      expect(res.officerPenaltyPerOfficer).toBe(10000);
      expect(res.totalOfficerPenalty).toBe(20000);
      expect(res.totalAdjudication).toBe(30000);
      expect(res.isSection446BApplied).toBe(true);

      // Max ceiling test for Section 446B
      const resCapped = calculateSection450Penalty(200, 2, true);
      expect(resCapped.companyPenalty).toBe(25000);
      expect(resCapped.officerPenaltyPerOfficer).toBe(25000);
      expect(resCapped.totalOfficerPenalty).toBe(50000);
      expect(resCapped.totalAdjudication).toBe(75000);
    });
  });

  describe('6. Share Capital Reconciliation Audit', () => {
    it('detects balanced capital (100% match) between CDSL + NSDL + Physical and Issued Capital', () => {
      const result = calculatePas6Compliance({
        reportingYear: 2025,
        period: 'apr_sep',
        filingDate: '2025-11-20',
        authorizedCapital: 10000000,
        issuedSharesCount: 1000000,
        cdslDematShares: 500000,
        nsdlDematShares: 400000,
        physicalShares: 100000,
        numberOfOfficers: 2,
        companyType: 'unlisted_public'
      });

      expect(result.reconciliation.hasMismatch).toBe(false);
      expect(result.reconciliation.difference).toBe(0);
      expect(result.reconciliation.dematPercentage).toBe(90);
      expect(result.reconciliation.physicalPercentage).toBe(10);
      expect(result.isDelay).toBe(false);
      expect(result.totalMcaFee).toBe(600); // Normal fee for capital >= 1 Cr
      expect(result.additionalFee).toBe(0);
    });

    it('detects discrepancy/mismatch when depository + physical does not equal issued shares', () => {
      const result = calculatePas6Compliance({
        reportingYear: 2025,
        period: 'apr_sep',
        filingDate: '2025-11-20',
        authorizedCapital: 10000000,
        issuedSharesCount: 1000000,
        cdslDematShares: 400000,
        nsdlDematShares: 400000,
        physicalShares: 100000, // Total = 900,000 vs 1,000,000 (100,000 missing)
        numberOfOfficers: 2,
        companyType: 'unlisted_public'
      });

      expect(result.reconciliation.hasMismatch).toBe(true);
      expect(result.reconciliation.difference).toBe(-100000);
      expect(result.warnings.some(w => w.includes('Capital Reconciliation Mismatch'))).toBe(true);
    });

    it('calculates full dual financial exposure on delayed filing', () => {
      // Due date is 2025-11-29. Filing on 2026-01-13 = 45 days delay -> 4x multiplier
      const result = calculatePas6Compliance({
        reportingYear: 2025,
        period: 'apr_sep',
        filingDate: '2026-01-13',
        authorizedCapital: 10000000, // Normal fee ₹600
        issuedSharesCount: 100000,
        cdslDematShares: 80000,
        nsdlDematShares: 20000,
        physicalShares: 0,
        numberOfOfficers: 3,
        companyType: 'unlisted_public'
      });

      expect(result.isDelay).toBe(true);
      expect(result.daysOfDelay).toBe(45);
      expect(result.lateMultiplier).toBe(4);
      expect(result.normalFee).toBe(600);
      expect(result.additionalFee).toBe(2400); // 4 * 600
      expect(result.totalMcaFee).toBe(3000); // 600 + 2400

      // Section 450: 10,000 + 45 * 1000 = 55,000
      // Company: 55,000
      // Officer each: 50,000 (capped at 50k)
      // Officers (3): 150,000
      // Total Adjudication: 205,000
      expect(result.companyAdjudicationPenalty).toBe(55000);
      expect(result.officerPenaltyPerOfficer).toBe(50000);
      expect(result.totalOfficerPenalty).toBe(150000);
      expect(result.totalAdjudicationExposure).toBe(205000);
      expect(result.totalStatutoryExposure).toBe(3000 + 205000);
    });

    it('zeroes out fees and penalties for exempt companies', () => {
      const result = calculatePas6Compliance({
        reportingYear: 2025,
        period: 'apr_sep',
        filingDate: '2026-03-01',
        authorizedCapital: 20000000,
        companyType: 'small_company'
      });

      expect(result.isExempt).toBe(true);
      expect(result.normalFee).toBe(0);
      expect(result.additionalFee).toBe(0);
      expect(result.totalMcaFee).toBe(0);
      expect(result.totalAdjudicationExposure).toBe(0);
      expect(result.totalStatutoryExposure).toBe(0);
      expect(result.breakdown[0].isWaived).toBe(true);
    });
  });

  describe('7. Compliance Roadmap & Constants Integrity', () => {
    it('verifies 6 delay slabs covering 0 to Infinity days', () => {
      expect(PAS6_DELAY_SLABS.length).toBe(6);
      expect(PAS6_DELAY_SLABS[0].multiplier).toBe(0);
      expect(PAS6_DELAY_SLABS[5].multiplier).toBe(12);
    });

    it('verifies 5 step statutory compliance roadmap', () => {
      expect(PAS6_COMPLIANCE_ROADMAP.length).toBe(5);
      expect(PAS6_COMPLIANCE_ROADMAP[0].action).toContain('Obtain ISIN');
      expect(PAS6_COMPLIANCE_ROADMAP[4].action).toContain('Submit e-Form PAS-6');
    });
  });
});
