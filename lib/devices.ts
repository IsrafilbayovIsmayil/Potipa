import fs from "node:fs/promises";
import path from "node:path";
import { createHash, randomBytes, randomInt } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { removeSubsForDevice } from "./push";

export interface Device { id: string; label: string; createdAt: string; lastSeen: string | null; revokedAt: string | null }
interface DeviceRow extends Device { tokenHash: string }
interface CodeRow { codeHash: string; label: string; expiresAt: string; used: boolean }

const usePg = !!process.env.DATABASE_URL;
const FILE = path.join(process.cwd(), ".data", "devices.json");
const sha = (s: string) => createHash("sha256").update(s).digest("hex");
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
export const CODE_TTL_MS = 10 * 60_000;

export const normalizeCode = (c: string) => c.toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/0/g, "O").replace(/1/g, "I");
function newCode() { return Array.from({ length: 8 }, () => ALPHABET[randomInt(ALPHABET.length)]).join(""); }
const pretty = (c: string) => `${c.slice(0, 4)}-${c.slice(4)}`;

/* ---------- Postgres ---------- */
let ready: Promise<void> | null = null;
const sql = () => neon(process.env.DATABASE_URL!);
function ensure() {
  if (!ready) ready = (async () => {
    const q = sql();
    await q`CREATE TABLE IF NOT EXISTS devices (id TEXT PRIMARY KEY, label TEXT NOT NULL, token_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(), last_seen TIMESTAMPTZ, revoked_at TIMESTAMPTZ)`;
    await q`CREATE TABLE IF NOT EXISTS pair_codes (code_hash TEXT PRIMARY KEY, label TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL, used BOOLEAN NOT NULL DEFAULT false)`;
  })();
  return ready;
}
const iso = (v: unknown) => (v ? new Date(v as string).toISOString() : null);
const toDevice = (r: Record<string, unknown>): Device => ({ id: r.id as string, label: r.label as string, createdAt: iso(r.created_at)!, lastSeen: iso(r.last_seen), revokedAt: iso(r.revoked_at) });

/* ---------- JSON file (local dev only) ---------- */
interface FileDb { devices: DeviceRow[]; codes: CodeRow[] }
let chain: Promise<unknown> = Promise.resolve();
const lock = <T,>(fn: () => Promise<T>): Promise<T> => { const p = chain.then(fn, fn); chain = p.catch(() => {}); return p; };
async function readDb(): Promise<FileDb> { try { return JSON.parse(await fs.readFile(FILE, "utf8")); } catch { return { devices: [], codes: [] }; } }
async function writeDb(d: FileDb) { await fs.mkdir(path.dirname(FILE), { recursive: true }); await fs.writeFile(FILE, JSON.stringify(d, null, 2)); }
const strip = ({ tokenHash: _t, ...d }: DeviceRow): Device => d; // eslint-disable-line @typescript-eslint/no-unused-vars

/* ---------- API ---------- */
export async function createPairCode(label: string): Promise<{ code: string; expiresAt: string }> {
  const code = newCode();
  const expiresAt = new Date(Date.now() + CODE_TTL_MS).toISOString();
  const h = sha(code);
  if (usePg) {
    await ensure();
    await sql()`DELETE FROM pair_codes WHERE expires_at < now() OR used`;
    await sql()`INSERT INTO pair_codes (code_hash, label, expires_at) VALUES (${h}, ${label}, ${expiresAt})`;
  } else {
    await lock(async () => {
      const db = await readDb();
      db.codes = db.codes.filter((c) => !c.used && new Date(c.expiresAt) > new Date());
      db.codes.push({ codeHash: h, label, expiresAt, used: false });
      await writeDb(db);
    });
  }
  return { code: pretty(code), expiresAt };
}

/** Single-use. Returns the cookie value to set on the new device. */
export async function redeemPairCode(raw: string): Promise<{ cookie: string; label: string } | null> {
  const code = normalizeCode(raw);
  if (code.length !== 8) return null;
  const h = sha(code);
  const id = randomBytes(8).toString("hex");
  const secret = randomBytes(32).toString("hex");
  if (usePg) {
    await ensure();
    // atomic: only one redeemer can flip used=false -> true
    const rows = await sql()`UPDATE pair_codes SET used = true WHERE code_hash = ${h} AND used = false AND expires_at > now() RETURNING label`;
    if (!rows[0]) return null;
    const label = rows[0].label as string;
    await sql()`INSERT INTO devices (id, label, token_hash) VALUES (${id}, ${label}, ${sha(secret)})`;
    return { cookie: `${id}.${secret}`, label };
  }
  return lock(async () => {
    const db = await readDb();
    const c = db.codes.find((x) => x.codeHash === h && !x.used && new Date(x.expiresAt) > new Date());
    if (!c) return null;
    c.used = true;
    db.devices.push({ id, label: c.label, tokenHash: sha(secret), createdAt: new Date().toISOString(), lastSeen: null, revokedAt: null });
    await writeDb(db);
    return { cookie: `${id}.${secret}`, label: c.label };
  });
}

export async function verifyDevice(cookie: string | undefined): Promise<Device | null> {
  if (!cookie) return null;
  const [id, secret] = cookie.split(".");
  if (!id || !secret || secret.length !== 64) return null;
  const h = sha(secret);
  if (usePg) {
    await ensure();
    const rows = await sql()`SELECT id, label, token_hash, created_at, last_seen, revoked_at FROM devices WHERE id = ${id}`;
    const r = rows[0];
    if (!r || r.revoked_at || r.token_hash !== h) return null;
    const seen = r.last_seen ? new Date(r.last_seen as string).getTime() : 0;
    if (Date.now() - seen > 5 * 60_000) await sql()`UPDATE devices SET last_seen = now() WHERE id = ${id}`;
    return toDevice(r);
  }
  return lock(async () => {
    const db = await readDb();
    const d = db.devices.find((x) => x.id === id);
    if (!d || d.revokedAt || d.tokenHash !== h) return null;
    if (!d.lastSeen || Date.now() - new Date(d.lastSeen).getTime() > 5 * 60_000) { d.lastSeen = new Date().toISOString(); await writeDb(db); }
    return strip(d);
  });
}

export async function listDevices(): Promise<Device[]> {
  if (usePg) {
    await ensure();
    const rows = await sql()`SELECT id, label, created_at, last_seen, revoked_at FROM devices ORDER BY created_at DESC`;
    return rows.map(toDevice);
  }
  return (await readDb()).devices.map(strip).reverse();
}

export async function revokeDevice(id: string): Promise<boolean> {
  if (usePg) {
    await ensure();
    const rows = await sql()`UPDATE devices SET revoked_at = now() WHERE id = ${id} AND revoked_at IS NULL RETURNING id`;
    if (rows.length) await removeSubsForDevice(id);
    return rows.length > 0;
  }
  return lock(async () => {
    const db = await readDb();
    const d = db.devices.find((x) => x.id === id && !x.revokedAt);
    if (!d) return false;
    d.revokedAt = new Date().toISOString();
    await writeDb(db);
    await removeSubsForDevice(id);
    return true;
  });
}
