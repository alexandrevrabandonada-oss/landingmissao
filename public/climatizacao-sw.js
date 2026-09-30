const VERSION = "climatizacao-v1";
const PAGE_CACHE = `${VERSION}-pages`;
const ASSET_CACHE = `${VERSION}-assets`;

async function warm() {
  const cache = await caches.open(PAGE_CACHE);
  const targets = [
    "/climatizacao",
    "/climatizacao/escolas",
    "/api/climatizacao?action=snapshot",
  ];
  await Promise.allSettled(targets.map(async (target) => {
    const response = await fetch(target, { cache: "no-store" });
    if (response.ok) await cache.put(target, response.clone());
  }));
}

self.addEventListener("install", (event) => {
  event.waitUntil(warm().finally(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter((key) => key.startsWith("climatizacao-") && ![PAGE_CACHE, ASSET_CACHE].includes(key))
      .map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

async function networkFirst(request, fallbackUrl) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(PAGE_CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cache = await caches.open(PAGE_CACHE);
    return (await cache.match(request))
      || (fallbackUrl ? await cache.match(fallbackUrl) : null)
      || new Response("Sem conexão. Abra novamente quando houver internet.", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith((async () => {
      const cache = await caches.open(ASSET_CACHE);
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    })());
    return;
  }

  if (request.mode === "navigate" && url.pathname.startsWith("/climatizacao")) {
    event.respondWith(networkFirst(request, "/climatizacao"));
    return;
  }

  if (url.pathname === "/api/climatizacao" && url.searchParams.get("action") === "snapshot") {
    event.respondWith(networkFirst(request, "/api/climatizacao?action=snapshot"));
  }
});
