import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from 'docx'
import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from 'pdf-lib'

export type MouType =
  | 'business_partnership'
  | 'joint_venture'
  | 'vendor_services'
  | 'research_tech'
  | 'startup_founders'
  | 'inter_company'

export interface MouParty {
  name: string
  entityType: string // e.g. 'Private Limited Company', 'LLP', 'Sole Proprietorship', 'Individual'
  identifier: string // CIN, LLPIN, PAN, or Passport
  registeredAddress: string
  signatoryName: string
  signatoryDesignation: string
}

export interface MouFormData {
  mouType: MouType
  title: string
  effectiveDate: string
  executionCity: string
  executionState: string

  // Parties
  partyA: MouParty
  partyB: MouParty

  // Preamble & Background
  backgroundRecitals: string[]

  // Purpose & Scope
  collaborationPurpose: string
  scopeOfWork: string

  // Responsibilities
  obligationsPartyA: string[]
  obligationsPartyB: string[]

  // Commercial / Financial Terms
  hasFinancialTerms: boolean
  financialTermsDescription: string

  // Term & Validity
  validityDuration: string // e.g. '12 (Twelve) Months'
  targetDefinitiveAgreementDate: string // e.g. 'within 90 (Ninety) days'

  // Binding Clauses Toggle
  isConfidentialityBinding: boolean
  isIpClauseBinding: boolean
  isExclusivityBinding: boolean
  isDisputeResolutionBinding: boolean

  // Specific Clauses
  confidentialityTerms: string
  intellectualPropertyTerms: string
  exclusivityTerms: string

  // Dispute Resolution & Governing Law
  arbitrationSeat: string // e.g. 'New Delhi'
  governingLawState: string // e.g. 'Delhi'

  // Witnesses
  witness1Name: string
  witness1Address: string
  witness2Name: string
  witness2Address: string
}

export const MOU_TYPE_PRESETS: Record<
  MouType,
  {
    label: string
    shortBadge: string
    title: string
    defaultPurpose: string
    scope: string
    partyARole: string
    partyBRole: string
    obligationsA: string[]
    obligationsB: string[]
    financials: string
    ipTerms: string
    exclusivity: string
  }
> = {
  business_partnership: {
    label: 'Business Partnership & Strategic Alliance',
    shortBadge: 'Partnership',
    title: 'MEMORANDUM OF UNDERSTANDING FOR STRATEGIC BUSINESS PARTNERSHIP',
    defaultPurpose:
      'To establish a strategic non-exclusive commercial alliance combining Party A’s enterprise technology platform with Party B’s national sales and distribution network across India.',
    scope:
      'Joint market exploration, co-marketing webinars, prospective client referrals, and pre-sales integration assessments for enterprise clients.',
    partyARole: 'Technology & Product Partner',
    partyBRole: 'Distribution & Commercial Partner',
    obligationsA: [
      'Provide cloud software sandbox access, APIs, and product technical documentation.',
      'Deploy dedicated pre-sales technical engineers for high-value client demonstrations.',
      'Conduct comprehensive product training sessions for Party B’s sales personnel.',
      'Maintain uptime and technical service levels during live pilot demonstrations.',
    ],
    obligationsB: [
      'Introduce qualified commercial enterprise leads through its established regional sales network.',
      'Organize joint client meetings, pitch sessions, and product capability showcases.',
      'Gather customer feedback, market pricing insights, and enterprise RFP requirements.',
      'Bear all travel, operational, and marketing costs incurred by its direct personnel.',
    ],
    financials:
      'Each party shall bear its own operational expenses during the exploratory MoU stage. Commercial commissions and referral fees shall be finalized under a separate Definitive Commercial Agreement.',
    ipTerms:
      'Each party retains absolute and exclusive ownership of its pre-existing intellectual property, patents, source code, and trademarks. No transfer of IP is contemplated under this MoU.',
    exclusivity:
      'Non-exclusive collaboration. Both parties remain free to pursue independent commercial opportunities outside the specific joint client accounts registered under this collaboration.',
  },

  joint_venture: {
    label: 'Joint Venture (JV) Preliminary Framework',
    shortBadge: 'Joint Venture',
    title: 'MEMORANDUM OF UNDERSTANDING FOR FORMATION OF JOINT VENTURE',
    defaultPurpose:
      'To establish the foundational commercial terms and procedural framework for incorporating a Joint Venture Special Purpose Vehicle (JV SPV) in India for infrastructure development.',
    scope:
      'Conducting technical feasibility studies, legal due diligence, equity capitalization planning, and regulatory filings prior to executing the definitive Joint Venture Agreement.',
    partyARole: 'Technical & Engineering Partner',
    partyBRole: 'Financial & Land Development Partner',
    obligationsA: [
      'Deliver architectural designs, engineering specifications, and EPC feasibility models.',
      'Procure required technical certifications and environmental pre-clearance reports.',
      'Nominate key technical directors to the preliminary Joint Steering Committee.',
      'Formulate detailed bill of quantities (BOQ) and capital expenditure milestones.',
    ],
    obligationsB: [
      'Secure clear, marketable, and unencumbered possession of the project land parcel.',
      'Provide initial seed funding and arrange consortium project debt financing from banks.',
      'Manage municipal permissions, zoning approvals, and state industrial development clearances.',
      'Coordinate external statutory audit and corporate compliance for the JV SPV formation.',
    ],
    financials:
      'Proposed initial paid-up equity shareholding of 51% for Party A and 49% for Party B in the proposed JV Company, subject to final valuation and capital infusion schedules.',
    ipTerms:
      'Any bespoke engineering designs or software created exclusively for the JV project shall vest in the proposed JV SPV upon incorporation and reimbursement of development costs.',
    exclusivity:
      'Strict 90-day exclusivity period during which neither party shall negotiate, solicit, or execute competing joint venture transactions in the designated geographic territory.',
  },

  vendor_services: {
    label: 'Vendor, Supply & Services Collaboration',
    shortBadge: 'Vendor & Supply',
    title: 'MEMORANDUM OF UNDERSTANDING FOR SUPPLY OF GOODS & SUPPORT SERVICES',
    defaultPurpose:
      'To outline the mutual understandings and service benchmarks for the prospective procurement of specialized industrial equipment and ongoing maintenance services.',
    scope:
      'Product testing, supply chain integration, delivery timelines, pricing matrices, and warranty terms prior to issuing recurring Master Purchase Orders.',
    partyARole: 'Procuring Enterprise / Client',
    partyBRole: 'Authorized Vendor & Service Provider',
    obligationsA: [
      'Provide accurate procurement forecasts, product technical specifications, and delivery site readiness.',
      'Facilitate timely factory access for installation, pre-dispatch inspections, and commissioning.',
      'Review and process milestone delivery inspection certificates within 7 business days.',
      'Ensure prompt issuance of purchase orders upon validation of sample batch quality.',
    ],
    obligationsB: [
      'Supply initial test equipment batches adhering to ISO/BIS quality and tolerance standards.',
      'Furnish comprehensive test certificates, warranty undertakings, and user operating manuals.',
      'Provide 24/7 on-call technical engineers and maintain required inventory of critical spare parts.',
      'Adhere strictly to agreed delivery schedules and replace any defective units at own cost.',
    ],
    financials:
      'Indicative unit procurement pricing agreed per Annexure A, with standard 30-day payment credit terms upon submission of verified tax invoices and Goods Received Notes (GRN).',
    ipTerms:
      'Custom manufacturing dies, specifications, and client proprietary drawings remain the sole property of Party A. Party B shall not utilize client drawings for third parties.',
    exclusivity:
      'Party B is appointed as preferred supplier for the designated project site for a trial period of 6 months.',
  },

  research_tech: {
    label: 'Research, Academic & Technology Sharing',
    shortBadge: 'Research & Tech',
    title: 'MEMORANDUM OF UNDERSTANDING FOR ACADEMIC & RESEARCH COLLABORATION',
    defaultPurpose:
      'To foster institutional research collaboration, joint technology development, faculty-industry exchange, and academic student internship programmes.',
    scope:
      'Joint scientific research proposals, incubation support, publication of scholarly whitepapers, and laboratory equipment resource sharing.',
    partyARole: 'Academic / Research Institution',
    partyBRole: 'Industry Technology Partner',
    obligationsA: [
      'Provide state-of-the-art laboratory infrastructure, computing facilities, and research scholars.',
      'Facilitate faculty mentorship and academic supervision for joint research projects.',
      'Organize joint technical symposia, research workshops, and student hackathons.',
      'Publish peer-reviewed scientific papers acknowledging the industry partnership.',
    ],
    obligationsB: [
      'Provide industry research grants, test datasets, and commercial use-case problem statements.',
      'Offer paid summer internships and pre-placement interviews to qualified postgraduate students.',
      'Depute senior industry data scientists as guest lecturers and technical advisors.',
      'Support commercial prototyping and patent filing fees for viable inventions.',
    ],
    financials:
      'Party B shall fund designated research project grants as per mutual milestone approvals. No institutional fee is payable by Party A.',
    ipTerms:
      'Intellectual property resulting from joint research shall be co-owned jointly. Commercial exploitation rights shall be licensed to Party B on first right of refusal terms.',
    exclusivity:
      'Non-exclusive academic collaboration. Both institutions retain full freedom to partner with other universities and corporate sponsors.',
  },

  startup_founders: {
    label: 'Startup Co-Founders Pre-Incorporation MoU',
    shortBadge: 'Co-Founders',
    title: 'PRE-INCORPORATION MEMORANDUM OF UNDERSTANDING BETWEEN CO-FOUNDERS',
    defaultPurpose:
      'To establish the initial equity ownership split, roles, IP assignment, vesting schedules, and pre-incorporation expenses among startup co-founders prior to registering a Private Limited Company.',
    scope:
      'Full-time commitment obligations, sweat equity allocations, 4-year vesting with 1-year cliff, decision-making governance, and handling founder departure.',
    partyARole: 'Technical Co-Founder & CTO',
    partyBRole: 'Commercial / Business Co-Founder & CEO',
    obligationsA: [
      'Architect, develop, and deploy the Minimum Viable Product (MVP) codebase and software architecture.',
      'Assign all software, code repositories, domains, and technical IP irrevocably to the company upon incorporation.',
      'Lead engineering hiring, tech infrastructure management, and product security protocols.',
      'Devote 100% full-time active working hours exclusively to the startup venture.',
    ],
    obligationsB: [
      'Lead business development, customer acquisition, fundraising pitch decks, and investor relations.',
      'Manage legal incorporation, MCA company registration, trademark filings, and banking setup.',
      'Oversee financial planning, operational budgeting, and initial marketing campaigns.',
      'Devote 100% full-time active working hours exclusively to the startup venture.',
    ],
    financials:
      'Agreed preliminary equity split: 50% for Founder A and 50% for Founder B, subject to a 4-year monthly reverse vesting schedule with a 1-year initial cliff period.',
    ipTerms:
      'All source code, designs, business plans, and domain names created by either founder are deemed work-for-hire and shall be formally assigned to the Private Limited Company upon incorporation.',
    exclusivity:
      'Strict non-compete and exclusivity. Neither founder shall engage in any other employment, freelancing, advisory role, or competing commercial venture without written consent.',
  },

  inter_company: {
    label: 'Inter-Company / Group Operations MoU',
    shortBadge: 'Inter-Company',
    title: 'INTER-COMPANY MEMORANDUM OF UNDERSTANDING FOR SHARED SERVICES',
    defaultPurpose:
      'To govern the sharing of corporate infrastructure, central administrative services, IT software licenses, and executive support across group entities under the Companies Act, 2013.',
    scope:
      'Arm’s length shared services allocation, transfer pricing compliance, reimbursement of shared IT and office costs, and statutory secretarial reporting.',
    partyARole: 'Holding / Principal Service Entity',
    partyBRole: 'Operating Subsidiary / Group Affiliate',
    obligationsA: [
      'Provide enterprise ERP access, cloud server infrastructure, and IT helpdesk support.',
      'Provide central human resources, payroll processing, and statutory compliance management.',
      'Maintain detailed logs, time-sheets, and third-party vendor cost allocations.',
      'Furnish quarterly cost apportionment statements for audit and tax reporting.',
    ],
    obligationsB: [
      'Utilize shared administrative services strictly for authorized corporate operations.',
      'Reimburse allocated actual costs on an arm’s length basis within 30 days of quarterly debit note.',
      'Ensure necessary Board approvals under Section 179 and Section 188 (if applicable) are passed.',
      'Maintain separate books of account and comply with GST input tax credit reverse charges.',
    ],
    financials:
      'Cost-plus 5% or actual cost apportionment on verified square-footage / headcount ratio, adhering to Section 92CA of the Income Tax Act, 1961 transfer pricing guidelines.',
    ipTerms:
      'Central group trademarks and brand logos remain the exclusive property of Party A, licensed royalty-free to Party B during the subsistence of this MoU.',
    exclusivity:
      'Internal group operational arrangement. Valid until superseded by an Inter-Company Master Services Agreement.',
  },
}

export const DEFAULT_SAMPLE_MOU_DATA: MouFormData = {
  mouType: 'business_partnership',
  title: MOU_TYPE_PRESETS.business_partnership.title,
  effectiveDate: '15/09/2026',
  executionCity: 'New Delhi',
  executionState: 'Delhi',

  partyA: {
    name: 'ACME INNOVATIONS PRIVATE LIMITED',
    entityType: 'Private Limited Company incorporated under the Companies Act, 2013',
    identifier: 'CIN: U72900DL2022PTC123456 / PAN: AABCA1234F',
    registeredAddress: 'Plot No. 42, Okhla Industrial Area, Phase-III, New Delhi - 110020',
    signatoryName: 'Mr. Rajesh Sharma',
    signatoryDesignation: 'Director & Chief Executive Officer',
  },

  partyB: {
    name: 'ZENITH ENTERPRISES INDIA PRIVATE LIMITED',
    entityType: 'Private Limited Company incorporated under the Companies Act, 2013',
    identifier: 'CIN: U51909MH2021PTC987654 / PAN: AABCZ9876K',
    registeredAddress: 'Level 8, Express Towers, Nariman Point, Mumbai, Maharashtra - 400021',
    signatoryName: 'Ms. Sunita Deshmukh',
    signatoryDesignation: 'Managing Director',
  },

  backgroundRecitals: [
    'Party A is engaged in the design, development, and commercialization of enterprise cloud-based software, AI automation tools, and scalable IT workflows.',
    'Party B possesses extensive domain expertise, corporate infrastructure, and a nationwide enterprise distribution network across premier commercial hubs in India.',
    'The Parties are desirous of exploring mutual commercial synergies, evaluating collaborative integration of their complementary products and services, and setting forth the broad understandings that will guide their proposed alliance.',
  ],

  collaborationPurpose: MOU_TYPE_PRESETS.business_partnership.defaultPurpose,
  scopeOfWork: MOU_TYPE_PRESETS.business_partnership.scope,

  obligationsPartyA: MOU_TYPE_PRESETS.business_partnership.obligationsA,
  obligationsPartyB: MOU_TYPE_PRESETS.business_partnership.obligationsB,

  hasFinancialTerms: true,
  financialTermsDescription: MOU_TYPE_PRESETS.business_partnership.financials,

  validityDuration: '12 (Twelve) Months from the Effective Date',
  targetDefinitiveAgreementDate: 'within 90 (Ninety) days of execution of this MoU',

  isConfidentialityBinding: true,
  isIpClauseBinding: true,
  isExclusivityBinding: false,
  isDisputeResolutionBinding: true,

  confidentialityTerms:
    'Both Parties agree that any proprietary, technical, financial, customer, or commercial information disclosed under this MoU shall be maintained in strict confidence and shall not be disclosed to any third party for a period of 3 (three) years from disclosure, except as required by applicable law or court order.',
  intellectualPropertyTerms: MOU_TYPE_PRESETS.business_partnership.ipTerms,
  exclusivityTerms: MOU_TYPE_PRESETS.business_partnership.exclusivity,

  arbitrationSeat: 'New Delhi',
  governingLawState: 'Delhi',

  witness1Name: 'Mr. Vikram Malhotra',
  witness1Address: 'B-4/122, Safdarjung Enclave, New Delhi - 110029',
  witness2Name: 'Mr. Rohan Kulkarni',
  witness2Address: 'Flat 402, Sea Green Apartments, Worli, Mumbai - 400018',
}

export function formatInrCurrency(val: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val)
}

function sanitizePdfText(str: string): string {
  if (!str) return ''
  return str
    .replace(/₹/g, 'Rs. ')
    .replace(/[\r\n]+/g, ' ')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/•/g, '-')
    .replace(/[^\x00-\x7F\xA0-\xFF]/g, '')
}

const FONT = 'Bookman Old Style'

// ==========================================
// DOCX BUILDER
// ==========================================

export async function buildMouDocx(inputData: Partial<MouFormData> = {}): Promise<Buffer> {
  const data: MouFormData = { ...DEFAULT_SAMPLE_MOU_DATA, ...inputData }

  const partyAObligationParagraphs = data.obligationsPartyA.map(
    (item, idx) =>
      new Paragraph({
        indent: { left: 720 },
        children: [
          new TextRun({ text: `${idx + 1}. `, bold: true, font: FONT, size: 21 }),
          new TextRun({ text: item, font: FONT, size: 21 }),
        ],
      })
  )

  const partyBObligationParagraphs = data.obligationsPartyB.map(
    (item, idx) =>
      new Paragraph({
        indent: { left: 720 },
        children: [
          new TextRun({ text: `${idx + 1}. `, bold: true, font: FONT, size: 21 }),
          new TextRun({ text: item, font: FONT, size: 21 }),
        ],
      })
  )

  const recitalParagraphs = data.backgroundRecitals.map(
    (item, idx) =>
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text: `${String.fromCharCode(65 + idx)}. `, bold: true, font: FONT, size: 21 }),
          new TextRun({ text: item, font: FONT, size: 21 }),
        ],
      })
  )

  const doc = new Document({
    sections: [
      {
        properties: {
          page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } },
        },
        children: [
          // Document Header
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: data.title.toUpperCase(),
                bold: true,
                size: 26,
                font: FONT,
                underline: {},
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: '(BETWEEN TWO INDEPENDENT COMMERCIAL PARTIES)',
                bold: true,
                size: 18,
                font: FONT,
                color: '444444',
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Preamble
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: `THIS MEMORANDUM OF UNDERSTANDING ("MoU") is entered into and executed on this `,
                font: FONT,
                size: 21,
              }),
              new TextRun({
                text: `${data.effectiveDate} `,
                bold: true,
                font: FONT,
                size: 21,
              }),
              new TextRun({
                text: `at ${data.executionCity}, State of ${data.executionState} ("Effective Date");`,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // BETWEEN
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'BY AND BETWEEN', bold: true, size: 22, font: FONT })],
          }),
          new Paragraph({ text: '' }),

          // Party A
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: `${data.partyA.name.toUpperCase()}, `,
                bold: true,
                font: FONT,
                size: 21,
              }),
              new TextRun({
                text: `a ${data.partyA.entityType}, having its registered office at ${data.partyA.registeredAddress} (${data.partyA.identifier}), represented herein by its authorized signatory, `,
                font: FONT,
                size: 21,
              }),
              new TextRun({
                text: `${data.partyA.signatoryName}, ${data.partyA.signatoryDesignation} `,
                bold: true,
                font: FONT,
                size: 21,
              }),
              new TextRun({
                text: `(hereinafter referred to as "PARTY A" / "FIRST PARTY", which expression shall unless repugnant to the context include its successors, affiliates and permitted assigns) of the FIRST PART;`,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // AND
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'AND', bold: true, size: 22, font: FONT })],
          }),
          new Paragraph({ text: '' }),

          // Party B
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: `${data.partyB.name.toUpperCase()}, `,
                bold: true,
                font: FONT,
                size: 21,
              }),
              new TextRun({
                text: `a ${data.partyB.entityType}, having its registered office at ${data.partyB.registeredAddress} (${data.partyB.identifier}), represented herein by its authorized signatory, `,
                font: FONT,
                size: 21,
              }),
              new TextRun({
                text: `${data.partyB.signatoryName}, ${data.partyB.signatoryDesignation} `,
                bold: true,
                font: FONT,
                size: 21,
              }),
              new TextRun({
                text: `(hereinafter referred to as "PARTY B" / "SECOND PARTY", which expression shall unless repugnant to the context include its successors, affiliates and permitted assigns) of the SECOND PART.`,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: '(Party A and Party B are hereinafter collectively referred to as the "Parties" and individually as a "Party".)',
                italics: true,
                font: FONT,
                size: 19,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // RECITALS
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [new TextRun({ text: 'WHEREAS:', bold: true, size: 22, font: FONT })],
          }),
          ...recitalParagraphs,
          new Paragraph({ text: '' }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: 'NOW, THEREFORE, IT IS MUTUALLY AGREED AND RECORDED BETWEEN THE PARTIES AS FOLLOWS:',
                bold: true,
                size: 22,
                font: FONT,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // CLAUSE 1: PURPOSE & SCOPE
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({ text: '1. PURPOSE AND SCOPE OF COLLABORATION', bold: true, size: 21, font: FONT }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: `1.1 Purpose: ${data.collaborationPurpose}`,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: `1.2 Scope: ${data.scopeOfWork}`,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // CLAUSE 2: RESPONSIBILITIES OF PARTY A
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: `2. ROLES & RESPONSIBILITIES OF PARTY A (${data.partyA.name})`,
                bold: true,
                size: 21,
                font: FONT,
              }),
            ],
          }),
          ...partyAObligationParagraphs,
          new Paragraph({ text: '' }),

          // CLAUSE 3: RESPONSIBILITIES OF PARTY B
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: `3. ROLES & RESPONSIBILITIES OF PARTY B (${data.partyB.name})`,
                bold: true,
                size: 21,
                font: FONT,
              }),
            ],
          }),
          ...partyBObligationParagraphs,
          new Paragraph({ text: '' }),

          // CLAUSE 4: FINANCIAL TERMS
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({ text: '4. FINANCIAL CONSIDERATION & EXPENSES', bold: true, size: 21, font: FONT }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: data.hasFinancialTerms
                  ? data.financialTermsDescription
                  : 'Except as may be expressly agreed in writing under a subsequent Definitive Agreement, each Party shall bear its own internal, operational, travel, and legal expenses incurred in performing this MoU.',
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // CLAUSE 5: TERM & ROADMAP TO DEFINITIVE AGREEMENT
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: '5. TERM, TERMINATION & DEFINITIVE AGREEMENT ROADMAP',
                bold: true,
                size: 21,
                font: FONT,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: `5.1 Term: This MoU shall take effect on the Effective Date and shall remain valid for a duration of ${data.validityDuration}, unless terminated earlier by either Party upon giving thirty (30) days prior written notice.`,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: `5.2 Definitive Agreement: The Parties intend to negotiate in good faith and execute a formal, legally binding Definitive Agreement ${data.targetDefinitiveAgreementDate}. Upon execution of such Definitive Agreement, this MoU shall be superseded in its entirety.`,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // CLAUSE 6: INTENT & BINDING NATURE
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({ text: '6. LEGAL STATUS & BINDING EFFECT', bold: true, size: 21, font: FONT }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text:
                  '6.1 Non-Binding Intent: The Parties expressly acknowledge and confirm that, save and except for Clause 7 (Confidentiality), Clause 8 (Intellectual Property), Clause 9 (Exclusivity), Clause 10 (Dispute Resolution), and Clause 11 (Governing Law) which shall constitute legally binding and enforceable obligations under the Indian Contract Act, 1872, this MoU is an expression of mutual intent only and does not create any binding partnership, agency, joint liability, or enforceable commercial obligation.',
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // CLAUSE 7: CONFIDENTIALITY
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({ text: '7. CONFIDENTIALITY (BINDING)', bold: true, size: 21, font: FONT }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: data.confidentialityTerms,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // CLAUSE 8: INTELLECTUAL PROPERTY
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({ text: '8. INTELLECTUAL PROPERTY RIGHTS (BINDING)', bold: true, size: 21, font: FONT }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: data.intellectualPropertyTerms,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // CLAUSE 9: EXCLUSIVITY / NON-SOLICITATION
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({ text: '9. EXCLUSIVITY & NON-SOLICITATION', bold: true, size: 21, font: FONT }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: data.exclusivityTerms,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // CLAUSE 10: DISPUTE RESOLUTION & ARBITRATION
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: '10. DISPUTE RESOLUTION & ARBITRATION (BINDING)',
                bold: true,
                size: 21,
                font: FONT,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: `In the event of any dispute or difference arising out of the binding provisions of this MoU, the Parties shall attempt amicable resolution within thirty (30) days. Failing such resolution, the dispute shall be referred to and finally resolved by a sole arbitrator mutually appointed in accordance with the Arbitration and Conciliation Act, 1996. The seat and venue of arbitration shall be ${data.arbitrationSeat}, India, and the proceedings shall be conducted in the English language.`,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // CLAUSE 11: GOVERNING LAW & JURISDICTION
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: '11. GOVERNING LAW & JURISDICTION (BINDING)',
                bold: true,
                size: 21,
                font: FONT,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: `This MoU shall be governed by and construed in accordance with the laws of India. Subject to the arbitration clause hereinabove, the competent courts situated at ${data.arbitrationSeat}, State of ${data.governingLawState} shall have exclusive territorial jurisdiction over any legal proceedings arising hereunder.`,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: '' }),

          // Signatures Section
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: 'IN WITNESS WHEREOF, the Parties hereto have caused this Memorandum of Understanding to be executed by their duly authorized representatives on the day, month, and year first above written.',
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: '' }),

          // 2-Column Signatures Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'FOR AND ON BEHALF OF:', bold: true, font: FONT, size: 20 }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: data.partyA.name.toUpperCase(), bold: true, font: FONT, size: 21 }),
                        ],
                      }),
                      new Paragraph({ text: '' }),
                      new Paragraph({ text: '' }),
                      new Paragraph({
                        children: [new TextRun({ text: '_______________________________', font: FONT, size: 20 })],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: `Name: ${data.partyA.signatoryName}`, bold: true, font: FONT, size: 20 }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: `Designation: ${data.partyA.signatoryDesignation}`, font: FONT, size: 20 }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'FOR AND ON BEHALF OF:', bold: true, font: FONT, size: 20 }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: data.partyB.name.toUpperCase(), bold: true, font: FONT, size: 21 }),
                        ],
                      }),
                      new Paragraph({ text: '' }),
                      new Paragraph({ text: '' }),
                      new Paragraph({
                        children: [new TextRun({ text: '_______________________________', font: FONT, size: 20 })],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: `Name: ${data.partyB.signatoryName}`, bold: true, font: FONT, size: 20 }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: `Designation: ${data.partyB.signatoryDesignation}`, font: FONT, size: 20 }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: '' }),

          // Witnesses
          new Paragraph({
            children: [
              new TextRun({ text: 'WITNESSES IN WHOSE PRESENCE EXECUTED:', bold: true, font: FONT, size: 21 }),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            children: [
              new TextRun({ text: '1. Signature: _______________________\n', bold: true, font: FONT, size: 20 }),
              new TextRun({ text: `   Name: ${data.witness1Name}\n   Address: ${data.witness1Address}`, font: FONT, size: 19 }),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            children: [
              new TextRun({ text: '2. Signature: _______________________\n', bold: true, font: FONT, size: 20 }),
              new TextRun({ text: `   Name: ${data.witness2Name}\n   Address: ${data.witness2Address}`, font: FONT, size: 19 }),
            ],
          }),
        ],
      },
    ],
  })

  return await Packer.toBuffer(doc)
}

/**
 * Builds Non-Disclosure & Confidentiality Addendum (.docx)
 */
export async function buildNdaAddendumDocx(inputData: Partial<MouFormData> = {}): Promise<Buffer> {
  const data: MouFormData = { ...DEFAULT_SAMPLE_MOU_DATA, ...inputData }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'ANNEXURE / SCHEDULE: NON-DISCLOSURE & CONFIDENTIALITY UNDERTAKING',
                bold: true,
                size: 24,
                font: FONT,
                underline: {},
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `(FORMING AN INTEGRAL & LEGALLY BINDING PART OF MOU DATED ${data.effectiveDate})`,
                bold: true,
                size: 18,
                font: FONT,
                color: '333333',
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: `THIS NON-DISCLOSURE UNDERTAKING is entered into between ${data.partyA.name} ("Disclosing/Receiving Party") and ${data.partyB.name} ("Receiving/Disclosing Party") in furtherance of their proposed collaboration.`,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({ text: '1. Definition of Confidential Information: ', bold: true, font: FONT, size: 21 }),
              new TextRun({
                text: 'Includes all business plans, financial projections, customer data, software code, source models, pricing algorithms, trade secrets, and know-how marked as confidential or reasonably understood to be confidential.',
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({ text: '2. Standard of Care & Non-Use: ', bold: true, font: FONT, size: 21 }),
              new TextRun({
                text: 'The Receiving Party shall exercise at least the same degree of care as it uses for its own confidential assets (not less than reasonable care) and shall not use such information for any purpose other than evaluating the collaborative venture.',
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({ text: '3. Return or Destruction: ', bold: true, font: FONT, size: 21 }),
              new TextRun({
                text: 'Upon written termination of the MoU, each Party shall within fourteen (14) days return or securely destroy all copies of confidential files, data, and notes, certifying compliance in writing.',
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({ text: '4. Injunctive Relief: ', bold: true, font: FONT, size: 21 }),
              new TextRun({
                text: 'Both Parties agree that monetary damages alone would be inadequate for breach of confidentiality, and the aggrieved Party shall be entitled to seek injunctive relief and specific performance in any court of competent jurisdiction.',
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: '' }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: `For ${data.partyA.name.toUpperCase()}\n(${data.partyA.signatoryName})`, bold: true, font: FONT, size: 20 }),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: `For ${data.partyB.name.toUpperCase()}\n(${data.partyB.signatoryName})`, bold: true, font: FONT, size: 20 }),
            ],
          }),
        ],
      },
    ],
  })

  return await Packer.toBuffer(doc)
}

// ==========================================
// PDF BUILDER (pdf-lib)
// ==========================================

class LegalDocBuilder {
  doc: PDFDocument
  fontBold: PDFFont
  fontRegular: PDFFont
  fontItalic: PDFFont
  fontBoldItalic: PDFFont
  pages: PDFPage[] = []
  currentPage!: PDFPage
  y: number = 0
  margin = 45
  pageWidth = 595.28
  pageHeight = 841.89
  contentWidth = 505.28
  bottomMargin = 45

  static async create(): Promise<LegalDocBuilder> {
    const doc = await PDFDocument.create()
    const fontBold = await doc.embedFont(StandardFonts.TimesRomanBold)
    const fontRegular = await doc.embedFont(StandardFonts.TimesRoman)
    const fontItalic = await doc.embedFont(StandardFonts.TimesRomanItalic)
    const fontBoldItalic = await doc.embedFont(StandardFonts.TimesRomanBoldItalic)
    const builder = new LegalDocBuilder(doc, fontBold, fontRegular, fontItalic, fontBoldItalic)
    builder.newPage()
    return builder
  }

  constructor(
    doc: PDFDocument,
    fontBold: PDFFont,
    fontRegular: PDFFont,
    fontItalic: PDFFont,
    fontBoldItalic: PDFFont
  ) {
    this.doc = doc
    this.fontBold = fontBold
    this.fontRegular = fontRegular
    this.fontItalic = fontItalic
    this.fontBoldItalic = fontBoldItalic
  }

  newPage(): PDFPage {
    this.currentPage = this.doc.addPage([this.pageWidth, this.pageHeight])
    this.pages.push(this.currentPage)
    this.y = this.pageHeight - this.margin
    return this.currentPage
  }

  ensureSpace(neededHeight: number) {
    if (this.y - neededHeight < this.bottomMargin) {
      this.newPage()
    }
  }

  drawCentered(
    text: string,
    font: PDFFont,
    size: number,
    color = rgb(0.1, 0.1, 0.1),
    extraSpacing = 4
  ) {
    const cleanText = sanitizePdfText(text)
    const words = cleanText.split(/\s+/).filter(Boolean)
    let currentLine = ''
    const lines: string[] = []

    for (const word of words) {
      const test = currentLine ? `${currentLine} ${word}` : word
      if (font.widthOfTextAtSize(test, size) > this.contentWidth) {
        if (currentLine) lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = test
      }
    }
    if (currentLine) lines.push(currentLine)

    for (const line of lines) {
      this.ensureSpace(size + 3)
      const textWidth = font.widthOfTextAtSize(line, size)
      const x = (this.pageWidth - textWidth) / 2
      this.currentPage.drawText(line, { x, y: this.y, size, font, color })
      this.y -= size + 3
    }
    this.y -= extraSpacing
  }

  drawDivider(spacing = 6) {
    this.ensureSpace(spacing * 2 + 1)
    this.y -= spacing
    this.currentPage.drawLine({
      start: { x: this.margin, y: this.y },
      end: { x: this.pageWidth - this.margin, y: this.y },
      thickness: 0.5,
      color: rgb(0.75, 0.75, 0.75),
    })
    this.y -= spacing
  }

  drawParagraph(
    text: string,
    options: {
      boldPrefix?: string
      size?: number
      lineHeight?: number
      color?: any
      extraSpacing?: number
      indent?: number
    } = {}
  ) {
    const cleanText = sanitizePdfText(text)
    const cleanPrefix = options.boldPrefix ? sanitizePdfText(options.boldPrefix) : undefined
    const size = options.size || 9.5
    const lineHeight = options.lineHeight || 13.5
    const color = options.color || rgb(0.12, 0.12, 0.12)
    const extraSpacing = options.extraSpacing ?? 6
    const indent = options.indent || 0

    const effectiveWidth = this.contentWidth - indent
    const startX = this.margin + indent

    let prefixWidth = 0
    let prefixDrawn = false

    if (cleanPrefix) {
      prefixWidth = this.fontBold.widthOfTextAtSize(cleanPrefix, size)
    }

    const words = cleanText.split(/\s+/).filter(Boolean)
    let currentLine = ''

    const flushLine = (lineText: string, isFirstLine: boolean) => {
      this.ensureSpace(lineHeight)
      if (isFirstLine && cleanPrefix && !prefixDrawn) {
        this.currentPage.drawText(cleanPrefix, {
          x: startX,
          y: this.y,
          size,
          font: this.fontBold,
          color,
        })
        prefixDrawn = true
        if (lineText) {
          this.currentPage.drawText(lineText, {
            x: startX + prefixWidth,
            y: this.y,
            size,
            font: this.fontRegular,
            color,
          })
        }
      } else {
        if (lineText) {
          this.currentPage.drawText(lineText, {
            x: startX,
            y: this.y,
            size,
            font: this.fontRegular,
            color,
          })
        }
      }
      this.y -= lineHeight
    }

    let isFirst = true
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const maxWidth = isFirst && cleanPrefix ? effectiveWidth - prefixWidth : effectiveWidth
      const measured = this.fontRegular.widthOfTextAtSize(testLine, size)

      if (measured > maxWidth) {
        flushLine(currentLine, isFirst)
        isFirst = false
        currentLine = word
      } else {
        currentLine = testLine
      }
    }

    if (currentLine || (isFirst && cleanPrefix && !prefixDrawn)) {
      flushLine(currentLine, isFirst)
    }

    this.y -= extraSpacing
  }

  applyFooter() {
    const totalPages = this.pages.length
    for (let i = 0; i < totalPages; i++) {
      const page = this.pages[i]
      const footerText = sanitizePdfText(`Page ${i + 1} of ${totalPages}`)
      const textWidth = this.fontRegular.widthOfTextAtSize(footerText, 8.5)

      page.drawLine({
        start: { x: this.margin, y: 35 },
        end: { x: this.pageWidth - this.margin, y: 35 },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      })

      page.drawText(footerText, {
        x: (this.pageWidth - textWidth) / 2,
        y: 22,
        size: 8.5,
        font: this.fontRegular,
        color: rgb(0.4, 0.4, 0.4),
      })
    }
  }

  async finish(): Promise<Uint8Array> {
    this.applyFooter()
    return await this.doc.save()
  }
}

/**
 * Builds Full MoU PDF
 */
export async function buildMouPdf(inputData: Partial<MouFormData> = {}): Promise<Uint8Array> {
  const data: MouFormData = { ...DEFAULT_SAMPLE_MOU_DATA, ...inputData }
  const b = await LegalDocBuilder.create()

  // Title
  b.drawCentered(data.title.toUpperCase(), b.fontBold, 13, rgb(0.08, 0.18, 0.36))
  b.drawCentered(
    '(Executed under the Indian Contract Act, 1872 • Commercial Collaboration Framework)',
    b.fontItalic,
    9,
    rgb(0.3, 0.3, 0.3)
  )
  b.drawDivider(6)

  // Execution Preamble
  b.drawParagraph(
    `THIS MEMORANDUM OF UNDERSTANDING ("MoU") is executed on this ${data.effectiveDate} at ${data.executionCity}, State of ${data.executionState} ("Effective Date");`,
    { size: 9.5 }
  )

  // BY & BETWEEN
  b.drawParagraph('BY AND BETWEEN:', { boldPrefix: 'BY AND BETWEEN: ', size: 9.5, extraSpacing: 3 })

  b.drawParagraph(
    `${data.partyA.name.toUpperCase()}, a ${data.partyA.entityType}, having its registered office at ${data.partyA.registeredAddress} (${data.partyA.identifier}), represented by its authorized signatory, ${data.partyA.signatoryName}, ${data.partyA.signatoryDesignation} (hereinafter referred to as "PARTY A", which expression includes its successors and assigns) of the FIRST PART;`,
    { size: 9.5, indent: 10 }
  )

  b.drawParagraph('AND', { boldPrefix: 'AND: ', size: 9.5, extraSpacing: 3 })

  b.drawParagraph(
    `${data.partyB.name.toUpperCase()}, a ${data.partyB.entityType}, having its registered office at ${data.partyB.registeredAddress} (${data.partyB.identifier}), represented by its authorized signatory, ${data.partyB.signatoryName}, ${data.partyB.signatoryDesignation} (hereinafter referred to as "PARTY B", which expression includes its successors and assigns) of the SECOND PART.`,
    { size: 9.5, indent: 10 }
  )

  b.drawDivider(6)

  // Recitals
  b.drawParagraph('RECITALS / BACKGROUND:', { boldPrefix: 'WHEREAS: ', size: 10, extraSpacing: 4 })
  for (let i = 0; i < data.backgroundRecitals.length; i++) {
    b.drawParagraph(`${String.fromCharCode(65 + i)}. ${data.backgroundRecitals[i]}`, {
      size: 9,
      indent: 8,
      extraSpacing: 3,
    })
  }

  b.drawParagraph(
    'NOW THIS MEMORANDUM WITNESSETH AND THE PARTIES AGREE AS FOLLOWS:',
    { boldPrefix: 'OPERATIVE CLAUSES: ', size: 10, extraSpacing: 6 }
  )

  // 1. Purpose & Scope
  b.drawParagraph(`1.1 Purpose: ${data.collaborationPurpose}`, {
    boldPrefix: '1. PURPOSE & SCOPE: ',
    size: 9.5,
    indent: 8,
  })
  b.drawParagraph(`1.2 Scope: ${data.scopeOfWork}`, { size: 9, indent: 8, extraSpacing: 6 })

  // 2. Responsibilities of Party A
  b.drawParagraph(
    `The First Party shall be responsible for:`,
    { boldPrefix: `2. ROLES OF PARTY A (${data.partyA.name}): `, size: 9.5, indent: 8, extraSpacing: 2 }
  )
  for (let i = 0; i < data.obligationsPartyA.length; i++) {
    b.drawParagraph(`• ${data.obligationsPartyA[i]}`, { size: 9, indent: 14, extraSpacing: 2 })
  }
  b.y -= 4

  // 3. Responsibilities of Party B
  b.drawParagraph(
    `The Second Party shall be responsible for:`,
    { boldPrefix: `3. ROLES OF PARTY B (${data.partyB.name}): `, size: 9.5, indent: 8, extraSpacing: 2 }
  )
  for (let i = 0; i < data.obligationsPartyB.length; i++) {
    b.drawParagraph(`• ${data.obligationsPartyB[i]}`, { size: 9, indent: 14, extraSpacing: 2 })
  }
  b.y -= 4

  // 4. Financial Terms
  b.drawParagraph(
    data.hasFinancialTerms ? data.financialTermsDescription : 'Each Party shall bear its own expenses.',
    { boldPrefix: '4. FINANCIAL TERMS: ', size: 9.5, indent: 8, extraSpacing: 6 }
  )

  // 5. Term & Definitive Roadmap
  b.drawParagraph(
    `This MoU is valid for ${data.validityDuration}. The Parties intend to execute a formal Definitive Agreement ${data.targetDefinitiveAgreementDate}, which shall supersede this instrument.`,
    { boldPrefix: '5. TERM & ROADMAP: ', size: 9.5, indent: 8, extraSpacing: 6 }
  )

  // 6. Binding Status
  b.drawParagraph(
    'Save and except Clauses 7 (Confidentiality), 8 (Intellectual Property), 9 (Dispute Resolution), and 10 (Governing Law) which are legally binding covenants under the Indian Contract Act, 1872, this MoU is an expression of commercial intent only.',
    { boldPrefix: '6. LEGAL STATUS: ', size: 9.5, indent: 8, extraSpacing: 6 }
  )

  // 7. Confidentiality
  b.drawParagraph(data.confidentialityTerms, {
    boldPrefix: '7. CONFIDENTIALITY (BINDING): ',
    size: 9,
    indent: 8,
    extraSpacing: 5,
  })

  // 8. IP Rights
  b.drawParagraph(data.intellectualPropertyTerms, {
    boldPrefix: '8. INTELLECTUAL PROPERTY (BINDING): ',
    size: 9,
    indent: 8,
    extraSpacing: 5,
  })

  // 9. Dispute Resolution
  b.drawParagraph(
    `Unresolved disputes shall be referred to a sole arbitrator appointed under the Arbitration and Conciliation Act, 1996. Seat and venue of arbitration shall be ${data.arbitrationSeat}, India.`,
    { boldPrefix: '9. ARBITRATION (BINDING): ', size: 9, indent: 8, extraSpacing: 5 }
  )

  // 10. Governing Law
  b.drawParagraph(
    `Governed by the laws of India. Courts at ${data.arbitrationSeat}, State of ${data.governingLawState} shall have exclusive territorial jurisdiction.`,
    { boldPrefix: '10. GOVERNING LAW: ', size: 9, indent: 8, extraSpacing: 8 }
  )

  b.drawDivider(6)

  // Execution & Signatures
  b.drawParagraph(
    'IN WITNESS WHEREOF, the Parties hereto have caused this MoU to be executed by their authorized representatives on the day, month, and year first written above.',
    { size: 9.5, extraSpacing: 10 }
  )

  b.ensureSpace(50)
  b.drawParagraph(`FOR ${data.partyA.name.toUpperCase()}`, { boldPrefix: 'Party A: ', size: 9.5, extraSpacing: 14 })
  b.drawParagraph(`(${data.partyA.signatoryName}) - ${data.partyA.signatoryDesignation}`, { size: 9 })

  b.ensureSpace(50)
  b.drawParagraph(`FOR ${data.partyB.name.toUpperCase()}`, { boldPrefix: 'Party B: ', size: 9.5, extraSpacing: 14 })
  b.drawParagraph(`(${data.partyB.signatoryName}) - ${data.partyB.signatoryDesignation}`, { size: 9, extraSpacing: 8 })

  b.drawParagraph('WITNESSES:', { boldPrefix: 'WITNESSES: ', size: 9.5, extraSpacing: 4 })
  b.drawParagraph(`1. ${data.witness1Name} - ${data.witness1Address}`, { size: 8.5, indent: 10 })
  b.drawParagraph(`2. ${data.witness2Name} - ${data.witness2Address}`, { size: 8.5, indent: 10 })

  return await b.finish()
}

/**
 * Builds NDA Addendum PDF
 */
export async function buildNdaAddendumPdf(inputData: Partial<MouFormData> = {}): Promise<Uint8Array> {
  const data: MouFormData = { ...DEFAULT_SAMPLE_MOU_DATA, ...inputData }
  const b = await LegalDocBuilder.create()

  b.drawCentered('NON-DISCLOSURE & CONFIDENTIALITY UNDERTAKING', b.fontBold, 13, rgb(0.08, 0.18, 0.36))
  b.drawCentered(`(Annexure to MoU dated ${data.effectiveDate})`, b.fontItalic, 9.5, rgb(0.3, 0.3, 0.3))
  b.drawDivider(6)

  b.drawParagraph(
    `This Non-Disclosure Undertaking is executed between ${data.partyA.name} and ${data.partyB.name} in furtherance of evaluating their commercial collaboration.`,
    { size: 9.5, extraSpacing: 6 }
  )

  b.drawParagraph(
    '1. Confidential Information: Includes proprietary software, business models, client data, algorithms, and technical secrets disclosed by either Party.',
    { size: 9, indent: 8, extraSpacing: 4 }
  )
  b.drawParagraph(
    '2. Duty of Care: The Receiving Party shall hold all disclosed data in strict confidence for 3 years and use it solely for collaboration evaluation.',
    { size: 9, indent: 8, extraSpacing: 4 }
  )
  b.drawParagraph(
    '3. Injunctive Relief: Parties agree monetary damages are inadequate for breach, and equitable injunctive relief may be claimed in competent courts.',
    { size: 9, indent: 8, extraSpacing: 8 }
  )

  b.ensureSpace(50)
  b.drawParagraph(`For ${data.partyA.name.toUpperCase()} - (${data.partyA.signatoryName})`, { size: 9.5, extraSpacing: 12 })
  b.drawParagraph(`For ${data.partyB.name.toUpperCase()} - (${data.partyB.signatoryName})`, { size: 9.5 })

  return await b.finish()
}
