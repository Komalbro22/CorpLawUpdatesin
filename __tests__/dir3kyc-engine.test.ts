import {
  calculateDir3KycCompliance,
  calculateTriennialCycle,
  getFinancialYear,
  formatDateIndian,
  DIN_ALLOTMENT_PRESETS
} from '../lib/rule-engine/dir3kyc-engine';

describe('DIR-3 KYC Statutory Rule Engine (G.S.R. 943(E) & G.S.R. 300(E))', () => {
  describe('1. Triennial Cycle Calculations (Rule 12A(1))', () => {
    test('Allotted on or before 31 March 2025 (FY 2024-25 & prior) -> Next due April - 30 June 2028', () => {
      const cycle = calculateTriennialCycle('pre_2025');
      expect(cycle.nextDueYear).toBe(2028);
      expect(cycle.nextDueDate).toBe('30 June 2028');
      expect(cycle.nextDueWindow).toBe('April – 30 June 2028');
      expect(cycle.isFilingDueThisYear).toBe(false);
    });

    test('Allotted in FY 2025-26 -> Next due April - 30 June 2029', () => {
      const cycle = calculateTriennialCycle('fy_2025_26');
      expect(cycle.nextDueYear).toBe(2029);
      expect(cycle.nextDueDate).toBe('30 June 2029');
      expect(cycle.nextDueWindow).toBe('April – 30 June 2029');
      expect(cycle.isFilingDueThisYear).toBe(false);
    });

    test('Allotted in FY 2026-27 (Current FY) -> Next due April - 30 June 2030', () => {
      const cycle = calculateTriennialCycle('fy_2026_27');
      expect(cycle.nextDueYear).toBe(2030);
      expect(cycle.nextDueDate).toBe('30 June 2030');
      expect(cycle.nextDueWindow).toBe('April – 30 June 2030');
      expect(cycle.isFilingDueThisYear).toBe(false);
    });

    test('Custom allotment date in May 2025 -> FY 2025-26 -> Next due 2029', () => {
      const cycle = calculateTriennialCycle('custom', '2025-05-15');
      expect(cycle.anchorFy).toBe('FY 2025-26');
      expect(cycle.nextDueYear).toBe(2029);
      expect(cycle.nextDueDate).toBe('30 June 2029');
    });

    test('Custom allotment date in February 2025 -> FY 2024-25 -> Next due 2028', () => {
      const cycle = calculateTriennialCycle('custom', '2025-02-10');
      expect(cycle.anchorFy).toBe('FY 2024-25');
      expect(cycle.nextDueYear).toBe(2028);
      expect(cycle.nextDueDate).toBe('30 June 2028');
    });
  });

  describe('2. Fee Calculations (G.S.R. 300(E), Item VII)', () => {
    test('Routine triennial filing when NOT due in current FY -> ₹0 Fee, Compliant status', () => {
      const result = calculateDir3KycCompliance({
        filingType: 'routine',
        dinStatus: 'active',
        allotmentPresetId: 'pre_2025'
      });

      expect(result.totalMcaChallan).toBe(0);
      expect(result.statusColor).toBe('green');
      expect(result.statusBadge).toContain('Compliant — Next Routine KYC Due in 2028');
    });

    test('DIN Deactivated -> Flat ₹5,000 Reactivation Fee (No per-day compounding)', () => {
      const result = calculateDir3KycCompliance({
        filingType: 'reactivation',
        dinStatus: 'deactivated',
        allotmentPresetId: 'fy_2023_24_pending'
      });

      expect(result.lateOrReactivationFee).toBe(5000);
      expect(result.totalMcaChallan).toBe(5000);
      expect(result.statusColor).toBe('red');
      expect(result.statusBadge).toContain('DIN Deactivated — ₹5,000 Reactivation Required');
    });

    test('Event-based change filing under Rule 12A(2) -> Flat ₹500 Fee per filing', () => {
      const result = calculateDir3KycCompliance({
        filingType: 'change',
        dinStatus: 'active',
        allotmentPresetId: 'pre_2025',
        changeCategory: 'mobile',
        numberOfChangeFilings: 1
      });

      expect(result.changeFee).toBe(500);
      expect(result.totalMcaChallan).toBe(500);
      expect(result.statusColor).toBe('blue');
    });

    test('Multiple change filings (e.g. 2 filings) -> ₹1,000 Fee', () => {
      const result = calculateDir3KycCompliance({
        filingType: 'change',
        dinStatus: 'active',
        allotmentPresetId: 'pre_2025',
        changeCategory: 'multiple',
        numberOfChangeFilings: 2
      });

      expect(result.changeFee).toBe(1000);
      expect(result.totalMcaChallan).toBe(1000);
    });
  });

  describe('3. Event-Based Change Compliance (Rule 12A(2) 30-Day Window)', () => {
    test('Change filed within 30 days -> marked compliant within 30 days', () => {
      const result = calculateDir3KycCompliance({
        filingType: 'change',
        dinStatus: 'active',
        allotmentPresetId: 'pre_2025',
        changeCategory: 'address',
        changeDate: '2026-08-15',
        actualFilingDate: '2026-08-25' // 10 days later
      });

      expect(result.changeCompliance.isWithin30Days).toBe(true);
      expect(result.changeCompliance.isDelayed).toBe(false);
      expect(result.changeCompliance.daysFromChange).toBe(10);
      expect(result.changeCompliance.delayDays).toBe(0);
    });

    test('Change filed after 45 days -> marked delayed by 15 days', () => {
      const result = calculateDir3KycCompliance({
        filingType: 'change',
        dinStatus: 'active',
        allotmentPresetId: 'pre_2025',
        changeCategory: 'mobile',
        changeDate: '2026-07-01',
        actualFilingDate: '2026-08-15' // 45 days later
      });

      expect(result.changeCompliance.isWithin30Days).toBe(false);
      expect(result.changeCompliance.isDelayed).toBe(true);
      expect(result.changeCompliance.delayDays).toBe(15);
    });

    test('Change filing does NOT reset the triennial cycle', () => {
      const result = calculateDir3KycCompliance({
        filingType: 'change',
        dinStatus: 'active',
        allotmentPresetId: 'pre_2025',
        changeCategory: 'email'
      });

      // Next routine due year should still be 2028, NOT pushed to 2029 or 2030!
      expect(result.triennialCycle.nextDueYear).toBe(2028);
      expect(result.changeCompliance.nonResetRuleNote).toContain('does NOT extend or reset the 3-year triennial cycle');
    });
  });

  describe('4. Cascading Risks & Section 164(2) Disqualification', () => {
    test('Deactivated DIN with company filings pending -> Critical Risk flagged', () => {
      const result = calculateDir3KycCompliance({
        filingType: 'reactivation',
        dinStatus: 'deactivated',
        allotmentPresetId: 'pre_2025',
        hasCompanyFilingsPending: true
      });

      expect(result.cascadingRisk.riskLevel).toBe('Critical');
      expect(result.cascadingRisk.companyFilingBlocked).toBe(true);
      expect(result.cascadingRisk.disqualificationRiskSection164).toBe(true);
      expect(result.cascadingRisk.title).toContain('Section 164(2) Disqualification Risk');
    });

    test('Active compliant DIN -> No active risks', () => {
      const result = calculateDir3KycCompliance({
        filingType: 'routine',
        dinStatus: 'active',
        allotmentPresetId: 'fy_2025_26'
      });

      expect(result.cascadingRisk.hasRisk).toBe(false);
      expect(result.cascadingRisk.riskLevel).toBe('None');
    });
  });

  describe('5. Professional Certification Requirement (Sections 448 & 449)', () => {
    test('Certification is mandatory by CA/CS/CMA in practice', () => {
      const result = calculateDir3KycCompliance({
        filingType: 'routine',
        dinStatus: 'active',
        allotmentPresetId: 'pre_2025'
      });

      expect(result.professionalCertification.isMandatory).toBe(true);
      expect(result.professionalCertification.statutorySection).toContain('Section 448');
    });
  });
});
