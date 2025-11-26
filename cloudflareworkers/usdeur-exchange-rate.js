/**
 * USD to EUR Exchange Rate Fetcher
 * Fetches daily USD to EUR exchange rates and saves to BigQuery
 * 
 * Usage:
 * - GET / - Fetches last 7 days (default)
 * - GET /?mode=recent&days=3 - Fetches last N days
 * - GET /?mode=backfill&start_date=2024-01-01&end_date=2024-01-31 - Backfill date range
 * - GET /?mode=year&year=2024 - Fetches all dates for a year
 * - Scheduled: Runs daily via cron (fetches last 3 days)
 * 
 * BigQuery Table: level-hope-462409-a8.utils.usdeur
 * Schema:
 *   - date: DATE (the date of the exchange rate)
 *   - rate: NUMERIC (USD to EUR conversion rate)
 *   - retrieved_at: TIMESTAMP (when the data was fetched)
 * 
 * Required Environment Variables:
 * - BQ_PROJECT_ID: BigQuery project ID (e.g., "level-hope-462409-a8")
 * - BQ_DATASET: BigQuery dataset (e.g., "utils")
 * - GS_CLIENT_EMAIL: Google Service Account email
 * - GS_PRIVATE_KEY: Google Service Account private key
 * 
 * Optional Environment Variables:
 * - EXCHANGE_RATE_API_KEY: API key for exchangerate-api.io (better historical data)
 * - FIXER_API_KEY: API key for fixer.io (fallback)
 */

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env, ctx);
  },

  async scheduled(event, env, ctx) {
    // Scheduled trigger - fetch last 3 days of data
    const url = new URL("https://worker-cron/trigger");
    url.searchParams.set("mode", "recent");
    url.searchParams.set("days", "3");
    const req = new Request(url.toString(), {
      method: "GET",
      headers: {
        "cf-worker-cron": "true"
      }
    });
    return await handleRequest(req, env, ctx);
  }
};

async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);
  const isCron = request.headers.get("cf-worker-cron") === "true";
  
  // Modes: "recent" (last N days), "year" (all dates for year), "backfill" (specific date range)
  const mode = url.searchParams.get("mode") || (isCron ? "recent" : "recent");
  const days = parseInt(url.searchParams.get("days")) || (mode === "recent" ? 7 : null);
  // Use UTC to get correct year
  const year = parseInt(url.searchParams.get("year")) || new Date().getUTCFullYear();
  const startDate = url.searchParams.get("start_date"); // YYYY-MM-DD for backfill
  const endDate = url.searchParams.get("end_date"); // YYYY-MM-DD for backfill
  
  const logs = [];
  const errors = [];
  
  try {
    logs.push(`Starting USD/EUR exchange rate fetch - mode: ${mode}, year: ${year}`);
    
    // Debug: Check environment variables
    logs.push(`BQ_PROJECT_ID: ${env.BQ_PROJECT_ID ? 'SET' : 'MISSING'}`);
    logs.push(`BQ_DATASET: ${env.BQ_DATASET ? 'SET' : 'MISSING'}`);
    logs.push(`GS_CLIENT_EMAIL: ${env.GS_CLIENT_EMAIL ? 'SET (' + env.GS_CLIENT_EMAIL.substring(0, 20) + '...)' : 'MISSING'}`);
    logs.push(`GS_PRIVATE_KEY: ${env.GS_PRIVATE_KEY ? 'SET (' + env.GS_PRIVATE_KEY.length + ' chars)' : 'MISSING'}`);
    logs.push(`EXCHANGE_RATE_API_KEY: ${env.EXCHANGE_RATE_API_KEY ? 'SET (' + env.EXCHANGE_RATE_API_KEY.substring(0, 10) + '...)' : 'MISSING'}`);
    
    // Get Google access token for BigQuery
    const scopes = ["https://www.googleapis.com/auth/bigquery"];
    let accessToken;
    try {
      accessToken = await googleAccessToken(env, scopes);
    } catch (error) {
      errors.push(`Google authentication failed: ${error.message}`);
      return new Response(`Error: ${errors.join(", ")}\n${logs.join("\n")}`, { status: 500 });
    }
    
    if (!accessToken) {
      errors.push("Google authentication failed: No access token returned");
      return new Response(`Error: ${errors.join(", ")}\n${logs.join("\n")}`, { status: 500 });
    }
    
    logs.push("Google authentication successful");
    
    // Ensure BigQuery dataset exists
    const datasetCheck = await bqGetDataset(accessToken, env);
    if (datasetCheck.status === 404) {
      logs.push(`BigQuery dataset ${env.BQ_DATASET} does not exist, creating...`);
      await bqCreateDataset(accessToken, env);
      logs.push(`BigQuery dataset ${env.BQ_DATASET} created`);
    } else if (datasetCheck.status !== 200) {
      throw new Error(`Failed to check/create dataset: HTTP ${datasetCheck.status}`);
    } else {
      logs.push(`BigQuery dataset ${env.BQ_DATASET} exists`);
    }
    
    // Ensure BigQuery table exists
    const tableId = "usdeur";
    const schemaFields = [
      { name: "date", type: "DATE", mode: "NULLABLE" },
      { name: "rate", type: "NUMERIC", mode: "NULLABLE" },
      { name: "retrieved_at", type: "TIMESTAMP", mode: "NULLABLE" }
    ];
    
    await ensureBQTable(accessToken, env, tableId, schemaFields);
    logs.push(`BigQuery table ${tableId} verified/created`);
    
    // Generate date ranges based on mode
    let datesToFetch = [];
    
    if (mode === "recent" && days) {
      // Fetch last N days (excluding today, as it may not be complete)
      // Use UTC to avoid timezone issues
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      for (let i = 1; i <= days; i++) {
        const date = new Date(today);
        date.setUTCDate(today.getUTCDate() - i);
        datesToFetch.push(date);
      }
      logs.push(`Mode: recent - fetching last ${days} days`);
    } else if (mode === "backfill" && startDate && endDate) {
      // Backfill specific date range
      const start = new Date(startDate + 'T00:00:00Z'); // Parse as UTC
      const end = new Date(endDate + 'T00:00:00Z');
      let currentDate = new Date(start);
      while (currentDate <= end) {
        datesToFetch.push(new Date(currentDate));
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      }
      logs.push(`Mode: backfill - fetching from ${startDate} to ${endDate}`);
    } else if (mode === "year") {
      // Fetch all dates for the specified year
      const yearStart = new Date(Date.UTC(year, 0, 1)); // January 1st UTC
      const yearEnd = new Date(Date.UTC(year, 11, 31)); // December 31st UTC
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const actualEndDate = yearEnd > today ? today : yearEnd;
      
      let currentDate = new Date(yearStart);
      while (currentDate <= actualEndDate) {
        datesToFetch.push(new Date(currentDate));
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      }
      logs.push(`Mode: year - fetching all dates for ${year}`);
    } else {
      // Default: last 7 days
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      for (let i = 1; i <= 7; i++) {
        const date = new Date(today);
        date.setUTCDate(today.getUTCDate() - i);
        datesToFetch.push(date);
      }
      logs.push(`Mode: default - fetching last 7 days`);
    }
    
    logs.push(`Fetching exchange rates for ${datesToFetch.length} date(s)`);
    
    // Fetch exchange rates for each date
    const exchangeRates = [];
    const now = new Date().toISOString();
    let successCount = 0;
    let failCount = 0;
    
    for (const date of datesToFetch) {
      try {
        const rate = await fetchExchangeRate(date, env);
        if (rate !== null && !isNaN(rate) && rate > 0) {
          // Round to 6 decimal places for BigQuery NUMERIC type
          const roundedRate = Math.round(rate * 1000000) / 1000000;
          exchangeRates.push({
            date: formatDate(date),
            rate: roundedRate,
            retrieved_at: now
          });
          successCount++;
          logs.push(`✓ Fetched rate for ${formatDate(date)}: ${roundedRate}`);
        } else {
          failCount++;
          errors.push(`Failed to fetch rate for ${formatDate(date)}: Invalid rate returned`);
        }
      } catch (error) {
        failCount++;
        errors.push(`Error fetching rate for ${formatDate(date)}: ${error.message}`);
      }
      
      // Progressive delay to avoid rate limiting (longer delays as we process more)
      const delay = Math.min(300 + (successCount * 10), 1000);
      await sleep(delay);
    }
    
    logs.push(`Fetch summary: ${successCount} succeeded, ${failCount} failed`);
    
    if (exchangeRates.length === 0) {
      return new Response(
        `No exchange rates fetched. Errors: ${errors.join(", ")}\n${logs.join("\n")}`,
        { status: 500 }
      );
    }
    
    logs.push(`Successfully fetched ${exchangeRates.length} exchange rate(s)`);
    
    // Deduplicate: Remove any rates we already have for these dates
    if (exchangeRates.length > 0) {
      try {
        const dateList = exchangeRates.map(r => `'${r.date}'`).join(',');
        const checkSql = `
          SELECT DISTINCT date 
          FROM \`${env.BQ_PROJECT_ID}\`.\`${env.BQ_DATASET}\`.\`${tableId}\`
          WHERE date IN (${dateList})
        `;
        const existingResult = await bqQuerySync(accessToken, env, checkSql);
        const existingDates = new Set();
        if (existingResult.rows) {
          for (const row of existingResult.rows) {
            const date = row.f?.[0]?.v;
            if (date) existingDates.add(date);
          }
        }
        
        const newRates = exchangeRates.filter(r => !existingDates.has(r.date));
        if (newRates.length < exchangeRates.length) {
          const skipped = exchangeRates.length - newRates.length;
          logs.push(`Skipping ${skipped} duplicate date(s), ${newRates.length} new rate(s) to insert`);
          exchangeRates.length = 0;
          exchangeRates.push(...newRates);
        }
      } catch (dedupError) {
        logs.push(`Deduplication check failed (continuing anyway): ${dedupError.message}`);
      }
    }
    
    if (exchangeRates.length === 0) {
      return new Response(
        `No new exchange rates to insert (all dates already exist in table).\n\n` +
        `Logs:\n${logs.join("\n")}\n\n` +
        (errors.length > 0 ? `Errors:\n${errors.join("\n")}\n` : ""),
        { status: 200, headers: { "content-type": "text/plain" } }
      );
    }
    
    // Load data to BigQuery
    const loadResult = await bqLoadJson(accessToken, env, tableId, exchangeRates, logs, null, schemaFields);
    logs.push(`BigQuery load completed: ${loadResult.outputRows} rows written`);
    
    return new Response(
      `Success!\n\n` +
      `Fetched ${exchangeRates.length} exchange rate(s)\n` +
      `Written ${loadResult.outputRows} row(s) to BigQuery\n\n` +
      `Logs:\n${logs.join("\n")}\n\n` +
      (errors.length > 0 ? `Errors:\n${errors.join("\n")}\n` : ""),
      { status: 200, headers: { "content-type": "text/plain" } }
    );
    
  } catch (error) {
    errors.push(`Fatal error: ${error.message}`);
    logs.push(`Stack trace: ${error.stack}`);
    return new Response(
      `Error: ${errors.join(", ")}\n\nLogs:\n${logs.join("\n")}`,
      { status: 500, headers: { "content-type": "text/plain" } }
    );
  }
}

// Fetch exchange rate for a specific date with multiple API fallbacks
async function fetchExchangeRate(date, env) {
  const dateStr = formatDate(date);
  // Use UTC date to avoid timezone issues
  const todayUTC = new Date();
  todayUTC.setUTCHours(0, 0, 0, 0);
  const today = formatDate(todayUTC);
  const isRecentDate = dateStr >= formatDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)); // Last 7 days
  
  // API providers in order of preference
  const apiProviders = [];
  
  // 1. exchangerate-api.com latest (ONLY for today's date, not historical)
  if (dateStr === today) {
    apiProviders.push({
      name: "exchangerate-api.com-latest",
      url: `https://api.exchangerate-api.com/v4/latest/USD`,
      parse: (data) => data.rates?.EUR ? parseFloat(data.rates.EUR) : null
    });
  }
  
  // 2. exchangerate-api.io (current rates only - free tier doesn't support historical)
  // Use /pair endpoint for current rate, /history requires paid plan
  if (env.EXCHANGE_RATE_API_KEY && dateStr === today) {
    apiProviders.push({
      name: "exchangerate-api.io-pair",
      url: `https://v6.exchangerate-api.com/v6/${env.EXCHANGE_RATE_API_KEY}/pair/USD/EUR`,
      parse: (data) => data.conversion_rate ? parseFloat(data.conversion_rate) : null
    });
  }
  
  // Try history endpoint anyway (might work for very recent dates or paid plans)
  if (env.EXCHANGE_RATE_API_KEY) {
    apiProviders.push({
      name: "exchangerate-api.io-history",
      url: `https://v6.exchangerate-api.com/v6/${env.EXCHANGE_RATE_API_KEY}/history/USD/${dateStr}`,
      parse: (data) => {
        if (data.conversion_rates && data.conversion_rates.EUR) {
          return parseFloat(data.conversion_rates.EUR);
        }
        return null;
      }
    });
  }
  
  // 3. exchangerate-api.com historical (free, limited historical)
  if (isRecentDate) {
    apiProviders.push({
      name: "exchangerate-api.com-historical",
      url: `https://api.exchangerate-api.com/v4/historical/USD/${dateStr}`,
      parse: (data) => data.rates?.EUR ? parseFloat(data.rates.EUR) : null
    });
  }
  
  // 5. exchangerate.host (free, good for recent dates but requires API key for historical)
  apiProviders.push({
    name: "exchangerate.host",
    url: `https://api.exchangerate.host/${dateStr}?base=USD&symbols=EUR`,
    parse: (data) => {
      // exchangerate.host returns result.rates.EUR
      if (data.result && data.result.rates && data.result.rates.EUR) {
        return parseFloat(data.result.rates.EUR);
      }
      // Also check data.rates.EUR
      if (data.rates && data.rates.EUR) {
        return parseFloat(data.rates.EUR);
      }
      return null;
    }
  });
  
  // 6. fixer.io (if API key available)
  if (env.FIXER_API_KEY) {
    apiProviders.push({
      name: "fixer.io",
      url: `https://api.fixer.io/${dateStr}?access_key=${env.FIXER_API_KEY}&base=USD&symbols=EUR`,
      parse: (data) => data.rates?.EUR ? parseFloat(data.rates.EUR) : null
    });
  }
  
  // 7. exchangerate-api.com v4 (free, has some historical data support)
  // This API sometimes works for recent historical dates
  apiProviders.push({
    name: "exchangerate-api.com-v4",
    url: `https://api.exchangerate-api.com/v4/historical/USD/${dateStr}`,
    parse: (data) => data.rates?.EUR ? parseFloat(data.rates.EUR) : null
  });
  
  // 8. European Central Bank via exchangerate.host (free, reliable historical EUR rates)
  // ECB provides daily EUR/USD rates, we need to invert (1/EUR_USD = USD_EUR)
  // Note: exchangerate.host now requires API key, but trying anyway
  apiProviders.push({
    name: "ecb-via-exchangerate-host",
    url: `https://api.exchangerate.host/${dateStr}?base=EUR&symbols=USD`,
    parse: (data) => {
      // Get EUR to USD rate, then invert to get USD to EUR
      let eurToUsd = null;
      if (data.result && data.result.rates && data.result.rates.USD) {
        eurToUsd = parseFloat(data.result.rates.USD);
      } else if (data.rates && data.rates.USD) {
        eurToUsd = parseFloat(data.rates.USD);
      }
      if (eurToUsd && eurToUsd > 0) {
        return 1 / eurToUsd; // Invert to get USD to EUR
      }
      return null;
    }
  });
  
  // 8. European Central Bank official API (free, reliable historical EUR rates)
  // ECB provides daily EUR/USD rates via XML, we need to invert (1/EUR_USD = USD_EUR)
  // We'll fetch the historical XML file and parse it for the specific date
  if (dateStr <= today) {
    apiProviders.push({
      name: "ecb-xml",
      url: `https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist.xml`,
      parse: async (responseText, targetDate) => {
        // Parse XML manually (Cloudflare Workers don't have DOMParser)
        // ECB XML format: <Cube time="2024-11-18"><Cube currency="USD" rate="1.0842"/>
        // Find the date pattern and extract USD rate
        // ECB doesn't publish rates on weekends, so we need to find the previous weekday
        let searchDate = targetDate;
        let attempts = 0;
        let rate = null;
        
        // Try up to 3 days back to find a weekday rate (ECB doesn't publish on weekends)
        while (attempts < 3 && !rate) {
          const datePattern = new RegExp(`<Cube\\s+time="${searchDate.replace(/[-]/g, "\\-")}"[^>]*>([\\s\\S]*?)</Cube>`, 'i');
          const dateMatch = responseText.match(datePattern);
          
          if (dateMatch) {
            // Extract USD rate from the date's cube content
            const cubeContent = dateMatch[1];
            const usdPattern = /<Cube\s+currency="USD"\s+rate="([^"]+)"/i;
            const usdMatch = cubeContent.match(usdPattern);
            
            if (usdMatch && usdMatch[1]) {
              const eurToUsd = parseFloat(usdMatch[1]);
              if (eurToUsd && eurToUsd > 0) {
                rate = 1 / eurToUsd; // Invert to get USD to EUR
                break;
              }
            }
          }
          
          // Try previous day
          attempts++;
          const prevDate = new Date(searchDate + 'T00:00:00Z');
          prevDate.setUTCDate(prevDate.getUTCDate() - 1);
          searchDate = formatDate(prevDate);
        }
        
        return rate;
      },
      isAsync: true
    });
  }
  
  // 9. exchangerate-api.com latest as last resort (only for today)
  // This gives current rate, not historical, so use sparingly
  if (dateStr === today) {
    apiProviders.push({
      name: "exchangerate-api.com-latest-fallback",
      url: `https://api.exchangerate-api.com/v4/latest/USD`,
      parse: (data) => data.rates?.EUR ? parseFloat(data.rates.EUR) : null
    });
  }
  
  // Try each API provider in order
  const apiErrors = [];
  for (const provider of apiProviders) {
    try {
      const response = await fetch(provider.url, {
        headers: {
          'User-Agent': 'Cloudflare-Worker-USD-EUR-Fetcher/1.0'
        }
      });
      
      // Check for rate limiting (429 Too Many Requests)
      if (response.status === 429) {
        apiErrors.push(`${provider.name}: Rate limited (429)`);
        await sleep(1000); // Wait 1 second before trying next API
        continue;
      }
      
      if (response.ok) {
        // Handle ECB XML API specially (async parse)
        if (provider.name === "ecb-xml" && provider.isAsync) {
          const responseText = await response.text();
          const rate = await provider.parse(responseText, dateStr);
          if (rate !== null && !isNaN(rate) && rate > 0) {
            return rate;
          } else {
            apiErrors.push(`${provider.name}: No valid rate found for ${dateStr}`);
          }
        } else {
          // Standard JSON APIs
          const data = await response.json();
          const rate = provider.parse(data);
          if (rate !== null && !isNaN(rate) && rate > 0) {
            return rate;
          } else {
            // Log the actual response for debugging
            const dataStr = JSON.stringify(data).substring(0, 200);
            apiErrors.push(`${provider.name}: No valid rate in response (data: ${dataStr})`);
          }
        }
      } else if (response.status === 404) {
        // 404 means data not available for this date, try next API
        apiErrors.push(`${provider.name}: Not found (404)`);
        continue;
      } else {
        // Other error, log and try next
        const errorText = await response.text().catch(() => '');
        apiErrors.push(`${provider.name}: HTTP ${response.status} - ${errorText.substring(0, 100)}`);
      }
    } catch (error) {
      // Network or parsing error, try next API
      apiErrors.push(`${provider.name}: ${error.message}`);
      continue;
    }
    
    // Small delay between API calls to avoid rate limits
    await sleep(200);
  }
  
  // If all APIs failed, include error details
  throw new Error(`Failed to fetch exchange rate for ${dateStr} from all available APIs. Errors: ${apiErrors.join('; ')}`);
}

// Format date as YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ---------- BigQuery helpers (from meta-report.js pattern) ----------

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
  const pem = env.GS_PRIVATE_KEY.replace(/\\n/g, "\n").replace(/-----BEGIN PRIVATE KEY-----/g, "").replace(/-----END PRIVATE KEY-----/g, "").replace(/\s+/g, "");
  const keyBuf = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0)).buffer;
  const keyObj = await crypto.subtle.importKey("pkcs8", keyBuf, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const sigBuf = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", keyObj, new TextEncoder().encode(toSign));
  const sig = b64url(String.fromCharCode(...new Uint8Array(sigBuf)));
  return `${toSign}.${sig}`;
}

async function googleAccessToken(env, scopes) {
  try {
    if (!env.GS_CLIENT_EMAIL || !env.GS_PRIVATE_KEY) {
      throw new Error("Missing GS_CLIENT_EMAIL or GS_PRIVATE_KEY");
    }
    const jwt = await googleJwt(env, scopes);
    const resp = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
    });
    const json = await resp.json();
    if (!json.access_token) {
      const errorMsg = json.error ? `${json.error}: ${json.error_description || ''}` : JSON.stringify(json);
      console.error("Google auth failed:", errorMsg);
      throw new Error(`Google auth failed: ${errorMsg}`);
    }
    return json.access_token;
  } catch (error) {
    console.error("Google auth exception:", error.message, error.stack);
    throw error;
  }
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

async function bqGetDataset(accessToken, env) {
  const url = `https://www.googleapis.com/bigquery/v2/projects/${encodeURIComponent(env.BQ_PROJECT_ID)}/datasets/${encodeURIComponent(env.BQ_DATASET)}`;
  return bqReq(url, { headers: { authorization: `Bearer ${accessToken}` } });
}

async function bqCreateDataset(accessToken, env) {
  const body = {
    datasetReference: { projectId: env.BQ_PROJECT_ID, datasetId: env.BQ_DATASET },
    location: env.BQ_LOCATION || "US"
  };
  const url = `https://www.googleapis.com/bigquery/v2/projects/${encodeURIComponent(env.BQ_PROJECT_ID)}/datasets`;
  const { ok, status, txt } = await bqReq(url, {
    method: "POST",
    headers: { authorization: `Bearer ${accessToken}`, "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!ok && status !== 409) { // 409 = already exists, which is fine
    throw new Error(`BigQuery dataset create failed for ${env.BQ_DATASET}: HTTP ${status}: ${txt.slice(0, 400)}`);
  }
}

async function bqGetTable(accessToken, env, tableId) {
  const url = `https://www.googleapis.com/bigquery/v2/projects/${encodeURIComponent(env.BQ_PROJECT_ID)}/datasets/${encodeURIComponent(env.BQ_DATASET)}/tables/${encodeURIComponent(tableId)}`;
  return bqReq(url, { headers: { authorization: `Bearer ${accessToken}` } });
}

async function bqCreateTable(accessToken, env, tableId, schemaFields) {
  const body = {
    tableReference: { projectId: env.BQ_PROJECT_ID, datasetId: env.BQ_DATASET, tableId },
    schema: { fields: schemaFields },
    timePartitioning: { type: "DAY", field: "date" }
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
        schema: { fields: explicitSchemaFields || [] },
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
  if (logs) logs.push(`BQ LOAD submitted: ${jobId}${location ? ("@" + location) : ""} (${objects.length} rows)`);
  
  let attempts = 0, delay = 800;
  while (attempts < 60) {
    const url = location ? `${base}?location=${encodeURIComponent(location)}` : base;
    const r = await bqReq(url, { headers: { authorization: `Bearer ${accessToken}` } });
    if (r.json?.status?.state === "DONE") {
      const err = r.json?.status?.errorResult || (r.json?.status?.errors || [])[0];
      if (err) throw new Error(`BQ LOAD failed: ${JSON.stringify(err).slice(0, 600)}`);
      const out = r.json?.statistics?.load?.outputRows || 0;
      if (logs) logs.push(`BQ LOAD DONE: ${jobId} outputRows=${out}`);
      return { jobId, outputRows: out };
    }
    attempts++;
    await sleep(delay);
    if (delay < 3000) delay += 250;
  }
  throw new Error(`BQ LOAD timeout ${jobId}`);
}

async function bqQuerySync(accessToken, env, sql, logs) {
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
  if (!res.ok) throw new Error(`BQ query failed: HTTP ${res.status}: ${res.txt.slice(0, 800)}`);
  return res.json;
}

