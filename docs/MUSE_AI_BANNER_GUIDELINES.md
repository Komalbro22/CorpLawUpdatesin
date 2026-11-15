# Muse AI Operational Handbook: Creative Code-Rendered Banners

Welcome, **Muse AI**! This operational guide defines how you can autonomously design, preview, render, and publish high-impact, code-rendered editorial banners for **Corporate Law Updates** articles.

---

## 1. Editorial Philosophy: The "Zero-Click" Informational Banner

Corporate law readers—Company Secretaries (CS), Chartered Accountants (CA), Insolvency Professionals (IP), and General Counsels—do not read updates for entertainment. They are scanning for **actionable compliance intelligence**:
- *Did a deadline change?*
- *Did a financial threshold get revised?*
- *What is the exact penalty for non-compliance?*
- *Is this circular a clarification, an amendment, or debunking a rumor?*

### The Core Rule for Muse AI
> **Your banner is not decorative wallpaper. It is an executive summary.**
>
> If a busy partner or CFO only glances at the banner in **Google Discover**, a **WhatsApp share**, **LinkedIn feed**, or at the top of the article without reading a single word of text, **they must already know the critical outcome of the regulatory change.**

---

## 2. API Endpoints & Authentication

All banner endpoints are served under `/api/banner` and `/api/articles/[idOrSlug]/banner`.

### Authentication Headers
Pass your assigned API key via either:
```http
Authorization: Bearer <YOUR_API_KEY>
```
or
```http
x-api-key: <YOUR_API_KEY>
```

### Required API Key Scopes
- `banner:preview`: View catalog schema and test in-memory previews.
- `banner:write`: Create new banner candidates on an article.
- `banner:activate`: Automatically activate the banner as the live hero and OpenGraph image (`activate: true`).

---

## 3. Endpoints Overview

| Method | Endpoint | Scopes | Purpose |
|---|---|---|---|
| `GET` | `/api/banner/catalog` | `banner:preview` | Returns current themes, icons, visual schemas, and limits. |
| `POST` | `/api/banner/preview` | `banner:preview` | Renders an ephemeral banner in-memory. Returns base64 PNG, hash, and lint warnings. |
| `GET` | `/api/articles/[idOrSlug]/banner` | `banner:preview` | Retrieves the active banner and candidate history for an article. |
| `POST` | `/api/articles/[idOrSlug]/banner` | `banner:write` | Persists outputs to Supabase Storage and records candidate. Pass `"activate": true` to publish immediately. |
| `POST` | `/api/articles/[idOrSlug]/banner/[id]/activate` | `banner:activate` | Promotes a candidate banner to active. |
| `POST` | `/api/articles/[idOrSlug]/banner/deactivate` | `banner:activate` | Deactivates banner (reverts article to default fallback). |

---

## 4. Banner Spec Anatomy

Every banner is generated from a strongly typed JSON spec:

```json
{
  "theme": "mca",
  "category": "MCA Circular",
  "tag": "General Circular No. 05/2026",
  "icon": "building",
  "title": "MCA Extends Due Date for Filing Form MGT-7/7A",
  "subtitle": "Additional fee waiver granted for all companies up to 30th November 2026 without any late penalty.",
  "visual": { ... },
  "alt": "MCA circular extending MGT-7 and MGT-7A filing deadline to 30 November 2026 with full late fee waiver."
}
```

### Character Limits & Constraints
- `title`: 10 to 90 characters (keep it concise, active, and punchy).
- `subtitle`: Optional, 10 to 140 characters (summarizes the real-world impact).
- `tag`: Max 50 characters (e.g. circular number or notification number).
- `category`: Max 40 characters (e.g. `MCA Notification`, `SEBI Circular`, `RBI Directive`).
- `alt`: 20 to 200 characters (descriptive for accessibility, SEO, and Google Images).

### Supported Themes
- `mca`: Navy & Gold (Corporate Affairs, Companies Act, ROC)
- `sebi`: Deep Emerald & Mint (Securities, Capital Markets, Listed Cos)
- `rbi`: Royal Navy & Amber (Banking, NBFC, Forex, Repo Rate)
- `ibbi`: Ruby Red & Rose (Insolvency, Bankruptcy, NCLT)
- `cbdt`: Slate Indigo & Gold (Income Tax, Direct Taxes)
- `gst`: Teal & Cyan (Indirect Taxes, GST Council)
- `dgft`: Dark Amber (Foreign Trade, Import-Export)
- `cci`: Slate & Blue (Competition Commission)
- `default`: Professional Neutral Navy

### Supported Icons
`gavel`, `landmark`, `scale`, `building`, `trending-up`, `alert-triangle`, `calendar`, `file-text`, `shield-check`, `clock`, `percent`, `banknote`, `briefcase`, `award`, `search`.

---

## 5. The 6 Creative Visual Formulas

Select the visual component that directly solves the reader's question:

### Formula 1: The Deadline Shift (`calendar_shift`)
**Best for**: Filing deadline extensions, grace periods, moratoriums.
```json
{
  "visual": {
    "type": "calendar_shift",
    "oldDate": "31 Oct 2026",
    "newDate": "30 Nov 2026",
    "extendedDays": "+30 Days",
    "applicableFor": "All registered companies filing annual returns"
  }
}
```
*Why readers love it*: Instant side-by-side comparison. The red strikethrough on the old date and vibrant green on the new date immediately confirms the new filing window.

---

### Formula 2: The Key Numbers & Penalties (`stat_cards`)
**Best for**: Monetary penalty hikes, compliance fee slabs, interest rates, monetary thresholds.
```json
{
  "visual": {
    "type": "stat_cards",
    "cards": [
      {
        "label": "Basic Fine",
        "value": "₹50,000",
        "subtext": "Fixed statutory penalty",
        "delta": "+100%"
      },
      {
        "label": "Daily Fine",
        "value": "₹1,000",
        "subtext": "Per day of continuing default",
        "delta": "Max ₹5 Lakh"
      }
    ]
  }
}
```
*Why readers love it*: The Indian Rupee symbol (`₹`) and numbers stand out in large display typography, leaving zero ambiguity on legal risk.

---

### Formula 3: Threshold & Exemption Change (`before_after`)
**Best for**: Definition revisions (e.g. Small Company thresholds, paid-up capital limits, turnover criteria).
```json
{
  "visual": {
    "type": "before_after",
    "label": "Paid-Up Capital Threshold for Small Companies",
    "before": "Up to ₹4 Crore",
    "after": "Up to ₹10 Crore",
    "difference": "2.5x Expansion"
  }
}
```
*Why readers love it*: Clearly demarcates who was covered before vs. who is covered now.

---

### Formula 4: Regulatory Myth-Busting / Status Stamp (`stamp`)
**Best for**: Official circulars clarifying rumors, fake circulars circulating on social media, or high-priority enforcement.
```json
{
  "visual": {
    "type": "stamp",
    "stamp": "CLARIFIED",
    "text": "Director KYC is NOT extended; 30 September remains strict cutoff.",
    "subtext": "Circular No. 12/2026 dated 14 November 2026"
  }
}
```
*Stamp options*: `"CLARIFIED"`, `"CONFIRMED"`, `"AMENDED"`, `"EFFECTIVE IMMEDIATELY"`, `"REJECTED"`.

---

### Formula 5: Stakeholder Consultation Deadline (`date_card`)
**Best for**: Discussion papers, draft regulations, public comments windows.
```json
{
  "visual": {
    "type": "date_card",
    "date": "15",
    "month": "DEC",
    "year": "2026",
    "subtext": "Last date for submitting public comments to SEBI"
  }
}
```

---

### Formula 6: Key Takeaway Grid (`grid`)
**Best for**: Multi-point master directions or multi-faceted circulars.
```json
{
  "visual": {
    "type": "grid",
    "columns": 2,
    "items": [
      { "title": "Mandatory Form", "description": "Form PAS-6 semi-annual reconciliation" },
      { "title": "Applicability", "description": "All unlisted public companies" },
      { "title": "Penalty Section", "description": "Section 450 general penalties apply" },
      { "title": "Effective Date", "description": "Immediate effect from FY 2026-27" }
    ]
  }
}
```

---

## 6. End-to-End Workflow for Muse AI

### Step 1: Preview Ephemerally (Sanity & Lint Check)
Before saving, POST to `/api/banner/preview`:

```bash
curl -X POST https://www.corplawupdates.in/api/banner/preview \
  -H "Authorization: Bearer $CORPLAW_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "source_type": "template",
    "spec": {
      "theme": "sebi",
      "category": "SEBI Master Circular",
      "tag": "SEBI/HO/CFD/PoD-1/P/CIR/2026/88",
      "icon": "shield-check",
      "title": "Mandatory Cooling-off Period for InvIT OFS Extended",
      "subtitle": "Sponsors offering units for sale must observe an 8-week cooling-off period between consecutive tranches.",
      "visual": {
        "type": "calendar_shift",
        "oldDate": "2 Weeks",
        "newDate": "8 Weeks",
        "extendedDays": "+6 Weeks",
        "applicableFor": "Sponsors & Project Managers of registered InvITs"
      },
      "alt": "SEBI circular mandating 8 weeks cooling off period for InvIT offer for sale."
    }
  }'
```

The response returns:
```json
{
  "success": true,
  "png_base64": "iVBORw0KGgo...",
  "hash": "a4f78b12c...",
  "warnings": [],
  "render_ms": 42
}
```
If `warnings` contains items (e.g. title too long or contrast warning), refine the text accordingly.

### Step 2: Publish Candidate & Auto-Activate
Once satisfied, POST directly to the article:

```bash
curl -X POST https://www.corplawupdates.in/api/articles/sebi-invit-ofs-cooling-off-period-8-weeks/banner \
  -H "Authorization: Bearer $CORPLAW_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "source_type": "template",
    "activate": true,
    "spec": {
      "theme": "sebi",
      "category": "SEBI Master Circular",
      "tag": "CIR/2026/88",
      "icon": "shield-check",
      "title": "Mandatory Cooling-off Period for InvIT OFS Extended",
      "subtitle": "Sponsors offering units for sale must observe an 8-week cooling-off period between consecutive tranches.",
      "visual": {
        "type": "calendar_shift",
        "oldDate": "2 Weeks",
        "newDate": "8 Weeks",
        "extendedDays": "+6 Weeks",
        "applicableFor": "Sponsors & Project Managers of registered InvITs"
      },
      "alt": "SEBI circular mandating 8 weeks cooling off period for InvIT offer for sale."
    }
  }'
```

The response returns:
```json
{
  "success": true,
  "action": "created",
  "active": true,
  "banner": {
    "id": "e9c2b4a1-...",
    "hash": "a4f78b12c...",
    "formats": {
      "hero_webp": "https://...supabase.co/storage/v1/object/public/banners/articles/.../hero.webp",
      "og_png": "https://...supabase.co/storage/v1/object/public/banners/articles/.../og.png",
      "thumb_webp": "https://...supabase.co/storage/v1/object/public/banners/articles/.../thumb.webp"
    }
  }
}
```

Because `activate: true` was passed, the article immediately uses:
- `formats.og_png` as its `og:image` and `twitter:image` for social cards.
- `formats.og_png` in its `NewsArticle` Google Structured Data (JSON-LD).
- `formats.hero_webp` with `fetchPriority="high"` as the top visual header in the article body.
- `formats.og_png` in `sitemap.xml` under `<image:image>`.

---

## 7. Strict Constraints & Safety Guardrails

1. **NEVER USE IMAGES IN EMAIL NEWSLETTERS**:
   Corporate Law Updates maintains an elite inbox deliverability rate by delivering newsletters in clean, accessible HTML/text. **Never inject the banner image URL into newsletter campaigns, email dispatches, or RSS feeds.**
2. **Deterministic Idempotency**:
   The banner generator hashes the normalized spec with SHA-256. If you submit the exact same spec twice, the server returns the existing banner without re-rendering or duplicating assets.
3. **Typography & Symbols**:
   Always use the Indian Rupee symbol `₹` directly for monetary values (`₹5,00,000` or `₹10 Crore`). The rendering engine has the Inter font with full Indian Rupee glyph support pre-loaded.
4. **Contrast & Readability**:
   Always test that text is easily readable on mobile screens (minimum 300px width). Keep subtitles under 140 characters so the typography remains balanced and bold.

---

## 8. Questions or Custom Visual Requests?

Muse AI, if you encounter:
- An update where none of the 6 standard formulas feel like an exact fit,
- An unfamiliar regulator that needs a new color theme,
- Or any unexpected response from the API,

**Please ask immediately!** You can request a custom SVG/Satori markup snippet or propose a new visual schema. The engineering team will expand the component library to match your needs.
