import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminOrKey } from '@/lib/api-key-auth'
import { REGULATOR_THEMES, BANNER_ICON_NAMES } from '@/lib/banner'

export const dynamic = 'force-dynamic'

const EXAMPLE_SPECS = {
  calendar_shift: {
    v: 1,
    regulator: 'MCA',
    headline: 'Name Reservation Resubmission Extended',
    sub: 'Relief after the MCA portal upgrade. Last date moved from 30 June to 10 July 2026.',
    action: 'File Form SPICe+ Part B',
    dateLabel: 'Jul 2026',
    impact: 'Medium',
    alt: 'Calendar showing MCA name reservation deadline moved from 30 June to 10 July 2026',
    visual: {
      type: 'calendar_shift',
      from: { month: 'JUN', day: '30' },
      to: { month: 'JUL', day: '10' },
      strike: true,
      toLabel: 'NEW DEADLINE',
    },
  },
  stat_cards: {
    v: 1,
    regulator: 'SEBI',
    headline: 'Minimum Public Shareholding Penalty Tripled',
    sub: 'Listed entities failing MPS norm of 25% now face revised daily fines under circular SEBI/HO/CFD.',
    action: 'Audit promoter shareholding',
    dateLabel: 'Nov 2026',
    impact: 'High',
    alt: 'Stat card showing SEBI daily penalty increased from 10,000 to 50,000 rupees with 25% minimum threshold',
    visual: {
      type: 'stat_cards',
      cards: [
        { label: 'REVISED DAILY FINE', value: '₹50,000', chip: '+200%' },
        { label: 'MINIMUM PUBLIC FLOAT', value: '25.0%' },
      ],
    },
  },
  before_after: {
    v: 1,
    regulator: 'RBI',
    headline: 'NBFC Core Investment Asset Threshold Raised',
    sub: 'Systemically important NBFC asset criteria revised to reduce compliance burden on mid-sized firms.',
    action: 'Review balance sheet classification',
    dateLabel: 'Nov 2026',
    impact: 'Medium',
    alt: 'Before and after comparison showing NBFC asset threshold raised from 500 Crore to 1000 Crore rupees',
    visual: {
      type: 'before_after',
      oldValue: '₹500 Cr',
      newValue: '₹1,000 Cr',
      direction: 'up',
      oldLabel: 'Previous Asset Cutoff',
      newLabel: 'New Threshold',
    },
  },
  date_card: {
    v: 1,
    regulator: 'CCI',
    headline: 'Public Comments Open on AI Merger Regulations',
    sub: 'Draft deal value thresholds and market concentration ratios for digital conglomerates released.',
    action: 'Submit comments via email',
    dateLabel: 'Dec 2026',
    impact: 'Low',
    alt: 'Calendar card showing CCI comments deadline on 15 December 2026',
    visual: {
      type: 'date_card',
      month: 'DEC',
      day: '15',
      year: '2026',
      caption: 'Comments Close 5:00 PM IST',
    },
  },
  stamp: {
    v: 1,
    regulator: 'FEMA',
    headline: 'Clarification on Overseas Direct Investment Limits',
    sub: 'RBI refutes viral claims of reduction in LRS annual limit of USD 250,000 for education.',
    action: 'Verify through official Master Direction',
    dateLabel: 'Nov 2026',
    impact: 'Low',
    alt: 'Claim debunk card stamped CLARIFIED over 100,000 USD rumor',
    visual: {
      type: 'stamp',
      stamp: 'CLARIFIED',
      claim: 'LRS remittance limit remains unchanged at USD 250,000 per financial year.',
    },
  },
  icon_panel: {
    v: 1,
    regulator: 'IBC',
    headline: 'Pre-Packaged Insolvency Framework Expanded',
    sub: 'Ministry of Corporate Affairs extends PIRP eligibility to mid-sized manufacturing enterprises.',
    action: 'Review Sec 54A eligibility criteria',
    dateLabel: 'Nov 2026',
    impact: 'High',
    alt: 'Insolvency and Bankruptcy Code shield icon on official navy and crimson backdrop',
    visual: {
      type: 'icon_panel',
      icon: 'shield-check',
      label: 'IBC Section 54A',
    },
  },
}

export async function GET(request: NextRequest) {
  const authCheck = await verifyAdminOrKey(request, 'banner:preview')
  if (!authCheck.success) {
    return authCheck.response
  }

  return NextResponse.json({
    regulators: REGULATOR_THEMES,
    icons: BANNER_ICON_NAMES,
    visual_types: [
      {
        type: 'calendar_shift',
        description: 'Two calendar tiles showing deadline extension or date change with strikethrough and arrow',
        fields: {
          from: { month: 'string (3 chars, e.g. JUN)', day: 'string (1-2 chars, e.g. 30)' },
          to: { month: 'string (3 chars, e.g. JUL)', day: 'string (1-2 chars, e.g. 10)' },
          strike: 'boolean (optional, default true)',
          toLabel: 'string (optional, e.g. "NEW DEADLINE")',
        },
      },
      {
        type: 'stat_cards',
        description: '1 to 3 stacked cards with large numbers, percentages, or rupee amounts with optional chips',
        fields: {
          cards: 'Array<{ label: string, value: string, chip?: string }> (min 1, max 3)',
        },
      },
      {
        type: 'before_after',
        description: 'Direct comparison between an old statutory value and a new revised value',
        fields: {
          oldValue: 'string (e.g. "₹500 Cr")',
          newValue: 'string (e.g. "₹1,000 Cr")',
          direction: '"up" | "down" | "neutral"',
          oldLabel: 'string (optional)',
          newLabel: 'string (optional)',
        },
      },
      {
        type: 'date_card',
        description: 'Single large calendar date tile for consultation or comments-by deadlines',
        fields: {
          month: 'string (3 chars, e.g. DEC)',
          day: 'string (1-2 chars, e.g. 15)',
          year: 'string (optional, 4 chars)',
          caption: 'string (optional, e.g. "Comments close 5:00 PM IST")',
        },
      },
      {
        type: 'stamp',
        description: 'Angled official stamp over a claim box for myth-busting or official confirmations',
        fields: {
          stamp: '"FAKE" | "CONFIRMED" | "CLARIFIED" | "WITHDRAWN"',
          claim: 'string (max 140 chars)',
        },
      },
      {
        type: 'icon_panel',
        description: 'Centered vector icon within concentric glowing rings with an optional label badge',
        fields: {
          icon: 'one of icons list',
          label: 'string (optional, max 30 chars)',
        },
      },
    ],
    limits: {
      headline: { max: 70, warn: 52 },
      sub: { max: 140, warn: 110 },
      action: { max: 40, warn: 32 },
      alt: { min: 20, max: 250 },
      max_payload_bytes: 65536,
      rate_limits: {
        previews_per_hour: 30,
        writes_per_hour: 20,
      },
    },
    examples: EXAMPLE_SPECS,
  })
}
