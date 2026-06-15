import DOMPurify from 'dompurify'
import sanitizeHtmlLib from 'sanitize-html'

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'b', 'i',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'a', 'img', 'table',
  'thead', 'tbody', 'tr', 'th', 'td',
  'div', 'span', 'blockquote', 'code',
  'pre', 'hr', 's', 'del', 'sup', 'sub',
  'style', 'section',
]

const ALLOWED_ATTR = [
  'href', 'src', 'alt', 'title', 'class',
  'style', 'id', 'target', 'rel',
  'width', 'height', 'border',
]

// For use in client components only
export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side: use sanitize-html library (NOT regex)
    return sanitizeHtmlLib(html, {
      allowedTags: ALLOWED_TAGS,
      allowedAttributes: {
        '*': ['style', 'class', 'id'],
        'a': ['href', 'target', 'rel', 'title'],
        'img': ['src', 'alt', 'title', 'width', 'height'],
        'td': ['style', 'width', 'height', 'border'],
        'th': ['style', 'width', 'height', 'border'],
        'table': ['style', 'width', 'height', 'border'],
      },
      allowedSchemes: ['http', 'https', 'mailto'],
      disallowedTagsMode: 'discard',
      allowVulnerableTags: true,
    })
  }
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.:-]|$))/i,
    FORBID_ATTR: ['onerror', 'onload', 'onclick'],
    FORCE_BODY: true,
  })
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}
