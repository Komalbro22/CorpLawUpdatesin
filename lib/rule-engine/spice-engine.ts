/**
 * SPICe+ (INC-32) Company Incorporation Rule Engine
 * 
 * Verified against:
 * - Companies Act, 2013 (Section 7, Section 3, Section 4)
 * - Companies (Incorporation) Rules, 2014 (Rules 38, 38A, 9A)
 * - Companies (Registration Offices and Fees) Rules, 2014 (Table A, G.S.R. 329(E) - ₹15L zero fee)
 * - Indian Stamp Act, 1899 & Respective State Stamp Acts (including Karnataka 2024 & Tamil Nadu 2024 amendments)
 * - MCA V3 SPICe+ Portal Specifications (2026)
 */

import { getOpcSmallIncorporationFee, getOtherCompanyIncorporationFee } from '../fee-calculator-core';

export type CompanyType =
  | 'private_standard'
  | 'one_person_company'
  | 'small_company'
  | 'public_unlisted'
  | 'section_8'
  | 'producer';

export type CostTier = 'Lowest' | 'Low' | 'Moderate' | 'High' | 'Highest';

export interface StateStampRule {
  stateCode: string;
  stateName: string;
  aliases: string[];
  costTier: CostTier;
  formDuty: number;
  moaRule: {
    type: 'flat' | 'percentage' | 'slab';
    amount?: number;
    rate?: number;
    min?: number;
    max?: number;
    perSlab?: number;
    slabRate?: number;
  };
  aoaRule: {
    type: 'flat' | 'percentage' | 'slab';
    amount?: number;
    rate?: number;
    min?: number;
    max?: number;
    perSlab?: number;
    slabRate?: number;
    thresholdCap?: number;
  };
  sec8Exempt: boolean;
  notes: string;
  statutoryReference: string;
}

export const STATE_STAMP_RULES: Record<string, StateStampRule> = {
  himachal_pradesh: {
    stateCode: 'HP',
    stateName: 'Himachal Pradesh',
    aliases: ['himachal', 'himachal pradesh', 'hp'],
    costTier: 'Lowest',
    formDuty: 3,
    moaRule: { type: 'flat', amount: 60 },
    aoaRule: { type: 'slab', perSlab: 100000, slabRate: 60, min: 60, max: 120 }, // ₹60 up to 1L; ₹120 above
    sec8Exempt: true,
    notes: 'One of the lowest incorporation stamp duty regimes in India.',
    statutoryReference: 'HP Stamp Act, Schedule I-A, Art 10 & 39'
  },
  haryana: {
    stateCode: 'HR',
    stateName: 'Haryana',
    aliases: ['haryana', 'hr'],
    costTier: 'Lowest',
    formDuty: 15,
    moaRule: { type: 'flat', amount: 60 },
    aoaRule: { type: 'slab', perSlab: 100000, slabRate: 60, min: 60, max: 120 }, // ₹60 up to 1L; ₹120 above
    sec8Exempt: true,
    notes: 'Low flat stamp duty structure.',
    statutoryReference: 'Indian Stamp (Haryana Amendment) Act, Schedule I-A'
  },
  jharkhand: {
    stateCode: 'JH',
    stateName: 'Jharkhand',
    aliases: ['jharkhand', 'jh'],
    costTier: 'Lowest',
    formDuty: 5,
    moaRule: { type: 'flat', amount: 63 },
    aoaRule: { type: 'flat', amount: 105 },
    sec8Exempt: true,
    notes: 'Fixed nominal stamp duty across all capital tiers.',
    statutoryReference: 'Jharkhand Stamp Act, Schedule I-A'
  },
  delhi: {
    stateCode: 'DL',
    stateName: 'Delhi (NCT)',
    aliases: ['delhi', 'nct of delhi', 'new delhi', 'dl'],
    costTier: 'Low',
    formDuty: 10,
    moaRule: { type: 'flat', amount: 200 },
    aoaRule: { type: 'percentage', rate: 0.0015, min: 150, max: 2500000 }, // 0.15%, max ₹25 Lakhs
    sec8Exempt: true,
    notes: 'AOA stamp duty is 0.15% of capital (min ₹150, max ₹25 Lakhs). MOA is flat ₹200.',
    statutoryReference: 'Delhi Stamp Rules, Schedule I-A, Art 10 & 39'
  },
  west_bengal: {
    stateCode: 'WB',
    stateName: 'West Bengal',
    aliases: ['west bengal', 'wb', 'bengal'],
    costTier: 'Low',
    formDuty: 10,
    moaRule: { type: 'flat', amount: 60 },
    aoaRule: { type: 'flat', amount: 300 },
    sec8Exempt: true,
    notes: 'Flat ₹370 total stamp duty regardless of capital size.',
    statutoryReference: 'West Bengal Stamp Act, Schedule I-A'
  },
  jammu_kashmir: {
    stateCode: 'JK',
    stateName: 'Jammu & Kashmir',
    aliases: ['jammu and kashmir', 'jammu & kashmir', 'j&k', 'jk'],
    costTier: 'Low',
    formDuty: 10,
    moaRule: { type: 'flat', amount: 150 },
    aoaRule: { type: 'slab', perSlab: 100000, slabRate: 150, min: 150, max: 300 },
    sec8Exempt: true,
    notes: 'Flat schedule under J&K Stamp Act.',
    statutoryReference: 'J&K Stamp Act, Schedule I'
  },
  ladakh: {
    stateCode: 'LA',
    stateName: 'Ladakh',
    aliases: ['ladakh', 'la'],
    costTier: 'Low',
    formDuty: 10,
    moaRule: { type: 'flat', amount: 150 },
    aoaRule: { type: 'slab', perSlab: 100000, slabRate: 150, min: 150, max: 300 },
    sec8Exempt: true,
    notes: 'Applies same schedule as UT of Ladakh.',
    statutoryReference: 'Ladakh Stamp Regulations'
  },
  chandigarh: {
    stateCode: 'CH',
    stateName: 'Chandigarh',
    aliases: ['chandigarh', 'ch'],
    costTier: 'Low',
    formDuty: 10,
    moaRule: { type: 'flat', amount: 100 },
    aoaRule: { type: 'flat', amount: 150 },
    sec8Exempt: true,
    notes: 'Low fixed schedule for UT Chandigarh.',
    statutoryReference: 'Indian Stamp Act (Chandigarh Administration)'
  },
  manipur: {
    stateCode: 'MN',
    stateName: 'Manipur',
    aliases: ['manipur', 'mn'],
    costTier: 'Low',
    formDuty: 10,
    moaRule: { type: 'flat', amount: 100 },
    aoaRule: { type: 'flat', amount: 150 },
    sec8Exempt: true,
    notes: 'North-Eastern standard low flat stamp duty.',
    statutoryReference: 'Manipur Stamp Act'
  },
  meghalaya: {
    stateCode: 'ML',
    stateName: 'Meghalaya',
    aliases: ['meghalaya', 'ml'],
    costTier: 'Low',
    formDuty: 10,
    moaRule: { type: 'flat', amount: 100 },
    aoaRule: { type: 'flat', amount: 300 },
    sec8Exempt: true,
    notes: 'Flat stamp duty.',
    statutoryReference: 'Meghalaya Stamp Act'
  },
  nagaland: {
    stateCode: 'NL',
    stateName: 'Nagaland',
    aliases: ['nagaland', 'nl'],
    costTier: 'Low',
    formDuty: 10,
    moaRule: { type: 'flat', amount: 100 },
    aoaRule: { type: 'flat', amount: 150 },
    sec8Exempt: true,
    notes: 'Flat stamp duty.',
    statutoryReference: 'Nagaland Stamp Act'
  },
  tripura: {
    stateCode: 'TR',
    stateName: 'Tripura',
    aliases: ['tripura', 'tr'],
    costTier: 'Low',
    formDuty: 10,
    moaRule: { type: 'flat', amount: 100 },
    aoaRule: { type: 'flat', amount: 150 },
    sec8Exempt: true,
    notes: 'Flat stamp duty.',
    statutoryReference: 'Tripura Stamp Act'
  },
  mizoram: {
    stateCode: 'MZ',
    stateName: 'Mizoram',
    aliases: ['mizoram', 'mz'],
    costTier: 'Low',
    formDuty: 10,
    moaRule: { type: 'flat', amount: 100 },
    aoaRule: { type: 'flat', amount: 150 },
    sec8Exempt: true,
    notes: 'Flat stamp duty.',
    statutoryReference: 'Mizoram Stamp Act'
  },
  arunachal_pradesh: {
    stateCode: 'AR',
    stateName: 'Arunachal Pradesh',
    aliases: ['arunachal pradesh', 'arunachal', 'ar'],
    costTier: 'Low',
    formDuty: 10,
    moaRule: { type: 'flat', amount: 100 },
    aoaRule: { type: 'flat', amount: 150 },
    sec8Exempt: true,
    notes: 'Flat stamp duty.',
    statutoryReference: 'Arunachal Pradesh Stamp Rules'
  },
  sikkim: {
    stateCode: 'SK',
    stateName: 'Sikkim',
    aliases: ['sikkim', 'sk'],
    costTier: 'Low',
    formDuty: 10,
    moaRule: { type: 'flat', amount: 100 },
    aoaRule: { type: 'flat', amount: 150 },
    sec8Exempt: true,
    notes: 'Flat stamp duty.',
    statutoryReference: 'Sikkim Stamp Act'
  },
  assam: {
    stateCode: 'AS',
    stateName: 'Assam',
    aliases: ['assam', 'as'],
    costTier: 'Low',
    formDuty: 15,
    moaRule: { type: 'flat', amount: 200 },
    aoaRule: { type: 'flat', amount: 310 },
    sec8Exempt: true,
    notes: 'Fixed nominal stamp duty.',
    statutoryReference: 'Assam Stamp Act, Schedule I-A'
  },
  puducherry: {
    stateCode: 'PY',
    stateName: 'Puducherry',
    aliases: ['puducherry', 'pondicherry', 'py'],
    costTier: 'Low',
    formDuty: 10,
    moaRule: { type: 'flat', amount: 300 },
    aoaRule: { type: 'flat', amount: 200 },
    sec8Exempt: true,
    notes: 'Flat duty structure under Puducherry Stamp Rules.',
    statutoryReference: 'Puducherry Stamp Act'
  },
  odisha: {
    stateCode: 'OD',
    stateName: 'Odisha',
    aliases: ['odisha', 'orissa', 'or', 'od'],
    costTier: 'Low',
    formDuty: 10,
    moaRule: { type: 'flat', amount: 300 },
    aoaRule: { type: 'flat', amount: 300 },
    sec8Exempt: true,
    notes: 'Fixed ₹300 MOA + ₹300 AOA + ₹10 Form duty.',
    statutoryReference: 'Odisha Stamp Act'
  },
  andaman_nicobar: {
    stateCode: 'AN',
    stateName: 'Andaman & Nicobar Islands',
    aliases: ['andaman', 'andaman and nicobar', 'an'],
    costTier: 'Low',
    formDuty: 10,
    moaRule: { type: 'flat', amount: 100 },
    aoaRule: { type: 'flat', amount: 150 },
    sec8Exempt: true,
    notes: 'Standard UT schedule.',
    statutoryReference: 'Indian Stamp Act Schedule I'
  },
  lakshadweep: {
    stateCode: 'LD',
    stateName: 'Lakshadweep',
    aliases: ['lakshadweep', 'ld'],
    costTier: 'Low',
    formDuty: 10,
    moaRule: { type: 'flat', amount: 100 },
    aoaRule: { type: 'flat', amount: 150 },
    sec8Exempt: true,
    notes: 'Standard UT schedule.',
    statutoryReference: 'Indian Stamp Act Schedule I'
  },
  uttar_pradesh: {
    stateCode: 'UP',
    stateName: 'Uttar Pradesh',
    aliases: ['uttar pradesh', 'up'],
    costTier: 'Moderate',
    formDuty: 10,
    moaRule: { type: 'flat', amount: 500 },
    aoaRule: { type: 'flat', amount: 500 },
    sec8Exempt: true,
    notes: 'Flat ₹1,010 total stamp duty regardless of capital size. Excellent for high-capital companies.',
    statutoryReference: 'UP Stamp Act, Schedule I-B, Art 10 & 39'
  },
  uttarakhand: {
    stateCode: 'UK',
    stateName: 'Uttarakhand',
    aliases: ['uttarakhand', 'uttaranchal', 'uk', 'ua'],
    costTier: 'Moderate',
    formDuty: 10,
    moaRule: { type: 'flat', amount: 500 },
    aoaRule: { type: 'flat', amount: 500 },
    sec8Exempt: true,
    notes: 'Follows UP Stamp Act baseline of flat ₹1,010.',
    statutoryReference: 'Uttarakhand Stamp Act'
  },
  tamil_nadu: {
    stateCode: 'TN',
    stateName: 'Tamil Nadu',
    aliases: ['tamil nadu', 'tamilnadu', 'tn'],
    costTier: 'Moderate',
    formDuty: 20,
    moaRule: { type: 'flat', amount: 200 },
    aoaRule: { type: 'slab', perSlab: 1000000, slabRate: 500, min: 500, max: 500000 },
    sec8Exempt: true,
    notes: 'May 2024 amendment: AOA duty is ₹500 per ₹10 Lakhs of authorized capital (max ₹5 Lakhs). MOA is flat ₹200.',
    statutoryReference: 'Tamil Nadu Stamp (Amendment) Act, 2024, Art 10'
  },
  gujarat: {
    stateCode: 'GJ',
    stateName: 'Gujarat',
    aliases: ['gujarat', 'gj'],
    costTier: 'Moderate',
    formDuty: 20,
    moaRule: { type: 'flat', amount: 100 },
    aoaRule: { type: 'percentage', rate: 0.005, min: 500, max: 1500000 }, // 0.5% of capital, max ₹15 Lakhs
    sec8Exempt: true,
    notes: 'AOA is 0.5% of capital (min ₹500, max ₹15 Lakhs). Can scale high for large capital.',
    statutoryReference: 'Gujarat Stamp Act, Schedule I, Art 10 & 38'
  },
  rajasthan: {
    stateCode: 'RJ',
    stateName: 'Rajasthan',
    aliases: ['rajasthan', 'rj'],
    costTier: 'Moderate',
    formDuty: 10,
    moaRule: { type: 'flat', amount: 500 },
    aoaRule: { type: 'percentage', rate: 0.005, min: 500, max: 5000000 }, // 0.5% of capital
    sec8Exempt: true,
    notes: 'AOA duty is 0.5% of authorized share capital (min ₹500).',
    statutoryReference: 'Rajasthan Stamp Act, Schedule I, Art 10'
  },
  goa: {
    stateCode: 'GA',
    stateName: 'Goa',
    aliases: ['goa', 'ga'],
    costTier: 'Moderate',
    formDuty: 20,
    moaRule: { type: 'flat', amount: 1000 },
    aoaRule: { type: 'slab', perSlab: 500000, slabRate: 200, min: 200, max: 100000 }, // ₹200 per 5L
    sec8Exempt: true,
    notes: 'MOA is flat ₹1,000; AOA is ₹200 per ₹5 Lakhs.',
    statutoryReference: 'Goa Stamp Act'
  },
  dadra_daman: {
    stateCode: 'DN',
    stateName: 'Dadra & Nagar Haveli and Daman & Diu',
    aliases: ['dadra', 'daman', 'diu', 'dn'],
    costTier: 'Moderate',
    formDuty: 20,
    moaRule: { type: 'flat', amount: 150 },
    aoaRule: { type: 'slab', perSlab: 500000, slabRate: 1000, min: 1000, max: 500000 },
    sec8Exempt: true,
    notes: 'UT schedule: AOA ₹1,000 per ₹5 Lakhs or part.',
    statutoryReference: 'DNHDD Stamp Regulations'
  },
  andhra_pradesh: {
    stateCode: 'AP',
    stateName: 'Andhra Pradesh',
    aliases: ['andhra pradesh', 'andhra', 'ap'],
    costTier: 'Moderate',
    formDuty: 20,
    moaRule: { type: 'flat', amount: 300 },
    aoaRule: { type: 'percentage', rate: 0.0015, min: 1000, max: 500000 }, // 0.15%, min 1K, max 5L
    sec8Exempt: true,
    notes: 'AOA is 0.15% (min ₹1,000, max ₹5 Lakhs). MOA is flat ₹300.',
    statutoryReference: 'AP Stamp Act, Schedule I-A, Art 10 & 39'
  },
  telangana: {
    stateCode: 'TS',
    stateName: 'Telangana',
    aliases: ['telangana', 'ts', 'tg'],
    costTier: 'Moderate',
    formDuty: 20,
    moaRule: { type: 'flat', amount: 300 },
    aoaRule: { type: 'percentage', rate: 0.0015, min: 1000, max: 500000 }, // 0.15%, min 1K, max 5L
    sec8Exempt: true,
    notes: 'AOA is 0.15% (min ₹1,000, max ₹5 Lakhs). MOA is flat ₹300.',
    statutoryReference: 'Telangana Stamp Act, Schedule I-A, Art 10 & 39'
  },
  bihar: {
    stateCode: 'BR',
    stateName: 'Bihar',
    aliases: ['bihar', 'br'],
    costTier: 'Moderate',
    formDuty: 20,
    moaRule: { type: 'flat', amount: 500 },
    aoaRule: { type: 'percentage', rate: 0.0015, min: 1000, max: 500000 }, // 0.15% or 1000 whichever more
    sec8Exempt: true,
    notes: 'AOA is 0.15% or ₹1,000 (whichever is higher, max ₹5 Lakhs).',
    statutoryReference: 'Bihar Stamp Act, Schedule I-A'
  },
  chhattisgarh: {
    stateCode: 'CG',
    stateName: 'Chhattisgarh',
    aliases: ['chhattisgarh', 'cg'],
    costTier: 'Moderate',
    formDuty: 10,
    moaRule: { type: 'flat', amount: 500 },
    aoaRule: { type: 'percentage', rate: 0.0015, min: 1000, max: 500000 },
    sec8Exempt: true,
    notes: 'AOA is 0.15% or ₹1,000 (whichever is higher, max ₹5 Lakhs).',
    statutoryReference: 'Chhattisgarh Stamp Act'
  },
  maharashtra: {
    stateCode: 'MH',
    stateName: 'Maharashtra',
    aliases: ['maharashtra', 'mh', 'mumbai'],
    costTier: 'Moderate',
    formDuty: 100,
    moaRule: { type: 'flat', amount: 1000 },
    aoaRule: { type: 'percentage', rate: 0.003, min: 1000, max: 10000000 }, // 0.3% of capital, min ₹1,000, max ₹1 Crore (₹1,000 per 5L or part)
    sec8Exempt: true,
    notes: 'MOA is flat ₹1,000; AOA is ₹1,000 for every ₹5 Lakhs (or 0.3% effective, min ₹1,000, max ₹1 Crore). SPICe+ e-form duty is ₹100.',
    statutoryReference: 'Maharashtra Stamp Act, 1958, Schedule I, Art 10 & 39'
  },
  kerala: {
    stateCode: 'KL',
    stateName: 'Kerala',
    aliases: ['kerala', 'kl'],
    costTier: 'High',
    formDuty: 25,
    moaRule: { type: 'flat', amount: 1000 },
    aoaRule: { type: 'slab', perSlab: 1000000, slabRate: 2000, min: 2000, max: 5000000 },
    sec8Exempt: true,
    notes: 'Slab-based: Up to ₹10L capital = ₹2,000; ₹10L–₹25L = ₹5,000; above ₹25L = 0.5% of capital.',
    statutoryReference: 'Kerala Stamp Act, 1959, Schedule, Art 10'
  },
  karnataka: {
    stateCode: 'KA',
    stateName: 'Karnataka',
    aliases: ['karnataka', 'ka', 'bangalore', 'bengaluru'],
    costTier: 'High',
    formDuty: 20,
    moaRule: { type: 'flat', amount: 1000 },
    aoaRule: { type: 'slab', perSlab: 1000000, slabRate: 5000, min: 5000, max: 10000000 }, // Feb 2024: ₹5,000 per 10L
    sec8Exempt: true,
    notes: 'Feb 2024 Amendment (10x hike): AOA stamp duty raised from ₹500 to ₹5,000 per ₹10 Lakhs (max ₹1 Crore). MOA is flat ₹1,000.',
    statutoryReference: 'Karnataka Stamp (Amendment) Act, 2024, Art 10 & 32'
  },
  madhya_pradesh: {
    stateCode: 'MP',
    stateName: 'Madhya Pradesh',
    aliases: ['madhya pradesh', 'mp'],
    costTier: 'High',
    formDuty: 50,
    moaRule: { type: 'flat', amount: 2500 },
    aoaRule: { type: 'percentage', rate: 0.0015, min: 5000, max: 2500000 }, // 0.15%, min ₹5,000, max ₹25 Lakhs
    sec8Exempt: true,
    notes: 'High entry floor: MOA is ₹2,500; AOA minimum is ₹5,000 (total ₹7,550 base).',
    statutoryReference: 'MP Stamp Act, Schedule I-A, Art 10 & 39'
  },
  punjab: {
    stateCode: 'PB',
    stateName: 'Punjab',
    aliases: ['punjab', 'pb'],
    costTier: 'Highest',
    formDuty: 25,
    moaRule: { type: 'flat', amount: 5000 },
    aoaRule: { type: 'slab', perSlab: 100000, slabRate: 5000, min: 5000, max: 10000 }, // ₹5,000 up to 1L; ₹10,000 above 1L
    sec8Exempt: true,
    notes: 'Highest baseline in India: MOA is flat ₹5,000; AOA is ₹5,000 (up to 1L) and ₹10,000 (above 1L). Total is ₹10,025 to ₹15,025.',
    statutoryReference: 'Punjab Stamp Act, Schedule I-A, Art 10 & 39'
  }
};

export interface SpiceCalculationParams {
  capital: number;
  stateKey: string;
  companyType: CompanyType;
  directorCount: number;
  reserveNameSeparately: boolean;
  nameExtensions?: number; // 0, 1 (+20d = ₹1k), 2 (+40d = ₹2k)
}

export interface SpiceBreakdownItem {
  name: string;
  category: 'Government MCA' | 'State Stamp Duty' | 'Statutory Registrations';
  amount: number;
  basis: string;
  isWaived?: boolean;
}

export interface ComplianceMilestone {
  id?: string;
  dayWindow: string;
  deadline: string;
  action: string;
  form: string;
  statutorySection: string;
  penaltySummary: string;
  toolUrl?: string;
  isCritical: boolean;
  daysFromIncorporation?: number;
  section?: string;
}

export const POST_INCORPORATION_CHECKLIST: ComplianceMilestone[] = [
  {
    id: 'bank_account',
    dayWindow: 'Day 1–7',
    deadline: 'Within 7 days of CoI',
    action: 'Open Company Current Bank Account',
    form: 'Bank Application',
    statutorySection: 'Banking Regulation Act',
    section: 'Banking Regulation Act',
    daysFromIncorporation: 7,
    penaltySummary: 'Essential prerequisite before subscriber funds can be deposited for Form INC-20A.',
    isCritical: true
  },
  {
    id: 'board_meeting',
    dayWindow: 'Day 1–30',
    deadline: 'Within 30 days of CoI',
    action: 'Hold First Board Meeting',
    form: 'Board Minutes',
    statutorySection: 'Section 173(1), Companies Act 2013',
    section: 'Section 173(1)',
    daysFromIncorporation: 30,
    penaltySummary: '₹25,000 on company + ₹5,000 per officer in default.',
    isCritical: false
  },
  {
    id: 'adt1',
    dayWindow: 'Within 15 days of Board Meeting',
    deadline: 'Strictly 15 days from Auditor Appointment',
    action: 'File Form ADT-1 (First Auditor Appointment)',
    form: 'ADT-1',
    statutorySection: 'Section 139(6) read with Rule 4(2)',
    section: 'Section 139(6)',
    daysFromIncorporation: 30,
    penaltySummary: 'Table B multipliers (1x to 12x normal fee); default triggers Section 147 fines (₹25k–₹5L).',
    toolUrl: '/tools/fee-calculator/companies/adt-1',
    isCritical: true
  },
  {
    id: 'share_certificates',
    dayWindow: 'Within 60 days',
    deadline: '60 days from CoI',
    action: 'Issue Share Certificates (Form SH-1)',
    form: 'SH-1',
    statutorySection: 'Section 56(4), Companies Act 2013',
    section: 'Section 56(4)',
    daysFromIncorporation: 60,
    penaltySummary: '₹25,000 to ₹5,00,000 on company; ₹10,000 to ₹1,00,000 on officer.',
    isCritical: false
  },
  {
    id: 'inc20a',
    dayWindow: 'Within 180 days',
    deadline: 'Strictly within 180 calendar days of CoI',
    action: 'File Form INC-20A (Commencement of Business)',
    form: 'INC-20A',
    statutorySection: 'Section 10A, Companies Act 2013',
    section: 'Section 10A',
    daysFromIncorporation: 180,
    penaltySummary: '₹50,000 flat on company + ₹1,000/day per officer (max ₹1,00,000 each) + ROC Strike-off under Sec 248.',
    toolUrl: '/tools/fee-calculator/companies/inc-20a',
    isCritical: true
  },
  {
    id: 'annual_filings',
    dayWindow: 'Annual (Month 6–9)',
    deadline: '30 days & 60 days from first AGM',
    action: 'File Annual Financials (AOC-4) & Annual Return (MGT-7/7A)',
    form: 'AOC-4 & MGT-7',
    statutorySection: 'Sections 137 & 92, Companies Act 2013',
    section: 'Sections 137 & 92',
    daysFromIncorporation: 270,
    penaltySummary: 'Uncapped ₹100/day per form + 3-year default triggers director disqualification (Sec 164(2)).',
    toolUrl: '/tools/fee-calculator/companies/aoc-4',
    isCritical: true
  }
];

export const POST_INCORPORATION_ROADMAP = POST_INCORPORATION_CHECKLIST;

export interface SpiceCalculationResult {
  capital: number;
  stateKey: string;
  stateCode: string;
  stateName: string;
  costTier: CostTier;
  companyType: CompanyType;
  directorCount: number;
  
  // Cost items
  mcaFee: number;
  mcaFeeSaved: number;
  isMcaFeeZero: boolean;
  moaDuty: number;
  aoaDuty: number;
  formDuty: number;
  totalStampDuty: number;
  nameReservationFee: number;
  dinAllotmentFee: number;
  freeDinsAllotted: number;
  paidDinsCount: number;
  panFee: number;
  tanFee: number;
  
  // Totals
  totalGovernmentPayable: number;
  
  // Detailed line items
  breakdown: SpiceBreakdownItem[];
  
  // State Comparison
  stateComparison: {
    stateName: string;
    stateKey: string;
    totalDuty: number;
    difference: number;
  }[];
  benchmarks: {
    stateName: string;
    stateKey: string;
    totalDuty: number;
    totalEstimate: number;
    difference: number;
  }[];
  
  // 180-Day Post-Incorporation Roadmap
  postIncorporationRoadmap: ComplianceMilestone[];
  
  // Advisory Warnings
  warnings: string[];
}

/**
 * Resolve state key from user input / alias
 */
export function resolveStateRule(stateInput: string): StateStampRule {
  const normalized = stateInput.toLowerCase().trim().replace(/[\s\-_&.]+/g, '_');
  
  if (STATE_STAMP_RULES[normalized]) {
    return STATE_STAMP_RULES[normalized];
  }

  // Check aliases
  for (const [key, rule] of Object.entries(STATE_STAMP_RULES)) {
    if (
      key === normalized ||
      rule.stateCode.toLowerCase() === normalized ||
      rule.aliases.some(a => a.toLowerCase().replace(/[\s\-_&.]+/g, '_') === normalized)
    ) {
      return rule;
    }
  }

  // Default fallback: Maharashtra
  return STATE_STAMP_RULES.maharashtra;
}

/**
 * Calculate stamp duty for a specific state and capital
 */
export function calculateStateStampDuty(
  stateInput: string,
  capital: number,
  isSection8OrCompanyType: boolean | string = false
): {
  moa: number;
  aoa: number;
  form: number;
  total: number;
  moaDuty: number;
  aoaDuty: number;
  formDuty: number;
  totalStampDuty: number;
  isExempt: boolean;
  rule: StateStampRule;
} {
  const isSection8 = isSection8OrCompanyType === true || isSection8OrCompanyType === 'section_8';
  const rule = resolveStateRule(stateInput);

  if (isSection8 && rule.sec8Exempt) {
    return {
      moa: 0,
      aoa: 0,
      form: rule.formDuty,
      total: rule.formDuty,
      moaDuty: 0,
      aoaDuty: 0,
      formDuty: rule.formDuty,
      totalStampDuty: rule.formDuty,
      isExempt: true,
      rule
    };
  }

  // 1. Form Stamp Duty
  const form = rule.formDuty;

  // 2. MOA Stamp Duty
  let moa = 0;
  if (rule.moaRule.type === 'flat') {
    moa = rule.moaRule.amount || 0;
  }

  // 3. AOA Stamp Duty
  let aoa = 0;
  const aoaR = rule.aoaRule;
  if (aoaR.type === 'flat') {
    aoa = aoaR.amount || 0;
  } else if (aoaR.type === 'percentage') {
    const raw = capital * (aoaR.rate || 0.0015);
    aoa = Math.round(raw);
    if (aoaR.min) aoa = Math.max(aoa, aoaR.min);
    if (aoaR.max) aoa = Math.min(aoa, aoaR.max);
  } else if (aoaR.type === 'slab') {
    if (rule.stateCode === 'KL') {
      // Kerala custom tiers
      if (capital <= 1000000) {
        aoa = 2000;
      } else if (capital <= 2500000) {
        aoa = 5000;
      } else {
        aoa = Math.round(capital * 0.005);
      }
    } else if (rule.stateCode === 'PB') {
      // Punjab custom tiers: up to 1L = 5000, above 1L = 10000
      aoa = capital <= 100000 ? 5000 : 10000;
    } else if (rule.stateCode === 'HP' || rule.stateCode === 'HR' || rule.stateCode === 'JK' || rule.stateCode === 'LA') {
      // ₹60 or ₹150 up to 1L, double above 1L
      aoa = capital <= 100000 ? (aoaR.min || 60) : (aoaR.max || 120);
    } else {
      // Standard slab perSlab calculation (e.g. Karnataka: ₹5,000 per ₹10L; Tamil Nadu: ₹500 per ₹10L)
      const perSlab = aoaR.perSlab || 1000000;
      const slabRate = aoaR.slabRate || 500;
      const blocks = Math.max(1, Math.ceil(capital / perSlab));
      aoa = blocks * slabRate;
      if (aoaR.min) aoa = Math.max(aoa, aoaR.min);
      if (aoaR.max) aoa = Math.min(aoa, aoaR.max);
    }
  }

  const total = moa + aoa + form;

  return {
    moa,
    aoa,
    form,
    total,
    moaDuty: moa,
    aoaDuty: aoa,
    formDuty: form,
    totalStampDuty: total,
    isExempt: false,
    rule
  };
}

/**
 * Main SPICe+ calculation engine function
 */
export function calculateSpiceIncorporation(params: SpiceCalculationParams): SpiceCalculationResult {
  const {
    capital,
    stateKey,
    companyType,
    directorCount = 2,
    reserveNameSeparately = false,
    nameExtensions = 0
  } = params;

  const isOpc = companyType === 'one_person_company';
  const isSmall = companyType === 'small_company' || isOpc;
  const isSection8 = companyType === 'section_8';

  // 1. MCA Registration Fee (Rule 38A & G.S.R. 329(E): Zero fee up to ₹15L)
  const isMcaFeeZero = capital <= 1500000;
  let mcaFee = 0;
  let baselineFeeWithoutWaiver = 0;

  if (isSection8) {
    // Section 8 companies: Flat ₹2,000 baseline under Table A Item 3, waived up to ₹15L
    baselineFeeWithoutWaiver = 2000;
    mcaFee = isMcaFeeZero ? 0 : 2000;
  } else if (isSmall) {
    baselineFeeWithoutWaiver = getOpcSmallIncorporationFee(capital, false);
    mcaFee = isMcaFeeZero ? 0 : getOpcSmallIncorporationFee(capital, true);
  } else {
    baselineFeeWithoutWaiver = getOtherCompanyIncorporationFee(capital, false);
    mcaFee = isMcaFeeZero ? 0 : getOtherCompanyIncorporationFee(capital, true);
  }

  const mcaFeeSaved = isMcaFeeZero ? baselineFeeWithoutWaiver : 0;

  // 2. State Stamp Duty
  const stamp = calculateStateStampDuty(stateKey, capital, isSection8);
  const moaDuty = stamp.moa;
  const aoaDuty = stamp.aoa;
  const formDuty = stamp.form;
  const totalStampDuty = stamp.total;

  // 3. Name Reservation Fee (SPICe+ Part A)
  let nameReservationFee = 0;
  if (reserveNameSeparately) {
    nameReservationFee = 1000;
    if (nameExtensions === 1) nameReservationFee += 1000; // +20 days
    if (nameExtensions === 2) nameReservationFee += 2000; // +40 days
  }

  // 4. DIN Allotment
  // Up to 3 proposed directors without DIN are free in SPICe+ Part B.
  // Beyond 3, directors must file DIR-3 post-incorporation at ₹500 each.
  const freeDinsAllotted = Math.min(3, Math.max(1, directorCount));
  const paidDinsCount = Math.max(0, directorCount - 3);
  const dinAllotmentFee = paidDinsCount * 500;

  // 5. PAN and TAN Mandatory Fees
  const panFee = 78; // ₹66 + 18% GST = ₹77.88 (~₹78)
  const tanFee = 77; // ₹65 + 18% GST = ₹76.70 (~₹77)

  // Total Government Outlay
  const totalGovernmentPayable =
    mcaFee + totalStampDuty + nameReservationFee + dinAllotmentFee + panFee + tanFee;

  // Detailed breakdown
  const breakdown: SpiceBreakdownItem[] = [
    {
      name: 'MCA Incorporation Fee (INC-32)',
      category: 'Government MCA',
      amount: mcaFee,
      basis: isMcaFeeZero
        ? `₹0 — Exempted under G.S.R. 329(E) (capital ≤ ₹15,00,000)`
        : `Statutory Table A schedule for ₹${capital.toLocaleString('en-IN')} capital`,
      isWaived: isMcaFeeZero
    },
    {
      name: `MOA Stamp Duty (${stamp.rule.stateName})`,
      category: 'State Stamp Duty',
      amount: moaDuty,
      basis: `${stamp.rule.stateName} Stamp Act (${stamp.rule.statutoryReference})`,
      isWaived: isSection8 && stamp.rule.sec8Exempt
    },
    {
      name: `AOA Stamp Duty (${stamp.rule.stateName})`,
      category: 'State Stamp Duty',
      amount: aoaDuty,
      basis: `${stamp.rule.stateName} Stamp Act (${stamp.rule.statutoryReference})`,
      isWaived: isSection8 && stamp.rule.sec8Exempt
    },
    {
      name: `SPICe+ e-Form Stamp Duty`,
      category: 'State Stamp Duty',
      amount: formDuty,
      basis: `${stamp.rule.stateName} Electronic Filing Duty`
    },
    {
      name: 'PAN Allotment (Income Tax Dept)',
      category: 'Statutory Registrations',
      amount: panFee,
      basis: '₹66 + 18% GST (Automated with Certificate of Incorporation)'
    },
    {
      name: 'TAN Allotment (Income Tax Dept)',
      category: 'Statutory Registrations',
      amount: tanFee,
      basis: '₹65 + 18% GST (Automated with Certificate of Incorporation)'
    }
  ];

  if (reserveNameSeparately) {
    breakdown.push({
      name: 'SPICe+ Part A (Name Reservation)',
      category: 'Government MCA',
      amount: nameReservationFee,
      basis: nameExtensions > 0
        ? `Base ₹1,000 + ₹${nameExtensions * 1000} extension fee under Rule 9A`
        : 'Up to 2 proposed names (valid for 20 days upon approval)'
    });
  }

  if (paidDinsCount > 0) {
    breakdown.push({
      name: `Additional DIN Allotment (${paidDinsCount} Director${paidDinsCount > 1 ? 's' : ''})`,
      category: 'Government MCA',
      amount: dinAllotmentFee,
      basis: `First 3 DINs free in SPICe+; ${paidDinsCount} extra director(s) require Form DIR-3 at ₹500 each`
    });
  }

  // Key States Comparison (Hub Comparison)
  const comparisonStates = ['delhi', 'maharashtra', 'karnataka', 'gujarat', 'tamil_nadu', 'uttar_pradesh', 'telangana', 'west_bengal'];
  const stateComparison = comparisonStates.map(hubKey => {
    const hubStamp = calculateStateStampDuty(hubKey, capital, isSection8);
    return {
      stateName: hubStamp.rule.stateName,
      stateKey: hubKey,
      totalDuty: hubStamp.total,
      difference: hubStamp.total - totalStampDuty
    };
  });

  const benchmarks = stateComparison.map(s => ({
    stateName: s.stateName,
    stateKey: s.stateKey,
    totalDuty: s.totalDuty,
    totalEstimate: s.totalDuty + mcaFee + panFee + tanFee,
    difference: s.difference
  }));

  // Post-incorporation roadmap
  const postIncorporationRoadmap = POST_INCORPORATION_ROADMAP;

  // Advisory Warnings
  const warnings: string[] = [];
  if (isMcaFeeZero) {
    warnings.push(`🎉 Zero MCA Filing Fee: You saved ₹${baselineFeeWithoutWaiver.toLocaleString('en-IN')} because authorized capital is within the ₹15,00,000 exemption limit under G.S.R. 329(E).`);
  }
  if (stamp.rule.stateCode === 'KA') {
    warnings.push(`⚠️ Karnataka Stamp Rate: Under the Feb 2024 amendment, AOA stamp duty is levied at ₹5,000 per ₹10 Lakhs of authorized capital.`);
  }
  if (stamp.rule.stateCode === 'PB') {
    warnings.push(`ℹ️ Punjab Stamp Duty: Punjab levies a high baseline of ₹5,000 MOA + ₹5,000–₹10,000 AOA stamp duty.`);
  }
  if (directorCount > 3) {
    warnings.push(`👥 Director Limit: SPICe+ allows DIN allotment for up to 3 directors. The remaining ${paidDinsCount} proposed director(s) must file Form DIR-3 post-incorporation at ₹500 each.`);
  }
  if (reserveNameSeparately) {
    warnings.push(`⏳ Name Reservation Window: Once SPICe+ Part A is approved, the proposed name is valid for strictly 20 days to complete Part B.`);
  }

  return {
    capital,
    stateKey: stamp.rule.aliases[0] || stateKey,
    stateCode: stamp.rule.stateCode,
    stateName: stamp.rule.stateName,
    costTier: stamp.rule.costTier,
    companyType,
    directorCount,
    mcaFee,
    mcaFeeSaved,
    isMcaFeeZero,
    moaDuty,
    aoaDuty,
    formDuty,
    totalStampDuty,
    nameReservationFee,
    dinAllotmentFee,
    freeDinsAllotted,
    paidDinsCount,
    panFee,
    tanFee,
    totalGovernmentPayable,
    breakdown,
    stateComparison,
    benchmarks,
    postIncorporationRoadmap,
    warnings
  };
}

export function formatInr(val: number): string {
  return '₹' + Math.round(val).toLocaleString('en-IN');
}
