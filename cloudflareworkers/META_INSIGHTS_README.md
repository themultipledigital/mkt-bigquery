# Meta Insights Mode - Documentation

## Overview

The **insights mode** in `meta-status.js` fetches Meta/Facebook Ads performance metrics including **accurate reach** at campaign, adset, and ad levels with platform/position/device breakdowns.

### Key Features

✅ **Accurate Reach Deduplication** - Separate total reach from breakdown reach  
✅ **Multi-Level Metrics** - Campaign, Adset, and Ad level insights  
✅ **Granular Breakdowns** - Platform, position, and device combinations  
✅ **Looker Studio Ready** - Single table design optimized for reporting  
✅ **Automatic Merge/Deduplication** - Stage-and-merge pattern with latest data wins  

---

## Usage

### Basic Example
```bash
GET https://your-worker.workers.dev/?account=FRM-155237&mode=insights&dest=bq&since=2025-10-29&until=2025-11-05
```

### Parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `account` | Yes | - | `FRM-xxxxx` or `all` for all accounts |
| `mode` | Yes | - | Set to `insights` |
| `dest` | Yes | - | `bq` (BigQuery only) |
| `since` | No | Now - 7 days | Start date (YYYY-MM-DD) |
| `until` | No | Today | End date (YYYY-MM-DD) |
| `schema_migrate` | No | `false` | Add missing columns to existing table |

### Examples

**Single Account (Last 7 Days)**
```
?account=FRM-155237&mode=insights&dest=bq
```

**Single Account (Custom Date Range)**
```
?account=FRM-155237&mode=insights&dest=bq&since=2025-10-01&until=2025-10-31
```

**All Accounts**
```
?account=all&mode=insights&dest=bq
```

**Schema Migration**
```
?account=FRM-155237&mode=insights&dest=bq&schema_migrate=true
```

---

## BigQuery Table Structure

### Table: `mkt_channels.meta_insights`

**Partitioned by:** `date_start`  
**Clustered by:** `ad_account_id`, `campaign_id`, `adset_id`, `ad_id`

### Schema

```sql
CREATE TABLE `project.mkt_channels.meta_insights` (
  -- Identity
  account_id STRING,              -- FRM-xxxxx
  referrer_domain STRING,          -- Domain from config
  ad_account_id STRING,            -- act_xxxxx
  retrieved_at TIMESTAMP,          -- When data was fetched
  
  -- Date dimension
  date_start DATE,                 -- Partition column
  date_stop DATE,
  
  -- Hierarchy
  campaign_id STRING,              -- Always populated
  campaign_name STRING,
  adset_id STRING,                 -- NULL for campaign-level
  adset_name STRING,
  ad_id STRING,                    -- NULL for campaign/adset-level
  ad_name STRING,
  
  -- Breakdown dimensions (NULL = total/aggregated)
  publisher_platform STRING,       -- facebook, instagram, audience_network, messenger
  platform_position STRING,        -- feed, facebook_reels, instagram_stories, etc.
  impression_device STRING,        -- android_smartphone, iphone, desktop, ipad, etc.
  
  -- Performance metrics
  reach INTEGER,                   -- Unique users reached
  impressions INTEGER,             -- Total ad views
  frequency FLOAT,                 -- Avg times user saw ad
  spend FLOAT,                     -- Amount spent
  clicks INTEGER,                  -- Total clicks
  cpc FLOAT,                       -- Cost per click
  cpm FLOAT,                       -- Cost per mille (1000 impressions)
  ctr FLOAT,                       -- Click-through rate
  cpp FLOAT,                       -- Cost per person reached
  
  -- Metadata
  is_breakdown BOOLEAN,            -- FALSE = total, TRUE = breakdown
  level STRING                     -- 'campaign', 'adset', 'ad'
)
PARTITION BY date_start
CLUSTER BY ad_account_id, campaign_id, adset_id, ad_id;
```

---

## Data Structure Examples

### Row Types

For each ad in the date range, you get multiple rows:

#### 1. Campaign-Level Total (Accurate Reach)
```json
{
  "campaign_id": "120236392470970093",
  "campaign_name": "au_ff_meta_conv_highest-volume-purchaseplus",
  "adset_id": null,
  "ad_id": null,
  "publisher_platform": null,
  "platform_position": null,
  "impression_device": null,
  "reach": 2210,
  "impressions": 54055,
  "is_breakdown": false,
  "level": "campaign"
}
```

#### 2. Campaign-Level Breakdown
```json
{
  "campaign_id": "120236392470970093",
  "campaign_name": "au_ff_meta_conv_highest-volume-purchaseplus",
  "adset_id": null,
  "ad_id": null,
  "publisher_platform": "facebook",
  "platform_position": "facebook_reels",
  "impression_device": "android_smartphone",
  "reach": 366,
  "impressions": 1657,
  "is_breakdown": true,
  "level": "campaign"
}
```

#### 3. Adset-Level Total
```json
{
  "campaign_id": "120236392470970093",
  "adset_id": "120236392470940093",
  "adset_name": "inactive-30D+_excl-deposit-30D",
  "ad_id": null,
  "publisher_platform": null,
  "platform_position": null,
  "impression_device": null,
  "reach": 2210,
  "impressions": 54055,
  "is_breakdown": false,
  "level": "adset"
}
```

#### 4. Ad-Level Total (Most Granular)
```json
{
  "campaign_id": "120236392470970093",
  "adset_id": "120236392470940093",
  "ad_id": "120236908348520093",
  "ad_name": "wg-100%-up-to-500",
  "publisher_platform": null,
  "platform_position": null,
  "impression_device": null,
  "reach": 1875,
  "impressions": 23153,
  "is_breakdown": false,
  "level": "ad"
}
```

#### 5. Ad-Level Breakdown
```json
{
  "campaign_id": "120236392470970093",
  "adset_id": "120236392470940093",
  "ad_id": "120236908348520093",
  "ad_name": "wg-100%-up-to-500",
  "publisher_platform": "facebook",
  "platform_position": "feed",
  "impression_device": "android_smartphone",
  "reach": 612,
  "impressions": 4763,
  "is_breakdown": true,
  "level": "ad"
}
```

---

## ⚠️ Critical: Reach Deduplication

### The Problem

**Reach is a deduplicated unique user metric.** Users who see ads on multiple devices/platforms/positions are counted once in total reach but appear in multiple breakdown rows.

**Example from Test Data:**
- Total Reach (is_breakdown=FALSE): **1,875 unique users**
- Sum of Breakdown Reaches: **2,695**
- **Difference: 820 users (43.7% overcounting!)**

This means **820 users saw the ad across multiple platform/position/device combinations.**

### The Solution

**Use `is_breakdown` field to separate:**
- **`is_breakdown = FALSE`**: Total deduplicated reach (accurate)
- **`is_breakdown = TRUE`**: Reach distribution (don't sum!)

---

## Looker Studio Implementation

### 1. Connect to BigQuery

Data Source: `project.mkt_channels.meta_insights`

### 2. Chart: Total Reach Trend

**Type:** Time Series  
**Date Dimension:** `date_start`  
**Metric:** `reach`  
**Filter:** `is_breakdown = FALSE` AND `level = ad`

```sql
SELECT
  date_start,
  campaign_name,
  SUM(reach) as total_unique_reach,
  SUM(impressions) as total_impressions,
  SUM(spend) as total_spend
FROM `project.mkt_channels.meta_insights`
WHERE is_breakdown = FALSE
  AND level = 'ad'
GROUP BY date_start, campaign_name
```

### 3. Chart: Reach Distribution by Platform

**Type:** Pie Chart or Bar Chart  
**Dimension:** `publisher_platform`  
**Metric:** Custom Field (see below)  
**Filter:** `is_breakdown = TRUE` AND `ad_id IS NOT NULL`

**Don't use:** `SUM(reach)` ❌  
**Do use:** Reach % calculated field ✅

### 4. Calculated Fields

#### Reach Distribution %
```
CASE
  WHEN is_breakdown = TRUE THEN
    reach / MAX(CASE WHEN is_breakdown = FALSE THEN reach END OVER (PARTITION BY ad_id, date_start))
  ELSE NULL
END
```

#### Total Reach (Safe)
```
CASE
  WHEN is_breakdown = FALSE THEN reach
  ELSE NULL
END
```

#### Breakdown Reach (For Display Only)
```
CASE
  WHEN is_breakdown = TRUE THEN reach
  ELSE NULL
END
```

### 5. Example Dashboards

#### Campaign Performance Dashboard
```sql
-- Campaign totals (accurate reach)
SELECT
  campaign_name,
  SUM(reach) as total_reach,
  SUM(impressions) as impressions,
  SUM(spend) as spend,
  SUM(clicks) as clicks,
  AVG(ctr) as avg_ctr
FROM `project.mkt_channels.meta_insights`
WHERE is_breakdown = FALSE
  AND level = 'campaign'
  AND date_start BETWEEN '2025-10-01' AND '2025-10-31'
GROUP BY campaign_name
ORDER BY total_reach DESC
```

#### Platform Distribution Analysis
```sql
-- Show where reach comes from (don't sum!)
SELECT
  publisher_platform,
  platform_position,
  impression_device,
  reach as platform_reach,
  impressions,
  spend
FROM `project.mkt_channels.meta_insights`
WHERE is_breakdown = TRUE
  AND ad_id = '120236908348520093'
  AND date_start = '2025-11-05'
ORDER BY reach DESC
```

#### Ad-Level Performance with Distribution
```sql
WITH ad_totals AS (
  SELECT
    ad_id,
    ad_name,
    reach as total_reach,
    impressions as total_impressions,
    spend as total_spend
  FROM `project.mkt_channels.meta_insights`
  WHERE is_breakdown = FALSE
    AND level = 'ad'
    AND date_start = '2025-11-05'
),
ad_breakdowns AS (
  SELECT
    ad_id,
    publisher_platform,
    reach as breakdown_reach,
    impressions as breakdown_impressions
  FROM `project.mkt_channels.meta_insights`
  WHERE is_breakdown = TRUE
    AND level = 'ad'
    AND date_start = '2025-11-05'
)
SELECT
  t.ad_name,
  t.total_reach,
  b.publisher_platform,
  b.breakdown_reach,
  ROUND(b.breakdown_reach / t.total_reach * 100, 1) as reach_pct
FROM ad_totals t
JOIN ad_breakdowns b ON t.ad_id = b.ad_id
ORDER BY t.total_reach DESC, b.breakdown_reach DESC
```

---

## Best Practices

### ✅ DO

1. **Use `is_breakdown = FALSE` for total reach metrics**
   - Campaign performance tables
   - Time series trends
   - Aggregated reporting

2. **Use `level` field to filter by hierarchy**
   - `level = 'campaign'` for campaign-level only
   - `level = 'adset'` for adset-level only
   - `level = 'ad'` for ad-level only (most granular)

3. **SUM these metrics freely:**
   - `impressions`
   - `spend`
   - `clicks`

4. **Use breakdowns for distribution analysis:**
   - Show WHERE reach comes from
   - Calculate percentages
   - Visualize platform mix

### ❌ DON'T

1. **Don't SUM reach across breakdown rows**
   - Results in overcounting users
   - 43.7% overcounting in test data!

2. **Don't SUM or AVG frequency**
   - It's a calculated metric (impressions/reach)
   - Calculate it yourself if needed

3. **Don't mix `is_breakdown = TRUE` and `FALSE` in same aggregation**
   - Keep them separate
   - Different purposes

---

## Metrics Reference

| Metric | Type | Can Sum? | Description |
|--------|------|----------|-------------|
| `reach` | INTEGER | ⚠️ Only if `is_breakdown=FALSE` | Unique users reached |
| `impressions` | INTEGER | ✅ Yes | Total ad views |
| `frequency` | FLOAT | ❌ No (calculated) | Avg times user saw ad |
| `spend` | FLOAT | ✅ Yes | Amount spent (USD) |
| `clicks` | INTEGER | ✅ Yes | Total clicks |
| `cpc` | FLOAT | ❌ No (use spend/clicks) | Cost per click |
| `cpm` | FLOAT | ❌ No (use spend/impressions*1000) | Cost per 1000 impressions |
| `ctr` | FLOAT | ❌ No (use clicks/impressions) | Click-through rate |
| `cpp` | FLOAT | ❌ No (use spend/reach) | Cost per person reached |

---

## Platform/Position/Device Values

### Publisher Platforms
- `facebook`
- `instagram`
- `messenger`
- `audience_network`

### Common Positions
- `feed` - Main feed
- `facebook_reels` - Facebook Reels
- `facebook_reels_overlay` - Reels overlay ads
- `facebook_stories` - Stories
- `facebook_notification` - Notifications
- `facebook_profile_feed` - Profile feed
- `instagram_stories` - Instagram stories
- `instagram_reels` - Instagram reels
- `an_classic` - Audience Network classic
- `rewarded_video` - Rewarded video placements

### Devices
- `android_smartphone`
- `iphone`
- `android_tablet`
- `ipad`
- `desktop`
- `unknown`

---

## Troubleshooting

### Issue: Sum of reach doesn't match total

**Expected Behavior:** This is correct!  
- Total reach (is_breakdown=FALSE): Deduplicated unique users
- Sum of breakdowns: Counts users multiple times if they saw ad on multiple platforms/devices

**Solution:** Don't sum breakdown reach. Use it for distribution percentages only.

### Issue: No data returned

**Check:**
1. Date range has data (`since`/`until` parameters)
2. Campaigns were active during date range
3. BigQuery table exists and has data
4. Access token is valid

### Issue: Duplicate rows

**Check:**
1. Are you seeing same ad with different `retrieved_at`?
   - This is expected - shows historical snapshots
   - Use `WHERE retrieved_at = (SELECT MAX(retrieved_at) FROM table)` for latest only

2. Multiple rows with same breakdown?
   - Check if `date_start` is different (multi-day insights)
   - Merge logic dedupes on full key including date

---

## Performance Considerations

### API Rate Limits

For each ad account, the worker makes:
- 2 requests per campaign (total + breakdown)
- 2 requests per adset (total + breakdown)
- 2 requests per ad (total + breakdown)

**Example:** Account with 5 campaigns, 10 adsets, 20 ads = **70 API requests**

**Recommendation:** 
- Use scheduled runs during off-peak hours
- Don't run for all accounts simultaneously
- Consider limiting to active campaigns only

### BigQuery Costs

**Storage:** Minimal (compressed columnar storage)  
**Query Costs:** Optimized with:
- Partitioning by `date_start`
- Clustering by `ad_account_id`, `campaign_id`, `adset_id`, `ad_id`

**Tip:** Always filter by `date_start` in queries to reduce scan size.

---

## Maintenance

### Adding New Metrics

1. Update `META_INSIGHTS_SCHEMA` array
2. Add metric to `METRICS` string in `getInsightsData()`
3. Map metric in row objects
4. Run with `schema_migrate=true` to add column to existing table

### Backfilling Historical Data

```bash
# Run for each month
for month in {01..12}; do
  curl "https://your-worker.workers.dev/?account=FRM-155237&mode=insights&dest=bq&since=2025-${month}-01&until=2025-${month}-31"
done
```

---

## Support & Questions

For issues or questions:
1. Check this documentation
2. Review test data in `sample_meta_insights_bigquery.csv`
3. Run test script: `python test_meta_reach_bigquery_format.py`
4. Check worker logs in Cloudflare dashboard

---

## Version History

### v1.1.0 (Current)
- ✅ Added insights mode
- ✅ Multi-level reach metrics (campaign/adset/ad)
- ✅ Platform/position/device breakdowns
- ✅ Accurate reach deduplication
- ✅ Looker Studio optimized schema

### v1.0.0
- Activities mode (changelog tracking)
- Targeting mode (audience configuration)
- Structure mode (account hierarchy)

