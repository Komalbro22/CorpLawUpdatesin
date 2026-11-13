/* eslint-disable @typescript-eslint/no-require-imports */
import fs from 'node:fs'
import path from 'node:path'

let currentPath = '/'

jest.mock('next/navigation', () => ({
  usePathname: () => currentPath,
}))

const AdSenseScript = require('@/components/AdSenseScript').default

describe('Google AdSense integration and Mediavine Journey deprecation', () => {
  it('excludes /admin routes and renders exact ca-pub-8404756575471756 script on public routes', () => {
    for (const adminPath of ['/admin', '/admin/login', '/admin/dashboard', '/admin/settings']) {
      currentPath = adminPath
      expect(AdSenseScript()).toBeNull()
    }

    for (const publicPath of ['/', '/updates/mca21-v3-login-guide', '/guides', '/documents/bank-guarantee']) {
      currentPath = publicPath
      const el = AdSenseScript()
      expect(el).not.toBeNull()
      const children = el.props.children
      const scriptEl = children.find((c: any) => c?.type === 'script')
      expect(scriptEl).toBeDefined()
      expect(scriptEl.props.async).toBe(true)
      expect(scriptEl.props.crossOrigin).toBe('anonymous')
      expect(scriptEl.props.src).toBe(
        'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8404756575471756'
      )
    }
  })

  it('wires AdSense in app/layout.tsx and completely removes Mediavine Journey scripts and blocklist div', () => {
    const layoutContent = fs.readFileSync(path.join(process.cwd(), 'app/layout.tsx'), 'utf8')

    expect(layoutContent).toContain("import AdSenseScript from '@/components/AdSenseScript'")
    expect(layoutContent).toContain('<AdSenseScript />')
    expect(layoutContent).toContain("'google-adsense-account': 'ca-pub-8404756575471756'")
    expect(layoutContent).not.toContain("MediavineScript")
    expect(layoutContent).not.toContain('id="ad-management-config-settings"')
  })

  it('discloses Google AdSense accurately in privacy-policy without ad-free contradictions', () => {
    const privacy = fs.readFileSync(path.join(process.cwd(), 'app/privacy-policy/page.tsx'), 'utf8')
    expect(privacy).toContain('Google AdSense')
    expect(privacy).toContain('myadcenter.google.com')
    expect(privacy).not.toContain('No Third-Party Advertising &amp; Ad-Free Platform')
    expect(privacy).not.toContain('do not run programmatic ad networks')
  })
  it('serves direct Google AdSense authorization in /ads.txt without redirects', async () => {
    const adsTxtPublic = fs.readFileSync(path.join(process.cwd(), 'public/ads.txt'), 'utf8')
    expect(adsTxtPublic.trim()).toBe('google.com, pub-8404756575471756, DIRECT, f08c47fec0942fa0')

    const { GET } = await import('@/app/ads.txt/route')
    const res = await GET()
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/plain')
    const text = await res.text()
    expect(text.trim()).toBe('google.com, pub-8404756575471756, DIRECT, f08c47fec0942fa0')
  })

})
