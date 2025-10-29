-- View: level-hope-462409-a8.reports.overview_iconvert_affilka
-- Dataset: reports
--

-- BigQuery View: iConvert Affilka Union (Platin + Tycoon)
-- Combines data from both mkt_platin and mkt_tycoon tables with custom field extractions for iConvert
-- Version: 1.0.0
SELECT 
  date,
  partner_id,
  -- Map partner_id to company name using CASE statement
  CASE 
    WHEN partner_id = "31426" THEN "pc_iconvert-trusted"
    WHEN partner_id = "30227" THEN "pc_iconvert-untrusted"
    ELSE CONCAT("unknown_partner", partner_id)
  END AS partner_name,
  dynamic_tag_utm_campaign AS utm_campaign,
  visits_count,
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
  -- Map brand_id to brand prefix for Platin
  CASE 
    WHEN CAST(brand_id AS INT64) = 38 THEN "pc"
    WHEN CAST(brand_id AS INT64) = 92 THEN "ps"
    ELSE CONCAT("unknown_brand_", CAST(brand_id AS STRING))
  END AS brand,
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
  date,
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
  visits_count,
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
  -- Map brand_id to brand prefix for Tycoon
  CASE 
    WHEN CAST(brand_id AS INT64) = 8 THEN "bp"
    WHEN CAST(brand_id AS INT64) = 73 THEN "lc"
    ELSE CONCAT("unknown_brand_", CAST(brand_id AS STRING))
  END AS brand,
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