-- Optional article categorisation plus explicit sponsorship and visibility controls.
-- Existing articles retain their current category and receive safe false/null defaults.
ALTER TABLE public.updates
  ALTER COLUMN category DROP NOT NULL;

ALTER TABLE public.updates
  ADD COLUMN IF NOT EXISTS is_sponsored boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sponsor_name text,
  ADD COLUMN IF NOT EXISTS contributor_name text,
  ADD COLUMN IF NOT EXISTS hold_external_links boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hide_from_listings boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS noindex boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS updates_sponsored_idx
  ON public.updates (is_sponsored)
  WHERE is_sponsored = true;

CREATE INDEX IF NOT EXISTS updates_public_listing_idx
  ON public.updates (published_at DESC)
  WHERE hide_from_listings = false;

CREATE OR REPLACE FUNCTION public.get_published_category_counts()
RETURNS TABLE(category text, count bigint)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT u.category, count(*) AS count
  FROM public.updates u
  WHERE u.published_at IS NOT NULL
    AND u.published_at <= now()
    AND u.hide_from_listings = false
  GROUP BY u.category;
$$;
