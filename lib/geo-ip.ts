/**
 * Geolocation & IP Intelligence Helper for CorpLawUpdates.in
 * Extracts Edge Geo Headers (Vercel & Cloudflare) and provides cached IP resolution
 * for document generation and traffic analytics.
 */

// In-memory cache for IP lookups to avoid redundant network calls and preserve latency
const geoCache = new Map<string, GeoLocation>()

export interface GeoLocation {
  city: string
  region: string
  regionName?: string
  country: string
  countryCode: string
  flag: string
  isp?: string
}

// Map common ISO 3166-2:IN region codes to full state names
const INDIAN_STATES: Record<string, string> = {
  AP: 'Andhra Pradesh',
  AR: 'Arunachal Pradesh',
  AS: 'Assam',
  BR: 'Bihar',
  CG: 'Chhattisgarh',
  CH: 'Chandigarh',
  DL: 'Delhi',
  GA: 'Goa',
  GJ: 'Gujarat',
  HP: 'Himachal Pradesh',
  HR: 'Haryana',
  JH: 'Jharkhand',
  JK: 'Jammu & Kashmir',
  KA: 'Karnataka',
  KL: 'Kerala',
  LA: 'Ladakh',
  MH: 'Maharashtra',
  ML: 'Meghalaya',
  MN: 'Manipur',
  MP: 'Madhya Pradesh',
  MZ: 'Mizoram',
  NL: 'Nagaland',
  OD: 'Odisha',
  PB: 'Punjab',
  PY: 'Puducherry',
  RJ: 'Rajasthan',
  SK: 'Sikkim',
  TG: 'Telangana',
  TN: 'Tamil Nadu',
  TR: 'Tripura',
  TS: 'Telangana',
  UK: 'Uttarakhand',
  UP: 'Uttar Pradesh',
  UT: 'Uttarakhand',
  WB: 'West Bengal',
}

/**
 * Converts a 2-letter ISO country code into its Unicode flag emoji.
 * e.g., "IN" -> "🇮🇳", "US" -> "🇺🇸", "SG" -> "🇸🇬"
 */
export function getCountryFlag(countryCode?: string | null): string {
  if (!countryCode || countryCode.length !== 2) return '🌐'
  const code = countryCode.toUpperCase()
  // Offset to regional indicator symbols
  const first = code.charCodeAt(0) + 127397
  const second = code.charCodeAt(1) + 127397
  try {
    return String.fromCodePoint(first, second)
  } catch {
    return '🌐'
  }
}

/**
 * Normalizes state/region names, especially for Indian jurisdictions.
 */
export function normalizeRegionName(regionCode?: string | null, countryCode?: string | null): string {
  if (!regionCode) return ''
  const trimmed = regionCode.trim().toUpperCase()
  if (countryCode?.toUpperCase() === 'IN' && INDIAN_STATES[trimmed]) {
    return INDIAN_STATES[trimmed]
  }
  return regionCode
}

/**
 * Extracts geolocation from Edge headers injected by Vercel or Cloudflare.
 */
export function extractGeoFromHeaders(headers: Headers): GeoLocation | null {
  const rawCity = headers.get('x-vercel-ip-city') || headers.get('cf-ipcity')
  const rawRegion = headers.get('x-vercel-ip-country-region') || headers.get('cf-region')
  const rawCountry = headers.get('x-vercel-ip-country') || headers.get('cf-ipcountry')

  if (!rawCity && !rawCountry) return null

  const city = rawCity ? decodeURIComponent(rawCity) : 'Unknown City'
  const countryCode = (rawCountry || 'IN').toUpperCase()
  const regionCode = rawRegion ? decodeURIComponent(rawRegion) : ''
  const regionName = normalizeRegionName(regionCode, countryCode)

  return {
    city,
    region: regionCode,
    regionName: regionName || regionCode,
    country: countryCode === 'IN' ? 'India' : countryCode,
    countryCode,
    flag: getCountryFlag(countryCode),
  }
}

/**
 * Resolves geolocation for an IP address.
 * Uses an in-memory cache and falls back to a fast, non-blocking lookup.
 */
export async function resolveGeoFromIp(ip: string): Promise<GeoLocation> {
  const cleanIp = (ip || '').trim()

  // Handle local / loopback / private network IPs
  if (
    !cleanIp ||
    cleanIp === '127.0.0.1' ||
    cleanIp === '::1' ||
    cleanIp === 'localhost' ||
    cleanIp.startsWith('192.168.') ||
    cleanIp.startsWith('10.') ||
    cleanIp.startsWith('172.16.')
  ) {
    return {
      city: 'Local / Internal',
      region: 'DEV',
      regionName: 'Internal Network',
      country: 'India',
      countryCode: 'IN',
      flag: '🇮🇳',
    }
  }

  // Check cache first
  if (geoCache.has(cleanIp)) {
    return geoCache.get(cleanIp)!
  }

  // Perform quick lookup with a 2-second timeout
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 2000)

    const res = await fetch(`http://ip-api.com/json/${cleanIp}?fields=status,country,countryCode,region,regionName,city,isp`, {
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (res.ok) {
      const data = await res.json()
      if (data.status === 'success') {
        const geo: GeoLocation = {
          city: data.city || 'Unknown City',
          region: data.region || '',
          regionName: normalizeRegionName(data.region, data.countryCode) || data.regionName || '',
          country: data.country || 'Unknown Country',
          countryCode: data.countryCode || 'IN',
          flag: getCountryFlag(data.countryCode),
          isp: data.isp,
        }
        geoCache.set(cleanIp, geo)
        return geo
      }
    }
  } catch {
    // Timeout or network error - fail gracefully
  }

  // Fallback if lookup failed
  const fallback: GeoLocation = {
    city: 'Direct Access',
    region: '',
    regionName: 'India',
    country: 'India',
    countryCode: 'IN',
    flag: '🇮🇳',
  }
  geoCache.set(cleanIp, fallback)
  return fallback
}
