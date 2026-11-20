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
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/85 text-cocoa backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5">
        <Link href={`/${locale}`} className="flex items-center gap-2.5" aria-label="PoTiPa">
          <Image src="/img/logo.png" alt="" width={38} height={38} className="rounded-full" />
          <span className="text-lg font-bold tracking-tight">PoTiPa</span>
        </Link>
        <nav className="ml-auto hidden items-center gap-8 text-sm font-medium md:flex">
          <Link href={`/${locale}#bodas`} className="hover:text-coral">{d.nav_weddings}</Link>
          <Link href={`/${locale}/tartas`} className="hover:text-coral">{d.nav_cakes}</Link>
          <Link href={`/${locale}#contacto`} className="hover:text-coral">{d.nav_contact}</Link>
        </nav>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <details className="relative">
            <summary className="flex h-10 cursor-pointer list-none items-center gap-1.5 rounded-full border border-black/10 px-3 text-xs font-semibold hover:border-coral [&::-webkit-details-marker]:hidden">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/></svg>
              {locale.toUpperCase()}
            </summary>
            <ul className="absolute right-0 top-12 w-40 overflow-hidden rounded-2xl bg-white text-cocoa shadow-xl ring-1 ring-black/5">
              {locales.map((l) => (
                <li key={l}><Link href={`/${l}${rest}`} className={`block px-4 py-3 text-sm hover:bg-blush ${l === locale ? "font-semibold text-coral-dark" : ""}`}>{LOCALE_NAMES[l]}</Link></li>
              ))}
            </ul>
          </details>
          <Link href={`/${locale}/pedido`} aria-label={d.cart} className="relative inline-flex h-10 items-center gap-2 rounded-full bg-coral px-4 text-sm font-semibold text-white hover:bg-coral-dark">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 11V6.5a3 3 0 0 1 6 0V11"/></svg>
            <span className="hidden sm:inline">{d.cart}</span>
            {count > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-xs font-bold text-coral-dark">{count}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}
