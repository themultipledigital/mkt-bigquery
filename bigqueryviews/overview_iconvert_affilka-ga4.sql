-- View: level-hope-462409-a8.reports.overview_iconvert_affilka-ga4
-- Dataset: reports
--

-- BigQuery View: iConvert Affilka Union with GA4 Integration (Platin + Tycoon)
-- Combines data from both mkt_platin and mkt_tycoon tables with GA4 event data
WITH iconvert_affilka_data AS (
  SELECT 
    -- Convert affilka date to YYYYMMDD format to match GA4
    FORMAT_DATE('%Y%m%d', date) AS date,
    partner_id,
    -- Map partner_id to company name using CASE statement
    CASE 
      WHEN partner_id = "31426" THEN "pc_iconvert-trusted"
      WHEN partner_id = "30227" THEN "pc_iconvert-untrusted"
      ELSE CONCAT("unknown_partner", partner_id)
    END AS partner_name,
    dynamic_tag_utm_campaign AS utm_campaign,
    campaign_name,
    -- Casino GGR (Gross Gaming Revenue)
    ggr_amount AS casino_ggr,
    
    -- Casino NGR (Net Gaming Revenue) 
    ngr_amount AS casino_ngr,
    
    -- Registration count as REGs
    registrations_count AS regs,
    
    -- First deposit count as FTDs
    first_deposits_count AS ftds,
    first_deposits_sum_amount AS ftd_value,
    
    -- Deposit count
    deposits_count AS deps,
    
    -- Deposit sum
    deposits_sum_amount AS deposit_sum,
    
    -- NGR components
    real_ngr_amount,
    sb_real_ngr_amount,
    admin_fee_amount,
    sb_admin_fee_amount,

    -- Summed NGR
    COALESCE(real_ngr_amount, 0) + COALESCE(sb_real_ngr_amount, 0) + 
    COALESCE(admin_fee_amount, 0) + COALESCE(sb_admin_fee_amount, 0) AS ngr,
    
    -- Additional fields
    brand_id,
    LOWER(player_country) AS geo,

    -- First deposit day for attribution analysis
    first_deposit_day,
    
    -- NGR [0] - NGR only for first month (when first_deposit_day month = date month)
    CASE 
      WHEN first_deposit_day IS NOT NULL 
           AND EXTRACT(MONTH FROM first_deposit_day) = EXTRACT(MONTH FROM date)
           AND EXTRACT(YEAR FROM first_deposit_day) = EXTRACT(YEAR FROM date)
      THEN real_ngr_amount + sb_real_ngr_amount + admin_fee_amount + sb_admin_fee_amount
      ELSE 0
    END AS ngr_0_amount

  FROM `level-hope-462409-a8.affilka.mkt_platin`
  WHERE partner_id IN ("31426", "30227")  -- iConvert Platin partner IDs

  UNION ALL

  SELECT 
    -- Convert affilka date to YYYYMMDD format to match GA4
    FORMAT_DATE('%Y%m%d', date) AS date,
    partner_id,
    -- Map partner_id to company name using CASE statement
    CASE 
      WHEN partner_id = "34890" THEN "lc-iconvert-non-overwrite-testing"
      WHEN partner_id = "34889" THEN "lc-iconvert-trusted-testing"
      WHEN partner_id = "31427" THEN "lc_iconvert-trusted"
      WHEN partner_id = "31084" THEN "bp_iconvert-trusted"
      WHEN partner_id = "30862" THEN "lc_iconvert-untrusted"
      WHEN partner_id = "30228" THEN "bp_iconvert-untrusted"
      ELSE CONCAT("unknown_partner", partner_id)
    END AS partner_name,
    dynamic_tag_utm_campaign AS utm_campaign,
    campaign_name,
    
    -- Casino GGR (Gross Gaming Revenue)
    ggr_amount AS casino_ggr,
    
    -- Casino NGR (Net Gaming Revenue)
    ngr_amount AS casino_ngr,
    
    -- Registration count as REGs
    registrations_count AS regs,
    
    -- First deposit count as FTDs
    first_deposits_count AS ftds,
    first_deposits_sum_amount AS ftd_value,
    
    -- Deposit count
    deposits_count AS deps,
    
    -- Deposit sum
    deposits_sum_amount AS deposit_sum,
    
    -- NGR components
    real_ngr_amount,
    sb_real_ngr_amount,
    admin_fee_amount,
    sb_admin_fee_amount,

    -- Summed NGR
    COALESCE(real_ngr_amount, 0) + COALESCE(sb_real_ngr_amount, 0) + 
    COALESCE(admin_fee_amount, 0) + COALESCE(sb_admin_fee_amount, 0) AS ngr,
    
    -- Additional fields
    brand_id,
    LOWER(player_country) AS geo,

    -- First deposit day for attribution analysis
    first_deposit_day,
    
    -- NGR [0] - NGR only for first month (when first_deposit_day month = date month)
    CASE 
      WHEN first_deposit_day IS NOT NULL 
           AND EXTRACT(MONTH FROM first_deposit_day) = EXTRACT(MONTH FROM date)
           AND EXTRACT(YEAR FROM first_deposit_day) = EXTRACT(YEAR FROM date)
      THEN real_ngr_amount + sb_real_ngr_amount + admin_fee_amount + sb_admin_fee_amount
      ELSE 0
    END AS ngr_0_amount

  FROM `level-hope-462409-a8.affilka.mkt_tycoon`
  WHERE partner_id IN ("34890", "34889", "31427", "31084", "30862", "30228")  -- iConvert Tycoon partner IDs
),

iconvert_affilka_aggregated AS (
  -- Aggregate affilka data by date and geo to prevent duplicates
  SELECT 
    date,
    -- Aggregate all metrics
    SUM(casino_ggr) AS casino_ggr,
    SUM(casino_ngr) AS casino_ngr,
    SUM(regs) AS regs,
    SUM(ftds) AS ftds,
    SUM(ftd_value) AS ftd_value,
    SUM(deps) AS deps,
    SUM(deposit_sum) AS deposit_sum,
    SUM(real_ngr_amount) AS real_ngr_amount,
    SUM(sb_real_ngr_amount) AS sb_real_ngr_amount,
    SUM(admin_fee_amount) AS admin_fee_amount,
    SUM(sb_admin_fee_amount) AS sb_admin_fee_amount,
    SUM(ngr) AS ngr,
    SUM(ngr_0_amount) AS ngr_0_amount,
    -- Take any value for non-aggregatable fields
    ANY_VALUE(utm_campaign) AS utm_campaign,
    ANY_VALUE(campaign_name) AS campaign_name,
    ANY_VALUE(partner_name) AS partner_name,
    ANY_VALUE(brand_id) AS brand_id,
    geo
  FROM iconvert_affilka_data
  GROUP BY date, geo
),

ga4_iconvert_events AS (
  -- GA4 Events for iConvert tracking - using ga_analytics_union view
  SELECT 
    event_date AS date,
    geo,
    brand,
    SUM(CASE WHEN event_name = 'iconvert_click' THEN 1 ELSE 0 END) AS iconvert_clicks,
    SUM(CASE WHEN event_name = 'iconvert_show' THEN 1 ELSE 0 END) AS iconvert_shows,
    COUNT(*) AS total_iconvert_events
  FROM `level-hope-462409-a8.ga_analytics.ga_analytics_union`
  WHERE (event_name IN ('iconvert_click', 'iconvert_show')
         OR event_name LIKE '%iconvert%'
         OR event_name LIKE '%click%'
         OR event_name LIKE '%show%')
  GROUP BY event_date, geo, brand
)

SELECT 
  -- Use COALESCE to handle cases where one side of the join is NULL
  COALESCE(affilka.date, ga4.date) AS date,
  COALESCE(affilka.geo, ga4.geo) AS geo,
  
  -- Affilka Data (with COALESCE for NULL handling)
  affilka.utm_campaign,
  COALESCE(affilka.casino_ggr, 0) AS casino_ggr,
  COALESCE(affilka.casino_ngr, 0) AS casino_ngr,
  COALESCE(affilka.regs, 0) AS regs,
  COALESCE(affilka.ftds, 0) AS ftds,
  COALESCE(affilka.ftd_value, 0) AS ftd_value,
  COALESCE(affilka.deps, 0) AS deps,
  COALESCE(affilka.deposit_sum, 0) AS deposit_sum,
  COALESCE(affilka.real_ngr_amount, 0) AS real_ngr_amount,
  COALESCE(affilka.sb_real_ngr_amount, 0) AS sb_real_ngr_amount,
  COALESCE(affilka.admin_fee_amount, 0) AS admin_fee_amount,
  COALESCE(affilka.sb_admin_fee_amount, 0) AS sb_admin_fee_amount,
  COALESCE(affilka.ngr, 0) AS ngr,
  -- affilka.brand_id,
  -- ga4.brand,
  COALESCE(affilka.ngr_0_amount, 0) AS ngr_0_amount,
  
  -- GA4 Event Data
  COALESCE(ga4.iconvert_clicks, 0) AS ga4_iconvert_clicks,
  COALESCE(ga4.iconvert_shows, 0) AS ga4_iconvert_shows

FROM iconvert_affilka_aggregated affilka
FULL OUTER JOIN ga4_iconvert_events ga4
  ON affilka.date = ga4.date 
  AND affilka.geo = ga4.geo