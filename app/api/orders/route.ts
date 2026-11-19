import { NextRequest, NextResponse } from "next/server";
import { validateOrder } from "@/lib/order";
import { createOrder } from "@/lib/store";
import { notifyTelegram } from "@/lib/notify";

const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  arr.push(now); hits.set(ip, arr);
  return arr.length > 6;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) return NextResponse.json({ error: "rate" }, { status: 429 });
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad_request" }, { status: 400 }); }
  if (body.website) return NextResponse.json({ ok: true, id: "ok" }); // honeypot
  const v = validateOrder(body);
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });
  const order = await createOrder(v.data);
  await notifyTelegram(order);
  return NextResponse.json({ ok: true, id: order.id, number: order.number });
}
