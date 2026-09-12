import { POST } from '@/app/api/documents/legal-purpose-assist/route'

describe('Legal Purpose Assist API Route Suite', () => {
  const originalEnv = process.env
  const originalFetch = global.fetch

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv, GOOGLE_GEMINI_API_KEY: 'test-api-key-123' }
  })

  afterEach(() => {
    process.env = originalEnv
    global.fetch = originalFetch
  })

  it('returns 400 if rawText is missing or empty', async () => {
    const req = new Request('http://localhost:3000/api/documents/legal-purpose-assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'bank_loan_purpose', rawText: '' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('Please provide at least a few words')
  })

  it('returns 400 if rawText is shorter than 3 characters', async () => {
    const req = new Request('http://localhost:3000/api/documents/legal-purpose-assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'bank_loan_purpose', rawText: 'hi' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('successfully polishes bank loan purpose using Gemini model response', async () => {
    const mockGeminiResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  polishedText:
                    'financing capital expenditure towards the procurement and commissioning of Computer Numerical Control (CNC) machinery and expanding manufacturing facilities situated at Pune, Maharashtra',
                  category: 'Capex',
                  keyObjective: 'Machinery Capex & Factory Expansion',
                }),
              },
            ],
          },
        },
      ],
    }

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockGeminiResponse,
    } as Response)

    const req = new Request('http://localhost:3000/api/documents/legal-purpose-assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'bank_loan_purpose',
        rawText: 'need 2 crore to buy CNC milling machine from Germany and expand factory in Pune',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.polishedText).toContain('procurement and commissioning of Computer Numerical Control')
    expect(json.data.category).toBe('Capex')
  })

  it('successfully polishes property description for Second Schedule conveyancing', async () => {
    const mockGeminiResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  polishedText:
                    'All that piece and parcel of industrial land bearing Plot No. 42, Phase-III, Okhla Industrial Area, New Delhi, together with built-up commercial shed standing thereon',
                  propertyType: 'Industrial',
                }),
              },
            ],
          },
        },
      ],
    }

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockGeminiResponse,
    } as Response)

    const req = new Request('http://localhost:3000/api/documents/legal-purpose-assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'property_description',
        rawText: 'industrial shed on plot 42 okhla phase 3',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.polishedText).toContain('All that piece and parcel of industrial land')
    expect(json.data.propertyType).toBe('Industrial')
  })

  it('handles markdown code fence wrapping in Gemini response gracefully', async () => {
    const mockGeminiResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: '```json\n{"polishedText": "relocating to commercial premises for business scaling", "primaryFactor": "Business Expansion"}\n```',
              },
            ],
          },
        },
      ],
    }

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockGeminiResponse,
    } as Response)

    const req = new Request('http://localhost:3000/api/documents/legal-purpose-assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'registered_office_rationale',
        rawText: 'moving office for business scaling',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.polishedText).toBe('relocating to commercial premises for business scaling')
    expect(json.data.primaryFactor).toBe('Business Expansion')
  })
})
