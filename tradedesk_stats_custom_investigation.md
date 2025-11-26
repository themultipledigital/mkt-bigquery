# Trade Desk Stats Custom View Investigation

## Issue Summary
November data appears in `tradedesk_stats_custom` view but not when querying the source table `tradedesk.ID42` directly.

## Root Cause Analysis

### Data Structure
- `tradedesk.ID42` is a view that combines:
  - `ID42_backfill` (historical/backfill data)
  - `ID42_performance_daily` (daily incremental data)
- The `Date` column is stored as **STRING** in `DD/MM/YYYY` format (e.g., "06/11/2025")

### Date Parsing in Custom View
The `tradedesk_stats_custom` view uses:
```sql
SAFE.PARSE_DATE('%d/%m/%Y', Date) AS date_start
```
This correctly parses "06/11/2025" → 2025-11-06 (November 6, 2025)

### Problem with Direct ID42 Query
When querying `ID42` directly:
```sql
SELECT Date, sum(Advertiser_Cost_USD) as spend
FROM `level-hope-462409-a8.tradedesk.ID42` 
GROUP BY 1
ORDER BY 1 desc
```

**Issue**: The `ORDER BY 1 desc` is doing **string sorting**, not date sorting!

String sorting of DD/MM/YYYY format:
- "31/10/2025" (Oct 31) comes before "06/11/2025" (Nov 6) in descending order
- "31/10/2025" > "06/11/2025" as strings (because "3" > "0")
- This causes November dates to appear mixed in or after October dates

## Diagnostic Queries

### 1. Check if November data exists in ID42 (with proper date parsing)
```sql
SELECT 
  SAFE.PARSE_DATE('%d/%m/%Y', Date) AS date_start,
  SUM(Advertiser_Cost_USD) AS spend
FROM `level-hope-462409-a8.tradedesk.ID42`
WHERE SAFE.PARSE_DATE('%d/%m/%Y', Date) >= '2025-11-01'
GROUP BY 1
ORDER BY 1 DESC
LIMIT 1000
```

### 2. Check which table contains November data
```sql
-- Check ID42_backfill
SELECT 
  SAFE.PARSE_DATE('%d/%m/%Y', Date) AS date_start,
  COUNT(*) AS row_count,
  SUM(Advertiser_Cost_USD) AS spend
FROM `level-hope-462409-a8.tradedesk.ID42_backfill`
WHERE SAFE.PARSE_DATE('%d/%m/%Y', Date) >= '2025-11-01'
GROUP BY 1
ORDER BY 1 DESC

UNION ALL

-- Check ID42_performance_daily
SELECT 
  SAFE.PARSE_DATE('%d/%m/%Y', Date) AS date_start,
  COUNT(*) AS row_count,
  SUM(Advertiser_Cost_USD) AS spend
FROM `level-hope-462409-a8.tradedesk.ID42_performance_daily`
WHERE SAFE.PARSE_DATE('%d/%m/%Y', Date) >= '2025-11-01'
GROUP BY 1
ORDER BY 1 DESC
```

### 3. Compare raw Date strings vs parsed dates
```sql
SELECT 
  Date AS date_string,
  SAFE.PARSE_DATE('%d/%m/%Y', Date) AS date_parsed,
  SUM(Advertiser_Cost_USD) AS spend
FROM `level-hope-462409-a8.tradedesk.ID42`
WHERE Date LIKE '%/11/2025' OR Date LIKE '%/10/2025'
GROUP BY 1, 2
ORDER BY 2 DESC  -- Order by parsed date, not string
LIMIT 100
```

## Recommended Fix

### For Direct ID42 Queries
Always parse the date when ordering or filtering:
```sql
SELECT 
  SAFE.PARSE_DATE('%d/%m/%Y', Date) AS date_start,
  SUM(Advertiser_Cost_USD) AS spend
FROM `level-hope-462409-a8.tradedesk.ID42`
GROUP BY 1
ORDER BY 1 DESC  -- Order by parsed date
LIMIT 1000
```

### For Date Filtering
Always use parsed dates:
```sql
WHERE SAFE.PARSE_DATE('%d/%m/%Y', Date) >= '2025-11-01'
-- NOT: WHERE Date >= '01/11/2025' (string comparison is incorrect!)
```

## Expected Results
After using proper date parsing, you should see:
- November dates (2025-11-01 through 2025-11-06) appearing at the top
- October dates following
- September dates after that

The `tradedesk_stats_custom` view is working correctly because it parses dates properly. The issue is only with direct queries to `ID42` that use string sorting.


