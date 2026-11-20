import { NextRequest, NextResponse } from "next/server";
import { OWNER_COOKIE, DEVICE_COOKIE, checkPin, makeOwnerToken } from "@/lib/auth";
import { clientIp, tooMany } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  if (tooMany("pin:" + clientIp(req.headers), 6, 10 * 60_000)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const { pin } = await req.json().catch(() => ({ pin: "" }));
  if (!checkPin(String(pin ?? ""))) {
    await new Promise((r) => setTimeout(r, 700));
    return NextResponse.json({ error: "pin" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(OWNER_COOKIE, makeOwnerToken()!, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return res;
}
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(OWNER_COOKIE);
  res.cookies.delete(DEVICE_COOKIE);
  return res;
}
