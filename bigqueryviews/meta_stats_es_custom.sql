-- View: level-hope-462409-a8.mkt_channels.meta_stats_es_custom
-- Dataset: mkt_channels
--
-- Version: 2.0.1 (Simplified, deposit removed)
-- BigQuery transformation query for Spain Meta Stats (meta_stats_es)
-- Processes goals_breakdown array for Spain-specific conversion events
-- Conversion events: login_unique, deposit_unique, deposit_count, login_count
-- Attribution windows: 7d_click + 1d_view, 1d_click + 1d_view
-- Note: "deposit" conversion was removed (archived in Meta)

WITH base_with_extracts AS (
  SELECT 
    *,
    LOWER(TRIM(campaign_name)) AS campaign_name_clean,
    -- Brand extracted from campaign_name (e.g., "es_pc_meta_react_highest-volume" -> "PC")
    UPPER(SPLIT(LOWER(TRIM(campaign_name)), '_')[SAFE_OFFSET(1)]) AS brand,
    -- Geo extracted from campaign_name (e.g., "es_pc_meta_react_highest-volume" -> "es")
    -- Removes "test " or "test-" prefix if present
    REGEXP_EXTRACT(
      REGEXP_REPLACE(
        LOWER(TRIM(campaign_name)), 
        '^test[\\s-]+', 
        ''
      ), 
      "^([a-zA-Z0-9-]+)_"
    ) AS geo,
    -- Strategy (4th segment) (e.g., "es_pc_meta_react_highest-volume" -> "react")
    SPLIT(LOWER(TRIM(campaign_name)), '_')[SAFE_OFFSET(3)] AS strategy,
    -- Sub-strategy (5th segment) (e.g., "es_pc_meta_react_highest-volume" -> "highest-volume")
    SPLIT(LOWER(TRIM(campaign_name)), '_')[SAFE_OFFSET(4)] AS sub_strategy
  FROM `level-hope-462409-a8.mkt_channels.meta_stats_es`
)

SELECT 
  date_start,
  account_id,
  
  -- Campaign/Adset/Ad names (lowercased and trimmed)
  campaign_name_clean AS campaign_name_custom,
  LOWER(TRIM(adset_name)) AS adset_name_custom,
  LOWER(TRIM(ad_name)) AS ad_name_custom,
  
  -- Base metrics
  spend,
  impressions,
  clicks,
  reach,
  frequency,
  
  -- Platform/Position/Device columns
  publisher_platform,
  platform_position,
  device_platform,
  
  -- Campaign segmentation fields (from CTE)
  brand,
  geo,
  strategy,
  sub_strategy,
  
  -- ==================== LOGIN_UNIQUE CONVERSIONS ====================
  
  -- Login Unique 7d Click + 1d View
  (
    SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC)
    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g
    WHERE g.goal_name = 'login_unique' AND g.window IN ('7d_click', '1d_view')
  ) AS login_unique_7d_click_1d_view,
  
  -- Login Unique 1d Click + 1d View
  (
    SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC)
    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g
    WHERE g.goal_name = 'login_unique' AND g.window IN ('1d_click', '1d_view')
  ) AS login_unique_1d_click_1d_view,
  
  -- ==================== DEPOSIT_UNIQUE CONVERSIONS ====================
  
  -- Deposit Unique 7d Click + 1d View
  (
    SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC)
    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g
    WHERE g.goal_name = 'deposit_unique' AND g.window IN ('7d_click', '1d_view')
  ) AS deposit_unique_7d_click_1d_view,
  
  -- Deposit Unique Value 7d Click + 1d View
  (
    SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC)
    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g
    WHERE g.goal_name = 'deposit_unique' AND g.window IN ('7d_click', '1d_view')
  ) AS deposit_unique_val_7d_click_1d_view,
  
  -- Deposit Unique 1d Click + 1d View
  (
    SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC)
    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g
    WHERE g.goal_name = 'deposit_unique' AND g.window IN ('1d_click', '1d_view')
  ) AS deposit_unique_1d_click_1d_view,
  
  -- Deposit Unique Value 1d Click + 1d View
  (
    SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC)
    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g
    WHERE g.goal_name = 'deposit_unique' AND g.window IN ('1d_click', '1d_view')
  ) AS deposit_unique_val_1d_click_1d_view,
  
  -- ==================== DEPOSIT_COUNT CONVERSIONS ====================
  
  -- Deposit Count 7d Click + 1d View
  (
    SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC)
    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g
    WHERE g.goal_name = 'deposit_count' AND g.window IN ('7d_click', '1d_view')
  ) AS deposit_count_7d_click_1d_view,
  
  -- Deposit Count Value 7d Click + 1d View
  (
    SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC)
    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g
    WHERE g.goal_name = 'deposit_count' AND g.window IN ('7d_click', '1d_view')
  ) AS deposit_count_val_7d_click_1d_view,
  
  -- Deposit Count 1d Click + 1d View
  (
    SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC)
    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g
    WHERE g.goal_name = 'deposit_count' AND g.window IN ('1d_click', '1d_view')
  ) AS deposit_count_1d_click_1d_view,
  
  -- Deposit Count Value 1d Click + 1d View
  (
    SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC)
    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g
    WHERE g.goal_name = 'deposit_count' AND g.window IN ('1d_click', '1d_view')
  ) AS deposit_count_val_1d_click_1d_view,
  
  -- ==================== LOGIN_COUNT CONVERSIONS ====================
  
  -- Login Count 7d Click + 1d View
  (
    SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC)
    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g
    WHERE g.goal_name = 'login_count' AND g.window IN ('7d_click', '1d_view')
  ) AS login_count_7d_click_1d_view,
  
  -- Login Count 1d Click + 1d View
  (
    SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC)
    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g
    WHERE g.goal_name = 'login_count' AND g.window IN ('1d_click', '1d_view')
  ) AS login_count_1d_click_1d_view
  
  -- Note: "deposit" (ID: 2594828540712125) removed - it's ARCHIVED in Meta

FROM base_with_extracts

