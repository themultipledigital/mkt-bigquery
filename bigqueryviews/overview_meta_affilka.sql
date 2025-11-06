-- View: level-hope-462409-a8.reports.overview_meta_affilka
-- Dataset: reports
--

-- Version: 1.0.0

-- BigQuery View: META Affilka Union with Meta Stats

-- Performs full outer join between meta_affilka_union and meta_stats_custom

-- Aggregates data by campaign/adset/ad/date to prevent duplication

-- Improved BigQuery View: META Affilka Union with Meta Stats

-- Enhanced version with better COALESCE handling and clearer logic

-- Follows the same pattern as the fixed POPS query



WITH meta_aggregated AS (

  -- Aggregate meta_stats_custom by campaign/adset/ad/date to prevent duplication

  SELECT 

    campaign_name_custom,

    adset_name_custom,

    adname_custom,

    date_start,

    ANY_VALUE(account_id) AS account_id,

    SUM(spend) AS spend,

    SUM(impressions) AS impressions,

    SUM(clicks) AS clicks,

    SUM(reach) AS reach,

    SUM(frequency) AS frequency,

    ANY_VALUE(publisher_platform) AS publisher_platform,

    ANY_VALUE(platform_position) AS platform_position,

    ANY_VALUE(device_platform) AS device_platform,

    SUM(purchaseplus_s2s_total) AS purchaseplus_s2s_total,

    SUM(purchaseplus_val_s2s_total) AS purchaseplus_val_s2s_total,

    SUM(purchaseplus_1d_view_s2s_total) AS purchaseplus_1d_view_s2s_total,

    SUM(purchaseplus_val_1d_view_s2s_total) AS purchaseplus_val_1d_view_s2s_total,

    SUM(purchaseplus_1d_click_s2s_total) AS purchaseplus_1d_click_s2s_total,

    SUM(purchaseplus_val_1d_click_s2s_total) AS purchaseplus_val_1d_click_s2s_total,

    SUM(purchaseplus_1d_click_s2s_bp_total) AS purchaseplus_1d_click_s2s_bp_total,

    SUM(purchaseplus_val_1d_click_s2s_bp_total) AS purchaseplus_val_1d_click_s2s_bp_total,

    SUM(purchaseplus_1d_click_s2s_pc_total) AS purchaseplus_1d_click_s2s_pc_total,

    SUM(purchaseplus_val_1d_click_s2s_pc_total) AS purchaseplus_val_1d_click_s2s_pc_total,

    SUM(purchaseplus_1d_view_s2s_bp_total) AS purchaseplus_1d_view_s2s_bp_total,

    SUM(purchaseplus_val_1d_view_s2s_bp_total) AS purchaseplus_val_1d_view_s2s_bp_total,

    SUM(purchaseplus_1d_view_s2s_pc_total) AS purchaseplus_1d_view_s2s_pc_total,

    SUM(purchaseplus_val_1d_view_s2s_pc_total) AS purchaseplus_val_1d_view_s2s_pc_total,

    SUM(purchaseplus_7d_click_s2s_total) AS purchaseplus_7d_click_s2s_total,

    SUM(purchaseplus_val_7d_click_s2s_total) AS purchaseplus_val_7d_click_s2s_total,

    SUM(purchaseplus_7d_click_s2s_bp_total) AS purchaseplus_7d_click_s2s_bp_total,

    SUM(purchaseplus_val_7d_click_s2s_bp_total) AS purchaseplus_val_7d_click_s2s_bp_total,

    SUM(purchaseplus_7d_click_s2s_pc_total) AS purchaseplus_7d_click_s2s_pc_total,

    SUM(purchaseplus_val_7d_click_s2s_pc_total) AS purchaseplus_val_7d_click_s2s_pc_total,

    SUM(purchaseplus_7d_view_s2s_total) AS purchaseplus_7d_view_s2s_total,

    SUM(purchaseplus_val_7d_view_s2s_total) AS purchaseplus_val_7d_view_s2s_total,

    SUM(purchaseplus_7d_view_s2s_bp_total) AS purchaseplus_7d_view_s2s_bp_total,

    SUM(purchaseplus_val_7d_view_s2s_bp_total) AS purchaseplus_val_7d_view_s2s_bp_total,

    SUM(purchaseplus_7d_view_s2s_pc_total) AS purchaseplus_7d_view_s2s_pc_total,

    SUM(purchaseplus_val_7d_view_s2s_pc_total) AS purchaseplus_val_7d_view_s2s_pc_total,

    SUM(purchase_1d_click_s2s_total) AS purchase_1d_click_s2s_total,

    SUM(purchase_val_1d_click_s2s_total) AS purchase_val_1d_click_s2s_total,

    SUM(purchase_1d_click_s2s_bp_total) AS purchase_1d_click_s2s_bp_total,

    SUM(purchase_val_1d_click_s2s_bp_total) AS purchase_val_1d_click_s2s_bp_total,

    SUM(purchase_1d_click_s2s_pc_total) AS purchase_1d_click_s2s_pc_total,

    SUM(purchase_val_1d_click_s2s_pc_total) AS purchase_val_1d_click_s2s_pc_total,

    SUM(purchase_1d_view_s2s_total) AS purchase_1d_view_s2s_total,

    SUM(purchase_val_1d_view_s2s_total) AS purchase_val_1d_view_s2s_total,

    SUM(purchase_1d_view_s2s_bp_total) AS purchase_1d_view_s2s_bp_total,

    SUM(purchase_val_1d_view_s2s_bp_total) AS purchase_val_1d_view_s2s_bp_total,

    SUM(purchase_1d_view_s2s_pc_total) AS purchase_1d_view_s2s_pc_total,

    SUM(purchase_val_1d_view_s2s_pc_total) AS purchase_val_1d_view_s2s_pc_total,

    SUM(purchase_s2s_pc_total) AS purchase_s2s_pc_total,

    SUM(purchase_val_s2s_pc_total) AS purchase_val_s2s_pc_total,

    SUM(purchase_s2s_bp_total) AS purchase_s2s_bp_total,

    SUM(purchase_val_s2s_bp_total) AS purchase_val_s2s_bp_total,

    SUM(purchaseplus_s2s_bp_total) AS purchaseplus_s2s_bp_total,

    SUM(purchaseplus_val_s2s_bp_total) AS purchaseplus_val_s2s_bp_total,

    SUM(purchaseplus_s2s_pc_total) AS purchaseplus_s2s_pc_total,

    SUM(purchaseplus_val_s2s_pc_total) AS purchaseplus_val_s2s_pc_total,

    

    -- New summed attribution window columns (25 total)

    ANY_VALUE(brand) AS brand,

    SUM(purchase_7d_click_1d_view_s2s_total) AS purchase_7d_click_1d_view_s2s_total,

    SUM(purchase_val_7d_click_1d_view_s2s_total) AS purchase_val_7d_click_1d_view_s2s_total,

    SUM(purchase_1d_click_1d_view_s2s_total) AS purchase_1d_click_1d_view_s2s_total,

    SUM(purchase_val_1d_click_1d_view_s2s_total) AS purchase_val_1d_click_1d_view_s2s_total,

    SUM(purchase_7d_click_1d_view_s2s_brand_total) AS purchase_7d_click_1d_view_s2s_brand_total,

    SUM(purchase_val_7d_click_1d_view_s2s_brand_total) AS purchase_val_7d_click_1d_view_s2s_brand_total,

    SUM(purchase_1d_click_1d_view_s2s_brand_total) AS purchase_1d_click_1d_view_s2s_brand_total,

    SUM(purchase_val_1d_click_1d_view_s2s_brand_total) AS purchase_val_1d_click_1d_view_s2s_brand_total,

    SUM(purchaseplus_7d_click_1d_view_s2s_total) AS purchaseplus_7d_click_1d_view_s2s_total,

    SUM(purchaseplus_val_7d_click_1d_view_s2s_total) AS purchaseplus_val_7d_click_1d_view_s2s_total,

    SUM(purchaseplus_1d_click_1d_view_s2s_total) AS purchaseplus_1d_click_1d_view_s2s_total,

    SUM(purchaseplus_val_1d_click_1d_view_s2s_total) AS purchaseplus_val_1d_click_1d_view_s2s_total,

    SUM(purchaseplus_7d_click_1d_view_s2s_brand_total) AS purchaseplus_7d_click_1d_view_s2s_brand_total,

    SUM(purchaseplus_val_7d_click_1d_view_s2s_brand_total) AS purchaseplus_val_7d_click_1d_view_s2s_brand_total,

    SUM(purchaseplus_1d_click_1d_view_s2s_brand_total) AS purchaseplus_1d_click_1d_view_s2s_brand_total,

    SUM(purchaseplus_val_1d_click_1d_view_s2s_brand_total) AS purchaseplus_val_1d_click_1d_view_s2s_brand_total,

    SUM(purchaseplus_7d_click_1d_view_first_conversion_s2s_total) AS purchaseplus_7d_click_1d_view_first_conversion_s2s_total,

    SUM(purchaseplus_val_7d_click_1d_view_first_conversion_s2s_total) AS purchaseplus_val_7d_click_1d_view_first_conversion_s2s_total,

    SUM(purchaseplus_1d_click_1d_view_first_conversion_s2s_total) AS purchaseplus_1d_click_1d_view_first_conversion_s2s_total,

    SUM(purchaseplus_val_1d_click_1d_view_first_conversion_s2s_total) AS purchaseplus_val_1d_click_1d_view_first_conversion_s2s_total,

    SUM(purchaseplus_7d_click_1d_view_first_conversion_s2s_brand_total) AS purchaseplus_7d_click_1d_view_first_conversion_s2s_brand_total,

    SUM(purchaseplus_val_7d_click_1d_view_first_conversion_s2s_brand_total) AS purchaseplus_val_7d_click_1d_view_first_conversion_s2s_brand_total,

    SUM(purchaseplus_1d_click_1d_view_first_conversion_s2s_brand_total) AS purchaseplus_1d_click_1d_view_first_conversion_s2s_brand_total,

    SUM(purchaseplus_val_1d_click_1d_view_first_conversion_s2s_brand_total) AS purchaseplus_val_1d_click_1d_view_first_conversion_s2s_brand_total

  FROM `level-hope-462409-a8.mkt_channels.meta_stats_custom`

  GROUP BY campaign_name_custom, adset_name_custom, adname_custom, date_start

),



targeting_latest AS (

  -- Get the latest targeting info for each campaign/adset/ad combination

  SELECT 

    campaign_name,

    adset_name,

    ad_name,

    geo_countries,

    tsl_custom_audience,

    tsl_excluding_custom_audience,

    tsl_location,

    tsl_age,

    tsl_gender,

    tsl_placements,

    tsl_languages,

    tsl_interests,

    tsl_behaviors,

    tsl_connections,

    tsl_advantage_custom_audience,

    tsl_advantage_audience,

    tsl_other,

    campaign_configured_status,

    campaign_effective_status,

    adset_configured_status,

    adset_effective_status,

    ad_configured_status,

    ad_effective_status,

    ROW_NUMBER() OVER (PARTITION BY campaign_name, adset_name, ad_name ORDER BY retrieved_at DESC) AS rn

  FROM `level-hope-462409-a8.mkt_channels.meta_targeting`

  WHERE campaign_name IS NOT NULL AND adset_name IS NOT NULL

),



targeting_deduplicated AS (

  -- Keep only the most recent targeting data per campaign/adset/ad

  SELECT 

    campaign_name,

    adset_name,

    ad_name,

    geo_countries,

    tsl_custom_audience,

    tsl_excluding_custom_audience,

    tsl_location,

    tsl_age,

    tsl_gender,

    tsl_placements,

    tsl_languages,

    tsl_interests,

    tsl_behaviors,

    tsl_connections,

    tsl_advantage_custom_audience,

    tsl_advantage_audience,

    tsl_other,

    campaign_configured_status,

    campaign_effective_status,

    adset_configured_status,

    adset_effective_status,

    ad_configured_status,

    ad_effective_status

  FROM targeting_latest

  WHERE rn = 1

),



marketing_aggregated AS (

  -- Aggregate meta_affilka_union by campaign/adset/ad/date to prevent duplication

  SELECT 

    campaign_name_custom,

    adset_name_custom,

    adname_custom,

    date,

    ANY_VALUE(utm_campaign) AS utm_campaign,

    ANY_VALUE(first_deposit_day) AS first_deposit_day,

    SUM(casino_ggr) AS casino_ggr,

    SUM(casino_ngr) AS casino_ngr,

    SUM(regs) AS regs,

    SUM(ftds) AS ftds,

    SUM(ftd_amount) AS ftd_amount,

    SUM(deps) AS deps,

    SUM(deposit_sum) AS deposit_sum,

    SUM(real_ngr_amount) AS real_ngr_amount,

    SUM(sb_real_ngr_amount) AS sb_real_ngr_amount,

    SUM(admin_fee_amount) AS admin_fee_amount,

    SUM(sb_admin_fee_amount) AS sb_admin_fee_amount,

    SUM(depositing_players) AS depositing_players,

    SUM(ngr_0_amount) AS ngr_0_amount

  FROM `level-hope-462409-a8.affilka.meta_affilka_union`

  GROUP BY campaign_name_custom, adset_name_custom, adname_custom, date

)



SELECT 

  -- Use marketing date as primary (since affilka data continues after campaigns turn off)

  COALESCE(marketing.date, meta.date_start) AS date,

  

  -- Meta Stats columns (from aggregated meta_stats_custom) - fill with zeros if no match

  COALESCE(meta.account_id, 'Unknown') AS account_id,

  COALESCE(meta.spend, 0) AS spend,

  COALESCE(meta.impressions, 0) AS impressions,

  COALESCE(meta.clicks, 0) AS clicks,

  COALESCE(meta.reach, 0) AS reach,

  COALESCE(meta.frequency, 0) AS frequency,

  COALESCE(meta.publisher_platform, '') AS publisher_platform,

  COALESCE(meta.platform_position, '') AS platform_position,

  COALESCE(meta.device_platform, '') AS device_platform,

  COALESCE(meta.purchaseplus_s2s_total, 0) AS purchaseplus_s2s_total,

  COALESCE(meta.purchaseplus_val_s2s_total, 0) AS purchaseplus_val_s2s_total,

  COALESCE(meta.purchaseplus_1d_view_s2s_total, 0) AS purchaseplus_1d_view_s2s_total,

  COALESCE(meta.purchaseplus_val_1d_view_s2s_total, 0) AS purchaseplus_val_1d_view_s2s_total,

  COALESCE(meta.purchaseplus_1d_click_s2s_total, 0) AS purchaseplus_1d_click_s2s_total,

  COALESCE(meta.purchaseplus_val_1d_click_s2s_total, 0) AS purchaseplus_val_1d_click_s2s_total,

  COALESCE(meta.purchaseplus_1d_click_s2s_bp_total, 0) AS purchaseplus_1d_click_s2s_bp_total,

  COALESCE(meta.purchaseplus_val_1d_click_s2s_bp_total, 0) AS purchaseplus_val_1d_click_s2s_bp_total,

  COALESCE(meta.purchaseplus_1d_click_s2s_pc_total, 0) AS purchaseplus_1d_click_s2s_pc_total,

  COALESCE(meta.purchaseplus_val_1d_click_s2s_pc_total, 0) AS purchaseplus_val_1d_click_s2s_pc_total,

  COALESCE(meta.purchaseplus_1d_view_s2s_bp_total, 0) AS purchaseplus_1d_view_s2s_bp_total,

  COALESCE(meta.purchaseplus_val_1d_view_s2s_bp_total, 0) AS purchaseplus_val_1d_view_s2s_bp_total,

  COALESCE(meta.purchaseplus_1d_view_s2s_pc_total, 0) AS purchaseplus_1d_view_s2s_pc_total,

  COALESCE(meta.purchaseplus_val_1d_view_s2s_pc_total, 0) AS purchaseplus_val_1d_view_s2s_pc_total,

  COALESCE(meta.purchaseplus_7d_click_s2s_total, 0) AS purchaseplus_7d_click_s2s_total,

  COALESCE(meta.purchaseplus_val_7d_click_s2s_total, 0) AS purchaseplus_val_7d_click_s2s_total,

  COALESCE(meta.purchaseplus_7d_click_s2s_bp_total, 0) AS purchaseplus_7d_click_s2s_bp_total,

  COALESCE(meta.purchaseplus_val_7d_click_s2s_bp_total, 0) AS purchaseplus_val_7d_click_s2s_bp_total,

  COALESCE(meta.purchaseplus_7d_click_s2s_pc_total, 0) AS purchaseplus_7d_click_s2s_pc_total,

  COALESCE(meta.purchaseplus_val_7d_click_s2s_pc_total, 0) AS purchaseplus_val_7d_click_s2s_pc_total,

  COALESCE(meta.purchaseplus_7d_view_s2s_total, 0) AS purchaseplus_7d_view_s2s_total,

  COALESCE(meta.purchaseplus_val_7d_view_s2s_total, 0) AS purchaseplus_val_7d_view_s2s_total,

  COALESCE(meta.purchaseplus_7d_view_s2s_bp_total, 0) AS purchaseplus_7d_view_s2s_bp_total,

  COALESCE(meta.purchaseplus_val_7d_view_s2s_bp_total, 0) AS purchaseplus_val_7d_view_s2s_bp_total,

  COALESCE(meta.purchaseplus_7d_view_s2s_pc_total, 0) AS purchaseplus_7d_view_s2s_pc_total,

  COALESCE(meta.purchaseplus_val_7d_view_s2s_pc_total, 0) AS purchaseplus_val_7d_view_s2s_pc_total,

  COALESCE(meta.purchase_1d_click_s2s_total, 0) AS purchase_1d_click_s2s_total,

  COALESCE(meta.purchase_val_1d_click_s2s_total, 0) AS purchase_val_1d_click_s2s_total,

  COALESCE(meta.purchase_1d_click_s2s_bp_total, 0) AS purchase_1d_click_s2s_bp_total,

  COALESCE(meta.purchase_val_1d_click_s2s_bp_total, 0) AS purchase_val_1d_click_s2s_bp_total,

  COALESCE(meta.purchase_1d_click_s2s_pc_total, 0) AS purchase_1d_click_s2s_pc_total,

  COALESCE(meta.purchase_val_1d_click_s2s_pc_total, 0) AS purchase_val_1d_click_s2s_pc_total,

  COALESCE(meta.purchase_1d_view_s2s_total, 0) AS purchase_1d_view_s2s_total,

  COALESCE(meta.purchase_val_1d_view_s2s_total, 0) AS purchase_val_1d_view_s2s_total,

  COALESCE(meta.purchase_1d_view_s2s_bp_total, 0) AS purchase_1d_view_s2s_bp_total,

  COALESCE(meta.purchase_val_1d_view_s2s_bp_total, 0) AS purchase_val_1d_view_s2s_bp_total,

  COALESCE(meta.purchase_1d_view_s2s_pc_total, 0) AS purchase_1d_view_s2s_pc_total,

  COALESCE(meta.purchase_val_1d_view_s2s_pc_total, 0) AS purchase_val_1d_view_s2s_pc_total,

  COALESCE(meta.purchase_s2s_pc_total, 0) AS purchase_s2s_pc_total,

  COALESCE(meta.purchase_val_s2s_pc_total, 0) AS purchase_val_s2s_pc_total,

  COALESCE(meta.purchase_s2s_bp_total, 0) AS purchase_s2s_bp_total,

  COALESCE(meta.purchase_val_s2s_bp_total, 0) AS purchase_val_s2s_bp_total,

  COALESCE(meta.purchaseplus_s2s_bp_total, 0) AS purchaseplus_s2s_bp_total,

  COALESCE(meta.purchaseplus_val_s2s_bp_total, 0) AS purchaseplus_val_s2s_bp_total,

  COALESCE(meta.purchaseplus_s2s_pc_total, 0) AS purchaseplus_s2s_pc_total,

  COALESCE(meta.purchaseplus_val_s2s_pc_total, 0) AS purchaseplus_val_s2s_pc_total,

  

  -- New summed attribution window columns (25 total)

  COALESCE(meta.brand, '') AS brand_from_meta,

  COALESCE(meta.purchase_7d_click_1d_view_s2s_total, 0) AS purchase_7d_click_1d_view_s2s_total,

  COALESCE(meta.purchase_val_7d_click_1d_view_s2s_total, 0) AS purchase_val_7d_click_1d_view_s2s_total,

  COALESCE(meta.purchase_1d_click_1d_view_s2s_total, 0) AS purchase_1d_click_1d_view_s2s_total,

  COALESCE(meta.purchase_val_1d_click_1d_view_s2s_total, 0) AS purchase_val_1d_click_1d_view_s2s_total,

  COALESCE(meta.purchase_7d_click_1d_view_s2s_brand_total, 0) AS purchase_7d_click_1d_view_s2s_brand_total,

  COALESCE(meta.purchase_val_7d_click_1d_view_s2s_brand_total, 0) AS purchase_val_7d_click_1d_view_s2s_brand_total,

  COALESCE(meta.purchase_1d_click_1d_view_s2s_brand_total, 0) AS purchase_1d_click_1d_view_s2s_brand_total,

  COALESCE(meta.purchase_val_1d_click_1d_view_s2s_brand_total, 0) AS purchase_val_1d_click_1d_view_s2s_brand_total,

  COALESCE(meta.purchaseplus_7d_click_1d_view_s2s_total, 0) AS purchaseplus_7d_click_1d_view_s2s_total,

  COALESCE(meta.purchaseplus_val_7d_click_1d_view_s2s_total, 0) AS purchaseplus_val_7d_click_1d_view_s2s_total,

  COALESCE(meta.purchaseplus_1d_click_1d_view_s2s_total, 0) AS purchaseplus_1d_click_1d_view_s2s_total,

  COALESCE(meta.purchaseplus_val_1d_click_1d_view_s2s_total, 0) AS purchaseplus_val_1d_click_1d_view_s2s_total,

  COALESCE(meta.purchaseplus_7d_click_1d_view_s2s_brand_total, 0) AS purchaseplus_7d_click_1d_view_s2s_brand_total,

  COALESCE(meta.purchaseplus_val_7d_click_1d_view_s2s_brand_total, 0) AS purchaseplus_val_7d_click_1d_view_s2s_brand_total,

  COALESCE(meta.purchaseplus_1d_click_1d_view_s2s_brand_total, 0) AS purchaseplus_1d_click_1d_view_s2s_brand_total,

  COALESCE(meta.purchaseplus_val_1d_click_1d_view_s2s_brand_total, 0) AS purchaseplus_val_1d_click_1d_view_s2s_brand_total,

  COALESCE(meta.purchaseplus_7d_click_1d_view_first_conversion_s2s_total, 0) AS purchaseplus_7d_click_1d_view_first_conversion_s2s_total,

  COALESCE(meta.purchaseplus_val_7d_click_1d_view_first_conversion_s2s_total, 0) AS purchaseplus_val_7d_click_1d_view_first_conversion_s2s_total,

  COALESCE(meta.purchaseplus_1d_click_1d_view_first_conversion_s2s_total, 0) AS purchaseplus_1d_click_1d_view_first_conversion_s2s_total,

  COALESCE(meta.purchaseplus_val_1d_click_1d_view_first_conversion_s2s_total, 0) AS purchaseplus_val_1d_click_1d_view_first_conversion_s2s_total,

  COALESCE(meta.purchaseplus_7d_click_1d_view_first_conversion_s2s_brand_total, 0) AS purchaseplus_7d_click_1d_view_first_conversion_s2s_brand_total,

  COALESCE(meta.purchaseplus_val_7d_click_1d_view_first_conversion_s2s_brand_total, 0) AS purchaseplus_val_7d_click_1d_view_first_conversion_s2s_brand_total,

  COALESCE(meta.purchaseplus_1d_click_1d_view_first_conversion_s2s_brand_total, 0) AS purchaseplus_1d_click_1d_view_first_conversion_s2s_brand_total,

  COALESCE(meta.purchaseplus_val_1d_click_1d_view_first_conversion_s2s_brand_total, 0) AS purchaseplus_val_1d_click_1d_view_first_conversion_s2s_brand_total,

  

  -- Marketing Data columns (from aggregated meta_affilka_union) - fill with zeros if no match

  COALESCE(meta.date_start, marketing.date) AS date_start,

  marketing.utm_campaign,

  COALESCE(marketing.casino_ggr, 0) AS casino_ggr,

  COALESCE(marketing.casino_ngr, 0) AS casino_ngr,

  COALESCE(marketing.regs, 0) AS regs,

  COALESCE(marketing.ftds, 0) AS ftds,

  COALESCE(marketing.ftd_amount, 0) AS ftd_amount,

  COALESCE(marketing.deps, 0) AS deps,

  COALESCE(marketing.deposit_sum, 0) AS deposit_sum,

  

  -- Raw NGR components for Looker Studio calculations

  COALESCE(marketing.real_ngr_amount, 0) AS real_ngr_amount,

  COALESCE(marketing.sb_real_ngr_amount, 0) AS sb_real_ngr_amount,

  COALESCE(marketing.admin_fee_amount, 0) AS admin_fee_amount,

  COALESCE(marketing.sb_admin_fee_amount, 0) AS sb_admin_fee_amount,

  

  -- Depositing players for cohort analysis

  COALESCE(marketing.depositing_players, 0) AS depositing_players,

  

  -- Total NGR = real_ngr_amount + sb_real_ngr_amount + admin_fee_amount + sb_admin_fee_amount

  COALESCE(marketing.real_ngr_amount, 0) + COALESCE(marketing.sb_real_ngr_amount, 0) + 

  COALESCE(marketing.admin_fee_amount, 0) + COALESCE(marketing.sb_admin_fee_amount, 0) AS ngr,

  

  -- NGR [0] = NGR only for first month (when first_deposit_day month = date month)

  COALESCE(marketing.ngr_0_amount, 0) AS ngr_0,

  

  -- Common key columns for joining

  COALESCE(meta.campaign_name_custom, marketing.campaign_name_custom) AS campaign_name_custom,

  COALESCE(meta.adset_name_custom, marketing.adset_name_custom) AS adset_name_custom,

  COALESCE(meta.adname_custom, marketing.adname_custom) AS adname_custom,

  

  -- Campaign Analysis Fields

  SPLIT(COALESCE(meta.campaign_name_custom, marketing.campaign_name_custom), '_')[SAFE_OFFSET(1)] AS brand,

  

  CASE 

    WHEN SPLIT(COALESCE(meta.campaign_name_custom, marketing.campaign_name_custom), '_')[SAFE_OFFSET(1)] = 'bp' THEN 'Bet and Play'

    WHEN SPLIT(COALESCE(meta.campaign_name_custom, marketing.campaign_name_custom), '_')[SAFE_OFFSET(1)] = 'lc' THEN 'Lucky Circus'

    WHEN SPLIT(COALESCE(meta.campaign_name_custom, marketing.campaign_name_custom), '_')[SAFE_OFFSET(1)] = 'pc' THEN 'Platin Casino'

    WHEN SPLIT(COALESCE(meta.campaign_name_custom, marketing.campaign_name_custom), '_')[SAFE_OFFSET(1)] = 'ps' THEN 'Platinum Slots'

    ELSE SPLIT(COALESCE(meta.campaign_name_custom, marketing.campaign_name_custom), '_')[SAFE_OFFSET(1)]

  END AS brand_name,

  

  REGEXP_EXTRACT(

    REGEXP_REPLACE(

      COALESCE(meta.campaign_name_custom, marketing.campaign_name_custom), 

      '^test[\\s-]+', 

      ''

    ), 

    "^([a-zA-Z0-9-]+)_"

  ) AS geo,

  

  CONCAT(

    REGEXP_EXTRACT(

      REGEXP_REPLACE(

        COALESCE(meta.campaign_name_custom, marketing.campaign_name_custom), 

        '^test[\\s-]+', 

        ''

      ), 

      "^([a-zA-Z0-9-]+)_"

    ),

    '_',

    SPLIT(COALESCE(meta.campaign_name_custom, marketing.campaign_name_custom), '_')[SAFE_OFFSET(1)],

    '_',

    SPLIT(COALESCE(meta.campaign_name_custom, marketing.campaign_name_custom), '_')[SAFE_OFFSET(2)]

  ) AS partner_name,

  

  SPLIT(COALESCE(meta.campaign_name_custom, marketing.campaign_name_custom), '_')[SAFE_OFFSET(3)] AS strategy,

  SPLIT(COALESCE(meta.campaign_name_custom, marketing.campaign_name_custom), '_')[SAFE_OFFSET(4)] AS sub_strategy,

  

  CASE 

    WHEN marketing.first_deposit_day IS NOT NULL THEN

      CAST(

        (EXTRACT(YEAR FROM COALESCE(marketing.date, meta.date_start)) * 12 + EXTRACT(MONTH FROM COALESCE(marketing.date, meta.date_start))) -

        (EXTRACT(YEAR FROM marketing.first_deposit_day) * 12 + EXTRACT(MONTH FROM marketing.first_deposit_day))

        AS STRING

      )

    ELSE NULL

  END AS cohort,

  

  -- Targeting fields (TSL fields from meta_targeting)

  targeting.geo_countries,

  targeting.tsl_custom_audience,

  targeting.tsl_excluding_custom_audience,

  targeting.tsl_location,

  targeting.tsl_age,

  targeting.tsl_gender,

  targeting.tsl_placements,

  targeting.tsl_languages,

  targeting.tsl_interests,

  targeting.tsl_behaviors,

  targeting.tsl_connections,

  targeting.tsl_advantage_custom_audience,

  targeting.tsl_advantage_audience,

  targeting.tsl_other,

  

  -- Status fields from meta_targeting

  targeting.campaign_configured_status,

  targeting.campaign_effective_status,

  targeting.adset_configured_status,

  targeting.adset_effective_status,

  targeting.ad_name,

  targeting.ad_configured_status,

  targeting.ad_effective_status



FROM marketing_aggregated marketing

FULL OUTER JOIN meta_aggregated meta

  ON meta.campaign_name_custom = marketing.campaign_name_custom

  AND meta.adset_name_custom = marketing.adset_name_custom

  AND meta.adname_custom = marketing.adname_custom

  AND meta.date_start = marketing.date

LEFT JOIN targeting_deduplicated targeting

  ON LOWER(targeting.campaign_name) = LOWER(COALESCE(meta.campaign_name_custom, marketing.campaign_name_custom))

  AND LOWER(targeting.adset_name) = LOWER(COALESCE(meta.adset_name_custom, marketing.adset_name_custom))

  AND LOWER(targeting.ad_name) = LOWER(COALESCE(meta.adname_custom, marketing.adname_custom))