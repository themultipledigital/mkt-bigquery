# Cloudflare Queue Setup Guide for Meta Report Worker

## Quick Setup Steps

### Step 1: Create the Queue

1. Log in to Cloudflare Dashboard
2. Go to **Workers & Pages** → **Queues**
3. Click **Create Queue**
4. Enter queue name: `metaReportQueue`
5. Click **Create**

### Step 2: Configure Producer Binding

1. Go to **Workers & Pages**
2. Select your `meta-report` worker
3. Go to **Settings** → **Bindings**
4. Under **Queue Producers**, click **Add binding**
5. Fill in:
   - **Variable name**: `META_REPORT_QUEUE`
   - **Queue**: Select `metaReportQueue` from dropdown
6. Click **Save**

### Step 3: Configure Consumer

1. Still in worker **Settings** → **Bindings**
2. Under **Queue Consumers**, click **Add binding**
3. Fill in:
   - **Queue**: Select `metaReportQueue` from dropdown
   - **Max batch size**: `10`
   - **Max batch timeout**: `30` seconds
   - **Max retries**: `3`
4. Optional: Create dead letter queue (DLQ) for permanently failed messages
   - Create another queue named `metaReportQueue-dlq`
   - Select it as the **Dead letter queue**
5. Click **Save**

### Step 4: Deploy Updated Worker Code

1. Upload the modified `meta-report.js` to your worker
2. The worker will now have both HTTP handler and queue consumer

### Step 5: Test Configuration

Run a small test backfill:
```bash
curl "https://your-worker.workers.dev/?account=FRM-145669&mode=backfill&lookback=1m&dest=bq"
```

Expected response:
```
HTTP/1.1 202 Accepted

Backfill queued: 10 chunks (3-day each) for 1 account(s)
Request ID: [uuid]
Monitor logs for processing status.
```

### Step 6: Monitor Queue Processing

1. Go to **Workers & Pages** → **Queues** → `metaReportQueue`
2. View real-time metrics:
   - **Messages produced**: Total messages sent
   - **Messages consumed**: Total messages processed
   - **Messages pending**: Currently in queue
   - **Consumer errors**: Failed processing attempts

3. View detailed logs:
   - Go to your worker → **Logs** tab
   - Click **Begin log stream**
   - Filter by event type to see:
     - `QueueBatchReceived`: Consumer receiving messages
     - `QueueMessageProcessing`: Individual message processing
     - `QueueMessageSuccess`: Successful completions
     - `QueueMessageError`: Failed messages

## Queue Configuration Parameters Explained

### Max Batch Size (10)
- Worker processes up to 10 queue messages per invocation
- Higher = more efficient but uses more memory
- Recommended: 10-20 for this use case

### Max Batch Timeout (30 seconds)
- Maximum time to wait for batch to fill
- After 30s, processes whatever messages are available
- Ensures timely processing even with low message rate

### Max Retries (3)
- Failed messages are retried up to 3 times
- Uses exponential backoff between retries
- After 3 failures, sends to dead letter queue (if configured)

### Dead Letter Queue (Optional)
- Stores messages that fail after max retries
- Useful for debugging persistent failures
- Can manually reprocess later

## Verifying Setup

### Check Producer Binding
```javascript
// Should see META_REPORT_QUEUE in worker environment
console.log(env.META_REPORT_QUEUE);  // [object Object]
```

### Check Consumer Configuration
In Cloudflare Dashboard:
1. Workers & Pages → Your worker
2. Settings → Bindings
3. Should see:
   - **Queue Producers**: META_REPORT_QUEUE → metaReportQueue
   - **Queue Consumers**: metaReportQueue with configured settings

## Troubleshooting

### Issue: Worker returns 500 error when trying queue mode
**Cause**: Queue binding not configured
**Fix**: Ensure `META_REPORT_QUEUE` binding is added in worker settings

### Issue: Messages stuck in queue, not processing
**Cause**: Consumer not configured
**Fix**: Add queue consumer binding in worker settings

### Issue: All messages failing with retries
**Cause**: Code error in queue consumer logic
**Fix**: Check worker logs for detailed error messages

### Issue: Queue filling up faster than processing
**Cause**: Processing too slow or Facebook API timeouts
**Fix**: 
- Check chunk size (reduce if needed)
- Monitor `FacebookAPITimeout` events in logs
- Increase max_batch_size to process more messages per invocation

### Issue: No logs showing for queue processing
**Cause**: Logs not streaming or filtering too restrictive
**Fix**: 
- Start log stream in Dashboard
- Remove filters
- Check "Real-time Logs" tab, not "Saved Logs"

## Advanced Configuration

### Environment-Specific Queues
For staging/production separation:

```
Production:
- Queue: metaReportQueue-prod
- Binding: META_REPORT_QUEUE

Staging:
- Queue: metaReportQueue-staging  
- Binding: META_REPORT_QUEUE
```

### Rate Limiting Queue Processing
To control BigQuery API usage:
- Set smaller `max_batch_size` (e.g., 5)
- Increase `max_batch_timeout` (e.g., 60)
- This slows down processing but reduces concurrent BigQuery writes

### Dead Letter Queue Inspection
To view failed messages:
1. Go to Queues → `metaReportQueue-dlq`
2. View messages in DLQ
3. Identify patterns in failures
4. Fix code issues
5. Manually replay messages if needed

## Best Practices

1. **Start Small**: Test with 1 month lookback before large backfills
2. **Monitor Logs**: Watch real-time logs during first queue run
3. **Check Metrics**: Verify messages are being consumed at good rate
4. **Use DLQ**: Always configure dead letter queue for production
5. **Alert on Errors**: Set up Cloudflare alerts for high error rates
6. **Regular Cleanup**: Monitor queue depth, clear stuck messages
7. **Version Control**: Document queue configuration changes

## Cost Considerations

Cloudflare Queues pricing (as of 2024):
- **Free tier**: 1 million operations/month
- **Operations**: Message sends + receives + deletes
- **Example**: 1000 chunks = 2000 operations (send + receive)

For large backfills:
- Monitor usage in Cloudflare Dashboard
- Estimate: 1 year backfill ≈ 360 chunks ≈ 720 operations

## Next Steps After Setup

1. ✅ Create queue
2. ✅ Configure producer binding
3. ✅ Configure consumer binding
4. ✅ Deploy updated worker
5. ✅ Run test backfill
6. ✅ Monitor logs and metrics
7. ✅ Run production backfills
8. ✅ Set up monitoring/alerts

