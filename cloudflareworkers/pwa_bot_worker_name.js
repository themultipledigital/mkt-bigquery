// Version: 1.0.0

const indexFile = "/index.html";
const pwaGeneralPath = "pwa/";
const pwaFirestorePath = "pwa/template";
const pwaSpecificDataPath = "source/";
const baseFirestoreUrl = "https://firebasestorage.googleapis.com/v0/b/pwa-bot-99957.appspot.com/o/";
const mode = "?alt=media";
const pwaHtml = "html/";
const pwaJs = "js";

addEventListener('fetch', (event) => {
  //console.log(event.request.url);
  const url = new URL(event.request.url);
  let direction = pwaFirestorePath + url.pathname;
  let pwaId = "";
  let fallbackPath = null;
  //console.log(url.hostname);

  if (url.hostname === "preview.sweetbonana.online" || url.hostname === "preview.pwa.bot") {
    const previewUrl = url.pathname.split("/");
    previewUrl.shift();
    pwaId = previewUrl.shift();
    url.pathname = previewUrl.join("/") + (previewUrl.length === 0 ? "/" : "");
  }

  if (url.pathname.indexOf("source") !== -1) {
    const pwaSourcePath = pwaGeneralPath + pwaSpecificDataPath + (pwaId ? pwaId : url.hostname);
    direction = pwaSourcePath + url.pathname.replace(pwaSpecificDataPath, "");
  }

  if (url.pathname === "/" || url.pathname === "/index.html") {
    direction = pwaFirestorePath + indexFile;
    fallbackPath = pwaGeneralPath + pwaSpecificDataPath + url.hostname + "/" + pwaHtml + "index.html";
  }

  if (
    url.pathname === "/service-worker.js" ||
    url.pathname === "/sw.js" ||
    url.pathname === "/firebase-messaging-sw.js" ||
    url.pathname === "/manifest.json"
  ) {
    const pathElement = url.pathname.split(".")[1];
    direction = pwaFirestorePath + "/" + "static/js" + url.pathname;
    fallbackPath = pwaGeneralPath + pwaSpecificDataPath + url.hostname + "/" + pathElement + url.pathname;
  }
  
  const redirectPathSplit = url.pathname.split("/");
  const redirectFlag = redirectPathSplit[1];

  if (redirectFlag === "redirect" && redirectPathSplit.length > 2) {
    const redirectHost = redirectPathSplit[2];  

    const resp = new Response("redirect", {
      headers: {
        "Location": `https://${redirectHost}`,
      },
      status: 302,
    });

    return event.respondWith(resp);
  }

  const jointUri = baseFirestoreUrl + encodeURIComponent(fallbackPath ? fallbackPath : direction) + mode;
  const urlFetchResult = fetch(jointUri);

  const urlFetchResultUltra = urlFetchResult.then(answer => {
    if (!answer.ok) {
      return fetch(baseFirestoreUrl + encodeURIComponent(direction) + mode);
    }

    return answer;
  });
  event.respondWith(urlFetchResultUltra);

  // let headers = {};
  // const zippedResponse = urlFetchResult
  // .then(fetchRes => {
  //   fetchRes.headers.forEach((header, key) => headers[key] = header);
  //   return fetchRes.text();
  // })
  // .then(text => {
  //   console.log("urlFetchResult", headers);
  //   const resp = new Response(text, {
  //     //headers: headers,
  //     status: 200,
  //     encodeBody: "manual"
  //   });

  //   resp.headers.set("Content-Encoding", "gzip");
  //   resp.headers.set("Content-Type", headers["content-type"]);

  //   return Promise.resolve(resp);
  // });

  //event.respondWith(urlFetchResult);
});
