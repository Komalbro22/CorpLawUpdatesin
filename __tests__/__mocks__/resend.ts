// Mock for the 'resend' package — prevents real email sends during tests
export class Resend {
  emails = {
    send: jest.fn().mockResolvedValue({ id: 'mock-email-id', error: null }),
  }
  constructor(_apiKey?: string) {}
}
