import { NextRequest, NextResponse } from "next/server";
import { isOwner } from "@/lib/auth";
import { createPairCode, listDevices, revokeDevice } from "@/lib/devices";

export const dynamic = "force-dynamic";
const deny = () => NextResponse.json({ error: "forbidden" }, { status: 403 });

export async function GET() {
  if (!(await isOwner())) return deny();
  return NextResponse.json({ devices: await listDevices() }, { headers: { "cache-control": "no-store" } });
}
export async function POST(req: NextRequest) {
  if (!(await isOwner())) return deny();
  const { label } = await req.json().catch(() => ({ label: "" }));
  const name = String(label ?? "").trim().slice(0, 40);
  if (name.length < 2) return NextResponse.json({ error: "label" }, { status: 400 });
  return NextResponse.json(await createPairCode(name));
}
export async function DELETE(req: NextRequest) {
  if (!(await isOwner())) return deny();
  const { id } = await req.json().catch(() => ({ id: "" }));
  const ok = typeof id === "string" && (await revokeDevice(id));
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not_found" }, { status: 404 });
}
