"use client";
import { useAdminLang } from "@/lib/adminI18n";

export default function AdminLangSwitch() {
  const [lang, setLang] = useAdminLang();
  return (
    <div className="flex rounded-full border border-white/15 p-0.5 text-xs" role="group" aria-label="Idioma / Язык">
      {(["es", "ru"] as const).map((l) => (
        <button key={l} onClick={() => setLang(l)} className={`rounded-full px-2.5 py-1.5 ${lang === l ? "bg-white/20 font-medium text-white" : "text-white/50"}`}>{l.toUpperCase()}</button>
      ))}
    </div>
  );
}
