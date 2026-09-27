// PowerWatch used to be a PWA served from this site. It is now a native mobile
// app and this site is a landing page, so this worker replaces the old one,
// clears its caches and unregisters itself. New visitors never install it.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    self.registration
      .unregister()
      .then(() => self.caches.keys())
      .then((names) => Promise.all(names.map((name) => self.caches.delete(name))))
      .then(() => self.clients.matchAll({ type: "window" }))
      .then((clients) => clients.forEach((client) => client.navigate(client.url))),
  );
});
