import Link from 'next/link'
import { ShieldCheck, ArrowRight, BookOpen } from 'lucide-react'

export default function GlossaryAdBanner() {
  return (
    <div className="my-8 p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-navy text-white border border-amber-500/20 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
              Sponsored Compliance Partner
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <ShieldCheck className="size-3 text-emerald-400" /> Verified Legal Network
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold font-heading text-white leading-snug">
            Need Expert MCA Filing, CIRP Advisory, or Board Documentation?
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Get practical compliance guidance and drafting from qualified Practicing Company Secretaries and Corporate Advocates across India.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <Link
            href="/documents"
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-navy font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-md active:scale-95"
          >
            <BookOpen className="size-4" /> Legal Generators <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
