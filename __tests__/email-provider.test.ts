/**
 * Tests for lib/email-provider.ts
 */
import { parseSender, getActiveEmailProvider, sendEmail, sendBatchEmails } from '@/lib/email-provider'

describe('Email Provider Service', () => {
    const originalEnv = process.env

    beforeEach(() => {
        jest.resetModules()
        process.env = { ...originalEnv }
        delete process.env.BREVO_API_KEY
        delete process.env.BREVO_SMTP_KEY
        delete process.env.BREVO_SMTP_LOGIN
        delete process.env.RESEND_API_KEY
    })

    afterAll(() => {
        process.env = originalEnv
    })

    describe('parseSender', () => {
        it('parses formatted sender with display name', () => {
            const parsed = parseSender('CorpLawUpdates <newsletter@corplawupdates.in>')
            expect(parsed.name).toBe('CorpLawUpdates')
            expect(parsed.email).toBe('newsletter@corplawupdates.in')
        })

        it('parses plain email and uses custom fallback name', () => {
            const parsed = parseSender('updates@corplawupdates.in', 'Legal Desk')
            expect(parsed.name).toBe('Legal Desk')
            expect(parsed.email).toBe('updates@corplawupdates.in')
        })

        it('falls back to environment variable or default', () => {
            process.env.BREVO_FROM_EMAIL = 'custom@corplawupdates.in'
            const parsed = parseSender()
            expect(parsed.email).toBe('custom@corplawupdates.in')
        })
    })

    describe('getActiveEmailProvider', () => {
        it('returns none when no keys configured', () => {
            expect(getActiveEmailProvider()).toBe('none')
        })

        it('prefers Brevo API when BREVO_API_KEY is present', () => {
            process.env.BREVO_API_KEY = 'xkeysib-test'
            process.env.RESEND_API_KEY = 're_test'
            expect(getActiveEmailProvider()).toBe('brevo-api')
        })

        it('uses Brevo SMTP when BREVO_SMTP_KEY is present and no BREVO_API_KEY', () => {
            process.env.BREVO_SMTP_KEY = 'xsmtpsib-test'
            process.env.RESEND_API_KEY = 're_test'
            expect(getActiveEmailProvider()).toBe('brevo-smtp')
        })

        it('falls back to Resend when only RESEND_API_KEY is set', () => {
            process.env.RESEND_API_KEY = 're_test'
            expect(getActiveEmailProvider()).toBe('resend')
        })
    })

    describe('Brevo REST API sending', () => {
        it('sends single email via Brevo REST API successfully', async () => {
            process.env.BREVO_API_KEY = 'xkeysib-test-123'
            
            const mockFetch = jest.fn().mockResolvedValue({
                ok: true,
                status: 201,
                json: async () => ({ messageId: '<test-message-123@brevo.com>' })
            })
            global.fetch = mockFetch

            const res = await sendEmail({
                to: 'subscriber@example.com',
                subject: 'Hello World',
                html: '<p>Test</p>'
            })

            expect(res.success).toBe(true)
            expect(res.provider).toBe('brevo-api')
            expect(res.messageId).toBe('<test-message-123@brevo.com>')
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.brevo.com/v3/smtp/email',
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'api-key': 'xkeysib-test-123',
                    })
                })
            )
        })

        it('sends batch emails via Brevo messageVersions', async () => {
            process.env.BREVO_API_KEY = 'xkeysib-test-123'

            const mockFetch = jest.fn().mockResolvedValue({
                ok: true,
                status: 201,
                json: async () => ({ messageIds: ['<id-1>', '<id-2>'] })
            })
            global.fetch = mockFetch

            const batchRes = await sendBatchEmails({
                emails: [
                    { to: 'sub1@example.com', subject: 'Subject 1', html: '<p>1</p>' },
                    { to: 'sub2@example.com', subject: 'Subject 2', html: '<p>2</p>' },
                ]
            })

            expect(batchRes.success).toBe(true)
            expect(batchRes.sent).toBe(2)
            expect(batchRes.failed).toBe(0)
            expect(batchRes.provider).toBe('brevo-api')
            expect(batchRes.results[0].messageId).toBe('<id-1>')
            expect(batchRes.results[1].messageId).toBe('<id-2>')
        })
    })
})
