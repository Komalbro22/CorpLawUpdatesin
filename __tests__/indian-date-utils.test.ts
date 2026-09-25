import {
  formatDDMMYYYY,
  formatIndianShort,
  formatIndianLong,
  parseIndianDateToIso,
} from '../lib/date-utils';

describe('Indian Date Utilities', () => {
  test('formats ISO strings to DD/MM/YYYY accurately', () => {
    expect(formatDDMMYYYY('2026-06-15')).toBe('15/06/2026');
    expect(formatDDMMYYYY('2026-09-24')).toBe('24/09/2026');
    expect(formatDDMMYYYY('2026-09-30')).toBe('30/09/2026');
    expect(formatDDMMYYYY('2026-01-05')).toBe('05/01/2026');
  });

  test('formats dates to Indian readable short format', () => {
    expect(formatIndianShort('2026-06-15')).toMatch(/15\s+Jun\s+2026/);
    expect(formatIndianShort('2026-09-24')).toMatch(/24\s+Sept?\s+2026/);
  });

  test('formats dates to Indian readable long format', () => {
    expect(formatIndianLong('2026-06-15')).toMatch(/15\s+June\s+2026/);
    expect(formatIndianLong('2026-09-24')).toMatch(/24\s+September\s+2026/);
  });

  test('parses Indian DD/MM/YYYY into ISO YYYY-MM-DD', () => {
    expect(parseIndianDateToIso('15/06/2026')).toBe('2026-06-15');
    expect(parseIndianDateToIso('24-09-2026')).toBe('2026-09-24');
    expect(parseIndianDateToIso('30.09.2026')).toBe('2026-09-30');
    expect(parseIndianDateToIso('05/01/2026')).toBe('2026-01-05');
  });

  test('handles leap years correctly', () => {
    // 2024 is a leap year
    expect(parseIndianDateToIso('29/02/2024')).toBe('2024-02-29');
    // 2026 is NOT a leap year
    expect(parseIndianDateToIso('29/02/2026')).toBeNull();
  });

  test('rejects impossible calendar dates', () => {
    expect(parseIndianDateToIso('31/04/2026')).toBeNull(); // April has 30 days
    expect(parseIndianDateToIso('31/06/2026')).toBeNull(); // June has 30 days
    expect(parseIndianDateToIso('32/01/2026')).toBeNull();
    expect(parseIndianDateToIso('15/13/2026')).toBeNull(); // Month 13
    expect(parseIndianDateToIso('invalid-date')).toBeNull();
    expect(parseIndianDateToIso('')).toBeNull();
  });
});
