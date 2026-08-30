// ==================== SERVICE WORKER ====================
const CACHE_NAME = 'entregas-v2';
const urlsParaCache = [
    '/',
    '/index.html',
    '/manifest.json',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// Instalação
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Cache aberto');
                return cache.addAll(urlsParaCache);
            })
            .then(() => self.skipWaiting())
    );
});

// Ativação
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(nomes => {
            return Promise.all(
                nomes.filter(nome => nome !== CACHE_NAME)
                    .map(nome => {
                        console.log('🗑️ Removendo cache antigo:', nome);
                        return caches.delete(nome);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then(resposta => {
                if (resposta) {
                    return resposta;
                }
                return fetch(event.request).then(resposta => {
                    if (!resposta || resposta.status !== 200 || resposta.type !== 'basic') {
                        return resposta;
                    }
                    const respostaClone = resposta.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, respostaClone);
                    });
                    return resposta;
                });
            })
            .catch(() => {
                return new Response(
                    'Você está offline. Conecte-se para acessar o app.',
                    {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: new Headers({
                            'Content-Type': 'text/plain'
                        })
                    }
                );
            })
    );
});

console.log('🚴 Service Worker ativado!');
