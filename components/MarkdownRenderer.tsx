/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Image from 'next/image'

export default function MarkdownRenderer({ content }: { content: string }) {
    return (
        <div className="prose prose-slate max-w-none prose-headings:font-heading prose-a:text-amber-500 prose-a:no-underline hover:prose-a:underline prose-code:bg-slate-100 prose-code:px-1 prose-code:rounded">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    img: ({ node, ...props }) => {
                        if (!props.src) return null
                        return (
                            <span className="block relative w-full h-80 my-8">
                                <Image
                                    src={props.src}
                                    alt={props.alt || ''}
                                    fill
                                    className="rounded-lg object-cover"
                                />
                            </span>
                        )
                    }
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}
