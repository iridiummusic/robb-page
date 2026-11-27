import { site } from "@/site.config";

export type Clip = { id: string; title: string };
export type Product = { title: string; url: string; image: string | null; price: string | null };

const decode = (s: string) =>
  s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

/** Derniers clips : flux public de la chaîne YouTube (15 dernières vidéos), sinon la liste manuelle. */
export async function getClips(limit = 15): Promise<Clip[]> {
  if (site.youtubeChannelId) {
    try {
      const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${site.youtubeChannelId}`, {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(6000),
      });
      const xml = await res.text();
      const clips = [...xml.matchAll(/<entry>[\s\S]*?<yt:videoId>(.*?)<\/yt:videoId>[\s\S]*?<title>(.*?)<\/title>/g)].map(
        (m) => ({ id: m[1], title: decode(m[2]) })
      );
      if (clips.length) return clips.slice(0, limit);
    } catch {}
  }
  return site.youtubeVideos.slice(0, limit);
}

/** Produits de la boutique Shopify (endpoint public products.json, aucun jeton requis). */
export async function getProducts(): Promise<Product[]> {
  if (!site.shopUrl) return [];
  try {
    const res = await fetch(`${site.shopUrl}/products.json?limit=${site.shopProductsShown}`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(6000),
    });
    const json = await res.json();
    return (json?.products ?? []).slice(0, site.shopProductsShown).map((p: any) => {
      const price = p.variants?.[0]?.price;
      return {
        title: p.title,
        url: `${site.shopUrl}/products/${p.handle}`,
        image: p.images?.[0]?.src ?? null,
        price: price ? `${Number(price).toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} €` : null,
      };
    });
  } catch {
    return [];
  }
}

export function upcomingConcerts() {
  const today = new Date().toISOString().slice(0, 10);
  return site.concerts.filter((c) => c.date >= today).sort((a, b) => (a.date < b.date ? -1 : 1));
}

const norm = (t: string) =>
  t.replace(/œ/gi, "oe").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** Le clip YouTube d'une sortie : la vidéo la plus récente dont le titre contient le nom du titre. */
export function clipFor(name: string, clips: Clip[]): Clip | null {
  const n = norm(name);
  if (n.length < 3) return null;
  return clips.find((c) => ` ${norm(c.title)} `.includes(` ${n} `)) ?? null;
}
