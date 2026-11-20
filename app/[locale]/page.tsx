import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";
import { isLocale, t } from "@/lib/i18n";
import { SHOP } from "@/lib/shop";

function Scallop({ from, to }: { from: string; to: string }) {
  return <div style={{ background: from, ["--fill" as string]: to }} aria-hidden><div className="scallop-top" /></div>;
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = t(locale);
  const h = SHOP.hours;
  const fmt = (r: [number, number] | null) => (r ? `${String(r[0]).padStart(2, "0")}:00 – ${String(r[1]).padStart(2, "0")}:00` : d.closed);
  const chip = "btn border border-crema/30 text-crema hover:border-gold hover:text-gold";

  return (
    <main>
      {/* HERO */}
      <section className="bg-cocoa text-crema">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-14 pt-8 md:grid-cols-[1.1fr_1fr] md:gap-14 md:pb-24 md:pt-16">
          <div className="hero-in">
            <p className="text-sm font-medium text-gold">{d.hero_kicker}</p>
            <h1 className="mt-3 font-display text-[1.85rem] leading-[1.15] sm:text-5xl md:text-6xl">{d.hero_title}</h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-crema/80">{d.hero_sub}</p>
            <div className="mt-7 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap">
              <Link href="#tartas" className="btn col-span-2 bg-coral text-cocoa hover:bg-[#f58580] sm:col-auto">{d.cta_order}</Link>
              <Link href="#bodas" className={chip}>{d.nav_weddings}</Link>
              <Link href="#visita" className={chip}>{d.nav_visit}</Link>
            </div>
          </div>
          <div className="hero-in relative mx-auto w-full max-w-md [animation-delay:.15s] md:max-w-none">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[36px] ring-1 ring-gold/30">
              <Image src="/img/azul-completa.jpg" alt="" fill priority sizes="(min-width:768px) 45vw, 90vw" className="object-cover object-[50%_35%]" />
            </div>
            <div className="absolute -bottom-5 left-2 w-[36%] rotate-[-4deg] overflow-hidden rounded-3xl ring-4 ring-cocoa shadow-2xl md:-left-8">
              <div className="relative aspect-[4/5]"><Image src="/img/azul-detalle.jpg" alt="" fill sizes="200px" className="object-cover object-[60%_65%]" /></div>
            </div>
          </div>
        </div>
      </section>

      {/* CAKES */}
      <section id="tartas" className="scroll-mt-16 bg-cocoa text-crema">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-6">
          <h2 className="font-display text-3xl md:text-4xl">{d.sec_cakes}</h2>
          <p className="mb-9 mt-3 max-w-lg text-crema/70">{d.sec_cakes_sub}</p>
          <ProductGrid category="tartas" kind="fixed" locale={locale} />
        </div>
      </section>

      <Scallop from="#2a1a14" to="#fbf3e9" />
      {/* CELEBRATIONS */}
      <section id="celebrar" className="scroll-mt-16 bg-cream">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-6">
          <h2 className="font-display text-3xl md:text-4xl">{d.sec_custom}</h2>
          <p className="mb-9 mt-3 max-w-lg text-cocoa/70">{d.sec_custom_sub}</p>
          <ProductGrid category="tartas" kind="custom" locale={locale} tone="light" />
        </div>
      </section>

      <Scallop from="#fbf3e9" to="#2a1a14" />
      {/* WEDDINGS */}
      <section id="bodas" className="scroll-mt-16 bg-cocoa text-crema">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-6">
          <h2 className="font-display text-3xl md:text-4xl">{d.sec_weddings}</h2>
          <p className="mb-9 mt-3 max-w-lg text-crema/70">{d.sec_weddings_sub}</p>
          <div className="max-w-3xl"><ProductGrid category="bodas" locale={locale} /></div>
        </div>
      </section>

      <Scallop from="#2a1a14" to="#f7d6d0" />
      {/* HOW */}
      <section className="bg-blush">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="font-display text-3xl">{d.how_title}</h2>
          <ol className="mt-8 grid gap-8 md:grid-cols-3">
            {[[d.how1, d.how1d], [d.how2, d.how2d], [d.how3, d.how3d]].map(([a, b], i) => (
              <li key={i} className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-cocoa font-display text-lg text-crema">{i + 1}</span>
                <div><h3 className="font-display text-lg">{a}</h3><p className="mt-1 text-cocoa/75">{b}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Scallop from="#f7d6d0" to="#fbf3e9" />
      {/* IN THE SHOP */}
      <section id="tienda" className="scroll-mt-16 bg-cream">
        <div className="mx-auto grid max-w-6xl items-center gap-9 px-4 pb-16 pt-6 md:grid-cols-2 md:gap-14">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[32px]">
            <Image src="/img/shop-interior.jpg" alt="" fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <h2 className="font-display text-3xl md:text-4xl">{d.sec_shop}</h2>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-cocoa/75">{d.sec_shop_sub}</p>
          </div>
        </div>
      </section>

      <Scallop from="#fbf3e9" to="#2a1a14" />
      {/* VISIT */}
      <section id="visita" className="scroll-mt-16 bg-cocoa text-crema">
        <div className="mx-auto grid max-w-6xl items-center gap-9 px-4 pb-16 pt-6 md:grid-cols-2 md:gap-14">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[32px]">
            <Image src="/img/shop-front.jpg" alt="PoTiPa" fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <h2 className="font-display text-3xl md:text-4xl">{d.visit_title}</h2>
            <p className="mt-5 text-lg">{SHOP.address}</p>
            <p className="mt-1"><a className="text-gold underline-offset-4 hover:underline" href={`tel:${SHOP.phone.replace(/\s/g, "")}`}>{SHOP.phone}</a> · <a className="text-gold underline-offset-4 hover:underline" href={`https://wa.me/${SHOP.whatsapp}`}>WhatsApp</a></p>
            <div className="mt-7 max-w-sm">
              <p className="mb-2 text-sm text-crema/60">{d.hours_note}</p>
              <p className="flex justify-between border-b border-crema/15 py-2"><span>{d.hours_wd}</span><span>{fmt(h[1])}</span></p>
              <p className="flex justify-between py-2"><span>{d.hours_sun}</span><span>{fmt(h[0])}</span></p>
            </div>
            <div className="mt-6 flex gap-5 text-sm">
              <a href={SHOP.instagram} target="_blank" rel="noreferrer" className="text-gold underline-offset-4 hover:underline">Instagram @potipa.blanes</a>
              <a href={SHOP.facebook} target="_blank" rel="noreferrer" className="text-gold underline-offset-4 hover:underline">Facebook</a>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-cocoa pb-8 text-center text-xs text-crema/50">© {new Date().getFullYear()} PoTiPa · {SHOP.tagline[locale]} · Blanes</footer>
    </main>
  );
}
