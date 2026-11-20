import { NextResponse } from "next/server";
import { getRole } from "@/lib/auth";
export const dynamic = "force-dynamic";
export async function GET() {
  const r = await getRole();
  return r ? NextResponse.json({ role: r.role, label: r.label ?? null }) : NextResponse.json({ error: "auth" }, { status: 401 });
}
