# BigQuery Project Documentation

_Generated for `reports.all_channel_performance` - Unified channel performance across Meta, POPS and Trade Desk_

**Full Name**: `level-hope-462409-a8.reports.all_channel_performance`

**Description**: Normalized view unifying performance and conversion metrics from Meta (`meta_stats_custom`), POPS (`pops_stats_custom`), and Trade Desk (`tradedesk_stats_custom`). Keeps the most granular available level per channel and harmonizes conversion terminology.

- Meta brand-specific totals use attribution 7d_click + 1d_view
- POPS S2S metrics are aggregated (no attribution window splits)
- Trade Desk includes split windows (1d_view, 7d_click)
- Spend currency: EUR (advertiser spend)

**Schema**:

| Column Name | Type | Mode | Description |
|-------------|------|------|-------------|
| date | DATE | NULLABLE | Date of the metric row |
| channel | STRING | NULLABLE | Source channel. Meta rows: 'meta'. Trade Desk rows: 'tradedesk'. POPS rows: one of 'ExoClick', 'TrafficJunky', or 'TrafficStars' as reported by source |
| campaign_id | STRING | NULLABLE | Campaign identifier (NULL for Meta) |
| campaign_name | STRING | NULLABLE | Campaign name (custom for Meta) |
| adset_id | STRING | NULLABLE | Ad set / ad group identifier (TD mapped; NULL for Meta/POPS) |
| adset_name | STRING | NULLABLE | Ad set / ad group name (TD mapped; Meta from adset, POPS NULL) |
| ad_id | STRING | NULLABLE | Ad / creative identifier (TD mapped; NULL for Meta/POPS) |
| ad_name | STRING | NULLABLE | Ad / creative name (TD mapped; Meta from ad) |
| impressions | INT64 | NULLABLE | Impressions delivered |
| clicks | INT64 | NULLABLE | Clicks recorded |
| spend | NUMERIC | NULLABLE | Advertiser spend (EUR) |
| reg_conversions | INT64 | NULLABLE | Registration conversions (NULL for Meta) |
| dep_conversions | INT64 | NULLABLE | Deposit conversions. Attribution: Meta=7d click + 1d view (brand total), TD=7d click + 1d view (summed), POPS=unspecified S2S deposits |
| dep_value | NUMERIC | NULLABLE | Deposit value. Available for Meta (brand total) and POPS S2S; NULL for TD |
| ftd_conversions | INT64 | NULLABLE | First-time deposit conversions. Attribution: Meta=7d click + 1d view (brand total), TD=7d click + 1d view (summed), POPS=unspecified S2S FTD |
| ftd_value | NUMERIC | NULLABLE | First-time deposit value. Available for POPS and Meta (brand total); NULL for TD |
| source_view | STRING | NULLABLE | Lineage label for source view: 'meta' (Meta), 'pops' (POPS aggregate), 'tradedesk' (Trade Desk) |

**Dependencies**:

- `level-hope-462409-a8.mkt_channels.meta_stats_custom`

- `level-hope-462409-a8.mkt_channels.pops_stats_custom`

- `level-hope-462409-a8.mkt_channels.tradedesk_stats_custom`
