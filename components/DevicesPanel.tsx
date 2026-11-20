"use client";
import { useCallback, useEffect, useState } from "react";

interface Device { id: string; label: string; createdAt: string; lastSeen: string | null; revokedAt: string | null }
const fmt = (s: string | null) => (s ? new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid" }).format(new Date(s)) : "—");

export default function DevicesPanel({ onClose }: { onClose: () => void }) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [label, setLabel] = useState("");
  const [code, setCode] = useState<{ code: string; expiresAt: string; label: string } | null>(null);
  const [left, setLeft] = useState(0);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    const r = await fetch("/api/admin/devices", { cache: "no-store" });
    if (r.ok) setDevices((await r.json()).devices);
  }, []);
  useEffect(() => { load(); const i = setInterval(load, 8000); return () => clearInterval(i); }, [load]);
  useEffect(() => {
    if (!code) return;
    const tick = () => setLeft(Math.max(0, Math.round((new Date(code.expiresAt).getTime() - Date.now()) / 1000)));
    tick(); const i = setInterval(tick, 1000); return () => clearInterval(i);
  }, [code]);

  async function add(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    const r = await fetch("/api/admin/devices", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ label }) });
    if (!r.ok) return setErr("Escribe un nombre (mín. 2 letras).");
    setCode({ ...(await r.json()), label }); setLabel("");
  }
  async function revoke(d: Device) {
    if (!confirm(`¿Quitar el acceso a «${d.label}»? Se desconectará al instante.`)) return;
    await fetch("/api/admin/devices", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: d.id }) });
    load();
  }
  const active = devices.filter((d) => !d.revokedAt), old = devices.filter((d) => d.revokedAt);

  return (
    <div className="mb-6 rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Dispositivos con acceso</h2>
        <button onClick={onClose} className="text-sm text-white/50 underline">Cerrar</button>
      </div>
      <p className="mt-1 text-sm text-white/60">Cada pantalla o móvil se vincula con un código de un solo uso. Si alguien deja la empresa, quita su dispositivo y listo: nadie más se ve afectado.</p>

      <form onSubmit={add} className="mt-4 flex flex-wrap gap-2">
        <input value={label} onChange={(e) => setLabel(e.target.value)} maxLength={40} placeholder="Nombre (ej.: Mostrador, Móvil de Ana)" className="min-w-0 flex-1 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 outline-none focus:border-[#e8625f]" />
        <button className="rounded-full bg-[#e8625f] px-5 py-2.5 font-medium text-white">+ Añadir dispositivo</button>
      </form>
      {err && <p className="mt-2 text-sm text-red-400">{err}</p>}

      {code && (
        <div className="mt-4 rounded-xl bg-black/30 p-4 text-center">
          <p className="text-sm text-white/60">Código para «{code.label}» — escríbelo en ese dispositivo en /admin → Vincular dispositivo</p>
          <p className="my-2 font-mono text-4xl font-bold tracking-[0.2em]">{left > 0 ? code.code : "caducado"}</p>
          <p className="text-xs text-white/50">{left > 0 ? `Válido ${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")} · un solo uso` : "Genera otro código"}</p>
        </div>
      )}

      <ul className="mt-4 divide-y divide-white/10">
        {active.length === 0 && <li className="py-3 text-sm text-white/40">Aún no hay dispositivos vinculados.</li>}
        {active.map((d) => (
          <li key={d.id} className="flex items-center justify-between gap-3 py-3">
            <div><p className="font-medium">{d.label}</p><p className="text-xs text-white/50">Vinculado {fmt(d.createdAt)} · visto {fmt(d.lastSeen)}</p></div>
            <button onClick={() => revoke(d)} className="rounded-full border border-red-400/40 px-4 py-1.5 text-sm text-red-300 hover:bg-red-500/10">Quitar acceso</button>
          </li>
        ))}
      </ul>
      {old.length > 0 && <p className="mt-2 text-xs text-white/40">Quitados: {old.map((d) => d.label).join(", ")}</p>}
    </div>
  );
}
