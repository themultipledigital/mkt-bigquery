-- View: level-hope-462409-a8.reports.cohort_meta_affilka
-- Dataset: reports
--

-- View: Cohort Analysis for META Affilka with Spend Data

-- BigQuery View: Cohort Analysis for META Affilka with Spend Data

-- Tracks player lifetime value (LTV) over time by analyzing NGR, deposits, and depositors month by month after first deposit

-- Includes spend data with fixed spend values across all cohort numbers

-- Each row represents one campaign/adset/ad for one cohort in one month
-- Version: 1.0.0

WITH meta_spend_aggregated AS (

  -- Get spend data aggregated by campaign/adset/ad/date (same logic as overview view)

  SELECT 

    campaign_name_custom,

    adset_name_custom,

    adname_custom,

    date_start,

    ANY_VALUE(account_id) AS account_id,

    SUM(spend) AS spend

  FROM `level-hope-462409-a8.mkt_channels.meta_stats_custom`

  GROUP BY campaign_name_custom, adset_name_custom, adname_custom, date_start

),

meta_spend_monthly AS (

  -- Aggregate spend to month-level to avoid many-to-many joins

  SELECT

    campaign_name_custom,

    adset_name_custom,

    adname_custom,

    DATE_TRUNC(date_start, MONTH) AS cohort_month,

    ANY_VALUE(account_id) AS account_id,

    SUM(spend) AS spend

  FROM meta_spend_aggregated

  GROUP BY campaign_name_custom, adset_name_custom, adname_custom, cohort_month

),

marketing_cohort_data AS (

  -- Get marketing data with cohort calculations

  SELECT 

    campaign_name_custom,

    adset_name_custom,

    adname_custom,

    

    -- Convert the first deposit date to just the month (e.g., "2025-07-01")

    DATE_TRUNC(first_deposit_day, MONTH) AS cohort_month,

    

    -- Calculate how many months have passed since first deposit

    -- Example: If first deposit was July 2025 and current data is September 2025, cohort_number = 2

    CASE 

      WHEN first_deposit_day IS NOT NULL THEN

        CAST(

          (EXTRACT(YEAR FROM date) * 12 + EXTRACT(MONTH FROM date)) -

          (EXTRACT(YEAR FROM first_deposit_day) * 12 + EXTRACT(MONTH FROM first_deposit_day))

          AS INT64

        )

      ELSE NULL

    END AS cohort_number,

    

    -- The revenue amount for this record

    casino_ngr,

    

    -- The deposits count for this record

    deps,

    

    -- The deposit sum for this record

    deposit_sum,

    

    -- The depositing players count for this record

    depositing_players_count

  FROM `level-hope-462409-a8.affilka.meta_affilka_union`

  WHERE first_deposit_day IS NOT NULL  -- Only include customers who made a first deposit

),

marketing_cohort_monthly AS (

  -- Aggregate marketing data to month-level per cohort_number to prevent duplication on join

  SELECT

    campaign_name_custom,

    adset_name_custom,

    adname_custom,

    cohort_month,

    cohort_number,

    SUM(casino_ngr) AS casino_ngr,

    SUM(deps) AS deps,

    SUM(deposit_sum) AS deposit_sum,

    SUM(depositing_players_count) AS depositing_players_count

  FROM marketing_cohort_data

  GROUP BY campaign_name_custom, adset_name_custom, adname_custom, cohort_month, cohort_number

),

spend_cohort_data AS (

  -- Create spend data with cohort numbers 0-23 for each campaign/adset/ad combination

  SELECT 

    s.campaign_name_custom,

    s.adset_name_custom,

    s.adname_custom,

    s.cohort_month AS cohort_month,

    cohort_num AS cohort_number,

    s.spend,

    s.account_id

  FROM meta_spend_monthly s

  CROSS JOIN UNNEST(GENERATE_ARRAY(0, 23)) AS cohort_num  -- Generate cohort numbers 0-23

),

combined_data AS (

  -- Combine marketing cohort data with spend data

  SELECT 

    COALESCE(m.campaign_name_custom, s.campaign_name_custom) AS campaign_name_custom,

    COALESCE(m.adset_name_custom, s.adset_name_custom) AS adset_name_custom,

    COALESCE(m.adname_custom, s.adname_custom) AS adname_custom,

    COALESCE(m.cohort_month, s.cohort_month) AS cohort_month,

    COALESCE(m.cohort_number, s.cohort_number) AS cohort_number,

    COALESCE(m.casino_ngr, 0) AS casino_ngr,

    COALESCE(m.deps, 0) AS deps,

    COALESCE(m.deposit_sum, 0) AS deposit_sum,

    COALESCE(m.depositing_players_count, 0) AS depositing_players_count,

    COALESCE(s.spend, 0) AS spend,

    COALESCE(s.account_id, 'Unknown') AS account_id

  FROM marketing_cohort_monthly m

  FULL OUTER JOIN spend_cohort_data s

    ON m.campaign_name_custom = s.campaign_name_custom

    AND m.adset_name_custom = s.adset_name_custom

    AND m.adname_custom = s.adname_custom

    AND m.cohort_month = s.cohort_month

    AND m.cohort_number = s.cohort_number

)

SELECT 

  -- Campaign details for filtering and grouping

  campaign_name_custom,

  adset_name_custom,

  adname_custom,

  account_id,

  

  -- The month when the customer first made a deposit (this is our cohort month)

  cohort_month,

  

  -- How many months after first deposit this revenue occurred (0 = same month, 1 = next month, etc.)

  cohort_number,

  

  -- Spend data (fixed across all cohort numbers for each campaign/adset/ad)

  spend,

  

  -- Total revenue for this specific month (not cumulative)

  SUM(casino_ngr) AS ngr_monthly,

  

  -- Running total of revenue from cohort month 0 up to this cohort number

  -- This shows the cumulative value a customer group has generated over time

  SUM(SUM(casino_ngr)) OVER (

    PARTITION BY campaign_name_custom, adset_name_custom, adname_custom, cohort_month

    ORDER BY cohort_number

    ROWS UNBOUNDED PRECEDING

  ) AS ngr_cumulative,

  

  -- Total deposits count for this specific month (not cumulative)

  SUM(deps) AS deps_monthly,

  

  -- Running total of deposits from cohort month 0 up to this cohort number

  SUM(SUM(deps)) OVER (

    PARTITION BY campaign_name_custom, adset_name_custom, adname_custom, cohort_month

    ORDER BY cohort_number

    ROWS UNBOUNDED PRECEDING

  ) AS deps_cumulative,

  

  -- Total deposit value for this specific month (not cumulative)

  SUM(deposit_sum) AS deposit_value_monthly,

  

  -- Running total of deposit value from cohort month 0 up to this cohort number

  SUM(SUM(deposit_sum)) OVER (

    PARTITION BY campaign_name_custom, adset_name_custom, adname_custom, cohort_month

    ORDER BY cohort_number

    ROWS UNBOUNDED PRECEDING

  ) AS deposit_value_cumulative,

  

  -- Total depositing players for this specific month (not cumulative)

  SUM(depositing_players_count) AS depositors_monthly,

  

  -- Running total of depositing players from cohort month 0 up to this cohort number

  SUM(SUM(depositing_players_count)) OVER (

    PARTITION BY campaign_name_custom, adset_name_custom, adname_custom, cohort_month

    ORDER BY cohort_number

    ROWS UNBOUNDED PRECEDING

  ) AS depositors_cumulative

FROM combined_data

WHERE cohort_number >= 0  -- Remove any negative cohort numbers (data quality issue)

GROUP BY 

  campaign_name_custom,

  adset_name_custom,

  adname_custom,

  account_id,

  cohort_month,

  cohort_number,

  spend;