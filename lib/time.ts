import { SHOP } from "./shop";

/** Offset (ms) of Europe/Madrid vs UTC at a given instant. */
function tzOffsetMs(at: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: SHOP.tz, hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const p = Object.fromEntries(dtf.formatToParts(at).map((x) => [x.type, x.value]));
  const asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return asUTC - Math.floor(at.getTime() / 1000) * 1000;
}

/** "2026-12-24" + "10:30" in Madrid time -> real Date. */
export function madridToDate(date: string, time: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  let t = guess - tzOffsetMs(new Date(guess));
  t = guess - tzOffsetMs(new Date(t));
  return new Date(t);
}

/** Calendar date (YYYY-MM-DD) and weekday of an instant in Madrid time. */
export function madridParts(at: Date) {
  const dtf = new Intl.DateTimeFormat("en-CA", { timeZone: SHOP.tz, year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" });
  const p = Object.fromEntries(dtf.formatToParts(at).map((x) => [x.type, x.value]));
  const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday);
  return { date: `${p.year}-${p.month}-${p.day}`, dow };
}

export function addDays(date: string, n: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return t.toISOString().slice(0, 10);
}

export function dowOf(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** All pickup slots ("HH:MM") for a date, ignoring lead time. */
export function slotsForDate(date: string): string[] {
  const ranges = SHOP.hours[dowOf(date)] ?? [];
  const out: string[] = [];
  for (const [a, b] of ranges)
    for (let min = a; min <= b - SHOP.slotMinutes; min += SHOP.slotMinutes)
      out.push(`${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`);
  return out;
}

/** Slots on a date that are at least `leadHours` from `now`. */
export function availableSlots(date: string, leadHours: number, now = new Date()): string[] {
  const earliest = now.getTime() + leadHours * 3600_000;
  return slotsForDate(date).filter((t) => madridToDate(date, t).getTime() >= earliest);
}
