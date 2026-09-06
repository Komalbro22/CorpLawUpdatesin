export interface FAQItem {
  q: string
  a: string
}

export const companyFaqs: FAQItem[] = [
  {
    q: 'What is the normal fee for filing Company ROC forms on MCA V3?',
    a: 'Under Table A (Items 5 & 6) of the Companies (Registration Offices and Fees) Rules, 2014, normal filing fees are determined uniformly across all corporate types based on nominal (authorized) share capital: ₹200 for capital under ₹1 Lakh; ₹300 for ₹1 Lakh to ₹4,99,999; ₹400 for ₹5 Lakhs to ₹24,99,999; ₹500 for ₹25 Lakhs to ₹99,99,999; and ₹600 for ₹1 Crore or more. Companies without share capital pay a flat fee of ₹200. For new incorporation under SPICe+ (INC-32), government fees are waived (₹0) for nominal capital up to ₹15 Lakhs for Small Companies & OPCs and up to ₹10 Lakhs for other companies.'
  },
  {
    q: 'How is the late fee calculated for Annual Returns (Form AOC-4 and MGT-7)?',
    a: 'Under the Companies (Registration Offices and Fees) Second Amendment Rules, 2018, delayed annual financial statements (AOC-4, AOC-4 CFS, AOC-4 XBRL) and annual returns (MGT-7, MGT-7A) attract an uncapped additional fee of flat ₹100 per day of delay. Unlike event-based forms, there is no statutory upper cap on this ₹100/day challan on the MCA V3 portal. In addition to portal late fees, directors and the company face potential civil adjudication exposure under Section 92(5) and Section 137(3).'
  },
  {
    q: 'What is the difference between Form MGT-7 and Form MGT-7A?',
    a: 'Form MGT-7 is the full Annual Return filed by standard Private Limited (non-small), Public Limited, Section 8, and Producer Companies. Form MGT-7A is the abridged Annual Return prescribed exclusively for One Person Companies (OPCs) and Small Companies pursuant to Rule 11(1) of the Companies (Management and Administration) Rules, 2014. MGT-7A does not require Practicing Company Secretary (PCS) certification under Section 92(2) or Form MGT-8.'
  },
  {
    q: 'What are the amended Small Company thresholds under Section 2(85) for FY 2026-27?',
    a: 'Pursuant to MCA Notification G.S.R. 880(E) effective from 1st December 2025, a private company qualifies as a Small Company if: (1) Paid-up share capital does not exceed ₹10 Crore, and (2) Annual turnover in the immediately preceding financial year does not exceed ₹100 Crore. Both criteria must be satisfied simultaneously, and the entity must not be a holding, subsidiary, Section 8 company, or body corporate governed by a special Act.'
  },
  {
    q: 'How do Table B additional fee multipliers work for event-based forms?',
    a: 'For event-based forms (such as ADT-1, INC-22, DIR-12, PAS-3, MGT-14, and DPT-3), additional late filing fees are calculated under Table B (Rule 12 Annexure) as a multiplier of the normal base fee: up to 30 days delay: 2×; 31 to 60 days: 4×; 61 to 90 days: 6×; 91 to 180 days: 10×; and 181 to 270 days: 12× normal fee. If delay exceeds 270 days, portal filing is blocked until condonation of delay is approved under Section 403.'
  },
  {
    q: 'What is the late fee and ad valorem penalty rule for Form CHG-1 (Charge Creation)?',
    a: 'Under Rule 12(3) of the Fees Rules and Section 77(1), Form CHG-1 has three statutory windows from charge creation: (1) Days 1–30: Normal filing fee (no delay). (2) Days 31–60 (delay 1–30 days): Normal fee + 3×/6× additional fee + ad-valorem fee (0.025% max ₹1 Lakh for Small/OPC; 0.05% max ₹5 Lakhs for Others). (3) Days 61–120 (delay 31–90 days): Normal fee + 6× additional fee + higher ad-valorem fee (0.05% max ₹2 Lakhs for Small/OPC; 0.10% max ₹10 Lakhs for Others). Beyond 120 days, direct ROC registration is barred and condonation by the Regional Director (Form CHG-8) is mandatory.'
  },
  {
    q: 'How does the Section 446B 50% penalty halving relief work?',
    a: 'Section 446B of the Companies Act, 2013 provides that if a penalty is payable for failure to comply with any provision by a One Person Company (OPC), Small Company, Startup Company, or Producer Company, or by any of their officers in default, such company and officer shall be liable to not more than one-half of the statutory penalty specified, subject to a maximum ceiling of ₹2,00,000 for the company and ₹1,00,000 for an officer in default.'
  },
  {
    q: 'How is state-wise stamp duty calculated on Form SH-7 and SPICe+?',
    a: 'Stamp duty is governed by state stamp acts, not the central Companies Act. For Form SH-7 (increase in authorized capital), stamp duty is payable on the incremental capital: for example, Maharashtra charges 0.2% subject to a statutory cap of ₹50 Lakhs, Delhi charges 0.15%, and Karnataka charges 0.5% (capped at ₹5 Lakhs). For SPICe+ (incorporation), stamp duty applies to the Articles of Association (AOA) and Memorandum of Association (MOA) based on the state of the registered office.'
  },
  {
    q: 'What is the statutory deadline for filing Form ADT-1 after auditor appointment?',
    a: 'Under Section 139(1) and Rule 4(2) of the Companies (Audit and Auditors) Rules, 2014, Form ADT-1 must be filed with the ROC within 15 calendar days from the date of the Annual General Meeting (AGM) or Board Meeting in which the auditor was appointed. There is no grace period waiving late fees—delays trigger Table B additional fee multipliers from day 1 past the 15-day window.'
  },
  {
    q: 'What are the post-2020 civil adjudication penalties for MGT-14, DIR-12, and BEN-2?',
    a: 'Following the Companies (Amendment) Act, 2020 decriminalization: MGT-14 delays attract Section 117(2) penalties of ₹10,000 base + ₹100/day continuing default (capped at ₹2 Lakhs for company, ₹50,000 for officer); DIR-12 non-compliance falls under Section 172 residuary penalty of ₹50,000 base + ₹500/day; and BEN-2 delays incur Section 90(11) penalties of ₹1 Lakh + ₹500/day for the company and ₹25,000 + ₹200/day for officers (with 50% relief for Small Companies under Section 446B).'
  }
]
