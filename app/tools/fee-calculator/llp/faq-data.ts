export interface FaqItem {
  q: string;
  a: string;
}

export const LLP_FAQS: FaqItem[] = [
  {
    q: 'How are late filing fees calculated for LLP Form 11 and Form 8?',
    a: 'Under Section 69 of the LLP Act, 2008 read with the LLP (Second Amendment) Rules, 2022 (effective 1 April 2022), late filing fees at the MCA portal are calculated using a slab-multiplier schedule (1× to 15× for Small LLPs and 1× to 30× for Other LLPs). For Form 8 (Annual Statement) and Form 11 (Annual Return), delays beyond 360 days attract the maximum multiplier plus an uncapped daily addition of ₹10/day for Small LLPs and ₹20/day for Other LLPs.',
  },
  {
    q: 'Was the flat ₹100 per day penalty abolished for LLPs?',
    a: 'No. The additional filing fee payable at the MCA portal checkout was transitioned to a slab-multiplier system under Section 69. However, the substantive Limited Liability Partnership Act, 2008 maintains separate statutory adjudication penalties: Section 34(5) for Statement of Account defaults and Section 35(2) for Annual Return defaults prescribe ₹100 per day during continuance of default (capped at ₹1,00,000 for the LLP entity and ₹50,000 for each Designated Partner). These penalties require formal ROC adjudication under Section 76A and are not collected at portal checkout.',
  },
  {
    q: 'What is the Section 76A cure provision for late filings?',
    a: "Section 76A of the LLP Act contains a statutory proviso for specified defaults under Section 34(3) (Statement of Account & Solvency) or Section 35(1) (Annual Return). Under this proviso, no penalty shall be imposed by the adjudicating officer where the default is rectified before or within 30 days of the notice issued by the adjudicating officer, subject to statutory conditions.",
  },
  {
    q: 'How is a Small LLP defined under corporate law?',
    a: 'Under Section 2(ta) of the Limited Liability Partnership Act, 2008, a Small LLP is defined as an LLP whose total contribution does not exceed ₹25 Lakhs (or such higher amount as may be prescribed) AND whose turnover for the immediately preceding financial year (from its latest Statement of Account & Solvency) does not exceed ₹40 Lakhs. Qualifying as a Small LLP grants significant concessions on late filing multipliers.',
  },
  {
    q: 'What is the filing fee for Form 8 Charge creation or satisfaction?',
    a: 'Under Annexure-A Items 4 & 5 of the LLP Rules, 2009, filing Form 8 for the creation, modification, or satisfaction of a charge attracts a flat statutory document fee of ₹1,000 per document (unlike the annual Statement of Account & Solvency, which uses contribution slabs). Filings beyond the 30-day statutory window attract additional fees under Table B Item 1 (capped at 25× for Small LLPs and 50× for Other LLPs).',
  },
  {
    q: 'How are filing fees computed for Form 3 (LLP Agreement)?',
    a: 'Form 3 has its own discrete base fee schedule under Annexure-A Item 3 (ranging from ₹500 for contribution ≤ ₹1 Lakh to ₹25,000 for contribution > ₹1 Crore). For subsequent agreement changes with a contribution increase, an incremental registration fee differential is payable based on the difference between the new and old contribution slabs.',
  },
  {
    q: 'What are the fees and prerequisites for LLP strike-off under Form 24?',
    a: 'Under Rule 37 and Annexure-A Item 5 of the LLP Rules, 2009, Form 24 carries a flat application fee of ₹500 for Small LLPs and ₹1,000 for Other LLPs. Additional delay fees are N/A. However, substantive prerequisites must be met: at least 1 year of commercial cessation, zero active assets/liabilities/charges, closed bank accounts, completed annual filings up to the year of cessation, and a CA-certified Statement of Account prepared within 30 days of application.',
  },
  {
    q: 'What is the statutory due date for Form 11 and Form 8?',
    a: 'Form 11 (Annual Return) must be filed within 60 days of financial year closure (30 May for FY ending 31 March). Form 8 (Statement of Account & Solvency) must be filed within 30 days from the expiry of 6 months of financial year closure (30 October for FY ending 31 March).',
  },
];
