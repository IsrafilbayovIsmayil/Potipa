import { NextRequest, NextResponse } from "next/server";
import { COOKIE, checkPin, makeToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { pin } = await req.json().catch(() => ({ pin: "" }));
  if (!checkPin(String(pin ?? ""))) {
    await new Promise((r) => setTimeout(r, 700));
    return NextResponse.json({ error: "pin" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, makeToken()!, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 90 });
  return res;
}
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE);
  return res;
}
