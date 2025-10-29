/**
 * Version: 1.0.0
 * POP Cloudflare Reporting – ExoClick & TrafficJunky → BigQuery (BQ-only)
 * -------------------------------------------------------------------
 * What it does
 *  - Authenticates to ExoClick and/or TrafficJunky (TJ)
 *  - Collects stats for a date range (Exo in one call, TJ day-by-day)
 *  - Writes to BigQuery only: Stage → MERGE (retrieved_at last-wins), stage TTL + sweeper
 *
 * Environment Variables (Settings → Variables)
 *  - EXOCLICK_API_TOKEN      : ExoClick API token (user token)
 *  - EXOCLICK_STATIC_TOKEN   : ExoClick static app token (used for login bearer)
 *  - TJ_API_KEY              : TrafficJunky API Bearer token
 *  - GS_CLIENT_EMAIL         : Google Service Account client_email
 *  - GS_PRIVATE_KEY          : Google Service Account private_key (keep line breaks; Worker code normalizes)
 *  - BQ_PROJECT_ID           : GCP Project ID (for BigQuery)
 *  - BQ_DATASET              : BigQuery dataset (must exist)
 *  - BQ_LOCATION             : BigQuery location (e.g. EU or US)
 *  - BQ_STAGE_TTL_MIN        : (optional) Minutes to keep stage tables alive (default: 120)
 *
 * Query Parameters
 *  - start_date  : (required) YYYY-MM-DD
 *  - end_date    : (required) YYYY-MM-DD
 *  - channel     : (optional) 'exo' | 'tj' | 'both' (default: 'both')
 *
 * BigQuery Tables
 *  - exo_stats_siteid(date DATE, campaign_id STRING, campaign_name STRING,
 *              site_id STRING, site_name STRING, site_hostname STRING,
 *              variation_id STRING, variation_name STRING, variation_url STRING,
 *              impressions INT64, clicks INT64, goals INT64,
 *              conversion_value FLOAT64, cost FLOAT64, retrieved_at TIMESTAMP,
 *              goals_breakdown ARRAY<STRUCT<goal_id STRING, goal_name STRING, conversions INT64, conversion_value FLOAT64>>)
 *    KEY: (date, campaign_id, site_id, variation_id)  Partition: date  Cluster: campaign_id,site_id,variation_id
 *
 *  - tj_stats_siteid(date DATE, campaign_id STRING, campaign_name STRING,
 *             impressions INT64, clicks INT64, conversions INT64,
 *             cost FLOAT64, retrieved_at TIMESTAMP)
 *    KEY: (date, campaign_name)  Partition: date  Cluster: campaign_name,campaign_id
 */

// ---------- Cron Date Window Calculation ----------
function last4WindowUTC() {
  const todayUTC = new Date(Date.UTC(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate()
  ));
  const to = new Date(todayUTC.getTime() - 1*24*3600*1000);                               // exclusive
  const from = new Date(todayUTC.getTime() - 5*24*3600*1000);
  return { 
    FROM: formatYmd(from), 
    TO: formatYmd(to) 
  };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Manual call IP allow-list (cron bypasses via header)
    const allowedIps = ["2a06:98c0:3600::103", "195.158.92.167"];
    const cfHeader = request.headers.get("cf-connecting-ip");
    const isCron = request.headers.get("cf-worker-cron") === "true";
    if (!isCron && allowedIps.length && !allowedIps.includes(cfHeader||"")) {
      return new Response("Forbidden", { status: 403 });
    }

    // Env
    const EXOCLICK_API_TOKEN    = env.EXOCLICK_API_TOKEN;
    const EXOCLICK_STATIC_TOKEN = env.EXOCLICK_STATIC_TOKEN;
    const TJ_API_KEY            = env.TJ_API_KEY;

    // BigQuery Env
    const BQ_PROJECT_ID   = env.BQ_PROJECT_ID;
    const BQ_DATASET      = env.BQ_DATASET;
    const BQ_LOCATION     = env.BQ_LOCATION || 'US';
    const BQ_STAGE_TTL_MIN= Number(env.BQ_STAGE_TTL_MIN || 120);

    // Params
    const start_date = url.searchParams.get("start_date"); // YYYY-MM-DD
    const end_date   = url.searchParams.get("end_date");   // YYYY-MM-DD
    const channel    = (url.searchParams.get("channel") || "both").toLowerCase(); // exo | tj | both

    // Log request details
    console.log(`[REQUEST] Method: ${request.method}, URL: ${request.url}`);
    console.log(`[REQUEST] Headers: cf-connecting-ip=${cfHeader}, cf-worker-cron=${isCron}`);
    console.log(`[REQUEST] Params: start_date=${start_date}, end_date=${end_date}, channel=${channel}`);
    if (isCron) {
      console.log(`[CRON] POPs BQ-only worker triggered for ${start_date} to ${end_date}, channel=${channel}`);
    }

    const wantExo = channel === "both" || channel === "exo";
    const wantTj  = channel === "both" || channel === "tj";

    try {
      // --- Stats mode requires dates ---
      if (!start_date || !end_date) {
        console.log(`[ERROR] Missing required parameters: start_date=${start_date}, end_date=${end_date}`);
        return new Response("Missing required parameters: start_date and end_date", { status: 400 });
      }

      console.log(`[DESTINATION] Using BigQuery destination (BQ-only worker)`);
      console.log(`[BQ_CONFIG] Project: ${BQ_PROJECT_ID}, Dataset: ${BQ_DATASET}, Location: ${BQ_LOCATION}`);

      if (!BQ_PROJECT_ID || !BQ_DATASET) {
        console.log(`[ERROR] Missing BigQuery env vars: BQ_PROJECT_ID=${BQ_PROJECT_ID}, BQ_DATASET=${BQ_DATASET}`);
        return new Response("Missing BigQuery env vars: BQ_PROJECT_ID and/or BQ_DATASET", { status: 400 });
      }

      console.log(`[BQ_AUTH] Getting BigQuery access token...`);
      const bqToken = await googleAccessToken(env, ["https://www.googleapis.com/auth/bigquery"]);
      console.log(`[BQ_AUTH] Access token obtained successfully`);
      const logs = [];

      // Tables & schemas
      const exoTableId = "exo_stats_siteid";
      const tjTableId  = "tj_stats_siteid";

      const EXO_SCHEMA = [
        {name:"date", type:"DATE", mode:"REQUIRED"},
        {name:"campaign_id", type:"STRING", mode:"REQUIRED"},
        {name:"campaign_name", type:"STRING", mode:"NULLABLE"},
        {name:"site_id", type:"STRING", mode:"REQUIRED"},
        {name:"site_name", type:"STRING", mode:"NULLABLE"},
        {name:"site_hostname", type:"STRING", mode:"NULLABLE"},
        {name:"variation_id", type:"STRING", mode:"NULLABLE"},
        {name:"variation_name", type:"STRING", mode:"NULLABLE"},
        {name:"variation_url", type:"STRING", mode:"NULLABLE"},
        {name:"impressions", type:"INT64", mode:"NULLABLE"},
        {name:"clicks", type:"INT64", mode:"NULLABLE"},
        {name:"goals", type:"INT64", mode:"NULLABLE"},
        {name:"conversion_value", type:"FLOAT64", mode:"NULLABLE"},
        {name:"cost", type:"FLOAT64", mode:"NULLABLE"},
        {name:"retrieved_at", type:"TIMESTAMP", mode:"REQUIRED"},
        {name:"goals_breakdown", type:"RECORD", mode:"REPEATED", fields:[
          {name:"goal_id", type:"STRING", mode:"NULLABLE"},
          {name:"goal_name", type:"STRING", mode:"NULLABLE"},
          {name:"conversions", type:"INT64", mode:"NULLABLE"},
          {name:"conversion_value", type:"FLOAT64", mode:"NULLABLE"}
        ]},
      ];

      const TJ_SCHEMA = [
        {name:"date", type:"DATE", mode:"REQUIRED"},
        {name:"campaign_id", type:"STRING", mode:"NULLABLE"},
        {name:"campaign_name", type:"STRING", mode:"REQUIRED"},
        {name:"impressions", type:"INT64", mode:"NULLABLE"},
        {name:"clicks", type:"INT64", mode:"NULLABLE"},
        {name:"conversions", type:"INT64", mode:"NULLABLE"},
        {name:"cost", type:"FLOAT64", mode:"NULLABLE"},
        {name:"retrieved_at", type:"TIMESTAMP", mode:"REQUIRED"},
      ];

      // Ensure target tables exist with partition + clustering
      if (wantExo) {
        console.log(`[BQ_TABLE] Ensuring ExoClick table exists: ${exoTableId}`);
        await ensureBQTable(bqToken, env, exoTableId, EXO_SCHEMA, "date", ["campaign_id","site_id","variation_id"]);
        await bqSetNoExpiry(bqToken, env, exoTableId, logs);
        // Ensure new goals_breakdown column exists on permanent table
        await bqQuery(bqToken, env,
          `ALTER TABLE \`${BQ_PROJECT_ID}.${BQ_DATASET}.${exoTableId}\`
           ADD COLUMN IF NOT EXISTS goals_breakdown ARRAY<STRUCT<goal_id STRING, goal_name STRING, conversions INT64, conversion_value FLOAT64>>`,
          logs
        ).catch(() => {});
        // Ensure site columns exist if table was created previously
        await bqQuery(bqToken, env,
          `ALTER TABLE \`${BQ_PROJECT_ID}.${BQ_DATASET}.${exoTableId}\`
             ADD COLUMN IF NOT EXISTS site_id STRING`, logs).catch(() => {});
        await bqQuery(bqToken, env,
          `ALTER TABLE \`${BQ_PROJECT_ID}.${BQ_DATASET}.${exoTableId}\`
             ADD COLUMN IF NOT EXISTS site_name STRING`, logs).catch(() => {});
        await bqQuery(bqToken, env,
          `ALTER TABLE \`${BQ_PROJECT_ID}.${BQ_DATASET}.${exoTableId}\`
             ADD COLUMN IF NOT EXISTS site_hostname STRING`, logs).catch(() => {});
        await bqQuery(bqToken, env,
          `ALTER TABLE \`${BQ_PROJECT_ID}.${BQ_DATASET}.${exoTableId}\`
             ADD COLUMN IF NOT EXISTS variation_id STRING`, logs).catch(() => {});
        await bqQuery(bqToken, env,
          `ALTER TABLE \`${BQ_PROJECT_ID}.${BQ_DATASET}.${exoTableId}\`
             ADD COLUMN IF NOT EXISTS variation_name STRING`, logs).catch(() => {});
        await bqQuery(bqToken, env,
          `ALTER TABLE \`${BQ_PROJECT_ID}.${BQ_DATASET}.${exoTableId}\`
             ADD COLUMN IF NOT EXISTS variation_url STRING`, logs).catch(() => {});
        console.log(`[BQ_TABLE] ExoClick table ready`);
      }
      if (wantTj) {
        console.log(`[BQ_TABLE] Ensuring TrafficJunky table exists: ${tjTableId}`);
        await ensureBQTable(bqToken, env, tjTableId, TJ_SCHEMA, "date", ["campaign_name","campaign_id"]);
        await bqSetNoExpiry(bqToken, env, tjTableId, logs);
        console.log(`[BQ_TABLE] TrafficJunky table ready`);
      }

      // Set retrievedAt ONCE at the very beginning of BigQuery processing
      const retrievedAt = new Date().toISOString();
      console.log(`[BQ_TIMESTAMP] Retrieved at: ${retrievedAt}`);
      logs.push(`[BigQuery] Started at ${retrievedAt}`);

      // === Collect & normalize ===
      const stageSuffix = randomId();
      let exoObjects = [];
      let tjObjects  = [];

      if (wantExo) {
        console.log(`[EXOCLICK] Starting site-level data collection for ${start_date} to ${end_date}`);
        logs.push(`[ExoClick] Fetching site-level data for ${start_date} to ${end_date}`);
        console.log(`[EXOCLICK] Logging into ExoClick API...`);
        const sessionToken = await exoGetSessionToken(EXOCLICK_API_TOKEN, EXOCLICK_STATIC_TOKEN);
        console.log(`[EXOCLICK] Login successful, getting campaign and goal maps...`);

        const campaignMap  = await exoGetCampaignMapCached(sessionToken);
        const goalMap      = await exoGetGoalMapCached(sessionToken);
        console.log(`[EXOCLICK] Campaign map loaded: ${Object.keys(campaignMap).length} campaigns`);
        console.log(`[EXOCLICK] Goal map loaded: ${Object.keys(goalMap).length} goals`);

        // Attempt single call grouped by date,campaign_id,site_id,variation_id
        const tryCombined = async () => {
          const body = {
            totals: 1,
            filter: { date_from: start_date, date_to: end_date, exclude_deleted: 0 },
            group_by: ["date","campaign_id","site_id","variation_id"],
            order_by: [{ field: "impressions", order: "desc" }],
            limit: 5000,
            offset: 0
          };
          let totalRows = 0;
          while (true) {
            const page = await exoPostGlobalStats(sessionToken, body);
            const arr = Array.isArray(page?.result) ? page.result : [];
            if (!arr.length && totalRows === 0) {
              // If first page lacks campaign grouping info, signal fallback
              if (page?.result && page.result[0] && !page.result[0]?.group_by?.campaign_id) {
                throw new Error("campaign_id not present in group_by; fallback needed");
              }
            }
            for (const r of arr) {
              const gb = r.group_by || {};
              const dateStr = gb?.date?.date || gb?.date || null;
              const campaignId = gb?.campaign_id?.id != null ? String(gb.campaign_id.id) : null;
              const site = gb?.site_id || {};
              const siteId = site?.id != null ? String(site.id) : null;
              const siteName = site?.name || null;
              const siteHost = site?.site_hostname || null;
              const variation = gb?.variation_id || {};
              const varId = variation?.id != null ? String(variation.id) : null;
              const varName = variation?.name || null; // sometimes API may return name under group_by
              const varUrl = variation?.url || null; // stats rarely includes url; enrich via lookup below
              const goalsBlock = normalizeGoalsBlock(r?.goals);
              const goals_breakdown = goalsBlock.breakdown(goalMap);
              exoObjects.push({
                date: dateStr,
                campaign_id: campaignId,
                campaign_name: campaignId ? (campaignMap[campaignId] || `Campaign ${campaignId}`) : null,
                site_id: siteId,
                site_name: siteName,
                site_hostname: siteHost,
                variation_id: varId,
                variation_name: varName || (varId ? (variationMapsByCampaign[campaignId]?.[varId]?.name || variationMapsByCampaign[campaignId]?.[varId] || null) : null),
                variation_url: varUrl || (varId ? (variationMapsByCampaign[campaignId]?.[varId]?.url || null) : null),
                impressions: toNumber(r.impressions),
                clicks: toNumber(r.clicks),
                goals: toNumber(goalsBlock.total),
                conversion_value: goalsBlock.conversionValue,
                cost: Number(r.cost || 0),
                retrieved_at: retrievedAt,
                goals_breakdown,
              });
            }
            totalRows += arr.length;
            if (arr.length < body.limit) break;
            body.offset += body.limit;
          }
          return totalRows;
        };

        let combinedOk = false;
        // Prepare variation maps so we can enrich names even if the API doesn't include them in group_by
        const allCampaignIds = Object.keys(campaignMap);
        const variationMapsByCampaign = await exoGetVariationMapForCampaignsCached(sessionToken, allCampaignIds);
        try {
          const rows = await tryCombined();
          combinedOk = rows > 0;
          console.log(`[EXOCLICK] Combined grouping produced ${rows} rows`);
        } catch (e) {
          console.log(`[EXOCLICK] Combined grouping not supported, falling back per-campaign: ${e.message}`);
        }

        if (!combinedOk) {
          // Loop each campaign and group by date, site_id, variation_id with filter campaign_id
          const campaignIds = Object.keys(campaignMap);
          console.log(`[EXOCLICK] Iterating ${campaignIds.length} campaigns for site breakdown`);
          for (const cid of campaignIds) {
            const body = {
              totals: 1,
              filter: { date_from: start_date, date_to: end_date, exclude_deleted: 0, campaign_id: [Number(cid)] },
              group_by: ["date","site_id","variation_id"],
              order_by: [{ field: "impressions", order: "desc" }],
              limit: 5000,
              offset: 0
            };
            let pageCount = 0;
            while (true) {
              const page = await exoPostGlobalStats(sessionToken, body);
              const arr = Array.isArray(page?.result) ? page.result : [];
              for (const r of arr) {
                const gb = r.group_by || {};
                const dateStr = gb?.date?.date || gb?.date || null;
                const site = gb?.site_id || {};
                const siteId = site?.id != null ? String(site.id) : null;
                const siteName = site?.name || null;
                const siteHost = site?.site_hostname || null;
                const variation = gb?.variation_id || {};
                const varId = variation?.id != null ? String(variation.id) : null;
                const varName = variation?.name || null;
                const varUrl = variation?.url || null;
                const goalsBlock = normalizeGoalsBlock(r?.goals);
                const goals_breakdown = goalsBlock.breakdown(goalMap);
                exoObjects.push({
                  date: dateStr,
                  campaign_id: String(cid),
                  campaign_name: campaignMap[cid] || `Campaign ${cid}`,
                  site_id: siteId,
                  site_name: siteName,
                  site_hostname: siteHost,
                  variation_id: varId,
                  variation_name: varName || (varId ? (variationMapsByCampaign[cid]?.[varId]?.name || variationMapsByCampaign[cid]?.[varId] || null) : null),
                  variation_url: varUrl || (varId ? (variationMapsByCampaign[cid]?.[varId]?.url || null) : null),
                  impressions: toNumber(r.impressions),
                  clicks: toNumber(r.clicks),
                  goals: toNumber(goalsBlock.total),
                  conversion_value: goalsBlock.conversionValue,
                  cost: Number(r.cost || 0),
                  retrieved_at: retrievedAt,
                  goals_breakdown,
                });
              }
              pageCount += arr.length;
              if (arr.length < body.limit) break;
              body.offset += body.limit;
            }
            if (pageCount) console.log(`[EXOCLICK] Campaign ${cid}: ${pageCount} site rows`);
          }
        }

        console.log(`[EXOCLICK] Site-level processed ${exoObjects.length} rows for BigQuery`);
        logs.push(`[ExoClick] Collected ${exoObjects.length} site-level rows with retrievedAt=${retrievedAt}`);
      }

      if (wantTj) {
        console.log(`[TRAFFICJUNKY] Starting day-by-day data collection for ${start_date} to ${end_date}`);
        logs.push(`[TrafficJunky] Fetching data day-by-day for ${start_date} to ${end_date}`);
        let daysProcessed = 0;
        for (const ymd of dayIterator(start_date, end_date)) {
          console.log(`[TRAFFICJUNKY] Processing day: ${ymd}`);
          const dmy = ymdToDmy(ymd);
          const path = `/api/campaigns/bids/stats.json?limit=1000&startDate=${encodeURIComponent(dmy)}&endDate=${encodeURIComponent(dmy)}`;
          const data = await tjFetchJson(TJ_API_KEY, path);

          if (Array.isArray(data)) {
            console.log(`[TRAFFICJUNKY] Day ${ymd}: received ${data.length} array items`);
            for (const item of data) {
              tjObjects.push({
                date: ymd,
                campaign_id: item?.campaignId ? String(item.campaignId) : null,
                campaign_name: item?.campaignName || (item?.campaignId ? `Campaign ${item.campaignId}` : 'Unknown Campaign'),
                impressions: toNumber(item?.impressions),
                clicks: toNumber(item?.clicks),
                conversions: toNumber(item?.conversions),
                cost: Number(item?.cost || 0),
                retrieved_at: retrievedAt,
              });
            }
          } else if (data && typeof data === 'object') {
            console.log(`[TRAFFICJUNKY] Day ${ymd}: received ${Object.keys(data).length} object entries`);
            for (const [id, item] of Object.entries(data)) {
              tjObjects.push({
                date: ymd,
                campaign_id: id ? String(id) : null,
                campaign_name: item?.campaignName || (id ? `Campaign ${id}` : 'Unknown Campaign'),
                impressions: toNumber(item?.impressions),
                clicks: toNumber(item?.clicks),
                conversions: toNumber(item?.conversions),
                cost: Number(item?.cost || 0),
                retrieved_at: retrievedAt,
              });
            }
          } else {
            console.log(`[TRAFFICJUNKY] Day ${ymd}: received unexpected data type: ${typeof data}`);
          }
          daysProcessed++;
        }
        console.log(`[TRAFFICJUNKY] Completed processing: ${tjObjects.length} total rows from ${daysProcessed} days`);
        logs.push(`[TrafficJunky] Collected ${tjObjects.length} rows from ${daysProcessed} days with retrievedAt=${retrievedAt}`);
      }

      // === Stage tables (TTL) & load NDJSON ===
      const exoStageId = wantExo ? `exo_stats_stage_${stageSuffix}` : null;
      const tjStageId  = wantTj  ? `tj_stats_stage_${stageSuffix}`  : null;
      console.log(`[BQ_STAGE] Stage suffix: ${stageSuffix}, Exo stage: ${exoStageId}, TJ stage: ${tjStageId}`);

      if (wantExo) {
        console.log(`[BQ_STAGE] Creating ExoClick stage table: ${exoStageId}`);
        await bqCreateStageTable(bqToken, env, exoStageId, EXO_SCHEMA, "date", ["campaign_id","site_id","variation_id"], BQ_STAGE_TTL_MIN);
        console.log(`[BQ_STAGE] Loading ${exoObjects.length} ExoClick rows to stage table...`);
        const outRows = await bqLoadJson(bqToken, env, exoStageId, exoObjects, EXO_SCHEMA, logs);
        console.log(`[BQ_STAGE] ExoClick: staged ${outRows} row(s) successfully`);
        logs.push(`ExoClick: staged ${outRows} row(s)`);
      }
      if (wantTj) {
        console.log(`[BQ_STAGE] Creating TrafficJunky stage table: ${tjStageId}`);
        await bqCreateStageTable(bqToken, env, tjStageId,  TJ_SCHEMA,  "date", ["campaign_name","campaign_id"], BQ_STAGE_TTL_MIN);
        console.log(`[BQ_STAGE] Loading ${tjObjects.length} TrafficJunky rows to stage table...`);
        const outRows = await bqLoadJson(bqToken, env, tjStageId, tjObjects, TJ_SCHEMA, logs);
        console.log(`[BQ_STAGE] TrafficJunky: staged ${outRows} row(s) successfully`);
        logs.push(`TrafficJunky: staged ${outRows} row(s)`);
      }

      // === Merge stage → main ===
      if (wantExo && exoObjects.length) {
        console.log(`[BQ_MERGE] Starting ExoClick merge: ${exoObjects.length} rows -> ${exoTableId}`);
        logs.push(`[MERGE] Starting ExoClick merge: ${exoObjects.length} rows -> ${exoTableId}`);
        const sql = mergeSQL({
          project: BQ_PROJECT_ID, dataset: BQ_DATASET,
          table: exoTableId, stage: exoStageId,
          keyFields: ["date","campaign_id","site_id","variation_id"],
          nonKeyFields: ["campaign_name","site_name","site_hostname","variation_name","variation_url","impressions","clicks","goals","conversion_value","cost","retrieved_at","goals_breakdown"],
        });
        console.log(`[BQ_MERGE] ExoClick SQL: ${sql.substring(0, 200)}...`);
        await bqQuery(bqToken, env, sql, logs);
        console.log(`[BQ_MERGE] ExoClick merge completed successfully`);
        logs.push("ExoClick: merge completed");

        console.log(`[BQ_VERIFY] Checking ExoClick row count...`);
        const verify = targetCountSQL(BQ_PROJECT_ID, BQ_DATASET, exoTableId, start_date, end_date);
        const cntRows = await bqQuery(bqToken, env, verify.sql, logs, /*returnRows*/true);
        console.log(`[BQ_VERIFY] ExoClick rows in range [${start_date}..${end_date}] = ${cntRows?.[0]?.rows_in_range ?? 'n/a'}`);
        logs.push(`ExoClick: rows in range [${start_date}..${end_date}] = ${cntRows?.[0]?.rows_in_range ?? 'n/a'}`);
      }

      if (wantTj && tjObjects.length) {
        console.log(`[BQ_MERGE] Starting TrafficJunky merge: ${tjObjects.length} rows -> ${tjTableId}`);
        logs.push(`[MERGE] Starting TrafficJunky merge: ${tjObjects.length} rows -> ${tjTableId}`);
        const sql = mergeSQL({
          project: BQ_PROJECT_ID, dataset: BQ_DATASET,
          table: tjTableId, stage: tjStageId,
          keyFields: ["date","campaign_name"], // see schema note
          nonKeyFields: ["campaign_id","impressions","clicks","conversions","cost","retrieved_at"],
        });
        console.log(`[BQ_MERGE] TrafficJunky SQL: ${sql.substring(0, 200)}...`);
        await bqQuery(bqToken, env, sql, logs);
        console.log(`[BQ_MERGE] TrafficJunky merge completed successfully`);
        logs.push("TrafficJunky: merge completed");

        console.log(`[BQ_VERIFY] Checking TrafficJunky row count...`);
        const verify = targetCountSQL(BQ_PROJECT_ID, BQ_DATASET, tjTableId, start_date, end_date);
        const cntRows = await bqQuery(bqToken, env, verify.sql, logs, /*returnRows*/true);
        console.log(`[BQ_VERIFY] TrafficJunky rows in range [${start_date}..${end_date}] = ${cntRows?.[0]?.rows_in_range ?? 'n/a'}`);
        logs.push(`TrafficJunky: rows in range [${start_date}..${end_date}] = ${cntRows?.[0]?.rows_in_range ?? 'n/a'}`);
      }

      // === Best-effort cleanup ===
      console.log(`[BQ_CLEANUP] Starting cleanup of stage tables...`);
      if (wantExo) await bqDropTable(bqToken, env, exoStageId).catch(() => {});
      if (wantTj)  await bqDropTable(bqToken, env, tjStageId).catch(() => {});
      const sweeperSql = stageSweeperSQL(BQ_PROJECT_ID, BQ_DATASET);
      await bqQuery(bqToken, env, sweeperSql, logs).catch(() => { logs.push("Sweeper skipped/failed (non-fatal)"); });
      console.log(`[BQ_CLEANUP] Cleanup completed`);

      const sum = [];
      if (wantExo) sum.push(`ExoClick: staged ${exoObjects.length} row(s), merged OK.`);
      if (wantTj)  sum.push(`TrafficJunky: staged ${tjObjects.length} row(s), merged OK.`);

      console.log(`[SUCCESS] BigQuery processing completed: ${sum.join(' ')}`);
      return new Response(`✅ Success (BigQuery): ${sum.join(' ')}\n\nLogs:\n- ${logs.join('\n- ')}`);
    } catch (err) {
      console.error(`[ERROR] Unhandled error:`, err);
      console.error(`[ERROR] Stack trace:`, err?.stack);
      return new Response(`❌ Unhandled Error:\n${err?.stack || err?.message || String(err)}`, { status: 500 });
    }
  },

  // ---------- Cron Handler ----------
  async scheduled(event, env, ctx) {
    console.log(`[CRON] Scheduled event triggered at ${new Date().toISOString()}`);
    console.log(`[CRON] Event type: ${event.type}, scheduled time: ${event.scheduledTime}`);
    try {
      const { FROM, TO } = last4WindowUTC();
      console.log(`[CRON] Date window: FROM=${FROM}, TO=${TO}`);

      const base = new URL("https://worker-cron/trigger");
      base.searchParams.set("start_date", FROM);
      base.searchParams.set("end_date", TO);
      base.searchParams.set("channel", "exo");

      console.log(`[CRON] Internal request URL: ${base.toString()}`);

      const req = new Request(base.toString(), {
        method: "GET",
        headers: { "cf-worker-cron": "true" } // bypass any IP restrictions
      });

      console.log(`[CRON] Calling internal fetch...`);
      const response = await this.fetch(req, env, ctx);
      console.log(`[CRON] Internal fetch completed with status: ${response.status}`);
      const responseText = await response.text();
      console.log(`[CRON] Response: ${responseText.substring(0, 500)}${responseText.length > 500 ? '...' : ''}`);

      return new Response(`Cron job completed. Status: ${response.status}\n\n${responseText}`, {
        status: response.status,
        headers: response.headers
      });

    } catch (error) {
      console.error(`[CRON] Error in scheduled function:`, error);
      console.error(`[CRON] Stack trace:`, error?.stack);
      return new Response(`Cron job failed: ${error.message}`, { status: 500 });
    }
  }
};

// Simple in-memory cache for ExoClick auth and lookups (per worker instance)
const exoCache = {
  token: { value: null, expMs: 0 },
  campaignMap: { value: null, expMs: 0 },
  goalMap: { value: null, expMs: 0 },
  variationMapByCampaign: { value: null, expMs: 0 }
};
function cacheGet(nowMs, entry) {
  return entry && nowMs < entry.expMs ? entry.value : null;
}
function cacheSet(entry, value, ttlMs) {
  entry.value = value;
  entry.expMs = Date.now() + ttlMs;
  return value;
}

/** ===================== EXOCLICK ===================== **/
async function exoLogin(exoApiToken, exoStaticToken) {
  console.log(`[EXO_LOGIN] Attempting to login to ExoClick API...`);
  const loginRes = await fetch("https://api.exoclick.com/v2/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${exoStaticToken}`
    },
    body: JSON.stringify({ api_token: exoApiToken })
  });
  console.log(`[EXO_LOGIN] Login response status: ${loginRes.status}`);
  const loginData = await loginRes.json();
  if (!loginData?.token) {
    console.error(`[EXO_LOGIN] Auth failed:`, loginData);
    throw new Error(`ExoClick auth failed: ${JSON.stringify(loginData)}`);
  }
  console.log(`[EXO_LOGIN] Login successful`);
  return loginData.token;
}
async function exoGetSessionToken(exoApiToken, exoStaticToken) {
  const now = Date.now();
  const cached = cacheGet(now, exoCache.token);
  if (cached) return cached;
  const token = await exoLogin(exoApiToken, exoStaticToken);
  // Tokens are valid for 1 hour; cache slightly less to be safe
  return cacheSet(exoCache.token, token, 50 * 60 * 1000);
}
async function exoGetCampaignMap(sessionToken) {
  console.log(`[EXO_CAMPAIGNS] Fetching campaign map from ExoClick...`);
  const url = "https://api.exoclick.com/v2/campaigns?limit=2500&campaign_deleted=true&output_fields=name";
  const res = await fetch(url, { headers: { Authorization: `Bearer ${sessionToken}`, Accept: "application/json" } });
  console.log(`[EXO_CAMPAIGNS] Campaigns response status: ${res.status}`);
  const data = await res.json();
  if (!data?.result) {
    console.error(`[EXO_CAMPAIGNS] Campaigns fetch failed:`, data);
    throw new Error(`ExoClick campaigns failed: ${JSON.stringify(data)}`);
  }
  const map = {};
  for (const [id, c] of Object.entries(data.result)) map[String(id)] = c.name;
  console.log(`[EXO_CAMPAIGNS] Loaded ${Object.keys(map).length} campaigns`);
  return map;
}
async function exoGetCampaignMapCached(sessionToken) {
  const now = Date.now();
  const cached = cacheGet(now, exoCache.campaignMap);
  if (cached) return cached;
  const map = await exoGetCampaignMap(sessionToken);
  return cacheSet(exoCache.campaignMap, map, 10 * 60 * 1000);
}
async function exoPostGlobalStats(sessionToken, body) {
  const url = 'https://api.exoclick.com/v2/statistics/a/global';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${sessionToken}`
    },
    body: JSON.stringify(body)
  });
  let json = null;
  try { json = await res.json(); } catch {}
  if (!res.ok) {
    throw new Error(`Exo global stats failed ${res.status}: ${JSON.stringify(json)}`);
  }
  return json;
}
async function exoGetGoalMap(sessionToken) {
  console.log(`[EXO_GOALS] Fetching goal map from ExoClick...`);
  const url = "https://api.exoclick.com/v2/goals?limit=5000";
  const res = await fetch(url, { headers: { Authorization: `Bearer ${sessionToken}`, Accept: "application/json" } });
  console.log(`[EXO_GOALS] Goals response status: ${res.status}`);
  const data = await res.json();
  if (!data?.result) {
    console.error(`[EXO_GOALS] Goals fetch failed:`, data);
    throw new Error(`ExoClick goals failed: ${JSON.stringify(data)}`);
  }
  const map = {};
  for (const g of data.result) {
    if (g && g.id) map[String(g.id)] = g.name || String(g.id);
  }
  console.log(`[EXO_GOALS] Loaded ${Object.keys(map).length} goals`);
  return map;
}
async function exoGetGoalMapCached(sessionToken) {
  const now = Date.now();
  const cached = cacheGet(now, exoCache.goalMap);
  if (cached) return cached;
  const map = await exoGetGoalMap(sessionToken);
  return cacheSet(exoCache.goalMap, map, 10 * 60 * 1000);
}
async function exoGetVariationMapForCampaign(sessionToken, campaignId) {
  const url = `https://api.exoclick.com/v2/campaigns/${encodeURIComponent(campaignId)}/variation?include_deleted=true`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${sessionToken}`, Accept: "application/json" } });
  let json = null;
  try { json = await res.json(); } catch {}
  if (!res.ok) throw new Error(`Exo variations failed for ${campaignId}: ${JSON.stringify(json)}`);
  const out = {};
  const list = json?.variations || [];
  for (const v of list) {
    if (v && v.idvariation != null) out[String(v.idvariation)] = { name: (v.name || String(v.idvariation)), url: v.url || null };
  }
  return out;
}
async function exoGetVariationMapForCampaignsCached(sessionToken, campaignIds) {
  const now = Date.now();
  let cache = cacheGet(now, exoCache.variationMapByCampaign);
  if (!cache) cache = cacheSet(exoCache.variationMapByCampaign, {}, 10 * 60 * 1000);
  for (const cid of campaignIds) {
    if (!cache[cid]) {
      try {
        cache[cid] = await exoGetVariationMapForCampaign(sessionToken, cid);
      } catch (e) {
        console.log(`[EXO_VARIATIONS] Failed for campaign ${cid}: ${e.message}`);
        cache[cid] = {};
      }
    }
  }
  return cache;
}

/** ===================== TRAFFICJUNKY (DAY-BY-DAY) ===================== **/
const TJ_BASE = 'https://api.trafficjunky.com';

async function tjFetchJson(tjApiKey, pathAndQuery) {
  console.log(`[TJ_API] Fetching: ${pathAndQuery}`);
  const res = await fetch(`${TJ_BASE}${pathAndQuery}`, {
    headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${tjApiKey}` }
  });
  console.log(`[TJ_API] Response status: ${res.status}`);
  let json = null;
  try { json = await res.json(); } catch {}
  if (!res.ok) {
    console.error(`[TJ_API] Request failed:`, json);
    throw new Error(`TJ HTTP ${res.status} on ${pathAndQuery}: ${JSON.stringify(json)}`);
  }
  console.log(`[TJ_API] Request successful`);
  return json;
}
function ymdToDmy(ymd) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) throw new Error(`Invalid date: ${ymd}`);
  return `${m[3]}/${m[2]}/${m[1]}`;
}
function toNumber(x, fallback = 0) {
  if (x === null || x === undefined) return fallback;
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
}
function normalizeGoalsBlock(goals) {
  // handles shapes: { total, ecpa, data: { goalUID: { volume, conversion_value? or coa? } } }
  const total = toNumber(goals?.total, 0);
  // Prefer explicit conversion_value if present within items; otherwise 0
  const breakdown = (goalMap) => {
    const out = [];
    const data = goals && goals.data && typeof goals.data === 'object' ? goals.data : {};
    for (const [gid, g] of Object.entries(data)) {
      const conversions = toNumber(g?.volume, 0);
      const convValue = Number(g?.conversion_value || g?.coa || 0);
      out.push({
        goal_id: String(gid),
        goal_name: goalMap[String(gid)] || String(gid),
        conversions,
        conversion_value: convValue
      });
    }
    return out;
  };
  // Aggregate conversion value from data if available
  let conversionValue = 0;
  if (goals && goals.data && typeof goals.data === 'object') {
    for (const g of Object.values(goals.data)) {
      conversionValue += Number(g?.conversion_value || g?.coa || 0);
    }
  }
  return { total, conversionValue, breakdown };
}
function parseYmd(ymd) {
  const [y,m,d] = ymd.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}
function formatYmd(dateObj) {
  const y = dateObj.getUTCFullYear();
  const m = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function* dayIterator(startYmd, endYmd) {
  let d = parseYmd(startYmd);
  const end = parseYmd(endYmd);
  while (d.getTime() <= end.getTime()) {
    yield formatYmd(d);
    d.setUTCDate(d.getUTCDate() + 1);
  }
}

/** ===================== GOOGLE AUTH (Generic) ===================== **/
async function googleAccessToken(env, scopes) {
  const clientEmail = env.GS_CLIENT_EMAIL;
  const privateKey  = env.GS_PRIVATE_KEY;
  if (!clientEmail || !privateKey) throw new Error("Missing GS_CLIENT_EMAIL / GS_PRIVATE_KEY");
  return googleJWTMintAndExchange({ clientEmail, privateKey, scopes });
}
async function googleJWTMintAndExchange({ clientEmail, privateKey, scopes }) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600;
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: clientEmail,
    scope: scopes.join(' '),
    aud: "https://oauth2.googleapis.com/token",
    iat,
    exp
  };
  const encodeSegment = (obj) => btoa(JSON.stringify(obj))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const jwtHeader = encodeSegment(header);
  const jwtClaim  = encodeSegment(claim);
  const toSign = `${jwtHeader}.${jwtClaim}`;

  const pem = privateKey.replace(/\\n/g, "\n").replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const keyBuf = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0)).buffer;
  const keyObj = await crypto.subtle.importKey(
    "pkcs8",
    keyBuf,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuf = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", keyObj, new TextEncoder().encode(toSign));
  const sig = btoa(String.fromCharCode(...new Uint8Array(sigBuf)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const jwt = `${toSign}.${sig}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });
  const json = await res.json();
  if (!json.access_token) throw new Error(`Failed to get Google access token: ${JSON.stringify(json)}`);
  return json.access_token;
}

/** ===================== BIGQUERY HELPERS ===================== **/
function randomId() {
  const s = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(s).map(x => x.toString(16).padStart(2, '0')).join('');
}
function bqHeaders(token) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}
async function bqApi(token, method, url, body) {
  const res = await fetch(url, {
    method,
    headers: bqHeaders(token),
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = text; }
  return { ok: res.ok, status: res.status, json, text };
}
async function bqGetTable(token, env, tableId) {
  const { BQ_PROJECT_ID, BQ_DATASET } = env;
  const url = `https://bigquery.googleapis.com/bigquery/v2/projects/${BQ_PROJECT_ID}/datasets/${BQ_DATASET}/tables/${tableId}`;
  const r = await fetch(url, { headers: { Authorization:`Bearer ${token}` }});
  if (r.status === 404) return { ok:false, status:404 };
  const json = await r.json().catch(()=>null);
  return { ok:r.ok, status:r.status, json };
}
async function bqCreateTable(token, env, tableId, schemaFields, partitionField, clusterFields, labels, expirationTimeMs) {
  const { BQ_PROJECT_ID, BQ_DATASET } = env;
  const url = `https://bigquery.googleapis.com/bigquery/v2/projects/${BQ_PROJECT_ID}/datasets/${BQ_DATASET}/tables`;
  const body = {
    tableReference: { projectId: BQ_PROJECT_ID, datasetId: BQ_DATASET, tableId },
    schema: { fields: schemaFields },
    timePartitioning: { type: "DAY", field: partitionField },
    clustering: clusterFields && clusterFields.length ? { fields: clusterFields } : undefined,
    labels: labels || undefined,
    expirationTime: expirationTimeMs ? String(expirationTimeMs) : undefined
  };
  const res = await bqApi(token, "POST", url, body);
  if (!res.ok) throw new Error(`bqCreateTable ${tableId} failed: ${res.text || res.json}`);
  return true;
}
async function ensureBQTable(token, env, tableId, schemaFields, partitionField, clusterFields) {
  const exists = await bqGetTable(token, env, tableId);
  if (exists.status === 404) {
    await bqCreateTable(token, env, tableId, schemaFields, partitionField, clusterFields, /*labels*/{permanent:"true"}, /*expiration*/null);
  }
}
async function bqSetNoExpiry(token, env, tableId, logs) {
  const { BQ_PROJECT_ID, BQ_DATASET } = env;
  await bqQuery(token, env,
    `ALTER TABLE \`${BQ_PROJECT_ID}.${BQ_DATASET}.${tableId}\`
     SET OPTIONS (partition_expiration_days = NULL)`,
    logs
  );
  await bqQuery(token, env,
    `ALTER TABLE \`${BQ_PROJECT_ID}.${BQ_DATASET}.${tableId}\`
     SET OPTIONS (expiration_timestamp = NULL)`,
    logs
  );
}
async function bqCreateStageTable(token, env, stageId, schemaFields, partitionField, clusterFields, ttlMinutes) {
  const expirationTimeMs = Date.now() + (ttlMinutes * 60 * 1000);
  await bqCreateTable(token, env, stageId, schemaFields, partitionField, clusterFields, { temp_stage: "true" }, expirationTimeMs);
}
async function bqDropTable(token, env, tableId) {
  const { BQ_PROJECT_ID, BQ_DATASET } = env;
  const url = `https://bigquery.googleapis.com/bigquery/v2/projects/${BQ_PROJECT_ID}/datasets/${BQ_DATASET}/tables/${tableId}`;
  const res = await fetch(url, { method: "DELETE", headers: { Authorization:`Bearer ${token}` }});
  return res.ok || res.status === 404;
}
async function bqJobInsert(token, env, body) {
  const { BQ_PROJECT_ID, BQ_LOCATION } = env;
  // ENSURE jobReference.location is set so polling with the same location works.
  const withRef = {
    jobReference: {
      projectId: BQ_PROJECT_ID,
      location: BQ_LOCATION || "US",
      // jobId optional; BigQuery will assign one.
    },
    ...body
  };
  const url = `https://bigquery.googleapis.com/bigquery/v2/projects/${BQ_PROJECT_ID}/jobs`;
  const res = await bqApi(token, "POST", url, withRef);
  if (!res.ok) throw new Error(`bqJobInsert failed: ${res.text || res.json}`);
  return res.json;
}
async function bqJobGet(token, env, jobId, location) {
  const { BQ_PROJECT_ID } = env;
  const url = `https://bigquery.googleapis.com/bigquery/v2/projects/${BQ_PROJECT_ID}/jobs/${jobId}?location=${encodeURIComponent(location)}`;
  const r = await fetch(url, { headers: { Authorization:`Bearer ${token}` }});
  const json = await r.json().catch(()=>null);
  return { ok: r.ok, status: r.status, json };
}
async function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }
async function bqPollJob(token, env, jobId, location, timeoutMs = 120000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const j = await bqJobGet(token, env, jobId, location);
    if (!j.ok) throw new Error(`bqPollJob: ${j.status} ${JSON.stringify(j.json)}`);
    const state = j.json?.status?.state;
    if (state === "DONE") {
      const errs = j.json?.status?.errors || j.json?.status?.errorResult;
      if (errs) throw new Error(`BigQuery job error: ${JSON.stringify(errs)}`);
      return j.json;
    }
    await sleep(1500);
  }
  throw new Error("BigQuery job polling timed out");
}
async function bqQuery(token, env, sql, logs, returnRows = false) {
  console.log(`[BQ_QUERY] Starting query execution...`);
  console.log(`[BQ_QUERY] SQL preview: ${sql.split('\n').join(' ').slice(0, 200)}...`);

  const location = env.BQ_LOCATION || "US";
  console.log(`[BQ_QUERY] Using location: ${location}`);

  try {
    const job = await bqJobInsert(token, env, {
      configuration: {
        query: {
          query: sql,
          useLegacySql: false
        }
      }
    });
    const jobId = job?.jobReference?.jobId;
    console.log(`[BQ_QUERY] Job created with ID: ${jobId}`);

    await bqPollJob(token, env, jobId, location);
    console.log(`[BQ_QUERY] Job completed successfully`);

    if (returnRows) {
      console.log(`[BQ_QUERY] Fetching query results...`);
      const res = await fetch(
        `https://bigquery.googleapis.com/bigquery/v2/projects/${env.BQ_PROJECT_ID}/queries/${jobId}?location=${encodeURIComponent(location)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const json = await res.json();
      const fields = json?.schema?.fields || [];
      const rows = (json?.rows || []).map(r => {
        const obj = {};
        fields.forEach((f, i) => {
          const v = r.f[i]?.v;
          const t = (f.type || "").toUpperCase();
          if (t === 'INTEGER' || t === 'INT64') obj[f.name] = v !== null ? Number(v) : null;
          else if (t === 'FLOAT' || t === 'FLOAT64' || t === 'NUMERIC' || t === 'BIGNUMERIC') obj[f.name] = v !== null ? Number(v) : null;
          else obj[f.name] = v;
        });
        return obj;
      });
      console.log(`[BQ_QUERY] Returning ${rows.length} rows`);
      return rows;
    }
    logs && logs.push(`Query OK: ${sql.split('\n').join(' ').slice(0,140)}...`);
    return true;
  } catch (error) {
    console.error(`[BQ_QUERY] Query failed:`, error);
    throw error;
  }
}

// Load NDJSON to a table via multipart/related upload job
async function bqLoadJson(token, env, tableId, objects, schemaFields, logs) {
  if (!objects || !objects.length) {
    console.log(`[BQ_LOAD] No objects to load into ${tableId}`);
    return 0;
  }

  console.log(`[BQ_LOAD] Loading ${objects.length} objects into ${tableId}...`);
  const ndjson = objects.map(o => JSON.stringify(o)).join('\n');

  // Include jobReference.location so we can poll with the same location.
  const meta = {
    jobReference: {
      projectId: env.BQ_PROJECT_ID,
      location: env.BQ_LOCATION || "US"
    },
    configuration: {
      load: {
        destinationTable: {
          projectId: env.BQ_PROJECT_ID,
          datasetId: env.BQ_DATASET,
          tableId
        },
        schema: { fields: schemaFields },
        sourceFormat: "NEWLINE_DELIMITED_JSON",
        writeDisposition: "WRITE_APPEND",
        ignoreUnknownValues: false
      }
    }
  };

  const boundary = `===============${randomId()}==`;
  const encoder = new TextEncoder();

  // Part 1: JSON metadata
  const metaPart =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(meta)}\r\n`;

  // Part 2: file header + NDJSON body
  const fileHeader =
    `--${boundary}\r\n` +
    `Content-Type: application/octet-stream\r\n\r\n`;

  // Closing boundary
  const endPart = `\r\n--${boundary}--\r\n`;

  const body = concatUint8Arrays([
    encoder.encode(metaPart),
    encoder.encode(fileHeader),
    encoder.encode(ndjson),
    encoder.encode(endPart),
  ]);

  console.log(`[BQ_LOAD] Uploading to BigQuery...`);
  const url = `https://www.googleapis.com/upload/bigquery/v2/projects/${env.BQ_PROJECT_ID}/jobs?uploadType=multipart`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": `multipart/related; boundary=${boundary}` },
    body
  });

  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { json = text; }
  if (!res.ok) {
    console.error(`[BQ_LOAD] Upload failed:`, json);
    throw new Error(`bqLoadJson failed: ${JSON.stringify(json)}`);
  }

  const jobId = json?.jobReference?.jobId;
  console.log(`[BQ_LOAD] Upload job created with ID: ${jobId}`);
  await bqPollJob(token, env, jobId, env.BQ_LOCATION || "US", 180000);
  console.log(`[BQ_LOAD] Load completed successfully into ${tableId}`);
  logs && logs.push(`Load OK into ${tableId}: ${objects.length} row(s)`);
  return objects.length;
}

function concatUint8Arrays(chunks) {
  let total = 0;
  for (const c of chunks) total += c.byteLength;
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) { out.set(c, off); off += c.byteLength; }
  return out;
}

// MERGE builder (retrieved_at last-wins) - NULL-safe ON clause
function mergeSQL({ project, dataset, table, stage, keyFields, nonKeyFields }) {
  const backtick = (c) => `\`${c}\``;
  const T = (c) => `T.${backtick(c)}`;
  const S = (c) => `S.${backtick(c)}`;

  // NULL-safe equality for ON clause
  const nullSafeEq = (col) => `( (${T(col)} IS NULL AND ${S(col)} IS NULL) OR ${T(col)} = ${S(col)} )`;
  const on = keyFields.map(k => nullSafeEq(k)).join(' AND ');

  const updates = nonKeyFields.map(c => `${T(c)} = ${S(c)}`).join(', ');
  const allCols = [...keyFields, ...nonKeyFields];
  const insertCols = allCols.map(backtick).join(', ');
  const insertVals = allCols.map(c => `${S(c)}`).join(', ');
  const keyPartition = keyFields.map(backtick).join(', ');

  // Dedup the stage: keep only the latest retrieved_at per key
  const dedupSource = `
    SELECT * EXCEPT(rn) FROM (
      SELECT *,
             ROW_NUMBER() OVER (
               PARTITION BY ${keyPartition}
               ORDER BY retrieved_at DESC
             ) AS rn
      FROM \`${project}.${dataset}.${stage}\`
    )
    WHERE rn = 1
  `;

  return `
    MERGE \`${project}.${dataset}.${table}\` AS T
    USING (${dedupSource}) AS S
    ON ${on}
    WHEN MATCHED AND ${S('retrieved_at')} > ${T('retrieved_at')} THEN
      UPDATE SET ${updates}
    WHEN NOT MATCHED THEN
      INSERT (${insertCols}) VALUES (${insertVals})
  `;
}
function targetCountSQL(project, dataset, table, from, to) {
  return {
    sql: `
      SELECT COUNT(*) AS rows_in_range
      FROM \`${project}.${dataset}.${table}\`
      WHERE \`date\` >= DATE '${from}' AND \`date\` <= DATE '${to}'
    `
  };
}
function stageSweeperSQL(project, dataset) {
  return `
    BEGIN
      DECLARE stmt STRING;
      FOR r IN (
        SELECT table_name
        FROM \`${project}.${dataset}\`.INFORMATION_SCHEMA.TABLES
        WHERE table_name LIKE '%_stage_%'
          AND creation_time < TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 2 HOUR)
      )
      DO
        SET stmt = FORMAT('DROP TABLE \`${project}.${dataset}.%s\`', r.table_name);
        EXECUTE IMMEDIATE stmt;
      END FOR;
    END
  `;
}