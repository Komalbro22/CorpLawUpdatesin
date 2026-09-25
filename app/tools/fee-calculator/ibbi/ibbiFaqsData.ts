export interface FAQItem {
  q: string;
  a: string;
}

export const IBBI_FAQS: FAQItem[] = [
  {
    q: 'What delayed filing fee is prescribed under IBBI Circular No. IBBI/LIQ/107/2026?',
    a: 'Under Circular No. IBBI/LIQ/107/2026 issued on 24th September 2026 pursuant to Regulation 47B of the IBBI (Liquidation Process) Regulations, 2016, any liquidation form due on or before 30th September 2026 and submitted after its due date attracts a mandatory fee of ₹500 per form for each calendar month of delay, plus applicable GST (18%).',
  },
  {
    q: 'Which liquidation forms attract the delayed filing fee under Regulation 47B?',
    a: 'The delayed fee applies to the revised electronic liquidation forms introduced vide Circular No. IBBI/LIQ/91/2026: Form LIQ-1 (Progress Report & Appointment Intimation), Form LIQ-2 (Preliminary Report, Asset Memorandum & Valuation), Form LIQ-3 (Sale of Assets & Distribution of Proceeds), and Form LIQ-4 (Final Report prior to Dissolution / Closure), as well as any other electronic forms mandated under Regulation 47B.',
  },
  {
    q: 'What is the significance of the 30th September 2026 cutoff date?',
    a: 'The Circular specifically operationalizes the levy of late fees for all forms that were due on or before 30.09.2026. Liquidators with any pending past filings, quarterly progress reports, or preliminary reports must clear their backlogs to avoid compounding ₹500/month fees for every month elapsed since the original due date.',
  },
  {
    q: 'Is there an exemption or fee waiver window until 30th September 2026?',
    a: 'No. Filing forms before 30th September 2026 does not grant any exemption or waiver from late fees. Circular No. IBBI/LIQ/107/2026 states that each form due on or before 30.09.2026 that is submitted after its individual due date must be accompanied by ₹500/month + GST. The levy commenced immediately on 24th September 2026; 30 September 2026 is merely the cutoff date defining the cohort of past forms subject to the levy, not an amnesty deadline.',
  },
  {
    q: 'Is GST applicable on IBBI regulatory filing fees?',
    a: 'Yes. Effective 18th July 2022, following the withdrawal of GST exemptions for statutory regulatory bodies (including SEBI, RBI, and IBBI) under Notification No. 04/2022-Central Tax (Rate), regulatory fees and late filing fees levied by IBBI attract 18% GST (SAC 9991 / 9983). At 18%, the GST on a ₹500 late fee is ₹90, resulting in a total deposit of ₹590 per month of delay per form.',
  },
  {
    q: 'Does updating or correcting a previously filed form attract late fees?',
    a: 'Yes. Circular No. IBBI/LIQ/107/2026 explicitly stipulates that forms submitted after the due date, "whether by correction, updation, or otherwise", must be accompanied by the prescribed fee of ₹500 per month plus GST. However, if a form is modified before its original due date, no fee is charged.',
  },
  {
    q: 'How does CIRP delayed form fee compare under Regulation 40B?',
    a: 'Under Regulation 40B of the IBBI (Insolvency Resolution Process for Corporate Persons) Regulations, 2016 read with Circular No. IBBI/CIRP/89/2025, an identical fee of ₹500 per calendar month of delay (plus 18% GST) applies to CIRP forms (Form CIRP-1 to CIRP-7 and Form IP-1) that were due on or before 31st December 2025 and submitted after their due dates.',
  },
  {
    q: 'What are the consequences if an Insolvency Professional fails to pay delayed filing fees?',
    a: 'Under the IBBI regulations, failure to file required forms or non-payment of prescribed fees constitutes non-compliance under the Insolvency and Bankruptcy Code. This directly impacts the issuance or renewal of the Insolvency Professional’s Authorisation for Assignment (AFA) by their Insolvency Professional Agency (IPA) and may trigger disciplinary proceedings or inspection under Section 196/218 of the Code.',
  },
  {
    q: 'How is a Liquidator’s remuneration calculated under Regulation 4(2)(b)?',
    a: 'Where the Committee of Creditors (CoC) has not fixed the fee under Regulation 39D, the Liquidator is entitled to a fee under Regulation 4(2)(b) calculated as a tiered percentage of the cumulative amount realized (net of other liquidation costs) and cumulative amount distributed. As clarified by IBBI’s Circular dated 28 September 2023, percentages are highest in the first six months (up to 5% on realization and 2.5% on distribution) and decrease for later periods to incentivize expeditious closure.',
  },
];
