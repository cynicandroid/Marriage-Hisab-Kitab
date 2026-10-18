const CACHE_NAME = "marriage-hisab-kitab-v4";
const FONT_STYLESHEET =
  "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles/styles.css",
  "./app.js",
  "./js/core.js",
  "./js/modals.js",
  "./js/views/home.js",
  "./js/views/games.js",
  "./js/views/config.js",
  "./js/views/rules.js",
  "./js/views/scoreboard.js",
  "./js/views/round.js",
  "./js/views/detail.js",
  "./manifest.webmanifest",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/icon-maskable-512.png",
  "./assets/GulmiMap.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await cache.addAll(APP_SHELL);

      // Preload the stylesheet on first install. The font files referenced by
      // it are fetched and cached by the runtime cache in the fetch handler.
      // A font-service failure must not prevent the app shell from installing.
      try {
        await cache.add(FONT_STYLESHEET);
      } catch {
        // The app has local font fallbacks if Google Fonts is unavailable.
      }
    }),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const requestUrl = new URL(event.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;
  const isGoogleFont =
    requestUrl.hostname === "fonts.googleapis.com" ||
    requestUrl.hostname === "fonts.gstatic.com";

  // Only cache the app shell/assets and Google Fonts. Other external requests
  // should behave like normal network requests and must not fill the app cache.
  if (!isSameOrigin && !isGoogleFont) return;

  event.respondWith(
    caches
      .match(event.request)
      .then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          const copy = response.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, copy));
          return response;
        });
      })
      .catch(() => caches.match("./index.html")),
  );
});
