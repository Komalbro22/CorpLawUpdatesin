import fs from 'node:fs'
import path from 'node:path'

describe('UI Audit Fixes: Tablet Breakpoints & Reduced Motion', () => {
  const navbarContent = fs.readFileSync(path.join(process.cwd(), 'components/Navbar.tsx'), 'utf8')
  const updatesContent = fs.readFileSync(path.join(process.cwd(), 'app/updates/UpdatesClient.tsx'), 'utf8')
  const globalsCss = fs.readFileSync(path.join(process.cwd(), 'app/globals.css'), 'utf8')

  describe('Finding 1: Navbar tablet & narrow-screen responsive breakpoints', () => {
    it('uses lg: for desktop navigation to prevent tablet navigation clipping at 768px', () => {
      // Desktop nav container activates at lg: (1024px)
      expect(navbarContent).toContain('hidden lg:flex lg:items-center lg:gap-1')
      expect(navbarContent).not.toContain('hidden md:flex md:items-center md:gap-1')

      // Mobile controls stay active on tablet (< lg:)
      expect(navbarContent).toContain('lg:hidden')
      expect(navbarContent).not.toContain('md:hidden')
    })

    it('optimizes 320px narrow mobile header controls and logo', () => {
      // Narrow screen padding
      expect(navbarContent).toContain('px-3 sm:px-6 lg:px-8')
      // Responsive logo typography
      expect(navbarContent).toContain('text-lg sm:text-xl font-bold navbar-logo-text')
      // Compact touch targets for narrow viewports
      expect(navbarContent).toContain('size-9 sm:size-10')
    })
  })

  describe('Navigation Information Architecture: Separate Tools & Regulators', () => {
    it('separates Tools and Regulators into structured menus', () => {
      expect(navbarContent).toContain('Regulators')
      expect(navbarContent).toContain('Tools')
    })

    it('includes all 10 live regulatory categories without dropping CCI, NCLT, or Labour', () => {
      const requiredCategories = [
        '/category/mca',
        '/category/sebi',
        '/category/rbi',
        '/category/fema',
        '/category/ifsca',
        '/category/nclt',
        '/category/ibc',
        '/category/cci',
        '/category/labour',
        '/category/taxation',
      ]
      for (const catHref of requiredCategories) {
        expect(navbarContent).toContain(catHref)
      }
    })

    it('uses accurate facts: repo rate 5.50% and 500+ subscribers', () => {
      expect(navbarContent).toContain('5.50%')
      expect(navbarContent).not.toContain('6.50%')
      expect(navbarContent).toContain('500+')
      expect(navbarContent).not.toContain('10,000+')
    })

    it('caps mobile/tablet drawer width to sm:max-w-md off-canvas sheet', () => {
      expect(navbarContent).toContain('w-full sm:max-w-md')
    })
  })

  describe('Finding 1: Updates directory tablet responsiveness', () => {
    it('maintains single-column feed and top filter chips until lg: (1024px)', () => {
      // Flex direction switches at lg: instead of md:
      expect(updatesContent).toContain('flex flex-col lg:flex-row gap-8 lg:gap-10')
      expect(updatesContent).not.toContain('flex flex-col md:flex-row gap-8 md:gap-10')

      // Aside width switches at lg:
      expect(updatesContent).toContain('w-full lg:w-72 shrink-0')
      expect(updatesContent).not.toContain('w-full md:w-72 shrink-0')

      // Grid splits into 2 columns only at lg:
      expect(updatesContent).toContain('grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8 content-fade-in')
      expect(updatesContent).not.toContain('grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 content-fade-in')
    })
  })

  describe('Finding 2: Comprehensive reduced-motion accessibility', () => {
    it('disables or clamps animations under prefers-reduced-motion: reduce in globals.css', () => {
      expect(globalsCss).toContain('@media (prefers-reduced-motion: reduce)')
      expect(globalsCss).toContain('animation-duration: 0.01ms !important;')
      expect(globalsCss).toContain('animation-iteration-count: 1 !important;')
      expect(globalsCss).toContain('transition-duration: 0.01ms !important;')
      expect(globalsCss).toContain('scroll-behavior: auto !important;')

      // Check specific animation classes are suppressed
      expect(globalsCss).toContain('.badge-pulse')
      expect(globalsCss).toContain('.content-fade-in')
      expect(globalsCss).toContain('.animate-fade-up')
      expect(globalsCss).toContain('.animate-fade-in')
      expect(globalsCss).toContain('.animate-orb-1')
      expect(globalsCss).toContain('.animate-orb-2')
      expect(globalsCss).toContain('animation: none !important;')
      expect(globalsCss).toContain('transform: none !important;')
    })
  })
})
