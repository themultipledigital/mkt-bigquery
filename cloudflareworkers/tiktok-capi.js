/**
 * Version: 1.0.0
 * Cloudflare Worker for sending TikTok Events API conversions.
 *
 * Supported TikTok events: ViewContent, Lead, Purchase
 *
 * Query Parameters:
 * - event:           Event type (e.g. ViewContent, Lead, Purchase)
 * - email:           SHA256 hashed email (optional)
 * - phone:           SHA256 hashed phone number (optional)
 * - ttclid:          TikTok Click ID (optional)
 * - url:             Page URL where the event occurred (optional, defaults to example.com)
 * - referrer:        Referrer URL (optional, defaults to page URL)
 *
 * Example Usage:
 * https://your-worker-url.com?event=Purchase&email=HASHED_EMAIL&phone=HASHED_PHONE&ttclid=CLICK_ID&url=https://yourdomain.com&referrer=https://google.com
 */

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const userIP = request.headers.get("CF-Connecting-IP") || "0.0.0.0";
    const userAgent = request.headers.get("User-Agent");
    const eventId = crypto.randomUUID();
    const eventType = url.searchParams.get("event") || "ViewContent";
    const hashedEmail = url.searchParams.get("email") || "null";
    const hashedPhone = url.searchParams.get("phone") || "null";
    const ttClickId = url.searchParams.get("ttclid") || "null";
    const timestamp = Math.floor(Date.now() / 1000);
    const stag = url.searchParams.get("stag") || "null";

    const API_CONFIGS = [
      {
        pixelId: "D1LNCH3C77UD8FVURCSG", // FRM-182544
        accessToken: "0f774722758a8942fadab523815715e39507fe7f",
        eventSourceUrl: "https://ursulajournal.com",
      },
      {
        pixelId: "D1MCSVRC77UCLV7S7PCG", // FRM-183205
        accessToken: "c99e903e276d3a54dc12f3c58f39f53359db648c",
        eventSourceUrl: "https://mylowayfare.com",
      },
    ];

    async function sendTikTokEvent({ pixelId, accessToken, eventSourceUrl }) {
      const payload = {
        event_source: "web",
        event_source_id: pixelId,
        // test_event_code: "TEST10743",
        data: [
          {
            event: eventType,
            event_time: timestamp,
            user: {
              // email: hashedEmail,
              // phone: hashedPhone,
              external_id: eventId,
              ttclid: ttClickId,
              ip: userIP,
              user_agent: userAgent,
            },
            properties: {
              // currency: "EUR",
              // value: 0,
              contents: [{
                content_id: stag,
              }],
            },
            page: {
              url: eventSourceUrl,
              referrer: eventSourceUrl,
            },
          },
        ],
      };

      const response = await fetch("https://business-api.tiktok.com/open_api/v1.3/event/track/", {
        method: "POST",
        headers: {
          "Access-Token": accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();

      return {
        pixelId,
        status: response.status,
        statusText: response.statusText,
        response: responseText,
      };
    }

    const results = await Promise.all(API_CONFIGS.map(config => sendTikTokEvent(config)));

    return new Response(JSON.stringify(results, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  },
};


--6a4cac6c79b73d449744de466268050caf51bedd77724d030f8b657c06c3

Content-Disposition: form-data; name="wrangler.toml"



name = "tiktok-capi"
main = "worker.js"
compatibility_date = "2023-08-23"

[unsafe.metadata.observability]
enabled = true