-- View: level-hope-462409-a8.mkt_channels.pops_stats_custom
-- Dataset: mkt_channels
--

-- BigQuery View: POPS Stats Custom Fields

-- Creates custom fields from exo_stats and tj_stats tables for Looker Studio compatibility
-- Version: 1.1.0
-- Updated: Added USD to EUR conversion for USD channels using exchange rate table

SELECT 

  exo_data.date,

  exo_data.channel,

  exo_data.campaign_id,

  exo_data.campaign_name,

  exo_data.impressions,

  exo_data.clicks,

  exo_data.conversions,

  exo_data.conversion_value,

  -- Convert USD spend to EUR using exchange rate
  CASE 
    WHEN usd_accounts.channel IS NOT NULL AND usdeur.rate IS NOT NULL 
    THEN exo_data.cost * usdeur.rate 
    ELSE exo_data.cost 
  END AS spend,

  exo_data.retrieved_at,

  exo_data.`ftd-s2s`,

  exo_data.`deposit-s2s`,

  exo_data.`reg-s2s`,

  exo_data.`ftd-s2s_val`,

  exo_data.`deposit-s2s_val`,

  exo_data.`reg-s2s_val`

FROM (
  SELECT 

    date,

    'ExoClick' AS channel,

    campaign_id,

    campaign_name,

    impressions,

    clicks,

    goals AS conversions,

    conversion_value,

    cost,

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
) AS exo_data

-- Join with USD accounts table to identify USD channels (ensure no duplicates)
LEFT JOIN (
  SELECT DISTINCT channel, currency
  FROM `level-hope-462409-a8.utils.usd_accounts`
  WHERE channel IS NOT NULL
) AS usd_accounts
  ON exo_data.channel = usd_accounts.channel

-- Join with USD/EUR exchange rate table to get daily rates (ensure no duplicates)
LEFT JOIN (
  SELECT DISTINCT date, rate
  FROM `level-hope-462409-a8.utils.usdeur`
) AS usdeur
  ON exo_data.date = usdeur.date



UNION ALL



SELECT 

  tj_data.date,

  tj_data.channel,

  tj_data.campaign_id,

  tj_data.campaign_name,

  tj_data.impressions,

  tj_data.clicks,

  tj_data.conversions,

  tj_data.conversion_value,

  -- Convert USD spend to EUR using exchange rate
  CASE 
    WHEN usd_accounts.channel IS NOT NULL AND usdeur.rate IS NOT NULL 
    THEN tj_data.cost * usdeur.rate 
    ELSE tj_data.cost 
  END AS spend,

  tj_data.retrieved_at,

  tj_data.`ftd-s2s`,

  tj_data.`deposit-s2s`,

  tj_data.`reg-s2s`,

  tj_data.`ftd-s2s_val`,

  tj_data.`deposit-s2s_val`,

  tj_data.`reg-s2s_val`

FROM (
  SELECT 

    date,

    'TrafficJunky' AS channel,

    campaign_id,

    campaign_name,

    impressions,

    clicks,

    conversions,

    0 AS conversion_value,  -- TJ doesn't have conversion_value, set to 0

    cost,

    retrieved_at,

    0 AS `ftd-s2s`,

    0 AS `deposit-s2s`,

    0 AS `reg-s2s`,

    0.0 AS `ftd-s2s_val`,

    0.0 AS `deposit-s2s_val`,

    0.0 AS `reg-s2s_val`

  FROM `level-hope-462409-a8.mkt_channels.tj_campaign_stats`
) AS tj_data

-- Join with USD accounts table to identify USD channels (ensure no duplicates)
LEFT JOIN (
  SELECT DISTINCT channel, currency
  FROM `level-hope-462409-a8.utils.usd_accounts`
  WHERE channel IS NOT NULL
) AS usd_accounts
  ON tj_data.channel = usd_accounts.channel

-- Join with USD/EUR exchange rate table to get daily rates (ensure no duplicates)
LEFT JOIN (
  SELECT DISTINCT date, rate
  FROM `level-hope-462409-a8.utils.usdeur`
) AS usdeur
  ON tj_data.date = usdeur.date



UNION ALL



SELECT 

  ts_data.date,

  ts_data.channel,

  ts_data.campaign_id,

  ts_data.campaign_name,

  ts_data.impressions,

  ts_data.clicks,

  ts_data.conversions,

  ts_data.conversion_value,

  -- Convert USD spend to EUR using exchange rate
  CASE 
    WHEN usd_accounts.channel IS NOT NULL AND usdeur.rate IS NOT NULL 
    THEN ts_data.cost * usdeur.rate 
    ELSE ts_data.cost 
  END AS spend,

  ts_data.retrieved_at,

  ts_data.`ftd-s2s`,

  ts_data.`deposit-s2s`,

  ts_data.`reg-s2s`,

  ts_data.`ftd-s2s_val`,

  ts_data.`deposit-s2s_val`,

  ts_data.`reg-s2s_val`

FROM (
  SELECT 

    date,

    'TrafficStars' AS channel,

    campaign_id,

    campaign_name,

    impressions,

    clicks,

    conversions,

    0 AS conversion_value,  -- TS doesn't have conversion_value, set to 0

    cost,

    retrieved_at,

    0 AS `ftd-s2s`,

    0 AS `deposit-s2s`,

    0 AS `reg-s2s`,

    0.0 AS `ftd-s2s_val`,

    0.0 AS `deposit-s2s_val`,

    0.0 AS `reg-s2s_val`

  FROM `level-hope-462409-a8.mkt_channels.ts_stats_siteid`
) AS ts_data

-- Join with USD accounts table to identify USD channels (ensure no duplicates)
LEFT JOIN (
  SELECT DISTINCT channel, currency
  FROM `level-hope-462409-a8.utils.usd_accounts`
  WHERE channel IS NOT NULL
) AS usd_accounts
  ON ts_data.channel = usd_accounts.channel

-- Join with USD/EUR exchange rate table to get daily rates (ensure no duplicates)
LEFT JOIN (
  SELECT DISTINCT date, rate
  FROM `level-hope-462409-a8.utils.usdeur`
) AS usdeur
  ON ts_data.date = usdeur.date