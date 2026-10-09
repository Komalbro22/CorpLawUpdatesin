'use client'

import { useEffect, useState } from 'react'

export default function SkipToContent() {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <a
      href="#main-content"
      className={`fixed top-0 left-0 z-100 p-4 bg-navy text-gold font-bold text-sm rounded-br-xl transition-all duration-200 ${
        isFocused ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      Skip to main content
    </a>
  )
}
