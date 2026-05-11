'use client'

import { useEffect, useState } from 'react'

type FontSize = 'sm' | 'md' | 'lg'

const STORAGE_KEY = 'article-font-size'

const labels: Record<FontSize, string> = {
  sm: 'A-',
  md: 'A',
  lg: 'A+',
}

const classMap: Record<FontSize, string> = {
  sm: 'article-font-sm',
  md: 'article-font-md',
  lg: 'article-font-lg',
}

const sizes: FontSize[] = ['sm', 'md', 'lg']

export default function FontSizeToggle() {
  const [size, setSize] = useState<FontSize>('md')

  /* Load saved preference on mount */
  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as FontSize) || 'md'
    if (sizes.includes(saved)) {
      setSize(saved)
      applyClass(saved)
    }
  }, [])

  function applyClass(s: FontSize) {
    const article = document.getElementById('article-root')
    if (!article) return
    sizes.forEach(sz => article.classList.remove(classMap[sz]))
    article.classList.add(classMap[s])
  }

  function changeSize(s: FontSize) {
    setSize(s)
    localStorage.setItem(STORAGE_KEY, s)
    applyClass(s)
  }

  return (
    <div
      className="inline-flex items-center gap-1 print:hidden"
      title="Adjust article font size"
      aria-label="Article font size"
    >
      <span className="text-xs text-slate-400 mr-0.5 hidden sm:inline">Text</span>
      {sizes.map((s) => (
        <button
          key={s}
          onClick={() => changeSize(s)}
          aria-pressed={size === s}
          className={`w-7 h-7 rounded-md text-xs font-semibold transition-all duration-200 border
            ${size === s
              ? 'bg-amber-400 text-navy border-amber-400 shadow-sm shadow-amber-200'
              : 'bg-white text-slate-500 border-slate-200 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50'
            }`}
        >
          {labels[s]}
        </button>
      ))}
    </div>
  )
}
