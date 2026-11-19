import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { CartProvider } from "@/components/CartProvider";
import Header from "@/components/Header";
import { isLocale, locales, t } from "@/lib/i18n";
import { SHOP } from "@/lib/shop";

export const generateStaticParams = () => locales.map((locale) => ({ locale }));

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const d = isLocale(locale) ? t(locale) : t("es");
  return { title: `PoTiPa · ${isLocale(locale) ? SHOP.tagline[locale] : SHOP.tagline.es} · Blanes`, description: d.hero_sub, icons: { icon: "/img/logo.png" } };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <html lang={locale}>
      <body>
        <CartProvider>
          <Header locale={locale} />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
