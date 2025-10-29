-- View: level-hope-462409-a8.mkt_channels.meta_stats_custom2
-- Dataset: mkt_channels
--
-- Version: 1.0.0

WITH base_with_brand AS (

  SELECT 

    *,

    -- Brand extracted from campaign_name_custom

    UPPER(SPLIT(

      REGEXP_REPLACE(

        CASE 

          WHEN REGEXP_CONTAINS(adset_name, r"KW-SV excl REG LAL") = true OR REGEXP_CONTAINS(adset_name, r"KW-SV excl REG") = true OR REGEXP_CONTAINS(adset_name, r"kw-sv excl reg lal") = true THEN "kw_bp_meta_conv_highest-volume-purchaseattempt"

          WHEN REGEXP_CONTAINS(adset_name, r"QT-SV excl REG LAL") = true OR REGEXP_CONTAINS(adset_name, r"QT-SV excl REG") = true THEN "qt_bp_meta_conv_highest-volume-purchaseattempt"

          WHEN REGEXP_CONTAINS(adset_name, r"AE-SV excl REG LAL") = true OR REGEXP_CONTAINS(adset_name, r"AE-SV excl REG") = true THEN "ae_bp_meta_conv_highest-volume-purchaseattempt"

          WHEN REGEXP_CONTAINS(adset_name, r"SA-SV excl REG LAL") = true OR REGEXP_CONTAINS(adset_name, r"SA-SV excl REG") = true THEN "sa_bp_meta_conv_highest-volume-purchaseattempt"

          WHEN REGEXP_CONTAINS(adset_name, r"SV excl REG LAL") = true OR REGEXP_CONTAINS(adset_name, r"SV excl REG") = true OR REGEXP_CONTAINS(adset_name, r"sv excl reg lal") = true THEN "gcc_bp_meta_conv_highest-volume-purchaseattempt"

          WHEN REGEXP_CONTAINS(adset_name, r"avdplus-lal-postpurchase") = true AND REGEXP_CONTAINS(campaign_name, r"de_pc_meta_conv_highest-volume-purchase") = true THEN "test - de_pc_meta_conv_highest-volume-purchase"

          ELSE LOWER(TRIM(campaign_name)) 

        END,

        r" - copy$",

        ""

      ), '_')[SAFE_OFFSET(1)]

    ) AS brand

  FROM `level-hope-462409-a8.mkt_channels.meta_stats`

),



-- Deduplicate at ad + breakdown level (each breakdown combination should appear only once)

ad_breakdown_deduped AS (

  SELECT

    date_start,

    account_id,

    campaign_name,

    adset_name,

    ad_name,

    publisher_platform,

    platform_position,

    device_platform,

    brand,

    ANY_VALUE(goals_breakdown) as goals_breakdown,  -- Take any goals_breakdown (they should be the same for duplicates)

    MAX(reach) as reach,  -- Deduplicate if same ad+breakdown appears multiple times

    MAX(impressions) as impressions,  -- Also dedupe impressions at this level

    MAX(spend) as spend,  -- Keep the max spend

    MAX(clicks) as clicks  -- Keep the max clicks

  FROM base_with_brand

  GROUP BY date_start, account_id, campaign_name, adset_name, ad_name, 

           publisher_platform, platform_position, device_platform, brand

)



SELECT 

  date_start,

  account_id,

  

  -- Adname (Custom) = LOWER(TRIM(ad_name))

  LOWER(TRIM(ad_name)) AS adname_custom,

  

  -- Adset Name (Custom) with conditional logic

  CASE 

    WHEN REGEXP_CONTAINS(adset_name, r"KW-SV excl REG LAL") = true THEN "lal-10perc-sitevisit_excl-reg"

    WHEN REGEXP_CONTAINS(adset_name, r"KW-SV excl Lead LAL") = true THEN "lal-10perc-sitevisit_excl-reg"

    WHEN REGEXP_CONTAINS(adset_name, r"KW-SV excl REG") = true THEN "sitevisit_excl-reg"

    WHEN REGEXP_CONTAINS(adset_name, r"KW-SV excl Lead") = true THEN "sitevisit_excl-reg"

    ELSE LOWER(TRIM(adset_name)) 

  END AS adset_name_custom,

  

  -- Campaign Name (Custom) with conditional logic

  REGEXP_REPLACE(

    CASE 

      WHEN REGEXP_CONTAINS(adset_name, r"KW-SV excl REG LAL") = true OR REGEXP_CONTAINS(adset_name, r"KW-SV excl REG") = true OR REGEXP_CONTAINS(adset_name, r"kw-sv excl reg lal") = true THEN "kw_bp_meta_conv_highest-volume-purchaseattempt"

      WHEN REGEXP_CONTAINS(adset_name, r"QT-SV excl REG LAL") = true OR REGEXP_CONTAINS(adset_name, r"QT-SV excl REG") = true THEN "qt_bp_meta_conv_highest-volume-purchaseattempt"

      WHEN REGEXP_CONTAINS(adset_name, r"AE-SV excl REG LAL") = true OR REGEXP_CONTAINS(adset_name, r"AE-SV excl REG") = true THEN "ae_bp_meta_conv_highest-volume-purchaseattempt"

      WHEN REGEXP_CONTAINS(adset_name, r"SA-SV excl REG LAL") = true OR REGEXP_CONTAINS(adset_name, r"SA-SV excl REG") = true THEN "sa_bp_meta_conv_highest-volume-purchaseattempt"

      WHEN REGEXP_CONTAINS(adset_name, r"SV excl REG LAL") = true OR REGEXP_CONTAINS(adset_name, r"SV excl REG") = true OR REGEXP_CONTAINS(adset_name, r"sv excl reg lal") = true THEN "gcc_bp_meta_conv_highest-volume-purchaseattempt"

      WHEN REGEXP_CONTAINS(adset_name, r"avdplus-lal-postpurchase") = true AND REGEXP_CONTAINS(campaign_name, r"de_pc_meta_conv_highest-volume-purchase") = true THEN "test - de_pc_meta_conv_highest-volume-purchase"

      ELSE LOWER(TRIM(campaign_name)) 

    END,

    r" - copy$",

    ""

  ) AS campaign_name_custom,

  

  spend,

  impressions,

  clicks,

  reach,

  

  -- Calculate frequency correctly: impressions / reach (at breakdown level)

  SAFE_DIVIDE(impressions, reach) as frequency,

  

  -- Platform/Position/Device columns

  publisher_platform,

  platform_position,

  device_platform,

  

  -- Brand (from CTE)

  brand,

  

  -- PurchasePlus S2S Total = SUM(conv_PurchasePlus-S2S-BP_total)

  (

    SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-') AND g.window = 'total'

  ) AS purchaseplus_s2s_total,

  

  -- PurchasePlus Val. S2S Total = sum(convval_PurchasePlus-S2S-BP_total)

  (

    SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-') AND g.window = 'total'

  ) AS purchaseplus_val_s2s_total,

  

  -- PurchasePlus 1d View S2S Total = sum(conv_PurchasePlus-S2S-BP_1d_view)

  (

    SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-') AND g.window = '1d_view'

  ) AS purchaseplus_1d_view_s2s_total,

  

  -- PurchasePlus Val. 1d View S2S Total = sum(convval_PurchasePlus-S2S-BP_1d_view)

  (

    SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-') AND g.window = '1d_view'

  ) AS purchaseplus_val_1d_view_s2s_total,

  

  -- PurchasePlus 1d Click S2S Total = sum(conv_PurchasePlus-S2S-BP_1d_click)

  (

    SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-') AND g.window = '1d_click'

  ) AS purchaseplus_1d_click_s2s_total,

  

  -- PurchasePlus Val. 1d Click S2S Total = sum(convval_PurchasePlus-S2S-BP_1d_click)

  (

    SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-') AND g.window = '1d_click'

  ) AS purchaseplus_val_1d_click_s2s_total,

  

  -- PurchasePlus 1d Click S2S BP = sum(conv_PurchasePlus-S2S-BP_1d_click)

  (

    SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-BP') AND g.window = '1d_click'

  ) AS purchaseplus_1d_click_s2s_bp_total,

  

  -- PurchasePlus Val. 1d Click S2S BP = sum(convval_PurchasePlus-S2S-BP_1d_click)

  (

    SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-BP') AND g.window = '1d_click'

  ) AS purchaseplus_val_1d_click_s2s_bp_total,

  

  -- PurchasePlus 1d Click S2S PC = sum(conv_PurchasePlus-S2S-PC_1d_click)

  (

    SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-PC') AND g.window = '1d_click'

  ) AS purchaseplus_1d_click_s2s_pc_total,

  

  -- PurchasePlus Val. 1d Click S2S PC = sum(convval_PurchasePlus-S2S-PC_1d_click)

  (

    SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-PC') AND g.window = '1d_click'

  ) AS purchaseplus_val_1d_click_s2s_pc_total,

  

  -- PurchasePlus 1d View S2S BP = sum(conv_PurchasePlus-S2S-BP_1d_view)

  (

    SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-BP') AND g.window = '1d_view'

  ) AS purchaseplus_1d_view_s2s_bp_total,

  

  -- PurchasePlus Val. 1d View S2S BP = sum(convval_PurchasePlus-S2S-BP_1d_view)

  (

    SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-BP') AND g.window = '1d_view'

  ) AS purchaseplus_val_1d_view_s2s_bp_total,

  

  -- PurchasePlus 1d View S2S PC = sum(conv_PurchasePlus-S2S-PC_1d_view)

  (

    SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-PC') AND g.window = '1d_view'

  ) AS purchaseplus_1d_view_s2s_pc_total,

  

  -- PurchasePlus Val. 1d View S2S PC = sum(convval_PurchasePlus-S2S-PC_1d_view)

  (

    SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-PC') AND g.window = '1d_view'

  ) AS purchaseplus_val_1d_view_s2s_pc_total,

  

  -- PurchasePlus 7d Click S2S Total = sum(conv_PurchasePlus-S2S-BP_7d_click)

  (

    SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-') AND g.window = '7d_click'

  ) AS purchaseplus_7d_click_s2s_total,

  

  -- PurchasePlus Val. 7d Click S2S Total = sum(convval_PurchasePlus-S2S-BP_7d_click)

  (

    SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-') AND g.window = '7d_click'

  ) AS purchaseplus_val_7d_click_s2s_total,

  

  -- PurchasePlus 7d Click S2S BP = sum(conv_PurchasePlus-S2S-BP_7d_click)

  (

    SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-BP') AND g.window = '7d_click'

  ) AS purchaseplus_7d_click_s2s_bp_total,

  

  -- PurchasePlus Val. 7d Click S2S BP = sum(convval_PurchasePlus-S2S-BP_7d_click)

  (

    SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-BP') AND g.window = '7d_click'

  ) AS purchaseplus_val_7d_click_s2s_bp_total,

  

  -- PurchasePlus 7d Click S2S PC = sum(conv_PurchasePlus-S2S-PC_7d_click)

  (

    SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-PC') AND g.window = '7d_click'

  ) AS purchaseplus_7d_click_s2s_pc_total,

  

  -- PurchasePlus Val. 7d Click S2S PC = sum(convval_PurchasePlus-S2S-PC_7d_click)

  (

    SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-PC') AND g.window = '7d_click'

  ) AS purchaseplus_val_7d_click_s2s_pc_total,

  

  -- PurchasePlus 7d View S2S Total = sum(conv_PurchasePlus-S2S-BP_7d_view)

  (

    SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-') AND g.window = '7d_view'

  ) AS purchaseplus_7d_view_s2s_total,

  

  -- PurchasePlus Val. 7d View S2S Total = sum(convval_PurchasePlus-S2S-BP_7d_view)

  (

    SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-') AND g.window = '7d_view'

  ) AS purchaseplus_val_7d_view_s2s_total,

  

  -- PurchasePlus 7d View S2S BP = sum(conv_PurchasePlus-S2S-BP_7d_view)

  (

    SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-BP') AND g.window = '7d_view'

  ) AS purchaseplus_7d_view_s2s_bp_total,

  

  -- PurchasePlus Val. 7d View S2S BP = sum(convval_PurchasePlus-S2S-BP_7d_view)

  (

    SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-BP') AND g.window = '7d_view'

  ) AS purchaseplus_val_7d_view_s2s_bp_total,

  

  -- PurchasePlus 7d View S2S PC = sum(conv_PurchasePlus-S2S-PC_7d_view)

  (

    SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-PC') AND g.window = '7d_view'

  ) AS purchaseplus_7d_view_s2s_pc_total,

  

  -- PurchasePlus Val. 7d View S2S PC = sum(convval_PurchasePlus-S2S-PC_7d_view)

  (

    SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-PC') AND g.window = '7d_view'

  ) AS purchaseplus_val_7d_view_s2s_pc_total,

  

  -- Purchase 1d Click S2S Total = sum(conv_Purchase-S2S-_1d_click)

  (

    SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-') AND g.window = '1d_click'

  ) AS purchase_1d_click_s2s_total,

  

  -- Purchase Val. 1d Click S2S Total = sum(convval_Purchase-S2S-_1d_click)

  (

    SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-') AND g.window = '1d_click'

  ) AS purchase_val_1d_click_s2s_total,

  

  -- Purchase 1d Click S2S BP = sum(conv_Purchase-S2S-BP_1d_click)

  (

    SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-BP') AND g.window = '1d_click'

  ) AS purchase_1d_click_s2s_bp_total,

  

  -- Purchase Val. 1d Click S2S BP = sum(convval_Purchase-S2S-BP_1d_click)

  (

    SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-BP') AND g.window = '1d_click'

  ) AS purchase_val_1d_click_s2s_bp_total,

  

  -- Purchase 1d Click S2S PC = sum(conv_Purchase-S2S-PC_1d_click)

  (

    SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-PC') AND g.window = '1d_click'

  ) AS purchase_1d_click_s2s_pc_total,

  

  -- Purchase Val. 1d Click S2S PC = sum(convval_Purchase-S2S-PC_1d_click)

  (

    SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-PC') AND g.window = '1d_click'

  ) AS purchase_val_1d_click_s2s_pc_total,

  

  -- Purchase 1d View S2S Total = sum(conv_Purchase-S2S-_1d_view)

  (

    SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-') AND g.window = '1d_view'

  ) AS purchase_1d_view_s2s_total,

  

  -- Purchase Val. 1d View S2S Total = sum(convval_Purchase-S2S-_1d_view)

  (

    SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-') AND g.window = '1d_view'

  ) AS purchase_val_1d_view_s2s_total,

  

  -- Purchase 1d View S2S BP = sum(conv_Purchase-S2S-BP_1d_view)

  (

    SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-BP') AND g.window = '1d_view'

  ) AS purchase_1d_view_s2s_bp_total,

  

  -- Purchase Val. 1d View S2S BP = sum(convval_Purchase-S2S-BP_1d_view)

  (

    SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-BP') AND g.window = '1d_view'

  ) AS purchase_val_1d_view_s2s_bp_total,

  

  -- Purchase 1d View S2S PC = sum(conv_Purchase-S2S-PC_1d_view)

  (

    SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-PC') AND g.window = '1d_view'

  ) AS purchase_1d_view_s2s_pc_total,

  

  -- Purchase Val. 1d View S2S PC = sum(convval_Purchase-S2S-PC_1d_view)

  (

    SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-PC') AND g.window = '1d_view'

  ) AS purchase_val_1d_view_s2s_pc_total,

  

  -- Purchase S2S PC Total = sum(conv_Purchase-S2S-PC_total)

  (

    SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-PC') AND g.window = 'total'

  ) AS purchase_s2s_pc_total,

  

  -- Purchase Val. S2S PC Total = sum(convval_Purchase-S2S-PC_total)

  (

    SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-PC') AND g.window = 'total'

  ) AS purchase_val_s2s_pc_total,

  

  -- Purchase S2S BP Total = sum(conv_Purchase-S2S-BP_total)

  (

    SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-BP') AND g.window = 'total'

  ) AS purchase_s2s_bp_total,

  

  -- Purchase Val. S2S BP Total = sum(convval_Purchase-S2S-BP_total)

  (

    SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-BP') AND g.window = 'total'

  ) AS purchase_val_s2s_bp_total,

  

  -- PurchasePlus S2S BP Total = sum(conv_PurchasePlus-S2S-BP_total)

  (

    SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-BP') AND g.window = 'total'

  ) AS purchaseplus_s2s_bp_total,

  

  -- PurchasePlus Val. S2S BP Total = sum(convval_PurchasePlus-S2S-BP_total)

  (

    SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-BP') AND g.window = 'total'

  ) AS purchaseplus_val_s2s_bp_total,

  

  -- PurchasePlus S2S PC Total = sum(conv_PurchasePlus-S2S-PC_total)

  (

    SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-PC') AND g.window = 'total'

  ) AS purchaseplus_s2s_pc_total,

  

  -- PurchasePlus Val. S2S PC Total = sum(convval_PurchasePlus-S2S-PC_total)

  (

    SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-PC') AND g.window = 'total'

  ) AS purchaseplus_val_s2s_pc_total,

  

  -- ==================== SUMMED ATTRIBUTION WINDOWS ====================

  

  -- Purchase 7d Click + 1d View S2S Total = sum(conv_Purchase-S2S-_7d_click + 1d_view)

  (

    SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-') AND g.window IN ('7d_click', '1d_view')

  ) AS purchase_7d_click_1d_view_s2s_total,

  

  -- Purchase Val. 7d Click + 1d View S2S Total = sum(convval_Purchase-S2S-_7d_click + 1d_view)

  (

    SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-') AND g.window IN ('7d_click', '1d_view')

  ) AS purchase_val_7d_click_1d_view_s2s_total,

  

  -- Purchase 1d Click + 1d View S2S Total = sum(conv_Purchase-S2S-_1d_click + 1d_view)

  (

    SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-') AND g.window IN ('1d_click', '1d_view')

  ) AS purchase_1d_click_1d_view_s2s_total,

  

  -- Purchase Val. 1d Click + 1d View S2S Total = sum(convval_Purchase-S2S-_1d_click + 1d_view)

  (

    SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-') AND g.window IN ('1d_click', '1d_view')

  ) AS purchase_val_1d_click_1d_view_s2s_total,

  

  -- Purchase 7d Click + 1d View S2S Brand-Specific = sum(conv_Purchase-S2S-{BRAND}_7d_click + 1d_view)

  CASE 

    WHEN brand = 'BP' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-BP') AND g.window IN ('7d_click', '1d_view'))

    WHEN brand = 'PC' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-PC') AND g.window IN ('7d_click', '1d_view'))

    WHEN brand = 'LC' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-LC') AND g.window IN ('7d_click', '1d_view'))

    WHEN brand = 'PS' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-PS') AND g.window IN ('7d_click', '1d_view'))

    WHEN brand = 'RL' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-RL') AND g.window IN ('7d_click', '1d_view'))

    WHEN brand = 'FF' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-FF') AND g.window IN ('7d_click', '1d_view'))

    WHEN brand = 'SF' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-SF') AND g.window IN ('7d_click', '1d_view'))

    ELSE 0

  END AS purchase_7d_click_1d_view_s2s_brand_total,

  

  -- Purchase Val. 7d Click + 1d View S2S Brand-Specific = sum(convval_Purchase-S2S-{BRAND}_7d_click + 1d_view)

  CASE 

    WHEN brand = 'BP' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-BP') AND g.window IN ('7d_click', '1d_view'))

    WHEN brand = 'PC' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-PC') AND g.window IN ('7d_click', '1d_view'))

    WHEN brand = 'LC' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-LC') AND g.window IN ('7d_click', '1d_view'))

    WHEN brand = 'PS' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-PS') AND g.window IN ('7d_click', '1d_view'))

    WHEN brand = 'RL' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-RL') AND g.window IN ('7d_click', '1d_view'))

    WHEN brand = 'FF' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-FF') AND g.window IN ('7d_click', '1d_view'))

    WHEN brand = 'SF' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-SF') AND g.window IN ('7d_click', '1d_view'))

    ELSE 0

  END AS purchase_val_7d_click_1d_view_s2s_brand_total,

  

  -- Purchase 1d Click + 1d View S2S Brand-Specific = sum(conv_Purchase-S2S-{BRAND}_1d_click + 1d_view)

  CASE 

    WHEN brand = 'BP' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-BP') AND g.window IN ('1d_click', '1d_view'))

    WHEN brand = 'PC' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-PC') AND g.window IN ('1d_click', '1d_view'))

    WHEN brand = 'LC' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-LC') AND g.window IN ('1d_click', '1d_view'))

    WHEN brand = 'PS' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-PS') AND g.window IN ('1d_click', '1d_view'))

    WHEN brand = 'RL' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-RL') AND g.window IN ('1d_click', '1d_view'))

    WHEN brand = 'FF' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-FF') AND g.window IN ('1d_click', '1d_view'))

    WHEN brand = 'SF' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-SF') AND g.window IN ('1d_click', '1d_view'))

    ELSE 0

  END AS purchase_1d_click_1d_view_s2s_brand_total,

  

  -- Purchase Val. 1d Click + 1d View S2S Brand-Specific = sum(convval_Purchase-S2S-{BRAND}_1d_click + 1d_view)

  CASE 

    WHEN brand = 'BP' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-BP') AND g.window IN ('1d_click', '1d_view'))

    WHEN brand = 'PC' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-PC') AND g.window IN ('1d_click', '1d_view'))

    WHEN brand = 'LC' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-LC') AND g.window IN ('1d_click', '1d_view'))

    WHEN brand = 'PS' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-PS') AND g.window IN ('1d_click', '1d_view'))

    WHEN brand = 'RL' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-RL') AND g.window IN ('1d_click', '1d_view'))

    WHEN brand = 'FF' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-FF') AND g.window IN ('1d_click', '1d_view'))

    WHEN brand = 'SF' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'Purchase-S2S-SF') AND g.window IN ('1d_click', '1d_view'))

    ELSE 0

  END AS purchase_val_1d_click_1d_view_s2s_brand_total,

  

  -- PurchasePlus 7d Click + 1d View S2S Total = sum(conv_PurchasePlus-S2S-_7d_click + 1d_view)

  (

    SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-') AND g.window IN ('7d_click', '1d_view')

  ) AS purchaseplus_7d_click_1d_view_s2s_total,

  

  -- PurchasePlus Val. 7d Click + 1d View S2S Total = sum(convval_PurchasePlus-S2S-_7d_click + 1d_view)

  (

    SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-') AND g.window IN ('7d_click', '1d_view')

  ) AS purchaseplus_val_7d_click_1d_view_s2s_total,

  

  -- PurchasePlus 1d Click + 1d View S2S Total = sum(conv_PurchasePlus-S2S-_1d_click + 1d_view)

  (

    SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-') AND g.window IN ('1d_click', '1d_view')

  ) AS purchaseplus_1d_click_1d_view_s2s_total,

  

  -- PurchasePlus Val. 1d Click + 1d View S2S Total = sum(convval_PurchasePlus-S2S-_1d_click + 1d_view)

  (

    SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-') AND g.window IN ('1d_click', '1d_view')

  ) AS purchaseplus_val_1d_click_1d_view_s2s_total,

  

  -- PurchasePlus 7d Click + 1d View First Conversion S2S Total = sum(conv_PurchasePlus-S2S-_7d_click_first_conversion + 1d_view_first_conversion)

  (

    SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-') AND g.window IN ('7d_click_first_conversion', '1d_view_first_conversion')

  ) AS purchaseplus_7d_click_1d_view_first_conversion_s2s_total,

  

  -- PurchasePlus Val. 7d Click + 1d View First Conversion S2S Total = sum(convval_PurchasePlus-S2S-_7d_click_first_conversion + 1d_view_first_conversion)

  (

    SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-') AND g.window IN ('7d_click_first_conversion', '1d_view_first_conversion')

  ) AS purchaseplus_val_7d_click_1d_view_first_conversion_s2s_total,

  

  -- PurchasePlus 1d Click + 1d View First Conversion S2S Total = sum(conv_PurchasePlus-S2S-_1d_click_first_conversion + 1d_view_first_conversion)

  (

    SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-') AND g.window IN ('1d_click_first_conversion', '1d_view_first_conversion')

  ) AS purchaseplus_1d_click_1d_view_first_conversion_s2s_total,

  

  -- PurchasePlus Val. 1d Click + 1d View First Conversion S2S Total = sum(convval_PurchasePlus-S2S-_1d_click_first_conversion + 1d_view_first_conversion)

  (

    SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC)

    FROM UNNEST(IFNULL(goals_breakdown, [])) AS g

    WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-') AND g.window IN ('1d_click_first_conversion', '1d_view_first_conversion')

  ) AS purchaseplus_val_1d_click_1d_view_first_conversion_s2s_total,

  

  -- purchaseplus_7d_click_1d_view_s2s_brand_total

  CASE 

    WHEN brand = 'BP' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-BP') AND g.window IN ('7d_click', '1d_view'))

    WHEN brand = 'PC' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-PC') AND g.window IN ('7d_click', '1d_view'))

    WHEN brand = 'LC' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-LC') AND g.window IN ('7d_click', '1d_view'))

    WHEN brand = 'PS' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-PS') AND g.window IN ('7d_click', '1d_view'))

    WHEN brand = 'RL' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-RL') AND g.window IN ('7d_click', '1d_view'))

    WHEN brand = 'FF' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-FF') AND g.window IN ('7d_click', '1d_view'))

    WHEN brand = 'SF' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-SF') AND g.window IN ('7d_click', '1d_view'))

    ELSE 0

  END AS purchaseplus_7d_click_1d_view_s2s_brand_total,

  

  -- purchaseplus_val_7d_click_1d_view_s2s_brand_total

  CASE 

    WHEN brand = 'BP' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-BP') AND g.window IN ('7d_click', '1d_view'))

    WHEN brand = 'PC' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-PC') AND g.window IN ('7d_click', '1d_view'))

    WHEN brand = 'LC' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-LC') AND g.window IN ('7d_click', '1d_view'))

    WHEN brand = 'PS' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-PS') AND g.window IN ('7d_click', '1d_view'))

    WHEN brand = 'RL' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-RL') AND g.window IN ('7d_click', '1d_view'))

    WHEN brand = 'FF' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-FF') AND g.window IN ('7d_click', '1d_view'))

    WHEN brand = 'SF' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-SF') AND g.window IN ('7d_click', '1d_view'))

    ELSE 0

  END AS purchaseplus_val_7d_click_1d_view_s2s_brand_total,

  

  -- purchaseplus_1d_click_1d_view_s2s_brand_total

  CASE 

    WHEN brand = 'BP' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-BP') AND g.window IN ('1d_click', '1d_view'))

    WHEN brand = 'PC' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-PC') AND g.window IN ('1d_click', '1d_view'))

    WHEN brand = 'LC' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-LC') AND g.window IN ('1d_click', '1d_view'))

    WHEN brand = 'PS' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-PS') AND g.window IN ('1d_click', '1d_view'))

    WHEN brand = 'RL' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-RL') AND g.window IN ('1d_click', '1d_view'))

    WHEN brand = 'FF' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-FF') AND g.window IN ('1d_click', '1d_view'))

    WHEN brand = 'SF' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-SF') AND g.window IN ('1d_click', '1d_view'))

    ELSE 0

  END AS purchaseplus_1d_click_1d_view_s2s_brand_total,

  

  -- purchaseplus_val_1d_click_1d_view_s2s_brand_total

  CASE 

    WHEN brand = 'BP' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-BP') AND g.window IN ('1d_click', '1d_view'))

    WHEN brand = 'PC' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-PC') AND g.window IN ('1d_click', '1d_view'))

    WHEN brand = 'LC' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-LC') AND g.window IN ('1d_click', '1d_view'))

    WHEN brand = 'PS' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-PS') AND g.window IN ('1d_click', '1d_view'))

    WHEN brand = 'RL' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-RL') AND g.window IN ('1d_click', '1d_view'))

    WHEN brand = 'FF' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-FF') AND g.window IN ('1d_click', '1d_view'))

    WHEN brand = 'SF' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-SF') AND g.window IN ('1d_click', '1d_view'))

    ELSE 0

  END AS purchaseplus_val_1d_click_1d_view_s2s_brand_total,

  

  -- purchaseplus_7d_click_1d_view_first_conversion_s2s_brand_total

  CASE 

    WHEN brand = 'BP' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-BP') AND g.window IN ('7d_click_first_conversion', '1d_view_first_conversion'))

    WHEN brand = 'PC' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-PC') AND g.window IN ('7d_click_first_conversion', '1d_view_first_conversion'))

    WHEN brand = 'LC' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-LC') AND g.window IN ('7d_click_first_conversion', '1d_view_first_conversion'))

    WHEN brand = 'PS' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-PS') AND g.window IN ('7d_click_first_conversion', '1d_view_first_conversion'))

    WHEN brand = 'RL' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-RL') AND g.window IN ('7d_click_first_conversion', '1d_view_first_conversion'))

    WHEN brand = 'FF' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-FF') AND g.window IN ('7d_click_first_conversion', '1d_view_first_conversion'))

    WHEN brand = 'SF' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-SF') AND g.window IN ('7d_click_first_conversion', '1d_view_first_conversion'))

    ELSE 0

  END AS purchaseplus_7d_click_1d_view_first_conversion_s2s_brand_total,

  

  -- purchaseplus_val_7d_click_1d_view_first_conversion_s2s_brand_total

  CASE 

    WHEN brand = 'BP' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-BP') AND g.window IN ('7d_click_first_conversion', '1d_view_first_conversion'))

    WHEN brand = 'PC' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-PC') AND g.window IN ('7d_click_first_conversion', '1d_view_first_conversion'))

    WHEN brand = 'LC' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-LC') AND g.window IN ('7d_click_first_conversion', '1d_view_first_conversion'))

    WHEN brand = 'PS' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-PS') AND g.window IN ('7d_click_first_conversion', '1d_view_first_conversion'))

    WHEN brand = 'RL' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-RL') AND g.window IN ('7d_click_first_conversion', '1d_view_first_conversion'))

    WHEN brand = 'FF' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-FF') AND g.window IN ('7d_click_first_conversion', '1d_view_first_conversion'))

    WHEN brand = 'SF' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-SF') AND g.window IN ('7d_click_first_conversion', '1d_view_first_conversion'))

    ELSE 0

  END AS purchaseplus_val_7d_click_1d_view_first_conversion_s2s_brand_total,

  

  -- purchaseplus_1d_click_1d_view_first_conversion_s2s_brand_total

  CASE 

    WHEN brand = 'BP' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-BP') AND g.window IN ('1d_click_first_conversion', '1d_view_first_conversion'))

    WHEN brand = 'PC' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-PC') AND g.window IN ('1d_click_first_conversion', '1d_view_first_conversion'))

    WHEN brand = 'LC' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-LC') AND g.window IN ('1d_click_first_conversion', '1d_view_first_conversion'))

    WHEN brand = 'PS' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-PS') AND g.window IN ('1d_click_first_conversion', '1d_view_first_conversion'))

    WHEN brand = 'RL' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-RL') AND g.window IN ('1d_click_first_conversion', '1d_view_first_conversion'))

    WHEN brand = 'FF' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-FF') AND g.window IN ('1d_click_first_conversion', '1d_view_first_conversion'))

    WHEN brand = 'SF' THEN (SELECT CAST(COALESCE(SUM(g.conversions), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-SF') AND g.window IN ('1d_click_first_conversion', '1d_view_first_conversion'))

    ELSE 0

  END AS purchaseplus_1d_click_1d_view_first_conversion_s2s_brand_total,

  

  -- purchaseplus_val_1d_click_1d_view_first_conversion_s2s_brand_total

  CASE 

    WHEN brand = 'BP' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-BP') AND g.window IN ('1d_click_first_conversion', '1d_view_first_conversion'))

    WHEN brand = 'PC' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-PC') AND g.window IN ('1d_click_first_conversion', '1d_view_first_conversion'))

    WHEN brand = 'LC' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-LC') AND g.window IN ('1d_click_first_conversion', '1d_view_first_conversion'))

    WHEN brand = 'PS' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-PS') AND g.window IN ('1d_click_first_conversion', '1d_view_first_conversion'))

    WHEN brand = 'RL' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-RL') AND g.window IN ('1d_click_first_conversion', '1d_view_first_conversion'))

    WHEN brand = 'FF' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-FF') AND g.window IN ('1d_click_first_conversion', '1d_view_first_conversion'))

    WHEN brand = 'SF' THEN (SELECT CAST(COALESCE(SUM(g.conversion_value), 0) AS NUMERIC) FROM UNNEST(IFNULL(goals_breakdown, [])) AS g WHERE STARTS_WITH(g.goal_name, 'PurchasePlus-S2S-SF') AND g.window IN ('1d_click_first_conversion', '1d_view_first_conversion'))

    ELSE 0

  END AS purchaseplus_val_1d_click_1d_view_first_conversion_s2s_brand_total



FROM ad_breakdown_deduped

