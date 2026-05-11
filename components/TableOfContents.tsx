'use client'

import { useEffect, useState } from 'react'
import { List, X } from 'lucide-react'

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

  /* IntersectionObserver — always active */
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

  function scrollToSection(id: string) {
    const el = document.getElementById(id)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - 88
    window.scrollTo({ top, behavior: 'smooth' })
    setActiveId(id)
    setMobileOpen(false)
  }

  if (headings.length < 3) return null

  /* ─── Desktop sticky sidebar ─── */
  const Sidebar = (
    <nav
      aria-label="Table of contents"
      className="hidden xl:block fixed right-6 top-24 w-60 max-h-[calc(100vh-7rem)] overflow-y-auto print:hidden z-30"
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-card p-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
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
                    ? 'bg-amber-50 text-amber-700 font-semibold border-l-2 border-amber-400 pl-[calc(0.625rem-2px)]'
                    : 'text-slate-500 hover:text-navy hover:bg-slate-50'
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

  /* ─── Mobile collapsible ─── */
  const MobilePanel = (
    <div className="xl:hidden my-6 print:hidden">
      <button
        onClick={() => setMobileOpen(prev => !prev)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-amber-600
                   border border-slate-200 hover:border-amber-300
                   bg-white hover:bg-amber-50
                   px-4 py-2 rounded-full transition-all duration-200 group w-full sm:w-auto"
      >
        <List className="w-4 h-4" aria-hidden />
        <span className="font-medium">
          {mobileOpen ? 'Hide' : 'Show'} Contents
        </span>
        <span className={`ml-auto transition-transform duration-200 text-xs ${mobileOpen ? 'rotate-180' : ''}`}>▼</span>
        <span className="text-xs text-slate-400">({headings.length} sections)</span>
      </button>

      {mobileOpen && (
        <div className="mt-3 bg-slate-50 border border-slate-200 rounded-2xl p-4 animate-fade-in">
          <div className="flex flex-wrap gap-2">
            {headings.map((heading) => (
              <button
                key={heading.id}
                onClick={() => scrollToSection(heading.id)}
                className={`text-sm px-3 py-1.5 rounded-full border transition-all duration-200 text-left
                  ${heading.level === 3 ? 'text-xs' : ''}
                  ${activeId === heading.id
                    ? 'bg-amber-400 border-amber-400 text-navy font-semibold shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50'
                  }`}
              >
                {heading.level === 3 && <span className="text-slate-400 mr-1">↳</span>}
                {heading.text}
              </button>
            ))}
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="mt-4 text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1"
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
