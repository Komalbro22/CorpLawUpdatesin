import { z } from 'zod'

export const REGULATORS = [
  'MCA',
  'SEBI',
  'RBI',
  'IBC',
  'NCLT',
  'FEMA',
  'IFSCA',
  'CCI',
  'LABOUR',
  'TAXATION',
] as const

export const RegulatorEnum = z.enum(REGULATORS)
export type Regulator = z.infer<typeof RegulatorEnum>

export const ICON_NAMES = [
  'building-bank',
  'coins',
  'file-check',
  'chart-line',
  'scale',
  'building',
  'users',
  'receipt',
  'globe',
  'gavel',
  'shield-check',
  'message-square-text',
  'calendar',
  'alert-triangle',
  'clock',
] as const

export const IconNameEnum = z.enum(ICON_NAMES)
export type IconName = z.infer<typeof IconNameEnum>
export const BANNER_ICON_NAMES = ICON_NAMES

export const ImpactEnum = z.enum(['High', 'Medium', 'Lower'])
export type Impact = z.infer<typeof ImpactEnum>

export const CardSpec = z.object({
  label: z.string().max(34, 'Card label exceeds 34 characters'),
  value: z.string().max(9, 'Card value exceeds 9 characters'),
  chip: z.string().max(12, 'Card chip exceeds 12 characters').optional(),
})
export type Card = z.infer<typeof CardSpec>

export const CalendarShiftVisual = z.object({
  type: z.literal('calendar_shift'),
  from: z.object({
    month: z.string().max(4, 'From month exceeds 4 characters'),
    day: z.string().max(2, 'From day exceeds 2 characters'),
  }),
  to: z.object({
    month: z.string().max(4, 'To month exceeds 4 characters'),
    day: z.string().max(2, 'To day exceeds 2 characters'),
  }),
  strike: z.boolean().default(true),
  toLabel: z.string().max(14, 'To label exceeds 14 characters').default('NEW DEADLINE'),
})

export const StatCardsVisual = z.object({
  type: z.literal('stat_cards'),
  cards: z.array(CardSpec).min(1).max(3).optional(),
  items: z.array(CardSpec).min(1).max(3).optional(),
}).transform((val) => {
  const cards = val.cards || val.items || []
  return {
    type: 'stat_cards' as const,
    cards,
    items: cards,
  }
}).refine((val) => val.items.length >= 1 && val.items.length <= 3, {
  message: 'cards array must contain between 1 and 3 cards',
  path: ['cards'],
})

export const BeforeAfterVisual = z.object({
  type: z.literal('before_after'),
  before: CardSpec.optional(),
  after: CardSpec.optional(),
  change: z.enum(['up', 'down', 'none', 'neutral']).optional(),
  oldValue: z.string().optional(),
  newValue: z.string().optional(),
  direction: z.enum(['up', 'down', 'none', 'neutral']).optional(),
  oldLabel: z.string().optional(),
  newLabel: z.string().optional(),
}).transform((val) => {
  const before = val.before || { label: val.oldLabel || 'Previous', value: val.oldValue || '' }
  const after = val.after || { label: val.newLabel || 'Revised', value: val.newValue || '' }
  const rawChange = val.change || val.direction || 'none'
  const change = rawChange === 'neutral' ? 'none' : rawChange
  return {
    type: 'before_after' as const,
    before,
    after,
    change,
  }
})

export const DateCardVisual = z.object({
  type: z.literal('date_card'),
  label: z.string().max(20, 'Date card label exceeds 20 characters').optional().default('IMPORTANT DATE'),
  month: z.string().max(4, 'Month exceeds 4 characters'),
  day: z.string().max(2, 'Day exceeds 2 characters'),
  year: z.string().max(4, 'Year exceeds 4 characters').optional(),
  caption: z.string().max(80, 'Caption exceeds 80 characters').optional(),
})

export const StampVisual = z.object({
  type: z.literal('stamp'),
  stamp: z.enum(['FAKE', 'CONFIRMED', 'CLARIFIED', 'WITHDRAWN']).optional(),
  text: z.enum(['FAKE', 'CONFIRMED', 'CLARIFIED', 'WITHDRAWN']).optional(),
  claim: z.string().max(140, 'Claim exceeds 140 characters').optional(),
}).transform((val) => {
  const stampText = val.text || val.stamp || 'CLARIFIED'
  return {
    type: 'stamp' as const,
    text: stampText,
    stamp: stampText,
    claim: val.claim,
  }
})

export const IconPanelVisual = z.object({
  type: z.literal('icon_panel'),
  icon: IconNameEnum,
  caption: z.string().max(40, 'Caption exceeds 40 characters').optional(),
  label: z.string().max(40, 'Label exceeds 40 characters').optional(),
}).transform((val) => {
  const label = val.label || val.caption
  return {
    type: 'icon_panel' as const,
    icon: val.icon,
    caption: label,
    label,
  }
})

export const VisualSpec = z.discriminatedUnion('type', [
  CalendarShiftVisual,
  StatCardsVisual,
  BeforeAfterVisual,
  DateCardVisual,
  StampVisual,
  IconPanelVisual,
])
export type Visual = z.infer<typeof VisualSpec>

export const BannerSpec = z.object({
  v: z.literal(1).default(1),
  regulator: RegulatorEnum,
  headline: z.string().min(8, 'Headline must be at least 8 characters').max(70, 'Headline must not exceed 70 characters'),
  sub: z.string().max(140, 'Sub-headline must not exceed 140 characters').optional(),
  action: z.string().max(46, 'Action chip must not exceed 46 characters').optional(),
  dateLabel: z.string().max(20, 'Date label must not exceed 20 characters'),
  impact: ImpactEnum,
  alt: z.string().min(20, 'Alt text must be at least 20 characters').max(250, 'Alt text must not exceed 250 characters'),
  visual: VisualSpec,
})
export type BannerSpecData = z.infer<typeof BannerSpec>

export const RenderInputSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('template'),
    spec: BannerSpec,
  }),
  z.object({
    mode: z.literal('html'),
    code: z.string().min(1, 'HTML code is required').max(65536, 'HTML code must not exceed 64 KB'),
    alt: z.string().min(20, 'Alt text must be at least 20 characters').max(250, 'Alt text must not exceed 250 characters'),
    regulator: RegulatorEnum.optional().default('MCA'),
    headline: z.string().max(70).optional(),
  }),
  z.object({
    mode: z.literal('svg'),
    code: z.string().min(1, 'SVG code is required').max(65536, 'SVG code must not exceed 64 KB'),
    alt: z.string().min(20, 'Alt text must be at least 20 characters').max(250, 'Alt text must not exceed 250 characters'),
  }),
])
export type RenderInput = z.infer<typeof RenderInputSchema>

export interface RenderResult {
  png: Buffer
  webp: Buffer
  pngBuffer?: Buffer
  webpBuffer?: Buffer
  width: number
  height: number
  hash: string
  warnings: string[]
  renderTimeMs?: number
}

export interface BannerTheme {
  regulator: Regulator
  fullName: string
  bg: string
  circle: string
  accent: string
  dark: string
}
