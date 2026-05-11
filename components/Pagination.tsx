import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
    currentPage: number
    totalPages: number
    basePath: string
}

export default function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
    if (totalPages <= 1) return null

    let startPage = Math.max(1, currentPage - 2)
    let endPage = Math.min(totalPages, currentPage + 2)

    if (currentPage <= 3) {
        endPage = Math.min(5, totalPages)
    }
    if (currentPage >= totalPages - 2) {
        startPage = Math.max(1, totalPages - 4)
    }

    const pages = []
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
    }

    const getHref = (page: number) => {
        const separator = basePath.includes('?') ? '&' : '?'
        return `${basePath}${separator}page=${page}`
    }

    const navBtn =
        'inline-flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium transition-colors duration-200 motion-safe:transition-transform'

    return (
        <nav
            className="flex flex-wrap items-center justify-center gap-2 my-10"
            aria-label="Pagination"
        >
            {currentPage > 1 ? (
                <Link
                    href={getHref(currentPage - 1)}
                    scroll={false}
                    className={`${navBtn} text-navy bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm`}
                >
                    <ChevronLeft className="w-4 h-4" aria-hidden />
                    Previous
                </Link>
            ) : (
                <span
                    className={`${navBtn} text-slate-300 cursor-not-allowed bg-slate-50 border-slate-100`}
                    aria-disabled
                >
                    <ChevronLeft className="w-4 h-4 opacity-50" aria-hidden />
                    Previous
                </span>
            )}

            <div className="hidden sm:flex items-center gap-1 px-1">
                {startPage > 1 && (
                    <>
                        <Link
                            href={getHref(1)}
                            scroll={false}
                            className="w-10 h-10 flex text-sm font-medium items-center justify-center rounded-lg text-navy hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm transition-all duration-200"
                        >
                            1
                        </Link>
                        {startPage > 2 && <span className="px-2 text-slate-400 text-sm">…</span>}
                    </>
                )}

                {pages.map((page) => (
                    <Link
                        key={page}
                        href={getHref(page)}
                        scroll={false}
                        className={`w-10 h-10 flex text-sm font-bold items-center justify-center rounded-lg transition-all duration-200 ${
                            currentPage === page
                                ? 'bg-amber-400 text-navy shadow-md shadow-amber-200/40 ring-1 ring-amber-400/30 scale-[1.05]'
                                : 'text-navy hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm'
                        }`}
                        aria-current={currentPage === page ? 'page' : undefined}
                    >
                        {page}
                    </Link>
                ))}

                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span className="px-2 text-slate-400 text-sm">…</span>}
                        <Link
                            href={getHref(totalPages)}
                            scroll={false}
                            className="w-10 h-10 flex text-sm font-medium items-center justify-center rounded-lg text-navy hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm transition-all duration-200"
                        >
                            {totalPages}
                        </Link>
                    </>
                )}
            </div>

            <div className="flex sm:hidden items-center justify-center px-3 py-2 text-sm font-medium text-slate-600 bg-white rounded-lg border border-slate-200">
                Page {currentPage} of {totalPages}
            </div>

            {currentPage < totalPages ? (
                <Link
                    href={getHref(currentPage + 1)}
                    scroll={false}
                    className={`${navBtn} text-navy bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm`}
                >
                    Next
                    <ChevronRight className="w-4 h-4" aria-hidden />
                </Link>
            ) : (
                <span
                    className={`${navBtn} text-slate-300 cursor-not-allowed bg-slate-50 border-slate-100`}
                    aria-disabled
                >
                    Next
                    <ChevronRight className="w-4 h-4 opacity-50" aria-hidden />
                </span>
            )}
        </nav>
    )
}
