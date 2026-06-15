-- Optimized server-side aggregation for category counts (2026-06-15)
-- Replaces the full-table client-side scan on the /updates page.

CREATE OR REPLACE FUNCTION get_published_category_counts()
RETURNS TABLE(category text, count bigint)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT u.category, count(*) as count
  FROM updates u
  WHERE u.published_at IS NOT NULL
    AND u.published_at <= now()
  GROUP BY u.category;
$$;
