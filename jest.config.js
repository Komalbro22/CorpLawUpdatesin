/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
  moduleNameMapper: {
    // Resolve @/ path alias to match tsconfig paths
    '^@/(.*)$': '<rootDir>/$1',
    // Mock Next.js server-only modules unavailable in Jest node env
    '^next/headers$': '<rootDir>/__tests__/__mocks__/next-headers.ts',
    // Mock heavy server-only third-party packages
    '^resend$': '<rootDir>/__tests__/__mocks__/resend.ts',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        strict: false,
        esModuleInterop: true,
        paths: { '@/*': ['./*'] },
      },
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: [
    'lib/fee-calculator-core.ts',
    'lib/calculatorUtils.ts',
    'lib/penaltyCalculator.ts',
    'lib/utils.ts',
    'lib/admin-auth.ts',
    'lib/cron-auth.ts',
    'lib/sanitize.ts',
  ],
};
