"use client";
import { useState } from "react";

/** Vignette légère : la vidéo YouTube ne se charge qu'au clic (page plus rapide). */
export default function Clip({ id, title }: { id: string; title: string }) {
  const [play, setPlay] = useState(false);
  return (
    <figure className="clip">
      {play ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title || "Clip"}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : (
        <button type="button" onClick={() => setPlay(true)} aria-label={`Lire ${title || "le clip"}`}>
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" />
          <span className="clip-play" aria-hidden>
            <svg viewBox="0 0 24 24" width="22" height="22"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
          </span>
        </button>
      )}
      {title && <figcaption>{title}</figcaption>}
    </figure>
  );
}
