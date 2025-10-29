// Version: 1.0.0
export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method === "GET") {
      return new Response("✅ Worker is alive", {
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const backendUrl = "https://www.betandplay.com/api/users";

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // TEMP: remove validation for now, let the backend tell us what's wrong
    // const user = body?.user ?? {};
    // const email = (user.email || "").trim();
    // const pass = user.password || "";
    // if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
    //   return new Response(JSON.stringify({ error: "Invalid email" }), {
    //     status: 422,
    //     headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    //   });
    // }
    // if (pass.length < 8) {
    //   return new Response(JSON.stringify({ error: "Password too short" }), {
    //     status: 422,
    //     headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    //   });
    // }

    const upstreamRes = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(body),
    });

    const headers = new Headers(upstreamRes.headers);
    headers.set("Access-Control-Allow-Origin", "*");
    headers.delete("content-length");

    return new Response(upstreamRes.body, {
      status: upstreamRes.status,
      headers
    });
  }
};


--b3ecbd9f5cf855f0be6ae120f2db19ab1957415b548b847dd8ab30f0f5fc

Content-Disposition: form-data; name="wrangler.toml"



name = "bp-signup-modal"
main = "worker.js"
compatibility_date = "2023-08-23"

[unsafe.metadata.observability]
enabled = true