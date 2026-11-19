# PoTiPa — web de pedidos

Next.js 15 + Tailwind 4. Catálogo (CA/ES), carrito, reserva con hora de recogida (pago en tienda) y pantalla de pedidos en `/admin`.

## Arrancar en local
    npm install
    npm run dev          # http://localhost:3000  (PIN de admin por defecto en dev: 1234)

## Producción (Vercel)
Variables de entorno (ver `.env.example`):
- `ADMIN_PIN`  — PIN de la pantalla `/admin` (obligatorio; sin él el login está cerrado)
- `DATABASE_URL` — Neon Postgres (sin ella, los pedidos van a `.data/orders.json`, solo para desarrollo; en Vercel NO persiste)
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` — opcional, aviso al móvil por cada pedido

## Qué editar
- Productos, precios, antelación mínima: `lib/products.ts`
- Horario, dirección, teléfono: `lib/shop.ts` (horario PROVISIONAL, teléfono por confirmar)
- Textos CA/ES: `lib/i18n.ts`
