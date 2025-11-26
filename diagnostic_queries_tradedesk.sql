-- ============================================================================
-- Diagnostic Queries for Trade Desk ID42 Date Issue
-- ============================================================================
-- Issue: November data appears in tradedesk_stats_custom but not in direct ID42 queries
-- Root Cause: String sorting vs Date sorting on DD/MM/YYYY format
-- ============================================================================

-- Query 1: Check November data with proper date parsing
-- This should show November dates if they exist in ID42
SELECT 
  SAFE.PARSE_DATE('%d/%m/%Y', Date) AS date_start,
  SUM(Advertiser_Cost_USD) AS spend,
  COUNT(*) AS row_count
FROM `level-hope-462409-a8.tradedesk.ID42`
WHERE SAFE.PARSE_DATE('%d/%m/%Y', Date) >= '2025-11-01'
  AND SAFE.PARSE_DATE('%d/%m/%Y', Date) <= '2025-11-30'
GROUP BY 1
ORDER BY 1 DESC
LIMIT 100;

-- Query 2: Compare string sorting vs date sorting
-- This demonstrates why November dates don't appear correctly with string sorting
SELECT 
  Date AS date_string,
  SAFE.PARSE_DATE('%d/%m/%Y', Date) AS date_parsed,
  SUM(Advertiser_Cost_USD) AS spend
FROM `level-hope-462409-a8.tradedesk.ID42`
WHERE SAFE.PARSE_DATE('%d/%m/%Y', Date) >= '2025-10-01'
GROUP BY 1, 2
ORDER BY Date DESC  -- String sorting (WRONG - shows why Nov dates are missing)
LIMIT 50;

-- Query 3: Same query but with date sorting (CORRECT)
SELECT 
  Date AS date_string,
  SAFE.PARSE_DATE('%d/%m/%Y', Date) AS date_parsed,
  SUM(Advertiser_Cost_USD) AS spend
FROM `level-hope-462409-a8.tradedesk.ID42`
WHERE SAFE.PARSE_DATE('%d/%m/%Y', Date) >= '2025-10-01'
GROUP BY 1, 2
ORDER BY date_parsed DESC  -- Date sorting (CORRECT - shows Nov dates properly)
LIMIT 50;

-- Query 4: Check which source table contains November data
-- This helps identify if data is in backfill or daily table
SELECT 
  'ID42_backfill' AS source_table,
  SAFE.PARSE_DATE('%d/%m/%Y', Date) AS date_start,
  COUNT(*) AS row_count,
  SUM(Advertiser_Cost_USD) AS spend
FROM `level-hope-462409-a8.tradedesk.ID42_backfill`
WHERE SAFE.PARSE_DATE('%d/%m/%Y', Date) >= '2025-11-01'
GROUP BY 1, 2

UNION ALL

SELECT 
  'ID42_performance_daily' AS source_table,
  SAFE.PARSE_DATE('%d/%m/%Y', Date) AS date_start,
  COUNT(*) AS row_count,
  SUM(Advertiser_Cost_USD) AS spend
FROM `level-hope-462409-a8.tradedesk.ID42_performance_daily`
WHERE SAFE.PARSE_DATE('%d/%m/%Y', Date) >= '2025-11-01'
GROUP BY 1, 2

ORDER BY date_start DESC;

-- Query 5: Verify tradedesk_stats_custom is showing correct dates
-- This should match Query 1 results
SELECT 
  date_start,
  SUM(spend) AS spend
FROM `level-hope-462409-a8.mkt_channels.tradedesk_stats_custom`
WHERE date_start >= '2025-11-01'
  AND date_start <= '2025-11-30'
GROUP BY 1
ORDER BY 1 DESC
LIMIT 100;

-- Query 6: Side-by-side comparison of ID42 (with date parsing) vs tradedesk_stats_custom
-- This should show matching results for November
WITH id42_parsed AS (
  SELECT 
    SAFE.PARSE_DATE('%d/%m/%Y', Date) AS date_start,
    SUM(Advertiser_Cost_USD) AS spend
  FROM `level-hope-462409-a8.tradedesk.ID42`
  WHERE SAFE.PARSE_DATE('%d/%m/%Y', Date) >= '2025-11-01'
  GROUP BY 1
),
custom_view AS (
  SELECT 
    date_start,
    SUM(spend) AS spend
  FROM `level-hope-462409-a8.mkt_channels.tradedesk_stats_custom`
  WHERE date_start >= '2025-11-01'
  GROUP BY 1
)
SELECT 
  COALESCE(i.date_start, c.date_start) AS date_start,
  COALESCE(i.spend, 0) AS id42_spend,
  COALESCE(c.spend, 0) AS custom_view_spend,
  ABS(COALESCE(i.spend, 0) - COALESCE(c.spend, 0)) AS difference
FROM id42_parsed i
FULL OUTER JOIN custom_view c
  ON i.date_start = c.date_start
ORDER BY date_start DESC;


