'use client'

import { useEffect, useRef } from 'react'

export default function AdsterraBanner() {
  const bannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = bannerRef.current
    if (!container) return
    if (container.dataset.rendered === 'true') return

    try {
      const confScript = document.createElement('script')
      confScript.type = 'text/javascript'
      confScript.innerHTML = `
        atOptions = {
          'key' : 'e6f8500f773f74f1f8b28528b11c76ef',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      `

      const invokeScript = document.createElement('script')
      invokeScript.type = 'text/javascript'
      invokeScript.src = 'https://www.highrevenueformat.com/e6f8500f773f74f1f8b28528b11c76ef/invoke.js'

      container.appendChild(confScript)
      container.appendChild(invokeScript)
      container.dataset.rendered = 'true'
    } catch (e) {
      console.warn('Adsterra banner initialization failed:', e)
    }
  }, [])

  return (
    <aside
      aria-label="Sponsored advertisement"
      className="my-8 flex flex-col items-center justify-center print:hidden w-full overflow-hidden"
    >
      <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 mb-1.5 tracking-widest">
        Advertisement
      </span>
      <div className="w-full flex justify-center items-center overflow-x-auto py-1">
        <div
          ref={bannerRef}
          style={{ width: '728px', minHeight: '90px' }}
          className="flex justify-center items-center shrink-0"
        />
      </div>
    </aside>
  )
}
