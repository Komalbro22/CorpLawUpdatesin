/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import rehypeRaw from 'rehype-raw'
import { sanitizeHtml } from '@/lib/sanitize'

function parseStyle(styleInput: any, node?: any): React.CSSProperties {
    let styleVal = styleInput;
    if (!styleVal && node && node.properties && node.properties.style) {
        styleVal = node.properties.style;
    }
    
    if (!styleVal) return {};
    
    if (typeof styleVal === 'object') {
        return styleVal;
    }
    
    if (typeof styleVal === 'string') {
        const obj: any = {};
        styleVal.split(';').forEach(rule => {
            const parts = rule.split(':');
            if (parts.length >= 2) {
                const rawKey = parts[0].trim();
                // Convert CSS property name to camelCase for React inline styles
                const key = rawKey.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                const value = parts.slice(1).join(':').trim();
                if (key && value) {
                    obj[key] = value;
                }
            }
        });
        return obj;
    }
    
    return {};
}

function processInlineStyles(styleObj: any, className: string = '', isContainer: boolean = false): { processedStyle: any; processedClassName: string } {
    const processedStyle = { ...styleObj };
    const classes = className ? className.split(' ') : [];
    
    const bgVal = styleObj.background || styleObj.backgroundColor;
    const colorVal = styleObj.color;
    
    // Detect progress bars, meters, tracks, pills, badges, or small components
    const heightStr = styleObj.height ? styleObj.height.toString().toLowerCase().trim() : '';
    const isSmallHeight = heightStr && (
        heightStr === '100%' ||
        (heightStr.endsWith('px') && parseFloat(heightStr) <= 60) ||
        (heightStr.endsWith('rem') && parseFloat(heightStr) <= 4) ||
        (heightStr.endsWith('em') && parseFloat(heightStr) <= 4) ||
        (heightStr.endsWith('vh') && parseFloat(heightStr) <= 10)
    );
    
    const isInlineOrBadge = 
        styleObj.display === 'inline' || 
        styleObj.display === 'inline-block' || 
        styleObj.display === 'inline-flex';
        
    const isProgressBarOrComponent = isSmallHeight || isInlineOrBadge || styleObj.maxHeight || (styleObj.overflow === 'hidden' && styleObj.height);
    
    // Only apply dynamic card callout styling to container boxes (div/section)
    // NEVER to progress bar tracks/fills, meters, badges, or inline elements
    if (isContainer && !isProgressBarOrComponent && bgVal && typeof bgVal === 'string') {
        const bgValLower = bgVal.toLowerCase().replace(/\s+/g, '');
        const isYellowAmberBg = 
            bgValLower.includes('#fff7ed') || 
            bgValLower.includes('#fffbeb') || 
            bgValLower.includes('#fef3c7') ||
            bgValLower.includes('#fef9c3') ||
            bgValLower.includes('#fef08a') ||
            bgValLower.includes('#fff3cd') ||
            bgValLower.includes('#fed7aa') || 
            bgValLower.includes('#fffaf5') || 
            bgValLower.includes('#ffedd5') || 
            bgValLower.includes('yellow') ||
            bgValLower.includes('rgb(255,247,237)') ||
            bgValLower.includes('rgb(255,251,235)') ||
            bgValLower.includes('rgb(254,243,199)') ||
            bgValLower.includes('rgb(254,240,138)') ||
            bgValLower.includes('rgb(254,215,170)');

        const isDarkBg = 
            bgValLower.includes('#0f172a') || 
            bgValLower.includes('#0f2342') ||
            bgValLower.includes('#0b1121') ||
            bgValLower.includes('#1e293b') ||
            bgValLower.includes('#1e3a5f') ||
            bgValLower.includes('#070c18') ||
            bgValLower.includes('#000000') ||
            bgValLower.includes('black') ||
            bgValLower.includes('rgb(15,23,42)') ||
            bgValLower.includes('rgb(15,35,66)') ||
            bgValLower.includes('rgb(30,41,59)');

        if (isYellowAmberBg) {
            classes.push('dynamic-card-amber');
            if (!colorVal || typeof colorVal !== 'string' || 
                colorVal.toLowerCase().includes('white') || 
                colorVal.toLowerCase().includes('#fff') ||
                colorVal.toLowerCase().includes('#f8fafc') ||
                colorVal.toLowerCase().includes('#e2e8f0') ||
                colorVal.toLowerCase().includes('#cbd5e1') ||
                colorVal.toLowerCase().includes('#94a3b8') ||
                colorVal.toLowerCase().includes('rgb(255,255,255)')
            ) {
                processedStyle.color = '#78350F';
                processedStyle.fontWeight = '700';
            }
        }
        else if (
            bgValLower.includes('#eff6ff') || 
            bgValLower.includes('#f0f9ff') ||
            bgValLower.includes('#e0f2fe') ||
            bgValLower.includes('#bfdbfe') || 
            bgValLower.includes('rgb(239,246,255)') ||
            bgValLower.includes('rgb(240,249,255)') ||
            bgValLower.includes('rgb(191,219,254)')
        ) {
            classes.push('dynamic-card-blue');
        }
        else if (
            bgValLower.includes('#f0fdf4') || 
            bgValLower.includes('#dcfce7') ||
            bgValLower.includes('#bbf7d0') || 
            bgValLower.includes('rgb(240,253,244)') ||
            bgValLower.includes('rgb(187,247,208)')
        ) {
            classes.push('dynamic-card-green');
        }
        else if (
            bgValLower.includes('#fff5f5') ||
            bgValLower.includes('#fef2f2') || 
            bgValLower.includes('#ffe4e6') || 
            bgValLower.includes('#fecaca') || 
            bgValLower.includes('rgb(254,242,242)') ||
            bgValLower.includes('rgb(254,202,202)')
        ) {
            classes.push('dynamic-card-red');
        }
        else if (
            bgValLower.includes('#f5f3ff') || 
            bgValLower.includes('#faf8ff') || 
            bgValLower.includes('#ddd6fe') || 
            bgValLower.includes('#e0e7ff') || 
            bgValLower.includes('#c7d2fe') || 
            bgValLower.includes('#eef2ff') || 
            bgValLower.includes('rgb(245,243,255)') ||
            bgValLower.includes('rgb(250,248,255)') ||
            bgValLower.includes('rgb(221,214,254)') ||
            bgValLower.includes('rgb(224,231,255)') ||
            bgValLower.includes('rgb(199,210,254)') ||
            bgValLower.includes('rgb(238,242,255)')
        ) {
            classes.push('dynamic-card-purple');
        }
        else if (
            bgValLower.includes('#fdf2f8') || 
            bgValLower.includes('#fbcfe8') || 
            bgValLower.includes('rgb(253,242,248)') ||
            bgValLower.includes('rgb(251,207,232)')
        ) {
            classes.push('dynamic-card-pink');
        }

        if (!isDarkBg && colorVal && typeof colorVal === 'string') {
            const cLower = colorVal.toLowerCase().replace(/\s+/g, '');
            if (
                cLower === 'white' || cLower === '#fff' || cLower === '#ffffff' ||
                cLower === '#f8fafc' || cLower === '#f1f5f9' || cLower === '#e2e8f0' ||
                cLower === '#cbd5e1' || cLower === '#94a3b8' ||
                cLower.includes('rgb(255,255,255)') || cLower.includes('rgba(255,255,255')
            ) {
                processedStyle.color = '#0F172A';
            }
        }
    } else if (colorVal && typeof colorVal === 'string') {
        const cLower = colorVal.toLowerCase().replace(/\s+/g, '');
        if (
            cLower === 'white' || cLower === '#fff' || cLower === '#ffffff' ||
            cLower === '#f8fafc' || cLower === '#f1f5f9' || cLower === '#e2e8f0' ||
            cLower === '#cbd5e1' || cLower === '#94a3b8' ||
            cLower.includes('rgb(255,255,255)') || cLower.includes('rgba(255,255,255')
        ) {
            processedStyle.color = '#0F172A';
        }
    }
    
    return {
        processedStyle,
        processedClassName: Array.from(new Set(classes.filter(Boolean))).join(' ')
    };
}

export default function MarkdownRenderer({ content }: { content: string }) {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!ref.current) return

        // Find all dark background divs
        const darkDivs = ref.current.querySelectorAll(
            'div[style*="background:#0F172A"], ' +
            'div[style*="background:#0f172a"], ' +
            'div[style*="background:#0F2342"], ' +
            'div[style*="background:#0f2342"], ' +
            'div[style*="background:#1e3a5f"], ' +
            'div[style*="background:#0b1121"], ' +
            'div[style*="background:#0B1121"]'
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
        })

        // Wrap any unwrapped table (e.g. raw HTML tables) in a scrollable overflow container
        const allTables = ref.current.querySelectorAll('table')
        allTables.forEach((table) => {
            if (!table.closest('.overflow-x-auto')) {
                const wrapper = document.createElement('div')
                wrapper.className = 'w-full overflow-x-auto my-6 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm scrollbar-thin'
                table.parentNode?.insertBefore(wrapper, table)
                wrapper.appendChild(table)
            }
        })
    }, [content])


    // Preprocess content to strip leading indentation from lines starting with HTML tags or comments.
    // This prevents standard CommonMark parser from treating indented HTML blocks as code blocks.
    const processedContent = content
        ? content.replace(/^\s+(?=<(?:\/)?(?:div|p|img|span|table|tr|td|th|tbody|thead|ul|ol|li|h[1-6]|a|strong|em|b|i|ins|del|iframe|svg|style|!--))/gim, '')
        : ''

    const sanitizedContent = sanitizeHtml(processedContent)

    return (
        <div ref={ref} suppressHydrationWarning className={`
          article-content prose prose-slate dark:prose-invert max-w-none
          prose-headings:text-navy dark:prose-headings:text-white
          prose-p:text-slate-700 dark:prose-p:text-slate-300
          prose-strong:text-inherit dark:prose-strong:text-amber-400
          prose-a:text-amber-600 dark:prose-a:text-amber-400
          prose-table:text-inherit
          prose-td:text-inherit
          prose-th:text-inherit
          [&_[style*='background:#0F172A']_p]:!text-slate-100
          [&_[style*='background:#0F172A']_h3]:!text-amber-400
          [&_[style*='background:#0F172A']_strong]:!text-amber-400
          [&_[style*='background:#0f2342']_p]:!text-slate-100
          [&_[style*='background:#0f2342']_h3]:!text-amber-400
          [&_[style*='background:#0b1121']_p]:!text-slate-100
          [&_[style*='background:#0b1121']_h3]:!text-amber-400
          [&_[style*='background:#0b1121']_div]:!text-slate-100
          [&_[style*='background:#0b1121']_strong]:!text-amber-400
          [&_[style*='background:#0b1121']_li]:!text-slate-100
          prose-headings:font-heading prose-a:no-underline hover:prose-a:underline prose-code:bg-slate-100 dark:prose-code:bg-slate-800 dark:prose-code:text-slate-200 prose-code:px-1 prose-code:rounded prose-img:max-w-full prose-img:h-auto prose-img:rounded-lg prose-img:mx-auto prose-img:block
        `}>
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
                    table: ({ node, style, className, children, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className);
                        return (
                            <div suppressHydrationWarning className="w-full overflow-x-auto my-6 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm scrollbar-thin">
                                <table suppressHydrationWarning style={processedStyle} className={`w-full border-collapse ${processedClassName}`} {...props}>
                                    {children}
                                </table>
                            </div>
                        );
                    },
                    thead: ({ node, style, className, children, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className);
                        return (
                            <thead suppressHydrationWarning style={processedStyle} className={processedClassName} {...props}>
                                {children}
                            </thead>
                        );
                    },
                    tbody: ({ node, style, className, children, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className);
                        return (
                            <tbody suppressHydrationWarning style={processedStyle} className={processedClassName} {...props}>
                                {children}
                            </tbody>
                        );
                    },
                    tr: ({ node, style, className, children, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className);
                        return (
                            <tr suppressHydrationWarning style={processedStyle} className={processedClassName} {...props}>
                                {children}
                            </tr>
                        );
                    },
                    th: ({ node, style, className, children, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className);
                        return (
                            <th suppressHydrationWarning style={processedStyle} className={`px-4 py-3 bg-slate-50 dark:bg-slate-800/80 text-left font-heading font-bold text-xs uppercase tracking-wider text-navy dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 ${processedClassName}`} {...props}>
                                {children}
                            </th>
                        );
                    },
                    td: ({ node, style, className, children, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className);
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
                        const isExternal = cleanHref && (cleanHref.startsWith('http://') || cleanHref.startsWith('https://'));
                        return (
                            <a
                                href={cleanHref}
                                target={isExternal ? '_blank' : undefined}
                                rel={isExternal ? 'noopener noreferrer' : undefined}
                                {...props}
                            >
                                {children}
                            </a>
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
    )
}
