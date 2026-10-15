'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import rehypeRaw from 'rehype-raw'

interface LegalDocRendererProps {
  content: string
  className?: string
  id?: string
}

/**
 * Strips all raw markdown and HTML formatting characters to produce
 * a clean, human-readable plain text document for copying to clipboard.
 */
export function cleanMarkdownForClipboard(md: string): string {
  if (!md) return ''
  return md
    // Replace <br> tags with real newlines
    .replace(/<br\s*\/?>/gi, '\n')
    // Remove markdown headers (#, ##, ###, ####)
    .replace(/^#+\s*(.*?)$/gm, '$1')
    // Remove bold and italics
    .replace(/\*\*\*(.*?)\*\*\*/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    // Convert blockquotes into clean indented text
    .replace(/^>\s?(.*)$/gm, '   $1')
    // Remove table horizontal alignment rows (|:---|:---|)
    .replace(/\|[\s:-]+\|[\s:-]*$/gm, '')
    // Format markdown tables into clean text
    .replace(/^\|(.*)\|$/gm, (match, row) => {
      const cells = row
        .split('|')
        .map((c: string) => c.trim())
        .filter(Boolean)
      return cells.join('    |    ')
    })
    // Remove any leftover solitary pipe rows
    .replace(/^[|\s:-]+$/gm, '')
    // Collapse excess empty newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export default function LegalDocRenderer({ content, className = '', id }: LegalDocRendererProps) {
  return (
    <div
      id={id}
      className={`legal-doc-content font-serif text-slate-900 dark:text-slate-100 leading-relaxed text-xs sm:text-sm ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-base sm:text-lg font-bold font-serif text-center uppercase tracking-wide my-4 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm sm:text-base font-bold font-serif text-center uppercase my-3 text-slate-900 dark:text-white">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs sm:text-sm font-bold font-serif uppercase tracking-wide my-3 text-slate-900 dark:text-slate-100">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xs sm:text-sm font-bold font-serif my-2 text-slate-900 dark:text-slate-100">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="my-2.5 text-justify leading-relaxed text-slate-800 dark:text-slate-200">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-slate-900 dark:text-white">
              {children}
            </strong>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-2.5 pl-4 py-1.5 border-l-2 border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 italic text-slate-700 dark:text-slate-300 rounded-r-md">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse border border-slate-300 dark:border-slate-700 text-xs text-left">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-100 dark:bg-slate-800/80 font-bold border-b border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="border border-slate-300 dark:border-slate-700 p-2.5 align-top font-bold text-slate-900 dark:text-white">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-slate-300 dark:border-slate-700 p-2.5 align-top text-slate-800 dark:text-slate-200">
              {children}
            </td>
          ),
          hr: () => (
            <hr className="my-4 border-t border-slate-200 dark:border-slate-800" />
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 my-2.5 space-y-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 my-2.5 space-y-1">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-justify leading-relaxed text-slate-800 dark:text-slate-200">
              {children}
            </li>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
