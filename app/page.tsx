import { getCatalog, formatDate, typeLabel } from "@/lib/catalog";
import { getPlatformLinks } from "@/lib/platforms";
import { paletteFromCover } from "@/lib/palette";
import { getClips, getProducts, upcomingConcerts } from "@/lib/extras";
import { site } from "@/site.config";
import Stage from "@/components/Stage";
import ListenLinks from "@/components/ListenLinks";
import SubscribeForm from "@/components/SubscribeForm";
import Countdown from "@/components/Countdown";
import Clip from "@/components/Clip";
import ShareButton from "@/components/ShareButton";
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
  const upcoming =
    site.upcoming && new Date(site.upcoming.date).getTime() > Date.now() ? site.upcoming : null;
  const heroCover = upcoming?.coverUrl ?? latest.cover;

  const [links, palette, clips, products] = await Promise.all([
    getPlatformLinks(latest),
    paletteFromCover(heroCover),
    getClips(),
    getProducts(),
  ]);
  const concerts = upcomingConcerts();
  const socials = Object.entries(site.socials).filter(([, url]) => url);

  return (
    <Stage cover={heroCover} palette={palette}>
      <div className="layout">
        {/* ── Colonne héros : ce qui sort, et comment l'écouter ── */}
        <header className="hero">
          <p className="wordmark">{site.artist}</p>

          {upcoming ? (
            <>
              <div className="cover-wrap">
                {upcoming.coverUrl ? (
                  <img className="cover" src={upcoming.coverUrl} alt={`Pochette de ${upcoming.title}`} />
                ) : (
                  <div className="cover cover-blank" aria-hidden>
                    <span>{upcoming.title}</span>
                  </div>
                )}
              </div>
              <h1 className="title">{upcoming.title}</h1>
              <p className="meta">Sortie le {formatDate(upcoming.date.slice(0, 10), { weekday: "long", day: "numeric", month: "long" })}</p>
              <Countdown date={upcoming.date} />
              {upcoming.presaveUrl && (
                <a className="btn" href={upcoming.presaveUrl} target="_blank" rel="noopener">
                  Pré-enregistrer le titre
                </a>
              )}
              <div className="hero-sub">
                <p className="hint">Ou reçois un message à la seconde où il sort :</p>
                <SubscribeForm source="countdown" />
              </div>
            </>
          ) : (
            <>
              <a className="cover-wrap" href={`/${latest.slug}`}>
                <img className="cover" src={latest.cover} alt={`Pochette de ${latest.title}`} />
              </a>
              <h1 className="title">{latest.name}</h1>
              <p className="meta">
                {[latest.detail, typeLabel[latest.type], formatDate(latest.date)].filter(Boolean).join(" · ")}
              </p>
              <ListenLinks links={links} source="home" />
              <div className="hero-actions">
                <ShareButton url={`${site.url}/${latest.slug}`} title={`${site.artist} — ${latest.name}`} />
              </div>
            </>
          )}
        </header>

        {/* ── Colonne contenu ── */}
        <main className="content">
          {!upcoming && (
            <section className="block" aria-labelledby="h-sub">
              <h2 id="h-sub">Sois prévenu de la prochaine sortie</h2>
              <p className="hint">Un mail ou un SMS le jour J. Pas de spam, juste la musique.</p>
              <SubscribeForm source="home" />
            </section>
          )}

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
                      <a className="btn btn-sm" href={c.ticketUrl} target="_blank" rel="noopener">Billets</a>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {clips.length > 0 && (
            <section className="block" aria-labelledby="h-clips">
              <h2 id="h-clips">Clips</h2>
              <div className="clips">
                {clips.map((c) => <Clip key={c.id} id={c.id} title={c.title} />)}
              </div>
            </section>
          )}

          <section className="block" aria-labelledby="h-disco">
            <h2 id="h-disco">Discographie</h2>
            <ul className="disco">
              {catalog.map((r) => (
                <li key={r.id}>
                  <a href={`/${r.slug}`}>
                    <img src={r.coverSmall} alt="" loading="lazy" />
                    <strong>{r.name}</strong>
                    <span>{typeLabel[r.type]} · {r.date.slice(0, 4)}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          {products.length > 0 && (
            <section className="block" aria-labelledby="h-shop">
              <div className="block-head">
                <h2 id="h-shop">Boutique</h2>
                <a className="more" href={site.shopUrl} target="_blank" rel="noopener">Tout voir <Arrow /></a>
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
            <div>
              <h2>Booking et presse</h2>
              <a className="mail" href={`mailto:${site.bookingEmail}`}>{site.bookingEmail}</a>
            </div>
            {socials.length > 0 && (
              <ul className="socials">
                {socials.map(([k, url]) => (
                  <li key={k}><a href={url} target="_blank" rel="noopener">{k[0].toUpperCase() + k.slice(1)}</a></li>
                ))}
              </ul>
            )}
            <p className="legal">© {new Date().getFullYear()} {site.artist} · Iridium Music · <a className="legal-link" href="/mentions-legales">Mentions légales et confidentialité</a></p>
          </footer>
        </main>
      </div>
    </Stage>
  );
}
