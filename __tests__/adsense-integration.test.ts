/* eslint-disable @typescript-eslint/no-require-imports */
import fs from 'node:fs'
import path from 'node:path'

let currentPath = '/'

jest.mock('next/navigation', () => ({
  usePathname: () => currentPath,
}))

const AdSenseScript = require('@/components/AdSenseScript').default

describe('Google AdSense (ca-pub-8806384636897940) Integration & Mediavine Removal', () => {
  it('excludes /admin routes and renders AdSense script on public routes', () => {
    for (const adminPath of ['/admin', '/admin/login', '/admin/dashboard', '/admin/settings']) {
      currentPath = adminPath
      expect(AdSenseScript()).toBeNull()
    }

    for (const publicPath of ['/', '/updates/mca21-v3-login-guide', '/guides', '/documents/bank-guarantee']) {
      currentPath = publicPath
      const adsenseEl = AdSenseScript()
      expect(adsenseEl).not.toBeNull()
      const children = adsenseEl.props.children
      const scriptEl = children.find((c: any) => c?.type === 'script')
      expect(scriptEl?.props.src).toContain('client=ca-pub-8806384636897940')
    }
  })

  it('wires AdSense (ca-pub-8806384636897940) in app/layout.tsx and excludes Mediavine', () => {
    const layoutContent = fs.readFileSync(path.join(process.cwd(), 'app/layout.tsx'), 'utf8')

    expect(layoutContent).toContain("import AdSenseScript from '@/components/AdSenseScript'")
    expect(layoutContent).toContain('<AdSenseScript />')
    expect(layoutContent).toContain("'google-adsense-account': 'ca-pub-8806384636897940'")
    expect(layoutContent).not.toContain('MediavineScript')
    expect(layoutContent).not.toContain('id="ad-management-config-settings"')
  })

  it('discloses Google AdSense accurately in privacy-policy and removes Mediavine Journey', () => {
    const privacy = fs.readFileSync(path.join(process.cwd(), 'app/privacy-policy/page.tsx'), 'utf8')
    expect(privacy).toContain('Google AdSense')
    expect(privacy).toContain('myadcenter.google.com')
    expect(privacy).not.toContain('Mediavine Journey')
    expect(privacy).not.toContain('mediavine.com')
  })

  it('serves ads.txt containing exactly one Google AdSense line and zero Mediavine lines', async () => {
    const adsTxtPublic = fs.readFileSync(path.join(process.cwd(), 'public/ads.txt'), 'utf8')
    expect(adsTxtPublic).toContain('google.com, pub-8806384636897940, DIRECT, f08c47fec0942fa0')
    expect(adsTxtPublic).not.toContain('journeymv.com')
    expect(adsTxtPublic).not.toContain('mediavine.com')

    const countMatches = (adsTxtPublic.match(/pub-8806384636897940/g) || []).length
    expect(countMatches).toBe(1)

    const { GET } = await import('@/app/ads.txt/route')
    const res = await GET()
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/plain')
    const text = await res.text()
    expect(text).toContain('google.com, pub-8806384636897940, DIRECT, f08c47fec0942fa0')
    expect(text).not.toContain('journeymv.com')
  })
})
