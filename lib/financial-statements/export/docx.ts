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
  BorderStyle
} from 'docx'
import {
  WorkspaceState,
  StatementRowValue,
  CashFlowStatementResult,
  RatioResult
} from '../types'
import { formatCurrencyAmount } from '../calculations'

export async function generateFinancialStatementsDocxBlob(params: {
  workspace: WorkspaceState
  balanceSheetRows: StatementRowValue[]
  plRows: StatementRowValue[]
  cashFlowResult?: CashFlowStatementResult
  ratios?: RatioResult[]
}): Promise<Blob> {
  const { workspace, balanceSheetRows, plRows, cashFlowResult, ratios } = params
  const { profile, notes } = workspace

  const companyName = profile.companyName.trim() || 'XYZ COMPANY PRIVATE LIMITED'
  const unitLabel = `(Amounts in INR ${profile.presentationUnit.toUpperCase()})`

  const sections: any[] = []

  // Helper to create header paragraphs
  const createTitleBlock = (statementTitle: string, subtitle: string) => [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: companyName.toUpperCase(),
          bold: true,
          size: 26,
          font: 'Calibri'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
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

  // 1. Balance Sheet Table
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

  const balanceSheetTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: bsTableRows
  })

  // 2. Profit and Loss Table
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

  const plTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: plTableRows
  })

  // Assemble document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          ...createTitleBlock('BALANCE SHEET', `As at ${profile.financialYearEnd || '31st March 2026'}`),
          balanceSheetTable,
          new Paragraph({ spacing: { before: 400 } }),
          ...createTitleBlock('STATEMENT OF PROFIT AND LOSS', `For the year ended ${profile.financialYearEnd || '31st March 2026'}`),
          plTable,
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
        ]
      }
    ]
  })

  return await Packer.toBlob(doc)
}
