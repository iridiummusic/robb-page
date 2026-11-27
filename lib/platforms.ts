import type { Release } from "./catalog";
import { site } from "@/site.config";

export type PlatformLink = { key: string; label: string; url: string };

// Ordre d'affichage des boutons d'écoute
const PLATFORMS: { key: string; label: string; search?: (q: string) => string }[] = [
  { key: "spotify", label: "Spotify", search: (q) => `https://open.spotify.com/search/${encodeURIComponent(q)}` },
  { key: "appleMusic", label: "Apple Music", search: (q) => `https://music.apple.com/fr/search?term=${encodeURIComponent(q)}` },
  { key: "deezer", label: "Deezer" },
  { key: "youtubeMusic", label: "YouTube Music", search: (q) => `https://music.youtube.com/search?q=${encodeURIComponent(q)}` },
  { key: "youtube", label: "YouTube" },
  { key: "amazonMusic", label: "Amazon Music" },
  { key: "tidal", label: "Tidal" },
  { key: "soundcloud", label: "SoundCloud" },
];

/**
 * Liens de toutes les plateformes pour une sortie, via l'API publique Odesli (song.link).
 * Mis en cache 24 h. Si Odesli ne répond pas, on garde Deezer + des liens de recherche.
 */
export async function getPlatformLinks(release: Release): Promise<PlatformLink[]> {
  let found: Record<string, { url: string }> = {};
  try {
    const res = await fetch(
      `https://api.song.link/v1-alpha.1/links?userCountry=FR&url=${encodeURIComponent(release.deezerUrl)}`,
      { next: { revalidate: 86400 }, signal: AbortSignal.timeout(8000) }
    );
    if (res.ok) found = (await res.json())?.linksByPlatform ?? {};
  } catch {}

  const query = `${site.artist} ${release.name}`;
  const links: PlatformLink[] = [];
  for (const p of PLATFORMS) {
    const url = found[p.key]?.url ?? (p.key === "deezer" ? release.deezerUrl : undefined);
    if (url) links.push({ key: p.key, label: p.label, url });
  }
  // Odesli muet : on garantit au moins Spotify / Apple / YouTube Music en recherche
  if (links.length < 3) {
    for (const p of PLATFORMS) {
      if (p.search && !links.some((l) => l.key === p.key)) {
        links.push({ key: p.key, label: p.label, url: p.search(query) });
      }
    }
    links.sort((a, b) => PLATFORMS.findIndex((p) => p.key === a.key) - PLATFORMS.findIndex((p) => p.key === b.key));
  }
  return links;
}
