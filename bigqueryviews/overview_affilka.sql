-- View: level-hope-462409-a8.reports.overview_affilka
-- Dataset: reports
--

-- BigQuery View: Overview Union (Brand Protection + iConvert + POPS + Meta + TradeDesk)
-- Combines data from overview_brandprotection_affilka, overview_iconvert_affilka, overview_pops_affilka, overview_meta_affilka, and tradedesk_stats_custom
-- Returns standardized fields: data_source, date, partner_name, partner_id, spend, impressions, clicks, regs, ftds, deps, deposit_sum, ngr, ngr_0, brand, geo

-- overview_brandprotection_affilka
-- Version: 1.0.0
SELECT 
  'Brand Protection' AS data_source,
  date,
  partner_name,
  partner_id,
  NULL AS spend,  -- Brand Protection doesn't have spend data
  NULL AS impressions,  -- Brand Protection doesn't have impressions data
  NULL AS clicks,  -- Brand Protection doesn't have clicks data
  regs,
  ftds,
  deps,
  deposit_sum,
  ngr,
  ngr_0_amount AS ngr_0,
  brand,
  geo
FROM `level-hope-462409-a8.reports.overview_brandprotection_affilka`

UNION ALL

-- overview_iconvert_affilka
SELECT 
  'iConvert' AS data_source,
  date,
  partner_name,
  partner_id,
  NULL AS spend,  -- iConvert doesn't have spend data
  NULL AS impressions,  -- iConvert doesn't have impressions data
  NULL AS clicks,  -- iConvert doesn't have clicks data
  regs,
  ftds,
  deps,
  deposit_sum,
  ngr,
  ngr_0_amount AS ngr_0,
  brand,
  geo
FROM `level-hope-462409-a8.reports.overview_iconvert_affilka`

UNION ALL

-- overview_pops_affilka
SELECT 
  channel AS data_source,
  date,
  partner_name,
  partner_id,
  spend,
  impressions,
  clicks,
  regs,
  ftds,
  deps,
  deposit_sum,
  ngr,
  ngr_0 AS ngr_0,
  brand,
  geo
FROM `level-hope-462409-a8.reports.overview_pops_affilka`

UNION ALL

-- overview_meta_affilka
SELECT 
  'META' AS data_source,
  date,
  partner_name,
  NULL AS partner_id,
  spend,
  impressions,
  clicks,
  regs,
  ftds,
  deps,
  deposit_sum,
  ngr,
  ngr_0 AS ngr_0,
  brand,
  geo
FROM `level-hope-462409-a8.reports.overview_meta_affilka`

UNION ALL

-- tradedesk_stats_custom
SELECT 
  'Trade Desk' AS data_source,
  date_start AS date,
  campaign_name AS partner_name,
  campaign_id AS partner_id,
  spend,
  impressions,
  clicks,
  registration_conversions AS regs,
  first_deposit_conversions AS ftds,
  deposit_conversions AS deps,
  NULL AS deposit_sum,  -- TradeDesk doesn't have deposit sum data
  NULL AS ngr,  -- TradeDesk doesn't have NGR data
  NULL AS ngr_0,  -- TradeDesk doesn't have NGR_0 data
  brand,
  geo
FROM `level-hope-462409-a8.mkt_channels.tradedesk_stats_custom`