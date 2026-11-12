/* eslint-disable @typescript-eslint/no-require-imports */
import fs from 'node:fs'
import path from 'node:path'

let currentPath = '/'

jest.mock('next/navigation', () => ({
  usePathname: () => currentPath,
}))

const AdSenseScript = require('@/components/AdSenseScript').default

describe('Google AdSense integration alongside Mediavine Journey', () => {
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

  it('wires AdSense in app/layout.tsx while preserving Mediavine Journey and blocklist div until AdSense approval', () => {
    const layoutContent = fs.readFileSync(path.join(process.cwd(), 'app/layout.tsx'), 'utf8')

    expect(layoutContent).toContain("import AdSenseScript from '@/components/AdSenseScript'")
    expect(layoutContent).toContain('<AdSenseScript />')
    expect(layoutContent).toContain("'google-adsense-account': 'ca-pub-8404756575471756'")
    expect(layoutContent).toContain("import MediavineScript from '@/components/MediavineScript'")
    expect(layoutContent).toContain('<MediavineScript />')
    expect(layoutContent).toContain('id="ad-management-config-settings"')
  })

  it('discloses Google AdSense accurately in privacy-policy without ad-free contradictions', () => {
    const privacy = fs.readFileSync(path.join(process.cwd(), 'app/privacy-policy/page.tsx'), 'utf8')
    expect(privacy).toContain('Google AdSense')
    expect(privacy).toContain('myadcenter.google.com')
    expect(privacy).not.toContain('No Third-Party Advertising &amp; Ad-Free Platform')
    expect(privacy).not.toContain('do not run programmatic ad networks')
  })
})
