import { site } from "@/site.config";
import fallback from "@/data/catalog-fallback.json";

export type Release = {
  id: number;
  slug: string;
  title: string; // titre complet, tel que distribué
  name: string; // titre court, sans (LIVE SESSION 07) ni feat.
  detail: string | null; // ce qui était entre parenthèses
  date: string; // AAAA-MM-JJ
  type: "single" | "ep" | "album";
  cover: string; // 1000×1000
  coverSmall: string; // 500×500
  deezerUrl: string;
};

type DeezerAlbum = {
  id: number;
  title: string;
  release_date: string;
  record_type: string;
  md5_image: string;
};

const cdn = (md5: string, size: number) =>
  `https://cdn-images.dzcdn.net/images/cover/${md5}/${size}x${size}-000000-80-0-0.jpg`;

export function slugify(title: string) {
  return title
    .replace(/\s*[\(\[].*?[\)\]]/g, "")
    .replace(/œ/gi, "oe")
    .replace(/æ/gi, "ae")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toRelease(a: DeezerAlbum): Release {
  const detail = [...a.title.matchAll(/[\(\[](.*?)[\)\]]/g)].map((m) => m[1]).join(" · ") || null;
  const name = a.title.replace(/\s*[\(\[].*?[\)\]]/g, "").trim();
  const type = a.record_type === "album" ? "album" : a.record_type === "ep" ? "ep" : "single";
  return {
    id: a.id,
    slug: slugify(a.title) || String(a.id),
    title: a.title,
    name,
    detail,
    date: a.release_date,
    type,
    cover: cdn(a.md5_image, 1000),
    coverSmall: cdn(a.md5_image, 500),
    deezerUrl: `https://www.deezer.com/album/${a.id}`,
  };
}

/** Toutes les sorties, de la plus récente à la plus ancienne. Rafraîchi toutes les heures. */
export async function getCatalog(): Promise<Release[]> {
  let albums: DeezerAlbum[] = fallback as DeezerAlbum[];
  try {
    const res = await fetch(
      `https://api.deezer.com/artist/${site.deezerArtistId}/albums?limit=100`,
      { next: { revalidate: 3600 }, signal: AbortSignal.timeout(6000) }
    );
    const json = await res.json();
    if (Array.isArray(json?.data) && json.data.length) albums = json.data;
  } catch {
    // Deezer injoignable : on garde la dernière copie connue
  }
  const today = new Date().toISOString().slice(0, 10);
  const list = albums
    .map(toRelease)
    .filter((r) => r.date <= today)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  // slugs uniques
  const seen = new Map<string, number>();
  for (const r of list) {
    const n = seen.get(r.slug) ?? 0;
    seen.set(r.slug, n + 1);
    if (n) r.slug = `${r.slug}-${n + 1}`;
  }
  return list;
}

export async function getRelease(slug: string) {
  const all = await getCatalog();
  return all.find((r) => r.slug === slug) ?? null;
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }) {
  return new Date(iso + (iso.length === 10 ? "T12:00:00" : "")).toLocaleDateString("fr-FR", opts);
}

export const typeLabel = { single: "Single", ep: "EP", album: "Album" } as const;
