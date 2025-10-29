/**
 * Version: 2.0.0
 * FB Ads Insights → Google Sheets / S3 / BigQuery (Cloudflare Worker)
 * -------------------------------------------------------------------
 * Supports one or all accounts (via env prefix), e.g. FRM-145669.
 *
 * Usage:
 * - /?account=FRM-145669            → Pull for specific account (REQUIRED for manual requests)
 * - /?account=FRM-145669&mode=backfill&lookback=6m → Historical chunked fetch (6 months back)
 * - /?from=2024-01-01&to=2024-12-31 → Custom date range (YYYY-MM-DD format, inclusive start, exclusive end)
 * - /?dest=sheets                   → Push data to Google Sheets only
 * - /?dest=s3                       → Push data to S3 only
 * - /?dest=bq                       → Push data to BigQuery only
 * - /?dest=both                     → Push data to both S3 and Sheets (default)
 * - /?table=meta_stats2             → Specify BigQuery table name (default: meta_stats)
 * - /?schema_migrate=true           → Add new columns to existing BigQuery table (publisher_platform, platform_position, device_platform)
 * - /?sync=true                     → Force synchronous processing (bypass queue, for testing only)
 * - /?clear_kv=true                 → Delete KV Storage pairs
 * 
 * Date Parameters:
 * - from/to: Custom date range (monthly chunks, auto-splits on timeout)
 * - mode=backfill&lookback=Nm: N months back from today (e.g., 6m = 6 months)
 * - mode=backfill&lookback=Ny: N years back from today (e.g., 1y = 12 months)
 * - Default (no params): Last 7 days
 * 
 * Queue Processing (NEW in v2.0):
 * - Daily and Backfill modes automatically use Cloudflare Queues when META_REPORT_QUEUE is configured
 * - Daily mode: Single 7-day chunk per account (prevents CPU timeout on large datasets)
 * - Backfill mode: Splits date ranges into 2-3 day chunks to avoid Facebook API timeouts
 *   - Chunk size: 2 days for >6 month lookback, 3 days otherwise
 * - Each chunk processed independently by queue consumer
 * - Returns 202 Accepted with request ID for queue-based processing
 * - Monitor logs in Cloudflare dashboard for queue processing status
 * - Use ?sync=true to force synchronous processing (not recommended for large datasets)
 * 
 * Structured Logging (NEW in v2.0):
 * - All operations logged as JSON with timestamp, level, event, and context
 * - Log levels: INFO, WARN, ERROR
 * - Key events logged: API calls, BigQuery operations, queue messages, errors
 * - View logs in Cloudflare Dashboard → Workers → Logs (Real-time Logs)
 * - Example log: {"timestamp":"2024-01-01T12:00:00.000Z","level":"INFO","event":"FacebookAPICallCompleted","account_id":"FRM-145669","rows_fetched":1250}
 * 
 * BigQuery Retry Logic (NEW in v2.0):
 * - Automatic retry with exponential backoff for concurrent change errors
 * - Handles: concurrent updates, transaction conflicts, deadline exceeded, backend errors
 * - Max 5 retries with delays: 1s, 2s, 4s, 8s, 16s
 * - All retry attempts logged for observability
 * 
 * Features:
 * - Auto-splits large requests into smaller chunks on Facebook API timeout (weekly/daily)
 * - Includes platform/position/device breakdowns for granular reporting
 * - Automatic deduplication in BigQuery (keeps latest retrieved_at, prioritizes breakdown data)
 * - Concurrent-safe BigQuery writes with retry logic
 * 
 * Manual vs Scheduled:
 * - Manual requests: Require ?account=FRM-xxxxx parameter (single account)
 * - Scheduled/Cron: Processes ALL accounts automatically (no account param needed)
 * 
 * Required Environment Variables:
 * - {ACCOUNT_ID}-FB_ACCESS_TOKEN: Facebook API access token
 * - {ACCOUNT_ID}-FB_ACCOUNT_ID: Facebook Ad account ID
 * - BQ_PROJECT_ID, BQ_DATASET, BQ_TABLE_NAME: BigQuery configuration
 * - GS_CLIENT_EMAIL, GS_PRIVATE_KEY: Google Service Account credentials
 * - META_REPORT_QUEUE: Cloudflare Queue binding (required for queue-based backfill)
 */

export default {
    async fetch(req, env, ctx) {
      return handleRequest(req, env, ctx);
    },
  
    async scheduled(event, env, ctx) {
      const url = new URL("https://worker-cron/trigger");
      url.searchParams.set("mode", "daily");
      url.searchParams.set("dest", "bq");  // Default to BigQuery for cron
  
      const req = new Request(url.toString(), {
        method: "GET",
        headers: {
          "cf-worker-cron": "true"
        }
      });
  
      return await handleRequest(req, env, ctx);
    },

    async queue(batch, env, ctx) {
      return handleQueueBatch(batch, env, ctx);
    }
  };

  // Structured logging helper
  function log(level, event, details = {}) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      event,
      ...details
    }));
  }

  // BigQuery retry wrapper with exponential backoff
  async function retryBQOperation(operation, operationName, maxRetries = 5) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        const isRetryable = 
          error.message?.toLowerCase().includes('concurrent') ||
          error.message?.toLowerCase().includes('transaction') ||
          error.message?.toLowerCase().includes('deadline exceeded') ||
          error.message?.toLowerCase().includes('backend error') ||
          (error.status && [409, 500, 503].includes(error.status));

        if (!isRetryable || attempt === maxRetries - 1) {
          log("ERROR", "BigQueryOperationFailed", { 
            operation: operationName, 
            attempt: attempt + 1,
            error: error.message,
            final: true
          });
          throw error;
        }

        const delayMs = Math.pow(2, attempt) * 1000;
        log("WARN", "BigQueryRetryAttempt", { 
          operation: operationName, 
          attempt: attempt + 1,
          delay_ms: delayMs,
          error: error.message
        });
        await sleep(delayMs);
      }
    }
  }

  // Queue batch handler
  async function handleQueueBatch(batch, env, ctx) {
    log("INFO", "QueueBatchReceived", { message_count: batch.messages.length });

    for (const message of batch.messages) {
      try {
        const { accountId, fbToken, fbAccountId, startDate, endDate, destination, tableName, requestId } = message.body;
        
        log("INFO", "QueueMessageProcessing", { 
          account_id: accountId, 
          date_range: { from: startDate, to: endDate },
          request_id: requestId
        });

        // Process the chunk (fetch from Facebook API and write to destination)
        await processDateChunk(env, accountId, fbToken, fbAccountId, startDate, endDate, destination, tableName, requestId);

        message.ack();
        log("INFO", "QueueMessageSuccess", { 
          account_id: accountId, 
          date_range: { from: startDate, to: endDate },
          request_id: requestId
        });
      } catch (error) {
        log("ERROR", "QueueMessageError", { 
          account_id: message.body?.accountId,
          error: error.message,
          stack: error.stack
        });
        message.retry();
      }
    }
  }

  // Process a single date chunk (used by queue consumer)
  async function processDateChunk(env, accountId, fbToken, fbAccountId, startDate, endDate, destination, tableName, requestId) {
    const nowDate = new Date();
    const now = nowDate.toISOString();
    const iso = d => d.toISOString().split("T")[0];

    const BASE_FIELDS = [
      "date_start", "campaign_name", "adset_name", "ad_name",
      "spend", "impressions", "clicks", "frequency", "reach"
    ];

    const FIELDS = [
      ...BASE_FIELDS,
      "conversions",
      "conversion_values"
    ];

    const BASE_ACTIONS = ["Purchase", "PurchasePlus", "PurchaseAttempt", "PurchasePlusAttempt", "Lead"];
    const BRANDS = ["BP", "PC", "LC", "PS", "RL", "FF", "SF"];
    const ACTION_TYPES = BASE_ACTIONS.flatMap(action => 
      BRANDS.map(brand => `offsite_conversion.fb_pixel_custom.${action}-S2S-${brand}`)
    );
    const WINDOWS = ["value", "1d_view", "7d_view", "28d_view", "1d_click", "7d_click", "28d_click", "1d_view_first_conversion", "7d_view_first_conversion", "1d_click_first_conversion", "7d_click_first_conversion"];
    const ACTION_WINDOWS = ["1d_click", "7d_click", "28d_click", "1d_view", "7d_view", "28d_view", "7d_view_first_conversion", "1d_click_first_conversion", "7d_click_first_conversion", "1d_view_first_conversion"];
    const shortAction = s => s.replace(/^offsite_conversion\.fb_pixel_custom\./, "");

    const acct = fbAccountId.startsWith("act_") ? fbAccountId : `act_${fbAccountId}`;
    const accountRows = [];

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    log("INFO", "FacebookAPICallStarted", { 
      account_id: accountId, 
      date_range: { from: startDate, to: endDate }
    });

    const fbURL =
      `https://graph.facebook.com/v23.0/${acct}/insights` +
      `?time_increment=1&level=ad&fields=${FIELDS.join(",")}` +
      `&breakdowns=publisher_platform,platform_position,device_platform` +
      `&time_range=${encodeURIComponent(JSON.stringify({ since: startDate, until: endDate }))}` +
      `&action_attribution_windows=${encodeURIComponent(JSON.stringify(ACTION_WINDOWS))}` +
      `&limit=9999&access_token=${encodeURIComponent(fbToken)}`;

    const fbRes = await fetch(fbURL);
    const fbData = await fbRes.json();

    // Handle timeout errors by splitting into smaller chunks
    if (fbData.error && fbData.error.error_subcode === 1504018) {
      log("WARN", "FacebookAPITimeout", { 
        account_id: accountId, 
        date_range: { from: startDate, to: endDate },
        action: "splitting_to_daily"
      });
      
      // Split into daily chunks
      let dayStart = new Date(startDateObj);
      while (dayStart < endDateObj) {
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayStart.getDate() + 1);
        const dayUntil = dayEnd > endDateObj ? endDateObj : dayEnd;
        
        const dayURL =
          `https://graph.facebook.com/v23.0/${acct}/insights` +
          `?time_increment=1&level=ad&fields=${FIELDS.join(",")}` +
          `&breakdowns=publisher_platform,platform_position,device_platform` +
          `&time_range=${encodeURIComponent(JSON.stringify({ since: iso(dayStart), until: iso(dayUntil) }))}` +
          `&action_attribution_windows=${encodeURIComponent(JSON.stringify(ACTION_WINDOWS))}` +
          `&limit=9999&access_token=${encodeURIComponent(fbToken)}`;
        
        const dayRes = await fetch(dayURL);
        const dayData = await dayRes.json();
        
        if (dayData.error) {
          log("ERROR", "FacebookAPIError", { 
            account_id: accountId, 
            date_range: { from: iso(dayStart), to: iso(dayUntil) },
            error: dayData.error.message,
            error_code: dayData.error.code,
            error_subcode: dayData.error.error_subcode
          });
          throw new Error(`FB API error: ${dayData.error.message}`);
        }
        
        const dayRows = dayData.data ?? [];
        accountRows.push(...dayRows);
        
        dayStart = dayEnd;
      }
    } else if (fbData.error) {
      log("ERROR", "FacebookAPIError", { 
        account_id: accountId, 
        date_range: { from: startDate, to: endDate },
        error: fbData.error.message,
        error_code: fbData.error.code,
        error_subcode: fbData.error.error_subcode
      });
      throw new Error(`FB API error: ${fbData.error.message}`);
    } else {
      const rows = fbData.data ?? [];
      accountRows.push(...rows);
    }

    log("INFO", "FacebookAPICallCompleted", { 
      account_id: accountId, 
      date_range: { from: startDate, to: endDate },
      rows_fetched: accountRows.length
    });

    // Write to BigQuery if requested
    if (destination === "bq" || destination === "both") {
      const toIsoDate = (val) => {
        if (val instanceof Date) return val.toISOString().split("T")[0];
        if (typeof val === "string") return val.trim().split("T")[0];
        return String(val || "");
      };

      const bqObjects = accountRows.map(r => {
        const conversions = Array.isArray(r.conversions) ? r.conversions : [];
        const conversionValues = Array.isArray(r.conversion_values) ? r.conversion_values : [];
        const findByType = (arr, actionType) => arr.find(x => x?.action_type === actionType) || {};
        const breakdown = [];
        for (const a of ACTION_TYPES) {
          const conv = findByType(conversions, a);
          const convVal = findByType(conversionValues, a);
          for (const w of WINDOWS) {
            breakdown.push({
              goal_name: shortAction(a),
              window: w === "value" ? "total" : w,
              conversions: conv?.[w] != null ? Number(conv[w]) : 0,
              conversion_value: convVal?.[w] != null ? Number(convVal[w]) : 0.0
            });
          }
        }
        return {
          account_id: accountId,
          retrieved_at: now,
          date_start: toIsoDate(r.date_start),
          campaign_name: r.campaign_name ?? "",
          adset_name: r.adset_name ?? "",
          ad_name: r.ad_name ?? "",
          spend: r.spend != null ? Number(r.spend) : null,
          impressions: r.impressions != null ? Number(r.impressions) : null,
          clicks: r.clicks != null ? Number(r.clicks) : null,
          frequency: r.frequency != null ? Number(r.frequency) : null,
          reach: r.reach != null ? Number(r.reach) : null,
          publisher_platform: r.publisher_platform ?? "",
          platform_position: r.platform_position ?? "",
          device_platform: r.device_platform ?? "",
          goals_breakdown: breakdown
        };
      });

      log("INFO", "BigQueryWriteStarted", { 
        account_id: accountId, 
        table_name: tableName,
        row_count: bqObjects.length
      });

      const scopes = ["https://www.googleapis.com/auth/bigquery"];
      const accessToken = await googleAccessToken(env, scopes);
      
      if (!accessToken) {
        log("ERROR", "BigQueryAuthFailed", { account_id: accountId });
        throw new Error("Google auth failed for BigQuery");
      }

      log("INFO", "BigQueryAuthSuccess", { account_id: accountId });

      const metaArraySchema = buildBQMetaArraySchema();
      await ensureBQTable(accessToken, env, tableName, metaArraySchema);
      
      log("INFO", "BigQueryTableVerified", { table_name: tableName });

      await retryBQOperation(
        async () => {
          const loadResult = await bqLoadJson(accessToken, env, tableName, bqObjects, [], null, metaArraySchema);
          log("INFO", "BigQueryWriteCompleted", { 
            account_id: accountId, 
            table_name: tableName,
            rows_written: loadResult.outputRows
          });
          return loadResult;
        },
        "bqLoadJson"
      );

      // Deduplication with retry
      log("INFO", "BigQueryDeduplicationStarted", { 
        account_id: accountId, 
        table_name: tableName
      });

      await retryBQOperation(
        async () => {
          await removeDuplicates(accessToken, env, tableName, [], null, metaArraySchema, [accountId]);
          log("INFO", "BigQueryDeduplicationCompleted", { 
            account_id: accountId, 
            table_name: tableName
          });
        },
        "removeDuplicates"
      );
    }
  }
  
  async function handleRequest(req, env, ctx) {
    const allowedIps = ["2a06:98c0:3600::103", "195.158.92.167"];
    const cfHeader = req.headers.get("cf-connecting-ip");
    if (!req.headers.get("cf-worker-cron") && !allowedIps.includes(cfHeader)) {
      log("WARN", "ForbiddenAccess", { ip: cfHeader });
      return new Response("Forbidden", { status: 403 });
    }
  
    const nowDate = new Date();
    nowDate.setMilliseconds(0);
  
    const url = new URL(req.url);
    const mode = url.searchParams.get("mode") || "daily";
    const fromParam = url.searchParams.get("from");
    const toParam = url.searchParams.get("to");
    const fromDate = fromParam ? new Date(fromParam) : null;
    const toDate = toParam ? new Date(toParam) : null;
    const lookbackParamRaw = url.searchParams.get("lookback");
    const lookbackParam = mode === "backfill" && lookbackParamRaw ? lookbackParamRaw : undefined;
    const accountFilter = url.searchParams.get("account");
    const destination = url.searchParams.get("dest") || "both";
    const tableName = url.searchParams.get("table") || env.BQ_TABLE_NAME || "meta_stats";
    const schemaMigrate = (url.searchParams.get("schema_migrate") || "false").toLowerCase() === "true";
    const forceSync = (url.searchParams.get("sync") || "false").toLowerCase() === "true";
  
    // Require account parameter for non-scheduled requests
    const isCron = req.headers.get("cf-worker-cron") === "true";
    
    log("INFO", "RequestReceived", { 
      mode, 
      account: accountFilter || "ALL",
      date_range: { from: fromParam, to: toParam, lookback: lookbackParam },
      destination,
      table_name: tableName,
      is_cron: isCron
    });

    if (!isCron && !accountFilter) {
      log("ERROR", "MissingAccountParameter", {});
      return new Response("Missing required parameter: ?account=FRM-xxxxx (or use scheduled/cron for all accounts)", { status: 400 });
    }
  
    let resultMessages = [];
    let errorMessages = [];
  
    // === Base fields (as before) ===
    const BASE_FIELDS = [
      "date_start", "campaign_name", "adset_name", "ad_name",
      "spend", "impressions", "clicks", "frequency", "reach"
    ];
  
    // Request arrays too (we'll flatten them at the end of the row)
    const FIELDS = [
      ...BASE_FIELDS,
      "conversions",
      "conversion_values"
    ];
  
    // === Existing headers + appended conversion columns ===
    const BASE_HEADERS = [
      "account_id", "retrieved_at",
      "date_start", "campaign_name", "adset_name", "ad_name",
      "spend", "impressions", "clicks", "frequency", "reach",
      "publisher_platform", "platform_position", "device_platform"
    ];
  
    // Which actions + windows to make columns for
    // Define base actions and brands, then generate all combinations
    const BASE_ACTIONS = ["Purchase", "PurchasePlus", "PurchaseAttempt", "PurchasePlusAttempt", "Lead"];
    const BRANDS = ["BP", "PC", "LC", "PS", "RL", "FF", "SF"]; // Add more brands as needed
    
    const ACTION_TYPES = BASE_ACTIONS.flatMap(action => 
      BRANDS.map(brand => `offsite_conversion.fb_pixel_custom.${action}-S2S-${brand}`)
    );
    const WINDOWS = ["value", "1d_view", "7d_view", "28d_view", "1d_click", "7d_click", "28d_click", "1d_view_first_conversion", "7d_view_first_conversion", "1d_click_first_conversion", "7d_click_first_conversion"];
    const shortAction = s => s.replace(/^offsite_conversion\.fb_pixel_custom\./, "");
  
    const CONV_HEADERS = ACTION_TYPES.flatMap(a =>
      WINDOWS.map(w => `conv_${shortAction(a)}_${w === "value" ? "total" : w}`)
    );
    const CONVVAL_HEADERS = ACTION_TYPES.flatMap(a =>
      WINDOWS.map(w => `convval_${shortAction(a)}_${w === "value" ? "total" : w}`)
    );
  
    const HEADERS = [
      ...BASE_HEADERS,
      ...CONV_HEADERS,
      ...CONVVAL_HEADERS
    ];
  
    const now = nowDate.toISOString();
    const iso = d => d.toISOString().split("T")[0];
  
    // Build URLs (Graph v23 + attribution windows)
    const ACTION_WINDOWS = ["1d_click", "7d_click", "28d_click", "1d_view", "7d_view", "28d_view", "7d_view_first_conversion", "1d_click_first_conversion", "7d_click_first_conversion", "1d_view_first_conversion"];
  
    const flat = (ACCOUNT_ID, r) => {
      const out = [ACCOUNT_ID, now];
  
      // base fields
      for (const f of BASE_FIELDS) {
        let val = r[f] ?? "";
  
        // Normalize/freeze date_start format
        if (f === "date_start") {
          if (val instanceof Date) {
            val = val.toISOString().split("T")[0];
          } else if (typeof val === "string") {
            val = val.trim().split("T")[0];
          }
          // Keep as string in Sheets (original behavior)
          val = `${val}`;
        }
  
        out.push(typeof val === "object" ? JSON.stringify(val) : String(val));
      }
  
      // Add breakdown fields (these come from the breakdowns parameter, not fields)
      out.push(String(r.publisher_platform ?? ""));
      out.push(String(r.platform_position ?? ""));
      out.push(String(r.device_platform ?? ""));
  
      // conversions & conversion_values at the END
      const convArr = Array.isArray(r.conversions) ? r.conversions : [];
      const convValArr = Array.isArray(r.conversion_values) ? r.conversion_values : [];
  
      const pick = (arr, actionType, key) => {
        const item = arr.find(x => x?.action_type === actionType);
        const raw = item ? item[key] : "";
        return raw == null ? "" : String(raw);
      };
  
      for (const a of ACTION_TYPES) {
        for (const w of WINDOWS) out.push(pick(convArr, a, w));
      }
      for (const a of ACTION_TYPES) {
        for (const w of WINDOWS) out.push(pick(convValArr, a, w));
      }
  
      return out;
    };
  
    const normalize = val => (val ?? "").toString().trim().toLowerCase();
    const key = row => [normalize(row[0]), normalize(row[2]), normalize(row[3]), normalize(row[4]), normalize(row[5]), normalize(row[11]), normalize(row[12]), normalize(row[13])].join("||");
  
    const allAccountIds = Object.keys(env)
      .filter(k => k.endsWith("-FB_ACCESS_TOKEN"))
      .map(k => k.split("-FB_ACCESS_TOKEN")[0])
      .filter(id => !accountFilter || id === accountFilter);
  
    if (allAccountIds.length === 0) {
      log("ERROR", "NoAccountsFound", { account_filter: accountFilter });
      return new Response("No matching accounts found in environment variables.", { status: 400 });
    }
  
    log("INFO", "AccountsToProcess", { count: allAccountIds.length, accounts: allAccountIds });
    resultMessages.push(`Found ${allAccountIds.length} accounts to process: ${allAccountIds.join(', ')}`);

    // For backfill mode or daily mode with queue configured, use queue to process chunks
    // Can be overridden with ?sync=true for testing/debugging
    const useQueue = !forceSync && env.META_REPORT_QUEUE && (mode === "backfill" || mode === "daily");
    
    if (mode === "backfill" && useQueue) {
      const iso = d => d.toISOString().split("T")[0];
      const monthsBack = lookbackParam?.endsWith("y") ? parseInt(lookbackParam) * 12 : parseInt(lookbackParam || "6");
      const lookbackMonths = Math.min(monthsBack || 6, 37);
      const start = new Date(nowDate);
      start.setMonth(start.getMonth() - lookbackMonths);
      const end = new Date(nowDate);

      // Determine chunk size: 2 days for >6 months, 3 days otherwise
      const chunkDays = lookbackMonths > 6 ? 2 : 3;
      const requestId = crypto.randomUUID();
      let totalChunks = 0;

      log("INFO", "BackfillQueueMode", { 
        lookback_months: lookbackMonths,
        chunk_days: chunkDays,
        date_range: { from: iso(start), to: iso(end) },
        request_id: requestId
      });

      for (const accountId of allAccountIds) {
        const fbToken = env[`${accountId}-FB_ACCESS_TOKEN`];
        const rawAcctId = env[`${accountId}-FB_ACCOUNT_ID`];
        if (!fbToken || !rawAcctId) continue;

        // Split into chunks
        let cursor = new Date(start);
        let chunks = 0;
        while (cursor < end) {
          const chunkEnd = new Date(cursor);
          chunkEnd.setDate(cursor.getDate() + chunkDays);
          const until = chunkEnd < end ? chunkEnd : end;

          const message = {
            accountId,
            fbToken,
            fbAccountId: rawAcctId,
            startDate: iso(cursor),
            endDate: iso(until),
            destination,
            tableName,
            requestId
          };

          await env.META_REPORT_QUEUE.send(message);
          chunks++;
          totalChunks++;

          cursor = chunkEnd;
        }

        log("INFO", "QueueChunksSent", { 
          account_id: accountId,
          chunks_sent: chunks,
          date_range: { from: iso(start), to: iso(end) }
        });
      }

      log("INFO", "BackfillQueued", { 
        total_chunks: totalChunks,
        accounts: allAccountIds.length,
        request_id: requestId
      });

      return new Response(
        `Backfill queued: ${totalChunks} chunks (${chunkDays}-day each) for ${allAccountIds.length} account(s)\nRequest ID: ${requestId}\nMonitor logs for processing status.`,
        { status: 202, headers: { "content-type": "text/plain" } }
      );
    }

    // For daily mode with queue configured, send as single chunk per account
    if (mode === "daily" && useQueue) {
      const iso = d => d.toISOString().split("T")[0];
      const since = new Date(nowDate);
      since.setDate(nowDate.getDate() - 6);
      const requestId = crypto.randomUUID();
      let totalChunks = 0;

      log("INFO", "DailyQueueMode", { 
        date_range: { from: iso(since), to: iso(nowDate) },
        request_id: requestId
      });

      for (const accountId of allAccountIds) {
        const fbToken = env[`${accountId}-FB_ACCESS_TOKEN`];
        const rawAcctId = env[`${accountId}-FB_ACCOUNT_ID`];
        if (!fbToken || !rawAcctId) continue;

        const message = {
          accountId,
          fbToken,
          fbAccountId: rawAcctId,
          startDate: iso(since),
          endDate: iso(nowDate),
          destination,
          tableName,
          requestId
        };

        await env.META_REPORT_QUEUE.send(message);
        totalChunks++;

        log("INFO", "QueueChunksSent", { 
          account_id: accountId,
          chunks_sent: 1,
          date_range: { from: iso(since), to: iso(nowDate) }
        });
      }

      log("INFO", "DailyQueued", { 
        total_chunks: totalChunks,
        accounts: allAccountIds.length,
        request_id: requestId
      });

      return new Response(
        `Daily fetch queued: ${totalChunks} chunk(s) for ${allAccountIds.length} account(s)\nRequest ID: ${requestId}\nMonitor logs for processing status.`,
        { status: 202, headers: { "content-type": "text/plain" } }
      );
    }

    // For non-queue mode or when queue is not configured, process synchronously
    let newRows = [];
    let bqObjects = [];
  
    for (const accountId of allAccountIds) {
      const fbToken = env[`${accountId}-FB_ACCESS_TOKEN`];
      const rawAcctId = env[`${accountId}-FB_ACCOUNT_ID`];
      if (!fbToken || !rawAcctId) {
        log("WARN", "AccountCredentialsMissing", { account_id: accountId });
        continue;
      }
  
      const acct = rawAcctId.startsWith("act_") ? rawAcctId : `act_${rawAcctId}`;
      const accountRows = [];
      log("INFO", "ProcessingAccount", { account_id: accountId, fb_account: acct, mode });
      resultMessages.push(`Processing account ${accountId} (${acct}) in ${mode} mode`);
  
      if ((fromDate || toDate)) {
        // Range mode: monthly-chunked fetch between from..to (inclusive start, exclusive end)
        const startRange = fromDate ? new Date(fromDate) : new Date(nowDate);
        const endRange = toDate ? new Date(toDate) : new Date(nowDate);
        // Ensure millisecond precision normalized
        startRange.setHours(0,0,0,0);
        endRange.setHours(0,0,0,0);
        // Guard bad inputs
        if (startRange >= endRange) {
          resultMessages.push(`Invalid range: from >= to (${iso(startRange)} >= ${iso(endRange)})`);
        } else {
          const cursor = new Date(startRange);
          while (cursor < endRange) {
            const next = new Date(cursor);
            next.setMonth(next.getMonth() + 1);
            const until = next < endRange ? next : endRange;
  
            log("INFO", "FacebookAPICallStarted", { 
              account_id: accountId,
              date_range: { from: iso(cursor), to: iso(until) },
              mode: "custom_range_chunk"
            });

            const fbURL =
              `https://graph.facebook.com/v23.0/${acct}/insights` +
              `?time_increment=1&level=ad&fields=${FIELDS.join(",")}` +
              `&breakdowns=publisher_platform,platform_position,device_platform` +
              `&time_range=${encodeURIComponent(JSON.stringify({ since: iso(cursor), until: iso(until) }))}` +
              `&action_attribution_windows=${encodeURIComponent(JSON.stringify(ACTION_WINDOWS))}` +
              `&limit=9999&access_token=${encodeURIComponent(fbToken)}`;
  
            const fbRes = await fetch(fbURL);
            const fbData = await fbRes.json();
            
            // Handle timeout errors by splitting into smaller chunks
            if (fbData.error && fbData.error.error_subcode === 1504018) {
              log("WARN", "FacebookAPITimeout", { 
                account_id: accountId,
                date_range: { from: iso(cursor), to: iso(until) },
                action: "splitting_to_weekly"
              });
              resultMessages.push(`Timeout for ${accountId} (${iso(cursor)} to ${iso(until)}), splitting into weekly chunks...`);
              
              // Split month into 7-day chunks
              let weekStart = new Date(cursor);
              while (weekStart < until) {
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 7);
                const weekUntil = weekEnd > until ? until : weekEnd;
                
                const weekURL =
                  `https://graph.facebook.com/v23.0/${acct}/insights` +
                  `?time_increment=1&level=ad&fields=${FIELDS.join(",")}` +
                  `&breakdowns=publisher_platform,platform_position,device_platform` +
                  `&time_range=${encodeURIComponent(JSON.stringify({ since: iso(weekStart), until: iso(weekUntil) }))}` +
                  `&action_attribution_windows=${encodeURIComponent(JSON.stringify(ACTION_WINDOWS))}` +
                  `&limit=9999&access_token=${encodeURIComponent(fbToken)}`;
                
                const weekRes = await fetch(weekURL);
                const weekData = await weekRes.json();
                
                if (weekData.error) {
                  const errDetails = JSON.stringify(weekData.error, null, 2);
                  log("ERROR", "FacebookAPIError", { 
                    account_id: accountId,
                    date_range: { from: iso(weekStart), to: iso(weekUntil) },
                    error: weekData.error.message,
                    error_code: weekData.error.code,
                    error_subcode: weekData.error.error_subcode,
                    error_details: errDetails
                  });
                  console.log(`FB error for ${accountId} (${iso(weekStart)} to ${iso(weekUntil)}): ${errDetails}`);
                  resultMessages.push(`FB API Error for ${accountId}: ${weekData.error.message || 'Unknown error'}`);
                  resultMessages.push(`Error details: ${errDetails}`);
                  resultMessages.push(`Failed date range: ${iso(weekStart)} to ${iso(weekUntil)}`);
                  return new Response(`FB error for ${accountId}: ${weekData.error.message}\n\nFull error:\n${errDetails}\n\nDate range: ${iso(weekStart)} to ${iso(weekUntil)}`, { status: 500 });
                }
                
                const weekRows = weekData.data ?? [];
                accountRows.push(...weekRows);
                log("INFO", "FacebookAPICallCompleted", { 
                  account_id: accountId,
                  date_range: { from: iso(weekStart), to: iso(weekUntil) },
                  rows_fetched: weekRows.length,
                  chunk_type: "weekly"
                });
                resultMessages.push(`Fetched ${weekRows.length} rows for ${accountId} (${iso(weekStart)} to ${iso(weekUntil)}) [weekly chunk]`);
                
                weekStart = weekEnd;
              }
            } else if (fbData.error) {
              // Other errors (not timeout)
              const errDetails = JSON.stringify(fbData.error, null, 2);
              log("ERROR", "FacebookAPIError", { 
                account_id: accountId,
                date_range: { from: iso(cursor), to: iso(until) },
                error: fbData.error.message,
                error_code: fbData.error.code,
                error_subcode: fbData.error.error_subcode,
                error_details: errDetails
              });
              console.log(`FB error for ${accountId} (${iso(cursor)} to ${iso(until)}): ${errDetails}`);
              resultMessages.push(`FB API Error for ${accountId}: ${fbData.error.message || 'Unknown error'}`);
              resultMessages.push(`Error details: ${errDetails}`);
              resultMessages.push(`Failed date range: ${iso(cursor)} to ${iso(until)}`);
              return new Response(`FB error for ${accountId}: ${fbData.error.message}\n\nFull error:\n${errDetails}\n\nDate range: ${iso(cursor)} to ${iso(until)}`, { status: 500 });
            } else {
              // Success
              const monthRows = fbData.data ?? [];
              accountRows.push(...monthRows);
              log("INFO", "FacebookAPICallCompleted", { 
                account_id: accountId,
                date_range: { from: iso(cursor), to: iso(until) },
                rows_fetched: monthRows.length,
                chunk_type: "monthly"
              });
              resultMessages.push(`Fetched ${monthRows.length} rows for ${accountId} (${iso(cursor)} to ${iso(until)})`);
            }
            
            cursor.setMonth(cursor.getMonth() + 1);
          }
        }
      } else if (mode === "backfill") {
        const monthsBack = lookbackParam?.endsWith("y") ? parseInt(lookbackParam) * 12 : parseInt(lookbackParam || "6");
        const lookbackMonths = Math.min(monthsBack || 6, 37);
        const start = new Date(nowDate);
        start.setMonth(start.getMonth() - lookbackMonths);
  
        log("INFO", "BackfillSyncMode", { 
          account_id: accountId,
          lookback_months: lookbackMonths,
          date_range: { from: iso(start), to: iso(nowDate) },
          note: "Queue not configured, using synchronous processing"
        });

        while (start < nowDate) {
          const end = new Date(start);
          end.setMonth(start.getMonth() + 1);

          log("INFO", "FacebookAPICallStarted", { 
            account_id: accountId,
            date_range: { from: iso(start), to: iso(end) },
            mode: "backfill_sync_chunk"
          });
  
          const fbURL =
            `https://graph.facebook.com/v23.0/${acct}/insights` +
            `?time_increment=1&level=ad&fields=${FIELDS.join(",")}` +
            `&breakdowns=publisher_platform,platform_position,device_platform` +
            `&time_range=${encodeURIComponent(JSON.stringify({ since: iso(start), until: iso(end) }))}` +
            `&action_attribution_windows=${encodeURIComponent(JSON.stringify(ACTION_WINDOWS))}` +
            `&limit=9999&access_token=${encodeURIComponent(fbToken)}`;
  
          const fbRes = await fetch(fbURL);
          const fbData = await fbRes.json();
          
          // Handle timeout errors by splitting into smaller chunks
          if (fbData.error && fbData.error.error_subcode === 1504018) {
            log("WARN", "FacebookAPITimeout", { 
              account_id: accountId,
              date_range: { from: iso(start), to: iso(end) },
              action: "splitting_to_weekly"
            });
            resultMessages.push(`Timeout for ${accountId} (${iso(start)} to ${iso(end)}), splitting into weekly chunks...`);
            
            // Split month into 7-day chunks
            let weekStart = new Date(start);
            while (weekStart < end) {
              const weekEnd = new Date(weekStart);
              weekEnd.setDate(weekStart.getDate() + 7);
              const weekUntil = weekEnd > end ? end : weekEnd;
              
              const weekURL =
                `https://graph.facebook.com/v23.0/${acct}/insights` +
                `?time_increment=1&level=ad&fields=${FIELDS.join(",")}` +
                `&breakdowns=publisher_platform,platform_position,device_platform` +
                `&time_range=${encodeURIComponent(JSON.stringify({ since: iso(weekStart), until: iso(weekUntil) }))}` +
                `&action_attribution_windows=${encodeURIComponent(JSON.stringify(ACTION_WINDOWS))}` +
                `&limit=9999&access_token=${encodeURIComponent(fbToken)}`;
              
              const weekRes = await fetch(weekURL);
              const weekData = await weekRes.json();
              
              if (weekData.error) {
                const errDetails = JSON.stringify(weekData.error, null, 2);
                log("ERROR", "FacebookAPIError", { 
                  account_id: accountId,
                  date_range: { from: iso(weekStart), to: iso(weekUntil) },
                  error: weekData.error.message,
                  error_code: weekData.error.code,
                  error_subcode: weekData.error.error_subcode,
                  error_details: errDetails
                });
                console.log(`FB error for ${accountId} (${iso(weekStart)} to ${iso(weekUntil)}): ${errDetails}`);
                resultMessages.push(`FB API Error for ${accountId}: ${weekData.error.message || 'Unknown error'}`);
                resultMessages.push(`Error details: ${errDetails}`);
                resultMessages.push(`Failed date range: ${iso(weekStart)} to ${iso(weekUntil)}`);
                return new Response(`FB error for ${accountId}: ${weekData.error.message}\n\nFull error:\n${errDetails}\n\nDate range: ${iso(weekStart)} to ${iso(weekUntil)}`, { status: 500 });
              }
              
              const weekRows = weekData.data ?? [];
              accountRows.push(...weekRows);
              log("INFO", "FacebookAPICallCompleted", { 
                account_id: accountId,
                date_range: { from: iso(weekStart), to: iso(weekUntil) },
                rows_fetched: weekRows.length,
                chunk_type: "weekly"
              });
              resultMessages.push(`Fetched ${weekRows.length} rows for ${accountId} (${iso(weekStart)} to ${iso(weekUntil)}) [weekly chunk]`);
              
              weekStart = weekEnd;
            }
          } else if (fbData.error) {
            // Other errors (not timeout)
            const errDetails = JSON.stringify(fbData.error, null, 2);
            log("ERROR", "FacebookAPIError", { 
              account_id: accountId,
              date_range: { from: iso(start), to: iso(end) },
              error: fbData.error.message,
              error_code: fbData.error.code,
              error_subcode: fbData.error.error_subcode,
              error_details: errDetails
            });
            console.log(`FB error for ${accountId} (${iso(start)} to ${iso(end)}): ${errDetails}`);
            resultMessages.push(`FB API Error for ${accountId}: ${fbData.error.message || 'Unknown error'}`);
            resultMessages.push(`Error details: ${errDetails}`);
            resultMessages.push(`Failed date range: ${iso(start)} to ${iso(end)}`);
            return new Response(`FB error for ${accountId}: ${fbData.error.message}\n\nFull error:\n${errDetails}\n\nDate range: ${iso(start)} to ${iso(end)}`, { status: 500 });
          } else {
            // Success
            const monthRows = fbData.data ?? [];
            accountRows.push(...monthRows);
            log("INFO", "FacebookAPICallCompleted", { 
              account_id: accountId,
              date_range: { from: iso(start), to: iso(end) },
              rows_fetched: monthRows.length,
              chunk_type: "monthly"
            });
            resultMessages.push(`Fetched ${monthRows.length} rows for ${accountId} (${iso(start)} to ${iso(end)})`);
          }
          
          start.setMonth(start.getMonth() + 1);
        }
      } else {
        const since = new Date(nowDate);
        since.setDate(nowDate.getDate() - 6);

        log("INFO", "FacebookAPICallStarted", { 
          account_id: accountId,
          date_range: { from: iso(since), to: iso(nowDate) },
          mode: "daily"
        });
  
        const fbURL =
          `https://graph.facebook.com/v23.0/${acct}/insights` +
          `?time_increment=1&level=ad&fields=${FIELDS.join(",")}` +
          `&breakdowns=publisher_platform,platform_position,device_platform` +
          `&time_range=${encodeURIComponent(JSON.stringify({ since: iso(since), until: iso(nowDate) }))}` +
          `&action_attribution_windows=${encodeURIComponent(JSON.stringify(ACTION_WINDOWS))}` +
          `&limit=99999&access_token=${encodeURIComponent(fbToken)}`;
  
        const fbRes = await fetch(fbURL);
        const { data = [], error } = await fbRes.json();
        if (error) {
          const errDetails = JSON.stringify(error, null, 2);
          log("ERROR", "FacebookAPIError", { 
            account_id: accountId,
            date_range: { from: iso(since), to: iso(nowDate) },
            error: error.message,
            error_code: error.code,
            error_subcode: error.error_subcode,
            error_details: errDetails,
            mode: "daily"
          });
          console.log(`FB error for ${accountId} (daily mode, ${iso(since)} to ${iso(nowDate)}): ${errDetails}`);
          resultMessages.push(`FB API Error for ${accountId}: ${error.message || 'Unknown error'}`);
          resultMessages.push(`Error details: ${errDetails}`);
          resultMessages.push(`Failed date range: ${iso(since)} to ${iso(nowDate)}`);
          return new Response(`FB error for ${accountId}: ${error.message}\n\nFull error:\n${errDetails}\n\nDate range: ${iso(since)} to ${iso(nowDate)}`, { status: 500 });
        }
        accountRows.push(...data);
        log("INFO", "FacebookAPICallCompleted", { 
          account_id: accountId,
          date_range: { from: iso(since), to: iso(nowDate) },
          rows_fetched: data.length,
          mode: "daily"
        });
        resultMessages.push(`Fetched ${data.length} rows for ${accountId} (daily mode)`);
      }
  
      const flattenedRows = accountRows.map(r => flat(accountId, r));
      newRows.push(...flattenedRows);
  
      // Build BigQuery objects with goals_breakdown array (for dest=bq only)
      const toIsoDate = (val) => {
        if (val instanceof Date) return val.toISOString().split("T")[0];
        if (typeof val === "string") return val.trim().split("T")[0];
        return String(val || "");
      };
      const shortAction = s => s.replace(/^offsite_conversion\.fb_pixel_custom\./, "");
      const monthBqObjects = accountRows.map(r => {
        const conversions = Array.isArray(r.conversions) ? r.conversions : [];
        const conversionValues = Array.isArray(r.conversion_values) ? r.conversion_values : [];
        const findByType = (arr, actionType) => arr.find(x => x?.action_type === actionType) || {};
        const breakdown = [];
        for (const a of ACTION_TYPES) {
          const conv = findByType(conversions, a);
          const convVal = findByType(conversionValues, a);
          for (const w of WINDOWS) {
            breakdown.push({
              goal_name: shortAction(a),
              window: w === "value" ? "total" : w,
              conversions: conv?.[w] != null ? Number(conv[w]) : 0,
              conversion_value: convVal?.[w] != null ? Number(convVal[w]) : 0.0
            });
          }
        }
        return {
          account_id: accountId,
          retrieved_at: now,
          date_start: toIsoDate(r.date_start),
          campaign_name: r.campaign_name ?? "",
          adset_name: r.adset_name ?? "",
          ad_name: r.ad_name ?? "",
          spend: r.spend != null ? Number(r.spend) : null,
          impressions: r.impressions != null ? Number(r.impressions) : null,
          clicks: r.clicks != null ? Number(r.clicks) : null,
          frequency: r.frequency != null ? Number(r.frequency) : null,
          reach: r.reach != null ? Number(r.reach) : null,
          publisher_platform: r.publisher_platform ?? "",
          platform_position: r.platform_position ?? "",
          device_platform: r.device_platform ?? "",
          goals_breakdown: breakdown
        };
      });
      bqObjects.push(...monthBqObjects);
  
      resultMessages.push(`Account ${accountId} total: ${accountRows.length} raw rows → ${flattenedRows.length} flattened rows`);
    }
    
    resultMessages.push(`Total rows collected: ${newRows.length}`);
  
    if (destination === "bq" || destination === "both") {
      try {
        log("INFO", "BigQueryOperationStarted", { destination, table_name: tableName });
        resultMessages.push("Starting BigQuery operations...");
        
        // BigQuery authentication
        const scopes = ["https://www.googleapis.com/auth/bigquery"];
        log("INFO", "BigQueryAuthStarted", {});
        const accessToken = await googleAccessToken(env, scopes);
        if (!accessToken) {
          log("ERROR", "BigQueryAuthFailed", {});
          errorMessages.push("Google auth failed for BigQuery");
        } else {
          log("INFO", "BigQueryAuthSuccess", {});
          resultMessages.push("BigQuery authentication successful");
          // tableName already defined above
  
          // Log initial row count for BQ objects
          resultMessages.push(`Processing ${bqObjects.length} rows from Facebook API for BigQuery`);
  
          // Ensure table exists with goals_breakdown array schema
          const fqn = `${env.BQ_PROJECT_ID}.${env.BQ_DATASET}.${tableName}`;
          resultMessages.push(`Using BigQuery table: ${fqn}`);
          log("INFO", "BigQueryTableVerificationStarted", { table_name: tableName, fqn });
          resultMessages.push(`Ensuring BigQuery table ${tableName} exists...`);
          const metaArraySchema = buildBQMetaArraySchema();
          await ensureBQTable(accessToken, env, tableName, metaArraySchema);
          log("INFO", "BigQueryTableVerified", { table_name: tableName });
          
          // Add new columns if schema_migrate=true
          if (schemaMigrate) {
            log("INFO", "BigQuerySchemaMigrationStarted", { table_name: tableName });
            resultMessages.push(`Running schema migration for ${tableName}...`);
            await bqQuery(accessToken, env,
              `ALTER TABLE \`${env.BQ_PROJECT_ID}\`.\`${env.BQ_DATASET}\`.\`${tableName}\`
               ADD COLUMN IF NOT EXISTS publisher_platform STRING`,
              resultMessages).catch(() => {});
            await bqQuery(accessToken, env,
              `ALTER TABLE \`${env.BQ_PROJECT_ID}\`.\`${env.BQ_DATASET}\`.\`${tableName}\`
               ADD COLUMN IF NOT EXISTS platform_position STRING`,
              resultMessages).catch(() => {});
            await bqQuery(accessToken, env,
              `ALTER TABLE \`${env.BQ_PROJECT_ID}\`.\`${env.BQ_DATASET}\`.\`${tableName}\`
               ADD COLUMN IF NOT EXISTS device_platform STRING`,
              resultMessages).catch(() => {});
            log("INFO", "BigQuerySchemaMigrationCompleted", { table_name: tableName });
            resultMessages.push(`Schema migration completed for ${tableName}`);
          }
          
          resultMessages.push(`Table ${tableName} ready`);
          
          // Use pre-built objects with goals_breakdown (no pre-deduplication)
          const objects = bqObjects;
          resultMessages.push(`Prepared ${objects.length} BigQuery objects`);
          
          // Load data to BigQuery
          log("INFO", "BigQueryDataLoadStarted", { table_name: tableName, row_count: objects.length });
          resultMessages.push("Loading data to BigQuery...");
          const loadResult = await retryBQOperation(
            async () => await bqLoadJson(accessToken, env, tableName, objects, resultMessages, null, metaArraySchema),
            "bqLoadJson"
          );
          
          log("INFO", "BigQueryDataLoadCompleted", { table_name: tableName, rows_written: loadResult.outputRows });
          resultMessages.push(`Successfully uploaded ${loadResult.outputRows} rows to BigQuery table ${tableName}`);
  
          // Post-load verification
          try {
            const verifyTotalSql = `SELECT COUNT(*) AS c FROM \`${env.BQ_PROJECT_ID}\`.\`${env.BQ_DATASET}\`.\`${tableName}\``;
            const vt = await bqQuery(accessToken, env, verifyTotalSql, resultMessages);
            const totalC = vt.rows?.[0]?.f?.[0]?.v || 0;
            resultMessages.push(`Post-load total rows in ${fqn}: ${totalC}`);
            if (accountFilter) {
              const verifyAcctSql = `SELECT COUNT(*) AS c, MIN(date_start) AS min_d, MAX(date_start) AS max_d FROM \`${env.BQ_PROJECT_ID}\`.\`${env.BQ_DATASET}\`.\`${tableName}\` WHERE account_id = '${accountFilter}'`;
              const va = await bqQuery(accessToken, env, verifyAcctSql, resultMessages);
              const acctC = va.rows?.[0]?.f?.[0]?.v || 0;
              const minD = va.rows?.[0]?.f?.[1]?.v || null;
              const maxD = va.rows?.[0]?.f?.[2]?.v || null;
              resultMessages.push(`Post-load ${accountFilter}: rows=${acctC}, date_start range: [${minD}..${maxD}]`);
            }
          } catch (e) {
            resultMessages.push(`Post-load verification failed: ${e.message}`);
          }
          
            // Remove duplicates after insertion (preserves partitioning)
            log("INFO", "BigQueryDeduplicationStarted", { table_name: tableName, accounts: allAccountIds });
            resultMessages.push("Running post-insert deduplication cleanup...");
            await retryBQOperation(
              async () => await removeDuplicates(accessToken, env, tableName, resultMessages, null, metaArraySchema, allAccountIds),
              "removeDuplicates"
            );
            log("INFO", "BigQueryDeduplicationCompleted", { table_name: tableName });
          
          log("INFO", "BigQueryOperationCompleted", { table_name: tableName });
          resultMessages.push("BigQuery operations completed successfully");
  
          // Post-dedup verification
          try {
            const verifyTotalSql2 = `SELECT COUNT(*) AS c FROM \`${env.BQ_PROJECT_ID}\`.\`${env.BQ_DATASET}\`.\`${tableName}\``;
            const vt2 = await bqQuery(accessToken, env, verifyTotalSql2, resultMessages);
            const totalC2 = vt2.rows?.[0]?.f?.[0]?.v || 0;
            resultMessages.push(`After dedup, total rows in ${fqn}: ${totalC2}`);
            if (accountFilter) {
              const verifyAcctSql2 = `SELECT COUNT(*) AS c, MIN(date_start) AS min_d, MAX(date_start) AS max_d FROM \`${env.BQ_PROJECT_ID}\`.\`${env.BQ_DATASET}\`.\`${tableName}\` WHERE account_id = '${accountFilter}'`;
              const va2 = await bqQuery(accessToken, env, verifyAcctSql2, resultMessages);
              const acctC2 = va2.rows?.[0]?.f?.[0]?.v || 0;
              const minD2 = va2.rows?.[0]?.f?.[1]?.v || null;
              const maxD2 = va2.rows?.[0]?.f?.[2]?.v || null;
              resultMessages.push(`After dedup ${accountFilter}: rows=${acctC2}, date_start range: [${minD2}..${maxD2}]`);
            }
          } catch (e) {
            resultMessages.push(`Post-dedup verification failed: ${e.message}`);
          }
        }
      } catch (err) {
        log("ERROR", "BigQueryError", { error: err.message, stack: err.stack });
        errorMessages.push(`BigQuery error: ${err.message}`);
        resultMessages.push(`BigQuery error details: ${err.stack || 'No stack trace available'}`);
      }
    }
  
    if (destination === "s3" || destination === "both") {
      log("INFO", "S3OperationStarted", {});
      const region = env.S3_REGION || "eu-central-1";
      const bucket = env.S3_BUCKET;
      const accessKey = env.S3_ACCESS_KEY;
      const secretKey = env.S3_SECRET_KEY;
      const service = "s3";
  
      const dateStamp = nowDate.toISOString().slice(0, 10).replace(/-/g, ""); // e.g., 20250630
      const timePart = `${nowDate.getHours().toString().padStart(2, '0')}${nowDate.getMinutes().toString().padStart(2, '0')}`; // e.g., 1109
      const amzDate = `${dateStamp}T${timePart}00Z`; // Zero seconds
  
      const suffixParts = [mode];
      if (accountFilter) suffixParts.push(accountFilter);
      if (lookbackParam) suffixParts.push(lookbackParam);
      const suffix = suffixParts.join("-");
  
      const key = `fb-insights-${dateStamp}-${timePart}-${suffix}.json`;
      const canonicalUri = `/${key}`;
      const host = `${bucket}.s3.${region}.amazonaws.com`;
      const endpoint = `https://${host}/${encodeURIComponent(key)}`;
  
      // Check if file already exists in S3
      const headRes = await fetch(endpoint, { method: "HEAD" });
      if (headRes.ok) {
        log("INFO", "S3UploadSkipped", { key, reason: "file_exists" });
        resultMessages.push(`Skipped S3 upload: ${key} already exists`);
      } else {
        log("INFO", "S3UploadStarted", { key, row_count: newRows.length });
        const payload = JSON.stringify({ headers: HEADERS, rows: newRows });
        const payloadHash = await digestHex(payload);
  
        // Canonical request
        const canonicalRequest = [
          "PUT",
          canonicalUri,
          "",
          `host:${host}`,
          `x-amz-content-sha256:${payloadHash}`,
          `x-amz-date:${amzDate}`,
          "",
          "host;x-amz-content-sha256;x-amz-date",
          payloadHash
        ].join("\n");
  
        const canonicalRequestHash = await digestHex(canonicalRequest);
        const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
        const stringToSign = [
          "AWS4-HMAC-SHA256",
          amzDate,
          credentialScope,
          canonicalRequestHash
        ].join("\n");
  
        const signingKey = await getSignatureKey(secretKey, dateStamp, region, service);
        const signatureBuffer = await hmac(signingKey, stringToSign);
        const signature = Array.from(new Uint8Array(signatureBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
  
        const authorization = [
          `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}`,
          "SignedHeaders=host;x-amz-content-sha256;x-amz-date",
          `Signature=${signature}`
        ].join(", ");
  
        // Upload to S3
        const res = await fetch(endpoint, {
          method: "PUT",
          headers: {
            "Authorization": authorization,
            "x-amz-date": amzDate,
            "x-amz-content-sha256": payloadHash,
            "Content-Type": "application/json"
          },
          body: payload
        });
  
        if (!res.ok) {
          const errorText = await res.text();
          log("ERROR", "S3UploadFailed", { key, error: errorText });
          errorMessages.push(`S3 upload failed: ${errorText}`);
        } else {
          log("INFO", "S3UploadSuccess", { key, rows_uploaded: newRows.length });
          resultMessages.push(`Uploaded ${newRows.length} rows to S3 as ${key}`);
        }
      }
    }
  
    if (destination === "sheets" || destination === "both") {
      log("INFO", "SheetsOperationStarted", {});
      // Step 1: Authenticate and get access token
      const jwtHeader = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }))
        .replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
      const iat = Math.floor(Date.now() / 1000);
      const jwtClaim = btoa(JSON.stringify({
        iss: env.GS_CLIENT_EMAIL,
        scope: "https://www.googleapis.com/auth/spreadsheets",
        aud: "https://oauth2.googleapis.com/token",
        iat, exp: iat + 3600
      })).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
      const toSign = `${jwtHeader}.${jwtClaim}`;
  
      const pem = env.GS_PRIVATE_KEY.replace(/\\n/g, "\n").replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
      const keyBuf = Uint8Array.from(atob(pem), c => c.charCodeAt(0)).buffer;
      const keyObj = await crypto.subtle.importKey("pkcs8", keyBuf, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
      const sigBuf = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", keyObj, new TextEncoder().encode(toSign));
      const sig = btoa(String.fromCharCode(...new Uint8Array(sigBuf)))
        .replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
      const jwt = `${toSign}.${sig}`;
  
      const tokResp = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
      });
      const tokJson = await tokResp.json();
      const access_token = tokJson.access_token;
  
      if (!access_token) {
        log("ERROR", "SheetsAuthFailed", {});
        errorMessages.push("Google auth failed");
      } else {
        log("INFO", "SheetsAuthSuccess", {});
        // Step 2: Fetch existing sheet values
        const getURL = `https://sheets.googleapis.com/v4/spreadsheets/${env.SPREADSHEET_ID}/values/${encodeURIComponent(env.RANGE_NAME)}?majorDimension=ROWS`;
        const getResp = await fetch(getURL, {
          headers: { authorization: `Bearer ${access_token}` }
        });
        const { values: existingRows = [] } = await getResp.json();
  
        // Step 3: Build existing row map by deduplication key
        const existingMap = new Map();
        const headerOffset = HEADERS.length === existingRows[0]?.length ? 0 : 1;
        for (const row of existingRows.slice(headerOffset)) {
          const k = key(row);
          const existingTime = new Date(row[1]); // retrieved_at
          existingMap.set(k, { row, time: existingTime });
        }
  
        // Step 4: Merge new rows (keep newer)
        for (const row of newRows) {
          const k = key(row);
          const newTime = new Date(row[1]);
          const existing = existingMap.get(k);
          if (!existing || newTime > existing.time) {
            existingMap.set(k, { row, time: newTime });
          }
        }
  
        // Step 5: Overwrite sheet with latest rows
        const finalRows = Array.from(existingMap.values()).map(({ row }) => row);
        if (headerOffset > 0) {
          finalRows.unshift(HEADERS);
        }
  
        // Pad all rows to HEADERS length so the write is rectangular
        const TARGET_LEN = HEADERS.length;
        for (const row of finalRows) {
          while (row.length < TARGET_LEN) row.push("");
          if (row.length > TARGET_LEN) row.length = TARGET_LEN;
        }
  
        const updateURL = `https://sheets.googleapis.com/v4/spreadsheets/${env.SPREADSHEET_ID}/values/${encodeURIComponent(env.RANGE_NAME)}?valueInputOption=RAW`;
        const updateResp = await fetch(updateURL, {
          method: "PUT",
          headers: {
            authorization: `Bearer ${access_token}`,
            "content-type": "application/json"
          },
          body: JSON.stringify({ values: finalRows })
        });
  
        if (!updateResp.ok) {
          const errorText = await updateResp.text();
          log("ERROR", "SheetsWriteFailed", { error: errorText });
          errorMessages.push(`Sheet overwrite error: ${errorText}`);
        } else {
          log("INFO", "SheetsWriteSuccess", { rows_written: finalRows.length - 1 });
          resultMessages.push(`Overwrote sheet with ${finalRows.length - 1} deduplicated rows`);
        }
      }
    }
  
    // Combine all messages for response
    const allMessages = [...resultMessages];
    if (errorMessages.length > 0) {
      allMessages.push("\n--- ERRORS ---");
      allMessages.push(...errorMessages);
    }
  
    const responseText = allMessages.join("\n");
    const status = errorMessages.length > 0 ? 500 : 200;

    log("INFO", "RequestCompleted", { 
      status, 
      errors: errorMessages.length,
      total_messages: allMessages.length 
    });
  
    return new Response(responseText, {
      status: status,
      headers: { "content-type": "text/plain" }
    });
  }
  
  // ---------- BigQuery helpers ----------
  async function googleJwt(env, scopes) {
    const b64url = str => btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
    const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const iat = Math.floor(Date.now() / 1000);
    const claim = b64url(JSON.stringify({
      iss: env.GS_CLIENT_EMAIL,
      scope: Array.isArray(scopes) ? scopes.join(" ") : String(scopes),
      aud: "https://oauth2.googleapis.com/token",
      iat,
      exp: iat + 3600
    }));
    const toSign = `${header}.${claim}`;
    const pem = env.GS_PRIVATE_KEY.replace(/\\n/g, "\n").replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
    const keyBuf = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0)).buffer;
    const keyObj = await crypto.subtle.importKey("pkcs8", keyBuf, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
    const sigBuf = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", keyObj, new TextEncoder().encode(toSign));
    const sig = b64url(String.fromCharCode(...new Uint8Array(sigBuf)));
    return `${toSign}.${sig}`;
  }
  
  async function googleAccessToken(env, scopes) {
    const jwt = await googleJwt(env, scopes);
    const resp = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
    });
    const json = await resp.json();
    return json.access_token;
  }
  
  function buildBQSchemaFields(headers) {
    const fields = [];
    for (const h of headers) {
      if (h === "date_start") {
        fields.push({ name: h, type: "DATE", mode: "NULLABLE" });
      } else if (h === "retrieved_at") {
        fields.push({ name: h, type: "TIMESTAMP", mode: "NULLABLE" });
      } else if (h === "spend" || h === "impressions" || h === "clicks" || h === "frequency" || h === "reach") {
        fields.push({ name: h, type: "NUMERIC", mode: "NULLABLE" });
      } else if (h.startsWith("conv_") || h.startsWith("convval_")) {
        fields.push({ name: h, type: "NUMERIC", mode: "NULLABLE" });
      } else {
        fields.push({ name: h, type: "STRING", mode: "NULLABLE" });
      }
    }
    return fields;
  }
  
  // BigQuery schema for META with goals_breakdown array of structs
  function buildBQMetaArraySchema() {
    return [
      { name: "account_id", type: "STRING", mode: "NULLABLE" },
      { name: "retrieved_at", type: "TIMESTAMP", mode: "NULLABLE" },
      { name: "date_start", type: "DATE", mode: "NULLABLE" },
      { name: "campaign_name", type: "STRING", mode: "NULLABLE" },
      { name: "adset_name", type: "STRING", mode: "NULLABLE" },
      { name: "ad_name", type: "STRING", mode: "NULLABLE" },
      { name: "spend", type: "NUMERIC", mode: "NULLABLE" },
      { name: "impressions", type: "NUMERIC", mode: "NULLABLE" },
      { name: "clicks", type: "NUMERIC", mode: "NULLABLE" },
      { name: "frequency", type: "NUMERIC", mode: "NULLABLE" },
      { name: "reach", type: "NUMERIC", mode: "NULLABLE" },
      { name: "publisher_platform", type: "STRING", mode: "NULLABLE" },
      { name: "platform_position", type: "STRING", mode: "NULLABLE" },
      { name: "device_platform", type: "STRING", mode: "NULLABLE" },
      {
        name: "goals_breakdown",
        type: "RECORD",
        mode: "REPEATED",
        fields: [
          { name: "goal_name", type: "STRING", mode: "NULLABLE" },
          { name: "window", type: "STRING", mode: "NULLABLE" },
          { name: "conversions", type: "INTEGER", mode: "NULLABLE" },
          { name: "conversion_value", type: "FLOAT", mode: "NULLABLE" }
        ]
      }
    ];
  }
  
  async function bqReq(url, opts) {
    const resp = await fetch(url, opts);
    const txt = await resp.text();
    let json = {};
    try {
      json = txt ? JSON.parse(txt) : {};
    } catch {}
    return { ok: resp.ok, status: resp.status, json, txt };
  }
  
  async function bqGetTable(accessToken, env, tableId) {
    const url = `https://www.googleapis.com/bigquery/v2/projects/${encodeURIComponent(env.BQ_PROJECT_ID)}/datasets/${encodeURIComponent(env.BQ_DATASET)}/tables/${encodeURIComponent(tableId)}`;
    return bqReq(url, { headers: { authorization: `Bearer ${accessToken}` } });
  }
  
  async function bqCreateTable(accessToken, env, tableId, schemaFields) {
    const body = {
      tableReference: { projectId: env.BQ_PROJECT_ID, datasetId: env.BQ_DATASET, tableId },
      schema: { fields: schemaFields },
      timePartitioning: { type: "DAY", field: "date_start" },
      clustering: { fields: ["account_id", "campaign_name"] }
    };
    if (env.BQ_LOCATION) body.location = env.BQ_LOCATION;
    const url = `https://www.googleapis.com/bigquery/v2/projects/${encodeURIComponent(env.BQ_PROJECT_ID)}/datasets/${encodeURIComponent(env.BQ_DATASET)}/tables`;
    const { ok, status, txt } = await bqReq(url, {
      method: "POST",
      headers: { authorization: `Bearer ${accessToken}`, "content-type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!ok) throw new Error(`BigQuery table create failed for ${tableId}: HTTP ${status}: ${txt.slice(0, 400)}`);
  }
  
  async function ensureBQTable(accessToken, env, tableId, schemaFields) {
    const r = await bqGetTable(accessToken, env, tableId);
    if (r.status === 200) return r.json;
    if (r.status !== 404) throw new Error(`BigQuery tables.get for ${tableId} failed: HTTP ${r.status}: ${r.txt.slice(0, 400)}`);
    await bqCreateTable(accessToken, env, tableId, schemaFields);
    const again = await bqGetTable(accessToken, env, tableId);
    return again.json;
  }
  
  async function bqLoadJson(accessToken, env, tableId, objects, logs, headers, explicitSchemaFields) {
    if (!objects.length) return { jobId: null, outputRows: 0 };
    const ndjson = objects.map(o => JSON.stringify(o)).join("\n");
    const jobConfig = {
      configuration: {
        load: {
          destinationTable: { projectId: env.BQ_PROJECT_ID, datasetId: env.BQ_DATASET, tableId },
          schema: { fields: explicitSchemaFields || buildBQSchemaFields(headers) },
          writeDisposition: "WRITE_APPEND",
          createDisposition: "CREATE_IF_NEEDED",
          sourceFormat: "NEWLINE_DELIMITED_JSON",
          autodetect: false
        }
      }
    };
    if (env.BQ_LOCATION) jobConfig.location = env.BQ_LOCATION;
  
    const boundary = "bq_ndjson_" + (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));
    const pre = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(jobConfig)}\r\n--${boundary}\r\nContent-Type: application/octet-stream\r\n\r\n`;
    const post = `\r\n--${boundary}--`;
    const insertUrl = `https://www.googleapis.com/upload/bigquery/v2/projects/${encodeURIComponent(env.BQ_PROJECT_ID)}/jobs?uploadType=multipart`;
    const ins = await bqReq(insertUrl, {
      method: "POST",
      headers: { authorization: `Bearer ${accessToken}`, "content-type": `multipart/related; boundary=${boundary}` },
      body: pre + ndjson + post
    });
    if (!ins.ok) throw new Error(`BQ LOAD insert failed: HTTP ${ins.status}: ${ins.txt.slice(0, 800)}`);
  
    const jobId = ins.json?.jobReference?.jobId;
    const location = ins.json?.jobReference?.location || env.BQ_LOCATION || undefined;
    const base = `https://www.googleapis.com/bigquery/v2/projects/${encodeURIComponent(env.BQ_PROJECT_ID)}/jobs/${encodeURIComponent(jobId)}`;
    logs.push(`BQ LOAD submitted: ${jobId}${location ? ("@" + location) : ""} (${objects.length} rows)`);
  
    let attempts = 0, delay = 800;
    while (attempts < 60) {
      const url = location ? `${base}?location=${encodeURIComponent(location)}` : base;
      const r = await bqReq(url, { headers: { authorization: `Bearer ${accessToken}` } });
      if (r.json?.status?.state === "DONE") {
        const err = r.json?.status?.errorResult || (r.json?.status?.errors || [])[0];
        if (err) throw new Error(`BQ LOAD failed: ${JSON.stringify(err).slice(0, 600)}`);
        const out = r.json?.statistics?.load?.outputRows || 0;
        logs.push(`BQ LOAD DONE: ${jobId} outputRows=${out}`);
        return { jobId, outputRows: out };
      }
      attempts++;
      await sleep(delay);
      if (delay < 3000) delay += 250;
    }
    throw new Error(`BQ LOAD timeout ${jobId}`);
  }
  
  async function bqQuery(accessToken, env, sql, logs) {
    const body = {
      query: sql,
      useLegacySql: false,
      defaultDataset: { datasetId: env.BQ_DATASET, projectId: env.BQ_PROJECT_ID }
    };
    if (env.BQ_LOCATION) body.location = env.BQ_LOCATION;
    const url = `https://www.googleapis.com/bigquery/v2/projects/${encodeURIComponent(env.BQ_PROJECT_ID)}/queries`;
    const res = await bqReq(url, {
      method: "POST",
      headers: { authorization: `Bearer ${accessToken}`, "content-type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`BQ jobs.query failed: HTTP ${res.status}: ${res.txt.slice(0, 800)}`);
    const jobId = res.json?.jobReference?.jobId;
    logs.push(`BQ QUERY (sync) job=${jobId} rows=${res.json?.totalRows || 0}`);
    return res.json;
  }
  
  async function removeDuplicates(accessToken, env, tableName, logs, headers, explicitSchemaFields, accountIdsForScope) {
    // First, get count of duplicates (use COALESCE to handle NULLs properly)
    const countSql = `
      SELECT COUNT(*) as total_rows,
             COUNT(DISTINCT CONCAT(
               COALESCE(account_id, ''), '|', 
               COALESCE(CAST(date_start AS STRING), ''), '|', 
               COALESCE(campaign_name, ''), '|', 
               COALESCE(adset_name, ''), '|', 
               COALESCE(ad_name, ''), '|', 
               COALESCE(publisher_platform, ''), '|', 
               COALESCE(platform_position, ''), '|', 
               COALESCE(device_platform, '')
             )) as unique_rows
      FROM \`${env.BQ_PROJECT_ID}\`.\`${env.BQ_DATASET}\`.\`${tableName}\`
    `;
    
    try {
      const countResult = await bqQuery(accessToken, env, countSql, logs);
      const totalRows = countResult.rows?.[0]?.f?.[0]?.v || 0;
      const uniqueRows = countResult.rows?.[0]?.f?.[1]?.v || 0;
      const duplicates = totalRows - uniqueRows;
      
      logs.push(`Before deduplication: ${totalRows} total rows, ${uniqueRows} unique rows, ${duplicates} duplicates`);
      
      if (duplicates > 0) {
        // Deduplicate only the affected account_ids (scope to current run) and avoid full-table TRUNCATE to prevent contention
        const scopeFilter = Array.isArray(accountIdsForScope) && accountIdsForScope.length > 0
          ? `WHERE account_id IN (${accountIdsForScope.map(id => `"${id}"`).join(", ")})`
          : "";
  
        const dedupScript = `
          BEGIN TRANSACTION;
          -- First: Deduplicate within same breakdown dimensions (keep latest retrieved_at)
          CREATE TEMP TABLE deduped AS
          SELECT * EXCEPT(rn) FROM (
            SELECT 
              t.*,
              ROW_NUMBER() OVER (
                PARTITION BY account_id, date_start, campaign_name, adset_name, ad_name, publisher_platform, platform_position, device_platform
                ORDER BY retrieved_at DESC, COALESCE(spend, 0) DESC, COALESCE(impressions, 0) DESC
              ) AS rn
            FROM \`${env.BQ_PROJECT_ID}\`.\`${env.BQ_DATASET}\`.\`${tableName}\` t
            ${scopeFilter}
          )
          WHERE rn = 1;
          
          -- Second: Remove NULL breakdown rows if non-NULL breakdown exists for same ad/date
          CREATE TEMP TABLE final_deduped AS
          SELECT d.*
          FROM deduped d
          WHERE NOT (
            -- This row has NULL breakdowns
            (d.publisher_platform IS NULL OR d.platform_position IS NULL OR d.device_platform IS NULL)
            AND
            -- AND there exists a row with non-NULL breakdowns for same ad/date
            EXISTS (
              SELECT 1 FROM deduped d2
              WHERE d2.account_id = d.account_id
                AND d2.date_start = d.date_start
                AND d2.campaign_name = d.campaign_name
                AND d2.adset_name = d.adset_name
                AND d2.ad_name = d.ad_name
                AND d2.publisher_platform IS NOT NULL
                AND d2.platform_position IS NOT NULL
                AND d2.device_platform IS NOT NULL
            )
          );
          
          DELETE FROM \`${env.BQ_PROJECT_ID}\`.\`${env.BQ_DATASET}\`.\`${tableName}\`
          ${scopeFilter};
          INSERT INTO \`${env.BQ_PROJECT_ID}\`.\`${env.BQ_DATASET}\`.\`${tableName}\`
          SELECT * FROM final_deduped;
          COMMIT TRANSACTION;`;
        await bqQuery(accessToken, env, dedupScript, logs);
        logs.push(`Deduplicated ${tableName} scoped to accounts: ${Array.isArray(accountIdsForScope) ? accountIdsForScope.join(', ') : 'ALL'}`);
        
        // Verify the deduplication worked
        const verifyResult = await bqQuery(accessToken, env, countSql, logs);
        const finalTotalRows = verifyResult.rows?.[0]?.f?.[0]?.v || 0;
        const finalUniqueRows = verifyResult.rows?.[0]?.f?.[1]?.v || 0;
        const remainingDuplicates = finalTotalRows - finalUniqueRows;
        
        logs.push(`After deduplication: ${finalTotalRows} total rows, ${finalUniqueRows} unique rows, ${remainingDuplicates} remaining duplicates`);
        
        if (remainingDuplicates > 0) {
          logs.push(`Warning: ${remainingDuplicates} duplicates still remain after cleanup`);
        }
      } else {
        logs.push(`No duplicates found in ${tableName} table`);
      }
    } catch (err) {
      logs.push(`Duplicate removal failed: ${err.message}`);
      throw err;
    }
  }
  
  
  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }
  
  async function digestHex(str) {
    const data = new TextEncoder().encode(str);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
  }
  
  async function hmac(key, data) {
    const enc = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    return await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(data));
  }
  
  async function getSignatureKey(key, date, region, service) {
    const kDate = await hmac(new TextEncoder().encode("AWS4" + key), date);
    const kRegion = await hmac(kDate, region);
    const kService = await hmac(kRegion, service);
    return await hmac(kService, "aws4_request");
  }
  