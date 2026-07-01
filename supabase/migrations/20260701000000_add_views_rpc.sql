-- Migration to add RPC functions for view counting
-- Allows batch updating of views and fetching total views

CREATE OR REPLACE FUNCTION increment_views(article_slug text, increment_by int DEFAULT 1)
RETURNS void AS $$
BEGIN
  UPDATE updates
  SET views = COALESCE(views, 0) + increment_by
  WHERE slug = article_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_total_views()
RETURNS bigint AS $$
DECLARE
  total bigint;
BEGIN
  SELECT SUM(views) INTO total FROM updates;
  RETURN COALESCE(total, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
