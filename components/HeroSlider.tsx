"use client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

const MS = 6500;
const BG = {
  palomera: { src: "/img/bg-palomera.jpg", credit: "Foto: Pawel Studzienny · Arxiu d'Imatges PTCBG" },
  castell: { src: "/img/bg-castell.jpg", credit: "Foto: Wikimedia Commons" },
} as const;

export default function HeroSlider({ locale }: { locale: Locale }) {
  const d = t(locale);
  const slides = [
    { s: d.w_script, t: `${d.w_t1} ${d.w_t2}`, bg: BG.palomera, pos: "62% 50%", tint: "", cake: "/img/azul-completa.jpg", cakePos: "50% 35%" },
    { s: d.hs2, t: d.ht2, bg: BG.castell, pos: "30% 35%", tint: "bg-[#2b2118]/25", cake: "/img/boda-100.jpg", cakePos: "50% 50%" },
    { s: d.hs3, t: d.ht3, bg: BG.palomera, pos: "20% 60%", tint: "bg-[#7a3b22]/35 mix-blend-multiply", cake: "/img/tarta-decorada-flores.jpg", cakePos: "50% 50%" },
    { s: d.hs4, t: d.ht4, bg: BG.castell, pos: "70% 30%", tint: "bg-[#6b4a2f]/35 mix-blend-multiply", cake: "/img/boda-50.jpg", cakePos: "50% 50%" },
  ];
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [still, setStill] = useState(false);
  const go = useCallback((n: number) => setI((n + slides.length) % slides.length), [slides.length]);

  useEffect(() => { setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches); }, []);
  useEffect(() => {
    if (paused || still) return;
    const id = setTimeout(() => go(i + 1), MS);
    return () => clearTimeout(id);
  }, [i, paused, still, go]);

  const cur = slides[i];
  return (
    <section
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      className="relative isolate h-[calc(100svh-61px)] min-h-[640px] max-h-[920px] overflow-hidden bg-cocoa text-white"
    >
      {slides.map((sl, k) => (
        <div key={k} aria-hidden={k !== i} className={`absolute inset-0 -z-10 transition-opacity duration-[1400ms] ease-out ${k === i ? "opacity-100" : "opacity-0"}`}>
          <div key={k === i ? `on-${i}` : "off"} className={`absolute inset-0 ${k === i ? "kb" : ""}`}>
            <Image src={sl.bg.src} alt="" fill priority={k === 0} sizes="100vw" className="object-cover" style={{ objectPosition: sl.pos }} />
          </div>
          {sl.tint && <div className={`absolute inset-0 ${sl.tint}`} />}
        </div>
      ))}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/55 via-black/25 to-black/75 md:bg-gradient-to-r md:from-black/70 md:via-black/35 md:to-black/10" />

      <div className="mx-auto grid h-full max-w-6xl grid-rows-[auto_1fr] items-center gap-6 px-5 pb-20 pt-8 md:grid-cols-[1.1fr_.9fr] md:grid-rows-1 md:gap-12 md:pb-20 md:pt-0">
        <div key={`txt-${i}`} className="text-center md:text-left">
          <p className="rise font-script text-3xl text-[#f4d9c6] md:text-4xl">{cur.s}</p>
          <h1 className="rise mt-1 font-serif-d text-[2.9rem] leading-[1.02] [animation-delay:.08s] sm:text-6xl md:text-7xl lg:text-[5.4rem]">{cur.t}</h1>
          <p className="rise mx-auto mt-5 hidden max-w-md text-base sm:block leading-relaxed text-white/80 [animation-delay:.16s] md:mx-0 md:text-lg">{d.w_sub}</p>
          <div className="rise mt-7 flex flex-col gap-3 [animation-delay:.24s] sm:flex-row sm:justify-center md:justify-start">
            <Link href="#bodas" className="btn bg-white px-8 text-cocoa hover:bg-[#f4d9c6]">{d.w_cta1}</Link>
            <Link href="#contacto" className="btn border border-white/50 px-8 text-white hover:border-white hover:bg-white/10">{d.w_cta2}</Link>
          </div>
        </div>

        <div className="relative mx-auto h-[min(360px,42svh)] w-auto md:h-full md:max-h-[560px]">
          <div className="relative aspect-[3/4] h-full">
            <span aria-hidden className="absolute -inset-3 rounded-t-full border border-[#e9c9a0]/70 md:-inset-5" />
            {slides.map((sl, k) => (
              <div key={k} className={`absolute inset-0 overflow-hidden rounded-t-full rounded-b-[28px] ring-1 ring-white/30 transition-all duration-[1200ms] ease-out ${k === i ? "scale-100 opacity-100" : "scale-[.97] opacity-0"}`}>
                <Image src={sl.cake} alt="" fill priority={k === 0} sizes="(min-width:768px) 420px, 240px" className="object-cover" style={{ objectPosition: sl.cakePos }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0">
        <div className="mx-auto flex max-w-6xl items-end justify-between gap-4 px-5 pb-6">
          <div className="flex items-center gap-5">
            {slides.map((_, k) => (
              <button key={k} onClick={() => go(k)} aria-label={`${k + 1} / ${slides.length}`} aria-current={k === i}
                className={`group text-left text-xs tabular-nums tracking-wider transition ${k === i ? "text-white" : "text-white/50 hover:text-white/80"}`}>
                <span>{String(k + 1).padStart(2, "0")}</span>
                <span className="mt-1.5 block h-px w-8 overflow-hidden bg-white/25 md:w-12">
                  {k === i && <span key={`p-${i}-${paused}`} className="block h-full origin-left bg-white" style={{ animation: paused || still ? "none" : `prog ${MS}ms linear both`, transform: paused || still ? "scaleX(1)" : undefined }} />}
                </span>
              </button>
            ))}
          </div>
          <p className="hidden max-w-[45%] text-right text-[10px] text-white/45 sm:block">{cur.bg.credit}</p>
        </div>
      </div>
    </section>
  );
}
