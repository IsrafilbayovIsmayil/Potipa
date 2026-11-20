/** Small in-memory limiter. Per server instance only: it slows guessing, the real protection is code entropy + short expiry. */
const buckets = new Map<string, number[]>();
export function tooMany(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const arr = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  arr.push(now);
  buckets.set(key, arr);
  return arr.length > max;
}
export const clientIp = (h: Headers) => h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
