"use client";
import { useState } from "react";
import { t, type Locale } from "@/lib/i18n";
import { SHOP } from "@/lib/shop";

export default function WeddingForm({ locale }: { locale: Locale }) {
  const d = t(locale);
  const [state, setState] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [err, setErr] = useState("");
  const input = "w-full rounded-xl border border-black/5 bg-[#f8f6f6] px-4 py-3.5 text-[15px] outline-none transition focus:border-coral focus:bg-white";
  const label = "mb-1.5 block text-xs font-semibold text-black/55";

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("sending"); setErr("");
    try {
      const r = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...Object.fromEntries(f), locale }) });
      if (!r.ok) throw new Error();
      setState("ok");
    } catch { setState("err"); setErr(d.f_err); }
  }

  if (state === "ok") {
    const wa = `https://wa.me/${SHOP.whatsapp}`;
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-[0_10px_40px_-12px_rgba(0,0,0,.12)]">
        <p className="font-script text-4xl text-coral">{d.w_script}</p>
        <h3 className="mt-2 text-2xl font-bold">{d.f_ok_t}</h3>
        <p className="mt-3 text-black/65">{d.f_ok_d}</p>
        <p className="mt-6 text-sm text-black/60">{d.f_photos}</p>
        <a href={wa} target="_blank" rel="noreferrer" className="mt-3 inline-flex h-12 items-center justify-center rounded-full border border-black/10 px-6 text-sm font-semibold hover:border-gold hover:text-gold">{d.f_photos_cta}</a>
      </div>
    );
  }
  return (
    <form onSubmit={submit} className="rounded-3xl bg-white p-6 shadow-[0_10px_40px_-12px_rgba(0,0,0,.12)] md:p-9">
      <h3 className="mb-6 text-xl font-bold">{d.f_title}</h3>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className={label} htmlFor="w-name">{d.f_name}</label><input id="w-name" name="name" required minLength={2} autoComplete="name" className={input} /></div>
        <div><label className={label} htmlFor="w-phone">{d.f_phone}</label><input id="w-phone" name="phone" required type="tel" autoComplete="tel" className={input} /></div>
        <div><label className={label} htmlFor="w-date">{d.f_date}</label><input id="w-date" name="date" type="date" className={input} /></div>
        <div><label className={label} htmlFor="w-venue">{d.f_venue}</label><input id="w-venue" name="venue" placeholder={d.f_venue_ph} className={input} /></div>
        <div>
          <label className={label} htmlFor="w-guests">{d.f_guests}</label>
          <select id="w-guests" name="guests" className={input} defaultValue="">
            <option value="" disabled>—</option>
            {[d.g1, d.g2, d.g3, d.g4].map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div><label className={label} htmlFor="w-flavour">{d.f_flavour}</label><input id="w-flavour" name="flavour" placeholder={d.f_flavour_ph} className={input} /></div>
      </div>
      <div className="mt-4"><label className={label} htmlFor="w-msg">{d.f_msg}</label><textarea id="w-msg" name="message" rows={4} placeholder={d.f_msg_ph} className={input} /></div>
      {state === "err" && <p role="alert" className="mt-4 text-sm text-coral-dark">{err}</p>}
      <button disabled={state === "sending"} className="mt-6 h-14 w-full rounded-xl bg-coral text-base font-bold text-white shadow-lg shadow-coral/30 transition hover:bg-coral-dark disabled:opacity-60">
        {state === "sending" ? d.f_sending : d.f_send}
      </button>
      <p className="mt-4 text-center text-xs text-black/50">{d.f_photos}</p>
    </form>
  );
}
