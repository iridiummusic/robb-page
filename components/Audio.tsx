"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

export type Track = { album: number; title: string; cover: string; slug: string };

type Ctx = {
  current: Track | null;
  playing: boolean;
  loading: boolean;
  progress: number; // 0..1
  toggle: (t: Track) => void;
  stop: () => void;
};

const AudioCtx = createContext<Ctx | null>(null);
export const useAudio = () => useContext(AudioCtx)!;

/**
 * Un seul lecteur pour toute la page. Pendant la lecture, l'intensité du son
 * est écrite dans la variable CSS --level (0 → 1) : la lumière de scène pulse avec la musique.
 */
export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number>(0);
  const [current, setCurrent] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const loop = useCallback(() => {
    const a = audioRef.current;
    const an = analyserRef.current;
    let level = 0;
    if (an) {
      const data = new Uint8Array(an.frequencyBinCount);
      an.getByteFrequencyData(data);
      // basses (kick, 808) surtout : les 12 premières bandes
      let sum = 0;
      for (let i = 0; i < 12; i++) sum += data[i];
      level = Math.min(1, Math.max(0, (sum / 12 - 90) / 140));
    }
    document.documentElement.style.setProperty("--level", level.toFixed(3));
    if (a && a.duration) setProgress(a.currentTime / a.duration);
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  const ensureGraph = useCallback(() => {
    if (ctxRef.current || !audioRef.current) return;
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AC();
      const src = ctx.createMediaElementSource(audioRef.current);
      const an = ctx.createAnalyser();
      an.fftSize = 256;
      an.smoothingTimeConstant = 0.72;
      src.connect(an);
      an.connect(ctx.destination);
      ctxRef.current = ctx;
      analyserRef.current = an;
    } catch {
      /* pas de Web Audio : la musique joue quand même, sans pulsation */
    }
  }, []);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
    setCurrent(null);
  }, []);

  const toggle = useCallback(
    (t: Track) => {
      const a = audioRef.current;
      if (!a) return;
      ensureGraph();
      ctxRef.current?.resume();
      if (current?.album === t.album) {
        if (a.paused) a.play().catch(() => {});
        else a.pause();
        return;
      }
      setCurrent(t);
      setProgress(0);
      setLoading(true);
      a.src = `/api/preview?album=${t.album}`;
      a.play().catch(() => setLoading(false));
    },
    [current, ensureGraph]
  );

  useEffect(() => {
    const a = audioRef.current!;
    const onPlay = () => {
      document.documentElement.dataset.playing = "1";
      setPlaying(true);
      setLoading(false);
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };
    const onPause = () => {
      document.documentElement.dataset.playing = "0";
      setPlaying(false);
      cancelAnimationFrame(rafRef.current);
      document.documentElement.style.setProperty("--level", "0");
    };
    const onEnd = () => {
      onPause();
      setProgress(1);
    };
    a.addEventListener("playing", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnd);
    a.addEventListener("error", () => setLoading(false));
    return () => {
      a.removeEventListener("playing", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onEnd);
      cancelAnimationFrame(rafRef.current);
    };
  }, [loop]);

  return (
    <AudioCtx.Provider value={{ current, playing, loading, progress, toggle, stop }}>
      {children}
      <audio ref={audioRef} preload="none" crossOrigin="anonymous" />
    </AudioCtx.Provider>
  );
}

/** Bouton lecture/pause d'un extrait. */
export function PlayButton({ track, label, className = "" }: { track: Track; label?: string; className?: string }) {
  const { current, playing, loading, toggle } = useAudio();
  const isThis = current?.album === track.album;
  const state = isThis && loading ? "loading" : isThis && playing ? "playing" : "idle";
  return (
    <button
      type="button"
      className={`play ${className}`}
      data-state={state}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(track);
      }}
      aria-label={state === "playing" ? `Pause ${track.title}` : `Écouter un extrait de ${track.title}`}
    >
      <span className="play-icon" aria-hidden>
        {state === "playing" ? (
          <svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
        ) : (
          <svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" /></svg>
        )}
      </span>
      {label && <span className="play-label">{state === "playing" ? "Pause" : label}</span>}
    </button>
  );
}

/** Barre de lecture collée en bas de l'écran, visible dès qu'un extrait a été lancé. */
export function PlayerBar() {
  const { current, playing, progress, toggle, stop } = useAudio();
  if (!current) return null;
  return (
    <div className="player" data-playing={playing ? "1" : "0"} role="region" aria-label="Lecteur d'extraits">
      <div className="player-progress" style={{ transform: `scaleX(${progress})` }} />
      <img src={current.cover} alt="" />
      <div className="player-meta">
        <strong>{current.title}</strong>
        <span>{playing ? "Extrait 30 s" : "En pause"}</span>
      </div>
      <span className="eq" aria-hidden>
        <i /><i /><i /><i />
      </span>
      <a className="player-full" href={`/${current.slug}`}>
        En entier
      </a>
      <button type="button" className="player-toggle" onClick={() => toggle(current)} aria-label={playing ? "Pause" : "Lecture"}>
        {playing ? (
          <svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
        ) : (
          <svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" /></svg>
        )}
      </button>
      <button type="button" className="player-close" onClick={stop} aria-label="Fermer le lecteur">
        <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" /></svg>
      </button>
    </div>
  );
}
