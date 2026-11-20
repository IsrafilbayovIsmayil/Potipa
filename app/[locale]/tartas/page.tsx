import { notFound } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";
import { isLocale, t } from "@/lib/i18n";

export default async function Tartas({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = t(locale);
  return (
    <main className="bg-cream pb-20 text-cocoa">
      <div className="mx-auto max-w-6xl px-4 pt-12">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">{d.cat_title}</h1>
          <p className="mx-auto mt-3 max-w-md text-black/60">{d.cat_sub}</p>
        </div>
        <section className="mt-12 scroll-mt-20">
          <h2 className="mb-6 text-2xl font-bold">{d.sec_cakes}</h2>
          <ProductGrid category="tartas" kind="fixed" locale={locale} tone="light" />
        </section>
        <section id="celebrar" className="mt-16 scroll-mt-20">
          <h2 className="mb-2 text-2xl font-bold">{d.sec_custom}</h2>
          <p className="mb-6 max-w-lg text-black/60">{d.sec_custom_sub}</p>
          <ProductGrid category="tartas" kind="custom" locale={locale} tone="light" />
        </section>
      </div>
    </main>
  );
}
