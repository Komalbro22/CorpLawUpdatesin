'use client'
import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

export default function DarkModeToggle() {
  const [theme, setTheme] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)

  // Initialize on mount
  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(
      'cluin-theme'
    ) as Theme | null
    
    if (stored === 'dark') {
      setTheme('dark')
      setIsDark(true)
      document.documentElement.classList.add('dark')
    } else if (stored === 'light') {
      setTheme('light')
      setIsDark(false)
      document.documentElement.classList.remove('dark')
    } else {
      // System preference
      setTheme('system')
      const systemDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches
      setIsDark(systemDark)
      if (systemDark) {
        document.documentElement.classList.add('dark')
      }
    }
  }, [])

  // Listen for system preference changes
  useEffect(() => {
    if (theme !== 'system') return
    
    const mq = window.matchMedia(
      '(prefers-color-scheme: dark)'
    )
    
    function handleChange(e: MediaQueryListEvent) {
      setIsDark(e.matches)
      if (e.matches) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
    
    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener(
      'change', handleChange
    )
  }, [theme])

  function toggleDark() {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    
    if (newIsDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('cluin-theme', 'dark')
      setTheme('dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('cluin-theme', 'light')
      setTheme('light')
    }
  }

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl bg-slate-100 animate-pulse" />
    )
  }

  return (
    <button
      onClick={toggleDark}
      aria-label={isDark 
        ? 'Switch to light mode' 
        : 'Switch to dark mode'}
      title={isDark 
        ? 'Switch to light mode' 
        : 'Switch to dark mode'}
      className="relative w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
    >
      {/* Sun icon for light mode */}
      <svg
        className={`w-4 h-4 text-amber-500 absolute transition-all duration-300 ${isDark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
      </svg>
      
      {/* Moon icon for dark mode */}
      <svg
        className={`w-4 h-4 text-slate-300 absolute transition-all duration-300 ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    </button>
  )
}
