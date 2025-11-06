# Spain Meta Account Setup - COMPLETE ✅

## Summary

The Spain Meta account worker has been successfully configured with the discovered custom conversion events.

---

## What Was Done

### 1. ✅ Discovery Script Created
**File:** `discover_meta_events.py`

Successfully discovered 5 custom conversions from Spain account (act_267879991917703):
- `login_unique` (ID: 3941559526166758) - Unique logins with 14-day deduplication
- `deposit_unique` (ID: 588881190337418) - Unique deposits with 14-day deduplication
- `deposit_count` (ID: 1121763705965512) - All deposit counts
- `login_count` (ID: 1501720963876950) - All login counts
- `deposit` (ID: 2594828540712125) - Deposits with value > 0

### 2. ✅ Worker File Created & Configured
**File:** `meta-reportV1-spain.js`

**Changes Made:**
- **Version:** Updated to 1.0.0-SPAIN
- **Documentation:** Added Spain-specific header indicating account and conversions
- **ACTION_TYPES:** Replaced S2S pattern with actual Spain conversion IDs:
  ```javascript
  const ACTION_TYPES = [
    "offsite_conversion.custom.3941559526166758",  // login_unique
    "offsite_conversion.custom.588881190337418",   // deposit_unique
    "offsite_conversion.custom.1121763705965512",  // deposit_count
    "offsite_conversion.custom.1501720963876950",  // login_count
    "offsite_conversion.custom.2594828540712125"   // deposit
  ];
  ```
- **CONVERSION_NAMES:** Added ID-to-name mapping for readable column headers
- **shortAction():** Updated to extract conversion names from `offsite_conversion.custom.*` format

### 3. ✅ Documentation Created
**File:** `SPAIN_SETUP_INSTRUCTIONS.md`

Comprehensive setup guide with troubleshooting and verification steps.

---

## Column Headers Generated

The worker will create columns in this format:

**Conversion Count Columns:**
- `conv_login_unique_total`, `conv_login_unique_1d_view`, `conv_login_unique_7d_view`, etc.
- `conv_deposit_unique_total`, `conv_deposit_unique_1d_view`, `conv_deposit_unique_7d_view`, etc.
- `conv_deposit_count_total`, `conv_deposit_count_1d_view`, etc.
- `conv_login_count_total`, `conv_login_count_1d_view`, etc.
- `conv_deposit_total`, `conv_deposit_1d_view`, etc.

**Conversion Value Columns:**
- `convval_login_unique_total`, `convval_login_unique_1d_view`, etc.
- `convval_deposit_unique_total`, `convval_deposit_unique_1d_view`, etc.
- (and so on for all conversions)

Each conversion has **11 attribution windows**:
- `total` (value)
- `1d_view`, `7d_view`, `28d_view`
- `1d_click`, `7d_click`, `28d_click`
- `1d_view_first_conversion`, `7d_view_first_conversion`
- `1d_click_first_conversion`, `7d_click_first_conversion`

**Total columns:** 5 conversions × 11 windows × 2 metrics (count + value) = **110 conversion columns** + base metrics

---

## Next Steps - DEPLOYMENT

### Step 1: Set Environment Variables in Cloudflare Workers

Go to your Cloudflare Dashboard → Workers → Settings → Variables and add:

```bash
# Spain Meta Account
FRM-SPAIN-FB_ACCESS_TOKEN=EAAKZB4qJZB2rABP1PIfN6PjhOjM7AWOQZCdpa04TCa5wzSbDDwhXJLlCAIjYUSyHswjmIpEnob3v4OtYFwUQtT9lNf7wn2VocZA0IYYohXT3ZAgb9MGiYB3uq832f9wZBqvUPjrFnZC3V8QsHIJnQsxnFJh1FBjU6xYI1PJApvetAijT6c39EUu7RvDPHZBnCuDe
FRM-SPAIN-FB_ACCOUNT_ID=act_267879991917703
```

**Note:** Data will be saved to BigQuery table `meta_stats_es` by default (can be overridden with `?table=` parameter).

⚠️ **IMPORTANT:** The access token above will expire. Generate a long-lived token (60+ days) before deploying to production.

**Also verify these shared environment variables exist:**
```bash
GS_CLIENT_EMAIL=<service_account_email>
GS_PRIVATE_KEY=<service_account_private_key>
SPREADSHEET_ID=<google_sheets_id>
RANGE_NAME=<sheet_tab_name>
BQ_PROJECT_ID=<bigquery_project>
BQ_DATASET=<bigquery_dataset>
BQ_LOCATION=<bigquery_location>  # e.g., EU, US
S3_REGION=<aws_region>
S3_BUCKET=<s3_bucket>
S3_ACCESS_KEY=<aws_access_key>
S3_SECRET_KEY=<aws_secret_key>
```

### Step 2: Deploy Worker

**Option A - Wrangler CLI (Recommended):**
```bash
cd cloudflareworkers
npx wrangler deploy meta-reportV1-spain.js --name meta-report-spain
```

**Option B - Cloudflare Dashboard:**
1. Copy contents of `meta-reportV1-spain.js`
2. Go to Cloudflare Dashboard → Workers & Pages
3. Create new Worker named `meta-report-spain`
4. Paste code and Save & Deploy

### Step 3: Test Worker

**Manual test (yesterday's data):**
```
GET https://meta-report-spain.your-subdomain.workers.dev/?account=FRM-SPAIN&dest=bq
```

**Custom date range:**
```
GET https://meta-report-spain.your-subdomain.workers.dev/?account=FRM-SPAIN&dest=bq&from=2025-10-01&to=2025-11-01
```

**Test with Google Sheets output (for debugging):**
```
GET https://meta-report-spain.your-subdomain.workers.dev/?account=FRM-SPAIN&dest=sheets
```

### Step 4: Backfill Historical Data (Optional)

**Last 6 months:**
```
GET https://meta-report-spain.your-subdomain.workers.dev/?account=FRM-SPAIN&mode=backfill&lookback=6m&dest=bq
```

**Last year:**
```
GET https://meta-report-spain.your-subdomain.workers.dev/?account=FRM-SPAIN&mode=backfill&lookback=1y&dest=bq
```

### Step 5: Set Up Scheduled Runs

**In Cloudflare Dashboard:**
1. Go to Worker → Triggers
2. Click "Add Cron Trigger"
3. Set schedule: `0 2 * * *` (daily at 2 AM UTC)
4. Save

**Or in wrangler.toml:**
```toml
name = "meta-report-spain"
main = "meta-reportV1-spain.js"
compatibility_date = "2024-01-01"

[triggers]
crons = ["0 2 * * *"]  # Run daily at 2 AM UTC
```

---

## Verification

### Check Cloudflare Worker Logs
Look for:
```
Fetched X rows for FRM-SPAIN (daily mode)
Account FRM-SPAIN total: X raw rows → X flattened rows
Successfully uploaded X rows to BigQuery table meta_stats_es
```

### Query BigQuery Data

**Check Spain data exists:**
```sql
SELECT 
  account_id,
  COUNT(*) as row_count,
  MIN(date_start) as earliest_date,
  MAX(date_start) as latest_date
FROM `your-project.your-dataset.meta_stats_es`
WHERE account_id = 'FRM-SPAIN'
GROUP BY account_id;
```

**Check conversion data:**
```sql
SELECT 
  date_start,
  campaign_name,
  conv_login_unique_total,
  conv_deposit_unique_total,
  conv_deposit_count_total,
  convval_deposit_total
FROM `your-project.your-dataset.meta_stats_es`
WHERE account_id = 'FRM-SPAIN'
  AND date_start >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
ORDER BY date_start DESC, spend DESC
LIMIT 20;
```

**Check for null conversions (troubleshooting):**
```sql
SELECT 
  date_start,
  campaign_name,
  spend,
  conv_login_unique_total,
  conv_deposit_unique_total
FROM `your-project.your-dataset.meta_stats_es`
WHERE account_id = 'FRM-SPAIN'
  AND (conv_login_unique_total IS NULL AND conv_deposit_unique_total IS NULL)
ORDER BY date_start DESC
LIMIT 10;
```

---

## Differences from Original Worker

| Feature | Original Worker | Spain Worker |
|---------|----------------|--------------|
| Account Pattern | Multiple accounts (FRM-XXXXX) | FRM-SPAIN only |
| Conversion Pattern | S2S Pattern (BASE_ACTIONS × BRANDS) | Direct conversion IDs |
| Conversion Prefix | `offsite_conversion.fb_pixel_custom.` | `offsite_conversion.custom.` |
| Number of Conversions | 35 (5 actions × 7 brands) | 5 (specific Spain conversions) |
| Conversion Names | Purchase, Lead, PurchasePlus, etc. | login_unique, deposit_unique, etc. |

---

## Troubleshooting

### Issue: No conversion data in BigQuery
**Possible Causes:**
- Access token doesn't have `ads_read` permission
- Conversion IDs changed (re-run discovery script)
- Campaigns don't have any conversions in selected date range

**Solution:**
1. Verify token permissions in Meta Business Manager
2. Test with a date range that has known conversions
3. Check Cloudflare Worker logs for API errors

### Issue: Column headers show IDs instead of names
**Cause:** `CONVERSION_NAMES` mapping is missing or incorrect

**Solution:**
Verify lines 127-133 in `meta-reportV1-spain.js` match discovery output.

### Issue: Worker timeout or 504 error
**Cause:** Too much data in single request

**Solution:**
- Use smaller date ranges (weekly/monthly chunks)
- Use `mode=backfill&lookback=3m` instead of large from/to ranges
- Worker automatically splits large requests into weekly chunks

---

## Files Created

1. ✅ `discover_meta_events.py` - Discovery script
2. ✅ `meta-reportV1-spain.js` - Configured worker
3. ✅ `SPAIN_SETUP_INSTRUCTIONS.md` - Detailed setup guide
4. ✅ `SPAIN_SETUP_COMPLETE.md` - This summary

---

## Ready to Deploy! 🚀

All configuration is complete. Follow the deployment steps above to go live.

If you need to modify conversions in the future:
1. Re-run `discover_meta_events.py`
2. Update `ACTION_TYPES` array in worker
3. Update `CONVERSION_NAMES` mapping
4. Redeploy worker

