// lib/date-utils.ts
/**
 * Comprehensive Indian Date Formatting & Parsing Utilities
 * Standard: DD/MM/YYYY and Indian readable '15 Jun 2026'
 */

/**
 * Formats an ISO string (YYYY-MM-DD), Date, or timestamp to Indian standard 'DD/MM/YYYY'
 * Example: '2026-06-15' -> '15/06/2026'
 */
export function formatDDMMYYYY(date: string | Date | null | undefined): string {
  if (!date) return '';
  if (typeof date === 'string') {
    // Fast path for ISO YYYY-MM-DD
    const isoMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      const [, y, m, d] = isoMatch;
      return `${d}/${m}/${y}`;
    }
  }
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Formats date to Indian readable format with short month: '15 Jun 2026'
 */
export function formatIndianShort(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? new Date(`${date}T00:00:00+05:30`)
    : new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
}

/**
 * Formats date to full Indian readable: '15 June 2026'
 */
export function formatIndianLong(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? new Date(`${date}T00:00:00+05:30`)
    : new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
}

/**
 * Formats date with weekday: 'Mon, 15 Jun 2026'
 */
export function formatIndianWithDay(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? new Date(`${date}T00:00:00+05:30`)
    : new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
}

/**
 * Parses user input in DD/MM/YYYY, DD-MM-YYYY, or DD.MM.YYYY into ISO 'YYYY-MM-DD'
 * Returns null if the date is invalid or impossible (e.g. 31/02/2026)
 */
export function parseIndianDateToIso(input: string | null | undefined): string | null {
  if (!input) return null;
  const cleaned = input.trim().replace(/[-.]/g, '/');
  const parts = cleaned.split('/');
  if (parts.length !== 3) return null;
  const [d, m, y] = parts.map((p) => parseInt(p, 10));
  if (!d || !m || !y || m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > 2100) {
    return null;
  }

  // Exact calendar validation (handles leap years and month lengths)
  const testDate = new Date(Date.UTC(y, m - 1, d));
  if (
    testDate.getUTCFullYear() !== y ||
    testDate.getUTCMonth() !== m - 1 ||
    testDate.getUTCDate() !== d
  ) {
    return null;
  }

  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
