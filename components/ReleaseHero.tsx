import type { Release } from "@/lib/catalog";
import type { PlatformLink } from "@/lib/platforms";
import { formatDate, typeLabel } from "@/lib/catalog";
import { site } from "@/site.config";
import TiltCover from "./TiltCover";
import ListenLinks from "./ListenLinks";
import ShareButton from "./ShareButton";
import { PlayButton } from "./Audio";

const SMALL = new Set(["de", "des", "du", "et", "la", "le", "les", "a", "à", "au", "aux", "en", "sur"]);
/** « LE KŒUR DES MIENS » → « Le Kœur des Miens » : le lettrage gothique se lit mieux en casse mixte. */
export function displayTitle(t: string) {
  return t
    .toLocaleLowerCase("fr-FR")
    .split(" ")
    .map((w, i) => (i > 0 && SMALL.has(w) ? w : w.charAt(0).toLocaleUpperCase("fr-FR") + w.slice(1)))
    .join(" ");
}

export default function ReleaseHero({ release, links, headingLevel = 1 }: { release: Release; links: PlatformLink[]; headingLevel?: 1 | 2 }) {
  const H = headingLevel === 1 ? "h1" : "h2";
  const name = displayTitle(release.name);
  return (
    <div className="release">
      <TiltCover src={release.cover} alt={`Pochette de ${release.title}`}>
        <PlayButton
          className="play-hero"
          label="Extrait"
          track={{ album: release.id, title: release.name, cover: release.coverSmall, slug: release.slug }}
        />
      </TiltCover>
      <H className="title" data-long={name.length > 14 ? "1" : undefined}>
        {name}
      </H>
      <p className="meta">
        {[release.detail && displayTitle(release.detail), typeLabel[release.type], formatDate(release.date)].filter(Boolean).join(" · ")}
      </p>
      <ListenLinks links={links} source={release.slug} />
      <div className="hero-actions">
        <ShareButton url={`${site.url}/${release.slug}`} title={`${site.artist} — ${release.name}`} />
      </div>
    </div>
  );
}
