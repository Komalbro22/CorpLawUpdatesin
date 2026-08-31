const BASE_URL = 'https://www.corplawupdates.in'

export const EDITORIAL_AUTHOR = {
  name: 'CorpLawUpdates Editorial Desk',
  url: `${BASE_URL}/editorial-policy`,
  jobTitle: 'Corporate Law Research & Compliance Editors',
  description:
    'The editorial desk at CorpLawUpdates.in researches, verifies, and summarises Indian regulatory updates from official MCA, SEBI, RBI, CCI, NCLT, IBC, FEMA, and Labour Law sources.',
} as const

export function getArticleAuthorSchema() {
  return {
    '@type': 'Person' as const,
    name: EDITORIAL_AUTHOR.name,
    url: EDITORIAL_AUTHOR.url,
    jobTitle: EDITORIAL_AUTHOR.jobTitle,
    description: EDITORIAL_AUTHOR.description,
    worksFor: {
      '@type': 'Organization' as const,
      name: 'CorpLawUpdates.in',
      url: BASE_URL,
      sameAs: [
        'https://x.com/CorpLawUpdates',
        'https://www.linkedin.com/company/corplawupdates/',
      ],
    },
  }
}
