# CorpLawUpdates.in — Visual, Accessibility & Motion Audit Report

## Design Language Reference
- **Audited Surfaces**: Homepage (`/`), Article Page (`/updates/[slug]`), Glossary Page (`/glossary`)
- **Governing Design Doc**: `DESIGN.md`
- **Documented Decisions**: Navy `#0B1F3A`, Gold `#C9A84C`, Category-specific regulator accents (MCA Blue, SEBI Emerald, RBI Violet, NCLT Orange, IBC Red, FEMA Teal), Outfit headings, Source Sans 3 body.

---

## Combined Audit Findings (Ranked by Impact)

### 1. High Impact — Accessibility & Core Usability
- **[A11y] Inadequate Color Contrast on Brand Gold Elements (WCAG AA)**
  - *Location*: `app/page.tsx`, `components/Navbar.tsx`, `components/UpdateCard.tsx`
  - *Problem*: Gold text `#C9A84C` on light backgrounds (e.g. `#F8FAFC` or `#FFFFFF`) yields a contrast ratio of ~2.4:1, failing the WCAG AA requirement of 4.5:1 for standard body text and controls.
  - *Correction*: Calibrate brand gold token into accessible primary gold (`#B45309` / `amber-700` in light mode for text/borders, `#F59E0B` in dark mode) while retaining vibrant gold `#C9A84C` for solid container fills with high-contrast text.

- **[A11y] Missing Skip to Content Link & Main Content Landmark**
  - *Location*: `app/layout.tsx`, `components/Navbar.tsx`
  - *Problem*: Keyboard users and screen reader users cannot bypass the top sticky navigation bar (7+ desktop links) to jump directly to page content.
  - *Correction*: Add a visually hidden `<a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-amber-600 focus:text-white focus:rounded-lg">Skip to main content</a>` and ensure root viewports wrap main section content inside `<main id="main-content">`.

- **[A11y] Mobile Touch Target Sizes (< 44px)**
  - *Location*: `app/page.tsx` (Browse by regulator grid), `components/Navbar.tsx` (Category dropdown links), `components/FontSizeToggle.tsx`
  - *Problem*: Several category pills and action buttons have vertical heights of 28px–36px on mobile viewports, making them difficult to tap accurately.
  - *Correction*: Enforce minimum touch target sizes (`min-h-[44px]` and `min-w-[44px]`) across all interactive pills, buttons, and navigation dropdown items.

---

### 2. Medium Impact — Visual Polish, Typography & Design System Conformance
- **[UI] Inconsistent Hero Banner Styling & Inverted Theme Drift**
  - *Location*: `app/page.tsx`
  - *Problem*: The homepage hero uses a hardcoded dark section (`bg-slate-950`) even in light mode, creating a harsh visual break with the `#F8FAFC` page body below. The contrast between dark slate hero and light content cards lacks cohesive design transition.
  - *Correction*: Redesign hero with a unified, high-trust editorial header featuring rich navy depth (`#0B1F3A`), refined subtle grid pattern, accessible text contrast, and crisp call-to-action buttons.

- **[UI] Inconsistent Category Badge & Card Metadata Spacing**
  - *Location*: `components/UpdateCard.tsx`, `app/updates/[slug]/page.tsx`
  - *Problem*: `UpdateCard` uses inline style calculations and varying padding/badge borders between featured cards, popular cards, and standard category feeds. Line clamping and badge alignments shift unexpectedly on different screen widths.
  - *Correction*: Standardize card layout using a unified `UpdateCard` primitive with predefined slot positions for Category Badge, Statutory Reference Tag, Reading Time, and Bookmark button.

- **[UI] Typography Scale & Heading Hierarchy Inconsistencies**
  - *Location*: `app/updates/[slug]/page.tsx`, `components/GlossaryClient.tsx`
  - *Problem*: Article titles and glossary section headers mix different font weights (`font-bold` vs `font-extrabold`) and font families (`font-heading` vs default `font-sans`), breaking the visual hierarchy contract in `DESIGN.md`.
  - *Correction*: Apply unified typography tokens: `Outfit` (`font-heading`) strictly for all H1–H4 elements, `Source Sans 3` (`font-body`) for reading text, and `Inter` (`font-sans`) for UI controls and metadata labels.

---

### 3. Medium Impact — Motion & Performance Optimization
- **[Motion] Layout-Reflow Triggers during Scroll in Navbar**
  - *Location*: `components/Navbar.tsx`
  - *Problem*: Nav header animates height from `h-16` (64px) to `h-14` (56px) on scroll using `transition-[height]`. Animating `height` forces full-page layout re-calculations on every scroll frame.
  - *Correction*: Keep fixed container height and apply CSS transforms / padding transitions (`transform3d`, `opacity`, `backdrop-filter`) without mutating geometry properties.

- **[Motion] Unaccelerated Card Stagger & Hover Animations**
  - *Location*: `app/page.tsx`, `components/UpdateCard.tsx`
  - *Problem*: Hover states use `hover:-translate-y-1` without `will-change: transform` or GPU composition layers (`transform: translate3d(0, 0, 0)`), causing subtle frame drops during rapid scrolling or hovering.
  - *Correction*: Enforce GPU-accelerated motion rules from `fixing-motion-performance`: use `transform: translate3d(0, 0, 0)`, `will-change: transform, opacity`, and wrap animations in `@media (prefers-reduced-motion: no-preference)`.

---

## Actionable Plan Summary for Executor

1. **Accessibility Fixes**: Add skip navigation link, fix gold token contrast in light mode, increase mobile touch targets to >= 44px.
2. **Design System Alignment**: Standardize shared components (Header, Footer, Button, Card, ArticleLayout) using cohesive token scale.
3. **Motion Optimization**: Eliminate layout-thrashing CSS property transitions in sticky header and cards; enforce reduced-motion checks.
