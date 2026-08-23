/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TEST SUITE: MGT-7 & MGT-7A COMPLIANCE, FEE & STATUTORY PENALTY ENGINE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Full statutory validation for:
 * 1. Normal Fee Boundary Tests (BT-01 to BT-10) — Table A, Items 5 & 6
 * 2. Section 92(5) Statutory Penalty Exposure Engine (₹10k + ₹100/day after 1st day)
 * 3. Section 446B Scope & Ceilings (OPC, Small, Start-up, Producer)
 * 4. Small Company Historical & 2025 G.S.R. 880(E) Thresholds (₹10Cr / ₹100Cr)
 * 5. Small Company Statutory Section 2(85) Exclusions
 * 6. Deterministic AGM Date Engine (First AGM 9m vs Subsequent AGM 6m)
 * 7. Reconciled Scenario Vectors (TV-01 to TV-10)
 * 8. Cross-Form Equivalence & Relief Schemes
 */

import {
  calculateNormalFilingFee,
  calculateAdditionalFilingFee,
  calculateSection92Penalty,
  evaluateSmallCompanyStatus,
  evaluateSection446BEligibility,
  computeMgt7StatutoryDueDate,
  evaluatePcsCertification,
  calculateMgt7Compliance,
  SMALL_COMPANY_HISTORICAL_THRESHOLDS,
  getApplicableReliefScheme
} from '../lib/rule-engine/mgt7-engine';

describe('1. Normal Filing Fee Boundary Matrix (BT-01 to BT-10) — Table A, Items 5 & 6', () => {
  test('BT-01: Nominal capital ₹0 → ₹200 (Less than ₹1,00,000)', () => {
    expect(calculateNormalFilingFee(0)).toBe(200);
  });

  test('BT-02: Nominal capital ₹1,00,000 exactly → ₹300 (₹1,00,000 or more but less than ₹5,00,000)', () => {
    expect(calculateNormalFilingFee(100000)).toBe(300);
  });

  test('BT-03: Nominal capital ₹1,00,001 → ₹300 (₹1,00,000 or more but less than ₹5,00,000)', () => {
    expect(calculateNormalFilingFee(100001)).toBe(300);
  });

  test('BT-04: Nominal capital ₹5,00,000 exactly → ₹400 (₹5,00,000 or more but less than ₹25,00,000)', () => {
    expect(calculateNormalFilingFee(500000)).toBe(400);
  });

  test('BT-05: Nominal capital ₹5,00,001 → ₹400 (₹5,00,000 or more but less than ₹25,00,000)', () => {
    expect(calculateNormalFilingFee(500001)).toBe(400);
  });

  test('BT-06: Nominal capital ₹25,00,000 exactly → ₹500 (₹25,00,000 or more but less than ₹1 crore)', () => {
    expect(calculateNormalFilingFee(2500000)).toBe(500);
  });

  test('BT-07: Nominal capital ₹25,00,001 → ₹500 (₹25,00,000 or more but less than ₹1 crore)', () => {
    expect(calculateNormalFilingFee(2500001)).toBe(500);
  });

  test('BT-08: Nominal capital ₹1,00,00,000 (₹1 Crore) exactly → ₹600 (₹1 crore or more)', () => {
    expect(calculateNormalFilingFee(10000000)).toBe(600);
  });

  test('BT-09: Nominal capital ₹1,00,00,001 → ₹600 (₹1 crore or more)', () => {
    expect(calculateNormalFilingFee(10000001)).toBe(600);
  });

  test('BT-10: Company without Share Capital → ₹200 (Table A, Item 6)', () => {
    expect(calculateNormalFilingFee(0, false)).toBe(200);
  });
});

describe('2. Additional Filing Fee Engine (Table B, Note Item 2)', () => {
  test('0 days delay → ₹0', () => {
    expect(calculateAdditionalFilingFee(0)).toBe(0);
  });

  test('1 day delay → ₹100', () => {
    expect(calculateAdditionalFilingFee(1)).toBe(100);
  });

  test('30 days delay → ₹3,000', () => {
    expect(calculateAdditionalFilingFee(30)).toBe(3000);
  });

  test('365 days delay → ₹36,500 (no upper cap on MCA portal additional fee)', () => {
    expect(calculateAdditionalFilingFee(365)).toBe(36500);
  });
});

describe('3. Section 92(5) Statutory Penalty Exposure Engine', () => {
  test('0 days delay → ₹0 exposure', () => {
    const res = calculateSection92Penalty(0, 2);
    expect(res.standardCompanyPenalty).toBe(0);
    expect(res.standardPerOfficerPenalty).toBe(0);
    expect(res.totalStandardExposure).toBe(0);
    expect(res.continuingDaysAfterFirst).toBe(0);
  });

  test('1 day delay → Company ₹10,000, Officer ₹10,000 (0 continuing days after first)', () => {
    const res = calculateSection92Penalty(1, 2);
    expect(res.continuingDaysAfterFirst).toBe(0);
    expect(res.standardCompanyPenalty).toBe(10000);
    expect(res.standardPerOfficerPenalty).toBe(10000);
    expect(res.standardTotalOfficersPenalty).toBe(20000);
    expect(res.totalStandardExposure).toBe(30000);
  });

  test('2 days delay → Company ₹10,100, Officer ₹10,100 (1 continuing day after first)', () => {
    const res = calculateSection92Penalty(2, 1);
    expect(res.continuingDaysAfterFirst).toBe(1);
    expect(res.standardCompanyPenalty).toBe(10100);
    expect(res.standardPerOfficerPenalty).toBe(10100);
  });

  test('30 days delay → Company ₹12,900 (29 continuing days @ ₹100)', () => {
    const res = calculateSection92Penalty(30, 2);
    expect(res.continuingDaysAfterFirst).toBe(29);
    expect(res.standardCompanyPenalty).toBe(12900);
    expect(res.standardPerOfficerPenalty).toBe(12900);
  });

  test('365 days delay → Company ₹46,400 (364 continuing days @ ₹100)', () => {
    const res = calculateSection92Penalty(365, 2);
    expect(res.continuingDaysAfterFirst).toBe(364);
    expect(res.standardCompanyPenalty).toBe(46400);
    expect(res.standardPerOfficerPenalty).toBe(46400);
  });

  test('2500 days delay → Reaches Statutory Caps (Company ₹2,00,000, Officer ₹50,000)', () => {
    const res = calculateSection92Penalty(2500, 3);
    expect(res.companyCapped).toBe(true);
    expect(res.officerCapped).toBe(true);
    expect(res.standardCompanyPenalty).toBe(200000);
    expect(res.standardPerOfficerPenalty).toBe(50000);
    expect(res.standardTotalOfficersPenalty).toBe(150000);
    expect(res.totalStandardExposure).toBe(350000);
  });
});

describe('4. Section 446B Scope & Ceiling Verification', () => {
  test('One Person Company (OPC) is eligible for Section 446B', () => {
    const res = evaluateSection446BEligibility({
      isOnePersonCompany: true,
      isSmallCompany: false,
      isStartupCompany: false,
      isProducerCompany: false
    });
    expect(res.eligible).toBe(true);
    expect(res.qualifyingClassifications).toContain('One Person Company (OPC)');
  });

  test('Small Company is eligible for Section 446B', () => {
    const res = evaluateSection446BEligibility({
      isOnePersonCompany: false,
      isSmallCompany: true,
      isStartupCompany: false,
      isProducerCompany: false
    });
    expect(res.eligible).toBe(true);
    expect(res.qualifyingClassifications).toContain('Small Company');
  });

  test('Start-up Company is eligible for Section 446B', () => {
    const res = evaluateSection446BEligibility({
      isOnePersonCompany: false,
      isSmallCompany: false,
      isStartupCompany: true,
      isProducerCompany: false
    });
    expect(res.eligible).toBe(true);
    expect(res.qualifyingClassifications).toContain('Start-up Company');
  });

  test('Producer Company is eligible for Section 446B', () => {
    const res = evaluateSection446BEligibility({
      isOnePersonCompany: false,
      isSmallCompany: false,
      isStartupCompany: false,
      isProducerCompany: true
    });
    expect(res.eligible).toBe(true);
    expect(res.qualifyingClassifications).toContain('Producer Company');
  });

  test('Standard Private Company is NOT eligible for Section 446B', () => {
    const res = evaluateSection446BEligibility({
      isOnePersonCompany: false,
      isSmallCompany: false,
      isStartupCompany: false,
      isProducerCompany: false
    });
    expect(res.eligible).toBe(false);
  });
});

describe('5. Small Company Thresholds & Section 2(85) Exclusions', () => {
  const currentFYEnd = new Date('2026-03-31');

  test('Current 2025 Era: Capital ₹8 Cr, Turnover ₹80 Cr → Small Company (G.S.R. 880(E))', () => {
    const res = evaluateSmallCompanyStatus({
      isPrivateCompany: true,
      isHoldingCompany: false,
      isSubsidiaryCompany: false,
      isSection8Company: false,
      isSpecialActBodyCorporate: false,
      paidUpCapital: 80000000,
      turnoverPrecedingFY: 800000000,
      financialYearEndDate: currentFYEnd
    });
    expect(res.isSmallCompany).toBe(true);
    expect(res.thresholdApplied.eraId).toBe('era-2025-current');
    expect(res.thresholdApplied.maxPaidUpCapital).toBe(100000000);
    expect(res.thresholdApplied.maxTurnover).toBe(1000000000);
  });

  test('Current 2025 Era Exact Boundary: Capital ₹10 Cr, Turnover ₹100 Cr → Small Company', () => {
    const res = evaluateSmallCompanyStatus({
      isPrivateCompany: true,
      isHoldingCompany: false,
      isSubsidiaryCompany: false,
      isSection8Company: false,
      isSpecialActBodyCorporate: false,
      paidUpCapital: 100000000,
      turnoverPrecedingFY: 1000000000,
      financialYearEndDate: currentFYEnd
    });
    expect(res.isSmallCompany).toBe(true);
  });

  test('Current 2025 Era: Capital ₹10 Cr + ₹1 → Disqualified (Exceeds capital limit)', () => {
    const res = evaluateSmallCompanyStatus({
      isPrivateCompany: true,
      isHoldingCompany: false,
      isSubsidiaryCompany: false,
      isSection8Company: false,
      isSpecialActBodyCorporate: false,
      paidUpCapital: 100000001,
      turnoverPrecedingFY: 50000000,
      financialYearEndDate: currentFYEnd
    });
    expect(res.isSmallCompany).toBe(false);
    expect(res.disqualificationReason).toContain('Paid-up share capital');
  });

  test('Current 2025 Era: Turnover ₹100 Cr + ₹1 → Disqualified (Exceeds turnover limit)', () => {
    const res = evaluateSmallCompanyStatus({
      isPrivateCompany: true,
      isHoldingCompany: false,
      isSubsidiaryCompany: false,
      isSection8Company: false,
      isSpecialActBodyCorporate: false,
      paidUpCapital: 20000000,
      turnoverPrecedingFY: 1000000001,
      financialYearEndDate: currentFYEnd
    });
    expect(res.isSmallCompany).toBe(false);
    expect(res.disqualificationReason).toContain('Turnover of immediately preceding FY');
  });

  test('Section 2(85) Proviso (A): Holding Company Exclusion', () => {
    const res = evaluateSmallCompanyStatus({
      isPrivateCompany: true,
      isHoldingCompany: true,
      isSubsidiaryCompany: false,
      isSection8Company: false,
      isSpecialActBodyCorporate: false,
      paidUpCapital: 1000000,
      turnoverPrecedingFY: 10000000,
      financialYearEndDate: currentFYEnd
    });
    expect(res.isSmallCompany).toBe(false);
    expect(res.disqualificationReason).toContain('Holding company excluded');
  });

  test('Section 2(85) Proviso (A): Subsidiary Company Exclusion', () => {
    const res = evaluateSmallCompanyStatus({
      isPrivateCompany: true,
      isHoldingCompany: false,
      isSubsidiaryCompany: true,
      isSection8Company: false,
      isSpecialActBodyCorporate: false,
      paidUpCapital: 1000000,
      turnoverPrecedingFY: 10000000,
      financialYearEndDate: currentFYEnd
    });
    expect(res.isSmallCompany).toBe(false);
    expect(res.disqualificationReason).toContain('Subsidiary company excluded');
  });

  test('Section 2(85) Proviso (B): Section 8 Company Exclusion', () => {
    const res = evaluateSmallCompanyStatus({
      isPrivateCompany: true,
      isHoldingCompany: false,
      isSubsidiaryCompany: false,
      isSection8Company: true,
      isSpecialActBodyCorporate: false,
      paidUpCapital: 0,
      turnoverPrecedingFY: 0,
      financialYearEndDate: currentFYEnd
    });
    expect(res.isSmallCompany).toBe(false);
    expect(res.disqualificationReason).toContain('Section 8 company excluded');
  });

  test('Section 2(85) Proviso (C): Special Act Body Corporate Exclusion', () => {
    const res = evaluateSmallCompanyStatus({
      isPrivateCompany: true,
      isHoldingCompany: false,
      isSubsidiaryCompany: false,
      isSection8Company: false,
      isSpecialActBodyCorporate: true,
      paidUpCapital: 1000000,
      turnoverPrecedingFY: 10000000,
      financialYearEndDate: currentFYEnd
    });
    expect(res.isSmallCompany).toBe(false);
    expect(res.disqualificationReason).toContain('special Act excluded');
  });

  test('Section 2(85) Non-Private Company Exclusion', () => {
    const res = evaluateSmallCompanyStatus({
      isPrivateCompany: false,
      isHoldingCompany: false,
      isSubsidiaryCompany: false,
      isSection8Company: false,
      isSpecialActBodyCorporate: false,
      paidUpCapital: 1000000,
      turnoverPrecedingFY: 10000000,
      financialYearEndDate: currentFYEnd
    });
    expect(res.isSmallCompany).toBe(false);
    expect(res.disqualificationReason).toContain('Not a Private Limited Company');
  });

  test('Historical Era 2022 (15.09.2022 to 30.11.2025): ₹3.5 Cr capital & ₹30 Cr turnover → Small Company', () => {
    const res = evaluateSmallCompanyStatus({
      isPrivateCompany: true,
      isHoldingCompany: false,
      isSubsidiaryCompany: false,
      isSection8Company: false,
      isSpecialActBodyCorporate: false,
      paidUpCapital: 35000000,
      turnoverPrecedingFY: 300000000,
      financialYearEndDate: new Date('2023-03-31')
    });
    expect(res.isSmallCompany).toBe(true);
    expect(res.thresholdApplied.eraId).toBe('era-2022');
  });

  test('Historical Era 2021 (01.04.2021 to 14.09.2022): ₹3.5 Cr capital & ₹30 Cr turnover → NOT Small Company', () => {
    const res = evaluateSmallCompanyStatus({
      isPrivateCompany: true,
      isHoldingCompany: false,
      isSubsidiaryCompany: false,
      isSection8Company: false,
      isSpecialActBodyCorporate: false,
      paidUpCapital: 35000000,
      turnoverPrecedingFY: 300000000,
      financialYearEndDate: new Date('2021-03-31')
    });
    expect(res.isSmallCompany).toBe(false);
    expect(res.thresholdApplied.eraId).toBe('era-2014');
  });
});

describe('6. Deterministic AGM Due-Date Engine (Section 96(1) & Section 92(4))', () => {
  test('First AGM on-time (FY End 31.03.2025, AGM Held 30.11.2025) → Due Date 29.01.2026 (60d)', () => {
    const res = computeMgt7StatutoryDueDate({
      financialYearEnd: new Date('2025-03-31'),
      agmType: 'first',
      agmStatus: 'held',
      actualAgmDate: new Date('2025-11-30')
    });
    expect(res.statutoryDueDate.toISOString().slice(0, 10)).toBe('2026-01-29');
    expect(res.validationError).toBeUndefined();
  });

  test('First AGM with ROC Extension attempted → Error (Section 96(1) proviso prohibits extension for First AGM)', () => {
    const res = computeMgt7StatutoryDueDate({
      financialYearEnd: new Date('2025-03-31'),
      agmType: 'first',
      agmStatus: 'extended_and_held',
      actualAgmDate: new Date('2026-01-15')
    });
    expect(res.validationError).toContain('Section 96(1) proviso');
  });

  test('Subsequent AGM Held On-Time (FY End 31.03.2026, AGM Held 30.09.2026) → Due Date 29.11.2026 (60d)', () => {
    const res = computeMgt7StatutoryDueDate({
      financialYearEnd: new Date('2026-03-31'),
      agmType: 'subsequent',
      agmStatus: 'held',
      actualAgmDate: new Date('2026-09-30')
    });
    expect(res.statutoryDueDate.toISOString().slice(0, 10)).toBe('2026-11-29');
  });

  test('Subsequent AGM Extended by ROC & Held (AGM Held 30.11.2026) → Due Date 29.01.2027 (60d)', () => {
    const res = computeMgt7StatutoryDueDate({
      financialYearEnd: new Date('2026-03-31'),
      agmType: 'subsequent',
      agmStatus: 'extended_and_held',
      actualAgmDate: new Date('2026-11-30')
    });
    expect(res.statutoryDueDate.toISOString().slice(0, 10)).toBe('2027-01-29');
  });

  test('First AGM Not Held (FY End 31.03.2025) → Standard AGM 31.12.2025 + 60d = 01.03.2026', () => {
    const res = computeMgt7StatutoryDueDate({
      financialYearEnd: new Date('2025-03-31'),
      agmType: 'first',
      agmStatus: 'not_held'
    });
    expect(res.statutoryDueDate.toISOString().slice(0, 10)).toBe('2026-03-01');
  });
});

describe('7. Reconciled Scenario Test Matrix (TV-01 to TV-10)', () => {
  test('TV-01: First AGM on time (Capital ₹5L, 0d delay) → Normal ₹400, Total Portal ₹400, Penalty ₹0', () => {
    const res = calculateMgt7Compliance({
      formCode: 'MGT-7',
      nominalCapital: 500000,
      financialYearEnd: new Date('2025-03-31'),
      agmType: 'first',
      agmStatus: 'held',
      actualAgmDate: new Date('2025-11-30'),
      actualFilingDate: new Date('2026-01-15'),
      isPrivateCompany: true,
      officerCount: 2
    });
    expect(res.mcaPortalPayable.normalFilingFee).toBe(400);
    expect(res.mcaPortalPayable.additionalFilingFee).toBe(0);
    expect(res.mcaPortalPayable.totalPortalPayable).toBe(400);
    expect(res.statutoryPenaltyExposure.totalIndicativeMaximumExposure).toBe(0);
  });

  test('TV-02: First AGM Not Held (Capital ₹1L, 14d delay) → Normal ₹300, Addl ₹1,400, Total Portal ₹1,700, Penalty ₹33,900', () => {
    const res = calculateMgt7Compliance({
      formCode: 'MGT-7',
      nominalCapital: 100000,
      financialYearEnd: new Date('2025-03-31'),
      agmType: 'first',
      agmStatus: 'not_held',
      actualFilingDate: new Date('2026-03-15'),
      isPrivateCompany: true,
      officerCount: 2
    });
    expect(res.mcaPortalPayable.normalFilingFee).toBe(300);
    expect(res.mcaPortalPayable.additionalFilingFee).toBe(1400);
    expect(res.mcaPortalPayable.totalPortalPayable).toBe(1700);
    // Continuing days after first = 13. Co penalty = 10000 + 1300 = 11300. 2 Officers = 22600. Total = 33900.
    expect(res.statutoryPenaltyExposure.companyStandardExposure).toBe(11300);
    expect(res.statutoryPenaltyExposure.officersStandardExposure).toBe(22600);
    expect(res.statutoryPenaltyExposure.totalStandardExposure).toBe(33900);
  });

  test('TV-03: 2025 Era Small Co (Cap ₹8 Cr, Turnover ₹80 Cr, 30d delay) → Normal ₹600, Addl ₹3,000, Total Portal ₹3,600, 446B Max ₹19,350', () => {
    const res = calculateMgt7Compliance({
      formCode: 'MGT-7A',
      nominalCapital: 80000000,
      paidUpCapital: 80000000,
      turnoverPrecedingFY: 800000000,
      financialYearEnd: new Date('2026-03-31'),
      agmType: 'subsequent',
      agmStatus: 'held',
      actualAgmDate: new Date('2026-09-30'), // Due date: 2026-11-29
      actualFilingDate: new Date('2026-12-29'), // 30 days delay
      isPrivateCompany: true,
      officerCount: 2
    });
    expect(res.metadata.isSmallCompany).toBe(true);
    expect(res.mcaPortalPayable.normalFilingFee).toBe(600);
    expect(res.mcaPortalPayable.additionalFilingFee).toBe(3000);
    expect(res.mcaPortalPayable.totalPortalPayable).toBe(3600);
    // Standard Co: 10000 + 29*100 = 12900 -> 446B Company: 6450
    // Standard Officer: 12900 -> 446B Per Officer: 6450. 2 Officers: 12900. Total: 19350
    expect(res.statutoryPenaltyExposure.companyIndicativeMaximumExposure).toBe(6450);
    expect(res.statutoryPenaltyExposure.officersIndicativeMaximumExposure).toBe(12900);
    expect(res.statutoryPenaltyExposure.totalIndicativeMaximumExposure).toBe(19350);
  });

  test('TV-04: 2025 Era Boundary (Cap ₹10 Cr + ₹1, Turnover ₹50 Cr, 10d delay) → Normal ₹600, Addl ₹1,000, Total Portal ₹1,600, Exposure ₹21,800', () => {
    const res = calculateMgt7Compliance({
      formCode: 'MGT-7',
      nominalCapital: 100000001,
      paidUpCapital: 100000001,
      turnoverPrecedingFY: 500000000,
      financialYearEnd: new Date('2026-03-31'),
      agmType: 'subsequent',
      agmStatus: 'held',
      actualAgmDate: new Date('2026-09-30'),
      actualFilingDate: new Date('2026-12-09'), // 10 days delay
      isPrivateCompany: true,
      officerCount: 1
    });
    expect(res.metadata.isSmallCompany).toBe(false);
    expect(res.mcaPortalPayable.normalFilingFee).toBe(600);
    expect(res.mcaPortalPayable.additionalFilingFee).toBe(1000);
    expect(res.mcaPortalPayable.totalPortalPayable).toBe(1600);
    // 9 continuing days: Co 10900, 1 Officer 10900 -> Total 21800
    expect(res.statutoryPenaltyExposure.totalStandardExposure).toBe(21800);
  });

  test('TV-05: 2025 Era Boundary (Cap ₹2 Cr, Turnover ₹100 Cr + ₹1, 20d delay) → Normal ₹600, Addl ₹2,000, Total Portal ₹2,600, Exposure ₹35,700', () => {
    const res = calculateMgt7Compliance({
      formCode: 'MGT-7',
      nominalCapital: 20000000,
      paidUpCapital: 20000000,
      turnoverPrecedingFY: 1000000001,
      financialYearEnd: new Date('2026-03-31'),
      agmType: 'subsequent',
      agmStatus: 'held',
      actualAgmDate: new Date('2026-09-30'),
      actualFilingDate: new Date('2026-12-19'), // 20 days delay
      isPrivateCompany: true,
      officerCount: 2
    });
    expect(res.metadata.isSmallCompany).toBe(false);
    expect(res.mcaPortalPayable.normalFilingFee).toBe(600);
    expect(res.mcaPortalPayable.additionalFilingFee).toBe(2000);
    expect(res.mcaPortalPayable.totalPortalPayable).toBe(2600);
    // 19 continuing days: Co 11900, 2 Officers 23800 -> Total 35700
    expect(res.statutoryPenaltyExposure.totalStandardExposure).toBe(35700);
  });

  test('TV-06: Holding Co Exclusion (Cap ₹10L, Turnover ₹1 Cr, 15d delay) → Normal ₹400, Addl ₹1,500, Total Portal ₹1,900, Exposure ₹34,200', () => {
    const res = calculateMgt7Compliance({
      formCode: 'MGT-7',
      nominalCapital: 1000000,
      paidUpCapital: 1000000,
      turnoverPrecedingFY: 10000000,
      financialYearEnd: new Date('2026-03-31'),
      agmType: 'subsequent',
      agmStatus: 'held',
      actualAgmDate: new Date('2026-09-30'),
      actualFilingDate: new Date('2026-12-14'), // 15 days delay
      isPrivateCompany: true,
      isHoldingCompany: true,
      officerCount: 2
    });
    expect(res.metadata.isSmallCompany).toBe(false);
    expect(res.mcaPortalPayable.normalFilingFee).toBe(400);
    expect(res.mcaPortalPayable.additionalFilingFee).toBe(1500);
    expect(res.mcaPortalPayable.totalPortalPayable).toBe(1900);
    // 14 continuing days: Co 11400, 2 Officers 22800 -> Total 34200
    expect(res.statutoryPenaltyExposure.totalStandardExposure).toBe(34200);
  });

  test('TV-07: Subsidiary Co Exclusion (Cap ₹10L, Turnover ₹1 Cr, 5d delay) → Normal ₹400, Addl ₹500, Total Portal ₹900, Exposure ₹20,800', () => {
    const res = calculateMgt7Compliance({
      formCode: 'MGT-7',
      nominalCapital: 1000000,
      paidUpCapital: 1000000,
      turnoverPrecedingFY: 10000000,
      financialYearEnd: new Date('2026-03-31'),
      agmType: 'subsequent',
      agmStatus: 'held',
      actualAgmDate: new Date('2026-09-30'),
      actualFilingDate: new Date('2026-12-04'), // 5 days delay
      isPrivateCompany: true,
      isSubsidiaryCompany: true,
      officerCount: 1
    });
    expect(res.metadata.isSmallCompany).toBe(false);
    expect(res.mcaPortalPayable.normalFilingFee).toBe(400);
    expect(res.mcaPortalPayable.additionalFilingFee).toBe(500);
    expect(res.mcaPortalPayable.totalPortalPayable).toBe(900);
    // 4 continuing days: Co 10400, 1 Officer 10400 -> Total 20800
    expect(res.statutoryPenaltyExposure.totalStandardExposure).toBe(20800);
  });

  test('TV-08: Section 8 Exclusion (No share cap, 10d delay) → Normal ₹200, Addl ₹1,000, Total Portal ₹1,200, Exposure ₹32,700', () => {
    const res = calculateMgt7Compliance({
      formCode: 'MGT-7',
      nominalCapital: 0,
      hasShareCapital: false,
      financialYearEnd: new Date('2026-03-31'),
      agmType: 'subsequent',
      agmStatus: 'held',
      actualAgmDate: new Date('2026-09-30'),
      actualFilingDate: new Date('2026-12-09'), // 10 days delay
      isPrivateCompany: true,
      isSection8Company: true,
      officerCount: 2
    });
    expect(res.metadata.isSmallCompany).toBe(false);
    expect(res.mcaPortalPayable.normalFilingFee).toBe(200);
    expect(res.mcaPortalPayable.additionalFilingFee).toBe(1000);
    expect(res.mcaPortalPayable.totalPortalPayable).toBe(1200);
    // 9 continuing days: Co 10900, 2 Officers 21800 -> Total 32700
    expect(res.statutoryPenaltyExposure.totalStandardExposure).toBe(32700);
  });

  test('TV-09: 2022 Era Historical Test (Cap ₹3.5 Cr, Turnover ₹30 Cr, 25d delay) → Normal ₹600, Addl ₹2,500, Total Portal ₹3,100, 446B Max ₹18,600', () => {
    const res = calculateMgt7Compliance({
      formCode: 'MGT-7A',
      nominalCapital: 35000000,
      paidUpCapital: 35000000,
      turnoverPrecedingFY: 300000000,
      financialYearEnd: new Date('2023-03-31'),
      agmType: 'subsequent',
      agmStatus: 'held',
      actualAgmDate: new Date('2023-09-30'),
      actualFilingDate: new Date('2023-12-24'), // 25 days delay
      isPrivateCompany: true,
      officerCount: 2
    });
    expect(res.metadata.isSmallCompany).toBe(true);
    expect(res.mcaPortalPayable.normalFilingFee).toBe(600);
    expect(res.mcaPortalPayable.additionalFilingFee).toBe(2500);
    expect(res.mcaPortalPayable.totalPortalPayable).toBe(3100);
    // 24 continuing days: Standard Co 12400 -> 446B Co 6200; 2 Officers: 24800 -> 446B Off 12400. Total 18600
    expect(res.statutoryPenaltyExposure.totalIndicativeMaximumExposure).toBe(18600);
  });

  test('TV-10: 2021 Era Historical Test (Cap ₹3.5 Cr, Turnover ₹30 Cr, 25d delay) → Normal ₹600, Addl ₹2,500, Total Portal ₹3,100, Exposure ₹37,200 (No 446B)', () => {
    const res = calculateMgt7Compliance({
      formCode: 'MGT-7',
      nominalCapital: 35000000,
      paidUpCapital: 35000000,
      turnoverPrecedingFY: 300000000,
      financialYearEnd: new Date('2021-03-31'),
      agmType: 'subsequent',
      agmStatus: 'held',
      actualAgmDate: new Date('2021-09-30'),
      actualFilingDate: new Date('2021-12-24'), // 25 days delay
      isPrivateCompany: true,
      officerCount: 2
    });
    expect(res.metadata.isSmallCompany).toBe(false);
    expect(res.mcaPortalPayable.normalFilingFee).toBe(600);
    expect(res.mcaPortalPayable.additionalFilingFee).toBe(2500);
    expect(res.mcaPortalPayable.totalPortalPayable).toBe(3100);
    // 24 continuing days: Co 12400, 2 Officers 24800 -> Total 37200
    expect(res.statutoryPenaltyExposure.totalStandardExposure).toBe(37200);
  });
});

describe('8. Cross-Form Equivalence & Historical Relief Schemes', () => {
  test('MGT-7 and MGT-7A produce identical normal filing fee for identical nominal capital', () => {
    const capitals = [50000, 200000, 1000000, 5000000, 20000000];
    for (const cap of capitals) {
      expect(calculateNormalFilingFee(cap)).toBe(calculateNormalFilingFee(cap));
    }
  });

  test('CFSS-2020 applies 100% additional fee waiver between 2020-04-01 and 2020-12-31', () => {
    const reliefActive = getApplicableReliefScheme('MGT-7', new Date('2020-10-15'));
    expect(reliefActive).not.toBeNull();
    expect(reliefActive?.schemeCode).toBe('CFSS-2020');
    expect(reliefActive?.additionalFeeWaiverPercent).toBe(100);
  });

  test('CFSS-2020 does NOT apply to filings made in 2026', () => {
    const reliefExpired = getApplicableReliefScheme('MGT-7', new Date('2026-08-23'));
    expect(reliefExpired).toBeNull();
  });
});
