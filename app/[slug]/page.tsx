import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRelease, formatDate, typeLabel } from "@/lib/catalog";
import { getPlatformLinks } from "@/lib/platforms";
import { paletteFromCover } from "@/lib/palette";
import { site } from "@/site.config";
import Stage from "@/components/Stage";
import ListenLinks from "@/components/ListenLinks";
import ShareButton from "@/components/ShareButton";
import SubscribeForm from "@/components/SubscribeForm";

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
  const r = await getRelease((await params).slug);
  if (!r) notFound();
  const [links, palette] = await Promise.all([getPlatformLinks(r), paletteFromCover(r.cover)]);

  return (
    <Stage cover={r.cover} palette={palette}>
      <div className="smart">
        <a className="wordmark" href="/">{site.artist}</a>
        <img className="cover" src={r.cover} alt={`Pochette de ${r.title}`} />
        <h1 className="title">{r.name}</h1>
        <p className="meta">{[r.detail, typeLabel[r.type], formatDate(r.date)].filter(Boolean).join(" · ")}</p>
        <ListenLinks links={links} source={r.slug} />
        <div className="hero-actions">
          <ShareButton url={`${site.url}/${r.slug}`} title={`${site.artist} — ${r.name}`} />
          <a className="ghost" href="/">Toute la musique de {site.artist}</a>
        </div>
        <section className="block" aria-labelledby="h-sub">
          <h2 id="h-sub">Sois prévenu de la prochaine sortie</h2>
          <SubscribeForm source={`smartlink/${r.slug}`} />
        </section>
      </div>
    </Stage>
  );
}
