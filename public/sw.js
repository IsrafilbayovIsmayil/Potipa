self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch {}
  e.waitUntil(self.registration.showNotification(d.title || "PoTiPa", {
    body: d.body || "", tag: d.tag, renotify: true, icon: "/img/icon-192.png", badge: "/img/icon-192.png",
    vibrate: [300, 150, 300, 150, 300], requireInteraction: true, data: { url: d.url || "/admin" },
  }));
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "/admin";
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((cs) => {
    for (const c of cs) if (c.url.includes("/admin") && "focus" in c) return c.focus();
    return self.clients.openWindow(url);
  }));
});
