"use client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { t, type Locale } from "@/lib/i18n";
import { productById, type Product } from "@/lib/products";
import { ProductModal, priceText } from "./ProductGrid";

type Item = { id: string | null; src: string; w: number; h: number; tall?: boolean };
const ITEMS: Item[] = [
  { id: "boda-100", src: "/img/cut/boda-100.webp", w: 482, h: 766, tall: true },
  { id: "red-velvet", src: "/img/cut/red-velvet.webp", w: 525, h: 546 },
  { id: "ferrero", src: "/img/cut/ferrero.webp", w: 537, h: 555 },
  { id: "tarta-personalizada", src: "/img/cut/tarta-birthday.webp", w: 453, h: 429 },
  { id: "medovik", src: "/img/cut/medovik.webp", w: 536, h: 486 },
  { id: null, src: "/img/cut/azul-completa.webp", w: 1021, h: 1400, tall: true },
  { id: "pistacho-frambuesa", src: "/img/cut/pistacho.webp", w: 516, h: 561 },
  { id: "carrot-cake", src: "/img/cut/carrot.webp", w: 495, h: 490 },
  { id: "red-velvet-mini", src: "/img/cut/red-velvet-mini.webp", w: 1074, h: 1022 },
  { id: "tiramisu-grande", src: "/img/cut/tiramisu-grande.webp", w: 504, h: 597 },
];
const N = ITEMS.length;
const STEP = (Math.PI * 2) / N;

export default function CakeRing({ locale }: { locale: Locale }) {
  const d = t(locale);
  const [angle, setAngle] = useState(0);
  const [wide, setWide] = useState(true);
  const [open, setOpen] = useState<Product | null>(null);
  const a = useRef(0), v = useRef(0), drag = useRef<{ x: number; a: number; t: number } | null>(null), raf = useRef(0);

  useEffect(() => { const f = () => setWide(window.innerWidth >= 768); f(); window.addEventListener("resize", f); return () => window.removeEventListener("resize", f); }, []);

  const animateTo = useCallback((target: number) => {
    cancelAnimationFrame(raf.current);
    const tick = () => {
      const diff = target - a.current;
      a.current += diff * 0.14;
      setAngle(a.current);
      if (Math.abs(diff) > 0.0005) raf.current = requestAnimationFrame(tick); else { a.current = target; setAngle(target); }
    };
    raf.current = requestAnimationFrame(tick);
  }, []);
  const snap = useCallback((from: number) => animateTo(Math.round(from / STEP) * STEP), [animateTo]);
  const step = (dir: number) => animateTo(Math.round(a.current / STEP) * STEP - dir * STEP);

  const onDown = (e: React.PointerEvent) => {
    cancelAnimationFrame(raf.current);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, a: a.current, t: performance.now() }; v.current = 0;
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const k = wide ? 520 : 260;
    const na = drag.current.a + (e.clientX - drag.current.x) / k;
    const now = performance.now();
    v.current = (na - a.current) / Math.max(1, now - drag.current.t) * 16;
    drag.current.t = now;
    a.current = na; setAngle(na);
  };
  const onUp = () => {
    if (!drag.current) return;
    drag.current = null;
    // a short glide, then settle on the nearest cake
    snap(a.current + v.current * 10);
  };

  const front = ((Math.round(-angle / STEP) % N) + N) % N;
  const item = ITEMS[front];
  const p = item.id ? productById(item.id) : null;
  const Rx = wide ? 560 : 150, Ry = wide ? 130 : 70, base = wide ? 250 : 170;

  return (
    <section id="tartas" className="relative scroll-mt-16 overflow-hidden bg-[#1c1512] py-16 text-white md:py-20">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-b from-[#3a2c24] to-[#1c1512]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-full w-[80%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_50%_35%,rgba(255,226,190,.16),transparent_60%)]" />
      <div className="relative mx-auto max-w-6xl px-5 text-center">
        <h2 className="font-serif-d text-4xl md:text-6xl">{d.col_title}</h2>
        <p className="mt-2 text-sm text-white/55">{d.ring_hint}</p>
      </div>

      <div
        role="group" aria-roledescription="carousel"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); }}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
        className="relative mx-auto mt-6 h-[300px] max-w-6xl cursor-grab touch-pan-y select-none active:cursor-grabbing md:h-[460px]"
      >
        {ITEMS.map((it, k) => {
          const th = k * STEP + angle;
          const depth = (Math.cos(th) + 1) / 2; // 1 front, 0 back
          const x = Math.sin(th) * Rx;
          const y = -(1 - depth) * Ry;
          const s = wide ? 0.3 + 0.7 * depth ** 1.6 : 0.2 + 0.8 * depth ** 2.4;
          const h = base * (it.tall ? 1.35 : 1);
          return (
            <div key={k} aria-hidden={k !== front}
              className="absolute bottom-[14%] left-1/2 will-change-transform"
              style={{ transform: `translate3d(calc(-50% + ${x}px), ${y}px, 0) scale(${s})`, transformOrigin: "50% 100%", zIndex: Math.round(depth * 100), opacity: 0.15 + 0.85 * depth ** 1.3, filter: depth < 0.7 ? `blur(${(0.7 - depth) * 5}px) brightness(${0.6 + depth * 0.5})` : undefined }}>
              <span aria-hidden className="absolute bottom-[-4%] left-1/2 h-[10%] w-[90%] -translate-x-1/2 rounded-[50%] bg-black/60 blur-[12px]" />
              <Image src={it.src} alt="" width={it.w} height={it.h} draggable={false} sizes="(min-width:768px) 340px, 220px" className="relative w-auto max-w-none" style={{ height: h }} />
            </div>
          );
        })}
      </div>

      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-5">
        <button onClick={() => step(-1)} aria-label="‹" className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/30 hover:border-white"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 6l-6 6 6 6" /></svg></button>
        <div key={front} className="rise min-w-0 text-center" aria-live="polite">
          <p className="font-serif-d text-2xl leading-tight md:text-3xl">{p ? p.name[locale] : d.ring_wedding}</p>
          <p className="mt-1 text-sm text-white/60">{p ? priceText(p, locale) : d.col1s}</p>
          {p && p.kind === "fixed"
            ? <button onClick={() => setOpen(p)} className="btn mt-4 bg-white px-7 text-cocoa hover:bg-[#f3dcc8]">{d.ring_open}</button>
            : <Link href="#contacto" className="btn mt-4 bg-white px-7 text-cocoa hover:bg-[#f3dcc8]">{d.ring_quote}</Link>}
        </div>
        <button onClick={() => step(1)} aria-label="›" className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/30 hover:border-white"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 6l6 6-6 6" /></svg></button>
      </div>
      {open && <ProductModal p={open} locale={locale} onClose={() => setOpen(null)} />}
    </section>
  );
}
