// lib/doc-generator/docx-compiler.ts
import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  UnderlineType,
  Packer,
} from 'docx';
import { AIDocumentModel } from './types';

// Legal Document Typography Settings
const FONT_FAMILY = 'Bookman Old Style';
const SIZE_TITLE = 28; // 14pt
const SIZE_SUBTITLE = 22; // 11pt
const SIZE_HEADING = 24; // 12pt Bold
const SIZE_BODY = 24; // 12pt
const SIZE_FOOTNOTE = 18; // 9pt
const LINE_SPACING = 360; // 1.5 spacing
const MARGIN_DXA = 1440; // 1 inch (72 pt * 20 dxa/pt)

// Printable area width for 8.5" page with 1" left & right margins = 9360 dxa
const PRINTABLE_WIDTH_DXA = 9360;
const COL_ITEM_WIDTH_DXA = 936;  // 10%
const COL_TITLE_WIDTH_DXA = 5616; // 60%
const COL_REF_WIDTH_DXA = 2808;   // 30%

/**
 * Sanitizes string inputs to prevent XML parsing errors in MS Word
 */
function cleanText(text: string | null | undefined): string {
  if (!text) return '';
  return String(text)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .trim();
}

/**
 * Programmatically compiles an AIDocumentModel AST into a binary DOCX Buffer.
 */
export async function compileDocxFromModel(model: AIDocumentModel): Promise<Buffer> {
  const children: any[] = [];

  // 1. Company Letterhead Header Block
  if (model.companyDetails) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: cleanText(model.companyDetails.name).toUpperCase(),
            bold: true,
            size: SIZE_TITLE,
            font: FONT_FAMILY,
          }),
        ],
      })
    );

    if (model.companyDetails.cin) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: `CIN: ${cleanText(model.companyDetails.cin)}`,
              size: SIZE_SUBTITLE,
              font: FONT_FAMILY,
              color: '444444',
            }),
          ],
        })
      );
    }

    if (model.companyDetails.registeredAddress) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
          children: [
            new TextRun({
              text: `Registered Office: ${cleanText(model.companyDetails.registeredAddress)}`,
              size: SIZE_SUBTITLE,
              font: FONT_FAMILY,
              color: '555555',
            }),
          ],
        })
      );
    }

    // Horizontal Divider Line
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 360 },
        children: [
          new TextRun({
            text: '_________________________________________________________________________________',
            size: 16,
            color: '888888',
          }),
        ],
      })
    );
  }

  // 2. Document Main Title
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 180 },
      children: [
        new TextRun({
          text: cleanText(model.documentTitle).toUpperCase(),
          bold: true,
          underline: { type: UnderlineType.SINGLE },
          size: SIZE_TITLE,
          font: FONT_FAMILY,
        }),
      ],
    })
  );

  // Subtitle / Act Reference
  if (model.subTitle) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 360 },
        children: [
          new TextRun({
            text: cleanText(model.subTitle),
            italics: true,
            size: SIZE_SUBTITLE,
            font: FONT_FAMILY,
            color: '333333',
          }),
        ],
      })
    );
  }

  // 3. Meeting Details Metadata Grid / Paragraph
  if (model.meetingDetails && (model.meetingDetails.date || model.meetingDetails.venue)) {
    const meetingMetaParts = [
      model.meetingDetails.serialNumber ? `Meeting Serial: ${cleanText(model.meetingDetails.serialNumber)}` : null,
      model.meetingDetails.date ? `Date: ${cleanText(model.meetingDetails.date)}` : null,
      model.meetingDetails.time ? `Time: ${cleanText(model.meetingDetails.time)}` : null,
      model.meetingDetails.venue ? `Venue: ${cleanText(model.meetingDetails.venue)}` : null,
    ].filter(Boolean);

    children.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 240, line: LINE_SPACING },
        children: [
          new TextRun({
            text: meetingMetaParts.join('  |  '),
            bold: true,
            size: SIZE_SUBTITLE,
            font: FONT_FAMILY,
          }),
        ],
      })
    );
  }

  // 4. Introductory Opening Text
  if (model.introductoryText) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.BOTH,
        spacing: { after: 240, line: LINE_SPACING },
        children: [
          new TextRun({
            text: cleanText(model.introductoryText),
            size: SIZE_BODY,
            font: FONT_FAMILY,
          }),
        ],
      })
    );
  }

  // 5. Agendas Table (If present, e.g., Notice of Board Meeting)
  if (model.agendas && model.agendas.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 240, after: 180 },
        children: [
          new TextRun({
            text: 'AGENDA OF BUSINESS TO BE TRANSACTED:',
            bold: true,
            underline: { type: UnderlineType.SINGLE },
            size: SIZE_HEADING,
            font: FONT_FAMILY,
          }),
        ],
      })
    );

    const tableRows = [
      new TableRow({
        children: [
          new TableCell({
            width: { size: COL_ITEM_WIDTH_DXA, type: WidthType.DXA },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: 'Item #', bold: true, font: FONT_FAMILY, size: SIZE_BODY })],
              }),
            ],
          }),
          new TableCell({
            width: { size: COL_TITLE_WIDTH_DXA, type: WidthType.DXA },
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [new TextRun({ text: 'Subject / Business Title', bold: true, font: FONT_FAMILY, size: SIZE_BODY })],
              }),
            ],
          }),
          new TableCell({
            width: { size: COL_REF_WIDTH_DXA, type: WidthType.DXA },
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [new TextRun({ text: 'Statutory Reference', bold: true, font: FONT_FAMILY, size: SIZE_BODY })],
              }),
            ],
          }),
        ],
      }),
      ...model.agendas.map(
        agenda =>
          new TableRow({
            children: [
              new TableCell({
                width: { size: COL_ITEM_WIDTH_DXA, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: `${agenda.itemNumber}.`, font: FONT_FAMILY, size: SIZE_BODY })],
                  }),
                ],
              }),
              new TableCell({
                width: { size: COL_TITLE_WIDTH_DXA, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.LEFT,
                    spacing: { after: 60 },
                    children: [new TextRun({ text: cleanText(agenda.title), bold: true, font: FONT_FAMILY, size: SIZE_BODY })],
                  }),
                  new Paragraph({
                    alignment: AlignmentType.BOTH,
                    children: [new TextRun({ text: cleanText(agenda.description), font: FONT_FAMILY, size: SIZE_SUBTITLE })],
                  }),
                ],
              }),
              new TableCell({
                width: { size: COL_REF_WIDTH_DXA, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.LEFT,
                    children: [
                      new TextRun({
                        text: cleanText(agenda.statutoryReference) || 'Companies Act, 2013',
                        italics: true,
                        font: FONT_FAMILY,
                        size: SIZE_FOOTNOTE,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          })
      ),
    ];

    children.push(
      new Table({
        width: { size: PRINTABLE_WIDTH_DXA, type: WidthType.DXA },
        rows: tableRows,
      })
    );

    children.push(new Paragraph({ spacing: { after: 240 } }));
  }

  // 6. Assembled Clause Sections
  if (model.sections && model.sections.length > 0) {
    for (const section of model.sections) {
      if (section.heading) {
        children.push(
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({
                text: cleanText(section.heading).toUpperCase(),
                bold: true,
                size: SIZE_HEADING,
                font: FONT_FAMILY,
              }),
            ],
          })
        );
      }

      for (const clause of section.clauses) {
        if (!clause || !clause.trim()) continue;
        children.push(
          new Paragraph({
            alignment: AlignmentType.BOTH,
            spacing: { after: 180, line: LINE_SPACING },
            children: [
              new TextRun({
                text: cleanText(clause),
                size: SIZE_BODY,
                font: FONT_FAMILY,
              }),
            ],
          })
        );
      }
    }
  }

  // 7. Concluding Certification Text
  if (model.concludingText) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.BOTH,
        spacing: { before: 240, after: 360, line: LINE_SPACING },
        children: [
          new TextRun({
            text: cleanText(model.concludingText),
            size: SIZE_BODY,
            font: FONT_FAMILY,
          }),
        ],
      })
    );
  }

  // 8. Signatory Box (Right Aligned)
  if (model.signatories && model.signatories.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 360, after: 120 },
        children: [
          new TextRun({
            text: `For and on behalf of ${cleanText(model.companyDetails?.name) || 'the Company'}`,
            bold: true,
            size: SIZE_BODY,
            font: FONT_FAMILY,
          }),
        ],
      })
    );

    for (const sig of model.signatories) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { before: 480, after: 60 },
          children: [
            new TextRun({
              text: '____________________________________',
              size: SIZE_BODY,
              color: '666666',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: `(${cleanText(sig.name)})`,
              bold: true,
              size: SIZE_BODY,
              font: FONT_FAMILY,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { after: 180 },
          children: [
            new TextRun({
              text: `${cleanText(sig.designation)}${sig.dinOrPan ? ` (DIN/PAN: ${cleanText(sig.dinOrPan)})` : ''}`,
              size: SIZE_SUBTITLE,
              font: FONT_FAMILY,
            }),
          ],
        })
      );
    }
  }

  // 9. Statutory Citations & Compliance Notes Footnote Section
  if (model.statutoryCitations?.length || model.complianceNotes?.length) {
    children.push(
      new Paragraph({
        spacing: { before: 480, after: 120 },
        children: [
          new TextRun({
            text: '_________________________________________________________________________________',
            size: 16,
            color: 'CCCCCC',
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 120, after: 60 },
        children: [
          new TextRun({
            text: 'STATUTORY COMPLIANCE & LEGAL CITATIONS:',
            bold: true,
            size: SIZE_FOOTNOTE,
            font: FONT_FAMILY,
            color: '666666',
          }),
        ],
      })
    );

    if (model.statutoryCitations) {
      for (const citation of model.statutoryCitations) {
        if (!citation) continue;
        children.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: `• Statutory Authority: ${cleanText(citation)}`,
                size: SIZE_FOOTNOTE,
                font: FONT_FAMILY,
                color: '555555',
              }),
            ],
          })
        );
      }
    }

    if (model.complianceNotes) {
      for (const note of model.complianceNotes) {
        if (!note) continue;
        children.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: `• Mandatory Filing Note: ${cleanText(note)}`,
                size: SIZE_FOOTNOTE,
                font: FONT_FAMILY,
                color: '555555',
                italics: true,
              }),
            ],
          })
        );
      }
    }
  }

  // Construct Document Object
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: MARGIN_DXA,
              bottom: MARGIN_DXA,
              left: MARGIN_DXA,
              right: MARGIN_DXA,
            },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
