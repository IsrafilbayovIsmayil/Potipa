import { notFound } from "next/navigation";
import Checkout from "@/components/Checkout";
import { isLocale } from "@/lib/i18n";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <Checkout locale={locale} />;
}
