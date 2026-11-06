import React from 'react'

let currentPath = '/'

jest.mock('next/navigation', () => ({
  usePathname: () => currentPath,
}))

// eslint-disable-next-line @typescript-eslint/no-require-imports
const MediavineScript = require('@/components/MediavineScript').default

describe('Mediavine Journey Script Route Gating', () => {
  it('excludes /admin routes and renders on public routes', () => {
    currentPath = '/admin/dashboard'
    expect(MediavineScript()).toBeNull()

    currentPath = '/admin/login'
    expect(MediavineScript()).toBeNull()

    currentPath = '/admin'
    expect(MediavineScript()).toBeNull()

    currentPath = '/admin/settings'
    expect(MediavineScript()).toBeNull()

    currentPath = '/'
    const homeEl = MediavineScript()
    expect(homeEl).not.toBeNull()

    currentPath = '/updates/mca21-v3-login-guide'
    const articleEl = MediavineScript()
    expect(articleEl).not.toBeNull()

    currentPath = '/guides'
    const guidesEl = MediavineScript()
    expect(guidesEl).not.toBeNull()
  })
})
