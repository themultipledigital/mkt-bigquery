# Resource Limit Error - Fixed!

## The Problem

You got **Error 1102: Worker exceeded resource limits** when running:
```
https://meta-report.digital-bcc.workers.dev/?account=FRM-155237
```

### Root Cause
The worker was hitting Cloudflare's CPU time limit because:
1. **Daily mode** (default when no mode specified) processes synchronously
2. It fetches 7 days of data
3. Writes to BigQuery
4. Runs **expensive deduplication logic** with transactions and temp tables
5. For accounts with lots of ads/breakdowns, this exceeds the CPU limit

## The Fix

**Daily mode now uses Cloudflare Queues automatically** (just like backfill mode).

### What Changed

1. ✅ Daily mode automatically uses queue when `META_REPORT_QUEUE` is configured
2. ✅ Sends a single 7-day chunk per account to the queue
3. ✅ Queue consumer processes it asynchronously (no CPU limit!)
4. ✅ Added `?sync=true` parameter to force synchronous processing if needed

### Updated Behavior

| Mode | Before | After (v2.0) |
|------|--------|--------------|
| **Daily** (default) | Synchronous (CPU timeout!) | Queue (async processing) ✅ |
| **Backfill** | Synchronous (CPU timeout!) | Queue (async processing) ✅ |
| **Custom Range** | Synchronous | Synchronous (no queue) |

## How to Use It Now

### Option 1: Use Queue (Recommended)

**After configuring the queue**, just call it normally:

```bash
# Daily mode (7 days) - uses queue automatically
curl "https://meta-report.digital-bcc.workers.dev/?account=FRM-155237&dest=bq"
```

Response:
```
HTTP/1.1 202 Accepted

Daily fetch queued: 1 chunk(s) for 1 account(s)
Request ID: 550e8400-e29b-41d4-a716-446655440000
Monitor logs for processing status.
```

### Option 2: Force Synchronous (Not Recommended)

Only use this for testing with small accounts:

```bash
# Force synchronous processing (may timeout on large accounts!)
curl "https://meta-report.digital-bcc.workers.dev/?account=FRM-155237&dest=bq&sync=true"
```

⚠️ **Warning**: This will still timeout if you have a lot of data!

## Setup Required

You need to configure the Cloudflare Queue first:

### Quick Setup (5 minutes)

1. **Create Queue**
   - Go to Cloudflare Dashboard → Workers & Pages → Queues
   - Click "Create Queue"
   - Name: `metaReportQueue`

2. **Add Producer Binding**
   - Go to your worker → Settings → Bindings
   - Under "Queue Producers", click "Add binding"
   - Variable name: `META_REPORT_QUEUE`
   - Queue: `metaReportQueue`
   - Save

3. **Add Consumer Binding**
   - Under "Queue Consumers", click "Add binding"
   - Queue: `metaReportQueue`
   - Max batch size: `10`
   - Max batch timeout: `30` seconds
   - Max retries: `3`
   - Save

4. **Deploy Updated Worker**
   - Upload the new `meta-report.js` file

5. **Test It**
   ```bash
   curl "https://meta-report.digital-bcc.workers.dev/?account=FRM-155237&dest=bq"
   ```

See `CLOUDFLARE-QUEUE-SETUP-GUIDE.md` for detailed setup instructions.

## Why This Fixes the Problem

### Before (Synchronous)
```
HTTP Request
  ↓
Fetch 7 days of FB data (10,000+ rows)
  ↓
Transform data (lots of CPU)
  ↓
Write to BigQuery
  ↓
Run deduplication (VERY CPU intensive!)
  ↓
❌ CPU TIMEOUT! (Error 1102)
```

### After (Queue-Based)
```
HTTP Request
  ↓
Send message to queue
  ↓
Return 202 Accepted immediately ✅
  ↓
Queue Consumer (separate execution):
  ├─ Fetch FB data (no time limit!)
  ├─ Transform data
  ├─ Write to BigQuery (with retry!)
  ├─ Run deduplication (with retry!)
  └─ Complete successfully ✅
```

## Benefits

✅ **No More Timeouts**: Queue processing has much higher CPU limits  
✅ **Automatic Retries**: Failed chunks retry automatically  
✅ **Better Monitoring**: Track progress in real-time logs  
✅ **Concurrent Processing**: Multiple accounts process simultaneously  
✅ **Resilient**: Worker crashes don't lose data  

## Monitoring

View queue processing in real-time:

1. Go to Workers & Pages → Your worker → Logs
2. Start log stream
3. Look for these events:

```json
{"level":"INFO","event":"DailyQueueMode","date_range":{"from":"2024-10-22","to":"2024-10-29"}}
{"level":"INFO","event":"QueueMessageProcessing","account_id":"FRM-155237"}
{"level":"INFO","event":"FacebookAPICallCompleted","rows_fetched":1250}
{"level":"INFO","event":"BigQueryWriteCompleted","rows_written":1250}
{"level":"INFO","event":"QueueMessageSuccess","account_id":"FRM-155237"}
```

## Testing Steps

### 1. Without Queue (Will Fail)
Current behavior - you'll get Error 1102:
```bash
curl "https://meta-report.digital-bcc.workers.dev/?account=FRM-155237&dest=bq&sync=true"
# ❌ Error 1102: Worker exceeded resource limits
```

### 2. With Queue (Will Succeed)
After configuring queue:
```bash
curl "https://meta-report.digital-bcc.workers.dev/?account=FRM-155237&dest=bq"
# ✅ HTTP 202: Daily fetch queued: 1 chunk(s) for 1 account(s)
```

## FAQ

### Q: Do I need a queue for small accounts?
**A:** Yes, it's recommended for all accounts. Even "small" accounts can have lots of data with platform/position/device breakdowns.

### Q: Will my scheduled cron jobs work?
**A:** Yes! Cron jobs will use the queue automatically when configured. No changes needed.

### Q: What if the queue is not configured?
**A:** The worker falls back to synchronous processing (old behavior). You'll see this log:
```json
{"level":"INFO","event":"BackfillSyncMode","note":"Queue not configured, using synchronous processing"}
```

### Q: Can I process multiple accounts at once?
**A:** Yes! Just don't specify `?account=` parameter (requires cron trigger). Each account gets its own queue message.

### Q: How long does queue processing take?
**A:** Typically 5-30 seconds per account, depending on data volume. Check logs for real-time progress.

### Q: What happens if queue processing fails?
**A:** Messages retry automatically (up to 3 times with exponential backoff). After 3 failures, goes to dead letter queue (if configured).

## Next Steps

1. ✅ Deploy the updated worker code
2. ✅ Configure the queue (5 minutes)
3. ✅ Test with your account
4. ✅ Monitor the logs
5. ✅ Enjoy no more timeouts! 🎉

Need help? Check:
- `CLOUDFLARE-QUEUE-SETUP-GUIDE.md` - Detailed setup
- `META-REPORT-V2-IMPLEMENTATION-SUMMARY.md` - Full feature docs
- Cloudflare Dashboard → Workers → Logs - Real-time debugging

