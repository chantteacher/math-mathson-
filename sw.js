// 매일 꾸준히 mathson — 오프라인 지원 서비스 워커
const VER = "mathson-v4";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./data/concepts.json", "./icons/icon-192.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(VER).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VER).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  const same = url.origin === self.location.origin;
  const lib = /cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|fonts\.(googleapis|gstatic)\.com/.test(url.host);
  if (!same && !lib) return; // 로그인·DB 요청은 그대로 통과
  if (same && (req.mode === "navigate" || url.pathname.endsWith("/index.html"))) {
    // 앱 화면: 네트워크 우선(업데이트 반영), 오프라인이면 저장본
    e.respondWith(fetch(req).then((r) => { const c = r.clone(); caches.open(VER).then((s) => s.put("./index.html", c)); return r; }).catch(() => caches.match("./index.html")));
    return;
  }
  // 문제 파일·라이브러리: 저장본 우선, 없으면 받아서 저장
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((r) => { if (r.ok || r.type === "opaque") { const c = r.clone(); caches.open(VER).then((s) => s.put(req, c)); } return r; })));
});
