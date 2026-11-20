"use client";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "./CartProvider";
import { usePathname } from "next/navigation";
import { LOCALE_NAMES, locales, t, type Locale } from "@/lib/i18n";

export default function Header({ locale }: { locale: Locale }) {
  const d = t(locale);
  const { count } = useCart();
  const path = usePathname() || `/${locale}`;
  const rest = path.replace(/^\/[a-z]{2}(?=\/|$)/, "");
  return (
    <header className="sticky top-0 z-40 bg-cocoa text-crema">
      <div className="awning" aria-hidden />
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5">
        <Link href={`/${locale}`} className="flex items-center gap-2.5" aria-label="PoTiPa">
          <Image src="/img/logo.png" alt="" width={38} height={38} className="rounded-full" />
          <span className="font-display text-lg">PoTiPa</span>
        </Link>
        <nav className="ml-auto hidden items-center gap-7 text-sm md:flex">
          <Link href={`/${locale}#tartas`} className="hover:text-gold">{d.nav_cakes}</Link>
          <Link href={`/${locale}#bodas`} className="hover:text-gold">{d.nav_weddings}</Link>
          <Link href={`/${locale}#visita`} className="hover:text-gold">{d.nav_visit}</Link>
        </nav>
        <div className="ml-auto flex items-center gap-2.5 md:ml-0">
          <details className="relative">
            <summary className="flex h-10 cursor-pointer list-none items-center gap-1.5 rounded-full border border-crema/25 px-3 text-xs font-medium hover:border-gold [&::-webkit-details-marker]:hidden">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/></svg>
              {locale.toUpperCase()}
            </summary>
            <ul className="absolute right-0 top-12 w-40 overflow-hidden rounded-2xl bg-cream text-cocoa shadow-xl">
              {locales.map((l) => (
                <li key={l}><Link href={`/${l}${rest}`} className={`block px-4 py-3 text-sm hover:bg-blush/60 ${l === locale ? "font-semibold text-coral-dark" : ""}`}>{LOCALE_NAMES[l]}</Link></li>
              ))}
            </ul>
          </details>
          <Link href={`/${locale}/pedido`} className="relative inline-flex h-10 items-center gap-2 rounded-full bg-coral px-4 text-sm font-semibold text-cocoa hover:bg-[#f58580]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 7h12l-1 13H7L6 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>
            {d.cart}
            {count > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-cocoa px-1 text-xs font-bold text-crema">{count}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}
