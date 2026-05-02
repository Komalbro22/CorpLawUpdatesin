'use client'

import { useEffect, useState } from 'react'

interface Heading {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  content: string
}

export default function TableOfContents({ 
  content 
}: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)

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

  useEffect(() => {
    if (!isOpen || headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    )

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings, isOpen])

  function scrollToSection(id: string) {
    const el = document.getElementById(id)
    if (!el) return
    const top = el.getBoundingClientRect().top + 
                window.scrollY - 80
    window.scrollTo({ top, behavior: 'smooth' })
    setActiveId(id)
  }

  if (headings.length < 3) return null

  return (
    <div className="my-6 print:hidden">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center gap-2 text-sm 
                   text-slate-500 hover:text-amber-600
                   border border-slate-200 
                   hover:border-amber-300
                   bg-white hover:bg-amber-50
                   px-4 py-2 rounded-full
                   transition-all duration-200
                   group"
      >
        <span className="text-base">📋</span>
        <span className="font-medium">
          {isOpen ? 'Hide' : 'Show'} Table of Contents
        </span>
        <span className={`ml-1 transition-transform 
                         duration-200 text-xs
                         ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
        <span className="text-xs text-slate-400 
                         group-hover:text-slate-500">
          ({headings.length} sections)
        </span>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="mt-3 bg-slate-50 border 
                        border-slate-200 rounded-2xl 
                        p-5 animate-in fade-in 
                        duration-200">
          <div className="flex flex-wrap gap-2">
            {headings.map((heading) => (
              <button
                key={heading.id}
                onClick={() => scrollToSection(heading.id)}
                className={`text-sm px-3 py-1.5 
                           rounded-full border 
                           transition-all duration-200
                           text-left
                           ${heading.level === 3 
                             ? 'text-xs' : ''}
                           ${activeId === heading.id
                             ? 'bg-amber-400 border-amber-400 text-navy font-semibold shadow-sm'
                             : 'bg-white border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50'
                           }`}
              >
                {heading.level === 3 && (
                  <span className="text-slate-400 mr-1">
                    ↳
                  </span>
                )}
                {heading.text}
              </button>
            ))}
          </div>

          {/* Close button at bottom */}
          <button
            onClick={() => setIsOpen(false)}
            className="mt-4 text-xs text-slate-400 
                       hover:text-slate-600 
                       transition-colors"
          >
            ✕ Close
          </button>
        </div>
      )}
    </div>
  )
}
