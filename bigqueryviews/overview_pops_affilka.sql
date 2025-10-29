-- View: level-hope-462409-a8.reports.overview_pops_affilka
-- Dataset: reports
--
-- Version: 1.0.0

WITH pops_aggregated AS (

  SELECT 

    campaign_name,

    date,

    ANY_VALUE(channel) AS channel,

    SUM(impressions) AS impressions,

    SUM(clicks) AS clicks,

    SUM(conversions) AS conversions,

    SUM(conversion_value) AS conversion_value,

    SUM(spend) AS spend,

    SUM(`ftd-s2s`) AS `ftd-s2s`,

    SUM(`deposit-s2s`) AS `deposit-s2s`,

    SUM(`reg-s2s`) AS `reg-s2s`,

    SUM(`ftd-s2s_val`) AS `ftd-s2s_val`,

    SUM(`deposit-s2s_val`) AS `deposit-s2s_val`,

    SUM(`reg-s2s_val`) AS `reg-s2s_val`

  FROM `level-hope-462409-a8.mkt_channels.pops_stats_custom`

  GROUP BY campaign_name, date

),

marketing_aggregated AS (

  SELECT 

    campaign_name_custom,

    date,

    ANY_VALUE(utm_campaign) AS utm_campaign,

    ANY_VALUE(partner_id) AS partner_id,

    ANY_VALUE(first_deposit_day) AS first_deposit_day,

    SUM(casino_ggr) AS casino_ggr,

    SUM(casino_ngr) AS casino_ngr,

    SUM(regs) AS regs,

    SUM(ftds) AS ftds,

    SUM(deps) AS deps,

    SUM(deposit_sum) AS deposit_sum,

    SUM(real_ngr_amount) AS real_ngr_amount,

    SUM(sb_real_ngr_amount) AS sb_real_ngr_amount,

    SUM(admin_fee_amount) AS admin_fee_amount,

    SUM(sb_admin_fee_amount) AS sb_admin_fee_amount,

    SUM(ngr_0_amount) AS ngr_0_amount

  FROM `level-hope-462409-a8.affilka.pops_affilka_union`

  GROUP BY campaign_name_custom, date

)

SELECT 

  COALESCE(marketing.date, pops.date) AS date,

  COALESCE(pops.channel, 'Unknown') AS channel,

  COALESCE(pops.spend, 0) AS spend,

  COALESCE(pops.impressions, 0) AS impressions,

  COALESCE(pops.clicks, 0) AS clicks,

  COALESCE(pops.conversions, 0) AS conversions,

  COALESCE(pops.conversion_value, 0) AS conversion_value,

  marketing.partner_id,

  marketing.utm_campaign,

  COALESCE(marketing.casino_ggr, 0) AS casino_ggr,

  COALESCE(marketing.casino_ngr, 0) AS casino_ngr,

  COALESCE(marketing.regs, 0) AS regs,

  COALESCE(marketing.ftds, 0) AS ftds,

  COALESCE(marketing.deps, 0) AS deps,

  COALESCE(marketing.deposit_sum, 0) AS deposit_sum,

  COALESCE(marketing.real_ngr_amount, 0) AS real_ngr_amount,

  COALESCE(marketing.sb_real_ngr_amount, 0) AS sb_real_ngr_amount,

  COALESCE(marketing.admin_fee_amount, 0) AS admin_fee_amount,

  COALESCE(marketing.sb_admin_fee_amount, 0) AS sb_admin_fee_amount,

  COALESCE(marketing.real_ngr_amount, 0) + COALESCE(marketing.sb_real_ngr_amount, 0) + 

  COALESCE(marketing.admin_fee_amount, 0) + COALESCE(marketing.sb_admin_fee_amount, 0) AS ngr,

  COALESCE(marketing.ngr_0_amount, 0) AS ngr_0,

  COALESCE(marketing.campaign_name_custom, pops.campaign_name) AS campaign_name_custom,

  COALESCE(pops.`ftd-s2s`, 0) AS `ftd-s2s`,

  COALESCE(pops.`deposit-s2s`, 0) AS `deposit-s2s`,

  COALESCE(pops.`reg-s2s`, 0) AS `reg-s2s`,

  COALESCE(pops.`ftd-s2s_val`, 0) AS `ftd-s2s_val`,

  COALESCE(pops.`deposit-s2s_val`, 0) AS `deposit-s2s_val`,

  COALESCE(pops.`reg-s2s_val`, 0) AS `reg-s2s_val`,

  LOWER(SPLIT(COALESCE(marketing.campaign_name_custom, pops.campaign_name), '_')[SAFE_OFFSET(1)]) AS brand,

  CASE 

    WHEN SPLIT(COALESCE(marketing.campaign_name_custom, pops.campaign_name), '_')[SAFE_OFFSET(1)] = 'bp' THEN 'Bet and Play'

    WHEN SPLIT(COALESCE(marketing.campaign_name_custom, pops.campaign_name), '_')[SAFE_OFFSET(1)] = 'lc' THEN 'Lucky Circus'

    WHEN SPLIT(COALESCE(marketing.campaign_name_custom, pops.campaign_name), '_')[SAFE_OFFSET(1)] = 'pc' THEN 'Platin Casino'

    WHEN SPLIT(COALESCE(marketing.campaign_name_custom, pops.campaign_name), '_')[SAFE_OFFSET(1)] = 'ps' THEN 'Platinum Slots'

    ELSE SPLIT(COALESCE(marketing.campaign_name_custom, pops.campaign_name), '_')[SAFE_OFFSET(1)]

  END AS brand_name,

  REGEXP_EXTRACT(COALESCE(marketing.campaign_name_custom, pops.campaign_name), "^([a-zA-Z0-9-]+)_") AS geo,

  CONCAT(

    REGEXP_EXTRACT(COALESCE(marketing.campaign_name_custom, pops.campaign_name), "^([a-zA-Z0-9-]+)_"),

    '_',

    SPLIT(COALESCE(marketing.campaign_name_custom, pops.campaign_name), '_')[SAFE_OFFSET(1)],

    '_',

    SPLIT(COALESCE(marketing.campaign_name_custom, pops.campaign_name), '_')[SAFE_OFFSET(2)]

  ) AS partner_name,

  CASE 

    WHEN LOWER(

          REGEXP_EXTRACT(

            SPLIT(COALESCE(marketing.campaign_name_custom, pops.campaign_name), '_')[SAFE_OFFSET(2)],

            r'([^-]+)'

          )

        ) = 'pops' 

    THEN 'pop'

    ELSE LOWER(

          REGEXP_EXTRACT(

            SPLIT(COALESCE(marketing.campaign_name_custom, pops.campaign_name), '_')[SAFE_OFFSET(2)],

            r'([^-]+)'

          )

        )

  END AS media_type,

  REGEXP_EXTRACT(

    SPLIT(COALESCE(marketing.campaign_name_custom, pops.campaign_name), '_')[SAFE_OFFSET(2)],

    r'[^-]+$'

  ) AS channel_name,

  CASE 

    WHEN marketing.first_deposit_day IS NOT NULL THEN

      CAST(

        (EXTRACT(YEAR FROM COALESCE(marketing.date, pops.date)) * 12 + EXTRACT(MONTH FROM COALESCE(marketing.date, pops.date))) -

        (EXTRACT(YEAR FROM marketing.first_deposit_day) * 12 + EXTRACT(MONTH FROM marketing.first_deposit_day))

        AS STRING

      )

    ELSE NULL

  END AS cohort

FROM marketing_aggregated marketing

FULL OUTER JOIN pops_aggregated pops

  ON pops.campaign_name = marketing.campaign_name_custom

  AND pops.date = marketing.date;