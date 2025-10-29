/**
 * Version: 1.0.0
 * POP Cloudflare Reporting – TrafficJunky → BigQuery (TJ-only)
 * ----------------------------------------------------------------
 * This worker handles ONLY the `tj` channel logic split from cf-pops-230925.js
 * Backfill queue and scheduled rolling window are preserved here.
 *
 * Env Vars: TJ_API_KEY, GS_CLIENT_EMAIL, GS_PRIVATE_KEY, BQ_PROJECT_ID, BQ_DATASET,
 *           BQ_LOCATION (default US), BQ_STAGE_TTL_MIN (default 120), ROLLING_WINDOW_DAYS (default 4)
 * KV Binding: TJ_RETRY_KV (for retries and backfill queue)
 */

function lastNDaysWindowUTC(nDays) {
  const n = Math.max(1, Number(nDays||4));
  const todayUTC = new Date(Date.UTC(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate()
  ));
  const to = new Date(todayUTC.getTime() - 1*24*3600*1000);
  const from = new Date(to.getTime() - (n-1)*24*3600*1000);
  return { FROM: formatYmd(from), TO: formatYmd(to) };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    const allowedIps = ["2a06:98c0:3600::103", "195.158.92.167"];
    const cfHeader = request.headers.get("cf-connecting-ip");
    const isCron = request.headers.get("cf-worker-cron") === "true";
    if (!isCron && allowedIps.length && !allowedIps.includes(cfHeader||"")) {
      return new Response("Forbidden", { status: 403 });
    }

    const TJ_API_KEY      = env.TJ_API_KEY;

    const BQ_PROJECT_ID   = env.BQ_PROJECT_ID;
    const BQ_DATASET      = env.BQ_DATASET;
    const BQ_LOCATION     = env.BQ_LOCATION || 'US';
    const BQ_STAGE_TTL_MIN= Number(env.BQ_STAGE_TTL_MIN || 120);

    const start_date = url.searchParams.get("start_date");
    const end_date   = url.searchParams.get("end_date");
    const schema_migrate = (url.searchParams.get("schema_migrate") || "false").toLowerCase() === "true";
    const retry_only = (url.searchParams.get("retry_only") || "false").toLowerCase() === "true";
    const backfill = (url.searchParams.get("backfill") || "false").toLowerCase() === "true";
    const drain_next = (url.searchParams.get("drain_next") || "false").toLowerCase() === "true";
    const chunk_days = Math.max(1, Number(url.searchParams.get("chunk_days") || 2));
    const run = (url.searchParams.get("run") || "campaign").toLowerCase(); // campaign | ads | both
    const runCampaign = run === "campaign" || run === "both";
    const runAds = run === "ads" || run === "both";

    console.log(`[REQUEST] TJ Worker Method: ${request.method}, URL: ${request.url}`);
    console.log(`[REQUEST] Headers: cf-connecting-ip=${cfHeader}, cf-worker-cron=${isCron}`);
    console.log(`[REQUEST] Params: start_date=${start_date}, end_date=${end_date}`);

    try {
      // On-demand drain of backfill queue
      if (drain_next && (!start_date || !end_date)) {
        const kv = env.TJ_RETRY_KV;
        if (!kv || typeof kv.get !== 'function') {
          return new Response("Drain requires TJ_RETRY_KV binding", { status: 400 });
        }
        const queueKey = 'tj:backfill:queue';
        let queue = await kvGetJson(kv, queueKey) || [];
        if (!queue.length) return new Response("No backfill chunks queued.", { status: 204 });
        const next = queue.shift();
        await kvPutJson(kv, queueKey, queue, 7 * 24 * 3600);
        const self = new URL(request.url);
        self.searchParams.set('start_date', next.start_date);
        self.searchParams.set('end_date', next.end_date);
        if (next.run) self.searchParams.set('run', String(next.run));
        const req2 = new Request(self.toString(), { method: 'GET', headers: { 'cf-worker-cron': 'true' } });
        const r = await this.fetch(req2, env, ctx);
        const text = await r.text();
        return new Response(`Drained 1 backfill chunk: ${next.start_date}..${next.end_date} → status ${r.status}\n${text.slice(0,400)}${text.length>400?'...':''}`, { status: 200 });
      }

      if (!start_date || !end_date) {
        return new Response("Missing required parameters: start_date and end_date", { status: 400 });
      }

      console.log(`[DESTINATION] Using BigQuery destination (TJ-only worker)`);
      console.log(`[BQ_CONFIG] Project: ${BQ_PROJECT_ID}, Dataset: ${BQ_DATASET}, Location: ${BQ_LOCATION}`);
      if (!BQ_PROJECT_ID || !BQ_DATASET) {
        return new Response("Missing BigQuery env vars: BQ_PROJECT_ID and/or BQ_DATASET", { status: 400 });
      }

      const bqToken = await googleAccessToken(env, ["https://www.googleapis.com/auth/bigquery"]);
      const logs = [];

      // Separate tables per breakdown level. Start with campaign-level daily table.
      const campaignTableId  = "tj_campaign_stats";
      const CAMPAIGN_SCHEMA = [
        {name:"date", type:"DATE", mode:"REQUIRED"},
        {name:"campaign_id", type:"STRING", mode:"REQUIRED"},
        {name:"campaign_name", type:"STRING", mode:"NULLABLE"},
        {name:"impressions", type:"INT64", mode:"NULLABLE"},
        {name:"clicks", type:"INT64", mode:"NULLABLE"},
        {name:"conversions", type:"INT64", mode:"NULLABLE"},
        {name:"revenue", type:"FLOAT64", mode:"NULLABLE"},
        {name:"cost", type:"FLOAT64", mode:"NULLABLE"},
        {name:"retrieved_at", type:"TIMESTAMP", mode:"REQUIRED"},
      ];

      // Ad-level table (breakdown by ad and spot, daily)
      const adTableId = "tj_ad_stats";
      const AD_SCHEMA = [
        {name:"date", type:"DATE", mode:"REQUIRED"},
        {name:"campaign_id", type:"STRING", mode:"REQUIRED"},
        {name:"campaign_name", type:"STRING", mode:"NULLABLE"},
        {name:"ad_id", type:"STRING", mode:"NULLABLE"},
        {name:"ad_name", type:"STRING", mode:"NULLABLE"},
        {name:"target_url", type:"STRING", mode:"NULLABLE"},
        {name:"spot_id", type:"STRING", mode:"NULLABLE"},
        {name:"spot_name", type:"STRING", mode:"NULLABLE"},
        {name:"impressions", type:"INT64", mode:"NULLABLE"},
        {name:"clicks", type:"INT64", mode:"NULLABLE"},
        {name:"conversions", type:"INT64", mode:"NULLABLE"},
        {name:"revenue", type:"FLOAT64", mode:"NULLABLE"},
        {name:"cost", type:"FLOAT64", mode:"NULLABLE"},
        {name:"retrieved_at", type:"TIMESTAMP", mode:"REQUIRED"},
      ];

      // Ensure tables only for the selected run
      if (runCampaign) {
        console.log(`[BQ_TABLE] Ensuring TJ campaign-level table exists: ${campaignTableId}`);
        await ensureBQTable(bqToken, env, campaignTableId, CAMPAIGN_SCHEMA, "date", ["campaign_id"]);
        if (schema_migrate) await bqSetNoExpiry(bqToken, env, campaignTableId, logs).catch(()=>{});
        console.log(`[BQ_TABLE] TJ campaign-level table ready`);
      }
      if (runAds) {
        console.log(`[BQ_TABLE] Ensuring TJ ad-level table exists: ${adTableId}`);
        await ensureBQTable(bqToken, env, adTableId, AD_SCHEMA, "date", ["campaign_id","ad_id","spot_id"]);
        if (schema_migrate) {
          await bqQuery(bqToken, env,
            `ALTER TABLE \`${BQ_PROJECT_ID}.${BQ_DATASET}.${adTableId}\`
               ADD COLUMN IF NOT EXISTS ad_name STRING,
               ADD COLUMN IF NOT EXISTS target_url STRING,
               ADD COLUMN IF NOT EXISTS spot_name STRING,
               ADD COLUMN IF NOT EXISTS revenue FLOAT64`, logs
          ).catch(()=>{});
          await bqSetNoExpiry(bqToken, env, adTableId, logs).catch(()=>{});
        }
        console.log(`[BQ_TABLE] TJ ad-level table ready`);
      }

      if (backfill) {
        const kv = env.TJ_RETRY_KV;
        if (!kv || typeof kv.put !== 'function') {
          return new Response("Backfill requires TJ_RETRY_KV binding", { status: 400 });
        }
        const chunks = buildChunks(start_date, end_date, chunk_days).map(({ from, to }) => ({ start_date: from, end_date: to, channel: 'tj', run }));
        const queueKey = 'tj:backfill:queue';
        let queue = await kvGetJson(kv, queueKey) || [];
        queue = queue.concat(chunks);
        await kvPutJson(kv, queueKey, queue, 7 * 24 * 3600);
        const metaKey = 'tj:backfill:meta';
        try {
          const prev = await kvGetJson(kv, metaKey) || {};
          const meta = {
            original_start_date: prev.original_start_date ? String(prev.original_start_date) : start_date,
            original_end_date: prev.original_end_date ? String(prev.original_end_date) : end_date,
            channel: 'tj',
            chunk_days,
            total_enqueued: Number(prev.total_enqueued || 0) + chunks.length,
            drained_count: Number(prev.drained_count || 0),
            remaining: queue.length,
            last_enqueued_range: { start_date, end_date },
            last_enqueued_at: new Date().toISOString()
          };
          if (prev.original_start_date && start_date < prev.original_start_date) meta.original_start_date = start_date;
          if (prev.original_end_date && end_date > prev.original_end_date) meta.original_end_date = end_date;
          await kvPutJson(kv, metaKey, meta, 7 * 24 * 3600).catch(()=>{});
        } catch {}
        if (drain_next && queue.length) {
          const next = queue.shift();
          await kvPutJson(kv, queueKey, queue, 7 * 24 * 3600);
          try {
            const metaKey = 'tj:backfill:meta';
            const cur = await kvGetJson(kv, metaKey) || {};
            cur.drained_count = Number(cur.drained_count || 0) + 1;
            cur.remaining = queue.length;
            if (typeof cur.total_enqueued === 'number') {
              cur.computed_remaining = Math.max(0, Number(cur.total_enqueued) - Number(cur.drained_count));
            }
            cur.last_drained = { start_date: next.start_date, end_date: next.end_date };
            cur.last_drained_at = new Date().toISOString();
            await kvPutJson(kv, metaKey, cur, 7 * 24 * 3600);
          } catch {}
          const self = new URL(request.url);
          self.searchParams.set('start_date', next.start_date);
          self.searchParams.set('end_date', next.end_date);
          if (next.run) self.searchParams.set('run', String(next.run));
          self.searchParams.delete('backfill');
          self.searchParams.delete('drain_next');
          const req2 = new Request(self.toString(), { method: 'GET', headers: { 'cf-worker-cron': 'true' } });
          const r = await this.fetch(req2, env, ctx);
          const text = await r.text();
          return new Response(`Backfill enqueued. Drained 1: ${next.start_date}..${next.end_date} → status ${r.status}\n${text.slice(0,400)}${text.length>400?'...':''}`, { status: 200 });
        }
        return new Response(`Backfill enqueued: ${chunks.length} chunk(s).`, { status: 200 });
      }

      const retrievedAt = new Date().toISOString();
      const stageSuffix = randomId();
      let campaignObjects = [];

      // Daily, paginated collection from bids/stats.json
      if (runCampaign) {
        console.log(`[TRAFFICJUNKY] Collecting daily campaign stats via bids/stats.json for ${start_date}..${end_date}`);
        logs.push(`[TrafficJunky] Collecting daily campaign stats via bids/stats.json for ${start_date}..${end_date}`);
      }
      for (const ymd of (runCampaign ? dayIterator(start_date, end_date) : [])) {
        const dmy = ymdToDmy(ymd);
        try {
          const items = await tjFetchBidsStatsAll(TJ_API_KEY, dmy, dmy);
          console.log(`[TRAFFICJUNKY] ${ymd}: fetched ${items.length} campaigns`);
          for (const c of items) {
            const cid = String(c?.campaignId ?? c?.id ?? '');
            if (!cid) continue;
            const revenueVal = Number((c?.revenue ?? c?.cost) || 0);
            campaignObjects.push({
              date: ymd,
              campaign_id: cid,
              campaign_name: c?.campaignName || c?.campaign_name || null,
              impressions: toNumber(c?.impressions),
              clicks: toNumber(c?.clicks),
              conversions: toNumber(c?.conversions),
              revenue: revenueVal,
              cost: revenueVal,
              retrieved_at: retrievedAt,
            });
          }
        } catch (e) {
          console.log(`[TRAFFICJUNKY] ${ymd}: fetch failed ${e.message}`);
        }
      }
      // Deduplicate by (date,campaign_id) for campaign table
      const seen = new Set();
      const deduped = [];
      for (const r of campaignObjects) {
        const k = `${r.date}|${r.campaign_id}`;
        if (seen.has(k)) continue;
        seen.add(k);
        deduped.push(r);
      }
      campaignObjects = deduped;
      const sample = campaignObjects.slice(0,5);
      if (runCampaign) logs.push(`[TrafficJunky] Sample campaign rows (deduped): ${JSON.stringify(sample)}`);

      let campStageId = null;
      if (runCampaign) {
        campStageId  = `tj_campaign_stats_stage_${stageSuffix}`;
        console.log(`[BQ_STAGE] Creating TJ campaign stage table: ${campStageId}`);
        await bqCreateStageTable(bqToken, env, campStageId,  CAMPAIGN_SCHEMA,  "date", ["campaign_id"], BQ_STAGE_TTL_MIN);
        console.log(`[BQ_STAGE] Loading ${campaignObjects.length} campaign rows to stage table...`);
        const outRows = await bqLoadJson(bqToken, env, campStageId, campaignObjects, CAMPAIGN_SCHEMA, logs);
        console.log(`[BQ_STAGE] Campaign: staged ${outRows} row(s) successfully`);
        logs.push(`Campaign: staged ${outRows} row(s)`);
      }

      if (runCampaign && campaignObjects.length) {
        console.log(`[BQ_MERGE] Starting Campaign merge: ${campaignObjects.length} rows -> ${campaignTableId}`);
        logs.push(`[MERGE] Starting Campaign merge: ${campaignObjects.length} rows -> ${campaignTableId}`);
        const sql = mergeSQL({
          project: BQ_PROJECT_ID, dataset: BQ_DATASET,
          table: campaignTableId, stage: campStageId,
          keyFields: ["date","campaign_id"],
          nonKeyFields: ["campaign_name","impressions","clicks","conversions","revenue","cost","retrieved_at"],
        });
        console.log(`[BQ_MERGE] Campaign SQL: ${sql.substring(0, 200)}...`);
        await bqQuery(bqToken, env, sql, logs);
        console.log(`[BQ_MERGE] Campaign merge completed successfully`);
        logs.push("Campaign: merge completed");

        console.log(`[BQ_VERIFY] Checking campaign row count...`);
        const verify = targetCountSQL(BQ_PROJECT_ID, BQ_DATASET, campaignTableId, start_date, end_date);
        const cntRows = await bqQuery(bqToken, env, verify.sql, logs, true);
        console.log(`[BQ_VERIFY] Campaign rows in range [${start_date}..${end_date}] = ${cntRows?.[0]?.rows_in_range ?? 'n/a'}`);
        logs.push(`Campaign: rows in range [${start_date}..${end_date}] = ${cntRows?.[0]?.rows_in_range ?? 'n/a'}`);

        // Best-effort de-duplication in target table keeping latest retrieved_at per (date,campaign_id)
        try {
          const dedupSql = `
            CREATE OR REPLACE TABLE \`${BQ_PROJECT_ID}.${BQ_DATASET}.${campaignTableId}\`
            PARTITION BY date
            CLUSTER BY campaign_id AS
            SELECT * EXCEPT(rn)
            FROM (
              SELECT t.*, ROW_NUMBER() OVER (
                PARTITION BY t.date, t.campaign_id
                ORDER BY t.retrieved_at DESC
              ) AS rn
              FROM \`${BQ_PROJECT_ID}.${BQ_DATASET}.${campaignTableId}\` t
            )
            WHERE rn = 1
          `;
          await bqQuery(bqToken, env, dedupSql, logs);
          logs.push("Campaign: target de-duplicated by (date,campaign_id)");
        } catch (e) {
          logs.push(`Campaign: dedup skipped/failed (${e?.message || e})`);
        }
      }

      // === Ad-level breakdown: read campaign_ids from campaign table, fetch per-ad stats, write to ad table ===
      const adObjects = [];
      try {
        if (runAds) console.log(`[AD_BREAKDOWN] Selecting campaigns from ${campaignTableId} for ${start_date}..${end_date}`);
        const selectSql = `
          SELECT CAST(date AS STRING) AS date, campaign_id, campaign_name
          FROM \`${BQ_PROJECT_ID}.${BQ_DATASET}.${campaignTableId}\`
          WHERE date >= DATE '${start_date}' AND date <= DATE '${end_date}'
        `;
        const camps = runAds ? await bqQuery(bqToken, env, selectSql, logs, true) : [];
        if (runAds) console.log(`[AD_BREAKDOWN] Loaded ${camps.length} campaign-day rows`);
        for (const row of (runAds ? camps : [])) {
          const ymd = String(row.date);
          const cid = String(row.campaign_id);
          const cname = row.campaign_name || null;
          const dmy = ymdToDmy(ymd);
          // ad metadata for enrichment
          const ads = await tjGetAdsForCampaignCached(TJ_API_KEY, cid).catch(()=>[]);
          const adIndex = {};
          for (const a of (ads || [])) adIndex[String(a?.ad_id)] = a;
          // ad stats per ad for the day
          let entries = [];
          try {
            const stats = await tjGetAdStatsForCampaignDay(TJ_API_KEY, cid, dmy, dmy);
            entries = stats && typeof stats === 'object' ? Object.entries(stats) : [];
          } catch (e) { entries = []; }
          if (entries.length === 0) {
            // emit one campaign-only row (null ad/spot) to cover no breakdown
            adObjects.push({
              date: ymd,
              campaign_id: cid,
              campaign_name: cname,
              ad_id: null,
              ad_name: null,
              target_url: null,
              spot_id: null,
              spot_name: null,
              impressions: null,
              clicks: null,
              conversions: null,
              revenue: null,
              cost: null,
              retrieved_at: retrievedAt,
            });
            continue;
          }
          for (const [adKey, s] of entries) {
            const meta = adIndex[adKey] || {};
            const rev = Number((s?.revenue ?? s?.cost) || 0);
            adObjects.push({
              date: ymd,
              campaign_id: cid,
              campaign_name: cname,
              ad_id: String(adKey),
              ad_name: meta?.ad_name || null,
              target_url: meta?.target_url || null,
              spot_id: meta?.spot_id != null ? String(meta.spot_id) : null,
              spot_name: meta?.spot_name || null,
              impressions: toNumber(s?.impressions),
              clicks: toNumber(s?.clicks),
              conversions: toNumber(s?.conversions),
              revenue: rev,
              cost: rev,
              retrieved_at: retrievedAt,
            });
          }
        }
      } catch (e) {
        console.log(`[AD_BREAKDOWN] Failed: ${e?.message || e}`);
      }

      // Dedup ad rows by (date,campaign_id,ad_id,spot_id)
      if (runAds && adObjects.length) {
        const seenAd = new Set();
        const dedupAd = [];
        for (const r of adObjects) {
          const k = `${r.date}|${r.campaign_id}|${r.ad_id||''}|${r.spot_id||''}`;
          if (seenAd.has(k)) continue;
          seenAd.add(k);
          dedupAd.push(r);
        }
        console.log(`[AD_BREAKDOWN] Rows before/after dedup: ${adObjects.length}/${dedupAd.length}`);
        // Stage and merge to ad table
        const adStageId = `tj_ad_stats_stage_${stageSuffix}`;
        console.log(`[BQ_STAGE] Creating TJ ad stage table: ${adStageId}`);
        await bqCreateStageTable(bqToken, env, adStageId, AD_SCHEMA, "date", ["campaign_id","ad_id","spot_id"], BQ_STAGE_TTL_MIN);
        console.log(`[BQ_STAGE] Loading ${dedupAd.length} ad rows to stage table...`);
        const outAd = await bqLoadJson(bqToken, env, adStageId, dedupAd, AD_SCHEMA, logs);
        console.log(`[BQ_STAGE] Ads: staged ${outAd} row(s) successfully`);
        logs.push(`Ads: staged ${outAd} row(s)`);

        const adMergeSql = mergeSQL({
          project: BQ_PROJECT_ID, dataset: BQ_DATASET,
          table: adTableId, stage: adStageId,
          keyFields: ["date","campaign_id","ad_id","spot_id"],
          nonKeyFields: ["campaign_name","ad_name","target_url","spot_name","impressions","clicks","conversions","revenue","cost","retrieved_at"],
        });
        console.log(`[BQ_MERGE] Ad SQL: ${adMergeSql.substring(0, 200)}...`);
        await bqQuery(bqToken, env, adMergeSql, logs);
        console.log(`[BQ_MERGE] Ad merge completed successfully`);
        logs.push("Ads: merge completed");

        console.log(`[BQ_VERIFY] Checking ad rows count...`);
        const adVerify = targetCountSQL(BQ_PROJECT_ID, BQ_DATASET, adTableId, start_date, end_date);
        const adCnt = await bqQuery(bqToken, env, adVerify.sql, logs, true);
        console.log(`[BQ_VERIFY] Ads rows in range [${start_date}..${end_date}] = ${adCnt?.[0]?.rows_in_range ?? 'n/a'}`);
        logs.push(`Ads: rows in range [${start_date}..${end_date}] = ${adCnt?.[0]?.rows_in_range ?? 'n/a'}`);

        await bqDropTable(bqToken, env, adStageId).catch(() => {});
      }

      console.log(`[BQ_CLEANUP] Starting cleanup of stage tables...`);
      if (runCampaign && campStageId) await bqDropTable(bqToken, env, campStageId).catch(() => {});
      const sweeperSql = stageSweeperSQL(BQ_PROJECT_ID, BQ_DATASET);
      await bqQuery(bqToken, env, sweeperSql, logs).catch(() => { logs.push("Sweeper skipped/failed (non-fatal)"); });

      return new Response(`✅ Success (BigQuery): ${runCampaign?`Campaign: staged ${campaignObjects.length} row(s), merged OK.`:"(campaign skipped)"}\n\nLogs:\n- ${logs.join('\n- ')}`);
    } catch (err) {
      console.error(`[ERROR] TJ Worker Unhandled error:`, err);
      console.error(`[ERROR] Stack trace:`, err?.stack);
      return new Response(`❌ Unhandled Error (TJ):\n${err?.stack || err?.message || String(err)}`, { status: 500 });
    }
  },

  async scheduled(event, env, ctx) {
    console.log(`[CRON][TJ] Scheduled event triggered at ${new Date().toISOString()}`);
    console.log(`[CRON][TJ] Event type: ${event.type}, scheduled time: ${event.scheduledTime}`);
    try {
      const kv = env.TJ_RETRY_KV;
      if (kv && typeof kv.put === 'function') {
        const queueKey = 'tj:backfill:queue';
        let queue = await kvGetJson(kv, queueKey) || [];
        if (queue.length) {
          const next = queue.shift();
          await kvPutJson(kv, queueKey, queue, 7 * 24 * 3600);
          try {
            const metaKey = 'tj:backfill:meta';
            const cur = await kvGetJson(kv, metaKey) || {};
            cur.drained_count = Number(cur.drained_count || 0) + 1;
            cur.remaining = queue.length;
            cur.last_drained = { start_date: next.start_date, end_date: next.end_date };
            cur.last_drained_at = new Date().toISOString();
            await kvPutJson(kv, metaKey, cur, 7 * 24 * 3600);
          } catch {}
          const base = new URL("https://worker-cron/trigger");
          base.searchParams.set("start_date", next.start_date);
          base.searchParams.set("end_date", next.end_date);
          const req = new Request(base.toString(), { method: 'GET', headers: { 'cf-worker-cron': 'true' } });
          const response = await this.fetch(req, env, ctx);
          console.log(`[CRON][TJ] Backfill chunk processed ${next.start_date}..${next.end_date} status=${response.status}`);
          return response;
        }
      }
      const rollingDays = env.ROLLING_WINDOW_DAYS || 4;
      const { FROM, TO } = lastNDaysWindowUTC(rollingDays);
      console.log(`[CRON][TJ] Date window: FROM=${FROM}, TO=${TO}`);

      const base = new URL("https://worker-cron/trigger");
      base.searchParams.set("start_date", FROM);
      base.searchParams.set("end_date", TO);

      const kv2 = env.TJ_RETRY_KV;
      try {
        if (kv2 && typeof kv2.get === 'function') {
          const metaKey = 'tj:backfill:meta';
          const meta = await kvGetJson(kv2, metaKey) || {};
          const todayYmd = formatYmd(new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate())));
          if (meta.daily_last_run_ymd === todayYmd && (!meta.remaining || Number(meta.remaining) === 0)) {
            console.log('[CRON][TJ] Rolling import already executed today and no backlog. Skipping.');
            return new Response('No-op: already ran daily rolling window today.', { status: 204 });
          }
        }
      } catch {}

      const req = new Request(base.toString(), { method: "GET", headers: { "cf-worker-cron": "true" } });
      const response = await this.fetch(req, env, ctx);
      console.log(`[CRON][TJ] Internal fetch completed with status: ${response.status}`);
      const responseText = await response.text();
      console.log(`[CRON][TJ] Response: ${responseText.substring(0, 500)}${responseText.length > 500 ? '...' : ''}`);

      try {
        const kv = env.TJ_RETRY_KV;
        if (kv && typeof kv.put === 'function') {
          const queue = await kvGetJson(kv, 'tj:backfill:queue') || [];
          const metaKey = 'tj:backfill:meta';
          const cur = (await kvGetJson(kv, metaKey)) || {};
          const todayYmd = formatYmd(new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate())));
          cur.daily_last_run_ymd = todayYmd;
          cur.daily_last_run_at = new Date().toISOString();
          cur.remaining = Array.isArray(queue) ? queue.length : 0;
          await kvPutJson(kv, metaKey, cur, 7 * 24 * 3600);
        }
      } catch {}

      return new Response(`Cron job completed. Status: ${response.status}\n\n${responseText}`, { status: response.status, headers: response.headers });
    } catch (error) {
      console.error(`[CRON][TJ] Error in scheduled function:`, error);
      console.error(`[CRON][TJ] Stack trace:`, error?.stack);
      return new Response(`Cron job failed: ${error.message}`, { status: 500 });
    }
  }
};

// ======== Helpers copied from original (only what TJ needs) ========

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
function buildChunks(startYmd, endYmd, chunkDays) {
  const chunks = [];
  let d = parseYmd(startYmd);
  const end = parseYmd(endYmd);
  while (d.getTime() <= end.getTime()) {
    const from = formatYmd(d);
    const tmp = new Date(d.getTime());
    tmp.setUTCDate(tmp.getUTCDate() + (chunkDays - 1));
    if (tmp.getTime() > end.getTime()) tmp.setTime(end.getTime());
    const to = formatYmd(tmp);
    chunks.push({ from, to });
    d.setUTCDate(d.getUTCDate() + chunkDays);
  }
  return chunks;
}

// KV JSON helpers
async function kvGetJson(kv, key) {
  const s = await kv.get(key);
  if (!s) return null;
  try { return JSON.parse(s); } catch { return null; }
}
async function kvPutJson(kv, key, obj, ttlSec) {
  const value = JSON.stringify(obj);
  if (ttlSec && Number.isFinite(ttlSec)) {
    return await kv.put(key, value, { expirationTtl: Math.floor(ttlSec) });
  }
  return await kv.put(key, value);
}

const TJ_BASE = 'https://api.trafficjunky.com';
let tjNextAvailableMs = 0;
const TJ_MIN_GAP_MS = 1200;
const TJ_MAX_RETRIES = 6;
const TJ_BASE_BACKOFF_MS = 1000;
const TJ_429_COOL_OFF_MS = 1000;

async function tjFetchJson(tjApiKey, pathAndQuery) {
  let attempt = 0;
  while (true) {
    const now = Date.now();
    if (now < tjNextAvailableMs) {
      await sleep(tjNextAvailableMs - now);
    }
    console.log(`[TJ_API] Fetching: ${pathAndQuery}`);
    const res = await fetch(`${TJ_BASE}${pathAndQuery}`, {
      headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${tjApiKey}` }
    });
    tjNextAvailableMs = Date.now() + TJ_MIN_GAP_MS;
    console.log(`[TJ_API] Response status: ${res.status}`);
    let json = null;
    try { json = await res.json(); } catch {}
    if (res.ok) {
      console.log(`[TJ_API] Request successful`);
      return json;
    }
    if (res.status === 429 || (res.status >= 500 && res.status <= 599)) {
      console.warn(`[TJ_API] Retryable error (status ${res.status}) on ${pathAndQuery}, attempt ${attempt+1}/${TJ_MAX_RETRIES}`);
      if (attempt >= TJ_MAX_RETRIES) {
        console.error(`[TJ_API] Max retries reached. Last error:`, json);
        throw new Error(`TJ HTTP ${res.status} on ${pathAndQuery}: ${JSON.stringify(json)}`);
      }
      const jitter = Math.floor(Math.random() * 300);
      const delay = TJ_BASE_BACKOFF_MS * Math.pow(2, attempt) + jitter;
      tjNextAvailableMs = Math.max(tjNextAvailableMs, Date.now() + TJ_429_COOL_OFF_MS + delay);
      await sleep(delay);
      attempt++;
      continue;
    }
    console.error(`[TJ_API] Request failed:`, json);
    throw new Error(`TJ HTTP ${res.status} on ${pathAndQuery}: ${JSON.stringify(json)}`);
  }
}
async function tjDiscoverCampaignsPaged(tjApiKey, startDmy, endDmy) {
  const limit = 1000;
  let offset = 0;
  const out = [];
  let pages = 0;
  while (pages < 100) {
    const path = `/api/campaigns/bids/stats.json?limit=${limit}&offset=${offset}&startDate=${encodeURIComponent(startDmy)}&endDate=${encodeURIComponent(endDmy)}`;
    const data = await tjFetchJson(tjApiKey, path);
    let batchCount = 0;
    if (Array.isArray(data)) {
      for (const item of data) {
        if (item && (item.campaignId != null || item.campaign_id != null)) {
          const id = String(item.campaignId ?? item.campaign_id);
          const name = item.campaignName || item.campaign_name || `Campaign ${id}`;
          out.push({ id, name });
          batchCount++;
        }
      }
    } else if (data && typeof data === 'object') {
      for (const [k, v] of Object.entries(data)) {
        const id = String(k);
        const name = v?.campaignName || v?.campaign_name || `Campaign ${id}`;
        out.push({ id, name });
        batchCount++;
      }
    }
    if (batchCount < limit) break;
    offset += limit;
    pages++;
  }
  const seen = new Set();
  return out.filter(c => (seen.has(c.id) ? false : (seen.add(c.id), true)));
}
async function tjDiscoverCampaigns(tjApiKey, dmy) { return tjDiscoverCampaignsPaged(tjApiKey, dmy, dmy); }
async function tjDiscoverCampaignsRange(tjApiKey, startDmy, endDmy) { return tjDiscoverCampaignsPaged(tjApiKey, startDmy, endDmy); }
async function tjFetchBidsStatsAll(tjApiKey, startDmy, endDmy) {
  const limit = 1000;
  let offset = 0;
  const items = [];
  let pages = 0;
  while (pages < 200) {
    const path = `/api/campaigns/bids/stats.json?limit=${limit}&offset=${offset}&startDate=${encodeURIComponent(startDmy)}&endDate=${encodeURIComponent(endDmy)}`;
    const data = await tjFetchJson(tjApiKey, path);
    let batchCount = 0;
    if (Array.isArray(data)) {
      for (const item of data) { items.push(item); batchCount++; }
    } else if (data && typeof data === 'object') {
      for (const [, v] of Object.entries(data)) { items.push(v); batchCount++; }
    }
    if (batchCount < limit) break;
    offset += limit;
    pages++;
  }
  return items;
}
async function tjGetAdsForCampaign(tjApiKey, campaignId) {
  const limit = 1000;
  let offset = 0;
  const all = [];
  let pages = 0;
  while (pages < 100) {
    const path = `/api/ads/${encodeURIComponent(campaignId)}.json?limit=${limit}&offset=${offset}`;
    const list = await tjFetchJson(tjApiKey, path);
    const arr = Array.isArray(list) ? list : [];
    all.push(...arr);
    if (arr.length < limit) break;
    offset += limit;
    pages++;
  }
  return all;
}
const tjCache = { adsByCampaign: { value: {}, expMs: 0 } };
function tjCacheGetAds(nowMs) { return nowMs < tjCache.adsByCampaign.expMs ? tjCache.adsByCampaign.value : null; }
function tjCacheSetAds(map, ttlMs) { tjCache.adsByCampaign.value = map; tjCache.adsByCampaign.expMs = Date.now() + ttlMs; return map; }
async function tjGetAdsForCampaignCached(tjApiKey, campaignId) {
  const now = Date.now();
  let map = tjCacheGetAds(now);
  if (!map) map = tjCacheSetAds({}, 6 * 60 * 60 * 1000);
  if (!map[campaignId]) {
    try { map[campaignId] = await tjGetAdsForCampaign(tjApiKey, campaignId); }
    catch (e) { console.log(`[TJ_API] ads list failed for campaign ${campaignId}: ${e.message}`); map[campaignId] = []; }
  }
  return map[campaignId];
}
async function tjGetAdStatsForCampaignDay(tjApiKey, campaignId, startDmy, endDmy) {
  const path = `/api/ads/${encodeURIComponent(campaignId)}/stats/one.json?startDate=${encodeURIComponent(startDmy)}&endDate=${encodeURIComponent(endDmy)}`;
  return await tjFetchJson(tjApiKey, path);
}
async function tjGetBidStatsForCampaign(tjApiKey, campaignId) {
  const path = `/api/bids/${encodeURIComponent(campaignId)}.json`;
  return await tjFetchJson(tjApiKey, path);
}

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
  const claim = { iss: clientEmail, scope: scopes.join(' '), aud: "https://oauth2.googleapis.com/token", iat, exp };
  const encodeSegment = (obj) => btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const jwtHeader = encodeSegment(header);
  const jwtClaim  = encodeSegment(claim);
  const toSign = `${jwtHeader}.${jwtClaim}`;
  const pem = privateKey.replace(/\\n/g, "\n").replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const keyBuf = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0)).buffer;
  const keyObj = await crypto.subtle.importKey("pkcs8", keyBuf, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const sigBuf = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", keyObj, new TextEncoder().encode(toSign));
  const sig = btoa(String.fromCharCode(...new Uint8Array(sigBuf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const jwt = `${toSign}.${sig}`;
  const res = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}` });
  const json = await res.json();
  if (!json.access_token) throw new Error(`Failed to get Google access token: ${JSON.stringify(json)}`);
  return json.access_token;
}

function randomId() { const s = crypto.getRandomValues(new Uint8Array(6)); return Array.from(s).map(x => x.toString(16).padStart(2, '0')).join(''); }
function bqHeaders(token) { return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }; }
async function bqApi(token, method, url, body) {
  const res = await fetch(url, { method, headers: bqHeaders(token), body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  let json = null; try { json = text ? JSON.parse(text) : null; } catch { json = text; }
  return { ok: res.ok, status: res.status, json, text };
}
async function bqCreateTable(token, env, tableId, schemaFields, partitionField, clusterFields, labels, expirationTimeMs) {
  const { BQ_PROJECT_ID, BQ_DATASET } = env;
  const url = `https://bigquery.googleapis.com/bigquery/v2/projects/${BQ_PROJECT_ID}/datasets/${BQ_DATASET}/tables`;
  const body = { tableReference: { projectId: BQ_PROJECT_ID, datasetId: BQ_DATASET, tableId }, schema: { fields: schemaFields }, timePartitioning: { type: "DAY", field: partitionField }, clustering: clusterFields && clusterFields.length ? { fields: clusterFields } : undefined, labels: labels || undefined, expirationTime: expirationTimeMs ? String(expirationTimeMs) : undefined };
  const res = await bqApi(token, "POST", url, body);
  if (!res.ok) throw new Error(`bqCreateTable ${tableId} failed: ${res.text || res.json}`);
  return true;
}
async function ensureBQTable(token, env, tableId, schemaFields, partitionField, clusterFields) {
  const exists = await bqGetTable(token, env, tableId);
  if (exists.status === 404) {
    try {
      await bqCreateTable(token, env, tableId, schemaFields, partitionField, clusterFields, {permanent:"true"}, null);
    } catch (error) {
      const msg = String(error?.message || "");
      // Ignore race condition where another instance just created the table
      if (!msg.includes("Already Exists") && !msg.includes("ALREADY_EXISTS")) {
        throw error;
      }
    }
  }
}
async function bqGetTable(token, env, tableId) {
  const { BQ_PROJECT_ID, BQ_DATASET } = env;
  const url = `https://bigquery.googleapis.com/bigquery/v2/projects/${BQ_PROJECT_ID}/datasets/${BQ_DATASET}/tables/${tableId}`;
  const r = await fetch(url, { headers: { Authorization:`Bearer ${token}` }});
  if (r.status === 404) return { ok:false, status:404 };
  const json = await r.json().catch(()=>null);
  return { ok:r.ok, status:r.status, json };
}
async function bqSetNoExpiry(token, env, tableId, logs) {
  const { BQ_PROJECT_ID, BQ_DATASET } = env;
  await bqQuery(token, env, `ALTER TABLE \`${BQ_PROJECT_ID}.${BQ_DATASET}.${tableId}\` SET OPTIONS (partition_expiration_days = NULL)`, logs);
  await bqQuery(token, env, `ALTER TABLE \`${BQ_PROJECT_ID}.${BQ_DATASET}.${tableId}\` SET OPTIONS (expiration_timestamp = NULL)`, logs);
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
  const withRef = { jobReference: { projectId: BQ_PROJECT_ID, location: BQ_LOCATION || "US" }, ...body };
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
  try {
    const job = await bqJobInsert(token, env, { configuration: { query: { query: sql, useLegacySql: false } } });
    const jobId = job?.jobReference?.jobId;
    console.log(`[BQ_QUERY] Job created with ID: ${jobId}`);
    await bqPollJob(token, env, jobId, location);
    console.log(`[BQ_QUERY] Job completed successfully`);
    if (returnRows) {
      console.log(`[BQ_QUERY] Fetching query results...`);
      const res = await fetch(`https://bigquery.googleapis.com/bigquery/v2/projects/${env.BQ_PROJECT_ID}/queries/${jobId}?location=${encodeURIComponent(location)}`, { headers: { Authorization: `Bearer ${token}` } });
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
async function bqLoadJson(token, env, tableId, objects, schemaFields, logs) {
  if (!objects || !objects.length) { console.log(`[BQ_LOAD] No objects to load into ${tableId}`); return 0; }
  console.log(`[BQ_LOAD] Loading ${objects.length} objects into ${tableId}...`);
  const ndjson = objects.map(o => JSON.stringify(o)).join('\n');
  const meta = { jobReference: { projectId: env.BQ_PROJECT_ID, location: env.BQ_LOCATION || "US" }, configuration: { load: { destinationTable: { projectId: env.BQ_PROJECT_ID, datasetId: env.BQ_DATASET, tableId }, schema: { fields: schemaFields }, sourceFormat: "NEWLINE_DELIMITED_JSON", writeDisposition: "WRITE_APPEND", ignoreUnknownValues: false } } };
  const boundary = `===============${randomId()}==`;
  const encoder = new TextEncoder();
  const metaPart = `--${boundary}\r\n` + `Content-Type: application/json; charset=UTF-8\r\n\r\n` + `${JSON.stringify(meta)}\r\n`;
  const fileHeader = `--${boundary}\r\n` + `Content-Type: application/octet-stream\r\n\r\n`;
  const endPart = `\r\n--${boundary}--\r\n`;
  const body = concatUint8Arrays([ encoder.encode(metaPart), encoder.encode(fileHeader), encoder.encode(ndjson), encoder.encode(endPart) ]);
  console.log(`[BQ_LOAD] Uploading to BigQuery...`);
  const url = `https://www.googleapis.com/upload/bigquery/v2/projects/${env.BQ_PROJECT_ID}/jobs?uploadType=multipart`;
  const res = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": `multipart/related; boundary=${boundary}` }, body });
  const text = await res.text();
  let json = null; try { json = JSON.parse(text); } catch { json = text; }
  if (!res.ok) { console.error(`[BQ_LOAD] Upload failed:`, json); throw new Error(`bqLoadJson failed: ${JSON.stringify(json)}`); }
  const jobId = json?.jobReference?.jobId;
  console.log(`[BQ_LOAD] Upload job created with ID: ${jobId}`);
  await bqPollJob(token, env, jobId, env.BQ_LOCATION || "US", 180000);
  console.log(`[BQ_LOAD] Load completed successfully into ${tableId}`);
  logs && logs.push(`Load OK into ${tableId}: ${objects.length} row(s)`);
  return objects.length;
}
function concatUint8Arrays(chunks) { let total = 0; for (const c of chunks) total += c.byteLength; const out = new Uint8Array(total); let off = 0; for (const c of chunks) { out.set(c, off); off += c.byteLength; } return out; }
function mergeSQL({ project, dataset, table, stage, keyFields, nonKeyFields }) {
  const backtick = (c) => `\`${c}\``;
  const T = (c) => `T.${backtick(c)}`;
  const S = (c) => `S.${backtick(c)}`;
  const nullSafeEq = (col) => `( (${T(col)} IS NULL AND ${S(col)} IS NULL) OR ${T(col)} = ${S(col)} )`;
  const on = keyFields.map(k => nullSafeEq(k)).join(' AND ');
  const updates = nonKeyFields.map(c => `${T(c)} = ${S(c)}`).join(', ');
  const allCols = [...keyFields, ...nonKeyFields];
  const insertCols = allCols.map(backtick).join(', ');
  const insertVals = allCols.map(c => `${S(c)}`).join(', ');
  const keyPartition = keyFields.map(backtick).join(', ');
  const dedupSource = `\n    SELECT * EXCEPT(rn) FROM (\n      SELECT *,\n             ROW_NUMBER() OVER (\n               PARTITION BY ${keyPartition}\n               ORDER BY retrieved_at DESC\n             ) AS rn\n      FROM \`${project}.${dataset}.${stage}\`\n    )\n    WHERE rn = 1\n  `;
  return `\n    MERGE \`${project}.${dataset}.${table}\` AS T\n    USING (${dedupSource}) AS S\n    ON ${on}\n    WHEN MATCHED AND ${S('retrieved_at')} > ${T('retrieved_at')} THEN\n      UPDATE SET ${updates}\n    WHEN NOT MATCHED THEN\n      INSERT (${insertCols}) VALUES (${insertVals})\n  `;
}
function targetCountSQL(project, dataset, table, from, to) {
  return { sql: `\n      SELECT COUNT(*) AS rows_in_range\n      FROM \`${project}.${dataset}.${table}\`\n      WHERE \`date\` >= DATE '${from}' AND \`date\` <= DATE '${to}'\n    ` };
}
function stageSweeperSQL(project, dataset) {
  return `\n    BEGIN\n      DECLARE stmt STRING;\n      FOR r IN (\n        SELECT table_name\n        FROM \`${project}.${dataset}\`.INFORMATION_SCHEMA.TABLES\n        WHERE table_name LIKE '%_stage_%'\n          AND creation_time < TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 2 HOUR)\n      )\n      DO\n        SET stmt = FORMAT('DROP TABLE \`${project}.${dataset}.%s\`', r.table_name);\n        EXECUTE IMMEDIATE stmt;\n      END FOR;\n    END\n  `;
}