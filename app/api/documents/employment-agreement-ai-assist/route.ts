import { NextResponse } from 'next/server'
import {
  EmploymentAgreementFormData,
  checkWageFiftyPercentRule,
  STATE_STAMP_SCHEDULE,
} from '@/lib/doc-generator/employment-agreement-generator'

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
      console.warn(`[Employment AI Assist] Request failed with key index ${i}:`, err.message || err)
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

interface EmploymentAiRequest {
  action?: 'chat_assist' | 'extract_and_fill' | 'explain_clause' | 'audit_agreement'
  prompt: string
  currentData?: Partial<EmploymentAgreementFormData>
  language?: 'en' | 'hi' | 'hinglish'
}

export async function POST(request: Request) {
  try {
    const body: EmploymentAiRequest = await request.json()
    const { action = 'chat_assist', prompt, currentData = {}, language = 'en' } = body

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 2) {
      return NextResponse.json(
        { error: 'Please provide a valid prompt or question.' },
        { status: 400 }
      )
    }

    const systemPrompt = `You are a Senior Indian Corporate and Labour Lawyer assisting an employer or HR manager on CorpLawUpdates.in to draft and customize an Employment Agreement in India.

Applicable Statutory Framework:
1. Indian Contract Act, 1872 (Section 10 for validity, Section 27 on restraint of trade, Section 74 on reasonable pre-estimate of damages).
2. Four Labour Codes in effect since 21 November 2025 with Central Rules notified on 8 May 2026:
   - Code on Wages, 2019 (Section 2(y) 50% wage rule for Basic + DA).
   - Industrial Relations Code, 2020 (Section 2(o) Fixed-Term Employment parity).
   - Code on Social Security, 2020 (Section 53 pro-rata gratuity after 1 year for Fixed Term employees).
   - Occupational Safety, Health and Working Conditions Code, 2020 (Section 6(1)(f) mandatory Letter of Appointment).
3. Copyright Act, 1957 (Section 17(c) Work-for-hire IP vesting).
4. Digital Personal Data Protection Act, 2023 (DPDP Act, Section 7(i) legitimate employment data processing).
5. State Stamp Acts (Article 5 non-judicial stamp duty, e.g. Maharashtra ₹500, Delhi ₹100, Karnataka ₹200).

CRITICAL STATUTORY ACCURACY RULES:
- Post-employment non-compete is VOID under Section 27 of Indian Contract Act (*Percept D'Mark v. Zaheer Khan*, 2006 SC; *Superintendence Co. v. Krishan Murgai*, 1980 SC). If user asks for non-compete, warn them clearly and recommend robust non-solicitation, confidentiality, and IP protection instead.
- Employment bonds are NOT enforceable as punitive locks. Under Section 74, only reasonable, actual, documented training expenditures can be recovered. Certificate withholding is strictly illegal.
- General employment agreements DO NOT require MCA filings, DINs, or Minute Book storage.
- Never guarantee "100% legal compliance"; provide an authoritative, customizable draft and recommend professional review where appropriate.

USER PROMPT:
"${prompt.trim()}"

USER ACTION:
"${action}"

USER LANGUAGE PREFERENCE:
"${language}" (Support English, Hindi (Devanagari), or Hinglish seamlessly based on user query).

CURRENT AGREEMENT DATA CONTEXT:
${JSON.stringify({
  employerName: currentData.employerName || '',
  employerEntityType: currentData.employerEntityType || '',
  employeeName: currentData.employeeName || '',
  designation: currentData.designation || '',
  department: currentData.department || '',
  joiningDate: currentData.joiningDate || '',
  workMode: currentData.workMode || 'hybrid',
  workLocationCity: currentData.workLocationCity || '',
  state: currentData.state || 'karnataka',
  annualCtc: currentData.annualCtc || 0,
  monthlyGross: currentData.monthlyGross || 0,
  basicMonthly: currentData.salaryStructure?.basicMonthly || 0,
  hasProbation: currentData.hasProbation ?? true,
  probationMonths: currentData.probationMonths || 3,
  noticePeriodDays: currentData.noticePeriodDays || 30,
  isFixedTerm: currentData.isFixedTerm || false,
  hasTrainingBond: currentData.hasTrainingBond || false,
  trainingCostAmount: currentData.trainingCostAmount || 0,
})}

TASK & REQUIRED JSON RESPONSE SCHEMA:
Return ONLY a valid JSON object matching this schema:
{
  "assistantReply": "Conversational, direct, and professional answer to the user in their language (English / Hindi / Hinglish). If fields are missing from their initial prompt, acknowledge what was captured and politely ask for the missing essentials.",
  "capturedFieldsSummary": "Short 1-line summary of what information was identified or changed.",
  "updatedData": {
    "employerName": "string if mentioned or inferred",
    "employerEntityType": "string if mentioned (e.g. Private Limited Company, LLP, etc.)",
    "employeeName": "string if mentioned",
    "designation": "string if mentioned",
    "department": "string if mentioned",
    "joiningDate": "YYYY-MM-DD if mentioned",
    "workMode": "in_office | hybrid | fully_remote if mentioned",
    "workLocationCity": "string if mentioned",
    "state": "state slug (karnataka, maharashtra, delhi, etc.) if mentioned",
    "annualCtc": "number if mentioned",
    "monthlyGross": "number if mentioned",
    "basicMonthly": "number if mentioned (ensure >= 50% of gross per Code on Wages)",
    "hasProbation": "boolean if mentioned",
    "probationMonths": "number if mentioned",
    "noticePeriodDays": "number if mentioned",
    "isFixedTerm": "boolean if mentioned",
    "hasTrainingBond": "boolean if mentioned",
    "trainingCostAmount": "number if mentioned",
    "trainingSpecialityDescription": "string if mentioned"
  },
  "missingFields": [
    "Array of strings indicating remaining key fields still needed to complete the draft, e.g. 'Employer Legal Name', 'Joining Date', 'State for Stamp Duty'"
  ],
  "legalAuditNote": "Authoritative Indian statutory pointer or caution (e.g., Section 27 non-compete notice, Section 74 training bond limit, Section 6(1)(f) appointment letter rule, or 50% wage rule).",
  "suggestedClauses": [
    {
      "title": "Clause Title in CAPS",
      "content": "Professional statutory clause text if requested by user"
    }
  ]
}

No markdown fence wrappers around the JSON. Return only the raw JSON object.`

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
      } catch {
        const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim()
        return JSON.parse(cleaned)
      }
    })

    return NextResponse.json({ success: true, data: result }, { status: 200 })
  } catch (err: any) {
    console.error('Employment AI assist error:', err)
    return NextResponse.json(
      {
        error: 'AI assistant is currently optimizing. Please proceed with manual form entry.',
        details: err?.message,
      },
      { status: 500 }
    )
  }
}
