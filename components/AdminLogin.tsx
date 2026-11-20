"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogin() {
  const router = useRouter();
  const [mode, setMode] = useState<"device" | "owner">("device");
  const [value, setValue] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function go(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    const url = mode === "owner" ? "/api/admin/login" : "/api/admin/pair";
    const body = mode === "owner" ? { pin: value } : { code: value };
    const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    if (r.ok) { router.refresh(); return; }
    setErr(r.status === 429 ? "Demasiados intentos. Espera unos minutos." : mode === "owner" ? "Contraseña incorrecta" : "Código incorrecto o caducado");
    setBusy(false);
  }
  const tab = (m: "device" | "owner", text: string) => (
    <button type="button" onClick={() => { setMode(m); setValue(""); setErr(""); }} className={`flex-1 rounded-full py-2 text-sm ${mode === m ? "bg-white/15 text-white" : "text-white/50"}`}>{text}</button>
  );
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <form onSubmit={go} className="w-full max-w-xs text-center">
        <Image src="/img/logo.png" alt="PoTiPa" width={88} height={88} className="mx-auto rounded-full" />
        <h1 className="mt-4 font-display text-2xl">Pedidos</h1>
        <div className="mt-5 flex gap-1 rounded-full bg-white/5 p-1">{tab("device", "Vincular dispositivo")}{tab("owner", "Soy la dueña")}</div>
        <p className="mt-4 text-sm text-white/60">{mode === "device" ? "Pide a la dueña un código en Pedidos → Dispositivos y escríbelo aquí." : "Contraseña de la dueña."}</p>
        <input value={value} onChange={(e) => setValue(mode === "device" ? e.target.value.toUpperCase() : e.target.value)} type={mode === "owner" ? "password" : "text"}
          autoFocus autoComplete="off" autoCapitalize="characters" maxLength={mode === "device" ? 9 : 64}
          placeholder={mode === "device" ? "XXXX-XXXX" : "Contraseña"}
          className="mt-3 w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-center text-xl tracking-widest outline-none focus:border-[#e8625f]" />
        {err && <p className="mt-3 text-sm text-red-400">{err}</p>}
        <button disabled={busy || !value} className="mt-4 w-full rounded-full bg-[#e8625f] py-3 font-medium text-white disabled:opacity-50">{mode === "device" ? "Vincular" : "Entrar"}</button>
      </form>
    </main>
  );
}
