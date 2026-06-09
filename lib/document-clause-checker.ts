export interface ClauseCheck {
  id: string
  name: string
  description: string
  importance: 'critical' | 'recommended' | 'optional'
  missing: boolean
  aiPrompt: string
  aliases: string[]
  applicableTo: string[]
}

// Keywords that indicate each clause is present
const CLAUSE_DETECTION_PATTERNS: Record<
  string, 
  string[]
> = {
  CONFIDENTIALITY: [
    'confidential', 'non-disclosure',
    'trade secret', 'nda', 'secrecy',
    'proprietary information'
  ],
  JURISDICTION: [
    'jurisdiction', 'courts at',
    'subject to jurisdiction', 'courts of'
  ],
  GOVERNING_LAW: [
    'governed by', 'laws of india',
    'applicable law', 'governing law'
  ],
  DISPUTE_RESOLUTION: [
    'arbitration', 'dispute', 'mediation',
    'conciliation', 'adr', 'amicable'
  ],
  FORCE_MAJEURE: [
    'force majeure', 'act of god',
    'natural disaster', 'pandemic',
    'beyond reasonable control'
  ],
  LIMITATION_OF_LIABILITY: [
    'limitation of liability',
    'total liability', 'shall not exceed',
    'indirect damages', 'consequential loss'
  ],
  SEVERABILITY: [
    'severability', 'severable',
    'invalid provision', 'remaining provisions',
    'unenforceable'
  ],
  TERMINATION: [
    'termination', 'terminate',
    'notice period', 'dissolution',
    'winding up'
  ],
}

export function checkMissingClauses(
  content: string,
  documentType: string,
  category: string
): ClauseCheck[] {
  const lowerContent = content.toLowerCase()

  // Board resolutions don't need commercial clauses
  if (category === 'board_resolution') {
    return [] // Board resolutions handled differently
  }

  const checks: ClauseCheck[] = [
    {
      id: 'CONFIDENTIALITY',
      name: 'Confidentiality Clause',
      description: 'Protects trade secrets and business information shared between parties',
      importance: 'critical',
      missing: !CLAUSE_DETECTION_PATTERNS
        .CONFIDENTIALITY
        .some(k => lowerContent.includes(k)),
      aiPrompt: 'Add a comprehensive confidentiality clause protecting all business information, trade secrets and proprietary data shared under this agreement during and after its term',
      aliases: ['confidentiality', 'nda', 'secrecy'],
      applicableTo: ['agreements', 'appointments', 'commercial_contracts'],
    },
    {
      id: 'JURISDICTION',
      name: 'Jurisdiction Clause',
      description: 'Specifies which court has authority to resolve disputes',
      importance: 'critical',
      missing: !CLAUSE_DETECTION_PATTERNS
        .JURISDICTION
        .some(k => lowerContent.includes(k)),
      aiPrompt: 'Add a jurisdiction clause specifying the exclusive jurisdiction of courts in India for resolving any disputes under this agreement',
      aliases: ['jurisdiction', 'courts', 'legal proceedings'],
      applicableTo: ['agreements', 'appointments', 'commercial_contracts'],
    },
    {
      id: 'GOVERNING_LAW',
      name: 'Governing Law Clause',
      description: 'States which country/state law applies to interpret the agreement',
      importance: 'critical',
      missing: !CLAUSE_DETECTION_PATTERNS
        .GOVERNING_LAW
        .some(k => lowerContent.includes(k)),
      aiPrompt: 'Add a governing law clause stating this agreement is governed by the laws of India',
      aliases: ['governing law', 'applicable law', 'choice of law'],
      applicableTo: ['agreements', 'appointments', 'commercial_contracts'],
    },
    {
      id: 'DISPUTE_RESOLUTION',
      name: 'Dispute Resolution Clause',
      description: 'Defines the process for resolving disputes — mediation, arbitration or courts',
      importance: 'recommended',
      missing: !CLAUSE_DETECTION_PATTERNS
        .DISPUTE_RESOLUTION
        .some(k => lowerContent.includes(k)),
      aiPrompt: 'Add a dispute resolution clause providing for amicable resolution first, then arbitration under the Arbitration and Conciliation Act 1996 as fallback',
      aliases: ['dispute', 'arbitration', 'adr'],
      applicableTo: ['agreements', 'appointments', 'commercial_contracts'],
    },
    {
      id: 'FORCE_MAJEURE',
      name: 'Force Majeure Clause',
      description: 'Protects parties from liability for events beyond their control',
      importance: 'recommended',
      missing: !CLAUSE_DETECTION_PATTERNS
        .FORCE_MAJEURE
        .some(k => lowerContent.includes(k)),
      aiPrompt: 'Add a force majeure clause covering natural disasters, pandemic, government action and other extraordinary events beyond parties control under Section 56 Indian Contract Act',
      aliases: ['force majeure', 'act of god', 'unforeseen'],
      applicableTo: ['agreements', 'commercial_contracts'],
    },
    {
      id: 'LIMITATION_OF_LIABILITY',
      name: 'Limitation of Liability Clause',
      description: 'Caps maximum financial exposure of each party',
      importance: 'recommended',
      missing: !CLAUSE_DETECTION_PATTERNS
        .LIMITATION_OF_LIABILITY
        .some(k => lowerContent.includes(k)),
      aiPrompt: 'Add a limitation of liability clause capping total liability to fees paid in preceding 12 months and excluding indirect and consequential damages',
      aliases: ['limitation liability', 'liability cap', 'damages limit'],
      applicableTo: ['agreements', 'commercial_contracts'],
    },
    {
      id: 'SEVERABILITY',
      name: 'Severability Clause',
      description: 'Ensures remaining clauses remain valid if any clause is found unenforceable',
      importance: 'optional',
      missing: !CLAUSE_DETECTION_PATTERNS
        .SEVERABILITY
        .some(k => lowerContent.includes(k)),
      aiPrompt: 'Add a severability clause stating that if any provision is found void or unenforceable, the remaining provisions continue in full force',
      aliases: ['severability', 'invalid clause', 'remaining provisions'],
      applicableTo: ['agreements', 'appointments', 'commercial_contracts'],
    },
    {
      id: 'TERMINATION',
      name: 'Termination Clause',
      description: 'Defines how and when the agreement can be ended',
      importance: 'critical',
      missing: !CLAUSE_DETECTION_PATTERNS
        .TERMINATION
        .some(k => lowerContent.includes(k)),
      aiPrompt: 'Add a termination clause specifying notice period for termination and grounds for immediate termination for cause',
      aliases: ['termination', 'notice period', 'end agreement'],
      applicableTo: ['agreements', 'appointments', 'commercial_contracts'],
    },
    {
      id: 'PAYMENT',
      name: 'Payment Terms Clause',
      description: 'Specifies payment amounts, schedule, method and late payment consequences',
      importance: 'critical',
      missing: !lowerContent.includes('payment') && 
               !lowerContent.includes('fee') && 
               !lowerContent.includes('consideration'),
      aiPrompt: 'Add a payment terms clause specifying payment amount, due date, payment method and interest on late payments',
      aliases: ['payment terms', 'fees', 'consideration'],
      applicableTo: ['agreements', 'commercial_contracts'],
    },
  ]

  // Filter to applicable document types
  return checks.filter(c => 
    c.applicableTo.includes(category)
  )
}

export function getImportanceIcon(
  importance: ClauseCheck['importance']
): string {
  switch (importance) {
    case 'critical': return '🔴'
    case 'recommended': return '🟡'
    case 'optional': return '🟢'
  }
}

export function getImportanceLabel(
  importance: ClauseCheck['importance']
): string {
  switch (importance) {
    case 'critical': return 'Critical'
    case 'recommended': return 'Recommended'
    case 'optional': return 'Optional'
  }
}

export function formatTemplateSource(
  slug: string,
  source: string,
  category: string
): string {
  if (category === 'board_resolution') {
    return 'ICSI SS-1 / Companies Act, 2013'
  }

  const lowerSlug = slug.toLowerCase()

  if (lowerSlug.includes('partnership-deed')) {
    return 'Indian Partnership Act, 1932'
  }
  if (lowerSlug.includes('power-of-attorney')) {
    return 'Powers-of-Attorney Act, 1882'
  }
  if (lowerSlug.includes('non-disclosure') || lowerSlug.includes('nda')) {
    return 'Indian Contract Act, 1872'
  }
  if (lowerSlug.includes('consultancy-agreement')) {
    return 'Indian Contract Act, 1872'
  }
  if (lowerSlug.includes('service-level-agreement') || lowerSlug.includes('sla')) {
    return 'Indian Contract Act, 1872'
  }
  if (lowerSlug.includes('memorandum-of-understanding') || lowerSlug.includes('mou')) {
    return 'Indian Contract Act, 1872'
  }
  if (lowerSlug.includes('joint-venture')) {
    return 'Indian Contract Act, 1872 / Companies Act, 2013'
  }
  if (lowerSlug.includes('employment-agreement') || lowerSlug.includes('employment-contract')) {
    return 'Indian Contract Act, 1872 / Labour Laws'
  }
  if (lowerSlug.includes('share-transfer')) {
    return 'Companies Act, 2013 / Indian Stamp Act, 1899'
  }
  if (lowerSlug.includes('director-appointment')) {
    return 'Companies Act, 2013'
  }

  // Fallback cleanup of references
  let cleanSource = source || ''
  cleanSource = cleanSource
    .replace(/\/?\s*CAAA Commercial Contracts Guide\s*\/?/gi, '')
    .replace(/\/?\s*LexisNexis Commercial Drafting Checklist\s*\/?/gi, '')
    .replace(/\/?\s*LexisNexis Checklist\s*\/?/gi, '')
    .replace(/\/?\s*ICSI Professional Programme\s*—?\s*Company Law Practice\s*\/?/gi, '')
    .replace(/\/?\s*ICSI Professional Programme\s*—?\s*Drafting, Appearances & Pleadings\s*\/?/gi, '')
    .replace(/\/?\s*ICSI Professional Programme\s*\/?/gi, '')
    .replace(/\/?\s*IICA Commercial Contracts\s*\/?/gi, '')
    .trim()

  if (!cleanSource || cleanSource === '/') {
    if (category === 'agreements' || category === 'commercial_contracts') {
      return 'Indian Contract Act, 1872'
    }
    return 'Companies Act, 2013'
  }

  return cleanSource.replace(/^\/|\/$/g, '').trim()
}

export function checkLeaseClauses(
  content: string
): ClauseCheck[] {
  const lowerContent = content.toLowerCase()

  const leaseChecks: ClauseCheck[] = [
    {
      id: 'SECURITY_DEPOSIT',
      name: 'Security Deposit Clause',
      description: 'Defines refundable deposit amount, interest and refund timeline',
      importance: 'critical',
      missing: !lowerContent.includes('security deposit') &&
               !lowerContent.includes('deposit'),
      aiPrompt: 'Add a security deposit clause specifying the deposit amount, that it is interest-free and refundable, and the timeline for refund after vacating',
      aliases: ['security deposit', 'deposit', 'caution money'],
      applicableTo: ['agreements'],
    },
    {
      id: 'LOCK_IN_PERIOD',
      name: 'Lock-in Period',
      description: 'Protects both parties from early exit during initial period',
      importance: 'recommended',
      missing: !lowerContent.includes('lock-in') &&
               !lowerContent.includes('lock in'),
      aiPrompt: 'Add a lock-in period clause specifying minimum 6 months during which neither party can terminate, with penalty for early exit',
      aliases: ['lock-in', 'minimum term', 'penalty exit'],
      applicableTo: ['agreements'],
    },
    {
      id: 'RENT_ESCALATION',
      name: 'Rent Escalation Clause',
      description: 'Defines how rent increases annually',
      importance: 'recommended',
      missing: !lowerContent.includes('escalat') &&
               !lowerContent.includes('increment') &&
               !lowerContent.includes('increase'),
      aiPrompt: 'Add a rent escalation clause providing for annual increase of 10% on the monthly rent at the commencement of each subsequent year',
      aliases: ['rent increase', 'escalation', 'rent revision'],
      applicableTo: ['agreements'],
    },
    {
      id: 'QUIET_ENJOYMENT',
      name: 'Quiet Enjoyment Covenant',
      description: 'Lessor guarantees Lessee will not be disturbed',
      importance: 'recommended',
      missing: !lowerContent.includes('quiet enjoyment') &&
               !lowerContent.includes('peaceful possession'),
      aiPrompt: 'Add a quiet enjoyment covenant by the Lessor guaranteeing that the Lessee shall have peaceful and undisturbed possession of the premises throughout the lease term',
      aliases: ['quiet enjoyment', 'peaceful possession', 'undisturbed'],
      applicableTo: ['agreements'],
    },
    {
      id: 'TDS_RENT',
      name: 'TDS on Rent Clause',
      description: 'TDS applicable if annual rent exceeds ₹2.4 lakh',
      importance: 'recommended',
      missing: !lowerContent.includes('tds') &&
               !lowerContent.includes('tax deducted') &&
               !lowerContent.includes('194i'),
      aiPrompt: 'Add a TDS on rent clause addressing applicability of Section 194IB/194I of the Income Tax Act 1961 where annual rent exceeds Rs. 2,40,000',
      aliases: ['tds', 'tax deduction', '194i', '194ib'],
      applicableTo: ['agreements'],
    },
  ]

  return leaseChecks
}
