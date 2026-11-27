"use client";
import { useEffect, useState } from "react";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { j: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

export default function Countdown({ date }: { date: string }) {
  const target = new Date(date).getTime();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const p = parts(now === null ? 0 : target - now);
  const cells: [number, string][] = [[p.j, "jours"], [p.h, "h"], [p.m, "min"], [p.s, "s"]];
  return (
    <div className="countdown" role="timer" aria-label="Temps avant la sortie">
      {cells.map(([v, l]) => (
        <span key={l}>
          <b>{now === null ? "–" : String(v).padStart(2, "0")}</b>
          <small>{l}</small>
        </span>
      ))}
    </div>
  );
}
