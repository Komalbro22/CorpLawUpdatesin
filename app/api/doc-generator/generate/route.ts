// app/api/doc-generator/generate/route.ts
import { NextResponse } from 'next/server';
import { generateAIDocumentModel } from '@/lib/doc-generator/ai-engine';
import { DocumentGenerationPayload } from '@/lib/doc-generator/types';

export const maxDuration = 60; // 60 seconds max duration for Gemini generation

export async function POST(req: Request) {
  try {
    const payload: DocumentGenerationPayload = await req.json();

    if (!payload.docType || !payload.company?.companyName) {
      return NextResponse.json(
        { error: 'Missing required document type or company name.' },
        { status: 400 }
      );
    }

    console.log(`[API /doc-generator/generate] Generating ${payload.docType} for ${payload.company.companyName}...`);

    const model = await generateAIDocumentModel(payload);

    return NextResponse.json({ success: true, model });
  } catch (error: any) {
    console.error('[API /doc-generator/generate] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate AI document model.' },
      { status: 500 }
    );
  }
}
