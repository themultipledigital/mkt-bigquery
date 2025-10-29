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
    
    if (request.method === "GET") {
      userIP = request.headers.get("CF-Connecting-IP") || null;
      event_name = url.searchParams.get("event") || null;
      userAgent = request.headers.get("User-Agent") || null;
      fbp = url.searchParams.get("fbp") || null;
      fbc = url.searchParams.get("fbc") || null;
      stag = url.searchParams.get("stag") || null;
      ext_id = url.searchParams.get("ext_id") || null;
    }

    

    // If the event name is null, log the error and skip further processing
    if (!event_name) {
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
        pixelId: "", // FRM-
        accessToken:
          "",
        eventSourceUrl: "https://.net",
        eventName: event_name,
      },
      {
        pixelId: "", // FRM-
        accessToken:
          "",
        eventSourceUrl: "https://.com",
        eventName: event_name,
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
              value: 0,
              content_ids: stag
          },
          },
        ],
        // test_event_code: "TEST32467"
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

    // Send requests for both configurations
    const responses = await Promise.all(
      API_CONFIGS.map((config) =>
        sendFbEvent(config.pixelId, config.accessToken, config.eventSourceUrl, config.eventName)
      )
    );

    // const responses = [{ status: 200 }]; // For testing without sending data to META

    // Log the event
    await logEventToKV(env["CAPI-EVENTS"], event_name, userIP, userAgent, referer, stag, fbp, fbc);

    return new Response("PageView events sent!", {
      status: responses[0].status,
      headers: { "Content-Type": "text/plain" },
    });
  },
};

async function logEventToKV(kv, event_name, userIP, userAgent, referer, stag, fbp, fbc) {
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
  };

  const kvKey = `event:${timestamp}:${Math.random().toString(36).substring(2, 10)}`;
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




// export default {
//   async fetch(request) {
//     const userIP = request.headers.get("CF-Connecting-IP") || "0.0.0.0";
//     const userAgent = request.headers.get("User-Agent");

//     // Extract fbp & fbc from URL parameters if available
//     const url = new URL(request.url);
//     const fbp = url.searchParams.get("fbp") || null;
//     const fbc = url.searchParams.get("fbc") || null;

//     // Define two different sets of credentials
//     const API_CONFIGS = [
//       {
//         pixelId: "1062466909039701", // FRM-154947
//         accessToken:
//           "EAAI6x8pJ7h8BO9SR2guoVa8av2ZB6UgnOzzXmFNmQPyfWnqLoxFRMm0CXjpR85QKQ3WvJHX0DX1mAAZCHm7VWwN5YY92xvri2Jg8X0WQanDjJ34ElkFb7gIrgZCjFicYZAQLElqJSk8jPQC4ejYeMZCr3hL6ZBlEge85V3henGuVZCmgZBXWn87JiwIKEq0fSxZCYEgZDZD",
//         eventSourceUrl: "https://montaukfishingcharter.net",
//         eventName: "PurchasePlus",
//       },
//       {
//         pixelId: "654379827476240", // FRM-145669
//         accessToken:
//           "EAAOiTNRO1CsBO7wNdhXOp6BpsZCMU5dIZB7VZBMWPkydOKEob1yrv6r0JQCfSrkVJpmnPRpFV6dZBNwSbvb2Kvlv9m4ZA0SVNsE51N0MZBm3ETClqV2HC5ZAVJA4q9oMxLofjhMprFPhZB4M6MACKm89xvlrMzbdNBwt8JuBaaz7IMVIg6s7mf6qHVxq02VRUCUyWQZDZD",
//         eventSourceUrl: "https://suntechy.com",
//         eventName: "PurchasePlus",
//       },
//       {
//         pixelId: "667494842414004", // FRM-155237
//         accessToken:
//           "EAATEj6L1BfgBOZBVZABBgL5oZApitqTvxM4Esvt3xkUk65xhIYDrryY2sMN0wxFcsVIZBSkE2x1nIwi1fpWUgpDQqssfgZABgEacx5ZBYWK0u9UkZAXaG1gQNp0ZAZAUZAzfNF5FZBZAy1TqebuHznKiDIyGuupWgENANFe5xOBXdZALDZCIg7C8PL4gC7R55RRon33ndSJAZDZD",
//         eventSourceUrl: "https://travelerassistusonlinetravel.com",
//         eventName: "PurchasePlus-BP",
//       },
//       {
//         pixelId: "1162178602113617", // FRM-154742
//         accessToken:
//           "EAAYqzvHq928BOyJt3RLRgJSZB4rYoiHrqLhbWH1cUtdGTexqApOZBy1zlr2OsUDvwgR8HNF9yjK0K3U4tu7YPjLhjZAbQdz7ZAbhfm0NcKC2tzdLvlP3JVIBykfTNeVtBJVpZAWxS935UBay82MVfwSoURruzZBCoZBTiGyHN4FXhJQ7255j0e40whkUu8nS9na8wZDZD",
//         eventSourceUrl: "https://uswheeltech.com",
//         eventName: "PurchasePlus-BP",
//       },
//     ];

//     // Function to send a request to Facebook Conversion API
//     async function sendFbEvent(pixelId, accessToken, eventSourceUrl, eventName) {
//       const FB_API = `https://graph.facebook.com/v16.0/${pixelId}/events?access_token=${accessToken}`;

//       const fbEventData = {
//         data: [
//           {
//             event_name: eventName,
//             event_time: Math.floor(Date.now() / 1000),
//             event_source_url: eventSourceUrl,
//             action_source: "website",
//             user_data: {
//               client_ip_address: userIP,
//               client_user_agent: userAgent,
//               fbp: fbp,
//               fbc: fbc,
//             },
//           },
//         ],
//       };

//       return fetch(FB_API, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(fbEventData),
//       });
//     }

//     // Send requests for both configurations
//     const responses = await Promise.all(
//       API_CONFIGS.map((config) =>
//         sendFbEvent(config.pixelId, config.accessToken, config.eventSourceUrl, config.eventName)
//       )
//     );

//     return new Response("PurchasePlus events sent!", {
//       status: responses[0].status,
//       headers: { "Content-Type": "text/plain" },
//     });
//   },
// };