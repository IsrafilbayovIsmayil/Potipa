import fs from "node:fs/promises";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

export interface Enquiry {
  id: string; createdAt: string; locale: string;
  name: string; phone: string; date: string; venue: string; guests: string; flavour: string; message: string;
}
export type NewEnquiry = Omit<Enquiry, "id" | "createdAt">;

const usePg = !!process.env.DATABASE_URL;
const sql = () => neon(process.env.DATABASE_URL!);
const FILE = path.join(process.cwd(), ".data", "enquiries.json");
let ready: Promise<void> | null = null;
function ensure() {
  if (!ready) ready = (async () => {
    await sql()`CREATE TABLE IF NOT EXISTS enquiries (id TEXT PRIMARY KEY, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), data JSONB NOT NULL)`;
  })();
  return ready;
}
const clip = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");

export function validateEnquiry(b: Record<string, unknown>): { ok: true; data: NewEnquiry } | { ok: false; error: string } {
  const name = clip(b.name, 80), phone = clip(b.phone, 40);
  if (name.length < 2) return { ok: false, error: "name" };
  if (phone.replace(/[^\d]/g, "").length < 7) return { ok: false, error: "phone" };
  const date = clip(b.date, 10);
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, error: "date" };
  return { ok: true, data: { locale: clip(b.locale, 2) || "es", name, phone, date, venue: clip(b.venue, 120), guests: clip(b.guests, 20), flavour: clip(b.flavour, 120), message: clip(b.message, 1500) } };
}

export async function createEnquiry(input: NewEnquiry): Promise<Enquiry> {
  const e: Enquiry = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  if (usePg) {
    await ensure();
    const { id, createdAt, ...data } = e; void createdAt;
    await sql()`INSERT INTO enquiries (id, data) VALUES (${id}, ${JSON.stringify(data)}::jsonb)`;
    return e;
  }
  let all: Enquiry[] = [];
  try { all = JSON.parse(await fs.readFile(FILE, "utf8")); } catch { /* first one */ }
  all.push(e);
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(all, null, 2));
  return e;
}

export async function listEnquiries(limit = 100): Promise<Enquiry[]> {
  if (usePg) {
    await ensure();
    const rows = await sql()`SELECT id, created_at, data FROM enquiries ORDER BY created_at DESC LIMIT ${limit}`;
    return rows.map((r) => ({ ...(r.data as NewEnquiry), id: r.id as string, createdAt: new Date(r.created_at as string).toISOString() }));
  }
  try { return (JSON.parse(await fs.readFile(FILE, "utf8")) as Enquiry[]).reverse().slice(0, limit); } catch { return []; }
}
