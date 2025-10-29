/**
 * Version: 1.0.0
 * Affilka → BigQuery (Cloudflare Worker)
 * v4.6 (quota-safe + dedupe-safe)
 *  - Stage→MERGE with NULL-safe ON + stage dedupe (ROW_NUMBER ORDER BY retrieved_at DESC)
 *  - No per-run ALTERs (avoids jobRateLimitExceeded)
 *  - Stage TTL + sweeper
 *  - Synchronous jobs.query for ALL SQL
 *  - Cron: last 7 full days (UTC) excluding today
 */

const DEFAULTS = {
  BASE_URL: "https://backoffice.tycoon.partners",
  AUTH_TOKEN: "7fcc002ca29343fe579430bc5ca11bd0",
  SECONDARY_BASE_URL: "https://platincasino.partners",
  SECONDARY_TOKEN: "504cb576d45c15b9e72af28d846013de",
  CONVERSION_CURRENCY: "EUR",
  CONVERT_ALL_CURRENCIES: "1",
  COLUMNS: [
    "visits_count","registrations_count","depositing_players_count","first_deposits_count",
    "first_deposits_sum","deposits_count","deposits_sum","cashouts_count","cashouts_sum","ggr",
    "bonus_issues_sum","additional_deductions_sum","real_ngr","admin_fee","ngr",
    "sb_settled_bets_sum","sb_real_ggr","sb_ggr","sb_bonuses_sum","sb_balance_corrections_sum",
    "sb_third_party_fees_sum","sb_real_ngr","sb_admin_fee","sb_ngr","clean_net_revenue","net_deposits",
  ],
  GROUP_BY: [
    "day","partner","brand","strategy","campaign","promo","sign_up_at_day","first_deposit_day",
    "dynamic_tag_siteid","dynamic_tag_utm_campaign","dynamic_tag_utm_content",
    "dynamic_tag_utm_medium","dynamic_tag_utm_source","player_country",
  ],
  TIMEOUT_MS: 60_000,
  PER_PAGE: 1000,
  MAX_PAGES: 500,
  MAX_RETRIES: 4,
  STAGE_TTL_MINUTES: 60,  // hard TTL on stage tables
  SWEEP_AGE_HOURS: 2,     // sweep anything older than this
};

const MONEY_FIELDS = [
  "first_deposits_sum","deposits_sum","cashouts_sum","ggr","bonus_issues_sum","additional_deductions_sum",
  "real_ngr","admin_fee","ngr","sb_settled_bets_sum","sb_real_ggr","sb_ggr","sb_bonuses_sum",
  "sb_balance_corrections_sum","sb_third_party_fees_sum","sb_real_ngr","sb_admin_fee","sb_ngr",
  "clean_net_revenue","net_deposits",
];
const COUNT_FIELDS = [
  "visits_count","registrations_count","depositing_players_count","first_deposits_count","deposits_count","cashouts_count",
];

const HEADERS = [
  "date","retrieved_at","partner_id","brand_id","strategy_id","campaign_id","campaign_name","promo_id",
  "sign_up_at_day","first_deposit_day","dynamic_tag_siteid","dynamic_tag_utm_campaign","dynamic_tag_utm_content",
  "dynamic_tag_utm_medium","dynamic_tag_utm_source","player_country","row_currency",
  ...COUNT_FIELDS,
  ...MONEY_FIELDS.flatMap(m => [`${m}_amount`,`${m}_amount_cents`,`${m}_currency`]),
];

/** Strict business key (as requested): includes campaign_name + UTM fields */
const KEY_FIELDS = [
  "date","partner_id","brand_id","strategy_id","campaign_id","campaign_name","promo_id",
  "sign_up_at_day","first_deposit_day","dynamic_tag_siteid","dynamic_tag_utm_campaign",
  "dynamic_tag_utm_content","dynamic_tag_utm_medium","dynamic_tag_utm_source","player_country",
];

const KEY_FIELD_ALIASES = {
  sign_up_at_day: ["sign_up_at_day","sign_up_date","sign_up_at_month"],
  first_deposit_day: ["first_deposit_day","first_deposit_date","first_deposit_month"],
  promo_id: ["promo_id","promo"],
};

// ---------- utils ----------
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization,Version",
  };
}
function fmtYMD(d) {
  const y=d.getUTCFullYear(), m=String(d.getUTCMonth()+1).padStart(2,"0"), day=String(d.getUTCDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}
function computeDefaultWindow(mode) {
  const now=new Date();
  const to=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()));
  const from = (mode==="backfill")
    ? new Date(Date.UTC(to.getUTCFullYear(),0,1))
    : new Date(Date.UTC(to.getUTCFullYear(),to.getUTCMonth(),to.getUTCDate()-6));
  return { FROM: fmtYMD(from), TO: fmtYMD(to), EXCHANGE_RATES_DATE: fmtYMD(to) };
}
function parseDateParam(s){ if(!s) return null; if(!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null; const d=new Date(s+"T00:00:00Z"); return Number.isFinite(d.getTime())?s:null; }
function computeWindowFromUrl(url,mode){
  const qsFrom=parseDateParam(url.searchParams.get("from"));
  const qsTo=parseDateParam(url.searchParams.get("to"));
  const qsXR=parseDateParam(url.searchParams.get("xr"));
  if(qsFrom && qsTo) return { FROM: qsFrom, TO: qsTo, EXCHANGE_RATES_DATE: qsXR || qsTo };
  return computeDefaultWindow(mode);
}
function toNum(x){ const n=Number(x); return Number.isFinite(n)?n:0; }
function toStr(x){ return (x===null||x===undefined)?"":String(x); }
function asIsoDateOnlySafe(val){
  if (val===null||val===undefined) return "";
  if (val===0||val==="0"||val==="0000-00-00"||val==="") return "";
  if (typeof val==="number"&&(!Number.isFinite(val)||val<=0)) return "";
  const d=new Date(val); if(!Number.isFinite(d.getTime())||d.getTime()===0) return "";
  return d.toISOString().slice(0,10);
}
function getIdLike(obj,base){
  const id=obj[`${base}_id`]; if(id!==undefined&&id!==null) return toStr(id);
  const raw=obj[base]; return raw!==undefined&&raw!==null?toStr(raw):"";
}
function moneyTriplet(obj,field,fallback){
  const v=obj[field];
  if(v && typeof v==="object"){ const currency=v.currency??fallback??""; return [toNum(v.amount), toStr(v.amount_cents??""), toStr(currency)]; }
  return [toNum(v), "", toStr(fallback??"")];
}
function makeIndexMap(headerRow){ const m=Object.create(null); headerRow.forEach((n,i)=>m[n]=i); return m; }
function keyFromRowWithAliases(row,indexMap){
  const parts=[];
  for(const name of KEY_FIELDS){
    const aliases=KEY_FIELD_ALIASES[name];
    if(aliases){
      let found=""; for(const alt of aliases){ const idx=indexMap[alt]; if(idx!==undefined){ found=toStr(row[idx]); break; } }
      parts.push(found);
    } else {
      const idx=indexMap[name]; parts.push(idx!==undefined?toStr(row[idx]):"");
    }
  }
  return parts.join("|");
}
function buildAffilkaBaseUrl(baseUrl,{FROM,TO,EXCHANGE_RATES_DATE,CONVERSION_CURRENCY,CONVERT_ALL_CURRENCIES,COLUMNS,GROUP_BY}){
  const u=new URL("/api/customer/v1/casino/report",baseUrl);
  u.searchParams.set("async","false"); u.searchParams.set("from",FROM); u.searchParams.set("to",TO);
  u.searchParams.set("exchange_rates_date",EXCHANGE_RATES_DATE);
  if(CONVERSION_CURRENCY) u.searchParams.set("conversion_currency",CONVERSION_CURRENCY);
  if(CONVERT_ALL_CURRENCIES) u.searchParams.set("convert_all_currencies",CONVERT_ALL_CURRENCIES);
  for(const c of COLUMNS) u.searchParams.append("columns[]",c);
  for(const g of GROUP_BY) u.searchParams.append("group_by[]",g);
  return u;
}
function normalizeAffilkaRow(fieldObjs,retrievedAt,campaignsLookup){
  const obj=Object.create(null); for(const f of fieldObjs) obj[f.name]=f.value;
  const dateISO = asIsoDateOnlySafe(obj.date ?? obj.day ?? "");
  const rowCurrency=toStr(obj.currency ?? "");
  const partner_id=getIdLike(obj,"partner");
  const brand_id=getIdLike(obj,"brand");
  const strategy_id=getIdLike(obj,"strategy");
  const campaign_id=getIdLike(obj,"campaign");
  const campaign_name = campaignsLookup?.get(String(campaign_id))?.name || "";
  const promo_id=getIdLike(obj,"promo");
  const sign_up_at_day = asIsoDateOnlySafe(obj.sign_up_at_day)||asIsoDateOnlySafe(obj.sign_up_date)||"";
  const first_deposit_day = asIsoDateOnlySafe(obj.first_deposit_day)||asIsoDateOnlySafe(obj.first_deposit_date)||"";
  const d_siteid=toStr(obj.dynamic_tag_siteid ?? "");
  const d_utmcamp=toStr(obj.dynamic_tag_utm_campaign ?? "");
  const d_utmcont=toStr(obj.dynamic_tag_utm_content ?? "");
  const d_utmm=toStr(obj.dynamic_tag_utm_medium ?? "");
  const d_utms=toStr(obj.dynamic_tag_utm_source ?? "");
  const player_country=toStr(obj.player_country ?? "");
  const countValues=COUNT_FIELDS.map(n=>toNum(obj[n]));
  const moneyTriplets=MONEY_FIELDS.flatMap(n=>moneyTriplet(obj,n,rowCurrency));
  return [
    dateISO, retrievedAt, partner_id, brand_id, strategy_id, campaign_id, campaign_name, promo_id,
    sign_up_at_day, first_deposit_day, d_siteid, d_utmcamp, d_utmcont, d_utmm, d_utms, player_country,
    rowCurrency, ...countValues, ...moneyTriplets,
  ];
}

// ---------- Google auth ----------
async function googleJwt(env,scopes){
  const b64url=str=>btoa(str).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");
  const header=b64url(JSON.stringify({alg:"RS256",typ:"JWT"}));
  const iat=Math.floor(Date.now()/1000);
  const claim=b64url(JSON.stringify({ iss:env.GS_CLIENT_EMAIL, scope:Array.isArray(scopes)?scopes.join(" "):String(scopes), aud:"https://oauth2.googleapis.com/token", iat, exp: iat+3600 }));
  const toSign = `${header}.${claim}`;
  const pem=env.GS_PRIVATE_KEY.replace(/\\n/g,"\n").replace(/-----[^-]+-----/g,"").replace(/\s+/g,"");
  const keyBuf=Uint8Array.from(atob(pem),(c)=>c.charCodeAt(0)).buffer;
  const keyObj=await crypto.subtle.importKey("pkcs8",keyBuf,{name:"RSASSA-PKCS1-v1_5",hash:"SHA-256"},false,["sign"]);
  const sigBuf=await crypto.subtle.sign("RSASSA-PKCS1-v1_5",keyObj,new TextEncoder().encode(toSign));
  const sig=b64url(String.fromCharCode(...new Uint8Array(sigBuf)));
  return `${toSign}.${sig}`;
}
async function googleAccessToken(env,scopes){
  const jwt=await googleJwt(env,scopes);
  const resp=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:`grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`});
  const json=await resp.json(); return json.access_token;
}

// ---------- BigQuery helpers ----------
const DATE_FIELDS=new Set(["date","sign_up_at_day","first_deposit_day"]);
const TIMESTAMP_FIELDS=new Set(["retrieved_at"]);
const INTEGER_FIELDS=new Set([...COUNT_FIELDS]);
const NUMERIC_FIELDS=new Set(MONEY_FIELDS.map(m=>`${m}_amount`));
const STRING_CENTS_FIELDS=new Set(MONEY_FIELDS.map(m=>`${m}_amount_cents`));
const STRING_CURRENCY_FIELDS=new Set(MONEY_FIELDS.map(m=>`${m}_currency`));

function buildBQSchemaFields(){
  const fields=[];
  for(const h of HEADERS){
    if (DATE_FIELDS.has(h)) fields.push({name:h,type:"DATE",mode:"NULLABLE"});
    else if (TIMESTAMP_FIELDS.has(h)) fields.push({name:h,type:"TIMESTAMP",mode:"NULLABLE"});
    else if (INTEGER_FIELDS.has(h)) fields.push({name:h,type:"INTEGER",mode:"NULLABLE"});
    else if (NUMERIC_FIELDS.has(h)) fields.push({name:h,type:"NUMERIC",mode:"NULLABLE"});
    else if (STRING_CENTS_FIELDS.has(h)||STRING_CURRENCY_FIELDS.has(h)) fields.push({name:h,type:"STRING",mode:"NULLABLE"});
    else fields.push({name:h,type:"STRING",mode:"NULLABLE"});
  }
  return fields;
}

async function bqReq(url,opts){ const resp=await fetch(url,opts); const txt=await resp.text(); let json={}; try{ json=txt?JSON.parse(txt):{}; }catch{} return {ok:resp.ok,status:resp.status,json,txt}; }

async function bqGetTable(accessToken, env, tableId){
  const url=`https://www.googleapis.com/bigquery/v2/projects/${encodeURIComponent(env.BQ_PROJECT_ID)}/datasets/${encodeURIComponent(env.BQ_DATASET)}/tables/${encodeURIComponent(tableId)}`;
  return bqReq(url,{headers:{authorization:`Bearer ${accessToken}`}});
}

async function bqCreateTable(accessToken, env, tableId, schemaFields){
  const body={
    tableReference:{projectId:env.BQ_PROJECT_ID,datasetId:env.BQ_DATASET,tableId},
    schema:{fields:schemaFields},
    timePartitioning:{type:"DAY",field:"date"},
    clustering:{fields:["campaign_id","player_country"]},
  };
  if (env.BQ_LOCATION) body.location = env.BQ_LOCATION;
  const url=`https://www.googleapis.com/bigquery/v2/projects/${encodeURIComponent(env.BQ_PROJECT_ID)}/datasets/${encodeURIComponent(env.BQ_DATASET)}/tables`;
  const {ok,status,txt}=await bqReq(url,{method:"POST",headers:{authorization:`Bearer ${accessToken}`,"content-type":"application/json"},body:JSON.stringify(body)});
  if(!ok) throw new Error(`BigQuery table create failed for ${tableId}: HTTP ${status}: ${txt.slice(0,400)}`);
}

async function bqCreateStageTable(accessToken, env, tableId, schemaFields){
  const ttlMs = DEFAULTS.STAGE_TTL_MINUTES * 60 * 1000;
  const body={
    tableReference:{projectId:env.BQ_PROJECT_ID,datasetId:env.BQ_DATASET,tableId},
    schema:{fields:schemaFields},
    timePartitioning:{type:"DAY",field:"date"},
    labels:{ temp_stage: "true" },
    expirationTime: String(Date.now() + ttlMs),
  };
  if (env.BQ_LOCATION) body.location = env.BQ_LOCATION;
  const url=`https://www.googleapis.com/bigquery/v2/projects/${encodeURIComponent(env.BQ_PROJECT_ID)}/datasets/${encodeURIComponent(env.BQ_DATASET)}/tables`;
  const {ok,status,txt}=await bqReq(url,{method:"POST",headers:{authorization:`Bearer ${accessToken}`,"content-type":"application/json"},body:JSON.stringify(body)});
  if(!ok) throw new Error(`Stage table create failed for ${tableId}: HTTP ${status}: ${txt.slice(0,400)}`);
}

async function ensureBQTable(accessToken, env, tableId, schemaFields){
  const r=await bqGetTable(accessToken, env, tableId);
  if (r.status===200) return r.json;
  if (r.status!==404) throw new Error(`BigQuery tables.get for ${tableId} failed: HTTP ${r.status}: ${r.txt.slice(0,400)}`);
  await bqCreateTable(accessToken, env, tableId, schemaFields);
  const again=await bqGetTable(accessToken, env, tableId);
  return again.json;
}

async function bqQuery(accessToken, env, sql, logs){
  const body = {
    query: sql,
    useLegacySql: false,
    defaultDataset: { datasetId: env.BQ_DATASET, projectId: env.BQ_PROJECT_ID },
  };
  if (env.BQ_LOCATION) body.location = env.BQ_LOCATION;
  const url = `https://www.googleapis.com/bigquery/v2/projects/${encodeURIComponent(env.BQ_PROJECT_ID)}/queries`;
  const res = await bqReq(url,{method:"POST",headers:{authorization:`Bearer ${accessToken}`,"content-type":"application/json"},body:JSON.stringify(body)});
  if(!res.ok) throw new Error(`BQ jobs.query failed: HTTP ${res.status}: ${res.txt.slice(0,800)}`);
  const jobId = res.json?.jobReference?.jobId;
  logs.push(`BQ QUERY (sync) job=${jobId} rows=${res.json?.totalRows||0}`);
  return res.json;
}

async function bqDeleteTable(accessToken, env, tableId, logs, retries=5){
  const url=`https://www.googleapis.com/bigquery/v2/projects/${encodeURIComponent(env.BQ_PROJECT_ID)}/datasets/${encodeURIComponent(env.BQ_DATASET)}/tables/${encodeURIComponent(tableId)}`;
  for (let i=0;i<retries;i++){
    const res = await bqReq(url,{method:"DELETE",headers:{authorization:`Bearer ${accessToken}`}});
    if (res.status===204 || res.status===404) { logs.push(`Stage drop OK: ${tableId}`); return; }
    logs.push(`Stage drop retry ${i+1}/${retries} for ${tableId}: HTTP ${res.status}`);
    await sleep(400*(i+1));
  }
  logs.push(`Stage drop gave up (will be auto-removed by TTL/sweeper): ${tableId}`);
}

function stageSweeperSQL(project,dataset){
  return `
BEGIN
  DECLARE stmt STRING;
  FOR r IN (
    SELECT table_name
    FROM \`${project}.${dataset}\`.INFORMATION_SCHEMA.TABLES
    WHERE table_name LIKE '%_stage_%'
      AND creation_time < TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL ${DEFAULTS.SWEEP_AGE_HOURS} HOUR)
  )
  DO
    SET stmt = FORMAT('DROP TABLE \`${project}.${dataset}.%s\`', r.table_name);
    EXECUTE IMMEDIATE stmt;
  END FOR;
END;`;
}

function rowArrayToObject(row){
  const obj={}; for(let i=0;i<HEADERS.length;i++) obj[HEADERS[i]] = row[i] ?? "";
  for(const k of Object.keys(obj)) if(obj[k]==="") delete obj[k];
  ["date","sign_up_at_day","first_deposit_day"].forEach(k=>{ if(obj[k]==="") delete obj[k]; });
  for(const n of COUNT_FIELDS) if(obj[n]!==undefined) obj[n] = Number(obj[n]) || 0;
  return obj;
}

async function bqLoadJson(accessToken, env, tableId, objects, logs){
  if (!objects.length) return { jobId:null, outputRows:0 };
  const ndjson = objects.map(o=>JSON.stringify(o)).join("\n");
  const jobConfig={ configuration:{ load:{
    destinationTable:{projectId:env.BQ_PROJECT_ID,datasetId:env.BQ_DATASET,tableId},
    schema:{fields:buildBQSchemaFields()},
    writeDisposition:"WRITE_APPEND",
    createDisposition:"CREATE_IF_NEEDED",
    sourceFormat:"NEWLINE_DELIMITED_JSON",
    autodetect:false
  }}};
  if (env.BQ_LOCATION) jobConfig.location=env.BQ_LOCATION;

  const boundary="bq_ndjson_"+(crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2));
  const pre=`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(jobConfig)}\r\n--${boundary}\r\nContent-Type: application/octet-stream\r\n\r\n`;
  const post=`\r\n--${boundary}--`;
  const insertUrl=`https://www.googleapis.com/upload/bigquery/v2/projects/${encodeURIComponent(env.BQ_PROJECT_ID)}/jobs?uploadType=multipart`;
  const ins=await bqReq(insertUrl,{method:"POST",headers:{authorization:`Bearer ${accessToken}`,"content-type":`multipart/related; boundary=${boundary}`},body:pre+ndjson+post});
  if(!ins.ok) throw new Error(`BQ LOAD insert failed: HTTP ${ins.status}: ${ins.txt.slice(0,800)}`);

  const jobId=ins.json?.jobReference?.jobId;
  const location=ins.json?.jobReference?.location||env.BQ_LOCATION||undefined;
  const base=`https://www.googleapis.com/bigquery/v2/projects/${encodeURIComponent(env.BQ_PROJECT_ID)}/jobs/${encodeURIComponent(jobId)}`;
  logs.push(`BQ LOAD submitted: ${jobId}${location?("@"+location):""} (${objects.length} rows)`);

  let attempts=0, delay=800;
  while(attempts<60){
    const url=location?`${base}?location=${encodeURIComponent(location)}`:base;
    const r=await bqReq(url,{headers:{authorization:`Bearer ${accessToken}`}});
    if(r.json?.status?.state==="DONE"){
      const err=r.json?.status?.errorResult || (r.json?.status?.errors||[])[0];
      if (err) throw new Error(`BQ LOAD failed: ${JSON.stringify(err).slice(0,600)}`);
      const out=r.json?.statistics?.load?.outputRows||0;
      logs.push(`BQ LOAD DONE: ${jobId} outputRows=${out}`);
      return { jobId, outputRows: out };
    }
    attempts++; await sleep(delay); if (delay<3000) delay+=250;
  }
  throw new Error(`BQ LOAD timeout ${jobId}`);
}

// ---------- MERGE helpers (NULL-safe ON + stage dedupe) ----------
function nullSafeEq(col, tAlias, sAlias) {
  return `( (${tAlias}\`${col}\` IS NULL AND ${sAlias}\`${col}\` IS NULL) OR ${tAlias}\`${col}\` = ${sAlias}\`${col}\` )`;
}
function buildMergeOnClause(prefixT, prefixS){
  return KEY_FIELDS.map(k => nullSafeEq(k, prefixT, prefixS)).join(" AND ");
}
function colsNonKey(){ return HEADERS.filter(h => !KEY_FIELDS.includes(h)); }
function partitionByKeysSQL(){ return KEY_FIELDS.map(k=>`\`${k}\``).join(", "); }

function mergeSQL(project,dataset,table,stage,from,to){
  const t = `\`${project}\`.\`${dataset}\`.\`${table}\``;
  const stageFQN = `\`${project}\`.\`${dataset}\`.\`${stage}\``;
  const on = buildMergeOnClause("T.", "S.");
  const nonKey = colsNonKey();
  const setList = nonKey.map(c => `T.\`${c}\` = S.\`${c}\``).join(", ");
  const cols = HEADERS.map(c=>`\`${c}\``).join(", ");
  const values = HEADERS.map(c=>`S.\`${c}\``).join(", ");

  const src = `
    (
      SELECT * EXCEPT(_rn) FROM (
        SELECT *, ROW_NUMBER() OVER (
          PARTITION BY ${partitionByKeysSQL()}
          ORDER BY \`retrieved_at\` DESC
        ) AS _rn
        FROM ${stageFQN}
      )
      WHERE _rn = 1
    )`;

  return `
MERGE ${t} AS T
USING ${src} AS S
ON ${on}
WHEN MATCHED THEN UPDATE SET ${setList}
WHEN NOT MATCHED THEN INSERT (${cols}) VALUES (${values});

-- verify
SELECT COUNT(1) AS merged_rows_in_range
FROM ${t}
WHERE \`date\` >= DATE '${from}' AND \`date\` < DATE_SUB(DATE '${to}', INTERVAL 1 DAY);
`;
}

function targetCountSQL(project,dataset,table,from,to){
  const t = `\`${project}\`.\`${dataset}\`.\`${table}\``;
  return `
SELECT COUNT(*) AS rows_in_range
FROM ${t}
WHERE \`date\` >= DATE '${from}' AND \`date\` < DATE_SUB(DATE '${to}', INTERVAL 1 DAY);
`;
}

function stageStatsSQL(stageFQN) {
  return `
WITH d AS (SELECT DISTINCT \`date\` FROM ${stageFQN})
SELECT
  MIN(\`date\`) AS min_date,
  MAX(\`date\`) AS max_date,
  COUNT(*)     AS distinct_dates,
  STRING_AGG(CAST(\`date\` AS STRING), ',' ORDER BY \`date\` LIMIT 10) AS sample_dates
FROM d`;
}

// ---------- Affilka fetch ----------
async function fetchAffilkaPage(urlObj, headers, page, perPage, timeoutMs){
  const u = new URL(urlObj.toString());
  if(page!=null) u.searchParams.set("page",String(page));
  if(perPage!=null) u.searchParams.set("per_page",String(perPage));
  const controller=new AbortController();
  const toId=setTimeout(()=>controller.abort("Upstream timeout"),timeoutMs);
  try{
    const resp=await fetch(u.toString(),{method:"GET",headers,signal:controller.signal});
    clearTimeout(toId); return resp;
  } catch(e){ clearTimeout(toId); throw e; }
}
async function fetchWithRetry(fn, maxRetries){
  let attempt=0;
  while(true){
    try{
      const resp=await fn();
      if(resp.status===429 || (resp.status>=500 && resp.status<600)){
        const ra=resp.headers.get("Retry-After");
        const raMs=ra?Number(ra)*1000:null;
        const backoff = raMs ?? Math.min(500*2**attempt, 8000);
        if(attempt>=maxRetries) return resp;
        attempt++; await sleep(backoff); continue;
      }
      return resp;
    }catch(e){
      const backoff=Math.min(500*2**attempt,8000);
      if(attempt>=maxRetries) throw e;
      attempt++; await sleep(backoff);
    }
  }
}
async function fetchAllAffilka(baseUrlObj, headers, logs, label){
  const perPage=DEFAULTS.PER_PAGE;
  let page=1, totalPages=1;
  const allRows=[], campaignsMap=new Map();
  logs.push(`[${label}] Fetch start: ${baseUrlObj.toString()}`);
  do{
    const resp=await fetchWithRetry(()=>fetchAffilkaPage(baseUrlObj,headers,page,perPage,DEFAULTS.TIMEOUT_MS),DEFAULTS.MAX_RETRIES);
    if(!resp.ok){ const t=await resp.text().catch(()=> ""); throw new Error(`[${label}] Affilka non-OK ${resp.status}: ${t.slice(0,200)}`); }
    const json=await resp.json();
    const rows=json?.rows?.data ?? [];
    const tp=Number(json?.total_pages ?? page);
    const rel=json?.relations?.campaigns ?? [];
    for(const c of rel) campaignsMap.set(String(c.id),{id:c.id,name:c.name,strategy:c.strategy});
    for(const r of rows) allRows.push(r);
    totalPages=tp||1;
    logs.push(`[${label}] Page ${page}/${totalPages} rows=${rows.length} (cumulative: ${allRows.length})`);
    if(page>=totalPages || page>=DEFAULTS.MAX_PAGES) break;
    page++;
  }while(true);
  logs.push(`[${label}] Fetch done: totalRows=${allRows.length}, distinctCampaigns=${campaignsMap.size}, pages=${totalPages}`);
  return { rows: allRows, campaignsMap, totalPages };
}

// ---------- Main ----------
async function handleRequest(request, env, ctx) {
  const corsHeaders=cors();
  if(request.method==="OPTIONS") return new Response(null,{status:204,headers:corsHeaders});

  // Manual call IP allow-list (cron bypasses via header)
  const allowedIps = ["2a06:98c0:3600::103", "195.158.92.167"];
  const cfHeader = request.headers.get("cf-connecting-ip");
  const isCron = request.headers.get("cf-worker-cron") === "true";
  if (!isCron && allowedIps.length && !allowedIps.includes(cfHeader||"")) {
    return new Response("Forbidden", { status: 403 });
  }

  const url=new URL(request.url);
  const logs=[];
  const dest=(url.searchParams.get("dest")||url.searchParams.get("destination")||"bq").toLowerCase();
  const mode=(url.searchParams.get("mode")||"").toLowerCase();

  // Set retrievedAt ONCE at the very beginning of the request
  const retrievedAt = new Date().toISOString();
  logs.push(`[Request] Started at ${retrievedAt}`);

  const { FROM, TO, EXCHANGE_RATES_DATE } = computeWindowFromUrl(url, mode);
  logs.push(`[Affilka] Window FROM=${FROM} TO=${TO} XR=${EXCHANGE_RATES_DATE} mode=${mode||"default"} dest=${dest}`);

  const BASE_URL = env?.AFFILKA_BASE_URL || DEFAULTS.BASE_URL;
  const PRIMARY_TOKEN = env?.AFFILKA_AUTH_TOKEN || DEFAULTS.AUTH_TOKEN;
  const SECONDARY_BASE_URL = DEFAULTS.SECONDARY_BASE_URL;
  const SECONDARY_TOKEN = DEFAULTS.SECONDARY_TOKEN;

  const baseUrlObjPrimary = buildAffilkaBaseUrl(BASE_URL,{FROM,TO,EXCHANGE_RATES_DATE,CONVERSION_CURRENCY:DEFAULTS.CONVERSION_CURRENCY,CONVERT_ALL_CURRENCIES:DEFAULTS.CONVERT_ALL_CURRENCIES,COLUMNS:DEFAULTS.COLUMNS,GROUP_BY:DEFAULTS.GROUP_BY});
  const baseUrlObjSecondary = buildAffilkaBaseUrl(SECONDARY_BASE_URL,{FROM,TO,EXCHANGE_RATES_DATE,CONVERSION_CURRENCY:DEFAULTS.CONVERSION_CURRENCY,CONVERT_ALL_CURRENCIES:DEFAULTS.CONVERT_ALL_CURRENCIES,COLUMNS:DEFAULTS.COLUMNS,GROUP_BY:DEFAULTS.GROUP_BY});

  const headersPrimary = {"Version":"HTTP/1.0","Accept":"application/json","Content-Type":"application/json","Authorization":PRIMARY_TOKEN};
  const headersSecondary = {"Version":"HTTP/1.0","Accept":"application/json","Content-Type":"application/json","Authorization":SECONDARY_TOKEN};

  // Fetch
  let rowsPrimary=[], rowsSecondary=[]; const campaignsMap=new Map();
  try{
    const [resA,resB]=await Promise.all([
      fetchAllAffilka(baseUrlObjPrimary,headersPrimary,logs,"primary"),
      fetchAllAffilka(baseUrlObjSecondary,headersSecondary,logs,"secondary"),
    ]);
    rowsPrimary=resA.rows; rowsSecondary=resB.rows;
    for(const [k,v] of resA.campaignsMap.entries()) campaignsMap.set(k,v);
    for(const [k,v] of resB.campaignsMap.entries()) campaignsMap.set(k,v);
    logs.push(`[Affilka] Combined rows: primary=${rowsPrimary.length} secondary=${rowsSecondary.length} campaigns=${campaignsMap.size}`);
  }catch(err){
    logs.push(`[Affilka] Fetch error: ${String(err?.message||err)}`);
    return new Response(JSON.stringify({ok:false,step:"affilka",error:String(err?.message||err),logs},null,2),{status:502,headers:{"content-type":"application/json",...corsHeaders}});
  }

  // Normalize rows with the single retrievedAt set at request start
  logs.push(`[Normalize] Using retrievedAt=${retrievedAt} for ${rowsPrimary.length + rowsSecondary.length} total rows`);
  const newRowsPrimary = rowsPrimary.map(r=>normalizeAffilkaRow(r,retrievedAt,campaignsMap));
  const newRowsSecondary = rowsSecondary.map(r=>normalizeAffilkaRow(r,retrievedAt,campaignsMap));

  // In-batch dedupe (best-effort before BQ)
  const idx=makeIndexMap(HEADERS);
  function dedupe(rows, label){
    const m=new Map();
    let duplicatesFound = 0;
    for(const r of rows){
      const k=keyFromRowWithAliases(r,idx); 
      const t=new Date(r[idx["retrieved_at"]]);
      const ex=m.get(k); 
      if(ex) {
        duplicatesFound++;
        if(t>ex.time) m.set(k,{row:r,time:t});
      } else {
        m.set(k,{row:r,time:t});
      }
    }
    logs.push(`[Dedupe ${label}] Input: ${rows.length} rows, Duplicates: ${duplicatesFound}, Output: ${m.size} rows`);
    return Array.from(m.values()).map(({row})=>row);
  }
  function filterWithDate(rows){
    const di=idx["date"]; const kept=[]; let skipped=0;
    for(const r of rows){ const d=r[di]; if(d && /^\d{4}-\d{2}-\d{2}$/.test(d)) kept.push(r); else skipped++; }
    return { kept, skipped };
  }
  const dedupTycoon = filterWithDate(dedupe(newRowsPrimary, "Tycoon"));
  const dedupPlatin = filterWithDate(dedupe(newRowsSecondary, "Platin"));

  const summary = {
    ok:true, mode:mode||"default", from:FROM, to:TO, exchange_rates_date:EXCHANGE_RATES_DATE,
    primary_base_url: baseUrlObjPrimary.origin, secondary_base_url: baseUrlObjSecondary.origin,
    token_primary_count: rowsPrimary.length, token_secondary_count: rowsSecondary.length,
    merged_count: (dedupTycoon.kept.length + dedupPlatin.kept.length),
    wrote_to_bq:false,
    bq_inserted: 0, bq_inserted_tycoon: 0, bq_inserted_platin: 0,
    bq_output_rows_tycoon: "0", bq_output_rows_platin: "0",
    bq_pre_rows_in_range_tycoon: 0, bq_post_rows_in_range_tycoon: 0,
    bq_pre_rows_in_range_platin: 0, bq_post_rows_in_range_platin: 0,
    bq_merged_rows_in_range_tycoon: 0, bq_merged_rows_in_range_platin: 0,
    deduped_rows: dedupTycoon.kept.length + dedupPlatin.kept.length,
    skipped_no_date: dedupTycoon.skipped + dedupPlatin.skipped,
    messages:[],
    destination:dest,
    affilka_url_primary: baseUrlObjPrimary.toString(),
    affilka_url_secondary: baseUrlObjSecondary.toString(),
    logs,
  };

  if (dest !== "bq") {
    summary.messages.push("Destination not 'bq'; only BigQuery path implemented.");
    return new Response(JSON.stringify(summary,null,2),{headers:{"content-type":"application/json",...corsHeaders}});
  }

  try{
    const objectsTycoon=dedupTycoon.kept.map(rowArrayToObject);
    const objectsPlatin=dedupPlatin.kept.map(rowArrayToObject);
    summary.bq_inserted = objectsTycoon.length + objectsPlatin.length;
    summary.bq_inserted_tycoon = objectsTycoon.length;
    summary.bq_inserted_platin = objectsPlatin.length;

    const scopes=["https://www.googleapis.com/auth/bigquery"];
    const accessToken=await googleAccessToken(env,scopes);
    if(!accessToken) throw new Error("Google auth failed (no access token for BigQuery)");
    logs.push(`BQ auth OK. Project=${env.BQ_PROJECT_ID} Dataset=${env.BQ_DATASET} Location=${env.BQ_LOCATION||"default"}`);

    const schemaFields=buildBQSchemaFields();
    const tableTycoon="mkt_tycoon";
    const tablePlatin="mkt_platin";

    await ensureBQTable(accessToken, env, tableTycoon, schemaFields);
    await ensureBQTable(accessToken, env, tablePlatin, schemaFields);
    logs.push("BQ tables ensured.");

    // Pre counts
    const preTy = await bqQuery(accessToken, env, targetCountSQL(env.BQ_PROJECT_ID, env.BQ_DATASET, tableTycoon, FROM, TO), logs);
    const prePl = await bqQuery(accessToken, env, targetCountSQL(env.BQ_PROJECT_ID, env.BQ_DATASET, tablePlatin, FROM, TO), logs);
    const getCount = (r)=> Number((r?.rows?.[0]?.f?.[0]?.v)||0);
    summary.bq_pre_rows_in_range_tycoon = getCount(preTy);
    summary.bq_pre_rows_in_range_platin = getCount(prePl);

    // Stage tables (TTL + label)
    const stamp=(Date.now()).toString(36);
    const stageTy=`${tableTycoon}_stage_${stamp}`;
    const stagePl=`${tablePlatin}_stage_${stamp}`;
    await bqCreateStageTable(accessToken, env, stageTy, schemaFields);
    await bqCreateStageTable(accessToken, env, stagePl, schemaFields);
    logs.push(`Stage tables created: ${stageTy}, ${stagePl}`);

    // Load to stage
    const insTy=await bqLoadJson(accessToken, env, stageTy, objectsTycoon, logs);
    const insPl=await bqLoadJson(accessToken, env, stagePl, objectsPlatin, logs);
    summary.bq_output_rows_tycoon = String(insTy.outputRows);
    summary.bq_output_rows_platin = String(insPl.outputRows);

    // Stage stats
    const stageTyQ = await bqQuery(accessToken, env, stageStatsSQL(`\`${env.BQ_PROJECT_ID}\`.\`${env.BQ_DATASET}\`.\`${stageTy}\``), logs);
    const stagePlQ = await bqQuery(accessToken, env, stageStatsSQL(`\`${env.BQ_PROJECT_ID}\`.\`${env.BQ_DATASET}\`.\`${stagePl}\``), logs);
    logs.push(`[stage stats] tycoon: ${JSON.stringify(stageTyQ.rows||[])}`);
    logs.push(`[stage stats] platin: ${JSON.stringify(stagePlQ.rows||[])}`);

    // MERGE (NULL-safe ON + deduped stage source)
    logs.push(`[MERGE] Starting merge for Tycoon: ${objectsTycoon.length} rows -> ${tableTycoon}`);
    const resTy = await bqQuery(accessToken, env, mergeSQL(env.BQ_PROJECT_ID, env.BQ_DATASET, tableTycoon, stageTy, FROM, TO), logs);
    logs.push(`[MERGE] Starting merge for Platin: ${objectsPlatin.length} rows -> ${tablePlatin}`);
    const resPl = await bqQuery(accessToken, env, mergeSQL(env.BQ_PROJECT_ID, env.BQ_DATASET, tablePlatin, stagePl, FROM, TO), logs);

    const parseVerify = (r)=> Number((r?.rows?.[0]?.f?.[0]?.v)||0);
    summary.bq_merged_rows_in_range_tycoon = parseVerify(resTy);
    summary.bq_merged_rows_in_range_platin = parseVerify(resPl);

    // Post counts
    const postTy = await bqQuery(accessToken, env, targetCountSQL(env.BQ_PROJECT_ID, env.BQ_DATASET, tableTycoon, FROM, TO), logs);
    const postPl = await bqQuery(accessToken, env, targetCountSQL(env.BQ_PROJECT_ID, env.BQ_DATASET, tablePlatin, FROM, TO), logs);
    summary.bq_post_rows_in_range_tycoon = getCount(postTy);
    summary.bq_post_rows_in_range_platin = getCount(postPl);

    // Drop stage + sweeper
    await bqDeleteTable(accessToken, env, stageTy, logs);
    await bqDeleteTable(accessToken, env, stagePl, logs);
    logs.push(`Running stage sweeper for leftovers older than ${DEFAULTS.SWEEP_AGE_HOURS}h`);
    await bqQuery(accessToken, env, stageSweeperSQL(env.BQ_PROJECT_ID, env.BQ_DATASET), logs);

    summary.wrote_to_bq = true;
    summary.messages.push(`MERGE OK. range=[${FROM}..${TO}) preTy=${summary.bq_pre_rows_in_range_tycoon}→postTy=${summary.bq_post_rows_in_range_tycoon} prePl=${summary.bq_pre_rows_in_range_platin}→postPl=${summary.bq_post_rows_in_range_platin}`);
  }catch(err){
    summary.ok=false;
    summary.messages.push(`BigQuery error: ${String(err?.message||err)}`);
    logs.push(`BigQuery error: ${String(err?.message||err)}`);
  }

  return new Response(JSON.stringify(summary,null,2),{headers:{"content-type":"application/json",...corsHeaders}});
}

// ---------- Cron ----------
function last7WindowUTC() {
  const todayUTC = new Date(Date.UTC(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate()
  ));
  const to = todayUTC;                                // exclusive
  const from = new Date(todayUTC.getTime() - 7*24*3600*1000);
  return { FROM: fmtYMD(from), TO: fmtYMD(to) };
}

export default {
  async fetch(req, env, ctx) { return handleRequest(req, env, ctx); },
  async scheduled(event, env, ctx) {
    const base = new URL("https://worker-cron/trigger");
    const { FROM, TO } = last7WindowUTC();
    base.searchParams.set("from", FROM);
    base.searchParams.set("to", TO);
    base.searchParams.set("dest", "bq");   // always write to BigQuery on cron
    base.searchParams.set("mode", "cron");
    const req = new Request(base.toString(), {
      method: "GET",
      headers: { "cf-worker-cron": "true" } // bypass IP gate
    });
    return handleRequest(req, env, ctx);
  }
};