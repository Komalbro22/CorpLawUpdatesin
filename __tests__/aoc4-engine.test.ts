/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TEST SUITE: FORM AOC-4 COMPLIANCE, FEE & STATUTORY PENALTY ENGINE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Full statutory validation against Companies Act, 2013 and Fees Rules, 2014:
 * 1. Normal Fee Boundary Tests (Table A, Items 5 & 6)
 * 2. Flat ₹100/Day Uncapped Delay Fee (Table B, Note Item 2)
 * 3. Section 137(3) Statutory Adjudication Penalties (Company & Officer caps)
 * 4. Section 446B 50% Relief & Halved Penalty Caps
 * 5. Deterministic Due Date Engine (30 days from AGM vs 180 days for OPC)
 * 6. Cash Flow Statement Exemption (Section 2(40) Proviso)
 * 7. XBRL Applicability Evaluation (Rule 3, XBRL Rules 2015)
 * 8. Comprehensive Compliance Calculation Vectors
 */

import {
  calculateAoc4NormalFilingFee,
  calculateAoc4AdditionalFilingFee,
  calculateSection137Penalty,
  evaluateAoc4SmallCompanyStatus,
  evaluateCashFlowExemption,
  evaluateXbrlApplicability,
  computeAoc4StatutoryDueDate,
  calculateAoc4Compliance
} from '../lib/rule-engine/aoc4-engine';

describe('1. Form AOC-4 Normal Filing Fee Slabs (Table A, Items 5 & 6)', () => {
  test('Nominal capital ₹0 -> ₹200 (Less than ₹1,00,000)', () => {
    expect(calculateAoc4NormalFilingFee(0)).toBe(200);
  });

  test('Nominal capital ₹99,999 -> ₹200', () => {
    expect(calculateAoc4NormalFilingFee(99999)).toBe(200);
  });

  test('Nominal capital ₹1,00,000 exactly -> ₹300', () => {
    expect(calculateAoc4NormalFilingFee(100000)).toBe(300);
  });

  test('Nominal capital ₹4,99,999 -> ₹300', () => {
    expect(calculateAoc4NormalFilingFee(499999)).toBe(300);
  });

  test('Nominal capital ₹5,00,000 exactly -> ₹400', () => {
    expect(calculateAoc4NormalFilingFee(500000)).toBe(400);
  });

  test('Nominal capital ₹24,99,999 -> ₹400', () => {
    expect(calculateAoc4NormalFilingFee(2499999)).toBe(400);
  });

  test('Nominal capital ₹25,00,000 exactly -> ₹500', () => {
    expect(calculateAoc4NormalFilingFee(2500000)).toBe(500);
  });

  test('Nominal capital ₹99,99,999 -> ₹500', () => {
    expect(calculateAoc4NormalFilingFee(9999999)).toBe(500);
  });

  test('Nominal capital ₹1,00,00,000 (₹1 Crore) exactly -> ₹600', () => {
    expect(calculateAoc4NormalFilingFee(10000000)).toBe(600);
  });

  test('Company without share capital -> flat ₹200 under Item 6', () => {
    expect(calculateAoc4NormalFilingFee(0, false)).toBe(200);
    expect(calculateAoc4NormalFilingFee(50000000, false)).toBe(200);
  });
});

describe('2. Table B Additional Late Filing Fees (Flat ₹100/Day Uncapped)', () => {
  test('0 days delay -> ₹0 additional fee', () => {
    expect(calculateAoc4AdditionalFilingFee(0)).toBe(0);
    expect(calculateAoc4AdditionalFilingFee(-5)).toBe(0);
  });

  test('1 day delay -> ₹100', () => {
    expect(calculateAoc4AdditionalFilingFee(1)).toBe(100);
  });

  test('15 days delay -> ₹1,500', () => {
    expect(calculateAoc4AdditionalFilingFee(15)).toBe(1500);
  });

  test('30 days delay -> ₹3,000', () => {
    expect(calculateAoc4AdditionalFilingFee(30)).toBe(3000);
  });

  test('60 days delay -> ₹6,000', () => {
    expect(calculateAoc4AdditionalFilingFee(60)).toBe(6000);
  });

  test('365 days delay -> ₹36,500 (strictly uncapped)', () => {
    expect(calculateAoc4AdditionalFilingFee(365)).toBe(36500);
  });

  test('1000 days delay -> ₹1,00,000 (no upper ceiling on MCA V3)', () => {
    expect(calculateAoc4AdditionalFilingFee(1000)).toBe(100000);
  });
});

describe('3. Section 137(3) Statutory Penalties Engine', () => {
  test('0 days delay -> No statutory penalties', () => {
    const p = calculateSection137Penalty(0, 2);
    expect(p.standardCompanyPenalty).toBe(0);
    expect(p.standardTotalOfficersPenalty).toBe(0);
  });

  test('1 day delay -> Base penalty of ₹10,000 for company, ₹10,000 per officer', () => {
    const p = calculateSection137Penalty(1, 2);
    expect(p.standardCompanyPenalty).toBe(10000);
    expect(p.standardOfficerPenaltyPerPerson).toBe(10000);
    expect(p.standardTotalOfficersPenalty).toBe(20000); // 2 officers × ₹10,000
    expect(p.continuingDays).toBe(0);
  });

  test('30 days delay -> Base ₹10,000 + (29 × ₹100) = ₹12,900', () => {
    const p = calculateSection137Penalty(30, 2);
    expect(p.standardCompanyPenalty).toBe(12900);
    expect(p.standardOfficerPenaltyPerPerson).toBe(12900);
    expect(p.standardTotalOfficersPenalty).toBe(25800);
  });

  test('Officer penalty caps at statutory limit of ₹50,000', () => {
    // ₹10,000 + (x * 100) = ₹50,000 -> x = 400 continuing days -> 401 days total delay
    const p = calculateSection137Penalty(500, 2);
    expect(p.standardOfficerPenaltyPerPerson).toBe(50000);
    expect(p.cappedOfficer).toBe(true);
    expect(p.standardTotalOfficersPenalty).toBe(100000); // 2 officers × ₹50,000
  });

  test('Company penalty caps at statutory limit of ₹2,00,000', () => {
    // ₹10,000 + (x * 100) = ₹2,00,000 -> x = 1900 continuing days
    const p = calculateSection137Penalty(2000, 2);
    expect(p.standardCompanyPenalty).toBe(200000);
    expect(p.cappedCompany).toBe(true);
  });
});

describe('4. Deterministic Due Date Engine (Section 137(1) & 3rd Proviso)', () => {
  test('Standard company with AGM on 30th September -> Due date 30th October (30 days)', () => {
    const res = computeAoc4StatutoryDueDate({
      financialYearEnd: new Date('2026-03-31'),
      isOnePersonCompany: false,
      agmType: 'subsequent',
      agmStatus: 'held',
      actualAgmDate: new Date('2026-09-30')
    });
    expect(res.statutoryDueDate.toISOString().slice(0, 10)).toBe('2026-10-30');
    expect(res.isOpcFiling).toBe(false);
  });

  test('One Person Company (OPC) -> 180 days from 31st March -> 27th September', () => {
    const res = computeAoc4StatutoryDueDate({
      financialYearEnd: new Date('2026-03-31'),
      isOnePersonCompany: true,
      agmType: 'subsequent',
      agmStatus: 'held'
    });
    expect(res.statutoryDueDate.toISOString().slice(0, 10)).toBe('2026-09-27');
    expect(res.isOpcFiling).toBe(true);
  });

  test('Subsequent AGM with ROC Extension to 31st December -> Due date 30th January', () => {
    const res = computeAoc4StatutoryDueDate({
      financialYearEnd: new Date('2026-03-31'),
      isOnePersonCompany: false,
      agmType: 'subsequent',
      agmStatus: 'extended_and_held',
      actualAgmDate: new Date('2026-12-31'),
      rocApprovedExtendedLastDate: new Date('2026-12-31')
    });
    expect(res.statutoryDueDate.toISOString().slice(0, 10)).toBe('2027-01-30');
  });

  test('First AGM ROC extension is statutorily prohibited under Section 96(1) proviso', () => {
    const res = computeAoc4StatutoryDueDate({
      financialYearEnd: new Date(2026, 2, 31),
      isOnePersonCompany: false,
      agmType: 'first',
      agmStatus: 'extended_and_held',
      rocApprovedExtendedLastDate: new Date(2027, 2, 31)
    });
    expect(res.validationError).toBeDefined();
    expect(res.validationError).toContain('First Annual General Meeting');
  });
});

describe('5. Cash Flow Exemption Evaluation (Section 2(40) Proviso)', () => {
  test('One Person Company is exempt from cash flow statement', () => {
    const res = evaluateCashFlowExemption(true, false, false, false);
    expect(res.isExempt).toBe(true);
    expect(res.statutoryBasis).toContain('Section 2(40)');
  });

  test('Small Company is exempt from cash flow statement', () => {
    const res = evaluateCashFlowExemption(false, true, false, false);
    expect(res.isExempt).toBe(true);
  });

  test('Dormant Company is exempt from cash flow statement', () => {
    const res = evaluateCashFlowExemption(false, false, true, false);
    expect(res.isExempt).toBe(true);
  });

  test('DPIIT-recognized Startup is exempt from cash flow statement', () => {
    const res = evaluateCashFlowExemption(false, false, false, true);
    expect(res.isExempt).toBe(true);
  });

  test('Standard non-small Private Company is MANDATED to file cash flow statement', () => {
    const res = evaluateCashFlowExemption(false, false, false, false);
    expect(res.isExempt).toBe(false);
  });
});

describe('6. XBRL Applicability Checker (Rule 3, XBRL Rules 2015)', () => {
  test('Listed company must file AOC-4 XBRL', () => {
    const res = evaluateXbrlApplicability({
      isListed: true,
      isIndianSubsidiaryOfListed: false,
      paidUpCapital: 10000000,
      turnover: 10000000,
      isIndAsPreparer: false,
      isNbfc: false,
      isBankingOrInsurance: false
    });
    expect(res.mustFileXbrl).toBe(true);
    expect(res.applicableFormCode).toBe('AOC-4-XBRL');
  });

  test('Paid-up capital >= ₹5 Crore must file AOC-4 XBRL', () => {
    const res = evaluateXbrlApplicability({
      isListed: false,
      isIndianSubsidiaryOfListed: false,
      paidUpCapital: 50000000, // ₹5 Cr
      turnover: 10000000,
      isIndAsPreparer: false,
      isNbfc: false,
      isBankingOrInsurance: false
    });
    expect(res.mustFileXbrl).toBe(true);
    expect(res.applicableFormCode).toBe('AOC-4-XBRL');
  });

  test('Turnover >= ₹100 Crore must file AOC-4 XBRL', () => {
    const res = evaluateXbrlApplicability({
      isListed: false,
      isIndianSubsidiaryOfListed: false,
      paidUpCapital: 1000000,
      turnover: 1000000000, // ₹100 Cr
      isIndAsPreparer: false,
      isNbfc: false,
      isBankingOrInsurance: false
    });
    expect(res.mustFileXbrl).toBe(true);
    expect(res.applicableFormCode).toBe('AOC-4-XBRL');
  });

  test('Standard small company (< ₹5 Cr capital, < ₹100 Cr turnover) files standard AOC-4', () => {
    const res = evaluateXbrlApplicability({
      isListed: false,
      isIndianSubsidiaryOfListed: false,
      paidUpCapital: 10000000, // ₹1 Cr
      turnover: 50000000,     // ₹5 Cr
      isIndAsPreparer: false,
      isNbfc: false,
      isBankingOrInsurance: false
    });
    expect(res.mustFileXbrl).toBe(false);
    expect(res.applicableFormCode).toBe('AOC-4');
  });

  test('NBFC adopting Ind AS files AOC-4 NBFC (Ind AS)', () => {
    const res = evaluateXbrlApplicability({
      isListed: false,
      isIndianSubsidiaryOfListed: false,
      paidUpCapital: 100000000,
      turnover: 2000000000,
      isIndAsPreparer: true,
      isNbfc: true,
      isBankingOrInsurance: false
    });
    expect(res.mustFileXbrl).toBe(false);
    expect(res.applicableFormCode).toBe('AOC-4-NBFC');
  });
});

describe('7. Comprehensive Compliance Calculation Vectors & Section 446B', () => {
  test('Vector 1: Small Company filing on time -> Normal fee ₹400, Additional fee ₹0', () => {
    const result = calculateAoc4Compliance({
      formCode: 'AOC-4',
      nominalCapital: 1000000, // ₹10 Lakhs -> Table A bracket ₹400
      financialYearEnd: new Date('2026-03-31'),
      agmType: 'subsequent',
      agmStatus: 'held',
      actualAgmDate: new Date('2026-09-30'),
      actualFilingDate: new Date('2026-10-20'), // 20th Oct (before 30th Oct)
      isPrivateCompany: true,
      paidUpCapital: 1000000,
      turnoverPrecedingFY: 5000000
    });

    expect(result.mcaPortalPayable.normalFilingFee).toBe(400);
    expect(result.mcaPortalPayable.additionalFilingFee).toBe(0);
    expect(result.mcaPortalPayable.totalPortalPayable).toBe(400);
    expect(result.metadata.daysDelayed).toBe(0);
    expect(result.statutoryPenaltyExposure.totalIndicativeMaximumExposure).toBe(0);
    expect(result.cashFlowExemption.isExempt).toBe(true);
  });

  test('Vector 2: Small Company delayed by 30 days -> Section 446B 50% penalty relief applied', () => {
    const result = calculateAoc4Compliance({
      formCode: 'AOC-4',
      nominalCapital: 1000000,
      financialYearEnd: new Date('2026-03-31'),
      agmType: 'subsequent',
      agmStatus: 'held',
      actualAgmDate: new Date('2026-09-30'), // Due date: 2026-10-30
      actualFilingDate: new Date('2026-11-29'), // 30 days delay (Oct has 31 days: 1 day in Oct + 29 in Nov = 30 days)
      isPrivateCompany: true,
      paidUpCapital: 1000000,
      turnoverPrecedingFY: 5000000,
      officerCount: 2
    });

    expect(result.metadata.daysDelayed).toBe(30);
    expect(result.mcaPortalPayable.normalFilingFee).toBe(400);
    expect(result.mcaPortalPayable.additionalFilingFee).toBe(3000); // 30 × ₹100
    expect(result.mcaPortalPayable.totalPortalPayable).toBe(3400);

    // Section 137(3) raw: ₹10,000 + (29 × ₹100) = ₹12,900
    // Section 446B 50% discount: Math.floor(12900 * 0.5) = ₹6,450
    expect(result.metadata.section446BEligible).toBe(true);
    expect(result.statutoryPenaltyExposure.section446BApplied).toBe(true);
    expect(result.statutoryPenaltyExposure.companyIndicativeMaximumExposure).toBe(6450);
    expect(result.statutoryPenaltyExposure.officersIndicativeMaximumExposure).toBe(12900); // 2 × ₹6,450
    expect(result.statutoryPenaltyExposure.totalIndicativeMaximumExposure).toBe(19350);
  });

  test('Vector 3: Non-small entity delayed beyond cap -> Section 137(3) standard caps enforced without 446B', () => {
    const result = calculateAoc4Compliance({
      formCode: 'AOC-4',
      nominalCapital: 200000000, // ₹20 Cr
      financialYearEnd: new Date('2026-03-31'),
      agmType: 'subsequent',
      agmStatus: 'held',
      actualAgmDate: new Date('2026-09-30'),
      actualFilingDate: new Date('2032-10-30'), // ~6 years later (over 2000 days delay)
      isPrivateCompany: false, // Public company
      paidUpCapital: 200000000,
      turnoverPrecedingFY: 2000000000,
      officerCount: 2
    });

    expect(result.metadata.section446BEligible).toBe(false);
    expect(result.mcaPortalPayable.normalFilingFee).toBe(600);
    expect(result.statutoryPenaltyExposure.companyIndicativeMaximumExposure).toBe(200000); // ₹2 Lakhs max cap
    expect(result.statutoryPenaltyExposure.officersIndicativeMaximumExposure).toBe(100000); // 2 × ₹50,000 max cap
    expect(result.cashFlowExemption.isExempt).toBe(false);
  });
});
