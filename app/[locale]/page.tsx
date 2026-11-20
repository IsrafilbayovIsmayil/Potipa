import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";
import WeddingForm from "@/components/WeddingForm";
import { isLocale, t } from "@/lib/i18n";
import { SHOP } from "@/lib/shop";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = t(locale);
  const cols = [
    { t: d.col1, s: d.col1s, img: "/img/boda-100.jpg", href: "#bodas" },
    { t: d.col2, s: d.col2s, img: "/img/tarta-decorada-flores.jpg", href: `/${locale}/tartas#celebrar` },
    { t: d.col3, s: d.col3s, img: "/img/red-velvet.jpg", href: `/${locale}/tartas` },
    { t: d.col4, s: d.col4s, img: "/img/shop-interior.jpg", href: "#visita" },
  ];
  const steps = [[d.s1t, d.s1d], [d.s2t, d.s2d], [d.s3t, d.s3d], [d.s4t, d.s4d]];

  return (
    <main className="bg-cream text-cocoa">
      {/* HERO */}
      <section className="overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 pt-8 md:grid-cols-2 md:gap-14 md:pb-24 md:pt-16">
          <div className="hero-in text-center md:text-left">
            <p className="font-script text-4xl text-coral md:text-5xl">{d.w_script}</p>
            <h1 className="mt-2 text-[2.4rem] font-extrabold leading-[1.08] tracking-tight sm:text-6xl">
              {d.w_t1}<br /><span className="gold-text">{d.w_t2}</span>
            </h1>
            <p className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-black/65 md:mx-0">{d.w_sub}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
              <Link href="#bodas" className="btn bg-coral px-8 text-white shadow-lg shadow-coral/30 hover:bg-coral-dark">{d.w_cta1}</Link>
              <Link href="#contacto" className="btn border border-black/10 bg-white px-8 hover:border-coral hover:text-coral">{d.w_cta2}</Link>
            </div>
          </div>
          <div className="hero-in relative mx-auto w-full max-w-sm [animation-delay:.15s] md:max-w-md">
            <div className="absolute -inset-4 rounded-t-full bg-blush" aria-hidden />
            <div className="relative aspect-[3/4] overflow-hidden rounded-t-full rounded-b-3xl shadow-2xl">
              <Image src="/img/azul-completa.jpg" alt="" fill priority sizes="(min-width:768px) 40vw, 80vw" className="object-cover object-[50%_35%]" />
            </div>
            <div className="absolute -bottom-6 -left-3 w-[34%] overflow-hidden rounded-full ring-4 ring-cream shadow-xl md:-left-10">
              <div className="relative aspect-square"><Image src="/img/azul-detalle.jpg" alt="" fill sizes="160px" className="object-cover object-[60%_65%]" /></div>
            </div>
          </div>
        </div>
      </section>

      {/* COLLECTIONS */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="font-script text-3xl text-gold">{d.col_kicker}</p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">{d.col_title}</h2>
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-4">
            {cols.map((c) => (
              <Link key={c.t} href={c.href} className="group">
                <div className="relative mx-auto aspect-square w-full max-w-[220px] overflow-hidden rounded-full ring-1 ring-black/5 transition duration-500 group-hover:ring-4 group-hover:ring-coral/30">
                  <Image src={c.img} alt="" fill sizes="220px" className="object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <h3 className="mt-4 text-lg font-bold">{c.t}</h3>
                <p className="text-sm text-black/55">{c.s}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="flex items-center gap-4 px-6 py-8" aria-hidden>
        <span className="h-px flex-1 bg-gold/30" />
        <span className="font-script text-3xl text-gold">{d.sep}</span>
        <span className="h-px flex-1 bg-gold/30" />
      </div>

      {/* WEDDINGS */}
      <section id="bodas" className="scroll-mt-16 pb-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <p className="font-script text-3xl text-coral">{d.exp_kicker}</p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">{d.sec_weddings}</h2>
            <p className="mx-auto mt-3 max-w-lg text-black/60">{d.sec_weddings_sub}</p>
          </div>
          <div className="mx-auto mt-10 max-w-3xl"><ProductGrid category="bodas" locale={locale} tone="light" /></div>
        </div>
      </section>

      {/* HOW */}
      <section className="bg-blush py-16">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{d.exp_title}</h2>
          <p className="mx-auto mt-3 max-w-lg text-black/60">{d.exp_sub}</p>
          <ol className="mt-10 grid gap-5 text-left sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([a, b], i) => (
              <li key={i} className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,.1)]">
                <span className="font-script text-4xl text-gold">{i + 1}</span>
                <h3 className="mt-1 text-lg font-bold">{a}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-black/60">{b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FORM */}
      <section id="contacto" className="scroll-mt-16 py-16">
        <div className="mx-auto max-w-2xl px-4">
          <WeddingForm locale={locale} />
        </div>
      </section>

      {/* VISIT */}
      <section id="visita" className="scroll-mt-16 bg-white py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-9 px-4 md:grid-cols-2 md:gap-14">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[32px]">
            <Image src="/img/shop-front.jpg" alt="PoTiPa" fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{d.visit_title}</h2>
            <p className="mt-5 text-lg">{SHOP.address}</p>
            <p className="mt-1"><a className="font-semibold text-coral-dark hover:underline" href={`tel:${SHOP.phone.replace(/\s/g, "")}`}>{SHOP.phone}</a> · <a className="font-semibold text-coral-dark hover:underline" href={`https://wa.me/${SHOP.whatsapp}`}>WhatsApp</a></p>
            <div className="mt-6 max-w-sm text-[15px]">
              {[[d.hours_tsat, "10:00 – 14:00 · 16:30 – 20:00"], [d.hours_sun, "10:00 – 14:00"], [d.hours_mon, d.closed]].map(([a, b], i) => (
                <p key={i} className="flex justify-between gap-4 border-b border-black/10 py-2 last:border-0"><span className="font-semibold">{a}</span><span className="text-black/65">{b}</span></p>
              ))}
            </div>
            <div className="mt-6 flex gap-5 text-sm font-semibold">
              <a href={SHOP.instagram} target="_blank" rel="noreferrer" className="text-gold hover:underline">Instagram @potipa.blanes</a>
              <a href={SHOP.facebook} target="_blank" rel="noreferrer" className="text-gold hover:underline">Facebook</a>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-cocoa py-10 text-center text-crema">
        <p className="font-script text-3xl text-gold-light">{d.f_made}</p>
        <p className="mt-2 text-xs text-crema/50">© {new Date().getFullYear()} PoTiPa · {SHOP.tagline[locale]} · Blanes</p>
      </footer>
    </main>
  );
}
