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

    return (
        <div ref={ref} className={`
          article-content prose prose-slate max-w-none
          prose-headings:text-navy
          prose-p:text-slate-700
          prose-strong:text-navy
          prose-a:text-amber-600
          prose-table:text-slate-700
          prose-td:text-slate-700
          prose-th:text-slate-800
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
                    p: ({ node, style, children, ...props }: any) => (
                        <p style={{ marginBottom: '1rem', marginTop: '0.5rem', ...style }} {...props}>
                            {children}
                        </p>
                    ),
                    img: ({ node, style, src, alt, ...props }: any) => (
                        <img
                            src={src}
                            alt={alt || ''}
                            style={{
                                maxWidth: '100%',
                                height: 'auto',
                                display: 'block',
                                margin: '1.5rem auto',
                                borderRadius: '0.5rem',
                                ...style
                            }}
                            {...props}
                        />
                    )
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}
