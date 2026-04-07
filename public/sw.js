const CACHE_NAME = 'loupgarous-shell-v1';
const scopeUrl = new URL(self.registration ? self.registration.scope : self.location.href);
const basePath = scopeUrl.pathname.endsWith('/') ? scopeUrl.pathname : `${scopeUrl.pathname}/`;
const precacheUrls = [
  basePath,
  `${basePath}manifest.json`,
  `${basePath}favicon.svg`,
  `${basePath}icon-192.svg`,
  `${basePath}icon-512.svg`,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        cache.addAll(
          precacheUrls.map(
            (url) =>
              new Request(url, {
                cache: 'reload',
              }),
          ),
        ),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const requestUrl = new URL(request.url);

  if (request.method !== 'GET' || requestUrl.origin !== self.location.origin) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(basePath, copy)));
          }

          return response;
        })
        .catch(async () => (await caches.match(request)) || caches.match(basePath)),
    );
    return;
  }

  if (
    ['script', 'style', 'font', 'image'].includes(request.destination) ||
    requestUrl.pathname.endsWith('/manifest.json')
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)));
            }

            return response;
          }),
      ),
    );
  }
});
