import Link from 'next/link'

interface PaginationProps {
    currentPage: number
    totalPages: number
    basePath: string
}

export default function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
    if (totalPages <= 1) return null

    // Show max 5 pages
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
    
    // Determine proper query param separator
    const getHref = (page: number) => {
        const separator = basePath.includes('?') ? '&' : '?'
        return `${basePath}${separator}page=${page}`
    }

    return (
        <div className="flex items-center justify-center space-x-2 my-8">
            {currentPage > 1 ? (
                <Link
                    href={getHref(currentPage - 1)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-navy hover:bg-slate-50 transition-colors"
                >
                    Previous
                </Link>
            ) : (
                <span className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-300 cursor-not-allowed">
                    Previous
                </span>
            )}

            <div className="hidden sm:flex items-center space-x-1">
                {startPage > 1 && (
                    <>
                        <Link
                            href={getHref(1)}
                            className="w-10 h-10 flex text-sm font-medium items-center justify-center rounded-lg text-navy hover:bg-slate-50"
                        >
                            1
                        </Link>
                        {startPage > 2 && <span className="px-2 text-slate-400">...</span>}
                    </>
                )}

                {pages.map((page) => (
                    <Link
                        key={page}
                        href={getHref(page)}
                        className={`w-10 h-10 flex text-sm font-medium items-center justify-center rounded-lg ${currentPage === page
                                ? 'bg-navy text-white bg-opacity-90'
                                : 'text-navy hover:bg-slate-50'
                            }`}
                    >
                        {page}
                    </Link>
                ))}

                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span className="px-2 text-slate-400">...</span>}
                        <Link
                            href={getHref(totalPages)}
                            className="w-10 h-10 flex text-sm font-medium items-center justify-center rounded-lg text-navy hover:bg-slate-50"
                        >
                            {totalPages}
                        </Link>
                    </>
                )}
            </div>

            <div className="flex sm:hidden items-center justify-center px-4 text-sm font-medium text-slate-600">
                Page {currentPage} of {totalPages}
            </div>

            {currentPage < totalPages ? (
                <Link
                    href={getHref(currentPage + 1)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-navy hover:bg-slate-50 transition-colors"
                >
                    Next
                </Link>
            ) : (
                <span className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-300 cursor-not-allowed">
                    Next
                </span>
            )}
        </div>
    )
}
