import { productById } from "./products";
import { SHOP } from "./shop";
import { madridToDate, slotsForDate } from "./time";

export type Status = "new" | "accepted" | "ready" | "done" | "cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  qty: number;
  unitCents: number | null;
  flavour?: string;
  inscription?: string;
  custom: boolean;
}
export interface Order {
  id: string;
  number: number;
  createdAt: string;
  status: Status;
  name: string;
  phone: string;
  pickupDate: string;
  pickupTime: string;
  pickupAt: string;
  notes: string;
  items: OrderItem[];
  totalCents: number;
  needsConfirmation: boolean;
  locale: "es" | "ca";
}

export type NewOrderInput = Pick<Order, "name" | "phone" | "pickupDate" | "pickupTime" | "notes" | "locale"> & {
  items: { productId: string; qty: number; flavour?: string; inscription?: string }[];
};

export const STATUSES: Status[] = ["new", "accepted", "ready", "done", "cancelled"];

export function validateOrder(raw: unknown, now = new Date()): { ok: true; data: Omit<Order, "id" | "number" | "createdAt" | "status"> } | { ok: false; error: string } {
  const r = raw as Record<string, unknown> | null;
  if (!r || typeof r !== "object") return { ok: false, error: "bad_request" };
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const name = str(r.name, 80);
  const phone = str(r.phone, 24).replace(/[\s.-]/g, "");
  const notes = str(r.notes, 500);
  const pickupDate = str(r.pickupDate, 10);
  const pickupTime = str(r.pickupTime, 5);
  const locale = r.locale === "ca" ? "ca" : "es";

  if (name.length < 2) return { ok: false, error: "name" };
  if (!/^\+?\d{7,15}$/.test(phone)) return { ok: false, error: "phone" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(pickupDate) || !/^\d{2}:\d{2}$/.test(pickupTime)) return { ok: false, error: "pickup" };
  if (!Array.isArray(r.items) || r.items.length === 0 || r.items.length > 30) return { ok: false, error: "items" };

  const items: OrderItem[] = [];
  let lead = 0;
  let total = 0;
  for (const it of r.items as Record<string, unknown>[]) {
    const p = typeof it.productId === "string" ? productById(it.productId) : undefined;
    const qty = Number(it.qty);
    if (!p || !Number.isInteger(qty) || qty < 1 || qty > 50) return { ok: false, error: "items" };
    let flavour: string | undefined;
    if (p.flavours) {
      const f = p.flavours.find((x) => x.id === it.flavour);
      if (!f) return { ok: false, error: "items" };
      flavour = f.label[locale];
    }
    const inscription = p.inscription ? str(it.inscription, 120) || undefined : undefined;
    lead = Math.max(lead, p.leadHours);
    if (p.priceCents != null && p.kind === "fixed") total += p.priceCents * qty;
    items.push({ productId: p.id, name: p.name[locale], qty, unitCents: p.priceCents, flavour, inscription, custom: p.kind === "custom" });
  }

  if (!slotsForDate(pickupDate).includes(pickupTime)) return { ok: false, error: "pickup" };
  const pickupAt = madridToDate(pickupDate, pickupTime);
  if (pickupAt.getTime() < now.getTime() + lead * 3600_000 - 5 * 60_000) return { ok: false, error: "lead" };
  if (pickupAt.getTime() > now.getTime() + 120 * 86400_000) return { ok: false, error: "pickup" };

  return {
    ok: true,
    data: { name, phone, pickupDate, pickupTime, pickupAt: pickupAt.toISOString(), notes, items, totalCents: total, needsConfirmation: items.some((i) => i.custom), locale },
  };
}

export const waLink = (phone: string, text?: string) => {
  const digits = phone.replace(/\D/g, "");
  const full = digits.length <= 9 ? `34${digits}` : digits;
  return `https://wa.me/${full}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
};
export { SHOP };
