import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";
import { isLocale, t } from "@/lib/i18n";
import { SHOP } from "@/lib/shop";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = t(locale);
  const h = SHOP.hours;
  const fmt = (r: [number, number] | null) => (r ? `${String(r[0]).padStart(2, "0")}:00 – ${String(r[1]).padStart(2, "0")}:00` : d.closed);

  return (
    <main>
      {/* HERO */}
      <section className="bg-cocoa text-cream">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-2 md:py-20">
          <div>
            <p className="text-xs track text-gold">{d.hero_kicker}</p>
            <h1 className="mt-4 font-display text-4xl leading-[1.1] md:text-6xl">{d.hero_title}</h1>
            <p className="mt-5 max-w-md text-cream/75">{d.hero_sub}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#tartas" className="rounded-full bg-coral px-6 py-3 font-medium text-white hover:bg-coral-dark">{d.cta_order}</Link>
              <Link href="#bolleria" className="rounded-full border border-cream/30 px-6 py-3 hover:border-cream">{d.nav_pastry}</Link>
            </div>
          </div>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-t-[999px] rounded-b-3xl ring-4 ring-gold/40">
            <Image src="/img/tarta-birthday.jpg" alt="" fill priority sizes="400px" className="object-cover" />
          </div>
        </div>
      </section>

      {/* CAKES */}
      <section id="tartas" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
        <h2 className="font-display text-3xl md:text-4xl">{d.sec_cakes}</h2>
        <p className="mb-8 mt-2 text-cocoa/70">{d.sec_cakes_sub}</p>
        <ProductGrid category="tartas" locale={locale} />
      </section>

      {/* PASTRY */}
      <section id="bolleria" className="scroll-mt-20 bg-blush/40">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="font-display text-3xl md:text-4xl">{d.sec_pastry}</h2>
          <p className="mb-8 mt-2 text-cocoa/70">{d.sec_pastry_sub}</p>
          <div className="max-w-xl"><ProductGrid category="bolleria" locale={locale} /></div>
        </div>
      </section>

      {/* WEDDINGS */}
      <section id="bodas" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
        <h2 className="font-display text-3xl md:text-4xl">{d.sec_weddings}</h2>
        <p className="mb-8 mt-2 text-cocoa/70">{d.sec_weddings_sub}</p>
        <div className="max-w-3xl"><ProductGrid category="bodas" locale={locale} /></div>
      </section>

      {/* HOW */}
      <section className="bg-cocoa text-cream">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="font-display text-3xl">{d.how_title}</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[[d.how1, d.how1d], [d.how2, d.how2d], [d.how3, d.how3d]].map(([a, b], i) => (
              <div key={i} className="rounded-2xl border border-cream/15 p-6">
                <span className="font-display text-4xl text-gold">{i + 1}</span>
                <h3 className="mt-2 text-lg font-medium">{a}</h3>
                <p className="mt-1 text-sm text-cream/70">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VISIT */}
      <section id="visita" className="mx-auto grid max-w-6xl scroll-mt-20 items-center gap-8 px-4 py-16 md:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
          <Image src="/img/shop-front.jpg" alt="PoTiPa" fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
        </div>
        <div>
          <h2 className="font-display text-3xl md:text-4xl">{d.visit_title}</h2>
          <p className="mt-4">{SHOP.address}</p>
          <p className="mt-1"><a className="text-coral hover:underline" href={`tel:${SHOP.phone.replace(/\s/g, "")}`}>{SHOP.phone}</a> · <a className="text-coral hover:underline" href={`https://wa.me/${SHOP.whatsapp}`}>WhatsApp</a></p>
          <div className="mt-6 text-sm">
            <p className="mb-2 text-xs track text-cocoa/60">{d.hours} <span className="normal-case tracking-normal">({d.hours_note})</span></p>
            <p className="flex justify-between border-b border-cocoa/10 py-1.5"><span>{d.hours_wd}</span><span>{fmt(h[1])}</span></p>
            <p className="flex justify-between py-1.5"><span>{d.hours_sun}</span><span>{fmt(h[0])}</span></p>
          </div>
          <div className="mt-6 flex gap-4 text-sm">
            <a href={SHOP.instagram} target="_blank" rel="noreferrer" className="text-coral hover:underline">Instagram @potipa.blanes</a>
            <a href={SHOP.facebook} target="_blank" rel="noreferrer" className="text-coral hover:underline">Facebook</a>
          </div>
        </div>
      </section>

      <footer className="border-t border-cocoa/10 py-8 text-center text-xs text-cocoa/60">© {new Date().getFullYear()} PoTiPa · {SHOP.tagline[locale]} · Blanes</footer>
    </main>
  );
}
