// seed only — live values come from the DB
// CorpLawUpdates.in — Director Appointment Document Set Initial Seed Data
// Law as at 7 November 2026

export interface LegalScheduleSeedItem {
  code: string
  category: 'fee' | 'deadline' | 'statutory_rule' | 'notice_period'
  label: string
  data_value: Record<string, any>
  governing_section: string
  source_reference: string
}

export const LEGAL_SCHEDULE_SEED: LegalScheduleSeedItem[] = [
  // DIR-12 Standard MCA Filing Fee Slabs
  {
    code: 'FEE_DIR12_SLAB_1',
    category: 'fee',
    label: 'Form DIR-12 Normal Fee — Capital < ₹1,00,000',
    data_value: {
      min_capital: 0,
      max_capital: 99999,
      amount: 200,
      currency: 'INR',
      description: 'Authorised share capital less than ₹1,00,000'
    },
    governing_section: 'Section 403, Companies (Registration Offices and Fees) Rules, 2014, Rule 12 & Table A',
    source_reference: 'MCA Notification G.S.R. 268(E) dated 31-03-2014 (Fee Rules 2014, Table A)'
  },
  {
    code: 'FEE_DIR12_SLAB_2',
    category: 'fee',
    label: 'Form DIR-12 Normal Fee — Capital ₹1,00,000 to ₹4,99,999',
    data_value: {
      min_capital: 100000,
      max_capital: 499999,
      amount: 300,
      currency: 'INR',
      description: 'Authorised share capital between ₹1,00,000 and ₹4,99,999'
    },
    governing_section: 'Section 403, Companies (Registration Offices and Fees) Rules, 2014, Rule 12 & Table A',
    source_reference: 'MCA Notification G.S.R. 268(E) dated 31-03-2014 (Fee Rules 2014, Table A)'
  },
  {
    code: 'FEE_DIR12_SLAB_3',
    category: 'fee',
    label: 'Form DIR-12 Normal Fee — Capital ₹5,00,000 to ₹24,99,999',
    data_value: {
      min_capital: 500000,
      max_capital: 2499999,
      amount: 400,
      currency: 'INR',
      description: 'Authorised share capital between ₹5,00,000 and ₹24,99,999'
    },
    governing_section: 'Section 403, Companies (Registration Offices and Fees) Rules, 2014, Rule 12 & Table A',
    source_reference: 'MCA Notification G.S.R. 268(E) dated 31-03-2014 (Fee Rules 2014, Table A)'
  },
  {
    code: 'FEE_DIR12_SLAB_4',
    category: 'fee',
    label: 'Form DIR-12 Normal Fee — Capital ₹25,00,000 to ₹99,99,999',
    data_value: {
      min_capital: 2500000,
      max_capital: 9999999,
      amount: 500,
      currency: 'INR',
      description: 'Authorised share capital between ₹25,00,000 and ₹99,99,999'
    },
    governing_section: 'Section 403, Companies (Registration Offices and Fees) Rules, 2014, Rule 12 & Table A',
    source_reference: 'MCA Notification G.S.R. 268(E) dated 31-03-2014 (Fee Rules 2014, Table A)'
  },
  {
    code: 'FEE_DIR12_SLAB_5',
    category: 'fee',
    label: 'Form DIR-12 Normal Fee — Capital ₹1,00,000,000 or more',
    data_value: {
      min_capital: 10000000,
      max_capital: null,
      amount: 600,
      currency: 'INR',
      description: 'Authorised share capital ₹1 Crore or more'
    },
    governing_section: 'Section 403, Companies (Registration Offices and Fees) Rules, 2014, Rule 12 & Table A',
    source_reference: 'MCA Notification G.S.R. 268(E) dated 31-03-2014 (Fee Rules 2014, Table A)'
  },

  // DIR-12 Late Fee Multipliers (Additional fee multiples under Section 403 Table B)
  {
    code: 'LATE_FEE_DIR12_BAND_1',
    category: 'fee',
    label: 'Form DIR-12 Additional Fee — Up to 30 days delay',
    data_value: {
      min_delay_days: 1,
      max_delay_days: 30,
      multiplier: 2,
      display_text: '2 times normal fee (2×)'
    },
    governing_section: 'Section 403(1), Table B, Companies (Registration Offices and Fees) Rules, 2014',
    source_reference: 'Companies (Registration Offices and Fees) Amendment Rules, 2018 (G.S.R. 435(E))'
  },
  {
    code: 'LATE_FEE_DIR12_BAND_2',
    category: 'fee',
    label: 'Form DIR-12 Additional Fee — 31 to 60 days delay',
    data_value: {
      min_delay_days: 31,
      max_delay_days: 60,
      multiplier: 4,
      display_text: '4 times normal fee (4×)'
    },
    governing_section: 'Section 403(1), Table B, Companies (Registration Offices and Fees) Rules, 2014',
    source_reference: 'Companies (Registration Offices and Fees) Amendment Rules, 2018 (G.S.R. 435(E))'
  },
  {
    code: 'LATE_FEE_DIR12_BAND_3',
    category: 'fee',
    label: 'Form DIR-12 Additional Fee — 61 to 90 days delay',
    data_value: {
      min_delay_days: 61,
      max_delay_days: 90,
      multiplier: 6,
      display_text: '6 times normal fee (6×)'
    },
    governing_section: 'Section 403(1), Table B, Companies (Registration Offices and Fees) Rules, 2014',
    source_reference: 'Companies (Registration Offices and Fees) Amendment Rules, 2018 (G.S.R. 435(E))'
  },
  {
    code: 'LATE_FEE_DIR12_BAND_4',
    category: 'fee',
    label: 'Form DIR-12 Additional Fee — 91 to 180 days delay',
    data_value: {
      min_delay_days: 91,
      max_delay_days: 180,
      multiplier: 10,
      display_text: '10 times normal fee (10×)'
    },
    governing_section: 'Section 403(1), Table B, Companies (Registration Offices and Fees) Rules, 2014',
    source_reference: 'Companies (Registration Offices and Fees) Amendment Rules, 2018 (G.S.R. 435(E))'
  },
  {
    code: 'LATE_FEE_DIR12_BAND_5',
    category: 'fee',
    label: 'Form DIR-12 Additional Fee — Beyond 180 days delay',
    data_value: {
      min_delay_days: 181,
      max_delay_days: null,
      multiplier: 12,
      display_text: '12 times normal fee (12×)'
    },
    governing_section: 'Section 403(1), Table B, Companies (Registration Offices and Fees) Rules, 2014',
    source_reference: 'Companies (Registration Offices and Fees) Amendment Rules, 2018 (G.S.R. 435(E))'
  },

  // Statutory Deadlines
  {
    code: 'DEADLINE_DIR12_APPOINTMENT',
    category: 'deadline',
    label: 'DIR-12 Filing Deadline — Additional Director Appointment',
    data_value: {
      days: 30,
      trigger: 'Date of Board Meeting passing appointment resolution',
      applies_to: 'Form DIR-12',
      display_text: 'Within 30 days of appointment'
    },
    governing_section: 'Section 170(2) of Companies Act, 2013 read with Rule 18 of Companies (Appointment and Qualification of Directors) Rules, 2014',
    source_reference: 'Companies Act, 2013, Section 170(2)'
  },
  {
    code: 'DEADLINE_DIR12_REGULARISATION',
    category: 'deadline',
    label: 'DIR-12 Filing Deadline — Shareholder Regularisation',
    data_value: {
      days: 30,
      trigger: 'Date of General Meeting (AGM/EGM) passing ordinary resolution',
      applies_to: 'Form DIR-12',
      display_text: 'Within 30 days of regularisation'
    },
    governing_section: 'Section 170(2) of Companies Act, 2013 read with Rule 18 of Companies (Appointment and Qualification of Directors) Rules, 2014',
    source_reference: 'Companies Act, 2013, Section 170(2)'
  },
  {
    code: 'DEADLINE_DIR2_CONSENT',
    category: 'deadline',
    label: 'Form DIR-2 Consent Submission & Filing',
    data_value: {
      days: 30,
      trigger: 'Signed prior to Board Meeting; filed with ROC within 30 days of appointment',
      applies_to: 'Form DIR-2 attachment to DIR-12',
      display_text: 'Before Board Meeting (filed within 30 days of appointment)'
    },
    governing_section: 'Section 152(5) of Companies Act, 2013 read with Rule 8 of Companies (Appointment and Qualification of Directors) Rules, 2014',
    source_reference: 'Companies Act, 2013, Section 152(5)'
  },
  {
    code: 'DEADLINE_DIR8_INTIMATION',
    category: 'deadline',
    label: 'Form DIR-8 Intimation of Non-Disqualification',
    data_value: {
      trigger: 'Furnished before appointment at the Board Meeting',
      applies_to: 'Form DIR-8',
      display_text: 'Before appointment at Board Meeting'
    },
    governing_section: 'Section 164(2) of Companies Act, 2013 read with Rule 14(1) of Companies (Appointment and Qualification of Directors) Rules, 2014',
    source_reference: 'Companies Act, 2013, Section 164(2)'
  },
  {
    code: 'DEADLINE_MBP1_INTEREST',
    category: 'deadline',
    label: 'Form MBP-1 Notice of Interest',
    data_value: {
      trigger: 'At the first board meeting attended by the new director as a director',
      applies_to: 'Form MBP-1',
      display_text: 'At first Board Meeting attended as director'
    },
    governing_section: 'Section 184(1) of Companies Act, 2013 read with Rule 9(1) of Companies (Meetings of Board and its Powers) Rules, 2014',
    source_reference: 'Companies Act, 2013, Section 184(1)'
  },
  {
    code: 'NOTICE_PERIOD_BOARD_MEETING',
    category: 'notice_period',
    label: 'Board Meeting Notice Period',
    data_value: {
      days: 7,
      is_clear_days: false,
      display_text: 'At least 7 days before meeting'
    },
    governing_section: 'Section 173(3) of Companies Act, 2013 and Secretarial Standard SS-1 Clause 1.3.1',
    source_reference: 'ICSI Secretarial Standard on Meetings of the Board of Directors (SS-1, revised 2024)'
  },
  {
    code: 'NOTICE_PERIOD_GENERAL_MEETING',
    category: 'notice_period',
    label: 'General Meeting Notice Period',
    data_value: {
      days: 21,
      is_clear_days: true,
      display_text: 'At least 21 clear days before meeting'
    },
    governing_section: 'Section 101(1) of Companies Act, 2013 and Secretarial Standard SS-2 Clause 1.2.1',
    source_reference: 'ICSI Secretarial Standard on General Meetings (SS-2, revised 2024)'
  },
  {
    code: 'DEADLINE_DRAFT_MINUTES',
    category: 'deadline',
    label: 'Draft Board Minutes Circulation',
    data_value: {
      days: 15,
      trigger: 'Within 15 days from conclusion of Board Meeting',
      display_text: 'Within 15 days of Board Meeting'
    },
    governing_section: 'Secretarial Standard SS-1 Clause 7.4',
    source_reference: 'ICSI SS-1 Clause 7.4'
  },
  {
    code: 'DEADLINE_MINUTES_BOOK_ENTRY',
    category: 'deadline',
    label: 'Minutes Book Entry & Signing',
    data_value: {
      days: 30,
      trigger: 'Within 30 days of the conclusion of meeting',
      display_text: 'Within 30 days of meeting'
    },
    governing_section: 'Section 118(1) of Companies Act, 2013 read with SS-1 Clause 7.5.1 / SS-2 Clause 17.5.1',
    source_reference: 'Companies Act, 2013, Section 118(1)'
  },

  // Statutory Rules & Exemptions
  {
    code: 'RULE_MGT14_EXEMPTION_PRIVATE',
    category: 'statutory_rule',
    label: 'MGT-14 Filing Exemption for Private Companies',
    data_value: {
      is_exempt: true,
      form_required: 'None',
      display_text: 'Exempt for private companies — MGT-14 is not required'
    },
    governing_section: 'Section 179(3) read with MCA Exemption Notification G.S.R. 464(E) dated 5 June 2015',
    source_reference: 'MCA Exemption Notification G.S.R. 464(E) dated 5 June 2015, Serial No. 23'
  },
  {
    code: 'RULE_PER_DAY_PENALTY_EXCLUSION',
    category: 'statutory_rule',
    label: '₹100/day Late Fee Non-Applicability',
    data_value: {
      applies_to_dir12: false,
      applies_to_forms: ['AOC-4', 'MGT-7', 'MGT-7A'],
      display_text: '₹100/day penalty does NOT apply to DIR-12 (applies to annual filing forms only)'
    },
    governing_section: 'Section 403(1) second proviso, Companies Act, 2013',
    source_reference: 'Companies (Registration Offices and Fees) Rules, 2014, Table B'
  }
]

export const DIRECTOR_APPOINTMENT_SET_SEED = {
  slug: 'director-appointment-set',
  title: 'Director Appointment Document Set (Private Company)',
  event: 'Appointment of Director',
  route_type: 'Board Appointment as Additional Director followed by Shareholder Regularisation',
  variant_tags: ['private-limited', 'additional-director', 'regularisation', 'companies-act-2013'],
  status: 'published',
  version: 'v1.0',
  law_as_at: '2026-11-07',
  last_verified: '2026-11-07',
  needs_reverification: false,
  reverification_notes: null,
  reviewer_name: null,
  reviewer_status: 'under_review',
  reviewer_date: null,
  quick_answer: 'This document set provides all 11 secretarial documents required to appoint an Additional Director in a private limited company and subsequently regularise them at a general meeting under the Companies Act, 2013. It includes board notices, DIR-2 consent, DIR-8 intimation, board resolution, MBP-1, general meeting notices, ordinary resolution, minutes, and register entries in exact filing sequence.',
  description: 'Complete, legally verified pack of secretarial documents for appointing an Additional Director under Section 161(1) and regularising under Section 152 in a private limited company, including MCA Form DIR-12 compliance deadlines and fee slabs.',
  variant_notice: 'Other director types — Independent Director, Managing Director / Whole-time Director, Nominee Director, or appointments in public/listed companies — follow different statutory requirements and are not covered by this set.',
  seo_title: 'Documents Required for Appointment of Director | Complete Set & Formats (Companies Act 2013)',
  seo_description: 'Download the complete director appointment document set for private limited companies: DIR-2, DIR-8, Board Resolution, MBP-1, AGM notice, ordinary resolution, and Form DIR-12 guide.',
  display_order: 1,
  common_mistakes: [
    {
      mistake: 'Filing Form MGT-14 for the Board Resolution in a private company',
      consequence: 'Unnecessary MCA fee and rejected/queried form',
      correction: 'Private companies are exempt from filing MGT-14 for Section 179(3) board resolutions under MCA Notification G.S.R. 464(E) dated 5 June 2015.'
    },
    {
      mistake: 'Filing Form DIR-12 beyond 30 days',
      consequence: 'Additional late fees scaling from 2× up to 12× the normal fee',
      correction: 'File Form DIR-12 within 30 days of the board meeting for the initial appointment, and file a second DIR-12 within 30 days of the general meeting regularising the appointment.'
    },
    {
      mistake: 'Delaying collection of Form MBP-1',
      consequence: 'Non-compliance with Section 184(1) penalty provisions',
      correction: 'Form MBP-1 must be disclosed at the very first board meeting attended by the newly appointed director.'
    },
    {
      mistake: 'Letting the Additional Director term lapse without regularisation',
      consequence: 'Director automatically vacates office at the AGM date',
      correction: 'Under Section 161(1), an Additional Director holds office only up to the date of the next AGM. Shareholders must pass an ordinary resolution at the AGM/EGM before that date.'
    }
  ],
  faqs: [
    {
      question: 'What documents are required for the appointment of an Additional Director in a private company?',
      answer: 'The required documents in filing sequence are: (1) Form DIR-2 (consent to act as director), (2) Form DIR-8 (intimation of non-disqualification), (3) Board Meeting Notice and Agenda with at least 7 days notice, (4) Certified True Copy of Board Resolution under Section 161(1), (5) Form DIR-12 filed with ROC within 30 days, (6) Letter of Appointment, (7) Form MBP-1 (disclosure of interest) submitted at the first board meeting attended, (8) General Meeting Notice with Section 102 explanatory statement, (9) Ordinary Resolution passed by shareholders, (10) Second Form DIR-12 for regularisation within 30 days, and (11) updated Register of Directors under Section 170.'
    },
    {
      question: 'Is Form MGT-14 required to be filed for appointment of an Additional Director in a private limited company?',
      answer: 'No. Under MCA Exemption Notification G.S.R. 464(E) dated 5 June 2015, private companies are exempt from Section 117(3)(g) regarding board resolutions passed under Section 179(3). Therefore, a private company does not need to file Form MGT-14 for the board resolution appointing an Additional Director or for the subsequent ordinary resolution regularising them.'
    },
    {
      question: 'What is the fee and deadline for filing Form DIR-12?',
      answer: 'Form DIR-12 must be filed with the MCA within 30 days of the board meeting (for initial appointment) and within 30 days of the general meeting (for regularisation). The normal filing fee ranges from ₹200 to ₹600 depending on the company\'s authorised share capital. If filed late, additional fees apply at multiples of 2× (up to 30 days delay), 4× (31-60 days), 6× (61-90 days), 10× (91-180 days), and 12× (beyond 180 days). The ₹100/day penalty does not apply to DIR-12.'
    },
    {
      question: 'What happens if an Additional Director is not regularised at the next Annual General Meeting?',
      answer: 'Under Section 161(1) of the Companies Act, 2013, an Additional Director holds office only up to the date of the next Annual General Meeting or the last date on which the AGM should have been held, whichever is earlier. If the shareholders do not pass an ordinary resolution regularising the appointment at or before that meeting, the Additional Director automatically vacates office immediately.'
    }
  ]
}

export const DOCUMENT_SET_STEPS_SEED = [
  {
    step_number: 1,
    title: 'Verify DIN & Statutory Eligibility',
    document_name: 'Checklist — Appointment of a Director',
    spoke_slug: 'director-appointment-set#checklist',
    governing_law: 'Sections 152, 153, 164 & 165, Companies Act, 2013',
    deadline_text: 'Prior to initiating appointment',
    form_name: 'DIR-3 / SPICe+ (if DIN needed)',
    filing_authority: 'MCA V3',
    is_mandatory: true,
    notes: 'Verify appointee holds valid DIN and digital signature (DSC), is not disqualified under Section 164, and does not exceed Section 165 directorship limits (max 20 companies, max 10 public companies).'
  },
  {
    step_number: 2,
    title: 'Collect Consent (DIR-2) & Intimation (DIR-8)',
    document_name: 'Form DIR-2 (Consent) & Form DIR-8 (Non-Disqualification)',
    spoke_slug: 'dir-2-consent-format',
    governing_law: 'Sections 152(5) & 164(2); Rules 8 & 14(1)',
    deadline_text: 'Before the Board Meeting',
    form_name: 'DIR-2 & DIR-8',
    filing_authority: 'Company Records / ROC Attachment',
    is_mandatory: true,
    notes: 'Obtain written consent in Form DIR-2 and declaration of non-disqualification in Form DIR-8 from the proposed director before convening the board meeting.'
  },
  {
    step_number: 3,
    title: 'Issue Board Meeting Notice & Agenda',
    document_name: 'Board Meeting Notice and Agenda',
    spoke_slug: 'board-meeting-notice-director-appointment',
    governing_law: 'Section 173(3) and Secretarial Standard SS-1',
    deadline_text: 'At least 7 days before Board Meeting',
    form_name: 'Notice & Agenda Papers',
    filing_authority: 'Internal Secretarial',
    is_mandatory: true,
    notes: 'Send written notice and agenda to every director at their registered address at least 7 days before the meeting, unless shorter notice is approved per SS-1.'
  },
  {
    step_number: 4,
    title: 'Convene Board Meeting & Pass Appointment Resolution',
    document_name: 'Board Resolution — Appointment of Additional Director',
    spoke_slug: 'board-resolution-director-appointment',
    governing_law: 'Section 161(1) and Articles of Association',
    deadline_text: 'Date of Board Meeting',
    form_name: 'Certified True Copy of Resolution',
    filing_authority: 'ROC Attachment',
    is_mandatory: true,
    notes: 'Pass board resolution appointing appointee as Additional Director under Section 161(1) to hold office up to the next AGM. Authorise filing of Form DIR-12.'
  },
  {
    step_number: 5,
    title: 'File Form DIR-12 for Additional Director Appointment',
    document_name: 'MCA Form DIR-12 (Initial Appointment)',
    spoke_slug: 'dir-12-guide',
    governing_law: 'Section 170(2) read with Rule 18',
    deadline_text: 'Within 30 days of Board Meeting',
    form_name: 'Form DIR-12',
    filing_authority: 'MCA V3 Portal',
    is_mandatory: true,
    notes: 'File electronically on MCA V3 portal with DIR-2, certified board resolution, and intimation as attachments. Normal fee ₹200–₹600 depending on capital slab.'
  },
  {
    step_number: 6,
    title: 'Issue Formal Appointment Letter',
    document_name: 'Director Appointment Letter',
    spoke_slug: 'director-appointment-letter',
    governing_law: 'Good Secretarial Practice & Terms of Directorship',
    deadline_text: 'Immediately following Board Meeting',
    form_name: 'Appointment Letter',
    filing_authority: 'Company & Appointee Records',
    is_mandatory: true,
    notes: 'Issue written letter detailing role, term (up to next AGM), fiduciary duties, and code of conduct. Appointee signs duplicate copy acknowledging receipt.'
  },
  {
    step_number: 7,
    title: 'Receive Form MBP-1 & Update Statutory Registers',
    document_name: 'Form MBP-1 & Register of Directors Entry',
    spoke_slug: 'mbp-1-format',
    governing_law: 'Sections 170(1), 184(1) & 189',
    deadline_text: 'First Board Meeting attended by new director',
    form_name: 'MBP-1 & Register Entries (MBP-4)',
    filing_authority: 'Company Records',
    is_mandatory: true,
    notes: 'Appointee discloses entity interests in Form MBP-1 at first board meeting. Secretary makes entries in Register of Directors (Sec 170) and Register of Contracts (Sec 189).'
  },
  {
    step_number: 8,
    title: 'Issue General Meeting Notice with Explanatory Statement',
    document_name: 'General Meeting Notice & Section 102 Explanatory Statement',
    spoke_slug: 'general-meeting-notice-director-regularisation',
    governing_law: 'Sections 101, 102 & 152; Secretarial Standard SS-2',
    deadline_text: 'At least 21 clear days before General Meeting',
    form_name: 'AGM/EGM Notice & Explanatory Statement',
    filing_authority: 'Members of Company',
    is_mandatory: true,
    notes: 'Issue notice of AGM or EGM to all members at least 21 clear days in advance with explanatory statement under Section 102 setting out appointee qualifications and Board recommendation.'
  },
  {
    step_number: 9,
    title: 'Hold General Meeting & Pass Ordinary Resolution',
    document_name: 'Ordinary Resolution — Appointment as Director',
    spoke_slug: 'ordinary-resolution-director-regularisation',
    governing_law: 'Section 152, Companies Act, 2013',
    deadline_text: 'Date of General Meeting',
    form_name: 'Certified True Copy of Ordinary Resolution',
    filing_authority: 'ROC Attachment',
    is_mandatory: true,
    notes: 'Shareholders pass Ordinary Resolution regularising Additional Director into a regular Director liable to retire by rotation (or as per Articles).'
  },
  {
    step_number: 10,
    title: 'File Second Form DIR-12 for Regularisation',
    document_name: 'MCA Form DIR-12 (Regularisation / Change in Designation)',
    spoke_slug: 'dir-12-guide',
    governing_law: 'Section 170(2) read with Rule 18',
    deadline_text: 'Within 30 days of General Meeting',
    form_name: 'Form DIR-12',
    filing_authority: 'MCA V3 Portal',
    is_mandatory: true,
    notes: 'File second DIR-12 within 30 days of general meeting selecting Change in Designation from Additional Director to Director with certified ordinary resolution attached.'
  },
  {
    step_number: 11,
    title: 'Finalise Minutes & Update Register of Directors',
    document_name: 'Minutes Extracts — Board and General Meeting',
    spoke_slug: 'minutes-extracts-director-appointment',
    governing_law: 'Section 118; SS-1 & SS-2; Section 170',
    deadline_text: 'Within 30 days of respective meetings',
    form_name: 'Signed Minutes in Minutes Book',
    filing_authority: 'Statutory Registers',
    is_mandatory: true,
    notes: 'Enter and sign minutes in statutory minutes book within 30 days. Finalise updated entries in Register of Directors and KMP.'
  }
]

export const DOCUMENT_SET_DOCUMENTS_SEED = [
  {
    title: 'Checklist — Appointment of a Director',
    spoke_slug: 'director-appointment-set#checklist',
    governing_section: 'Companies Act, 2013 & Rules',
    step_number: 1,
    version: 'v1.0',
    who_signs: 'Board of Directors / Company Secretary',
    when_filed: 'Internal secretarial checklist — preserved in compliance binder',
    template_text: `CHECKLIST - APPOINTMENT OF A DIRECTOR
Event-based document set under the Companies Act, 2013 - read this first

Event: Appointment of a Director in a private limited company - the most common route: appointment as Additional Director by the Board, then regularisation by shareholders. Work through the steps in order; every document in this set is listed at its step.

Before you start
1. DIN: the appointee must hold a Director Identification Number (Section 153). If not, apply in Form DIR-3 or through SPICe+.
2. Eligibility: confirm the appointee is NOT disqualified under Section 164 (grounds include non-filing of financial statements/annual return for 3 years by a company where he is a director) and is within the Section 165 limits (maximum 20 companies, of which maximum 10 public).
3. Articles of Association: check whether the Articles authorise the Board to appoint an Additional Director (required by Section 161(1)). If silent, the Articles must be amended first.
4. Consents in hand: collect from the appointee before the board meeting: DIR-2 consent (Document 03), DIR-8 intimation of non-disqualification (Document 04).

The 11 Steps in Filing Order
Step 1: Obtain DIN & verify eligibility (Section 153, 164, 165)
Step 2: Collect DIR-2 consent & DIR-8 intimation (Sections 152(5), 164(2))
Step 3: Board meeting notice and agenda to all directors at least 7 days before meeting (Section 173, SS-1)
Step 4: Convene board meeting & pass resolution appointing Additional Director (Section 161(1))
Step 5: File Form DIR-12 on MCA V3 within 30 days of board meeting (Section 170(2), Rule 18)
Step 6: Issue Letter of Appointment to the new director
Step 7: Collect Form MBP-1 at first board meeting attended & enter Register of Directors (Sections 170, 184(1))
Step 8: Regularisation: general meeting notice with Section 102 explanatory statement at least 21 clear days before meeting (Sections 101, 102; SS-2)
Step 9: Hold general meeting & pass Ordinary Resolution regularising director (Section 152)
Step 10: File second Form DIR-12 on MCA V3 within 30 days of general meeting (Section 170(2), Rule 18)
Step 11: Finalise Board & General Meeting minutes within 30 days & update statutory registers (Sections 118, 170)`
  },
  {
    title: 'Board Meeting Notice and Agenda',
    spoke_slug: 'board-meeting-notice-director-appointment',
    governing_section: 'Section 173(3) and Secretarial Standard SS-1',
    step_number: 3,
    version: 'v1.0',
    who_signs: 'Director / Company Secretary',
    when_filed: 'Served to all directors at least 7 days before the Board Meeting',
    template_text: `BOARD MEETING NOTICE AND AGENDA - APPOINTMENT OF ADDITIONAL DIRECTOR
[On the Letterhead of the Company]

NOTICE OF BOARD MEETING

Notice is hereby given that Meeting No. [__] of the Board of Directors of [COMPANY NAME] will be held on [Day], [Date] at [Time] at the Registered Office of the Company at [Full registered office address] [or: through Video Conferencing, VC facility details: ________] to transact the business set out in the Agenda below.

Directors who intend to participate through Video Conferencing are requested to intimate the Company Secretary / Director at least [2 days] prior to the date of the meeting.

By Order of the Board
For [COMPANY NAME]

______________________
[Name]
Director / Company Secretary
DIN: [________]
Date: [Date]
Place: [Place]

AGENDA
Item 1: To grant leave of absence, if any.
Item 2: To take note of the consent (Form DIR-2) and the intimation of non-disqualification (Form DIR-8) received from [Name of appointee].
Item 3: To consider and, if thought fit, to appoint [Name of appointee] (DIN: [________]) as an Additional Director of the Company under Section 161(1) of the Companies Act, 2013, and to authorise filing of Form DIR-12.
Item 4: To transact any other business with the permission of the Chair.

NOTES ON AGENDA
Item 3: [Name of appointee] has expressed willingness to join the Board. His consent in Form DIR-2 under Section 152(5) and his intimation in Form DIR-8 under Section 164 of the Companies Act, 2013 are placed before the meeting. Under Section 161(1), an Additional Director holds office up to the date of the next Annual General Meeting or the last date on which the Annual General Meeting should have been held, whichever is earlier, and is thereafter required to be regularised by the shareholders to continue as a Director.`
  },
  {
    title: 'Board Resolution — Appointment of Additional Director',
    spoke_slug: 'board-resolution-director-appointment',
    governing_section: 'Section 161(1), Companies Act, 2013',
    step_number: 4,
    version: 'v1.0',
    who_signs: 'Certified by a Director or Company Secretary',
    when_filed: 'Attached to Form DIR-12 filed with MCA within 30 days',
    template_text: `BOARD RESOLUTION - APPOINTMENT OF ADDITIONAL DIRECTOR
[COMPANY NAME]
CIN: [____________________]
Registered Office: [Full registered office address]

CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT MEETING NO. [__] OF THE BOARD OF DIRECTORS OF [COMPANY NAME] HELD ON [Day], [Date] AT [Time] AT THE REGISTERED OFFICE OF THE COMPANY

"RESOLVED THAT pursuant to the provisions of Section 161(1) and other applicable provisions of the Companies Act, 2013, read with the Companies (Appointment and Qualification of Directors) Rules, 2014 and Article [__] of the Articles of Association of the Company, and based on the consent received in Form DIR-2 and the intimation received in Form DIR-8 from [Name of appointee], consent of the Board of Directors of the Company be and is hereby accorded to appoint [Name of appointee] (DIN: [________]) as an Additional Director of the Company with effect from [Date], who shall hold office up to the date of the next Annual General Meeting or the last date on which the Annual General Meeting should have been held, whichever is earlier."

"RESOLVED FURTHER THAT any one of the Directors or the Company Secretary of the Company be and is hereby severally authorised to file Form DIR-12 and other necessary forms with the Registrar of Companies, to make entries in the Register of Directors and Key Managerial Personnel maintained under Section 170 of the Companies Act, 2013, and to do all such acts, deeds and things as may be necessary for giving effect to the above resolution."

Certified True Copy
For [COMPANY NAME]

______________________
[Name]
Director
DIN: [________]
Date: [Date]
Place: [Place]`
  },
  {
    title: 'Form DIR-2 — Consent to Act as Director',
    spoke_slug: 'dir-2-consent-format',
    governing_section: 'Section 152(5) read with Rule 8',
    step_number: 2,
    version: 'v1.0',
    who_signs: 'Signed by the Appointee Director',
    when_filed: 'Submitted to Company before appointment; attached to Form DIR-12 filed within 30 days',
    template_text: `FORM DIR-2 - CONSENT TO ACT AS DIRECTOR
FORM DIR-2
Consent to act as a Director of a company
[Pursuant to Section 152(5) of the Companies Act, 2013 and Rule 8 of the Companies (Appointment and Qualification of Directors) Rules, 2014]

To,
The Board of Directors,
[COMPANY NAME],
[Registered Office Address of the Company]

Subject: Consent to act as a Director

I, [Full Name of Appointee], hereby give my consent to act as a Director of [COMPANY NAME], pursuant to sub-section (5) of Section 152 of the Companies Act, 2013, and certify that I am not disqualified to become a director under the Companies Act, 2013.

1. Director Identification Number (DIN): [________]
2. Full Name: [Full Name of Appointee]
3. Father's Name: [Father's Name]
4. Address: [Residential Address]
5. E-mail ID: [Email Address]
6. Mobile No.: [Mobile Number]
7. Income-tax PAN: [PAN Number]
8. Occupation: [Profession / Occupation]
9. Date of Birth: [DD/MM/YYYY]
10. Nationality: [Indian / Other]
11. No. of companies in which I am already a Director: [__]
    (a) Listed companies: [__]
    (b) Other public companies: [__]
    (c) Private companies: [__]
12. Particulars of membership/chairmanship in committees: [Details / Nil]

DECLARATION
I declare that I have not been convicted of any offence in connection with the promotion, formation or management of any company or LLP, and have not been found guilty of any fraud or misfeasance or of any breach of duty to any company under this Act or any previous company law in the last five years. I further declare that if appointed, my total directorships will not exceed the limits prescribed under Section 165 of the Companies Act, 2013.

______________________
Signature: [Signature of Appointee]
Name: [Full Name of Appointee]
Date: [Date]
Place: [Place]

Enclosures:
1. Self-attested copy of PAN Card
2. Self-attested copy of Address Proof (Aadhaar / Passport / Voter ID)`
  },
  {
    title: 'Form DIR-8 — Intimation by Director',
    spoke_slug: 'dir-8-format',
    governing_section: 'Section 164(2) read with Rule 14(1)',
    step_number: 2,
    version: 'v1.0',
    who_signs: 'Signed by the Appointee Director',
    when_filed: 'Submitted to Company before appointment; preserved in secretarial records',
    template_text: `FORM DIR-8 - INTIMATION BY DIRECTOR
FORM DIR-8
Intimation by Director
[Pursuant to Section 164(2) of the Companies Act, 2013 and Rule 14(1) of the Companies (Appointment and Qualification of Directors) Rules, 2014]

Registration No. of Company / CIN: [____________________]
Nominal Capital: Rs. [__________]
Paid-up Capital: Rs. [__________]
Name of Company: [COMPANY NAME]
Address of its Registered Office: [Registered Office Address]

To,
The Board of Directors of [COMPANY NAME]

I, [Full Name of Appointee], son/daughter/wife of [Father's/Spouse's Name], resident of [Residential Address], having DIN [________], proposed to be appointed as a Director on the Board of [COMPANY NAME], hereby give notice that I am not disqualified to become a Director under sub-section (1) and sub-section (2) of Section 164 of the Companies Act, 2013.

I further certify that:
1. I have not been disqualified to act as a Director under Section 164(1) of the Companies Act, 2013.
2. I am not a Director in any company which:
   (a) has not filed financial statements or annual returns for any continuous period of three financial years; or
   (b) has failed to repay the deposits accepted by it or pay interest thereon or to redeem any debentures on the due date or pay interest due thereon or pay any dividend declared and such failure to pay or redeem continues for one year or more.

Particulars of companies in which I am a director as on date:
1. [Company Name 1] - CIN: [______________] - Default: None
2. [Company Name 2] - CIN: [______________] - Default: None

______________________
Signature: [Signature of Appointee]
Name: [Full Name of Appointee]
DIN: [________]
Date: [Date]
Place: [Place]`
  },
  {
    title: 'Form MBP-1 — Notice of Interest by Director',
    spoke_slug: 'mbp-1-format',
    governing_section: 'Section 184(1) read with Rule 9(1)',
    step_number: 7,
    version: 'v1.0',
    who_signs: 'Signed by the Appointed Director',
    when_filed: 'Submitted at the first Board Meeting attended as a Director; recorded in MBP-4 register',
    template_text: `FORM MBP-1 - NOTICE OF INTEREST BY DIRECTOR
FORM MBP-1
Notice of interest by Director
[Pursuant to Section 184(1) of the Companies Act, 2013 and Rule 9(1) of the Companies (Meetings of Board and its Powers) Rules, 2014]

To,
The Board of Directors,
[COMPANY NAME],
[Registered Office Address]

Dear Sir(s) / Madam,

I, [Full Name of Director], son/daughter/wife of [Father's/Spouse's Name], resident of [Residential Address], being a Director in the Company, hereby give notice of my interest or concern in the following company or companies, bodies corporate, firms or other association of individuals:

1. Names of the Companies / Bodies Corporate / Firms / Association of Individuals:
   (a) Name: [Entity Name 1], CIN/Registration No: [______________], Nature of Interest: [Director / Shareholder / Partner], Shareholding (%): [__]%, Date on which interest arose: [DD/MM/YYYY]
   (b) Name: [Entity Name 2], CIN/Registration No: [______________], Nature of Interest: [Director / Shareholder / Partner], Shareholding (%): [__]%, Date on which interest arose: [DD/MM/YYYY]

2. Details of contracts or arrangements entered into or proposed to be entered into by the Company with any of the entities listed above:
   [Nil / Describe specific contract or arrangement, if any]

I hereby undertake to inform the Company of any change in the above disclosures at the first meeting of the Board held after such change.

______________________
Signature: [Signature of Director]
Name: [Full Name of Director]
DIN: [________]
Date: [Date]
Place: [Place]`
  },
  {
    title: 'General Meeting Notice & Sec 102 Explanatory Statement',
    spoke_slug: 'general-meeting-notice-director-regularisation',
    governing_section: 'Sections 101, 102 & 152 and Secretarial Standard SS-2',
    step_number: 8,
    version: 'v1.0',
    who_signs: 'By Order of the Board (Director / Company Secretary)',
    when_filed: 'Served to members at least 21 clear days before the General Meeting',
    template_text: `GENERAL MEETING NOTICE AND SECTION 102 EXPLANATORY STATEMENT - REGULARISATION OF DIRECTOR
[On the Letterhead of the Company]

NOTICE OF [ANNUAL GENERAL MEETING / EXTRAORDINARY GENERAL MEETING]

Notice is hereby given that the [__] [Annual General Meeting / Extraordinary General Meeting] of the members of [COMPANY NAME] will be held on [Day], [Date] at [Time] at [Venue / through video conferencing] to transact the following business:

SPECIAL BUSINESS
1. Appointment of [Name of appointee] as a Director of the Company:
To consider and, if thought fit, to pass the following resolution as an ORDINARY RESOLUTION:

"RESOLVED THAT pursuant to the provisions of Section 152 and other applicable provisions of the Companies Act, 2013 and the Companies (Appointment and Qualification of Directors) Rules, 2014, and Article [__] of the Articles of Association of the Company, [Name of appointee] (DIN: [________]), who was appointed as an Additional Director of the Company by the Board of Directors with effect from [Date of Board appointment] pursuant to Section 161(1) of the Companies Act, 2013 and who holds office up to the date of this Annual General Meeting, and in respect of whom the Company has received consent in Form DIR-2 and intimation in Form DIR-8 to act as Director, be and is hereby appointed as a Director of the Company, [liable / not liable] to retire by rotation."

"RESOLVED FURTHER THAT any one of the Directors or the Company Secretary of the Company be and is hereby severally authorised to file Form DIR-12 with the Registrar of Companies and to do all such acts, deeds and things as may be necessary for giving effect to the above resolution."

By Order of the Board
For [COMPANY NAME]

______________________
[Name]
Director / Company Secretary
DIN: [________]
Date: [Date]
Place: [Place]

EXPLANATORY STATEMENT PURSUANT TO SECTION 102 OF THE COMPANIES ACT, 2013
Item No. 1:
[Name of appointee] was appointed as an Additional Director of the Company by the Board of Directors with effect from [Date], pursuant to the provisions of Section 161(1) of the Companies Act, 2013 and Article [__] of the Articles of Association of the Company.
Under Section 161(1), [Name of appointee] holds office up to the date of the forthcoming Annual General Meeting.

Brief profile: [Name], aged [__], is [qualification / experience summary]. He holds [__] shares of the Company [or: He does not hold any shares of the Company]. He is a director in the following other companies: [list / None]. His consent in Form DIR-2 and intimation in Form DIR-8 have been received and are available for inspection at the Registered Office during business hours up to the date of the meeting.

Except [Name of appointee] and his relatives, none of the Directors and Key Managerial Personnel of the Company or their relatives are concerned or interested, financially or otherwise, in the Ordinary Resolution set out at Item No. 1.

The Board recommends the Ordinary Resolution set out at Item No. 1 for approval of the members.`
  },
  {
    title: 'Ordinary Resolution — Appointment as Director',
    spoke_slug: 'ordinary-resolution-director-regularisation',
    governing_section: 'Section 152, Companies Act, 2013',
    step_number: 9,
    version: 'v1.0',
    who_signs: 'Certified by a Director or Company Secretary',
    when_filed: 'Attached to second Form DIR-12 filed with MCA within 30 days of General Meeting',
    template_text: `ORDINARY RESOLUTION - APPOINTMENT AS DIRECTOR
[COMPANY NAME]
CIN: [____________________]
Registered Office: [Full registered office address]

CERTIFIED TRUE COPY OF THE ORDINARY RESOLUTION PASSED AT THE [__] [ANNUAL GENERAL MEETING / EXTRAORDINARY GENERAL MEETING] OF THE MEMBERS OF [COMPANY NAME] HELD ON [Day], [Date] AT [Venue]

"RESOLVED THAT pursuant to the provisions of Section 152 and other applicable provisions of the Companies Act, 2013 and the Companies (Appointment and Qualification of Directors) Rules, 2014, and Article [__] of the Articles of Association of the Company, [Name of appointee] (DIN: [________]), who was appointed as an Additional Director of the Company by the Board of Directors with effect from [Date of Board appointment] pursuant to Section 161(1) of the Companies Act, 2013 and who holds office up to the date of this Annual General Meeting, and in respect of whom the Company has received consent in Form DIR-2 and intimation in Form DIR-8 to act as Director, be and is hereby appointed as a Director of the Company, [liable / not liable] to retire by rotation."

"RESOLVED FURTHER THAT any one of the Directors or the Company Secretary of the Company be and is hereby severally authorised to file Form DIR-12 with the Registrar of Companies and to do all such acts, deeds and things as may be necessary for giving effect to the above resolution."

Certified True Copy
For [COMPANY NAME]

______________________
[Name]
Director / Company Secretary
DIN: [________]
Date: [Date]
Place: [Place]`
  },
  {
    title: 'Minutes Extracts — Board and General Meeting',
    spoke_slug: 'minutes-extracts-director-appointment',
    governing_section: 'Section 118, Secretarial Standards SS-1 & SS-2',
    step_number: 11,
    version: 'v1.0',
    who_signs: 'Signed by the Chairperson of the Meeting',
    when_filed: 'Recorded in the Statutory Minutes Book within 30 days',
    template_text: `MINUTES EXTRACTS - BOARD AND GENERAL MEETING
PART A - EXTRACT OF THE MINUTES OF BOARD MEETING NO. [__]/20[__]-[__] OF [COMPANY NAME] HELD ON [Date] AT [Venue]

Appointment of Additional Director: The Chairperson informed the Board that [Name of appointee] had consented, in Form DIR-2, to act as a Director of the Company and had confirmed, in Form DIR-8, that he is not disqualified under Section 164 of the Companies Act, 2013. The Board considered the proposal and passed the resolution set out in Document 02 of this set. The Company Secretary / Director was directed to file Form DIR-12 within 30 days and to make the entry in the Register of Directors and Key Managerial Personnel.

PART B - EXTRACT OF THE MINUTES OF THE [ANNUAL GENERAL MEETING / EXTRAORDINARY GENERAL MEETING] OF [COMPANY NAME] HELD ON [Date] AT [Venue]

Appointment of Director: The Chairperson placed before the meeting the proposal to appoint [Name of appointee], the Additional Director whose term expired at the meeting, as a Director of the Company. The explanatory statement under Section 102 had been circulated with the notice. The resolution set out in Document 07 of this set was proposed, seconded and passed as an Ordinary Resolution by the members present [unanimously / by majority]. The Company Secretary / Director was directed to file Form DIR-12 within 30 days of the meeting.`
  },
  {
    title: 'Register of Directors and KMP — Specimen Entry',
    spoke_slug: 'register-of-directors-specimen-entry',
    governing_section: 'Section 170(1) read with Rule 17',
    step_number: 7,
    version: 'v1.0',
    who_signs: 'Maintained and signed by Company Secretary / Managing Director',
    when_filed: 'Maintained at Registered Office of Company; open to member inspection',
    template_text: `REGISTER OF DIRECTORS AND KMP - SPECIMEN ENTRY
The Register of Directors and Key Managerial Personnel is maintained under Section 170(1) of the Companies Act, 2013, read with Rule 17 of the Companies (Appointment and Qualification of Directors) Rules, 2014, at the Registered Office of the Company. On every appointment, make an entry for the new director on the following lines:

1. Director Identification Number (DIN): [________]
2. Full Name: [Full Name of Director]
3. Father's / Mother's / Spouse's Name: [Name]
4. Date of Birth: [DD/MM/YYYY]
5. Residential Address: [Full Residential Address]
6. Nationality: [Indian / Other]
7. Occupation: [Occupation / Profession]
8. Date of Board Resolution appointing as Additional Director: [DD/MM/YYYY]
9. Effective Date of Appointment: [DD/MM/YYYY]
10. Office held: Additional Director
11. Date of General Meeting regularising appointment: [DD/MM/YYYY]
12. Designation upon regularisation: Director
13. Date of cessation (if applicable): [__]
14. Details of securities held in the Company: [No. of shares / Nil]

Also: take the MBP-1 disclosure (Document 05) on record, and enter particulars of contracts or arrangements in which the director is interested in the Register under Section 189 (Form MBP-4), where applicable. The Register is open for inspection by members and is produced at the Annual General Meeting.`
  },
  {
    title: 'Director Appointment Letter',
    spoke_slug: 'director-appointment-letter',
    governing_section: 'Section 161 & Secretarial Practice',
    step_number: 6,
    version: 'v1.0',
    who_signs: 'Signed by Managing Director / Authorized Director and accepted by Appointee',
    when_filed: 'Delivered to appointee upon appointment; copy retained in company secretarial records',
    template_text: `APPOINTMENT LETTER FOR ADDITIONAL DIRECTOR
[On the Letterhead of the Company]

Date: [Date]

To,
[Full Name of Appointee]
[Residential Address]

Subject: Appointment as Additional Director of [COMPANY NAME]

Dear [Name of Appointee],

We are pleased to inform you that the Board of Directors of [COMPANY NAME] ("Company"), at its meeting held on [Date of Board Meeting], has approved your appointment as an Additional Director of the Company pursuant to Section 161(1) of the Companies Act, 2013 and the Articles of Association of the Company, with effect from [Date].

1. Term of Office:
Under Section 161(1) of the Companies Act, 2013, you shall hold office up to the date of the forthcoming Annual General Meeting (AGM) of the Company or the last date on which the AGM should have been held, whichever is earlier. Your appointment may be regularised as a Director by the shareholders of the Company at the general meeting.

2. Fiduciary Duties & Code of Conduct:
As a Director, you shall perform your duties in accordance with the provisions of Section 166 of the Companies Act, 2013, which include acting in good faith to promote the objects of the company for the benefit of its members as a whole, exercising due and reasonable care, skill and diligence, and avoiding any direct or indirect conflicts of interest.

3. Disclosures of Interest:
You are requested to submit Form MBP-1 disclosing your interest or concern in any companies, bodies corporate, firms or other associations at the first meeting of the Board in which you participate as a Director, as required under Section 184(1) of the Companies Act, 2013.

Please sign and return the duplicate copy of this letter in token of your acceptance.

Yours faithfully,
For [COMPANY NAME]

______________________
[Name]
Managing Director / Director
DIN: [________]

AGREED AND ACCEPTED:
I have read and accept the terms of my appointment as set out in this letter.

______________________
[Signature of Appointee]
[Full Name of Appointee]
Date: [Date]`
  }
]

export const DOCUMENT_SET_CHANGELOG_SEED = [
  {
    version: 'v1.0',
    change_date: '2026-11-07',
    change_note: 'Initial verified release of the Director Appointment Document Set (Private Limited Company — Additional Director appointment and regularisation route). Verified against Companies Act 2013, Fee Rules 2014, and ICSI Secretarial Standards SS-1/SS-2 (revised editions effective 1 April 2024).',
    instrument_reference: 'Companies Act, 2013 (Act 18 of 2013); MCA Fee Rules 2014 (G.S.R. 268(E)); ICSI SS-1 and SS-2 (2024 revision)'
  }
]
