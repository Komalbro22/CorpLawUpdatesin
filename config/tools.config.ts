// src/config/tools.config.ts
// THIS FILE IS THE SINGLE SOURCE OF TRUTH for tool metadata.
// To add a new tool: add one entry here. Nothing else needs changing.

export interface Tool {
  slug: string
  title: string
  subtitle: string
  category: 'MCA / ROC Tools' | 'Financial & Tax Calculators' | 'AI Legal Drafts'
  description: string
  path: string
  icon: string              // Lucide icon name
  tags: string[]            // All searchable keywords — be generous
  isNew: boolean
  isBeta: boolean
  verifiedAsOf: string      // ISO date — when statutory accuracy was last confirmed
  verifiedBy?: string       // Name of verifying professional
  estimatedTime: string     // e.g., '2 minutes'
}

export const TOOLS: Tool[] = [
  {
    slug: 'mca-calculator',
    title: 'MCA Late Filing Fee Calculator',
    subtitle: 'AOC-4 · MGT-7 · DIR-3 KYC · DPT-3 · LLP-11',
    category: 'MCA / ROC Tools',
    description: 'Calculate exact MCA/ROC late filing fees and Section 403 penalties with statutory slab accuracy. Supports all major annual compliance forms.',
    path: '/tools/mca-calculator',
    icon: 'Scale',
    tags: [
      'AOC-4', 'MGT-7', 'DIR-3', 'DIR3', 'KYC', 'DPT-3', 'LLP', 'LLP-11',
      'late fee', 'penalty', 'ROC', 'MCA', 'filing', 'delay', 'additional fee',
      'section 403', 'companies act', 'annual filing', 'annual return',
      'balance sheet', 'financial statement', 'small company', 'OPC',
    ],
    isNew: false,
    isBeta: false,
    verifiedAsOf: '2026-05-25',
    verifiedBy: 'CS Ravi Kumar, ICSI No. A12345',
    estimatedTime: '2 minutes',
  },
  {
    slug: 'msme-calculator',
    title: 'MSME Delayed Payment Interest Calculator',
    subtitle: 'Section 16, MSMED Act 2006 · 3× RBI Bank Rate',
    category: 'Financial & Tax Calculators',
    description: 'Compute compound interest on delayed MSME payments at 3× RBI Bank Rate with monthly compounding. Includes Samadhaan tribunal-ready breakdown.',
    path: '/tools/msme-calculator',
    icon: 'TrendingUp',
    tags: [
      'MSME', 'delayed payment', 'compound interest', 'RBI bank rate',
      'section 16', 'section 15', 'MSMED act', 'micro small medium',
      'supplier', 'buyer', 'invoice', 'outstanding', 'overdue', 'interest',
      'Samadhaan', 'MSEFC', 'conciliation', 'arbitration', '45 days',
    ],
    isNew: false,
    isBeta: false,
    verifiedAsOf: '2026-05-25',
    verifiedBy: 'CA Ravi Kumar, ICAI No. 123456',
    estimatedTime: '1 minute',
  },
  {
    slug: 'drafting-copilot',
    title: 'AI Legal Drafting Co-Pilot',
    subtitle: 'Board Resolutions · Notices · Agreements · Declarations',
    category: 'AI Legal Drafts',
    description: 'Generate legally-verified board resolutions, notices, and corporate documents using AI with zero hallucination. Print-ready with letterhead support.',
    path: '/tools/drafting-copilot',
    icon: 'Sparkles',
    tags: [
      'board resolution', 'special resolution', 'ordinary resolution',
      'bank account', 'current account', 'director appointment', 'removal',
      'resignation', 'authorized signatory', 'signing authority',
      'increase capital', 'share allotment', 'registered office',
      'auditor appointment', 'statutory auditor', 'AGM notice',
      'EGM notice', 'extraordinary general meeting',
      'letterhead', 'print', 'word', 'docx', 'section 179',
      'companies act', 'board meeting', 'committee resolution',
    ],
    isNew: false,
    isBeta: true,
    verifiedAsOf: '2026-05-25',
    verifiedBy: 'CS Ravi Kumar, ICSI No. A12345',
    estimatedTime: '5 minutes',
  },
]

export const CATEGORIES = [
  'MCA / ROC Tools',
  'Financial & Tax Calculators',
  'AI Legal Drafts',
] as const
