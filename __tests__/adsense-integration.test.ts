/* eslint-disable @typescript-eslint/no-require-imports */
import fs from 'node:fs'
import path from 'node:path'

let currentPath = '/'

jest.mock('next/navigation', () => ({
  usePathname: () => currentPath,
}))

const MediavineScript = require('@/components/MediavineScript').default

describe('Mediavine Journey restoration and Google AdSense decommissioning', () => {
  it('excludes /admin routes and renders Mediavine Journey script on public routes', () => {
    for (const adminPath of ['/admin', '/admin/login', '/admin/dashboard', '/admin/settings']) {
      currentPath = adminPath
      expect(MediavineScript()).toBeNull()
    }

    for (const publicPath of ['/', '/updates/mca21-v3-login-guide', '/guides', '/documents/bank-guarantee']) {
      currentPath = publicPath
      const el = MediavineScript()
      expect(el).not.toBeNull()
    }
  })

  it('wires Mediavine Journey in app/layout.tsx, includes blocklist div, and removes AdSense', () => {
    const layoutContent = fs.readFileSync(path.join(process.cwd(), 'app/layout.tsx'), 'utf8')

    expect(layoutContent).toContain("import MediavineScript from '@/components/MediavineScript'")
    expect(layoutContent).toContain('<MediavineScript />')
    expect(layoutContent).toContain('id="ad-management-config-settings"')
    expect(layoutContent).not.toContain("import AdSenseScript")
    expect(layoutContent).not.toContain('<AdSenseScript />')
    expect(layoutContent).not.toContain("'google-adsense-account'")
  })

  it('discloses Mediavine Journey accurately in privacy-policy', () => {
    const privacy = fs.readFileSync(path.join(process.cwd(), 'app/privacy-policy/page.tsx'), 'utf8')
    expect(privacy).toContain('Mediavine Journey')
    expect(privacy).toContain('mediavine.com/privacy-policy')
    expect(privacy).not.toContain('No Third-Party Advertising &amp; Ad-Free Platform')
  })

  it('serves Mediavine Journey ads.txt in public/ads.txt and redirects in /ads.txt route', async () => {
    const adsTxtPublic = fs.readFileSync(path.join(process.cwd(), 'public/ads.txt'), 'utf8')
    expect(adsTxtPublic).toContain('journeymv.com, bb9707b8-bfe3-4206-9309-6bc7e7923faf, DIRECT, 1363c924529b3998')
    expect(adsTxtPublic).toContain('# Ads.txt v20261029')

    const { GET } = await import('@/app/ads.txt/route')
    const res = await GET()
    expect(res.status).toBe(301)
    expect(res.headers.get('location')).toBe('https://adstxt.journeymv.com/sites/bb9707b8-bfe3-4206-9309-6bc7e7923faf/ads.txt')
  })
})
