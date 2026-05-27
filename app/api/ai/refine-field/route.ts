// src/app/api/ai/refine-field/route.ts
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { fieldName, rawValue, condition } = await req.json()

    if (!fieldName) {
      return NextResponse.json({ error: 'Missing fieldName' }, { status: 400 })
    }

    const customPrompt = `
      You are an expert Indian Corporate Advocate.
      A user is filling out a legal document and has entered a value for the field "${fieldName}".
      Current value entered: "${rawValue || '(empty)'}"
      User's additional conditions or special instructions to incorporate: "${condition || ''}"
      
      Your task:
      Rewrite this field value into a highly polished, professional, legally-stringent, and statutorily compliant clause or description. It must be suitable for direct drop-in integration into a formal Indian legal deed (such as a Sale Deed, Mortgage, Lease, or NDA).
      
      Strict Guidelines:
      - Return ONLY the final polished text. Do NOT include any conversational prefaces, postscripts, explanations, or quotes.
      - Ensure maximum legal clarity and standard Indian legal vocabulary (e.g., "hereinafter referred to", "in consideration of", "covenants").
      - Make sure any specified condition (like tax payments, grace periods, or liability) is professionally drafted.
    `

    const responseGemini = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY || ''
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: customPrompt }] }]
      })
    })

    const geminiData = await responseGemini.json()
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const polishedText = rawText.trim().replace(/^["']|["']$/g, '') // strip wrapping quotes if any

    return NextResponse.json({ polishedText })

  } catch (error: any) {
    console.error('Field Refiner API Error:', error)
    return NextResponse.json({ error: 'Failed to refine field value: ' + error.message }, { status: 500 })
  }
}
