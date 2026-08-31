import Link from 'next/link'

type HubLink = { href: string; label: string; desc?: string }

const DEFAULT_LINKS: HubLink[] = [
  { href: '/updates', label: 'Latest Updates', desc: 'MCA, SEBI, RBI & more' },
  { href: '/category', label: 'Browse by Regulator', desc: '8 authority hubs' },
  { href: '/tools', label: 'Compliance Tools', desc: 'Calculators & generators' },
  { href: '/tools/cin-decoder', label: 'CIN Decoder', desc: 'Decode any company CIN' },
  { href: '/company-search', label: 'Company Search', desc: '15+ lakh companies' },
  { href: '/documents', label: 'Document Generator', desc: 'AI-powered drafts' },
  { href: '/glossary', label: 'Legal Glossary', desc: '200+ definitions' },
  { href: '/editorial-policy', label: 'Editorial Policy', desc: 'How we verify content' },
]

interface HubExploreLinksProps {
  title?: string
  links?: HubLink[]
  className?: string
}

export default function HubExploreLinks({
  title = 'Explore CorpLawUpdates',
  links = DEFAULT_LINKS,
  className = '',
}: HubExploreLinksProps) {
  return (
    <section className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 p-6 md:p-8 ${className}`}>
      <h2 className="text-lg font-bold text-navy dark:text-white font-heading mb-4">{title}</h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="block rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <span className="block text-sm font-bold text-navy dark:text-white">{link.label}</span>
              {link.desc && (
                <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">{link.desc}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
