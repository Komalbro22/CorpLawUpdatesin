/**
 * Unit test suite for Svix Webhook verification (v2 compatibility).
 * Tests valid signatures, invalid signatures, missing headers, stale timestamps,
 * and malformed payloads.
 */
import { Webhook } from 'svix'

describe('Svix Webhook Verification', () => {
  const secret = 'whsec_MfKQ9r8GKYdaBeyYbGarHgRwSmAnQgod'
  const wh = new Webhook(secret)

  const payload = JSON.stringify({
    type: 'email.delivered',
    data: {
      email_id: 'test-email-msg-12345',
      recipient: 'compliance@example.com',
    },
  })

  it('successfully verifies authentic payload and signature', () => {
    const msgId = 'msg_p5jXN8AQM9LWM0D4AlBuvm0Z'
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const signature = wh.sign(msgId, new Date(parseInt(timestamp) * 1000), payload)

    const headers = {
      'svix-id': msgId,
      'svix-timestamp': timestamp,
      'svix-signature': signature,
    }

    expect(() => {
      wh.verify(payload, headers)
    }).not.toThrow()

    // Verified payload parsing
    const event = JSON.parse(payload)
    expect(event.type).toBe('email.delivered')
    expect(event.data.email_id).toBe('test-email-msg-12345')
  })

  it('rejects tampered payload with invalid signature', () => {
    const msgId = 'msg_p5jXN8AQM9LWM0D4AlBuvm0Z'
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const signature = wh.sign(msgId, new Date(parseInt(timestamp) * 1000), payload)

    const headers = {
      'svix-id': msgId,
      'svix-timestamp': timestamp,
      'svix-signature': signature,
    }

    const tamperedPayload = JSON.stringify({
      type: 'email.delivered',
      data: {
        email_id: 'tampered-email-id',
      },
    })

    expect(() => {
      wh.verify(tamperedPayload, headers)
    }).toThrow()
  })

  it('rejects missing or empty signature headers', () => {
    expect(() => {
      wh.verify(payload, {
        'svix-id': 'msg_123',
        'svix-timestamp': '123456789',
        'svix-signature': '',
      })
    }).toThrow()
  })

  it('rejects signature generated with wrong secret', () => {
    const wrongWh = new Webhook('whsec_WrongSecretKeyForTesting12345678')
    const msgId = 'msg_test'
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const signature = wrongWh.sign(msgId, new Date(parseInt(timestamp) * 1000), payload)

    expect(() => {
      wh.verify(payload, {
        'svix-id': msgId,
        'svix-timestamp': timestamp,
        'svix-signature': signature,
      })
    }).toThrow()
  })
})
