const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageBreak, VerticalAlign
} = require('docx');
const fs = require('fs');

// ── palette ──────────────────────────────────────────────────────────
const C = {
  navy:     "1B3A6B",
  blue:     "2A5EC4",
  teal:     "0F6B74",
  green:    "14532D",
  greenBg:  "DCFCE7",
  amber:    "78350F",
  amberBg:  "FEF3C7",
  red:      "7F1D1D",
  redBg:    "FEE2E2",
  purple:   "4C1D95",
  purpleBg: "EDE9FE",
  slate:    "334155",
  mid:      "64748B",
  tblHdr:   "1B3A6B",
  tblAlt:   "F1F5F9",
  white:    "FFFFFF",
  divider:  "CBD5E1",
};

// ── border helpers ────────────────────────────────────────────────────
const b1  = (c) => ({ style: BorderStyle.SINGLE, size: 1, color: c });
const bdr = (c) => ({ top: b1(c), bottom: b1(c), left: b1(c), right: b1(c) });
const nob = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const nobdr = { top: nob, bottom: nob, left: nob, right: nob };

// ── paragraph helpers ────────────────────────────────────────────────
const H1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 360, after: 160 },
  children: [new TextRun({ text, bold: true, size: 38, color: C.navy, font: "Arial" })],
});
const H2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 280, after: 120 },
  children: [new TextRun({ text, bold: true, size: 28, color: C.navy, font: "Arial" })],
});
const H3 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  spacing: { before: 200, after: 80 },
  children: [new TextRun({ text, bold: true, size: 24, color: C.teal, font: "Arial" })],
});
const H4 = (text) => new Paragraph({
  spacing: { before: 160, after: 60 },
  children: [new TextRun({ text, bold: true, size: 22, color: C.slate, font: "Arial" })],
});
const P = (text, color = "222222") => new Paragraph({
  spacing: { before: 60, after: 80 },
  children: [new TextRun({ text, size: 21, font: "Arial", color })],
});
const italic = (text) => new Paragraph({
  spacing: { before: 40, after: 60 },
  children: [new TextRun({ text, size: 19, font: "Arial", color: C.mid, italics: true })],
});
const bul = (text, level = 0) => new Paragraph({
  numbering: { reference: "bullets", level },
  spacing: { before: 50, after: 50 },
  children: [new TextRun({ text, size: 21, font: "Arial", color: "222222" })],
});
const subbul = (text) => bul(text, 1);
const sp = (n = 100) => new Paragraph({ spacing: { before: 0, after: n }, children: [] });
const divider = () => new Paragraph({
  spacing: { before: 200, after: 200 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.divider, space: 1 } },
  children: [],
});
const pb = () => new Paragraph({ children: [new PageBreak()] });

// ── table builder ─────────────────────────────────────────────────────
const tbl = (headers, rows, colW, headerColor = C.tblHdr) => {
  const tot = colW.reduce((a, b) => a + b, 0);
  const hRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      borders: bdr(headerColor),
      width: { size: colW[i], type: WidthType.DXA },
      shading: { fill: headerColor, type: ShadingType.CLEAR },
      margins: { top: 100, bottom: 100, left: 140, right: 100 },
      children: [new Paragraph({
        children: [new TextRun({ text: h, bold: true, size: 19, color: C.white, font: "Arial" })],
      })],
    })),
  });
  const dRows = rows.map((row, ri) => new TableRow({
    children: row.map((cell, ci) => new TableCell({
      borders: bdr("DBEAFE"),
      width: { size: colW[ci], type: WidthType.DXA },
      shading: { fill: ri % 2 === 0 ? C.white : C.tblAlt, type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 140, right: 100 },
      children: [new Paragraph({
        children: [new TextRun({ text: cell, size: 19, font: "Arial", color: "222222" })],
      })],
    })),
  }));
  return new Table({ width: { size: tot, type: WidthType.DXA }, columnWidths: colW, rows: [hRow, ...dRows] });
};

// ── coloured callout ──────────────────────────────────────────────────
const callout = (emoji, label, lines, fillHex, textHex) => new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [9360],
  rows: [new TableRow({
    children: [new TableCell({
      borders: bdr(fillHex),
      width: { size: 9360, type: WidthType.DXA },
      shading: { fill: fillHex, type: ShadingType.CLEAR },
      margins: { top: 120, bottom: 120, left: 180, right: 180 },
      children: [
        new Paragraph({
          spacing: { before: 0, after: 60 },
          children: [new TextRun({ text: `${emoji}  ${label}`, bold: true, size: 22, color: textHex, font: "Arial" })],
        }),
        ...lines.map(l => new Paragraph({
          spacing: { before: 40, after: 40 },
          children: [new TextRun({ text: l, size: 20, color: textHex, font: "Arial" })],
        })),
      ],
    })],
  })],
});

// ═══════════════════════════════════════════════════════════════════
// DOCUMENT CONTENT
// ═══════════════════════════════════════════════════════════════════

const doc = new Document({
  numbering: {
    config: [
      { reference: "bullets", levels: [
          { level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 560, hanging: 280 } } } },
          { level: 1, format: LevelFormat.BULLET, text: "\u25E6", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 1080, hanging: 280 } } } },
          { level: 2, format: LevelFormat.BULLET, text: "\u25AA", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 1560, hanging: 280 } } } },
        ] },
      { reference: "nums", levels: [
          { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 560, hanging: 280 } } } },
        ] },
    ],
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 21 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 38, bold: true, font: "Arial", color: C.navy },
        paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: C.navy },
        paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: C.teal },
        paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2 } },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1260, right: 1260, bottom: 1260, left: 1260 },
      },
    },
    children: [

// ────────────────────────────────────────────────────────────────────
// COVER
// ────────────────────────────────────────────────────────────────────
sp(1200),
new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 0, after: 120 },
  children: [new TextRun({ text: "COMPLIANCE TRACKER — FEATURE & RULES SPECIFICATION", size: 20, color: C.mid, font: "Arial", allCaps: true, characterSpacing: 60 })],
}),
new Paragraph({
  alignment: AlignmentType.CENTER,
  border: { bottom: { style: BorderStyle.SINGLE, size: 10, color: C.blue, space: 1 } },
  spacing: { before: 0, after: 160 },
  children: [new TextRun({ text: "Master Compliance Matrix", size: 68, bold: true, color: C.navy, font: "Arial" })],
}),
sp(100),
new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 0, after: 80 },
  children: [new TextRun({ text: "CorpLawUpdates.in  |  As per laws effective June 2026", size: 26, color: C.blue, bold: true, font: "Arial" })],
}),
new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: "Companies Act 2013 (incl. Dec 2025 amendments)  •  SEBI LODR 2015 (incl. 2024 amendments)  •  IT Act 1961  •  GST Law  •  Labour Laws  •  RBI/FEMA", size: 19, color: C.mid, font: "Arial" })],
}),
sp(1800),

// quick-ref table
tbl(["Regulator / Law", "Coverage in this document", "Compliance count"], [
  ["Companies Act 2013 + Rules", "MCA filings, board governance, appointments, audits, deposits", "28 compliances"],
  ["SEBI LODR 2015 + Amendments", "Listed entity disclosures — quarterly, half-yearly, annual", "18 compliances"],
  ["Income Tax Act 1961", "Tax audit, ITR, TDS returns, advance tax, transfer pricing", "10 compliances"],
  ["GST (CGST/IGST) + Rules", "Monthly/quarterly/annual returns, e-invoicing, e-way bill", "8 compliances"],
  ["Labour Laws (EPF, ESI, Gratuity, etc.)", "Social security, payroll, factory / shops registrations", "9 compliances"],
  ["RBI / FEMA", "NBFC returns, FDI reporting, ODI, FLA, external borrowings", "7 compliances"],
  ["TOTAL", "80+ individual compliance rules in rules engine", "80+ rules"],
], [3000, 4560, 1800]),

pb(),

// ────────────────────────────────────────────────────────────────────
// SECTION 1 — INPUT PARAMETERS (TRIGGERS)
// ────────────────────────────────────────────────────────────────────
H1("PART 1 — INPUT PARAMETERS & TRIGGER LOGIC"),
P("Every compliance in this document is triggered by one or more of the parameters below. The user fills these in Step 1–5 of the wizard; the rules engine evaluates all 80+ rules against the inputs and returns only matched compliances."),
sp(80),

H2("1.1  Company Identity Parameters"),
tbl(["Parameter", "Input Type", "Values / Notes"], [
  ["Company Type",                  "Dropdown",         "Private Ltd / Public Ltd / OPC / Section 8 / LLP / Nidhi / Producer Company / Government Company"],
  ["Listed on recognised exchange?","Radio",            "Yes (BSE/NSE/SME) / No"],
  ["Is this an NBFC?",              "Radio",            "Yes (with sub-type: NBFC-ICC, NBFC-MFI, NBFC-Factors, HFC) / No"],
  ["Sector",                        "Dropdown",         "Manufacturing / IT-ITES / Banking / NBFC / Insurance / Real Estate / Pharma / Retail / Others"],
  ["Date of Incorporation",         "Date",             "Used to assess age-linked requirements (e.g., CARO first-year exemption)"],
  ["State of Incorporation",        "Dropdown",         "All 28 states + 8 UTs — affects stamp duty, Shops & Establishment Act"],
  ["Holding / Subsidiary / JV?",    "Multi-radio",      "Standalone / Subsidiary of Pvt / Subsidiary of Public — affects CARO & Sec Audit applicability"],
], [2600, 1560, 5200]),

sp(120),
H2("1.2  Financial Parameters"),
tbl(["Parameter", "Input Type", "Key Thresholds It Unlocks"], [
  ["Paid-up Share Capital (PUC)",     "INR field",  "₹10 Cr → Whole-time CS; ₹50 Cr → Secretarial Audit (Public Co); Small Co: ≤ ₹10 Cr (Dec 2025 revised)"],
  ["Annual Turnover (last FY)",       "INR field",  "₹100 Cr → XBRL; ₹200 Cr → Internal Audit (Public); ₹250 Cr → Secretarial Audit; ₹1000 Cr → CSR"],
  ["Net Worth",                       "INR field",  "₹500 Cr → CSR; ₹500-1000 Cr → BRSR (Top 1000 listed); ₹1000 Cr+ → BRSR Core"],
  ["Net Profit (average last 3 FY)", "INR field",  "₹5 Cr → CSR obligation (Section 135); ₹10 Cr proposed under Amendment Bill 2026"],
  ["Outstanding Loans / Borrowings", "INR field",  "₹1 Cr → CARO 2020 (private co); ₹100 Cr → Secretarial Audit; ₹1000 Cr → LODR Large Corporate"],
  ["Accepts Public Deposits?",        "Toggle + amount", "Any amount → RBI deposit directions; Pvt Ltd generally exempt unless notified"],
  ["Net Owned Funds (NBFC only)",     "INR field",  "Min ₹10 Cr NOF (by 31 Mar 2027 for existing NBFCs)"],
  ["Asset Size (NBFC only)",          "INR field",  "₹50 Cr → Branch Info Return; ₹100 Cr → NBS-6, ALM Returns; Scale-based classification"],
], [2800, 1400, 5160]),

sp(120),
H2("1.3  Workforce Parameters"),
tbl(["Parameter", "Input Type", "Key Thresholds It Unlocks"], [
  ["Total Employee Count",          "Number",    "≥ 10 → ESIC; ≥ 20 → EPF/PF; ≥ 10 → Gratuity (after 5 yrs); ≥ 10 → Contract Labour Act"],
  ["Contract / Gig Workers?",       "Toggle",    "≥ 20 contract workers → Contract Labour (R&A) Act registration"],
  ["Type of Premises",              "Dropdown",  "Factory → Factories Act 1948; Office / Shop → Shops & Establishment Act (state)"],
  ["Hazardous Industry?",           "Toggle",    "Environment Protection Act, MSIHC Rules, additional ESG disclosures"],
  ["Women employees ≥ 10?",         "Toggle",    "Sexual Harassment of Women at Workplace Act (POSH) — ICC mandatory"],
  ["Any inter-state operations?",   "Toggle",    "GST registration in each state; interstate migrant workmen rules"],
], [2600, 1200, 5560]),

sp(120),
H2("1.4  Tax & GST Parameters"),
tbl(["Parameter", "Input Type", "Key Thresholds It Unlocks"], [
  ["GST Registered?",                "Toggle",       "Triggers all GSTR returns"],
  ["GST Turnover (annual)",          "INR field",    "≤ ₹5 Cr → QRMP scheme (quarterly filing); > ₹5 Cr → monthly GSTR-1 + GSTR-3B"],
  ["GST Turnover > ₹2 Cr?",         "Auto-computed","GSTR-9 mandatory (annual return)"],
  ["GST Turnover > ₹5 Cr?",         "Auto-computed","GSTR-9C mandatory (reconciliation statement)"],
  ["E-invoicing applicable?",        "Auto-computed","Turnover > ₹5 Cr → mandatory e-invoicing under Rule 48(4) CGST Rules"],
  ["TDS Deductor under IT Act?",     "Toggle",       "Triggers quarterly TDS returns (26Q, 27Q, 26QB, 24Q etc.)"],
  ["Transfer Pricing transactions?", "Toggle",       "International / specified domestic transactions → Form 3CEB, TP study"],
  ["Cash transactions > 5% of total?","Toggle",      "If No + turnover ≤ ₹10 Cr → tax audit threshold elevated to ₹10 Cr"],
], [2800, 1500, 5060]),

sp(120),
H2("1.5  Listed Company / SEBI Parameters (shown only if listed = Yes)"),
tbl(["Parameter", "Input Type", "Key Thresholds It Unlocks"], [
  ["Exchange listed on",          "Multi-select", "BSE / NSE / BSE SME / NSE Emerge / Both main boards"],
  ["Market Capitalisation",       "INR field",    "Top 1000 by market cap → BRSR Core, RPT enhanced rules, CGRC"],
  ["Top 1000 listed by mkt cap?", "Auto / Toggle","SEBI LODR Reg 34(2)(f) BRSR Core + Reg 24A Peer-reviewed Secretarial Audit"],
  ["Outstanding long-term borrowings ≥ ₹1000 Cr?","Toggle","Large Corporate (LC) framework — mandatory fund-raise from bond market"],
  ["Listed debt instruments?",    "Toggle",       "Additional LODR obligations for listed NCDs / debt securities"],
  ["Promoter holding %",          "Number",       "Triggers Reg 31 shareholding pattern details; creeping acquisition rules"],
], [2800, 1500, 5060]),

sp(120),
H2("1.6  Foreign / Cross-border Parameters"),
tbl(["Parameter", "Input Type", "Key Thresholds It Unlocks"], [
  ["FDI received?",                "Toggle",      "FC-GPR filing with RBI within 30 days; FLA annual return by 15 Jul"],
  ["Overseas investment (ODI)?",   "Toggle",      "Form OPI filing with RBI; FEMA (OI) Regulations 2022"],
  ["External Commercial Borrowings?","Toggle",    "RBI ECB online reporting; Form ECB, ECB-2 monthly return"],
  ["Cross-border services (royalty / FTS)?","Toggle","TP study if with AE; Equalisation Levy if applicable"],
], [2600, 1200, 5560]),

pb(),

// ────────────────────────────────────────────────────────────────────
// SECTION 2 — MCA COMPLIANCES
// ────────────────────────────────────────────────────────────────────
H1("PART 2 — MCA / COMPANIES ACT 2013 COMPLIANCES"),
callout("⚠️", "Important amendment: Small Company threshold revised w.e.f. 01 Dec 2025",
  ["Paid-up capital: ≤ ₹10 Cr (was ₹4 Cr)  |  Turnover: ≤ ₹100 Cr (was ₹40 Cr)  [GSR 880(E)]",
   "Corporate Laws (Amendment) Bill 2026 proposes further increase to ₹20 Cr capital / ₹200 Cr turnover.",
   "CSR net profit threshold proposed to increase from ₹5 Cr to ₹10 Cr under the same Bill (not yet enacted)."],
  "FEF3C7", C.amber),
sp(120),

H2("2.1  Annual Filings (All Companies)"),
tbl(["#","Compliance","Form","Trigger Condition","Due Date","Penalty (Company)","Penalty (Officer)","Severity"], [
  ["1","Filing of Financial Statements","AOC-4 / AOC-4 NBFC (Ind AS)","All companies (Pvt, Public, OPC, Section 8)","30 days of AGM (OPC: 180 days from FY-end; no AGM for OPC)","₹10,000 + ₹100/day (max ₹2 lakh) — Sec 137(3)","₹10,000 + ₹100/day (max ₹50,000)","Critical"],
  ["2","XBRL Financial Statements","AOC-4 XBRL","Listed + subsidiaries; Turnover > ₹100 Cr; PUC > ₹5 Cr (prescribed class)","Same as AOC-4","Same as AOC-4","Same as AOC-4","Critical"],
  ["3","Annual Return","MGT-7","All companies except OPC and small companies","60 days of AGM","₹50,000 + ₹500/day — Sec 92(5)","₹50,000 + ₹500/day","Critical"],
  ["4","Annual Return (Simplified)","MGT-7A","OPC and small companies only","60 days of AGM (OPC: within 60 days of FY-end)","₹50,000 + ₹500/day","₹50,000 + ₹500/day","High"],
  ["5","CSR Report","CSR-2","Net profit ≥ ₹5 Cr OR Turnover ≥ ₹1000 Cr OR Net Worth ≥ ₹500 Cr (Sec 135)","Filed after AOC-4 (extended deadlines historically — verify current MCA notification)","₹1 Cr (company); can be compounded","₹25 Lakh","High"],
], [280, 1600, 1000, 2000, 1400, 1300, 1300, 780],  "1B3A6B"),

sp(120),
H2("2.2  Director & KYC Compliances"),
tbl(["#","Compliance","Form","Trigger Condition","Due Date","Penalty","Severity"], [
  ["6","Director KYC — Annual Web","DIR-3 KYC Web","DIN holders who filed DIR-3 KYC in prior year","30 September annually","DIN deactivated; ₹5,000 re-activation fee","High"],
  ["7","Director KYC — Form","DIR-3 KYC","First-time filers; change in mobile/email","30 September annually","DIN deactivated; ₹5,000 re-activation fee","High"],
  ["8","Disclosure of Interest by Directors","MBP-1","All directors at first Board meeting each FY and on change of interest","First Board meeting of FY","Sec 184: Fine ₹1 lakh; contract voidable","Medium"],
  ["9","Annual Certification of Annual Return","—","CS of company (if PUC ≥ ₹10 Cr or TO ≥ ₹200 Cr — Sec 92(2))","With MGT-7","Defective return consequences","Medium"],
  ["10","Woman Director Appointment","—","Public company: PUC ≥ ₹100 Cr OR Turnover ≥ ₹300 Cr OR any listed company — Sec 149(1)(a)","Before FY-end; immediate on breach","₹2 lakh – 5 lakh; officer ₹1 lakh – 3 lakh","High"],
  ["11","Independent Director on Board","—","Listed + public companies with PUC ≥ ₹10 Cr / TO ≥ ₹100 Cr / ≥ 1000 small shareholders","Ongoing; election every 5 years","Sec 149: Company ₹5 lakh; officer ₹1 lakh","High"],
], [280, 1700, 880, 2100, 1200, 1500, 800], "1B3A6B"),

sp(120),
H2("2.3  Audit-Related Compliances"),
tbl(["#","Compliance","Form / Report","Trigger Condition","Due Date","Penalty","Severity"], [
  ["12","CARO 2020 — Auditor's Report","Auditor's Report with 21 clauses","Applicable to: All public companies; Private companies UNLESS small company (PUC ≤ ₹10 Cr, TO ≤ ₹100 Cr) OR standalone private co (PUC+reserves ≤ ₹1 Cr + borrowings ≤ ₹1 Cr + revenue ≤ ₹10 Cr). OPC unconditionally exempt.","As part of statutory audit report","Auditor liability; company prosecution","High"],
  ["13","Secretarial Audit","MR-3","Listed companies; Public companies: PUC ≥ ₹50 Cr OR Turnover ≥ ₹250 Cr; Every company (pvt incl.) with outstanding borrowings ≥ ₹100 Cr from banks/FIs — Sec 204","Annexed to Board's Report","₹2 lakh (company + officer) — Sec 204(4); SEBI penalties for listed cos","High"],
  ["14","Internal Audit","Report to Audit Committee / Board","Listed companies; Public companies: TO ≥ ₹200 Cr OR borrowings ≥ ₹100 Cr; Private companies: TO ≥ ₹200 Cr OR deposits ≥ ₹25 Cr — Sec 138","Ongoing; report each quarter","Sec 134 / 147 penalties; qualifications in auditor report","High"],
  ["15","Cost Audit","CRA-3","Companies in prescribed industries (cement, pharma, power, sugar, etc.) with TO ≥ ₹35 Cr from regulated activity; covered under Companies (Cost Records and Audit) Rules 2014","180 days from FY close (usually 30 Sep)","₹25,000 – ₹5 lakh (company); ₹10,000 – ₹1 lakh (officer)","Medium"],
  ["16","Cost Records Maintenance","CRA-1","Companies in prescribed industries with overall TO ≥ ₹35 Cr from regulated activity","Continuous obligation","Fine up to ₹5 lakh","Medium"],
], [280, 1500, 1100, 2500, 1100, 1400, 800], "1B3A6B"),

sp(120),
H2("2.4  Corporate Governance Compliances"),
tbl(["#","Compliance","Form","Trigger","Due Date","Penalty","Severity"], [
  ["17","Board Meeting Compliance","—","All companies — minimum 4 meetings/year (2 for small co / OPC); max gap 120 days — Sec 173","Ongoing","₹25,000 (company); ₹25,000 (per director in default) — Sec 173(4)","Medium"],
  ["18","Resolutions requiring Ordinary/Special Resolution","MGT-14","Public companies must file certain board + special resolutions — Sec 117","30 days of passing resolution","₹1 lakh + ₹500/day; officer ₹25,000 + ₹500/day","High"],
  ["19","Secretarial Standards Compliance (SS-1, SS-2)","—","All companies — ICSI SS-1 (Board Mtgs), SS-2 (General Mtgs) are mandatory — Sec 118","Ongoing — notices, quorum, minutes","As per Sec 118(12): fine up to ₹25,000 each","Medium"],
  ["20","Appointment of Whole-time CS","—","Companies with PUC ≥ ₹10 Cr — Sec 203 r/w Rule 8A","Before threshold breach","₹5 lakh + ₹500/day (company); ₹50,000 + ₹500/day (officer)","High"],
  ["21","Annual General Meeting","—","All companies except OPC — Sec 96; within 6 months of FY-end; gap ≤ 15 months","30 Sep for March FY-end cos","₹1 lakh + ₹5,000/day (Sec 99)","High"],
  ["22","Maintenance of Statutory Registers","Various","All companies — Sec 88/170/189 etc. — Members, directors, contracts","Perpetual / updated within prescribed time","Fine up to ₹3 lakh","Medium"],
], [280, 1800, 880, 2200, 1100, 1400, 700], "1B3A6B"),

sp(120),
H2("2.5  Capital & Finance Related Compliances"),
tbl(["#","Compliance","Form","Trigger","Due Date","Penalty","Severity"], [
  ["23","Charge Registration","CHG-1 / CHG-9","All companies creating charge on assets — Sec 77","30 days of creation (extension to 60 days with add'l fee)","Charge not valid against liquidator/creditor; fine ₹5 lakh","Critical"],
  ["24","Return of Allotment","PAS-3","On any allotment of shares — Sec 39/42","30 days of allotment","₹1,00,000 or ₹1,000/day (max ₹25 lakh for private) — Sec 42(10)","High"],
  ["25","Deposit Acceptance Rules","DPT-3","All companies: Non-deposit return (loan/borrowings disclosure); Deposit-taking only for Public (not Private unless exempted) — Sec 73-76","30 June annually (DPT-3 for outstanding loans as on 31 Mar)","Deposit violations: up to ₹1 Cr or 3x deposit amount (Sec 76A)","Critical"],
  ["26","Share Transfer Compliance","SH-4","On every share transfer — Sec 56","Stamp duty paid; transfer registered within 30 days","Fine ₹25,000 – ₹5 lakh","Medium"],
  ["27","Director Appointment / Cessation","DIR-12","On every appointment, resignation, removal — Sec 168/169/170","30 days of change","₹50,000 + ₹500/day","High"],
  ["28","Buyback of Shares (if applicable)","SH-8, SH-9, SH-11","When company does buyback — Sec 68","Prescribed timelines (1 yr gap between buybacks)","Imprisonment up to 3 yrs; fine 3x proceeds","High"],
], [280, 1600, 1000, 2300, 1200, 1500, 700], "1B3A6B"),

pb(),

// ────────────────────────────────────────────────────────────────────
// SECTION 3 — SEBI COMPLIANCES
// ────────────────────────────────────────────────────────────────────
H1("PART 3 — SEBI / LISTED COMPANY COMPLIANCES"),
callout("📋", "Applicable only if: Company is listed on BSE / NSE / SME platforms",
  ["Legal basis: SEBI (LODR) Regulations 2015 as amended up to SEBI LODR Third Amendment Regulations 2024 (effective 01 Apr 2025)",
   "Integrated filing framework effective Q3 FY 2024-25: Governance disclosures → 30 days; Financial disclosures → 45 days from quarter-end."],
  "DBEAFE", C.navy),
sp(100),

H2("3.1  Quarterly Compliances (SEBI LODR)"),
tbl(["#","Compliance / Filing","Regulation","Due Date","Penalty for Delay","Severity"], [
  ["29","Shareholding Pattern","Reg 31","21 days from end of quarter","₹1,00,000 or ₹1,000/day; SEBI enforcement action","Critical"],
  ["30","Integrated Filing — Governance (CG Report, IGRM)","Reg 27(2), 13(3)","30 days from end of quarter","₹1,000/day","High"],
  ["31","Integrated Filing — Financial (Quarterly results, RPT, defaults)","Reg 33, 23(9)","45 days from end of quarter (60 days for Q4/year-end)","₹1,000/day; trading halt risk","Critical"],
  ["32","SDD Compliance Certificate (Structured Digital Database)","SEBI PIT Reg 2015","21 days from quarter-end","Fine up to ₹25 Cr; Prosecution","High"],
  ["33","Secretarial Compliance Report (Annual — Peer Reviewed PCS)","Reg 24A","60 days from FY-end (effective 01 Apr 2025: Peer-reviewed PCS only)","Fine up to ₹25 Cr","Critical"],
  ["34","Closure of Trading Window","PIT Reg 2015","Before quarterly results; 48 hrs after results","Insider trading prosecution","Critical"],
], [280, 2400, 1200, 1500, 2000, 880], "1B3A6B"),

sp(120),
H2("3.2  Half-Yearly Compliances (SEBI LODR)"),
tbl(["#","Compliance / Filing","Regulation","Due Date","Penalty","Severity"], [
  ["35","Related Party Transactions (RPT) Disclosure","Reg 23(9)","Within 15 days of publication of half-yearly results","₹1,00,000 or ₹1,000/day","High"],
  ["36","Certificate — Share Transfer by PCS (half-yearly)","Reg 40(9)","21 days from end of each half-year","₹1,00,000 or ₹1,000/day","Medium"],
  ["37","Reconciliation of Share Capital Audit","SEBI Circular (Depositories)","30 days from each half-year end","Fine + suspension risk","High"],
], [280, 2600, 1500, 1600, 2000, 880], "1B3A6B"),

sp(120),
H2("3.3  Annual Compliances (SEBI LODR + Other SEBI Regulations)"),
tbl(["#","Compliance / Filing","Regulation","Due Date","Penalty","Severity"], [
  ["38","Annual Report with BRSR","Reg 34(2)(f)","Within 21 days of AGM notice; filed on exchange before dispatch","₹1,000/day + SEBI action","Critical"],
  ["39","BRSR Core (ESG Assurance)","Top 1000 listed cos — SEBI circular Jun 2023","With Annual Report; mandatory third-party assurance from FY 2024-25","SEBI enforcement, exchange suspension","Critical"],
  ["40","Corporate Governance Report (Annual)","Reg 34 r/w Sch V Part C","Within 6 months of FY-end or with Annual Report","₹1,00,000 or ₹1,000/day","High"],
  ["41","Annual Compliance Report on CG (Form – Stock Exchange)","Reg 27(2)","Within 30 days of AGM","₹1,000/day","Medium"],
  ["42","Dividend Declaration Compliance","Reg 42, 43","Record date intimation ≥ 7 working days before; outcome within 30 min of Board meeting","₹1,000/day","High"],
  ["43","Nomination and Remuneration Committee Report","Reg 19 r/w Sch V","Annual — within Annual Report","SEBI enforcement","Medium"],
  ["44","Audit Committee Composition & Report","Reg 18 r/w Sch V","Ongoing; disclosed in Annual Report and quarterly CG report","SEBI enforcement","High"],
  ["45","Large Corporate (LC) Framework — fund-raise from bonds","Reg 45A LODR r/w SEBI Circular 2018","Outstanding LT borrowings ≥ ₹1000 Cr → 25% incremental borrowing via debt market/year","Disclosure penalty + regulatory action","Medium"],
], [2800, 2000, 1800, 1400, 1800, 880], "1B3A6B"),

pb(),

// ────────────────────────────────────────────────────────────────────
// SECTION 4 — INCOME TAX
// ────────────────────────────────────────────────────────────────────
H1("PART 4 — INCOME TAX ACT 1961 COMPLIANCES"),
callout("📌", "Key threshold: Tax Audit (Sec 44AB) for AY 2026-27 (FY 2025-26)",
  ["Business: Turnover > ₹1 Cr → Tax Audit mandatory   |   Digital transactions ≥ 95% of receipts + payments: threshold elevated to ₹10 Cr",
   "Professionals: Gross receipts > ₹50 lakh → Tax Audit mandatory",
   "Due date for tax audit report (Form 3CA/3CB + 3CD): 30 Sep 2026   |   ITR (audited): 31 Oct 2026"],
  "DCFCE7", C.green),
sp(100),

tbl(["#","Compliance","Form","Trigger Condition","Due Date (FY 2025-26)","Penalty","Severity"], [
  ["46","Income Tax Return","ITR-6 (companies)","All companies — Sec 139(1)","31 Jul 2026 (non-audit); 31 Oct 2026 (audit cases)","₹5,000 – ₹10,000 late filing fee (Sec 234F); interest Sec 234A/B/C","Critical"],
  ["47","Tax Audit","3CA/3CB + 3CD","Business TO > ₹1 Cr (or ₹10 Cr if ≥ 95% digital); Professionals GR > ₹50 lakh — Sec 44AB","30 Sep 2026","0.5% of TO or ₹1.5 lakh (whichever lower) — Sec 271B (converted to fee by IT Act 2025)","Critical"],
  ["48","Transfer Pricing Study + Report","3CEB","International transactions with AEs OR specified domestic transactions > ₹20 Cr — Sec 92E","31 Oct 2026","2% of transaction value — Sec 271BA","High"],
  ["49","TDS Returns — Salaries","24Q","Every employer deducting TDS on salary — Sec 192","31 May (Q4); 31 Jul, 31 Oct, 31 Jan (Q1–Q3)","₹200/day (Sec 234E) + ₹10,000 – ₹1 lakh penalty (Sec 271H)","Critical"],
  ["50","TDS Returns — Non-salary payments","26Q / 27Q","Any person deducting TDS under Sec 194 series (rent, professional fees, contractor, etc.)","31 Jul / 31 Oct / 31 Jan / 31 May","₹200/day (Sec 234E)","High"],
  ["51","TCS Returns","27EQ","Sellers collecting TCS on specified goods/transactions — Sec 206C","15 Jul / 15 Oct / 15 Jan / 15 Apr","₹200/day (Sec 234E)","High"],
  ["52","Advance Tax","Challan 280","Estimated tax liability > ₹10,000 in the year — Sec 208","15 Jun (15%); 15 Sep (45%); 15 Dec (75%); 15 Mar (100%)","Interest under Sec 234B + 234C","High"],
  ["53","Equalisation Levy","Form 1 (Annual Statement)","E-commerce operators with Indian users OR digital advertising services > ₹1 lakh/year from one provider — Finance Act 2016","31 Jan (annual statement); quarterly levy payment by 7th of following month","1% penalty on underpaid levy","Medium"],
  ["54","Vivad Se Vishwas Scheme / Tax Dispute Resolution","—","Pending appeals as applicable","Scheme-specific deadlines","N/A — for resolution, not penalty","Low"],
  ["55","Form 15CA/15CB — Foreign Remittance","15CA + 15CB","On any foreign remittance where TDS may be applicable — Sec 195","Before making remittance","Prosecution under Sec 271-I; penalty ₹1 lakh","High"],
], [280, 1600, 1000, 2300, 1400, 1800, 780], "1B3A6B"),

pb(),

// ────────────────────────────────────────────────────────────────────
// SECTION 5 — GST
// ────────────────────────────────────────────────────────────────────
H1("PART 5 — GST COMPLIANCES (CGST / IGST / SGST)"),
callout("📌", "Key thresholds",
  ["GSTR-1 (monthly): Turnover > ₹5 Cr in preceding FY  |  QRMP: Turnover ≤ ₹5 Cr",
   "GSTR-9 mandatory: Aggregate turnover > ₹2 Cr  |  GSTR-9C mandatory: Aggregate turnover > ₹5 Cr (self-certified)",
   "E-invoicing mandatory: Turnover > ₹5 Cr   |   E-way bill: Goods movement > ₹50,000"],
  "DCFCE7", C.green),
sp(100),

tbl(["#","Return / Compliance","Trigger","Due Date","Late Fee","Severity"], [
  ["56","GSTR-1 (Outward Supplies — Monthly)","GST registered; TO > ₹5 Cr in preceding FY","11th of following month","₹50/day (CGST + SGST); nil-return ₹20/day; max ₹10,000","Critical"],
  ["57","GSTR-1 (Quarterly — QRMP Scheme)","GST registered; TO ≤ ₹5 Cr; QRMP opted","13th of month after quarter-end","₹50/day; max ₹10,000","High"],
  ["58","IFF (Invoice Furnishing Facility — months 1 & 2 of QRMP)","QRMP opted; outward B2B invoices","13th of M1 and M2 of quarter","₹50/day; max ₹10,000","High"],
  ["59","GSTR-3B (Summary + Tax Payment — Monthly)","GST registered; TO > ₹5 Cr","20th of following month","₹50/day (₹20 for nil); interest 18% on late payment","Critical"],
  ["60","GSTR-3B (Quarterly — QRMP)","GST registered; TO ≤ ₹5 Cr; QRMP opted","22nd/24th (staggered by state) of month after quarter-end","₹50/day; interest 18%","High"],
  ["61","GSTR-9 (Annual Return)","Mandatory if aggregate TO > ₹2 Cr — Notification 15/2025-CT","31 December of following FY","₹200/day (₹100 CGST + ₹100 SGST); max 0.25% of TO per state","High"],
  ["62","GSTR-9C (Reconciliation Statement — Self Certified)","Aggregate TO > ₹5 Cr","31 December (with GSTR-9)","Same as GSTR-9","High"],
  ["63","E-invoicing (IRP Registration)","Aggregate TO > ₹5 Cr from 01 Aug 2023","Real-time before supply","₹10,000 per invoice or 100% of tax; invoice invalid","Critical"],
], [280, 2000, 2200, 1500, 1700, 780], "1B3A6B"),

pb(),

// ────────────────────────────────────────────────────────────────────
// SECTION 6 — LABOUR LAWS
// ────────────────────────────────────────────────────────────────────
H1("PART 6 — LABOUR LAW COMPLIANCES"),
callout("⚙️", "Note on Labour Codes",
  ["Four Labour Codes (Wages Code, SS Code, IR Code, OSH Code) consolidated 29 central laws.",
   "Key provisions (incl. ESI under Code on Social Security) effective November 2025.",
   "States still notifying their rules — businesses must check state-specific rules alongside central law."],
  "EDE9FE", C.purple),
sp(100),

tbl(["#","Compliance","Law / Act","Trigger (Employee Count)","Due Date","Penalty","Severity"], [
  ["64","EPF Monthly Contribution + ECR","EPF & MP Act 1952 / Code on SS 2020","≥ 20 employees (voluntary < 20)","15th of following month","Damages: 5% – 25% p.a.; Prosecution; Imprisonment up to 3 yrs","Critical"],
  ["65","EPF Annual Return","Form 3A / Annual Return","All EPF-registered establishments","30 April annually","Prosecution; additional interest","High"],
  ["66","ESIC Monthly Contribution","ESI Act 1948 / Code on SS 2020","≥ 10 employees (≥ 20 some states); salary ≤ ₹21,000/month (₹25,000 for PwD)","15th of following month","Fine up to ₹10,000; prosecution; imprisonment up to 2 yrs","Critical"],
  ["67","ESIC Half-Yearly Return","ESI Act","ESIC-registered establishments","11 May and 11 November","Fine; prosecution","High"],
  ["68","Gratuity Fund / LIC Policy","Payment of Gratuity Act 1972","≥ 10 employees at any time in preceding year","Ongoing; payment within 30 days of due date","7–10% interest on delayed gratuity; prosecution","High"],
  ["70","Minimum Wages Compliance","Minimum Wages Act 1948 / Code on Wages 2019","All establishments employing scheduled workers","Monthly payment; register maintained","Imprisonment up to 6 months; fine up to ₹500/employee","High"],
  ["71","Shops & Establishment Registration","State Shops Act (applicable state)","All commercial establishments — state-specific (e.g., UP SE Act)","Before commencement of business; annual renewal","State-specific fines","Medium"],
  ["72","Contract Labour Registration","Contract Labour (R&A) Act 1970","Principal employer with ≥ 20 contract workers","Before engaging contractor; licence renewal annually","Fine up to ₹1,00,000 or ₹1,000; prosecution","Medium"],
], [280, 1600, 1700, 1600, 1200, 1600, 780], "1B3A6B"),

pb(),

// ────────────────────────────────────────────────────────────────────
// SECTION 7 — RBI / FEMA
// ────────────────────────────────────────────────────────────────────
H1("PART 7 — RBI / FEMA COMPLIANCES"),
callout("📌", "NBFC-specific compliances are shown only if NBFC = Yes",
  ["Scale-Based Regulation (SBR) Framework 2021: NBFC-BL (Base Layer) / ML (Middle Layer) / UL (Upper Layer) — different compliance intensity",
   "Min NOF: ₹10 Cr for all NBFCs (deadline 31 Mar 2027 for existing; ab initio for new entrants)"],
  "FEE2E2", C.red),
sp(100),

H2("7.1  FEMA Compliances (All companies with foreign transactions)"),
tbl(["#","Compliance","Form","Trigger","Due Date","Penalty","Severity"], [
  ["73","FC-GPR — FDI Reporting","FC-GPR (RBI FIRMS portal)","On issue of shares/convertibles to non-resident — FEMA 20(R)","30 days of issue","Compounding with RBI; up to 3x inflow amount — FEMA Sec 13","Critical"],
  ["74","FLA — Foreign Liabilities & Assets Annual Return","FLA Return (RBI portal)","Indian resident with FDI or ODI outstanding — FEMA; mandatory even if no change","15 July annually (for 31 Mar FY-end)","₹10,000 per default; imprisonment up to 5 yrs","High"],
  ["75","FC-TRS — Secondary Share Transfer Reporting","FC-TRS","Transfer of shares between resident and non-resident — FEMA 20(R)","60 days of receipt/payment","Compounding with RBI","High"],
  ["76","ECB Reporting — Draw-down","Form ECB","On draw-down of External Commercial Borrowing","7 days of draw-down (Loan Registration Number first)","Compounding; delayed return: $500 per year","High"],
  ["77","ECB-2 Monthly Return","ECB-2","On any outstanding ECB","7th of following month","Compounding; FEMA Sec 13","High"],
], [280, 2000, 1100, 2100, 1200, 1700, 780], "1B3A6B"),

sp(120),
H2("7.2  NBFC-Specific RBI Compliances"),
tbl(["#","Compliance","Return","Trigger (NBFC Category)","Due Date","Penalty","Severity"], [
  ["78","NBS-1 (Quarterly Return — Deposit-Taking NBFC)","NBS-1","NBFC-D (deposit-taking)","15th after quarter-end","₹10 lakh/day (Sec 45-MB); licence cancellation","Critical"],
  ["79","NBS-2 (Quarterly Return — NOF, borrowings, etc.)","NBS-2","NBFC-D","15th after quarter-end","Same as above","Critical"],
  ["80","NBS-6 (Monthly Return — Exposure to Capital Market)","NBS-6","Deposit-taking NBFC with total assets ≥ ₹100 Cr","15th of following month","₹10 lakh/day","Critical"],
  ["81","ALM Returns (NBS-ALM1/2/3)","ALM-1/2/3","NBFC with public deposits ≥ ₹20 Cr OR asset size ≥ ₹100 Cr","Within 15 days of half-year end (Sep / Mar)","RBI action; licence suspension","Critical"],
  ["82","Half-Yearly Return — Non-deposit NBFC","NBS-7","NBFC-ND-SI (Systemically Important: asset size ≥ ₹100 Cr)","31 Oct / 30 Apr","RBI notice; penalties under RBI Act","High"],
  ["83","Branch Information Return","BIR","NBFC-ND with assets ₹50 Cr – ₹100 Cr","Within 15 days of quarter-end","RBI action","High"],
  ["84","Annual Statement of Capital Funds","—","All NBFCs — Certification of NOF by Statutory Auditor","Within 30 days of AGM / finalisation of accounts","Non-compliance: RBI enforcement","High"],
], [280, 1700, 1100, 2100, 1300, 1500, 780], "1B3A6B"),

pb(),

// ────────────────────────────────────────────────────────────────────
// SECTION 8 — RULES ENGINE DESIGN
// ────────────────────────────────────────────────────────────────────
H1("PART 8 — RULES ENGINE DESIGN"),
H2("8.1  Rule Data Schema (TypeScript)"),
P("Each compliance in the engine is stored as an object with the following fields:"),
sp(80),
tbl(["Field Name","Type","Purpose / Example"], [
  ["rule_id",           "string",    "Unique ID: 'MCA-AOC4-001', 'SEBI-LODR-029', 'IT-TAXAUDIT-047'"],
  ["regulator",         "enum",      "MCA | SEBI | IT | GST | Labour | RBI | FEMA"],
  ["law_reference",     "string",    "'Companies Act 2013, Section 137(1)' OR 'SEBI LODR Reg 31'"],
  ["obligation_name",   "string",    "'Filing of Financial Statements (AOC-4)'"],
  ["applicable_forms",  "string[]",  "['AOC-4', 'AOC-4 XBRL', 'AOC-4 NBFC (Ind AS)']"],
  ["trigger_logic",     "object",    "JSON: { company_type: ['pvt','pub','sec8'], turnover_cr: { gte: 100 } }"],
  ["due_date_formula",  "string",    "'30 days from AGM' OR '15th of following month' OR fixed date '30-Sep'"],
  ["penalty_company",   "string",    "'₹10,000 + ₹100/day, max ₹2 lakh — Sec 137(3)'"],
  ["penalty_officer",   "string",    "'₹10,000 + ₹100/day, max ₹50,000'"],
  ["imprisonment_risk", "boolean",   "true / false"],
  ["compoundable",      "boolean",   "true — with ROC / NCLT / RBI as applicable"],
  ["compounding_authority","string", "'ROC' | 'NCLT' | 'RBI' | 'SEBI' | 'AO'"],
  ["severity",          "enum",      "'Critical' | 'High' | 'Medium' | 'Low'"],
  ["is_periodic",       "boolean",   "true (monthly/quarterly/annual) vs false (event-based)"],
  ["frequency",         "enum",      "'monthly' | 'quarterly' | 'half-yearly' | 'annual' | 'event-based'"],
  ["applies_to_small_co","boolean",  "false — many MCA compliances exempt small companies"],
  ["applies_to_OPC",    "boolean",   "false — OPC exemptions built in"],
  ["last_updated",      "date",      "'2026-04-01'"],
  ["amendment_ref",     "string",    "'MCA GSR 880(E) dated 17 Oct 2025' / 'SEBI LODR 3rd Amdmt 2024'"],
  ["corplawupdates_url","string",    "'https://corplawupdates.in/compliance/form-aoc-4'"],
], [2100, 1000, 6260]),

sp(120),
H2("8.2  Trigger Evaluation Logic"),
P("The engine evaluates each rule's trigger_logic against user inputs using AND / OR logic:"),
bul("All conditions in the rule's trigger object must be satisfied (AND logic by default)."),
bul("OR conditions are expressed as arrays: { company_type: ['pvt', 'pub'] } means pvt OR pub."),
bul("Numeric thresholds: { turnover_cr: { gte: 100 } } means turnover ≥ ₹100 Cr."),
bul("Nested conditions for complex rules (e.g., CARO private company exemption):"),
subbul("Rule fires unless: (company_type = 'pvt') AND (puc_reserves_cr <= 1) AND (borrowings_cr <= 1) AND (revenue_cr <= 10)"),
bul("CARO small company exemption: Automatically checked against small_company flag set from PUC ≤ ₹10 Cr AND Turnover ≤ ₹100 Cr."),
bul("OPC rules: checked independently; OPC-specific forms (MGT-7A, DPT-3 exemptions) triggered by company_type = 'OPC'."),
sp(80),

H2("8.3  Output Generation Logic"),
tbl(["Output element","Logic"], [
  ["Applicable compliances list",          "All rules where trigger_logic evaluates to true for the user's inputs"],
  ["Severity summary (Critical/High/Medium/Low)","Count of matched rules by severity field"],
  ["Regulator-wise grouping",              "Matched rules grouped by 'regulator' field — MCA section, SEBI section, etc."],
  ["Due date timeline",                    "Current FY due dates computed from due_date_formula + current date"],
  ["Penalty exposure estimator",           "User checks 'not yet filed'; inputs days overdue → penalty_company formula computed"],
  ["Compliance not applicable list",        "Rules where trigger_logic = false, shown as 'Not Applicable' for transparency"],
  ["Exemptions called out",                "Small company / OPC exemptions displayed with the legal basis"],
  ["Amendment flags",                      "Rules with last_updated within 180 days show 'Recently Updated' badge"],
  ["Deep links to articles",               "corplawupdates_url field links to the relevant article on the site"],
], [3000, 6360]),

pb(),

// ────────────────────────────────────────────────────────────────────
// SECTION 9 — PENALTY CALCULATOR LOGIC
// ────────────────────────────────────────────────────────────────────
H1("PART 9 — PENALTY CALCULATOR FEATURE"),
P("Users who mark a compliance as 'Not yet filed' can enter the number of days overdue and see their approximate penalty exposure. This is one of the highest-value features of the tool."),
sp(100),
H2("9.1  Per-Rule Penalty Computation"),
tbl(["Rule / Compliance","Penalty Formula (for calculator)","Cap / Max"], [
  ["AOC-4 (Financial Statements)","₹10,000 base + (₹100 × days overdue) — company","Max ₹2,00,000"],
  ["MGT-7 (Annual Return)","₹50,000 base + (₹500 × days overdue) — company","No statutory cap — accumulates"],
  ["DIR-3 KYC","₹5,000 for reactivation — one-time","Fixed"],
  ["MGT-14 (Board Resolutions — Public)","₹1,00,000 + ₹500/day","₹5,00,000 for company; ₹25,000 for officer"],
  ["AGM Non-holding","₹1,00,000 + ₹5,000/day","N/A"],
  ["TDS Return (26Q etc.)","₹200 × days delayed (Sec 234E) per return","½% of TDS amount per month (max 100% of TDS due) — Sec 271H"],
  ["GSTR-1 (Monthly)","₹50/day (CGST) + ₹50/day (SGST)","₹10,000 per return"],
  ["GSTR-3B (Monthly)","₹50/day + 18% p.a. interest on tax due","₹10,000 per return for late fee; interest accumulates"],
  ["GSTR-9 (Annual)","₹200/day (₹100 CGST + ₹100 SGST)","0.25% of TO in state"],
  ["EPF Late Contribution","Interest 12% p.a. + damages: 5% (< 2 months delay); 10% (2-4 months); 15% (4-6 months); 25% (> 6 months)","No cap on damages"],
  ["Charge Registration (CHG-1)","Normal fee + additional fee (1% per day beyond 30 days)","Charge unenforceable after limit"],
  ["Tax Audit (Sec 44AB)","0.5% of turnover","Max ₹1,50,000 (Sec 271B — converted to fee)"],
  ["Transfer Pricing Report (3CEB)","2% of international transaction value","No cap — Sec 271BA"],
  ["Sec Audit (MR-3)","₹2,00,000 flat per officer","Fixed"],
], [2600, 4300, 2460]),

sp(120),
callout("⚠️", "Disclaimer to show inside penalty calculator",
  ["This calculator provides indicative estimates only. Actual penalties may vary based on judicial discretion, compounding orders, or CBDT/SEBI/RBI notices.",
   "Penalties are computed based on laws as of June 2026 and may change with future amendments.",
   "Always verify with a qualified CA/CS before acting on these estimates."],
  "FEE2E2", C.red),

    ]
  }]
});

// ── export / pack document ───────────────────────────────────────────
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("Master_Compliance_Matrix.docx", buffer);
  console.log("✓ Document successfully generated as 'Master_Compliance_Matrix.docx' in project root.");
}).catch((error) => {
  console.error("✕ Error packing document:", error);
});
