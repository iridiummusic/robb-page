import { getCatalog, formatDate, typeLabel } from "@/lib/catalog";
import { getPlatformLinks } from "@/lib/platforms";
import { paletteFromCover } from "@/lib/palette";
import { getClips, getProducts, upcomingConcerts, clipFor } from "@/lib/extras";
import { site } from "@/site.config";
import Stage from "@/components/Stage";
import SubscribeForm from "@/components/SubscribeForm";
import Countdown from "@/components/Countdown";
import Clip from "@/components/Clip";
import ReleaseHero, { displayTitle } from "@/components/ReleaseHero";
import { AudioProvider, PlayButton, PlayerBar } from "@/components/Audio";
import { Arrow } from "@/components/icons";
import type { Metadata } from "next";

export const revalidate = 3600; // la page se reconstruit toute seule chaque heure

export async function generateMetadata(): Promise<Metadata> {
  const [latest] = await getCatalog();
  return {
    title: { absolute: site.artist },
    description: latest ? `${site.artist} — nouveau son : ${latest.name}. Écoute, clips, concerts, boutique.` : undefined,
    openGraph: { title: site.artist, images: latest ? [latest.cover] : [], type: "profile" },
    twitter: { card: "summary_large_image" },
  };
}

export default async function Home() {
  const catalog = await getCatalog();
  const latest = catalog[0];
  const upcoming = site.upcoming && new Date(site.upcoming.date).getTime() > Date.now() ? site.upcoming : null;
  const heroCover = upcoming?.coverUrl ?? latest.cover;

  const [baseLinks, palette, allClips, products] = await Promise.all([
    getPlatformLinks(latest),
    paletteFromCover(heroCover),
    getClips(),
    getProducts(),
  ]);
  const latestClip = clipFor(latest.name, allClips);
  const links = latestClip
    ? [...baseLinks, { key: "youtube", label: "YouTube", url: `https://www.youtube.com/watch?v=${latestClip.id}` }]
    : baseLinks;
  const clips = allClips.slice(0, 8);
  const concerts = upcomingConcerts();
  const socials = Object.entries(site.socials).filter(([, url]) => url);
  const ticker = upcoming
    ? [upcoming.title, `Sortie le ${formatDate(upcoming.date.slice(0, 10), { day: "numeric", month: "long" })}`, "Pré-enregistre-le"]
    : [latest.name, latest.detail ?? typeLabel[latest.type], "Dispo partout"];

  return (
    <AudioProvider>
      <Stage cover={heroCover} palette={palette}>
        {/* Bandeau défilant, comme l'écran LED au-dessus de la scène */}
        <div className="ticker" aria-hidden>
          <div className="ticker-track">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i}>
                {ticker.map((t) => (
                  <span key={t}>
                    {t}
                    <i>✦</i>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        <header className="topbar">
          <a className="wordmark" href="/" aria-label={`${site.artist}, accueil`}>
            {site.artist}
          </a>
          <a className="topbar-cta" href="#meute">
            Rejoindre la Meute
          </a>
        </header>

        <div className="layout">
          <section className="hero" aria-label="Dernière sortie">
            {upcoming ? (
              <div className="release">
                {upcoming.coverUrl ? (
                  <img className="cover" src={upcoming.coverUrl} alt={`Pochette de ${upcoming.title}`} />
                ) : (
                  <div className="cover cover-blank" aria-hidden>
                    <span>?</span>
                  </div>
                )}
                <h1 className="title">{displayTitle(upcoming.title)}</h1>
                <p className="meta">
                  Sortie le {formatDate(upcoming.date.slice(0, 10), { weekday: "long", day: "numeric", month: "long" })}
                </p>
                <Countdown date={upcoming.date} />
                {upcoming.presaveUrl && (
                  <a className="btn" href={upcoming.presaveUrl} target="_blank" rel="noopener">
                    Pré-enregistrer le titre
                  </a>
                )}
              </div>
            ) : (
              <ReleaseHero release={latest} links={links} />
            )}
          </section>

          <main className="content">
            <section className="block meute" id="meute" aria-labelledby="h-meute">
              <h2 id="h-meute">Rejoins la Meute</h2>
              <p className="hint">Un mail ou un SMS le jour de chaque sortie. Rien d'autre.</p>
              <SubscribeForm source={upcoming ? "countdown" : "home"} label="J'en suis" />
            </section>

            {concerts.length > 0 && (
              <section className="block" aria-labelledby="h-live">
                <h2 id="h-live">Sur scène</h2>
                <ul className="dates">
                  {concerts.map((c) => (
                    <li key={c.date + c.venue}>
                      <time dateTime={c.date}>
                        <b>{formatDate(c.date, { day: "2-digit" })}</b>
                        <span>{formatDate(c.date, { month: "short" })}</span>
                      </time>
                      <div>
                        <strong>{c.venue}</strong>
                        <span>{c.city}</span>
                      </div>
                      {c.soldOut ? (
                        <span className="tag">Complet</span>
                      ) : c.ticketUrl ? (
                        <a className="btn btn-sm" href={c.ticketUrl} target="_blank" rel="noopener">
                          Billets
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="block" aria-labelledby="h-disco">
              <div className="block-head">
                <h2 id="h-disco">Le catalogue</h2>
                <span className="block-note">{catalog.length} sorties · touche ▶ pour un extrait</span>
              </div>
              <ul className="crate">
                {catalog.map((r) => (
                  <li key={r.id} className="crate-item">
                    <a href={`/${r.slug}`} className="crate-link">
                      <img src={r.coverSmall} alt="" loading="lazy" />
                      <strong>{r.name}</strong>
                      <span>
                        {typeLabel[r.type]} · {r.date.slice(0, 4)}
                      </span>
                    </a>
                    <PlayButton
                      className="play-mini"
                      track={{ album: r.id, title: r.name, cover: r.coverSmall, slug: r.slug }}
                    />
                  </li>
                ))}
              </ul>
            </section>

            {clips.length > 0 && (
              <section className="block" aria-labelledby="h-clips">
                <div className="block-head">
                  <h2 id="h-clips">Clips</h2>
                  {site.socials.youtube && (
                    <a className="more" href={site.socials.youtube} target="_blank" rel="noopener">
                      La chaîne <Arrow />
                    </a>
                  )}
                </div>
                <div className="clips">
                  {clips.map((c) => (
                    <Clip key={c.id} id={c.id} title={c.title} />
                  ))}
                </div>
              </section>
            )}

            {products.length > 0 && (
              <section className="block" aria-labelledby="h-shop">
                <div className="block-head">
                  <h2 id="h-shop">Boutique</h2>
                  <a className="more" href={site.shopUrl} target="_blank" rel="noopener">
                    Tout voir <Arrow />
                  </a>
                </div>
                <ul className="shop">
                  {products.map((p) => (
                    <li key={p.url}>
                      <a href={p.url} target="_blank" rel="noopener">
                        {p.image && <img src={p.image} alt="" loading="lazy" />}
                        <strong>{p.title}</strong>
                        {p.price && <span>{p.price}</span>}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <footer className="foot">
              <p className="foot-sign">{site.tagline}</p>
              <div>
                <h2>Booking et presse</h2>
                <a className="mail" href={`mailto:${site.bookingEmail}`}>
                  {site.bookingEmail}
                </a>
              </div>
              {socials.length > 0 && (
                <ul className="socials">
                  {socials.map(([k, url]) => (
                    <li key={k}>
                      <a href={url} target="_blank" rel="noopener">
                        {k === "tiktok" ? "TikTok" : k === "youtube" ? "YouTube" : k[0].toUpperCase() + k.slice(1)}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              <p className="legal">
                © {new Date().getFullYear()} {site.artist} · Iridium Music ·{" "}
                <a className="legal-link" href="/mentions-legales">
                  Mentions légales et confidentialité
                </a>
              </p>
            </footer>
          </main>
        </div>
        <PlayerBar />
      </Stage>
    </AudioProvider>
  );
}
