const BASE_URL = 'https://www.corplawupdates.in'

export interface EditorialDesk {
  name: string
  shortName: string
  tagline: string
  description: string
  email: string
  regulators: string[]
  url: string
  badgeText: string
}

export const EDITORIAL_DESKS: Record<string, EditorialDesk> = {
  MCA: {
    name: 'CorpLaw MCA & Corporate Compliance Desk',
    shortName: 'MCA & Corporate Desk',
    tagline: 'Curated & fact-checked corporate law intelligence. Sourced directly from Ministry of Corporate Affairs (MCA) notifications, Companies Act 2013 rules, and official Gazette of India releases.',
    description: 'Specialized corporate governance and MCA regulatory research desk at CorpLawUpdates.in, tracking Companies Act 2013 amendments, ROC filings, and corporate compliance circulars.',
    email: 'editorial@corplawupdates.in',
    regulators: ['Ministry of Corporate Affairs (MCA)', 'Registrar of Companies (RoC)', 'Gazette of India'],
    url: `${BASE_URL}/editorial-policy`,
    badgeText: '🏛️ MCA Compliance Desk',
  },
  SEBI: {
    name: 'CorpLaw Securities & Capital Markets Desk',
    shortName: 'SEBI & Capital Markets Desk',
    tagline: 'Verified securities and capital markets intelligence. Sourced directly from SEBI circulars, LODR amendments, ICDR regulations, and exchange disclosures.',
    description: 'Securities and capital markets research desk at CorpLawUpdates.in, analyzing SEBI regulations, listing obligations (LODR), insider trading norms, and market intermediary circulars.',
    email: 'editorial@corplawupdates.in',
    regulators: ['Securities and Exchange Board of India (SEBI)', 'NSE/BSE Filings', 'Gazette of India'],
    url: `${BASE_URL}/editorial-policy`,
    badgeText: '📈 Securities & SEBI Desk',
  },
  RBI: {
    name: 'CorpLaw Banking & Monetary Regulations Desk',
    shortName: 'Banking & RBI Desk',
    tagline: 'Real-time banking and monetary policy intelligence. Sourced directly from Reserve Bank of India (RBI) notifications, Master Directions, and financial circulars.',
    description: 'Banking and financial regulatory research desk at CorpLawUpdates.in, tracking RBI master directions, NBFC compliance, digital lending guidelines, and payment system directives.',
    email: 'editorial@corplawupdates.in',
    regulators: ['Reserve Bank of India (RBI)', 'Department of Financial Services', 'Gazette of India'],
    url: `${BASE_URL}/editorial-policy`,
    badgeText: '🏦 Banking & RBI Desk',
  },
  IBBI: {
    name: 'CorpLaw Insolvency & Bankruptcy Desk',
    shortName: 'Insolvency & IBBI Desk',
    tagline: 'Specialized corporate insolvency and restructuring intelligence. Sourced directly from Insolvency and Bankruptcy Board of India (IBBI) regulations and NCLT/NCLAT jurisprudence.',
    description: 'Insolvency and restructuring research desk at CorpLawUpdates.in, covering the Insolvency and Bankruptcy Code (IBC 2016), CIRP regulations, and liquidation rules.',
    email: 'editorial@corplawupdates.in',
    regulators: ['Insolvency and Bankruptcy Board of India (IBBI)', 'NCLT', 'NCLAT'],
    url: `${BASE_URL}/editorial-policy`,
    badgeText: '⚖️ Insolvency & IBBI Desk',
  },
  IBC: {
    name: 'CorpLaw Insolvency & Bankruptcy Desk',
    shortName: 'Insolvency & IBBI Desk',
    tagline: 'Specialized corporate insolvency and restructuring intelligence. Sourced directly from Insolvency and Bankruptcy Board of India (IBBI) regulations and NCLT/NCLAT jurisprudence.',
    description: 'Insolvency and restructuring research desk at CorpLawUpdates.in, covering the Insolvency and Bankruptcy Code (IBC 2016), CIRP regulations, and liquidation rules.',
    email: 'editorial@corplawupdates.in',
    regulators: ['Insolvency and Bankruptcy Board of India (IBBI)', 'NCLT', 'NCLAT'],
    url: `${BASE_URL}/editorial-policy`,
    badgeText: '⚖️ Insolvency & IBBI Desk',
  },
  LABOUR: {
    name: 'CorpLaw Labour & Employment Law Desk',
    shortName: 'Labour & EPFO Desk',
    tagline: 'Curated statutory employment and labour intelligence. Sourced directly from Ministry of Labour & Employment, EPFO notifications, ESIC circulars, and Gazette of India orders.',
    description: 'Statutory employment and labour law research desk at CorpLawUpdates.in, tracking EPFO wage ceiling updates, Labour Codes implementation, gratuity, and social security compliance.',
    email: 'editorial@corplawupdates.in',
    regulators: ['Ministry of Labour & Employment', 'Employees’ Provident Fund Organisation (EPFO)', 'ESIC', 'Gazette of India'],
    url: `${BASE_URL}/editorial-policy`,
    badgeText: '👷 Labour & EPFO Desk',
  },
  LABOUR_LAW: {
    name: 'CorpLaw Labour & Employment Law Desk',
    shortName: 'Labour & EPFO Desk',
    tagline: 'Curated statutory employment and labour intelligence. Sourced directly from Ministry of Labour & Employment, EPFO notifications, ESIC circulars, and Gazette of India orders.',
    description: 'Statutory employment and labour law research desk at CorpLawUpdates.in, tracking EPFO wage ceiling updates, Labour Codes implementation, gratuity, and social security compliance.',
    email: 'editorial@corplawupdates.in',
    regulators: ['Ministry of Labour & Employment', 'Employees’ Provident Fund Organisation (EPFO)', 'ESIC', 'Gazette of India'],
    url: `${BASE_URL}/editorial-policy`,
    badgeText: '👷 Labour & EPFO Desk',
  },
  FEMA: {
    name: 'CorpLaw Foreign Exchange & Cross-Border Desk',
    shortName: 'FEMA & Cross-Border Desk',
    tagline: 'Real-time cross-border compliance intelligence. Sourced directly from RBI Foreign Exchange Management Act (FEMA) circulars and DGFT trade notices.',
    description: 'Cross-border investment and foreign exchange research desk at CorpLawUpdates.in, covering FDI policy, Overseas Direct Investment (ODI), ECB regulations, and trade compliance.',
    email: 'editorial@corplawupdates.in',
    regulators: ['RBI Foreign Exchange Department', 'Directorate General of Foreign Trade (DGFT)', 'Ministry of Finance'],
    url: `${BASE_URL}/editorial-policy`,
    badgeText: '🌐 FEMA & Cross-Border Desk',
  },
  NCLT: {
    name: 'CorpLaw Company Law Tribunal Desk',
    shortName: 'NCLT & Tribunal Desk',
    tagline: 'Authoritative company law tribunal and dispute intelligence. Cross-referenced directly with NCLT and NCLAT bench orders and judgments.',
    description: 'Corporate dispute and tribunal research desk at CorpLawUpdates.in, tracking company petition rulings, merger sanction orders, oppression & mismanagement decisions, and appellate orders.',
    email: 'editorial@corplawupdates.in',
    regulators: ['National Company Law Tribunal (NCLT)', 'National Company Law Appellate Tribunal (NCLAT)', 'Supreme Court of India'],
    url: `${BASE_URL}/editorial-policy`,
    badgeText: '⚖️ NCLT Tribunal Desk',
  },
  CCI: {
    name: 'CorpLaw Competition & Anti-Trust Desk',
    shortName: 'Competition & Anti-Trust Desk',
    tagline: 'Curated market competition and anti-trust intelligence. Sourced directly from Competition Commission of India (CCI) orders and merger regulations.',
    description: 'Competition and anti-trust research desk at CorpLawUpdates.in, monitoring combination regulations, anti-competitive agreement rulings, and abuse of dominance inquiries.',
    email: 'editorial@corplawupdates.in',
    regulators: ['Competition Commission of India (CCI)', 'NCLAT Competition Bench'],
    url: `${BASE_URL}/editorial-policy`,
    badgeText: '🛡️ Competition Law Desk',
  },
  IFSCA: {
    name: 'CorpLaw International Financial Services Desk',
    shortName: 'IFSCA (GIFT City) Desk',
    tagline: 'Specialized international financial jurisdiction intelligence. Sourced directly from International Financial Services Centres Authority (IFSCA) regulations.',
    description: 'GIFT City and international financial services regulatory research desk at CorpLawUpdates.in, covering banking, fund management, and cross-border finance regulations in IFSC.',
    email: 'editorial@corplawupdates.in',
    regulators: ['International Financial Services Centres Authority (IFSCA)', 'GIFT City SEZ', 'Ministry of Finance'],
    url: `${BASE_URL}/editorial-policy`,
    badgeText: '🏢 IFSCA & GIFT City Desk',
  },
  TAX: {
    name: 'CorpLaw Corporate Taxation Desk',
    shortName: 'Direct Tax & CBDT Desk',
    tagline: 'Verified corporate taxation intelligence. Sourced directly from Central Board of Direct Taxes (CBDT) notifications and Finance Act provisions.',
    description: 'Corporate tax research desk at CorpLawUpdates.in, tracking direct tax circulars, transfer pricing norms, TDS/TCS provisions, and annual Finance Act statutory changes.',
    email: 'editorial@corplawupdates.in',
    regulators: ['Central Board of Direct Taxes (CBDT)', 'Income Tax Department', 'Ministry of Finance'],
    url: `${BASE_URL}/editorial-policy`,
    badgeText: '💼 Corporate Taxation Desk',
  },
}

export const DEFAULT_EDITORIAL_DESK: EditorialDesk = {
  name: 'CorpLaw Legal Research Desk',
  shortName: 'Legal Research Desk',
  tagline: 'Curated & fact-checked corporate law intelligence. Sourced directly from official Gazette notifications, MCA, SEBI, RBI, and EPFO circulars.',
  description: 'The central legal research and compliance editorial desk at CorpLawUpdates.in, researching and verifying statutory updates across Indian corporate, financial, and labour regulations.',
  email: 'editorial@corplawupdates.in',
  regulators: ['Gazette of India', 'Ministry of Corporate Affairs (MCA)', 'SEBI', 'RBI', 'EPFO'],
  url: `${BASE_URL}/editorial-policy`,
  badgeText: '⚖️ Legal Research Desk',
}

export function getEditorialDesk(category?: string | null): EditorialDesk {
  if (!category) return DEFAULT_EDITORIAL_DESK
  const key = category.trim().toUpperCase()
  return EDITORIAL_DESKS[key] || DEFAULT_EDITORIAL_DESK
}

export const EDITORIAL_AUTHOR = {
  name: DEFAULT_EDITORIAL_DESK.name,
  url: DEFAULT_EDITORIAL_DESK.url,
  jobTitle: 'Corporate Law Research & Compliance Editors',
  description: DEFAULT_EDITORIAL_DESK.description,
} as const

export function getArticleAuthorSchema(category?: string | null) {
  const desk = getEditorialDesk(category)
  return {
    '@type': 'Organization' as const,
    name: desk.name,
    url: desk.url,
    description: desk.description,
    email: desk.email,
    parentOrganization: {
      '@type': 'Organization' as const,
      name: 'CorpLawUpdates.in',
      url: BASE_URL,
      sameAs: [
        'https://x.com/CorpLawUpdates',
        'https://www.linkedin.com/company/corplawupdates/',
        'https://whatsapp.com/channel/0029VbCfcUEEgGfGLWOTvV1A',
        'https://t.me/corplawupdate',
      ],
    },
  }
}
