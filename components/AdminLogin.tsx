"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogin() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState(false);
  async function go(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(false);
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ pin }) });
    if (r.ok) router.refresh(); else { setErr(true); setBusy(false); }
  }
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <form onSubmit={go} className="w-full max-w-xs text-center">
        <Image src="/img/logo.png" alt="PoTiPa" width={88} height={88} className="mx-auto rounded-full" />
        <h1 className="mt-4 font-display text-2xl">Pedidos</h1>
        <input value={pin} onChange={(e) => setPin(e.target.value)} type="password" inputMode="numeric" autoFocus placeholder="PIN" className="mt-6 w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-center text-xl tracking-[0.5em] outline-none focus:border-[#e8625f]" />
        {err && <p className="mt-3 text-sm text-red-400">PIN incorrecto</p>}
        <button disabled={busy || !pin} className="mt-4 w-full rounded-full bg-[#e8625f] py-3 font-medium text-white disabled:opacity-50">Entrar</button>
      </form>
    </main>
  );
}
