import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  AlignmentType,
  PageBreak
} from 'docx'
import {
  WorkspaceState,
  StatementRowValue,
  CashFlowStatementResult,
  RatioResult,
  NoteSchedule
} from '../types'
import { formatCurrencyAmount } from '../calculations'
import { resolveAllStatutoryNotes } from '../canonical-notes'

export interface DocxExportOptions {
  includeBalanceSheet?: boolean
  includeProfitLoss?: boolean
  includeCashFlow?: boolean
  includeNotes?: boolean
  includeRatios?: boolean
}

export async function generateFinancialStatementsDocxBlob(params: {
  workspace: WorkspaceState
  balanceSheetRows: StatementRowValue[]
  plRows: StatementRowValue[]
  cashFlowResult?: CashFlowStatementResult
  ratios?: RatioResult[]
  options?: DocxExportOptions
}): Promise<Blob> {
  const { workspace, balanceSheetRows, plRows, cashFlowResult, ratios, options } = params
  const { profile } = workspace

  const companyName = profile.companyName.trim() || 'XYZ COMPANY PRIVATE LIMITED'
  const unitLabel = `(Amounts in INR ${profile.presentationUnit.toUpperCase()})`

  // Default options based on what's provided
  const opt: DocxExportOptions = {
    includeBalanceSheet: options?.includeBalanceSheet ?? true,
    includeProfitLoss: options?.includeProfitLoss ?? true,
    includeCashFlow: options?.includeCashFlow ?? (cashFlowResult !== undefined),
    includeNotes: options?.includeNotes ?? true,
    includeRatios: options?.includeRatios ?? (ratios !== undefined && ratios.length > 0)
  }

  const children: (Paragraph | Table)[] = []

  // Helper to create header paragraphs
  const createTitleBlock = (statementTitle: string, subtitle: string) => [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 80 },
      children: [
        new TextRun({
          text: companyName.toUpperCase(),
          bold: true,
          size: 26,
          font: 'Calibri'
        })
      ]
    }),
    ...(profile.cin || profile.registeredOffice
      ? [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: [profile.cin ? `CIN: ${profile.cin}` : null, profile.registeredOffice || null]
                  .filter(Boolean)
                  .join(' | '),
                size: 16,
                font: 'Calibri',
                color: '64748B'
              })
            ]
          })
        ]
      : []),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: statementTitle,
          bold: true,
          size: 22,
          font: 'Calibri',
          color: '1E3A8A'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `${subtitle} | ${unitLabel}`,
          italics: true,
          size: 18,
          font: 'Calibri',
          color: '64748B'
        })
      ]
    })
  ]

  let isFirstSection = true

  const appendPageBreakIfNeeded = () => {
    if (!isFirstSection) {
      children.push(
        new Paragraph({
          children: [new PageBreak()]
        })
      )
    }
    isFirstSection = false
  }

  // ---------------------------------------------------------------------------
  // 1. BALANCE SHEET TABLE
  // ---------------------------------------------------------------------------
  if (opt.includeBalanceSheet && balanceSheetRows.length > 0) {
    appendPageBreakIfNeeded()
    children.push(...createTitleBlock('BALANCE SHEET', `As at ${profile.financialYearEnd || '31st March 2026'}`))

    const bsHeaderRow = new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: 10, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: 'Ref', bold: true, size: 18 })] })]
        }),
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: 'Particulars', bold: true, size: 18 })] })]
        }),
        new TableCell({
          width: { size: 10, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Note', bold: true, size: 18 })] })]
        }),
        new TableCell({
          width: { size: 15, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `As at ${profile.financialYearEnd || 'Current Year'}`, bold: true, size: 18 })] })]
        }),
        new TableCell({
          width: { size: 15, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `As at ${profile.comparativeYearEnd || 'Prev Year'}`, bold: true, size: 18 })] })]
        })
      ]
    })

    const bsTableRows = [
      bsHeaderRow,
      ...balanceSheetRows.map(r => {
        const isSpecial = r.isGrandTotal || r.isSubtotal
        const indent = r.level === 1 ? '' : r.level === 2 ? '  ' : '    '
        return new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: r.code, bold: isSpecial, size: 18 })] })]
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: indent + r.label, bold: isSpecial, size: 18 })] })]
            }),
            new TableCell({
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: r.noteNumber && !isSpecial ? String(r.noteNumber) : '', size: 18 })] })]
            }),
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({
                      text: formatCurrencyAmount(r.currentAmount, profile.presentationUnit),
                      bold: isSpecial,
                      size: 18
                    })
                  ]
                })
              ]
            }),
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({
                      text: formatCurrencyAmount(r.prevAmount, profile.presentationUnit),
                      bold: isSpecial,
                      size: 18
                    })
                  ]
                })
              ]
            })
          ]
        })
      })
    ]

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: bsTableRows
      })
    )
  }

  // ---------------------------------------------------------------------------
  // 2. PROFIT AND LOSS TABLE
  // ---------------------------------------------------------------------------
  if (opt.includeProfitLoss && plRows.length > 0) {
    appendPageBreakIfNeeded()
    children.push(...createTitleBlock('STATEMENT OF PROFIT AND LOSS', `For the year ended ${profile.financialYearEnd || '31st March 2026'}`))

    const plHeaderRow = new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: 10, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: 'Ref', bold: true, size: 18 })] })]
        }),
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: 'Particulars', bold: true, size: 18 })] })]
        }),
        new TableCell({
          width: { size: 10, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Note', bold: true, size: 18 })] })]
        }),
        new TableCell({
          width: { size: 15, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `Year ended ${profile.financialYearEnd || 'Current Year'}`, bold: true, size: 18 })] })]
        }),
        new TableCell({
          width: { size: 15, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `Year ended ${profile.comparativeYearEnd || 'Prev Year'}`, bold: true, size: 18 })] })]
        })
      ]
    })

    const plTableRows = [
      plHeaderRow,
      ...plRows.map(r => {
        const isSpecial = r.isGrandTotal || r.isSubtotal
        const indent = r.level === 1 ? '' : r.level === 2 ? '  ' : '    '
        return new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: r.code, bold: isSpecial, size: 18 })] })]
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: indent + r.label, bold: isSpecial, size: 18 })] })]
            }),
            new TableCell({
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: r.noteNumber && !isSpecial ? String(r.noteNumber) : '', size: 18 })] })]
            }),
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({
                      text: formatCurrencyAmount(r.currentAmount, profile.presentationUnit),
                      bold: isSpecial,
                      size: 18
                    })
                  ]
                })
              ]
            }),
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({
                      text: formatCurrencyAmount(r.prevAmount, profile.presentationUnit),
                      bold: isSpecial,
                      size: 18
                    })
                  ]
                })
              ]
            })
          ]
        })
      })
    ]

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: plTableRows
      })
    )
  }

  // ---------------------------------------------------------------------------
  // 3. CASH FLOW STATEMENT (INDIRECT METHOD)
  // ---------------------------------------------------------------------------
  if (opt.includeCashFlow && cashFlowResult) {
    appendPageBreakIfNeeded()
    children.push(
      ...createTitleBlock(
        'CASH FLOW STATEMENT (INDIRECT METHOD)',
        `For the year ended ${profile.financialYearEnd || '31st March 2026'} (In accordance with AS-3 / Ind AS 7)`
      )
    )

    const cfs = cashFlowResult
    const cfsEntries: Array<{ ref: string; label: string; amt: number | null; isHeader?: boolean; isTotal?: boolean }> = [
      { ref: 'A.', label: 'CASH FLOW FROM OPERATING ACTIVITIES', amt: null, isHeader: true },
      { ref: '', label: 'Profit / (Loss) Before Tax', amt: cfs.operatingActivities.profitBeforeTax },
      { ref: '', label: 'Adjustments for Non-Cash / Non-Operating Items', amt: cfs.operatingActivities.adjustmentsForNonCash },
      { ref: '', label: 'Operating Profit Before Working Capital Changes', amt: cfs.operatingActivities.operatingProfitBeforeWorkingCapital, isTotal: true },
      { ref: '', label: 'Movement in Working Capital', amt: cfs.operatingActivities.workingCapitalChanges },
      { ref: '', label: 'Cash Generated from Operations', amt: cfs.operatingActivities.cashGeneratedFromOperations, isTotal: true },
      { ref: '', label: 'Less: Direct Taxes Paid', amt: -cfs.operatingActivities.directTaxesPaid },
      { ref: '', label: 'Net Cash Generated from Operating Activities (A)', amt: cfs.operatingActivities.netCashFromOperating, isTotal: true },

      { ref: 'B.', label: 'CASH FLOW FROM INVESTING ACTIVITIES', amt: null, isHeader: true },
      { ref: '', label: 'Purchase of Property, Plant & Equipment (PPE)', amt: -cfs.investingActivities.purchaseOfPPE },
      { ref: '', label: 'Proceeds from Sale of PPE', amt: cfs.investingActivities.saleOfPPE },
      { ref: '', label: 'Purchase of Investments', amt: -cfs.investingActivities.purchaseOfInvestments },
      { ref: '', label: 'Proceeds from Sale of Investments', amt: cfs.investingActivities.saleOfInvestments },
      { ref: '', label: 'Interest & Dividends Received', amt: cfs.investingActivities.interestReceived + cfs.investingActivities.dividendsReceived },
      { ref: '', label: 'Net Cash Used in Investing Activities (B)', amt: cfs.investingActivities.netCashFromInvesting, isTotal: true },

      { ref: 'C.', label: 'CASH FLOW FROM FINANCING ACTIVITIES', amt: null, isHeader: true },
      { ref: '', label: 'Proceeds from Issue of Share Capital', amt: cfs.financingActivities.proceedsFromShareCapital },
      { ref: '', label: 'Proceeds from Long-Term / Short-Term Borrowings', amt: cfs.financingActivities.proceedsFromBorrowings },
      { ref: '', label: 'Repayment of Borrowings', amt: -cfs.financingActivities.repaymentOfBorrowings },
      { ref: '', label: 'Finance Costs & Dividends Paid', amt: -cfs.financingActivities.interestPaid - cfs.financingActivities.dividendsPaid },
      { ref: '', label: 'Net Cash Used in Financing Activities (C)', amt: cfs.financingActivities.netCashFromFinancing, isTotal: true },

      { ref: 'D.', label: 'Net Increase / (Decrease) in Cash & Cash Equivalents (A + B + C)', amt: cfs.netIncreaseInCash, isTotal: true },
      { ref: 'E.', label: 'Cash & Cash Equivalents at Beginning of Year', amt: cfs.openingCash },
      { ref: 'F.', label: 'Cash & Cash Equivalents at End of Year (Calculated)', amt: cfs.closingCashCalculated, isTotal: true },
      { ref: 'G.', label: 'Cash & Cash Equivalents as per Balance Sheet (Note 24)', amt: cfs.closingCashBalanceSheet, isTotal: true }
    ]

    const cfHeaderRow = new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: 10, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: 'Ref', bold: true, size: 18 })] })]
        }),
        new TableCell({
          width: { size: 65, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: 'Particulars', bold: true, size: 18 })] })]
        }),
        new TableCell({
          width: { size: 25, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `Amount (${profile.presentationUnit.toUpperCase()})`, bold: true, size: 18 })] })]
        })
      ]
    })

    const cfTableRows = [
      cfHeaderRow,
      ...cfsEntries.map(entry => {
        const isBold = entry.isHeader || entry.isTotal
        const amtStr = entry.amt !== null ? formatCurrencyAmount(entry.amt, profile.presentationUnit) : ''
        return new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: entry.ref, bold: isBold, size: 18 })] })]
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: (entry.ref ? '' : '  ') + entry.label, bold: isBold, size: 18 })]
                })
              ]
            }),
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [new TextRun({ text: amtStr, bold: isBold, size: 18 })]
                })
              ]
            })
          ]
        })
      })
    ]

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: cfTableRows
      })
    )
  }

  // ---------------------------------------------------------------------------
  // 4. SCHEDULE III ANALYTICAL RATIOS
  // ---------------------------------------------------------------------------
  if (opt.includeRatios && ratios && ratios.length > 0) {
    appendPageBreakIfNeeded()
    children.push(
      ...createTitleBlock(
        'SCHEDULE III ANALYTICAL RATIOS',
        'Analytical Disclosures as Mandated by March 2021 MCA Amendments'
      )
    )

    const ratioHeaderRow = new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: 5, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: '#', bold: true, size: 16 })] })]
        }),
        new TableCell({
          width: { size: 25, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: 'Ratio Name', bold: true, size: 16 })] })]
        }),
        new TableCell({
          width: { size: 25, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: 'Numerator / Denominator Basis', bold: true, size: 16 })] })]
        }),
        new TableCell({
          width: { size: 10, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Current', bold: true, size: 16 })] })]
        }),
        new TableCell({
          width: { size: 10, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Previous', bold: true, size: 16 })] })]
        }),
        new TableCell({
          width: { size: 10, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: '% Variance', bold: true, size: 16 })] })]
        }),
        new TableCell({
          width: { size: 15, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: 'Remarks / Reason', bold: true, size: 16 })] })]
        })
      ]
    })

    const ratioRows = [
      ratioHeaderRow,
      ...ratios.map((r, idx) => {
        const curStr = r.currentValue !== null ? r.currentValue.toFixed(2) : 'N/A'
        const prevStr = r.prevValue !== null ? r.prevValue.toFixed(2) : 'N/A'
        const varStr = r.variancePct !== null ? `${r.variancePct >= 0 ? '+' : ''}${r.variancePct.toFixed(1)}%` : 'N/A'
        const expStr = r.varianceExceeds25 ? (r.explanation || 'Variance > 25% (Explanation required)') : 'Normal variance (<25%)'

        return new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${idx + 1}`, size: 16 })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: r.name, bold: true, size: 16 })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: r.formulaDescription, size: 16 })] })] }),
            new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: curStr, size: 16 })] })] }),
            new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: prevStr, size: 16 })] })] }),
            new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: varStr, size: 16 })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: expStr, size: 16 })] })] })
          ]
        })
      })
    ]

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: ratioRows
      })
    )
  }

  // ---------------------------------------------------------------------------
  // 5. NOTES TO ACCOUNTS & STATUTORY DISCLOSURES (NOTES 1-39)
  // ---------------------------------------------------------------------------
  if (opt.includeNotes) {
    appendPageBreakIfNeeded()
    children.push(
      ...createTitleBlock(
        'NOTES FORMING PART OF THE FINANCIAL STATEMENTS',
        'Significant Accounting Policies & Statutory Disclosures (Schedule III)'
      )
    )

    const notesScope: 'all' | 'profit_loss' =
      (!opt.includeBalanceSheet && opt.includeProfitLoss) ? 'profit_loss' : 'all'

    const resolvedNotes = resolveAllStatutoryNotes({
      workspace,
      balanceSheetRows,
      plRows,
      scope: notesScope
    })

    for (const note of resolvedNotes) {
      if (!note || note.status === 'not_applicable') continue

      // Note Title
      children.push(
        new Paragraph({
          spacing: { before: 240, after: 100 },
          children: [
            new TextRun({
              text: `Note ${note.noteNumber}: ${note.title}`,
              bold: true,
              size: 20,
              color: '1E3A8A'
            })
          ]
        })
      )

      // Narrative text if present
      if (note.narrativeText) {
        children.push(
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: note.narrativeText,
                italics: true,
                size: 18,
                color: '334155'
              })
            ]
          })
        )
      }

      // Breakdown Items Table
      if (note.items && note.items.length > 0) {
        const itemHeaderRow = new TableRow({
          tableHeader: true,
          children: [
            new TableCell({
              width: { size: 60, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: 'Particulars', bold: true, size: 18 })] })]
            }),
            new TableCell({
              width: { size: 20, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `As at ${profile.financialYearEnd || 'Current Year'}`, bold: true, size: 18 })] })]
            }),
            new TableCell({
              width: { size: 20, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `As at ${profile.comparativeYearEnd || 'Previous Year'}`, bold: true, size: 18 })] })]
            })
          ]
        })

        const itemRows = note.items.map(it => {
          return new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: it.label, size: 18 })] })]
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [new TextRun({ text: formatCurrencyAmount(it.currentAmount, profile.presentationUnit), size: 18 })]
                  })
                ]
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [new TextRun({ text: formatCurrencyAmount(it.prevAmount, profile.presentationUnit), size: 18 })]
                  })
                ]
              })
            ]
          })
        })

        // Subtotal / Total row
        const curSum = note.items.reduce((s, it) => s + (it.currentAmount || 0), 0)
        const prevSum = note.items.reduce((s, it) => s + (it.prevAmount || 0), 0)
        const totalRow = new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: `Total Note ${note.noteNumber}`, bold: true, size: 18 })] })]
            }),
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [new TextRun({ text: formatCurrencyAmount(curSum, profile.presentationUnit), bold: true, size: 18 })]
                })
              ]
            }),
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [new TextRun({ text: formatCurrencyAmount(prevSum, profile.presentationUnit), bold: true, size: 18 })]
                })
              ]
            })
          ]
        })

        children.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [itemHeaderRow, ...itemRows, totalRow]
          })
        )
      }

      // Promoter Shareholding Disclosure (Note 1)
      if (note.promoterShareholding && note.promoterShareholding.length > 0) {
        children.push(
          new Paragraph({
            spacing: { before: 140, after: 80 },
            children: [
              new TextRun({
                text: 'Details of Shares Held by Promoters:',
                bold: true,
                size: 18,
                color: '334155'
              })
            ]
          })
        )

        const pHeader = new TableRow({
          tableHeader: true,
          children: [
            new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Promoter Name', bold: true, size: 16 })] })] }),
            new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Shares (Cur)', bold: true, size: 16 })] })] }),
            new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: '% (Cur)', bold: true, size: 16 })] })] }),
            new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Shares (Prev)', bold: true, size: 16 })] })] }),
            new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: '% (Prev)', bold: true, size: 16 })] })] }),
            new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: '% Change', bold: true, size: 16 })] })] })
          ]
        })

        const pRows = note.promoterShareholding.map(pr => new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: pr.promoterName, size: 16 })] })] }),
            new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: (pr.sharesHeldCurrent || 0).toLocaleString('en-IN'), size: 16 })] })] }),
            new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `${(pr.percentageCurrent || 0).toFixed(2)}%`, size: 16 })] })] }),
            new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: (pr.sharesHeldPrev || 0).toLocaleString('en-IN'), size: 16 })] })] }),
            new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `${(pr.percentagePrev || 0).toFixed(2)}%`, size: 16 })] })] }),
            new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `${(pr.pctChangeDuringYear || 0).toFixed(2)}%`, size: 16 })] })] })
          ]
        }))

        children.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [pHeader, ...pRows]
          })
        )
      }

      // Trade Payables Ageing Schedule (Note 10)
      if (note.tradePayablesAgeing && note.tradePayablesAgeing.length > 0) {
        children.push(
          new Paragraph({
            spacing: { before: 140, after: 80 },
            children: [
              new TextRun({
                text: 'Trade Payables Ageing Schedule:',
                bold: true,
                size: 18,
                color: '334155'
              })
            ]
          })
        )

        const tpHeader = new TableRow({
          tableHeader: true,
          children: [
            new TableCell({ width: { size: 28, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Category', bold: true, size: 16 })] })] }),
            new TableCell({ width: { size: 14, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: '< 1 Year', bold: true, size: 16 })] })] }),
            new TableCell({ width: { size: 14, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: '1-2 Years', bold: true, size: 16 })] })] }),
            new TableCell({ width: { size: 14, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: '2-3 Years', bold: true, size: 16 })] })] }),
            new TableCell({ width: { size: 14, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: '> 3 Years', bold: true, size: 16 })] })] }),
            new TableCell({ width: { size: 16, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Total', bold: true, size: 16 })] })] })
          ]
        })

        const tpRows = note.tradePayablesAgeing.map(r => new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: r.category.toUpperCase().replace('_', ' '), size: 16 })] })] }),
            new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatCurrencyAmount(r.lessThan1Year, profile.presentationUnit), size: 16 })] })] }),
            new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatCurrencyAmount(r.oneToTwoYears, profile.presentationUnit), size: 16 })] })] }),
            new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatCurrencyAmount(r.twoToThreeYears, profile.presentationUnit), size: 16 })] })] }),
            new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatCurrencyAmount(r.moreThan3Years, profile.presentationUnit), size: 16 })] })] }),
            new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatCurrencyAmount(r.total, profile.presentationUnit), bold: true, size: 16 })] })] })
          ]
        }))

        children.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [tpHeader, ...tpRows]
          })
        )
      }

      // Trade Receivables Ageing Schedule (Note 23)
      if (note.tradeReceivablesAgeing && note.tradeReceivablesAgeing.length > 0) {
        children.push(
          new Paragraph({
            spacing: { before: 140, after: 80 },
            children: [
              new TextRun({
                text: 'Trade Receivables Ageing Schedule:',
                bold: true,
                size: 18,
                color: '334155'
              })
            ]
          })
        )

        const trHeader = new TableRow({
          tableHeader: true,
          children: [
            new TableCell({ width: { size: 28, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Category', bold: true, size: 16 })] })] }),
            new TableCell({ width: { size: 14, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: '< 6 Months', bold: true, size: 16 })] })] }),
            new TableCell({ width: { size: 14, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: '6m-1yr', bold: true, size: 16 })] })] }),
            new TableCell({ width: { size: 14, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: '1-2 Years', bold: true, size: 16 })] })] }),
            new TableCell({ width: { size: 14, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: '> 3 Years', bold: true, size: 16 })] })] }),
            new TableCell({ width: { size: 16, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Total', bold: true, size: 16 })] })] })
          ]
        })

        const trRows = note.tradeReceivablesAgeing.map(r => new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: r.category.toUpperCase().replace('_', ' '), size: 16 })] })] }),
            new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatCurrencyAmount(r.lessThan6Months, profile.presentationUnit), size: 16 })] })] }),
            new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatCurrencyAmount(r.sixMonthsToOneYear, profile.presentationUnit), size: 16 })] })] }),
            new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatCurrencyAmount(r.oneToTwoYears, profile.presentationUnit), size: 16 })] })] }),
            new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatCurrencyAmount(r.moreThan3Years, profile.presentationUnit), size: 16 })] })] }),
            new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatCurrencyAmount(r.total, profile.presentationUnit), bold: true, size: 16 })] })] })
          ]
        }))

        children.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [trHeader, ...trRows]
          })
        )
      }

      // CWIP Ageing Schedule (Note 15)
      if (note.cwipAgeing && note.cwipAgeing.length > 0) {
        children.push(
          new Paragraph({
            spacing: { before: 140, after: 80 },
            children: [
              new TextRun({
                text: 'Capital Work-in-Progress (CWIP) Ageing Schedule:',
                bold: true,
                size: 18,
                color: '334155'
              })
            ]
          })
        )

        const cwipHeader = new TableRow({
          tableHeader: true,
          children: [
            new TableCell({ width: { size: 28, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Status', bold: true, size: 16 })] })] }),
            new TableCell({ width: { size: 14, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: '< 1 Year', bold: true, size: 16 })] })] }),
            new TableCell({ width: { size: 14, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: '1-2 Years', bold: true, size: 16 })] })] }),
            new TableCell({ width: { size: 14, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: '2-3 Years', bold: true, size: 16 })] })] }),
            new TableCell({ width: { size: 14, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: '> 3 Years', bold: true, size: 16 })] })] }),
            new TableCell({ width: { size: 16, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Total', bold: true, size: 16 })] })] })
          ]
        })

        const cwipRows = note.cwipAgeing.map(r => new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: r.status.toUpperCase().replace('_', ' '), size: 16 })] })] }),
            new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatCurrencyAmount(r.lessThan1Year, profile.presentationUnit), size: 16 })] })] }),
            new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatCurrencyAmount(r.oneToTwoYears, profile.presentationUnit), size: 16 })] })] }),
            new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatCurrencyAmount(r.twoToThreeYears, profile.presentationUnit), size: 16 })] })] }),
            new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatCurrencyAmount(r.moreThan3Years, profile.presentationUnit), size: 16 })] })] }),
            new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatCurrencyAmount(r.total, profile.presentationUnit), bold: true, size: 16 })] })] })
          ]
        }))

        children.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [cwipHeader, ...cwipRows]
          })
        )
      }
    }
  }

  // Footer Disclaimer
  children.push(
    new Paragraph({ spacing: { before: 400 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'Prepared with CorpLawUpdates.in browser-based preparation aid. Subject to statutory audit.',
          italics: true,
          size: 16,
          color: '94A3B8'
        })
      ]
    })
  )

  const doc = new Document({
    sections: [
      {
        properties: {},
        children
      }
    ]
  })

  return await Packer.toBlob(doc)
}
