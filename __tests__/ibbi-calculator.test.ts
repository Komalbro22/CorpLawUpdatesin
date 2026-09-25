import {
  calculateMonthsOfDelay,
  calculateLiquidationFee,
  calculateCirpFee,
  calculateLiquidatorFee,
} from '@/lib/ibbi-calculator/engine';

describe('IBBI Calculator Engine', () => {
  describe('calculateMonthsOfDelay', () => {
    it('returns 0 months when submitted on or before due date', () => {
      const res = calculateMonthsOfDelay('2026-06-15', '2026-06-15');
      expect(res.months).toBe(0);
      expect(res.days).toBe(0);

      const resEarly = calculateMonthsOfDelay('2026-06-15', '2026-06-10');
      expect(resEarly.months).toBe(0);
    });

    it('calculates 1 month minimum for any delay within same month', () => {
      const res = calculateMonthsOfDelay('2026-06-15', '2026-06-20');
      expect(res.months).toBe(1);
      expect(res.days).toBe(5);
    });

    it('calculates calendar months accurately across months', () => {
      // Due 15 May 2026, submitted 24 September 2026
      const res = calculateMonthsOfDelay('2026-05-15', '2026-09-24');
      // May to Sept = 4 months, plus day 24 > day 15 = 5 months
      expect(res.months).toBe(5);
    });
  });

  describe('calculateLiquidationFee (Regulation 47B & Circular 107/2026)', () => {
    it('charges 0 when submitted on time', () => {
      const result = calculateLiquidationFee({
        formId: 'LIQ-1',
        dueDate: '2026-09-15',
        submissionDate: '2026-09-10',
      });
      expect(result.totalPayable).toBe(0);
      expect(result.totalBaseFee).toBe(0);
      expect(result.totalGst).toBe(0);
    });

    it('charges ₹590 (₹500 base + ₹90 GST) per form per month of delay', () => {
      const result = calculateLiquidationFee({
        formId: 'LIQ-1',
        dueDate: '2026-08-15',
        submissionDate: '2026-09-24', // 2 calendar months delay
        numberOfForms: 1,
      });
      expect(result.monthsOfDelay).toBe(2);
      expect(result.totalBaseFee).toBe(1000);
      expect(result.totalGst).toBe(180);
      expect(result.totalPayable).toBe(1180);
    });

    it('handles multi-form batch calculation accurately', () => {
      const result = calculateLiquidationFee({
        formId: 'LIQ-2',
        dueDate: '2026-05-15',
        submissionDate: '2026-09-15', // 4 calendar months
        numberOfForms: 3,
      });
      expect(result.monthsOfDelay).toBe(4);
      expect(result.numberOfForms).toBe(3);
      // 4 months * 500 * 3 forms = 6000 base
      expect(result.totalBaseFee).toBe(6000);
      // 18% GST = 1080
      expect(result.totalGst).toBe(1080);
      expect(result.totalPayable).toBe(7080);
    });

    it('highlights correction or updation rule', () => {
      const result = calculateLiquidationFee({
        formId: 'LIQ-3',
        dueDate: '2026-07-15',
        submissionDate: '2026-09-24',
        isCorrectionOrUpdation: true,
      });
      expect(result.isCorrectionOrUpdation).toBe(true);
      expect(result.statutoryNote).toContain('correction, updation, or otherwise');
    });
  });

  describe('calculateCirpFee (Regulation 40B)', () => {
    it('calculates CIRP delay fee accurately', () => {
      const result = calculateCirpFee({
        formId: 'CIRP-1',
        dueDate: '2026-08-01',
        submissionDate: '2026-09-01', // 1 month
        numberOfForms: 1,
      });
      expect(result.monthsOfDelay).toBe(1);
      expect(result.totalBaseFee).toBe(500);
      expect(result.totalGst).toBe(90);
      expect(result.totalPayable).toBe(590);
    });
  });

  describe('calculateLiquidatorFee (Regulation 4(2)(b))', () => {
    it('calculates realization fee on first 1 Crore at 5.0% for first 6 months', () => {
      const result = calculateLiquidatorFee(10000000, 0, '0-6m');
      // 5% of 1 Cr = 500,000
      expect(result.totalRealisationFee).toBe(500000);
      expect(result.totalLiquidatorFee).toBe(500000);
      expect(result.gstAmount).toBe(90000);
      expect(result.grossPayable).toBe(590000);
    });

    it('calculates tiered slabs across 10 Crores realization', () => {
      // 10 Cr = 1 Cr @ 5.0% + 9 Cr @ 3.75%
      // 500,000 + 3,375,000 = 3,875,000
      const result = calculateLiquidatorFee(100000000, 0, '0-6m');
      expect(result.totalRealisationFee).toBe(3875000);
    });
  });
});
