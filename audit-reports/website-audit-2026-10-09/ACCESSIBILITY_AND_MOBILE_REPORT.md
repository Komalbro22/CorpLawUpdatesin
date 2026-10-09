# Accessibility & Mobile UX Audit Report
**Target Website:** `https://corplawupdates.in` / `https://www.corplawupdates.in`  
**Execution Date:** 09 October 2026  
**Auditor:** Senior Accessibility Auditor & Mobile UX Specialist  
**Standards Applied:** W3C WCAG 2.1 & 2.2 Level AA, WAI-ARIA 1.2 Authoring Practices, Responsive Web Standards.

---

## 1. Executive Accessibility & Mobile UX Summary

CorpLawUpdates.in demonstrates strong high-level design ergonomics:
- **Responsive Layout:** Responsive grid architecture cleanly scales across mobile (375px), tablet (768px), and desktop (1440px) viewports with zero horizontal viewport overflow.
- **Reading Experience:** Typography scale, dark/light contrast ratios, sticky reading progress indicator, and persistent font-size toggles cater well to legal professionals.
- **Color Contrast:** Body copy and heading text achieve contrast ratios exceeding 4.5:1 on light mode and 7:1 on dark mode.

However, the audit identified **four critical and medium accessibility barriers** that violate WCAG 2.2 AA and W3C WAI-ARIA specifications, primarily centered around modal dialog duplication, ARIA attribute orphan references, and form control labeling.

---

## 2. Automated & Manual Accessibility Findings

### 2.1. [HIGH] A11Y-001: Duplicate `GlobalSearch` Dialog Mounts & Conflicting Focus Traps
- **Standard:** WCAG 2.1 Success Criterion 2.1.2 (No Keyboard Trap) & 4.1.2 (Name, Role, Value)
- **Source Code Location:** `components/Navbar.tsx` (lines 245 and 253):
  ```tsx
  {/* Desktop header controls */}
  <div className="ml-2 flex items-center gap-2">
    <GlobalSearch />
    ...
  </div>
  {/* Mobile header controls */}
  <div className="flex items-center gap-2 md:hidden">
    <GlobalSearch />
    ...
  </div>
  ```
- **Reproduction Steps:**
  1. Load any page on the website.
  2. Press `Ctrl + K` (or `Cmd + K` on macOS).
  3. Inspect the DOM in Chrome DevTools: **two identical modal dialogs are mounted and rendered simultaneously**.
  4. Press `Tab` to navigate through the modal.
- **Defect Impact:**
  Each instance of `<GlobalSearch />` attaches an independent `document.addEventListener('keydown', handleTabKey)` listener. Both focus-trap loops execute concurrently, fighting for focus and trapping keyboard-only and screen reader users in unpredictable focus loops.
- **Recommended Correction:**
  Lift `<GlobalSearch />` dialog state to a single shared React Context or render the dialog once in `app/layout.tsx`. In `Navbar.tsx`, render only lightweight trigger buttons that dispatch an `openSearch()` action.

---

### 2.2. [MEDIUM] A11Y-002: W3C ARIA Orphan Reference on Collapsed Categories Menu
- **Standard:** W3C WAI-ARIA 1.2 Section 6.6 (`aria-controls` validity)
- **Source Code Location:** `components/Navbar.tsx` (lines 189 and 208):
  ```tsx
  <button
    aria-expanded={categoriesOpen}
    aria-controls="category-dropdown-menu"
    ...
  >
    Categories
  </button>

  {categoriesOpen && (
    <div id="category-dropdown-menu" role="menu"> ... </div>
  )}
  ```
- **Reproduction Steps:**
  1. Load the homepage on initial load (`categoriesOpen` is `false`).
  2. Inspect the Categories button: `aria-controls="category-dropdown-menu"`.
  3. Search the DOM for `#category-dropdown-menu`: **element does not exist**.
- **Defect Impact:**
  Assistive technologies (screen readers like NVDA and VoiceOver) announce an interactive control that references an unmounted document ID. SquirrelScan flagged this as an ARIA validation error across 100% of crawled pages.
- **Recommended Correction:**
  Conditionally apply the attribute:
  ```tsx
  aria-controls={categoriesOpen ? "category-dropdown-menu" : undefined}
  ```
  Alternatively, keep the dropdown container in the DOM and toggle visibility via CSS (`hidden` or `display: none`).

---

### 2.3. [MEDIUM] A11Y-003: WCAG 2.5.3 (Label in Name) Failure in Article Font Size Toggle
- **Standard:** WCAG 2.1 / 2.2 Success Criterion 2.5.3 Level A (Label in Name)
- **Source Code Location:** `components/FontSizeToggle.tsx` (lines 54–81):
  ```typescript
  const labels: Record<FontSize, string> = { sm: 'A-', md: 'A', lg: 'A+' }
  const buttonLabels: Record<FontSize, string> = {
    sm: 'Small font size',
    md: 'Medium font size',
    lg: 'Large font size',
  }
  ```
- **Reproduction Steps:**
  1. Inspect the font buttons in an article header.
  2. Visible text rendered inside the button: `"A-"`, `"A"`, `"A+"`.
  3. Accessible name declared via `aria-label`: `"Small font size"`, `"Medium font size"`, `"Large font size"`.
- **Defect Impact:**
  Users who navigate using speech recognition software (e.g. Dragon NaturallySpeaking or Apple Voice Control) say the text they see on screen (e.g., "Click A", "Click A-"). Because the accessible name does not contain the visible text, the speech engine cannot match the component.
- **Recommended Correction:**
  Prepend the visible label to the accessible name:
  ```typescript
  const buttonLabels: Record<FontSize, string> = {
    sm: 'A- (Small font size)',
    md: 'A (Medium font size)',
    lg: 'A+ (Large font size)',
  }
  ```

---

### 2.4. [MEDIUM] A11Y-004: Unlabeled Form Inputs in Interactive Compliance Tools
- **Standard:** WCAG 2.1 Success Criterion 1.3.1 (Info and Relationships) & 3.3.2 (Labels or Instructions)
- **Source Code Location:**
  - `app/tools/cin-decoder/page.tsx` (line 170): CIN text input lacks `<label>` and `aria-label` (uses only `placeholder`).
  - `app/tools/roc-tracker/page.tsx` (lines 1071–1250): 18 feature toggle checkboxes are rendered beside visual `<p>` tags without `<label htmlFor>`, `<input id>`, or `aria-label`.
- **Reproduction Steps:**
  1. Navigate to `/tools/roc-tracker` using a screen reader.
  2. Tab into the Management & Structure section.
  3. The screen reader announces: `"Checkbox, unchecked"`, without reading the associated description.
- **Defect Impact:**
  Blind and low-vision users cannot identify what corporate characteristics (e.g., "Appointed Whole-time CS", "Has Subsidiaries") are being configured.
- **Recommended Correction:**
  Wrap each checkbox and description in a semantic `<label>` element, or bind `id` with `htmlFor` and provide an explicit `aria-label`.

---

## 3. Mobile Viewport & Touch Ergonomics Evaluation

| Viewport Tested | Resolution | Test Case | Status | Observations |
| :--- | :--- | :--- | :--- | :--- |
| **Mobile Standard** | 390 × 844 px | Article Reading Flow | **Pass** | Clean column width; sticky progress bar displays without jitter. |
| **Mobile Small** | 375 × 812 px | Tool Forms (`/tools/roc-tracker`) | **Pass** | Multi-column inputs stack vertically without horizontal clipping. |
| **Mobile Drawer** | 390 × 844 px | Mobile Hamburger Menu | **Pass** | Drawer slides in cleanly; links have adequate touch targets (≥44px). |
| **Tablet Portrait**| 768 × 1024 px | Category Hubs (`/category/*`) | **Pass** | Responsive 2-column grid adapts seamlessly. |

---

## 4. Remediation Checklist for Accessibility

- [ ] **A11Y-001:** Consolidate `<GlobalSearch />` dialog to single mount point in layout.
- [ ] **A11Y-002:** Remove `aria-controls="category-dropdown-menu"` when dropdown is unmounted.
- [ ] **A11Y-003:** Align visible button text with `aria-label` in `FontSizeToggle.tsx` (WCAG 2.5.3).
- [ ] **A11Y-004:** Add explicit `<label>` or `aria-label` attributes to CIN input and 18 ROC Tracker checkboxes.
- [ ] **A11Y-005:** Correct nested list markup in `updates/epfo-wage-ceiling-rs-25000-cabinet-approval-2026`.
