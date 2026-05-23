'use client'
import { useEffect, useState } from 'react'

export default function DarkModeToggle() {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check localStorage first, then system preference
    const stored = localStorage.getItem('darkMode')
    if (stored !== null) {
      const isDark = stored === 'true'
      setDark(isDark)
      document.documentElement.classList.toggle('dark', isDark)
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setDark(prefersDark)
      document.documentElement.classList.toggle('dark', prefersDark)
    }
  }, [])

  function toggle() {
    const newDark = !dark
    setDark(newDark)
    localStorage.setItem('darkMode', String(newDark))
    document.documentElement.classList.toggle('dark', newDark)
  }

  if (!mounted) return null

  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 bg-slate-200 dark:bg-slate-700 shrink-0"
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 flex items-center justify-center text-[10px] ${
          dark ? 'translate-x-5' : 'translate-x-0'
        }`}
      >
        {dark ? '🌙' : '☀️'}
      </span>
    </button>
  )
}
