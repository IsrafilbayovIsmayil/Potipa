"use client";
import { useRef } from "react";

/** Gentle 3D tilt: follows the mouse; on touch, a horizontal drag turns it. Off for reduced motion. */
export default function Tilt({ children, max = 9, className = "", touch = false }: { children: React.ReactNode; max?: number; className?: string; touch?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const start = useRef<number | null>(null);
  const reduce = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const set = (rx: number, ry: number, gx: number, gy: number) => {
    const el = ref.current; if (!el) return;
    el.style.setProperty("--rx", `${rx}deg`); el.style.setProperty("--ry", `${ry}deg`);
    el.style.setProperty("--gx", `${gx}%`); el.style.setProperty("--gy", `${gy}%`);
  };
  const reset = () => { start.current = null; set(0, 0, 50, 30); };
  const move = (e: React.PointerEvent) => {
    if (reduce()) return;
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    if (e.pointerType === "touch") {
      if (!touch || start.current === null) return;
      const dx = Math.max(-1, Math.min(1, (e.clientX - start.current) / (r.width * 0.5)));
      set(0, dx * max * 1.6, 50 + dx * 30, 30);
    } else set((0.5 - py) * max * 2, (px - 0.5) * max * 2, px * 100, py * 100);
  };
  return (
    <div
      ref={ref}
      className={`tilt ${className}`}
      style={{ touchAction: touch ? "pan-y" : undefined }}
      onPointerMove={move}
      onPointerDown={(e) => { if (e.pointerType === "touch") start.current = e.clientX; }}
      onPointerUp={reset} onPointerLeave={reset} onPointerCancel={reset}
    >
      <div className="tilt-in">{children}<span className="tilt-glare" aria-hidden /></div>
    </div>
  );
}
