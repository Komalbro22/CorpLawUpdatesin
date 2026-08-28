// lib/regulator-radar/types.ts
import { Category } from '@/types'

export type RegulatorKey = 
  | 'FEMA'
  | 'EPFO'
  | 'ESIC'
  | 'LABOUR'
  | 'CCI'
  | 'IBBI'
  | 'NCLT'
  | 'NCLAT'
  | 'MCA'
  | 'SEBI'
  | 'RBI'
  | 'TAX'

export interface RegulatorUpdate {
  id: string
  regulator: RegulatorKey
  regulatorLabel: string
  category: Category
  title: string
  date: string // ISO YYYY-MM-DD
  rawDateStr?: string
  sourceUrl: string
  pdfUrl?: string
  circularNo?: string
  snippet?: string
}

export interface SourceCheckResult {
  regulator: RegulatorKey
  label: string
  status: 'ok' | 'timeout' | 'error' | 'empty'
  count: number
  error?: string
}

export interface RadarResponse {
  status: 'ok' | 'partial' | 'error'
  checkedAt: string
  filterHours: number
  totalFound: number
  sources: SourceCheckResult[]
  items: RegulatorUpdate[]
}
