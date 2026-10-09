-- Migration: 20261009000000_harden_increment_views_rpc.sql
-- Description: Hardens increment_views RPC with explicit search_path, input validation, and least-privilege role grants.
-- Addresses: SEC-003

CREATE OR REPLACE FUNCTION public.increment_views(article_slug text, increment_by int DEFAULT 1)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Strict input validation
  IF article_slug IS NULL OR length(trim(article_slug)) = 0 OR length(article_slug) > 300 THEN
    RAISE EXCEPTION 'Invalid article slug supplied to increment_views';
  END IF;

  IF increment_by IS NULL OR increment_by <= 0 OR increment_by > 500 THEN
    RAISE EXCEPTION 'Invalid increment value: must be between 1 and 500';
  END IF;

  UPDATE public.updates
  SET views = COALESCE(views, 0) + increment_by
  WHERE slug = article_slug;
END;
$$;

-- Restrict execution to service_role only (server-side callers)
REVOKE ALL ON FUNCTION public.increment_views(text, int) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_views(text, int) FROM anon;
GRANT EXECUTE ON FUNCTION public.increment_views(text, int) TO service_role;

-- Hardened get_total_views helper with search_path encapsulation
CREATE OR REPLACE FUNCTION public.get_total_views()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  total bigint;
BEGIN
  SELECT SUM(views) INTO total FROM public.updates;
  RETURN COALESCE(total, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.get_total_views() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_total_views() TO service_role, authenticated, anon;
