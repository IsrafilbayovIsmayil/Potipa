import "../globals.css";
export const metadata = { title: "PoTiPa · Pedidos", robots: { index: false, follow: false }, icons: { icon: "/img/logo.png" } };
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="!bg-[#171210] !text-[#f4ece4]">{children}</body>
    </html>
  );
}
