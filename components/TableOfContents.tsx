'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, CornerDownRight, List, X } from 'lucide-react'

interface Heading {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  content: string
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [atFooter, setAtFooter] = useState(false)

  /* Extract headings from DOM after render */
  useEffect(() => {
    const article = document.querySelector('.article-content')
    if (!article) return

    const elements = article.querySelectorAll('h2, h3')
    const extracted: Heading[] = []

    elements.forEach((el) => {
      const text = el.textContent?.trim() || ''
      if (!text) return

      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 50)

      el.id = id
      extracted.push({
        id,
        text: text.replace(/^[#\s]+/, '').trim(),
        level: el.tagName === 'H2' ? 2 : 3,
      })
    })

    setHeadings(extracted)
  }, [content])

  /* Track the currently visible section. */
  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        })
      },
      { rootMargin: '-15% 0px -70% 0px', threshold: 0 }
    )

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  /* Detect if end of article is reached to hide fixed sidebar */
  useEffect(() => {
    const sentinel = document.getElementById('article-end')
    const footer = document.querySelector('footer')
    if (!sentinel && !footer) return

    const observer = new IntersectionObserver(
      (entries) => {
        // If the footer is visible OR if the sentinel is in the upper part of viewport
        const footerVisible = entries.find(e => e.target.tagName === 'FOOTER')?.isIntersecting
        const sentinelVisible = entries.find(e => e.target.id === 'article-end')?.isIntersecting
        
        // We hide if footer is visible OR if we've scrolled well past the sentinel
        setAtFooter(!!footerVisible || (!!sentinelVisible && entries.find(e => e.target.id === 'article-end')!.boundingClientRect.top < 200))
      },
      { threshold: 0 }
    )

    if (sentinel) observer.observe(sentinel)
    if (footer) observer.observe(footer)
    return () => observer.disconnect()
  }, [])

  function scrollToSection(id: string) {
    const el = document.getElementById(id)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - 88
    window.scrollTo({ top, behavior: 'smooth' })
    setActiveId(id)
    setMobileOpen(false)
  }

  if (headings.length < 3) return null

  /* Desktop sticky sidebar */
  const Sidebar = (
    <nav
      aria-label="Table of contents"
      className={`hidden xl:block fixed right-6 top-24 w-60 max-h-[calc(100vh-7rem)] overflow-y-auto print:hidden z-30 transition-opacity duration-300 ${atFooter ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-card p-4">
        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <List className="w-3.5 h-3.5" aria-hidden />
          Contents
        </p>
        <ol className="space-y-0.5">
          {headings.map((heading) => (
            <li key={heading.id}>
              <button
                onClick={() => scrollToSection(heading.id)}
                className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-all duration-200 leading-snug
                  ${heading.level === 3 ? 'pl-5' : ''}
                  ${activeId === heading.id
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-semibold border-l-2 border-amber-400 pl-[calc(0.625rem-2px)]'
                    : 'text-slate-500 dark:text-slate-400 hover:text-navy dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
              >
                {heading.text}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  )

  /* Mobile collapsible contents */
  const MobilePanel = (
    <div className="xl:hidden my-6 print:hidden">
      <button
        onClick={() => setMobileOpen(prev => !prev)}
        className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400
                   border border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700
                   bg-white dark:bg-slate-900 hover:bg-amber-50 dark:hover:bg-amber-950/20
                   px-4 py-2.5 min-h-[44px] rounded-lg transition-all duration-200 group w-full sm:w-auto"
      >
        <List className="w-4 h-4 text-slate-400" aria-hidden />
        <span className="font-medium">
          {mobileOpen ? 'Hide' : 'Show'} Contents
        </span>
        <ChevronDown className={`ml-auto h-4 w-4 transition-transform duration-200 ${mobileOpen ? 'rotate-180' : ''}`} aria-hidden />
        <span className="text-xs text-slate-400 dark:text-slate-400">({headings.length} sections)</span>
      </button>

      {mobileOpen && (
        <div className="mt-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 animate-fade-in">
          <div className="flex flex-wrap gap-2">
            {headings.map((heading) => (
              <button
                key={heading.id}
                onClick={() => scrollToSection(heading.id)}
                className={`text-sm px-3 py-1.5 rounded-full border transition-all duration-200 text-left min-h-[36px]
                  ${heading.level === 3 ? 'text-xs' : ''}
                  ${activeId === heading.id
                    ? 'bg-amber-400 border-amber-400 text-navy font-semibold shadow-sm'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-300 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                  }`}
              >
                {heading.level === 3 && <CornerDownRight className="mr-1 inline h-3 w-3 text-slate-400" aria-hidden />}
                {heading.text}
              </button>
            ))}
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="mt-4 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex items-center gap-1 min-h-[36px]"
          >
            <X className="w-3 h-3" /> Close
          </button>
        </div>
      )}
    </div>
  )

  return (
    <>
      {Sidebar}
      {MobilePanel}
    </>
  )
}
