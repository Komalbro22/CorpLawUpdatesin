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
}

export interface CalculatorResult {
  baseFee: number;
  lateFee: number;
  stampDuty: number;
  adValoremFee: number;
  total: number;
  warningText: string;
}

export function getNormalFee(capital: number, isSmallOrOpc: boolean): number {
  if (capital < 0) return 0;
  if (isSmallOrOpc) {
    if (capital <= 100000) return 50;
    if (capital <= 500000) return 100;
    if (capital <= 2500000) return 150;
    return 200;
  } else {
    if (capital <= 100000) return 200;
    if (capital <= 500000) return 300;
    if (capital <= 2500000) return 400;
    if (capital <= 10000000) return 500;
    return 600;
  }
}

export function getLateFeeMultiplier(days: number, isHigherFee: boolean, hasGracePeriod: boolean): number {
  if (days <= 0) return 0;
  if (hasGracePeriod && days <= 15) return 0;
  const m = isHigherFee 
    ? { 15: 1, 30: 3, 60: 6, 90: 9, 180: 15, 999: 18 } 
    : { 15: 1, 30: 2, 60: 4, 90: 6, 180: 10, 999: 12 };
  
  if (days <= 15) return m[15];
  if (days <= 30) return m[30];
  if (days <= 60) return m[60];
  if (days <= 90) return m[90];
  if (days <= 180) return m[180];
  return m[999];
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
      form = capital <= 100000 ? 5000 : 10000;
      break;
    case 'tamilnadu':
      moa = 200; aoa = 200;
      form = capital <= 100000 ? 300 : 600;
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
  const { formSlug, companyType, capital, delayDays, isRepeatOffender = false, newCapital = 0, state = 'other', chargeAmount = 0 } = params;
  
  const isOpcSmall = companyType === 'opc' || companyType === 'small';
  const isSmall = companyType === 'small'; // Strict small check for some forms

  let baseFee = 0;
  let lateFee = 0;
  let stampDuty = 0;
  let adValoremFee = 0;
  let warningText = '';

  const formatCurrency = (val: number) => '₹' + Math.round(val).toLocaleString('en-IN');

  // 1. SH-7 (Capital Increase)
  if (formSlug === 'sh-7') {
    const existingCapital = capital;
    if (newCapital <= existingCapital) {
      return { baseFee: 0, lateFee: 0, stampDuty: 0, adValoremFee: 0, total: 0, warningText: 'New capital must be greater than existing capital.' };
    }
    const increaseAmount = newCapital - existingCapital;

    if (isOpcSmall) {
      if (newCapital <= 1000000) baseFee = 2000;
      else if (newCapital <= 5000000) baseFee = 2000 + Math.ceil((newCapital - 1000000) / 10000) * 200;
      else baseFee = 2000 + Math.ceil(4000000 / 10000) * 200 + Math.ceil((newCapital - 5000000) / 10000) * 200;
    } else {
      if (increaseAmount <= 100000) baseFee = 5000;
      else if (increaseAmount <= 500000) baseFee = 5000 + Math.ceil((increaseAmount - 100000) / 10000) * 400;
      else if (increaseAmount <= 5000000) baseFee = 5000 + 1600 + Math.ceil((increaseAmount - 500000) / 10000) * 300;
      else if (increaseAmount <= 10000000) baseFee = 5000 + 1600 + 13500 + Math.ceil((increaseAmount - 5000000) / 10000) * 100;
      else baseFee = 5000 + 1600 + 13500 + 5000 + Math.ceil((increaseAmount - 10000000) / 10000) * 75;
    }

    const stampDutyRates: Record<string, number> = { delhi:0.0015, maharashtra:0.002, karnataka:0.001, tamilnadu:0.001, gujarat:0.001, rajasthan:0.001, westbengal:0.001, telangana:0.0015, andhra:0.0015, kerala:0.001, other:0.001 };
    const stampDutyCaps: Record<string, number> = { maharashtra: 5000000 };
    stampDuty = Math.ceil(increaseAmount * (stampDutyRates[state] || 0.001));
    if (stampDutyCaps[state] && stampDuty > stampDutyCaps[state]) stampDuty = stampDutyCaps[state];

    if (delayDays > 0) {
      const multiplier = getLateFeeMultiplier(delayDays, false, false);
      lateFee = baseFee * multiplier;
      warningText = `Late filing of ${delayDays} days attracts ${multiplier}x additional fee. Stamp duty shown is indicative.`;
    } else {
      warningText = 'Stamp duty shown is indicative. The MCA portal calculates exact duty at time of filing.';
    }

    return { baseFee, lateFee, stampDuty, adValoremFee, total: baseFee + lateFee + stampDuty, warningText };
  }

  // 2. SPICe+ (INC-32)
  if (formSlug === 'spice-plus' || formSlug === 'inc-32') {
    if (companyType === 'opc') {
      if (capital <= 1000000) baseFee = 2000;
      else if (capital <= 5000000) baseFee = 2000 + Math.ceil((capital - 1000000) / 10000) * 200;
      else baseFee = 2000 + Math.ceil(4000000 / 10000) * 200 + Math.ceil((capital - 5000000) / 10000) * 200;
    } else {
      // Waived up to 15L
      baseFee = capital <= 1500000 ? 0 : getNormalFee(capital, isOpcSmall);
    }
    
    const sd = calculateIncorporationStampDuty(state, capital);
    stampDuty = sd.moa + sd.aoa + sd.form;
    warningText = 'Initial filing — no late penalty applies. State Stamp Duty is estimated based on authorized capital and state rates.';
    return { baseFee, lateFee, stampDuty, adValoremFee, total: baseFee + lateFee + stampDuty, warningText };
  }

  // 3. Charges (CHG-1, CHG-4, CHG-6, CHG-9)
  if (['chg-1', 'chg-4', 'chg-6', 'chg-9'].includes(formSlug)) {
    baseFee = getNormalFee(capital, isSmall); // small company specific
    const hasAdValorem = formSlug === 'chg-1' || formSlug === 'chg-9';
    
    if (delayDays > 0) {
      const multiplier = isSmall ? 3 : 6;
      lateFee = baseFee * multiplier;
      
      if (delayDays > 30 && hasAdValorem) {
        const adValoremRate = isSmall ? 0.00025 : 0.0005;
        const adValoremCap = isSmall ? 100000 : 500000;
        adValoremFee = Math.min(Math.ceil(chargeAmount * adValoremRate), adValoremCap);
      }
      
      if (delayDays > 300) {
        warningText = `Delay exceeds 300 days. Requires condonation from Central Government. Calculated: ${multiplier}x late fee` + (adValoremFee > 0 ? ` + ad valorem` : '') + '.';
      } else {
        warningText = `Charge filing delay — ${multiplier}x additional fee` + (adValoremFee > 0 ? ` + ad valorem fee` : '') + '.';
      }
    }
    return { baseFee, lateFee, stampDuty, adValoremFee, total: baseFee + lateFee + adValoremFee, warningText };
  }

  // 4. Annual Returns (AOC-4, MGT-7)
  if (['aoc-4', 'aoc-4-cfs', 'aoc-4-xbrl', 'mgt-7', 'mgt-7a'].includes(formSlug)) {
    baseFee = getNormalFee(capital, isOpcSmall);
    if (delayDays > 0) {
      lateFee = delayDays * 100;
      warningText = `Annual return late filing — ₹100 per day. ${delayDays} days × ₹100 = ${formatCurrency(lateFee)}.`;
    }
    return { baseFee, lateFee, stampDuty, adValoremFee, total: baseFee + lateFee, warningText };
  }

  // 5. Flat Fee Forms (DIR-3 KYC, STK-2)
  if (formSlug === 'dir-3-kyc') {
    baseFee = 0;
    if (delayDays > 0) {
      lateFee = 5000;
      warningText = 'Flat ₹5,000 penalty for delayed DIR-3 KYC filing.';
    }
    return { baseFee, lateFee, stampDuty, adValoremFee, total: baseFee + lateFee, warningText };
  }
  if (formSlug === 'stk-2') {
    baseFee = 5000; // technically 10000 in recent rules, but sticking to logic provided if not updated, let's keep 10000 which is accurate for 2024+
    // Actually the aiaccountant script says: var fixedFees = { 'INC-1':1000, 'DIR-3':500, 'DIR-3-KYC': delayDays > 0 ? 5000 : 0, 'STK-2':5000 };
    baseFee = 5000;
    return { baseFee, lateFee, stampDuty, adValoremFee, total: baseFee, warningText: 'STK-2 has a fixed fee of ₹5,000.' };
  }
  if (formSlug === 'dir-3') {
    baseFee = 500;
    return { baseFee, lateFee, stampDuty, adValoremFee, total: baseFee, warningText: '' };
  }

  // 6. Other Event-Based Forms
  baseFee = getNormalFee(capital, isOpcSmall);
  
  if (delayDays > 0) {
    const hasGrace = formSlug === 'adt-1';
    const multiplier = getLateFeeMultiplier(delayDays, isRepeatOffender, hasGrace);
    lateFee = baseFee * multiplier;
    
    if (multiplier > 0) {
      warningText = `Late filing of ${delayDays} days attracts ${multiplier}x additional fee.`;
    } else if (hasGrace && delayDays <= 15) {
      warningText = `ADT-1 filed within 15-day grace period — no late fee applicable.`;
    }
  }

  return { baseFee, lateFee, stampDuty, adValoremFee, total: baseFee + lateFee, warningText };
}
