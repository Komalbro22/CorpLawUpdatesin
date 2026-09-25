'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import DownloadGatewayModal from '@/components/DownloadGatewayModal'

export default function CinDownloadButton({ cin }: { cin: string }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = `/api/tools/cin-decoder/pdf?cin=${cin}`
    a.download = `CIN_Breakdown_${cin}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 bg-navy hover:bg-slate-800 text-white dark:bg-amber-400 dark:hover:bg-amber-500 dark:text-navy font-bold px-4 py-2 rounded-xl text-xs md:text-sm transition-all shadow-sm active:scale-95 cursor-pointer"
      >
        <Download className="size-4" aria-hidden="true" /> Download PDF Certificate
      </button>

      <DownloadGatewayModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        fileName={`CIN_Breakdown_${cin}.pdf`}
        fileType="pdf"
        docTitle={`CIN Verification Certificate: ${cin}`}
        onProceedDownload={handleDownload}
      />
    </>
  )
}
