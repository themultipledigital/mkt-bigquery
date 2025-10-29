/*
 * Version: 1.0.0
Cloudflare Worker: Affilka session + promos fetch

Endpoints
- GET /health: simple health check
- GET /: runs sign in + promos fetch using env creds (for preview testing)
  - Optional query params for preview only: baseUrl, email, password, page, otpAttempt
- POST /promos: creates a session (sign in) then fetches promos
- GET  /promos: same as POST but uses env creds; filters via URL params

Request body for /promos (JSON)
{
	"baseUrl": "http://api-staging.devaff.affilka.net", // optional; can be set via env AFFILKA_BASE_URL
	"email": "user8@example.com",                   // optional; falls back to env AFFILKA_EMAIL
	"password": "password",                         // optional; falls back to env AFFILKA_PASSWORD
	"otpAttempt": "123456",                         // optional; sent as otp_attempt (auto-generated if AFFILKA_TYCOON_TOTP_SECRET is set)
	"query": {                 // optional filters; becomes query[param]
		"campaign_name": "campaign202",
		"commission_ids": [257],
		"landing_ids": [2222],
		"block": "false",
		"is_subaffiliate": "false"
	},
	"page": 1                  // optional page number
}

Environment bindings (Wrangler)
- Plain vars/secrets read from env:
  - AFFILKA_BASE_URL (optional)
  - AFFILKA_EMAIL (optional)
  - AFFILKA_PASSWORD (optional)
  - AFFILKA_TYCOON_TOTP_SECRET (optional; Base32; used to auto-generate otp_attempt)

Set with Wrangler (examples):
- wrangler.toml -> [vars] AFFILKA_BASE_URL = "https://..."
- Secrets -> wrangler secret put AFFILKA_EMAIL; wrangler secret put AFFILKA_PASSWORD; wrangler secret put AFFILKA_TYCOON_TOTP_SECRET

Preview testing
- Open the preview and just hit "/" (root) to execute sign-in + promos with env creds.
- You may pass preview-only overrides as query params: ?baseUrl=...&email=...&password=...&page=1&otpAttempt=123456
- If no otpAttempt is provided and AFFILKA_TYCOON_TOTP_SECRET is set, a 6-digit TOTP will be generated automatically.
- Or use GET /promos with URL params, or POST /promos with a JSON body.

cURL examples
- Health:
  curl -s -X GET "https://<your-worker-domain>/health"

- Promos (POST):
  curl -s -X POST "https://<your-worker-domain>/promos" \
  -H "content-type: application/json" \
  -d '{
    "query": { "campaign_name": "campaign202" },
    "page": 1
  }'

- Promos (GET, uses env creds):
  curl -s -G "https://<your-worker-domain>/promos" \
  --data-urlencode "query[campaign_name]=campaign202" \
  --data-urlencode "page=1"

Notes
- No statistic token required; session cookies from sign in are forwarded to the promos request.
- CORS is enabled (allow-origin reflects request origin). Adjust as needed.
*/

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);

		// Best-effort in-memory dedupe locks (per isolate). Keys expire automatically.
		// Keyed by operation + parameters (e.g., traffic export window)
		// Note: Cloudflare may spin multiple isolates; this only guards within an isolate.
		globalThis.__dedupeLocks = globalThis.__dedupeLocks || new Map();

		// Simple health check
		if (url.pathname === '/health') {
			return new Response(JSON.stringify({ ok: true }), {
				status: 200,
				headers: { 'content-type': 'application/json' }
			});
		}

		// CORS preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders(request) });
		}

		try {
			// Preview-friendly default: GET / triggers a promos fetch using env creds
			if (url.pathname === '/' && request.method === 'GET') {
				const platform = (url.searchParams.get('platform') || 'tycoon').toLowerCase();
				const cfg = resolvePlatformAndCreds({ env, url, baseUrlOverride: url.searchParams.get('baseUrl') || undefined });
				const baseUrl = cfg.baseUrl;
				const email = cfg.email || "christian.t@themultiple.com";
				const password = cfg.password || "NsXFp2Kh58WH3gJ";
				let otpAttempt = url.searchParams.get('otpAttempt') || undefined;

				console.log('[Root] platform', platform, 'baseUrl', baseUrl);
				console.log('[Root] email present', Boolean(email));
				console.log('[Root] will-generate-otp', !otpAttempt && Boolean(cfg.totpSecret));

				if (!email || !password) {
					console.log('[Root] missing creds');
					return withCORS(new Response(JSON.stringify({ error: 'Missing env AFFILKA_EMAIL or AFFILKA_PASSWORD' }), { status: 400, headers: { 'content-type': 'application/json' } }));
				}

				if (!otpAttempt && cfg.totpSecret) {
					otpAttempt = await generateTOTP(cfg.totpSecret);
					console.log('[Root] generated otp');
				}

				// 1) Create session (sign in)
				const signInEndpoint = new URL('/api/client/casino/sign_in', baseUrl).toString();
				const initialOtp = otpAttempt;
				const { response: signInResponse, usedPreviousWindow } = await signInWithTOTPRetry(signInEndpoint, email, password, initialOtp, Boolean(!initialOtp && cfg.totpSecret), cfg.totpSecret);
				console.log('[Root] sign-in status', signInResponse.status, 'usedPrevWindow?', usedPreviousWindow);

				if (!signInResponse.ok) {
					const errText = await signInResponse.text();
					console.log('[Root] sign-in failed body', errText.slice(0, 200));
					return withCORS(new Response(JSON.stringify({ error: 'Sign in failed', status: signInResponse.status, body: errText }), { status: 401, headers: { 'content-type': 'application/json' } }));
				}

				const setCookieHeaders = signInResponse.headers.get('set-cookie');
				const cookieHeader = normalizeCookieHeader(setCookieHeaders);
				console.log('[Root] cookie received?', Boolean(setCookieHeaders));

				// 2) Fetch promos (no additional filters by default; you can add ?page= in preview)
				const page = url.searchParams.get('page');
				const promosUrl = buildPromosUrl(baseUrl, {}, page);
				console.log('[Root] fetching promos', promosUrl);
				const promosResponse = await fetch(promosUrl, {
					method: 'GET',
					headers: {
						'accept': 'application/json',
						'content-type': 'application/json',
						'Version': 'HTTP/1.0',
						...(cookieHeader ? { cookie: cookieHeader } : {})
					}
				});
				console.log('[Root] promos status', promosResponse.status);

				const promosText = await promosResponse.text();
				const contentType = promosResponse.headers.get('content-type') || 'application/json';
				return withCORS(new Response(promosText, { status: promosResponse.status, headers: { 'content-type': contentType } }));
			}

			if (url.pathname === '/promos' && (request.method === 'POST' || request.method === 'GET')) {
				if (request.method === 'POST') {
					const body = await safeJson(request);
					const query = (body && body.query) || {};
					const page = body && body.page;
					const cfg = resolvePlatformAndCreds({ env, body, baseUrlOverride: body && body.baseUrl });
					const baseUrl = cfg.baseUrl || 'http://api-staging.devaff.affilka.net';
					const email = (body && body.email) || cfg.email;
					const password = (body && body.password) || cfg.password;
					let otpAttempt = (body && body.otpAttempt) || undefined;

					console.log('[POST /promos] platform', cfg.platform, 'baseUrl', baseUrl);
					console.log('[POST /promos] email present', Boolean(email));
					console.log('[POST /promos] will-generate-otp', !otpAttempt && Boolean(cfg.totpSecret));

					if (!email || !password) {
						console.log('[POST /promos] missing creds');
						return withCORS(
							new Response(JSON.stringify({ error: 'Missing email or password' }), {
								status: 400,
								headers: { 'content-type': 'application/json' }
							})
						);
					}

					if (!otpAttempt && cfg.totpSecret) {
						otpAttempt = await generateTOTP(cfg.totpSecret);
						console.log('[POST /promos] generated otp');
					}

					// 1) Create session (sign in)
					const signInEndpoint = new URL('/api/client/casino/sign_in', baseUrl).toString();
					const initialOtp = otpAttempt;
					const { response: signInResponse, usedPreviousWindow } = await signInWithTOTPRetry(signInEndpoint, email, password, initialOtp, Boolean(!initialOtp && cfg.totpSecret), cfg.totpSecret);
					console.log('[POST /promos] sign-in status', signInResponse.status, 'usedPrevWindow?', usedPreviousWindow);

					if (!signInResponse.ok) {
						const errText = await signInResponse.text();
						console.log('[POST /promos] sign-in failed body', errText.slice(0, 200));
						return withCORS(new Response(JSON.stringify({ error: 'Sign in failed', status: signInResponse.status, body: errText }), { status: 401, headers: { 'content-type': 'application/json' } }));
					}

					// Capture Set-Cookie and forward as Cookie for next request
					const setCookieHeaders = signInResponse.headers.get('set-cookie');
					const cookieHeader = normalizeCookieHeader(setCookieHeaders);
					console.log('[POST /promos] cookie received?', Boolean(setCookieHeaders));

					// 2) Fetch promos
					const promosUrl = buildPromosUrl(baseUrl, query, page);
					console.log('[POST /promos] fetching promos', promosUrl);
					const promosResponse = await fetch(promosUrl, {
						method: 'GET',
						headers: {
							'accept': 'application/json',
							'content-type': 'application/json',
							'Version': 'HTTP/1.0',
							...(cookieHeader ? { cookie: cookieHeader } : {})
						}
					});
					console.log('[POST /promos] promos status', promosResponse.status);

					const promosText = await promosResponse.text();
					const contentType = promosResponse.headers.get('content-type') || 'application/json';

					return withCORS(new Response(promosText, { status: promosResponse.status, headers: { 'content-type': contentType } }));
				}

				if (request.method === 'GET') {
					// GET variant: use env creds; forward URL query params
					const cfg = resolvePlatformAndCreds({ env, url });
					const baseUrl = cfg.baseUrl || 'http://api-staging.devaff.affilka.net';
					const email = cfg.email;
					const password = cfg.password;
					let otpAttempt = undefined;

					console.log('[GET /promos] platform', cfg.platform, 'baseUrl', baseUrl);
					console.log('[GET /promos] email present', Boolean(email));
					console.log('[GET /promos] will-generate-otp', !otpAttempt && Boolean(cfg.totpSecret));

					if (!email || !password) {
						console.log('[GET /promos] missing creds');
						return withCORS(new Response(JSON.stringify({ error: 'Missing env AFFILKA_EMAIL or AFFILKA_PASSWORD' }), { status: 400, headers: { 'content-type': 'application/json' } }));
					}

					if (!otpAttempt && cfg.totpSecret) {
						otpAttempt = await generateTOTP(cfg.totpSecret);
						console.log('[GET /promos] generated otp');
					}

					// 1) Create session (sign in)
					const signInEndpoint = new URL('/api/client/casino/sign_in', baseUrl).toString();
					const initialOtp = otpAttempt;
					const { response: signInResponse, usedPreviousWindow } = await signInWithTOTPRetry(signInEndpoint, email, password, initialOtp, Boolean(!initialOtp && cfg.totpSecret), cfg.totpSecret);
					console.log('[GET /promos] sign-in status', signInResponse.status, 'usedPrevWindow?', usedPreviousWindow);

					if (!signInResponse.ok) {
						const errText = await signInResponse.text();
						console.log('[GET /promos] sign-in failed body', errText.slice(0, 200));
						return withCORS(new Response(JSON.stringify({ error: 'Sign in failed', status: signInResponse.status, body: errText }), { status: 401, headers: { 'content-type': 'application/json' } }));
					}

					const setCookieHeaders = signInResponse.headers.get('set-cookie');
					const cookieHeader = normalizeCookieHeader(setCookieHeaders);
					console.log('[GET /promos] cookie received?', Boolean(setCookieHeaders));

					// Build promos URL by copying request query params directly
					const promosUrl = new URL('/api/client/casino/promos', baseUrl);
					for (const [k, v] of url.searchParams.entries()) {
						promosUrl.searchParams.append(k, v);
					}
					console.log('[GET /promos] fetching promos', promosUrl.toString());
					const promosResponse = await fetch(promosUrl.toString(), {
						method: 'GET',
						headers: {
							'accept': 'application/json',
							'content-type': 'application/json',
							'Version': 'HTTP/1.0',
							...(cookieHeader ? { cookie: cookieHeader } : {})
						}
					});
					console.log('[GET /promos] promos status', promosResponse.status);

					const promosText = await promosResponse.text();
					const contentType = promosResponse.headers.get('content-type') || 'application/json';
					return withCORS(new Response(promosText, { status: promosResponse.status, headers: { 'content-type': contentType } }));
				}
			}

			// New: Export all promos to BigQuery (pagination + stage + merge)
			if (url.pathname === '/promos/export' && request.method === 'GET') {
				const cfg = resolvePlatformAndCreds({ env, url });
				const baseUrl = cfg.baseUrl || 'https://backoffice.tycoon.partners';
				const email = cfg.email;
				const password = cfg.password;
				let otpAttempt = undefined;

				console.log('[EXPORT] Starting promos export');
				if (!email || !password) {
					return withCORS(new Response(JSON.stringify({ error: 'Missing env AFFILKA_EMAIL or AFFILKA_PASSWORD' }), { status: 400, headers: { 'content-type': 'application/json' } }));
				}
				if (!otpAttempt && cfg.totpSecret) {
					otpAttempt = await generateTOTP(cfg.totpSecret);
				}

				// Sign in
				const signInEndpoint = new URL('/api/client/casino/sign_in', baseUrl).toString();
				const { response: signInResponse } = await signInWithTOTPRetry(signInEndpoint, email, password, otpAttempt, Boolean(!otpAttempt && cfg.totpSecret), cfg.totpSecret);
				if (!signInResponse.ok) {
					const errText = await signInResponse.text();
					return withCORS(new Response(JSON.stringify({ error: 'Sign in failed', status: signInResponse.status, body: errText }), { status: 401, headers: { 'content-type': 'application/json' } }));
				}
				const setCookieHeaders = signInResponse.headers.get('set-cookie');
				const cookieHeader = normalizeCookieHeader(setCookieHeaders);

				// Collect all pages
				const rows = [];
				let pageNum = 1;
				let totalPages = 1;
				console.log('[EXPORT] Fetching pages...');
				do {
					const pageUrl = new URL('/api/client/casino/promos', baseUrl);
					pageUrl.searchParams.set('page', String(pageNum));
					const resp = await fetch(pageUrl.toString(), {
						method: 'GET',
						headers: {
							'accept': 'application/json',
							'content-type': 'application/json',
							'Version': 'HTTP/1.0',
							...(cookieHeader ? { cookie: cookieHeader } : {})
						}
					});
					const text = await resp.text();
					let json = null; try { json = JSON.parse(text); } catch {}
					if (!resp.ok) {
						console.log('[EXPORT] Page fetch failed', resp.status, text.slice(0, 200));
						return withCORS(new Response(JSON.stringify({ error: 'Promos fetch failed', status: resp.status, body: text }), { status: resp.status, headers: { 'content-type': 'application/json' } }));
					}
					totalPages = Number(json?.total_pages || 1) || 1;
					const items = Array.isArray(json?.items) ? json.items : [];
					console.log(`[EXPORT] Page ${pageNum}/${totalPages} items=${items.length}`);
					for (const it of items) rows.push(flattenPromo(it));
					pageNum += 1;
				} while (pageNum <= totalPages);

				console.log('[EXPORT] Total rows collected', rows.length);

				// BigQuery
				const BQ_PROJECT_ID   = env.BQ_PROJECT_ID;
				const BQ_DATASET      = env.BQ_DATASET;
				const BQ_LOCATION     = env.BQ_LOCATION || 'US';
				const BQ_STAGE_TTL_MIN= Number(env.BQ_STAGE_TTL_MIN || 120);
				if (!BQ_PROJECT_ID || !BQ_DATASET) {
					return new Response('Missing BigQuery env vars: BQ_PROJECT_ID and/or BQ_DATASET', { status: 400 });
				}
				const bqToken = await googleAccessToken(env, ['https://www.googleapis.com/auth/bigquery']);
				const retrievedAt = new Date().toISOString();
				for (const r of rows) r.retrieved_at = retrievedAt;

				const TABLE_ID = (cfg.platform === 'platin') ? 'promos_platin' : 'promos_tycoon';
				const STAGE_ID = `${TABLE_ID}_stage_${randomId()}`;
				const PROMO_SCHEMA = [
					{name:'id', type:'INT64', mode:'REQUIRED'},
					{name:'code', type:'STRING', mode:'NULLABLE'},
					{name:'name', type:'STRING', mode:'NULLABLE'},
					{name:'campaign_id', type:'INT64', mode:'NULLABLE'},
					{name:'campaign_name', type:'STRING', mode:'NULLABLE'},
					{name:'landing_id', type:'INT64', mode:'NULLABLE'},
					{name:'landing_url', type:'STRING', mode:'NULLABLE'},
					{name:'created_at', type:'TIMESTAMP', mode:'NULLABLE'},
					{name:'partner_id', type:'INT64', mode:'NULLABLE'},
					{name:'partner_name', type:'STRING', mode:'NULLABLE'},
					{name:'partner_email', type:'STRING', mode:'NULLABLE'},
					{name:'brand_id', type:'INT64', mode:'NULLABLE'},
					{name:'brand_name', type:'STRING', mode:'NULLABLE'},
					{name:'commission_id', type:'INT64', mode:'NULLABLE'},
					{name:'commission_title', type:'STRING', mode:'NULLABLE'},
					{name:'players_count', type:'INT64', mode:'NULLABLE'},
					{name:'blocked', type:'BOOL', mode:'NULLABLE'},
					{name:'traffic_source', type:'STRING', mode:'NULLABLE'},
					{name:'subaffiliate', type:'BOOL', mode:'NULLABLE'},
					{name:'retrieved_at', type:'TIMESTAMP', mode:'REQUIRED'}
				];

				console.log('[EXPORT] Ensuring table exists', TABLE_ID);
				await ensureBQTable(bqToken, env, TABLE_ID, PROMO_SCHEMA, /*partition*/'created_at', /*cluster*/['campaign_id','brand_id']);
				await bqSetNoExpiry(bqToken, env, TABLE_ID, []);

				console.log('[EXPORT] Creating stage table', STAGE_ID);
				await bqCreateStageTable(bqToken, env, STAGE_ID, PROMO_SCHEMA, /*partition*/'created_at', /*cluster*/['campaign_id','brand_id'], BQ_STAGE_TTL_MIN);
				console.log('[EXPORT] Loading rows to stage');
				await bqLoadJson(bqToken, env, STAGE_ID, rows, PROMO_SCHEMA, []);

				console.log('[EXPORT] Merging stage into main');
				const sql = mergeSQL({
					project: BQ_PROJECT_ID,
					dataset: BQ_DATASET,
					table: TABLE_ID,
					stage: STAGE_ID,
					keyFields: ['id'],
					nonKeyFields: ['code','name','campaign_id','campaign_name','landing_id','landing_url','created_at','partner_id','partner_name','partner_email','brand_id','brand_name','commission_id','commission_title','players_count','blocked','traffic_source','subaffiliate','retrieved_at']
				});
				await bqQuery(bqToken, env, sql, []);

				console.log('[EXPORT] Cleaning up stage');
				await bqDropTable(bqToken, env, STAGE_ID).catch(()=>{});

				return withCORS(new Response(JSON.stringify({ inserted: rows.length }), { status: 200, headers: { 'content-type': 'application/json' } }));
			}

			// New: Export traffic report to BigQuery
			if (url.pathname === '/traffic/export' && request.method === 'GET') {
				const cfg = resolvePlatformAndCreds({ env, url });
				const baseUrl = cfg.baseUrl || 'https://backoffice.tycoon.partners';
				const email = cfg.email;
				const password = cfg.password;
				let otpAttempt = undefined;

				console.log('[TRAFFIC] Starting traffic export');
				if (!email || !password) {
					return withCORS(new Response(JSON.stringify({ error: 'Missing env AFFILKA_EMAIL or AFFILKA_PASSWORD' }), { status: 400, headers: { 'content-type': 'application/json' } }));
				}
				if (!otpAttempt && cfg.totpSecret) {
					otpAttempt = await generateTOTP(cfg.totpSecret);
				}

				// Dates (required). Default: last 7 full days UTC if not provided
				const from = url.searchParams.get('from');
				const to = url.searchParams.get('to');
				let fromYmd = from;
				let toYmd = to;
				if (!fromYmd || !toYmd) {
					const todayUTC = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()));
					const toDate = todayUTC; // exclusive
					const fromDate = new Date(todayUTC.getTime() - 7*24*3600*1000);
					fromYmd = formatYmd(fromDate);
					toYmd = formatYmd(toDate);
				}
				console.log('[TRAFFIC] Window', fromYmd, '->', toYmd);

				// Dedupe guard: drop duplicate requests for same window within lock period
				const lockKey = `traffic:${fromYmd}:${toYmd}`;
				const lockMs = Number(env.EXPORT_LOCK_MS || 60000);
				const nowMs = Date.now();
				const lastRun = globalThis.__dedupeLocks.get(lockKey);
				if (lastRun && (nowMs - lastRun) < lockMs) {
					return withCORS(new Response(JSON.stringify({ status: 'already_running', window: { from: fromYmd, to: toYmd }, lock_ms: lockMs }), { status: 202, headers: { 'content-type': 'application/json' } }));
				}
				globalThis.__dedupeLocks.set(lockKey, nowMs);
				setTimeout(() => { try { globalThis.__dedupeLocks.delete(lockKey); } catch {} }, lockMs);
				let __lockSet = true;
				try {

				// Sign in
				const signInEndpoint = new URL('/api/client/casino/sign_in', baseUrl).toString();
				const { response: signInResponse } = await signInWithTOTPRetry(signInEndpoint, email, password, otpAttempt, Boolean(!otpAttempt && cfg.totpSecret), cfg.totpSecret);
				if (!signInResponse.ok) {
					const errText = await signInResponse.text();
					return withCORS(new Response(JSON.stringify({ error: 'Sign in failed', status: signInResponse.status, body: errText }), { status: 401, headers: { 'content-type': 'application/json' } }));
				}
				const setCookieHeaders = signInResponse.headers.get('set-cookie');
				const cookieHeader = normalizeCookieHeader(setCookieHeaders);

				// Request parameters (reduced grouping)
				const groupBy = ['foreign_brand_id','foreign_partner_id','foreign_campaign_id','foreign_promo_id','foreign_landing_id'];
				const columns = ['clicks','visits','registrations_count','ftd_count','deposits_count','cr','cftd','cd','rftd'];

				// Paginate
				let pageNum = 1;
				let totalPages = 1;
				const flatRows = [];
				console.log('[TRAFFIC] Fetching pages...');
				do {
					const reportUrl = new URL('/api/client/casino/traffic_report', baseUrl);
					reportUrl.searchParams.set('from', fromYmd);
					reportUrl.searchParams.set('to', toYmd);
					reportUrl.searchParams.set('date_group_by', 'day');
					for (const g of groupBy) reportUrl.searchParams.append('group_by[]', g);
					for (const c of columns) reportUrl.searchParams.append('columns[]', c);
					reportUrl.searchParams.set('page', String(pageNum));
					reportUrl.searchParams.set('per_page', '200');

					const resp = await fetch(reportUrl.toString(), {
						method: 'GET',
						headers: {
							'accept': 'application/json',
							'content-type': 'application/json',
							'Version': 'HTTP/1.0',
							...(cookieHeader ? { cookie: cookieHeader } : {})
						}
					});
					const text = await resp.text();
					let json = null; try { json = JSON.parse(text); } catch {}
					if (!resp.ok) {
						console.log('[TRAFFIC] Page fetch failed', resp.status, text.slice(0, 200));
						return withCORS(new Response(JSON.stringify({ error: 'Traffic report fetch failed', status: resp.status, body: text }), { status: resp.status, headers: { 'content-type': 'application/json' } }));
					}
					totalPages = Number(json?.total_pages || 1) || 1;
					const rows = parseTrafficRows(json);
					console.log(`[TRAFFIC] Page ${pageNum}/${totalPages} rows=${rows.length}`);
					flatRows.push(...rows);
					pageNum += 1;
				} while (pageNum <= totalPages);

				console.log('[TRAFFIC] Total flat rows', flatRows.length);

				// BigQuery load
				const BQ_PROJECT_ID   = env.BQ_PROJECT_ID;
				const BQ_DATASET      = env.BQ_DATASET;
				const BQ_LOCATION     = env.BQ_LOCATION || 'US';
				const BQ_STAGE_TTL_MIN= Number(env.BQ_STAGE_TTL_MIN || 120);
				if (!BQ_PROJECT_ID || !BQ_DATASET) {
					return new Response('Missing BigQuery env vars: BQ_PROJECT_ID and/or BQ_DATASET', { status: 400 });
				}
				const bqToken = await googleAccessToken(env, ['https://www.googleapis.com/auth/bigquery']);
				const retrievedAt = new Date().toISOString();
				const rowsWithTs = flatRows.map(r => ({ ...r, retrieved_at: retrievedAt }));

				const TABLE_ID = (cfg.platform === 'platin') ? 'traffic_report_platin' : 'traffic_report_tycoon';
				const STAGE_ID = `${TABLE_ID}_stage_${randomId()}`;
				// Schema: date + reduced grouping fields + metrics + retrieved_at
				const TRAFFIC_SCHEMA = [
					{name:'date', type:'DATE', mode:'REQUIRED'},
					{name:'foreign_brand_id', type:'INT64', mode:'NULLABLE'},
					{name:'foreign_partner_id', type:'INT64', mode:'NULLABLE'},
					{name:'foreign_campaign_id', type:'INT64', mode:'NULLABLE'},
					{name:'foreign_promo_id', type:'INT64', mode:'NULLABLE'},
					{name:'foreign_landing_id', type:'INT64', mode:'NULLABLE'},
					{name:'clicks', type:'INT64', mode:'NULLABLE'},
					{name:'visits', type:'INT64', mode:'NULLABLE'},
					{name:'registrations_count', type:'INT64', mode:'NULLABLE'},
					{name:'ftd_count', type:'INT64', mode:'NULLABLE'},
					{name:'deposits_count', type:'INT64', mode:'NULLABLE'},
					{name:'cr', type:'FLOAT64', mode:'NULLABLE'},
					{name:'cftd', type:'FLOAT64', mode:'NULLABLE'},
					{name:'cd', type:'FLOAT64', mode:'NULLABLE'},
					{name:'rftd', type:'FLOAT64', mode:'NULLABLE'},
					{name:'retrieved_at', type:'TIMESTAMP', mode:'REQUIRED'}
				];

				console.log('[TRAFFIC] Ensuring table exists', TABLE_ID);
				await ensureBQTable(bqToken, env, TABLE_ID, TRAFFIC_SCHEMA, /*partition*/'date', /*cluster*/['foreign_partner_id','foreign_campaign_id','foreign_promo_id']);
				await bqSetNoExpiry(bqToken, env, TABLE_ID, []);

				console.log('[TRAFFIC] Creating stage table', STAGE_ID);
				await bqCreateStageTable(bqToken, env, STAGE_ID, TRAFFIC_SCHEMA, /*partition*/'date', /*cluster*/['foreign_partner_id','foreign_campaign_id','foreign_promo_id'], BQ_STAGE_TTL_MIN);
				console.log('[TRAFFIC] Loading rows to stage');
				await bqLoadJson(bqToken, env, STAGE_ID, rowsWithTs, TRAFFIC_SCHEMA, []);

				console.log('[TRAFFIC] Merging stage into main');
				const sql = mergeSQL({
					project: BQ_PROJECT_ID,
					dataset: BQ_DATASET,
					table: TABLE_ID,
					stage: STAGE_ID,
					keyFields: ['date','foreign_brand_id','foreign_partner_id','foreign_campaign_id','foreign_promo_id','foreign_landing_id'],
					nonKeyFields: ['clicks','visits','registrations_count','ftd_count','deposits_count','cr','cftd','cd','rftd','retrieved_at']
				});
				await bqQuery(bqToken, env, sql, []);

				console.log('[TRAFFIC] Cleaning up stage');
				await bqDropTable(bqToken, env, STAGE_ID).catch(()=>{});

				return withCORS(new Response(JSON.stringify({ inserted: rowsWithTs.length }), { status: 200, headers: { 'content-type': 'application/json' } }));
				} finally {
					if (__lockSet) {
						// Ensure lock is released on completion/error as well
						globalThis.__dedupeLocks.delete(lockKey);
					}
				}
			}

			return withCORS(new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'content-type': 'application/json' } }));
		} catch (error) {
			console.log('[Worker] unhandled error', String(error));
			return withCORS(new Response(JSON.stringify({ error: String(error) }), { status: 500, headers: { 'content-type': 'application/json' } }));
		}
	}
};

function corsHeaders(request) {
	const origin = request.headers.get('origin') || '*';
	return {
		'access-control-allow-origin': origin,
		'access-control-allow-methods': 'GET,POST,OPTIONS',
		'access-control-allow-headers': request.headers.get('access-control-request-headers') || 'content-type',
		'access-control-allow-credentials': 'true',
		'vary': 'origin'
	};
}

function withCORS(response) {
	const headers = new Headers(response.headers);
	headers.set('access-control-allow-origin', headers.get('access-control-allow-origin') || '*');
	headers.set('access-control-allow-credentials', 'true');
	return new Response(response.body, { status: response.status, headers });
}

async function safeJson(request) {
	try {
		return await request.json();
	} catch (_) {
		return null;
	}
}

function normalizeCookieHeader(setCookieHeader) {
	if (!setCookieHeader) return '';
	// Cloudflare Workers may coalesce multiple Set-Cookie headers into a single comma-separated string.
	// We need to keep only name=value parts and join them with '; '.
	const cookiePairs = [];
	for (const part of splitSetCookieHeader(setCookieHeader)) {
		const nameValue = part.split(';')[0]?.trim();
		if (nameValue) cookiePairs.push(nameValue);
	}
	return cookiePairs.join('; ');
}

function splitSetCookieHeader(headerValue) {
	// Robustly split combined Set-Cookie header by cookie boundaries, not by every comma
	// since Expires attributes contain commas. We split on ", " only when followed by a token and '='.
	const result = [];
	let current = '';
	let i = 0;
	while (i < headerValue.length) {
		const char = headerValue[i];
		const nextSlice = headerValue.slice(i, i + 3);
		if (nextSlice === ', ' && /, [^=]+=/.test(headerValue.slice(i, i + 10))) {
			result.push(current);
			current = '';
			i += 2;
			continue;
		}
		current += char;
		i += 1;
	}
	if (current) result.push(current);
	return result.map(s => s.trim()).filter(Boolean);
}

function buildPromosUrl(baseUrl, query, page) {
	const u = new URL('/api/client/casino/promos', baseUrl);
	// Convert flat query object into nested query[param] form
	if (query && typeof query === 'object') {
		for (const [key, value] of Object.entries(query)) {
			if (Array.isArray(value)) {
				for (const v of value) {
					u.searchParams.append(`query[${key}][]`, String(v));
				}
			} else if (value != null) {
				u.searchParams.set(`query[${key}]`, String(value));
			}
		}
	}
	if (page != null) u.searchParams.set('page', String(page));
	return u.toString();
}

async function generateTOTP(base32Secret) {
	// RFC 6238 (TOTP) using HMAC-SHA1, 30-second step, 6 digits
	const counter = Math.floor(Date.now() / 1000 / 30);
	const keyBytes = base32Decode(base32Secret);
	const msg = new ArrayBuffer(8);
	const view = new DataView(msg);
	// 8-byte big-endian counter
	view.setUint32(0, Math.floor(counter / 0x100000000));
	view.setUint32(4, counter >>> 0);
	const cryptoKey = await crypto.subtle.importKey(
		'raw',
		keyBytes,
		{ name: 'HMAC', hash: 'SHA-1' },
		false,
		['sign']
	);
	const hmac = await crypto.subtle.sign('HMAC', cryptoKey, msg);
	const h = new Uint8Array(hmac);
	const offset = h[h.length - 1] & 0x0f;
	const bin = ((h[offset] & 0x7f) << 24) | ((h[offset + 1] & 0xff) << 16) | ((h[offset + 2] & 0xff) << 8) | (h[offset + 3] & 0xff);
	const otp = (bin % 1000000).toString().padStart(6, '0');
	return otp;
}

async function signInWithTOTPRetry(signInEndpoint, email, password, otpAttempt, canAutoOtp, base32Secret) {
	// Try once with provided or generated current-window TOTP. If 401 and auto TOTP was used,
	// retry once with previous 30s window to absorb small clock skews.
	let usedPreviousWindow = false;
	let otpToUse = otpAttempt;
	if (!otpToUse && canAutoOtp && base32Secret) {
		otpToUse = await generateTOTP(base32Secret);
	}
	const resp1 = await doSignIn(signInEndpoint, email, password, otpToUse);
	if (resp1.status === 401 && !otpAttempt && canAutoOtp && base32Secret) {
		// Retry with previous window
		const prevOtp = await generateTOTPWithStepOffset(base32Secret, -1);
		usedPreviousWindow = true;
		const resp2 = await doSignIn(signInEndpoint, email, password, prevOtp);
		return { response: resp2, usedPreviousWindow };
	}
	return { response: resp1, usedPreviousWindow };
}

async function doSignIn(signInEndpoint, email, password, otpAttempt) {
	const signInPayload = { casino_user: { email, password, ...(otpAttempt ? { otp_attempt: otpAttempt } : {}) } };
	return await fetch(signInEndpoint, {
		method: 'POST',
		headers: {
			'accept': 'application/json',
			'content-type': 'application/json',
			'Version': 'HTTP/1.0'
		},
		body: JSON.stringify(signInPayload)
	});
}

async function generateTOTPWithStepOffset(base32Secret, stepOffset) {
	// Same params as generateTOTP but allows selecting previous/next step
	const step = 30;
	const counter = Math.floor((Date.now() / 1000 + stepOffset * step) / step);
	const keyBytes = base32Decode(base32Secret);
	const msg = new ArrayBuffer(8);
	const view = new DataView(msg);
	view.setUint32(0, Math.floor(counter / 0x100000000));
	view.setUint32(4, counter >>> 0);
	const cryptoKey = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
	const hmac = await crypto.subtle.sign('HMAC', cryptoKey, msg);
	const h = new Uint8Array(hmac);
	const offset = h[h.length - 1] & 0x0f;
	const bin = ((h[offset] & 0x7f) << 24) | ((h[offset + 1] & 0xff) << 16) | ((h[offset + 2] & 0xff) << 8) | (h[offset + 3] & 0xff);
	return (bin % 1000000).toString().padStart(6, '0');
}

function base32Decode(input) {
	// RFC 4648 Base32 alphabet
	const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
	const clean = input.toUpperCase().replace(/=+$/g, '').replace(/\s+/g, '');
	let bits = '';
	for (let i = 0; i < clean.length; i++) {
		const val = alphabet.indexOf(clean[i]);
		if (val === -1) continue; // ignore unknowns
		bits += val.toString(2).padStart(5, '0');
	}
	const bytes = [];
	for (let j = 0; j + 8 <= bits.length; j += 8) {
		bytes.push(parseInt(bits.slice(j, j + 8), 2));
	}
	return new Uint8Array(bytes);
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

function flattenPromo(p) {
	return {
		id: Number(p?.id ?? null),
		code: p?.code ?? null,
		name: p?.name ?? null,
		campaign_id: p?.campaign?.id != null ? Number(p.campaign.id) : null,
		campaign_name: p?.campaign?.name ?? null,
		landing_id: p?.landing?.id != null ? Number(p.landing.id) : null,
		landing_url: p?.landing?.redirect_url ?? null,
		created_at: p?.created_at ?? null,
		partner_id: p?.partner?.id != null ? Number(p.partner.id) : null,
		partner_name: p?.partner?.name ?? null,
		partner_email: p?.partner?.email ?? null,
		brand_id: p?.brand?.id != null ? Number(p.brand.id) : null,
		brand_name: p?.brand?.name ?? null,
		commission_id: p?.commission?.id != null ? Number(p.commission.id) : null,
		commission_title: p?.commission?.title ?? null,
		players_count: p?.players_count != null ? Number(p.players_count) : null,
		blocked: Boolean(p?.blocked),
		traffic_source: p?.traffic_source ?? null,
		subaffiliate: Boolean(p?.subaffiliate)
	};
}

function parseTrafficRows(json) {
	// json.rows.data is an array of arrays, each inner array has objects with {name,value,type}
	const rows = [];
	const arr = json?.rows?.data || [];
	for (const row of arr) {
		const obj = {};
		for (const cell of row) {
			if (!cell || typeof cell !== 'object') continue;
			const name = cell.name;
			let val = cell.value;
			if (cell.type === 'number') {
				const n = Number(val);
				val = Number.isNaN(n) ? null : n;
			} else if (cell.type === 'date') {
				// Keep as YYYY-MM-DD
				val = String(val);
			}
			obj[name] = val;
		}
		// Normalize fields that may be absent
		if (obj.date) obj.date = String(obj.date);
		rows.push({
			date: obj.date || null,
			foreign_brand_id: toNullableInt(obj.foreign_brand_id),
			foreign_partner_id: toNullableInt(obj.foreign_partner_id),
			foreign_campaign_id: toNullableInt(obj.foreign_campaign_id),
			foreign_promo_id: toNullableInt(obj.foreign_promo_id),
			foreign_landing_id: toNullableInt(obj.foreign_landing_id),
			clicks: toNullableInt(obj.clicks),
			visits: toNullableInt(obj.visits),
			registrations_count: toNullableInt(obj.registrations_count),
			ftd_count: toNullableInt(obj.ftd_count),
			deposits_count: toNullableInt(obj.deposits_count),
			cr: toNullableFloat(obj.cr),
			cftd: toNullableFloat(obj.cftd),
			cd: toNullableFloat(obj.cd),
			rftd: toNullableFloat(obj.rftd)
		});
	}
	return rows;
}

function toNullableInt(v) {
	const n = Number(v);
	return Number.isFinite(n) ? n : null;
}
function toNullableFloat(v) {
	const n = Number(v);
	return Number.isFinite(n) ? n : null;
}

function formatYmd(date) {
	const d = new Date(date);
	let month = '' + (d.getMonth() + 1);
	let day = '' + d.getDate();
	const year = d.getFullYear();

	if (month.length < 2)
		month = '0' + month;
	if (day.length < 2)
		day = '0' + day;

	return [year, month, day].join('-');
}

// Resolve base URL, email, password, and TOTP secret based on platform selection.
// Priority order for baseUrl: explicit override > platform default > env.AFFILKA_BASE_URL
function resolvePlatformAndCreds(input) {
  input = input || {};
  const env = input.env;
  const url = input.url;
  const body = input.body;
  const baseUrlOverride = input.baseUrlOverride;

  const platform = (((url && url.searchParams && url.searchParams.get('platform')) || (body && body.platform) || 'tycoon') + '').toLowerCase();
  const email = env && env.AFFILKA_EMAIL;

  let baseUrl = baseUrlOverride || undefined;
  let password = undefined;
  let totpSecret = undefined;

  if (platform === 'platin' || platform === 'platincasino' || platform === 'platinpartners') {
    baseUrl = baseUrl || 'https://platincasino.partners';
    password = (env && (env.AFFILKA_PLATIN_PASSWORD || env.AFFILKA_PASSWORD)) || undefined;
    totpSecret = env && (env.AFFILKA_PLATIN_TOTP_SECRET || env.AFFILKA_TYCOON_TOTP_SECRET);
  } else {
    // Default: Tycoon
    baseUrl = baseUrl || (env && (env.AFFILKA_BASE_URL || 'https://backoffice.tycoon.partners')) || 'https://backoffice.tycoon.partners';
    password = env && env.AFFILKA_PASSWORD;
    totpSecret = env && env.AFFILKA_TYCOON_TOTP_SECRET;
  }

  return { platform, baseUrl, email, password, totpSecret };
}