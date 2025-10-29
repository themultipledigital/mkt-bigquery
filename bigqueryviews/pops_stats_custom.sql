-- View: level-hope-462409-a8.mkt_channels.pops_stats_custom
-- Dataset: mkt_channels
--

-- BigQuery View: POPS Stats Custom Fields
-- Creates custom fields from exo_stats and tj_stats tables for Looker Studio compatibility
SELECT 
  date,
  'ExoClick' AS channel,
  campaign_id,
  campaign_name,
  impressions,
  clicks,
  goals AS conversions,
  conversion_value,
  cost AS spend,
  retrieved_at,
  -- S2S metrics derived from goals_breakdown
  (SELECT COALESCE(SUM(g.conversions), 0)
     FROM UNNEST(IFNULL(goals_breakdown, [])) AS g
     WHERE REGEXP_CONTAINS(LOWER(g.goal_name), r'^[a-z]{2,3}_first_deposit$')
  ) AS `ftd-s2s`,
  (SELECT COALESCE(SUM(g.conversions), 0)
     FROM UNNEST(IFNULL(goals_breakdown, [])) AS g
     WHERE REGEXP_CONTAINS(LOWER(g.goal_name), r'^[a-z]{2,3}_deposit$')
  ) AS `deposit-s2s`,
  (SELECT COALESCE(SUM(g.conversions), 0)
     FROM UNNEST(IFNULL(goals_breakdown, [])) AS g
     WHERE REGEXP_CONTAINS(LOWER(g.goal_name), r'^[a-z]{2,3}_registration_completed$')
  ) AS `reg-s2s`,
  (SELECT COALESCE(SUM(g.conversion_value), 0)
     FROM UNNEST(IFNULL(goals_breakdown, [])) AS g
     WHERE REGEXP_CONTAINS(LOWER(g.goal_name), r'^[a-z]{2,3}_first_deposit$')
  ) AS `ftd-s2s_val`,
  (SELECT COALESCE(SUM(g.conversion_value), 0)
     FROM UNNEST(IFNULL(goals_breakdown, [])) AS g
     WHERE REGEXP_CONTAINS(LOWER(g.goal_name), r'^[a-z]{2,3}_deposit$')
  ) AS `deposit-s2s_val`,
  (SELECT COALESCE(SUM(g.conversion_value), 0)
     FROM UNNEST(IFNULL(goals_breakdown, [])) AS g
     WHERE REGEXP_CONTAINS(LOWER(g.goal_name), r'^[a-z]{2,3}_registration_completed$')
  ) AS `reg-s2s_val`

FROM `level-hope-462409-a8.mkt_channels.exo_stats`

UNION ALL

SELECT 
  date,
  'TrafficJunky' AS channel,
  campaign_id,
  campaign_name,
  impressions,
  clicks,
  conversions,
  0 AS conversion_value,  -- TJ doesn't have conversion_value, set to 0
  cost AS spend,
  retrieved_at,
  0 AS `ftd-s2s`,
  0 AS `deposit-s2s`,
  0 AS `reg-s2s`,
  0.0 AS `ftd-s2s_val`,
  0.0 AS `deposit-s2s_val`,
  0.0 AS `reg-s2s_val`

FROM `level-hope-462409-a8.mkt_channels.tj_campaign_stats`

UNION ALL

SELECT 
  date,
  'TrafficStars' AS channel,
  campaign_id,
  campaign_name,
  impressions,
  clicks,
  conversions,
  0 AS conversion_value,  -- TS doesn't have conversion_value, set to 0
  cost AS spend,
  retrieved_at,
  0 AS `ftd-s2s`,
  0 AS `deposit-s2s`,
  0 AS `reg-s2s`,
  0.0 AS `ftd-s2s_val`,
  0.0 AS `deposit-s2s_val`,
  0.0 AS `reg-s2s_val`

FROM `level-hope-462409-a8.mkt_channels.ts_stats_siteid`