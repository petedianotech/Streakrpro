// This is a basic service worker file.
// It's required for the app to be considered a PWA and to show the install prompt.

self.addEventListener('fetch', (event) => {
  // This simple fetch listener is sufficient to make the app installable.
  // For a full offline experience, you would implement caching strategies here.
  event.respondWith(fetch(event.request));
});
