import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export type PurposeAssistMode =
  | 'bank_loan_purpose'
  | 'property_description'
  | 'registered_office_rationale'
  | 'partnership_business_objects'
  | 'generic_purpose'

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
      console.warn(`[Legal Purpose Assist] Request failed with key index ${i}:`, err.message || err)
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
    const { mode, rawText, context } = body as {
      mode: PurposeAssistMode
      rawText: string
      context?: Record<string, any>
    }

    if (!rawText || typeof rawText !== 'string' || rawText.trim().length < 3) {
      return NextResponse.json(
        { error: 'Please provide at least a few words describing your purpose.' },
        { status: 400 }
      )
    }

    let systemPrompt = ''

    if (mode === 'bank_loan_purpose') {
      systemPrompt = `You are a Senior Indian Banking & Corporate Finance Lawyer specializing in Company Law (Companies Act, 2013) and Bank Sanctions.
The user will provide an informal, raw explanation of why their company is borrowing money from a bank.
Your task is to refine and polish ONLY the "Loan Purpose / Use of Proceeds" clause so that it reads in formal, bank-approved legal drafting for a Board Resolution under Section 179(3)(d).

Rules:
1. Do NOT write full resolutions or change the template structure. Output ONLY the polished purpose text and metadata.
2. The language must sound like authentic commercial banking sanction drafting in India (e.g., "financing capital expenditure towards...", "meeting working capital requirements towards...", "procurement of...").
3. Keep it to 1 to 2 clear, authoritative sentences.
4. Return a JSON object with this exact schema:
{
  "polishedText": "string (the formal legal purpose statement that fits seamlessly into 'for the purpose of [polishedText]')",
  "category": "Capex" | "Working Capital" | "Refinancing" | "Project Finance" | "General Corporate",
  "keyObjective": "string (3-5 words summarizing the core purpose)"
}`
    } else if (mode === 'property_description') {
      systemPrompt = `You are a Senior Indian Real Estate Conveyancer and Banking Documentation Specialist.
The user will provide a raw, informal description of an immovable property (e.g. plot number, locality, building, flat, or shed).
Your task is to refine it into a formal conveyancing Second Schedule legal description under Section 58(f) of the Transfer of Property Act, 1882.

Rules:
1. Start with the standard Indian conveyancing recital phrase: "All that piece and parcel of..."
2. Structure the description to include plot/survey details, area, structures standing thereon, and municipal/revenue district jurisdiction if mentioned.
3. Return a JSON object with this exact schema:
{
  "polishedText": "string (formal legal parcel description)",
  "propertyType": "Industrial" | "Commercial" | "Residential" | "Agricultural" | "Plot"
}`
    } else if (mode === 'registered_office_rationale') {
      systemPrompt = `You are an Indian Company Secretary and Corporate Governance Specialist.
The user will provide a raw explanation for why their company is shifting its registered office.
Your task is to polish it into a formal corporate rationale suitable for Board Minutes and Explanatory Statements under Section 12(5) and Section 102 of the Companies Act, 2013.

Rules:
1. Write 1 to 2 professional sentences detailing operational expansion, infrastructure requirements, accessibility, or commercial viability.
2. Return a JSON object with this exact schema:
{
  "polishedText": "string (formal corporate rationale statement)",
  "primaryFactor": "Lease Expiry" | "Business Expansion" | "Cost Optimization" | "Operational Synergy" | "Administrative Convenience"
}`
    } else if (mode === 'partnership_business_objects') {
      systemPrompt = `You are a Senior Indian Corporate and Partnership Law Specialist (Indian Partnership Act, 1932).
The user will provide an informal description of the business activities or commercial trade they plan to conduct through their partnership firm.
Your task is to refine and expand this into formal, bank-approved, and tax-compliant "Nature of Business & Primary Objects" clauses for a Partnership Deed.

Rules:
1. Formulate 2 to 3 structured paragraphs covering the primary business activity, ancillary trade/services, and future expansion scope.
2. Ensure the drafting is commercially comprehensive and broad enough to satisfy banking KYC and tax authorities (e.g. GST, Section 44AB).
3. Return a JSON object with this exact schema:
{
  "polishedText": "string (comprehensive formal partnership business objects clause)",
  "industryCategory": "Trading & Retail" | "Professional Services" | "Manufacturing & Industrial" | "Technology & E-Commerce" | "Services & Contracting" | "General Commercial",
  "shortSummary": "string (3-5 words summarizing the business)"
}`
    } else {
      systemPrompt = `You are a Senior Indian Corporate Lawyer.
The user will provide an informal description of a commercial agreement's objective or recitals.
Polish it into formal, lawyer-approved legal drafting under the Indian Contract Act, 1872.

Return a JSON object with this exact schema:
{
  "polishedText": "string (formal legal statement)"
}`
    }

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
                  text: `${systemPrompt}\n\nUser Input:\n"${rawText.trim()}"\n\nContext:\n${JSON.stringify(
                    context || {}
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
      const rawOutput = jsonResponse?.candidates?.[0]?.content?.parts?.[0]?.text
      if (!rawOutput) throw new Error('Empty AI response received from Gemini.')

      try {
        return JSON.parse(rawOutput)
      } catch (parseErr) {
        const cleaned = rawOutput.replace(/```json/g, '').replace(/```/g, '').trim()
        return JSON.parse(cleaned)
      }
    })

    return NextResponse.json({ success: true, data: result }, { status: 200 })
  } catch (err: any) {
    console.error('Legal purpose assist API error:', err)
    return NextResponse.json(
      { error: 'AI assist failed to polish purpose', details: err?.message },
      { status: 500 }
    )
  }
}
