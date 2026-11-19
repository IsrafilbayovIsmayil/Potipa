import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, t } from "@/lib/i18n";
import { SHOP } from "@/lib/shop";

export default async function Thanks({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ n?: string; c?: string }> }) {
  const { locale } = await params;
  const { n, c } = await searchParams;
  if (!isLocale(locale)) notFound();
  const d = t(locale);
  return (
    <main className="mx-auto max-w-xl px-4 py-20 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-coral text-3xl text-white">✓</div>
      <h1 className="mt-6 font-display text-4xl">{d.thanks_title}</h1>
      {n && <p className="mt-2 text-cocoa/60">{d.thanks_n} {n}</p>}
      <p className="mt-6">{c === "1" ? d.thanks_tbc : d.thanks_ok}</p>
      <div className="mt-8 flex justify-center gap-3">
        <a href={`https://wa.me/${SHOP.whatsapp}`} className="rounded-full border border-coral px-5 py-2.5 text-coral hover:bg-coral hover:text-white">{d.thanks_wa}</a>
        <Link href={`/${locale}`} className="rounded-full bg-cocoa px-5 py-2.5 text-white">{d.back_menu}</Link>
      </div>
    </main>
  );
}
