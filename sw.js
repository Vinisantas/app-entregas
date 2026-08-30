const CACHE_NAME = 'entregas-premium-v1';
const urlsParaCache = [
    '/',
    'index.html',
    'manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsParaCache))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(nomes => {
            return Promise.all(
                nomes.filter(nome => nome !== CACHE_NAME)
                    .map(nome => caches.delete(nome))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then(resposta => resposta || fetch(event.request))
    );
});