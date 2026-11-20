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
  const [menu, setMenu] = useState(false);
  const [tab, setTab] = useState<"new" | "accepted" | "ready">("new");
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

  const tabs: { k: "new" | "accepted" | "ready"; t: string; n: number }[] = [
    { k: "new", t: "Nuevos", n: fresh.length }, { k: "accepted", t: "Preparación", n: accepted.length }, { k: "ready", t: "Listos", n: ready.length },
  ];
  const show = (k: string) => (tab === k ? "block" : "hidden") + " lg:block";
  const icon = "grid h-10 w-10 place-items-center rounded-full border border-white/15 text-lg";

  return (
    <div className="min-h-screen pb-10">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#171210]/95 backdrop-blur">
        <div className="flex items-center gap-2 px-4 py-2.5 lg:px-6">
          <h1 className="font-display text-xl">PoTiPa</h1>
          <span title={online ? "En directo" : "Sin conexión"} className={`h-2.5 w-2.5 rounded-full ${online ? "bg-emerald-400" : "bg-red-500 animate-pulse"}`} />
          {!online && <span className="text-xs text-red-300">Sin conexión</span>}
          {!owner && label && <span className="text-xs text-white/40">{label}</span>}
          <div className="ml-auto flex items-center gap-2">
            <PushButton compact />
            <button onClick={sound ? chime : enableSound} title={sound ? "Sonido activado · probar" : "Activar sonido"}
              className={sound ? icon : `${icon} pulse-ring border-transparent bg-[#e8625f]`}>{sound ? "🔔" : "🔕"}</button>
            {owner && (
              <div className="relative">
                <button onClick={() => setMenu((v) => !v)} aria-label="Menú" className={icon}>⋯</button>
                {menu && (
                  <div className="absolute right-0 top-12 w-52 overflow-hidden rounded-2xl border border-white/10 bg-[#241b17] shadow-xl">
                    <button onClick={() => { setShowDevices((v) => !v); setMenu(false); }} className="block w-full px-4 py-3 text-left text-sm hover:bg-white/5">📱 Dispositivos</button>
                    <button onClick={logout} className="block w-full border-t border-white/10 px-4 py-3 text-left text-sm text-white/60 hover:bg-white/5">Salir</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {!sound && <button onClick={enableSound} className="block w-full bg-[#e8625f] px-4 py-2 text-center text-sm font-medium text-white">🔕 Toca aquí para activar el sonido de los pedidos</button>}
        <nav className="flex gap-1 px-3 pb-2 pt-1 lg:hidden">
          {tabs.map((x) => (
            <button key={x.k} onClick={() => setTab(x.k)}
              className={`flex-1 rounded-full px-2 py-2 text-sm ${tab === x.k ? "bg-white/15 font-medium text-white" : "text-white/50"}`}>
              {x.t} <span className={`ml-1 rounded-full px-1.5 text-xs font-bold ${x.k === "new" && x.n ? "bg-[#e8625f] text-white" : "bg-white/10"}`}>{x.n}</span>
            </button>
          ))}
        </nav>
      </header>

      <main className="px-4 pt-4 lg:px-6">
      {owner && showDevices && <DevicesPanel onClose={() => setShowDevices(false)} />}
      <div className="grid gap-5 lg:grid-cols-3">
        <Column title="Nuevos" count={fresh.length} accent cls={show("new")}>
          {fresh.length === 0 && <Empty text="Sin pedidos nuevos" />}
          {by("new").map((o) => <Card key={o.id} o={o} now={now} onMove={move} owner={owner} />)}
        </Column>
        <Column title="En preparación" count={accepted.length} cls={show("accepted")}>
          {accepted.length === 0 && <Empty text="Nada en preparación" />}
          {accepted.map((o) => <Card key={o.id} o={o} now={now} onMove={move} owner={owner} />)}
        </Column>
        <Column title="Listos para recoger" count={ready.length} cls={show("ready")}>
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
      </main>
    </div>
  );
}

function Column({ title, count, accent, cls, children }: { title: string; count: number; accent?: boolean; cls: string; children: React.ReactNode }) {
  return (
    <section className={cls}>
      <h2 className="mb-3 hidden items-center gap-2 text-sm track text-white/60 lg:flex">{title}
        <span className={`grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-xs font-bold ${accent && count ? "bg-[#e8625f] text-white" : "bg-white/10"}`}>{count}</span></h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
const Empty = ({ text }: { text: string }) => <p className="rounded-2xl border border-dashed border-white/10 p-5 text-center text-sm text-white/30">{text}</p>;

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
