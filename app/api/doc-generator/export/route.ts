// app/api/doc-generator/export/route.ts
import { NextResponse } from 'next/server';
import { compileDocxFromModel } from '@/lib/doc-generator/docx-compiler';
import { AIDocumentModel } from '@/lib/doc-generator/types';

export async function POST(req: Request) {
  try {
    const { model }: { model: AIDocumentModel } = await req.json();

    if (!model || !model.documentTitle) {
      return NextResponse.json(
        { error: 'Invalid document model provided for DOCX export.' },
        { status: 400 }
      );
    }

    console.log(`[API /doc-generator/export] Compiling DOCX for: "${model.documentTitle}"...`);

    const docxBuffer = await compileDocxFromModel(model);
    const uint8Array = new Uint8Array(docxBuffer);

    // Sanitize filename
    const safeTitle = model.documentTitle
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 50);
    const filename = `${safeTitle || 'Document'}_CorpLawUpdates.docx`;

    return new Response(uint8Array, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': uint8Array.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('[API /doc-generator/export] Error exporting DOCX:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to export DOCX file.' },
      { status: 500 }
    );
  }
}
