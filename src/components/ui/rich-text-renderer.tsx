"use client"

import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface RichTextRendererProps {
  content: string
  className?: string
}

export function RichTextRenderer({ content, className }: RichTextRendererProps) {
  const [sanitizedContent, setSanitizedContent] = useState('')

  useEffect(() => {
    // Dynamic import for DOMPurify to avoid SSR issues
    import('dompurify').then((DOMPurify) => {
      const sanitized = DOMPurify.default.sanitize(content, {
        ALLOWED_TAGS: [
          'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'ul', 'ol', 'li',
          'blockquote',
          'a', 'img',
          'table', 'thead', 'tbody', 'tr', 'th', 'td',
          'div', 'span',
          'mark', // for highlight
        ],
        ALLOWED_ATTR: [
          'href', 'target', 'rel', 'src', 'alt', 'title',
          'class', 'style', 'id',
          'colspan', 'rowspan',
        ],
        ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
      })
      setSanitizedContent(sanitized)
    })
  }, [content])

  return (
    <div
      className={cn(
        'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none',
        'prose-headings:text-foreground prose-headings:font-bold',
        'prose-p:text-foreground prose-p:leading-relaxed',
        'prose-strong:text-foreground prose-strong:font-semibold',
        'prose-em:text-foreground prose-em:italic',
        'prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm',
        'prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-lg',
        'prose-blockquote:text-muted-foreground prose-blockquote:border-l-primary prose-blockquote:border-l-4',
        'prose-li:text-foreground prose-li:marker:text-muted-foreground',
        'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
        'prose-img:rounded-lg prose-img:shadow-sm',
        'prose-table:border-collapse prose-table:w-full',
        'prose-th:border prose-th:border-border prose-th:bg-muted prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-semibold',
        'prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-2',
        'prose-mark:bg-yellow-200 prose-mark:text-yellow-900 dark:prose-mark:bg-yellow-800 dark:prose-mark:text-yellow-100',
        className
      )}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  )
}
