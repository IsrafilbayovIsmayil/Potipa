import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { listOrders, setStatus } from "@/lib/store";
import { STATUSES, type Status } from "@/lib/order";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "auth" }, { status: 401 });
  return NextResponse.json({ orders: await listOrders(), now: new Date().toISOString() }, { headers: { "cache-control": "no-store" } });
}
export async function PATCH(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "auth" }, { status: 401 });
  const { id, status } = await req.json().catch(() => ({}));
  if (typeof id !== "string" || !STATUSES.includes(status as Status)) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const o = await setStatus(id, status as Status);
  return o ? NextResponse.json({ order: o }) : NextResponse.json({ error: "not_found" }, { status: 404 });
}
