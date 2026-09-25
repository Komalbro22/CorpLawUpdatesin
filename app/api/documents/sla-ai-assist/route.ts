import { NextResponse } from 'next/server'
import { SlaFormData, SlaCustomClause, SlaType } from '@/lib/doc-generator/sla-generator'

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
      console.warn(`[SLA AI Assist] Request failed with key index ${i}:`, err.message || err)
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

interface SlaAiRequest {
  action?: 'draft_from_prompt' | 'add_clause' | 'rephrase' | 'change_language'
  prompt: string
  currentData?: Partial<SlaFormData>
  tone?: 'balanced' | 'vendor_favourable' | 'client_favourable'
  language?: 'en' | 'hi' | 'bilingual'
}

export async function POST(request: Request) {
  try {
    const body: SlaAiRequest = await request.json()
    const { action = 'draft_from_prompt', prompt, currentData = {}, tone = 'balanced', language = 'en' } = body

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
      return NextResponse.json(
        { error: 'Please provide a prompt or instruction with at least 3 characters.' },
        { status: 400 }
      )
    }

    const systemPrompt = `You are a Senior Indian Corporate Lawyer and Technology Contracts Specialist practicing under the Indian Contract Act, 1872, the Information Technology Act, 2000, and the Digital Personal Data Protection Act, 2023 (DPDP Act).
You draft, review, customize, and edit Service Level Agreements (SLAs) for enterprise companies in India.

The user has requested legal assistance on an SLA document with the following action: "${action}".
Tone requirement: "${tone}" (Options: balanced = standard commercial practice; vendor_favourable = protective of service provider, higher liability caps, reasonable remedy grace; client_favourable = aggressive uptime commitments, tight resolution SLAs, high service credit remedies).
Language preference: "${language}" (en = formal Indian English statutory style; hi = Hindi legal terminology; bilingual = English contract with Hindi executive summary).

USER INSTRUCTION / PROMPT:
"${prompt.trim()}"

CURRENT SLA CONTEXT:
${JSON.stringify({
  slaType: currentData.slaType || 'cloud_computing',
  title: currentData.title || '',
  servicesDescription: currentData.servicesDescription || '',
  uptimeTarget: currentData.uptimeTarget || '99.9%',
  maintenanceWindow: currentData.maintenanceWindow || '',
  sev1ResponseTime: currentData.sev1ResponseTime || '1 Hour',
  sev1ResolutionTime: currentData.sev1ResolutionTime || '4 Hours',
  creditPercentage: currentData.creditPercentage || '5% per 0.05% downtime',
  penaltyCap: currentData.penaltyCap || '20% of monthly billing',
  arbitrationSeat: currentData.arbitrationSeat || 'New Delhi',
  existingCustomClauses: currentData.customClauses || [],
})}

TASK & OUTPUT INSTRUCTIONS:
Return a JSON object with the following schema:
{
  "updatedData": {
    "title": "String (Formal SLA title)",
    "slaType": "cloud_computing" | "it_saas" | "vendor_customer" | "software_maintenance" | "recruitment_hr",
    "servicesDescription": "Detailed, professional legal description of services",
    "uptimeTarget": "e.g. 99.9% or 99.95% or 99.99%",
    "maintenanceWindow": "Clear definition of scheduled maintenance hours and notice period",
    "sev1ResponseTime": "e.g. 15 minutes or 1 Hour",
    "sev1ResolutionTime": "e.g. 2 Hours or 4 Hours",
    "sev2ResponseTime": "e.g. 1 Hour or 2 Hours",
    "sev2ResolutionTime": "e.g. 4 Hours or 8 Hours",
    "sev3ResponseTime": "e.g. 4 Hours or 8 Hours",
    "sev3ResolutionTime": "e.g. 12 Hours or 24 Hours",
    "sev4ResponseTime": "e.g. 12 Hours or 24 Hours",
    "sev4ResolutionTime": "e.g. 48 Hours or 72 Hours",
    "creditPercentage": "Statutory pre-estimated liquidated damages formula under Section 74 Indian Contract Act",
    "penaltyCap": "Maximum monthly liability cap (e.g. 15% to 25% of monthly billing)",
    "arbitrationSeat": "Indian city (e.g. New Delhi, Mumbai, Bengaluru)"
  },
  "addedClauses": [
    {
      "id": "unique_string_id",
      "title": "CLAUSE TITLE (e.g. CERT-IN 6-HOUR CYBERSECURITY BREACH NOTIFICATION)",
      "content": "Full, authoritative legal text of the clause drafted according to Indian statutes."
    }
  ],
  "languageNote": "Optional string containing bilingual Hindi executive summary or clause explanation if requested or beneficial",
  "aiSummary": "Concise 1-2 sentence explanation of legal edits and improvements applied."
}

LEGAL STANDARDS TO ENFORCE:
1. Liquidated Damages: Ensure Section 74 of the Indian Contract Act, 1872 is respected (remedies must be genuine pre-estimates, not unconscionable penalties).
2. Data Protection: Under DPDP Act 2023 Section 8, include data processor technical safeguards and breach reporting.
3. Cybersecurity: CERT-In Directions 2022 mandate 6-hour breach reporting for cybersecurity incidents.
4. If the user asks for a specific clause (e.g., Disaster Recovery, Audit Rights, Non-Solicitation, IP Indemnity), include it in "addedClauses".
5. If the user asks for language change or Hindi summary, provide high-quality formal Hindi in "languageNote".
6. Return ONLY valid JSON, with no code fence wrappers or markdown.`

    const result = await runWithKeyRotation(async apiKey => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: systemPrompt }],
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
    console.error('SLA AI assist route error:', err)
    return NextResponse.json(
      { error: 'AI assist failed to process SLA drafting request', details: err?.message },
      { status: 500 }
    )
  }
}
