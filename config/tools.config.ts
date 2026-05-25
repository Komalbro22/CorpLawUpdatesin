export interface Tool {
  slug: string
  title: string
  category: 'MCA / ROC Tools' | 'Financial & Tax Calculators' | 'AI Legal Drafts'
  tags: string[]
  description: string
  path: string
  icon: string
  verifiedAsOf: string
}

export const tools: Tool[] = [
  {
    slug: 'mca-calculator',
    title: 'MCA Late Filing Fee Calculator',
    category: 'MCA / ROC Tools',
    tags: ['AOC-4', 'MGT-7', 'DIR-3', 'DPT-3', 'penalty', 'late fee', 'ROC', 'Company', 'LLP', 'due date'],
    description: 'Compute exact MCA late filing fees and LLP capped penalties with statutory accuracy.',
    path: '/tools/mca-calculator',
    icon: 'scale',
    verifiedAsOf: '2026-05-25',
  },
  {
    slug: 'msme-calculator',
    title: 'MSME Delayed Payment Interest Calculator',
    category: 'Financial & Tax Calculators',
    tags: ['MSME', 'interest', 'delayed payment', 'Section 16', 'RBI Bank Rate', 'compounding'],
    description: 'Calculate statutory compound interest under Section 16 of the MSMED Act, 2006.',
    path: '/tools/msme-calculator',
    icon: 'trending-up',
    verifiedAsOf: '2026-05-25',
  },
  {
    slug: 'drafting-copilot',
    title: 'AI Legal Drafting Co-Pilot',
    category: 'AI Legal Drafts',
    tags: ['board resolution', 'bank account opening', 'appointment of director', 'NDA', 'agreement', 'letterhead', 'minutes', 'contract'],
    description: 'Draft legally compliant board resolutions and commercial contracts on dynamic letterheads.',
    path: '/tools/drafting-copilot',
    icon: 'sparkles',
    verifiedAsOf: '2026-05-25',
  }
]
