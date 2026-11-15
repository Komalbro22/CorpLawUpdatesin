import { Regulator, BannerTheme } from './types'

export const BANNER_THEMES: Record<Regulator, BannerTheme> = {
  MCA: {
    regulator: 'MCA',
    fullName: 'Ministry of Corporate Affairs',
    bg: '#1E3A8A',
    circle: '#28459E',
    accent: '#F5A623',
    dark: '#0F1F4D',
  },
  SEBI: {
    regulator: 'SEBI',
    fullName: 'Securities and Exchange Board',
    bg: '#4C1D95',
    circle: '#5B2BA8',
    accent: '#FDE047',
    dark: '#2A0F57',
  },
  RBI: {
    regulator: 'RBI',
    fullName: 'Reserve Bank of India',
    bg: '#065F46',
    circle: '#0B7357',
    accent: '#F5C542',
    dark: '#052E22',
  },
  IBC: {
    regulator: 'IBC',
    fullName: 'Insolvency and Bankruptcy Code',
    bg: '#9A3412',
    circle: '#B2431A',
    accent: '#FED7AA',
    dark: '#431407',
  },
  NCLT: {
    regulator: 'NCLT',
    fullName: 'Tribunal orders',
    bg: '#334155',
    circle: '#475569',
    accent: '#7DD3FC',
    dark: '#0F172A',
  },
  FEMA: {
    regulator: 'FEMA',
    fullName: 'Foreign exchange and FDI',
    bg: '#0C5A7A',
    circle: '#12708F',
    accent: '#5EEAD4',
    dark: '#06303F',
  },
  IFSCA: {
    regulator: 'IFSCA',
    fullName: 'GIFT City regulator',
    bg: '#86198F',
    circle: '#9B2AA6',
    accent: '#F9A8D4',
    dark: '#3B0A40',
  },
  CCI: {
    regulator: 'CCI',
    fullName: 'Competition Commission',
    bg: '#9F1239',
    circle: '#B8204C',
    accent: '#FDA4AF',
    dark: '#4C0519',
  },
  LABOUR: {
    regulator: 'LABOUR',
    fullName: 'EPFO ESI and Codes',
    bg: '#3F6212',
    circle: '#4D7C0F',
    accent: '#BEF264',
    dark: '#1A2E05',
  },
  TAXATION: {
    regulator: 'TAXATION',
    fullName: 'CBDT CBIC and GST',
    bg: '#713F12',
    circle: '#854D0E',
    accent: '#FCD34D',
    dark: '#2D1A06',
  },
}

export function getBannerTheme(regulator?: string | null): BannerTheme {
  if (regulator && regulator.toUpperCase() in BANNER_THEMES) {
    return BANNER_THEMES[regulator.toUpperCase() as Regulator]
  }
  return BANNER_THEMES.MCA
}

export const IMPACT_COLORS = {
  High: '#F87171',
  Medium: '#FBBF24',
  Lower: '#94A3B8',
} as const

export const REGULATOR_THEMES = BANNER_THEMES
