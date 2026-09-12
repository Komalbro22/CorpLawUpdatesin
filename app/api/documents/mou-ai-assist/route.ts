import { NextResponse } from 'next/server'
import { MouType } from '@/lib/doc-generator/mou-generator'

export const dynamic = 'force-dynamic'

async function runWithKeyRotation<T>(fn: (apiKey: string) => Promise<T>): Promise<T> {
  const keys = [
    process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '',
    process.env.GOOGLE_GEMINI_API_KEY_2 || '',
    process.env.GOOGLE_GEMINI_API_KEY_3 || '',
    process.env.GOOGLE_GEMINI_API_KEY_4 || '',
  ]
    .map(k => k.trim())
    .filter(Boolean)

  if (keys.length === 0) {
    throw new Error('No Gemini API keys configured in environment variables.')
  }

  let lastError: any = null
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    try {
      return await fn(key)
    } catch (err: any) {
      console.warn(`[MoU AI Assist] Request failed with key index ${i}:`, err.message || err)
      lastError = err
      const isQuotaError =
        err.message?.includes('429') ||
        err.message?.includes('403') ||
        err.message?.includes('quota') ||
        err.message?.includes('limit')
      if (isQuotaError && i < keys.length - 1) {
        continue
      }
      throw err
    }
  }
  throw lastError || new Error('All Gemini API keys exhausted.')
}

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

    const result = await runWithKeyRotation(async apiKey => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        }),
      })

      if (!response.ok) {
        const errText = await response.text().catch(() => '')
        throw new Error(`Gemini API returned status ${response.status}: ${errText}`)
      }

      const jsonResponse = await response.json()
      const rawText = jsonResponse?.candidates?.[0]?.content?.parts?.[0]?.text
      if (!rawText) throw new Error('Empty AI response received.')

      try {
        return JSON.parse(rawText)
      } catch (parseErr) {
        const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim()
        return JSON.parse(cleaned)
      }
    })

    return NextResponse.json({ success: true, data: result }, { status: 200 })
  } catch (err: any) {
    console.error('MoU AI assist route error:', err)
    return NextResponse.json(
      { error: 'AI assist failed to process purpose', details: err?.message },
      { status: 500 }
    )
  }
}
