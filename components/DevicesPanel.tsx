"use client";
import { useCallback, useEffect, useState } from "react";
import { AD, adminTag, fill, useAdminLang } from "@/lib/adminI18n";

interface Device { id: string; label: string; createdAt: string; lastSeen: string | null; revokedAt: string | null }
const fmtL = (tag: string, s: string | null) => (s ? new Intl.DateTimeFormat(tag, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid" }).format(new Date(s)) : "—");

export default function DevicesPanel({ onClose }: { onClose: () => void }) {
  const [lang] = useAdminLang();
  const a = AD[lang];
  const fmt = (s: string | null) => fmtL(adminTag(lang), s);
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
    if (!r.ok) return setErr(a.dev_name_err);
    setCode({ ...(await r.json()), label }); setLabel("");
  }
  async function revoke(d: Device) {
    if (!confirm(fill(a.dev_revoke_confirm, { label: d.label }))) return;
    await fetch("/api/admin/devices", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: d.id }) });
    load();
  }
  const active = devices.filter((d) => !d.revokedAt), old = devices.filter((d) => d.revokedAt);

  return (
    <div className="mb-6 rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">{a.dev_title}</h2>
        <button onClick={onClose} className="text-sm text-white/50 underline">{a.close}</button>
      </div>
      <p className="mt-1 text-sm text-white/60">{a.dev_intro}</p>

      <form onSubmit={add} className="mt-4 flex flex-wrap gap-2">
        <input value={label} onChange={(e) => setLabel(e.target.value)} maxLength={40} placeholder={a.dev_name_ph} className="min-w-0 flex-1 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 outline-none focus:border-[#e8625f]" />
        <button className="rounded-full bg-[#e8625f] px-5 py-2.5 font-medium text-white">{a.dev_add}</button>
      </form>
      {err && <p className="mt-2 text-sm text-red-400">{err}</p>}

      {code && (
        <div className="mt-4 rounded-xl bg-black/30 p-4 text-center">
          <p className="text-sm text-white/60">{fill(a.dev_code_for, { label: code.label })}</p>
          <p className="my-2 font-mono text-4xl font-bold tracking-[0.2em]">{left > 0 ? code.code : a.dev_expired}</p>
          <p className="text-xs text-white/50">{left > 0 ? fill(a.dev_valid, { t: `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}` }) : a.dev_new_code}</p>
        </div>
      )}

      <ul className="mt-4 divide-y divide-white/10">
        {active.length === 0 && <li className="py-3 text-sm text-white/40">{a.dev_none}</li>}
        {active.map((d) => (
          <li key={d.id} className="flex items-center justify-between gap-3 py-3">
            <div><p className="font-medium">{d.label}</p><p className="text-xs text-white/50">{fill(a.dev_linked, { a: fmt(d.createdAt), b: fmt(d.lastSeen) })}</p></div>
            <button onClick={() => revoke(d)} className="rounded-full border border-red-400/40 px-4 py-1.5 text-sm text-red-300 hover:bg-red-500/10">{a.dev_revoke}</button>
          </li>
        ))}
      </ul>
      {old.length > 0 && <p className="mt-2 text-xs text-white/40">{a.dev_removed} {old.map((d) => d.label).join(", ")}</p>}
    </div>
  );
}
