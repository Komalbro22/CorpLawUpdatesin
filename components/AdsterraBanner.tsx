'use client'

export default function AdsterraBanner() {
  return (
    <aside
      aria-label="Sponsored advertisement"
      className="my-8 flex flex-col items-center justify-center print:hidden w-full overflow-hidden"
    >
      <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 mb-1.5 tracking-widest">
        Advertisement
      </span>
      <div className="w-full flex justify-center items-center overflow-x-auto py-1">
        <iframe
          src="/ads/banner-728x90.html"
          width="728"
          height="90"
          title="Sponsored Advertisement"
          className="border-0 overflow-hidden shrink-0"
          scrolling="no"
          style={{ width: '728px', height: '90px' }}
        />
      </div>
    </aside>
  )
}

