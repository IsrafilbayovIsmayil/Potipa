"use client";
import { useEffect, useState } from "react";

type St = "loading" | "unsupported" | "off" | "on" | "denied" | "busy";
const b64 = (s: string) => {
  const p = "=".repeat((4 - (s.length % 4)) % 4), r = atob((s + p).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(r, (c) => c.charCodeAt(0));
};

export default function PushButton({ compact }: { compact?: boolean }) {
  const [st, setSt] = useState<St>("loading");
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return setSt("unsupported");
      const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/admin" });
      const sub = await reg.pushManager.getSubscription();
      if (Notification.permission === "denied") return setSt("denied");
      if (sub) { // refresh on the server so the link survives DB resets / role changes
        fetch("/api/admin/push", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(sub.toJSON()) }).catch(() => {});
        return setSt("on");
      }
      setSt("off");
    })().catch(() => setSt("unsupported"));
  }, []);

  async function enable() {
    setErr(""); setSt("busy");
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") return setSt("denied");
      const reg = await navigator.serviceWorker.ready;
      const { publicKey } = await (await fetch("/api/admin/push")).json();
      const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(publicKey) }));
      const r = await fetch("/api/admin/push", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(sub.toJSON()) });
      if (!r.ok) throw new Error("server");
      setSt("on");
    } catch { setErr("No se pudo activar"); setSt("off"); }
  }
  async function disable() {
    setSt("busy");
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) { await fetch("/api/admin/push", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ endpoint: sub.endpoint }) }); await sub.unsubscribe(); }
    setSt("off");
  }

  if (st === "loading" || st === "unsupported") return null;
  if (compact) {
    const base = "grid h-10 w-10 place-items-center rounded-full border text-lg";
    if (st === "denied") return <span title="Avisos bloqueados en el navegador" className={`${base} border-white/10 opacity-40`}>📵</span>;
    if (st === "on") return <button onClick={disable} title="Avisos activados · toca para desactivar" className={`${base} relative border-white/15`}>📲<span className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400" /></button>;
    return <button onClick={enable} disabled={st === "busy"} title="Activar avisos en este dispositivo" className={`${base} border-[#e8625f] bg-[#e8625f]/20 disabled:opacity-50`}>📲</button>;
  }
  if (st === "denied") return <span className="text-xs text-white/40">Avisos bloqueados en el navegador</span>;
  if (st === "on") return <button onClick={disable} className="rounded-full border border-white/20 px-4 py-2 text-sm">📲 Avisos activados</button>;
  return <button onClick={enable} disabled={st === "busy"} className="rounded-full bg-[#e8625f] px-4 py-2 text-sm font-medium text-white disabled:opacity-50">📲 Activar avisos{err && ` · ${err}`}</button>;
}
