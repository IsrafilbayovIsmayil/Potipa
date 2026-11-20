import { NextRequest, NextResponse } from "next/server";
import { getRole } from "@/lib/auth";
import { getOrder, listOrders, setStatus } from "@/lib/store";
import { STATUSES, type Status } from "@/lib/order";

export const dynamic = "force-dynamic";

// Staff devices may only move an order one step along the flow (or one step back). Cancelling / reopening is owner-only.
const STAFF_MOVES: Record<Status, Status[]> = { new: ["accepted"], accepted: ["ready", "new"], ready: ["done", "accepted"], done: [], cancelled: [] };

export async function GET() {
  const who = await getRole();
  if (!who) return NextResponse.json({ error: "auth" }, { status: 401 });
  let orders = await listOrders();
  if (who.role === "staff") orders = orders.filter((o) => o.status === "new" || o.status === "accepted" || o.status === "ready");
  return NextResponse.json({ orders, role: who.role, now: new Date().toISOString() }, { headers: { "cache-control": "no-store" } });
}
export async function PATCH(req: NextRequest) {
  const who = await getRole();
  if (!who) return NextResponse.json({ error: "auth" }, { status: 401 });
  const { id, status } = await req.json().catch(() => ({}));
  if (typeof id !== "string" || !STATUSES.includes(status as Status)) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  if (who.role === "staff") {
    const cur = await getOrder(id);
    if (!cur) return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (!STAFF_MOVES[cur.status].includes(status as Status)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const o = await setStatus(id, status as Status);
  return o ? NextResponse.json({ order: o }) : NextResponse.json({ error: "not_found" }, { status: 404 });
}
