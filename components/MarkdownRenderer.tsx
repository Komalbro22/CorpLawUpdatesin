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
    
    if (bgVal && typeof bgVal === 'string') {
        const bgLower = bgVal.toLowerCase().replace(/\s+/g, '');
        
        const isYellowAmberBg = 
            bgLower.includes('#fff7ed') || 
            bgLower.includes('#fffbeb') || 
            bgLower.includes('#fef3c7') ||
            bgLower.includes('#fef9c3') ||
            bgLower.includes('#fef08a') ||
            bgLower.includes('#fff3cd') ||
            bgLower.includes('#fed7aa') || 
            bgLower.includes('#fffaf5') || 
            bgLower.includes('#ffedd5') || 
            bgLower.includes('#fefce8') || 
            bgLower.includes('yellow') ||
            bgLower.includes('rgb(255,247,237)') ||
            bgLower.includes('rgb(255,251,235)') ||
            bgLower.includes('rgb(254,243,199)') ||
            bgLower.includes('rgb(254,240,138)') ||
            bgLower.includes('rgb(254,215,170)');

        const isBlueBg =
            bgLower.includes('#eff6ff') || 
            bgLower.includes('#f0f4ff') ||
            bgLower.includes('#f0f5ff') ||
            bgLower.includes('#f0f6ff') ||
            bgLower.includes('#f0f9ff') ||
            bgLower.includes('#e0f2fe') ||
            bgLower.includes('#bfdbfe') || 
            bgLower.includes('#e0e7ff') || 
            bgLower.includes('#eef2ff') || 
            bgLower.includes('#dbeafe') || 
            bgLower.includes('#e6e8ff') || 
            bgLower.includes('#e8eeff') || 
            bgLower.includes('#ecfeff') || 
            bgLower.includes('rgb(239,246,255)') ||
            bgLower.includes('rgb(240,249,255)') ||
            bgLower.includes('rgb(191,219,254)');

        const isGreenBg =
            bgLower.includes('#f0fdf4') || 
            bgLower.includes('#dcfce7') ||
            bgLower.includes('#bbf7d0') || 
            bgLower.includes('#ecfdf3') || 
            bgLower.includes('#ecfdf5') || 
            bgLower.includes('#f0fdfa') || 
            bgLower.includes('#d1fae5') || 
            bgLower.includes('#d4edd9') || 
            bgLower.includes('#e8f5e9') || 
            bgLower.includes('#f3fdf7') || 
            bgLower.includes('rgb(240,253,244)') ||
            bgLower.includes('rgb(187,247,208)');

        const isRedBg =
            bgLower.includes('#fff5f5') ||
            bgLower.includes('#fef2f2') || 
            bgLower.includes('#ffe4e6') || 
            bgLower.includes('#fecaca') || 
            bgLower.includes('#faf4f4') || 
            bgLower.includes('#f5dada') || 
            bgLower.includes('rgb(254,242,242)') ||
            bgLower.includes('rgb(254,202,202)');

        const isPinkBg =
            bgLower.includes('#fdf2f8') || 
            bgLower.includes('#fbcfe8') || 
            bgLower.includes('rgb(253,242,248)') ||
            bgLower.includes('rgb(251,207,232)');

        const isPurpleBg =
            bgLower.includes('#f5f3ff') || 
            bgLower.includes('#faf8ff') || 
            bgLower.includes('#ddd6fe') || 
            bgLower.includes('#c7d2fe') || 
            bgLower.includes('#f5f0ff') || 
            bgLower.includes('#faf5ff') || 
            bgLower.includes('rgb(245,243,255)') ||
            bgLower.includes('rgb(250,248,255)');

        const isDarkBg = 
            bgLower.includes('#0f172a') || 
            bgLower.includes('#0f2342') ||
            bgLower.includes('#0b1121') ||
            bgLower.includes('#1e293b') ||
            bgLower.includes('#1e3a5f') ||
            bgLower.includes('#070c18') ||
            bgLower.includes('#000000') ||
            bgLower === 'black' ||
            bgLower.includes('rgb(15,23,42)') ||
            bgLower.includes('rgb(15,35,66)') ||
            bgLower.includes('rgb(30,41,59)');

        const isNeutralLightBg =
            bgLower.includes('#ffffff') ||
            bgLower.includes('#fff') ||
            bgLower === 'white' ||
            bgLower.includes('#f8fafc') ||
            bgLower.includes('#f1f5f9') ||
            bgLower.includes('#f9fafb') ||
            bgLower.includes('#f3f4f6') ||
            bgLower.includes('#e2e8f0') ||
            bgLower.includes('#dbe3ef') ||
            bgLower.includes('#e8edf4') ||
            bgLower.includes('#eef1f6') ||
            bgLower.includes('#f7f7f7') ||
            bgLower.includes('#f7f8fa') ||
            bgLower.includes('#f7f9fc') ||
            bgLower.includes('#f8f4ee') ||
            bgLower.includes('#f9f7f3') ||
            bgLower.includes('#ddd8cc') ||
            bgLower.includes('rgb(255,255,255)') ||
            bgLower.includes('rgb(248,250,252)') ||
            bgLower.includes('rgb(241,245,249)') ||
            bgLower.includes('rgb(249,250,251)');

        if (!isProgressBarOrComponent) {
            if (isYellowAmberBg) {
                classes.push('dynamic-card-amber');
                delete processedStyle.background;
                delete processedStyle.backgroundColor;
            } else if (isBlueBg) {
                classes.push('dynamic-card-blue');
                delete processedStyle.background;
                delete processedStyle.backgroundColor;
            } else if (isGreenBg) {
                classes.push('dynamic-card-green');
                delete processedStyle.background;
                delete processedStyle.backgroundColor;
            } else if (isRedBg) {
                classes.push('dynamic-card-red');
                delete processedStyle.background;
                delete processedStyle.backgroundColor;
            } else if (isPinkBg) {
                classes.push('dynamic-card-pink');
                delete processedStyle.background;
                delete processedStyle.backgroundColor;
            } else if (isPurpleBg) {
                classes.push('dynamic-card-purple');
                delete processedStyle.background;
                delete processedStyle.backgroundColor;
            } else if (isNeutralLightBg) {
                if (processedStyle.borderLeft || styleObj.borderLeft) {
                    classes.push('dynamic-card-neutral');
                } else {
                    classes.push('dynamic-box-neutral');
                }
                delete processedStyle.background;
                delete processedStyle.backgroundColor;
                delete processedStyle.borderColor;
            } else if (isDarkBg) {
                classes.push('dynamic-card-dark');
                if (processedStyle.color && typeof processedStyle.color === 'string') {
                    const c = processedStyle.color.toLowerCase().replace(/\s+/g, '');
                    if (c === '#0f172a' || c === '#1a1a2e' || c === '#1e3a5f' || c === '#000' || c === '#000000') {
                        delete processedStyle.color;
                    }
                }
            }
        }
    }

    // Handle dark text color on canvas/containers in dark mode
    if (colorVal && typeof colorVal === 'string') {
        const cLower = colorVal.toLowerCase().replace(/\s+/g, '');
        if (
            cLower === '#1a1a2e' ||
            cLower === '#1e3a5f' ||
            cLower === '#0f172a' ||
            cLower === '#111827' ||
            cLower === '#1e293b' ||
            cLower === '#000' ||
            cLower === '#000000' ||
            cLower === '#333' ||
            cLower === '#222'
        ) {
            classes.push('dynamic-text-adaptive');
            delete processedStyle.color;
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
                            <details suppressHydrationWarning style={processedStyle} className={processedClassName} {...props}>
                                {children}
                            </details>
                        );
                    },
                    summary: ({ node, style, children, className, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className);
                        return (
                            <summary suppressHydrationWarning style={processedStyle} className={`cursor-pointer font-bold ${processedClassName}`} {...props}>
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
