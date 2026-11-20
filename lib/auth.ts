import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { verifyDevice } from "./devices";

export const OWNER_COOKIE = "potipa_admin";
export const DEVICE_COOKIE = "potipa_device";
export type Role = "owner" | "staff";

function pin(): string | null {
  if (process.env.ADMIN_PIN) return process.env.ADMIN_PIN;
  return process.env.NODE_ENV === "production" ? null : "1234"; // dev default only
}
function ownerToken(): string | null {
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
export const makeOwnerToken = ownerToken;

/** Who is calling? owner (PIN), staff (paired device) or nobody. Revoked devices fail here immediately. */
export async function getRole(): Promise<{ role: Role; deviceId?: string; label?: string } | null> {
  const jar = await cookies();
  const t = ownerToken();
  const o = jar.get(OWNER_COOKIE)?.value;
  if (t && o && o.length === t.length && timingSafeEqual(Buffer.from(o), Buffer.from(t))) return { role: "owner" };
  const d = await verifyDevice(jar.get(DEVICE_COOKIE)?.value);
  return d ? { role: "staff", deviceId: d.id, label: d.label } : null;
}
export async function isOwner() { return (await getRole())?.role === "owner"; }
