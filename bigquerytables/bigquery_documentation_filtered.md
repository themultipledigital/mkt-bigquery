# BigQuery Project Documentation: level-hope-462409-a8 (Filtered)

_Generated automatically from BigQuery metadata - Filtered for specific tables_

## Summary

- **Total Datasets**: 2
- **Total Tables**: 4
- **Total Views**: 1
- **Total Objects**: 5

### Tables Documented
- `mkt_channels.exo_stats`
- `mkt_channels.meta_stats`
- `mkt_channels.tj_campaign_stats`
- `mkt_channels.ts_stats_siteid`

### Views Documented
- `tradedesk.ID42`

## Join Keys and Hierarchies

This section explains the hierarchical structure and join keys for each table, based on how they're used in reporting views like `overview_meta_affilka` and `cohort_meta_affilka`.

### meta_stats
**Hierarchy:** Campaign → AdSet → Ad

**Join Keys:**
- **Campaign Level:** `campaign_name_custom` + `date_start`
- **AdSet Level:** `campaign_name_custom` + `adset_name_custom` + `date_start`
- **Ad Level (Full Granularity):** `campaign_name_custom` + `adset_name_custom` + `adname_custom` + `date_start`

**Note:** The `*_custom` fields are created by applying transformations to the raw campaign_name, adset_name, and ad_name (LOWER, TRIM, and conditional logic). These cleaned fields are used for joining with conversion/CRM data.

**How to Join with Affilka Data:**

The Meta UTM structure is: `utm_campaign={{campaign.name}}_{{adset.name}}_{{ad.name}}`

In Affilka data, the full UTM campaign string contains all three levels concatenated with underscores. To join:

```sql
-- Extract campaign/adset/ad from Affilka utm_campaign
WITH affilka_parsed AS (
  SELECT 
    utm_campaign,
    LOWER(TRIM(SPLIT(utm_campaign, '_')[SAFE_OFFSET(0)])) AS campaign_name_custom,
    LOWER(TRIM(SPLIT(utm_campaign, '_')[SAFE_OFFSET(1)])) AS adset_name_custom,
    LOWER(TRIM(SPLIT(utm_campaign, '_')[SAFE_OFFSET(2)])) AS adname_custom,
    date,
    regs, ftds, deps, deposit_sum, ngr
  FROM affilka_data
)

-- Join with meta_stats at ad level
SELECT 
  m.campaign_name_custom,
  m.adset_name_custom,
  m.adname_custom,
  m.date_start,
  m.spend,
  m.impressions,
  m.clicks,
  a.regs,
  a.ftds,
  a.deps
FROM `level-hope-462409-a8.mkt_channels.meta_stats_custom` m
LEFT JOIN affilka_parsed a
  ON m.campaign_name_custom = a.campaign_name_custom
  AND m.adset_name_custom = a.adset_name_custom
  AND m.adname_custom = a.adname_custom
  AND m.date_start = a.date
```

### exo_stats  
**Hierarchy:** Campaign → Site → Variation

**Join Keys:**
- **Campaign Level:** `campaign_id` or `campaign_name` + `date`
- **Site Level:** `campaign_id` + `site_id` + `date`
- **Variation Level (Full Granularity):** `campaign_id` + `site_id` + `variation_id` + `date`

**Alternative Identifiers:** Can also use `site_hostname` instead of `site_id` for site-level joins

**How to Join with Affilka Data:**

The ExoClick UTM structure is: `utm_campaign=de_pc_dsp-exo_psp_mob_ios-xvideos_excl-none_300x100`

The entire `utm_campaign` value in Affilka corresponds to the campaign identifier. Additionally, the `siteid={zone_id}` parameter maps to ExoClick's `site_id`.

```sql
-- Join ExoClick performance with Affilka conversions
SELECT 
  e.campaign_name,
  e.site_id,
  e.date,
  e.impressions,
  e.clicks,
  e.cost,
  a.regs,
  a.ftds,
  a.deps,
  a.deposit_sum
FROM `level-hope-462409-a8.mkt_channels.exo_stats` e
LEFT JOIN affilka_data a
  ON LOWER(TRIM(e.campaign_name)) = LOWER(TRIM(a.utm_campaign))
  AND e.site_id = a.siteid
  AND e.date = a.date
```

### tj_campaign_stats
**Hierarchy:** Campaign (single level)

**Join Keys:**
- **Campaign Level:** `campaign_id` or `campaign_name` + `date`

**Note:** This table only has campaign-level data, no ad set or creative breakdown

**How to Join with Affilka Data:**

The TrafficJunky UTM structure is: `utm_campaign=de_pc_pop-tj_psp_mob_ios-pornhub-straight_excl-none`

The entire `utm_campaign` value in Affilka corresponds to the campaign identifier. Additionally, the `siteid` parameter is fixed per campaign, and `tj_cid={ACLID}` is used for click tracking.

```sql
-- Join TrafficJunky performance with Affilka conversions
SELECT 
  t.campaign_name,
  t.date,
  t.impressions,
  t.clicks,
  t.cost,
  a.regs,
  a.ftds,
  a.deps,
  a.deposit_sum
FROM `level-hope-462409-a8.mkt_channels.tj_campaign_stats` t
LEFT JOIN affilka_data a
  ON LOWER(TRIM(t.campaign_name)) = LOWER(TRIM(a.utm_campaign))
  AND t.date = a.date
```

### ts_stats_siteid
**Hierarchy:** Campaign → Site → Banner

**Join Keys:**
- **Campaign Level:** `campaign_id` or `campaign_name` + `date`
- **Site Level:** `campaign_id` + `site_id` + `date`
- **Banner Level (Full Granularity):** `campaign_id` + `site_id` + `banner_id` + `date`

**How to Join with Affilka Data:**

**Note:** TrafficStars campaigns are not currently active. This table is maintained for historical completeness.

The TrafficStars UTM structure follows a similar pattern to other channels. The `utm_campaign` in Affilka would map to the campaign identifier, and `site_id` would be used as an additional join key.

```sql
-- Join TrafficStars performance with Affilka conversions (historical)
SELECT 
  ts.campaign_name,
  ts.site_id,
  ts.date,
  ts.impressions,
  ts.clicks,
  ts.cost,
  a.regs,
  a.ftds,
  a.deps
FROM `level-hope-462409-a8.mkt_channels.ts_stats_siteid` ts
LEFT JOIN affilka_data a
  ON LOWER(TRIM(ts.campaign_name)) = LOWER(TRIM(a.utm_campaign))
  AND ts.site_id = a.siteid
  AND ts.date = a.date
```

### tradedesk.ID42
**Hierarchy:** Campaign → Ad Group → Creative

**Join Keys:**
- **Campaign Level:** `Campaign_ID` or `Campaign` + `Date`
- **Ad Group Level:** `Campaign_ID` + `Ad_Group_ID` + `Date`
- **Creative Level (Full Granularity):** `Campaign_ID` + `Ad_Group_ID` + `Creative_ID` + `Date`

**Important:** Date format is `DD/MM/YYYY` (string), should be converted using `PARSE_DATE('%d/%m/%Y', Date)` for proper date operations

**How to Join with Affilka Data:**

Trade Desk has native conversion tracking built into the platform via conversion pixels and server-to-server (S2S) tracking. The conversion metrics (`Click_Conversion_01`, `View_Through_Conversion_01`, etc.) are already included in the ID42 view.

If you need to join Trade Desk performance with Affilka data for additional analysis:

```sql
-- Join Trade Desk performance with Affilka conversions
-- Note: Trade Desk already has its own conversion tracking
SELECT 
  td.Campaign,
  td.Ad_Group,
  PARSE_DATE('%d/%m/%Y', td.Date) AS date,
  td.Advertiser_Cost_USD,
  td.Impressions,
  td.Clicks,
  td.Click_Conversion_01 AS td_conversions,
  a.regs AS affilka_regs,
  a.ftds AS affilka_ftds,
  a.deps AS affilka_deps
FROM `level-hope-462409-a8.tradedesk.ID42` td
LEFT JOIN affilka_data a
  ON LOWER(TRIM(td.Campaign)) = LOWER(TRIM(a.utm_campaign))
  AND PARSE_DATE('%d/%m/%Y', td.Date) = a.date
WHERE PARSE_DATE('%d/%m/%Y', td.Date) >= '2025-09-01'
```

**Note:** Trade Desk conversions are tracked via their own attribution system, not through UTM parameters. The platform's native conversion data (Click_Conversion, View_Through_Conversion) is generally more reliable than external tracking for this channel.

### Best Practices for Joining with Affilka Data

1. **Always aggregate before joining** - Group by your join keys to prevent cartesian products
2. **Include date in join keys** - Most joins should include the date dimension
3. **Use FULL OUTER JOIN** when combining ad performance with conversion data to capture:
   - Days with spend but no conversions
   - Conversions that occur outside the active campaign window (attribution lag)
4. **Month-level aggregation** - For cohort analysis, aggregate to monthly level first to avoid many-to-many joins
5. **Use custom/cleaned fields** - Join on `*_custom` fields (lowercased, trimmed) rather than raw campaign names for consistency
6. **Parse UTM parameters correctly**:
   - **Meta:** Split `utm_campaign` by underscore to extract campaign/adset/ad: `SPLIT(utm_campaign, '_')`
   - **ExoClick/TrafficJunky/TrafficStars:** Use the entire `utm_campaign` as the campaign identifier
   - **Trade Desk:** Primarily relies on native conversion tracking, external joins are secondary
7. **Include site-level joins** when available:
   - ExoClick: Use `siteid` from UTM to join on `site_id`
   - TrafficStars: Use `siteid` from UTM to join on `site_id`
   - TrafficJunky: `siteid` is typically fixed per campaign
8. **Handle attribution windows** - Conversions may occur days after the ad interaction, consider using wider date ranges or window functions

## Table of Contents

- [Summary](#summary)
- [Join Keys and Hierarchies](#join-keys-and-hierarchies)
- [mkt_channels](#mkt-channels)
- [tradedesk](#tradedesk)

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
| date | DATE | REQUIRED | Date of the campaign activity |
| campaign_id | STRING | REQUIRED | Unique identifier for the ExoClick campaign |
| campaign_name | STRING | NULLABLE | Name of the campaign |
| site_id | STRING | REQUIRED | Unique identifier for the site where ads were displayed |
| site_name | STRING | NULLABLE | Name of the site |
| site_hostname | STRING | NULLABLE | Hostname of the site |
| variation_id | STRING | NULLABLE | Identifier for the ad variation |
| variation_name | STRING | NULLABLE | Name of the ad variation |
| variation_url | STRING | NULLABLE | URL of the ad variation |
| impressions | INTEGER | NULLABLE | Number of ad impressions |
| clicks | INTEGER | NULLABLE | Number of clicks on the ad |
| goals | INTEGER | NULLABLE | Total number of goal conversions |
| conversion_value | FLOAT | NULLABLE | Total value of conversions |
| cost | FLOAT | NULLABLE | Total cost/spend for the campaign |
| retrieved_at | TIMESTAMP | REQUIRED | Timestamp when data was retrieved from ExoClick API |
| goals_breakdown | RECORD | REPEATED | Detailed breakdown of conversions by goal type |
|   ↳ goal_id | STRING | NULLABLE | Unique identifier for the goal |
|   ↳ goal_name | STRING | NULLABLE | Name of the goal (e.g., registration, deposit, first_deposit) |
|   ↳ conversions | INTEGER | NULLABLE | Number of conversions for this specific goal |
|   ↳ conversion_value | FLOAT | NULLABLE | Value of conversions for this specific goal |

**UTM Parameters:**
```
utm_source=adn
utm_medium=exo-dsp
utm_campaign=de_pc_dsp-exo_psp_mob_ios-xvideos_excl-none_300x100
utm_landing=welcome-page-registration-modal
siteid={zone_id}
utm_creative=big-bass-splash
exo_cid={conversions_tracking}
```

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
| account_id | STRING | NULLABLE | Meta/Facebook Ad Account ID |
| retrieved_at | TIMESTAMP | NULLABLE | Timestamp when data was retrieved from Meta API |
| date_start | DATE | NULLABLE | Start date of the campaign activity |
| campaign_name | STRING | NULLABLE | Name of the Meta campaign |
| adset_name | STRING | NULLABLE | Name of the ad set within the campaign |
| ad_name | STRING | NULLABLE | Name of the individual ad |
| spend | NUMERIC | NULLABLE | Total ad spend in USD |
| impressions | NUMERIC | NULLABLE | Number of times ads were displayed |
| clicks | NUMERIC | NULLABLE | Number of clicks on the ads |
| frequency | NUMERIC | NULLABLE | Average number of times each person saw the ad |
| reach | NUMERIC | NULLABLE | Number of unique people who saw the ads |
| goals_breakdown | RECORD | REPEATED | S2S conversion tracking breakdown by goal and attribution window |
|   ↳ goal_name | STRING | NULLABLE | Name of the conversion goal (e.g., Purchase-S2S-BP, PurchasePlus-S2S-PC) |
|   ↳ window | STRING | NULLABLE | Attribution window (e.g., 1d_click, 7d_click, 1d_view, total) |
|   ↳ conversions | INTEGER | NULLABLE | Number of conversions for this goal and window |
|   ↳ conversion_value | FLOAT | NULLABLE | Total value of conversions for this goal and window |
| publisher_platform | STRING | NULLABLE | Platform where ad was shown (e.g., facebook, instagram) |
| platform_position | STRING | NULLABLE | Position of the ad on the platform (e.g., feed, story) |
| device_platform | STRING | NULLABLE | Device type (e.g., mobile, desktop) |

**UTM Parameters:**
```
utm_campaign={{campaign.name}}_{{adset.name}}_{{ad.name}}
utm_content={{placement}}
__sid=
```

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
| date | DATE | NULLABLE | Date of the campaign activity |
| campaign_id | STRING | NULLABLE | Unique identifier for the TrafficJunky campaign |
| campaign_name | STRING | NULLABLE | Name of the TrafficJunky campaign |
| impressions | INTEGER | NULLABLE | Number of ad impressions |
| clicks | INTEGER | NULLABLE | Number of clicks on the ad |
| conversions | INTEGER | NULLABLE | Number of conversions tracked |
| revenue | FLOAT | NULLABLE | Revenue generated from conversions |
| cost | FLOAT | NULLABLE | Total cost/spend for the campaign |
| retrieved_at | TIMESTAMP | NULLABLE | Timestamp when data was retrieved from TrafficJunky API |

**UTM Parameters:**
```
utm_source=adn
utm_medium=tj-pop
utm_campaign=de_pc_pop-tj_psp_mob_ios-pornhub-straight_excl-none
utm_landing=welcome-page-registration-modal
siteid=1650251
tj_cid={ACLID}
```

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
| date | DATE | REQUIRED | Date of the campaign activity |
| campaign_id | STRING | NULLABLE | Unique identifier for the TrafficStars campaign |
| campaign_name | STRING | NULLABLE | Name of the TrafficStars campaign |
| site_id | STRING | REQUIRED | Unique identifier for the site where ads were displayed |
| site_name | STRING | NULLABLE | Name of the site |
| creative_url | STRING | NULLABLE | URL of the creative/banner |
| impressions | INTEGER | NULLABLE | Number of ad impressions |
| clicks | INTEGER | NULLABLE | Number of clicks on the ad |
| conversions | INTEGER | NULLABLE | Number of conversions tracked |
| cost | FLOAT | NULLABLE | Total cost/spend for the campaign |
| retrieved_at | TIMESTAMP | REQUIRED | Timestamp when data was retrieved from TrafficStars API |
| banner_id | STRING | NULLABLE | Unique identifier for the banner/creative |

**Note:** This table is maintained for historical completeness. TrafficStars campaigns are not currently active.

---

## tradedesk

**Location**: US
**Created**: 2025-09-22 12:09:52.692000+00:00
**Modified**: 2025-09-22 12:11:20.322000+00:00

**Tables**: 4 | **Views**: 2


### Views in tradedesk

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
| Date | STRING | NULLABLE | Date of the campaign activity (DD/MM/YYYY format) |
| Ad_Group_ID | STRING | NULLABLE | Unique identifier for the ad group |
| Ad_Group | STRING | NULLABLE | Name of the ad group |
| Campaign_ID | STRING | NULLABLE | Unique identifier for the Trade Desk campaign |
| Campaign | STRING | NULLABLE | Name of the Trade Desk campaign |
| Creative | STRING | NULLABLE | Name of the creative/ad |
| Creative_ID | STRING | NULLABLE | Unique identifier for the creative |
| Advertiser_Cost_USD | FLOAT | NULLABLE | Total advertiser cost in USD |
| Bids | INTEGER | NULLABLE | Number of bids placed |
| Impressions | INTEGER | NULLABLE | Number of ad impressions delivered |
| Clicks | INTEGER | NULLABLE | Number of clicks on the ad |
| Sampled_Tracked_Impressions | INTEGER | NULLABLE | Number of sampled tracked impressions |
| Sampled_Viewed_Impressions | INTEGER | NULLABLE | Number of sampled viewed impressions |
| Click_Conversion_01 | INTEGER | NULLABLE | Click-attributed conversions for conversion window 01 |
| Click_Conversion_02 | INTEGER | NULLABLE | Click-attributed conversions for conversion window 02 |
| Click_Conversion_03 | INTEGER | NULLABLE | Click-attributed conversions for conversion window 03 |
| Total_Click_View_Conversions_01 | INTEGER | NULLABLE | Total click + view conversions for window 01 |
| Total_Click_View_Conversions_02 | INTEGER | NULLABLE | Total click + view conversions for window 02 |
| Total_Click_View_Conversions_03 | INTEGER | NULLABLE | Total click + view conversions for window 03 |
| View_Through_Conversion_01 | INTEGER | NULLABLE | View-through conversions for conversion window 01 |
| View_Through_Conversion_02 | INTEGER | NULLABLE | View-through conversions for conversion window 02 |
| View_Through_Conversion_03 | INTEGER | NULLABLE | View-through conversions for conversion window 03 |


<details>
<summary><b>View SQL Query</b> (click to expand)</summary>

```sql
SELECT * FROM `level-hope-462409-a8.tradedesk.ID42_backfill` 

UNION ALL

SELECT * FROM `level-hope-462409-a8.tradedesk.ID42_performance_daily` 
```
</details>

---
