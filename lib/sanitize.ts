import DOMPurify from 'dompurify'
import sanitizeHtmlLib from 'sanitize-html'

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'b', 'i', 'u', 's', 'del', 'ins', 'sub', 'sup',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'a', 'img', 'table',
  'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
  'div', 'span', 'blockquote', 'code', 'pre', 'hr',
  'section', 'article', 'header', 'footer', 'nav', 'aside', 'main',
  'figure', 'figcaption', 'details', 'summary', 'mark', 'small', 'center',
  'iframe',
  // SVG elements for inline charts, badges, and visual diagrams
  'svg', 'path', 'g', 'rect', 'circle', 'ellipse', 'polyline',
  'polygon', 'line', 'text', 'tspan', 'use', 'defs',
  'lineargradient', 'radialgradient', 'stop', 'clippath', 'clipPath', 'mask', 'foreignobject', 'foreignObject'
]

const ALLOWED_ATTR = [
  'href', 'src', 'alt', 'title', 'class', 'style', 'id', 'target', 'rel',
  'width', 'height', 'border', 'align', 'valign',
  'cellpadding', 'cellspacing', 'colspan', 'rowspan',
  'bgcolor', 'color', 'loading',
  // SVG attributes
  'viewbox', 'viewBox', 'fill', 'stroke', 'stroke-width',
  'stroke-linecap', 'stroke-linejoin', 'd', 'cx', 'cy',
  'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'points',
  'transform', 'xmlns', 'aria-hidden', 'role'
]

// Server & Client html sanitizer preserving custom inline CSS styles, fonts, SVGs & charts
export function sanitizeHtml(html: string): string {
  if (!html) return ''

  if (typeof window === 'undefined') {
    // Server-side: use sanitize-html with full inline style support
    return sanitizeHtmlLib(html, {
      allowedTags: ALLOWED_TAGS,
      allowedAttributes: {
        '*': ALLOWED_ATTR,
        'a': ['href', 'target', 'rel', 'title', 'class', 'style', 'id'],
        'img': ['src', 'alt', 'title', 'width', 'height', 'class', 'style', 'id', 'loading'],
        'table': ['style', 'class', 'id', 'width', 'height', 'border', 'cellpadding', 'cellspacing'],
        'td': ['style', 'class', 'id', 'width', 'height', 'border', 'colspan', 'rowspan', 'align', 'valign'],
        'th': ['style', 'class', 'id', 'width', 'height', 'border', 'colspan', 'rowspan', 'align', 'valign'],
      },
      allowedStyles: {
        '*': {
          // Allow all CSS style rules (color, background, font-family, font-size, display, flex, grid, margin, padding, border, etc.)
          '.*': [/^\s*[\s\S]+$/]
        }
      },
      allowedSchemes: ['http', 'https', 'mailto', 'data'],
      disallowedTagsMode: 'discard',
    })
  }

  // Client-side: use DOMPurify with SVG & style support
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ADD_TAGS: ['svg', 'path', 'g', 'rect', 'circle', 'polyline', 'polygon', 'line', 'text', 'tspan', 'use', 'defs', 'linearGradient', 'stop', 'clipPath', 'mask', 'foreignObject', 'iframe'],
    ADD_ATTR: ['style', 'class', 'id', 'target', 'rel', 'viewBox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'd', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'points', 'transform', 'xmlns', 'aria-hidden'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|data):|[^a-z]|[a-z+.-]+(?:[^a-z+.:-]|$))/i,
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    FORCE_BODY: true,
  })
}

export function stripHtml(html: string): string {
  return html ? html.replace(/<[^>]*>/g, '').trim() : ''
}
