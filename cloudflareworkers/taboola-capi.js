// Version: 1.0.0
export default {
  async fetch(request, env) {
    
    // Read body if POST Request (S2S)
    let bodyData = {};
    if (request.method === "POST" || request.method === "PUT") {
      try {
        bodyData = await request.json();
        console.log("Parsed request body:", JSON.stringify(bodyData));
      } catch (e) {
        console.error("Failed to parse JSON body:", e);
      }
    }

    // Extract parameters from URL if GET request
    const url = new URL(request.url);
    
    // Conditionally assign values based on request method POST = S2S; GET = Client-Side
    let event_name = bodyData.event || null;
    let click_id = bodyData.click_id || null;
    let revenue = bodyData.revenue || null;
    let currency = bodyData.currency || "EUR";
    let orderid = bodyData.orderid || null;
    let quantity = bodyData.quantity || null;
    
    if (request.method === "GET") {
      event_name = url.searchParams.get("event") || null;
      click_id = url.searchParams.get("click_id") || null;
      revenue = url.searchParams.get("revenue") || null;
      currency = url.searchParams.get("currency") || "EUR";
      orderid = url.searchParams.get("orderid") || null;
      quantity = url.searchParams.get("quantity") || null;
    }

    

    // If the event name is null, log the error and skip further processing
    if (!event_name && url.pathname != "/debug-events") {
      console.log("Event name: <" + event_name + "> is null or missing. Skipping event processing.");
      return new Response("Event name is missing, skipping event processing.", {
        status: 400, // Bad Request
        headers: { "Content-Type": "text/plain" },
      });
    }

    // Debug endpoint to view events from KV
    if (url.pathname === "/debug-events") {
      const cursor = url.searchParams.get("cursor") || undefined;
    
      const { events, nextCursor, isComplete } = await getEventsFromKV(env["TABOOLA-EVENTS"], 50);
    
      return new Response(JSON.stringify({
        events,
        nextCursor,
        hasMore: !isComplete,
      }, null, 2), {
        headers: { "Content-Type": "application/json" },
      });
    }
    
    

    // Validate click-id for Taboola S2S
    if (!click_id) {
      console.log("Taboola click-id is missing. This is required for S2S tracking.");
      return new Response("Taboola click-id is required for S2S tracking.", {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // Function to send a postback to Taboola S2S
    async function sendTaboolaEvent(clickId, eventName, eventRevenue, eventCurrency, eventOrderId, eventQuantity) {
      // Base URL for Taboola S2S postback
      const baseUrl = "https://trc.taboola.com/actions-handler/log/3/s2s-action";
      
      // Build URL with required params
      const params = new URLSearchParams({
        "click-id": clickId,
        "name": eventName
      });

      // Add optional params based on event type
      // complete_registration doesn't need optional params
      // make_purchase and other need optional params
      const needsOptionalParams = eventName === "make_purchase" || eventName === "other";
      
      if (needsOptionalParams) {
        if (eventRevenue) {
          params.append("revenue", eventRevenue);
        }
        if (eventCurrency) {
          params.append("currency", eventCurrency);
        }
        if (eventOrderId) {
          params.append("orderid", eventOrderId);
        }
        if (eventQuantity) {
          params.append("quantity", eventQuantity);
        }
      }

      const taboolaUrl = `${baseUrl}?${params.toString()}`;
      
      console.log(`Sending Taboola event: ${eventName}`, taboolaUrl);

      try {
        const response = await fetch(taboolaUrl, {
          method: "GET"
        });

        const responseBody = await response.text();
        console.log(`Taboola response for ${eventName} [${response.status}]: ${responseBody}`);

        return response;
      } catch (err) {
        console.error(`Error sending Taboola event for ${eventName}:`, err);
        return new Response("Error sending to Taboola", { status: 500 });
      }
    }

    // Send the event to Taboola
    const response = await sendTaboolaEvent(
      click_id,
      event_name,
      revenue,
      currency,
      orderid,
      quantity
    );

    // Log the event to KV storage (skip PageView events)
    if (!String(event_name).toLowerCase().includes("pageview")) {
      await logEventToKV(
        env["TABOOLA-EVENTS"],
        event_name,
        click_id,
        revenue,
        currency,
        orderid,
        quantity
      );
    } else {
      console.log("Skipping KV log for PageView event");
    }

    return new Response("Taboola event sent!", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  },
};

async function logEventToKV(kv, event_name, click_id, revenue, currency, orderid, quantity) {
  const timestamp = new Date().toISOString();

  const logEntry = {
    timestamp,
    event_name,
    click_id,
    revenue,
    currency,
    orderid,
    quantity
  };

  const kvKey = `event:${event_name}:${timestamp}:${Math.random().toString(36).substring(2, 10)}`;
  const kvValue = JSON.stringify(logEntry);

  console.log(`Writing to KV: Key: ${kvKey}, Value: ${kvValue}`);

  try {
    await kv.put(kvKey, kvValue);
    console.log("KV write successful.");
  } catch (err) {
    console.error("KV write failed:", err);
  }
}


async function getEventsFromKV(kv, maxResults = 100) {
  const events = [];
  let cursor = undefined;

  while (events.length < maxResults) {
    const listResponse = await kv.list({ prefix: "event:", limit: 100, cursor });
    cursor = listResponse.cursor;

    for (const key of listResponse.keys) {
      try {
        const value = await kv.get(key.name);
        if (!value) continue;

        const event = JSON.parse(value);
        events.push({ key: key.name, ...event });
        if (events.length >= maxResults) break;
      } catch (err) {
        console.error("Error parsing KV value for key:", key.name, err);
      }
    }

    if (listResponse.list_complete || !cursor) break;
  }

  console.log(`Loaded ${events.length} events.`);
  return {
    events: events,
    hasMore: !!cursor,
    nextCursor: cursor
  };
}