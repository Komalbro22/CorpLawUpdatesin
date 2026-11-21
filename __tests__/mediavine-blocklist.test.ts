import fs from 'fs'
import path from 'path'

describe('Mediavine Journey Complete Absence Test', () => {
  it('confirms app/layout.tsx contains no Mediavine script, config div, or blocklist attributes', () => {
    const layoutContent = fs.readFileSync(path.join(process.cwd(), 'app/layout.tsx'), 'utf8')
    
    expect(layoutContent).not.toContain('MediavineScript')
    expect(layoutContent).not.toContain('id="ad-management-config-settings"')
    expect(layoutContent).not.toContain('data-blocklist-leaderboard')
    expect(layoutContent).not.toContain('data-blocklist-sidebar')
    expect(layoutContent).not.toContain('data-blocklist-adhesion')
  })
})
