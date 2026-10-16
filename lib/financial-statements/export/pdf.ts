import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  WorkspaceState,
  StatementRowValue,
  CashFlowStatementResult,
  RatioResult
} from '../types'
import { formatCurrencyAmount } from '../calculations'
import { cleanPdfText, PDF_PALETTE } from '@/lib/pdf/pdfUtils'
import { resolveAllStatutoryNotes } from '../canonical-notes'

export interface PdfExportOptions {
  includeBalanceSheet?: boolean
  includeProfitLoss?: boolean
  includeCashFlow?: boolean
  includeNotes?: boolean
  includeRatios?: boolean
  isDraft?: boolean
}

export function generateFinancialStatementsPdf(params: {
  workspace: WorkspaceState
  balanceSheetRows: StatementRowValue[]
  plRows: StatementRowValue[]
  cashFlowResult?: CashFlowStatementResult
  ratios?: RatioResult[]
  options?: PdfExportOptions
}): jsPDF {
  const { workspace, balanceSheetRows, plRows, cashFlowResult, ratios, options } = params
  const { profile, notes } = workspace

  const opt = {
    includeBalanceSheet: true,
    includeProfitLoss: true,
    includeCashFlow: true,
    includeNotes: true,
    includeRatios: true,
    isDraft: false,
    ...options
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const companyName = profile.companyName.trim() || 'XYZ COMPANY PRIVATE LIMITED'
  const unitLabel = `Amounts in INR ${profile.presentationUnit.toUpperCase()}`
  let isFirstPage = true

  const renderSectionHeader = (title: string, subTitle: string) => {
    if (!isFirstPage) {
      doc.addPage()
    }
    isFirstPage = false

    // Brand bar
    doc.setFillColor(PDF_PALETTE.navy[0], PDF_PALETTE.navy[1], PDF_PALETTE.navy[2])
    doc.rect(14, 12, pageWidth - 28, 2.5, 'F')

    // Company Name
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(PDF_PALETTE.navy[0], PDF_PALETTE.navy[1], PDF_PALETTE.navy[2])
    doc.text(cleanPdfText(companyName), 14, 21)

    // CIN & Registered Office if available
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(PDF_PALETTE.slate[0], PDF_PALETTE.slate[1], PDF_PALETTE.slate[2])
    const regLine = [
      profile.cin ? `CIN: ${profile.cin}` : null,
      profile.registeredOffice ? profile.registeredOffice : null
    ]
      .filter(Boolean)
      .join(' | ')
    if (regLine) {
      doc.text(cleanPdfText(regLine), 14, 26)
    }

    // Statement Title
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(PDF_PALETTE.blue[0], PDF_PALETTE.blue[1], PDF_PALETTE.blue[2])
    const titleY = regLine ? 32 : 28
    doc.text(cleanPdfText(title), 14, titleY)

    // Subtitle & Unit
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8)
    doc.setTextColor(PDF_PALETTE.gray[0], PDF_PALETTE.gray[1], PDF_PALETTE.gray[2])
    doc.text(cleanPdfText(subTitle), 14, titleY + 4.5)
    doc.text(cleanPdfText(unitLabel), pageWidth - 14, titleY + 4.5, { align: 'right' })

    // Draft watermark if requested
    if (opt.isDraft) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(PDF_PALETTE.amber[0], PDF_PALETTE.amber[1], PDF_PALETTE.amber[2])
      doc.text('DRAFT - FOR PROFESSIONAL REVIEW', pageWidth - 14, 21, { align: 'right' })
    }

    // Divider
    doc.setDrawColor(PDF_PALETTE.lightGray[0], PDF_PALETTE.lightGray[1], PDF_PALETTE.lightGray[2])
    doc.setLineWidth(0.4)
    doc.line(14, titleY + 6.5, pageWidth - 14, titleY + 6.5)

    return titleY + 9
  }

  // -------------------------------------------------------------------------
  // 1. BALANCE SHEET
  // -------------------------------------------------------------------------
  if (opt.includeBalanceSheet && balanceSheetRows.length > 0) {
    const startY = renderSectionHeader(
      'BALANCE SHEET',
      `As at ${profile.financialYearEnd || '31st March 2026'} (Schedule III Division I)`
    )

    const tableBody = balanceSheetRows.map(r => {
      const indent = r.level === 1 ? '' : r.level === 2 ? '   ' : '      '
      const label = indent + r.label
      const noteStr = r.noteNumber && !r.isSubtotal && !r.isGrandTotal ? String(r.noteNumber) : ''
      const curStr = formatCurrencyAmount(r.currentAmount, profile.presentationUnit)
      const prevStr = formatCurrencyAmount(r.prevAmount, profile.presentationUnit)

      return [r.code, label, noteStr, curStr, prevStr]
    })

    autoTable(doc, {
      startY,
      margin: { left: 14, right: 14 },
      head: [
        [
          'Ref',
          'Particulars',
          'Note',
          `Figures as at ${profile.financialYearEnd || 'Current Year'}`,
          `Figures as at ${profile.comparativeYearEnd || 'Previous Year'}`
        ]
      ],
      body: tableBody,
      theme: 'plain',
      styles: {
        fontSize: 7.5,
        cellPadding: { top: 2, bottom: 2, left: 2, right: 2 },
        font: 'helvetica',
        textColor: [30, 41, 59]
      },
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontStyle: 'bold',
        lineWidth: 0.2,
        lineColor: [203, 213, 225]
      },
      columnStyles: {
        0: { cellWidth: 16, fontStyle: 'bold' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 14, halign: 'center' },
        3: { cellWidth: 34, halign: 'right' },
        4: { cellWidth: 34, halign: 'right' }
      },
      didParseCell: data => {
        const rowIdx = data.row.index
        const rowData = balanceSheetRows[rowIdx]
        if (!rowData) return

        if (rowData.isGrandTotal) {
          data.cell.styles.fontStyle = 'bold'
          data.cell.styles.fillColor = [226, 232, 240]
          data.cell.styles.lineWidth = 0.4
          data.cell.styles.lineColor = [15, 23, 42]
        } else if (rowData.isSubtotal) {
          data.cell.styles.fontStyle = 'bold'
          data.cell.styles.fillColor = [248, 250, 252]
        } else if (rowData.level === 1) {
          data.cell.styles.fontStyle = 'bold'
        }
      }
    })
  }

  // -------------------------------------------------------------------------
  // 2. STATEMENT OF PROFIT AND LOSS
  // -------------------------------------------------------------------------
  if (opt.includeProfitLoss && plRows.length > 0) {
    const startY = renderSectionHeader(
      'STATEMENT OF PROFIT AND LOSS',
      `For the year ended ${profile.financialYearEnd || '31st March 2026'} (Schedule III Division I)`
    )

    const tableBody = plRows.map(r => {
      const indent = r.level === 1 ? '' : r.level === 2 ? '   ' : '      '
      const label = indent + r.label
      const noteStr = r.noteNumber && !r.isSubtotal && !r.isGrandTotal ? String(r.noteNumber) : ''
      const curStr = formatCurrencyAmount(r.currentAmount, profile.presentationUnit)
      const prevStr = formatCurrencyAmount(r.prevAmount, profile.presentationUnit)

      return [r.code, label, noteStr, curStr, prevStr]
    })

    autoTable(doc, {
      startY,
      margin: { left: 14, right: 14 },
      head: [
        [
          'Ref',
          'Particulars',
          'Note',
          `For the Year ended ${profile.financialYearEnd || 'Current Year'}`,
          `For the Year ended ${profile.comparativeYearEnd || 'Previous Year'}`
        ]
      ],
      body: tableBody,
      theme: 'plain',
      styles: {
        fontSize: 7.5,
        cellPadding: { top: 2, bottom: 2, left: 2, right: 2 },
        font: 'helvetica',
        textColor: [30, 41, 59]
      },
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontStyle: 'bold',
        lineWidth: 0.2,
        lineColor: [203, 213, 225]
      },
      columnStyles: {
        0: { cellWidth: 16, fontStyle: 'bold' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 14, halign: 'center' },
        3: { cellWidth: 34, halign: 'right' },
        4: { cellWidth: 34, halign: 'right' }
      },
      didParseCell: data => {
        const rowIdx = data.row.index
        const rowData = plRows[rowIdx]
        if (!rowData) return

        if (rowData.isGrandTotal) {
          data.cell.styles.fontStyle = 'bold'
          data.cell.styles.fillColor = [226, 232, 240]
          data.cell.styles.lineWidth = 0.4
          data.cell.styles.lineColor = [15, 23, 42]
        } else if (rowData.isSubtotal) {
          data.cell.styles.fontStyle = 'bold'
          data.cell.styles.fillColor = [248, 250, 252]
        }
      }
    })
  }

  // -------------------------------------------------------------------------
  // 3. CASH FLOW STATEMENT
  // -------------------------------------------------------------------------
  if (opt.includeCashFlow && cashFlowResult) {
    const startY = renderSectionHeader(
      'CASH FLOW STATEMENT (INDIRECT METHOD)',
      `For the year ended ${profile.financialYearEnd || '31st March 2026'} (In accordance with AS-3)`
    )

    const cfs = cashFlowResult
    const cfsRows: Array<[string, string, string]> = [
      ['A.', 'CASH FLOW FROM OPERATING ACTIVITIES', ''],
      ['', 'Profit / (Loss) Before Tax', formatCurrencyAmount(cfs.operatingActivities.profitBeforeTax, profile.presentationUnit)],
      ['', 'Adjustments for Non-Cash / Non-Operating Items', formatCurrencyAmount(cfs.operatingActivities.adjustmentsForNonCash, profile.presentationUnit)],
      ['', 'Operating Profit Before Working Capital Changes', formatCurrencyAmount(cfs.operatingActivities.operatingProfitBeforeWorkingCapital, profile.presentationUnit)],
      ['', 'Movement in Working Capital', formatCurrencyAmount(cfs.operatingActivities.workingCapitalChanges, profile.presentationUnit)],
      ['', 'Cash Generated from Operations', formatCurrencyAmount(cfs.operatingActivities.cashGeneratedFromOperations, profile.presentationUnit)],
      ['', 'Less: Direct Taxes Paid', formatCurrencyAmount(-cfs.operatingActivities.directTaxesPaid, profile.presentationUnit)],
      ['', 'Net Cash Generated from Operating Activities (A)', formatCurrencyAmount(cfs.operatingActivities.netCashFromOperating, profile.presentationUnit)],

      ['B.', 'CASH FLOW FROM INVESTING ACTIVITIES', ''],
      ['', 'Purchase of Property, Plant & Equipment (PPE)', formatCurrencyAmount(-cfs.investingActivities.purchaseOfPPE, profile.presentationUnit)],
      ['', 'Proceeds from Sale of PPE', formatCurrencyAmount(cfs.investingActivities.saleOfPPE, profile.presentationUnit)],
      ['', 'Purchase of Investments', formatCurrencyAmount(-cfs.investingActivities.purchaseOfInvestments, profile.presentationUnit)],
      ['', 'Proceeds from Sale of Investments', formatCurrencyAmount(cfs.investingActivities.saleOfInvestments, profile.presentationUnit)],
      ['', 'Interest & Dividends Received', formatCurrencyAmount(cfs.investingActivities.interestReceived + cfs.investingActivities.dividendsReceived, profile.presentationUnit)],
      ['', 'Net Cash Used in Investing Activities (B)', formatCurrencyAmount(cfs.investingActivities.netCashFromInvesting, profile.presentationUnit)],

      ['C.', 'CASH FLOW FROM FINANCING ACTIVITIES', ''],
      ['', 'Proceeds from Issue of Share Capital', formatCurrencyAmount(cfs.financingActivities.proceedsFromShareCapital, profile.presentationUnit)],
      ['', 'Proceeds from Long-Term / Short-Term Borrowings', formatCurrencyAmount(cfs.financingActivities.proceedsFromBorrowings, profile.presentationUnit)],
      ['', 'Repayment of Borrowings', formatCurrencyAmount(-cfs.financingActivities.repaymentOfBorrowings, profile.presentationUnit)],
      ['', 'Finance Costs & Dividends Paid', formatCurrencyAmount(-cfs.financingActivities.interestPaid - cfs.financingActivities.dividendsPaid, profile.presentationUnit)],
      ['', 'Net Cash Used in Financing Activities (C)', formatCurrencyAmount(cfs.financingActivities.netCashFromFinancing, profile.presentationUnit)],

      ['D.', 'Net Increase / (Decrease) in Cash & Cash Equivalents (A + B + C)', formatCurrencyAmount(cfs.netIncreaseInCash, profile.presentationUnit)],
      ['E.', 'Cash & Cash Equivalents at Beginning of Year', formatCurrencyAmount(cfs.openingCash, profile.presentationUnit)],
      ['F.', 'Cash & Cash Equivalents at End of Year (Calculated)', formatCurrencyAmount(cfs.closingCashCalculated, profile.presentationUnit)],
      ['G.', 'Cash & Cash Equivalents as per Balance Sheet (Note 24)', formatCurrencyAmount(cfs.closingCashBalanceSheet, profile.presentationUnit)]
    ]

    autoTable(doc, {
      startY,
      margin: { left: 14, right: 14 },
      head: [['Ref', 'Particulars', 'Amount']],
      body: cfsRows,
      theme: 'plain',
      styles: {
        fontSize: 7.5,
        cellPadding: { top: 2, bottom: 2, left: 2, right: 2 },
        font: 'helvetica',
        textColor: [30, 41, 59]
      },
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontStyle: 'bold',
        lineWidth: 0.2,
        lineColor: [203, 213, 225]
      },
      columnStyles: {
        0: { cellWidth: 16, fontStyle: 'bold' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 38, halign: 'right' }
      },
      didParseCell: data => {
        const text = String(data.cell.raw || '')
        if (text.startsWith('CASH FLOW FROM') || text.startsWith('Net Cash') || text.startsWith('Net Increase')) {
          data.cell.styles.fontStyle = 'bold'
          data.cell.styles.fillColor = [248, 250, 252]
        }
      }
    })
  }

  // -------------------------------------------------------------------------
  // 4. STATUTORY RATIOS
  // -------------------------------------------------------------------------
  if (opt.includeRatios && ratios && ratios.length > 0) {
    const startY = renderSectionHeader(
      'SCHEDULE III STATUTORY FINANCIAL RATIOS',
      'Analytical Disclosures as mandated by March 2021 MCA Amendments'
    )

    const ratioBody = ratios.map((r, idx) => {
      const curStr = r.currentValue !== null ? r.currentValue.toFixed(2) : 'N/A'
      const prevStr = r.prevValue !== null ? r.prevValue.toFixed(2) : 'N/A'
      const varStr = r.variancePct !== null ? `${r.variancePct >= 0 ? '+' : ''}${r.variancePct.toFixed(1)}%` : 'N/A'
      const expStr = r.varianceExceeds25 ? (r.explanation || 'Variance > 25% (Explanation required)') : 'Normal variance (<25%)'

      return [`${idx + 1}.`, r.name, r.formulaDescription, curStr, prevStr, varStr, expStr]
    })

    autoTable(doc, {
      startY,
      margin: { left: 14, right: 14 },
      head: [['#', 'Ratio', 'Numerator / Denominator Basis', 'Current', 'Previous', '% Variance', 'Remarks / Reason for >25% Change']],
      body: ratioBody,
      theme: 'plain',
      styles: {
        fontSize: 7,
        cellPadding: { top: 2, bottom: 2, left: 1.5, right: 1.5 },
        font: 'helvetica',
        textColor: [30, 41, 59]
      },
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontStyle: 'bold',
        lineWidth: 0.2,
        lineColor: [203, 213, 225]
      },
      columnStyles: {
        0: { cellWidth: 10, fontStyle: 'bold' },
        1: { cellWidth: 36, fontStyle: 'bold' },
        2: { cellWidth: 42 },
        3: { cellWidth: 16, halign: 'right' },
        4: { cellWidth: 16, halign: 'right' },
        5: { cellWidth: 18, halign: 'right' },
        6: { cellWidth: 'auto' }
      }
    })
  }

  // -------------------------------------------------------------------------
  // 5. NOTES TO ACCOUNTS & 2021 DISCLOSURES
  // -------------------------------------------------------------------------
  if (opt.includeNotes) {
    const notesScope: 'all' | 'profit_loss' =
      (!opt.includeBalanceSheet && opt.includeProfitLoss) ? 'profit_loss' : 'all'

    const resolvedNotes = resolveAllStatutoryNotes({
      workspace,
      balanceSheetRows,
      plRows,
      scope: notesScope
    })

    if (resolvedNotes.length > 0) {
      let notesY = renderSectionHeader(
        'NOTES FORMING PART OF THE FINANCIAL STATEMENTS',
        'Significant Accounting Policies & Statutory Disclosures (Schedule III)'
      )

      for (const note of resolvedNotes) {
        if (!note || note.status === 'not_applicable') continue

        // Check if we need a new page
        if (notesY > pageHeight - 45) {
          doc.addPage()
          notesY = 22
        }

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.setTextColor(PDF_PALETTE.navy[0], PDF_PALETTE.navy[1], PDF_PALETTE.navy[2])
        doc.text(`Note ${note.noteNumber}: ${cleanPdfText(note.title)}`, 14, notesY)
        notesY += 4

        // Itemized breakdown table
        if (note.items && note.items.length > 0) {
          const itemRows = note.items.map(it => [
            cleanPdfText(it.label),
            formatCurrencyAmount(it.currentAmount, profile.presentationUnit),
            formatCurrencyAmount(it.prevAmount, profile.presentationUnit)
          ])

          autoTable(doc, {
            startY: notesY,
            margin: { left: 14, right: 14 },
            head: [['Particulars', 'Current Year', 'Previous Year']],
            body: itemRows,
            theme: 'plain',
            styles: { fontSize: 7, cellPadding: 1.5 },
            headStyles: { fillColor: [248, 250, 252], textColor: [15, 23, 42], fontStyle: 'bold' },
            columnStyles: {
              0: { cellWidth: 'auto' },
              1: { cellWidth: 32, halign: 'right' },
              2: { cellWidth: 32, halign: 'right' }
            }
          })
          notesY = (doc as any).lastAutoTable.finalY + 4
        }

        // Promoter shareholding disclosure
        if (note.promoterShareholding && note.promoterShareholding.length > 0) {
          if (notesY > pageHeight - 35) {
            doc.addPage()
            notesY = 22
          }
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(7.5)
          doc.setTextColor(PDF_PALETTE.blue[0], PDF_PALETTE.blue[1], PDF_PALETTE.blue[2])
          doc.text('Promoter Shareholding Disclosure (March 2021 Amendment):', 14, notesY)
          notesY += 3.5

          const promRows = note.promoterShareholding.map(p => [
            cleanPdfText(p.promoterName),
            p.sharesHeldCurrent.toLocaleString('en-IN'),
            `${p.percentageCurrent.toFixed(2)}%`,
            p.sharesHeldPrev.toLocaleString('en-IN'),
            `${p.percentagePrev.toFixed(2)}%`,
            `${p.pctChangeDuringYear >= 0 ? '+' : ''}${p.pctChangeDuringYear.toFixed(2)}%`
          ])

          autoTable(doc, {
            startY: notesY,
            margin: { left: 14, right: 14 },
            head: [['Promoter Name', 'Shares (Current)', '% Total', 'Shares (Prev)', '% Total', '% Change in Year']],
            body: promRows,
            theme: 'plain',
            styles: { fontSize: 7, cellPadding: 1.5 },
            headStyles: { fillColor: [248, 250, 252], textColor: [15, 23, 42], fontStyle: 'bold' }
          })
          notesY = (doc as any).lastAutoTable.finalY + 4
        }

        // Trade Payables Ageing
        if (note.tradePayablesAgeing && note.tradePayablesAgeing.length > 0) {
          if (notesY > pageHeight - 35) {
            doc.addPage()
            notesY = 22
          }
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(7.5)
          doc.setTextColor(PDF_PALETTE.blue[0], PDF_PALETTE.blue[1], PDF_PALETTE.blue[2])
          doc.text('Trade Payables Ageing Schedule (March 2021 Amendment):', 14, notesY)
          notesY += 3.5

          const tpAgeRows = note.tradePayablesAgeing.map(a => [
            cleanPdfText(a.category.toUpperCase().replace(/_/g, ' ')),
            formatCurrencyAmount(a.lessThan1Year, profile.presentationUnit),
            formatCurrencyAmount(a.oneToTwoYears, profile.presentationUnit),
            formatCurrencyAmount(a.twoToThreeYears, profile.presentationUnit),
            formatCurrencyAmount(a.moreThan3Years, profile.presentationUnit),
            formatCurrencyAmount(a.total, profile.presentationUnit)
          ])

          autoTable(doc, {
            startY: notesY,
            margin: { left: 14, right: 14 },
            head: [['Category', '< 1 Year', '1-2 Years', '2-3 Years', '> 3 Years', 'Total']],
            body: tpAgeRows,
            theme: 'plain',
            styles: { fontSize: 7, cellPadding: 1.5 },
            headStyles: { fillColor: [248, 250, 252], textColor: [15, 23, 42], fontStyle: 'bold' }
          })
          notesY = (doc as any).lastAutoTable.finalY + 4
        }

        // Capital Work-in-Progress (CWIP) Ageing (Note 15)
        if (note.cwipAgeing && note.cwipAgeing.length > 0) {
          if (notesY > pageHeight - 35) {
            doc.addPage()
            notesY = 22
          }
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(7.5)
          doc.setTextColor(PDF_PALETTE.blue[0], PDF_PALETTE.blue[1], PDF_PALETTE.blue[2])
          doc.text('CWIP Ageing Schedule (March 2021 Amendment):', 14, notesY)
          notesY += 3.5

          const cwipAgeRows = note.cwipAgeing.map(a => [
            cleanPdfText(a.status === 'in_progress' ? 'Projects in Progress' : 'Projects Temporarily Suspended'),
            formatCurrencyAmount(a.lessThan1Year, profile.presentationUnit),
            formatCurrencyAmount(a.oneToTwoYears, profile.presentationUnit),
            formatCurrencyAmount(a.twoToThreeYears, profile.presentationUnit),
            formatCurrencyAmount(a.moreThan3Years, profile.presentationUnit),
            formatCurrencyAmount(a.total, profile.presentationUnit)
          ])

          autoTable(doc, {
            startY: notesY,
            margin: { left: 14, right: 14 },
            head: [['CWIP Status', '< 1 Year', '1-2 Years', '2-3 Years', '> 3 Years', 'Total']],
            body: cwipAgeRows,
            theme: 'plain',
            styles: { fontSize: 7, cellPadding: 1.5 },
            headStyles: { fillColor: [248, 250, 252], textColor: [15, 23, 42], fontStyle: 'bold' }
          })
          notesY = (doc as any).lastAutoTable.finalY + 4
        }

        // Trade Receivables Ageing
        if (note.tradeReceivablesAgeing && note.tradeReceivablesAgeing.length > 0) {
          if (notesY > pageHeight - 35) {
            doc.addPage()
            notesY = 22
          }
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(7.5)
          doc.setTextColor(PDF_PALETTE.blue[0], PDF_PALETTE.blue[1], PDF_PALETTE.blue[2])
          doc.text('Trade Receivables Ageing Schedule (March 2021 Amendment):', 14, notesY)
          notesY += 3.5

          const trAgeRows = note.tradeReceivablesAgeing.map(a => [
            cleanPdfText(a.category.toUpperCase().replace(/_/g, ' ')),
            formatCurrencyAmount(a.lessThan6Months, profile.presentationUnit),
            formatCurrencyAmount(a.sixMonthsToOneYear, profile.presentationUnit),
            formatCurrencyAmount(a.oneToTwoYears, profile.presentationUnit),
            formatCurrencyAmount(a.twoToThreeYears, profile.presentationUnit),
            formatCurrencyAmount(a.moreThan3Years, profile.presentationUnit),
            formatCurrencyAmount(a.total, profile.presentationUnit)
          ])

          autoTable(doc, {
            startY: notesY,
            margin: { left: 14, right: 14 },
            head: [['Category', '< 6 Mos', '6m-1y', '1-2y', '2-3y', '> 3y', 'Total']],
            body: trAgeRows,
            theme: 'plain',
            styles: { fontSize: 7, cellPadding: 1.5 },
            headStyles: { fillColor: [248, 250, 252], textColor: [15, 23, 42], fontStyle: 'bold' }
          })
          notesY = (doc as any).lastAutoTable.finalY + 4
        }
      }
    }
  }

  // -------------------------------------------------------------------------
  // Page footers & Platform Attribution
  // -------------------------------------------------------------------------
  const totalPages = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(PDF_PALETTE.gray[0], PDF_PALETTE.gray[1], PDF_PALETTE.gray[2])

    // Top Right small brand header
    doc.text('CorpLawUpdates.in | Schedule III Preparation Aid', pageWidth - 14, 8, { align: 'right' })

    // Bottom Footer
    doc.text(
      'Prepared via CorpLawUpdates.in browser utility. Subject to professional verification and statutory audit under Companies Act, 2013.',
      14,
      pageHeight - 6
    )
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 14, pageHeight - 6, { align: 'right' })
  }

  return doc
}
