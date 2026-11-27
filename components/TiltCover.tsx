"use client";
import { useRef } from "react";

/** Pochette en relief : elle suit le pointeur comme un objet qu'on tient, avec un reflet de projecteur. */
export default function TiltCover({ src, alt, children }: { src: string; alt: string; children?: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  function move(e: React.PointerEvent) {
    const el = ref.current;
    if (!el || e.pointerType === "touch") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-y * 10).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 12).toFixed(2)}deg`);
    el.style.setProperty("--gx", `${((x + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty("--gy", `${((y + 0.5) * 100).toFixed(1)}%`);
  }
  function leave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }
  return (
    <div className="tilt" ref={ref} onPointerMove={move} onPointerLeave={leave}>
      <div className="tilt-inner">
        <img className="cover" src={src} alt={alt} />
        <span className="tilt-glare" aria-hidden />
        {children}
      </div>
    </div>
  );
}
