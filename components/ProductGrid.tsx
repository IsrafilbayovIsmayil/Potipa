"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { PRODUCTS, eur, type Product } from "@/lib/products";
import { t, type Locale } from "@/lib/i18n";
import { useCart } from "./CartProvider";
import Tilt from "./Tilt";

function leadLabel(h: number, d: ReturnType<typeof t>) {
  return h >= 24 ? `${Math.round(h / 24)} ${d.days_min}` : `${h} ${d.hours_min}`;
}

export function priceText(p: Product, locale: Locale) {
  const d = t(locale);
  if (p.priceCents == null) return d.price_tbc;
  return p.kind === "custom" ? `${d.from} ${eur(p.priceCents, locale)}` : eur(p.priceCents, locale);
}

export default function ProductGrid({ category, locale, tone = "dark", kind }: { category: Product["category"]; locale: Locale; tone?: "dark" | "light"; kind?: Product["kind"] }) {
  const dark = tone === "dark";
  const [open, setOpen] = useState<Product | null>(null);
  const items = PRODUCTS.filter((p) => p.category === category && (!kind || p.kind === kind));
  const d = t(locale);
  return (
    <>
      <div className={`snap-row -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:gap-x-6 md:gap-y-10 md:overflow-visible md:px-0 ${category === "bodas" ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
        {items.map((p) => (
          <button key={p.id} onClick={() => setOpen(p)} className="group w-[76vw] max-w-[340px] shrink-0 snap-center text-left md:w-auto md:max-w-none">
            <Tilt max={7} className="rounded-[30px]">
              <div className={`relative aspect-[3/4] ${dark ? "bg-roast" : "bg-blush"}`}>
                <Image src={p.image} alt={p.name[locale]} fill sizes="(min-width:768px) 33vw, 76vw" className="object-cover" />
                <span className="absolute bottom-4 left-4 rounded-full bg-coral px-4 py-2 text-base font-semibold text-cocoa">{priceText(p, locale)}</span>
                {p.kind === "custom" && <span className="absolute right-3 top-3 rounded-full bg-cocoa/75 px-3 py-1 text-[11px] font-medium text-crema backdrop-blur">{d.custom_badge}</span>}
              </div>
            </Tilt>
            <h3 className={`mt-4 font-display text-lg leading-snug ${dark ? "text-crema" : "text-cocoa"}`}>{p.name[locale]}</h3>
            {p.serves && <p className={`mt-0.5 text-sm ${dark ? "text-crema/60" : "text-cocoa/60"}`}>{p.serves[locale]}</p>}
          </button>
        ))}
      </div>
      {open && <ProductModal p={open} locale={locale} onClose={() => setOpen(null)} />}
    </>
  );
}

function ProductModal({ p, locale, onClose }: { p: Product; locale: Locale; onClose: () => void }) {
  const d = t(locale);
  const { add } = useCart();
  const [flavour, setFlavour] = useState(p.flavours?.[0]?.id);
  const [inscription, setInscription] = useState("");
  const [qty, setQty] = useState(1);
  const [done, setDone] = useState(false);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [onClose]);

  const submit = () => {
    add({ productId: p.id, qty, flavour, inscription: inscription.trim() || undefined });
    setDone(true);
    setTimeout(onClose, 700);
  };
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-cocoa/60 sm:place-items-center" onClick={onClose} role="dialog" aria-modal="true">
      <div className="max-h-[92vh] w-full overflow-auto rounded-t-3xl bg-cream text-cocoa sm:max-w-3xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="grid sm:grid-cols-2">
          <div className="relative aspect-[4/5] sm:aspect-auto sm:min-h-[460px]">
            <Tilt touch max={8} className="absolute inset-0"><Image src={p.image} alt={p.name[locale]} fill sizes="450px" className="object-cover" /></Tilt>
          </div>
          <div className="flex flex-col gap-4 p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-2xl leading-tight">{p.name[locale]}</h3>
                {p.serves && <p className="mt-1 text-sm text-cocoa/60">{p.serves[locale]}</p>}
              </div>
              <button onClick={onClose} aria-label="Close" className="rounded-full p-1 text-2xl leading-none text-cocoa/50 hover:text-cocoa">×</button>
            </div>
            <p className="text-sm text-cocoa/80">{p.desc[locale]}</p>
            <p className="text-xl font-medium text-coral">{priceText(p, locale)}</p>

            {p.flavours && (
              <div>
                <p className="mb-2 text-xs track text-cocoa/60">{d.flavour}</p>
                <div className="flex flex-wrap gap-2">
                  {p.flavours.map((f) => (
                    <button key={f.id} onClick={() => setFlavour(f.id)} className={`rounded-full border px-4 py-1.5 text-sm ${flavour === f.id ? "border-coral bg-coral text-white" : "border-cocoa/20 hover:border-coral"}`}>{f.label[locale]}</button>
                  ))}
                </div>
              </div>
            )}
            {p.inscription && (
              <label className="block">
                <span className="mb-2 block text-xs track text-cocoa/60">{d.inscription}</span>
                <input value={inscription} maxLength={120} onChange={(e) => setInscription(e.target.value)} placeholder={d.inscription_ph} className="w-full rounded-xl border border-cocoa/20 bg-white px-4 py-2.5 outline-none focus:border-coral" />
              </label>
            )}
            {p.kind === "custom" && (
              <p className="rounded-xl bg-blush/60 p-3 text-xs text-cocoa/80">{p.designHint ? p.designHint[locale] + " " : ""}{d.custom_note} · {d.earliest} {leadLabel(p.leadHours, d)}</p>
            )}
            {p.kind === "fixed" && <p className="text-xs text-cocoa/60">{d.earliest} {leadLabel(p.leadHours, d)}</p>}

            <div className="mt-auto flex items-center gap-3 pt-2">
              <div className="flex items-center rounded-full border border-cocoa/20">
                <button className="h-10 w-10 text-lg" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="-">−</button>
                <span className="w-8 text-center">{qty}</span>
                <button className="h-10 w-10 text-lg" onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="+">+</button>
              </div>
              <button onClick={submit} className="flex-1 rounded-full bg-coral py-3 font-medium text-white hover:bg-coral-dark">{done ? "✓ " + d.added : d.add}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
