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

function processInlineStyles(styleObj: any, className: string = ''): { processedStyle: any; processedClassName: string } {
    const processedStyle = { ...styleObj };
    const classes = className ? className.split(' ') : [];
    
    // 1. Detect background color or gradient
    const bgVal = styleObj.background || styleObj.backgroundColor;
    if (bgVal && typeof bgVal === 'string') {
        const bgValLower = bgVal.toLowerCase().replace(/\s+/g, '');
        
        // Blue card detection
        if (
            bgValLower.includes('#eff6ff') || 
            bgValLower.includes('#bfdbfe') || 
            bgValLower.includes('rgb(239,246,255)') ||
            bgValLower.includes('rgb(191,219,254)')
        ) {
            classes.push('dynamic-card-blue');
            delete processedStyle.background;
            delete processedStyle.backgroundColor;
        }
        // Green card detection
        else if (
            bgValLower.includes('#f0fdf4') || 
            bgValLower.includes('#bbf7d0') || 
            bgValLower.includes('rgb(240,253,244)') ||
            bgValLower.includes('rgb(187,247,208)')
        ) {
            classes.push('dynamic-card-green');
            delete processedStyle.background;
            delete processedStyle.backgroundColor;
        }
        // Yellow/Amber/Orange card detection
        else if (
            bgValLower.includes('#fff7ed') || 
            bgValLower.includes('#fffbeb') || 
            bgValLower.includes('#fed7aa') || 
            bgValLower.includes('#fffaf5') || 
            bgValLower.includes('#ffedd5') || 
            bgValLower.includes('rgb(255,247,237)') ||
            bgValLower.includes('rgb(255,251,235)') ||
            bgValLower.includes('rgb(254,215,170)') ||
            bgValLower.includes('rgb(255,237,213)')
        ) {
            classes.push('dynamic-card-yellow');
            delete processedStyle.background;
            delete processedStyle.backgroundColor;
        }
        // Red/Rose card detection
        else if (
            bgValLower.includes('#fef2f2') || 
            bgValLower.includes('#fecaca') || 
            bgValLower.includes('rgb(254,242,242)') ||
            bgValLower.includes('rgb(254,202,202)')
        ) {
            classes.push('dynamic-card-red');
            delete processedStyle.background;
            delete processedStyle.backgroundColor;
        }
        // Purple/Indigo card detection
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
            delete processedStyle.background;
            delete processedStyle.backgroundColor;
        }
        // Pink card detection
        else if (
            bgValLower.includes('#fdf2f8') || 
            bgValLower.includes('#fbcfe8') || 
            bgValLower.includes('rgb(253,242,248)') ||
            bgValLower.includes('rgb(251,207,232)')
        ) {
            classes.push('dynamic-card-pink');
            delete processedStyle.background;
            delete processedStyle.backgroundColor;
        }
        // Neutral card detection (pure whites, light grays)
        else if (
            bgValLower.includes('#ffffff') || 
            bgValLower.includes('#f8fafc') || 
            bgValLower.includes('#f9fafb') || 
            bgValLower.includes('#f1f5f9') || 
            bgValLower.includes('#fafafa') ||
            bgValLower.includes('#e2e8f0') ||
            bgValLower.includes('rgb(255,255,255)') ||
            bgValLower.includes('rgb(248,250,252)') ||
            bgValLower.includes('rgb(249,250,251)') ||
            bgValLower.includes('rgb(241,245,249)')
        ) {
            classes.push('dynamic-card-neutral');
            delete processedStyle.background;
            delete processedStyle.backgroundColor;
        }
    }
    
    // 2. Detect text colors
    const textVal = styleObj.color;
    if (textVal && typeof textVal === 'string') {
        const textValLower = textVal.toLowerCase().replace(/\s+/g, '');
        
        if (
            textValLower.includes('#0f172a') || 
            textValLower.includes('#1e293b') || 
            textValLower.includes('#334155') || 
            textValLower.includes('#4b5563') || 
            textValLower.includes('#374151') || 
            textValLower.includes('#455a64') ||
            textValLower.includes('#000000') ||
            textValLower.includes('rgb(15,23,42)') ||
            textValLower.includes('rgb(30,41,59)') ||
            textValLower.includes('rgb(0,0,0)')
        ) {
            classes.push('dynamic-text-dark');
            delete processedStyle.color;
        }
        else if (textValLower.includes('#1e40af') || textValLower.includes('#1e3a8a') || textValLower.includes('#1d4ed8') || textValLower.includes('rgb(30,64,175)')) {
            classes.push('dynamic-text-blue-heading');
            delete processedStyle.color;
        }
        else if (textValLower.includes('#14532d') || textValLower.includes('#15803d') || textValLower.includes('#166534') || textValLower.includes('rgb(20,83,45)')) {
            classes.push('dynamic-text-green-heading');
            delete processedStyle.color;
        }
        else if (textValLower.includes('#92400e') || textValLower.includes('#9a3412') || textValLower.includes('#b45309') || textValLower.includes('rgb(146,64,14)')) {
            classes.push('dynamic-text-yellow-heading');
            delete processedStyle.color;
        }
        else if (textValLower.includes('#991b1b') || textValLower.includes('#b91c1c') || textValLower.includes('#dc2626') || textValLower.includes('rgb(153,27,27)')) {
            classes.push('dynamic-text-red-heading');
            delete processedStyle.color;
        }
        else if (textValLower.includes('#4c1d95') || textValLower.includes('#312e81') || textValLower.includes('#4338ca') || textValLower.includes('rgb(76,29,149)')) {
            classes.push('dynamic-text-purple-heading');
            delete processedStyle.color;
        }
        else if (textValLower.includes('#9d174d') || textValLower.includes('#be185d') || textValLower.includes('#db2777') || textValLower.includes('rgb(157,23,77)')) {
            classes.push('dynamic-text-pink-heading');
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

    }, [content])

    // Preprocess content to strip leading indentation from lines starting with HTML tags or comments.
    // This prevents standard CommonMark parser from treating indented HTML blocks as code blocks.
    const processedContent = content
        ? content.replace(/^\s+(?=<(?:\/)?(?:div|p|img|span|table|tr|td|th|tbody|thead|ul|ol|li|h[1-6]|a|strong|em|b|i|ins|del|iframe|svg|style|!--))/gim, '')
        : ''

    const sanitizedContent = sanitizeHtml(processedContent)

    return (
        <div ref={ref} className={`
          article-content prose prose-slate max-w-none
          prose-headings:text-navy
          prose-p:text-slate-700
          prose-strong:text-inherit
          prose-a:text-amber-600
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
          prose-headings:font-heading prose-a:no-underline hover:prose-a:underline prose-code:bg-slate-100 prose-code:px-1 prose-code:rounded prose-img:max-w-full prose-img:h-auto prose-img:rounded-lg prose-img:mx-auto prose-img:block
        `}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                rehypePlugins={[rehypeRaw]}
                components={{
                    p: ({ node, style, children, className, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className);
                        return (
                            <p style={{ marginBottom: '1rem', marginTop: '0.5rem', ...processedStyle }} className={processedClassName} {...props}>
                                {children}
                            </p>
                        );
                    },
                    div: ({ node, style, children, className, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className);
                        return (
                            <div style={processedStyle} className={processedClassName} {...props}>
                                {children}
                            </div>
                        );
                    },
                    section: ({ node, style, children, className, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className);
                        return (
                            <section style={processedStyle} className={processedClassName} {...props}>
                                {children}
                            </section>
                        );
                    },
                    span: ({ node, style, children, className, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className);
                        return (
                            <span style={processedStyle} className={processedClassName} {...props}>
                                {children}
                            </span>
                        );
                    },
                    li: ({ node, style, children, className, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className);
                        return (
                            <li style={processedStyle} className={processedClassName} {...props}>
                                {children}
                            </li>
                        );
                    },
                    ul: ({ node, style, children, className, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className);
                        return (
                            <ul style={processedStyle} className={processedClassName} {...props}>
                                {children}
                            </ul>
                        );
                    },
                    ol: ({ node, style, children, className, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className);
                        return (
                            <ol style={processedStyle} className={processedClassName} {...props}>
                                {children}
                            </ol>
                        );
                    },
                    h1: ({ node, style, children, className, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className);
                        return <h1 style={processedStyle} className={processedClassName} {...props}>{children}</h1>;
                    },
                    h2: ({ node, style, children, className, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className);
                        return <h2 style={processedStyle} className={processedClassName} {...props}>{children}</h2>;
                    },
                    h3: ({ node, style, children, className, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className);
                        return <h3 style={processedStyle} className={processedClassName} {...props}>{children}</h3>;
                    },
                    h4: ({ node, style, children, className, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className);
                        return <h4 style={processedStyle} className={processedClassName} {...props}>{children}</h4>;
                    },
                    h5: ({ node, style, children, className, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className);
                        return <h5 style={processedStyle} className={processedClassName} {...props}>{children}</h5>;
                    },
                    h6: ({ node, style, children, className, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className);
                        return <h6 style={processedStyle} className={processedClassName} {...props}>{children}</h6>;
                    },
                    strong: ({ node, style, children, className, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        const { processedStyle, processedClassName } = processInlineStyles(styleObj, className);
                        return <strong style={processedStyle} className={processedClassName} {...props}>{children}</strong>;
                    },
                    table: ({ node, style, className, children, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        return (
                            <div className="w-full overflow-x-auto my-6 border border-slate-200/80 rounded-xl shadow-sm scrollbar-thin">
                                <table style={{ ...styleObj }} className={`w-full border-collapse ${className || ''}`} {...props}>
                                    {children}
                                </table>
                            </div>
                        );
                    },
                    thead: ({ node, style, children, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        return (
                            <thead style={{ ...styleObj }} {...props}>
                                {children}
                            </thead>
                        );
                    },
                    tbody: ({ node, style, children, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        return (
                            <tbody style={{ ...styleObj }} {...props}>
                                {children}
                            </tbody>
                        );
                    },
                    tr: ({ node, style, children, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        return (
                            <tr style={{ ...styleObj }} {...props}>
                                {children}
                            </tr>
                        );
                    },
                    th: ({ node, style, className, children, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        return (
                            <th style={{ ...styleObj }} className={`font-heading font-bold ${className || ''}`} {...props}>
                                {children}
                            </th>
                        );
                    },
                    td: ({ node, style, children, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        return (
                            <td style={{ ...styleObj }} {...props}>
                                {children}
                            </td>
                        );
                    },
                    img: ({ node, style, src, alt, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        return (
                            <img
                                src={src}
                                alt={alt || ''}
                                style={{
                                    maxWidth: '100%',
                                    height: 'auto',
                                    display: 'block',
                                    margin: '1.5rem auto',
                                    borderRadius: '0.5rem',
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
