import { NextRequest, NextResponse } from "next/server";
import { createEnquiry, validateEnquiry } from "@/lib/enquiries";
import { notifyPushText } from "@/lib/push";
import { clientIp, tooMany } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  if (tooMany(`enq:${clientIp(req.headers)}`, 5, 10 * 60_000)) return NextResponse.json({ error: "rate" }, { status: 429 });
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad_request" }, { status: 400 }); }
  if (body.website) return NextResponse.json({ ok: true }); // honeypot
  const v = validateEnquiry(body);
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });
  const e = await createEnquiry(v.data);
  const bits = [e.date, e.guests && `${e.guests} p.`, e.venue].filter(Boolean).join(" · ");
  await notifyPushText({ es: "Nueva consulta de boda", ru: "Новая заявка на свадебный торт" }, `${e.name} · ${e.phone}${bits ? `\n${bits}` : ""}`, `enq-${e.id}`);
  return NextResponse.json({ ok: true });
}
