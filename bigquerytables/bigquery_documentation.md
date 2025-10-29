# BigQuery Project Documentation: level-hope-462409-a8

_Generated automatically from BigQuery metadata_

## Summary

- **Total Datasets**: 5
- **Total Tables**: 18
- **Total Views**: 18
- **Total Objects**: 36

## Table of Contents

- [Summary](#summary)
- [Relationships Overview](#relationships-overview)
- [affilka](#affilka)
- [ga_analytics](#ga-analytics)
- [mkt_channels](#mkt-channels)
- [reports](#reports)
- [tradedesk](#tradedesk)

## Relationships Overview

This diagram shows how views depend on tables and other views:

```mermaid
graph LR
    N0[conversion_value), 0)
     FROM UNNEST(IFNULL(goals_breakdown, [])) AS g
     WHERE REGEXP_CONTAINS(LOWER(g.goal_name), r'^[a-z]{2,3}_deposit$')
  ) AS ]:::table
    N1[conversion_value), 0)
     FROM UNNEST(IFNULL(goals_breakdown, [])) AS g
     WHERE REGEXP_CONTAINS(LOWER(g.goal_name), r'^[a-z]{2,3}_first_deposit$')
  ) AS ]:::table
    N2[conversion_value), 0)
     FROM UNNEST(IFNULL(goals_breakdown, [])) AS g
     WHERE REGEXP_CONTAINS(LOWER(g.goal_name), r'^[a-z]{2,3}_registration_completed$')
  ) AS ]:::table
    N3[conversions), 0)
     FROM UNNEST(IFNULL(goals_breakdown, [])) AS g
     WHERE REGEXP_CONTAINS(LOWER(g.goal_name), r'^[a-z]{2,3}_deposit$')
  ) AS ]:::table
    N4[conversions), 0)
     FROM UNNEST(IFNULL(goals_breakdown, [])) AS g
     WHERE REGEXP_CONTAINS(LOWER(g.goal_name), r'^[a-z]{2,3}_registration_completed$')
  ) AS ]:::table
    N5[affilka.meta_affilka_union]:::view
    N6[affilka.mkt_platin]:::table
    N7[affilka.mkt_tycoon]:::table
    N8[affilka.pops_affilka_union]:::view
    N9[affilka.tradedesk_affilka_union]:::view
    N10[analytics_348995202.events_]:::table
    N11[analytics_348995202.events_*]:::table
    N12[analytics_377709600.events_]:::table
    N13[analytics_377709600.events_*]:::table
    N14[analytics_403066296.events_]:::table
    N15[analytics_403066296.events_*]:::table
    N16[analytics_421901040.events_]:::table
    N17[analytics_421901040.events_*]:::table
    N18[analytics_449298170.events_]:::table
    N19[analytics_449298170.events_*]:::table
    N20[analytics_469242368.events_]:::table
    N21[analytics_469242368.events_*]:::table
    N22[analytics_471243947.events_]:::table
    N23[analytics_471243947.events_*]:::table
    N24[ga_analytics.ga_analytics_union]:::view
    N25[level-hope-462409-a8.affilka]:::table
    N26[level-hope-462409-a8.analytics_348995202]:::table
    N27[level-hope-462409-a8.analytics_377709600]:::table
    N28[level-hope-462409-a8.analytics_403066296]:::table
    N29[level-hope-462409-a8.analytics_421901040]:::table
    N30[level-hope-462409-a8.analytics_449298170]:::table
    N31[level-hope-462409-a8.analytics_469242368]:::table
    N32[level-hope-462409-a8.analytics_471243947]:::table
    N33[level-hope-462409-a8.ga_analytics]:::table
    N34[level-hope-462409-a8.mkt_channels]:::table
    N35[level-hope-462409-a8.reports]:::table
    N36[level-hope-462409-a8.tradedesk]:::table
    N37[marketing.first_deposit_day]:::table
    N38[mkt_channels.exo_stats]:::table
    N39[mkt_channels.meta_stats]:::table
    N40[mkt_channels.meta_stats_custom]:::view
    N41[mkt_channels.meta_targeting]:::table
    N42[mkt_channels.pops_stats_custom]:::view
    N43[mkt_channels.tj_campaign_stats]:::table
    N44[mkt_channels.tradedesk_stats_custom]:::view
    N45[mkt_channels.ts_stats_siteid]:::table
    N46[reports.cohort_meta_affilka]:::view
    N47[reports.cohort_pops_affilka]:::view
    N48[reports.meta_targeting]:::view
    N49[reports.overview_affilka]:::view
    N50[reports.overview_brandprotection_affilka]:::view
    N51[reports.overview_iconvert_affilka]:::view
    N52[reports.overview_iconvert_affilka-ga4]:::view
    N53[reports.overview_meta_affilka]:::view
    N54[reports.overview_pops_affilka]:::view
    N55[tradedesk.ID41]:::view
    N56[tradedesk.ID41_backfill]:::table
    N57[tradedesk.ID41_conv_daily]:::table
    N58[tradedesk.ID42]:::view
    N59[tradedesk.ID42_backfill]:::table
    N60[tradedesk.ID42_performance_daily]:::table
    N6 --> N5
    N25 --> N5
    N7 --> N5
    N6 --> N8
    N25 --> N8
    N7 --> N8
    N6 --> N9
    N25 --> N9
    N7 --> N9
    N16 --> N24
    N23 --> N24
    N22 --> N24
    N30 --> N24
    N29 --> N24
    N31 --> N24
    N11 --> N24
    N13 --> N24
    N21 --> N24
    N32 --> N24
    N27 --> N24
    N28 --> N24
    N10 --> N24
    N19 --> N24
    N12 --> N24
    N20 --> N24
    N15 --> N24
    N18 --> N24
    N14 --> N24
    N26 --> N24
    N17 --> N24
    N39 --> N40
    N34 --> N40
    N1 --> N42
    N38 --> N42
    N45 --> N42
    N34 --> N42
    N0 --> N42
    N43 --> N42
    N3 --> N42
    N2 --> N42
    N4 --> N42
    N58 --> N44
    N55 --> N44
    N36 --> N44
    N40 --> N46
    N5 --> N46
    N25 --> N46
    N34 --> N46
    N25 --> N47
    N34 --> N47
    N42 --> N47
    N8 --> N47
    N34 --> N48
    N25 --> N48
    N40 --> N48
    N41 --> N48
    N37 --> N48
    N5 --> N48
    N44 --> N49
    N34 --> N49
    N51 --> N49
    N35 --> N49
    N53 --> N49
    N50 --> N49
    N54 --> N49
    N6 --> N50
    N25 --> N50
    N7 --> N50
    N6 --> N51
    N25 --> N51
    N7 --> N51
    N24 --> N52
    N25 --> N52
    N33 --> N52
    N7 --> N52
    N6 --> N52
    N34 --> N53
    N25 --> N53
    N40 --> N53
    N41 --> N53
    N37 --> N53
    N5 --> N53
    N34 --> N54
    N25 --> N54
    N8 --> N54
    N37 --> N54
    N42 --> N54
    N57 --> N55
    N56 --> N55
    N36 --> N55
    N59 --> N58
    N36 --> N58
    N60 --> N58
    classDef view fill:#e1f5ff,stroke:#0288d1,stroke-width:2px
    classDef table fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
```

## affilka

**Location**: US
**Created**: 2025-09-11 12:55:58.277000+00:00
**Modified**: 2025-09-11 12:55:58.277000+00:00

**Tables**: 6 | **Views**: 3

### Tables in affilka

#### mkt_platin

**Full Name**: `level-hope-462409-a8.affilka.mkt_platin`
**Rows**: 16,642
**Size**: 11.31 MB
**Created**: 2025-09-15 08:58:36.873000+00:00
**Modified**: 2025-10-27 12:01:14.745000+00:00

**Schema**:

| Column Name | Type | Mode | Description |
|-------------|------|------|-------------|
| date | DATE | NULLABLE |  |
| retrieved_at | TIMESTAMP | NULLABLE |  |
| partner_id | STRING | NULLABLE |  |
| brand_id | STRING | NULLABLE |  |
| strategy_id | STRING | NULLABLE |  |
| campaign_id | STRING | NULLABLE |  |
| campaign_name | STRING | NULLABLE |  |
| promo_id | STRING | NULLABLE |  |
| sign_up_at_day | DATE | NULLABLE |  |
| first_deposit_day | DATE | NULLABLE |  |
| dynamic_tag_siteid | STRING | NULLABLE |  |
| dynamic_tag_utm_campaign | STRING | NULLABLE |  |
| dynamic_tag_utm_content | STRING | NULLABLE |  |
| dynamic_tag_utm_medium | STRING | NULLABLE |  |
| dynamic_tag_utm_source | STRING | NULLABLE |  |
| player_country | STRING | NULLABLE |  |
| row_currency | STRING | NULLABLE |  |
| visits_count | INTEGER | NULLABLE |  |
| registrations_count | INTEGER | NULLABLE |  |
| depositing_players_count | INTEGER | NULLABLE |  |
| first_deposits_count | INTEGER | NULLABLE |  |
| deposits_count | INTEGER | NULLABLE |  |
| cashouts_count | INTEGER | NULLABLE |  |
| first_deposits_sum_amount | NUMERIC | NULLABLE |  |
| first_deposits_sum_amount_cents | STRING | NULLABLE |  |
| first_deposits_sum_currency | STRING | NULLABLE |  |
| deposits_sum_amount | NUMERIC | NULLABLE |  |
| deposits_sum_amount_cents | STRING | NULLABLE |  |
| deposits_sum_currency | STRING | NULLABLE |  |
| cashouts_sum_amount | NUMERIC | NULLABLE |  |
| cashouts_sum_amount_cents | STRING | NULLABLE |  |
| cashouts_sum_currency | STRING | NULLABLE |  |
| ggr_amount | NUMERIC | NULLABLE |  |
| ggr_amount_cents | STRING | NULLABLE |  |
| ggr_currency | STRING | NULLABLE |  |
| bonus_issues_sum_amount | NUMERIC | NULLABLE |  |
| bonus_issues_sum_amount_cents | STRING | NULLABLE |  |
| bonus_issues_sum_currency | STRING | NULLABLE |  |
| additional_deductions_sum_amount | NUMERIC | NULLABLE |  |
| additional_deductions_sum_amount_cents | STRING | NULLABLE |  |
| additional_deductions_sum_currency | STRING | NULLABLE |  |
| real_ngr_amount | NUMERIC | NULLABLE |  |
| real_ngr_amount_cents | STRING | NULLABLE |  |
| real_ngr_currency | STRING | NULLABLE |  |
| admin_fee_amount | NUMERIC | NULLABLE |  |
| admin_fee_amount_cents | STRING | NULLABLE |  |
| admin_fee_currency | STRING | NULLABLE |  |
| ngr_amount | NUMERIC | NULLABLE |  |
| ngr_amount_cents | STRING | NULLABLE |  |
| ngr_currency | STRING | NULLABLE |  |
| sb_settled_bets_sum_amount | NUMERIC | NULLABLE |  |
| sb_settled_bets_sum_amount_cents | STRING | NULLABLE |  |
| sb_settled_bets_sum_currency | STRING | NULLABLE |  |
| sb_real_ggr_amount | NUMERIC | NULLABLE |  |
| sb_real_ggr_amount_cents | STRING | NULLABLE |  |
| sb_real_ggr_currency | STRING | NULLABLE |  |
| sb_ggr_amount | NUMERIC | NULLABLE |  |
| sb_ggr_amount_cents | STRING | NULLABLE |  |
| sb_ggr_currency | STRING | NULLABLE |  |
| sb_bonuses_sum_amount | NUMERIC | NULLABLE |  |
| sb_bonuses_sum_amount_cents | STRING | NULLABLE |  |
| sb_bonuses_sum_currency | STRING | NULLABLE |  |
| sb_balance_corrections_sum_amount | NUMERIC | NULLABLE |  |
| sb_balance_corrections_sum_amount_cents | STRING | NULLABLE |  |
| sb_balance_corrections_sum_currency | STRING | NULLABLE |  |
| sb_third_party_fees_sum_amount | NUMERIC | NULLABLE |  |
| sb_third_party_fees_sum_amount_cents | STRING | NULLABLE |  |
| sb_third_party_fees_sum_currency | STRING | NULLABLE |  |
| sb_real_ngr_amount | NUMERIC | NULLABLE |  |
| sb_real_ngr_amount_cents | STRING | NULLABLE |  |
| sb_real_ngr_currency | STRING | NULLABLE |  |
| sb_admin_fee_amount | NUMERIC | NULLABLE |  |
| sb_admin_fee_amount_cents | STRING | NULLABLE |  |
| sb_admin_fee_currency | STRING | NULLABLE |  |
| sb_ngr_amount | NUMERIC | NULLABLE |  |
| sb_ngr_amount_cents | STRING | NULLABLE |  |
| sb_ngr_currency | STRING | NULLABLE |  |
| clean_net_revenue_amount | NUMERIC | NULLABLE |  |
| clean_net_revenue_amount_cents | STRING | NULLABLE |  |
| clean_net_revenue_currency | STRING | NULLABLE |  |
| net_deposits_amount | NUMERIC | NULLABLE |  |
| net_deposits_amount_cents | STRING | NULLABLE |  |
| net_deposits_currency | STRING | NULLABLE |  |

---

#### mkt_tycoon

**Full Name**: `level-hope-462409-a8.affilka.mkt_tycoon`
**Rows**: 2,869
**Size**: 1.81 MB
**Created**: 2025-09-15 08:57:37.491000+00:00
**Modified**: 2025-10-27 12:01:09.533000+00:00

**Schema**:

| Column Name | Type | Mode | Description |
|-------------|------|------|-------------|
| date | DATE | NULLABLE |  |
| retrieved_at | TIMESTAMP | NULLABLE |  |
| partner_id | STRING | NULLABLE |  |
| brand_id | STRING | NULLABLE |  |
| strategy_id | STRING | NULLABLE |  |
| campaign_id | STRING | NULLABLE |  |
| campaign_name | STRING | NULLABLE |  |
| promo_id | STRING | NULLABLE |  |
| sign_up_at_day | DATE | NULLABLE |  |
| first_deposit_day | DATE | NULLABLE |  |
| dynamic_tag_siteid | STRING | NULLABLE |  |
| dynamic_tag_utm_campaign | STRING | NULLABLE |  |
| dynamic_tag_utm_content | STRING | NULLABLE |  |
| dynamic_tag_utm_medium | STRING | NULLABLE |  |
| dynamic_tag_utm_source | STRING | NULLABLE |  |
| player_country | STRING | NULLABLE |  |
| row_currency | STRING | NULLABLE |  |
| visits_count | INTEGER | NULLABLE |  |
| registrations_count | INTEGER | NULLABLE |  |
| depositing_players_count | INTEGER | NULLABLE |  |
| first_deposits_count | INTEGER | NULLABLE |  |
| deposits_count | INTEGER | NULLABLE |  |
| cashouts_count | INTEGER | NULLABLE |  |
| first_deposits_sum_amount | NUMERIC | NULLABLE |  |
| first_deposits_sum_amount_cents | STRING | NULLABLE |  |
| first_deposits_sum_currency | STRING | NULLABLE |  |
| deposits_sum_amount | NUMERIC | NULLABLE |  |
| deposits_sum_amount_cents | STRING | NULLABLE |  |
| deposits_sum_currency | STRING | NULLABLE |  |
| cashouts_sum_amount | NUMERIC | NULLABLE |  |
| cashouts_sum_amount_cents | STRING | NULLABLE |  |
| cashouts_sum_currency | STRING | NULLABLE |  |
| ggr_amount | NUMERIC | NULLABLE |  |
| ggr_amount_cents | STRING | NULLABLE |  |
| ggr_currency | STRING | NULLABLE |  |
| bonus_issues_sum_amount | NUMERIC | NULLABLE |  |
| bonus_issues_sum_amount_cents | STRING | NULLABLE |  |
| bonus_issues_sum_currency | STRING | NULLABLE |  |
| additional_deductions_sum_amount | NUMERIC | NULLABLE |  |
| additional_deductions_sum_amount_cents | STRING | NULLABLE |  |
| additional_deductions_sum_currency | STRING | NULLABLE |  |
| real_ngr_amount | NUMERIC | NULLABLE |  |
| real_ngr_amount_cents | STRING | NULLABLE |  |
| real_ngr_currency | STRING | NULLABLE |  |
| admin_fee_amount | NUMERIC | NULLABLE |  |
| admin_fee_amount_cents | STRING | NULLABLE |  |
| admin_fee_currency | STRING | NULLABLE |  |
| ngr_amount | NUMERIC | NULLABLE |  |
| ngr_amount_cents | STRING | NULLABLE |  |
| ngr_currency | STRING | NULLABLE |  |
| sb_settled_bets_sum_amount | NUMERIC | NULLABLE |  |
| sb_settled_bets_sum_amount_cents | STRING | NULLABLE |  |
| sb_settled_bets_sum_currency | STRING | NULLABLE |  |
| sb_real_ggr_amount | NUMERIC | NULLABLE |  |
| sb_real_ggr_amount_cents | STRING | NULLABLE |  |
| sb_real_ggr_currency | STRING | NULLABLE |  |
| sb_ggr_amount | NUMERIC | NULLABLE |  |
| sb_ggr_amount_cents | STRING | NULLABLE |  |
| sb_ggr_currency | STRING | NULLABLE |  |
| sb_bonuses_sum_amount | NUMERIC | NULLABLE |  |
| sb_bonuses_sum_amount_cents | STRING | NULLABLE |  |
| sb_bonuses_sum_currency | STRING | NULLABLE |  |
| sb_balance_corrections_sum_amount | NUMERIC | NULLABLE |  |
| sb_balance_corrections_sum_amount_cents | STRING | NULLABLE |  |
| sb_balance_corrections_sum_currency | STRING | NULLABLE |  |
| sb_third_party_fees_sum_amount | NUMERIC | NULLABLE |  |
| sb_third_party_fees_sum_amount_cents | STRING | NULLABLE |  |
| sb_third_party_fees_sum_currency | STRING | NULLABLE |  |
| sb_real_ngr_amount | NUMERIC | NULLABLE |  |
| sb_real_ngr_amount_cents | STRING | NULLABLE |  |
| sb_real_ngr_currency | STRING | NULLABLE |  |
| sb_admin_fee_amount | NUMERIC | NULLABLE |  |
| sb_admin_fee_amount_cents | STRING | NULLABLE |  |
| sb_admin_fee_currency | STRING | NULLABLE |  |
| sb_ngr_amount | NUMERIC | NULLABLE |  |
| sb_ngr_amount_cents | STRING | NULLABLE |  |
| sb_ngr_currency | STRING | NULLABLE |  |
| clean_net_revenue_amount | NUMERIC | NULLABLE |  |
| clean_net_revenue_amount_cents | STRING | NULLABLE |  |
| clean_net_revenue_currency | STRING | NULLABLE |  |
| net_deposits_amount | NUMERIC | NULLABLE |  |
| net_deposits_amount_cents | STRING | NULLABLE |  |
| net_deposits_currency | STRING | NULLABLE |  |

---

#### promos_platin

**Full Name**: `level-hope-462409-a8.affilka.promos_platin`
**Rows**: 424
**Size**: 115.83 KB
**Created**: 2025-09-25 12:14:29.505000+00:00
**Modified**: 2025-09-25 12:14:45.395000+00:00

**Schema**:

| Column Name | Type | Mode | Description |
|-------------|------|------|-------------|
| id | INTEGER | REQUIRED |  |
| code | STRING | NULLABLE |  |
| name | STRING | NULLABLE |  |
| campaign_id | INTEGER | NULLABLE |  |
| campaign_name | STRING | NULLABLE |  |
| landing_id | INTEGER | NULLABLE |  |
| landing_url | STRING | NULLABLE |  |
| created_at | TIMESTAMP | NULLABLE |  |
| partner_id | INTEGER | NULLABLE |  |
| partner_name | STRING | NULLABLE |  |
| partner_email | STRING | NULLABLE |  |
| brand_id | INTEGER | NULLABLE |  |
| brand_name | STRING | NULLABLE |  |
| commission_id | INTEGER | NULLABLE |  |
| commission_title | STRING | NULLABLE |  |
| players_count | INTEGER | NULLABLE |  |
| blocked | BOOLEAN | NULLABLE |  |
| traffic_source | STRING | NULLABLE |  |
| subaffiliate | BOOLEAN | NULLABLE |  |
| retrieved_at | TIMESTAMP | REQUIRED |  |

---

#### promos_tycoon

**Full Name**: `level-hope-462409-a8.affilka.promos_tycoon`
**Rows**: 1,165
**Size**: 291.30 KB
**Created**: 2025-09-25 11:17:22.606000+00:00
**Modified**: 2025-09-25 12:06:52.745000+00:00

**Schema**:

| Column Name | Type | Mode | Description |
|-------------|------|------|-------------|
| id | INTEGER | REQUIRED |  |
| code | STRING | NULLABLE |  |
| name | STRING | NULLABLE |  |
| campaign_id | INTEGER | NULLABLE |  |
| campaign_name | STRING | NULLABLE |  |
| landing_id | INTEGER | NULLABLE |  |
| landing_url | STRING | NULLABLE |  |
| created_at | TIMESTAMP | NULLABLE |  |
| partner_id | INTEGER | NULLABLE |  |
| partner_name | STRING | NULLABLE |  |
| partner_email | STRING | NULLABLE |  |
| brand_id | INTEGER | NULLABLE |  |
| brand_name | STRING | NULLABLE |  |
| commission_id | INTEGER | NULLABLE |  |
| commission_title | STRING | NULLABLE |  |
| players_count | INTEGER | NULLABLE |  |
| blocked | BOOLEAN | NULLABLE |  |
| traffic_source | STRING | NULLABLE |  |
| subaffiliate | BOOLEAN | NULLABLE |  |
| retrieved_at | TIMESTAMP | REQUIRED |  |

---

#### traffic_report_platin

**Full Name**: `level-hope-462409-a8.affilka.traffic_report_platin`
**Rows**: 251
**Size**: 31.38 KB
**Created**: 2025-09-25 12:14:01.820000+00:00
**Modified**: 2025-09-25 12:14:14.232000+00:00

**Schema**:

| Column Name | Type | Mode | Description |
|-------------|------|------|-------------|
| date | DATE | REQUIRED |  |
| foreign_brand_id | INTEGER | NULLABLE |  |
| foreign_partner_id | INTEGER | NULLABLE |  |
| foreign_campaign_id | INTEGER | NULLABLE |  |
| foreign_promo_id | INTEGER | NULLABLE |  |
| foreign_landing_id | INTEGER | NULLABLE |  |
| clicks | INTEGER | NULLABLE |  |
| visits | INTEGER | NULLABLE |  |
| registrations_count | INTEGER | NULLABLE |  |
| ftd_count | INTEGER | NULLABLE |  |
| deposits_count | INTEGER | NULLABLE |  |
| cr | FLOAT | NULLABLE |  |
| cftd | FLOAT | NULLABLE |  |
| cd | FLOAT | NULLABLE |  |
| rftd | FLOAT | NULLABLE |  |
| retrieved_at | TIMESTAMP | REQUIRED |  |

---

#### traffic_report_tycoon

**Full Name**: `level-hope-462409-a8.affilka.traffic_report_tycoon`
**Rows**: 265
**Size**: 33.12 KB
**Created**: 2025-09-25 12:15:24.120000+00:00
**Modified**: 2025-09-25 12:15:35.435000+00:00

**Schema**:

| Column Name | Type | Mode | Description |
|-------------|------|------|-------------|
| date | DATE | REQUIRED |  |
| foreign_brand_id | INTEGER | NULLABLE |  |
| foreign_partner_id | INTEGER | NULLABLE |  |
| foreign_campaign_id | INTEGER | NULLABLE |  |
| foreign_promo_id | INTEGER | NULLABLE |  |
| foreign_landing_id | INTEGER | NULLABLE |  |
| clicks | INTEGER | NULLABLE |  |
| visits | INTEGER | NULLABLE |  |
| registrations_count | INTEGER | NULLABLE |  |
| ftd_count | INTEGER | NULLABLE |  |
| deposits_count | INTEGER | NULLABLE |  |
| cr | FLOAT | NULLABLE |  |
| cftd | FLOAT | NULLABLE |  |
| cd | FLOAT | NULLABLE |  |
| rftd | FLOAT | NULLABLE |  |
| retrieved_at | TIMESTAMP | REQUIRED |  |

---

### Views in affilka

#### meta_affilka_union

**Full Name**: `level-hope-462409-a8.affilka.meta_affilka_union`
**Created**: 2025-09-16 09:33:03.841000+00:00
**Modified**: 2025-10-08 06:31:39.032000+00:00

**Dependencies**: This view depends on 3 object(s):
- `level-hope-462409-a8.affilka.mkt_platin`
- `level-hope-462409-a8.affilka.mkt_tycoon`
- `level-hope-462409-a8.level-hope-462409-a8.affilka`

**Schema**:

| Column Name | Type | Mode | Description |
|-------------|------|------|-------------|
| date | DATE | NULLABLE |  |
| adset_name_custom | STRING | NULLABLE |  |
| adname_custom | STRING | NULLABLE |  |
| campaign_name_custom | STRING | NULLABLE |  |
| utm_campaign | STRING | NULLABLE |  |
| player_country | STRING | NULLABLE |  |
| casino_ggr | NUMERIC | NULLABLE |  |
| casino_ngr | NUMERIC | NULLABLE |  |
| regs | INTEGER | NULLABLE |  |
| ftds | INTEGER | NULLABLE |  |
| ftd_amount | NUMERIC | NULLABLE |  |
| deps | INTEGER | NULLABLE |  |
| deposit_sum | NUMERIC | NULLABLE |  |
| real_ngr_amount | NUMERIC | NULLABLE |  |
| sb_real_ngr_amount | NUMERIC | NULLABLE |  |
| admin_fee_amount | NUMERIC | NULLABLE |  |
| sb_admin_fee_amount | NUMERIC | NULLABLE |  |
| first_deposit_day | DATE | NULLABLE |  |
| depositing_players | INTEGER | NULLABLE |  |
| ngr_0_amount | NUMERIC | NULLABLE |  |


<details>
<summary><b>View SQL Query</b> (click to expand)</summary>

```sql
-- BigQuery View: META Affilka Union (Platin + Tycoon)
-- Combines data from both mkt_platin and mkt_tycoon tables with custom field extractions for META
SELECT 
  date,
  -- Adset Name (Custom) - extracts the 6th segment from utm_campaign
  LOWER(TRIM(REGEXP_EXTRACT(dynamic_tag_utm_campaign, r'^(?:[^_]*_){5}(.+?)_(?:[^_&]+_[0-9]{2}-[0-9]{2}(?:-[0-9]{2,4})?|[^_&]+)(?:&|$)'))) AS adset_name_custom,
  
  -- Ad Name (Custom) - extracts the ad name pattern from utm_campaign
  LOWER(TRIM(REGEXP_EXTRACT(dynamic_tag_utm_campaign, r'([^_&]+_[0-9]{2}-[0-9]{2}(?:-[0-9]{2,4})?|[^_&]+)(?:&|$)'))) AS adname_custom,
  
  -- Campaign Name (Custom) - extracts first 5 segments from utm_campaign
  LOWER(TRIM(REGEXP_EXTRACT(dynamic_tag_utm_campaign, r'^((?:[^_]*_){4}[^_]*)'))) AS campaign_name_custom,
  
  dynamic_tag_utm_campaign AS utm_campaign,
  player_country,
  
  -- Casino GGR (Gross Gaming Revenue)
  ggr_amount AS casino_ggr,
  
  -- Casino NGR (Net Gaming Revenue) 
  ngr_amount AS casino_ngr,
  
  -- Registration count as REGs
  registrations_count AS regs,
  
  -- First deposit count as FTDs
  first_deposits_count AS ftds,
  
  -- First deposit sum as FTD Amount
  first_deposits_sum_amount AS ftd_amount,
  
  -- Deposit count
  deposits_count AS deps,
  
  -- Deposit sum
  deposits_sum_amount AS deposit_sum,
  
  -- NGR components
  real_ngr_amount,
  sb_real_ngr_amount,
  admin_fee_amount,
  sb_admin_fee_amount,
  
  -- First deposit day for attribution analysis
  first_deposit_day,
  
  -- Depositing players count for cohort analysis
  depositing_players_count AS depositing_players,
  
  -- NGR [0] - NGR only for first month (when first_deposit_day month = date month)
  CASE 
    WHEN first_deposit_day IS NOT NULL 
         AND EXTRACT(MONTH FROM first_deposit_day) = EXTRACT(MONTH FROM date)
         AND EXTRACT(YEAR FROM first_deposit_day) = EXTRACT(YEAR FROM date)
    THEN real_ngr_amount + sb_real_ngr_amount + admin_fee_amount + sb_admin_fee_amount
    ELSE 0
  END AS ngr_0_amount

FROM `level-hope-462409-a8.affilka.mkt_platin`
WHERE partner_id IN ("31098", "27335", "11064", "12982")

UNION ALL

SELECT 
  date,
  -- Adset Name (Custom) - extracts the 6th segment from utm_campaign
  LOWER(TRIM(REGEXP_EXTRACT(dynamic_tag_utm_campaign, r'^(?:[^_]*_){5}(.+?)_(?:[^_&]+_[0-9]{2}-[0-9]{2}(?:-[0-9]{2,4})?|[^_&]+)(?:&|$)'))) AS adset_name_custom,
  
  -- Ad Name (Custom) - extracts the ad name pattern from utm_campaign
  LOWER(TRIM(REGEXP_EXTRACT(dynamic_tag_utm_campaign, r'([^_&]+_[0-9]{2}-[0-9]{2}(?:-[0-9]{2,4})?|[^_&]+)(?:&|$)'))) AS adname_custom,
  
  -- Campaign Name (Custom) - extracts first 5 segments from utm_campaign
  LOWER(TRIM(REGEXP_EXTRACT(dynamic_tag_utm_campaign, r'^((?:[^_]*_){4}[^_]*)'))) AS campaign_name_custom,
  
  dynamic_tag_utm_campaign AS utm_campaign,
  player_country,
  
  -- Casino GGR (Gross Gaming Revenue)
  ggr_amount AS casino_ggr,
  
  -- Casino NGR (Net Gaming Revenue)
  ngr_amount AS casino_ngr,
  
  -- Registration count as REGs
  registrations_count AS regs,
  
  -- First deposit count as FTDs
  first_deposits_count AS ftds,
  
  -- First deposit sum as FTD Amount
  first_deposits_sum_amount AS ftd_amount,
  
  -- Deposit count
  deposits_count AS deps,
  
  -- Deposit sum
  deposits_sum_amount AS deposit_sum,
  
  -- NGR components
  real_ngr_amount,
  sb_real_ngr_amount,
  admin_fee_amount,
  sb_admin_fee_amount,
  
  -- First deposit day for attribution analysis
  first_deposit_day,
  
  -- Depositing players count for cohort analysis
  depositing_players_count AS depositing_players,
  
  -- NGR [0] - NGR only for first month (when first_deposit_day month = date month)
  CASE 
    WHEN first_deposit_day IS NOT NULL 
         AND EXTRACT(MONTH FROM first_deposit_day) = EXTRACT(MONTH FROM date)
         AND EXTRACT(YEAR FROM first_deposit_day) = EXTRACT(YEAR FROM date)
    THEN real_ngr_amount + sb_real_ngr_amount + admin_fee_amount + sb_admin_fee_amount
    ELSE 0
  END AS ngr_0_amount

FROM `level-hope-462409-a8.affilka.mkt_tycoon`
WHERE partner_id IN ("14258", "8162", "31759", "30663", "25867");
```
</details>

---

#### pops_affilka_union

**Full Name**: `level-hope-462409-a8.affilka.pops_affilka_union`
**Created**: 2025-09-16 12:12:13.369000+00:00
**Modified**: 2025-09-22 10:38:03.584000+00:00

**Dependencies**: This view depends on 3 object(s):
- `level-hope-462409-a8.affilka.mkt_platin`
- `level-hope-462409-a8.affilka.mkt_tycoon`
- `level-hope-462409-a8.level-hope-462409-a8.affilka`

**Schema**:

| Column Name | Type | Mode | Description |
|-------------|------|------|-------------|
| date | DATE | NULLABLE |  |
| partner_id | STRING | NULLABLE |  |
| utm_campaign | STRING | NULLABLE |  |
| campaign_name_custom | STRING | NULLABLE |  |
| casino_ggr | NUMERIC | NULLABLE |  |
| casino_ngr | NUMERIC | NULLABLE |  |
| regs | INTEGER | NULLABLE |  |
| ftds | INTEGER | NULLABLE |  |
| deps | INTEGER | NULLABLE |  |
| deposit_sum | NUMERIC | NULLABLE |  |
| real_ngr_amount | NUMERIC | NULLABLE |  |
| sb_real_ngr_amount | NUMERIC | NULLABLE |  |
| admin_fee_amount | NUMERIC | NULLABLE |  |
| sb_admin_fee_amount | NUMERIC | NULLABLE |  |
| first_deposit_day | DATE | NULLABLE |  |
| depositing_players_count | INTEGER | NULLABLE |  |
| ngr_0_amount | NUMERIC | NULLABLE |  |


<details>
<summary><b>View SQL Query</b> (click to expand)</summary>

```sql
-- BigQuery View: POPS Affilka Union (Platin + Tycoon)
-- Combines data from both mkt_platin and mkt_tycoon tables with custom field extractions for POPS
SELECT 
  date,
  partner_id,
  dynamic_tag_utm_campaign AS utm_campaign,
  -- Campaign Name (Custom) with POPS-specific logic
  CASE 
    WHEN REGEXP_CONTAINS(dynamic_tag_utm_campaign, r'^[a-z]{2,4}_(pc|lc|ps|bp)') THEN dynamic_tag_utm_campaign
    WHEN REGEXP_CONTAINS(campaign_name, r'^[0-9]{6,8}$') THEN dynamic_tag_utm_campaign
    ELSE campaign_name
  END AS campaign_name_custom,
  
  -- Casino GGR (Gross Gaming Revenue)
  ggr_amount AS casino_ggr,
  
  -- Casino NGR (Net Gaming Revenue) 
  ngr_amount AS casino_ngr,
  
  -- Registration count as REGs
  registrations_count AS regs,
  
  -- First deposit count as FTDs
  first_deposits_count AS ftds,
  
  -- Deposit count
  deposits_count AS deps,
  
  -- Deposit sum
  deposits_sum_amount AS deposit_sum,
  
  -- NGR components
  real_ngr_amount,
  sb_real_ngr_amount,
  admin_fee_amount,
  sb_admin_fee_amount,
  
  -- First deposit day for attribution analysis
  first_deposit_day,
  
  -- Depositing players count for cohort analysis
  depositing_players_count,
  
  -- NGR [0] - NGR only for first month (when first_deposit_day month = date month)
  CASE 
    WHEN first_deposit_day IS NOT NULL 
         AND EXTRACT(MONTH FROM first_deposit_day) = EXTRACT(MONTH FROM date)
         AND EXTRACT(YEAR FROM first_deposit_day) = EXTRACT(YEAR FROM date)
    THEN real_ngr_amount + sb_real_ngr_amount + admin_fee_amount + sb_admin_fee_amount
    ELSE 0
  END AS ngr_0_amount

FROM `level-hope-462409-a8.affilka.mkt_platin`
WHERE partner_id IN ("32591", "15277", "11082", "10910", "10860", "10859", "10677", "10588", "9368", "9367", "15526", "32498", "27033")  -- POPS Platin partner IDs

UNION ALL

SELECT 
  date,
  partner_id,
  dynamic_tag_utm_campaign AS utm_campaign,
  
  -- Campaign Name (Custom) with POPS-specific logic
  CASE 
    WHEN REGEXP_CONTAINS(dynamic_tag_utm_campaign, r'^[a-z]{2}_pc_[a-z]+-exo_(conv|psp)_mob') THEN dynamic_tag_utm_campaign
    WHEN REGEXP_CONTAINS(campaign_name, r'welcome-page|pc-de-book_of_dead-10000_450FS-1a|pc-de-book_of_the_fallen-10000_450FS-1a|pc-de-gates_of_olympus-10000_450FS-1a|pc-de-big_bass_splash_big_win-10000_450FS-1a|pc-de-legacy_of_dead-10000_450FS-1a|welcome-page-registration-modal') THEN dynamic_tag_utm_campaign
    WHEN REGEXP_CONTAINS(campaign_name, r'^[0-9]{6,8}$') THEN dynamic_tag_utm_campaign
    ELSE campaign_name
  END AS campaign_name_custom,
  
  -- Casino GGR (Gross Gaming Revenue)
  ggr_amount AS casino_ggr,
  
  -- Casino NGR (Net Gaming Revenue)
  ngr_amount AS casino_ngr,
  
  -- Registration count as REGs
  registrations_count AS regs,
  
  -- First deposit count as FTDs
  first_deposits_count AS ftds,
  
  -- Deposit count
  deposits_count AS deps,
  
  -- Deposit sum
  deposits_sum_amount AS deposit_sum,
  
  -- NGR components
  real_ngr_amount,
  sb_real_ngr_amount,
  admin_fee_amount,
  sb_admin_fee_amount,
  
  -- First deposit day for attribution analysis
  first_deposit_day,
  
  -- Depositing players count for cohort analysis
  depositing_players_count,
  
  -- NGR [0] - NGR only for first month (when first_deposit_day month = date month)
  CASE 
    WHEN first_deposit_day IS NOT NULL 
         AND EXTRACT(MONTH FROM first_deposit_day) = EXTRACT(MONTH FROM date)
         AND EXTRACT(YEAR FROM first_deposit_day) = EXTRACT(YEAR FROM date)
    THEN real_ngr_amount + sb_real_ngr_amount + admin_fee_amount + sb_admin_fee_amount
    ELSE 0
  END AS ngr_0_amount

FROM `level-hope-462409-a8.affilka.mkt_tycoon`
WHERE partner_id IN ("32201", "30875", "30874", "30831", "30830", "30829", "30828", "27332", "16708", "16707", "16657", "8579", "7786", "7785")

```
</details>

---

#### tradedesk_affilka_union

**Full Name**: `level-hope-462409-a8.affilka.tradedesk_affilka_union`
**Created**: 2025-09-29 09:16:23.800000+00:00
**Modified**: 2025-09-29 09:16:35.713000+00:00

**Dependencies**: This view depends on 3 object(s):
- `level-hope-462409-a8.affilka.mkt_platin`
- `level-hope-462409-a8.affilka.mkt_tycoon`
- `level-hope-462409-a8.level-hope-462409-a8.affilka`

**Schema**:

| Column Name | Type | Mode | Description |
|-------------|------|------|-------------|
| date | DATE | NULLABLE |  |
| partner_id | STRING | NULLABLE |  |
| utm_campaign | STRING | NULLABLE |  |
| campaign_name_custom | STRING | NULLABLE |  |
| casino_ggr | NUMERIC | NULLABLE |  |
| casino_ngr | NUMERIC | NULLABLE |  |
| regs | INTEGER | NULLABLE |  |
| ftds | INTEGER | NULLABLE |  |
| deps | INTEGER | NULLABLE |  |
| deposit_sum | NUMERIC | NULLABLE |  |
| real_ngr_amount | NUMERIC | NULLABLE |  |
| sb_real_ngr_amount | NUMERIC | NULLABLE |  |
| admin_fee_amount | NUMERIC | NULLABLE |  |
| sb_admin_fee_amount | NUMERIC | NULLABLE |  |
| first_deposit_day | DATE | NULLABLE |  |
| depositing_players_count | INTEGER | NULLABLE |  |
| ngr_0_amount | NUMERIC | NULLABLE |  |


<details>
<summary><b>View SQL Query</b> (click to expand)</summary>

```sql
-- View: Trade Desk Affilka Union (Platin + Tycoon)
-- BigQuery View: Trade Desk Affilka Union (Platin + Tycoon)
-- Combines data from both mkt_platin and mkt_tycoon tables with Trade Desk partner IDs
SELECT 
  date,
  partner_id,
  dynamic_tag_utm_campaign AS utm_campaign,
  campaign_name AS campaign_name_custom,
  
  -- Casino GGR (Gross Gaming Revenue)
  ggr_amount AS casino_ggr,
  
  -- Casino NGR (Net Gaming Revenue) 
  ngr_amount AS casino_ngr,
  
  -- Registration count as REGs
  registrations_count AS regs,
  
  -- First deposit count as FTDs
  first_deposits_count AS ftds,
  
  -- Deposit count
  deposits_count AS deps,
  
  -- Deposit sum
  deposits_sum_amount AS deposit_sum,
  
  -- NGR components
  real_ngr_amount,
  sb_real_ngr_amount,
  admin_fee_amount,
  sb_admin_fee_amount,
  
  -- First deposit day for attribution analysis
  first_deposit_day,
  
  -- Depositing players count for cohort analysis
  depositing_players_count,
  
  -- NGR [0] - NGR only for first month (when first_deposit_day month = date month)
  CASE 
    WHEN first_deposit_day IS NOT NULL 
         AND EXTRACT(MONTH FROM first_deposit_day) = EXTRACT(MONTH FROM date)
         AND EXTRACT(YEAR FROM first_deposit_day) = EXTRACT(YEAR FROM date)
    THEN real_ngr_amount + sb_real_ngr_amount + admin_fee_amount + sb_admin_fee_amount
    ELSE 0
  END AS ngr_0_amount

FROM `level-hope-462409-a8.affilka.mkt_platin`
WHERE partner_id IN ("34641", "32690", "16145")  -- Trade Desk Platin partner IDs

UNION ALL

SELECT 
  date,
  partner_id,
  dynamic_tag_utm_campaign AS utm_campaign,
  campaign_name AS campaign_name_custom,
  
  -- Casino GGR (Gross Gaming Revenue)
  ggr_amount AS casino_ggr,
  
  -- Casino NGR (Net Gaming Revenue)
  ngr_amount AS casino_ngr,
  
  -- Registration count as REGs
  registrations_count AS regs,
  
  -- First deposit count as FTDs
  first_deposits_count AS ftds,
  
  -- Deposit count
  deposits_count AS deps,
  
  -- Deposit sum
  deposits_sum_amount AS deposit_sum,
  
  -- NGR components
  real_ngr_amount,
  sb_real_ngr_amount,
  admin_fee_amount,
  sb_admin_fee_amount,
  
  -- First deposit day for attribution analysis
  first_deposit_day,
  
  -- Depositing players count for cohort analysis
  depositing_players_count,
  
  -- NGR [0] - NGR only for first month (when first_deposit_day month = date month)
  CASE 
    WHEN first_deposit_day IS NOT NULL 
         AND EXTRACT(MONTH FROM first_deposit_day) = EXTRACT(MONTH FROM date)
         AND EXTRACT(YEAR FROM first_deposit_day) = EXTRACT(YEAR FROM date)
    THEN real_ngr_amount + sb_real_ngr_amount + admin_fee_amount + sb_admin_fee_amount
    ELSE 0
  END AS ngr_0_amount

FROM `level-hope-462409-a8.affilka.mkt_tycoon`
WHERE partner_id IN ("34638", "32689", "31146", "16329", "16328", "16326", "16324", "16185")
```
</details>

---

## ga_analytics

**Location**: US
**Created**: 2025-09-19 08:39:18.184000+00:00
**Modified**: 2025-09-19 08:39:18.184000+00:00

**Tables**: 0 | **Views**: 1

### Views in ga_analytics

#### ga_analytics_union

**Full Name**: `level-hope-462409-a8.ga_analytics.ga_analytics_union`
**Created**: 2025-09-19 11:09:10.435000+00:00
**Modified**: 2025-10-23 11:07:53.556000+00:00

**Dependencies**: This view depends on 21 object(s):
- `level-hope-462409-a8.analytics_348995202.events_`
- `level-hope-462409-a8.analytics_348995202.events_*`
- `level-hope-462409-a8.analytics_377709600.events_`
- `level-hope-462409-a8.analytics_377709600.events_*`
- `level-hope-462409-a8.analytics_403066296.events_`
- `level-hope-462409-a8.analytics_403066296.events_*`
- `level-hope-462409-a8.analytics_421901040.events_`
- `level-hope-462409-a8.analytics_421901040.events_*`
- `level-hope-462409-a8.analytics_449298170.events_`
- `level-hope-462409-a8.analytics_449298170.events_*`
- `level-hope-462409-a8.analytics_469242368.events_`
- `level-hope-462409-a8.analytics_469242368.events_*`
- `level-hope-462409-a8.analytics_471243947.events_`
- `level-hope-462409-a8.analytics_471243947.events_*`
- `level-hope-462409-a8.level-hope-462409-a8.analytics_348995202`
- `level-hope-462409-a8.level-hope-462409-a8.analytics_377709600`
- `level-hope-462409-a8.level-hope-462409-a8.analytics_403066296`
- `level-hope-462409-a8.level-hope-462409-a8.analytics_421901040`
- `level-hope-462409-a8.level-hope-462409-a8.analytics_449298170`
- `level-hope-462409-a8.level-hope-462409-a8.analytics_469242368`
- `level-hope-462409-a8.level-hope-462409-a8.analytics_471243947`

**Schema**:

| Column Name | Type | Mode | Description |
|-------------|------|------|-------------|
| property_id | STRING | NULLABLE |  |
| brand | STRING | NULLABLE |  |
| event_date | STRING | NULLABLE |  |
| parsed_date | DATE | NULLABLE |  |
| event_name | STRING | NULLABLE |  |
| joined_timestamp | TIMESTAMP | NULLABLE |  |
| page_referrer | STRING | NULLABLE |  |
| session_engaged | STRING | NULLABLE |  |
| page_title | STRING | NULLABLE |  |
| page_location | STRING | NULLABLE |  |
| utm_source | STRING | NULLABLE |  |
| utm_medium | STRING | NULLABLE |  |
| utm_campaign | STRING | NULLABLE |  |
| utm_term | STRING | NULLABLE |  |
| utm_content | STRING | NULLABLE |  |
| fbp | STRING | NULLABLE |  |
| fbc | STRING | NULLABLE |  |
| tdid | STRING | NULLABLE |  |
| session_engaged_param | STRING | NULLABLE |  |
| currency | STRING | NULLABLE |  |
| transaction_id | STRING | NULLABLE |  |
| device_category | STRING | NULLABLE |  |
| device_operating_system | STRING | NULLABLE |  |
| deposit_count | INTEGER | NULLABLE |  |
| ga_session_number | INTEGER | NULLABLE |  |
| ga_session_id | INTEGER | NULLABLE |  |
| userID | INTEGER | NULLABLE |  |
| value | INTEGER | NULLABLE |  |
| affiliate_id | INTEGER | NULLABLE |  |
| deposit_payment_system_name | STRING | NULLABLE |  |
| is_ftd | STRING | NULLABLE |  |
| ptc_short_affiliate_id | INTEGER | NULLABLE |  |
| event_origin | STRING | NULLABLE |  |
| timestamp | STRING | NULLABLE |  |
| device_language | STRING | NULLABLE |  |
| geo | STRING | NULLABLE |  |


<details>
<summary><b>View SQL Query</b> (click to expand)</summary>

```sql
-- BigQuery View: GA4 All Properties Union with All Event Parameters
-- Combines data from all 7 GA4 properties and extracts all event_params as columns
WITH ga4_all_properties AS (
  -- Property 1: analytics_377709600
  SELECT 
    'analytics_377709600' AS property_id,
    'pc' AS brand,
    event_date,
    event_name,
    TIMESTAMP_MICROS(event_timestamp) AS event_timestamp,
    geo.country,
    device.language AS device_language,
    
    -- Core Page Parameters
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_referrer') AS page_referrer,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'session_engaged') AS session_engaged,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_title') AS page_title,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location') AS page_location,
    
    -- UTM Parameters
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'utm_source') AS utm_source,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'utm_medium') AS utm_medium,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'utm_campaign') AS utm_campaign,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'utm_term') AS utm_term,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'utm_content') AS utm_content,

    -- Ad Network Params
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'fbp') AS fbp,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'fbc') AS fbc,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'tdid') AS tdid,
    
    -- Engagement Parameters (String values)
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'session_engaged') AS session_engaged_param,
    
    -- E-commerce Parameters
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'currency') AS currency,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'transaction_id') AS transaction_id,
    
    -- Device Parameters
    device.category AS device_category,
    device.operating_system AS device_operating_system,
    
    -- Session and Engagement (Integer values)
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'deposit_count') AS deposit_count,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_number') AS ga_session_number,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS ga_session_id,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'userID') AS userID,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'value') AS value,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'affiliate_id') AS affiliate_id,
    
    -- Geographic and Language
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'country_code') AS country_code,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'language_code') AS language_code,
    
    -- Customer and Deposit Information
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'customer_type') AS customer_type,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'deposit_payment_system_name') AS deposit_payment_system_name,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'is_ftd') AS is_ftd,
    
    -- Affiliate Information
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ptc_short_affiliate_id') AS ptc_short_affiliate_id,
    
    -- Event Origin and Timestamp
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'event_origin') AS event_origin,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'timestamp') AS timestamp
  FROM `level-hope-462409-a8.analytics_377709600.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20240101' AND '20301231'

  UNION ALL

  -- Property 2: analytics_403066296
  SELECT 
    'analytics_403066296' AS property_id,
    'bp' AS brand,
    event_date,
    event_name,
    TIMESTAMP_MICROS(event_timestamp) AS event_timestamp,
    geo.country,
    device.language AS device_language,
    
    -- Core Page Parameters
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_referrer') AS page_referrer,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'session_engaged') AS session_engaged,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_title') AS page_title,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location') AS page_location,
    
    -- UTM Parameters
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'utm_source') AS utm_source,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'utm_medium') AS utm_medium,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'utm_campaign') AS utm_campaign,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'utm_term') AS utm_term,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'utm_content') AS utm_content,

    -- Ad Network Params
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'fbp') AS fbp,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'fbc') AS fbc,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'tdid') AS tdid,
    
    -- Engagement Parameters (String values)
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'session_engaged') AS session_engaged_param,
    
    -- E-commerce Parameters
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'currency') AS currency,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'transaction_id') AS transaction_id,
    
    -- Device Parameters
    device.category AS device_category,
    device.operating_system AS device_operating_system,
    
    -- Session and Engagement (Integer values)
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'deposit_count') AS deposit_count,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_number') AS ga_session_number,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS ga_session_id,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'userID') AS userID,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'value') AS value,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'affiliate_id') AS affiliate_id,
    
    -- Geographic and Language
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'country_code') AS country_code,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'language_code') AS language_code,
    
    -- Customer and Deposit Information
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'customer_type') AS customer_type,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'deposit_payment_system_name') AS deposit_payment_system_name,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'is_ftd') AS is_ftd,
    
    -- Affiliate Information
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ptc_short_affiliate_id') AS ptc_short_affiliate_id,
    
    -- Event Origin and Timestamp
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'event_origin') AS event_origin,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'timestamp') AS timestamp
  FROM `level-hope-462409-a8.analytics_403066296.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20240101' AND '20301231'

  UNION ALL

  -- Property 3: analytics_449298170
  SELECT 
    'analytics_449298170' AS property_id,
    'lc' AS brand,
    event_date,
    event_name,
    TIMESTAMP_MICROS(event_timestamp) AS event_timestamp,
    geo.country,
    device.language AS device_language,
    
    -- Core Page Parameters
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_referrer') AS page_referrer,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'session_engaged') AS session_engaged,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_title') AS page_title,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location') AS page_location,
    
    -- UTM Parameters
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'utm_source') AS utm_source,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'utm_medium') AS utm_medium,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'utm_campaign') AS utm_campaign,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'utm_term') AS utm_term,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'utm_content') AS utm_content,

    -- Ad Network Params
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'fbp') AS fbp,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'fbc') AS fbc,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'tdid') AS tdid,
    
    -- Engagement Parameters (String values)
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'session_engaged') AS session_engaged_param,
    
    -- E-commerce Parameters
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'currency') AS currency,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'transaction_id') AS transaction_id,
    
    -- Device Parameters
    device.category AS device_category,
    device.operating_system AS device_operating_system,
    
    -- Session and Engagement (Integer values)
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'deposit_count') AS deposit_count,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_number') AS ga_session_number,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS ga_session_id,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'userID') AS userID,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'value') AS value,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'affiliate_id') AS affiliate_id,
    
    -- Geographic and Language
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'country_code') AS country_code,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'language_code') AS language_code,
    
    -- Customer and Deposit Information
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'customer_type') AS customer_type,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'deposit_payment_system_name') AS deposit_payment_system_name,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'is_ftd') AS is_ftd,
    
    -- Affiliate Information
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ptc_short_affiliate_id') AS ptc_short_affiliate_id,
    
    -- Event Origin and Timestamp
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'event_origin') AS event_origin,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'timestamp') AS timestamp
  FROM `level-hope-462409-a8.analytics_449298170.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20240101' AND '20301231'

  UNION ALL

  -- Property 4: analytics_471243947
  SELECT 
    'analytics_471243947' AS property_id,
    'ps' AS brand,
    event_date,
    event_name,
    TIMESTAMP_MICROS(event_timestamp) AS event_timestamp,
    geo.country,
    device.language AS device_language,
    
    -- Core Page Parameters
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_referrer') AS page_referrer,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'session_engaged') AS session_engaged,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_title') AS page_title,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location') AS page_location,
    
    -- UTM Parameters
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'utm_source') AS utm_source,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'utm_medium') AS utm_medium,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'utm_campaign') AS utm_campaign,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'utm_term') AS utm_term,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'utm_content') AS utm_content,

    -- Ad Network Params
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'fbp') AS fbp,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'fbc') AS fbc,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'tdid') AS tdid,
    
    -- Engagement Parameters (String values)
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'session_engaged') AS session_engaged_param,
    
    -- E-commerce Parameters
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'currency') AS currency,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'transaction_id') AS transaction_id,
    
    -- Device Parameters
    device.category AS device_category,
    device.operating_system AS device_operating_system,
    
    -- Session and Engagement (Integer values)
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'deposit_count') AS deposit_count,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_number') AS ga_session_number,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS ga_session_id,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'userID') AS userID,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'value') AS value,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'affiliate_id') AS affiliate_id,
    
    -- Geographic and Language
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'country_code') AS country_code,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'language_code') AS language_code,
    
    -- Customer and Deposit Information
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'customer_type') AS customer_type,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'deposit_payment_system_name') AS deposit_payment_system_name,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'is_ftd') AS is_ftd,
    
    -- Affiliate Information
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ptc_short_affiliate_id') AS ptc_short_affiliate_id,
    
    -- Event Origin and Timestamp
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'event_origin') AS event_origin,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'timestamp') AS timestamp
  FROM `level-hope-462409-a8.analytics_471243947.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20240101' AND '20301231'

  UNION ALL

  -- Property 5: analytics_348995202
  SELECT 
    'analytics_348995202' AS property_id,
    'sf' AS brand,
    event_date,
    event_name,
    TIMESTAMP_MICROS(event_timestamp) AS event_timestamp,
    geo.country,
    device.language AS device_language,
    
    -- Core Page Parameters
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_referrer') AS page_referrer,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'session_engaged') AS session_engaged,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_title') AS page_title,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location') AS page_location,
    
    -- UTM Parameters
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'utm_source') AS utm_source,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'utm_medium') AS utm_medium,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'utm_campaign') AS utm_campaign,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'utm_term') AS utm_term,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'utm_content') AS utm_content,

    -- Ad Network Params
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'fbp') AS fbp,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'fbc') AS fbc,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'tdid') AS tdid,
    
    -- Engagement Parameters (String values)
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'session_engaged') AS session_engaged_param,
    
    -- E-commerce Parameters
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'currency') AS currency,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'transaction_id') AS transaction_id,
    
    -- Device Parameters
    device.category AS device_category,
    device.operating_system AS device_operating_system,
    
    -- Session and Engagement (Integer values)
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'deposit_count') AS deposit_count,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_number') AS ga_session_number,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS ga_session_id,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'userID') AS userID,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'value') AS value,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'affiliate_id') AS affiliate_id,
    
    -- Geographic and Language
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'country_code') AS country_code,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'language_code') AS language_code,
    
    -- Customer and Deposit Information
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'customer_type') AS customer_type,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'deposit_payment_system_name') AS deposit_payment_system_name,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'is_ftd') AS is_ftd,
    
    -- Affiliate Information
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ptc_short_affiliate_id') AS ptc_short_affiliate_id,
    
    -- Event Origin and Timestamp
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'event_origin') AS event_origin,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'timestamp') AS timestamp
  FROM `level-hope-462409-a8.analytics_348995202.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20240101' AND '20301231'

  UNION ALL

  -- Property 6: analytics_421901040
  SELECT 
    'analytics_421901040' AS property_id,
    'rl' AS brand,
    event_date,
    event_name,
    TIMESTAMP_MICROS(event_timestamp) AS event_timestamp,
    geo.country,
    device.language AS device_language,
    
    -- Core Page Parameters
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_referrer') AS page_referrer,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'session_engaged') AS session_engaged,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_title') AS page_title,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location') AS page_location,
    
    -- UTM Parameters
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'utm_source') AS utm_source,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'utm_medium') AS utm_medium,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'utm_campaign') AS utm_campaign,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'utm_term') AS utm_term,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'utm_content') AS utm_content,

    -- Ad Network Params
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'fbp') AS fbp,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'fbc') AS fbc,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'tdid') AS tdid,
    
    -- Engagement Parameters (String values)
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'session_engaged') AS session_engaged_param,
    
    -- E-commerce Parameters
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'currency') AS currency,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'transaction_id') AS transaction_id,
    
    -- Device Parameters
    device.category AS device_category,
    device.operating_system AS device_operating_system,
    
    -- Session and Engagement (Integer values)
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'deposit_count') AS deposit_count,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_number') AS ga_session_number,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS ga_session_id,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'userID') AS userID,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'value') AS value,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'affiliate_id') AS affiliate_id,
    
    -- Geographic and Language
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'country_code') AS country_code,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'language_code') AS language_code,
    
    -- Customer and Deposit Information
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'customer_type') AS customer_type,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'deposit_payment_system_name') AS deposit_payment_system_name,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'is_ftd') AS is_ftd,
    
    -- Affiliate Information
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ptc_short_affiliate_id') AS ptc_short_affiliate_id,
    
    -- Event Origin and Timestamp
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'event_origin') AS event_origin,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'timestamp') AS timestamp
  FROM `level-hope-462409-a8.analytics_421901040.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20240101' AND '20301231'

  UNION ALL

  -- Property 7: analytics_469242368
  SELECT 
    'analytics_469242368' AS property_id,
    'ff' AS brand,
    event_date,
    event_name,
    TIMESTAMP_MICROS(event_timestamp) AS event_timestamp,
    geo.country,
    device.language AS device_language,
    
    -- Core Page Parameters
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_referrer') AS page_referrer,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'session_engaged') AS session_engaged,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_title') AS page_title,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location') AS page_location,
    
    -- UTM Parameters
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'utm_source') AS utm_source,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'utm_medium') AS utm_medium,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'utm_campaign') AS utm_campaign,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'utm_term') AS utm_term,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'utm_content') AS utm_content,

    -- Ad Network Params
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'fbp') AS fbp,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'fbc') AS fbc,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'tdid') AS tdid,
    
    -- Engagement Parameters (String values)
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'session_engaged') AS session_engaged_param,
    
    -- E-commerce Parameters
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'currency') AS currency,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'transaction_id') AS transaction_id,
    
    -- Device Parameters
    device.category AS device_category,
    device.operating_system AS device_operating_system,
    
    -- Session and Engagement (Integer values)
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'deposit_count') AS deposit_count,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_number') AS ga_session_number,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS ga_session_id,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'userID') AS userID,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'value') AS value,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'affiliate_id') AS affiliate_id,
    
    -- Geographic and Language
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'country_code') AS country_code,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'language_code') AS language_code,
    
    -- Customer and Deposit Information
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'customer_type') AS customer_type,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'deposit_payment_system_name') AS deposit_payment_system_name,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'is_ftd') AS is_ftd,
    
    -- Affiliate Information
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ptc_short_affiliate_id') AS ptc_short_affiliate_id,
    
    -- Event Origin and Timestamp
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'event_origin') AS event_origin,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'timestamp') AS timestamp
  FROM `level-hope-462409-a8.analytics_469242368.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20240101' AND '20301231'
)

SELECT 
  property_id,
  brand,
  event_date,
  PARSE_DATE('%Y%m%d', event_date) AS parsed_date,
  event_name,

  CASE
    WHEN event_origin = 'softswiss s2s' 
      THEN TIMESTAMP(timestamp)         -- Convert ISO 8601 string to TIMESTAMP
    ELSE TIMESTAMP(event_timestamp)     -- Already a TIMESTAMP, but this keeps types uniform
  END AS joined_timestamp,
  
  -- Core Page Parameters
  page_referrer,
  session_engaged,
  page_title,
  page_location,
  
  -- UTM Parameters (with fallback to page_location URL parameters)
  COALESCE(
    NULLIF(utm_source, ''),
    REGEXP_EXTRACT(page_location, r'[?&]utm_source=([^&]+)')
  ) AS utm_source,
  COALESCE(
    NULLIF(utm_medium, ''),
    REGEXP_EXTRACT(page_location, r'[?&]utm_medium=([^&]+)')
  ) AS utm_medium,
  COALESCE(
    NULLIF(utm_campaign, ''),
    REGEXP_EXTRACT(page_location, r'[?&]utm_campaign=([^&]+)')
  ) AS utm_campaign,
  COALESCE(
    NULLIF(utm_term, ''),
    REGEXP_EXTRACT(page_location, r'[?&]utm_term=([^&]+)')
  ) AS utm_term,
  COALESCE(
    NULLIF(utm_content, ''),
    REGEXP_EXTRACT(page_location, r'[?&]utm_content=([^&]+)')
  ) AS utm_content,

    -- Ad Network Params
  fbp,
  fbc,
  tdid,
  
  -- Engagement Parameters
  session_engaged_param,
  
  -- E-commerce Parameters
  currency,
  transaction_id,
  
  -- Device Parameters
  device_category,
  device_operating_system,
  
  -- Session and Engagement (Integer values)
  deposit_count,
  ga_session_number,
  ga_session_id,
  userID,
  value,
  affiliate_id,
  
  -- Customer and Deposit Information
  deposit_payment_system_name,
  is_ftd,
  
  -- Affiliate Information
  ptc_short_affiliate_id,
  
  -- Event Origin and Timestamp
  event_origin,
  timestamp,

  CASE 
    WHEN event_origin = 'softswiss s2s' 
      THEN LOWER(language_code)
    ELSE LOWER(device_language) END AS device_language,
  
  -- Geo field based on event_origin (mapped once at the end)
  CASE 
    WHEN event_origin = 'softswiss s2s' 
      THEN LOWER(country_code)
    WHEN event_origin IS NULL OR event_origin = ''
      THEN 
        CASE 
          WHEN LOWER(COALESCE(country, '')) = 'united arab emirates' THEN 'ae'
          WHEN LOWER(country) = 'afghanistan' THEN 'af'
          WHEN LOWER(country) = 'albania' THEN 'al'
          WHEN LOWER(country) = 'angola' THEN 'ao'
          WHEN LOWER(country) = 'argentina' THEN 'ar'
          WHEN LOWER(country) = 'austria' THEN 'at'
          WHEN LOWER(country) = 'australia' THEN 'au'
          WHEN LOWER(country) = 'bosnia and herzegovina' THEN 'ba'
          WHEN LOWER(country) = 'bangladesh' THEN 'bd'
          WHEN LOWER(country) = 'bahrain' THEN 'bh'
          WHEN LOWER(country) = 'bolivia' THEN 'bo'
          WHEN LOWER(country) = 'canada' THEN 'ca'
          WHEN LOWER(country) = 'switzerland' THEN 'ch'
          WHEN LOWER(country) = 'chile' THEN 'cl'
          WHEN LOWER(country) = 'czech republic' OR LOWER(country) = 'czechia' THEN 'cz'
          WHEN LOWER(country) = 'germany' THEN 'de'
          WHEN LOWER(country) = 'denmark' THEN 'dk'
          WHEN LOWER(country) = 'egypt' THEN 'eg'
          WHEN LOWER(country) = 'finland' THEN 'fi'
          WHEN LOWER(country) = 'greenland' THEN 'gl'
          WHEN LOWER(country) = 'guatemala' THEN 'gt'
          WHEN LOWER(country) = 'hungary' THEN 'hu'
          WHEN LOWER(country) = 'ireland' THEN 'ie'
          WHEN LOWER(country) = 'israel' THEN 'il'
          WHEN LOWER(country) = 'india' THEN 'in'
          WHEN LOWER(country) = 'iraq' THEN 'iq'
          WHEN LOWER(country) = 'iran' THEN 'ir'
          WHEN LOWER(country) = 'italy' THEN 'it'
          WHEN LOWER(country) = 'jordan' THEN 'jo'
          WHEN LOWER(country) = 'kuwait' THEN 'kw'
          WHEN LOWER(country) = 'luxembourg' THEN 'lu'
          WHEN LOWER(country) = 'latvia' THEN 'lv'
          WHEN LOWER(country) = 'morocco' THEN 'ma'
          WHEN LOWER(country) = 'malta' THEN 'mt'
          WHEN LOWER(country) = 'mexico' THEN 'mx'
          WHEN LOWER(country) = 'nigeria' THEN 'ng'
          WHEN LOWER(country) = 'norway' THEN 'no'
          WHEN LOWER(country) = 'nepal' THEN 'np'
          WHEN LOWER(country) = 'new zealand' THEN 'nz'
          WHEN LOWER(country) = 'oman' THEN 'om'
          WHEN LOWER(country) = 'peru' THEN 'pe'
          WHEN LOWER(country) = 'philippines' THEN 'ph'
          WHEN LOWER(country) = 'pakistan' THEN 'pk'
          WHEN LOWER(country) = 'qatar' THEN 'qa'
          WHEN LOWER(country) = 'romania' THEN 'ro'
          WHEN LOWER(country) = 'russia' THEN 'ru'
          WHEN LOWER(country) = 'rwanda' THEN 'rw'
          WHEN LOWER(country) = 'saudi arabia' THEN 'sa'
          WHEN LOWER(country) = 'sudan' THEN 'sd'
          WHEN LOWER(country) = 'sweden' THEN 'se'
          WHEN LOWER(country) = 'united states' OR LOWER(country) = 'usa' THEN 'us'
          WHEN LOWER(country) = 'united kingdom' OR LOWER(country) = 'uk' THEN 'gb'
          WHEN LOWER(country) = 'france' THEN 'fr'
          WHEN LOWER(country) = 'spain' THEN 'es'
          WHEN LOWER(country) = 'netherlands' THEN 'nl'
          WHEN LOWER(country) = 'belgium' THEN 'be'
          WHEN LOWER(country) = 'poland' THEN 'pl'
          WHEN LOWER(country) = 'portugal' THEN 'pt'
          WHEN LOWER(country) = 'greece' THEN 'gr'
          WHEN LOWER(country) = 'turkey' THEN 'tr'
          WHEN LOWER(country) = 'ukraine' THEN 'ua'
          WHEN LOWER(country) = 'brazil' THEN 'br'
          WHEN LOWER(country) = 'colombia' THEN 'co'
          WHEN LOWER(country) = 'venezuela' THEN 've'
          WHEN LOWER(country) = 'ecuador' THEN 'ec'
          WHEN LOWER(country) = 'uruguay' THEN 'uy'
          WHEN LOWER(country) = 'paraguay' THEN 'py'
          WHEN LOWER(country) = 'japan' THEN 'jp'
          WHEN LOWER(country) = 'south korea' THEN 'kr'
          WHEN LOWER(country) = 'china' THEN 'cn'
          WHEN LOWER(country) = 'thailand' THEN 'th'
          WHEN LOWER(country) = 'vietnam' THEN 'vn'
          WHEN LOWER(country) = 'indonesia' THEN 'id'
          WHEN LOWER(country) = 'malaysia' THEN 'my'
          WHEN LOWER(country) = 'singapore' THEN 'sg'
          WHEN LOWER(country) = 'south africa' THEN 'za'
          WHEN LOWER(country) = 'kenya' THEN 'ke'
          WHEN LOWER(country) = 'ghana' THEN 'gh'
          WHEN LOWER(country) = 'tanzania' THEN 'tz'
          WHEN LOWER(country) = 'uganda' THEN 'ug'
          WHEN LOWER(country) = 'ethiopia' THEN 'et'
          WHEN LOWER(country) = 'algeria' THEN 'dz'
          WHEN LOWER(country) = 'tunisia' THEN 'tn'
          WHEN LOWER(country) = 'libya' THEN 'ly'
          WHEN LOWER(country) = 'lebanon' THEN 'lb'
          WHEN LOWER(country) = 'syria' THEN 'sy'
          WHEN LOWER(country) = 'yemen' THEN 'ye'
          WHEN LOWER(country) = 'palestine' THEN 'ps'
          WHEN LOWER(country) = 'cyprus' THEN 'cy'
          WHEN LOWER(country) = 'estonia' THEN 'ee'
          WHEN LOWER(country) = 'lithuania' THEN 'lt'
          WHEN LOWER(country) = 'slovenia' THEN 'si'
          WHEN LOWER(country) = 'slovakia' THEN 'sk'
          WHEN LOWER(country) = 'croatia' THEN 'hr'
          WHEN LOWER(country) = 'serbia' THEN 'rs'
          WHEN LOWER(country) = 'montenegro' THEN 'me'
          WHEN LOWER(country) = 'macedonia' THEN 'mk'
          WHEN LOWER(country) = 'bulgaria' THEN 'bg'
          WHEN LOWER(country) = 'moldova' THEN 'md'
          WHEN LOWER(country) = 'belarus' THEN 'by'
          WHEN LOWER(country) = 'kazakhstan' THEN 'kz'
          WHEN LOWER(country) = 'uzbekistan' THEN 'uz'
          WHEN LOWER(country) = 'kyrgyzstan' THEN 'kg'
          WHEN LOWER(country) = 'tajikistan' THEN 'tj'
          WHEN LOWER(country) = 'turkmenistan' THEN 'tm'
          WHEN LOWER(country) = 'azerbaijan' THEN 'az'
          WHEN LOWER(country) = 'armenia' THEN 'am'
          WHEN LOWER(country) = 'georgia' THEN 'ge'
          WHEN LOWER(country) = 'mongolia' THEN 'mn'
          WHEN LOWER(country) = 'north korea' THEN 'kp'
          WHEN LOWER(country) = 'taiwan' THEN 'tw'
          WHEN LOWER(country) = 'hong kong' THEN 'hk'
          WHEN LOWER(country) = 'macau' THEN 'mo'
          WHEN LOWER(country) = 'myanmar' THEN 'mm'
          WHEN LOWER(country) = 'laos' THEN 'la'
          WHEN LOWER(country) = 'cambodia' THEN 'kh'
          WHEN LOWER(country) = 'brunei' THEN 'bn'
          WHEN LOWER(country) = 'east timor' THEN 'tl'
          WHEN LOWER(country) = 'papua new guinea' THEN 'pg'
          WHEN LOWER(country) = 'fiji' THEN 'fj'
          WHEN LOWER(country) = 'samoa' THEN 'ws'
          WHEN LOWER(country) = 'tonga' THEN 'to'
          WHEN LOWER(country) = 'vanuatu' THEN 'vu'
          WHEN LOWER(country) = 'solomon islands' THEN 'sb'
          WHEN LOWER(country) = 'palau' THEN 'pw'
          WHEN LOWER(country) = 'marshall islands' THEN 'mh'
          WHEN LOWER(country) = 'micronesia' THEN 'fm'
          WHEN LOWER(country) = 'kiribati' THEN 'ki'
          WHEN LOWER(country) = 'nauru' THEN 'nr'
          WHEN LOWER(country) = 'tuvalu' THEN 'tv'
          ELSE LOWER(country)
        END
    ELSE LOWER(country)
  END AS geo

FROM ga4_all_properties
ORDER BY property_id, event_date DESC, event_timestamp DESC
```
</details>

---

## mkt_channels

**Location**: US
**Created**: 2025-09-12 08:37:10.475000+00:00
**Modified**: 2025-09-12 08:37:10.475000+00:00

**Tables**: 8 | **Views**: 3

### Tables in mkt_channels

#### exo_stats

**Full Name**: `level-hope-462409-a8.mkt_channels.exo_stats`
**Rows**: 18,534
**Size**: 12.31 MB
**Created**: 2025-09-24 11:43:03.923000+00:00
**Modified**: 2025-10-11 18:01:24.814000+00:00

**Schema**:

| Column Name | Type | Mode | Description |
|-------------|------|------|-------------|
| date | DATE | REQUIRED |  |
| campaign_id | STRING | REQUIRED |  |
| campaign_name | STRING | NULLABLE |  |
| site_id | STRING | REQUIRED |  |
| site_name | STRING | NULLABLE |  |
| site_hostname | STRING | NULLABLE |  |
| variation_id | STRING | NULLABLE |  |
| variation_name | STRING | NULLABLE |  |
| variation_url | STRING | NULLABLE |  |
| impressions | INTEGER | NULLABLE |  |
| clicks | INTEGER | NULLABLE |  |
| goals | INTEGER | NULLABLE |  |
| conversion_value | FLOAT | NULLABLE |  |
| cost | FLOAT | NULLABLE |  |
| retrieved_at | TIMESTAMP | REQUIRED |  |
| goals_breakdown | RECORD | REPEATED |  |
|   ↳ goal_id | STRING | NULLABLE |  |
|   ↳ goal_name | STRING | NULLABLE |  |
|   ↳ conversions | INTEGER | NULLABLE |  |
|   ↳ conversion_value | FLOAT | NULLABLE |  |

---

#### meta_changelog

**Full Name**: `level-hope-462409-a8.mkt_channels.meta_changelog`
**Rows**: 715
**Size**: 264.58 KB
**Created**: 2025-09-25 08:21:53.990000+00:00
**Modified**: 2025-10-27 12:03:25.882000+00:00

**Schema**:

| Column Name | Type | Mode | Description |
|-------------|------|------|-------------|
| account_id | STRING | NULLABLE |  |
| referrer_domain | STRING | NULLABLE |  |
| ad_account_id | STRING | NULLABLE |  |
| retrieved_at | TIMESTAMP | REQUIRED |  |
| event_time | STRING | NULLABLE |  |
| event_type | STRING | NULLABLE |  |
| translated_event_type | STRING | NULLABLE |  |
| object_type | STRING | NULLABLE |  |
| object_id | STRING | NULLABLE |  |
| object_name | STRING | NULLABLE |  |
| actor_name | STRING | NULLABLE |  |
| application_name | STRING | NULLABLE |  |
| extra_data_json | STRING | NULLABLE |  |

---

#### meta_stats

**Full Name**: `level-hope-462409-a8.mkt_channels.meta_stats`
**Rows**: 23,200
**Size**: 429.29 MB
**Created**: 2025-09-23 13:36:53.592000+00:00
**Modified**: 2025-10-27 12:01:35.708000+00:00

**Schema**:

| Column Name | Type | Mode | Description |
|-------------|------|------|-------------|
| account_id | STRING | NULLABLE |  |
| retrieved_at | TIMESTAMP | NULLABLE |  |
| date_start | DATE | NULLABLE |  |
| campaign_name | STRING | NULLABLE |  |
| adset_name | STRING | NULLABLE |  |
| ad_name | STRING | NULLABLE |  |
| spend | NUMERIC | NULLABLE |  |
| impressions | NUMERIC | NULLABLE |  |
| clicks | NUMERIC | NULLABLE |  |
| frequency | NUMERIC | NULLABLE |  |
| reach | NUMERIC | NULLABLE |  |
| goals_breakdown | RECORD | REPEATED |  |
|   ↳ goal_name | STRING | NULLABLE |  |
|   ↳ window | STRING | NULLABLE |  |
|   ↳ conversions | INTEGER | NULLABLE |  |
|   ↳ conversion_value | FLOAT | NULLABLE |  |
| publisher_platform | STRING | NULLABLE |  |
| platform_position | STRING | NULLABLE |  |
| device_platform | STRING | NULLABLE |  |

---

#### meta_stats-2025-10-21T16_23_00

**Full Name**: `level-hope-462409-a8.mkt_channels.meta_stats-2025-10-21T16_23_00`
**Rows**: 4,005
**Size**: 47.25 MB
**Created**: 2025-10-21 14:23:18.963000+00:00
**Modified**: 2025-10-21 14:23:18.963000+00:00

**Schema**:

| Column Name | Type | Mode | Description |
|-------------|------|------|-------------|
| account_id | STRING | NULLABLE |  |
| retrieved_at | TIMESTAMP | NULLABLE |  |
| date_start | DATE | NULLABLE |  |
| campaign_name | STRING | NULLABLE |  |
| adset_name | STRING | NULLABLE |  |
| ad_name | STRING | NULLABLE |  |
| spend | NUMERIC | NULLABLE |  |
| impressions | NUMERIC | NULLABLE |  |
| clicks | NUMERIC | NULLABLE |  |
| frequency | NUMERIC | NULLABLE |  |
| reach | NUMERIC | NULLABLE |  |
| goals_breakdown | RECORD | REPEATED |  |
|   ↳ goal_name | STRING | NULLABLE |  |
|   ↳ window | STRING | NULLABLE |  |
|   ↳ conversions | INTEGER | NULLABLE |  |
|   ↳ conversion_value | FLOAT | NULLABLE |  |

---

#### meta_targeting

**Full Name**: `level-hope-462409-a8.mkt_channels.meta_targeting`
**Rows**: 251
**Size**: 461.68 KB
**Created**: 2025-10-03 12:20:20.844000+00:00
**Modified**: 2025-10-27 12:03:42.381000+00:00

**Schema**:

| Column Name | Type | Mode | Description |
|-------------|------|------|-------------|
| account_id | STRING | NULLABLE |  |
| referrer_domain | STRING | NULLABLE |  |
| ad_account_id | STRING | NULLABLE |  |
| retrieved_at | TIMESTAMP | REQUIRED |  |
| campaign_id | STRING | NULLABLE |  |
| campaign_name | STRING | NULLABLE |  |
| campaign_objective | STRING | NULLABLE |  |
| campaign_primary_attribution | STRING | NULLABLE |  |
| adset_id | STRING | NULLABLE |  |
| adset_name | STRING | NULLABLE |  |
| source_adset_id | STRING | NULLABLE |  |
| age_min | INTEGER | NULLABLE |  |
| age_max | INTEGER | NULLABLE |  |
| geo_countries | STRING | NULLABLE |  |
| geo_location_types | STRING | NULLABLE |  |
| custom_audiences | STRING | NULLABLE |  |
| excluded_custom_audiences | STRING | NULLABLE |  |
| publisher_platforms | STRING | NULLABLE |  |
| facebook_positions | STRING | NULLABLE |  |
| instagram_positions | STRING | NULLABLE |  |
| device_platforms | STRING | NULLABLE |  |
| messenger_positions | STRING | NULLABLE |  |
| audience_network_positions | STRING | NULLABLE |  |
| brand_safety_content_filter_levels | STRING | NULLABLE |  |
| advantage_audience | INTEGER | NULLABLE |  |
| targeting_automation_age | INTEGER | NULLABLE |  |
| targeting_automation_gender | INTEGER | NULLABLE |  |
| tsl_custom_audience | STRING | NULLABLE |  |
| tsl_excluding_custom_audience | STRING | NULLABLE |  |
| tsl_location | STRING | NULLABLE |  |
| tsl_age | STRING | NULLABLE |  |
| tsl_gender | STRING | NULLABLE |  |
| tsl_placements | STRING | NULLABLE |  |
| tsl_languages | STRING | NULLABLE |  |
| tsl_interests | STRING | NULLABLE |  |
| tsl_behaviors | STRING | NULLABLE |  |
| tsl_connections | STRING | NULLABLE |  |
| tsl_advantage_custom_audience | STRING | NULLABLE |  |
| tsl_advantage_audience | STRING | NULLABLE |  |
| tsl_other | STRING | NULLABLE |  |
| ads_json | STRING | NULLABLE |  |
| campaign_configured_status | STRING | NULLABLE |  |
| campaign_effective_status | STRING | NULLABLE |  |
| adset_configured_status | STRING | NULLABLE |  |
| adset_effective_status | STRING | NULLABLE |  |

---

#### tj_ad_stats

**Full Name**: `level-hope-462409-a8.mkt_channels.tj_ad_stats`
**Rows**: 34
**Size**: 9.44 KB
**Created**: 2025-09-30 12:45:44.204000+00:00
**Modified**: 2025-09-30 12:51:53.963000+00:00

**Schema**:

| Column Name | Type | Mode | Description |
|-------------|------|------|-------------|
| date | DATE | REQUIRED |  |
| campaign_id | STRING | REQUIRED |  |
| campaign_name | STRING | NULLABLE |  |
| ad_id | STRING | NULLABLE |  |
| ad_name | STRING | NULLABLE |  |
| target_url | STRING | NULLABLE |  |
| spot_id | STRING | NULLABLE |  |
| spot_name | STRING | NULLABLE |  |
| impressions | INTEGER | NULLABLE |  |
| clicks | INTEGER | NULLABLE |  |
| conversions | INTEGER | NULLABLE |  |
| revenue | FLOAT | NULLABLE |  |
| cost | FLOAT | NULLABLE |  |
| retrieved_at | TIMESTAMP | REQUIRED |  |

---

#### tj_campaign_stats

**Full Name**: `level-hope-462409-a8.mkt_channels.tj_campaign_stats`
**Rows**: 2,593
**Size**: 309.53 KB
**Created**: 2025-10-27 12:42:57.591000+00:00
**Modified**: 2025-10-27 13:36:51.073000+00:00

**Schema**:

| Column Name | Type | Mode | Description |
|-------------|------|------|-------------|
| date | DATE | NULLABLE |  |
| campaign_id | STRING | NULLABLE |  |
| campaign_name | STRING | NULLABLE |  |
| impressions | INTEGER | NULLABLE |  |
| clicks | INTEGER | NULLABLE |  |
| conversions | INTEGER | NULLABLE |  |
| revenue | FLOAT | NULLABLE |  |
| cost | FLOAT | NULLABLE |  |
| retrieved_at | TIMESTAMP | NULLABLE |  |

---

#### ts_stats_siteid

**Full Name**: `level-hope-462409-a8.mkt_channels.ts_stats_siteid`
**Rows**: 44
**Size**: 11.72 KB
**Created**: 2025-09-24 13:45:44.796000+00:00
**Modified**: 2025-09-24 14:08:35.219000+00:00

**Schema**:

| Column Name | Type | Mode | Description |
|-------------|------|------|-------------|
| date | DATE | REQUIRED |  |
| campaign_id | STRING | NULLABLE |  |
| campaign_name | STRING | NULLABLE |  |
| site_id | STRING | REQUIRED |  |
| site_name | STRING | NULLABLE |  |
| creative_url | STRING | NULLABLE |  |
| impressions | INTEGER | NULLABLE |  |
| clicks | INTEGER | NULLABLE |  |
| conversions | INTEGER | NULLABLE |  |
| cost | FLOAT | NULLABLE |  |
| retrieved_at | TIMESTAMP | REQUIRED |  |
| banner_id | STRING | NULLABLE |  |

---

### Views in mkt_channels

#### meta_stats_custom

**Full Name**: `level-hope-462409-a8.mkt_channels.meta_stats_custom`
**Created**: 2025-09-15 14:17:21.034000+00:00
**Modified**: 2025-10-22 06:54:21.672000+00:00

**Dependencies**: This view depends on 2 object(s):
- `level-hope-462409-a8.level-hope-462409-a8.mkt_channels`
- `level-hope-462409-a8.mkt_channels.meta_stats`

**Schema**:

| Column Name | Type | Mode | Description |
|-------------|------|------|-------------|
| date_start | DATE | NULLABLE |  |
| account_id | STRING | NULLABLE |  |
| adname_custom | STRING | NULLABLE |  |
| adset_name_custom | STRING | NULLABLE |  |
| campaign_name_custom | STRING | NULLABLE |  |
| spend | NUMERIC | NULLABLE |  |
| impressions | NUMERIC | NULLABLE |  |
| clicks | NUMERIC | NULLABLE |  |
| reach | NUMERIC | NULLABLE |  |
| frequency | NUMERIC | NULLABLE |  |
| publisher_platform | STRING | NULLABLE |  |
| platform_position | STRING | NULLABLE |  |
| device_platform | STRING | NULLABLE |  |
| brand | STRING | NULLABLE |  |
| purchaseplus_s2s_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_s2s_total | NUMERIC | NULLABLE |  |
| purchaseplus_1d_view_s2s_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_1d_view_s2s_total | NUMERIC | NULLABLE |  |
| purchaseplus_1d_click_s2s_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_1d_click_s2s_total | NUMERIC | NULLABLE |  |
| purchaseplus_1d_click_s2s_bp_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_1d_click_s2s_bp_total | NUMERIC | NULLABLE |  |
| purchaseplus_1d_click_s2s_pc_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_1d_click_s2s_pc_total | NUMERIC | NULLABLE |  |
| purchaseplus_1d_view_s2s_bp_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_1d_view_s2s_bp_total | NUMERIC | NULLABLE |  |
| purchaseplus_1d_view_s2s_pc_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_1d_view_s2s_pc_total | NUMERIC | NULLABLE |  |
| purchaseplus_7d_click_s2s_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_7d_click_s2s_total | NUMERIC | NULLABLE |  |
| purchaseplus_7d_click_s2s_bp_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_7d_click_s2s_bp_total | NUMERIC | NULLABLE |  |
| purchaseplus_7d_click_s2s_pc_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_7d_click_s2s_pc_total | NUMERIC | NULLABLE |  |
| purchaseplus_7d_view_s2s_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_7d_view_s2s_total | NUMERIC | NULLABLE |  |
| purchaseplus_7d_view_s2s_bp_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_7d_view_s2s_bp_total | NUMERIC | NULLABLE |  |
| purchaseplus_7d_view_s2s_pc_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_7d_view_s2s_pc_total | NUMERIC | NULLABLE |  |
| purchase_1d_click_s2s_total | NUMERIC | NULLABLE |  |
| purchase_val_1d_click_s2s_total | NUMERIC | NULLABLE |  |
| purchase_1d_click_s2s_bp_total | NUMERIC | NULLABLE |  |
| purchase_val_1d_click_s2s_bp_total | NUMERIC | NULLABLE |  |
| purchase_1d_click_s2s_pc_total | NUMERIC | NULLABLE |  |
| purchase_val_1d_click_s2s_pc_total | NUMERIC | NULLABLE |  |
| purchase_1d_view_s2s_total | NUMERIC | NULLABLE |  |
| purchase_val_1d_view_s2s_total | NUMERIC | NULLABLE |  |
| purchase_1d_view_s2s_bp_total | NUMERIC | NULLABLE |  |
| purchase_val_1d_view_s2s_bp_total | NUMERIC | NULLABLE |  |
| purchase_1d_view_s2s_pc_total | NUMERIC | NULLABLE |  |
| purchase_val_1d_view_s2s_pc_total | NUMERIC | NULLABLE |  |
| purchase_s2s_pc_total | NUMERIC | NULLABLE |  |
| purchase_val_s2s_pc_total | NUMERIC | NULLABLE |  |
| purchase_s2s_bp_total | NUMERIC | NULLABLE |  |
| purchase_val_s2s_bp_total | NUMERIC | NULLABLE |  |
| purchaseplus_s2s_bp_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_s2s_bp_total | NUMERIC | NULLABLE |  |
| purchaseplus_s2s_pc_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_s2s_pc_total | NUMERIC | NULLABLE |  |
| purchase_7d_click_1d_view_s2s_total | NUMERIC | NULLABLE |  |
| purchase_val_7d_click_1d_view_s2s_total | NUMERIC | NULLABLE |  |
| purchase_1d_click_1d_view_s2s_total | NUMERIC | NULLABLE |  |
| purchase_val_1d_click_1d_view_s2s_total | NUMERIC | NULLABLE |  |
| purchase_7d_click_1d_view_s2s_brand_total | NUMERIC | NULLABLE |  |
| purchase_val_7d_click_1d_view_s2s_brand_total | NUMERIC | NULLABLE |  |
| purchase_1d_click_1d_view_s2s_brand_total | NUMERIC | NULLABLE |  |
| purchase_val_1d_click_1d_view_s2s_brand_total | NUMERIC | NULLABLE |  |
| purchaseplus_7d_click_1d_view_s2s_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_7d_click_1d_view_s2s_total | NUMERIC | NULLABLE |  |
| purchaseplus_1d_click_1d_view_s2s_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_1d_click_1d_view_s2s_total | NUMERIC | NULLABLE |  |
| purchaseplus_7d_click_1d_view_first_conversion_s2s_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_7d_click_1d_view_first_conversion_s2s_total | NUMERIC | NULLABLE |  |
| purchaseplus_1d_click_1d_view_first_conversion_s2s_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_1d_click_1d_view_first_conversion_s2s_total | NUMERIC | NULLABLE |  |
| purchaseplus_7d_click_1d_view_s2s_brand_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_7d_click_1d_view_s2s_brand_total | NUMERIC | NULLABLE |  |
| purchaseplus_1d_click_1d_view_s2s_brand_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_1d_click_1d_view_s2s_brand_total | NUMERIC | NULLABLE |  |
| purchaseplus_7d_click_1d_view_first_conversion_s2s_brand_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_7d_click_1d_view_first_conversion_s2s_brand_total | NUMERIC | NULLABLE |  |
| purchaseplus_1d_click_1d_view_first_conversion_s2s_brand_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_1d_click_1d_view_first_conversion_s2s_brand_total | NUMERIC | NULLABLE |  |


<details>
<summary><b>View SQL Query</b> (click to expand)</summary>

```sql
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
  frequency,
  
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

FROM base_with_brand

```
</details>

---

#### pops_stats_custom

**Full Name**: `level-hope-462409-a8.mkt_channels.pops_stats_custom`
**Created**: 2025-09-16 12:13:09.646000+00:00
**Modified**: 2025-09-30 12:39:57.250000+00:00

**Dependencies**: This view depends on 9 object(s):
- `,
  (SELECT COALESCE(SUM(g.conversion_value), 0)
     FROM UNNEST(IFNULL(goals_breakdown, [])) AS g
     WHERE REGEXP_CONTAINS(LOWER(g.goal_name), r'^[a-z]{2,3}_deposit$')
  ) AS `
- `,
  (SELECT COALESCE(SUM(g.conversion_value), 0)
     FROM UNNEST(IFNULL(goals_breakdown, [])) AS g
     WHERE REGEXP_CONTAINS(LOWER(g.goal_name), r'^[a-z]{2,3}_first_deposit$')
  ) AS `
- `,
  (SELECT COALESCE(SUM(g.conversion_value), 0)
     FROM UNNEST(IFNULL(goals_breakdown, [])) AS g
     WHERE REGEXP_CONTAINS(LOWER(g.goal_name), r'^[a-z]{2,3}_registration_completed$')
  ) AS `
- `,
  (SELECT COALESCE(SUM(g.conversions), 0)
     FROM UNNEST(IFNULL(goals_breakdown, [])) AS g
     WHERE REGEXP_CONTAINS(LOWER(g.goal_name), r'^[a-z]{2,3}_deposit$')
  ) AS `
- `,
  (SELECT COALESCE(SUM(g.conversions), 0)
     FROM UNNEST(IFNULL(goals_breakdown, [])) AS g
     WHERE REGEXP_CONTAINS(LOWER(g.goal_name), r'^[a-z]{2,3}_registration_completed$')
  ) AS `
- `level-hope-462409-a8.level-hope-462409-a8.mkt_channels`
- `level-hope-462409-a8.mkt_channels.exo_stats`
- `level-hope-462409-a8.mkt_channels.tj_campaign_stats`
- `level-hope-462409-a8.mkt_channels.ts_stats_siteid`

**Schema**:

| Column Name | Type | Mode | Description |
|-------------|------|------|-------------|
| date | DATE | NULLABLE |  |
| channel | STRING | NULLABLE |  |
| campaign_id | STRING | NULLABLE |  |
| campaign_name | STRING | NULLABLE |  |
| impressions | INTEGER | NULLABLE |  |
| clicks | INTEGER | NULLABLE |  |
| conversions | INTEGER | NULLABLE |  |
| conversion_value | FLOAT | NULLABLE |  |
| spend | FLOAT | NULLABLE |  |
| retrieved_at | TIMESTAMP | NULLABLE |  |
| ftd-s2s | INTEGER | NULLABLE |  |
| deposit-s2s | INTEGER | NULLABLE |  |
| reg-s2s | INTEGER | NULLABLE |  |
| ftd-s2s_val | FLOAT | NULLABLE |  |
| deposit-s2s_val | FLOAT | NULLABLE |  |
| reg-s2s_val | FLOAT | NULLABLE |  |


<details>
<summary><b>View SQL Query</b> (click to expand)</summary>

```sql
-- BigQuery View: POPS Stats Custom Fields
-- Creates custom fields from exo_stats and tj_stats tables for Looker Studio compatibility
SELECT 
  date,
  'ExoClick' AS channel,
  campaign_id,
  campaign_name,
  impressions,
  clicks,
  goals AS conversions,
  conversion_value,
  cost AS spend,
  retrieved_at,
  -- S2S metrics derived from goals_breakdown
  (SELECT COALESCE(SUM(g.conversions), 0)
     FROM UNNEST(IFNULL(goals_breakdown, [])) AS g
     WHERE REGEXP_CONTAINS(LOWER(g.goal_name), r'^[a-z]{2,3}_first_deposit$')
  ) AS `ftd-s2s`,
  (SELECT COALESCE(SUM(g.conversions), 0)
     FROM UNNEST(IFNULL(goals_breakdown, [])) AS g
     WHERE REGEXP_CONTAINS(LOWER(g.goal_name), r'^[a-z]{2,3}_deposit$')
  ) AS `deposit-s2s`,
  (SELECT COALESCE(SUM(g.conversions), 0)
     FROM UNNEST(IFNULL(goals_breakdown, [])) AS g
     WHERE REGEXP_CONTAINS(LOWER(g.goal_name), r'^[a-z]{2,3}_registration_completed$')
  ) AS `reg-s2s`,
  (SELECT COALESCE(SUM(g.conversion_value), 0)
     FROM UNNEST(IFNULL(goals_breakdown, [])) AS g
     WHERE REGEXP_CONTAINS(LOWER(g.goal_name), r'^[a-z]{2,3}_first_deposit$')
  ) AS `ftd-s2s_val`,
  (SELECT COALESCE(SUM(g.conversion_value), 0)
     FROM UNNEST(IFNULL(goals_breakdown, [])) AS g
     WHERE REGEXP_CONTAINS(LOWER(g.goal_name), r'^[a-z]{2,3}_deposit$')
  ) AS `deposit-s2s_val`,
  (SELECT COALESCE(SUM(g.conversion_value), 0)
     FROM UNNEST(IFNULL(goals_breakdown, [])) AS g
     WHERE REGEXP_CONTAINS(LOWER(g.goal_name), r'^[a-z]{2,3}_registration_completed$')
  ) AS `reg-s2s_val`

FROM `level-hope-462409-a8.mkt_channels.exo_stats`

UNION ALL

SELECT 
  date,
  'TrafficJunky' AS channel,
  campaign_id,
  campaign_name,
  impressions,
  clicks,
  conversions,
  0 AS conversion_value,  -- TJ doesn't have conversion_value, set to 0
  cost AS spend,
  retrieved_at,
  0 AS `ftd-s2s`,
  0 AS `deposit-s2s`,
  0 AS `reg-s2s`,
  0.0 AS `ftd-s2s_val`,
  0.0 AS `deposit-s2s_val`,
  0.0 AS `reg-s2s_val`

FROM `level-hope-462409-a8.mkt_channels.tj_campaign_stats`

UNION ALL

SELECT 
  date,
  'TrafficStars' AS channel,
  campaign_id,
  campaign_name,
  impressions,
  clicks,
  conversions,
  0 AS conversion_value,  -- TS doesn't have conversion_value, set to 0
  cost AS spend,
  retrieved_at,
  0 AS `ftd-s2s`,
  0 AS `deposit-s2s`,
  0 AS `reg-s2s`,
  0.0 AS `ftd-s2s_val`,
  0.0 AS `deposit-s2s_val`,
  0.0 AS `reg-s2s_val`

FROM `level-hope-462409-a8.mkt_channels.ts_stats_siteid`
```
</details>

---

#### tradedesk_stats_custom

**Full Name**: `level-hope-462409-a8.mkt_channels.tradedesk_stats_custom`
**Created**: 2025-09-29 09:30:46.738000+00:00
**Modified**: 2025-10-09 12:33:13.556000+00:00

**Dependencies**: This view depends on 3 object(s):
- `level-hope-462409-a8.level-hope-462409-a8.tradedesk`
- `level-hope-462409-a8.tradedesk.ID41`
- `level-hope-462409-a8.tradedesk.ID42`

**Schema**:

| Column Name | Type | Mode | Description |
|-------------|------|------|-------------|
| date_start | DATE | NULLABLE |  |
| campaign_id | STRING | NULLABLE |  |
| campaign_name | STRING | NULLABLE |  |
| ad_group_id | STRING | NULLABLE |  |
| ad_group_name | STRING | NULLABLE |  |
| creative_id | STRING | NULLABLE |  |
| creative_name | STRING | NULLABLE |  |
| geo | STRING | NULLABLE |  |
| brand | STRING | NULLABLE |  |
| media_type | STRING | NULLABLE |  |
| strategy | STRING | NULLABLE |  |
| campaign_name_custom | STRING | NULLABLE |  |
| spend | FLOAT | NULLABLE |  |
| bids | INTEGER | NULLABLE |  |
| impressions | INTEGER | NULLABLE |  |
| clicks | INTEGER | NULLABLE |  |
| sampled_tracked_impressions | INTEGER | NULLABLE |  |
| sampled_viewed_impressions | INTEGER | NULLABLE |  |
| click_conversion_01 | INTEGER | NULLABLE |  |
| click_conversion_02 | INTEGER | NULLABLE |  |
| click_conversion_03 | INTEGER | NULLABLE |  |
| total_click_view_conversions_01 | INTEGER | NULLABLE |  |
| total_click_view_conversions_02 | INTEGER | NULLABLE |  |
| total_click_view_conversions_03 | INTEGER | NULLABLE |  |
| view_through_conversion_01 | INTEGER | NULLABLE |  |
| view_through_conversion_02 | INTEGER | NULLABLE |  |
| view_through_conversion_03 | INTEGER | NULLABLE |  |
| ctr | FLOAT | NULLABLE |  |
| cpc | FLOAT | NULLABLE |  |
| cpm | FLOAT | NULLABLE |  |
| total_impression_count | INTEGER | NULLABLE |  |
| total_display_click_count | INTEGER | NULLABLE |  |
| total_non_display_click_count | INTEGER | NULLABLE |  |
| default_conversions_click | INTEGER | NULLABLE |  |
| registration_conversions_click | INTEGER | NULLABLE |  |
| deposit_conversions_click | INTEGER | NULLABLE |  |
| first_deposit_conversions_click | INTEGER | NULLABLE |  |
| deposit_form_submitted_conversions_click | INTEGER | NULLABLE |  |
| default_conversions_view | INTEGER | NULLABLE |  |
| registration_conversions_view | INTEGER | NULLABLE |  |
| deposit_conversions_view | INTEGER | NULLABLE |  |
| first_deposit_conversions_view | INTEGER | NULLABLE |  |
| deposit_form_submitted_conversions_view | INTEGER | NULLABLE |  |
| default_conversions_1d_click | INTEGER | NULLABLE |  |
| registration_conversions_1d_click | INTEGER | NULLABLE |  |
| deposit_conversions_1d_click | INTEGER | NULLABLE |  |
| first_deposit_conversions_1d_click | INTEGER | NULLABLE |  |
| default_conversions_7d_click | INTEGER | NULLABLE |  |
| registration_conversions_7d_click | INTEGER | NULLABLE |  |
| deposit_conversions_7d_click | INTEGER | NULLABLE |  |
| first_deposit_conversions_7d_click | INTEGER | NULLABLE |  |
| default_conversions_1d_view | INTEGER | NULLABLE |  |
| registration_conversions_1d_view | INTEGER | NULLABLE |  |
| deposit_conversions_1d_view | INTEGER | NULLABLE |  |
| first_deposit_conversions_1d_view | INTEGER | NULLABLE |  |
| default_conversions_7d_view | INTEGER | NULLABLE |  |
| registration_conversions_7d_view | INTEGER | NULLABLE |  |
| deposit_conversions_7d_view | INTEGER | NULLABLE |  |
| first_deposit_conversions_7d_view | INTEGER | NULLABLE |  |
| default_conversions | INTEGER | NULLABLE |  |
| registration_conversions | INTEGER | NULLABLE |  |
| deposit_conversions | INTEGER | NULLABLE |  |
| first_deposit_conversions | INTEGER | NULLABLE |  |
| deposit_form_submitted_conversions | INTEGER | NULLABLE |  |
| total_conversions | INTEGER | NULLABLE |  |
| click_attributed_conversions | INTEGER | NULLABLE |  |
| view_through_conversions | INTEGER | NULLABLE |  |
| click_attributed_conversions_1d | INTEGER | NULLABLE |  |
| view_through_conversions_1d | INTEGER | NULLABLE |  |
| total_conversions_1d | INTEGER | NULLABLE |  |
| click_attributed_conversions_7d | INTEGER | NULLABLE |  |
| view_through_conversions_7d | INTEGER | NULLABLE |  |
| total_conversions_7d | INTEGER | NULLABLE |  |
| avg_click_to_conversion_hours | FLOAT | NULLABLE |  |


<details>
<summary><b>View SQL Query</b> (click to expand)</summary>

```sql
-- ============================================================================
-- BigQuery View: Trade Desk Stats Custom Fields
-- ============================================================================
-- 
-- PURPOSE:
-- Unified view combining Trade Desk performance metrics with detailed conversion
-- attribution data. Provides comprehensive campaign analytics with custom field
-- extractions and multi-attribution model support.
--
-- SOURCE TABLES:
-- 1. ID42: Performance metrics (spend, impressions, clicks)
--                            + aggregated conversion counts from Trade Desk
-- 2. ID41: Detailed conversion events with attribution paths
--                     (td1 = user ID, conversion_time = event timestamp)
--
-- DATA GRAIN:
-- Daily by Campaign ID / Ad Group ID / Creative ID
--
-- KEY FEATURES:
-- 1. Separate CTEs for different attribution models to prevent duplication:
--    - Click conversions: Groups by last_display_click_campaign/ad_group/creative
--    - View conversions: Groups by last_impression_campaign/ad_group/creative
--    - Uses FULL OUTER JOIN to capture all performance and conversion data
--
-- 2. Counts conversion EVENTS (td1 + conversion_time), not just unique users:
--    - Since td1 is a user ID and users can have multiple conversions,
--      we use CONCAT(COALESCE(td1, '_na_'), '|', conversion_time) as unique conversion identifier
--
-- 3. Provides conversion breakdowns by:
--    - Type: default, registration, deposit, first_deposit (from tracking_tag_name)
--    - Attribution: separate columns for click vs view attribution
--    - Totals: combined click + view totals for each conversion type
--
-- OUTPUT COLUMNS:
-- - Dimensions: date, campaign, ad_group, creative, geo, brand, strategy, etc.
-- - Performance: spend, impressions, clicks, CTR, CPC, CPM, bids
-- - ID42 Conversions (Trade Desk windows 01/02/03):
--   * click_conversion_01-03
--   * total_click_view_conversions_01-03
--   * view_through_conversion_01-03
-- - ID41 Click Attribution (all conversions regardless of window):
--   * default_conversions_click, registration_conversions_click, etc.
-- - ID41 View Attribution (all conversions regardless of window):
--   * default_conversions_view, registration_conversions_view, etc.
-- - ID41 1-Day Click Window (conversions ≤1 day after last_display_click):
--   * default_conversions_1d_click, registration_conversions_1d_click, etc.
-- - ID41 7-Day Click Window (conversions ≤7 days after last_display_click):
--   * default_conversions_7d_click, registration_conversions_7d_click, etc.
-- - ID41 1-Day View Window (conversions ≤1 day after last_impression):
--   * default_conversions_1d_view, registration_conversions_1d_view, etc.
-- - ID41 7-Day View Window (conversions ≤7 days after last_impression):
--   * default_conversions_7d_view, registration_conversions_7d_view, etc.
-- - ID41 Totals (sum of click + view):
--   * default_conversions, registration_conversions, deposit_conversions, first_deposit_conversions
-- - Attribution Summary:
--   * total_conversions (all conversion events)
--   * click_attributed_conversions, view_through_conversions
--   * click_attributed_conversions_1d, view_through_conversions_1d, total_conversions_1d
--   * click_attributed_conversions_7d, view_through_conversions_7d, total_conversions_7d
--
-- USE CASES:
-- - Campaign performance analysis with accurate spend/impression/click data
-- - Conversion attribution analysis (click vs view-through)
-- - Attribution window analysis (1-day vs 7-day lookback periods)
-- - Conversion funnel analysis (registration -> deposit -> first deposit)
-- - Multi-touch attribution reporting with time decay analysis
-- - Custom field segmentation (geo, brand, media type, strategy)
--
-- ============================================================================
WITH performance_aggregated AS (
  SELECT 
    SAFE.PARSE_DATE('%d/%m/%Y', Date) AS date_start,
    Campaign_ID,
    Campaign,
    Ad_Group_ID,
    Ad_Group,
    Creative_ID,
    Creative,
    
    -- Custom field extractions from campaign names
    LOWER(TRIM(REGEXP_EXTRACT(Campaign, r'^([A-Z]{2})_'))) AS geo,
    LOWER(TRIM(REGEXP_EXTRACT(Campaign, r'^[A-Z]{2}_([A-Z]{2})_'))) AS brand,
    LOWER(TRIM(REGEXP_EXTRACT(Campaign, r'^[A-Z]{2}_[A-Z]{2}_(.+)$'))) AS media_type,
    LOWER(TRIM(REGEXP_EXTRACT(Campaign, r'_(Aware|Retarget|Prosp|Reten|RND|React)_'))) AS strategy,
    Campaign AS campaign_name_custom,
    
    -- Performance metrics
    SUM(Advertiser_Cost_USD) AS spend,
    SUM(Bids) AS bids,
    SUM(Impressions) AS impressions,
    SUM(Clicks) AS clicks,
    SUM(Sampled_Tracked_Impressions) AS sampled_tracked_impressions,
    SUM(Sampled_Viewed_Impressions) AS sampled_viewed_impressions,
    
    -- ID42 Click conversions (3 conversion windows from Trade Desk)
    SUM(Click_Conversion_01) AS click_conversion_01,
    SUM(Click_Conversion_02) AS click_conversion_02,
    SUM(Click_Conversion_03) AS click_conversion_03,
    
    -- ID42 Total click + view conversions (3 conversion windows from Trade Desk)
    SUM(Total_Click_View_Conversions_01) AS total_click_view_conversions_01,
    SUM(Total_Click_View_Conversions_02) AS total_click_view_conversions_02,
    SUM(Total_Click_View_Conversions_03) AS total_click_view_conversions_03,
    
    -- ID42 View through conversions (3 conversion windows from Trade Desk)
    SUM(View_Through_Conversion_01) AS view_through_conversion_01,
    SUM(View_Through_Conversion_02) AS view_through_conversion_02,
    SUM(View_Through_Conversion_03) AS view_through_conversion_03,
    
    -- Calculated metrics
    CASE 
      WHEN SUM(Impressions) > 0 THEN SUM(Clicks) / SUM(Impressions) 
      ELSE 0 
    END AS ctr,
    CASE 
      WHEN SUM(Clicks) > 0 THEN SUM(Advertiser_Cost_USD) / SUM(Clicks) 
      ELSE 0 
    END AS cpc,
    CASE 
      WHEN SUM(Impressions) > 0 THEN SUM(Advertiser_Cost_USD) / SUM(Impressions) * 1000 
      ELSE 0 
    END AS cpm
    
  FROM `level-hope-462409-a8.tradedesk.ID42`
  GROUP BY 
    Date, Campaign_ID, Campaign, Ad_Group_ID, Ad_Group, Creative_ID, Creative
),
click_conversions_aggregated AS (
  -- Click-attributed conversions using last_display_click attribution
  -- Count conversion EVENTS (td1 + conversion_time), not just unique users
  -- Includes attribution window analysis (1-day and 7-day lookback)
  SELECT 
    SAFE.PARSE_DATE('%d/%m/%Y', SPLIT(conversion_time, ' ')[0]) AS conversion_date,
    last_display_click_campaign_id AS campaign_id,
    last_display_click_campaign_name AS campaign_name,
    last_display_click_ad_group_id AS ad_group_id,
    last_display_click_ad_group_name AS ad_group_name,
    last_display_click_creative_id AS creative_id,
    last_display_click_creative_name AS creative_name,
    
    SUM(impression_count) AS total_impression_count,
    SUM(display_click_count) AS total_display_click_count,
    SUM(non_display_click_count) AS total_non_display_click_count,
    
    -- Count conversion EVENTS by type using CONCAT(td1, conversion_time) - ALL CLICK CONVERSIONS
    COUNT(DISTINCT CASE WHEN REGEXP_CONTAINS(LOWER(tracking_tag_name), r'default') THEN CONCAT(COALESCE(td1, '_na_'), '|', conversion_time) END) AS default_conversions,
    COUNT(DISTINCT CASE WHEN REGEXP_CONTAINS(LOWER(tracking_tag_name), r'(registration|signup_success)') THEN CONCAT(COALESCE(td1, '_na_'), '|', conversion_time) END) AS registration_conversions,
    COUNT(DISTINCT CASE WHEN REGEXP_CONTAINS(LOWER(tracking_tag_name), r'(?:^|[^a-z])deposit(?:$|[^a-z])')
                           AND NOT REGEXP_CONTAINS(LOWER(tracking_tag_name), r'first[ _-]*deposit')
                           AND NOT REGEXP_CONTAINS(LOWER(tracking_tag_name), r'deposit[ _-]*form[ _-]*submitted')
                        THEN CONCAT(COALESCE(td1, '_na_'), '|', conversion_time) END) AS deposit_conversions,
    COUNT(DISTINCT CASE WHEN REGEXP_CONTAINS(LOWER(tracking_tag_name), r'first[ _-]*deposit')
                           AND NOT REGEXP_CONTAINS(LOWER(tracking_tag_name), r'first[ _-]*deposit[ _-]*form[ _-]*submitted')
                        THEN CONCAT(COALESCE(td1, '_na_'), '|', conversion_time) END) AS first_deposit_conversions,
    COUNT(DISTINCT CASE WHEN REGEXP_CONTAINS(LOWER(tracking_tag_name), r'deposit[ _-]*form[ _-]*submitted') THEN CONCAT(COALESCE(td1, '_na_'), '|', conversion_time) END) AS deposit_form_submitted_conversions,
    
    -- 1-DAY CLICK WINDOW: Conversions within 1 day of last click
    COUNT(DISTINCT CASE 
      WHEN REGEXP_CONTAINS(LOWER(tracking_tag_name), r'default')
        AND DATETIME_DIFF(SAFE.PARSE_DATETIME('%d/%m/%Y %H:%M:%S', conversion_time), 
                         SAFE.PARSE_DATETIME('%d/%m/%Y %H:%M:%S', last_display_click_time), DAY) <= 1
      THEN CONCAT(COALESCE(td1, '_na_'), '|', conversion_time) 
    END) AS default_conversions_1d_click,
    COUNT(DISTINCT CASE 
      WHEN REGEXP_CONTAINS(LOWER(tracking_tag_name), r'(registration|signup_success)')
        AND DATETIME_DIFF(PARSE_DATETIME('%d/%m/%Y %H:%M:%S', conversion_time), 
                         PARSE_DATETIME('%d/%m/%Y %H:%M:%S', last_display_click_time), DAY) <= 1
      THEN CONCAT(COALESCE(td1, '_na_'), '|', conversion_time) 
    END) AS registration_conversions_1d_click,
    COUNT(DISTINCT CASE 
      WHEN REGEXP_CONTAINS(LOWER(tracking_tag_name), r'(?:^|[^a-z])deposit(?:$|[^a-z])')
        AND NOT REGEXP_CONTAINS(LOWER(tracking_tag_name), r'first[ _-]*deposit')
        AND NOT REGEXP_CONTAINS(LOWER(tracking_tag_name), r'deposit[ _-]*form[ _-]*submitted')
        AND DATETIME_DIFF(PARSE_DATETIME('%d/%m/%Y %H:%M:%S', conversion_time), 
                         PARSE_DATETIME('%d/%m/%Y %H:%M:%S', last_display_click_time), DAY) <= 1
      THEN CONCAT(COALESCE(td1, '_na_'), '|', conversion_time) 
    END) AS deposit_conversions_1d_click,
    COUNT(DISTINCT CASE 
      WHEN REGEXP_CONTAINS(LOWER(tracking_tag_name), r'first[ _-]*deposit')
        AND NOT REGEXP_CONTAINS(LOWER(tracking_tag_name), r'first[ _-]*deposit[ _-]*form[ _-]*submitted')
        AND DATETIME_DIFF(PARSE_DATETIME('%d/%m/%Y %H:%M:%S', conversion_time), 
                         PARSE_DATETIME('%d/%m/%Y %H:%M:%S', last_display_click_time), DAY) <= 1
      THEN CONCAT(COALESCE(td1, '_na_'), '|', conversion_time) 
    END) AS first_deposit_conversions_1d_click,
    
    -- 7-DAY CLICK WINDOW: Conversions within 7 days of last click (includes 1-day)
    COUNT(DISTINCT CASE 
      WHEN REGEXP_CONTAINS(LOWER(tracking_tag_name), r'default')
        AND DATETIME_DIFF(PARSE_DATETIME('%d/%m/%Y %H:%M:%S', conversion_time), 
                         PARSE_DATETIME('%d/%m/%Y %H:%M:%S', last_display_click_time), DAY) <= 7
      THEN CONCAT(COALESCE(td1, '_na_'), '|', conversion_time) 
    END) AS default_conversions_7d_click,
    COUNT(DISTINCT CASE 
      WHEN REGEXP_CONTAINS(LOWER(tracking_tag_name), r'(registration|signup_success)')
        AND DATETIME_DIFF(PARSE_DATETIME('%d/%m/%Y %H:%M:%S', conversion_time), 
                         PARSE_DATETIME('%d/%m/%Y %H:%M:%S', last_display_click_time), DAY) <= 7
      THEN CONCAT(COALESCE(td1, '_na_'), '|', conversion_time) 
    END) AS registration_conversions_7d_click,
    COUNT(DISTINCT CASE 
      WHEN REGEXP_CONTAINS(LOWER(tracking_tag_name), r'(?:^|[^a-z])deposit(?:$|[^a-z])')
        AND NOT REGEXP_CONTAINS(LOWER(tracking_tag_name), r'first[ _-]*deposit')
        AND NOT REGEXP_CONTAINS(LOWER(tracking_tag_name), r'deposit[ _-]*form[ _-]*submitted')
        AND DATETIME_DIFF(PARSE_DATETIME('%d/%m/%Y %H:%M:%S', conversion_time), 
                         PARSE_DATETIME('%d/%m/%Y %H:%M:%S', last_display_click_time), DAY) <= 7
      THEN CONCAT(COALESCE(td1, '_na_'), '|', conversion_time) 
    END) AS deposit_conversions_7d_click,
    COUNT(DISTINCT CASE 
      WHEN REGEXP_CONTAINS(LOWER(tracking_tag_name), r'first[ _-]*deposit')
        AND NOT REGEXP_CONTAINS(LOWER(tracking_tag_name), r'first[ _-]*deposit[ _-]*form[ _-]*submitted')
        AND DATETIME_DIFF(PARSE_DATETIME('%d/%m/%Y %H:%M:%S', conversion_time), 
                         PARSE_DATETIME('%d/%m/%Y %H:%M:%S', last_display_click_time), DAY) <= 7
      THEN CONCAT(COALESCE(td1, '_na_'), '|', conversion_time) 
    END) AS first_deposit_conversions_7d_click,
    
    -- Count total conversion EVENTS
    COUNT(DISTINCT CONCAT(COALESCE(td1, '_na_'), '|', conversion_time)) AS click_attributed_conversions,
    
    -- 1-DAY and 7-DAY CLICK TOTALS
    COUNT(DISTINCT CASE 
      WHEN DATETIME_DIFF(PARSE_DATETIME('%d/%m/%Y %H:%M:%S', conversion_time), 
                        PARSE_DATETIME('%d/%m/%Y %H:%M:%S', last_display_click_time), DAY) <= 1
      THEN CONCAT(COALESCE(td1, '_na_'), '|', conversion_time) 
    END) AS click_attributed_conversions_1d,
    COUNT(DISTINCT CASE 
      WHEN DATETIME_DIFF(PARSE_DATETIME('%d/%m/%Y %H:%M:%S', conversion_time), 
                        PARSE_DATETIME('%d/%m/%Y %H:%M:%S', last_display_click_time), DAY) <= 7
      THEN CONCAT(COALESCE(td1, '_na_'), '|', conversion_time) 
    END) AS click_attributed_conversions_7d,
    
    AVG(CASE 
      WHEN last_display_click_time IS NOT NULL AND conversion_time IS NOT NULL 
      THEN DATETIME_DIFF(PARSE_DATETIME('%d/%m/%Y %H:%M:%S', conversion_time), 
                        PARSE_DATETIME('%d/%m/%Y %H:%M:%S', last_display_click_time), HOUR)
      ELSE NULL 
    END) AS avg_click_to_conversion_hours
    
  FROM `level-hope-462409-a8.tradedesk.ID41`
  WHERE conversion_time IS NOT NULL
    AND NULLIF(last_display_click_time, '') IS NOT NULL
    -- Filter out invalid datetime values to prevent parsing errors
    AND REGEXP_CONTAINS(conversion_time, r'^\d{2}/\d{2}/\d{4} \d{2}:\d{2}:\d{2}$')
    AND REGEXP_CONTAINS(last_display_click_time, r'^\d{2}/\d{2}/\d{4} \d{2}:\d{2}:\d{2}$')
  GROUP BY 
    conversion_date, 
    last_display_click_campaign_id, last_display_click_campaign_name,
    last_display_click_ad_group_id, last_display_click_ad_group_name,
    last_display_click_creative_id, last_display_click_creative_name
),
view_conversions_aggregated AS (
  -- View-through conversions using last_impression attribution
  -- Count conversion EVENTS (td1 + conversion_time), not just unique users
  -- Includes attribution window analysis (1-day and 7-day lookback)
  SELECT 
    SAFE.PARSE_DATE('%d/%m/%Y', SPLIT(conversion_time, ' ')[0]) AS conversion_date,
    last_impression_campaign_id AS campaign_id,
    last_impression_campaign_name AS campaign_name,
    last_impression_ad_group_id AS ad_group_id,
    last_impression_ad_group_name AS ad_group_name,
    last_impression_creative_id AS creative_id,
    last_impression_creative_name AS creative_name,
    
    -- Count conversion EVENTS by type using CONCAT(td1, conversion_time) - ALL VIEW CONVERSIONS
    COUNT(DISTINCT CASE WHEN REGEXP_CONTAINS(LOWER(tracking_tag_name), r'default') THEN CONCAT(COALESCE(td1, '_na_'), '|', conversion_time) END) AS default_conversions,
    COUNT(DISTINCT CASE WHEN REGEXP_CONTAINS(LOWER(tracking_tag_name), r'(registration|signup_success)') THEN CONCAT(COALESCE(td1, '_na_'), '|', conversion_time) END) AS registration_conversions,
    COUNT(DISTINCT CASE WHEN REGEXP_CONTAINS(LOWER(tracking_tag_name), r'(?:^|[^a-z])deposit(?:$|[^a-z])')
                           AND NOT REGEXP_CONTAINS(LOWER(tracking_tag_name), r'first[ _-]*deposit')
                           AND NOT REGEXP_CONTAINS(LOWER(tracking_tag_name), r'deposit[ _-]*form[ _-]*submitted')
                        THEN CONCAT(COALESCE(td1, '_na_'), '|', conversion_time) END) AS deposit_conversions,
    COUNT(DISTINCT CASE WHEN REGEXP_CONTAINS(LOWER(tracking_tag_name), r'first[ _-]*deposit')
                           AND NOT REGEXP_CONTAINS(LOWER(tracking_tag_name), r'first[ _-]*deposit[ _-]*form[ _-]*submitted')
                        THEN CONCAT(COALESCE(td1, '_na_'), '|', conversion_time) END) AS first_deposit_conversions,
    COUNT(DISTINCT CASE WHEN REGEXP_CONTAINS(LOWER(tracking_tag_name), r'deposit[ _-]*form[ _-]*submitted') THEN CONCAT(COALESCE(td1, '_na_'), '|', conversion_time) END) AS deposit_form_submitted_conversions,
    
    -- 1-DAY VIEW WINDOW: Conversions within 1 day of last impression
    COUNT(DISTINCT CASE 
      WHEN REGEXP_CONTAINS(LOWER(tracking_tag_name), r'default')
        AND DATETIME_DIFF(PARSE_DATETIME('%d/%m/%Y %H:%M:%S', conversion_time), 
                         PARSE_DATETIME('%d/%m/%Y %H:%M:%S', last_impression_time), DAY) <= 1
      THEN CONCAT(COALESCE(td1, '_na_'), '|', conversion_time) 
    END) AS default_conversions_1d_view,
    COUNT(DISTINCT CASE 
      WHEN REGEXP_CONTAINS(LOWER(tracking_tag_name), r'(registration|signup_success)')
        AND DATETIME_DIFF(PARSE_DATETIME('%d/%m/%Y %H:%M:%S', conversion_time), 
                         PARSE_DATETIME('%d/%m/%Y %H:%M:%S', last_impression_time), DAY) <= 1
      THEN CONCAT(COALESCE(td1, '_na_'), '|', conversion_time) 
    END) AS registration_conversions_1d_view,
    COUNT(DISTINCT CASE 
      WHEN REGEXP_CONTAINS(LOWER(tracking_tag_name), r'(?:^|[^a-z])deposit(?:$|[^a-z])')
        AND NOT REGEXP_CONTAINS(LOWER(tracking_tag_name), r'first[ _-]*deposit')
        AND NOT REGEXP_CONTAINS(LOWER(tracking_tag_name), r'deposit[ _-]*form[ _-]*submitted')
        AND DATETIME_DIFF(PARSE_DATETIME('%d/%m/%Y %H:%M:%S', conversion_time), 
                         PARSE_DATETIME('%d/%m/%Y %H:%M:%S', last_impression_time), DAY) <= 1
      THEN CONCAT(COALESCE(td1, '_na_'), '|', conversion_time) 
    END) AS deposit_conversions_1d_view,
    COUNT(DISTINCT CASE 
      WHEN REGEXP_CONTAINS(LOWER(tracking_tag_name), r'first[ _-]*deposit')
        AND NOT REGEXP_CONTAINS(LOWER(tracking_tag_name), r'first[ _-]*deposit[ _-]*form[ _-]*submitted')
        AND DATETIME_DIFF(PARSE_DATETIME('%d/%m/%Y %H:%M:%S', conversion_time), 
                         PARSE_DATETIME('%d/%m/%Y %H:%M:%S', last_impression_time), DAY) <= 1
      THEN CONCAT(COALESCE(td1, '_na_'), '|', conversion_time) 
    END) AS first_deposit_conversions_1d_view,
    
    -- 7-DAY VIEW WINDOW: Conversions within 7 days of last impression (includes 1-day)
    COUNT(DISTINCT CASE 
      WHEN REGEXP_CONTAINS(LOWER(tracking_tag_name), r'default') 
        AND DATETIME_DIFF(PARSE_DATETIME('%d/%m/%Y %H:%M:%S', conversion_time), 
                         PARSE_DATETIME('%d/%m/%Y %H:%M:%S', last_impression_time), DAY) <= 7
      THEN CONCAT(COALESCE(td1, '_na_'), '|', conversion_time) 
    END) AS default_conversions_7d_view,
    COUNT(DISTINCT CASE 
      WHEN REGEXP_CONTAINS(LOWER(tracking_tag_name), r'(registration|signup_success)') 
        AND DATETIME_DIFF(PARSE_DATETIME('%d/%m/%Y %H:%M:%S', conversion_time), 
                         PARSE_DATETIME('%d/%m/%Y %H:%M:%S', last_impression_time), DAY) <= 7
      THEN CONCAT(COALESCE(td1, '_na_'), '|', conversion_time) 
    END) AS registration_conversions_7d_view,
    COUNT(DISTINCT CASE 
      WHEN REGEXP_CONTAINS(LOWER(tracking_tag_name), r'(?:^|[^a-z])deposit(?:$|[^a-z])')
        AND NOT REGEXP_CONTAINS(LOWER(tracking_tag_name), r'first[ _-]*deposit')
        AND NOT REGEXP_CONTAINS(LOWER(tracking_tag_name), r'deposit[ _-]*form[ _-]*submitted') 
        AND DATETIME_DIFF(PARSE_DATETIME('%d/%m/%Y %H:%M:%S', conversion_time), 
                         PARSE_DATETIME('%d/%m/%Y %H:%M:%S', last_impression_time), DAY) <= 7
      THEN CONCAT(COALESCE(td1, '_na_'), '|', conversion_time) 
    END) AS deposit_conversions_7d_view,
    COUNT(DISTINCT CASE 
      WHEN REGEXP_CONTAINS(LOWER(tracking_tag_name), r'first[ _-]*deposit') 
        AND NOT REGEXP_CONTAINS(LOWER(tracking_tag_name), r'first[ _-]*deposit[ _-]*form[ _-]*submitted')
        AND DATETIME_DIFF(PARSE_DATETIME('%d/%m/%Y %H:%M:%S', conversion_time), 
                         PARSE_DATETIME('%d/%m/%Y %H:%M:%S', last_impression_time), DAY) <= 7
      THEN CONCAT(COALESCE(td1, '_na_'), '|', conversion_time) 
    END) AS first_deposit_conversions_7d_view,
    
    -- Count total conversion EVENTS
    COUNT(DISTINCT CONCAT(COALESCE(td1, '_na_'), '|', conversion_time)) AS view_through_conversions,
    
    -- 1-DAY and 7-DAY VIEW TOTALS
    COUNT(DISTINCT CASE 
      WHEN DATETIME_DIFF(PARSE_DATETIME('%d/%m/%Y %H:%M:%S', conversion_time), 
                        PARSE_DATETIME('%d/%m/%Y %H:%M:%S', last_impression_time), DAY) <= 1
      THEN CONCAT(COALESCE(td1, '_na_'), '|', conversion_time) 
    END) AS view_through_conversions_1d,
    COUNT(DISTINCT CASE 
      WHEN DATETIME_DIFF(PARSE_DATETIME('%d/%m/%Y %H:%M:%S', conversion_time), 
                        PARSE_DATETIME('%d/%m/%Y %H:%M:%S', last_impression_time), DAY) <= 7
      THEN CONCAT(COALESCE(td1, '_na_'), '|', conversion_time) 
    END) AS view_through_conversions_7d
    
  FROM `level-hope-462409-a8.tradedesk.ID41`
  WHERE conversion_time IS NOT NULL
    AND NULLIF(last_impression_time, '') IS NOT NULL
    AND (last_display_click_time IS NULL OR last_display_click_time = '')
    -- Filter out invalid datetime values to prevent parsing errors
    AND REGEXP_CONTAINS(conversion_time, r'^\d{2}/\d{2}/\d{4} \d{2}:\d{2}:\d{2}$')
    AND REGEXP_CONTAINS(last_impression_time, r'^\d{2}/\d{2}/\d{4} \d{2}:\d{2}:\d{2}$')
  GROUP BY 
    conversion_date,
    last_impression_campaign_id, last_impression_campaign_name,
    last_impression_ad_group_id, last_impression_ad_group_name,
    last_impression_creative_id, last_impression_creative_name
)
SELECT 
  -- Date and campaign identification (using COALESCE pattern)
  COALESCE(perf.date_start, click_conv.conversion_date, view_conv.conversion_date) AS date_start,
  COALESCE(perf.Campaign_ID, click_conv.campaign_id, view_conv.campaign_id) AS campaign_id,
  COALESCE(perf.Campaign, click_conv.campaign_name, view_conv.campaign_name) AS campaign_name,
  COALESCE(perf.Ad_Group_ID, click_conv.ad_group_id, view_conv.ad_group_id) AS ad_group_id,
  COALESCE(perf.Ad_Group, click_conv.ad_group_name, view_conv.ad_group_name) AS ad_group_name,
  COALESCE(perf.Creative_ID, click_conv.creative_id, view_conv.creative_id) AS creative_id,
  COALESCE(perf.Creative, click_conv.creative_name, view_conv.creative_name) AS creative_name,
  
  -- Custom extracted fields (from performance data)
  LOWER(TRIM(REGEXP_EXTRACT(COALESCE(perf.Campaign, click_conv.campaign_name, view_conv.campaign_name), r'^([A-Z]{2})_'))) AS geo,
  LOWER(TRIM(REGEXP_EXTRACT(COALESCE(perf.Campaign, click_conv.campaign_name, view_conv.campaign_name), r'^[A-Z]{2}_([A-Z]{2})_'))) AS brand,
  LOWER(TRIM(REGEXP_EXTRACT(COALESCE(perf.Campaign, click_conv.campaign_name, view_conv.campaign_name), r'^[A-Z]{2}_[A-Z]{2}_(.+)$'))) AS media_type,
  LOWER(TRIM(REGEXP_EXTRACT(COALESCE(perf.Campaign, click_conv.campaign_name, view_conv.campaign_name), r'_(Aware|Retarget|Prosp|Reten|RND|React)_'))) AS strategy,
  COALESCE(perf.Campaign, click_conv.campaign_name, view_conv.campaign_name) AS campaign_name_custom,
  
  -- Performance metrics (from ID42) - fill with zeros if no match
  COALESCE(perf.spend, 0) AS spend,
  COALESCE(perf.bids, 0) AS bids,
  COALESCE(perf.impressions, 0) AS impressions,
  COALESCE(perf.clicks, 0) AS clicks,
  COALESCE(perf.sampled_tracked_impressions, 0) AS sampled_tracked_impressions,
  COALESCE(perf.sampled_viewed_impressions, 0) AS sampled_viewed_impressions,
  
  -- ID42 Click conversions (all 3 conversion windows: 01, 02, 03)
  COALESCE(perf.click_conversion_01, 0) AS click_conversion_01,
  COALESCE(perf.click_conversion_02, 0) AS click_conversion_02,
  COALESCE(perf.click_conversion_03, 0) AS click_conversion_03,
  
  -- ID42 Total click + view conversions (all 3 conversion windows: 01, 02, 03)
  COALESCE(perf.total_click_view_conversions_01, 0) AS total_click_view_conversions_01,
  COALESCE(perf.total_click_view_conversions_02, 0) AS total_click_view_conversions_02,
  COALESCE(perf.total_click_view_conversions_03, 0) AS total_click_view_conversions_03,
  
  -- ID42 View through conversions (all 3 conversion windows: 01, 02, 03)
  COALESCE(perf.view_through_conversion_01, 0) AS view_through_conversion_01,
  COALESCE(perf.view_through_conversion_02, 0) AS view_through_conversion_02,
  COALESCE(perf.view_through_conversion_03, 0) AS view_through_conversion_03,
  
  -- Calculated performance metrics
  COALESCE(perf.ctr, 0) AS ctr,
  COALESCE(perf.cpc, 0) AS cpc,
  COALESCE(perf.cpm, 0) AS cpm,
  
  -- Touchpoint counts (from click conversions) - fill with zeros if no match
  COALESCE(click_conv.total_impression_count, 0) AS total_impression_count,
  COALESCE(click_conv.total_display_click_count, 0) AS total_display_click_count,
  COALESCE(click_conv.total_non_display_click_count, 0) AS total_non_display_click_count,
  
  -- Conversion counts by type - CLICK ATTRIBUTION (all click conversions)
  COALESCE(click_conv.default_conversions, 0) AS default_conversions_click,
  COALESCE(click_conv.registration_conversions, 0) AS registration_conversions_click,
  COALESCE(click_conv.deposit_conversions, 0) AS deposit_conversions_click,
  COALESCE(click_conv.first_deposit_conversions, 0) AS first_deposit_conversions_click,
  COALESCE(click_conv.deposit_form_submitted_conversions, 0) AS deposit_form_submitted_conversions_click,
  
  -- Conversion counts by type - VIEW ATTRIBUTION (all view conversions)
  COALESCE(view_conv.default_conversions, 0) AS default_conversions_view,
  COALESCE(view_conv.registration_conversions, 0) AS registration_conversions_view,
  COALESCE(view_conv.deposit_conversions, 0) AS deposit_conversions_view,
  COALESCE(view_conv.first_deposit_conversions, 0) AS first_deposit_conversions_view,
  COALESCE(view_conv.deposit_form_submitted_conversions, 0) AS deposit_form_submitted_conversions_view,
  
  -- Conversion counts by type - 1-DAY CLICK WINDOW
  COALESCE(click_conv.default_conversions_1d_click, 0) AS default_conversions_1d_click,
  COALESCE(click_conv.registration_conversions_1d_click, 0) AS registration_conversions_1d_click,
  COALESCE(click_conv.deposit_conversions_1d_click, 0) AS deposit_conversions_1d_click,
  COALESCE(click_conv.first_deposit_conversions_1d_click, 0) AS first_deposit_conversions_1d_click,
  
  -- Conversion counts by type - 7-DAY CLICK WINDOW
  COALESCE(click_conv.default_conversions_7d_click, 0) AS default_conversions_7d_click,
  COALESCE(click_conv.registration_conversions_7d_click, 0) AS registration_conversions_7d_click,
  COALESCE(click_conv.deposit_conversions_7d_click, 0) AS deposit_conversions_7d_click,
  COALESCE(click_conv.first_deposit_conversions_7d_click, 0) AS first_deposit_conversions_7d_click,
  
  -- Conversion counts by type - 1-DAY VIEW WINDOW
  COALESCE(view_conv.default_conversions_1d_view, 0) AS default_conversions_1d_view,
  COALESCE(view_conv.registration_conversions_1d_view, 0) AS registration_conversions_1d_view,
  COALESCE(view_conv.deposit_conversions_1d_view, 0) AS deposit_conversions_1d_view,
  COALESCE(view_conv.first_deposit_conversions_1d_view, 0) AS first_deposit_conversions_1d_view,
  
  -- Conversion counts by type - 7-DAY VIEW WINDOW
  COALESCE(view_conv.default_conversions_7d_view, 0) AS default_conversions_7d_view,
  COALESCE(view_conv.registration_conversions_7d_view, 0) AS registration_conversions_7d_view,
  COALESCE(view_conv.deposit_conversions_7d_view, 0) AS deposit_conversions_7d_view,
  COALESCE(view_conv.first_deposit_conversions_7d_view, 0) AS first_deposit_conversions_7d_view,
  
  -- Conversion counts by type - TOTAL (click + view, all windows)
  COALESCE(click_conv.default_conversions, 0) + COALESCE(view_conv.default_conversions, 0) AS default_conversions,
  COALESCE(click_conv.registration_conversions, 0) + COALESCE(view_conv.registration_conversions, 0) AS registration_conversions,
  COALESCE(click_conv.deposit_conversions, 0) + COALESCE(view_conv.deposit_conversions, 0) AS deposit_conversions,
  COALESCE(click_conv.first_deposit_conversions, 0) + COALESCE(view_conv.first_deposit_conversions, 0) AS first_deposit_conversions,
  COALESCE(click_conv.deposit_form_submitted_conversions, 0) + COALESCE(view_conv.deposit_form_submitted_conversions, 0) AS deposit_form_submitted_conversions,
  
  -- Attribution totals (all windows)
  COALESCE(click_conv.click_attributed_conversions, 0) + COALESCE(view_conv.view_through_conversions, 0) AS total_conversions,
  COALESCE(click_conv.click_attributed_conversions, 0) AS click_attributed_conversions,
  COALESCE(view_conv.view_through_conversions, 0) AS view_through_conversions,
  
  -- Attribution window totals - 1-DAY
  COALESCE(click_conv.click_attributed_conversions_1d, 0) AS click_attributed_conversions_1d,
  COALESCE(view_conv.view_through_conversions_1d, 0) AS view_through_conversions_1d,
  COALESCE(click_conv.click_attributed_conversions_1d, 0) + COALESCE(view_conv.view_through_conversions_1d, 0) AS total_conversions_1d,
  
  -- Attribution window totals - 7-DAY
  COALESCE(click_conv.click_attributed_conversions_7d, 0) AS click_attributed_conversions_7d,
  COALESCE(view_conv.view_through_conversions_7d, 0) AS view_through_conversions_7d,
  COALESCE(click_conv.click_attributed_conversions_7d, 0) + COALESCE(view_conv.view_through_conversions_7d, 0) AS total_conversions_7d,
  
  -- Time-based attribution (from click conversions only) - fill with zeros if no match
  COALESCE(click_conv.avg_click_to_conversion_hours, 0) AS avg_click_to_conversion_hours

FROM performance_aggregated perf
FULL OUTER JOIN click_conversions_aggregated click_conv
  ON perf.date_start = click_conv.conversion_date
  AND perf.Campaign_ID = click_conv.campaign_id
  AND COALESCE(perf.Ad_Group_ID, '') = COALESCE(click_conv.ad_group_id, '')
  AND COALESCE(perf.Creative_ID, '') = COALESCE(click_conv.creative_id, '')
FULL OUTER JOIN view_conversions_aggregated view_conv
  ON perf.date_start = view_conv.conversion_date
  AND perf.Campaign_ID = view_conv.campaign_id
  AND COALESCE(perf.Ad_Group_ID, '') = COALESCE(view_conv.ad_group_id, '')
  AND COALESCE(perf.Creative_ID, '') = COALESCE(view_conv.creative_id, '');

/*
================================================================================
IMPORTANT NOTES & LESSONS LEARNED
================================================================================

DATE FILTERING BEST PRACTICE:
- CRITICAL: When filtering DD/MM/YYYY formatted dates, always use PARSE_DATE() 
  for comparison, never string comparison
- String comparison on '01/09/2025' to '30/09/2025' incorrectly includes dates like
  '01/10/2025' to '07/10/2025' (October) because '01/10' > '01/09' and '07/10' < '30/09'
- Always use: WHERE PARSE_DATE('%d/%m/%Y', Date) >= '2025-09-01'
- This prevents data quality issues and incorrect date range filtering

DEDUPLICATION STRATEGY:
- Initial approach using COUNT(DISTINCT td1) undercounted conversions because
  td1 is a user ID, not a conversion ID
- Users can have multiple conversion events (e.g., user 285290 had 42 deposits)
- Solution: Use CONCAT(COALESCE(td1, '_na_'), '|', conversion_time) to create unique conversion identifiers
- This ensures each conversion EVENT is counted, not just unique users

ATTRIBUTION MODEL SEPARATION:
- Separate CTEs for click vs view attribution prevent double-counting
- Click CTE: Filters WHERE last_display_click_time IS NOT NULL
- View CTE: Filters WHERE last_impression_time IS NOT NULL AND last_display_click_time IS NULL
- Both group by their respective attribution dimensions (last_display_click_* vs last_impression_*)
- FULL OUTER JOIN ensures all performance data and all conversion data is captured

ATTRIBUTION WINDOW CALCULATION:
- Uses DATETIME_DIFF to calculate days between touchpoint and conversion
- Click windows: DATETIME_DIFF(conversion_time, last_display_click_time, DAY)
- View windows: DATETIME_DIFF(conversion_time, last_impression_time, DAY)
- 1-DAY WINDOW: Conversions where days <= 1 (within 24 hours of touchpoint)
- 7-DAY WINDOW: Conversions where days <= 7 (includes 1-day conversions)
- Example: User clicks ad on Sept 23 at 00:25:55, converts on Sept 23 at 00:26:15
  -> DATETIME_DIFF = 0 days -> counted in 1d and 7d windows
- Example: User sees ad on Sept 3, converts on Sept 23
  -> DATETIME_DIFF = 20 days -> NOT counted in 1d or 7d windows, but in "all windows" total
- Windows calculated separately for each attribution model (click vs view)

WHY FULL OUTER JOIN:
- Performance data exists even when there are no conversions (many campaign days have no conversions)
- Conversions exist even when there's no matching performance for that specific date/campaign/adgroup/creative
- CRITICAL for attribution windows: A user clicks ad on Sept 25, converts on Oct 2
  * Performance data exists on Sept 25 (click date)
  * Conversion recorded on Oct 2 (conversion date)
  * If campaign stopped Sept 30, there's no performance data on Oct 2
  * FULL OUTER JOIN ensures this conversion is still counted (as "orphan" row with conversions but spend=0)
- This may cause slight discrepancies (+0.3% in conversions) vs source queries, which is acceptable
- Ensures complete data coverage for both operational reporting and attribution analysis

CUSTOM FIELD EXTRACTIONS:
- Campaign naming convention: GEO_BRAND_MediaType_Strategy_...
- Example: DE_BP_Reten_Display extracts to geo=de, brand=bp, strategy=reten
- Uses REGEXP_EXTRACT with specific patterns for each field
- Applied using COALESCE to handle cases where only conversion or performance data exists

================================================================================
*/
```
</details>

---

## reports

**Location**: US
**Created**: 2025-09-16 09:01:23.222000+00:00
**Modified**: 2025-09-16 09:01:23.222000+00:00

**Tables**: 0 | **Views**: 9

### Views in reports

#### cohort_meta_affilka

**Full Name**: `level-hope-462409-a8.reports.cohort_meta_affilka`
**Created**: 2025-09-19 09:26:54.432000+00:00
**Modified**: 2025-09-22 14:17:41.268000+00:00

**Dependencies**: This view depends on 4 object(s):
- `level-hope-462409-a8.affilka.meta_affilka_union`
- `level-hope-462409-a8.level-hope-462409-a8.affilka`
- `level-hope-462409-a8.level-hope-462409-a8.mkt_channels`
- `level-hope-462409-a8.mkt_channels.meta_stats_custom`

**Schema**:

| Column Name | Type | Mode | Description |
|-------------|------|------|-------------|
| campaign_name_custom | STRING | NULLABLE |  |
| adset_name_custom | STRING | NULLABLE |  |
| adname_custom | STRING | NULLABLE |  |
| account_id | STRING | NULLABLE |  |
| cohort_month | DATE | NULLABLE |  |
| cohort_number | INTEGER | NULLABLE |  |
| spend | NUMERIC | NULLABLE |  |
| ngr_monthly | NUMERIC | NULLABLE |  |
| ngr_cumulative | NUMERIC | NULLABLE |  |
| deps_monthly | INTEGER | NULLABLE |  |
| deps_cumulative | INTEGER | NULLABLE |  |
| deposit_value_monthly | NUMERIC | NULLABLE |  |
| deposit_value_cumulative | NUMERIC | NULLABLE |  |
| depositors_monthly | INTEGER | NULLABLE |  |
| depositors_cumulative | INTEGER | NULLABLE |  |


<details>
<summary><b>View SQL Query</b> (click to expand)</summary>

```sql
-- View: Cohort Analysis for META Affilka with Spend Data
-- BigQuery View: Cohort Analysis for META Affilka with Spend Data
-- Tracks player lifetime value (LTV) over time by analyzing NGR, deposits, and depositors month by month after first deposit
-- Includes spend data with fixed spend values across all cohort numbers
-- Each row represents one campaign/adset/ad for one cohort in one month
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
```
</details>

---

#### cohort_pops_affilka

**Full Name**: `level-hope-462409-a8.reports.cohort_pops_affilka`
**Created**: 2025-09-19 09:27:07.824000+00:00
**Modified**: 2025-09-22 14:17:24.766000+00:00

**Dependencies**: This view depends on 4 object(s):
- `level-hope-462409-a8.affilka.pops_affilka_union`
- `level-hope-462409-a8.level-hope-462409-a8.affilka`
- `level-hope-462409-a8.level-hope-462409-a8.mkt_channels`
- `level-hope-462409-a8.mkt_channels.pops_stats_custom`

**Schema**:

| Column Name | Type | Mode | Description |
|-------------|------|------|-------------|
| campaign_name_custom | STRING | NULLABLE |  |
| channel | STRING | NULLABLE |  |
| cohort_month | DATE | NULLABLE |  |
| cohort_number | INTEGER | NULLABLE |  |
| spend | FLOAT | NULLABLE |  |
| ngr_monthly | NUMERIC | NULLABLE |  |
| ngr_cumulative | NUMERIC | NULLABLE |  |
| deps_monthly | INTEGER | NULLABLE |  |
| deps_cumulative | INTEGER | NULLABLE |  |
| deposit_value_monthly | NUMERIC | NULLABLE |  |
| deposit_value_cumulative | NUMERIC | NULLABLE |  |
| depositors_monthly | INTEGER | NULLABLE |  |
| depositors_cumulative | INTEGER | NULLABLE |  |


<details>
<summary><b>View SQL Query</b> (click to expand)</summary>

```sql
-- View: Cohort Analysis for POPS Affilka with Spend Data
-- BigQuery View: Cohort Analysis for POPS Affilka with Spend Data
-- Tracks player lifetime value (LTV) over time by analyzing NGR, deposits, and depositors month by month after first deposit
-- Includes spend data with fixed spend values across all cohort numbers
-- Each row represents one campaign for one cohort in one month
WITH pops_spend_aggregated AS (
  -- Get spend data aggregated by campaign/date (same logic as overview view)
  SELECT 
    campaign_name,
    date,
    ANY_VALUE(channel) AS channel,
    SUM(spend) AS spend
  FROM `level-hope-462409-a8.mkt_channels.pops_stats_custom`
  GROUP BY campaign_name, date
),
pops_spend_monthly AS (
  -- Aggregate spend to month-level to avoid many-to-many joins
  SELECT
    campaign_name,
    DATE_TRUNC(date, MONTH) AS cohort_month,
    ANY_VALUE(channel) AS channel,
    SUM(spend) AS spend
  FROM pops_spend_aggregated
  GROUP BY campaign_name, cohort_month
),
marketing_cohort_data AS (
  -- Get marketing data with cohort calculations
  SELECT 
    campaign_name_custom,
    
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
  FROM `level-hope-462409-a8.affilka.pops_affilka_union`
  WHERE first_deposit_day IS NOT NULL  -- Only include customers who made a first deposit
),
marketing_cohort_monthly AS (
  -- Aggregate marketing data to month-level per cohort_number to prevent duplication on join
  SELECT
    campaign_name_custom,
    cohort_month,
    cohort_number,
    SUM(casino_ngr) AS casino_ngr,
    SUM(deps) AS deps,
    SUM(deposit_sum) AS deposit_sum,
    SUM(depositing_players_count) AS depositing_players_count
  FROM marketing_cohort_data
  GROUP BY campaign_name_custom, cohort_month, cohort_number
),
spend_cohort_data AS (
  -- Create spend data with cohort numbers 0-23 for each campaign combination
  SELECT 
    s.campaign_name,
    s.cohort_month AS cohort_month,
    cohort_num AS cohort_number,
    s.spend,
    s.channel
  FROM pops_spend_monthly s
  CROSS JOIN UNNEST(GENERATE_ARRAY(0, 23)) AS cohort_num  -- Generate cohort numbers 0-23
),
combined_data AS (
  -- Combine marketing cohort data with spend data
  SELECT 
    COALESCE(m.campaign_name_custom, s.campaign_name) AS campaign_name_custom,
    COALESCE(m.cohort_month, s.cohort_month) AS cohort_month,
    COALESCE(m.cohort_number, s.cohort_number) AS cohort_number,
    COALESCE(m.casino_ngr, 0) AS casino_ngr,
    COALESCE(m.deps, 0) AS deps,
    COALESCE(m.deposit_sum, 0) AS deposit_sum,
    COALESCE(m.depositing_players_count, 0) AS depositing_players_count,
    COALESCE(s.spend, 0) AS spend,
    COALESCE(s.channel, 'Unknown') AS channel
  FROM marketing_cohort_monthly m
  FULL OUTER JOIN spend_cohort_data s
    ON m.campaign_name_custom = s.campaign_name
    AND m.cohort_month = s.cohort_month
    AND m.cohort_number = s.cohort_number
)
SELECT 
  -- Campaign name for filtering and grouping
  campaign_name_custom,
  channel,
  
  -- The month when the customer first made a deposit (this is our cohort month)
  cohort_month,
  
  -- How many months after first deposit this revenue occurred (0 = same month, 1 = next month, etc.)
  cohort_number,
  
  -- Spend data (fixed across all cohort numbers for each campaign)
  spend,
  
  -- Total revenue for this specific month (not cumulative)
  SUM(casino_ngr) AS ngr_monthly,
  
  -- Running total of revenue from cohort month 0 up to this cohort number
  -- This shows the cumulative value a customer group has generated over time
  SUM(SUM(casino_ngr)) OVER (
    PARTITION BY campaign_name_custom, cohort_month
    ORDER BY cohort_number
    ROWS UNBOUNDED PRECEDING
  ) AS ngr_cumulative,
  
  -- Total deposits count for this specific month (not cumulative)
  SUM(deps) AS deps_monthly,
  
  -- Running total of deposits from cohort month 0 up to this cohort number
  SUM(SUM(deps)) OVER (
    PARTITION BY campaign_name_custom, cohort_month
    ORDER BY cohort_number
    ROWS UNBOUNDED PRECEDING
  ) AS deps_cumulative,
  
  -- Total deposit value for this specific month (not cumulative)
  SUM(deposit_sum) AS deposit_value_monthly,
  
  -- Running total of deposit value from cohort month 0 up to this cohort number
  SUM(SUM(deposit_sum)) OVER (
    PARTITION BY campaign_name_custom, cohort_month
    ORDER BY cohort_number
    ROWS UNBOUNDED PRECEDING
  ) AS deposit_value_cumulative,
  
  -- Total depositing players for this specific month (not cumulative)
  SUM(depositing_players_count) AS depositors_monthly,
  
  -- Running total of depositing players from cohort month 0 up to this cohort number
  SUM(SUM(depositing_players_count)) OVER (
    PARTITION BY campaign_name_custom, cohort_month
    ORDER BY cohort_number
    ROWS UNBOUNDED PRECEDING
  ) AS depositors_cumulative
FROM combined_data
WHERE cohort_number >= 0  -- Remove any negative cohort numbers (data quality issue)
GROUP BY 
  campaign_name_custom,
  channel,
  cohort_month,
  cohort_number,
  spend;

```
</details>

---

#### meta_targeting

**Full Name**: `level-hope-462409-a8.reports.meta_targeting`
**Created**: 2025-10-03 13:01:08.727000+00:00
**Modified**: 2025-10-03 13:01:09.238000+00:00

**Dependencies**: This view depends on 6 object(s):
- `level-hope-462409-a8.affilka.meta_affilka_union`
- `level-hope-462409-a8.level-hope-462409-a8.affilka`
- `level-hope-462409-a8.level-hope-462409-a8.mkt_channels`
- `level-hope-462409-a8.marketing.first_deposit_day`
- `level-hope-462409-a8.mkt_channels.meta_stats_custom`
- `level-hope-462409-a8.mkt_channels.meta_targeting`

**Schema**:

| Column Name | Type | Mode | Description |
|-------------|------|------|-------------|
| date | DATE | NULLABLE |  |
| account_id | STRING | NULLABLE |  |
| spend | NUMERIC | NULLABLE |  |
| impressions | NUMERIC | NULLABLE |  |
| clicks | NUMERIC | NULLABLE |  |
| purchaseplus_s2s_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_s2s_total | NUMERIC | NULLABLE |  |
| purchaseplus_1d_view_s2s_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_1d_view_s2s_total | NUMERIC | NULLABLE |  |
| date_start | DATE | NULLABLE |  |
| utm_campaign | STRING | NULLABLE |  |
| casino_ggr | NUMERIC | NULLABLE |  |
| casino_ngr | NUMERIC | NULLABLE |  |
| regs | INTEGER | NULLABLE |  |
| ftds | INTEGER | NULLABLE |  |
| deps | INTEGER | NULLABLE |  |
| deposit_sum | NUMERIC | NULLABLE |  |
| real_ngr_amount | NUMERIC | NULLABLE |  |
| sb_real_ngr_amount | NUMERIC | NULLABLE |  |
| admin_fee_amount | NUMERIC | NULLABLE |  |
| sb_admin_fee_amount | NUMERIC | NULLABLE |  |
| ngr | NUMERIC | NULLABLE |  |
| ngr_0 | NUMERIC | NULLABLE |  |
| campaign_name_custom | STRING | NULLABLE |  |
| adset_name_custom | STRING | NULLABLE |  |
| adname_custom | STRING | NULLABLE |  |
| brand | STRING | NULLABLE |  |
| brand_name | STRING | NULLABLE |  |
| geo | STRING | NULLABLE |  |
| partner_name | STRING | NULLABLE |  |
| strategy | STRING | NULLABLE |  |
| sub_strategy | STRING | NULLABLE |  |
| cohort | STRING | NULLABLE |  |
| tsl_custom_audience | STRING | NULLABLE |  |
| tsl_excluding_custom_audience | STRING | NULLABLE |  |
| tsl_location | STRING | NULLABLE |  |
| tsl_age | STRING | NULLABLE |  |
| tsl_gender | STRING | NULLABLE |  |
| tsl_placements | STRING | NULLABLE |  |
| tsl_languages | STRING | NULLABLE |  |
| tsl_interests | STRING | NULLABLE |  |
| tsl_behaviors | STRING | NULLABLE |  |
| tsl_connections | STRING | NULLABLE |  |
| tsl_advantage_custom_audience | STRING | NULLABLE |  |
| tsl_advantage_audience | STRING | NULLABLE |  |
| tsl_other | STRING | NULLABLE |  |


<details>
<summary><b>View SQL Query</b> (click to expand)</summary>

```sql
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
    SUM(purchaseplus_s2s_total) AS purchaseplus_s2s_total,
    SUM(purchaseplus_val_s2s_total) AS purchaseplus_val_s2s_total,
    SUM(purchaseplus_1d_view_s2s_total) AS purchaseplus_1d_view_s2s_total,
    SUM(purchaseplus_val_1d_view_s2s_total) AS purchaseplus_val_1d_view_s2s_total
  FROM `level-hope-462409-a8.mkt_channels.meta_stats_custom`
  GROUP BY campaign_name_custom, adset_name_custom, adname_custom, date_start
),

targeting_latest AS (
  -- Get the latest targeting info for each campaign/adset combination
  SELECT 
    campaign_name,
    adset_name,
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
    ROW_NUMBER() OVER (PARTITION BY campaign_name, adset_name ORDER BY retrieved_at DESC) AS rn
  FROM `level-hope-462409-a8.mkt_channels.meta_targeting`
  WHERE campaign_name IS NOT NULL AND adset_name IS NOT NULL
),

targeting_deduplicated AS (
  -- Keep only the most recent targeting data per campaign/adset
  SELECT 
    campaign_name,
    adset_name,
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
    tsl_other
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
    SUM(deps) AS deps,
    SUM(deposit_sum) AS deposit_sum,
    SUM(real_ngr_amount) AS real_ngr_amount,
    SUM(sb_real_ngr_amount) AS sb_real_ngr_amount,
    SUM(admin_fee_amount) AS admin_fee_amount,
    SUM(sb_admin_fee_amount) AS sb_admin_fee_amount,
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
  COALESCE(meta.purchaseplus_s2s_total, 0) AS purchaseplus_s2s_total,
  COALESCE(meta.purchaseplus_val_s2s_total, 0) AS purchaseplus_val_s2s_total,
  COALESCE(meta.purchaseplus_1d_view_s2s_total, 0) AS purchaseplus_1d_view_s2s_total,
  COALESCE(meta.purchaseplus_val_1d_view_s2s_total, 0) AS purchaseplus_val_1d_view_s2s_total,
  
  -- Marketing Data columns (from aggregated meta_affilka_union) - fill with zeros if no match
  COALESCE(meta.date_start, marketing.date) AS date_start,
  marketing.utm_campaign,
  COALESCE(marketing.casino_ggr, 0) AS casino_ggr,
  COALESCE(marketing.casino_ngr, 0) AS casino_ngr,
  COALESCE(marketing.regs, 0) AS regs,
  COALESCE(marketing.ftds, 0) AS ftds,
  COALESCE(marketing.deps, 0) AS deps,
  COALESCE(marketing.deposit_sum, 0) AS deposit_sum,
  
  -- Raw NGR components for Looker Studio calculations
  COALESCE(marketing.real_ngr_amount, 0) AS real_ngr_amount,
  COALESCE(marketing.sb_real_ngr_amount, 0) AS sb_real_ngr_amount,
  COALESCE(marketing.admin_fee_amount, 0) AS admin_fee_amount,
  COALESCE(marketing.sb_admin_fee_amount, 0) AS sb_admin_fee_amount,
  
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
  targeting.tsl_other

FROM marketing_aggregated marketing
FULL OUTER JOIN meta_aggregated meta
  ON meta.campaign_name_custom = marketing.campaign_name_custom
  AND meta.adset_name_custom = marketing.adset_name_custom
  AND meta.adname_custom = marketing.adname_custom
  AND meta.date_start = marketing.date
LEFT JOIN targeting_deduplicated targeting
  ON targeting.campaign_name = COALESCE(meta.campaign_name_custom, marketing.campaign_name_custom)
  AND targeting.adset_name = COALESCE(meta.adset_name_custom, marketing.adset_name_custom)
```
</details>

---

#### overview_affilka

**Full Name**: `level-hope-462409-a8.reports.overview_affilka`
**Created**: 2025-09-22 07:34:08.350000+00:00
**Modified**: 2025-10-13 13:48:06.669000+00:00

**Dependencies**: This view depends on 7 object(s):
- `level-hope-462409-a8.level-hope-462409-a8.mkt_channels`
- `level-hope-462409-a8.level-hope-462409-a8.reports`
- `level-hope-462409-a8.mkt_channels.tradedesk_stats_custom`
- `level-hope-462409-a8.reports.overview_brandprotection_affilka`
- `level-hope-462409-a8.reports.overview_iconvert_affilka`
- `level-hope-462409-a8.reports.overview_meta_affilka`
- `level-hope-462409-a8.reports.overview_pops_affilka`

**Schema**:

| Column Name | Type | Mode | Description |
|-------------|------|------|-------------|
| data_source | STRING | NULLABLE |  |
| date | DATE | NULLABLE |  |
| partner_name | STRING | NULLABLE |  |
| partner_id | STRING | NULLABLE |  |
| spend | FLOAT | NULLABLE |  |
| impressions | NUMERIC | NULLABLE |  |
| clicks | NUMERIC | NULLABLE |  |
| regs | INTEGER | NULLABLE |  |
| ftds | INTEGER | NULLABLE |  |
| deps | INTEGER | NULLABLE |  |
| deposit_sum | NUMERIC | NULLABLE |  |
| ngr | NUMERIC | NULLABLE |  |
| ngr_0 | NUMERIC | NULLABLE |  |
| brand | STRING | NULLABLE |  |
| geo | STRING | NULLABLE |  |


<details>
<summary><b>View SQL Query</b> (click to expand)</summary>

```sql
-- BigQuery View: Overview Union (Brand Protection + iConvert + POPS + Meta + TradeDesk)
-- Combines data from overview_brandprotection_affilka, overview_iconvert_affilka, overview_pops_affilka, overview_meta_affilka, and tradedesk_stats_custom
-- Returns standardized fields: data_source, date, partner_name, partner_id, spend, impressions, clicks, regs, ftds, deps, deposit_sum, ngr, ngr_0, brand, geo

-- overview_brandprotection_affilka
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
```
</details>

---

#### overview_brandprotection_affilka

**Full Name**: `level-hope-462409-a8.reports.overview_brandprotection_affilka`
**Created**: 2025-09-18 09:57:30.233000+00:00
**Modified**: 2025-09-18 10:04:03.331000+00:00

**Dependencies**: This view depends on 3 object(s):
- `level-hope-462409-a8.affilka.mkt_platin`
- `level-hope-462409-a8.affilka.mkt_tycoon`
- `level-hope-462409-a8.level-hope-462409-a8.affilka`

**Schema**:

| Column Name | Type | Mode | Description |
|-------------|------|------|-------------|
| date | DATE | NULLABLE |  |
| partner_id | STRING | NULLABLE |  |
| partner_name | STRING | NULLABLE |  |
| utm_campaign | STRING | NULLABLE |  |
| campaign_name | STRING | NULLABLE |  |
| visits_count | INTEGER | NULLABLE |  |
| casino_ggr | NUMERIC | NULLABLE |  |
| casino_ngr | NUMERIC | NULLABLE |  |
| regs | INTEGER | NULLABLE |  |
| ftds | INTEGER | NULLABLE |  |
| ftd_value | NUMERIC | NULLABLE |  |
| deps | INTEGER | NULLABLE |  |
| deposit_sum | NUMERIC | NULLABLE |  |
| real_ngr_amount | NUMERIC | NULLABLE |  |
| sb_real_ngr_amount | NUMERIC | NULLABLE |  |
| admin_fee_amount | NUMERIC | NULLABLE |  |
| sb_admin_fee_amount | NUMERIC | NULLABLE |  |
| ngr | NUMERIC | NULLABLE |  |
| brand_id | STRING | NULLABLE |  |
| brand | STRING | NULLABLE |  |
| geo | STRING | NULLABLE |  |
| first_deposit_day | DATE | NULLABLE |  |
| ngr_0_amount | NUMERIC | NULLABLE |  |


<details>
<summary><b>View SQL Query</b> (click to expand)</summary>

```sql
-- BigQuery View: Brand Protection Affilka Union (Platin + Tycoon)
-- Combines data from both mkt_platin and mkt_tycoon tables with custom field extractions for Brand Protection
SELECT 
  date,
  partner_id,
  -- Map partner_id to company name using CASE statement
  CASE 
    WHEN partner_id = "30842" THEN "de_ps_bp-seo"
    WHEN partner_id = "24408" THEN "de_pc_bp-seo"
    ELSE CONCAT("unknown_partner", partner_id)
  END AS partner_name,
  dynamic_tag_utm_campaign AS utm_campaign,
  REGEXP_EXTRACT(campaign_name, r'^([^\s]+)') AS campaign_name,
  visits_count,
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
WHERE partner_id IN ("30842", "24408")  -- Brand Protection Platin partner IDs

UNION ALL

SELECT 
  date,
  partner_id,
  -- Map partner_id to company name using CASE statement
  CASE 
    WHEN partner_id = "24526" THEN "bp_bp-seo"
    WHEN partner_id = "13412" THEN "lc_bp-seo"
    ELSE CONCAT("unknown_partner", partner_id)
  END AS partner_name,
  dynamic_tag_utm_campaign AS utm_campaign,
  REGEXP_EXTRACT(campaign_name, r'^([^\s]+)') AS campaign_name,
  visits_count,
  
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
WHERE partner_id IN ("24526", "13412")  -- Brand Protection Tycoon partner IDs
```
</details>

---

#### overview_iconvert_affilka

**Full Name**: `level-hope-462409-a8.reports.overview_iconvert_affilka`
**Created**: 2025-09-18 08:17:55.627000+00:00
**Modified**: 2025-09-18 10:12:09.656000+00:00

**Dependencies**: This view depends on 3 object(s):
- `level-hope-462409-a8.affilka.mkt_platin`
- `level-hope-462409-a8.affilka.mkt_tycoon`
- `level-hope-462409-a8.level-hope-462409-a8.affilka`

**Schema**:

| Column Name | Type | Mode | Description |
|-------------|------|------|-------------|
| date | DATE | NULLABLE |  |
| partner_id | STRING | NULLABLE |  |
| partner_name | STRING | NULLABLE |  |
| utm_campaign | STRING | NULLABLE |  |
| visits_count | INTEGER | NULLABLE |  |
| campaign_name | STRING | NULLABLE |  |
| casino_ggr | NUMERIC | NULLABLE |  |
| casino_ngr | NUMERIC | NULLABLE |  |
| regs | INTEGER | NULLABLE |  |
| ftds | INTEGER | NULLABLE |  |
| ftd_value | NUMERIC | NULLABLE |  |
| deps | INTEGER | NULLABLE |  |
| deposit_sum | NUMERIC | NULLABLE |  |
| real_ngr_amount | NUMERIC | NULLABLE |  |
| sb_real_ngr_amount | NUMERIC | NULLABLE |  |
| admin_fee_amount | NUMERIC | NULLABLE |  |
| sb_admin_fee_amount | NUMERIC | NULLABLE |  |
| ngr | NUMERIC | NULLABLE |  |
| brand_id | STRING | NULLABLE |  |
| brand | STRING | NULLABLE |  |
| geo | STRING | NULLABLE |  |
| first_deposit_day | DATE | NULLABLE |  |
| ngr_0_amount | NUMERIC | NULLABLE |  |


<details>
<summary><b>View SQL Query</b> (click to expand)</summary>

```sql
-- BigQuery View: iConvert Affilka Union (Platin + Tycoon)
-- Combines data from both mkt_platin and mkt_tycoon tables with custom field extractions for iConvert
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
```
</details>

---

#### overview_iconvert_affilka-ga4

**Full Name**: `level-hope-462409-a8.reports.overview_iconvert_affilka-ga4`
**Created**: 2025-09-19 08:27:33.333000+00:00
**Modified**: 2025-09-26 11:30:42.727000+00:00

**Dependencies**: This view depends on 5 object(s):
- `level-hope-462409-a8.affilka.mkt_platin`
- `level-hope-462409-a8.affilka.mkt_tycoon`
- `level-hope-462409-a8.ga_analytics.ga_analytics_union`
- `level-hope-462409-a8.level-hope-462409-a8.affilka`
- `level-hope-462409-a8.level-hope-462409-a8.ga_analytics`

**Schema**:

| Column Name | Type | Mode | Description |
|-------------|------|------|-------------|
| date | STRING | NULLABLE |  |
| geo | STRING | NULLABLE |  |
| utm_campaign | STRING | NULLABLE |  |
| casino_ggr | NUMERIC | NULLABLE |  |
| casino_ngr | NUMERIC | NULLABLE |  |
| regs | INTEGER | NULLABLE |  |
| ftds | INTEGER | NULLABLE |  |
| ftd_value | NUMERIC | NULLABLE |  |
| deps | INTEGER | NULLABLE |  |
| deposit_sum | NUMERIC | NULLABLE |  |
| real_ngr_amount | NUMERIC | NULLABLE |  |
| sb_real_ngr_amount | NUMERIC | NULLABLE |  |
| admin_fee_amount | NUMERIC | NULLABLE |  |
| sb_admin_fee_amount | NUMERIC | NULLABLE |  |
| ngr | NUMERIC | NULLABLE |  |
| ngr_0_amount | NUMERIC | NULLABLE |  |
| ga4_iconvert_clicks | INTEGER | NULLABLE |  |
| ga4_iconvert_shows | INTEGER | NULLABLE |  |


<details>
<summary><b>View SQL Query</b> (click to expand)</summary>

```sql
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
```
</details>

---

#### overview_meta_affilka

**Full Name**: `level-hope-462409-a8.reports.overview_meta_affilka`
**Created**: 2025-09-19 08:02:08.039000+00:00
**Modified**: 2025-10-27 11:45:48.128000+00:00

**Dependencies**: This view depends on 6 object(s):
- `level-hope-462409-a8.affilka.meta_affilka_union`
- `level-hope-462409-a8.level-hope-462409-a8.affilka`
- `level-hope-462409-a8.level-hope-462409-a8.mkt_channels`
- `level-hope-462409-a8.marketing.first_deposit_day`
- `level-hope-462409-a8.mkt_channels.meta_stats_custom`
- `level-hope-462409-a8.mkt_channels.meta_targeting`

**Schema**:

| Column Name | Type | Mode | Description |
|-------------|------|------|-------------|
| date | DATE | NULLABLE |  |
| account_id | STRING | NULLABLE |  |
| spend | NUMERIC | NULLABLE |  |
| impressions | NUMERIC | NULLABLE |  |
| clicks | NUMERIC | NULLABLE |  |
| reach | NUMERIC | NULLABLE |  |
| frequency | NUMERIC | NULLABLE |  |
| publisher_platform | STRING | NULLABLE |  |
| platform_position | STRING | NULLABLE |  |
| device_platform | STRING | NULLABLE |  |
| purchaseplus_s2s_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_s2s_total | NUMERIC | NULLABLE |  |
| purchaseplus_1d_view_s2s_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_1d_view_s2s_total | NUMERIC | NULLABLE |  |
| purchaseplus_1d_click_s2s_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_1d_click_s2s_total | NUMERIC | NULLABLE |  |
| purchaseplus_1d_click_s2s_bp_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_1d_click_s2s_bp_total | NUMERIC | NULLABLE |  |
| purchaseplus_1d_click_s2s_pc_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_1d_click_s2s_pc_total | NUMERIC | NULLABLE |  |
| purchaseplus_1d_view_s2s_bp_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_1d_view_s2s_bp_total | NUMERIC | NULLABLE |  |
| purchaseplus_1d_view_s2s_pc_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_1d_view_s2s_pc_total | NUMERIC | NULLABLE |  |
| purchaseplus_7d_click_s2s_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_7d_click_s2s_total | NUMERIC | NULLABLE |  |
| purchaseplus_7d_click_s2s_bp_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_7d_click_s2s_bp_total | NUMERIC | NULLABLE |  |
| purchaseplus_7d_click_s2s_pc_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_7d_click_s2s_pc_total | NUMERIC | NULLABLE |  |
| purchaseplus_7d_view_s2s_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_7d_view_s2s_total | NUMERIC | NULLABLE |  |
| purchaseplus_7d_view_s2s_bp_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_7d_view_s2s_bp_total | NUMERIC | NULLABLE |  |
| purchaseplus_7d_view_s2s_pc_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_7d_view_s2s_pc_total | NUMERIC | NULLABLE |  |
| purchase_1d_click_s2s_total | NUMERIC | NULLABLE |  |
| purchase_val_1d_click_s2s_total | NUMERIC | NULLABLE |  |
| purchase_1d_click_s2s_bp_total | NUMERIC | NULLABLE |  |
| purchase_val_1d_click_s2s_bp_total | NUMERIC | NULLABLE |  |
| purchase_1d_click_s2s_pc_total | NUMERIC | NULLABLE |  |
| purchase_val_1d_click_s2s_pc_total | NUMERIC | NULLABLE |  |
| purchase_1d_view_s2s_total | NUMERIC | NULLABLE |  |
| purchase_val_1d_view_s2s_total | NUMERIC | NULLABLE |  |
| purchase_1d_view_s2s_bp_total | NUMERIC | NULLABLE |  |
| purchase_val_1d_view_s2s_bp_total | NUMERIC | NULLABLE |  |
| purchase_1d_view_s2s_pc_total | NUMERIC | NULLABLE |  |
| purchase_val_1d_view_s2s_pc_total | NUMERIC | NULLABLE |  |
| purchase_s2s_pc_total | NUMERIC | NULLABLE |  |
| purchase_val_s2s_pc_total | NUMERIC | NULLABLE |  |
| purchase_s2s_bp_total | NUMERIC | NULLABLE |  |
| purchase_val_s2s_bp_total | NUMERIC | NULLABLE |  |
| purchaseplus_s2s_bp_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_s2s_bp_total | NUMERIC | NULLABLE |  |
| purchaseplus_s2s_pc_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_s2s_pc_total | NUMERIC | NULLABLE |  |
| brand_from_meta | STRING | NULLABLE |  |
| purchase_7d_click_1d_view_s2s_total | NUMERIC | NULLABLE |  |
| purchase_val_7d_click_1d_view_s2s_total | NUMERIC | NULLABLE |  |
| purchase_1d_click_1d_view_s2s_total | NUMERIC | NULLABLE |  |
| purchase_val_1d_click_1d_view_s2s_total | NUMERIC | NULLABLE |  |
| purchase_7d_click_1d_view_s2s_brand_total | NUMERIC | NULLABLE |  |
| purchase_val_7d_click_1d_view_s2s_brand_total | NUMERIC | NULLABLE |  |
| purchase_1d_click_1d_view_s2s_brand_total | NUMERIC | NULLABLE |  |
| purchase_val_1d_click_1d_view_s2s_brand_total | NUMERIC | NULLABLE |  |
| purchaseplus_7d_click_1d_view_s2s_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_7d_click_1d_view_s2s_total | NUMERIC | NULLABLE |  |
| purchaseplus_1d_click_1d_view_s2s_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_1d_click_1d_view_s2s_total | NUMERIC | NULLABLE |  |
| purchaseplus_7d_click_1d_view_s2s_brand_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_7d_click_1d_view_s2s_brand_total | NUMERIC | NULLABLE |  |
| purchaseplus_1d_click_1d_view_s2s_brand_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_1d_click_1d_view_s2s_brand_total | NUMERIC | NULLABLE |  |
| purchaseplus_7d_click_1d_view_first_conversion_s2s_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_7d_click_1d_view_first_conversion_s2s_total | NUMERIC | NULLABLE |  |
| purchaseplus_1d_click_1d_view_first_conversion_s2s_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_1d_click_1d_view_first_conversion_s2s_total | NUMERIC | NULLABLE |  |
| purchaseplus_7d_click_1d_view_first_conversion_s2s_brand_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_7d_click_1d_view_first_conversion_s2s_brand_total | NUMERIC | NULLABLE |  |
| purchaseplus_1d_click_1d_view_first_conversion_s2s_brand_total | NUMERIC | NULLABLE |  |
| purchaseplus_val_1d_click_1d_view_first_conversion_s2s_brand_total | NUMERIC | NULLABLE |  |
| date_start | DATE | NULLABLE |  |
| utm_campaign | STRING | NULLABLE |  |
| casino_ggr | NUMERIC | NULLABLE |  |
| casino_ngr | NUMERIC | NULLABLE |  |
| regs | INTEGER | NULLABLE |  |
| ftds | INTEGER | NULLABLE |  |
| ftd_amount | NUMERIC | NULLABLE |  |
| deps | INTEGER | NULLABLE |  |
| deposit_sum | NUMERIC | NULLABLE |  |
| real_ngr_amount | NUMERIC | NULLABLE |  |
| sb_real_ngr_amount | NUMERIC | NULLABLE |  |
| admin_fee_amount | NUMERIC | NULLABLE |  |
| sb_admin_fee_amount | NUMERIC | NULLABLE |  |
| depositing_players | INTEGER | NULLABLE |  |
| ngr | NUMERIC | NULLABLE |  |
| ngr_0 | NUMERIC | NULLABLE |  |
| campaign_name_custom | STRING | NULLABLE |  |
| adset_name_custom | STRING | NULLABLE |  |
| adname_custom | STRING | NULLABLE |  |
| brand | STRING | NULLABLE |  |
| brand_name | STRING | NULLABLE |  |
| geo | STRING | NULLABLE |  |
| partner_name | STRING | NULLABLE |  |
| strategy | STRING | NULLABLE |  |
| sub_strategy | STRING | NULLABLE |  |
| cohort | STRING | NULLABLE |  |
| geo_countries | STRING | NULLABLE |  |
| tsl_custom_audience | STRING | NULLABLE |  |
| tsl_excluding_custom_audience | STRING | NULLABLE |  |
| tsl_location | STRING | NULLABLE |  |
| tsl_age | STRING | NULLABLE |  |
| tsl_gender | STRING | NULLABLE |  |
| tsl_placements | STRING | NULLABLE |  |
| tsl_languages | STRING | NULLABLE |  |
| tsl_interests | STRING | NULLABLE |  |
| tsl_behaviors | STRING | NULLABLE |  |
| tsl_connections | STRING | NULLABLE |  |
| tsl_advantage_custom_audience | STRING | NULLABLE |  |
| tsl_advantage_audience | STRING | NULLABLE |  |
| tsl_other | STRING | NULLABLE |  |
| campaign_configured_status | STRING | NULLABLE |  |
| campaign_effective_status | STRING | NULLABLE |  |
| adset_configured_status | STRING | NULLABLE |  |
| adset_effective_status | STRING | NULLABLE |  |


<details>
<summary><b>View SQL Query</b> (click to expand)</summary>

```sql
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
  -- Get the latest targeting info for each campaign/adset combination
  SELECT 
    campaign_name,
    adset_name,
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
    ROW_NUMBER() OVER (PARTITION BY campaign_name, adset_name ORDER BY retrieved_at DESC) AS rn
  FROM `level-hope-462409-a8.mkt_channels.meta_targeting`
  WHERE campaign_name IS NOT NULL AND adset_name IS NOT NULL
),

targeting_deduplicated AS (
  -- Keep only the most recent targeting data per campaign/adset
  SELECT 
    campaign_name,
    adset_name,
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
    adset_effective_status
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
  targeting.adset_effective_status

FROM marketing_aggregated marketing
FULL OUTER JOIN meta_aggregated meta
  ON meta.campaign_name_custom = marketing.campaign_name_custom
  AND meta.adset_name_custom = marketing.adset_name_custom
  AND meta.adname_custom = marketing.adname_custom
  AND meta.date_start = marketing.date
LEFT JOIN targeting_deduplicated targeting
  ON LOWER(targeting.campaign_name) = LOWER(COALESCE(meta.campaign_name_custom, marketing.campaign_name_custom))
  AND LOWER(targeting.adset_name) = LOWER(COALESCE(meta.adset_name_custom, marketing.adset_name_custom))
```
</details>

---

#### overview_pops_affilka

**Full Name**: `level-hope-462409-a8.reports.overview_pops_affilka`
**Created**: 2025-09-19 07:43:35.216000+00:00
**Modified**: 2025-09-23 12:24:08.802000+00:00

**Dependencies**: This view depends on 5 object(s):
- `level-hope-462409-a8.affilka.pops_affilka_union`
- `level-hope-462409-a8.level-hope-462409-a8.affilka`
- `level-hope-462409-a8.level-hope-462409-a8.mkt_channels`
- `level-hope-462409-a8.marketing.first_deposit_day`
- `level-hope-462409-a8.mkt_channels.pops_stats_custom`

**Schema**:

| Column Name | Type | Mode | Description |
|-------------|------|------|-------------|
| date | DATE | NULLABLE |  |
| channel | STRING | NULLABLE |  |
| spend | FLOAT | NULLABLE |  |
| impressions | INTEGER | NULLABLE |  |
| clicks | INTEGER | NULLABLE |  |
| conversions | INTEGER | NULLABLE |  |
| conversion_value | FLOAT | NULLABLE |  |
| partner_id | STRING | NULLABLE |  |
| utm_campaign | STRING | NULLABLE |  |
| casino_ggr | NUMERIC | NULLABLE |  |
| casino_ngr | NUMERIC | NULLABLE |  |
| regs | INTEGER | NULLABLE |  |
| ftds | INTEGER | NULLABLE |  |
| deps | INTEGER | NULLABLE |  |
| deposit_sum | NUMERIC | NULLABLE |  |
| real_ngr_amount | NUMERIC | NULLABLE |  |
| sb_real_ngr_amount | NUMERIC | NULLABLE |  |
| admin_fee_amount | NUMERIC | NULLABLE |  |
| sb_admin_fee_amount | NUMERIC | NULLABLE |  |
| ngr | NUMERIC | NULLABLE |  |
| ngr_0 | NUMERIC | NULLABLE |  |
| campaign_name_custom | STRING | NULLABLE |  |
| ftd-s2s | INTEGER | NULLABLE |  |
| deposit-s2s | INTEGER | NULLABLE |  |
| reg-s2s | INTEGER | NULLABLE |  |
| ftd-s2s_val | FLOAT | NULLABLE |  |
| deposit-s2s_val | FLOAT | NULLABLE |  |
| reg-s2s_val | FLOAT | NULLABLE |  |
| brand | STRING | NULLABLE |  |
| brand_name | STRING | NULLABLE |  |
| geo | STRING | NULLABLE |  |
| partner_name | STRING | NULLABLE |  |
| media_type | STRING | NULLABLE |  |
| channel_name | STRING | NULLABLE |  |
| cohort | STRING | NULLABLE |  |


<details>
<summary><b>View SQL Query</b> (click to expand)</summary>

```sql
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
```
</details>

---

## tradedesk

**Location**: US
**Created**: 2025-09-22 12:09:52.692000+00:00
**Modified**: 2025-09-22 12:11:20.322000+00:00

**Tables**: 4 | **Views**: 2

### Tables in tradedesk

#### ID41_backfill

**Full Name**: `level-hope-462409-a8.tradedesk.ID41_backfill`
**Rows**: 255,244
**Size**: 77.43 MB
**Created**: 2025-10-09 12:25:19.271000+00:00
**Modified**: 2025-10-09 12:25:19.271000+00:00

**Schema**:

| Column Name | Type | Mode | Description |
|-------------|------|------|-------------|
| td1 | STRING | NULLABLE |  |
| tracking_tag_name | STRING | NULLABLE |  |
| conversion_time | STRING | NULLABLE |  |
| last_display_click_ad_group_id | STRING | NULLABLE |  |
| last_display_click_ad_group_name | STRING | NULLABLE |  |
| last_display_click_campaign_id | STRING | NULLABLE |  |
| last_display_click_campaign_name | STRING | NULLABLE |  |
| last_display_click_creative_id | STRING | NULLABLE |  |
| last_display_click_creative_name | STRING | NULLABLE |  |
| last_display_click_time | STRING | NULLABLE |  |
| last_impression_ad_group_id | STRING | NULLABLE |  |
| last_impression_ad_group_name | STRING | NULLABLE |  |
| last_impression_campaign_id | STRING | NULLABLE |  |
| last_impression_campaign_name | STRING | NULLABLE |  |
| last_impression_creative_id | STRING | NULLABLE |  |
| last_impression_creative_name | STRING | NULLABLE |  |
| last_impression_site | STRING | NULLABLE |  |
| last_impression_time | STRING | NULLABLE |  |
| last_non_display_click_campaign_id | STRING | NULLABLE |  |
| last_non_display_click_campaign_name | STRING | NULLABLE |  |
| last_non_display_click_keyword | STRING | NULLABLE |  |
| last_non_display_click_time | STRING | NULLABLE |  |
| impression_count | INTEGER | NULLABLE |  |
| display_click_count | INTEGER | NULLABLE |  |
| non_display_click_count | INTEGER | NULLABLE |  |

---

#### ID41_conv_daily

**Full Name**: `level-hope-462409-a8.tradedesk.ID41_conv_daily`
**Rows**: 28,868
**Size**: 9.01 MB
**Created**: 2025-09-25 13:49:05.093000+00:00
**Modified**: 2025-10-27 13:31:24.696000+00:00

**Schema**:

| Column Name | Type | Mode | Description |
|-------------|------|------|-------------|
| td1 | STRING | NULLABLE |  |
| tracking_tag_name | STRING | NULLABLE |  |
| conversion_time | STRING | NULLABLE |  |
| last_display_click_ad_group_id | STRING | NULLABLE |  |
| last_display_click_ad_group_name | STRING | NULLABLE |  |
| last_display_click_campaign_id | STRING | NULLABLE |  |
| last_display_click_campaign_name | STRING | NULLABLE |  |
| last_display_click_creative_id | STRING | NULLABLE |  |
| last_display_click_creative_name | STRING | NULLABLE |  |
| last_display_click_time | STRING | NULLABLE |  |
| last_impression_ad_group_id | STRING | NULLABLE |  |
| last_impression_ad_group_name | STRING | NULLABLE |  |
| last_impression_campaign_id | STRING | NULLABLE |  |
| last_impression_campaign_name | STRING | NULLABLE |  |
| last_impression_creative_id | STRING | NULLABLE |  |
| last_impression_creative_name | STRING | NULLABLE |  |
| last_impression_site | STRING | NULLABLE |  |
| last_impression_time | STRING | NULLABLE |  |
| last_non_display_click_campaign_id | STRING | NULLABLE |  |
| last_non_display_click_campaign_name | STRING | NULLABLE |  |
| last_non_display_click_keyword | STRING | NULLABLE |  |
| last_non_display_click_time | STRING | NULLABLE |  |
| impression_count | INTEGER | NULLABLE |  |
| display_click_count | INTEGER | NULLABLE |  |
| non_display_click_count | INTEGER | NULLABLE |  |

---

#### ID42_backfill

**Full Name**: `level-hope-462409-a8.tradedesk.ID42_backfill`
**Rows**: 91,558
**Size**: 28.63 MB
**Created**: 2025-10-09 12:27:56.401000+00:00
**Modified**: 2025-10-09 12:27:56.401000+00:00

**Schema**:

| Column Name | Type | Mode | Description |
|-------------|------|------|-------------|
| Date | STRING | NULLABLE | Original date as DD/MM/YYYY |
| Ad_Group_ID | STRING | NULLABLE | Ad Group identifier |
| Ad_Group | STRING | NULLABLE | Ad Group name |
| Campaign_ID | STRING | NULLABLE | Campaign identifier |
| Campaign | STRING | NULLABLE | Campaign name |
| Creative | STRING | NULLABLE | Creative name |
| Creative_ID | STRING | NULLABLE | Creative identifier |
| Advertiser_Cost_USD | FLOAT | NULLABLE | Advertiser cost in USD |
| Bids | INTEGER | NULLABLE | Number of bids |
| Impressions | INTEGER | NULLABLE | Number of impressions |
| Clicks | INTEGER | NULLABLE | Number of clicks |
| Sampled_Tracked_Impressions | INTEGER | NULLABLE | Sampled tracked impressions |
| Sampled_Viewed_Impressions | INTEGER | NULLABLE | Sampled viewed impressions |
| Click_Conversion_01 | INTEGER | NULLABLE | 01 - Click Conversion |
| Click_Conversion_02 | INTEGER | NULLABLE | 02 - Click Conversion |
| Click_Conversion_03 | INTEGER | NULLABLE | 03 - Click Conversion |
| Total_Click_View_Conversions_01 | INTEGER | NULLABLE | 01 - Total Click + View Conversions |
| Total_Click_View_Conversions_02 | INTEGER | NULLABLE | 02 - Total Click + View Conversions |
| Total_Click_View_Conversions_03 | INTEGER | NULLABLE | 03 - Total Click + View Conversions |
| View_Through_Conversion_01 | INTEGER | NULLABLE | 01 - View Through Conversion |
| View_Through_Conversion_02 | INTEGER | NULLABLE | 02 - View Through Conversion |
| View_Through_Conversion_03 | INTEGER | NULLABLE | 03 - View Through Conversion |

---

#### ID42_performance_daily

**Full Name**: `level-hope-462409-a8.tradedesk.ID42_performance_daily`
**Rows**: 30,710
**Size**: 9.28 MB
**Created**: 2025-09-29 08:52:24.077000+00:00
**Modified**: 2025-10-27 08:40:25.135000+00:00

**Schema**:

| Column Name | Type | Mode | Description |
|-------------|------|------|-------------|
| Date | STRING | NULLABLE | Original date as DD/MM/YYYY |
| Ad_Group_ID | STRING | NULLABLE | Ad Group identifier |
| Ad_Group | STRING | NULLABLE | Ad Group name |
| Campaign_ID | STRING | NULLABLE | Campaign identifier |
| Campaign | STRING | NULLABLE | Campaign name |
| Creative | STRING | NULLABLE | Creative name |
| Creative_ID | STRING | NULLABLE | Creative identifier |
| Advertiser_Cost_USD | FLOAT | NULLABLE | Advertiser cost in USD |
| Bids | INTEGER | NULLABLE | Number of bids |
| Impressions | INTEGER | NULLABLE | Number of impressions |
| Clicks | INTEGER | NULLABLE | Number of clicks |
| Sampled_Tracked_Impressions | INTEGER | NULLABLE | Sampled tracked impressions |
| Sampled_Viewed_Impressions | INTEGER | NULLABLE | Sampled viewed impressions |
| Click_Conversion_01 | INTEGER | NULLABLE | 01 - Click Conversion |
| Click_Conversion_02 | INTEGER | NULLABLE | 02 - Click Conversion |
| Click_Conversion_03 | INTEGER | NULLABLE | 03 - Click Conversion |
| Total_Click_View_Conversions_01 | INTEGER | NULLABLE | 01 - Total Click + View Conversions |
| Total_Click_View_Conversions_02 | INTEGER | NULLABLE | 02 - Total Click + View Conversions |
| Total_Click_View_Conversions_03 | INTEGER | NULLABLE | 03 - Total Click + View Conversions |
| View_Through_Conversion_01 | INTEGER | NULLABLE | 01 - View Through Conversion |
| View_Through_Conversion_02 | INTEGER | NULLABLE | 02 - View Through Conversion |
| View_Through_Conversion_03 | INTEGER | NULLABLE | 03 - View Through Conversion |

---

### Views in tradedesk

#### ID41

**Full Name**: `level-hope-462409-a8.tradedesk.ID41`
**Created**: 2025-10-09 12:31:26.474000+00:00
**Modified**: 2025-10-09 12:31:26.706000+00:00

**Dependencies**: This view depends on 3 object(s):
- `level-hope-462409-a8.level-hope-462409-a8.tradedesk`
- `level-hope-462409-a8.tradedesk.ID41_backfill`
- `level-hope-462409-a8.tradedesk.ID41_conv_daily`

**Schema**:

| Column Name | Type | Mode | Description |
|-------------|------|------|-------------|
| td1 | STRING | NULLABLE |  |
| tracking_tag_name | STRING | NULLABLE |  |
| conversion_time | STRING | NULLABLE |  |
| last_display_click_ad_group_id | STRING | NULLABLE |  |
| last_display_click_ad_group_name | STRING | NULLABLE |  |
| last_display_click_campaign_id | STRING | NULLABLE |  |
| last_display_click_campaign_name | STRING | NULLABLE |  |
| last_display_click_creative_id | STRING | NULLABLE |  |
| last_display_click_creative_name | STRING | NULLABLE |  |
| last_display_click_time | STRING | NULLABLE |  |
| last_impression_ad_group_id | STRING | NULLABLE |  |
| last_impression_ad_group_name | STRING | NULLABLE |  |
| last_impression_campaign_id | STRING | NULLABLE |  |
| last_impression_campaign_name | STRING | NULLABLE |  |
| last_impression_creative_id | STRING | NULLABLE |  |
| last_impression_creative_name | STRING | NULLABLE |  |
| last_impression_site | STRING | NULLABLE |  |
| last_impression_time | STRING | NULLABLE |  |
| last_non_display_click_campaign_id | STRING | NULLABLE |  |
| last_non_display_click_campaign_name | STRING | NULLABLE |  |
| last_non_display_click_keyword | STRING | NULLABLE |  |
| last_non_display_click_time | STRING | NULLABLE |  |
| impression_count | INTEGER | NULLABLE |  |
| display_click_count | INTEGER | NULLABLE |  |
| non_display_click_count | INTEGER | NULLABLE |  |


<details>
<summary><b>View SQL Query</b> (click to expand)</summary>

```sql
SELECT * FROM `level-hope-462409-a8.tradedesk.ID41_backfill` 
UNION ALL
SELECT * FROM `level-hope-462409-a8.tradedesk.ID41_conv_daily` 

```
</details>

---

#### ID42

**Full Name**: `level-hope-462409-a8.tradedesk.ID42`
**Created**: 2025-10-09 12:31:46.919000+00:00
**Modified**: 2025-10-09 12:31:47.144000+00:00

**Dependencies**: This view depends on 3 object(s):
- `level-hope-462409-a8.level-hope-462409-a8.tradedesk`
- `level-hope-462409-a8.tradedesk.ID42_backfill`
- `level-hope-462409-a8.tradedesk.ID42_performance_daily`

**Schema**:

| Column Name | Type | Mode | Description |
|-------------|------|------|-------------|
| Date | STRING | NULLABLE |  |
| Ad_Group_ID | STRING | NULLABLE |  |
| Ad_Group | STRING | NULLABLE |  |
| Campaign_ID | STRING | NULLABLE |  |
| Campaign | STRING | NULLABLE |  |
| Creative | STRING | NULLABLE |  |
| Creative_ID | STRING | NULLABLE |  |
| Advertiser_Cost_USD | FLOAT | NULLABLE |  |
| Bids | INTEGER | NULLABLE |  |
| Impressions | INTEGER | NULLABLE |  |
| Clicks | INTEGER | NULLABLE |  |
| Sampled_Tracked_Impressions | INTEGER | NULLABLE |  |
| Sampled_Viewed_Impressions | INTEGER | NULLABLE |  |
| Click_Conversion_01 | INTEGER | NULLABLE |  |
| Click_Conversion_02 | INTEGER | NULLABLE |  |
| Click_Conversion_03 | INTEGER | NULLABLE |  |
| Total_Click_View_Conversions_01 | INTEGER | NULLABLE |  |
| Total_Click_View_Conversions_02 | INTEGER | NULLABLE |  |
| Total_Click_View_Conversions_03 | INTEGER | NULLABLE |  |
| View_Through_Conversion_01 | INTEGER | NULLABLE |  |
| View_Through_Conversion_02 | INTEGER | NULLABLE |  |
| View_Through_Conversion_03 | INTEGER | NULLABLE |  |


<details>
<summary><b>View SQL Query</b> (click to expand)</summary>

```sql
SELECT * FROM `level-hope-462409-a8.tradedesk.ID42_backfill` 
UNION ALL
SELECT * FROM `level-hope-462409-a8.tradedesk.ID42_performance_daily` 
```
</details>

---
