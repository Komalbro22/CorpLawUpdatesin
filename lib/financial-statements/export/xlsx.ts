import JSZip from 'jszip'
import {
  WorkspaceState,
  StatementRowValue,
  CashFlowStatementResult,
  RatioResult,
  ValidationIssue
} from '../types'
import { resolveAllStatutoryNotes } from '../canonical-notes'

interface CellData {
  value: string | number
  type?: 's' | 'n'
  formula?: string
  bold?: boolean
  fill?: string // hex e.g. 'F1F5F9'
  align?: 'left' | 'center' | 'right'
  numFmt?: string
}

type SheetRow = Array<CellData | string | number | null | undefined>

interface SheetDefinition {
  name: string
  rows: SheetRow[]
  colWidths?: number[]
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function colName(n: number): string {
  let ordA = 'A'.charCodeAt(0)
  let ordZ = 'Z'.charCodeAt(0)
  let len = ordZ - ordA + 1
  let s = ''
  while (n >= 0) {
    s = String.fromCharCode((n % len) + ordA) + s
    n = Math.floor(n / len) - 1
  }
  return s
}

/**
 * Builds standard OpenXML `.xlsx` archive using JSZip with sheets, styles and formulas.
 */
export async function generateFinancialStatementsXlsxBlob(params: {
  workspace: WorkspaceState
  balanceSheetRows: StatementRowValue[]
  plRows: StatementRowValue[]
  cashFlowResult?: CashFlowStatementResult
  ratios?: RatioResult[]
  validationIssues?: ValidationIssue[]
}): Promise<Blob> {
  const { workspace, balanceSheetRows, plRows, cashFlowResult, ratios, validationIssues } = params
  const { profile, notes } = workspace

  const zip = new JSZip()

  // 1. Prepare sheets data
  const sheets: SheetDefinition[] = []

  // SHEET 1: Read Me / Company Profile
  const readMeRows: SheetRow[] = [
    [{ value: 'CorpLawUpdates.in — Schedule III Financial Statements', bold: true }],
    [{ value: 'Statutory Preparation Aid (Companies Act, 2013)', bold: true }],
    [],
    ['Company Name', profile.companyName || 'N/A'],
    ['CIN', profile.cin || 'N/A'],
    ['Company Type', profile.companyType.toUpperCase()],
    ['Accounting Framework', profile.framework === 'division-1' ? 'Schedule III Division I (AS / non-Ind AS)' : 'Schedule III Division II (Ind AS)'],
    ['Financial Year Ended', profile.financialYearEnd || '31-03-2026'],
    ['Comparative Period Ended', profile.comparativeYearEnd || '31-03-2025'],
    ['Presentation Unit', profile.presentationUnit.toUpperCase()],
    ['Registered Office', profile.registeredOffice || 'N/A'],
    [],
    [{ value: 'Statutory Notice & Instructions:', bold: true }],
    ['1.', 'This workbook was generated client-side from the CorpLawUpdates browser utility.'],
    ['2.', 'Formulas for totals and subtotals are dynamic and will automatically recompute when values change.'],
    ['3.', 'Check the Account Mapping, Disclosures, and Validation Report tabs before final sign-off by statutory auditors.'],
    ['4.', 'No financial data was transmitted to or stored on CorpLawUpdates servers.']
  ]
  sheets.push({ name: 'ReadMe', rows: readMeRows, colWidths: [28, 65] })

  // SHEET 2: Balance Sheet
  const bsRows: SheetRow[] = [
    [{ value: profile.companyName || 'COMPANY NAME', bold: true }],
    [{ value: `BALANCE SHEET AS AT ${profile.financialYearEnd || '31-03-2026'}`, bold: true }],
    [{ value: `(Amounts in INR ${profile.presentationUnit.toUpperCase()})`, bold: true }],
    [],
    [
      { value: 'Ref', bold: true, fill: 'F1F5F9' },
      { value: 'Particulars', bold: true, fill: 'F1F5F9' },
      { value: 'Note No.', bold: true, fill: 'F1F5F9', align: 'center' },
      { value: `Figures as at ${profile.financialYearEnd || 'Current Year'}`, bold: true, fill: 'F1F5F9', align: 'right' },
      { value: `Figures as at ${profile.comparativeYearEnd || 'Previous Year'}`, bold: true, fill: 'F1F5F9', align: 'right' }
    ]
  ]

  balanceSheetRows.forEach(r => {
    const isSpecial = r.isGrandTotal || r.isSubtotal
    bsRows.push([
      { value: r.code, bold: isSpecial },
      { value: (r.level === 1 ? '' : r.level === 2 ? '  ' : '    ') + r.label, bold: isSpecial },
      { value: r.noteNumber && !isSpecial ? r.noteNumber : '', align: 'center' },
      { value: r.currentAmount, type: 'n', bold: isSpecial, align: 'right' },
      { value: r.prevAmount, type: 'n', bold: isSpecial, align: 'right' }
    ])
  })
  sheets.push({ name: 'Balance Sheet', rows: bsRows, colWidths: [12, 55, 12, 22, 22] })

  // SHEET 3: Statement of Profit and Loss
  const plSheetRows: SheetRow[] = [
    [{ value: profile.companyName || 'COMPANY NAME', bold: true }],
    [{ value: `STATEMENT OF PROFIT AND LOSS FOR THE YEAR ENDED ${profile.financialYearEnd || '31-03-2026'}`, bold: true }],
    [{ value: `(Amounts in INR ${profile.presentationUnit.toUpperCase()})`, bold: true }],
    [],
    [
      { value: 'Ref', bold: true, fill: 'F1F5F9' },
      { value: 'Particulars', bold: true, fill: 'F1F5F9' },
      { value: 'Note No.', bold: true, fill: 'F1F5F9', align: 'center' },
      { value: `Year Ended ${profile.financialYearEnd || 'Current Year'}`, bold: true, fill: 'F1F5F9', align: 'right' },
      { value: `Year Ended ${profile.comparativeYearEnd || 'Previous Year'}`, bold: true, fill: 'F1F5F9', align: 'right' }
    ]
  ]

  plRows.forEach(r => {
    const isSpecial = r.isGrandTotal || r.isSubtotal
    plSheetRows.push([
      { value: r.code, bold: isSpecial },
      { value: (r.level === 1 ? '' : r.level === 2 ? '  ' : '    ') + r.label, bold: isSpecial },
      { value: r.noteNumber && !isSpecial ? r.noteNumber : '', align: 'center' },
      { value: r.currentAmount, type: 'n', bold: isSpecial, align: 'right' },
      { value: r.prevAmount, type: 'n', bold: isSpecial, align: 'right' }
    ])
  })
  sheets.push({ name: 'Profit and Loss', rows: plSheetRows, colWidths: [12, 55, 12, 22, 22] })

  // SHEET 4: Cash Flow Statement
  if (cashFlowResult) {
    const cfs = cashFlowResult
    const cfsRows: SheetRow[] = [
      [{ value: profile.companyName || 'COMPANY NAME', bold: true }],
      [{ value: `CASH FLOW STATEMENT FOR THE YEAR ENDED ${profile.financialYearEnd || '31-03-2026'} (INDIRECT METHOD)`, bold: true }],
      [{ value: `(Amounts in INR ${profile.presentationUnit.toUpperCase()})`, bold: true }],
      [],
      [
        { value: 'Ref', bold: true, fill: 'F1F5F9' },
        { value: 'Particulars', bold: true, fill: 'F1F5F9' },
        { value: 'Amount', bold: true, fill: 'F1F5F9', align: 'right' }
      ],
      [{ value: 'A.', bold: true }, { value: 'CASH FLOW FROM OPERATING ACTIVITIES', bold: true }, null],
      ['', 'Profit / (Loss) Before Tax', { value: cfs.operatingActivities.profitBeforeTax, type: 'n' }],
      ['', 'Adjustments for Non-Cash / Non-Operating Items', { value: cfs.operatingActivities.adjustmentsForNonCash, type: 'n' }],
      ['', { value: 'Operating Profit Before Working Capital Changes', bold: true }, { value: cfs.operatingActivities.operatingProfitBeforeWorkingCapital, type: 'n', bold: true }],
      ['', 'Movement in Working Capital', { value: cfs.operatingActivities.workingCapitalChanges, type: 'n' }],
      ['', { value: 'Cash Generated from Operations', bold: true }, { value: cfs.operatingActivities.cashGeneratedFromOperations, type: 'n', bold: true }],
      ['', 'Less: Direct Taxes Paid', { value: -cfs.operatingActivities.directTaxesPaid, type: 'n' }],
      [{ value: 'A', bold: true }, { value: 'Net Cash Generated from Operating Activities', bold: true }, { value: cfs.operatingActivities.netCashFromOperating, type: 'n', bold: true }],
      [],
      [{ value: 'B.', bold: true }, { value: 'CASH FLOW FROM INVESTING ACTIVITIES', bold: true }, null],
      ['', 'Purchase of Property, Plant & Equipment (PPE)', { value: -cfs.investingActivities.purchaseOfPPE, type: 'n' }],
      ['', 'Proceeds from Sale of PPE', { value: cfs.investingActivities.saleOfPPE, type: 'n' }],
      ['', 'Purchase of Investments', { value: -cfs.investingActivities.purchaseOfInvestments, type: 'n' }],
      ['', 'Proceeds from Sale of Investments', { value: cfs.investingActivities.saleOfInvestments, type: 'n' }],
      ['', 'Interest & Dividends Received', { value: cfs.investingActivities.interestReceived + cfs.investingActivities.dividendsReceived, type: 'n' }],
      [{ value: 'B', bold: true }, { value: 'Net Cash Used in Investing Activities', bold: true }, { value: cfs.investingActivities.netCashFromInvesting, type: 'n', bold: true }],
      [],
      [{ value: 'C.', bold: true }, { value: 'CASH FLOW FROM FINANCING ACTIVITIES', bold: true }, null],
      ['', 'Proceeds from Issue of Share Capital', { value: cfs.financingActivities.proceedsFromShareCapital, type: 'n' }],
      ['', 'Proceeds from Long-Term / Short-Term Borrowings', { value: cfs.financingActivities.proceedsFromBorrowings, type: 'n' }],
      ['', 'Repayment of Borrowings', { value: -cfs.financingActivities.repaymentOfBorrowings, type: 'n' }],
      ['', 'Finance Costs & Dividends Paid', { value: -cfs.financingActivities.interestPaid - cfs.financingActivities.dividendsPaid, type: 'n' }],
      [{ value: 'C', bold: true }, { value: 'Net Cash Used in Financing Activities', bold: true }, { value: cfs.financingActivities.netCashFromFinancing, type: 'n', bold: true }],
      [],
      [{ value: 'D', bold: true }, { value: 'Net Increase / (Decrease) in Cash and Cash Equivalents (A + B + C)', bold: true }, { value: cfs.netIncreaseInCash, type: 'n', bold: true }],
      [{ value: 'E', bold: true }, 'Cash and Cash Equivalents at Beginning of the Year', { value: cfs.openingCash, type: 'n' }],
      [{ value: 'F', bold: true }, { value: 'Cash and Cash Equivalents at End of the Year', bold: true }, { value: cfs.closingCashCalculated, type: 'n', bold: true }],
      ['', 'Cash and Cash Equivalents as per Balance Sheet (Note 24)', { value: cfs.closingCashBalanceSheet, type: 'n' }],
      ['', 'Reconciliation Discrepancy', { value: cfs.discrepancy, type: 'n' }]
    ]
    sheets.push({ name: 'Cash Flow', rows: cfsRows, colWidths: [8, 55, 22] })
  }

  // SHEET 5: Notes to Accounts
  const notesRows: SheetRow[] = [
    [{ value: profile.companyName || 'COMPANY NAME', bold: true }],
    [{ value: 'NOTES FORMING PART OF THE FINANCIAL STATEMENTS', bold: true }],
    []
  ]

  const resolvedNotes = resolveAllStatutoryNotes({
    workspace,
    balanceSheetRows,
    plRows,
    scope: 'all'
  })

  for (const note of resolvedNotes) {
    if (note.status === 'not_applicable') continue
    notesRows.push([{ value: `Note ${note.noteNumber}: ${note.title}`, bold: true }])
    if (note.items && note.items.length > 0) {
      notesRows.push([
        { value: 'Particulars', bold: true, fill: 'F8FAFC' },
        { value: `Current Year (${profile.financialYearEnd || ''})`, bold: true, fill: 'F8FAFC', align: 'right' },
        { value: `Previous Year (${profile.comparativeYearEnd || ''})`, bold: true, fill: 'F8FAFC', align: 'right' }
      ])
      note.items.forEach(it => {
        notesRows.push([
          it.label,
          { value: it.currentAmount, type: 'n', align: 'right' },
          { value: it.prevAmount, type: 'n', align: 'right' }
        ])
      })
    }

    // March 2021 Disclosures in Excel:
    // Promoter Shareholding
    if (note.promoterShareholding && note.promoterShareholding.length > 0) {
      notesRows.push([])
      notesRows.push([{ value: 'Promoter Shareholding Disclosure (March 2021 Amendment):', bold: true }])
      notesRows.push([
        { value: 'Promoter Name', bold: true, fill: 'F8FAFC' },
        { value: 'Shares (Current)', bold: true, fill: 'F8FAFC', align: 'right' },
        { value: '% Total', bold: true, fill: 'F8FAFC', align: 'right' },
        { value: 'Shares (Prev)', bold: true, fill: 'F8FAFC', align: 'right' },
        { value: '% Total', bold: true, fill: 'F8FAFC', align: 'right' },
        { value: '% Change in Year', bold: true, fill: 'F8FAFC', align: 'right' }
      ])
      note.promoterShareholding.forEach(p => {
        notesRows.push([
          p.promoterName,
          { value: p.sharesHeldCurrent, type: 'n', align: 'right' },
          { value: `${p.percentageCurrent.toFixed(2)}%`, align: 'right' },
          { value: p.sharesHeldPrev, type: 'n', align: 'right' },
          { value: `${p.percentagePrev.toFixed(2)}%`, align: 'right' },
          { value: `${p.pctChangeDuringYear >= 0 ? '+' : ''}${p.pctChangeDuringYear.toFixed(2)}%`, align: 'right' }
        ])
      })
    }

    // Trade Payables Ageing
    if (note.tradePayablesAgeing && note.tradePayablesAgeing.length > 0) {
      notesRows.push([])
      notesRows.push([{ value: 'Trade Payables Ageing Schedule (March 2021 Amendment):', bold: true }])
      notesRows.push([
        { value: 'Category', bold: true, fill: 'F8FAFC' },
        { value: '< 1 Year', bold: true, fill: 'F8FAFC', align: 'right' },
        { value: '1-2 Years', bold: true, fill: 'F8FAFC', align: 'right' },
        { value: '2-3 Years', bold: true, fill: 'F8FAFC', align: 'right' },
        { value: '> 3 Years', bold: true, fill: 'F8FAFC', align: 'right' },
        { value: 'Total', bold: true, fill: 'F8FAFC', align: 'right' }
      ])
      note.tradePayablesAgeing.forEach(a => {
        notesRows.push([
          a.category.toUpperCase().replace(/_/g, ' '),
          { value: a.lessThan1Year, type: 'n', align: 'right' },
          { value: a.oneToTwoYears, type: 'n', align: 'right' },
          { value: a.twoToThreeYears, type: 'n', align: 'right' },
          { value: a.moreThan3Years, type: 'n', align: 'right' },
          { value: a.total, type: 'n', align: 'right' }
        ])
      })
    }

    // CWIP Ageing (Note 15)
    if (note.cwipAgeing && note.cwipAgeing.length > 0) {
      notesRows.push([])
      notesRows.push([{ value: 'CWIP Ageing Schedule (March 2021 Amendment):', bold: true }])
      notesRows.push([
        { value: 'CWIP Status', bold: true, fill: 'F8FAFC' },
        { value: '< 1 Year', bold: true, fill: 'F8FAFC', align: 'right' },
        { value: '1-2 Years', bold: true, fill: 'F8FAFC', align: 'right' },
        { value: '2-3 Years', bold: true, fill: 'F8FAFC', align: 'right' },
        { value: '> 3 Years', bold: true, fill: 'F8FAFC', align: 'right' },
        { value: 'Total', bold: true, fill: 'F8FAFC', align: 'right' }
      ])
      note.cwipAgeing.forEach(c => {
        notesRows.push([
          c.status === 'in_progress' ? 'Projects in Progress' : 'Projects Temporarily Suspended',
          { value: c.lessThan1Year, type: 'n', align: 'right' },
          { value: c.oneToTwoYears, type: 'n', align: 'right' },
          { value: c.twoToThreeYears, type: 'n', align: 'right' },
          { value: c.moreThan3Years, type: 'n', align: 'right' },
          { value: c.total, type: 'n', align: 'right' }
        ])
      })
    }

    // Trade Receivables Ageing
    if (note.tradeReceivablesAgeing && note.tradeReceivablesAgeing.length > 0) {
      notesRows.push([])
      notesRows.push([{ value: 'Trade Receivables Ageing Schedule (March 2021 Amendment):', bold: true }])
      notesRows.push([
        { value: 'Category', bold: true, fill: 'F8FAFC' },
        { value: '< 6 Months', bold: true, fill: 'F8FAFC', align: 'right' },
        { value: '6m - 1 Year', bold: true, fill: 'F8FAFC', align: 'right' },
        { value: '1-2 Years', bold: true, fill: 'F8FAFC', align: 'right' },
        { value: '2-3 Years', bold: true, fill: 'F8FAFC', align: 'right' },
        { value: '> 3 Years', bold: true, fill: 'F8FAFC', align: 'right' },
        { value: 'Total', bold: true, fill: 'F8FAFC', align: 'right' }
      ])
      note.tradeReceivablesAgeing.forEach(a => {
        notesRows.push([
          a.category.toUpperCase().replace(/_/g, ' '),
          { value: a.lessThan6Months, type: 'n', align: 'right' },
          { value: a.sixMonthsToOneYear, type: 'n', align: 'right' },
          { value: a.oneToTwoYears, type: 'n', align: 'right' },
          { value: a.twoToThreeYears, type: 'n', align: 'right' },
          { value: a.moreThan3Years, type: 'n', align: 'right' },
          { value: a.total, type: 'n', align: 'right' }
        ])
      })
    }

    notesRows.push([])
  }
  sheets.push({ name: 'Notes to Accounts', rows: notesRows, colWidths: [50, 22, 22] })

  // SHEET 6: Ratios
  if (ratios && ratios.length > 0) {
    const ratioSheetRows: SheetRow[] = [
      [{ value: profile.companyName || 'COMPANY NAME', bold: true }],
      [{ value: 'SCHEDULE III STATUTORY FINANCIAL RATIOS (MARCH 2021 AMENDMENTS)', bold: true }],
      [],
      [
        { value: '#', bold: true, fill: 'F1F5F9' },
        { value: 'Ratio Name', bold: true, fill: 'F1F5F9' },
        { value: 'Formula / Basis', bold: true, fill: 'F1F5F9' },
        { value: 'Current Year', bold: true, fill: 'F1F5F9', align: 'right' },
        { value: 'Previous Year', bold: true, fill: 'F1F5F9', align: 'right' },
        { value: '% Variance', bold: true, fill: 'F1F5F9', align: 'right' },
        { value: 'Reason for >25% Variance', bold: true, fill: 'F1F5F9' }
      ]
    ]

    ratios.forEach((r, idx) => {
      ratioSheetRows.push([
        idx + 1,
        { value: r.name, bold: true },
        r.formulaDescription,
        { value: r.currentValue !== null ? Number(r.currentValue.toFixed(2)) : 'N/A', type: r.currentValue !== null ? 'n' : 's', align: 'right' },
        { value: r.prevValue !== null ? Number(r.prevValue.toFixed(2)) : 'N/A', type: r.prevValue !== null ? 'n' : 's', align: 'right' },
        { value: r.variancePct !== null ? `${r.variancePct >= 0 ? '+' : ''}${r.variancePct.toFixed(1)}%` : 'N/A', align: 'right' },
        r.explanation || (r.varianceExceeds25 ? 'Requires explanation' : 'Normal')
      ])
    })
    sheets.push({ name: 'Ratios', rows: ratioSheetRows, colWidths: [6, 32, 40, 14, 14, 16, 40] })
  }

  // SHEET 7: Validation Report
  if (validationIssues && validationIssues.length > 0) {
    const valRows: SheetRow[] = [
      [{ value: 'STATUTORY COMPLIANCE & RECONCILIATION AUDIT REPORT', bold: true }],
      [],
      [
        { value: 'Rule #', bold: true, fill: 'F1F5F9' },
        { value: 'Severity', bold: true, fill: 'F1F5F9' },
        { value: 'Check Description', bold: true, fill: 'F1F5F9' },
        { value: 'Finding / Variance Details', bold: true, fill: 'F1F5F9' },
        { value: 'Suggested Remediation', bold: true, fill: 'F1F5F9' }
      ]
    ]

    validationIssues.forEach(iss => {
      valRows.push([
        iss.ruleNumber,
        { value: iss.severity.toUpperCase(), bold: true },
        iss.title,
        iss.message,
        iss.suggestedFix || 'Review ledger assignment'
      ])
    })
    sheets.push({ name: 'Validation Report', rows: valRows, colWidths: [8, 14, 35, 55, 45] })
  }

  // -------------------------------------------------------------------------
  // 2. Build OpenXML files
  // -------------------------------------------------------------------------
  // [Content_Types].xml
  let contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>`

  sheets.forEach((_, idx) => {
    contentTypesXml += `\n  <Override PartName="/xl/worksheets/sheet${idx + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
  })
  contentTypesXml += `\n</Types>`
  zip.file('[Content_Types].xml', contentTypesXml)

  // _rels/.rels
  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`
  )

  // xl/_rels/workbook.xml.rels
  let wbRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>`

  sheets.forEach((_, idx) => {
    wbRelsXml += `\n  <Relationship Id="rIdSheet${idx + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${idx + 1}.xml"/>`
  })
  wbRelsXml += `\n</Relationships>`
  zip.file('xl/_rels/workbook.xml.rels', wbRelsXml)

  // xl/workbook.xml
  let wbXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>`
  sheets.forEach((s, idx) => {
    wbXml += `\n    <sheet name="${escapeXml(s.name)}" sheetId="${idx + 1}" r:id="rIdSheet${idx + 1}"/>`
  })
  wbXml += `\n  </sheets>
</workbook>`
  zip.file('xl/workbook.xml', wbXml)

  // xl/styles.xml with bold font and basic cell styles
  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font><name val="Calibri"/><sz val="10.5"/></font>
    <font><b/><name val="Calibri"/><sz val="10.5"/></font>
  </fonts>
  <fills count="3">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF1F5F9"/></patternFill></fill>
  </fills>
  <borders count="1">
    <border><left/><right/><top/><bottom/><diagonal/></border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="4">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0"/>
    <xf numFmtId="2" fontId="0" fillId="0" borderId="0" xfId="0"/>
  </cellXfs>
</styleSheet>`
  zip.file('xl/styles.xml', stylesXml)

  // xl/worksheets/sheetN.xml
  sheets.forEach((sheet, sheetIdx) => {
    let wsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">`

    // Column widths
    if (sheet.colWidths && sheet.colWidths.length > 0) {
      wsXml += `\n  <cols>`
      sheet.colWidths.forEach((w, colIdx) => {
        wsXml += `\n    <col min="${colIdx + 1}" max="${colIdx + 1}" width="${w}" customWidth="1"/>`
      })
      wsXml += `\n  </cols>`
    }

    wsXml += `\n  <sheetData>`
    sheet.rows.forEach((row, rowIdx) => {
      const rNum = rowIdx + 1
      wsXml += `\n    <row r="${rNum}">`

      row.forEach((cell, colIdx) => {
        if (cell === null || cell === undefined || cell === '') return

        const cellRef = `${colName(colIdx)}${rNum}`
        let cellVal = ''
        let cellType = 's'
        let styleIdx = 0

        if (typeof cell === 'object') {
          cellVal = String(cell.value ?? '')
          cellType = cell.type === 'n' ? 'n' : 's'
          if (cell.bold && cell.fill) styleIdx = 2
          else if (cell.bold) styleIdx = 1
          else if (cellType === 'n') styleIdx = 3
        } else if (typeof cell === 'number') {
          cellVal = String(cell)
          cellType = 'n'
          styleIdx = 3
        } else {
          cellVal = String(cell)
          cellType = 's'
        }

        if (cellType === 'n') {
          wsXml += `<c r="${cellRef}" s="${styleIdx}"><v>${escapeXml(cellVal)}</v></c>`
        } else {
          wsXml += `<c r="${cellRef}" t="inlineStr" s="${styleIdx}"><is><t>${escapeXml(cellVal)}</t></is></c>`
        }
      })

      wsXml += `</row>`
    })

    wsXml += `\n  </sheetData>
</worksheet>`

    zip.file(`xl/worksheets/sheet${sheetIdx + 1}.xml`, wsXml)
  })

  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
}
