# BigQuery Project Documentation: level-hope-462409-a8 (Filtered)

_Generated automatically from BigQuery metadata - Selected views_

## Summary

- **Total Datasets**: 1
- **Total Tables**: 0
- **Total Views**: 3
- **Total Objects**: 3

## Table of Contents

- [Summary](#summary)
- [mkt_channels](#mkt-channels)

## mkt_channels

**Location**: US
**Created**: 2025-09-12 08:37:10.475000+00:00
**Modified**: 2025-09-12 08:37:10.475000+00:00

**Views**: 3

### Views in mkt_channels

#### meta_stats_custom

**Full Name**: `level-hope-462409-a8.mkt_channels.meta_stats_custom`

**Created**: 2025-09-15 14:17:21.034000+00:00

**Modified**: 2025-10-29 13:04:51.930000+00:00

**Dependencies**: This view depends on 1 object(s):
- `level-hope-462409-a8.mkt_channels.meta_stats`

**Schema**:


| Column Name | Type | Mode | Description |
|-------------|------|------|-------------|
| date_start | DATE | NULLABLE | Start date for the metric row |
| account_id | STRING | NULLABLE | Meta ad account ID |
| adname_custom | STRING | NULLABLE | Normalized ad name (lowercased, trimmed) |
| adset_name_custom | STRING | NULLABLE | Normalized ad set name (cleaned) |
| campaign_name_custom | STRING | NULLABLE | Normalized campaign name (cleaned) |
| spend | NUMERIC | NULLABLE | Ad spend in USD |
| impressions | NUMERIC | NULLABLE | Number of impressions |
| clicks | NUMERIC | NULLABLE | Number of clicks |
| reach | NUMERIC | NULLABLE | Unique users reached |
| frequency | NUMERIC | NULLABLE | Average impressions per reached user |
| publisher_platform | STRING | NULLABLE | Serving platform (facebook/instagram/audience_network) |
| platform_position | STRING | NULLABLE | Placement (feed, story, reels, etc.) |
| device_platform | STRING | NULLABLE | Device category (mobile/desktop) |
| brand | STRING | NULLABLE | Derived brand code from campaign naming |
| purchaseplus_s2s_total | NUMERIC | NULLABLE | Deposit conversions (S2S, all attribution windows) |
| purchaseplus_val_s2s_total | NUMERIC | NULLABLE | Deposit conversion value (S2S, total) |
| purchaseplus_1d_view_s2s_total | NUMERIC | NULLABLE | Deposit conversions (S2S, 1-day view) |
| purchaseplus_val_1d_view_s2s_total | NUMERIC | NULLABLE | Deposit conversion value (S2S, 1-day view) |
| purchaseplus_1d_click_s2s_total | NUMERIC | NULLABLE | Deposit conversions (S2S, 1-day click) |
| purchaseplus_val_1d_click_s2s_total | NUMERIC | NULLABLE | Deposit conversion value (S2S, 1-day click) |
| purchaseplus_1d_click_s2s_bp_total | NUMERIC | NULLABLE | Deposit conversions (S2S, 1-day click, BP) |
| purchaseplus_val_1d_click_s2s_bp_total | NUMERIC | NULLABLE | Deposit conversion value (S2S, 1-day click, BP) |
| purchaseplus_1d_click_s2s_pc_total | NUMERIC | NULLABLE | Deposit conversions (S2S, 1-day click, PC) |
| purchaseplus_val_1d_click_s2s_pc_total | NUMERIC | NULLABLE | Deposit conversion value (S2S, 1-day click, PC) |
| purchaseplus_1d_view_s2s_bp_total | NUMERIC | NULLABLE | Deposit conversions (S2S, 1-day view, BP) |
| purchaseplus_val_1d_view_s2s_bp_total | NUMERIC | NULLABLE | Deposit conversion value (S2S, 1-day view, BP) |
| purchaseplus_1d_view_s2s_pc_total | NUMERIC | NULLABLE | Deposit conversions (S2S, 1-day view, PC) |
| purchaseplus_val_1d_view_s2s_pc_total | NUMERIC | NULLABLE | Deposit conversion value (S2S, 1-day view, PC) |
| purchaseplus_7d_click_s2s_total | NUMERIC | NULLABLE | Deposit conversions (S2S, 7-day click) |
| purchaseplus_val_7d_click_s2s_total | NUMERIC | NULLABLE | Deposit conversion value (S2S, 7-day click) |
| purchaseplus_7d_click_s2s_bp_total | NUMERIC | NULLABLE | Deposit conversions (S2S, 7-day click, BP) |
| purchaseplus_val_7d_click_s2s_bp_total | NUMERIC | NULLABLE | Deposit conversion value (S2S, 7-day click, BP) |
| purchaseplus_7d_click_s2s_pc_total | NUMERIC | NULLABLE | Deposit conversions (S2S, 7-day click, PC) |
| purchaseplus_val_7d_click_s2s_pc_total | NUMERIC | NULLABLE | Deposit conversion value (S2S, 7-day click, PC) |
| purchaseplus_7d_view_s2s_total | NUMERIC | NULLABLE | Deposit conversions (S2S, 7-day view) |
| purchaseplus_val_7d_view_s2s_total | NUMERIC | NULLABLE | Deposit conversion value (S2S, 7-day view) |
| purchaseplus_7d_view_s2s_bp_total | NUMERIC | NULLABLE | Deposit conversions (S2S, 7-day view, BP) |
| purchaseplus_val_7d_view_s2s_bp_total | NUMERIC | NULLABLE | Deposit conversion value (S2S, 7-day view, BP) |
| purchaseplus_7d_view_s2s_pc_total | NUMERIC | NULLABLE | Deposit conversions (S2S, 7-day view, PC) |
| purchaseplus_val_7d_view_s2s_pc_total | NUMERIC | NULLABLE | Deposit conversion value (S2S, 7-day view, PC) |
| purchase_1d_click_s2s_total | NUMERIC | NULLABLE | First-time deposit conversions (S2S, 1-day click) |
| purchase_val_1d_click_s2s_total | NUMERIC | NULLABLE | First-time deposit conversion value (S2S, 1-day click) |
| purchase_1d_click_s2s_bp_total | NUMERIC | NULLABLE | First-time deposit conversions (S2S, 1-day click, BP) |
| purchase_val_1d_click_s2s_bp_total | NUMERIC | NULLABLE | First-time deposit conversion value (S2S, 1-day click, BP) |
| purchase_1d_click_s2s_pc_total | NUMERIC | NULLABLE | First-time deposit conversions (S2S, 1-day click, PC) |
| purchase_val_1d_click_s2s_pc_total | NUMERIC | NULLABLE | First-time deposit conversion value (S2S, 1-day click, PC) |
| purchase_1d_view_s2s_total | NUMERIC | NULLABLE | First-time deposit conversions (S2S, 1-day view) |
| purchase_val_1d_view_s2s_total | NUMERIC | NULLABLE | First-time deposit conversion value (S2S, 1-day view) |
| purchase_1d_view_s2s_bp_total | NUMERIC | NULLABLE | First-time deposit conversions (S2S, 1-day view, BP) |
| purchase_val_1d_view_s2s_bp_total | NUMERIC | NULLABLE | First-time deposit conversion value (S2S, 1-day view, BP) |
| purchase_1d_view_s2s_pc_total | NUMERIC | NULLABLE | First-time deposit conversions (S2S, 1-day view, PC) |
| purchase_val_1d_view_s2s_pc_total | NUMERIC | NULLABLE | First-time deposit conversion value (S2S, 1-day view, PC) |
| purchase_s2s_pc_total | NUMERIC | NULLABLE | First-time deposit conversions (S2S, PC brand, total) |
| purchase_val_s2s_pc_total | NUMERIC | NULLABLE | First-time deposit conversion value (S2S, PC, total) |
| purchase_s2s_bp_total | NUMERIC | NULLABLE | First-time deposit conversions (S2S, BP brand, total) |
| purchase_val_s2s_bp_total | NUMERIC | NULLABLE | First-time deposit conversion value (S2S, BP, total) |
| purchaseplus_s2s_bp_total | NUMERIC | NULLABLE | Deposit conversions (S2S, BP brand, total) |
| purchaseplus_val_s2s_bp_total | NUMERIC | NULLABLE | Deposit conversion value (S2S, BP, total) |
| purchaseplus_s2s_pc_total | NUMERIC | NULLABLE | Deposit conversions (S2S, PC brand, total) |
| purchaseplus_val_s2s_pc_total | NUMERIC | NULLABLE | Deposit conversion value (S2S, PC, total) |
| purchase_7d_click_1d_view_s2s_total | NUMERIC | NULLABLE | First-time deposit conversions (S2S, 7d click + 1d view) |
| purchase_val_7d_click_1d_view_s2s_total | NUMERIC | NULLABLE | First-time deposit conversion value (S2S, 7d click + 1d view) |
| purchase_1d_click_1d_view_s2s_total | NUMERIC | NULLABLE | First-time deposit conversions (S2S, 1d click + 1d view) |
| purchase_val_1d_click_1d_view_s2s_total | NUMERIC | NULLABLE | First-time deposit conversion value (S2S, 1d click + 1d view) |
| purchase_7d_click_1d_view_s2s_brand_total | NUMERIC | NULLABLE | Brand-specific first-time deposits (S2S, 7d click + 1d view) |
| purchase_val_7d_click_1d_view_s2s_brand_total | NUMERIC | NULLABLE | Value: brand first-time deposits (S2S, 7d click + 1d view) |
| purchase_1d_click_1d_view_s2s_brand_total | NUMERIC | NULLABLE | Brand-specific first-time deposits (S2S, 1d click + 1d view) |
| purchase_val_1d_click_1d_view_s2s_brand_total | NUMERIC | NULLABLE | Value: brand first-time deposits (S2S, 1d click + 1d view) |
| purchaseplus_7d_click_1d_view_s2s_total | NUMERIC | NULLABLE | Deposits (S2S, 7d click + 1d view) |
| purchaseplus_val_7d_click_1d_view_s2s_total | NUMERIC | NULLABLE | Deposit value (S2S, 7d click + 1d view) |
| purchaseplus_1d_click_1d_view_s2s_total | NUMERIC | NULLABLE | Deposits (S2S, 1d click + 1d view) |
| purchaseplus_val_1d_click_1d_view_s2s_total | NUMERIC | NULLABLE | Deposit value (S2S, 1d click + 1d view) |
| purchaseplus_7d_click_1d_view_first_conversion_s2s_total | NUMERIC | NULLABLE | Deposit first-conversion events (S2S, 7d click + 1d view) |
| purchaseplus_val_7d_click_1d_view_first_conversion_s2s_total | NUMERIC | NULLABLE | Value: deposit first-conversion events (S2S, 7d click + 1d view) |
| purchaseplus_1d_click_1d_view_first_conversion_s2s_total | NUMERIC | NULLABLE | Deposit first-conversion events (S2S, 1d click + 1d view) |
| purchaseplus_val_1d_click_1d_view_first_conversion_s2s_total | NUMERIC | NULLABLE | Value: deposit first-conversion events (S2S, 1d click + 1d view) |
| purchaseplus_7d_click_1d_view_s2s_brand_total | NUMERIC | NULLABLE | Brand deposits (S2S, 7d click + 1d view) |
| purchaseplus_val_7d_click_1d_view_s2s_brand_total | NUMERIC | NULLABLE | Value: brand deposits (S2S, 7d click + 1d view) |
| purchaseplus_1d_click_1d_view_s2s_brand_total | NUMERIC | NULLABLE | Brand deposits (S2S, 1d click + 1d view) |
| purchaseplus_val_1d_click_1d_view_s2s_brand_total | NUMERIC | NULLABLE | Value: brand deposits (S2S, 1d click + 1d view) |
| purchaseplus_7d_click_1d_view_first_conversion_s2s_brand_total | NUMERIC | NULLABLE | Brand deposit first-conversion events (S2S, 7d click + 1d view) |
| purchaseplus_val_7d_click_1d_view_first_conversion_s2s_brand_total | NUMERIC | NULLABLE | Value: brand deposit first-conversion events (S2S, 7d click + 1d view) |
| purchaseplus_1d_click_1d_view_first_conversion_s2s_brand_total | NUMERIC | NULLABLE | Brand deposit first-conversion events (S2S, 1d click + 1d view) |
| purchaseplus_val_1d_click_1d_view_first_conversion_s2s_brand_total | NUMERIC | NULLABLE | Value: brand deposit first-conversion events (S2S, 1d click + 1d view) |


---

#### pops_stats_custom

**Full Name**: `level-hope-462409-a8.mkt_channels.pops_stats_custom`

**Created**: 2025-09-16 12:13:09.646000+00:00

**Modified**: 2025-09-30 12:39:57.250000+00:00

**Dependencies**: This view depends on 3 object(s):
- `level-hope-462409-a8.mkt_channels.exo_stats`
- `level-hope-462409-a8.mkt_channels.tj_campaign_stats`
- `level-hope-462409-a8.mkt_channels.ts_stats_siteid`
**Schema**:


| Column Name | Type | Mode | Description |
|-------------|------|------|-------------|
| date | DATE | NULLABLE | Date of the metric row |
| channel | STRING | NULLABLE | Source network (ExoClick, TrafficJunky, TrafficStars) |
| campaign_id | STRING | NULLABLE | Channel-specific campaign identifier |
| campaign_name | STRING | NULLABLE | Campaign name as reported by the channel |
| impressions | INTEGER | NULLABLE | Delivered impressions |
| clicks | INTEGER | NULLABLE | Recorded clicks |
| conversions | INTEGER | NULLABLE | Total conversions reported by the channel |
| conversion_value | FLOAT | NULLABLE | Monetary value of conversions (if available) |
| spend | FLOAT | NULLABLE | Ad spend in channel currency (USD) |
| retrieved_at | TIMESTAMP | NULLABLE | Timestamp when the source data was pulled |
| ftd-s2s | INTEGER | NULLABLE | First-time deposit conversions from S2S tracking |
| deposit-s2s | INTEGER | NULLABLE | Deposit conversions from S2S tracking |
| reg-s2s | INTEGER | NULLABLE | Registration conversions from S2S tracking |
| ftd-s2s_val | FLOAT | NULLABLE | Value associated with first-time deposit S2S conversions |
| deposit-s2s_val | FLOAT | NULLABLE | Value associated with deposit S2S conversions |
| reg-s2s_val | FLOAT | NULLABLE | Value associated with registration S2S conversions |


---

tradedesk_stats_custom

**Full Name**: `level-hope-462409-a8.mkt_channels.tradedesk_stats_custom`

**Created**: 2025-09-29 09:30:46.738000+00:00

**Modified**: 2025-10-09 12:33:13.556000+00:00

**Dependencies**: This view depends on 2 object(s):
- `level-hope-462409-a8.tradedesk.ID41`
- `level-hope-462409-a8.tradedesk.ID42`

**Schema**:


| Column Name | Type | Mode | Description |
|-------------|------|------|-------------|
| date_start | DATE | NULLABLE | Date of performance or conversion aggregation |
| campaign_id | STRING | NULLABLE | Trade Desk campaign ID |
| campaign_name | STRING | NULLABLE | Trade Desk campaign name |
| ad_group_id | STRING | NULLABLE | Ad group ID |
| ad_group_name | STRING | NULLABLE | Ad group name |
| creative_id | STRING | NULLABLE | Creative ID |
| creative_name | STRING | NULLABLE | Creative name |
| geo | STRING | NULLABLE | GEO code parsed from campaign name |
| brand | STRING | NULLABLE | Brand code parsed from campaign name |
| media_type | STRING | NULLABLE | Media/type parsed from campaign name |
| strategy | STRING | NULLABLE | Strategy tag parsed (Aware/Prosp/Retarget/etc.) |
| campaign_name_custom | STRING | NULLABLE | Cleaned campaign name used for joins |
| spend | FLOAT | NULLABLE | Advertiser cost (USD) |
| bids | INTEGER | NULLABLE | Bids placed |
| impressions | INTEGER | NULLABLE | Impressions delivered |
| clicks | INTEGER | NULLABLE | Clicks recorded |
| sampled_tracked_impressions | INTEGER | NULLABLE | Sampled tracked impressions |
| sampled_viewed_impressions | INTEGER | NULLABLE | Sampled viewed impressions |
| click_conversion_01 | INTEGER | NULLABLE | Click conversions (window 01) from ID42 |
| click_conversion_02 | INTEGER | NULLABLE | Click conversions (window 02) from ID42 |
| click_conversion_03 | INTEGER | NULLABLE | Click conversions (window 03) from ID42 |
| total_click_view_conversions_01 | INTEGER | NULLABLE | Total click+view conversions (window 01) from ID42 |
| total_click_view_conversions_02 | INTEGER | NULLABLE | Total click+view conversions (window 02) from ID42 |
| total_click_view_conversions_03 | INTEGER | NULLABLE | Total click+view conversions (window 03) from ID42 |
| view_through_conversion_01 | INTEGER | NULLABLE | View-through conversions (window 01) from ID42 |
| view_through_conversion_02 | INTEGER | NULLABLE | View-through conversions (window 02) from ID42 |
| view_through_conversion_03 | INTEGER | NULLABLE | View-through conversions (window 03) from ID42 |
| ctr | FLOAT | NULLABLE | Click-through rate (clicks / impressions) |
| cpc | FLOAT | NULLABLE | Cost per click |
| cpm | FLOAT | NULLABLE | Cost per 1,000 impressions |
| total_impression_count | INTEGER | NULLABLE | Impressions around last display click (ID41 aggregation) |
| total_display_click_count | INTEGER | NULLABLE | Display clicks prior to conversion (ID41) |
| total_non_display_click_count | INTEGER | NULLABLE | Non-display clicks prior to conversion (ID41) |
| default_conversions_click | INTEGER | NULLABLE | Default-type conversions with click attribution (all windows) |
| registration_conversions_click | INTEGER | NULLABLE | Registration conversions with click attribution |
| deposit_conversions_click | INTEGER | NULLABLE | Deposit conversions with click attribution |
| first_deposit_conversions_click | INTEGER | NULLABLE | First-deposit conversions with click attribution |
| deposit_form_submitted_conversions_click | INTEGER | NULLABLE | Deposit form submitted with click attribution |
| default_conversions_view | INTEGER | NULLABLE | Default-type conversions with view attribution (all windows) |
| registration_conversions_view | INTEGER | NULLABLE | Registration conversions with view attribution |
| deposit_conversions_view | INTEGER | NULLABLE | Deposit conversions with view attribution |
| first_deposit_conversions_view | INTEGER | NULLABLE | First-deposit conversions with view attribution |
| deposit_form_submitted_conversions_view | INTEGER | NULLABLE | Deposit form submitted with view attribution |
| default_conversions_1d_click | INTEGER | NULLABLE | Default conversions within 1 day of last click |
| registration_conversions_1d_click | INTEGER | NULLABLE | Registration conversions within 1 day of last click |
| deposit_conversions_1d_click | INTEGER | NULLABLE | Deposit conversions within 1 day of last click |
| first_deposit_conversions_1d_click | INTEGER | NULLABLE | First deposit within 1 day of last click |
| default_conversions_7d_click | INTEGER | NULLABLE | Default conversions within 7 days of last click |
| registration_conversions_7d_click | INTEGER | NULLABLE | Registration conversions within 7 days of last click |
| deposit_conversions_7d_click | INTEGER | NULLABLE | Deposit conversions within 7 days of last click |
| first_deposit_conversions_7d_click | INTEGER | NULLABLE | First deposit within 7 days of last click |
| default_conversions_1d_view | INTEGER | NULLABLE | Default conversions within 1 day of last impression |
| registration_conversions_1d_view | INTEGER | NULLABLE | Registration conversions within 1 day of last impression |
| deposit_conversions_1d_view | INTEGER | NULLABLE | Deposit conversions within 1 day of last impression |
| first_deposit_conversions_1d_view | INTEGER | NULLABLE | First deposit within 1 day of last impression |
| default_conversions_7d_view | INTEGER | NULLABLE | Default conversions within 7 days of last impression |
| registration_conversions_7d_view | INTEGER | NULLABLE | Registration conversions within 7 days of last impression |
| deposit_conversions_7d_view | INTEGER | NULLABLE | Deposit conversions within 7 days of last impression |
| first_deposit_conversions_7d_view | INTEGER | NULLABLE | First deposit within 7 days of last impression |
| default_conversions | INTEGER | NULLABLE | Total default conversions (click + view) |
| registration_conversions | INTEGER | NULLABLE | Total registration conversions (click + view) |
| deposit_conversions | INTEGER | NULLABLE | Total deposit conversions (click + view) |
| first_deposit_conversions | INTEGER | NULLABLE | Total first-deposit conversions (click + view) |
| deposit_form_submitted_conversions | INTEGER | NULLABLE | Total deposit form submitted conversions |
| total_conversions | INTEGER | NULLABLE | Total conversion events (click-attributed + view-through) |
| click_attributed_conversions | INTEGER | NULLABLE | Total click-attributed conversion events |
| view_through_conversions | INTEGER | NULLABLE | Total view-through conversion events |
| click_attributed_conversions_1d | INTEGER | NULLABLE | Click-attributed conversions within 1 day |
| view_through_conversions_1d | INTEGER | NULLABLE | View-through conversions within 1 day |
| total_conversions_1d | INTEGER | NULLABLE | Total conversions within 1 day (click + view) |
| click_attributed_conversions_7d | INTEGER | NULLABLE | Click-attributed conversions within 7 days |
| view_through_conversions_7d | INTEGER | NULLABLE | View-through conversions within 7 days |
| total_conversions_7d | INTEGER | NULLABLE | Total conversions within 7 days (click + view) |
| avg_click_to_conversion_hours | FLOAT | NULLABLE | Average hours from click to conversion (click model) |

---
