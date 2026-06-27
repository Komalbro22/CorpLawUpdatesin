export type FormType = 'AOC-4' | 'MGT-7' | 'DIR-3-KYC' | 'DPT-3' | 'LLP-11' | 'LLP-8'

// ─────────────────────────────────────────────────────────────────────────────
// MOA REGISTRATION FEE — OPC / SMALL COMPANIES
// Table A, items 1a/1b, Rule 12 Annexure (as amended 26.01.2018)
//
// Zero-fee provision (SPICe+ only, post-26.01.2018): capital ≤ ₹10L → ₹0.
// Above ₹10L: base ₹2,000 + ₹200 per ₹10,000 or part thereof above ₹10L.
// ─────────────────────────────────────────────────────────────────────────────
export function getOpcSmallIncorporationFee(capital: number): number {
  if (capital <= 1000000) return 2000;
  return 2000 + Math.ceil((capital - 1000000) / 10000) * 200;
}

// ─────────────────────────────────────────────────────────────────────────────
// MOA REGISTRATION FEE — OTHER COMPANIES (Private, Public, Section 8, etc.)
// Table A, items 1c/2, Rule 12 Annexure
//
// Zero-fee provision (SPICe+ only, post-26.01.2018): capital ≤ ₹10L → ₹0.
// Above ₹10L: base ₹5,000 + progressive tiers (starting from ₹1L baseline):
//   Tier 1  ₹1L – ₹5L    : ₹400 per ₹10K
//   Tier 2  ₹5L – ₹50L   : ₹300 per ₹10K
//   Tier 3  ₹50L – ₹1Cr  : ₹100 per ₹1L  (per audit-verified schedule)
//   Tier 4  above ₹1Cr   : ₹75  per ₹10K
// Hard cap: total additional fees ≤ ₹2,50,00,000.
// ─────────────────────────────────────────────────────────────────────────────
export function getOtherCompanyIncorporationFee(capital: number): number {
  if (capital <= 100000) return 5000;

  let additionalFee = 0;
  const BASE   = 100000;    // ₹1L — tier calculations start here
  const T1_CAP = 500000;    // ₹5L
  const T2_CAP = 5000000;   // ₹50L
  const T3_CAP = 10000000;  // ₹1Cr

  // Tier 1: ₹1L–₹5L at ₹400/₹10K
  if (capital > BASE) {
    additionalFee += Math.ceil((Math.min(capital, T1_CAP) - BASE) / 10000) * 400;
  }
  // Tier 2: ₹5L–₹50L at ₹300/₹10K
  if (capital > T1_CAP) {
    additionalFee += Math.ceil((Math.min(capital, T2_CAP) - T1_CAP) / 10000) * 300;
  }
  // Tier 3: ₹50L–₹1Cr at ₹100/₹1L  (audit-verified: 50 blocks × ₹100 = ₹5,000 for this tier)
  if (capital > T2_CAP) {
    additionalFee += Math.ceil((Math.min(capital, T3_CAP) - T2_CAP) / 100000) * 100;
  }
  // Tier 4: above ₹1Cr at ₹75/₹10K
  if (capital > T3_CAP) {
    additionalFee += Math.ceil((capital - T3_CAP) / 10000) * 75;
  }

  additionalFee = Math.min(additionalFee, 25000000); // ₹2.5Cr cap
  return 5000 + additionalFee;
}

// ─────────────────────────────────────────────────────────────────────────────
// LLP NORMAL FILING FEE — contribution-based slab
// Rule 36 & Annexure-A, LLP Rules 2009. Applies equally to all LLPs (Regular
// and Small). The Small LLP concession applies only to ADDITIONAL fees.
//
// Slab boundaries (lower-inclusive, tested against the ≤ operator):
//   < ₹1L  → ₹50  |  ≤ ₹5L → ₹100  |  ≤ ₹10L → ₹150
//   < ₹25L → ₹200 |  < ₹1Cr → ₹400 |  ≥ ₹1Cr → ₹600
// ─────────────────────────────────────────────────────────────────────────────
export function getLLPNormalFee(contribution: number): number {
  if (contribution < 100000)  return 50;   // < ₹1L
  if (contribution < 500000)  return 100;  // ₹1L ≤ x < ₹5L
  if (contribution < 1000000) return 150;  // ₹5L ≤ x < ₹10L
  if (contribution < 2500000) return 200;  // ₹10L ≤ x < ₹25L
  if (contribution < 10000000) return 400; // ₹25L ≤ x < ₹1Cr
  return 600;                               // ≥ ₹1Cr
}

export interface CalculationResult {
  standard: number
  late: number
  total: number
  daysDelayed: number
  source: string
  legalNotes?: string
}

/**
 * Normal filing fee for document filings (items 5 & 6, Table A, Rule 12 Annexure,
 * Companies (Registration Offices and Fees) Rules, 2014).
 *
 * This unified slab applies to ALL company types — Private, Public, OPC, Small Company,
 * and Section 8 companies alike. There is no concessional normal filing fee for OPC/Small
 * Companies on post-incorporation filings (AOC-4, MGT-7, etc.).
 *
 * NOTE: The zero-fee SPICe+ provision (capital ≤ ₹10L, post 26.01.2018) applies ONLY at
 * incorporation and is NOT applicable here.
 */
export function getNormalFilingFee(capitalInRupees: number): number {
  if (capitalInRupees < 0) return 0;
  if (capitalInRupees < 100000) return 200;
  if (capitalInRupees < 500000) return 300;
  if (capitalInRupees < 2500000) return 400;
  if (capitalInRupees < 10000000) return 500;
  return 600;
}

/**
 * @deprecated Use getNormalFilingFee(capital) — the isSmallOrOPC and isSection8 flags
 * are no longer honoured for normal filing fees (items 5 & 6). Kept for call-site
 * compatibility; parameters are ignored.
 */
export function getCompanyStandardFee(nominalCapital: number, _isSmallOrOPC: boolean = false, _isSection8: boolean = false): number {
  return getNormalFilingFee(nominalCapital);
}

export function getDaysDelay(dueDate: Date, filingDate: Date): number {
  const ms = filingDate.getTime() - dueDate.getTime()
  return Math.max(0, Math.floor(ms / 86_400_000))
}

export function getStatutoryDueDate(form: FormType, financialYear: number): Date {
  switch (form) {
    case 'AOC-4':
      return new Date(financialYear + 1, 9, 30) // October 30 (30 days from assumed AGM Sept 30)
    case 'MGT-7':
      return new Date(financialYear + 1, 10, 29) // November 29 (60 days from AGM)
    case 'DIR-3-KYC':
      return new Date(financialYear + 1, 8, 30) // September 30 annually
    case 'DPT-3':
      return new Date(financialYear + 1, 5, 30) // June 30 annually
    case 'LLP-11':
      return new Date(financialYear + 1, 4, 30) // May 30 annually
    case 'LLP-8':
      return new Date(financialYear + 1, 9, 30) // October 30 annually
  }
}

export function calculateFees(
  form: FormType,
  delay: number,
  nominalCapital: number,
  isSmallOrOPC: boolean,
  isAmnestyActive: boolean = false,
  isSection8: boolean = false
): CalculationResult {
  if (isAmnestyActive && form !== 'DIR-3-KYC') {
    const standard = getNormalFilingFee(nominalCapital)
    return {
      standard,
      late: 0,
      total: standard,
      daysDelayed: delay,
      source: 'MCA Amnesty Waiver Scheme (CFSS Framework Directive)',
      legalNotes: 'Waiver Active: All daily additional late filing fees are completely waived under current policy.'
    }
  }

  if (form === 'DIR-3-KYC') {
    const late = delay > 0 ? 5000 : 0
    return {
      standard: 0,
      late,
      total: late,
      daysDelayed: delay,
      source: 'Section 12(1A) proviso, Companies Act, 2013 read with Rule 12A of Companies Rules, 2014.',
      legalNotes: 'DIN Late Fee: Flat ₹5,000 statutory fee applies for re-activation or delay after September 30.'
    }
  }

  // Decoupled LLP Fee Slabs (Amended Effective April 1, 2022)
  if (form === 'LLP-11' || form === 'LLP-8') {
    const isSmallLLP = nominalCapital <= 2500000
    let normalFee = 0;
    if (nominalCapital <= 100000) normalFee = 50;
    else if (nominalCapital <= 500000) normalFee = 100;
    else if (nominalCapital <= 1000000) normalFee = 150;
    else if (nominalCapital <= 2500000) normalFee = 200;
    else if (nominalCapital <= 10000000) normalFee = 400;
    else normalFee = 600;

    let late = 0
    if (delay > 0) {
      late = getLLPAdditionalFee(delay, normalFee, isSmallLLP)
    }

    return {
      standard: normalFee,
      late,
      total: normalFee + late,
      daysDelayed: delay,
      source: 'Rule 36 & Annexure-A of Limited Liability Partnership Rules, 2009 (As amended by LLP Second Amendment Rules, 2022, effective April 1, 2022).',
      legalNotes: 'LLP Slabs: The flat ₹100/day penalty was replaced by a slab multiplier system based on the delay period.'
    }
  }

  // Standard Company Forms: AOC-4, MGT-7, DPT-3
  const standard = getNormalFilingFee(nominalCapital)
  let late = 0

  if (delay > 0) {
    if (form === 'MGT-7' || form === 'AOC-4') {
      late = delay * 100 // Statutory ₹100/day
      return {
        standard,
        late,
        total: standard + late,
        daysDelayed: delay,
        source: 'Section 403 of Companies Act, 2013 read with Companies (Registration Offices and Fees) Amendment Rules, 2018 (effective July 1, 2018).',
        legalNotes: 'Standard Penalties: Additional late fee of ₹100 per day is calculated daily without any statutory maximum cap.'
      }
    } else {
      // General forms (e.g. DPT-3) use time-slab multiplier (Table B, Rule 12 Annexure)
      let multiplier = 1
      if (delay <= 15) multiplier = 1
      else if (delay <= 30) multiplier = 2
      else if (delay <= 60) multiplier = 4
      else if (delay <= 90) multiplier = 6
      else if (delay <= 180) multiplier = 10
      else multiplier = 12

      late = standard * multiplier
      return {
        standard,
        late,
        total: standard + late,
        daysDelayed: delay,
        source: 'Companies (Registration Offices and Fees) Rules, 2014.',
        legalNotes: 'General Forms: Additional late fee is calculated using a multiplier (up to 12×) on the normal filing fee based on delay period.'
      }
    }
  }

  return {
    standard,
    late: 0,
    total: standard,
    daysDelayed: delay,
    source: 'Companies Act, 2013 / LLP Act, 2008.',
    legalNotes: 'Filed on time. No additional fee applies.'
  }
}

/**
 * LLP additional fee (late fee) calculation per LLP Second Amendment Rules, 2022.
 * Beyond 360 days the fee is capped as a fixed amount — it does NOT continue to
 * accumulate per day after 360 days.
 *
 * @param delayDays  Number of days past the due date
 * @param normalFee  Normal filing fee for this LLP
 * @param isSmallLLP Whether this LLP qualifies as a Small LLP
 */
export function getLLPAdditionalFee(delayDays: number, normalFee: number, isSmallLLP: boolean): number {
  if (delayDays <= 0) return 0;

  if (isSmallLLP) {
    if (delayDays <= 15)  return normalFee * 1;
    if (delayDays <= 30)  return normalFee * 1;
    if (delayDays <= 60)  return normalFee * 2;
    if (delayDays <= 90)  return normalFee * 3;
    if (delayDays <= 180) return normalFee * 5;
    if (delayDays <= 360) return Math.round(normalFee * 7.5);
    // Beyond 360 days — hard cap at 25× (fixed, not per-day)
    return normalFee * 25;
  } else {
    if (delayDays <= 15)  return normalFee * 1;
    if (delayDays <= 30)  return normalFee * 2;
    if (delayDays <= 60)  return normalFee * 4;
    if (delayDays <= 90)  return normalFee * 6;
    if (delayDays <= 180) return normalFee * 10;
    if (delayDays <= 360) return normalFee * 15;
    // Beyond 360 days — hard cap at 50× (fixed, not per-day)
    return normalFee * 50;
  }
}
