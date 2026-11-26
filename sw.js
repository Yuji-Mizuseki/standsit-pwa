const CACHE_NAME = 'standsit-v43';

const BASE = '/standsit-pwa';

const PRECACHE_URLS = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/measure.html',
  BASE + '/history.html',
  BASE + '/settings.html',
  BASE + '/kyokin.html',
  BASE + '/tsucho.html',
  BASE + '/js/kyokin-exercises.js',
  BASE + '/js/kyokin-ui.js',
  BASE + '/js/tsucho-db.js',
  BASE + '/manifest.json',
  BASE + '/icon-192.png',
  BASE + '/icon-512.png',
  BASE + '/icon-maskable-192.png',
  BASE + '/icon-maskable-512.png',
  BASE + '/img/logo-text-w2.webp',
  BASE + '/img/visual-c.webp',
  BASE + '/img/btn-kyokin.webp',
  BASE + '/img/btn-tsucho.webp',
  BASE + '/img/btn-history.webp',
  BASE + '/img/btn-settings.webp',
  // MediaPipe
  BASE + '/mediapipe/camera_utils/camera_utils.js',
  BASE + '/mediapipe/drawing_utils/drawing_utils.js',
  BASE + '/mediapipe/pose/pose.js',
  BASE + '/mediapipe/pose/pose_solution_packed_assets_loader.js',
  BASE + '/mediapipe/pose/pose_solution_simd_wasm_bin.js',
  BASE + '/mediapipe/pose/pose_solution_simd_wasm_bin.wasm',
  BASE + '/mediapipe/pose/pose_solution_wasm_bin.js',
  BASE + '/mediapipe/pose/pose_solution_wasm_bin.wasm',
  BASE + '/mediapipe/pose/pose_solution_simd_wasm_bin.data',
  BASE + '/mediapipe/pose/pose_solution_packed_assets.data',
  BASE + '/mediapipe/pose/pose_web.binarypb',
];

// インストール時に全ファイルをキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    // cache: 'reload' ＝ブラウザに残っている古い写しを使わず、必ず最新を取りに行く
    //（GitHub Pages は約10分写しを残すため、これが無いと公開直後に古い画面を取り込んで固まる）
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS.map((u) => new Request(u, { cache: 'reload' }))))
  );
  self.skipWaiting();
});

// 古いキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// キャッシュ優先（オフライン対応）
self.addEventListener('fetch', (event) => {
  // Googleフォントはネットワーク優先・失敗時はスキップ
  if (event.request.url.includes('fonts.googleapis.com') ||
      event.request.url.includes('fonts.gstatic.com')) {
    event.respondWith(
      fetch(event.request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
        return res;
      }).catch(() => caches.match(event.request).then(c => c || new Response('', { status: 408 })))
    );
    return;
  }

  // ページ（HTML）はネットワーク優先：つながっていれば毎回最新、つながらないときだけ保存分
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' }).then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
        return res;
      }).catch(() => caches.match(event.request, { ignoreSearch: true })
        .then((c) => c || caches.match(BASE + '/index.html')))
    );
    return;
  }

  // それ以外はキャッシュ優先、なければネットワーク、それもなければindex.htmlを返す
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
        return res;
      }).catch(() => {
        // ナビゲーションリクエストの場合はindex.htmlを返す
        if (event.request.mode === 'navigate') {
          return caches.match(BASE + '/index.html');
        }
      });
    })
  );
});
