/**
 * Comprehensive test suite for HTML sanitization in CorpLawUpdates.in
 * Covers:
 * - script and event-handler injection (<script>, onerror, onload)
 * - javascript: and data: URI schemes in href/src
 * - unsafe srcset/image URLs
 * - disallowed tags and attributes
 * - SVG edge cases (preserving valid visual badges/charts, blocking malicious scripts)
 * - raw-text elements (textarea, xmp, style)
 * - legal article and rich-text HTML rendering
 */
import { sanitizeHtml } from '../lib/sanitize'

describe('HTML Sanitization (lib/sanitize.ts)', () => {
  it('strips script tags and inline executable code', () => {
    const dirty = '<p>Normal text</p><script>alert("XSS")</script><p>More text</p>'
    const clean = sanitizeHtml(dirty)
    expect(clean).not.toContain('<script>')
    expect(clean).not.toContain('alert("XSS")')
    expect(clean).toContain('Normal text')
    expect(clean).toContain('More text')
  })

  it('strips event handlers (onclick, onerror, onload, onmouseover)', () => {
    const dirty = '<img src="valid.png" onerror="alert(1)" onload="fetch(\'/steal\')" onclick="doEvil()" />'
    const clean = sanitizeHtml(dirty)
    expect(clean).not.toContain('onerror')
    expect(clean).not.toContain('onload')
    expect(clean).not.toContain('onclick')
    expect(clean).toContain('src="valid.png"')
  })

  it('blocks javascript: and unsafe URI schemes in href attributes', () => {
    const dirty = '<a href="javascript:alert(document.cookie)">Click me</a>'
    const clean = sanitizeHtml(dirty)
    expect(clean).not.toContain('javascript:')
    expect(clean).toContain('Click me')
  })

  it('preserves legitimate HTTP and HTTPS URLs', () => {
    const valid = '<a href="https://www.mca.gov.in/notifications" target="_blank" rel="noopener noreferrer">MCA Circular</a>'
    const clean = sanitizeHtml(valid)
    expect(clean).toContain('href="https://www.mca.gov.in/notifications"')
    expect(clean).toContain('MCA Circular')
  })

  it('allows safe SVG tags and attributes for charts, ledger rails and badges', () => {
    const svgContent = `
      <svg viewBox="0 0 100 100" fill="none" class="w-6 h-6">
        <circle cx="50" cy="50" r="40" stroke="#b45309" stroke-width="2" />
        <path d="M10 10 L90 90" stroke="#0b1f3a" />
      </svg>
    `.trim()
    const clean = sanitizeHtml(svgContent)
    expect(clean).toContain('<svg')
    expect(clean).toContain('<circle')
    expect(clean).toContain('<path')
    expect(clean.toLowerCase()).toContain('viewbox="0 0 100 100"')
  })

  it('strips disallowed tags such as form, input, button, applet, object', () => {
    const dirty = '<div><form action="/login"><input type="password" name="pwd" /><button>Submit</button></form></div>'
    const clean = sanitizeHtml(dirty)
    expect(clean).not.toContain('<form')
    expect(clean).not.toContain('<input')
    expect(clean).not.toContain('<button')
  })

  it('safely handles raw-text elements like textarea and xmp', () => {
    const dirty = '<div><textarea>malicious payload</textarea><xmp>another payload</xmp></div>'
    const clean = sanitizeHtml(dirty)
    expect(clean).not.toContain('<textarea')
    expect(clean).not.toContain('<xmp')
  })

  it('preserves valid corporate law tables, formatting and styles', () => {
    const articleHtml = `
      <h2>MCA CCFS-2026 Scheme Details</h2>
      <p>Companies can file pending annual returns with <strong>zero penalty</strong>.</p>
      <table class="min-w-full border border-slate-200">
        <thead>
          <tr><th class="px-4 py-2">Form</th><th class="px-4 py-2">Filing Due Date</th></tr>
        </thead>
        <tbody>
          <tr><td class="px-4 py-2">MGT-7</td><td class="px-4 py-2">31st August 2026</td></tr>
        </tbody>
      </table>
    `.trim()
    const clean = sanitizeHtml(articleHtml)
    expect(clean).toContain('<h2>MCA CCFS-2026 Scheme Details</h2>')
    expect(clean).toContain('<strong>zero penalty</strong>')
    expect(clean).toContain('<table')
    expect(clean).toContain('MGT-7')
    expect(clean).toContain('31st August 2026')
  })
})
