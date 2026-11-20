import fs from "node:fs/promises";
import path from "node:path";
import * as wp from "web-push";
const webpush = ((wp as unknown as { default?: typeof wp }).default ?? wp) as typeof wp;
import { neon } from "@neondatabase/serverless";
import type { Order } from "./order";
import { productById } from "./products";
import type { AdminLang } from "./adminI18n-types";

export interface SubInput { endpoint: string; keys: { p256dh: string; auth: string } }
interface Sub { endpoint: string; p256dh: string; auth: string; deviceId: string | null; label: string; lang: AdminLang }

const usePg = !!process.env.DATABASE_URL;
const sql = () => neon(process.env.DATABASE_URL!);
const FILE = path.join(process.cwd(), ".data", "push.json");

/* ---------- storage ---------- */
let ready: Promise<void> | null = null;
function ensure() {
  if (!ready) ready = (async () => {
    const q = sql();
    await q`CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT NOT NULL)`;
    await q`CREATE TABLE IF NOT EXISTS push_subs (endpoint TEXT PRIMARY KEY, p256dh TEXT NOT NULL, auth TEXT NOT NULL,
      device_id TEXT, label TEXT NOT NULL DEFAULT '', created_at TIMESTAMPTZ NOT NULL DEFAULT now())`;
    await q`ALTER TABLE push_subs ADD COLUMN IF NOT EXISTS lang TEXT NOT NULL DEFAULT 'es'`;
  })();
  return ready;
}
interface FileDb { vapid?: { publicKey: string; privateKey: string }; subs: Sub[] }
const readF = async (): Promise<FileDb> => { try { return JSON.parse(await fs.readFile(FILE, "utf8")); } catch { return { subs: [] }; } };
const writeF = async (d: FileDb) => { await fs.mkdir(path.dirname(FILE), { recursive: true }); await fs.writeFile(FILE, JSON.stringify(d)); };

/** VAPID keys: env override, else generated once and kept in the database. */
let keys: Promise<{ publicKey: string; privateKey: string }> | null = null;
export function vapid() {
  if (!keys) keys = (async () => {
    if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY)
      return { publicKey: process.env.VAPID_PUBLIC_KEY, privateKey: process.env.VAPID_PRIVATE_KEY };
    if (usePg) {
      await ensure();
      const gen = webpush.generateVAPIDKeys();
      await sql()`INSERT INTO kv (k, v) VALUES ('vapid', ${JSON.stringify(gen)}) ON CONFLICT (k) DO NOTHING`;
      const rows = await sql()`SELECT v FROM kv WHERE k = 'vapid'`; // re-read: another instance may have won the race
      return JSON.parse(rows[0].v as string);
    }
    const db = await readF();
    if (!db.vapid) { db.vapid = webpush.generateVAPIDKeys(); await writeF(db); }
    return db.vapid;
  })().catch((e) => { keys = null; throw e; });
  return keys;
}

export async function saveSub(s: SubInput, deviceId: string | null, label: string, lang: AdminLang = "es") {
  if (usePg) {
    await ensure();
    await sql()`INSERT INTO push_subs (endpoint, p256dh, auth, device_id, label, lang) VALUES (${s.endpoint}, ${s.keys.p256dh}, ${s.keys.auth}, ${deviceId}, ${label}, ${lang})
      ON CONFLICT (endpoint) DO UPDATE SET p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth, device_id = EXCLUDED.device_id, label = EXCLUDED.label, lang = EXCLUDED.lang`;
    return;
  }
  const db = await readF();
  db.subs = db.subs.filter((x) => x.endpoint !== s.endpoint);
  db.subs.push({ endpoint: s.endpoint, p256dh: s.keys.p256dh, auth: s.keys.auth, deviceId, label, lang });
  await writeF(db);
}
export async function removeSub(endpoint: string) {
  if (usePg) { await ensure(); await sql()`DELETE FROM push_subs WHERE endpoint = ${endpoint}`; return; }
  const db = await readF(); db.subs = db.subs.filter((x) => x.endpoint !== endpoint); await writeF(db);
}
/** Called when a device is revoked: its phone must stop receiving alerts. */
export async function removeSubsForDevice(deviceId: string) {
  if (usePg) { await ensure(); await sql()`DELETE FROM push_subs WHERE device_id = ${deviceId}`; return; }
  const db = await readF(); db.subs = db.subs.filter((x) => x.deviceId !== deviceId); await writeF(db);
}
async function allSubs(): Promise<Sub[]> {
  if (usePg) {
    await ensure();
    const rows = await sql()`SELECT endpoint, p256dh, auth, device_id, label, lang FROM push_subs`;
    return rows.map((r) => ({ endpoint: r.endpoint as string, p256dh: r.p256dh as string, auth: r.auth as string, deviceId: (r.device_id as string) ?? null, label: r.label as string, lang: r.lang === "ru" ? "ru" : "es" }));
  }
  return (await readF()).subs;
}

/* ---------- sending ---------- */
export function pushPayload(o: Order, lang: AdminLang) {
  const ru = lang === "ru";
  const items = o.items.map((i) => `${i.qty}× ${productById(i.productId)?.name[lang] ?? i.name}`).join(", ");
  return JSON.stringify({
    title: ru ? `🧁 Новый заказ №${o.number}${o.needsConfirmation ? " · уточнить" : ""}` : `🧁 Nuevo pedido #${o.number}${o.needsConfirmation ? " · por confirmar" : ""}`,
    body: `${o.name} · ${o.pickupDate} ${o.pickupTime}\n${items}`,
    tag: `order-${o.id}`,
    url: "/admin",
  });
}

export async function notifyPush(o: Order) {
  try {
    const subs = await allSubs();
    if (!subs.length) return;
    const k = await vapid();
    webpush.setVapidDetails("https://potipa.vercel.app", k.publicKey, k.privateKey);
    await Promise.allSettled(subs.map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, pushPayload(o, s.lang), { TTL: 3600, urgency: "high", timeout: 8000 });
      } catch (e) {
        const code = (e as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) await removeSub(s.endpoint); // phone uninstalled / revoked permission
      }
    }));
  } catch { /* never block the order */ }
}

/** Generic alert to every subscribed phone (used for wedding enquiries). */
export async function notifyPushText(title: Record<AdminLang, string>, body: string, tag: string) {
  try {
    const subs = await allSubs();
    if (!subs.length) return;
    const k = await vapid();
    webpush.setVapidDetails("https://potipa.vercel.app", k.publicKey, k.privateKey);
    await Promise.allSettled(subs.map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify({ title: title[s.lang], body, tag, url: "/admin" }), { TTL: 3600, urgency: "high", timeout: 8000 });
      } catch (e) {
        const code = (e as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) await removeSub(s.endpoint);
      }
    }));
  } catch { /* never block the enquiry */ }
}
