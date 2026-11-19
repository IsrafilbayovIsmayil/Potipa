import type { Order } from "./order";
import { eur } from "./products";

/** Optional Telegram alert. Silent no-op unless env vars are set. */
export async function notifyTelegram(o: Order) {
  const token = process.env.TELEGRAM_BOT_TOKEN, chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return;
  const lines = [
    `🧁 NUEVO PEDIDO #${o.number}${o.needsConfirmation ? " — POR CONFIRMAR" : ""}`,
    `${o.name} · ${o.phone}`,
    `Recogida: ${o.pickupDate} ${o.pickupTime}`,
    ...o.items.map((i) => `• ${i.qty}× ${i.name}${i.flavour ? ` (${i.flavour})` : ""}${i.inscription ? ` — «${i.inscription}»` : ""}`),
    o.notes ? `Nota: ${o.notes}` : "",
    o.totalCents ? `Total: ${eur(o.totalCents)}` : "",
  ].filter(Boolean);
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text: lines.join("\n") }),
    });
  } catch { /* never block the order */ }
}
