const APP_SHELL_CACHE = "alwaslh-student-shell-v1";
const APP_SHELL_URLS = ["/", "/manifest.webmanifest", "/app-icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL_URLS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("alwaslh-student-shell-") && key !== APP_SHELL_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

function isProtectedApiRequest(url) {
  return url.origin === self.location.origin && (url.pathname === "/v1" || url.pathname.startsWith("/v1/"));
}

function isStaticShellRequest(url) {
  return (
    url.pathname.startsWith("/assets/") ||
    url.pathname === "/manifest.webmanifest" ||
    url.pathname === "/app-icon.svg"
  );
}

async function networkFirstNavigation(request) {
  const cache = await caches.open(APP_SHELL_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put("/", response.clone());
    return response;
  } catch {
    return (await cache.match("/")) ?? Response.error();
  }
}

async function cacheFirstStatic(request) {
  const cache = await caches.open(APP_SHELL_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
  return response;
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || isProtectedApiRequest(url)) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (isStaticShellRequest(url)) event.respondWith(cacheFirstStatic(request));
});
