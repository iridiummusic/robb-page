import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRelease, getCatalog } from "@/lib/catalog";
import { getPlatformLinks } from "@/lib/platforms";
import { paletteFromCover } from "@/lib/palette";
import { site } from "@/site.config";
import Stage from "@/components/Stage";
import SubscribeForm from "@/components/SubscribeForm";
import Clip from "@/components/Clip";
import ReleaseHero from "@/components/ReleaseHero";
import { AudioProvider, PlayerBar } from "@/components/Audio";
import { getClips, clipFor } from "@/lib/extras";

export const revalidate = 86400;
export const dynamicParams = true;
export async function generateStaticParams() {
  return []; // pages créées à la première visite, puis gardées en cache
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await getRelease((await params).slug);
  if (!r) return {};
  const title = `${r.name} — ${site.artist}`;
  return {
    title: { absolute: title },
    description: `Écoute « ${r.title} » de ${site.artist} sur ta plateforme.`,
    openGraph: { title, images: [{ url: r.cover, width: 1000, height: 1000 }], type: "music.album" },
    twitter: { card: "summary_large_image", title, images: [r.cover] },
  };
}

/** Smartlink : une page par sortie, permanente. */
export default async function ReleasePage({ params }: Props) {
  const slug = (await params).slug;
  const r = await getRelease(slug);
  if (!r) notFound();
  const [baseLinks, palette, clips, catalog] = await Promise.all([
    getPlatformLinks(r),
    paletteFromCover(r.cover),
    getClips(),
    getCatalog(),
  ]);
  const clip = clipFor(r.name, clips);
  const links = clip
    ? [...baseLinks, { key: "youtube", label: "YouTube", url: `https://www.youtube.com/watch?v=${clip.id}` }]
    : baseLinks;
  const i = catalog.findIndex((x) => x.slug === r.slug);
  const newer = i > 0 ? catalog[i - 1] : null;
  const older = i >= 0 && i < catalog.length - 1 ? catalog[i + 1] : null;

  return (
    <AudioProvider>
      <Stage cover={r.cover} palette={palette}>
        <header className="topbar">
          <a className="wordmark" href="/" aria-label={`${site.artist}, accueil`}>
            {site.artist}
          </a>
          <a className="topbar-cta" href="/">
            Toute la musique
          </a>
        </header>
        <div className="smart">
          <ReleaseHero release={r} links={links} />
          {clip && (
            <section className="block" aria-labelledby="h-clip">
              <h2 id="h-clip">Le clip</h2>
              <Clip id={clip.id} title={clip.title} />
            </section>
          )}
          <section className="block meute" aria-labelledby="h-meute">
            <h2 id="h-meute">Rejoins la Meute</h2>
            <p className="hint">Un mail ou un SMS le jour de chaque sortie. Rien d'autre.</p>
            <SubscribeForm source={`smartlink/${r.slug}`} label="J'en suis" />
          </section>
          {(newer || older) && (
            <nav className="neighbors" aria-label="Autres sorties">
              {newer && (
                <a href={`/${newer.slug}`}>
                  <img src={newer.coverSmall} alt="" />
                  <span>
                    <small>Plus récent</small>
                    {newer.name}
                  </span>
                </a>
              )}
              {older && (
                <a href={`/${older.slug}`} className="older">
                  <span>
                    <small>Plus ancien</small>
                    {older.name}
                  </span>
                  <img src={older.coverSmall} alt="" />
                </a>
              )}
            </nav>
          )}
        </div>
        <PlayerBar />
      </Stage>
    </AudioProvider>
  );
}
