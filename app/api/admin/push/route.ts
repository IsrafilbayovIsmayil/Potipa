import { NextRequest, NextResponse } from "next/server";
import { getRole } from "@/lib/auth";
import { removeSub, saveSub, vapid } from "@/lib/push";

export const dynamic = "force-dynamic";
const deny = () => NextResponse.json({ error: "unauthorized" }, { status: 401 });

export async function GET() {
  if (!(await getRole())) return deny();
  return NextResponse.json({ publicKey: (await vapid()).publicKey }, { headers: { "cache-control": "no-store" } });
}
export async function POST(req: NextRequest) {
  const who = await getRole();
  if (!who) return deny();
  const s = await req.json().catch(() => null);
  if (!s?.endpoint || typeof s.endpoint !== "string" || !s.endpoint.startsWith("https://") || !s.keys?.p256dh || !s.keys?.auth)
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  await saveSub({ endpoint: s.endpoint, keys: { p256dh: String(s.keys.p256dh), auth: String(s.keys.auth) } }, who.deviceId ?? null, who.label ?? "Dueña");
  return NextResponse.json({ ok: true });
}
export async function DELETE(req: NextRequest) {
  if (!(await getRole())) return deny();
  const { endpoint } = await req.json().catch(() => ({ endpoint: "" }));
  if (typeof endpoint === "string" && endpoint) await removeSub(endpoint);
  return NextResponse.json({ ok: true });
}
