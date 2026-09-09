import {
  calculateMsme1Compliance,
  calculateSection16Interest,
  evaluateMsmeApplicability,
  getMsme1DueDate,
  CURRENT_RBI_BANK_RATE,
  MSME_PENAL_INTEREST_RATE
} from '@/lib/rule-engine/msme1-engine';

describe('MSME Form 1 Statutory Rule Engine', () => {
  describe('Due Date Determination', () => {
    test('Apr-Sep half-year due date is 31 October', () => {
      const { dueDateStr, dueDateFormatted, periodEnd } = getMsme1DueDate('Apr-Sep', '2026-2027');
      expect(dueDateStr).toBe('2026-10-31');
      expect(dueDateFormatted).toBe('31 October 2026');
      expect(periodEnd).toBe('30 September 2026');
    });

    test('Oct-Mar half-year due date is 30 April of next calendar year', () => {
      const { dueDateStr, dueDateFormatted, periodEnd } = getMsme1DueDate('Oct-Mar', '2026-2027');
      expect(dueDateStr).toBe('2027-04-30');
      expect(dueDateFormatted).toBe('30 April 2027');
      expect(periodEnd).toBe('31 March 2027');
    });
  });

  describe('Portal Fees (₹0 rule)', () => {
    test('Portal normal fee and late fee are strictly ₹0 under all circumstances', () => {
      const result = calculateMsme1Compliance({
        halfYear: 'Apr-Sep',
        financialYear: '2026-2027',
        buyerType: 'private_limited',
        numOfficers: 2,
        manualDelayDays: 120
      });
      expect(result.portalNormalFee).toBe(0);
      expect(result.portalLateFee).toBe(0);
      expect(result.portalTotalPayable).toBe(0);
    });
  });

  describe('Section 405(4) Adjudication Penalties', () => {
    test('On-time filing (0 delay) incurs ₹0 penalty', () => {
      const result = calculateMsme1Compliance({
        halfYear: 'Apr-Sep',
        financialYear: '2026-2027',
        buyerType: 'private_limited',
        numOfficers: 2,
        manualDelayDays: 0
      });
      expect(result.isDelayed).toBe(false);
      expect(result.companyPenalty).toBe(0);
      expect(result.officerPenaltyPerOfficer).toBe(0);
      expect(result.totalSection405Exposure).toBe(0);
    });

    test('30 days delay: ₹20k + (30 × ₹1k) = ₹50k for company and ₹50k each officer', () => {
      const result = calculateMsme1Compliance({
        halfYear: 'Apr-Sep',
        financialYear: '2026-2027',
        buyerType: 'private_limited',
        numOfficers: 2,
        manualDelayDays: 30
      });
      expect(result.companyPenalty).toBe(50_000);
      expect(result.officerPenaltyPerOfficer).toBe(50_000);
      expect(result.totalOfficersPenalty).toBe(100_000);
      expect(result.totalSection405Exposure).toBe(150_000);
    });

    test('90 days delay: ₹20k + (90 × ₹1k) = ₹1.10L for company and ₹1.10L each officer', () => {
      const result = calculateMsme1Compliance({
        halfYear: 'Apr-Sep',
        financialYear: '2026-2027',
        buyerType: 'private_limited',
        numOfficers: 2,
        manualDelayDays: 90
      });
      expect(result.companyPenalty).toBe(110_000);
      expect(result.officerPenaltyPerOfficer).toBe(110_000);
      expect(result.totalOfficersPenalty).toBe(220_000);
      expect(result.totalSection405Exposure).toBe(330_000);
    });

    test('200 days delay: ₹20k + (200 × ₹1k) = ₹2.20L for company and ₹2.20L each officer', () => {
      const result = calculateMsme1Compliance({
        halfYear: 'Apr-Sep',
        financialYear: '2026-2027',
        buyerType: 'private_limited',
        numOfficers: 2,
        manualDelayDays: 200
      });
      expect(result.companyPenalty).toBe(220_000);
      expect(result.officerPenaltyPerOfficer).toBe(220_000);
      expect(result.totalOfficersPenalty).toBe(440_000);
      expect(result.totalSection405Exposure).toBe(660_000);
    });

    test('350 days delay enforces statutory ₹3,00,000 cap per party', () => {
      const result = calculateMsme1Compliance({
        halfYear: 'Apr-Sep',
        financialYear: '2026-2027',
        buyerType: 'private_limited',
        numOfficers: 3,
        manualDelayDays: 350
      });
      expect(result.companyPenalty).toBe(300_000);
      expect(result.officerPenaltyPerOfficer).toBe(300_000);
      expect(result.totalOfficersPenalty).toBe(900_000); // 3 officers × 300k
      expect(result.totalSection405Exposure).toBe(1_200_000);
    });
  });

  describe('Section 16 MSMED Act Compound Interest (16.50% p.a.)', () => {
    test('Correct interest rate based on RBI Bank Rate 5.50%', () => {
      expect(CURRENT_RBI_BANK_RATE).toBe(5.50);
      expect(MSME_PENAL_INTEREST_RATE).toBe(16.50);
    });

    test('Computes compound interest with monthly rests', () => {
      const principal = 1_000_000; // ₹10 Lakhs
      const delayDays = 60; // approx 2 months
      const interest = calculateSection16Interest(principal, delayDays, 16.50);
      expect(interest).toBeGreaterThan(27000);
      expect(interest).toBeLessThan(29000);
    });

    test('Zero principal or zero delay results in ₹0 interest', () => {
      expect(calculateSection16Interest(0, 60)).toBe(0);
      expect(calculateSection16Interest(500000, 0)).toBe(0);
    });
  });

  describe('MCA V3 Disclosure Trap & Category Triggers', () => {
    test('Triggered when payments were made late (>45d) even if outstanding balance at period end is zero', () => {
      const result = calculateMsme1Compliance({
        halfYear: 'Apr-Sep',
        financialYear: '2026-2027',
        buyerType: 'private_limited',
        numOfficers: 2,
        manualDelayDays: 0,
        transactions: {
          paidWithin45Days: 500_000,
          paidAfter45Days: 200_000, // V3 Trap trigger!
          outstandingWithin45Days: 0,
          outstandingOver45Days: 0
        }
      });
      expect(result.isFilingTriggeredOnV3).toBe(true);
      expect(result.v3TriggerReason).toContain('V3 Trap');
    });

    test('Not triggered if all payments were within 45 days and no overdue balance', () => {
      const result = calculateMsme1Compliance({
        halfYear: 'Apr-Sep',
        financialYear: '2026-2027',
        buyerType: 'private_limited',
        numOfficers: 2,
        manualDelayDays: 0,
        transactions: {
          paidWithin45Days: 1_000_000,
          paidAfter45Days: 0,
          outstandingWithin45Days: 100_000,
          outstandingOver45Days: 0
        }
      });
      expect(result.isFilingTriggeredOnV3).toBe(false);
    });
  });

  describe('Entity & Supplier Applicability', () => {
    test('LLP is exempt from Section 405', () => {
      const app = evaluateMsmeApplicability('llp');
      expect(app.isBuyerCovered).toBe(false);
      expect(app.buyerReason).toContain('Limited Liability Partnerships');
    });

    test('Partnership / Proprietorship is exempt', () => {
      const app = evaluateMsmeApplicability('partnership_proprietorship');
      expect(app.isBuyerCovered).toBe(false);
    });

    test('Medium supplier does not trigger MSME-1', () => {
      const app = evaluateMsmeApplicability('private_limited', 'medium');
      expect(app.isBuyerCovered).toBe(true);
      expect(app.isSupplierCovered).toBe(false);
      expect(app.supplierReason).toContain('Medium Enterprises');
    });

    test('Retail/Wholesale trader is excluded from mandatory Chapter V benefits', () => {
      const app = evaluateMsmeApplicability('private_limited', 'trader');
      expect(app.isSupplierCovered).toBe(false);
    });
  });
});
