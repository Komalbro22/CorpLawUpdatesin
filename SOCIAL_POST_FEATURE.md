# Social Media Auto-Posting Feature

## Overview
When an admin publishes an article (New or Edit), a modal appears offering to
share it automatically on **X (Twitter)** and **LinkedIn**.

---

## Files Created / Modified

### New Files
| File | Purpose |
|------|---------|
| `app/api/admin/social-post/route.ts` | Server-side API route that posts to Twitter & LinkedIn |
| `components/admin/SocialPostModal.tsx` | Client-side modal UI with platform toggles & preview |
| `SOCIAL_POST_FEATURE.md` | This documentation file |

### Modified Files
| File | Change |
|------|--------|
| `app/admin/articles/new/page.tsx` | Added modal state + trigger after "Publish Now" |
| `app/admin/articles/[id]/edit/page.tsx` | Added modal state + trigger after "Update & Publish" |
| `.env.local` | Added Twitter/X and LinkedIn API key placeholders |

---

## How It Works

1. Admin clicks **Publish Now** (new) or **Update & Publish** (edit).
2. Article is saved to Supabase as normal.
3. A modal (`SocialPostModal`) pops up asking which platforms to post to.
4. Admin selects X and/or LinkedIn → clicks **Post**.
5. Request hits `/api/admin/social-post` → posts via APIs.
6. Results shown (✅ / ❌) → **Done** button redirects to articles list.
7. **Skip for now** always available to bypass social posting.

---

## Hashtag Map (auto-applied by category)

| Category | Hashtags |
|----------|---------|
| MCA | #MCA #CompaniesAct #Compliance |
| SEBI | #SEBI #Securities #ListedCompanies |
| RBI | #RBI #MonetaryPolicy #Banking |
| NCLT | #NCLT #Insolvency #CorporateLaw |
| IBC | #IBC #Insolvency #Bankruptcy |
| FEMA | #FEMA #ForeignExchange #RBI |
| (other) | #CorporateLaw #Compliance |

---

## Environment Variables Required

Add to `.env.local` **and** Vercel Environment Variables:

```env
# Twitter/X API
TWITTER_BEARER_TOKEN=
TWITTER_API_KEY=
TWITTER_API_SECRET=
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_SECRET=

# LinkedIn API
LINKEDIN_ACCESS_TOKEN=
LINKEDIN_PERSON_ID=
```

---

## API Setup Instructions

### Twitter / X

1. Go to <https://developer.twitter.com>
2. Create a new App on the **Free Basic plan**
3. Generate keys under **Keys and Tokens**:
   - API Key & Secret
   - Access Token & Secret
   - Bearer Token
4. Add all five values to Vercel Environment Variables
5. Ensure the App has **Read and Write** permissions

### LinkedIn

1. Go to <https://www.linkedin.com/developers>
2. Create an App linked to your company page
3. Request these OAuth scopes:
   - `r_liteprofile`
   - `w_member_social`
4. Generate an **Access Token** (valid ~60 days; refresh regularly)
5. Find your **Person ID** via the LinkedIn API or your profile URL
6. Add `LINKEDIN_ACCESS_TOKEN` and `LINKEDIN_PERSON_ID` to Vercel

---

## Notes

- Until API keys are configured, the modal will display but posting will
  **fail gracefully** with an error message — it will NOT crash the app.
- "Save Draft" and "Schedule" buttons do **not** trigger the social modal.
- Only "Publish Now" and "Update & Publish" trigger the social sharing flow.
- The Supabase SQL from Section 5 of the original spec can be run optionally
  to store Twitter handle and LinkedIn page ID as site settings.
