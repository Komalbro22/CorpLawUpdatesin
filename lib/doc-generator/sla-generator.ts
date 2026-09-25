import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  BorderStyle,
  WidthType,
  ShadingType,
  Packer,
} from 'docx'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { safeTextRuns, cleanText } from './docx-utils'

// ─── SLA Presets & Types ────────────────────────────────────────────────────
export type SlaType =
  | 'cloud_computing'
  | 'it_saas'
  | 'vendor_customer'
  | 'software_maintenance'
  | 'recruitment_hr'

export interface SlaCustomClause {
  id?: string
  title: string
  content: string
}

export interface SlaFormData {
  slaType: SlaType
  title?: string
  effectiveDate: string
  clientName: string
  clientCin?: string
  clientAddress: string
  clientSignatoryName: string
  clientSignatoryTitle: string
  providerName: string
  providerCin?: string
  providerAddress: string
  providerSignatoryName: string
  providerSignatoryTitle: string
  servicesDescription: string
  uptimeTarget: string // e.g. "99.9%"
  maintenanceWindow: string // e.g. "Sunday 01:00 AM to 04:00 AM IST"
  sev1ResponseTime: string // e.g. "1 hour"
  sev1ResolutionTime: string // e.g. "4 hours"
  sev2ResponseTime: string // e.g. "2 hours"
  sev2ResolutionTime: string // e.g. "8 hours"
  sev3ResponseTime: string // e.g. "8 hours"
  sev3ResolutionTime: string // e.g. "24 hours"
  sev4ResponseTime: string // e.g. "24 hours"
  sev4ResolutionTime: string // e.g. "72 hours"
  creditPercentage: string // e.g. "2% per 0.1% downtime"
  penaltyCap: string // e.g. "20% of monthly billing"
  arbitrationSeat: string // e.g. "New Delhi"
  termMonths: string // e.g. "12"
  customClauses?: SlaCustomClause[]
  languageNote?: string
}

export const SLA_PRESETS: Record<
  SlaType,
  {
    title: string
    shortLabel: string
    description: string
    servicesDefault: string
    uptimeDefault: string
    maintenanceDefault: string
    creditDefault: string
    capDefault: string
  }
> = {
  cloud_computing: {
    title: 'Cloud Computing & Infrastructure Service Level Agreement',
    shortLabel: 'Cloud & Infrastructure SLA',
    description: 'Targeted for IaaS, PaaS, cloud hosting, multi-tenant databases, API uptime, and disaster recovery replication.',
    servicesDefault:
      'Provisioning, hosting, and managing production cloud compute instances, distributed storage clusters, managed databases, load balancers, and redundant network connectivity with 24x7 monitoring.',
    uptimeDefault: '99.95%',
    maintenanceDefault: 'Every second Sunday from 01:00 AM to 04:00 AM IST with 5 business days advance notification.',
    creditDefault: '5% of monthly fees for every 0.05% drop below 99.95% uptime threshold.',
    capDefault: '25% of total monthly cloud subscription fees.',
  },
  it_saas: {
    title: 'SaaS Software & IT Services Service Level Agreement',
    shortLabel: 'IT & SaaS SLA',
    description: 'Designed for enterprise software-as-a-service, web applications, customer portals, and enterprise tech platforms.',
    servicesDefault:
      'Access to the licensed SaaS enterprise platform, automated nightly cloud backups, API endpoints, SSL/TLS endpoint security, technical support desk, and release of periodic security patches.',
    uptimeDefault: '99.9%',
    maintenanceDefault: 'Sunday between 02:00 AM and 05:00 AM IST with minimum 72 hours prior electronic notice.',
    creditDefault: '2% of monthly license fees for each hour of unscheduled downtime.',
    capDefault: '20% of the monthly SaaS subscription fee.',
  },
  vendor_customer: {
    title: 'Vendor & Customer Master Service Level Agreement',
    shortLabel: 'Vendor & Customer SLA',
    description: 'Comprehensive commercial agreement governing third-party outsourced vendors, deliverables quality, and corporate service commitments.',
    servicesDefault:
      'End-to-end delivery of contracted business operational workflows, daily SLA performance dashboards, dedicated account governance, and compliance with client corporate operating guidelines.',
    uptimeDefault: '99.0%',
    maintenanceDefault: 'Non-business hours scheduled upon 7 calendar days written consent from Client.',
    creditDefault: '1% of monthly billing for each day of delayed deliverable beyond agreed turnaround time.',
    capDefault: '15% of aggregate monthly vendor invoices.',
  },
  software_maintenance: {
    title: 'Software Development & Annual Maintenance (AMC) SLA',
    shortLabel: 'Software AMC SLA',
    description: 'Covers ongoing application bug fixing, security patch deployment, feature enhancements, and technical helpdesk.',
    servicesDefault:
      'Corrective and preventive software maintenance, remediation of critical code defects, framework security patches, performance database tuning, and level-3 technical engineering escalation.',
    uptimeDefault: '99.5%',
    maintenanceDefault: 'First Saturday of every month between 11:00 PM and 03:00 AM IST.',
    creditDefault: '₹5,000 per business day for unresolved Severity 1 defect breaches.',
    capDefault: '20% of monthly maintenance retainer.',
  },
  recruitment_hr: {
    title: 'Recruitment & HR Staffing Service Level Agreement',
    shortLabel: 'Recruitment & Staffing SLA',
    description: 'Governs talent acquisition agencies, candidate profile turnaround times, replacement guarantees, and recruitment quality metrics.',
    servicesDefault:
      'Executive talent sourcing, candidate initial screening, interview scheduling coordination, pre-employment reference checks, and replacement guarantee for early attrition within 90 calendar days.',
    uptimeDefault: '98.0% candidate shortlist turnaround within 5 business days',
    maintenanceDefault: 'Not applicable for professional recruitment workflows.',
    creditDefault: 'Free replacement candidate or 25% credit on recruitment fee if candidate leaves within 90 days.',
    capDefault: '100% of candidate placement commission.',
  },
}

const PRINTABLE_WIDTH_DXA = 9500
const PRIMARY_COLOR = '0F172A' // Slate-900 / Navy
const GOLD_COLOR = 'D97706' // Amber-600

function singleLine(text: string | null | undefined): string {
  return cleanText(text).replace(/[\r\n]+/g, ' ').trim()
}

// ─── Word DOCX Generator ────────────────────────────────────────────────────
export async function buildSlaDocx(data: Partial<SlaFormData>): Promise<Buffer> {
  const type = data.slaType || 'it_saas'
  const preset = SLA_PRESETS[type] || SLA_PRESETS.it_saas

  const title = singleLine(data.title) || preset.title
  const effectiveDate = singleLine(data.effectiveDate) || '1st October 2026'

  const clientName = singleLine(data.clientName) || 'ALPHA ENTERPRISES PRIVATE LIMITED'
  const clientCin = singleLine(data.clientCin) || 'U72900MH2020PTC123456'
  const clientAddress = singleLine(data.clientAddress) || '101, Express Towers, Nariman Point, Mumbai - 400021, Maharashtra, India'
  const clientSignatory = singleLine(data.clientSignatoryName) || 'Rajesh Sharma'
  const clientSignatoryTitle = singleLine(data.clientSignatoryTitle) || 'Director'

  const providerName = singleLine(data.providerName) || 'NEXUS CLOUD SOLUTIONS PRIVATE LIMITED'
  const providerCin = singleLine(data.providerCin) || 'U72200DL2018PTC654321'
  const providerAddress = singleLine(data.providerAddress) || 'Plot 45, Okhla Industrial Area Phase-III, New Delhi - 110020, India'
  const providerSignatory = singleLine(data.providerSignatoryName) || 'Amitabh Sen'
  const providerSignatoryTitle = singleLine(data.providerSignatoryTitle) || 'Managing Director'

  const services = cleanText(data.servicesDescription) || preset.servicesDefault
  const uptime = singleLine(data.uptimeTarget) || preset.uptimeDefault
  const maintenance = singleLine(data.maintenanceWindow) || preset.maintenanceDefault
  const credits = singleLine(data.creditPercentage) || preset.creditDefault
  const cap = singleLine(data.penaltyCap) || preset.capDefault
  const seat = singleLine(data.arbitrationSeat) || 'New Delhi'
  const termMonths = singleLine(data.termMonths) || '12'

  const sev1Resp = singleLine(data.sev1ResponseTime) || '1 Hour'
  const sev1Reso = singleLine(data.sev1ResolutionTime) || '4 Hours'
  const sev2Resp = singleLine(data.sev2ResponseTime) || '2 Hours'
  const sev2Reso = singleLine(data.sev2ResolutionTime) || '8 Hours'
  const sev3Resp = singleLine(data.sev3ResponseTime) || '8 Hours'
  const sev3Reso = singleLine(data.sev3ResolutionTime) || '24 Hours'
  const sev4Resp = singleLine(data.sev4ResponseTime) || '24 Hours'
  const sev4Reso = singleLine(data.sev4ResolutionTime) || '72 Hours'

  // Severity Table
  const tableBorder = {
    top: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
    left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'F1F5F9' },
    insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  }

  const severityTable = new Table({
    width: { size: PRINTABLE_WIDTH_DXA, type: WidthType.DXA },
    columnWidths: [2200, 3700, 1800, 1800],
    borders: tableBorder,
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({
            width: { size: 2200, type: WidthType.DXA },
            shading: { fill: '0F172A', type: ShadingType.CLEAR },
            children: [new Paragraph({ children: [new TextRun({ text: 'Severity Level', bold: true, color: 'FFFFFF', size: 18 })] })],
          }),
          new TableCell({
            width: { size: 3700, type: WidthType.DXA },
            shading: { fill: '0F172A', type: ShadingType.CLEAR },
            children: [new Paragraph({ children: [new TextRun({ text: 'Definition & Impact', bold: true, color: 'FFFFFF', size: 18 })] })],
          }),
          new TableCell({
            width: { size: 1800, type: WidthType.DXA },
            shading: { fill: '0F172A', type: ShadingType.CLEAR },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Target Response', bold: true, color: 'FFFFFF', size: 18 })] })],
          }),
          new TableCell({
            width: { size: 1800, type: WidthType.DXA },
            shading: { fill: '0F172A', type: ShadingType.CLEAR },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Target Resolution', bold: true, color: 'FFFFFF', size: 18 })] })],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: 2200, type: WidthType.DXA },
            children: [new Paragraph({ children: [new TextRun({ text: 'Severity 1 (Critical)', bold: true, size: 18, color: 'DC2626' })] })],
          }),
          new TableCell({
            width: { size: 3700, type: WidthType.DXA },
            children: [new Paragraph({ children: [new TextRun({ text: 'Core service complete outage; critical production transactions halted; no workaround available.', size: 18 })] })],
          }),
          new TableCell({
            width: { size: 1800, type: WidthType.DXA },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: sev1Resp, bold: true, size: 18 })] })],
          }),
          new TableCell({
            width: { size: 1800, type: WidthType.DXA },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: sev1Reso, bold: true, size: 18 })] })],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: 2200, type: WidthType.DXA },
            children: [new Paragraph({ children: [new TextRun({ text: 'Severity 2 (High)', bold: true, size: 18, color: 'D97706' })] })],
          }),
          new TableCell({
            width: { size: 3700, type: WidthType.DXA },
            children: [new Paragraph({ children: [new TextRun({ text: 'Primary functionality severely degraded; operations impaired but secondary workflows functional.', size: 18 })] })],
          }),
          new TableCell({
            width: { size: 1800, type: WidthType.DXA },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: sev2Resp, bold: true, size: 18 })] })],
          }),
          new TableCell({
            width: { size: 1800, type: WidthType.DXA },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: sev2Reso, bold: true, size: 18 })] })],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: 2200, type: WidthType.DXA },
            children: [new Paragraph({ children: [new TextRun({ text: 'Severity 3 (Medium)', bold: true, size: 18, color: '2563EB' })] })],
          }),
          new TableCell({
            width: { size: 3700, type: WidthType.DXA },
            children: [new Paragraph({ children: [new TextRun({ text: 'Non-critical function failure or partial feature bug with acceptable operational workaround.', size: 18 })] })],
          }),
          new TableCell({
            width: { size: 1800, type: WidthType.DXA },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: sev3Resp, bold: true, size: 18 })] })],
          }),
          new TableCell({
            width: { size: 1800, type: WidthType.DXA },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: sev3Reso, bold: true, size: 18 })] })],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: 2200, type: WidthType.DXA },
            children: [new Paragraph({ children: [new TextRun({ text: 'Severity 4 (Low)', bold: true, size: 18, color: '475569' })] })],
          }),
          new TableCell({
            width: { size: 3700, type: WidthType.DXA },
            children: [new Paragraph({ children: [new TextRun({ text: 'Minor cosmetic flaw, UI discrepancy, documentation inquiry, or general technical query.', size: 18 })] })],
          }),
          new TableCell({
            width: { size: 1800, type: WidthType.DXA },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: sev4Resp, bold: true, size: 18 })] })],
          }),
          new TableCell({
            width: { size: 1800, type: WidthType.DXA },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: sev4Reso, bold: true, size: 18 })] })],
          }),
        ],
      }),
    ],
  })

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }, // 1 inch margins
          },
        },
        children: [
          // Document Header
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: 'SERVICE LEVEL AGREEMENT (SLA)',
                bold: true,
                size: 28,
                color: PRIMARY_COLOR,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 360 },
            children: [
              new TextRun({
                text: `[Governed by the Indian Contract Act, 1872 & Information Technology Act, 2000]`,
                italics: true,
                size: 18,
                color: '64748B',
              }),
            ],
          }),

          // Preamble
          new Paragraph({
            spacing: { after: 160 },
            children: [
              new TextRun({
                text: `THIS SERVICE LEVEL AGREEMENT ("Agreement" or "SLA") is entered into on this `,
                size: 20,
              }),
              new TextRun({ text: effectiveDate, bold: true, size: 20 }),
              new TextRun({
                text: ` ("Effective Date"), by and between:`,
                size: 20,
              }),
            ],
          }),

          // Party 1: Client
          new Paragraph({
            spacing: { after: 140 },
            children: [
              new TextRun({ text: '1. ', bold: true, size: 20 }),
              new TextRun({ text: clientName, bold: true, size: 20 }),
              new TextRun({
                text: `, a company incorporated under the Companies Act, 2013 (CIN: ${clientCin || '[CIN]'}), having its registered office at ${clientAddress} (hereinafter referred to as the `,
                size: 20,
              }),
              new TextRun({ text: '"Client"', bold: true, size: 20 }),
              new TextRun({
                text: `, which expression shall unless repugnant to the context include its successors and permitted assigns); and`,
                size: 20,
              }),
            ],
          }),

          // Party 2: Service Provider
          new Paragraph({
            spacing: { after: 240 },
            children: [
              new TextRun({ text: '2. ', bold: true, size: 20 }),
              new TextRun({ text: providerName, bold: true, size: 20 }),
              new TextRun({
                text: `, a company incorporated under the Companies Act, 2013 (CIN: ${providerCin || '[CIN]'}), having its registered office at ${providerAddress} (hereinafter referred to as the `,
                size: 20,
              }),
              new TextRun({ text: '"Service Provider"', bold: true, size: 20 }),
              new TextRun({
                text: `, which expression shall unless repugnant to the context include its successors and permitted assigns).`,
                size: 20,
              }),
            ],
          }),

          // Recitals
          new Paragraph({
            spacing: { after: 140 },
            children: [
              new TextRun({ text: 'WHEREAS:', bold: true, size: 20, color: PRIMARY_COLOR }),
            ],
          }),
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: `A. The Service Provider is engaged in the professional business of providing technical, IT, cloud, software, and managed enterprise operational services.`,
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: `B. The Client desires to engage the Service Provider, and the Service Provider agrees to deliver the Services in accordance with the specific performance standards, service levels, escalation mechanisms, and service credit remedies stipulated herein.`,
                size: 20,
              }),
            ],
          }),

          // Clause 1: Scope of Services
          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({ text: '1. SCOPE OF SERVICES & COMMENCEMENT', bold: true, size: 22, color: PRIMARY_COLOR }),
            ],
          }),
          new Paragraph({
            spacing: { after: 180 },
            children: [
              new TextRun({
                text: `1.1 The Service Provider shall deliver the following designated operational and technology services during the Term of ${termMonths} months: `,
                size: 20,
              }),
              ...safeTextRuns(services, { size: 20 }),
            ],
          }),

          // Clause 2: Uptime & SLOs
          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({ text: '2. SERVICE LEVEL OBJECTIVES (SLOs) & UPTIME COMMITMENT', bold: true, size: 22, color: PRIMARY_COLOR }),
            ],
          }),
          new Paragraph({
            spacing: { after: 140 },
            children: [
              new TextRun({
                text: `2.1 Availability Target: The Service Provider unconditionally warrants that the contracted services shall maintain a minimum monthly uptime of `,
                size: 20,
              }),
              new TextRun({ text: uptime, bold: true, size: 20, color: '0284C7' }),
              new TextRun({
                text: `, measured 24 hours a day, 7 days a week, over each calendar billing month ("Measurement Window").`,
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 180 },
            children: [
              new TextRun({
                text: `2.2 Scheduled Maintenance: Uptime measurements shall exclude agreed maintenance windows: `,
                size: 20,
              }),
              new TextRun({ text: maintenance, bold: true, size: 20 }),
              new TextRun({
                text: `. Any maintenance conducted outside of this permitted window or exceeding the allocated duration shall be deemed Unscheduled Downtime.`,
                size: 20,
              }),
            ],
          }),

          // Clause 3: Incident Severity Table
          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({ text: '3. INCIDENT SEVERITY CLASSIFICATION & RESPONSE TIMES', bold: true, size: 22, color: PRIMARY_COLOR }),
            ],
          }),
          new Paragraph({
            spacing: { after: 160 },
            children: [
              new TextRun({
                text: `3.1 In the event of any service failure, outage, or defect, the incident shall be classified and remediated in accordance with the statutory matrix below:`,
                size: 20,
              }),
            ],
          }),
          severityTable,

          // Clause 4: Service Credits & Penalties
          new Paragraph({
            spacing: { before: 280, after: 100 },
            children: [
              new TextRun({ text: '4. SERVICE CREDITS & LIQUIDATED DAMAGES', bold: true, size: 22, color: PRIMARY_COLOR }),
            ],
          }),
          new Paragraph({
            spacing: { after: 140 },
            children: [
              new TextRun({
                text: `4.1 If the Service Provider fails to satisfy the agreed Uptime Target or resolution timelines, the Client shall be entitled to receive Service Credits calculated as follows: `,
                size: 20,
              }),
              new TextRun({ text: credits, bold: true, size: 20 }),
              new TextRun({
                text: `, subject to an aggregate monthly cap of `,
                size: 20,
              }),
              new TextRun({ text: cap, bold: true, size: 20 }),
              new TextRun({
                text: `.`,
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 180 },
            children: [
              new TextRun({
                text: `4.2 Section 74 Indian Contract Act Compliance: The parties expressly agree that the Service Credits stipulated herein represent a genuine pre-estimate of loss and reasonable compensation under Section 74 of the Indian Contract Act, 1872, and do not constitute an arbitrary penal forfeiture.`,
                italics: true,
                size: 20,
              }),
            ],
          }),

          // Clause 5: Data Protection & DPDPA 2023
          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({ text: '5. DATA PROTECTION & CYBERSECURITY COMPLIANCE', bold: true, size: 22, color: PRIMARY_COLOR }),
            ],
          }),
          new Paragraph({
            spacing: { after: 180 },
            children: [
              new TextRun({
                text: `5.1 The Service Provider acts as a Data Processor under the Digital Personal Data Protection Act, 2023 (DPDP Act) and shall implement stringent technical and organizational safeguards under Section 43A of the Information Technology Act, 2000. In the event of any personal data breach or cyber incident, the Service Provider must notify the Client within six (6) hours of discovery.`,
                size: 20,
              }),
            ],
          }),

          // Dynamically Rendered AI & Custom Clauses (Clauses 6, 7, etc.)
          ...(data.customClauses && data.customClauses.length > 0
            ? data.customClauses.flatMap((c, idx) => {
                const clauseNum = 6 + idx
                const cTitle = singleLine(c.title) || `SPECIAL OPERATIONAL STIPULATION ${idx + 1}`
                const cContent = cleanText(c.content)
                return [
                  new Paragraph({
                    spacing: { before: 200, after: 100 },
                    children: [
                      new TextRun({
                        text: `${clauseNum}. ${cTitle.toUpperCase()}`,
                        bold: true,
                        size: 22,
                        color: PRIMARY_COLOR,
                      }),
                    ],
                  }),
                  new Paragraph({
                    spacing: { after: 180 },
                    children: [...safeTextRuns(cContent, { size: 20 })],
                  }),
                ]
              })
            : []),

          // Governing Law & Arbitration Clause
          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: `${6 + (data.customClauses?.length || 0)}. GOVERNING LAW & ARBITRATION`,
                bold: true,
                size: 22,
                color: PRIMARY_COLOR,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 280 },
            children: [
              new TextRun({
                text: `${6 + (data.customClauses?.length || 0)}.1 This Agreement shall be governed by the laws of India. Any dispute arising out of or in connection with this SLA shall be referred to arbitration in accordance with the Arbitration and Conciliation Act, 1996. The seat and venue of arbitration shall be `,
                size: 20,
              }),
              new TextRun({ text: seat, bold: true, size: 20 }),
              new TextRun({
                text: `, India, and proceedings shall be conducted in English by a sole arbitrator mutually appointed by the parties.`,
                size: 20,
              }),
            ],
          }),

          // Optional Bilingual Executive Summary / Hindi Statutory Note
          ...(data.languageNote && data.languageNote.trim().length > 0
            ? [
                new Paragraph({
                  spacing: { before: 280, after: 100 },
                  children: [
                    new TextRun({
                      text: `ANNEXURE I: BILINGUAL STATUTORY NOTE / द्विभाषी वैधानिक सारांश`,
                      bold: true,
                      size: 22,
                      color: GOLD_COLOR,
                    }),
                  ],
                }),
                new Paragraph({
                  spacing: { after: 200 },
                  children: [...safeTextRuns(data.languageNote, { size: 19, italics: true })],
                }),
              ]
            : []),

          // Signatures Block
          new Paragraph({
            spacing: { before: 300, after: 120 },
            children: [
              new TextRun({
                text: 'IN WITNESS WHEREOF, the parties hereto have executed this Service Level Agreement by their duly authorized representatives on the date first written above.',
                bold: true,
                size: 20,
              }),
            ],
          }),

          new Table({
            width: { size: PRINTABLE_WIDTH_DXA, type: WidthType.DXA },
            columnWidths: [4750, 4750],
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 4750, type: WidthType.DXA },
                    children: [
                      new Paragraph({ children: [new TextRun({ text: 'FOR AND ON BEHALF OF CLIENT:', bold: true, size: 18 })] }),
                      new Paragraph({ text: '', spacing: { after: 720 } }), // Signature line space
                      new Paragraph({ children: [new TextRun({ text: `____________________________________`, size: 18 })] }),
                      new Paragraph({ children: [new TextRun({ text: `Name: ${clientSignatory}`, bold: true, size: 18 })] }),
                      new Paragraph({ children: [new TextRun({ text: `Designation: ${clientSignatoryTitle}`, size: 18 })] }),
                      new Paragraph({ children: [new TextRun({ text: `Date: ${effectiveDate}`, size: 18 })] }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 4750, type: WidthType.DXA },
                    children: [
                      new Paragraph({ children: [new TextRun({ text: 'FOR AND ON BEHALF OF SERVICE PROVIDER:', bold: true, size: 18 })] }),
                      new Paragraph({ text: '', spacing: { after: 720 } }),
                      new Paragraph({ children: [new TextRun({ text: `____________________________________`, size: 18 })] }),
                      new Paragraph({ children: [new TextRun({ text: `Name: ${providerSignatory}`, bold: true, size: 18 })] }),
                      new Paragraph({ children: [new TextRun({ text: `Designation: ${providerSignatoryTitle}`, size: 18 })] }),
                      new Paragraph({ children: [new TextRun({ text: `Date: ${effectiveDate}`, size: 18 })] }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  })

  return await Packer.toBuffer(doc)
}

function safePdfText(text: string | null | undefined): string {
  if (!text) return ''
  return text.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim()
}

// ─── PDF Document Generator ─────────────────────────────────────────────────
export async function buildSlaPdf(data: Partial<SlaFormData>): Promise<Uint8Array> {
  const type = data.slaType || 'it_saas'
  const preset = SLA_PRESETS[type] || SLA_PRESETS.it_saas

  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595.28, 841.89]) // A4
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)

  const { width, height } = page.getSize()
  let y = height - 50

  const primaryRgb = rgb(0.06, 0.09, 0.16) // #0F172A
  const textMutedRgb = rgb(0.39, 0.45, 0.55) // #64748B
  const textDarkRgb = rgb(0.12, 0.16, 0.22)

  // Title
  page.drawText('SERVICE LEVEL AGREEMENT (SLA)', {
    x: 50,
    y,
    size: 16,
    font: fontBold,
    color: primaryRgb,
  })
  y -= 18

  page.drawText(safePdfText(preset.title), {
    x: 50,
    y,
    size: 10,
    font: fontItalic,
    color: textMutedRgb,
  })
  y -= 25

  // Horizontal divider
  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 1,
    color: rgb(0.8, 0.84, 0.88),
  })
  y -= 20

  const clientName = safePdfText(data.clientName) || 'ALPHA ENTERPRISES PRIVATE LIMITED'
  const providerName = safePdfText(data.providerName) || 'NEXUS CLOUD SOLUTIONS PRIVATE LIMITED'
  const effectiveDate = safePdfText(data.effectiveDate) || '1st October 2026'
  const uptime = safePdfText(data.uptimeTarget) || preset.uptimeDefault
  const cap = safePdfText(data.penaltyCap) || preset.capDefault
  const seat = safePdfText(data.arbitrationSeat) || 'New Delhi'

  // Summary Grid
  page.drawText(`Effective Date: ${effectiveDate}`, { x: 50, y, size: 9, font: fontRegular, color: textDarkRgb })
  page.drawText(`Target Uptime: ${uptime}`, { x: 300, y, size: 9, font: fontBold, color: rgb(0.01, 0.52, 0.78) })
  y -= 15

  page.drawText(`Client: ${clientName}`, { x: 50, y, size: 9, font: fontBold, color: textDarkRgb })
  page.drawText(`Service Provider: ${providerName}`, { x: 300, y, size: 9, font: fontBold, color: textDarkRgb })
  y -= 15

  page.drawText(`Penalty Cap: ${cap}`, { x: 50, y, size: 9, font: fontRegular, color: textDarkRgb })
  page.drawText(`Arbitration Seat: ${seat}, India`, { x: 300, y, size: 9, font: fontRegular, color: textDarkRgb })
  y -= 25

  // Core Clauses Summary
  page.drawText('1. STATUTORY COMPLIANCE & GOVERNING LAW', { x: 50, y, size: 10, font: fontBold, color: primaryRgb })
  y -= 14
  page.drawText('This agreement is governed by the Indian Contract Act, 1872 (Sections 73-75) and Information Technology Act, 2000.', {
    x: 50,
    y,
    size: 8.5,
    font: fontRegular,
    color: textDarkRgb,
  })
  y -= 20

  page.drawText('2. SERVICE LEVEL OBJECTIVES & DOWNTIME REMEDIES', { x: 50, y, size: 10, font: fontBold, color: primaryRgb })
  y -= 14
  page.drawText(`Uptime target is strictly maintained at ${uptime}. Unscheduled outages trigger liquidated damages via Service Credits.`, {
    x: 50,
    y,
    size: 8.5,
    font: fontRegular,
    color: textDarkRgb,
  })
  y -= 20

  page.drawText('3. INCIDENT SEVERITY MATRIX', { x: 50, y, size: 10, font: fontBold, color: primaryRgb })
  y -= 14
  page.drawText(`• Severity 1 (Critical): Response ${safePdfText(data.sev1ResponseTime) || '1 hr'} | Resolution ${safePdfText(data.sev1ResolutionTime) || '4 hrs'} (Core outage).`, {
    x: 50,
    y,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.86, 0.15, 0.15),
  })
  y -= 12
  page.drawText(`• Severity 2 (High): Response ${safePdfText(data.sev2ResponseTime) || '2 hrs'} | Resolution ${safePdfText(data.sev2ResolutionTime) || '8 hrs'} (Feature degraded).`, {
    x: 50,
    y,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.85, 0.47, 0.02),
  })
  y -= 12
  page.drawText(`• Severity 3 (Medium): Response ${safePdfText(data.sev3ResponseTime) || '8 hrs'} | Resolution ${safePdfText(data.sev3ResolutionTime) || '24 hrs'} (Workaround available).`, {
    x: 50,
    y,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.15, 0.39, 0.92),
  })
  y -= 12
  page.drawText(`• Severity 4 (Low): Response ${safePdfText(data.sev4ResponseTime) || '24 hrs'} | Resolution ${safePdfText(data.sev4ResolutionTime) || '72 hrs'} (Cosmetic inquiry).`, {
    x: 50,
    y,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.28, 0.33, 0.41),
  })
  y -= 25

  page.drawText('4. DATA PROTECTION & DPDP ACT 2023', { x: 50, y, size: 10, font: fontBold, color: primaryRgb })
  y -= 14
  page.drawText('The Service Provider operates as a Data Processor adhering to Section 8 of DPDP Act 2023 with mandatory 6-hour breach notice.', {
    x: 50,
    y,
    size: 8.5,
    font: fontRegular,
    color: textDarkRgb,
  })
  y -= 30

  const hasCustomClauses = data.customClauses && data.customClauses.length > 0

  if (!hasCustomClauses) {
    // Execution Block on Page 1
    page.drawText('EXECUTION & SIGNATURES', { x: 50, y, size: 10, font: fontBold, color: primaryRgb })
    y -= 20

    page.drawText('For Client:', { x: 50, y, size: 9, font: fontBold, color: textDarkRgb })
    page.drawText('For Service Provider:', { x: 300, y, size: 9, font: fontBold, color: textDarkRgb })
    y -= 35

    page.drawText('___________________________', { x: 50, y, size: 9, font: fontRegular, color: textMutedRgb })
    page.drawText('___________________________', { x: 300, y, size: 9, font: fontRegular, color: textMutedRgb })
    y -= 14

    page.drawText(`Authorized Signatory: ${safePdfText(data.clientSignatoryName) || '[Name]'}`, { x: 50, y, size: 8.5, font: fontRegular, color: textDarkRgb })
    page.drawText(`Authorized Signatory: ${safePdfText(data.providerSignatoryName) || '[Name]'}`, { x: 300, y, size: 8.5, font: fontRegular, color: textDarkRgb })
  } else {
    // Pointer on Page 1
    page.drawText('5. SPECIAL OPERATIONAL STIPULATIONS', { x: 50, y, size: 10, font: fontBold, color: primaryRgb })
    y -= 14
    page.drawText('Agreed custom technical stipulations, audit rights, and execution blocks are detailed on Page 2.', {
      x: 50,
      y,
      size: 8.5,
      font: fontItalic,
      color: textMutedRgb,
    })

    // Page 2 for Custom Clauses & Execution
    const page2 = pdfDoc.addPage([595.28, 841.89])
    let y2 = height - 50

    page2.drawText('SPECIAL OPERATIONAL STIPULATIONS & EXECUTION', {
      x: 50,
      y: y2,
      size: 14,
      font: fontBold,
      color: primaryRgb,
    })
    y2 -= 16
    page2.drawLine({
      start: { x: 50, y: y2 },
      end: { x: width - 50, y: y2 },
      thickness: 1,
      color: rgb(0.8, 0.84, 0.88),
    })
    y2 -= 25

    data.customClauses?.slice(0, 4).forEach((c, idx) => {
      const clauseNum = 5 + idx
      const cTitle = safePdfText(c.title).toUpperCase() || `STIPULATION ${idx + 1}`
      page2.drawText(`${clauseNum}. ${cTitle}`, { x: 50, y: y2, size: 9.5, font: fontBold, color: primaryRgb })
      y2 -= 14
      const content = safePdfText(c.content)
      const previewText = content.length > 200 ? content.slice(0, 197) + '...' : content
      page2.drawText(previewText, { x: 50, y: y2, size: 8, font: fontRegular, color: textDarkRgb })
      y2 -= 24
    })

    y2 -= 15
    page2.drawText('EXECUTION & SIGNATURES', { x: 50, y: y2, size: 10, font: fontBold, color: primaryRgb })
    y2 -= 20

    page2.drawText('For Client:', { x: 50, y: y2, size: 9, font: fontBold, color: textDarkRgb })
    page2.drawText('For Service Provider:', { x: 300, y: y2, size: 9, font: fontBold, color: textDarkRgb })
    y2 -= 35

    page2.drawText('___________________________', { x: 50, y: y2, size: 9, font: fontRegular, color: textMutedRgb })
    page2.drawText('___________________________', { x: 300, y: y2, size: 9, font: fontRegular, color: textMutedRgb })
    y2 -= 14

    page2.drawText(`Authorized Signatory: ${safePdfText(data.clientSignatoryName) || '[Name]'}`, { x: 50, y: y2, size: 8.5, font: fontRegular, color: textDarkRgb })
    page2.drawText(`Authorized Signatory: ${safePdfText(data.providerSignatoryName) || '[Name]'}`, { x: 300, y: y2, size: 8.5, font: fontRegular, color: textDarkRgb })
  }

  return await pdfDoc.save()
}
