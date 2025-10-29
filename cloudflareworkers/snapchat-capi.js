// Version: 1.0.0
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const userIP = request.headers.get("CF-Connecting-IP") || "0.0.0.0";
    const userAgent = request.headers.get("User-Agent");
    const eventId = crypto.randomUUID(); //Event deduplication is done on the event_id and timestamp within a 48 hour window.
    const eventType = url.searchParams.get("event") || "PAGE_VIEW"; //Valid Event Names: PAGE_VIEW, SIGN_UP, PURCHASE, CUSTOM_EVENT_1 (Purchase Attempt), CUSTOM_EVENT_2 (Purchase Plus Attempt), CUSTOM_EVENT_3 (Purchase Plus)
    const hashedEmail = url.searchParams.get("email") || null;
    const hashedPhone = url.searchParams.get("phone") || null;
    const scClickId = url.searchParams.get("sccid") || null;
    const scCookie1 = url.searchParams.get("sc_cookie1") || null;
    const timestamp = Math.floor(Date.now() / 1000); // Unix epoch
    const stag = url.searchParams.get("stag") || null;

    const API_CONFIGS = [
      {
        pixelId: "7177f2ce-be8e-4181-847d-f2e752d807c5", //FRM-143576
        accessToken: "eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzUxMzgzODU0LCJzdWIiOiIxMjE5MmYzMS0xYjg0LTRhNzctOTdmOS0zMDI1NTMzZWZhYzN-UFJPRFVDVElPTn4xZTVjYmQwOC01YzczLTRhMWMtYjNkNy1iNjQ5MzEzYzI0OGUifQ.2bAInN5mmnrr6DFmjWXsAiMQlI8wYV7utz4utKIGGyU",
        eventSourceUrl: "https://rinklitravel.com",
      },
      {
        pixelId: "e7bf8f97-c064-4340-a9b7-f16dfbe43001", //FRM-143326
        accessToken: "eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzUxNDQ4OTI3LCJzdWIiOiIzZDBhN2YxZS0zYWE1LTRiMmQtYWM2MC1jZmQyNmU4MDAyYTB-UFJPRFVDVElPTn5hN2NmMmJhNi04MjlmLTQwM2MtOGJkNy03OGM0Y2UxM2FjZGUifQ.GNiKkTzLW9a0ooryNhOu735C3mJBCu8U2gJqyqfFGPQ",
        eventSourceUrl: "https://aninnervoyage.com",
      },
    ];

    async function sendSnapEvent({ pixelId, accessToken, eventSourceUrl }) {
      const eventPayload = {
        data: [
          {
            event_name: eventType,
            action_source: "website",
            event_source_url: eventSourceUrl,
            event_time: timestamp,
            user_data: {
              em: hashedEmail ? [hashedEmail] : undefined,
              ph: hashedPhone ? [hashedPhone] : undefined,
              client_user_agent: userAgent,
              client_ip_address: userIP,
              sc_click_id: scClickId,
              sc_cookie1: scCookie1,
            },
            custom_data: {
              event_id: eventId,
              currency: "USD",
              value: 0,
              content_ids: [
                stag
              ],
            },
          },
        ]
      };

      const endpoint = `https://tr.snapchat.com/v3/${pixelId}/events?access_token=${accessToken}`; //Change to "/events/validate" to test events using Snapchat Event Test Tool

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventPayload),
      });

      const responseText = await response.text();

      return {
        pixelId,
        status: response.status,
        statusText: response.statusText,
        response: responseText,
      };
    }

    const results = await Promise.all(
      API_CONFIGS.map((config) => sendSnapEvent(config))
    );

    return new Response(JSON.stringify(results, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  },
};