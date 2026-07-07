-- Aggregate high-traffic waitlist and community poll reads so the browser does
-- not need to fetch every waitlist row or every poll vote row as usage grows.

CREATE OR REPLACE FUNCTION public.get_waitlist_summary(p_user_id text)
RETURNS TABLE (
  community_id text,
  waitlist_count integer,
  joined boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    cw.community_id,
    count(*)::integer AS waitlist_count,
    bool_or(cw.user_id = p_user_id) AS joined
  FROM public.community_waitlist cw
  GROUP BY cw.community_id
  ORDER BY cw.community_id;
$$;

REVOKE EXECUTE ON FUNCTION public.get_waitlist_summary(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_waitlist_summary(text) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_community_poll_summaries(
  p_community_id text,
  p_user_id text,
  p_limit integer DEFAULT 25
)
RETURNS TABLE (
  id uuid,
  community_id text,
  question text,
  created_by_user_id text,
  created_by_username text,
  created_at timestamptz,
  options jsonb,
  total_votes integer,
  user_vote_option_id uuid
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH recent_polls AS (
    SELECT p.*
    FROM public.community_polls p
    WHERE p.community_id = p_community_id
    ORDER BY p.created_at DESC
    LIMIT greatest(1, least(coalesce(p_limit, 25), 50))
  ),
  option_counts AS (
    SELECT
      v.option_id,
      count(*)::integer AS vote_count
    FROM public.community_poll_votes v
    JOIN recent_polls p ON p.id = v.community_poll_id
    GROUP BY v.option_id
  ),
  user_votes AS (
    SELECT DISTINCT ON (v.community_poll_id)
      v.community_poll_id,
      v.option_id
    FROM public.community_poll_votes v
    JOIN recent_polls p ON p.id = v.community_poll_id
    WHERE v.user_id = p_user_id
    ORDER BY v.community_poll_id, v.created_at DESC
  )
  SELECT
    p.id,
    p.community_id,
    p.question,
    p.created_by_user_id,
    p.created_by_username,
    p.created_at,
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', o.id::text,
          'text', o.label,
          'votes', coalesce(oc.vote_count, 0)
        )
        ORDER BY o.position
      ) FILTER (WHERE o.id IS NOT NULL),
      '[]'::jsonb
    ) AS options,
    coalesce(sum(coalesce(oc.vote_count, 0)), 0)::integer AS total_votes,
    uv.option_id AS user_vote_option_id
  FROM recent_polls p
  LEFT JOIN public.community_poll_options o ON o.community_poll_id = p.id
  LEFT JOIN option_counts oc ON oc.option_id = o.id
  LEFT JOIN user_votes uv ON uv.community_poll_id = p.id
  GROUP BY
    p.id,
    p.community_id,
    p.question,
    p.created_by_user_id,
    p.created_by_username,
    p.created_at,
    uv.option_id
  ORDER BY p.created_at ASC;
$$;

REVOKE EXECUTE ON FUNCTION public.get_community_poll_summaries(text, text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_community_poll_summaries(text, text, integer) TO anon, authenticated, service_role;
