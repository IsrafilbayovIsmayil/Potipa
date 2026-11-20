"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Order, Status } from "@/lib/order";
import { waLink } from "@/lib/order";
import { eur } from "@/lib/products";
import PushButton from "./PushButton";
import DevicesPanel from "./DevicesPanel";

const POLL_MS = 5000;

export default function AdminScreen({ role, label }: { role: "owner" | "staff"; label?: string }) {
  const owner = role === "owner";
  const [showDevices, setShowDevices] = useState(false);
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [online, setOnline] = useState(true);
  const [sound, setSound] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const ctx = useRef<AudioContext | null>(null);
  const seen = useRef<Set<string> | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/orders", { cache: "no-store" });
      if (r.status === 401) { router.refresh(); return; }
      const j = await r.json();
      setOrders(j.orders); setOnline(true); setLoaded(true);
    } catch { setOnline(false); }
  }, [router]);

  useEffect(() => { load(); const i = setInterval(load, POLL_MS); return () => clearInterval(i); }, [load]);
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 15000); return () => clearInterval(i); }, []);

  const fresh = orders.filter((o) => o.status === "new");
  const chime = useCallback(() => {
    const c = ctx.current; if (!c) return;
    const t0 = c.currentTime;
    [[880, 0], [1175, 0.18], [1568, 0.36]].forEach(([f, d]) => {
      const o = c.createOscillator(), g = c.createGain();
      o.type = "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t0 + d); g.gain.exponentialRampToValueAtTime(0.5, t0 + d + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d + 0.5);
      o.connect(g).connect(c.destination); o.start(t0 + d); o.stop(t0 + d + 0.55);
    });
  }, []);

  // ring immediately when a new id appears, then repeat every 4 s while any order is unattended
  useEffect(() => {
    if (!loaded) return;
    const ids = new Set(orders.map((o) => o.id));
    if (seen.current === null) { seen.current = ids; return; }
    const arrived = fresh.some((o) => !seen.current!.has(o.id));
    seen.current = ids;
    if (arrived && sound) chime();
  }, [orders, loaded, sound, chime]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!sound || fresh.length === 0) return;
    const i = setInterval(chime, 4000);
    return () => clearInterval(i);
  }, [sound, fresh.length, chime]);

  useEffect(() => { // flashing tab title
    if (fresh.length === 0) { document.title = "PoTiPa · Pedidos"; return; }
    let on = true;
    const i = setInterval(() => { document.title = on ? `🔔 (${fresh.length}) NUEVO PEDIDO` : "PoTiPa · Pedidos"; on = !on; }, 1000);
    return () => clearInterval(i);
  }, [fresh.length]);

  useEffect(() => { // keep the screen awake
    let lock: { release: () => Promise<void> } | null = null;
    const get = async () => { try { lock = await (navigator as unknown as { wakeLock?: { request: (t: string) => Promise<{ release: () => Promise<void> }> } }).wakeLock?.request("screen") ?? null; } catch {} };
    get();
    const vis = () => document.visibilityState === "visible" && get();
    document.addEventListener("visibilitychange", vis);
    return () => { document.removeEventListener("visibilitychange", vis); lock?.release().catch(() => {}); };
  }, []);

  function enableSound() {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx.current = ctx.current ?? new AC();
    ctx.current.resume(); setSound(true); chime();
  }
  async function move(id: string, status: Status) {
    setOrders((cur) => cur.map((o) => (o.id === id ? { ...o, status } : o)));
    await fetch("/api/admin/orders", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, status }) });
    load();
  }
  async function logout() { await fetch("/api/admin/login", { method: "DELETE" }); router.refresh(); }

  const by = (s: Status) => orders.filter((o) => o.status === s).sort((a, b) => (s === "new" ? a.number - b.number : a.pickupAt.localeCompare(b.pickupAt)));
  const accepted = by("accepted"), ready = by("ready");
  const history = orders.filter((o) => o.status === "done" || o.status === "cancelled").slice(0, 12);

  return (
    <div className="min-h-screen p-4 md:p-6">
      <header className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl">Pedidos PoTiPa</h1>
        <span className={`rounded-full px-3 py-1 text-xs ${online ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>{online ? "● En directo" : "● Sin conexión"}</span>
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          <PushButton />
          {sound
            ? <button onClick={chime} className="rounded-full border border-white/20 px-4 py-2 text-sm">🔔 Sonido activado · probar</button>
            : <button onClick={enableSound} className="pulse-ring rounded-full bg-[#e8625f] px-4 py-2 text-sm font-medium text-white">🔕 Activar sonido</button>}
          {owner && <button onClick={() => setShowDevices((v) => !v)} className="rounded-full border border-white/20 px-4 py-2 text-sm">📱 Dispositivos</button>}
          {owner ? <button onClick={logout} className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/50">Salir</button> : label && <span className="text-xs text-white/40">{label}</span>}
        </div>
      </header>

      {owner && showDevices && <DevicesPanel onClose={() => setShowDevices(false)} />}
      <div className="grid gap-5 lg:grid-cols-3">
        <Column title="Nuevos" count={fresh.length} accent>
          {fresh.length === 0 && <Empty text="Sin pedidos nuevos" />}
          {by("new").map((o) => <Card key={o.id} o={o} now={now} onMove={move} owner={owner} />)}
        </Column>
        <Column title="En preparación" count={accepted.length}>
          {accepted.length === 0 && <Empty text="Nada en preparación" />}
          {accepted.map((o) => <Card key={o.id} o={o} now={now} onMove={move} owner={owner} />)}
        </Column>
        <Column title="Listos para recoger" count={ready.length}>
          {ready.length === 0 && <Empty text="Nada listo" />}
          {ready.map((o) => <Card key={o.id} o={o} now={now} onMove={move} owner={owner} />)}
        </Column>
      </div>

      {owner && history.length > 0 && (
        <details className="mt-8">
          <summary className="cursor-pointer text-sm text-white/50">Historial reciente ({history.length})</summary>
          <div className="mt-3 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {history.map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-2 text-sm text-white/60">
                <span>#{o.number} · {o.name}</span>
                <span>{o.status === "done" ? "Entregado" : "Cancelado"} <button className="ml-2 underline" onClick={() => move(o.id, "new")}>reabrir</button></span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function Column({ title, count, accent, children }: { title: string; count: number; accent?: boolean; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-sm track text-white/60">{title}
        <span className={`grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-xs font-bold ${accent && count ? "bg-[#e8625f] text-white" : "bg-white/10"}`}>{count}</span></h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
const Empty = ({ text }: { text: string }) => <p className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/30">{text}</p>;

function ago(ms: number) {
  const m = Math.max(0, Math.round(ms / 60000));
  return m < 1 ? "ahora" : m < 60 ? `hace ${m} min` : `hace ${Math.floor(m / 60)} h`;
}
function pickupLabel(o: Order) {
  const d = new Date(o.pickupDate + "T12:00:00Z");
  return `${new Intl.DateTimeFormat("es-ES", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(d)} · ${o.pickupTime}`;
}

function Card({ o, now, onMove, owner }: { o: Order; now: number; onMove: (id: string, s: Status) => void; owner: boolean }) {
  const isNew = o.status === "new";
  const btn = "rounded-full px-4 py-2.5 text-sm font-medium";
  return (
    <article className={`rounded-2xl p-4 ${isNew ? "bg-[#2a1b19] ring-2 ring-[#e8625f] pulse-ring" : "bg-white/[0.06] ring-1 ring-white/10"}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-white/50">#{o.number} · {ago(now - new Date(o.createdAt).getTime())}</p>
          <p className="mt-0.5 text-lg font-medium">{o.name}</p>
        </div>
        {o.needsConfirmation && <span className="rounded-full bg-amber-400/20 px-2.5 py-1 text-[11px] font-medium text-amber-200">POR CONFIRMAR</span>}
      </div>
      <p className="mt-2 inline-block rounded-lg bg-white/10 px-3 py-1.5 text-base font-semibold">📅 {pickupLabel(o)}</p>
      <ul className="mt-3 space-y-1.5 text-[15px]">
        {o.items.map((i, k) => (
          <li key={k}><b>{i.qty}×</b> {i.name}{i.flavour && <span className="text-white/60"> · {i.flavour}</span>}
            {i.inscription && <div className="ml-6 text-sm italic text-[#f5b8b5]">«{i.inscription}»</div>}</li>
        ))}
      </ul>
      {o.notes && <p className="mt-3 rounded-lg bg-white/5 p-2.5 text-sm text-white/80">📝 {o.notes}</p>}
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-white/60">{o.totalCents ? eur(o.totalCents) : ""}{o.needsConfirmation ? " + por confirmar" : ""}</span>
        <span className="flex gap-3">
          <a className="underline" href={`tel:${o.phone}`}>{o.phone}</a>
          <a className="text-emerald-300 underline" target="_blank" rel="noreferrer" href={waLink(o.phone, `Hola ${o.name}, somos PoTiPa. Sobre tu pedido #${o.number}: `)}>WhatsApp</a>
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {isNew && <button onClick={() => onMove(o.id, "accepted")} className={`${btn} flex-1 bg-[#e8625f] text-white`}>✓ Aceptar</button>}
        {o.status === "accepted" && <button onClick={() => onMove(o.id, "ready")} className={`${btn} flex-1 bg-emerald-500 text-white`}>Listo para recoger</button>}
        {o.status === "ready" && <button onClick={() => onMove(o.id, "done")} className={`${btn} flex-1 bg-white text-black`}>Entregado</button>}
        {o.status !== "new" && <button onClick={() => onMove(o.id, "new")} className={`${btn} border border-white/15 text-white/60`}>↩</button>}
        {owner && <button onClick={() => confirm("¿Cancelar este pedido?") && onMove(o.id, "cancelled")} className={`${btn} border border-white/15 text-white/60`}>Cancelar</button>}
      </div>
    </article>
  );
}
