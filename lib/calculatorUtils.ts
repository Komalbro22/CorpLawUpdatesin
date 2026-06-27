import { getNormalFilingFee, getOpcSmallIncorporationFee, getOtherCompanyIncorporationFee } from './fee-calculator-core';

export interface CalculatorParams {
  formSlug: string;
  companyType: string;
  capital: number;
  delayDays: number;
  // Specific params
  isRepeatOffender?: boolean;
  newCapital?: number;
  state?: string;
  chargeAmount?: number;
  // ADT-1 specific: appointment date of auditor (day 0 for delay count)
  appointmentDate?: string;
}

export interface CalculatorResult {
  baseFee: number;
  lateFee: number;
  stampDuty: number;
  adValoremFee: number;
  total: number;
  warningText: string;
}

/**
 * Normal filing fee (items 5 & 6, Table A, Rule 12 Annexure).
 * Delegates to getNormalFilingFee() — applies uniformly to ALL company types.
 */
export function getNormalFee(capital: number, _isSmallOrOpc: boolean = false): number {
  return getNormalFilingFee(capital);
}

/**
 * Standard Table B multiplier (Rule 12 Annexure) for general event-based forms
 * (e.g. ADT-1, DIR-12, MGT-14, DPT-3, INC-20A, etc.).
 *
 * ADT-1 note: Section 139 applies — the first tier (≤15 days of delay) is 1× normal fee.
 * After 15 days it escalates to 2× and so on. There is NO grace period that waives additional
 * fee — the 15-day window is the original filing deadline, not a post-deadline grace period.
 *
 * Beyond 270 days: caller must display the condonation message; this function returns -1 to
 * signal that condition.
 */
export function getLateFeeMultiplier(days: number): number {
  if (days <= 0) return 0;
  if (days <= 15) return 1;   // Sections 93, 139, 157 first tier
  if (days <= 30) return 2;
  if (days <= 60) return 4;
  if (days <= 90) return 6;
  if (days <= 180) return 10;
  if (days <= 270) return 12;
  return -1; // Signal: condonation required
}

export function calculateIncorporationStampDuty(state: string, capital: number): { moa: number, aoa: number, form: number } {
  let moa = 0, aoa = 0, form = 0;
  const s = state.toLowerCase().replace(/\s/g, '');

  switch(s) {
    case 'andhrapradesh':
      moa = 500; aoa = 500;
      form = Math.min(500000, Math.max(1000, capital * 0.0015));
      break;
    case 'bihar':
      moa = 500; aoa = 500;
      form = Math.min(500000, Math.max(1000, capital * 0.0015));
      break;
    case 'delhi':
      moa = 200; aoa = 200;
      form = Math.min(2500000, capital * 0.0015);
      break;
    case 'gujarat':
      moa = 100; aoa = 100;
      form = Math.min(500000, capital * 0.005);
      break;
    case 'karnataka':
      moa = 1000; aoa = 1000;
      form = Math.min(500000, capital * 0.005);
      break;
    case 'maharashtra':
      moa = 200; aoa = 200;
      form = Math.min(5000000, Math.ceil(capital / 500000) * 1000);
      break;
    case 'madhyapradesh':
      moa = 2500; aoa = 2500;
      form = Math.min(2500000, Math.max(5000, capital * 0.0015));
      break;
    case 'punjab':
      moa = 5000; aoa = 5000;
      form = capital < 100000 ? 5000 : 10000;
      break;
    case 'tamilnadu':
      moa = 200; aoa = 200;
      form = capital < 100000 ? 300 : 600;
      break;
    case 'telangana':
      moa = 500; aoa = 500;
      form = Math.min(500000, Math.max(1000, capital * 0.0015));
      break;
    case 'rajasthan':
      moa = 500; aoa = 500;
      form = Math.min(2500000, capital * 0.005);
      break;
    default:
      moa = 1000; aoa = 1000;
      form = 0;
  }
  return { moa, aoa, form };
}


export function calculateMCAFee(params: CalculatorParams): CalculatorResult {
  const {
    formSlug,
    companyType,
    capital,
    delayDays,
    newCapital = 0,
    state = 'other',
    chargeAmount = 0,
  } = params;

  const isOpcSmall = companyType === 'opc' || companyType === 'small';

  let baseFee = 0;
  let lateFee = 0;
  let stampDuty = 0;
  let adValoremFee = 0;
  let warningText = '';

  const formatCurrency = (val: number) => '₹' + Math.round(val).toLocaleString('en-IN');

  // ─────────────────────────────────────────────────────────────────────────
  // MSME-1: Zero portal fee. Penalty is adjudicated under Section 405(4).
  // ─────────────────────────────────────────────────────────────────────────
  if (formSlug === 'msme-1') {
    return {
      baseFee: 0,
      lateFee: 0,
      stampDuty: 0,
      adValoremFee: 0,
      total: 0,
      warningText:
        'MSME-1 filing fee: ₹0 (no portal filing fee). ' +
        'Non-filing penalty exposure under Section 405(4): ' +
        'Company — ₹25,000 for first default, ₹500 per day for continuing default. ' +
        'Officer in default — same. Penalty is adjudicated by the ROC; it is not collected at the portal.',
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 1. SH-7 (Capital Increase)
  // Fee = difference in MOA registration fee between new and existing capital.
  // Late fee: 2.5%/month (≤6 months) or 3%/month (>6 months) on normal fee.
  // ─────────────────────────────────────────────────────────────────────────
  if (formSlug === 'sh-7') {
    const existingCapital = capital;
    if (newCapital <= existingCapital) {
      return { baseFee: 0, lateFee: 0, stampDuty: 0, adValoremFee: 0, total: 0, warningText: 'New capital must be greater than existing capital.' };
    }

    // Normal fee = differential of MOA registration fee
    if (isOpcSmall) {
      baseFee = getOpcSmallIncorporationFee(newCapital) - getOpcSmallIncorporationFee(existingCapital);
    } else {
      baseFee = getOtherCompanyIncorporationFee(newCapital) - getOtherCompanyIncorporationFee(existingCapital);
    }
    baseFee = Math.max(0, baseFee);

    const stampDutyRates: Record<string, number> = { delhi:0.0015, maharashtra:0.002, karnataka:0.001, tamilnadu:0.001, gujarat:0.001, rajasthan:0.001, westbengal:0.001, telangana:0.0015, andhra:0.0015, kerala:0.001, other:0.001 };
    const stampDutyCaps: Record<string, number> = { maharashtra: 5000000 };
    const increaseAmount = newCapital - existingCapital;
    stampDuty = Math.ceil(increaseAmount * (stampDutyRates[state] || 0.001));
    if (stampDutyCaps[state] && stampDuty > stampDutyCaps[state]) stampDuty = stampDutyCaps[state];

    if (delayDays > 0) {
      // Table C, Rule 12 Annexure: SH-7 late fee uses per-month percentage formula
      const monthsLate = Math.ceil(delayDays / 30); // calendar month or part thereof
      let lateFeeRaw = 0;
      if (monthsLate <= 6) {
        lateFeeRaw = baseFee * 0.025 * monthsLate;
      } else {
        lateFeeRaw = baseFee * 0.025 * 6 + baseFee * 0.03 * (monthsLate - 6);
      }
      lateFee = Math.round(lateFeeRaw);
      warningText = `SH-7 filed ${delayDays} days late (${monthsLate} month${monthsLate > 1 ? 's' : ''}). Late fee: 2.5% per month (up to 6 months) and 3% thereafter. Stamp duty shown is indicative.`;
    } else {
      warningText = 'Stamp duty shown is indicative. The MCA portal calculates exact duty at time of filing.';
    }

    return { baseFee, lateFee, stampDuty, adValoremFee, total: baseFee + lateFee + stampDuty, warningText };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. SPICe+ (INC-32) — Incorporation fee (MOA registration)
  // Zero-fee provision: post 26.01.2018 companies with capital ≤ ₹10L pay ₹0.
  // DIN note: SPICe+ supports DIN allotment for up to 3 directors.
  // ─────────────────────────────────────────────────────────────────────────
  if (formSlug === 'spice-plus' || formSlug === 'inc-32') {
    if (isOpcSmall) {
      // OPC/Small: ₹0 if capital ≤ ₹10L (post-2018 zero-fee provision)
      baseFee = capital <= 1000000 ? 0 : getOpcSmallIncorporationFee(capital);
    } else {
      // Other companies: ₹0 if capital ≤ ₹10L (post-2018 zero-fee provision)
      baseFee = capital <= 1000000 ? 0 : getOtherCompanyIncorporationFee(capital);
    }

    const sd = calculateIncorporationStampDuty(state, capital);
    stampDuty = sd.moa + sd.aoa + sd.form;
    warningText = 'Initial filing — no late penalty applies. State Stamp Duty is estimated based on authorised capital and state rates. ' +
      'SPICe+ supports DIN allotment for up to 3 directors. Additional directors need separate DIR-3 filing.';
    return { baseFee, lateFee, stampDuty, adValoremFee, total: baseFee + lateFee + stampDuty, warningText };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Charges (CHG-1, CHG-9) — 2019 amendment fee structure
  // Original window: 30 days. Extended: 31–60 days. Further: 61–90 days.
  // Beyond 90 days: condonation required under Section 87.
  // ─────────────────────────────────────────────────────────────────────────
  if (['chg-1', 'chg-4', 'chg-6', 'chg-9'].includes(formSlug)) {
    baseFee = getNormalFilingFee(capital);
    const hasAdValorem = formSlug === 'chg-1' || formSlug === 'chg-9';

    if (delayDays <= 0) {
      warningText = 'Charge filed within original 30-day window — normal fee only.';
    } else if (delayDays > 90) {
      // Beyond 90 days: hard stop — condonation required
      return {
        baseFee: 0,
        lateFee: 0,
        stampDuty: 0,
        adValoremFee: 0,
        total: 0,
        warningText: 'Condonation of delay under Section 87 required. Delay exceeds 90 days — cannot compute fee. Application must be made to the CLB/NCLT.',
      };
    } else if (delayDays <= 30) {
      // 1–30 days: 3× normal fee
      lateFee = baseFee * 3;
      warningText = `Charge filing delay ${delayDays} days (1–30 day window) — 3× normal fee = ${formatCurrency(lateFee)}.`;
    } else if (delayDays <= 60) {
      // 31–60 days: 6× normal fee OR 0.025% of charge amount (whichever is higher)
      const multiplierFee = baseFee * 6;
      if (hasAdValorem && chargeAmount > 0) {
        adValoremFee = Math.ceil(chargeAmount * 0.00025);
        lateFee = Math.max(multiplierFee, adValoremFee);
        warningText = `Delay ${delayDays} days (31–60 day window). 6× fee = ${formatCurrency(multiplierFee)}; 0.025% of charge = ${formatCurrency(adValoremFee)}. Higher of the two applies: ${formatCurrency(lateFee)}.`;
      } else {
        lateFee = multiplierFee;
        warningText = `Delay ${delayDays} days (31–60 day window) — 6× normal fee = ${formatCurrency(lateFee)}.`;
      }
    } else {
      // 61–90 days: 6× normal fee OR 0.05% of charge amount (whichever is higher)
      const multiplierFee = baseFee * 6;
      if (hasAdValorem && chargeAmount > 0) {
        adValoremFee = Math.ceil(chargeAmount * 0.0005);
        lateFee = Math.max(multiplierFee, adValoremFee);
        warningText = `Delay ${delayDays} days (61–90 day window). 6× fee = ${formatCurrency(multiplierFee)}; 0.05% of charge = ${formatCurrency(adValoremFee)}. Higher of the two applies: ${formatCurrency(lateFee)}.`;
      } else {
        lateFee = multiplierFee;
        warningText = `Delay ${delayDays} days (61–90 day window) — 6× normal fee = ${formatCurrency(lateFee)}.`;
      }
    }
    return { baseFee, lateFee, stampDuty, adValoremFee, total: baseFee + lateFee + adValoremFee, warningText };
  }
  // 4. Annual Returns & Financial Statements: ₹100/day (no Table B multiplier)
  //    Forms: MGT-7, MGT-7A, AOC-4, AOC-4 CFS, AOC-4 XBRL, AOC-4 NBFC (Ind AS)
  //    Effective from 1 July 2018. No 270-day condonation block for these forms.
  // Special rules: AOC-4 and MGT-7 (penalty engine: ₹100/day, no cap)
  const isAnnualFiling = formSlug.startsWith('aoc-4') || formSlug.startsWith('mgt-7');
  if (isAnnualFiling) {
    baseFee = getNormalFilingFee(capital);
    if (delayDays > 0) {
      lateFee = delayDays * 100;
      warningText = `Annual return/financial statement late filing — ₹100 per day. ${delayDays} days × ₹100 = ${formatCurrency(lateFee)}. No statutory upper cap.`;
    }
    return { baseFee, lateFee, stampDuty, adValoremFee, total: baseFee + lateFee, warningText };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 5. Flat Fee Forms
  // ─────────────────────────────────────────────────────────────────────────
  if (formSlug === 'spice-plus' || formSlug === 'inc-32') {
    if (capital <= 1500000 && isOpcSmall) {
      baseFee = 0;
    } else if (capital <= 1000000 && !isOpcSmall) {
      baseFee = 0;
    } else if (isOpcSmall) {
      baseFee = getOpcSmallIncorporationFee(capital);
    } else {
      baseFee = getOtherCompanyIncorporationFee(capital);
    }
    stampDuty = calculateIncorporationStampDuty(state, capital).form;
    return { baseFee, lateFee: 0, stampDuty, adValoremFee: 0, total: baseFee + stampDuty, warningText: '' };
  }
  if (formSlug === 'dir-3-kyc') {
    baseFee = 0;
    if (delayDays > 0) {
      lateFee = 5000;
      warningText = 'Flat ₹5,000 penalty for delayed DIR-3 KYC filing.';
    }
    return { baseFee, lateFee, stampDuty, adValoremFee, total: baseFee + lateFee, warningText };
  }
  if (formSlug === 'stk-2') {
    baseFee = 10000;
    return { baseFee, lateFee, stampDuty, adValoremFee, total: baseFee, warningText: 'STK-2 has a fixed fee of ₹10,000.' };
  }
  if (formSlug === 'dir-3') {
    baseFee = 500;
    return { baseFee, lateFee, stampDuty, adValoremFee, total: baseFee, warningText: '' };
  }
  if (formSlug === 'mbp-1') {
    return { baseFee: 0, lateFee: 0, stampDuty: 0, adValoremFee: 0, total: 0, warningText: 'MBP-1 is a physical board disclosure. No ROC portal fees apply.' };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 6. ADT-1 — Auditor appointment form (Section 139)
  //    The 15-day window is the ORIGINAL filing deadline from appointment date.
  //    No grace period waiver. Delay > 0 → additional fee starts from day 1.
  //    Table B multiplier: ≤15 days = 1×, >15–30 = 2×, and so on.
  //    Beyond 270 days: condonation required.
  // ─────────────────────────────────────────────────────────────────────────
  if (formSlug === 'adt-1') {
    baseFee = getNormalFilingFee(capital);
    if (delayDays > 0) {
      const multiplier = getLateFeeMultiplier(delayDays);
      if (multiplier === -1) {
        return {
          baseFee: 0,
          lateFee: 0,
          stampDuty: 0,
          adValoremFee: 0,
          total: 0,
          warningText: 'Condonation of delay required under Section 403 second proviso. Delay exceeds 270 days — fee cannot be computed here.',
        };
      }
      lateFee = baseFee * multiplier;
      warningText = `ADT-1 filed ${delayDays} days late — ${multiplier}× additional fee. Normal fee ${formatCurrency(baseFee)} + late fee ${formatCurrency(lateFee)} = ${formatCurrency(baseFee + lateFee)}.`;
    }
    return { baseFee, lateFee, stampDuty, adValoremFee, total: baseFee + lateFee, warningText };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 7. INC-22 / PAS-3 and all other event-based forms
  //    Standard Table B multipliers (1×/2×/4×/6×/10×/12×).
  //    "Higher fee for repeat defaults" is determined by the Registrar during
  //    processing — it is not computable in advance.
  //    Beyond 270 days: condonation required.
  // ─────────────────────────────────────────────────────────────────────────
  baseFee = getNormalFilingFee(capital);

  if (delayDays > 0) {
    const multiplier = getLateFeeMultiplier(delayDays);
    if (multiplier === -1) {
      return {
        baseFee: 0,
        lateFee: 0,
        stampDuty: 0,
        adValoremFee: 0,
        total: 0,
        warningText: 'Condonation of delay required under Section 403 second proviso. Delay exceeds 270 days — fee cannot be computed here. Note: higher fees for repeat defaults under INC-22/PAS-3 are determined by the Registrar during processing, not calculable in advance.',
      };
    }
    lateFee = baseFee * multiplier;
    if (multiplier > 0) {
      warningText = `Late filing of ${delayDays} days attracts ${multiplier}× additional fee. Note: higher fees for repeat defaults under INC-22/PAS-3 are determined by the Registrar during processing, not calculable in advance.`;
    }
  }

  return { baseFee, lateFee, stampDuty, adValoremFee, total: baseFee + lateFee, warningText };
}

// ─────────────────────────────────────────────────────────────────────────────
// Typed adapter exports for test-suite consumption
// ─────────────────────────────────────────────────────────────────────────────

export interface CompanyFormFeeParams {
  form: string;
  companyType: string;
  capital: number;
  delayDays: number;
}

export function calculateCompanyFormFee(params: CompanyFormFeeParams) {
  const formSlug = params.form.toLowerCase().replace(/ /g, '-');
  const res = calculateMCAFee({
    formSlug,
    companyType: params.companyType,
    capital: params.capital,
    delayDays: params.delayDays,
  });
  return {
    normalFee: res.baseFee,
    additionalFee: res.lateFee,
    total: res.total,
    warningText: res.warningText,
    condonationRequired: res.warningText.toLowerCase().includes('condonation'),
  };
}

export interface SH7FeeParams {
  companyType: string;
  existingCapital: number;
  newCapital: number;
  delayMonths: number;
  state?: string;
}

export function calculateSH7Fee(params: SH7FeeParams) {
  const res = calculateMCAFee({
    formSlug: 'sh-7',
    companyType: params.companyType,
    capital: params.existingCapital,
    newCapital: params.newCapital,
    delayDays: params.delayMonths * 30, // Rough mapping for the adapter, though the core uses 30-day months
    state: params.state || 'other',
  });
  return {
    normalFee: res.baseFee,
    additionalFee: res.lateFee,
    total: res.total,
    warningText: res.warningText,
  };
}

export interface ChargeFeeParams {
  form: string;
  capital: number;
  delayDays: number;
  chargeAmount?: number;
}

export function calculateChargeFee(params: ChargeFeeParams) {
  const formSlug = params.form.toLowerCase().replace(/ /g, '-');
  const res = calculateMCAFee({
    formSlug,
    companyType: 'private',
    capital: params.capital,
    delayDays: params.delayDays,
    chargeAmount: params.chargeAmount || 0,
  });
  return {
    normalFee: res.baseFee,
    additionalFee: res.lateFee,
    total: res.total,
    condonationRequired: res.warningText.toLowerCase().includes('condonation'),
    warningText: res.warningText,
  };
}
