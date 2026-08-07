// Mock for next/headers — not available in Jest node environment
// Provides a no-op cookies() function so server-only modules can be imported in tests
export function cookies() {
  return {
    get: (_name: string) => undefined,
    set: () => {},
    delete: () => {},
  }
}
