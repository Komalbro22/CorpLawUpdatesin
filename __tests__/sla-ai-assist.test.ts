import { POST } from '@/app/api/documents/sla-ai-assist/route'

describe('SLA AI Assist API Route Suite', () => {
  const originalEnv = process.env
  const originalFetch = global.fetch

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv, GOOGLE_GEMINI_API_KEY: 'test-gemini-key-1' }
  })

  afterEach(() => {
    process.env = originalEnv
    global.fetch = originalFetch
  })

  it('returns 400 if prompt is missing or shorter than 3 characters', async () => {
    const req = new Request('http://localhost:3000/api/documents/sla-ai-assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'ab' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('Please provide a prompt')
  })

  it('successfully generates SLA updates and custom clauses via Gemini model', async () => {
    const mockGeminiResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  updatedData: {
                    title: 'Mission Critical Cloud Infrastructure SLA',
                    slaType: 'cloud_computing',
                    uptimeTarget: '99.99%',
                    sev1ResponseTime: '15 Minutes',
                    sev1ResolutionTime: '2 Hours',
                    creditPercentage: '10% per 0.01% downtime',
                    penaltyCap: '25% of monthly fees',
                  },
                  addedClauses: [
                    {
                      id: 'certin_notice',
                      title: 'CERT-In 6-Hour Cybersecurity Breach Reporting',
                      content:
                        'The Service Provider shall report any cybersecurity incident, unauthorized data breach, or system compromise to the Client and CERT-In within six (6) hours.',
                    },
                    {
                      id: 'dr_bcp',
                      title: 'High Availability & Disaster Recovery',
                      content:
                        'The Service Provider warrants active-passive multi-region failover with RTO not exceeding 60 minutes and RPO not exceeding 15 minutes.',
                    },
                  ],
                  languageNote: 'यह अनुबंध 99.99% अपटाइम और 15 मिनट की आपातकालीन प्रतिक्रिया समय की गारंटी देता है।',
                  aiSummary: 'Updated uptime to 99.99%, tightened Sev-1 response to 15m, and added CERT-In 6-hour and Disaster Recovery clauses.',
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

    const req = new Request('http://localhost:3000/api/documents/sla-ai-assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'draft_from_prompt',
        prompt: 'Make customer-friendly with 99.99% uptime, 15m sev1 response, CERT-In compliance, and Hindi summary',
        tone: 'client_favourable',
        language: 'bilingual',
        currentData: {
          slaType: 'cloud_computing',
        },
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.updatedData.uptimeTarget).toBe('99.99%')
    expect(json.data.addedClauses).toHaveLength(2)
    expect(json.data.addedClauses[0].title).toContain('CERT-In')
    expect(json.data.languageNote).toContain('अपटाइम')
    expect(json.data.aiSummary).toContain('Updated uptime to 99.99%')
  })

  it('handles markdown code fences in Gemini raw response cleanly', async () => {
    const rawPayload = {
      updatedData: {
        penaltyCap: '15% of monthly billing',
      },
      addedClauses: [
        {
          id: 'soc2_audit',
          title: 'Right to Independent Security Audit',
          content: 'Client retains the right to audit provider SOC 2 Type II reports annually.',
        },
      ],
      aiSummary: 'Added SOC 2 audit clause.',
    }

    const mockResponseWithFences = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: '```json\n' + JSON.stringify(rawPayload) + '\n```',
              },
            ],
          },
        },
      ],
    }

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponseWithFences,
    } as Response)

    const req = new Request('http://localhost:3000/api/documents/sla-ai-assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Add annual SOC 2 audit rights',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.addedClauses[0].title).toBe('Right to Independent Security Audit')
  })

  it('returns 500 when no API keys are present in env', async () => {
    process.env = { ...originalEnv, GOOGLE_GEMINI_API_KEY: '', GEMINI_API_KEY: '', GOOGLE_GEMINI_API_KEY_2: '', GOOGLE_GEMINI_API_KEY_3: '', GOOGLE_GEMINI_API_KEY_4: '' }

    const req = new Request('http://localhost:3000/api/documents/sla-ai-assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Add 24x7 support clause',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toContain('AI assist failed')
  })
})
