/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
'use client'

import dynamic from 'next/dynamic'
import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import rehypeRaw from 'rehype-raw'
import { sanitizeHtml } from '@/lib/sanitize'
import { isDownloadPromptSuppressed } from '@/lib/download-prompt-storage'
import { getProxiedImageUrl } from '@/lib/image-utils'
import {
    processInlineStyles,
    parseStyle,
    isDarkTableBg,
    isWhiteTableColor,
} from '@/lib/inline-style-processor'

const LazyDownloadSubscribePrompt = dynamic(
    () => import('@/components/DownloadSubscribePrompt'),
    { ssr: false }
)

function isGazetteDownloadLink(href: unknown): boolean {
    if (typeof href !== 'string' || typeof window === 'undefined') return false

    try {
        const url = new URL(href.trim(), window.location.origin)
        if (url.pathname.toLowerCase().endsWith('.pdf')) return true
        if (url.hostname.toLowerCase() !== 'drive.google.com') return false

        return /^\/file\/d\/[^/]+(?:\/|$)/i.test(url.pathname)
            || ((url.pathname === '/open' || url.pathname === '/uc') && url.searchParams.has('id'))
    } catch {
        return false
    }
}

interface TableStyleContextType {
    hasBg?: boolean;
    isDarkBg?: boolean;
    hasWhiteText?: boolean;
}

const TableStyleContext = createContext<TableStyleContextType>({});

export default function MarkdownRenderer({
    content,
    enableGazetteDownloadPrompt = false,
    sponsoredLinks = false,
    holdExternalLinks = false,
}: {
    content: string
    enableGazetteDownloadPrompt?: boolean
    sponsoredLinks?: boolean
    holdExternalLinks?: boolean
}) {
    const ref = useRef<HTMLDivElement>(null)
    const [gazettePromptOpen, setGazettePromptOpen] = useState(false)

    useEffect(() => {
        if (!ref.current) return

        // Find all dark background divs
        const darkDivs = ref.current.querySelectorAll(
            'div[style*="background:#0F172A"], ' +
            'div[style*="background:#0f172a"], ' +
            'div[style*="background:#0F2342"], ' +
            'div[style*="background:#0f2342"], ' +
            'div[style*="background:#0B2C4A"], ' +
            'div[style*="background:#0b2c4a"], ' +
            'div[style*="background:#1a2a5e"], ' +
            'div[style*="background:#0a1628"], ' +
            'div[style*="background:#1e3a5f"], ' +
            'div[style*="background:#0b1121"], ' +
            'div[style*="background:#0B1121"], ' +
            'tr[style*="background:#1a2a5e"], ' +
            'tr[style*="background:#0b2c4a"], ' +
            'tr[style*="background:#0f172a"], ' +
            'tr[style*="background:#0f2342"], ' +
            'thead[style*="background:#1a2a5e"], ' +
            'thead[style*="background:#0b2c4a"]'
        )

        darkDivs.forEach(div => {
            // Fix paragraph text
            div.querySelectorAll<HTMLElement>('p').forEach(p => {
                if (!p.style.color || 
                    p.style.color === 'inherit') {
                    p.style.color = '#F1F5F9'
                }
            })

            // Fix headings
            div.querySelectorAll<HTMLElement>('h3, h2').forEach(h => {
                if (!h.style.color) {
                    h.style.color = '#F59E0B'
                }
            })

            // Fix strong text
            div.querySelectorAll<HTMLElement>('strong').forEach(s => {
                if (!s.style.color) {
                    s.style.color = '#F59E0B'
                }
            })

            // Fix table header cells inside dark rows/heads
            div.querySelectorAll<HTMLElement>('th').forEach(th => {
                th.style.backgroundColor = 'transparent'
                th.style.color = '#ffffff'
            })
        })

        // Wrap any unwrapped table (e.g. raw HTML tables) in a scrollable overflow container
        const allTables = ref.current.querySelectorAll('table')
        allTables.forEach((table) => {
            if (!table.closest('.overflow-x-auto')) {
                const wrapper = document.createElement('div')
                wrapper.className = 'w-full overflow-x-auto my-6 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs scrollbar-thin'
                table.parentNode?.insertBefore(wrapper, table)
                wrapper.appendChild(table)
            }
        })

        // Normalize any malformed lists (ensuring ul/ol have only li children for WCAG 1.3.1)
        const allLists = ref.current.querySelectorAll('ul, ol')
        allLists.forEach((list) => {
            Array.from(list.children).forEach((child) => {
                if (child.tagName.toLowerCase() !== 'li') {
                    const li = document.createElement('li')
                    child.parentNode?.insertBefore(li, child)
                    li.appendChild(child)
                }
            })
        })
    }, [content])


    // Preprocess content:
    // 1. Strip leading indentation from lines starting with ANY HTML tags or comments so CommonMark won't parse them as code blocks.
    // 2. Collapse all empty lines inside <svg>...</svg> blocks to prevent CommonMark from closing the HTML block prematurely and dumping SVG inner tags as plaintext/markdown <p>.
    let processedContent = content || ''
    if (processedContent) {
        processedContent = processedContent.replace(/^[ \t]+(?=<\/?(?:[a-zA-Z][a-zA-Z0-9:-]*|!--|!DOCTYPE))/gm, '')
        processedContent = processedContent.replace(/<svg[\s\S]*?<\/svg>/gi, (svgBlock) => {
            return svgBlock
                .replace(/\n/g, '\n')
                .replace(/>\s*\n+\s*</g, '><')
                .replace(/\n+/g, ' ')
        })
    }

    const sanitizedContent = sanitizeHtml(processedContent)

    return (
        <>
        <div ref={ref} suppressHydrationWarning className={`
          article-content prose prose-slate dark:prose-invert max-w-none w-full break-words overflow-x-hidden prose-pre:overflow-x-auto prose-pre:max-w-full
          prose-headings:text-navy dark:prose-headings:text-white
          prose-p:text-slate-700 dark:prose-p:text-slate-300
          prose-strong:text-inherit dark:prose-strong:text-amber-400
          prose-a:text-amber-600 dark:prose-a:text-amber-400
          prose-table:text-inherit
          prose-td:text-inherit
          prose-th:text-inherit
          [&_[style*='background:#0F172A']_p]:text-slate-100!
          [&_[style*='background:#0F172A']_h3]:text-amber-400!
          [&_[style*='background:#0F172A']_strong]:text-amber-400!
          [&_[style*='background:#0f2342']_p]:text-slate-100!
          [&_[style*='background:#0f2342']_h3]:text-amber-400!
          [&_[style*='background:#0b1121']_p]:text-slate-100!
          [&_[style*='background:#0b1121']_h3]:text-amber-400!
          [&_[style*='background:#0b1121']_div]:text-slate-100!
          [&_[style*='background:#0b1121']_strong]:text-amber-400!
          [&_[style*='background:#0b1121']_li]:text-slate-100!
          [&_[style*='background:#1a2a5e']_p]:text-slate-100!
          [&_[style*='background:#1a2a5e']_h3]:text-amber-400!
          [&_[style*='background:#1a2a5e']_strong]:text-amber-400!
          [&_[style*='background:#0b2c4a']_p]:text-slate-100!
          [&_[style*='background:#0b2c4a']_h3]:text-amber-400!
          [&_[style*='background:#0b2c4a']_strong]:text-amber-400!
          prose-headings:font-heading prose-a:no-underline prose-a:hover:underline prose-code:bg-slate-100 dark:prose-code:bg-slate-800 dark:prose-code:text-slate-200 prose-code:px-1 prose-code:rounded-sm prose-img:max-w-full prose-img:h-auto prose-img:rounded-lg prose-img:mx-auto prose-img:block
        `}>
          <div className="dynamic-text-adaptive entry-content post-content w-full">
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                rehypePlugins={[rehypeRaw]}
                components={{
                    p: ({ node, style, children, className, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className);
                        return (
                            <p suppressHydrationWarning style={{ marginBottom: '1rem', marginTop: '0.5rem', ...processedStyle }} className={processedClassName} {...props}>
                                {children}
                            </p>
                        );
                    },
                    div: ({ node, style, children, className, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className, true);
                        return (
                            <div suppressHydrationWarning style={processedStyle} className={processedClassName} {...props}>
                                {children}
                            </div>
                        );
                    },
                    section: ({ node, style, children, className, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className, true);
                        return (
                            <section suppressHydrationWarning style={processedStyle} className={processedClassName} {...props}>
                                {children}
                            </section>
                        );
                    },
                    article: ({ node, style, children, className, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className, true);
                        return (
                            <article suppressHydrationWarning style={processedStyle} className={processedClassName} {...props}>
                                {children}
                            </article>
                        );
                    },
                    aside: ({ node, style, children, className, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className, true);
                        return (
                            <aside suppressHydrationWarning style={processedStyle} className={processedClassName} {...props}>
                                {children}
                            </aside>
                        );
                    },
                    header: ({ node, style, children, className, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className, true);
                        return (
                            <header suppressHydrationWarning style={processedStyle} className={processedClassName} {...props}>
                                {children}
                            </header>
                        );
                    },
                    footer: ({ node, style, children, className, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className, true);
                        return (
                            <footer suppressHydrationWarning style={processedStyle} className={processedClassName} {...props}>
                                {children}
                            </footer>
                        );
                    },
                    blockquote: ({ node, style, children, className, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className, true);
                        return (
                            <blockquote suppressHydrationWarning style={processedStyle} className={`border-l-4 border-amber-500 pl-4 my-4 italic text-slate-700 dark:text-slate-300 ${processedClassName}`} {...props}>
                                {children}
                            </blockquote>
                        );
                    },
                    details: ({ node, style, children, className, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className, true);
                        return (
                            <details
                                suppressHydrationWarning
                                style={processedStyle}
                                className={`group my-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/50 p-4 transition-all duration-200 open:shadow-xs dark:border-slate-800! dark:bg-slate-900/60! ${processedClassName}`}
                                {...props}
                            >
                                {children}
                            </details>
                        );
                    },
                    summary: ({ node, style, children, className, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className);
                        return (
                            <summary
                                suppressHydrationWarning
                                style={processedStyle}
                                className={`cursor-pointer font-bold select-none py-1 text-navy dark:text-slate-100 hover:text-amber-600 dark:hover:text-amber-400 transition-colors [&::-webkit-details-marker]:text-amber-500 [&::marker]:text-amber-500 ${processedClassName}`}
                                {...props}
                            >
                                {children}
                            </summary>
                        );
                    },
                    span: ({ node, style, children, className, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className);
                        return (
                            <span suppressHydrationWarning style={processedStyle} className={processedClassName} {...props}>
                                {children}
                            </span>
                        );
                    },
                    li: ({ node, style, children, className, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className);
                        return (
                            <li suppressHydrationWarning style={processedStyle} className={processedClassName} {...props}>
                                {children}
                            </li>
                        );
                    },
                    ul: ({ node, style, children, className, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className);
                        return (
                            <ul suppressHydrationWarning style={processedStyle} className={processedClassName} {...props}>
                                {children}
                            </ul>
                        );
                    },
                    ol: ({ node, style, children, className, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className);
                        return (
                            <ol suppressHydrationWarning style={processedStyle} className={processedClassName} {...props}>
                                {children}
                            </ol>
                        );
                    },
                    h1: ({ node, style, children, className, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className);
                        return <h1 suppressHydrationWarning style={processedStyle} className={processedClassName} {...props}>{children}</h1>;
                    },
                    h2: ({ node, style, children, className, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className);
                        return <h2 suppressHydrationWarning style={processedStyle} className={processedClassName} {...props}>{children}</h2>;
                    },
                    h3: ({ node, style, children, className, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className);
                        return <h3 suppressHydrationWarning style={processedStyle} className={processedClassName} {...props}>{children}</h3>;
                    },
                    h4: ({ node, style, children, className, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className);
                        return <h4 suppressHydrationWarning style={processedStyle} className={processedClassName} {...props}>{children}</h4>;
                    },
                    h5: ({ node, style, children, className, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className);
                        return <h5 suppressHydrationWarning style={processedStyle} className={processedClassName} {...props}>{children}</h5>;
                    },
                    h6: ({ node, style, children, className, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className);
                        return <h6 suppressHydrationWarning style={processedStyle} className={processedClassName} {...props}>{children}</h6>;
                    },
                    strong: ({ node, style, children, className, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className);
                        return <strong suppressHydrationWarning style={processedStyle} className={processedClassName} {...props}>{children}</strong>;
                    },
                    b: ({ node, style, children, className, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className);
                        return <strong suppressHydrationWarning style={processedStyle} className={processedClassName} {...props}>{children}</strong>;
                    },
                    em: ({ node, style, children, className, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className);
                        return <em suppressHydrationWarning style={processedStyle} className={processedClassName} {...props}>{children}</em>;
                    },
                    i: ({ node, style, children, className, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className);
                        return <i suppressHydrationWarning style={processedStyle} className={processedClassName} {...props}>{children}</i>;
                    },
                    table: ({ node, style, className, children, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className, false, true);
                        return (
                            <div suppressHydrationWarning className="w-full overflow-x-auto my-6 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs scrollbar-thin">
                                <table suppressHydrationWarning style={processedStyle} className={`w-full border-collapse ${processedClassName}`} {...props}>
                                    {children}
                                </table>
                            </div>
                        );
                    },
                    thead: ({ node, style, className, children, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className, false, true);
                        const bg = (styleObj.background || styleObj.backgroundColor || processedStyle.background || processedStyle.backgroundColor || '').toString();
                        const color = (styleObj.color || processedStyle.color || '').toString();
                        const hasBg = Boolean(bg && bg.trim() !== 'transparent');
                        const isDark = isDarkTableBg(bg);
                        const isWhite = isWhiteTableColor(color);

                        return (
                            <TableStyleContext.Provider value={{ hasBg, isDarkBg: isDark, hasWhiteText: isWhite }}>
                                <thead suppressHydrationWarning style={processedStyle} className={processedClassName} {...props}>
                                    {children}
                                </thead>
                            </TableStyleContext.Provider>
                        );
                    },
                    tbody: ({ node, style, className, children, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className, false, true);
                        return (
                            <tbody suppressHydrationWarning style={processedStyle} className={processedClassName} {...props}>
                                {children}
                            </tbody>
                        );
                    },
                    tr: ({ node, style, className, children, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className, false, true);
                        const parentCtx = useContext(TableStyleContext);

                        const bg = (styleObj.background || styleObj.backgroundColor || processedStyle.background || processedStyle.backgroundColor || '').toString();
                        const color = (styleObj.color || processedStyle.color || '').toString();
                        
                        const rowHasBg = Boolean(bg && bg.trim() !== 'transparent');
                        const isDark = isDarkTableBg(bg) || (!rowHasBg && parentCtx.isDarkBg);
                        const isWhite = isWhiteTableColor(color) || (!color && parentCtx.hasWhiteText);
                        const hasBg = rowHasBg || parentCtx.hasBg;

                        return (
                            <TableStyleContext.Provider value={{ hasBg, isDarkBg: isDark, hasWhiteText: isWhite }}>
                                <tr suppressHydrationWarning style={processedStyle} className={processedClassName} {...props}>
                                    {children}
                                </tr>
                            </TableStyleContext.Provider>
                        );
                    },
                    th: ({ node, style, className, children, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className, false, true);
                        const ctx = useContext(TableStyleContext);

                        const selfBg = (styleObj.background || styleObj.backgroundColor || processedStyle.background || processedStyle.backgroundColor || '').toString();
                        const hasCustomBg = !!(selfBg && selfBg.trim() !== 'transparent');
                        const isDarkBg = isDarkTableBg(selfBg) || (!hasCustomBg && ctx.isDarkBg);
                        
                        const selfColor = (styleObj.color || processedStyle.color || '').toString();
                        const hasWhiteText = isWhiteTableColor(selfColor) || (!selfColor && ctx.hasWhiteText);

                        if (isDarkBg || hasWhiteText) {
                            processedStyle.color = '#ffffff';
                        }

                        // Header background resolution:
                        // 1. If TH itself has an inline background, preserve it (no extra class).
                        // 2. If parent TR or THEAD has a background, make TH transparent so row background shows through cleanly!
                        // 3. Otherwise (unadorned default table), apply default subtle slate header background.
                        let defaultBg = '';
                        if (hasCustomBg) {
                            defaultBg = '';
                        } else if (ctx.hasBg) {
                            defaultBg = 'bg-transparent';
                        } else {
                            defaultBg = 'bg-slate-50 dark:bg-slate-800/80';
                        }

                        const defaultText = (isDarkBg || hasWhiteText) ? 'text-white' : 'text-navy dark:text-slate-200';

                        return (
                            <th
                                suppressHydrationWarning
                                style={processedStyle}
                                className={`px-4 py-3 text-left font-heading font-bold text-sm tracking-normal border-b border-slate-200 dark:border-slate-700 ${defaultBg} ${defaultText} ${processedClassName}`}
                                {...props}
                            >
                                {(isDarkBg || hasWhiteText) ? (
                                    <span style={{ color: '#ffffff' }} className="text-white font-bold inline-block">
                                        {children}
                                    </span>
                                ) : (
                                    children
                                )}
                            </th>
                        );
                    },
                    td: ({ node, style, className, children, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className, false, true);
                        return (
                            <td suppressHydrationWarning style={processedStyle} className={`px-4 py-3 text-sm text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800/80 align-top ${processedClassName}`} {...props}>
                                {children}
                            </td>
                        );
                    },
                    mark: ({ node, style, className, children, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className);
                        return (
                            <mark style={{ backgroundColor: '#FEF08A', color: '#78350F', fontWeight: 700, padding: '0.1em 0.35em', borderRadius: '0.25rem', ...processedStyle }} className={processedClassName} {...props}>
                                {children}
                            </mark>
                        );
                    },
                    a: ({ node, href, children, ...props }: any) => {
                        const cleanHref = typeof href === 'string' ? href.trim() : href;
                        const isHttpUrl = typeof cleanHref === 'string' && /^https?:\/\//i.test(cleanHref)
                        let isExternal = false
                        if (typeof cleanHref === 'string' && cleanHref) {
                            try {
                                const destination = new URL(cleanHref, 'https://www.corplawupdates.in')
                                isExternal = ['http:', 'https:'].includes(destination.protocol)
                                    && !['www.corplawupdates.in', 'corplawupdates.in'].includes(destination.hostname.toLowerCase())
                            } catch {
                                isExternal = false
                            }
                        }
                        if (sponsoredLinks && isExternal && holdExternalLinks) {
                            return <>{children}</>
                        }
                        return (
                            <a
                                {...props}
                                href={cleanHref}
                                target={(sponsoredLinks ? isExternal : isHttpUrl) ? '_blank' : undefined}
                                rel={sponsoredLinks && isExternal ? 'sponsored noopener noreferrer' : (isExternal ? 'noopener noreferrer' : undefined)}
                                onClick={(event) => {
                                    props.onClick?.(event)
                                    if (
                                        enableGazetteDownloadPrompt
                                        && !event.defaultPrevented
                                        && isGazetteDownloadLink(cleanHref)
                                        && !isDownloadPromptSuppressed()
                                    ) {
                                        // Preserve the anchor's native navigation/download behavior.
                                        setGazettePromptOpen(true)
                                    }
                                }}
                            >
                                {children}
                            </a>
                        );
                    },
                    svg: ({ node, style, className, children, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        return (
                            <div suppressHydrationWarning className="w-full my-6 overflow-x-auto flex justify-center">
                                <svg
                                    suppressHydrationWarning
                                    style={{ maxWidth: '100%', height: 'auto', ...styleObj }}
                                    className={className}
                                    {...props}
                                >
                                    {children}
                                </svg>
                            </div>
                        );
                    },

                    img: ({ node, style, src, alt, border, align, hspace, vspace, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        let resolvedSrc = typeof src === 'string' ? src.trim() : (src || '');
                        if (resolvedSrc && !resolvedSrc.startsWith('http://') && !resolvedSrc.startsWith('https://') && !resolvedSrc.startsWith('data:')) {
                            if (!resolvedSrc.startsWith('/')) {
                                resolvedSrc = '/' + resolvedSrc;
                            }
                        }
                        resolvedSrc = getProxiedImageUrl(resolvedSrc) || resolvedSrc;

                        return (
                            <img
                                src={resolvedSrc}
                                alt={alt || ''}
                                loading="lazy"
                                decoding="async"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                    const target = e.currentTarget;
                                    if (!target.dataset.hasFailed) {
                                        target.dataset.hasFailed = 'true';
                                        target.style.display = 'none';
                                    }
                                }}
                                style={{
                                    maxWidth: '100%',
                                    height: 'auto',
                                    display: 'block',
                                    margin: '1.5rem auto',
                                    borderRadius: '0.75rem',
                                    boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.08)',
                                    ...styleObj
                                }}
                                {...props}
                            />
                        );
                    },

                    style: ({ node, children, ...props }: any) => {
                        let cssContent = '';
                        if (node && node.children && node.children[0]) {
                            cssContent = node.children[0].value || '';
                        } else if (typeof children === 'string') {
                            cssContent = children;
                        } else if (Array.isArray(children)) {
                            cssContent = children.map(c => typeof c === 'string' ? c : (c?.props?.children || '')).join('');
                        }
                        // Sanitize CSS: strip expressions, imports, urls, behaviors that could be exploited
                        cssContent = cssContent
                            .replace(/expression\s*\(/gi, '')
                            .replace(/@import\b/gi, '')
                            .replace(/behavior\s*:/gi, '')
                            .replace(/javascript\s*:/gi, '')
                            .replace(/-moz-binding\s*:/gi, '')
                            .replace(/url\s*\(\s*["']?\s*javascript:/gi, 'url(""')
                        return (
                            <style dangerouslySetInnerHTML={{ __html: cssContent }} {...props} />
                        );
                    }
                }}
            >
                {sanitizedContent}
            </ReactMarkdown>
          </div>
        </div>
        {enableGazetteDownloadPrompt && gazettePromptOpen && (
            <LazyDownloadSubscribePrompt
                open={gazettePromptOpen}
                source="gazette-pdf"
                onClose={() => setGazettePromptOpen(false)}
            />
        )}
        </>
    )
}
