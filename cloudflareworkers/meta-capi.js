// Version: 1.0.0
export default {
  async fetch(request, env) {
    
    const referer = request.headers.get("Referer") || null;

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

    // Extract fbp & fbc from URL parameters if available
    const url = new URL(request.url);
    
    // Conditionally assign userIP based on request method POST = S2S; GET = Client-Side
    let userIP = bodyData.user_ip || null;
    let event_name = bodyData.event || null;
    let userAgent = bodyData.user_agent || null;
    let fbp = bodyData.fbp || null;
    let fbc = bodyData.fbc || null;
    let stag = bodyData.stag || null;
    let ext_id = bodyData.external_id || null;
    let em = bodyData.em || null;
    let value = bodyData.value || null;
    let eventid = bodyData.event_id || null;
    
    if (request.method === "GET") {
      userIP = request.headers.get("CF-Connecting-IP") || null;
      event_name = url.searchParams.get("event") || null;
      userAgent = request.headers.get("User-Agent") || null;
      fbp = url.searchParams.get("fbp") || null;
      fbc = url.searchParams.get("fbc") || null;
      stag = url.searchParams.get("stag") || null;
      ext_id = url.searchParams.get("ext_id") || null;
      eventid = url.searchParams.get("event_id") || null;
    }

    

    // If the event name is null, log the error and skip further processing
    if (!event_name && url.pathname != "/debug-purchases") {
      console.log("Event name: <" + event_name + "> is null or missing. Skipping event processing.");
      return new Response("Event name is missing, skipping event processing.", {
        status: 400, // Bad Request
        headers: { "Content-Type": "text/plain" },
      });
    }

    if (url.pathname === "/debug-purchases") {
      const cursor = url.searchParams.get("cursor") || undefined;
    
      const { events, nextCursor, isComplete } = await getPurchaseEventsFromKV(env["CAPI-EVENTS"], 50);
    
      return new Response(JSON.stringify({
        events,
        nextCursor,
        hasMore: !isComplete,
      }, null, 2), {
        headers: { "Content-Type": "application/json" },
      });
    }
    
    

    // Define two different sets of credentials
    const API_CONFIGS = [
      {
        pixelId: "1062466909039701", // FRM-154947
        accessToken:
          "EAAI6x8pJ7h8BO9SR2guoVa8av2ZB6UgnOzzXmFNmQPyfWnqLoxFRMm0CXjpR85QKQ3WvJHX0DX1mAAZCHm7VWwN5YY92xvri2Jg8X0WQanDjJ34ElkFb7gIrgZCjFicYZAQLElqJSk8jPQC4ejYeMZCr3hL6ZBlEge85V3henGuVZCmgZBXWn87JiwIKEq0fSxZCYEgZDZD",
        eventSourceUrl: null,
        eventName: event_name,
      },
      {
        pixelId: "654379827476240", // FRM-145669
        accessToken:
          "EAASKiJwmDaIBPf1H8z1kwNsHVEqsd50n9ZCt4kJMpES8itTaZAMU0ra6HvTTL0noS8uBmjhG08smxRKAkwaZCl3Um85eYMpWx4E2TkvTgSHFu8LLQFULf3xbbgK12CPmyctam1WCnpbUOeK4ouorEAuasC2EQZA0cyFdKmZAM5X7tLIuZCdanFB9yHsytd",
        eventSourceUrl: "https://suntechy.com",
        eventName: event_name,
      },
      // {
      //   pixelId: "667494842414004", // FRM-155237
      //   accessToken:
      //     "EAATEj6L1BfgBOZBVZABBgL5oZApitqTvxM4Esvt3xkUk65xhIYDrryY2sMN0wxFcsVIZBSkE2x1nIwi1fpWUgpDQqssfgZABgEacx5ZBYWK0u9UkZAXaG1gQNp0ZAZAUZAzfNF5FZBZAy1TqebuHznKiDIyGuupWgENANFe5xOBXdZALDZCIg7C8PL4gC7R55RRon33ndSJAZDZD",
      //   eventSourceUrl: "https://travelerassistusonlinetravel.com",
      //   eventName: event_name,
      // },
      {
        pixelId: "1162178602113617", // FRM-154742
        accessToken:
          "EAAYqzvHq928BOyJt3RLRgJSZB4rYoiHrqLhbWH1cUtdGTexqApOZBy1zlr2OsUDvwgR8HNF9yjK0K3U4tu7YPjLhjZAbQdz7ZAbhfm0NcKC2tzdLvlP3JVIBykfTNeVtBJVpZAWxS935UBay82MVfwSoURruzZBCoZBTiGyHN4FXhJQ7255j0e40whkUu8nS9na8wZDZD",
        eventSourceUrl: "https://uswheeltech.com",
        eventName: event_name,
      },
      {
        pixelId: "674276735757225", // FRM-183768
        accessToken:
          "EAAOVIXW2AZA8BP25fOUhaLUIJW3U7Pb8sTUPmlbkpDrEvxm5CA2Y5IBX5rQaRj3P2cj169zkwJ9OuUeiFyDyvkrgRySCDZBKGCNTBTuBXzFogvNeqpCWjqZAACLxvZBTsSFIxp5TmOPpETm4mimIeuxvDkwvZBaKmiEJM3sXyvxbwIzuBvRh6YNXoL1A9FqSsjgZDZD",
        eventSourceUrl: "https://bastianstationery.com",
        eventName: event_name,
      },
      {
        pixelId: "1209506934430968", // FRM-180342
        accessToken:
          "EAATT2KLhQZA4BQJLyD3o1uu0N25bI79rxEvMO8jOADDlRivHiJ4J5MfW5cJHTdXcVbGpMhxi5ORP8GcsDeZB3RHFuzuwvris7wZBuAqvzKLu5fVFndelcQVpqK8JBuS9ZALYRNNiZCieNvmjB40NWZCS4vjQxaD26OXhgURE5joBJ5qMfzSEp3MRaD6yxsFIO1R5FzZBnenRmxrYs85wHy5u52sLH0hrRqmQGti3myKZAPVCw0s67gZDZD",
        eventSourceUrl: null,
        eventName: event_name,
        frmId: "180342", // Flag to identify this config for special handling
        transformEvents: true, // Flag to enable event transformation
      },
    ];


    
    // Function to send a request to Facebook Conversion API
    async function sendFbEvent(pixelId, accessToken, eventSourceUrl, eventName) {
      const FB_API = `https://graph.facebook.com/v16.0/${pixelId}/events?access_token=${accessToken}`;

      const fbEventData = {
        data: [
          {
            event_name: eventName,
            event_time: Math.floor(Date.now() / 1000),
            event_source_url: eventSourceUrl,
            event_id: eventid,
            action_source: "website",
            user_data: {
              client_ip_address: userIP,
              client_user_agent: userAgent,
              fbp: fbp,
              fbc: fbc,
              external_id: ext_id,
              em: em
            },
            custom_data: {
              currency: "EUR",
              value: value,
              content_ids: stag
          },
          },
        ],
        // test_event_code: "TEST37244"
      };
      console.log(`Sending event to Pixel ${pixelId}:`, JSON.stringify(fbEventData));

  try {
    const response = await fetch(FB_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fbEventData),
    });

    const responseBody = await response.text(); // Facebook may not always return JSON
    console.log(`FB response for pixel ${pixelId} [${response.status}]: ${responseBody}`);

    return response;
  } catch (err) {
    console.error(`Error sending FB event for pixel ${pixelId}:`, err);
    return new Response("Error sending to FB", { status: 500 });
  }
}

    // Separate regular configs from FRM-180342 (which needs special handling)
    const regularConfigs = API_CONFIGS.filter((config) => !config.transformEvents);
    const frm180342Config = API_CONFIGS.find((config) => config.frmId === "180342");

    // Send requests for regular configurations
    const responses = await Promise.all(
      regularConfigs.map((config) =>
        sendFbEvent(config.pixelId, config.accessToken, config.eventSourceUrl, config.eventName)
      )
    );

    // Handle FRM-180342 separately with event transformation (PC brand only)
    if (frm180342Config && event_name) {
      const transformedEventName = transformEventNameForFRM180342(event_name);
      if (transformedEventName) {
        console.log(
          `FRM-180342: Transforming "${event_name}" to "${transformedEventName}" (PC brand only)`
        );
        await sendFbEvent(
          frm180342Config.pixelId,
          frm180342Config.accessToken,
          frm180342Config.eventSourceUrl,
          transformedEventName
        );
      } else {
        const brand = extractBrandFromEventName(event_name);
        console.log(
          `FRM-180342: Skipping event "${event_name}" (brand: ${brand}, only PC brand events are sent)`
        );
      }
    }

      // --- NEW: Mirror pageview-* to purchase-* when FBC present ---
    const isLeadVariant = /^Lead-/i.test(String(event_name || ""));
    const isPurchaseVariant = /^Purchase-/i.test(String(event_name || ""));
    const hasFbc = typeof fbc === "string" ? fbc.trim().length > 0 : !!fbc;
    let overriddenEventName = event_name;
    if (isLeadVariant){
      overriddenEventName = String(event_name).replace(/^Lead-/i, "Purchase-Lead-");}
    if (isPurchaseVariant){
      overriddenEventName = String(event_name).replace(/^Purchase-/i, "Purchase-Lead-");}


    if (isLeadVariant || isPurchaseVariant) {
      
      console.log(
        `FBC present. Mirroring "${event_name}" as "${overriddenEventName}" to CAPI.`
      );

      // Mirror to regular configs only (exclude FRM-180342 which has its own handling)
      await Promise.all(
        regularConfigs.map((config) =>
          sendFbEvent(config.pixelId, config.accessToken, config.eventSourceUrl, overriddenEventName)
        )
      );

      // Handle FRM-180342 mirroring separately with transformation (PC brand only)
      if (frm180342Config) {
        const transformedMirrorEventName = transformEventNameForFRM180342(overriddenEventName);
        if (transformedMirrorEventName) {
          console.log(
            `FRM-180342: Mirroring "${overriddenEventName}" as "${transformedMirrorEventName}" (PC brand only)`
          );
          await sendFbEvent(
            frm180342Config.pixelId,
            frm180342Config.accessToken,
            frm180342Config.eventSourceUrl,
            transformedMirrorEventName
          );
        }
      }
    } else {
      console.log(
        `No mirror needed. isLeadVariant=${isLeadVariant} isPurchaseVariant=${isPurchaseVariant} hasFbc=${hasFbc}`
      );
    }

    // const responses = [{ status: 200 }]; // For testing without sending data to META

    // Log the event only if the name does NOT contain "PageView"
    if (!String(event_name).toLowerCase().includes("pageview")) {
      await logEventToKV(env["CAPI-EVENTS"], event_name, userIP, userAgent, referer, stag, fbp, fbc, ext_id, em);
    } else {
      console.log("Skipping KV log for PageView event");
    }

    return new Response("PageView events sent!", {
      status: responses[0].status,
      headers: { "Content-Type": "text/plain" },
    });
  },
};

// Helper function to extract brand code from event name (last segment after final hyphen)
function extractBrandFromEventName(eventName) {
  if (!eventName || typeof eventName !== "string") return null;
  const parts = eventName.split("-");
  return parts.length > 0 ? parts[parts.length - 1] : null;
}

// Helper function to transform event name for FRM-180342
// Only processes PC brand events: Lead-S2S-PC → CompleteRegistration, Purchase-S2S-PC → Purchase
// Returns null for non-PC brands (to skip sending)
function transformEventNameForFRM180342(eventName) {
  if (!eventName || typeof eventName !== "string") return null;
  
  const brand = extractBrandFromEventName(eventName);
  if (brand !== "PC") return null; // Only process PC brand events
  
  if (eventName.startsWith("Lead-")) {
    return "CompleteRegistration";
  } else if (eventName.startsWith("Purchase-")) {
    return "Purchase";
  }
  
  return null; // Unknown event type
}

async function logEventToKV(kv, event_name, userIP, userAgent, referer, stag, fbp, fbc, external_id, em) {
  const timestamp = new Date().toISOString();

  const logEntry = {
    timestamp,
    event_name,
    user_ip: userIP,
    user_agent: userAgent,
    referer,
    stag,
    fbp,
    fbc,
    external_id,
    em,
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


async function getPurchaseEventsFromKV(kv, maxResults = 100) {
  const purchaseEvents = [];
  let cursor = undefined;

  while (purchaseEvents.length < maxResults) {
    const listResponse = await kv.list({ prefix: "event:", limit: 100, cursor });
    cursor = listResponse.cursor;

    for (const key of listResponse.keys) {
      try {
        const value = await kv.get(key.name);
        if (!value) continue;

        const event = JSON.parse(value);
        if (event.event_name?.toLowerCase().includes("purchase")) {
          purchaseEvents.push({ key: key.name, ...event });
          if (purchaseEvents.length >= maxResults) break;
        }
      } catch (err) {
        console.error("Error parsing KV value for key:", key.name, err);
      }
    }

    if (listResponse.list_complete || !cursor) break;
  }

  console.log(`Loaded ${purchaseEvents.length} purchase events.`);
  return {
    events: purchaseEvents,
    hasMore: !!cursor,
    nextCursor: cursor
  };
}