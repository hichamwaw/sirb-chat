// =========================================
// Service Worker لتشغيل التطبيق دون اتصال
// =========================================

const CACHE_NAME = 'sirb-chat-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://unpkg.com/peerjs@1.5.1/dist/peerjs.min.js',
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap'
];

// تثبيت Service Worker
self.addEventListener('install', event => {
  console.log('📦 جاري تثبيت Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ تم فتح الكاش');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('❌ فشل التخزين:', err))
  );
});

// استرجاع الملفات من الكاش (استراتيجية: الكاش أولاً، ثم الشبكة)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          // إذا وجد الملف في الكاش، أرسله فوراً
          return response;
        }
        // وإلا، حاول تحميله من الشبكة
        return fetch(event.request)
          .then(response => {
            // إذا كان الطلب ناجحاً، احفظ نسخة منه في الكاش للمرة القادمة
            if (response && response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            // إذا فشل كل شيء، اعرض رسالة خطأ
            return new Response('⚠️ لا يوجد اتصال بالإنترنت', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// تحديث Service Worker
self.addEventListener('activate', event => {
  console.log('🔄 جاري تنشيط Service Worker...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('🗑️ حذف الكاش القديم:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
