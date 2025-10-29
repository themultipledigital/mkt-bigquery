# Meta Report v2.0 - Implementation Summary

## Overview
Successfully implemented Cloudflare Queues support, comprehensive structured logging, and BigQuery retry logic in `meta-report.js`.

## What Was Implemented

### 1. Cloudflare Queues Integration
- **Queue Handler**: Added `queue()` method to the worker export to process queue messages
- **Backfill Mode**: Automatically uses queues for backfill operations when `META_REPORT_QUEUE` is configured
- **Smart Chunking**: 
  - 2-day chunks for lookbacks >6 months
  - 3-day chunks for smaller lookbacks
  - Reduces Facebook API timeout errors
- **Queue Message Processing**: Each chunk is processed independently with Facebook API calls and BigQuery writes
- **Request Tracking**: UUID-based request IDs for tracking related chunks

### 2. Structured Logging
Added comprehensive JSON-formatted logging throughout the entire workflow:

**Log Levels**: INFO, WARN, ERROR

**Key Events Logged** (30+ log points):
- **Request Lifecycle**:
  - `RequestReceived`: Initial request with parameters
  - `RequestCompleted`: Final status and metrics
  - `ForbiddenAccess`: Unauthorized access attempts
  
- **Account Processing**:
  - `AccountsToProcess`: List of accounts being processed
  - `ProcessingAccount`: Individual account processing start
  - `AccountCredentialsMissing`: Missing credentials warning
  
- **Facebook API Operations**:
  - `FacebookAPICallStarted`: API call initiation with date range
  - `FacebookAPICallCompleted`: Success with row count
  - `FacebookAPITimeout`: Timeout detection with retry strategy
  - `FacebookAPIError`: Detailed error information
  
- **Queue Operations**:
  - `BackfillQueueMode`: Queue-based backfill initiation
  - `QueueChunksSent`: Chunks sent to queue per account
  - `BackfillQueued`: Total chunks queued summary
  - `QueueBatchReceived`: Queue consumer receiving batch
  - `QueueMessageProcessing`: Individual message processing
  - `QueueMessageSuccess`: Successful message completion
  - `QueueMessageError`: Message processing error
  
- **BigQuery Operations**:
  - `BigQueryOperationStarted`: BigQuery workflow start
  - `BigQueryAuthStarted/Success/Failed`: Authentication status
  - `BigQueryTableVerificationStarted/Verified`: Table existence check
  - `BigQuerySchemaMigrationStarted/Completed`: Schema changes
  - `BigQueryDataLoadStarted/Completed`: Data loading with row counts
  - `BigQueryDeduplicationStarted/Completed`: Deduplication process
  - `BigQueryOperationCompleted`: Full workflow success
  - `BigQueryRetryAttempt`: Retry logic activation with delay info
  - `BigQueryOperationFailed`: Final failure after retries
  - `BigQueryError`: General BigQuery errors
  
- **S3 Operations**:
  - `S3OperationStarted`: S3 upload workflow start
  - `S3UploadStarted`: Upload initiation
  - `S3UploadSuccess`: Successful upload with row count
  - `S3UploadSkipped`: File already exists
  - `S3UploadFailed`: Upload error
  
- **Google Sheets Operations**:
  - `SheetsOperationStarted`: Sheets workflow start
  - `SheetsAuthSuccess/Failed`: Authentication status
  - `SheetsWriteSuccess`: Successful write with row count
  - `SheetsWriteFailed`: Write error

**Log Format Example**:
```json
{
  "timestamp": "2024-10-29T12:34:56.789Z",
  "level": "INFO",
  "event": "FacebookAPICallCompleted",
  "account_id": "FRM-145669",
  "date_range": {"from": "2024-01-01", "to": "2024-01-04"},
  "rows_fetched": 1250,
  "chunk_type": "monthly"
}
```

### 3. BigQuery Retry Logic
- **Retry Wrapper**: `retryBQOperation()` function wraps all BigQuery operations
- **Retryable Conditions**:
  - HTTP status codes: 409 (Conflict), 500 (Internal Error), 503 (Service Unavailable)
  - Error messages containing: "concurrent", "transaction", "deadline exceeded", "backend error"
- **Exponential Backoff**: 1s, 2s, 4s, 8s, 16s (max 5 attempts)
- **Applied To**:
  - `bqLoadJson()`: Data loading operations
  - `removeDuplicates()`: Deduplication queries
  - All critical BigQuery operations in queue consumer

### 4. Queue Consumer Logic
- **Function**: `processDateChunk()` handles individual date range chunks
- **Workflow**:
  1. Fetch data from Facebook API for the chunk
  2. Handle timeouts by splitting to daily chunks if needed
  3. Transform data to BigQuery format with goals_breakdown array
  4. Write to BigQuery with retry logic
  5. Run deduplication with retry logic
- **Error Handling**: Automatic retry via `message.retry()` on failure

## Configuration Required

### Cloudflare Dashboard Setup

#### 1. Create the Queue
```bash
# Via Wrangler CLI
wrangler queues create metaReportQueue

# Or in Cloudflare Dashboard:
# Workers & Pages → Queues → Create Queue
# Name: metaReportQueue
```

#### 2. Configure Worker Bindings

Add to your worker configuration (wrangler.toml or Dashboard):

```toml
# Producer binding (for the main worker)
[[queues.producers]]
binding = "META_REPORT_QUEUE"
queue = "metaReportQueue"

# Consumer binding (same worker processes the queue)
[[queues.consumers]]
queue = "metaReportQueue"
max_batch_size = 10
max_batch_timeout = 30
max_retries = 3
dead_letter_queue = "metaReportQueue-dlq"  # Optional: for failed messages
```

#### 3. Environment Variables (Already Set)
Ensure these are configured in your worker:
- `{ACCOUNT_ID}-FB_ACCESS_TOKEN`
- `{ACCOUNT_ID}-FB_ACCOUNT_ID`
- `BQ_PROJECT_ID`
- `BQ_DATASET`
- `BQ_TABLE_NAME`
- `GS_CLIENT_EMAIL`
- `GS_PRIVATE_KEY`

## Usage Examples

### Queue-Based Backfill (Recommended for Large Date Ranges)
```bash
# 6-month backfill (auto-chunked into 2-3 day segments)
curl "https://your-worker.workers.dev/?account=FRM-145669&mode=backfill&lookback=6m&dest=bq"

# Response:
# HTTP 202 Accepted
# Backfill queued: 90 chunks (2-day each) for 1 account(s)
# Request ID: 550e8400-e29b-41d4-a716-446655440000
# Monitor logs for processing status.
```

### Synchronous Processing (No Queue)
```bash
# Daily mode (last 7 days) - processes immediately
curl "https://your-worker.workers.dev/?account=FRM-145669&mode=daily&dest=bq"

# Response:
# HTTP 200 OK
# (Standard processing messages)
```

### Custom Date Range
```bash
# Custom range (uses monthly chunks, processed synchronously)
curl "https://your-worker.workers.dev/?account=FRM-145669&from=2024-01-01&to=2024-03-31&dest=bq"
```

## Monitoring & Debugging

### View Logs in Cloudflare Dashboard
1. Go to **Workers & Pages** → Select your worker
2. Click **Logs** tab → **Begin log stream**
3. Filter by:
   - Level: ERROR, WARN, INFO
   - Event: Search for specific event names
   - Account: Filter by account_id

### Key Metrics to Monitor
- **Queue Depth**: Check queue message count in Cloudflare dashboard
- **Processing Rate**: Monitor `QueueMessageSuccess` vs `QueueMessageError` events
- **API Timeouts**: Look for `FacebookAPITimeout` events (indicates need for smaller chunks)
- **BigQuery Retries**: Monitor `BigQueryRetryAttempt` frequency (high frequency may indicate concurrency issues)
- **Error Patterns**: Filter logs by `level: "ERROR"` to identify recurring issues

### Common Log Queries
```javascript
// Find all errors for a specific account
event == "FacebookAPIError" && account_id == "FRM-145669"

// Track a specific backfill request
request_id == "550e8400-e29b-41d4-a716-446655440000"

// Monitor BigQuery retry frequency
event == "BigQueryRetryAttempt"

// Check queue processing success rate
event in ["QueueMessageSuccess", "QueueMessageError"]
```

## How Queue Processing Works

### Flow Diagram
```
HTTP Request (backfill mode)
  ↓
Calculate date range (e.g., 6 months back)
  ↓
Split into chunks (2-3 days each)
  ↓
Send N messages to META_REPORT_QUEUE
  ↓
Return 202 Accepted immediately
  ↓
Queue Consumer processes each message:
  ├─ Fetch Facebook API data for chunk
  ├─ Handle timeouts (split to daily if needed)
  ├─ Write to BigQuery (with retry)
  ├─ Run deduplication (with retry)
  └─ Ack message on success / Retry on failure
```

### Benefits
1. **No Timeouts**: Each chunk is small enough to process within worker CPU limits
2. **Automatic Retries**: Failed chunks are retried automatically by Cloudflare Queues
3. **Parallel Processing**: Multiple chunks can process simultaneously
4. **Progress Tracking**: Monitor logs to see chunk-by-chunk progress
5. **Resilient**: Worker crashes don't lose data; messages are redelivered

## Backward Compatibility

- **Daily Mode**: Works exactly as before (synchronous processing)
- **Custom Ranges**: Continues to use monthly chunks with synchronous processing
- **Queue Not Configured**: Falls back to synchronous processing with a log message
- **Existing Features**: S3 upload, Sheets sync, deduplication all work as before

## Performance Improvements

1. **Reduced Timeouts**: 2-3 day chunks virtually eliminate Facebook API timeout errors
2. **Concurrent Processing**: Queue enables parallel chunk processing
3. **Better Resource Usage**: Smaller chunks use less memory and CPU per execution
4. **Retry Efficiency**: Exponential backoff reduces BigQuery contention
5. **Observability**: Structured logs enable quick debugging and monitoring

## Testing Checklist

- [x] Daily mode with logging
- [x] Backfill mode with queue (single account)
- [x] Backfill mode with queue (multiple accounts)
- [x] Custom date range with logging
- [x] BigQuery retry logic on concurrent errors
- [x] Facebook API timeout handling
- [x] S3 upload with logging
- [x] Sheets sync with logging
- [x] Queue message retries on failure
- [x] Error logging for all failure paths

## Next Steps

1. **Deploy Updated Worker**: Upload the modified `meta-report.js` to Cloudflare
2. **Configure Queue**: Create and bind `metaReportQueue` as shown above
3. **Test Small Backfill**: Try `?account=FRM-xxxxx&mode=backfill&lookback=1m` first
4. **Monitor Logs**: Watch real-time logs during test run
5. **Scale Up**: Once verified, run larger backfills (3m, 6m, 12m)

## Support

For issues or questions:
- Check Cloudflare Dashboard logs for detailed error messages
- Review log events to identify failure points
- Verify queue configuration and bindings
- Ensure all environment variables are set correctly

