# Running meta-report.js Locally

## Prerequisites
✅ Wrangler CLI installed (already done)

## Setup Steps

### 1. Create your environment variables file
```bash
cd cloudflareworkers
cp .dev.vars.template .dev.vars
```

### 2. Edit .dev.vars with your actual credentials
Open `.dev.vars` in your editor and fill in:
- BigQuery credentials (BQ_PROJECT_ID, BQ_DATASET, etc.)
- Google Service Account credentials (GS_CLIENT_EMAIL, GS_PRIVATE_KEY)
- Facebook account tokens (one or more FRM-XXXXXX-FB_ACCESS_TOKEN pairs)
- S3 credentials (if using S3 destination)
- Google Sheets ID (if using Sheets destination)

**Important:** The GS_PRIVATE_KEY should keep the `\n` characters in the .dev.vars file

### 3. Run the worker locally
```bash
wrangler dev
```

This will start a local server (usually at `http://localhost:8787`)

### 4. Test the worker

Open another terminal and make requests:

**Fetch last 7 days for specific account:**
```bash
curl "http://localhost:8787/?account=FRM-145669&dest=bq"
```

**Fetch custom date range:**
```bash
curl "http://localhost:8787/?account=FRM-145669&from=2024-01-01&to=2024-01-31&dest=bq"
```

**Test backfill (6 months):**
```bash
curl "http://localhost:8787/?account=FRM-145669&mode=backfill&lookback=6m&dest=bq"
```

**Force synchronous processing (bypass queue):**
```bash
curl "http://localhost:8787/?account=FRM-145669&sync=true&dest=bq"
```

## Notes

- **Queue functionality**: Local dev may have limited queue support. Use `?sync=true` to test without queues
- **IP restrictions**: The worker has IP allowlist checks. You may need to temporarily comment out lines 379-384 in meta-report.js for local testing
- **.dev.vars is gitignored**: Your credentials stay local and won't be committed

## Troubleshooting

**Issue:** Queue binding errors
- **Solution:** Add `?sync=true` to bypass queue processing during local dev

**Issue:** "Forbidden" responses
- **Solution:** Comment out the IP allowlist check (lines 379-384) for local testing

**Issue:** Environment variables not loading
- **Solution:** Make sure .dev.vars is in the same directory as wrangler.toml (cloudflareworkers/)

**Issue:** BigQuery authentication fails
- **Solution:** Check that GS_PRIVATE_KEY includes all newlines as `\n` in .dev.vars

