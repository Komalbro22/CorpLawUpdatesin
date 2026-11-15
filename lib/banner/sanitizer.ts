import sanitizeHtml from 'sanitize-html'
import { BannerTheme, IconName } from './types'
import { getIconSvg } from './icons'

const SVG_ALLOWED_TAGS = [
  'svg', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon',
  'text', 'tspan', 'defs', 'linearGradient', 'radialGradient', 'stop',
  'clipPath', 'mask', 'filter', 'feGaussianBlur', 'feDropShadow', 'marker', 'use',
]

const SVG_ALLOWED_ATTR = [
  'xmlns', 'viewBox', 'viewbox', 'width', 'height', 'x', 'y', 'x1', 'y1', 'x2', 'y2',
  'cx', 'cy', 'r', 'rx', 'ry', 'd', 'points', 'fill', 'stroke', 'stroke-width',
  'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'stroke-opacity',
  'opacity', 'fill-opacity', 'transform', 'id', 'href', 'xlink:href',
  'font-family', 'font-size', 'font-weight', 'text-anchor', 'letter-spacing',
  'offset', 'stop-color', 'stop-opacity', 'stdDeviation', 'dx', 'dy',
]

/**
 * Replaces tokens and placeholders in HTML code mode.
 */
export function interpolateHtmlTokens(
  rawHtml: string,
  context?: {
    headline?: string
    theme?: BannerTheme
  }
): string {
  let html = rawHtml

  // Replace placeholders
  if (context?.headline) {
    html = html.replace(/\{\{headline\}\}/g, context.headline)
  }
  if (context?.theme) {
    html = html
      .replace(/\{\{theme\.bg\}\}/g, context.theme.bg)
      .replace(/\{\{theme\.accent\}\}/g, context.theme.accent)
      .replace(/\{\{theme\.dark\}\}/g, context.theme.dark)
      .replace(/\{\{theme\.circle\}\}/g, context.theme.circle)
  }

  // Replace icon tokens: {{icon:name color=#fff size=120}}
  html = html.replace(/\{\{icon:([a-z0-9-]+)(?:\s+color=([#a-zA-Z0-9]+))?(?:\s+size=(\d+))?\}\}/g, (_, name, color, size) => {
    return getIconSvg(name as IconName, color || '#FFFFFF', size ? parseInt(size, 10) : 48)
  })

  return html
}

/**
 * Sanitizes SVG code per Section 6 requirements.
 * Rejects remote URLs, scripts, styles, foreignObjects, iframes, and event attributes.
 */
export function sanitizeSvg(rawSvg: string): { sanitized: string; errors: string[] } {
  const errors: string[] = []

  if (!rawSvg || !rawSvg.trim()) {
    return { sanitized: '', errors: ['SVG code is empty'] }
  }

  if (rawSvg.length > 65536) {
    return { sanitized: '', errors: ['SVG exceeds 64 KB limit'] }
  }

  // Check for forbidden remote URLs (http://, https://, protocol-relative //)
  if (/\b(?:https?:|\/\/)[^\s"'<>]+/i.test(rawSvg)) {
    errors.push('Remote URLs are forbidden in SVG code. Only data URIs or local anchors (#) are allowed.')
  }

  // Check for forbidden elements
  const forbiddenRegex = /<(?:script|style|foreignObject|foreignobject|iframe|link)\b/i
  if (forbiddenRegex.test(rawSvg)) {
    errors.push('SVG contains forbidden tags (<script>, <style>, <foreignObject>, <iframe>, or <link>).')
  }

  // Check for inline event handlers (onclick, onload, onerror, etc.)
  if (/\bon[a-z]+\s*=/i.test(rawSvg)) {
    errors.push('SVG contains forbidden inline event handlers.')
  }

  // Sanitize with sanitize-html (pure Node.js, zero DOM dependency)
  const clean = sanitizeHtml(rawSvg, {
    allowedTags: SVG_ALLOWED_TAGS,
    allowedAttributes: {
      '*': SVG_ALLOWED_ATTR,
    },
    allowedSchemes: ['data'],
    allowedSchemesByTag: {
      use: ['#'],
      image: ['data'],
    },
    allowProtocolRelative: false,
    disallowedTagsMode: 'discard',
  })

  let normalizedSvg = clean.trim()
  if (!normalizedSvg.startsWith('<svg')) {
    errors.push('Input does not contain a valid <svg> root element.')
  }

  // Enforce or add 1200x630 dimensions / viewBox
  if (!/viewBox\s*=/i.test(normalizedSvg)) {
    normalizedSvg = normalizedSvg.replace('<svg', '<svg viewBox="0 0 1200 630"')
  }
  if (!/width\s*=/i.test(normalizedSvg)) {
    normalizedSvg = normalizedSvg.replace('<svg', '<svg width="1200"')
  }
  if (!/height\s*=/i.test(normalizedSvg)) {
    normalizedSvg = normalizedSvg.replace('<svg', '<svg height="630"')
  }

  return {
    sanitized: normalizedSvg,
    errors,
  }
}
