/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import rehypeRaw from 'rehype-raw'

export default function MarkdownRenderer({ content }: { content: string }) {
    return (
        <div className="prose prose-slate max-w-none prose-headings:font-heading prose-a:text-amber-500 prose-a:no-underline hover:prose-a:underline prose-code:bg-slate-100 prose-code:px-1 prose-code:rounded prose-img:max-w-full prose-img:h-auto prose-img:rounded-lg prose-img:mx-auto prose-img:block">
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                rehypePlugins={[rehypeRaw]}
                components={{
                    p: ({ children }) => (
                        <p style={{ marginBottom: '1rem', marginTop: '0.5rem' }}>
                            {children}
                        </p>
                    ),
                    img: ({ src, alt }) => (
                        <img
                            src={src}
                            alt={alt || ''}
                            style={{
                                maxWidth: '100%',
                                height: 'auto',
                                display: 'block',
                                margin: '1.5rem auto',
                                borderRadius: '0.5rem'
                            }}
                        />
                    )
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}
