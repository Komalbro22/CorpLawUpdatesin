import fs from 'fs'
import path from 'path'

describe('Mediavine Journey Disable Ads Blocklist Div', () => {
  it('is rendered in app/layout.tsx inside body with all 15 blocklist attributes (in-content allowed only)', () => {
    const layoutContent = fs.readFileSync(path.join(process.cwd(), 'app/layout.tsx'), 'utf8')
    
    expect(layoutContent).toContain('id="ad-management-config-settings"')
    expect(layoutContent).toContain('data-blocklist-leaderboard="1"')
    expect(layoutContent).toContain('data-blocklist-sidebar-atf="1"')
    expect(layoutContent).toContain('data-blocklist-sidebar-btf="1"')
    expect(layoutContent).toContain('data-blocklist-adhesion-mobile="1"')
    expect(layoutContent).toContain('data-blocklist-adhesion-tablet="1"')
    expect(layoutContent).toContain('data-blocklist-adhesion-desktop="1"')
    expect(layoutContent).toContain('data-blocklist-recipe="1"')
    expect(layoutContent).toContain('data-blocklist-auto-insert-sticky="1"')
    expect(layoutContent).toContain('data-blocklist-chicory="1"')
    expect(layoutContent).toContain('data-blocklist-zergnet="1"')
    expect(layoutContent).toContain('data-blocklist-interstitial-mobile="1"')
    expect(layoutContent).toContain('data-blocklist-interstitial-desktop="1"')
    expect(layoutContent).toContain('data-blocklist-universal-player-desktop="1"')
    expect(layoutContent).toContain('data-blocklist-universal-player-mobile="1"')
    expect(layoutContent).toContain('data-blocklist-gumgum-skins="1"')
    
    // Ensure in-content ads are NOT blocked
    expect(layoutContent).not.toContain('data-blocklist-content="1"')
    expect(layoutContent).not.toContain('data-blocklist-content-mobile="1"')
    expect(layoutContent).not.toContain('data-blocklist-content-desktop="1"')
    
    // Ensure it appears exactly once in layout
    const occurrences = (layoutContent.match(/id="ad-management-config-settings"/g) || []).length
    expect(occurrences).toBe(1)
  })
})
