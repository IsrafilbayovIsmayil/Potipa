import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const COOKIE = "potipa_admin";
function pin(): string | null {
  if (process.env.ADMIN_PIN) return process.env.ADMIN_PIN;
  return process.env.NODE_ENV === "production" ? null : "1234"; // dev default only
}
function token(): string | null {
  const p = pin();
  if (!p) return null;
  return createHmac("sha256", process.env.ADMIN_SECRET || p).update("potipa-admin-v1:" + p).digest("hex");
}
export function checkPin(input: string): boolean {
  const p = pin();
  if (!p) return false;
  const a = Buffer.from(input), b = Buffer.from(p);
  return a.length === b.length && timingSafeEqual(a, b);
}
export const makeToken = token;
export async function isAdmin(): Promise<boolean> {
  const t = token();
  if (!t) return false;
  const v = (await cookies()).get(COOKIE)?.value;
  if (!v || v.length !== t.length) return false;
  return timingSafeEqual(Buffer.from(v), Buffer.from(t));
}
