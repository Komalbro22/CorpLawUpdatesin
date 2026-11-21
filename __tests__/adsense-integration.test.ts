/* eslint-disable @typescript-eslint/no-require-imports */
import fs from 'node:fs'
import path from 'node:path'

let currentPath = '/'

jest.mock('next/navigation', () => ({
  usePathname: () => currentPath,
}))

const MediavineScript = require('@/components/MediavineScript').default
const AdSenseScript = require('@/components/AdSenseScript').default

describe('Dual Google AdSense (ca-pub-8806384636897940) & Mediavine Journey Integration', () => {
  it('excludes /admin routes and renders scripts on public routes', () => {
    for (const adminPath of ['/admin', '/admin/login', '/admin/dashboard', '/admin/settings']) {
      currentPath = adminPath
      expect(MediavineScript()).toBeNull()
      expect(AdSenseScript()).toBeNull()
    }

    for (const publicPath of ['/', '/updates/mca21-v3-login-guide', '/guides', '/documents/bank-guarantee']) {
      currentPath = publicPath
      expect(MediavineScript()).not.toBeNull()
      const adsenseEl = AdSenseScript()
      expect(adsenseEl).not.toBeNull()
      const children = adsenseEl.props.children
      const scriptEl = children.find((c: any) => c?.type === 'script')
      expect(scriptEl?.props.src).toContain('client=ca-pub-8806384636897940')
    }
  })

  it('wires both AdSense (ca-pub-8806384636897940) and Mediavine Journey with UX blocklist div in app/layout.tsx', () => {
    const layoutContent = fs.readFileSync(path.join(process.cwd(), 'app/layout.tsx'), 'utf8')

    expect(layoutContent).toContain("import MediavineScript from '@/components/MediavineScript'")
    expect(layoutContent).toContain("import AdSenseScript from '@/components/AdSenseScript'")
    expect(layoutContent).toContain('<MediavineScript />')
    expect(layoutContent).toContain('<AdSenseScript />')
    expect(layoutContent).toContain("'google-adsense-account': 'ca-pub-8806384636897940'")
    expect(layoutContent).toContain('id="ad-management-config-settings"')
  })

  it('discloses both Mediavine Journey and Google AdSense accurately in privacy-policy', () => {
    const privacy = fs.readFileSync(path.join(process.cwd(), 'app/privacy-policy/page.tsx'), 'utf8')
    expect(privacy).toContain('Mediavine Journey')
    expect(privacy).toContain('Google AdSense')
    expect(privacy).toContain('mediavine.com/privacy-policy')
    expect(privacy).toContain('myadcenter.google.com')
    expect(privacy).not.toContain('No Third-Party Advertising &amp; Ad-Free Platform')
  })

  it('serves direct unified ads.txt containing both Google AdSense and Mediavine Journey', async () => {
    const adsTxtPublic = fs.readFileSync(path.join(process.cwd(), 'public/ads.txt'), 'utf8')
    expect(adsTxtPublic).toContain('google.com, pub-8806384636897940, DIRECT, f08c47fec0942fa0')
    expect(adsTxtPublic).toContain('journeymv.com, bb9707b8-bfe3-4206-9309-6bc7e7923faf, DIRECT, 1363c924529b3998')

    const { GET } = await import('@/app/ads.txt/route')
    const res = await GET()
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/plain')
    const text = await res.text()
    expect(text).toContain('google.com, pub-8806384636897940, DIRECT, f08c47fec0942fa0')
    expect(text).toContain('journeymv.com, bb9707b8-bfe3-4206-9309-6bc7e7923faf, DIRECT, 1363c924529b3998')
  })
})
