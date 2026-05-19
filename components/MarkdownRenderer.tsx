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
        ? content.replace(/^\s+(?=<(?:\/)?(?:div|p|img|span|table|tr|td|th|tbody|thead|ul|ol|li|h[1-6]|a|strong|em|b|i|ins|del|iframe|svg|!--))/gim, '')
        : ''

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
                    p: ({ node, style, children, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        return (
                            <p style={{ marginBottom: '1rem', marginTop: '0.5rem', ...styleObj }} {...props}>
                                {children}
                            </p>
                        );
                    },
                    table: ({ node, style, children, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        return (
                            <table style={{ ...styleObj }} {...props} className="w-full my-6 border-collapse">
                                {children}
                            </table>
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
                    th: ({ node, style, children, ...props }: any) => {
                        const styleObj = parseStyle(style, node);
                        return (
                            <th style={{ ...styleObj }} {...props} className="font-heading font-bold">
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
                    }
                }}
            >
                {processedContent}
            </ReactMarkdown>
        </div>
    )
}
