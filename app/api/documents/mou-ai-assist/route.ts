import { NextResponse } from 'next/server'
import { MouType } from '@/lib/doc-generator/mou-generator'

import { parseGeminiJson, requestGeminiGenerateContent } from '@/lib/gemini'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { purposePrompt, currentData } = body as {
      purposePrompt: string
      currentData?: any
    }

    if (!purposePrompt || typeof purposePrompt !== 'string' || purposePrompt.trim().length < 5) {
      return NextResponse.json(
        { error: 'Please provide a clear description of your collaboration purpose.' },
        { status: 400 }
      )
    }

    const systemPrompt = `You are a Senior Indian Corporate Lawyer and Contracts Specialist.
The user wants to draft a formal Memorandum of Understanding (MoU) under Indian Law (Indian Contract Act, 1872).
The user will provide a plain English description of what they want to collaborate on.

Your task is to analyze this purpose and return a pristine, structured JSON object with the following fields:
{
  "mouType": "business_partnership" | "joint_venture" | "vendor_services" | "research_tech" | "startup_founders" | "inter_company",
  "title": "MEMORANDUM OF UNDERSTANDING FOR [UPPERCASE SPECIFIC TITLE]",
  "collaborationPurpose": "Concise, professional 2-3 sentence legal statement of mutual purpose",
  "scopeOfWork": "Detailed operational scope of collaboration",
  "suggestedPartyAName": "Extracted or logical company/entity name for Party A",
  "suggestedPartyBName": "Extracted or logical company/entity name for Party B",
  "partyARole": "e.g. Technology Provider / Developer / Manufacturer",
  "partyBRole": "e.g. Distribution Partner / Client / Research Partner",
  "obligationsPartyA": ["Array of 4-5 specific, actionable legal and operational obligations for Party A"],
  "obligationsPartyB": ["Array of 4-5 specific, actionable legal and operational obligations for Party B"],
  "financialTermsDescription": "Specific revenue sharing, fee, royalty, or cost-bearing clause matching the prompt",
  "intellectualPropertyTerms": "Precise clause on IP ownership (pre-existing vs created under collaboration)",
  "exclusivityTerms": "Clear exclusivity or non-compete clause (or non-exclusive if appropriate)",
  "validityDuration": "e.g. '12 (Twelve) Months' or '24 (Twenty Four) Months'"
}

Rules:
1. Ensure all terminology adheres strictly to Indian legal drafting standards.
2. Keep clauses realistic, balanced, and commercially practical.
3. Return ONLY valid JSON, with no markdown code fences or conversational text.`

    const aiResponse = await requestGeminiGenerateContent({
      contents: [
        {
          parts: [
            {
              text: `${systemPrompt}\n\nUser Description of Collaboration Purpose:\n"${purposePrompt.trim()}"\n\nExisting Draft Context (if any):\n${JSON.stringify(
                currentData || {}
              )}`,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
      },
      label: 'MoU AI Assist',
    })

    const result = parseGeminiJson(aiResponse.text)

    return NextResponse.json({ success: true, data: result }, { status: 200 })
  } catch (err: any) {
    console.error('MoU AI assist route error:', err)
    return NextResponse.json(
      { error: 'AI assist failed to process purpose', details: err?.message },
      { status: 500 }
    )
  }
}
