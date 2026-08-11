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
  'iframe', 'style',
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
          'color': [/^\s*[\s\S]+$/],
          'background': [/^\s*[\s\S]+$/],
          'background-color': [/^\s*[\s\S]+$/],
          'background-image': [/^\s*[\s\S]+$/],
          'border': [/^\s*[\s\S]+$/],
          'border-left': [/^\s*[\s\S]+$/],
          'border-right': [/^\s*[\s\S]+$/],
          'border-top': [/^\s*[\s\S]+$/],
          'border-bottom': [/^\s*[\s\S]+$/],
          'border-color': [/^\s*[\s\S]+$/],
          'border-radius': [/^\s*[\s\S]+$/],
          'border-style': [/^\s*[\s\S]+$/],
          'border-width': [/^\s*[\s\S]+$/],
          'font-size': [/^\s*[\s\S]+$/],
          'font-weight': [/^\s*[\s\S]+$/],
          'font-family': [/^\s*[\s\S]+$/],
          'font-style': [/^\s*[\s\S]+$/],
          'line-height': [/^\s*[\s\S]+$/],
          'margin': [/^\s*[\s\S]+$/],
          'margin-top': [/^\s*[\s\S]+$/],
          'margin-bottom': [/^\s*[\s\S]+$/],
          'margin-left': [/^\s*[\s\S]+$/],
          'margin-right': [/^\s*[\s\S]+$/],
          'padding': [/^\s*[\s\S]+$/],
          'padding-top': [/^\s*[\s\S]+$/],
          'padding-bottom': [/^\s*[\s\S]+$/],
          'padding-left': [/^\s*[\s\S]+$/],
          'padding-right': [/^\s*[\s\S]+$/],
          'display': [/^\s*[\s\S]+$/],
          'text-align': [/^\s*[\s\S]+$/],
          'text-decoration': [/^\s*[\s\S]+$/],
          'text-transform': [/^\s*[\s\S]+$/],
          'width': [/^\s*[\s\S]+$/],
          'max-width': [/^\s*[\s\S]+$/],
          'min-width': [/^\s*[\s\S]+$/],
          'height': [/^\s*[\s\S]+$/],
          'max-height': [/^\s*[\s\S]+$/],
          'min-height': [/^\s*[\s\S]+$/],
          'box-shadow': [/^\s*[\s\S]+$/],
          'flex': [/^\s*[\s\S]+$/],
          'flex-direction': [/^\s*[\s\S]+$/],
          'align-items': [/^\s*[\s\S]+$/],
          'justify-content': [/^\s*[\s\S]+$/],
          'grid': [/^\s*[\s\S]+$/],
          'gap': [/^\s*[\s\S]+$/],
          'vertical-align': [/^\s*[\s\S]+$/],
          'overflow': [/^\s*[\s\S]+$/],
          'position': [/^\s*[\s\S]+$/],
          'opacity': [/^\s*[\s\S]+$/],
        }
      },
      allowedSchemes: ['http', 'https', 'mailto', 'data'],
      disallowedTagsMode: 'discard',
      nonTextTags: ['script', 'textarea', 'option'], // Allow <style> text content
      allowVulnerableTags: true,
      transformTags: {
        'a': (tagName, attribs) => {
          if (attribs.href) attribs.href = attribs.href.trim();
          return { tagName, attribs };
        },
        'img': (tagName, attribs) => {
          if (attribs.src) attribs.src = attribs.src.trim();
          return { tagName, attribs };
        }
      }
    })
  }

  // Client-side: use DOMPurify with SVG & style support
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ADD_TAGS: ['style', 'svg', 'path', 'g', 'rect', 'circle', 'polyline', 'polygon', 'line', 'text', 'tspan', 'use', 'defs', 'linearGradient', 'stop', 'clipPath', 'mask', 'foreignObject', 'iframe'],
    ADD_ATTR: ['style', 'class', 'id', 'target', 'rel', 'viewBox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'd', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'points', 'transform', 'xmlns', 'aria-hidden'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|data):|[^a-z]|[a-z+.-]+(?:[^a-z+.:-]|$))/i,
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    FORCE_BODY: true,
  })
}

export function stripHtml(html: string): string {
  return html ? html.replace(/<[^>]*>/g, '').trim() : ''
}
