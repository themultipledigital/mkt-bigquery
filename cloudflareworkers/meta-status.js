/**
 * Version: 1.2.0
 * Meta Changelog Worker – Usage Summary
 * ------------------------------------------------------------
 * Query params
 *  - account: required FRM-xxxxx key or 'all' to run for all configured accounts
 *  - mode:    'activities' to fetch Meta ad account activities; 
 *             'targeting' to fetch adset targeting data; 
 *             'health' to fetch reach & performance metrics (ad levels with breakdowns);
 *             omit to run original structure flow
 *  - dest:    'bq' to write to BigQuery, 'sheets' to write to Google Sheets (default)
 *  - since:   optional YYYY-MM-DD (activities/health window start; default: now-7d)
 *  - until:   optional YYYY-MM-DD (activities/health window end; default: today)
 *  - schema_migrate: 'true' to add new columns to existing BigQuery tables (default: false)
 *
 * Examples
 *  - Sheets (activities):  ?account=FRM-155237&mode=activities&dest=sheets
 *  - BigQuery (activities):?account=FRM-155237&mode=activities&dest=bq&since=2025-09-18&until=2025-09-24
 *  - BigQuery (targeting): ?account=FRM-155237&mode=targeting&dest=bq
 *  - BigQuery (health):    ?account=FRM-155237&mode=health&dest=bq&since=2025-10-29&until=2025-11-05
 *  - Schema migration:     ?account=FRM-155237&mode=targeting&dest=bq&schema_migrate=true
 *  - Sheets (structure):   ?account=FRM-155237  (writes META_Acc_Info)
 *  - All accounts (activities): ?account=all&mode=activities&dest=bq
 *  - All accounts (targeting):  ?account=all&mode=targeting&dest=bq&schema_migrate=true
 *  - All accounts (health):     ?account=all&mode=health&dest=bq
 *
 * Scheduled (Cron) Jobs
 *  - Automatically runs activities, targeting, and health modes for all accounts to BigQuery
 *  - Configure cron trigger in wrangler.toml or Cloudflare dashboard
 *
 * Outputs
 *  - Sheets tabs: META_Acc_Changes (activities), META_Acc_Info (structure)
 *  - BigQuery:    {BQ_PROJECT_ID}.{BQ_DATASET|mkt_channels}.meta_changelog (activities)
 *                 {BQ_PROJECT_ID}.{BQ_DATASET|mkt_channels}.meta_targeting (targeting)
 *                 {BQ_PROJECT_ID}.{BQ_DATASET|mkt_channels}.meta_health (health)
 *                  Stage→Merge with last retrieved_at wins; null account_id backfilled post-merge
 *                  Health includes accurate reach at ad levels plus breakdowns by device/platform/position
 *                  Reach deduplication: is_breakdown=FALSE for totals, TRUE for distribution
 *
 * Required env vars
 *  - GS_CLIENT_EMAIL, GS_PRIVATE_KEY, SPREADSHEET_ID
 *  - BQ_PROJECT_ID, BQ_DATASET (optional; defaults to 'mkt_channels'), BQ_LOCATION (optional), BQ_STAGE_TTL_MIN (optional)
 */

// ================== DO NOT REFACTOR TOKENS ==================
const API_CONFIGS = {
  "FRM-154947": {
    accessToken: "EAAWZCxLUOUfoBPp7DgfFU2cDlE0HAe9GibRV8OZBGOGTLpSFx1V4wGIyPPfJmo6a58I7SZAILcElfrMMI1iVZCgdFqBeWmVfBb4OCznV1VnS6licZC2ZCoukWtnABfshSjLL6xQNquGDm9Sl9jZCG00UXe144qttn8tUKlaXLRxSEndoZAaZByQ45Ayv15AmTyyHjSVYLwzOxTWuH",
    eventSourceUrl: "https://montaukfishingcharter.net"
  },
  "FRM-145669": {
    accessToken: "EAASKiJwmDaIBPf1H8z1kwNsHVEqsd50n9ZCt4kJMpES8itTaZAMU0ra6HvTTL0noS8uBmjhG08smxRKAkwaZCl3Um85eYMpWx4E2TkvTgSHFu8LLQFULf3xbbgK12CPmyctam1WCnpbUOeK4ouorEAuasC2EQZA0cyFdKmZAM5X7tLIuZCdanFB9yHsytd",
    eventSourceUrl: "https://suntechy.com"
  },
  "FRM-155237": {
    accessToken: "EAAG8t9JTvzMBPhvXLXI6znTIZCFRvoIiNjfGaWbbdL2ZCgqmDzfMKUNB82pN8dyhZBNKeWePN1zb2MTMVTikW0TbBHdvIOcXSnzoNm0PQvzIRatSGMfqsZAVZCtM5SpEN83dFTbhhZAN4KOE2ronVcd9f3G0HRAgZAW5ZAvifqHtwN5hkXoQQzmRaZA0mxO5tQIZCbhPM7leyx6BSE",
    eventSourceUrl: "https://travelerassistusonlinetravel.com"
  },
  "FRM-154742": {
    accessToken: "EAAG8t9JTvzMBP6xDsXiOxnA6Vtdrj3LsOp6gi0an7dkRL9J67wTGWmLI6e6C2YoZCS6dZALjhBdNFWAJW5lPhPqPDzkXMfgbWD6S2vtvQhVgsZBJ5NewRWbYkpeuny4X9FeE670gNfKRZBCtcobJ63m21Ua03vf6Bq6ftfsJNVXDXLlqLxCAtOEBS1l3RcLAX3sYeFI1jxgaLJdT",
    eventSourceUrl: "https://uswheeltech.com"
  }
};
// ============================================================

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const accountId = url.searchParams.get("account");
    const dest = (url.searchParams.get("dest") || "sheets").toLowerCase();
    const mode = url.searchParams.get("mode");
    const schemaMigrate = (url.searchParams.get("schema_migrate") || "false").toLowerCase() === "true";

    if (!accountId) {
      return new Response("Missing ?account=FRM-xxxxx or account=all param", { status: 400 });
    }

    // Handle "all" accounts
    if (accountId.toLowerCase() === "all") {
      const results = await processAllAccounts(mode, dest, schemaMigrate, env, url);
      return new Response(
        `Processed ${Object.keys(API_CONFIGS).length} account(s)\n\n` + results.join('\n'),
        { headers: { "Content-Type": "text/plain" } }
      );
    }

    // Process single account
    const config = API_CONFIGS[accountId];
    if (!config) return new Response(`Unknown account ID: ${accountId}`, { status: 404 });

    const result = await processAccount(accountId, config, mode, dest, schemaMigrate, env, url);
    return new Response(result, { headers: { "Content-Type": "text/plain" } });
  },

  // Scheduled handler for cron jobs
  async scheduled(event, env, ctx) {
    const results = [];
    
    // Run all modes for all accounts
    for (const [acctKey, acctConfig] of Object.entries(API_CONFIGS)) {
      try {
        // Run activities mode
        const activitiesResult = await processAccount(acctKey, acctConfig, "activities", "bq", false, env, null);
        results.push(`${acctKey} [activities]: ${activitiesResult}`);
        
        // Run targeting mode
        const targetingResult = await processAccount(acctKey, acctConfig, "targeting", "bq", false, env, null);
        results.push(`${acctKey} [targeting]: ${targetingResult}`);
        
        // Run health mode
        const healthResult = await processAccount(acctKey, acctConfig, "health", "bq", false, env, null);
        results.push(`${acctKey} [health]: ${healthResult}`);
      } catch (err) {
        results.push(`${acctKey}: ERROR - ${err.message}`);
      }
    }
    
    console.log("Scheduled run completed:\n" + results.join('\n'));
  }
};

// ================= Helper Functions =================

// Process all accounts for a given mode
async function processAllAccounts(mode, dest, schemaMigrate, env, url) {
  const results = [];
  
  for (const [acctId, config] of Object.entries(API_CONFIGS)) {
    try {
      const result = await processAccount(acctId, config, mode, dest, schemaMigrate, env, url);
      results.push(`${acctId}: ${result}`);
    } catch (err) {
      results.push(`${acctId}: ERROR - ${err.message}`);
    }
  }
  
  return results;
}

// ================= Core Processing Function =================
async function processAccount(accountId, config, mode, dest, schemaMigrate, env, url) {
  // === GOOGLE SHEETS AUTH ===
    const jwtHeader = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" })).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const iat = Math.floor(Date.now() / 1000);
    const jwtClaim = btoa(JSON.stringify({
      iss: env.GS_CLIENT_EMAIL,
      scope: "https://www.googleapis.com/auth/spreadsheets",
      aud: "https://oauth2.googleapis.com/token",
      iat, exp: iat + 3600
    })).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const toSign = `${jwtHeader}.${jwtClaim}`;

    const pem = env.GS_PRIVATE_KEY.replace(/\\n/g, "\n").replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
    const keyBuf = Uint8Array.from(atob(pem), c => c.charCodeAt(0)).buffer;
    const keyObj = await crypto.subtle.importKey("pkcs8", keyBuf, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
    const sigBuf = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", keyObj, new TextEncoder().encode(toSign));
    const sig = btoa(String.fromCharCode(...new Uint8Array(sigBuf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const jwt = `${toSign}.${sig}`;

    const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
    });

    const { access_token } = await tokenResp.json();
    if (!access_token) throw new Error("Google Sheets auth failed");
    const baseSheetURL = `https://sheets.googleapis.com/v4/spreadsheets/${env.SPREADSHEET_ID}/values`;

    // === NEW: activities mode ===
    if (mode === "activities") {
      const { rows, headers, sinceStr, untilStr, adAccountIds, referrerDomain, accountKey } = await getActivitiesRows(config, accountId);

      if (dest === "sheets") {
        await ensureHeaders(baseSheetURL, access_token, "META_Acc_Changes", headers);
      if (rows.length) {
        await appendRows(baseSheetURL, access_token, "META_Acc_Changes", rows);
      }
      return `Appended ${rows.length} rows for ${accountId} to META_Acc_Changes (since=${sinceStr}, until=${untilStr})`;
      } else if (dest === "bq") {
        // ---- BigQuery export for activities ----
        // Env
        const BQ_PROJECT_ID   = env.BQ_PROJECT_ID;
        const BQ_DATASET      = env.BQ_DATASET || 'mkt_channels';
        const BQ_LOCATION     = env.BQ_LOCATION || 'US';
        const BQ_STAGE_TTL_MIN= Number(env.BQ_STAGE_TTL_MIN || 120);

        if (!BQ_PROJECT_ID) {
          throw new Error("Missing BigQuery env var: BQ_PROJECT_ID");
        }

        const tableId = 'meta_changelog';
        const stageId = `meta_changelog_stage_${randomId ? randomId() : Math.random().toString(16).slice(2,10)}`;

        // Schema for activities rows
        const META_CHANGELOG_SCHEMA = [
          {name:"account_id", type:"STRING", mode:"NULLABLE"},
          {name:"referrer_domain", type:"STRING", mode:"NULLABLE"},
          {name:"ad_account_id", type:"STRING", mode:"NULLABLE"},
          {name:"retrieved_at", type:"TIMESTAMP", mode:"REQUIRED"},
          {name:"event_time", type:"STRING", mode:"NULLABLE"},
          {name:"event_type", type:"STRING", mode:"NULLABLE"},
          {name:"translated_event_type", type:"STRING", mode:"NULLABLE"},
          {name:"object_type", type:"STRING", mode:"NULLABLE"},
          {name:"object_id", type:"STRING", mode:"NULLABLE"},
          {name:"object_name", type:"STRING", mode:"NULLABLE"},
          {name:"actor_name", type:"STRING", mode:"NULLABLE"},
          {name:"application_name", type:"STRING", mode:"NULLABLE"},
          {name:"extra_data_json", type:"STRING", mode:"NULLABLE"}
        ];

        // Auth for BigQuery
        const bqToken = await googleAccessToken(env, ["https://www.googleapis.com/auth/bigquery"]);

        // Ensure target table exists (partition on retrieved_at)
        await ensureBQTable(bqToken, { ...env, BQ_DATASET: BQ_DATASET }, tableId, META_CHANGELOG_SCHEMA, "retrieved_at", ["ad_account_id","event_type","object_id"]);
        // Remove any expiration on permanent table
        await bqSetNoExpiry(bqToken, { ...env, BQ_DATASET: BQ_DATASET }, tableId, /*logs*/null).catch(()=>{});

        // Retrieved timestamp (stable for this run)
        const retrievedAt = new Date().toISOString();

        // Convert rows[] (array of arrays) to objects for load
        const objects = rows.map(r => ({
          account_id: r[0] || null,
          referrer_domain: r[1] || null,
          ad_account_id: r[2] || null,
          retrieved_at: retrievedAt,
          event_time: r[4] || null,
          event_type: r[5] || null,
          translated_event_type: r[6] || null,
          object_type: r[7] || null,
          object_id: r[8] || null,
          object_name: r[9] || null,
          actor_name: r[10] || null,
          application_name: r[11] || null,
          extra_data_json: r[12] || null,
        }));

        // Create stage table (TTL) and load NDJSON
        await bqCreateStageTable(bqToken, { ...env, BQ_DATASET: BQ_DATASET, BQ_LOCATION: BQ_LOCATION }, stageId, META_CHANGELOG_SCHEMA, "retrieved_at", ["ad_account_id"], BQ_STAGE_TTL_MIN);
        await bqLoadJson(bqToken, { ...env, BQ_DATASET: BQ_DATASET, BQ_LOCATION: BQ_LOCATION }, stageId, objects, META_CHANGELOG_SCHEMA, /*logs*/null);

        // Merge stage → target; dedupe keys, last retrieved_at wins
        const sql = mergeSQL({
          project: BQ_PROJECT_ID,
          dataset: BQ_DATASET,
          table: tableId,
          stage: stageId,
          keyFields: ["account_id","ad_account_id","event_time","event_type","object_id","translated_event_type"],
          nonKeyFields: ["referrer_domain","object_type","object_name","actor_name","application_name","extra_data_json","retrieved_at"],
        });
        await bqQuery(bqToken, { ...env, BQ_DATASET: BQ_DATASET, BQ_LOCATION: BQ_LOCATION }, sql, /*logs*/null);

        // Post-merge cleanup: backfill null account_id for current run's accounts + referrer
        if (Array.isArray(adAccountIds) && adAccountIds.length && accountKey) {
          const acctList = adAccountIds.map(id => `'${String(id).replace(/`/g,'')}'`).join(', ');
          const updateSql = `
            UPDATE \`${BQ_PROJECT_ID}.${BQ_DATASET}.${tableId}\`
            SET account_id = '${accountKey}'
            WHERE account_id IS NULL
              AND referrer_domain = '${referrerDomain}'
              AND ad_account_id IN (${acctList})
          `;
          await bqQuery(bqToken, { ...env, BQ_DATASET: BQ_DATASET, BQ_LOCATION: BQ_LOCATION }, updateSql, /*logs*/null).catch(()=>{});
        }

      // Cleanup stage (best-effort)
      await bqDropTable(bqToken, { ...env, BQ_DATASET: BQ_DATASET }, stageId).catch(()=>{});

      return `Appended ${objects.length} rows to BigQuery ${BQ_PROJECT_ID}.${BQ_DATASET}.meta_changelog (since=${sinceStr}, until=${untilStr})`;
    } else {
      throw new Error("Invalid dest. Use dest=bq or dest=sheets");
    }
    }

    // === NEW: targeting mode ===
    if (mode === "targeting") {
      if (dest !== "bq") {
        throw new Error("Targeting mode only supports dest=bq");
      }

      const { rows: targetingData, adAccountIds, referrerDomain, accountKey } = await getTargetingData(config, accountId);

      // Env
      const BQ_PROJECT_ID   = env.BQ_PROJECT_ID;
      const BQ_DATASET      = env.BQ_DATASET || 'mkt_channels';
      const BQ_LOCATION     = env.BQ_LOCATION || 'US';
      const BQ_STAGE_TTL_MIN= Number(env.BQ_STAGE_TTL_MIN || 120);

      if (!BQ_PROJECT_ID) {
        throw new Error("Missing BigQuery env var: BQ_PROJECT_ID");
      }

      const tableId = 'meta_targeting';
      const stageId = `meta_targeting_stage_${randomId ? randomId() : Math.random().toString(16).slice(2,10)}`;

      // Schema for targeting data (flattened)
      const META_TARGETING_SCHEMA = [
        {name:"account_id", type:"STRING", mode:"NULLABLE"},
        {name:"referrer_domain", type:"STRING", mode:"NULLABLE"},
        {name:"ad_account_id", type:"STRING", mode:"NULLABLE"},
        {name:"retrieved_at", type:"TIMESTAMP", mode:"REQUIRED"},
        {name:"campaign_id", type:"STRING", mode:"NULLABLE"},
        {name:"campaign_name", type:"STRING", mode:"NULLABLE"},
        {name:"campaign_objective", type:"STRING", mode:"NULLABLE"},
        {name:"campaign_primary_attribution", type:"STRING", mode:"NULLABLE"},
        {name:"campaign_configured_status", type:"STRING", mode:"NULLABLE"},
        {name:"campaign_effective_status", type:"STRING", mode:"NULLABLE"},
        {name:"adset_id", type:"STRING", mode:"NULLABLE"},
        {name:"adset_name", type:"STRING", mode:"NULLABLE"},
        {name:"source_adset_id", type:"STRING", mode:"NULLABLE"},
        {name:"adset_configured_status", type:"STRING", mode:"NULLABLE"},
        {name:"adset_effective_status", type:"STRING", mode:"NULLABLE"},
        // Targeting fields (flattened)
        {name:"age_min", type:"INTEGER", mode:"NULLABLE"},
        {name:"age_max", type:"INTEGER", mode:"NULLABLE"},
        {name:"geo_countries", type:"STRING", mode:"NULLABLE"},
        {name:"geo_location_types", type:"STRING", mode:"NULLABLE"},
        {name:"custom_audiences", type:"STRING", mode:"NULLABLE"},
        {name:"excluded_custom_audiences", type:"STRING", mode:"NULLABLE"},
        {name:"publisher_platforms", type:"STRING", mode:"NULLABLE"},
        {name:"facebook_positions", type:"STRING", mode:"NULLABLE"},
        {name:"instagram_positions", type:"STRING", mode:"NULLABLE"},
        {name:"device_platforms", type:"STRING", mode:"NULLABLE"},
        {name:"messenger_positions", type:"STRING", mode:"NULLABLE"},
        {name:"audience_network_positions", type:"STRING", mode:"NULLABLE"},
        {name:"brand_safety_content_filter_levels", type:"STRING", mode:"NULLABLE"},
        {name:"advantage_audience", type:"INTEGER", mode:"NULLABLE"},
        {name:"targeting_automation_age", type:"INTEGER", mode:"NULLABLE"},
        {name:"targeting_automation_gender", type:"INTEGER", mode:"NULLABLE"},
        // Targeting sentence lines (flattened)
        {name:"tsl_custom_audience", type:"STRING", mode:"NULLABLE"},
        {name:"tsl_excluding_custom_audience", type:"STRING", mode:"NULLABLE"},
        {name:"tsl_location", type:"STRING", mode:"NULLABLE"},
        {name:"tsl_age", type:"STRING", mode:"NULLABLE"},
        {name:"tsl_gender", type:"STRING", mode:"NULLABLE"},
        {name:"tsl_placements", type:"STRING", mode:"NULLABLE"},
        {name:"tsl_languages", type:"STRING", mode:"NULLABLE"},
        {name:"tsl_interests", type:"STRING", mode:"NULLABLE"},
        {name:"tsl_behaviors", type:"STRING", mode:"NULLABLE"},
        {name:"tsl_connections", type:"STRING", mode:"NULLABLE"},
        {name:"tsl_advantage_custom_audience", type:"STRING", mode:"NULLABLE"},
        {name:"tsl_advantage_audience", type:"STRING", mode:"NULLABLE"},
        {name:"tsl_other", type:"STRING", mode:"NULLABLE"},
        {name:"ads_json", type:"STRING", mode:"NULLABLE"}
      ];

      // Auth for BigQuery
      const bqToken = await googleAccessToken(env, ["https://www.googleapis.com/auth/bigquery"]);

      // Ensure target table exists (partition on retrieved_at)
      await ensureBQTable(bqToken, { ...env, BQ_DATASET: BQ_DATASET }, tableId, META_TARGETING_SCHEMA, "retrieved_at", ["ad_account_id","adset_id"]);
      
      // Add missing columns to existing table (schema migration)
      if (schemaMigrate) {
        await bqAddMissingColumns(bqToken, { ...env, BQ_DATASET: BQ_DATASET }, tableId, META_TARGETING_SCHEMA).catch(()=>{});
      }
      
      // Remove any expiration on permanent table
      await bqSetNoExpiry(bqToken, { ...env, BQ_DATASET: BQ_DATASET }, tableId, /*logs*/null).catch(()=>{});

      // Retrieved timestamp (stable for this run)
      const retrievedAt = new Date().toISOString();

      // Convert rows to objects for load (flatten targeting fields)
      const objects = targetingData.map(r => {
        const targeting = r.targeting || {};
        const targetingAutomation = targeting.targeting_automation || {};
        const individualSettings = targetingAutomation.individual_setting || {};
        const geoLocations = targeting.geo_locations || {};
        
        // Parse targeting sentence lines
        const tsl = parseTargetingSentenceLines(r.targetingsentencelines);
        
        return {
          account_id: accountKey,
          referrer_domain: referrerDomain,
          ad_account_id: r.ad_account_id,
          retrieved_at: retrievedAt,
          campaign_id: r.campaign_id,
          campaign_name: r.campaign_name,
          campaign_objective: r.campaign_objective,
          campaign_primary_attribution: r.campaign_primary_attribution,
          campaign_configured_status: r.campaign_configured_status || r.campaign_status || null,
          campaign_effective_status: r.campaign_effective_status || null,
          adset_id: r.adset_id,
          adset_name: r.adset_name,
          source_adset_id: r.source_adset_id,
          adset_configured_status: r.adset_configured_status || r.adset_status || null,
          adset_effective_status: r.adset_effective_status || null,
          // Flattened targeting fields
          age_min: targeting.age_min || null,
          age_max: targeting.age_max || null,
          geo_countries: geoLocations.countries ? geoLocations.countries.join(',') : null,
          geo_location_types: geoLocations.location_types ? geoLocations.location_types.join(',') : null,
          custom_audiences: targeting.custom_audiences ? JSON.stringify(targeting.custom_audiences) : null,
          excluded_custom_audiences: targeting.excluded_custom_audiences ? JSON.stringify(targeting.excluded_custom_audiences) : null,
          publisher_platforms: targeting.publisher_platforms ? targeting.publisher_platforms.join(',') : null,
          facebook_positions: targeting.facebook_positions ? targeting.facebook_positions.join(',') : null,
          instagram_positions: targeting.instagram_positions ? targeting.instagram_positions.join(',') : null,
          device_platforms: targeting.device_platforms ? targeting.device_platforms.join(',') : null,
          messenger_positions: targeting.messenger_positions ? targeting.messenger_positions.join(',') : null,
          audience_network_positions: targeting.audience_network_positions ? targeting.audience_network_positions.join(',') : null,
          brand_safety_content_filter_levels: targeting.brand_safety_content_filter_levels ? targeting.brand_safety_content_filter_levels.join(',') : null,
          advantage_audience: targetingAutomation.advantage_audience || null,
          targeting_automation_age: individualSettings.age || null,
          targeting_automation_gender: individualSettings.gender || null,
          // Flattened targeting sentence lines
          tsl_custom_audience: tsl.custom_audience,
          tsl_excluding_custom_audience: tsl.excluding_custom_audience,
          tsl_location: tsl.location,
          tsl_age: tsl.age,
          tsl_gender: tsl.gender,
          tsl_placements: tsl.placements,
          tsl_languages: tsl.languages,
          tsl_interests: tsl.interests,
          tsl_behaviors: tsl.behaviors,
          tsl_connections: tsl.connections,
          tsl_advantage_custom_audience: tsl.advantage_custom_audience,
          tsl_advantage_audience: tsl.advantage_audience,
          tsl_other: tsl.other,
          ads_json: r.ads_json
        };
      });

      // Create stage table (TTL) and load NDJSON
      await bqCreateStageTable(bqToken, { ...env, BQ_DATASET: BQ_DATASET, BQ_LOCATION: BQ_LOCATION }, stageId, META_TARGETING_SCHEMA, "retrieved_at", ["ad_account_id","adset_id"], BQ_STAGE_TTL_MIN);
      await bqLoadJson(bqToken, { ...env, BQ_DATASET: BQ_DATASET, BQ_LOCATION: BQ_LOCATION }, stageId, objects, META_TARGETING_SCHEMA, /*logs*/null);

      // Merge stage → target; dedupe keys, last retrieved_at wins
      const sql = mergeSQL({
        project: BQ_PROJECT_ID,
        dataset: BQ_DATASET,
        table: tableId,
        stage: stageId,
        keyFields: ["account_id","ad_account_id","adset_id"],
        nonKeyFields: [
          "referrer_domain","campaign_id","campaign_name","campaign_objective","campaign_primary_attribution",
          "campaign_configured_status","campaign_effective_status",
          "adset_name","source_adset_id","adset_configured_status","adset_effective_status",
          "age_min","age_max","geo_countries","geo_location_types",
          "custom_audiences","excluded_custom_audiences",
          "publisher_platforms","facebook_positions","instagram_positions",
          "device_platforms","messenger_positions","audience_network_positions",
          "brand_safety_content_filter_levels","advantage_audience",
          "targeting_automation_age","targeting_automation_gender",
          "tsl_custom_audience","tsl_excluding_custom_audience","tsl_location",
          "tsl_age","tsl_gender","tsl_placements","tsl_languages","tsl_interests",
          "tsl_behaviors","tsl_connections","tsl_advantage_custom_audience",
          "tsl_advantage_audience","tsl_other",
          "ads_json","retrieved_at"
        ],
      });
      await bqQuery(bqToken, { ...env, BQ_DATASET: BQ_DATASET, BQ_LOCATION: BQ_LOCATION }, sql, /*logs*/null);

      // Cleanup stage (best-effort)
      await bqDropTable(bqToken, { ...env, BQ_DATASET: BQ_DATASET }, stageId).catch(()=>{});

      return `Loaded ${objects.length} adsets to BigQuery ${BQ_PROJECT_ID}.${BQ_DATASET}.meta_targeting`;
    }

    // === NEW: health mode ===
    if (mode === "health") {
      if (dest !== "bq") {
        throw new Error("Health mode only supports dest=bq");
      }

      const { rows: insightsData, adAccountIds, referrerDomain, accountKey, sinceStr, untilStr } = await getInsightsData(config, accountId, url);

      // Env
      const BQ_PROJECT_ID   = env.BQ_PROJECT_ID;
      const BQ_DATASET      = env.BQ_DATASET || 'mkt_channels';
      const BQ_LOCATION     = env.BQ_LOCATION || 'US';
      const BQ_STAGE_TTL_MIN= Number(env.BQ_STAGE_TTL_MIN || 120);

      if (!BQ_PROJECT_ID) {
        throw new Error("Missing BigQuery env var: BQ_PROJECT_ID");
      }

      const tableId = 'meta_health';
      const stageId = `meta_health_stage_${randomId ? randomId() : Math.random().toString(16).slice(2,10)}`;

      // Schema for health data
      const META_HEALTH_SCHEMA = [
        {name:"account_id", type:"STRING", mode:"NULLABLE"},
        {name:"referrer_domain", type:"STRING", mode:"NULLABLE"},
        {name:"ad_account_id", type:"STRING", mode:"NULLABLE"},
        {name:"retrieved_at", type:"TIMESTAMP", mode:"REQUIRED"},
        {name:"date", type:"DATE", mode:"NULLABLE"},
        {name:"campaign_id", type:"STRING", mode:"NULLABLE"},
        {name:"campaign_name", type:"STRING", mode:"NULLABLE"},
        {name:"adset_id", type:"STRING", mode:"NULLABLE"},
        {name:"adset_name", type:"STRING", mode:"NULLABLE"},
        {name:"ad_id", type:"STRING", mode:"NULLABLE"},
        {name:"ad_name", type:"STRING", mode:"NULLABLE"},
        // Breakdown dimensions (NULL = total/aggregated)
        {name:"publisher_platform", type:"STRING", mode:"NULLABLE"},
        {name:"platform_position", type:"STRING", mode:"NULLABLE"},
        {name:"impression_device", type:"STRING", mode:"NULLABLE"},
        // Metrics
        {name:"reach", type:"INTEGER", mode:"NULLABLE"},
        {name:"impressions", type:"INTEGER", mode:"NULLABLE"},
        {name:"frequency", type:"FLOAT", mode:"NULLABLE"},
        {name:"spend", type:"FLOAT", mode:"NULLABLE"},
        {name:"clicks", type:"INTEGER", mode:"NULLABLE"},
        {name:"cpc", type:"FLOAT", mode:"NULLABLE"},
        {name:"cpm", type:"FLOAT", mode:"NULLABLE"},
        {name:"ctr", type:"FLOAT", mode:"NULLABLE"},
        {name:"cpp", type:"FLOAT", mode:"NULLABLE"},
        // Metadata
        {name:"is_breakdown", type:"BOOLEAN", mode:"NULLABLE"},
        {name:"level", type:"STRING", mode:"NULLABLE"}  // 'campaign', 'adset', 'ad'
      ];

      // Auth for BigQuery
      const bqToken = await googleAccessToken(env, ["https://www.googleapis.com/auth/bigquery"]);

      // Ensure target table exists (partition on date)
      await ensureBQTable(bqToken, { ...env, BQ_DATASET: BQ_DATASET }, tableId, META_HEALTH_SCHEMA, "date", ["ad_account_id","campaign_id","adset_id","ad_id"]);
      
      // Add missing columns to existing table (schema migration)
      if (schemaMigrate) {
        await bqAddMissingColumns(bqToken, { ...env, BQ_DATASET: BQ_DATASET }, tableId, META_HEALTH_SCHEMA).catch(()=>{});
      }
      
      // Remove any expiration on permanent table
      await bqSetNoExpiry(bqToken, { ...env, BQ_DATASET: BQ_DATASET }, tableId, /*logs*/null).catch(()=>{});

      // Retrieved timestamp (stable for this run)
      const retrievedAt = new Date().toISOString();

      // Convert rows to objects for load
      const objects = insightsData.map(r => ({
        account_id: accountKey,
        referrer_domain: referrerDomain,
        ad_account_id: r.ad_account_id,
        retrieved_at: retrievedAt,
        date: r.date,
        campaign_id: r.campaign_id || null,
        campaign_name: r.campaign_name || null,
        adset_id: r.adset_id || null,
        adset_name: r.adset_name || null,
        ad_id: r.ad_id || null,
        ad_name: r.ad_name || null,
        publisher_platform: r.publisher_platform || null,
        platform_position: r.platform_position || null,
        impression_device: r.impression_device || null,
        reach: r.reach || null,
        impressions: r.impressions || null,
        frequency: r.frequency || null,
        spend: r.spend || null,
        clicks: r.clicks || null,
        cpc: r.cpc || null,
        cpm: r.cpm || null,
        ctr: r.ctr || null,
        cpp: r.cpp || null,
        is_breakdown: r.is_breakdown,
        level: r.level
      }));

      // Create stage table (TTL) and load NDJSON
      await bqCreateStageTable(bqToken, { ...env, BQ_DATASET: BQ_DATASET, BQ_LOCATION: BQ_LOCATION }, stageId, META_HEALTH_SCHEMA, "date", ["ad_account_id","campaign_id"], BQ_STAGE_TTL_MIN);
      await bqLoadJson(bqToken, { ...env, BQ_DATASET: BQ_DATASET, BQ_LOCATION: BQ_LOCATION }, stageId, objects, META_HEALTH_SCHEMA, /*logs*/null);

      // Merge stage → target; dedupe keys, last retrieved_at wins
      const sql = mergeSQL({
        project: BQ_PROJECT_ID,
        dataset: BQ_DATASET,
        table: tableId,
        stage: stageId,
        keyFields: ["account_id","ad_account_id","campaign_id","adset_id","ad_id","date","publisher_platform","platform_position","impression_device","is_breakdown"],
        nonKeyFields: [
          "referrer_domain","campaign_name","adset_name","ad_name",
          "reach","impressions","frequency","spend","clicks","cpc","cpm","ctr","cpp","level","retrieved_at"
        ],
      });
      await bqQuery(bqToken, { ...env, BQ_DATASET: BQ_DATASET, BQ_LOCATION: BQ_LOCATION }, sql, /*logs*/null);

      // Cleanup stage (best-effort)
      await bqDropTable(bqToken, { ...env, BQ_DATASET: BQ_DATASET }, stageId).catch(()=>{});

      return `Loaded ${objects.length} health rows to BigQuery ${BQ_PROJECT_ID}.${BQ_DATASET}.meta_health (${sinceStr} to ${untilStr})`;
    }

    // === ORIGINAL FLOW (structure → META_Acc_Info) ===
    const now = new Date().toISOString();
    const graphUrl = `https://graph.facebook.com/v23.0/me?fields=adaccounts{campaigns{name,id,status,configured_status,effective_status,adsets{name,id,status,configured_status,effective_status,ads{id,name,status,configured_status,effective_status}}}}`;

    const fbRes = await fetch(graphUrl, {
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        Referer: config.eventSourceUrl
      }
    });
    const fbJson = await fbRes.json();
    if (!fbRes.ok || fbJson.error) {
      throw new Error(`FB API Error: ${fbJson.error?.message || fbRes.statusText}`);
    }

    const adaccounts = fbJson.adaccounts?.data || [];
    const rows = [];
    for (const acct of adaccounts) {
      const common = [accountId, config.eventSourceUrl, acct.id || "", now];
      const nestedRows = await processAccountData(acct, common, config.accessToken);
      rows.push(...nestedRows);
    }

    const HEADERS = [
      "account_id", "referrer_domain", "ad_account_id", "retrieved_at",
      "campaign_id", "campaign_name", "campaign_status", "campaign_configured_status", "campaign_effective_status",
      "adset_id", "adset_name", "adset_status", "adset_configured_status", "adset_effective_status",
      "ad_id", "ad_name", "ad_status", "ad_configured_status", "ad_effective_status"
    ];

    const paddedRows = rows.map(row => {
      const r = [...row];
      while (r.length < HEADERS.length) r.push("");
      return r;
    });

    await ensureHeaders(baseSheetURL, access_token, "META_Acc_Info", HEADERS);
    const appendResp = await fetch(`${baseSheetURL}/META_Acc_Info:append?valueInputOption=USER_ENTERED`, {
      method: "POST",
      headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ values: paddedRows })
    });
    if (!appendResp.ok) {
      throw new Error(`Sheet append failed: ${await appendResp.text()}`);
    }

    return `Appended ${paddedRows.length} rows for ${accountId} to META_Acc_Info`;
}

// ================= Helper Functions (existing + new) =================

async function fetchAllPages(nextUrl, initialData, accessToken) {
  const all = [...(initialData || [])];
  let next = nextUrl;
  while (next) {
    const res = await fetch(next, { headers: { Authorization: `Bearer ${accessToken}` } });
    const json = await res.json();
    if (!res.ok || json.error) break;
    all.push(...(json.data || []));
    next = json.paging?.next || null;
  }
  return all;
}

async function processAccountData(acct, common, accessToken) {
  const rows = [];
  const campaigns = await fetchAllPages(acct.campaigns?.paging?.next, acct.campaigns?.data || [], accessToken);
  for (const campaign of campaigns) {
    const campaignMeta = [
      campaign.id, campaign.name,
      campaign.status, campaign.configured_status, campaign.effective_status
    ];
    const adsets = await fetchAllPages(campaign.adsets?.paging?.next, campaign.adsets?.data || [], accessToken);
    for (const adset of adsets) {
      const adsetMeta = [
        adset.id, adset.name,
        adset.status, adset.configured_status, adset.effective_status
      ];
      const ads = await fetchAllPages(adset.ads?.paging?.next, adset.ads?.data || [], accessToken);
      for (const ad of ads) {
        const adMeta = [
          ad.id, ad.name,
          ad.status, ad.configured_status, ad.effective_status
        ];
        rows.push([...common, ...campaignMeta, ...adsetMeta, ...adMeta]);
      }
    }
  }
  return rows;
}

// ---------- NEW: activities flow ----------
async function getActivitiesRows(config, accountKey) {
  // derive since/until from query string or default last 7 days
  const url = new URL(globalThis.location ? globalThis.location.href : "https://dummy/");
  const qsSince = url.searchParams.get("since"); // YYYY-MM-DD
  const qsUntil = url.searchParams.get("until"); // YYYY-MM-DD

  const now = new Date();
  const defaultUntil = now.toISOString().slice(0, 10);
  const defaultSince = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const sinceStr = (qsSince || defaultSince);
  const untilStr = (qsUntil || defaultUntil);

  // Step 1: same /me?fields=adaccounts to enumerate accounts
  const meUrl = `https://graph.facebook.com/v23.0/me?fields=adaccounts{id,name}`;
  const meRes = await fetch(meUrl, {
    headers: { Authorization: `Bearer ${config.accessToken}`, Referer: config.eventSourceUrl }
  });
  const meJson = await meRes.json();
  if (!meRes.ok || meJson.error) {
    throw new Error(`FB API Error: ${meJson.error?.message || meRes.statusText}`);
  }

  const adaccounts = meJson.adaccounts?.data || [];
  const headers = [
    "account_id", "referrer_domain", "ad_account_id", "retrieved_at",
    "event_time", "event_type", "translated_event_type",
    "object_type", "object_id", "object_name",
    "actor_name", "application_name", "extra_data_json"
  ];

  const retrievedAt = new Date().toISOString();
  const rows = [];

  const FIELDS = "actor_name,application_name,extra_data,object_name,event_time,event_type,object_id,object_type,translated_event_type";

  const adAccountIds = [];
  for (const acct of adaccounts) {
    const actId = acct.id; // already in act_XXXX form
    if (actId) adAccountIds.push(actId);
    try {
      // Initial page
      const firstUrl =
        `https://graph.facebook.com/v23.0/${actId}/activities` +
        `?limit=200&since=${encodeURIComponent(sinceStr)}&until=${encodeURIComponent(untilStr)}` +
        `&fields=${encodeURIComponent(FIELDS)}`;

      let next = firstUrl;
      while (next) {
        const res = await fetch(next, { headers: { Authorization: `Bearer ${config.accessToken}` } });
        const json = await res.json();
        if (!res.ok || json.error) {
          // continue with other accounts
          console.warn("Activities fetch error", actId, json.error || res.statusText);
          break;
        }
        const data = json.data || [];
        for (const item of data) {
          rows.push([
            // meta columns
            accountKey || getAccountKeyFromReferer(config.eventSourceUrl), // account_id key (FRM-xxxxx)
            config.eventSourceUrl,
            actId,
            retrievedAt,
            // activity fields
            item.event_time || "",
            item.event_type || "",
            item.translated_event_type || "",
            item.object_type || "",
            item.object_id || "",
            item.object_name || "",
            item.actor_name || "",
            item.application_name || "",
            typeof item.extra_data === "string" ? item.extra_data : JSON.stringify(item.extra_data || {})
          ]);
        }
        next = json.paging?.next || null;
      }
    } catch (e) {
      // continue on any single-account failure
      console.warn("Activities loop error", actId, e.message);
    }
  }

  return { rows, headers, sinceStr, untilStr, adAccountIds, referrerDomain: config.eventSourceUrl, accountKey };
}

// ---------- NEW: targeting data flow ----------
async function getTargetingData(config, accountKey) {
  // Step 1: enumerate ad accounts
  const meUrl = `https://graph.facebook.com/v23.0/me?fields=adaccounts{id,name}`;
  const meRes = await fetch(meUrl, {
    headers: { Authorization: `Bearer ${config.accessToken}`, Referer: config.eventSourceUrl }
  });
  const meJson = await meRes.json();
  if (!meRes.ok || meJson.error) {
    throw new Error(`FB API Error: ${meJson.error?.message || meRes.statusText}`);
  }

  const adaccounts = meJson.adaccounts?.data || [];
  const rows = [];
  const adAccountIds = [];

  const FIELDS = "campaigns{adsets{targeting,targetingsentencelines,name,campaign_id,source_adset_id,ads{creative_asset_groups_spec,name,status,configured_status,effective_status},status,configured_status,effective_status},primary_attribution,objective,name,status,configured_status,effective_status}";

  for (const acct of adaccounts) {
    const actId = acct.id; // already in act_XXXX form
    if (actId) adAccountIds.push(actId);
    
    try {
      // Fetch campaigns with nested adsets
      const targetingUrl = `https://graph.facebook.com/v23.0/${actId}?fields=${encodeURIComponent(FIELDS)}`;
      
      const res = await fetch(targetingUrl, { 
        headers: { 
          Authorization: `Bearer ${config.accessToken}`,
          Referer: config.eventSourceUrl
        } 
      });
      const json = await res.json();
      
      if (!res.ok || json.error) {
        console.warn("Targeting fetch error", actId, json.error || res.statusText);
        continue;
      }

      const campaigns = json.campaigns?.data || [];
      
      // Handle pagination for campaigns
      let campaignsNextUrl = json.campaigns?.paging?.next;
      const allCampaigns = [...campaigns];
      
      while (campaignsNextUrl) {
        const pageRes = await fetch(campaignsNextUrl, { 
          headers: { Authorization: `Bearer ${config.accessToken}` } 
        });
        const pageJson = await pageRes.json();
        if (!pageRes.ok || pageJson.error) break;
        allCampaigns.push(...(pageJson.data || []));
        campaignsNextUrl = pageJson.paging?.next || null;
      }

      // Process each campaign
      for (const campaign of allCampaigns) {
        const campaignId = campaign.id || "";
        const campaignName = campaign.name || "";
        const campaignObjective = campaign.objective || "";
        const campaignPrimaryAttribution = campaign.primary_attribution || "";
        const campaignStatus = campaign.status || "";
        const campaignConfiguredStatus = campaign.configured_status || "";
        const campaignEffectiveStatus = campaign.effective_status || "";
        
        const adsets = campaign.adsets?.data || [];
        
        // Handle pagination for adsets within campaign
        let adsetsNextUrl = campaign.adsets?.paging?.next;
        const allAdsets = [...adsets];
        
        while (adsetsNextUrl) {
          const adsetsPageRes = await fetch(adsetsNextUrl, { 
            headers: { Authorization: `Bearer ${config.accessToken}` } 
          });
          const adsetsPageJson = await adsetsPageRes.json();
          if (!adsetsPageRes.ok || adsetsPageJson.error) break;
          allAdsets.push(...(adsetsPageJson.data || []));
          adsetsNextUrl = adsetsPageJson.paging?.next || null;
        }

        // Process each adset
        for (const adset of allAdsets) {
          // Collect all ads (handle pagination)
          const ads = adset.ads?.data || [];
          let adsNextUrl = adset.ads?.paging?.next;
          
          while (adsNextUrl) {
            const adsRes = await fetch(adsNextUrl, { 
              headers: { Authorization: `Bearer ${config.accessToken}` } 
            });
            const adsJson = await adsRes.json();
            if (!adsRes.ok || adsJson.error) break;
            ads.push(...(adsJson.data || []));
            adsNextUrl = adsJson.paging?.next || null;
          }

          rows.push({
            ad_account_id: actId,
            campaign_id: campaignId,
            campaign_name: campaignName,
            campaign_objective: campaignObjective,
            campaign_primary_attribution: campaignPrimaryAttribution,
            campaign_status: campaignStatus,
            campaign_configured_status: campaignConfiguredStatus,
            campaign_effective_status: campaignEffectiveStatus,
            adset_id: adset.id || "",
            adset_name: adset.name || "",
            source_adset_id: adset.source_adset_id || "",
            adset_status: adset.status || "",
            adset_configured_status: adset.configured_status || "",
            adset_effective_status: adset.effective_status || "",
            targeting: adset.targeting || null,
            targetingsentencelines: adset.targetingsentencelines || null,
            ads_json: ads.length > 0 ? JSON.stringify(ads) : null
          });
        }
      }
    } catch (e) {
      console.warn("Targeting loop error", actId, e.message);
    }
  }

  return { 
    rows, 
    adAccountIds, 
    referrerDomain: config.eventSourceUrl, 
    accountKey 
  };
}

// Helper to parse targeting sentence lines into categorized fields
function parseTargetingSentenceLines(tslObj) {
  const result = {
    custom_audience: null,
    excluding_custom_audience: null,
    location: null,
    age: null,
    gender: null,
    placements: null,
    languages: null,
    interests: null,
    behaviors: null,
    connections: null,
    advantage_custom_audience: null,
    advantage_audience: null,
    other: null
  };
  
  if (!tslObj || !tslObj.targetingsentencelines) {
    return result;
  }
  
  const lines = tslObj.targetingsentencelines;
  const otherLines = [];
  
  for (const line of lines) {
    const content = (line.content || "").toLowerCase().trim();
    const children = line.children || [];
    const childrenText = children.join('; ');
    
    // Map content types to fields
    if (content.includes('custom audience:') && !content.includes('excluding') && !content.includes('advantage')) {
      result.custom_audience = childrenText;
    } else if (content.includes('excluding custom audience:')) {
      result.excluding_custom_audience = childrenText;
    } else if (content.includes('location:')) {
      result.location = childrenText;
    } else if (content.includes('age:')) {
      result.age = childrenText;
    } else if (content.includes('gender:')) {
      result.gender = childrenText;
    } else if (content.includes('placement')) {
      result.placements = childrenText;
    } else if (content.includes('language')) {
      result.languages = childrenText;
    } else if (content.includes('interest')) {
      result.interests = childrenText;
    } else if (content.includes('behavior')) {
      result.behaviors = childrenText;
    } else if (content.includes('connection')) {
      result.connections = childrenText;
    } else if (content.includes('advantage+ custom audience:') || content.includes('advantage plus custom audience')) {
      result.advantage_custom_audience = childrenText;
    } else if (content.includes('advantage+ audience:') || content.includes('advantage plus audience')) {
      result.advantage_audience = childrenText;
    } else {
      // Store anything else
      otherLines.push(`${line.content}: ${childrenText}`);
    }
  }
  
  if (otherLines.length > 0) {
    result.other = otherLines.join(' | ');
  }
  
  return result;
}

// ---------- NEW: insights data flow ----------
async function getInsightsData(config, accountKey, url) {
  // Derive since/until from query string or default last 7 days
  const qsSince = url?.searchParams?.get("since"); // YYYY-MM-DD
  const qsUntil = url?.searchParams?.get("until"); // YYYY-MM-DD

  const now = new Date();
  const defaultUntil = now.toISOString().slice(0, 10);
  const defaultSince = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const sinceStr = (qsSince || defaultSince);
  const untilStr = (qsUntil || defaultUntil);

  // Step 1: enumerate ad accounts and get structure
  const meUrl = `https://graph.facebook.com/v23.0/me?fields=adaccounts{id,name,campaigns{id,name,adsets{id,name,ads{id,name}}}}`;
  const meRes = await fetch(meUrl, {
    headers: { Authorization: `Bearer ${config.accessToken}`, Referer: config.eventSourceUrl }
  });
  const meJson = await meRes.json();
  if (!meRes.ok || meJson.error) {
    throw new Error(`FB API Error: ${meJson.error?.message || meRes.statusText}`);
  }

  const adaccounts = meJson.adaccounts?.data || [];
  const rows = [];
  const adAccountIds = [];

  // Metrics to retrieve
  const METRICS = "reach,impressions,frequency,spend,clicks,cpc,cpm,ctr,cpp";
  const BREAKDOWNS = "publisher_platform,platform_position,impression_device";

  for (const acct of adaccounts) {
    const actId = acct.id; // already in act_XXXX form
    if (actId) adAccountIds.push(actId);
    
    try {
      const campaigns = acct.campaigns?.data || [];
      
      // OPTIMIZATION: Only fetch ad-level data (most granular)
      // Campaign and adset totals can be calculated in BigQuery by aggregating ad data
      // This reduces API calls significantly
      
      // Collect all ads with their context
      const adsToFetch = [];
      for (const campaign of campaigns) {
        const campaignId = campaign.id;
        const campaignName = campaign.name;
        
        const adsets = campaign.adsets?.data || [];
        for (const adset of adsets) {
          const adsetId = adset.id;
          const adsetName = adset.name;
          
          const ads = adset.ads?.data || [];
          for (const ad of ads) {
            adsToFetch.push({
              adId: ad.id,
              adName: ad.name,
              adsetId,
              adsetName,
              campaignId,
              campaignName,
              actId
            });
          }
        }
      }
      
      // Fetch ads in parallel batches (10 at a time to avoid rate limits)
      const BATCH_SIZE = 10;
      for (let i = 0; i < adsToFetch.length; i += BATCH_SIZE) {
        const batch = adsToFetch.slice(i, i + BATCH_SIZE);
        
        // Process batch in parallel
        const batchPromises = batch.map(async (adContext) => {
          const { adId, adName, adsetId, adsetName, campaignId, campaignName, actId } = adContext;
          
          try {
            // Fetch total and breakdown in parallel for this ad
            const [totalRes, breakdownRes] = await Promise.all([
              fetch(`https://graph.facebook.com/v23.0/${adId}/insights?fields=${METRICS}&time_range=${encodeURIComponent(JSON.stringify({since: sinceStr, until: untilStr}))}&time_increment=1`, {
                headers: { Authorization: `Bearer ${config.accessToken}` }
              }),
              fetch(`https://graph.facebook.com/v23.0/${adId}/insights?fields=${METRICS}&breakdowns=${BREAKDOWNS}&time_range=${encodeURIComponent(JSON.stringify({since: sinceStr, until: untilStr}))}&time_increment=1`, {
                headers: { Authorization: `Bearer ${config.accessToken}` }
              })
            ]);
            
            const adRows = [];
            
            // Process total insights
            if (totalRes.ok) {
              const totalJson = await totalRes.json();
              if (!totalJson.error) {
                const adData = totalJson.data || [];
                for (const insight of adData) {
                  adRows.push({
                    ad_account_id: actId,
                    campaign_id: campaignId,
                    campaign_name: campaignName,
                    adset_id: adsetId,
                    adset_name: adsetName,
                    ad_id: adId,
                    ad_name: adName,
                    date: insight.date_start,
                    publisher_platform: null,
                    platform_position: null,
                    impression_device: null,
                    reach: parseInt(insight.reach || 0),
                    impressions: parseInt(insight.impressions || 0),
                    frequency: parseFloat(insight.frequency || 0),
                    spend: parseFloat(insight.spend || 0),
                    clicks: parseInt(insight.clicks || 0),
                    cpc: parseFloat(insight.cpc || 0),
                    cpm: parseFloat(insight.cpm || 0),
                    ctr: parseFloat(insight.ctr || 0),
                    cpp: parseFloat(insight.cpp || 0),
                    is_breakdown: false,
                    level: 'ad'
                  });
                }
              }
            }
            
            // Process breakdown insights
            if (breakdownRes.ok) {
              const breakdownJson = await breakdownRes.json();
              if (!breakdownJson.error) {
                const breakdownData = breakdownJson.data || [];
                for (const insight of breakdownData) {
                  adRows.push({
                    ad_account_id: actId,
                    campaign_id: campaignId,
                    campaign_name: campaignName,
                    adset_id: adsetId,
                    adset_name: adsetName,
                    ad_id: adId,
                    ad_name: adName,
                    date: insight.date_start,
                    publisher_platform: insight.publisher_platform || null,
                    platform_position: insight.platform_position || null,
                    impression_device: insight.impression_device || null,
                    reach: parseInt(insight.reach || 0),
                    impressions: parseInt(insight.impressions || 0),
                    frequency: parseFloat(insight.frequency || 0),
                    spend: parseFloat(insight.spend || 0),
                    clicks: parseInt(insight.clicks || 0),
                    cpc: parseFloat(insight.cpc || 0),
                    cpm: parseFloat(insight.cpm || 0),
                    ctr: parseFloat(insight.ctr || 0),
                    cpp: parseFloat(insight.cpp || 0),
                    is_breakdown: true,
                    level: 'ad'
                  });
                }
              }
            }
            
            return adRows;
          } catch (err) {
            console.warn(`Failed to fetch insights for ad ${adId}:`, err.message);
            return [];
          }
        });
        
        // Wait for batch to complete and collect rows
        const batchResults = await Promise.all(batchPromises);
        for (const adRows of batchResults) {
          rows.push(...adRows);
        }
      }
    } catch (e) {
      console.warn("Insights loop error", actId, e.message);
    }
  }

  return { 
    rows, 
    adAccountIds, 
    referrerDomain: config.eventSourceUrl, 
    accountKey,
    sinceStr,
    untilStr
  };
}

// pull the FRM-xxxxx back out of the config scope
function getAccountKeyFromReferer(_ref) {
  // In this Worker, we don't have the FRM key on hand here; infer from URL is unreliable.
  // Instead, read it from the original request URL (?account=FRM-xxxxx) via global location.
  const u = new URL(globalThis.location ? globalThis.location.href : "https://dummy/");
  return u.searchParams.get("account") || "";
}

// ---------- Sheets helpers (shared) ----------
async function ensureHeaders(baseSheetURL, access_token, tabName, HEADERS) {
  const headerRange = `${tabName}!A1:${String.fromCharCode(64 + HEADERS.length)}1`;
  const existingHeaderResp = await fetch(`${baseSheetURL}/${headerRange}`, {
    headers: { Authorization: `Bearer ${access_token}` }
  });
  let shouldWriteHeaders = false;
  if (!existingHeaderResp.ok) {
    shouldWriteHeaders = true;
  } else {
    const data = await existingHeaderResp.json();
    const existing = data.values?.[0] || [];
    if (existing.length !== HEADERS.length || existing.some((h, i) => h !== HEADERS[i])) {
      shouldWriteHeaders = true;
    }
  }
  if (shouldWriteHeaders) {
    await fetch(`${baseSheetURL}/${tabName}!A1:append?valueInputOption=RAW`, {
      method: "POST",
      headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ values: [HEADERS] })
    });
  }
}

async function appendRows(baseSheetURL, access_token, tabName, rows) {
  const resp = await fetch(`${baseSheetURL}/${tabName}:append?valueInputOption=USER_ENTERED`, {
    method: "POST",
    headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ values: rows })
  });
  if (!resp.ok) {
    throw new Error(`Sheet append failed: ${await resp.text()}`);
  }
}

/** ===================== BIGQUERY HELPERS (reused) ===================== **/
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
  if (!res.ok && res.status !== 409) throw new Error(`bqCreateTable ${tableId} failed: ${res.text || res.json}`);
  return true;
}
async function ensureBQTable(token, env, tableId, schemaFields, partitionField, clusterFields) {
  const exists = await bqGetTable(token, env, tableId);
  if (exists.status === 404) {
    await bqCreateTable(token, env, tableId, schemaFields, partitionField, clusterFields, /*labels*/{permanent:"true"}, /*expiration*/null);
  }
}
async function bqAddMissingColumns(token, env, tableId, desiredSchema) {
  const { BQ_PROJECT_ID, BQ_DATASET } = env;
  const existing = await bqGetTable(token, env, tableId);
  if (!existing.ok || !existing.json) return;
  
  const currentFields = existing.json.schema?.fields || [];
  const currentFieldNames = new Set(currentFields.map(f => f.name));
  
  const missingFields = desiredSchema.filter(f => !currentFieldNames.has(f.name));
  
  if (missingFields.length === 0) return;
  
  // Add each missing column via ALTER TABLE
  for (const field of missingFields) {
    const modeStr = field.mode === "REQUIRED" ? "NOT NULL" : "";
    const alterSql = `
      ALTER TABLE \`${BQ_PROJECT_ID}.${BQ_DATASET}.${tableId}\`
      ADD COLUMN IF NOT EXISTS ${field.name} ${field.type} ${modeStr}
    `.trim();
    try {
      await bqQuery(token, env, alterSql, /*logs*/null);
    } catch (e) {
      console.warn(`Failed to add column ${field.name}:`, e.message);
    }
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
  const withRef = {
    jobReference: {
      projectId: BQ_PROJECT_ID,
      location: BQ_LOCATION || "US",
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
  const location = env.BQ_LOCATION || "US";
  const job = await bqJobInsert(token, env, {
    configuration: {
      query: {
        query: sql,
        useLegacySql: false
      }
    }
  });
  const jobId = job?.jobReference?.jobId;
  await bqPollJob(token, env, jobId, location);
  if (returnRows) {
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
    return rows;
  }
  logs && logs.push(`Query OK: ${sql.split('\n').join(' ').slice(0,140)}...`);
  return true;
}
async function bqLoadJson(token, env, tableId, objects, schemaFields, logs) {
  if (!objects || !objects.length) {
    return 0;
  }
  const ndjson = objects.map(o => JSON.stringify(o)).join('\n');
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
  const metaPart =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(meta)}\r\n`;
  const fileHeader =
    `--${boundary}\r\n` +
    `Content-Type: application/octet-stream\r\n\r\n`;
  const endPart = `\r\n--${boundary}--\r\n`;
  const body = concatUint8Arrays([
    encoder.encode(metaPart),
    encoder.encode(fileHeader),
    encoder.encode(ndjson),
    encoder.encode(endPart),
  ]);
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
    throw new Error(`bqLoadJson failed: ${JSON.stringify(json)}`);
  }
  const jobId = json?.jobReference?.jobId;
  await bqPollJob(token, env, jobId, env.BQ_LOCATION || "US", 180000);
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