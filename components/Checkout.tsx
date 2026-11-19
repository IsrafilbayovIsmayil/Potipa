"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "./CartProvider";
import { productById, eur } from "@/lib/products";
import { t, type Locale } from "@/lib/i18n";
import { addDays, availableSlots, madridParts } from "@/lib/time";
import { SHOP } from "@/lib/shop";

export default function Checkout({ locale }: { locale: Locale }) {
  const d = t(locale);
  const router = useRouter();
  const { lines, ready, setQty, remove, clear } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  const rows = lines.map((l) => ({ l, p: productById(l.productId)! })).filter((r) => r.p);
  const lead = Math.max(0, ...rows.map((r) => r.p.leadHours));
  const total = rows.reduce((n, r) => n + (r.p.kind === "fixed" && r.p.priceCents ? r.p.priceCents * r.l.qty : 0), 0);
  const needsConfirm = rows.some((r) => r.p.kind === "custom");
  const hasEstimate = rows.some((r) => r.p.kind === "custom");

  const days = useMemo(() => {
    if (!now) return [];
    const today = madridParts(now).date;
    const out: { date: string; slots: string[] }[] = [];
    for (let i = 0; i < 75 && out.length < 40; i++) {
      const dt = addDays(today, i);
      const slots = availableSlots(dt, lead, now);
      if (slots.length) out.push({ date: dt, slots });
    }
    return out;
  }, [now, lead]);

  useEffect(() => {
    if (days.length && !days.find((x) => x.date === date)) { setDate(days[0].date); setTime(""); }
  }, [days, date]);
  const slots = days.find((x) => x.date === date)?.slots ?? [];
  const dayLabel = (s: string) => new Intl.DateTimeFormat(locale === "ca" ? "ca-ES" : "es-ES", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(s + "T12:00:00Z"));
  const leadText = lead >= 24 ? `${Math.round(lead / 24)} ${d.days_min}` : `${lead} ${d.hours_min}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (name.trim().length < 2) return setErr(d.err_name);
    if (!/^\+?\d{7,15}$/.test(phone.replace(/[\s.-]/g, ""))) return setErr(d.err_phone);
    if (!date || !time) return setErr(d.err_pickup);
    setBusy(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, phone, notes, pickupDate: date, pickupTime: time, locale, website,
          items: lines.map((l) => ({ productId: l.productId, qty: l.qty, flavour: l.flavour, inscription: l.inscription })) }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(j.error === "lead" ? d.err_lead : j.error === "rate" ? d.err_rate : j.error === "phone" ? d.err_phone : j.error === "name" ? d.err_name : d.err_generic);
        setBusy(false);
        return;
      }
      clear();
      router.push(`/${locale}/gracias?n=${j.number ?? ""}&c=${needsConfirm ? 1 : 0}`);
    } catch {
      setErr(d.err_generic);
      setBusy(false);
    }
  }

  if (ready && rows.length === 0) {
    return (
      <main className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl">{d.cart_empty}</h1>
        <Link href={`/${locale}#tartas`} className="mt-6 inline-block rounded-full bg-coral px-6 py-3 text-white">{d.back_menu}</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-5">
      <section className="md:col-span-3">
        <h1 className="font-display text-3xl">{d.cart}</h1>
        <ul className="mt-6 divide-y divide-cocoa/10">
          {rows.map(({ l, p }) => (
            <li key={l.key} className="flex gap-4 py-4">
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-blush"><Image src={p.image} alt="" fill sizes="80px" className="object-cover" /></div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg leading-tight">{p.name[locale]}</p>
                <p className="text-xs text-cocoa/60">
                  {[l.flavour && p.flavours?.find((f) => f.id === l.flavour)?.label[locale], l.inscription && `«${l.inscription}»`].filter(Boolean).join(" · ")}
                </p>
                {p.kind === "custom" && <span className="mt-1 inline-block rounded-full bg-blush px-2 py-0.5 text-[10px] track">{d.custom_badge}</span>}
                <div className="mt-2 flex items-center gap-3 text-sm">
                  <div className="flex items-center rounded-full border border-cocoa/20">
                    <button className="h-8 w-8" onClick={() => setQty(l.key, l.qty - 1)} aria-label="-">−</button>
                    <span className="w-6 text-center">{l.qty}</span>
                    <button className="h-8 w-8" onClick={() => setQty(l.key, l.qty + 1)} aria-label="+">+</button>
                  </div>
                  <button className="text-xs text-cocoa/50 underline" onClick={() => remove(l.key)}>{d.remove}</button>
                </div>
              </div>
              <p className="whitespace-nowrap font-medium">{p.priceCents == null ? "—" : `${p.kind === "custom" ? d.from + " " : ""}${eur(p.priceCents * l.qty, locale)}`}</p>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-baseline justify-between border-t border-cocoa/10 pt-4">
          <span className="text-cocoa/70">{d.subtotal}</span>
          <span className="font-display text-2xl">{eur(total, locale)}{hasEstimate && <span className="ml-2 text-xs font-sans text-cocoa/60">{d.plus_tbc}</span>}</span>
        </div>
        <p className="mt-1 text-right text-xs text-cocoa/60">{d.pay_note}</p>
      </section>

      <form onSubmit={submit} className="space-y-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-cocoa/5 md:col-span-2 md:self-start">
        <h2 className="font-display text-xl">{d.your_data}</h2>
        <input type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        <label className="block text-sm"><span className="mb-1 block text-xs track text-cocoa/60">{d.name}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={80} className="w-full rounded-xl border border-cocoa/20 px-4 py-2.5 outline-none focus:border-coral" /></label>
        <label className="block text-sm"><span className="mb-1 block text-xs track text-cocoa/60">{d.phone}</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" autoComplete="tel" maxLength={24} className="w-full rounded-xl border border-cocoa/20 px-4 py-2.5 outline-none focus:border-coral" /></label>

        <div>
          <p className="mb-1 text-xs track text-cocoa/60">{d.pickup}</p>
          <p className="mb-2 text-xs text-cocoa/60">{d.earliest} {leadText}</p>
          <div className="grid grid-cols-2 gap-2">
            <select value={date} onChange={(e) => { setDate(e.target.value); setTime(""); }} aria-label={d.date} className="rounded-xl border border-cocoa/20 bg-white px-3 py-2.5 outline-none focus:border-coral">
              {days.map((x) => <option key={x.date} value={x.date}>{dayLabel(x.date)}</option>)}
            </select>
            <select value={time} onChange={(e) => setTime(e.target.value)} aria-label={d.time} className="rounded-xl border border-cocoa/20 bg-white px-3 py-2.5 outline-none focus:border-coral">
              <option value="">{slots.length ? d.pick_time : d.no_slots}</option>
              {slots.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <label className="block text-sm"><span className="mb-1 block text-xs track text-cocoa/60">{d.notes}</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={500} className="w-full rounded-xl border border-cocoa/20 px-4 py-2.5 outline-none focus:border-coral" /></label>

        {needsConfirm && <p className="rounded-xl bg-blush/60 p-3 text-xs">{d.custom_note}</p>}
        {err && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{err} <a className="underline" href={`https://wa.me/${SHOP.whatsapp}`}>WhatsApp</a></p>}
        <button disabled={busy} className="w-full rounded-full bg-coral py-3.5 font-medium text-white hover:bg-coral-dark disabled:opacity-60">{busy ? d.sending : d.send}</button>
      </form>
    </main>
  );
}
