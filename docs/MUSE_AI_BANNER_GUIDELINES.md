# 🎨 Muse AI Operational Handbook: Creative Code-Rendered Banners
**CorpLawUpdates.in · Engine Version: 2.73.1**

Welcome, **Muse AI**! This handbook is your authoritative guide to autonomously creating, designing, and publishing high-impact, code-rendered editorial banners for **Corporate Law Updates** articles.

---

## 1. Editorial Core Principle: The "Zero-Click" Executive Summary

Corporate law professionals—Company Secretaries (CS), Chartered Accountants (CA), Insolvency Professionals (IP), and Legal Counsels—scan compliance updates rapidly on **Google Discover**, **LinkedIn**, and **WhatsApp**.

> [!IMPORTANT]
> **Your banner is not decorative wallpaper; it is an actionable executive summary.**
>
> If a partner, director, or CFO only glances at the banner for two seconds without reading the article text, **they must already know the exact outcome of the regulatory change:**
> - *What is the new deadline?*
> - *What is the revised statutory threshold or monetary limit?*
> - *What is the exact penalty amount?*
> - *Is this a clarification of a rumor or an official amendment?*

---

## 2. API Endpoints & Authentication

All banner operations use standard REST endpoints authenticated with your API key:

### Request Headers
```http
Authorization: Bearer <YOUR_API_KEY>
Content-Type: application/json
```
*(or `x-api-key: <YOUR_API_KEY>`)*

### Permissions & Auto-Activation
Your active key (`muse ai`) has:
- `banner:preview`: For testing live ephemeral renders.
- `banner:write`: For creating banners on articles.
- `banner:activate`: **Now enabled!** Any banner you POST to an article **automatically becomes active immediately**—no human approval or manual button clicking is required.

---

## 3. Endpoints Quick Reference

| Endpoint | Method | Purpose |
|---|---|---|
| `GET /api/banner/catalog` | `GET` | Fetches live schema, regulators, icons, and limits. |
| `POST /api/banner/preview` | `POST` | Renders in-memory test PNG (ephemeral, does not save to DB). |
| `POST /api/articles/[idOrSlug]/banner` | `POST` | Renders, saves to Supabase Storage, and **auto-activates live**. |
| `GET /api/articles/[idOrSlug]/banner` | `GET` | Retrieves active banner and history for an article. |

---

## 4. The Live Spec Schema Anatomy

The request payload must use **`mode: "template"`** with the following strongly-typed structure:

```json
{
  "mode": "template",
  "spec": {
    "v": 1,
    "regulator": "RBI",
    "headline": "One Rulebook for Money Transfers",
    "sub": "RBI consolidates domestic money transfer rules into one direction. Cash pay-out limits unchanged.",
    "action": "Check the unchanged limits",
    "dateLabel": "Nov 2026",
    "impact": "Medium",
    "alt": "RBI DMT Directions 2026: one rulebook for money transfers, cash pay-out limits unchanged.",
    "visual": {
      "type": "stat_cards",
      "items": [
        { "label": "Cash Pay-Out Limit", "value": "₹10,000", "chip": "Per Txn" },
        { "label": "Monthly Limit", "value": "₹25,000", "chip": "Per Month" }
      ]
    }
  }
}
```

### Strict Field Validation Limits
- `regulator`: One of `'MCA'`, `'SEBI'`, `'RBI'`, `'IBC'`, `'NCLT'`, `'FEMA'`, `'IFSCA'`, `'CCI'`, `'LABOUR'`, `'TAXATION'`.
- `headline`: **8 to 70 characters** (Recommended: 25 to 50 characters for bold, clean visual balance).
- `sub`: **Optional, max 100 characters** (Concise takeaway answering *“What does this mean for companies?”*).
- `action`: **Optional, max 46 characters** (Action chip, e.g., `"Review revised limits"`, `"Filing window opens"`, `"Immediate effect"`).
- `dateLabel`: **Max 20 characters** (e.g., `"Nov 2026"`, `"15 Nov 2026"`).
- `impact`: `'High'`, `'Medium'`, or `'Lower'`.
- `alt`: **20 to 140 characters** (Descriptive sentence for accessibility, Google Images, and SEO).
- **Banner Size**: Deterministic **1200 × 630 px** (the golden ratio for OpenGraph, Twitter Large Card, and Google Discover).

---

## 5. How to Design Creative, Informative Banners: The 6 Formulas

Always choose the visual component that immediately solves the reader's core question:

---

### Formula 1: Key Numbers & Statutory Limits (`stat_cards`)
**Best for**: Rate revisions, monetary fines, daily penalties, transaction caps, fee slabs.
- Displays up to 2 high-contrast stat cards.
- `value`: Max 9 characters (always use real Indian Rupee symbol `₹`, percentages `%`, or time units).
- `chip`: Max 12 characters (e.g., `"+50 bps"`, `"Per Day"`, `"Per Txn"`).

```json
{
  "visual": {
    "type": "stat_cards",
    "items": [
      { "label": "Per Transaction Limit", "value": "₹10,000", "chip": "Unchanged" },
      { "label": "Monthly Limit", "value": "₹25,000", "chip": "Per Remitter" }
    ]
  }
}
```
*Why readers love it*: Zero ambiguity. In 1 second, the compliance officer knows the exact monetary cutoff.

---

### Formula 2: The Deadline Shift (`calendar_shift`)
**Best for**: Filing extensions, grace periods, moratoriums (MCA annual returns, CBDT ITR deadlines, ROC forms).
- Strikethrough on the old date; vivid emerald highlight on the new deadline.

```json
{
  "visual": {
    "type": "calendar_shift",
    "from": { "month": "OCT", "day": "31" },
    "to": { "month": "NOV", "day": "30" },
    "strike": true,
    "toLabel": "NEW DEADLINE"
  }
}
```
*Why readers love it*: It looks like a physical calendar shift. Instantly answers: *“How much extra time do we have?”*

---

### Formula 3: Threshold & Exemption Change (`before_after`)
**Best for**: Definition revisions (Small company limits, net worth thresholds, mandatory audit limits).
- Side-by-side comparison with directional arrow (`"up"`, `"down"`, or `"none"`).

```json
{
  "visual": {
    "type": "before_after",
    "oldValue": "₹4 Crore",
    "newValue": "₹10 Crore",
    "direction": "up",
    "oldLabel": "Previous Cutoff",
    "newLabel": "Revised Threshold"
  }
}
```
*Why readers love it*: Immediately clarifies whether a client company now qualifies for an exemption.

---

### Formula 4: Consultation & Public Feedback Cutoff (`date_card`)
**Best for**: Draft regulations, exposure drafts, discussion papers where public comments are invited.

```json
{
  "visual": {
    "type": "date_card",
    "label": "COMMENTS CLOSE",
    "month": "DEC",
    "day": "15",
    "year": "2026",
    "caption": "Submit stakeholder feedback to SEBI by 5:00 PM IST"
  }
}
```
*Why readers love it*: Creates a clear compliance countdown for policy advisors and corporate teams.

---

### Formula 5: Rumor Busting & Verification Stamp (`stamp`)
**Best for**: Official clarifications refuting fake notifications, social media rumors, or ambiguous press reports.
- `stamp`: Must be one of `"CLARIFIED"`, `"CONFIRMED"`, `"AMENDED"`, `"WITHDRAWN"`, or `"FAKE"`.
- `claim`: Max 140 characters describing the official position.

```json
{
  "visual": {
    "type": "stamp",
    "stamp": "CLARIFIED",
    "claim": "Director KYC deadline is NOT extended; 30 September remains strict cutoff date."
  }
}
```
*Why readers love it*: Immediately stops panic and misinformation in corporate WhatsApp groups.

---

### Formula 6: Institutional Badge & Overview (`icon_panel`)
**Best for**: Landmark Supreme Court / NCLAT judgments, master policy directions, or organizational updates.
- Supported icons: `building-bank`, `coins`, `file-check`, `chart-line`, `scale`, `building`, `users`, `receipt`, `globe`, `gavel`, `shield-check`, `message-square-text`, `calendar`, `alert-triangle`, `clock`.

```json
{
  "visual": {
    "type": "icon_panel",
    "icon": "scale",
    "label": "NCLAT Full Bench Precedent"
  }
}
```

---

## 6. Official Regulator Palettes & Identities

Banners automatically adopt distinct visual accents based on the selected `regulator`:

| Regulator | Domain / Vertical | Primary Background | Accent Color |
|---|---|---|---|
| **MCA** | Companies Act, ROC, Corporate Affairs | Royal Navy (`#1E3A8A`) | Gold Amber (`#F5A623`) |
| **SEBI** | Securities, Capital Markets, Mutual Funds | Deep Purple (`#4C1D95`) | Bright Canary (`#FDE047`) |
| **RBI** | Banking, NBFC, Payments, Forex, Repo | Forest Emerald (`#065F46`) | Golden Amber (`#F5C542`) |
| **IBC** | Insolvency, Bankruptcy Code, Liquidation | Crimson Rust (`#9A3412`) | Warm Peach (`#FED7AA`) |
| **NCLT** | Company Law Tribunals, Judgments | Slate Blue (`#334155`) | Sky Blue (`#7DD3FC`) |
| **FEMA** | Foreign Exchange Management, Cross-border | Ocean Teal (`#0C5A7A`) | Mint Turquoise (`#5EEAD4`) |
| **IFSCA** | GIFT City, International Financial Hub | Magenta Violet (`#86198F`) | Soft Pink (`#F9A8D4`) |
| **CCI** | Anti-trust, Mergers & Acquisitions | Rich Burgundy (`#9F1239`) | Rose Coral (`#FDA4AF`) |
| **LABOUR** | EPFO, ESI, Wages, Occupational Safety | Olive Emerald (`#3F6212`) | Lime Accent (`#BEF264`) |
| **TAXATION**| Income Tax (CBDT), GST Council, CBIC | Deep Ochre (`#713F12`) | Warm Gold (`#FCD34D`) |

---

## 7. Step-by-Step Publishing Workflow for Muse AI

### Step 1: (Optional) Test Render via Ephemeral Preview
If you want to verify that your spec is 100% valid before attaching it:

```bash
curl -X POST https://www.corplawupdates.in/api/banner/preview \
  -H "Authorization: Bearer $CORPLAW_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "template",
    "spec": {
      "v": 1,
      "regulator": "RBI",
      "headline": "One Rulebook for Money Transfers",
      "sub": "RBI consolidates domestic money transfer rules into one direction. Cash pay-out limits unchanged.",
      "action": "Check unchanged limits",
      "dateLabel": "Nov 2026",
      "impact": "Medium",
      "alt": "RBI DMT Directions 2026: one rulebook for money transfers.",
      "visual": {
        "type": "stat_cards",
        "items": [
          { "label": "Cash Pay-Out Limit", "value": "₹10,000", "chip": "Per Txn" },
          { "label": "Monthly Limit", "value": "₹25,000", "chip": "Per Month" }
        ]
      }
    }
  }'
```

### Step 2: Attach & Auto-Activate on the Article
POST directly to the article endpoint (using either the article UUID or slug):

```bash
curl -X POST https://www.corplawupdates.in/api/articles/45eb9633-070d-4dae-802e-757e7cd5ebc8/banner \
  -H "Authorization: Bearer $CORPLAW_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "template",
    "spec": {
      "v": 1,
      "regulator": "RBI",
      "headline": "One Rulebook for Money Transfers",
      "sub": "RBI consolidates domestic money transfer rules into one direction. Cash pay-out limits unchanged.",
      "action": "Check unchanged limits",
      "dateLabel": "Nov 2026",
      "impact": "Medium",
      "alt": "RBI DMT Directions 2026: one rulebook for money transfers.",
      "visual": {
        "type": "stat_cards",
        "items": [
          { "label": "Cash Pay-Out Limit", "value": "₹10,000", "chip": "Per Txn" },
          { "label": "Monthly Limit", "value": "₹25,000", "chip": "Per Month" }
        ]
      }
    }
  }'
```

### What Happens Automatically:
1. The server renders deterministic PNG and WebP images.
2. Assets are saved to Supabase Storage with clean CDN URLs.
3. Because your key has `banner:activate`, the banner is **automatically activated immediately**:
   - Live on-page hero image (`hero.webp`)
   - `og:image` and `twitter:image` social preview cards (`og.png`)
   - Google `NewsArticle` Structured Data (JSON-LD)
   - Image sitemap (`sitemap.xml`)
4. **Zero human intervention required!**

---

## 8. Strict Guardrails & Ground Rules

1. **100% Verified Legal Facts Only**:
   - Never use fictional or unverified numbers.
   - Every circular number, date, penalty amount, and threshold must come from the official gazette, circular, or regulator PDF.
2. **Never Inject Images Into Newsletters**:
   - CorpLawUpdates sends clean, fast, text-and-table email newsletters to protect deliverability and avoid Gmail clipping. **Never embed banner images into newsletter dispatches.**
3. **Typography**:
   - Always write Indian Rupee values with the true symbol `₹` (e.g., `₹50,000` or `₹10,000`). The rendering engine pre-loads Inter fonts with full Indian Rupee glyph support.
4. **Idempotency**:
   - If you submit the identical spec twice, the server returns the existing banner without re-rendering or duplicating assets.
