-- View: level-hope-462409-a8.reports.all_channel_performance
-- Purpose: Normalize Meta, POPS, and Trade Desk performance and conversions

CREATE OR REPLACE VIEW `level-hope-462409-a8.reports.all_channel_performance` AS
(
  -- Meta
  SELECT
    date_start AS date,
    'meta' AS channel,
    CAST(NULL AS STRING) AS campaign_id,
    campaign_name_custom AS campaign_name,
    CAST(NULL AS STRING) AS adset_id,
    adset_name_custom AS adset_name,
    CAST(NULL AS STRING) AS ad_id,
    adname_custom AS ad_name,
    SAFE_CAST(ROUND(impressions) AS INT64) AS impressions,
    SAFE_CAST(ROUND(clicks) AS INT64) AS clicks,
    SAFE_CAST(spend AS NUMERIC) AS spend,
    CAST(NULL AS INT64) AS reg_conversions,
    purchaseplus_7d_click_1d_view_s2s_brand_total AS dep_conversions,
    purchaseplus_val_7d_click_1d_view_s2s_brand_total AS dep_value,
    purchase_7d_click_1d_view_s2s_brand_total AS ftd_conversions,
    purchase_val_7d_click_1d_view_s2s_brand_total AS ftd_value,
    'meta' AS source_view
  FROM `level-hope-462409-a8.mkt_channels.meta_stats_custom`
)
UNION ALL
(
  -- POPS
  SELECT
    date,
    channel,
    CAST(campaign_id AS STRING) AS campaign_id,
    campaign_name,
    CAST(NULL AS STRING) AS adset_id,
    CAST(NULL AS STRING) AS adset_name,
    CAST(NULL AS STRING) AS ad_id,
    CAST(NULL AS STRING) AS ad_name,
    SAFE_CAST(impressions AS INT64) AS impressions,
    SAFE_CAST(clicks AS INT64) AS clicks,
    SAFE_CAST(spend AS NUMERIC) AS spend,
    SAFE_CAST(`reg-s2s` AS INT64) AS reg_conversions,
    SAFE_CAST(`deposit-s2s` AS INT64) AS dep_conversions,
    SAFE_CAST(`deposit-s2s_val` AS NUMERIC) AS dep_value,
    SAFE_CAST(`ftd-s2s` AS INT64) AS ftd_conversions,
    SAFE_CAST(`ftd-s2s_val` AS NUMERIC) AS ftd_value,
    'pops' AS source_view
  FROM `level-hope-462409-a8.mkt_channels.pops_stats_custom`
)
UNION ALL
(
  -- Trade Desk
  SELECT
    date_start,
    'tradedesk' AS channel,
    campaign_id,
    campaign_name,
    ad_group_id AS adset_id,
    ad_group_name AS adset_name,
    creative_id AS ad_id,
    creative_name AS ad_name,
    SAFE_CAST(impressions AS INT64) AS impressions,
    SAFE_CAST(clicks AS INT64) AS clicks,
    SAFE_CAST(spend AS NUMERIC) AS spend,
    SAFE_CAST(registration_conversions AS INT64) AS reg_conversions,
    SAFE_CAST(
      SAFE_CAST(deposit_conversions_1d_view AS INT64) + SAFE_CAST(deposit_conversions_7d_click AS INT64)
      AS INT64
    ) AS dep_conversions,
    CAST(NULL AS NUMERIC) AS dep_value,
    SAFE_CAST(
      SAFE_CAST(first_deposit_conversions_1d_view AS INT64) + SAFE_CAST(first_deposit_conversions_7d_click AS INT64)
      AS INT64
    ) AS ftd_conversions,
    CAST(NULL AS NUMERIC) AS ftd_value,
    'tradedesk' AS source_view
  FROM `level-hope-462409-a8.mkt_channels.tradedesk_stats_custom`
);
