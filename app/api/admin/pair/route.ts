import { NextRequest, NextResponse } from "next/server";
import { DEVICE_COOKIE } from "@/lib/auth";
import { redeemPairCode } from "@/lib/devices";
import { clientIp, tooMany } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  if (tooMany("pair:" + clientIp(req.headers), 8, 10 * 60_000)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const { code } = await req.json().catch(() => ({ code: "" }));
  const r = await redeemPairCode(String(code ?? ""));
  if (!r) {
    await new Promise((x) => setTimeout(x, 600));
    return NextResponse.json({ error: "code" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true, label: r.label });
  res.cookies.set(DEVICE_COOKIE, r.cookie, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 365 });
  return res;
}
