import fs from "node:fs/promises";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import type { Order, Status } from "./order";

type NewOrder = Omit<Order, "id" | "number" | "createdAt" | "status">;
const usePg = !!process.env.DATABASE_URL;
const FILE = path.join(process.cwd(), ".data", "orders.json");

/* ---------- Postgres (Neon) ---------- */
let ready: Promise<void> | null = null;
function sql() { return neon(process.env.DATABASE_URL!); }
function ensure() {
  if (!ready) {
    ready = (async () => {
      const q = sql();
      await q`CREATE TABLE IF NOT EXISTS orders (
        number SERIAL PRIMARY KEY, id TEXT UNIQUE NOT NULL, status TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(), data JSONB NOT NULL)`;
    })();
  }
  return ready;
}
const fromRow = (r: Record<string, unknown>): Order => ({ ...(r.data as Order), id: r.id as string, number: r.number as number, status: r.status as Status, createdAt: new Date(r.created_at as string).toISOString() });

/* ---------- JSON file (local dev only) ---------- */
let chain: Promise<unknown> = Promise.resolve();
const lock = <T,>(fn: () => Promise<T>): Promise<T> => { const p = chain.then(fn, fn); chain = p.catch(() => {}); return p; };
async function readFile(): Promise<Order[]> {
  try { return JSON.parse(await fs.readFile(FILE, "utf8")); } catch { return []; }
}
async function writeFile(o: Order[]) { await fs.mkdir(path.dirname(FILE), { recursive: true }); await fs.writeFile(FILE, JSON.stringify(o, null, 2)); }

export async function createOrder(input: NewOrder): Promise<Order> {
  const id = crypto.randomUUID();
  if (usePg) {
    await ensure();
    const rows = await sql()`INSERT INTO orders (id, status, data) VALUES (${id}, 'new', ${JSON.stringify(input)}::jsonb) RETURNING number, id, status, created_at, data`;
    return fromRow(rows[0]);
  }
  return lock(async () => {
    const all = await readFile();
    const order: Order = { ...input, id, number: (all.at(-1)?.number ?? 1000) + 1, createdAt: new Date().toISOString(), status: "new" };
    all.push(order);
    await writeFile(all);
    return order;
  });
}

export async function listOrders(limit = 200): Promise<Order[]> {
  if (usePg) {
    await ensure();
    const rows = await sql()`SELECT number, id, status, created_at, data FROM orders ORDER BY number DESC LIMIT ${limit}`;
    return rows.map(fromRow);
  }
  return (await readFile()).slice(-limit).reverse();
}

export async function setStatus(id: string, status: Status): Promise<Order | null> {
  if (usePg) {
    await ensure();
    const rows = await sql()`UPDATE orders SET status = ${status} WHERE id = ${id} RETURNING number, id, status, created_at, data`;
    return rows[0] ? fromRow(rows[0]) : null;
  }
  return lock(async () => {
    const all = await readFile();
    const o = all.find((x) => x.id === id);
    if (!o) return null;
    o.status = status;
    await writeFile(all);
    return o;
  });
}

export async function getOrder(id: string): Promise<Order | null> {
  if (usePg) {
    await ensure();
    const rows = await sql()`SELECT number, id, status, created_at, data FROM orders WHERE id = ${id}`;
    return rows[0] ? fromRow(rows[0]) : null;
  }
  return (await readFile()).find((x) => x.id === id) ?? null;
}
