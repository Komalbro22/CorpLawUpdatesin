import DOMPurify from 'dompurify'

// For use in client components only
export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side: basic tag stripping only
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '')
      .replace(/javascript:/gi, '')
  }
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'b', 'i',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'img', 'table',
      'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span', 'blockquote', 'code',
      'pre', 'hr', 's', 'del', 'sup', 'sub',
      'style',
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class',
      'style', 'id', 'target', 'rel',
      'width', 'height', 'border',
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.:-]|$))/i,
    FORBID_ATTR: ['onerror', 'onload', 'onclick'],
    FORCE_BODY: true,
  })
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}
