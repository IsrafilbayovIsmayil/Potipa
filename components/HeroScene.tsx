"use client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { t, type Locale } from "@/lib/i18n";

const MS = 7000;
const TABLE = 27; // % of the hero taken by the table surface

type Slide = {
  script: string; title: string; scene: string;
  cake: { src: string; w: number; h: number }; height: [number, number]; // cake height % (mobile, desktop)
  href: string; cta: string;
};

export default function HeroScene({ locale }: { locale: Locale }) {
  const d = t(locale);
  const slides: Slide[] = [
    { script: d.w_script, title: `${d.w_t1} ${d.w_t2}`, scene: "mar", cake: { src: "/img/cut/azul-completa.webp", w: 1021, h: 1400 }, height: [44, 56], href: "#contacto", cta: d.w_cta2 },
    { script: d.hs2, title: d.ht2, scene: "jardin", cake: { src: "/img/cut/boda-100.webp", w: 482, h: 766 }, height: [46, 60], href: "#contacto", cta: d.w_cta2 },
    { script: d.hs3, title: d.ht3, scene: "piedra", cake: { src: "/img/cut/tarta-birthday.webp", w: 453, h: 429 }, height: [30, 40], href: "#contacto", cta: d.w_cta2 },
    { script: d.hs4, title: d.ht4, scene: "vela", cake: { src: "/img/cut/red-velvet.webp", w: 525, h: 546 }, height: [30, 38], href: `/${locale}/tartas`, cta: d.nav_cakes },
  ];
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [still, setStill] = useState(false);
  const root = useRef<HTMLElement>(null);
  const go = useCallback((n: number) => setI((n + slides.length) % slides.length), [slides.length]);

  useEffect(() => { setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches); }, []);
  useEffect(() => {
    if (paused || still) return;
    const id = setTimeout(() => go(i + 1), MS);
    return () => clearTimeout(id);
  }, [i, paused, still, go]);

  // pointer parallax: wall drifts against the cake for depth
  const onMove = (e: React.PointerEvent) => {
    if (still || e.pointerType !== "mouse" || !root.current) return;
    const r = root.current.getBoundingClientRect();
    root.current.style.setProperty("--px", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
    root.current.style.setProperty("--py", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
  };
  // swipe on touch
  const sx = useRef<number | null>(null);

  const cur = slides[i];
  return (
    <section
      ref={root}
      aria-roledescription="carousel"
      onPointerMove={onMove}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => { setPaused(false); root.current?.style.setProperty("--px", "0"); root.current?.style.setProperty("--py", "0"); }}
      onTouchStart={(e) => { sx.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => { if (sx.current == null) return; const dx = e.changedTouches[0].clientX - sx.current; if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1)); sx.current = null; }}
      className="relative isolate h-[calc(100svh-61px)] min-h-[600px] max-h-[940px] overflow-hidden bg-[#1c1512] text-white [--px:0] [--py:0]"
    >
      {slides.map((sl, k) => (
        <div key={k} aria-hidden={k !== i} className={`absolute inset-0 transition-opacity duration-[1300ms] ease-out ${k === i ? "z-10 opacity-100" : "z-0 opacity-0"}`}>
          <div key={k === i ? `on${i}` : "off"} className={`absolute inset-0 ${k === i ? "dolly" : ""}`}>
            {/* wall */}
            <div className="absolute inset-x-[-3%] top-[-3%] transition-transform duration-500 ease-out" style={{ bottom: `${TABLE - 3}%`, transform: "translate(calc(var(--px) * -14px), calc(var(--py) * -8px))" }}>
              <Image src={`/img/scene-${sl.scene}-wall.jpg`} alt="" fill priority={k === 0} sizes="100vw" className="object-cover" />
            </div>
            {/* table */}
            <div className="absolute inset-x-0 bottom-0" style={{ height: `${TABLE}%` }}>
              <Image src={`/img/scene-${sl.scene}-table.jpg`} alt="" fill priority={k === 0} sizes="100vw" className="object-cover object-top" />
            </div>
            {/* cake on the table */}
            <div className="absolute left-1/2 h-[var(--ch)] transition-transform duration-500 ease-out md:left-[71%] md:h-[var(--chd)]" style={{ bottom: `${TABLE * 0.5}%`, transform: "translate(calc(-50% + var(--px) * 8px), 0)", ["--ch" as string]: `${sl.height[0]}%`, ["--chd" as string]: `${sl.height[1]}%` } as React.CSSProperties}>
              <span aria-hidden className="absolute bottom-[-2.5%] left-1/2 h-[9%] w-[95%] -translate-x-1/2 rounded-[50%] bg-black/55 blur-[14px]" />
              <Image
                key={k === i ? `c${i}` : "c"}
                src={sl.cake.src} alt="" width={sl.cake.w} height={sl.cake.h} priority={k === 0}
                sizes="(min-width:768px) 40vw, 70vw"
                className={`relative h-full w-auto max-w-none drop-shadow-[0_18px_24px_rgba(0,0,0,.35)] ${k === i ? "cakein" : ""}`}
              />
            </div>
          </div>
        </div>
      ))}
      <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-b from-black/45 via-transparent to-transparent md:bg-gradient-to-r md:from-black/60 md:via-black/20 md:to-transparent" />

      <div className="relative z-30 mx-auto flex h-full max-w-6xl flex-col px-5 pt-10 md:justify-center md:pt-0">
        <div key={`t${i}`} className="max-w-xl text-center md:-mt-16 md:text-left">
          <p className="rise font-script text-3xl text-[#f3dcc8] md:text-4xl">{cur.script}</p>
          <h1 className="rise mt-1 font-serif-d text-[2.75rem] leading-[1.02] [animation-delay:.08s] sm:text-6xl md:text-7xl lg:text-[5.6rem]">{cur.title}</h1>
          <p className="rise mt-5 hidden max-w-md text-lg leading-relaxed text-white/80 [animation-delay:.16s] md:block">{d.w_sub}</p>
          <div className="rise mt-6 flex justify-center gap-3 [animation-delay:.24s] md:mt-8 md:justify-start">
            <Link href={cur.href} className="btn bg-white px-7 text-cocoa hover:bg-[#f3dcc8]">{cur.cta}</Link>
            <span className="hidden sm:inline-flex"><Link href="#tartas" className="btn border border-white/45 px-7 text-white hover:border-white hover:bg-white/10">{d.col_title}</Link></span>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 pb-5">
          <div className="flex items-center gap-5">
            {slides.map((_, k) => (
              <button key={k} onClick={() => go(k)} aria-label={`${k + 1} / ${slides.length}`} aria-current={k === i}
                className={`text-left text-xs tabular-nums tracking-wider transition ${k === i ? "text-white" : "text-white/45 hover:text-white/80"}`}>
                {String(k + 1).padStart(2, "0")}
                <span className="mt-1.5 block h-px w-8 overflow-hidden bg-white/25 md:w-12">
                  {k === i && <span key={`p${i}${paused}`} className="block h-full origin-left bg-white" style={{ animation: paused || still ? "none" : `prog ${MS}ms linear both` }} />}
                </span>
              </button>
            ))}
          </div>
          <div className="hidden gap-2 md:flex">
            <button onClick={() => go(i - 1)} aria-label="‹" className="grid h-10 w-10 place-items-center rounded-full border border-white/30 hover:border-white"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 6l-6 6 6 6" /></svg></button>
            <button onClick={() => go(i + 1)} aria-label="›" className="grid h-10 w-10 place-items-center rounded-full border border-white/30 hover:border-white"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 6l6 6-6 6" /></svg></button>
          </div>
        </div>
      </div>
    </section>
  );
}
