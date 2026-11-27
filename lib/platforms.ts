import type { Release } from "./catalog";
import { site } from "@/site.config";

export type PlatformLink = { key: string; label: string; url: string };

const LABELS: Record<string, string> = {
  spotify: "Spotify",
  appleMusic: "Apple Music",
  deezer: "Deezer",
  youtubeMusic: "YouTube Music",
  youtube: "YouTube",
  amazonMusic: "Amazon Music",
  tidal: "Tidal",
  soundcloud: "SoundCloud",
};
const ORDER = Object.keys(LABELS);

const day = { next: { revalidate: 86400 } } as const;

/** Code-barres (UPC) de la sortie, lu sur Deezer : il sert à la retrouver partout ailleurs. */
async function getUpc(release: Release): Promise<string | null> {
  try {
    const res = await fetch(`https://api.deezer.com/album/${release.id}`, { ...day, signal: AbortSignal.timeout(6000) });
    const json = await res.json();
    return json?.upc ? String(json.upc) : null;
  } catch {
    return null;
  }
}

/** Apple Music : API publique iTunes, recherche par UPC (aucun compte requis). */
async function appleByUpc(upc: string): Promise<string | null> {
  try {
    const res = await fetch(`https://itunes.apple.com/lookup?upc=${upc}&entity=album&country=FR`, {
      ...day,
      signal: AbortSignal.timeout(6000),
    });
    const json = JSON.parse(await res.text());
    const url: string | undefined = json?.results?.[0]?.collectionViewUrl;
    return url ? url.replace(/\?uo=\d+$/, "") : null;
  } catch {
    return null;
  }
}

/**
 * Spotify : seulement si SPOTIFY_CLIENT_ID et SPOTIFY_CLIENT_SECRET sont renseignés
 * (application Spotify for Developers, compte Premium requis par Spotify).
 */
async function spotifyByUpc(upc: string): Promise<string | null> {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) return null;
  try {
    const tok = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        authorization: "Basic " + Buffer.from(`${id}:${secret}`).toString("base64"),
      },
      body: "grant_type=client_credentials",
      cache: "no-store",
    }).then((r) => r.json());
    if (!tok?.access_token) return null;
    const res = await fetch(`https://api.spotify.com/v1/search?type=album&market=FR&q=upc:${upc}`, {
      headers: { authorization: `Bearer ${tok.access_token}` },
      ...day,
    });
    const json = await res.json();
    return json?.albums?.items?.[0]?.external_urls?.spotify ?? null;
  } catch {
    return null;
  }
}

/**
 * Liens d'écoute d'une sortie. Automatique pour Deezer et Apple Music,
 * Spotify si les clés sont configurées, sinon une recherche Spotify ciblée.
 * Un lien peut toujours être forcé dans site.config.ts (linkOverrides).
 */
export async function getPlatformLinks(release: Release): Promise<PlatformLink[]> {
  const found: Record<string, string> = { deezer: release.deezerUrl };
  const upc = await getUpc(release);
  if (upc) {
    const [apple, spotify] = await Promise.all([appleByUpc(upc), spotifyByUpc(upc)]);
    if (apple) found.appleMusic = apple;
    if (spotify) found.spotify = spotify;
  }

  const q = encodeURIComponent(`${site.artist} ${release.name}`);
  found.spotify ??= `https://open.spotify.com/search/${q}`;
  found.appleMusic ??= `https://music.apple.com/fr/search?term=${q}`;
  found.youtubeMusic ??= `https://music.youtube.com/search?q=${q}`;

  const overrides = (site.linkOverrides as Record<string, Record<string, string>>)[release.slug] ?? {};
  Object.assign(found, overrides);

  return ORDER.filter((k) => found[k]).map((k) => ({ key: k, label: LABELS[k], url: found[k] }));
}
