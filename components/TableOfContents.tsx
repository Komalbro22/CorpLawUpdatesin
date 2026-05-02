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

  useEffect(() => {
    // Extract headings from rendered DOM
    const article = document.querySelector('.article-content')
    if (!article) return

    const elements = article.querySelectorAll('h2, h3')
    const extracted: Heading[] = []

    elements.forEach((el) => {
      const text = el.textContent?.trim() || ''
      if (!text) return

      // Generate ID from text
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 50)

      // Add ID to the heading element
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
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { 
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0 
      }
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

    const offset = 80 // navbar height
    const top = el.getBoundingClientRect().top + 
                window.scrollY - offset

    window.scrollTo({ top, behavior: 'smooth' })
    setActiveId(id)
  }

  // Don't show if less than 3 headings
  if (headings.length < 3) return null

  return (
    <div className="bg-slate-50 border border-slate-200 
                    rounded-2xl p-5 my-8 print:hidden">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">📋</span>
        <h3 className="font-bold text-navy text-sm 
                       uppercase tracking-wide">
          Jump to Section
        </h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {headings.map((heading) => (
          <button
            key={heading.id}
            onClick={() => scrollToSection(heading.id)}
            className={`text-sm px-4 py-1.5 rounded-full 
                       border transition-all duration-200
                       cursor-pointer text-left
                       ${heading.level === 3 
                         ? 'text-xs' 
                         : ''}
                       ${activeId === heading.id
                         ? 'bg-amber-400 border-amber-400 text-navy font-semibold'
                         : 'bg-white border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50'
                       }`}
          >
            {heading.level === 3 && (
              <span className="text-slate-400 mr-1">↳</span>
            )}
            {heading.text}
          </button>
        ))}
      </div>
    </div>
  )
}
