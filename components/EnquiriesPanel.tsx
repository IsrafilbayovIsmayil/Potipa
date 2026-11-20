"use client";
import { useCallback, useEffect, useState } from "react";
import type { Enquiry } from "@/lib/enquiries";
import { waLink } from "@/lib/order";
import { AD, adminTag, fill, type AdminLang } from "@/lib/adminI18n";

export function useEnquiries(poll = 8000) {
  const [list, setList] = useState<Enquiry[]>([]);
  const load = useCallback(async () => {
    try { const r = await fetch("/api/admin/enquiries", { cache: "no-store" }); if (r.ok) setList((await r.json()).enquiries); } catch {}
  }, []);
  useEffect(() => { load(); const i = setInterval(load, poll); return () => clearInterval(i); }, [load, poll]);
  const mark = async (id: string, handled: boolean) => {
    setList((cur) => cur.map((e) => (e.id === id ? { ...e, handled } : e)));
    await fetch("/api/admin/enquiries", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, handled }) });
    load();
  };
  return { list, mark };
}

export default function EnquiriesPanel({ list, mark, lang }: { list: Enquiry[]; mark: (id: string, h: boolean) => void; lang: AdminLang }) {
  const a = AD[lang];
  const open = list.filter((e) => !e.handled).sort((x, y) => (x.date || "9999").localeCompare(y.date || "9999"));
  const done = list.filter((e) => e.handled);
  const fmtDate = (d: string) => (d ? new Intl.DateTimeFormat(adminTag(lang), { weekday: "short", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(d + "T12:00:00Z")) : a.enq_nodate);
  return (
    <div>
      {open.length === 0 && <p className="rounded-2xl border border-dashed border-white/10 p-5 text-center text-sm text-white/30">{a.enq_empty}</p>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{open.map((e) => <Item key={e.id} e={e} mark={mark} a={a} fmtDate={fmtDate} />)}</div>
      {done.length > 0 && (
        <details className="mt-8">
          <summary className="cursor-pointer text-sm text-white/50">{a.enq_hist} ({done.length})</summary>
          <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{done.map((e) => <Item key={e.id} e={e} mark={mark} a={a} fmtDate={fmtDate} />)}</div>
        </details>
      )}
    </div>
  );
}

function Item({ e, mark, a, fmtDate }: { e: Enquiry; mark: (id: string, h: boolean) => void; a: (typeof AD)["es"]; fmtDate: (d: string) => string }) {
  const row = (k: string, v: string) => v && <p><span className="text-white/50">{k}: </span>{v}</p>;
  return (
    <article className={`rounded-2xl p-4 ${e.handled ? "bg-white/[0.04] opacity-70 ring-1 ring-white/10" : "bg-[#2a1b19] ring-2 ring-[#e8625f]"}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-lg font-medium">{e.name} <span className="ml-1 rounded bg-white/10 px-1.5 py-0.5 align-middle text-[10px] font-normal tracking-wider text-white/60">{(e.locale ?? "es").toUpperCase()}</span></p>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${e.handled ? "bg-white/10 text-white/60" : "bg-[#e8625f] text-white"}`}>{e.handled ? a.enq_done : a.enq_new}</span>
      </div>
      <p className="mt-2 inline-block rounded-lg bg-white/10 px-3 py-1.5 font-semibold">📅 {fmtDate(e.date)}</p>
      <div className="mt-3 space-y-1 text-[15px]">
        {row(a.enq_guests, e.guests)}{row(a.enq_venue, e.venue)}{row(a.enq_flavour, e.flavour)}
      </div>
      {e.message && <p className="mt-3 whitespace-pre-line rounded-lg bg-white/5 p-2.5 text-sm text-white/80">📝 {e.message}</p>}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <a className="underline" href={`tel:${e.phone}`}>{e.phone}</a>
        <a className="text-emerald-300 underline" target="_blank" rel="noreferrer" href={waLink(e.phone, fill(a.enq_wa, { n: e.name }))}>WhatsApp</a>
      </div>
      <button onClick={() => mark(e.id, !e.handled)} className={`mt-4 w-full rounded-full px-4 py-2.5 text-sm font-medium ${e.handled ? "border border-white/15 text-white/60" : "bg-emerald-500 text-white"}`}>
        {e.handled ? a.enq_reopen : a.enq_mark}
      </button>
    </article>
  );
}
