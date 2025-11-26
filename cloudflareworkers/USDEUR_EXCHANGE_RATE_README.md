# USD/EUR Exchange Rate Worker

This Cloudflare Worker fetches daily USD to EUR exchange rates and saves them to BigQuery.

## Overview

The worker fetches exchange rates from free/public APIs and stores them in BigQuery table `level-hope-462409-a8.utils.usdeur` with the following schema:
- `date` (DATE): The date of the exchange rate
- `rate` (NUMERIC): USD to EUR conversion rate
- `retrieved_at` (TIMESTAMP): When the data was fetched

## Features

- Fetches daily exchange rates for the entire current year (or specified year)
- Supports scheduled daily updates via cron (fetches yesterday's rate)
- Automatic BigQuery table creation with proper schema
- Multiple API fallbacks for reliability
- Handles rate limiting and errors gracefully

## Setup

### 1. Environment Variables

The worker uses variables from `.dev.vars` for local development. For production, set them as secrets.

**Required variables** (already in `.dev.vars`):
- `BQ_PROJECT_ID` - Already set to `level-hope-462409-a8`
- `BQ_DATASET` - Should be `utils` for this worker (currently set to `mkt_channels` in .dev.vars)
- `GS_CLIENT_EMAIL` - Already configured
- `GS_PRIVATE_KEY` - Already configured
- `BQ_LOCATION` - Already set to `US`

**Optional variables**:
- `EXCHANGE_RATE_API_KEY` - For better historical data support (get from https://www.exchangerate-api.com/)

### 2. Local Development

For local testing, the worker will automatically use variables from `.dev.vars`. You may want to add/override:

```bash
# Add to .dev.vars (or create if it doesn't exist)
BQ_DATASET=utils
EXCHANGE_RATE_API_KEY=your-api-key-here  # Optional
```

Then test locally:
```bash
cd cloudflareworkers
wrangler dev --config wrangler-usdeur.toml
```

### 3. Deploy to Production

Deploy the worker:
```bash
cd cloudflareworkers
wrangler deploy --config wrangler-usdeur.toml
```

### 4. Set Production Secrets

Set the following secrets using `wrangler secret put` (only if different from `.dev.vars`):

```bash
# BigQuery Dataset (should be "utils" for this worker)
wrangler secret put BQ_DATASET
# Enter: utils

# Optional: Exchange Rate API Key for better historical data
wrangler secret put EXCHANGE_RATE_API_KEY
# Get free API key from: https://www.exchangerate-api.com/
```

**Note**: `BQ_PROJECT_ID`, `GS_CLIENT_EMAIL`, `GS_PRIVATE_KEY`, and `BQ_LOCATION` are already configured in your `.dev.vars` and should be set as secrets if they're not already set in your Cloudflare account.

## Usage

### Manual Trigger - Fetch All Dates for Current Year

```bash
curl https://usdeur-exchange-rate.your-subdomain.workers.dev/
```

Or with a specific year:

```bash
curl https://usdeur-exchange-rate.your-subdomain.workers.dev/?year=2024
```

### Manual Trigger - Fetch Single Date (Daily Mode)

```bash
curl https://usdeur-exchange-rate.your-subdomain.workers.dev/?mode=daily
```

### Scheduled Execution

The worker is configured to run daily at 02:00 UTC via cron trigger, fetching yesterday's exchange rate.

## API Endpoints Used

The worker tries multiple free exchange rate APIs in order:

1. **exchangerate-api.io** (if API key provided)
   - Free tier: 1,500 requests/month
   - Supports historical data
   - Get API key: https://www.exchangerate-api.com/

2. **exchangerate-api.com** (free, no key required)
   - Limited historical data support
   - No API key needed

3. **exchangerate.host** (free, no key required)
   - Supports historical data
   - No API key needed

4. **fixer.io** (if API key provided)
   - Fallback option
   - Requires API key

## BigQuery Table

The data is stored in:
- **Project**: `level-hope-462409-a8`
- **Dataset**: `utils`
- **Table**: `usdeur`

### Table Schema

```sql
CREATE TABLE `level-hope-462409-a8.utils.usdeur` (
  date DATE,
  rate NUMERIC,
  retrieved_at TIMESTAMP
)
PARTITION BY date
```

### Querying the Data

```sql
-- Get all rates for 2024
SELECT * 
FROM `level-hope-462409-a8.utils.usdeur`
WHERE date >= '2024-01-01' AND date < '2025-01-01'
ORDER BY date DESC;

-- Get latest rate
SELECT * 
FROM `level-hope-462409-a8.utils.usdeur`
ORDER BY date DESC
LIMIT 1;

-- Get average rate for a month
SELECT 
  DATE_TRUNC(date, MONTH) as month,
  AVG(rate) as avg_rate,
  MIN(rate) as min_rate,
  MAX(rate) as max_rate
FROM `level-hope-462409-a8.utils.usdeur`
WHERE date >= '2024-01-01'
GROUP BY month
ORDER BY month DESC;
```

## Error Handling

- If an API fails, the worker automatically tries the next available API
- Failed dates are logged but don't stop the entire process
- The worker returns a summary of successful fetches and any errors

## Rate Limiting

The worker includes a 100ms delay between API calls to avoid rate limiting. For large date ranges (e.g., full year), the process may take several minutes.

## Monitoring

Check the Cloudflare Workers dashboard for:
- Execution logs
- Error messages
- Execution time
- Success/failure rates

## Troubleshooting

### "Google authentication failed"
- Verify `GS_CLIENT_EMAIL` and `GS_PRIVATE_KEY` are set correctly
- Ensure the private key includes `\n` characters (they should be preserved)
- Check that the service account has BigQuery permissions

### "Failed to fetch exchange rate"
- Check if the date is too far in the future (APIs may not have future rates)
- Verify API keys if using paid APIs
- Check worker logs for specific API error messages

### "BigQuery table create failed"
- Verify `BQ_PROJECT_ID` and `BQ_DATASET` are correct
- Ensure the service account has BigQuery Admin or Editor role
- Check that the dataset exists in BigQuery

## Local Development

The worker automatically uses variables from `.dev.vars` for local development. 

To test locally:

```bash
cd cloudflareworkers
wrangler dev --config wrangler-usdeur.toml
```

**Note**: Make sure `.dev.vars` has `BQ_DATASET=utils` (or add it) since this worker writes to the `utils` dataset, not `mkt_channels`.

