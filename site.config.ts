// ─────────────────────────────────────────────────────────────
//  RÉGLAGES DE LA PAGE — le seul fichier que tu as à modifier.
//  Les sorties, pochettes, liens plateformes et couleurs
//  se mettent à jour tout seuls depuis Deezer.
// ─────────────────────────────────────────────────────────────

export const site = {
  artist: "ROBB",
  // Adresse finale de la page (sans / à la fin)
  url: "https://robbmusic.netlify.app", // deviendra https://robbmusic.fr
  tagline: "Entre chien et loup.",

  // Identifiant Deezer de ROBB (ne pas toucher)
  deezerArtistId: "235481721",

  // ── Prochaine sortie (pré-save + compte à rebours) ──
  // Mets null quand rien n'est annoncé.
  // presaveUrl : ton lien HyperFollow DistroKid (pré-save Spotify/Apple/Deezer).
  upcoming: null as null | {
    title: string;
    date: string; // ex. "2026-12-11T00:00:00+01:00"
    coverUrl?: string;
    presaveUrl?: string;
  },

  // ── Liens forcés (facultatif) ──
  // Pour remplacer un lien trouvé automatiquement, ex. :
  // "la-meute": { spotify: "https://open.spotify.com/album/...", youtube: "https://youtu.be/..." },
  linkOverrides: {
    "la-meute": { spotify: "https://open.spotify.com/album/15tOy4X48ofkvrfBpcvnp3" },
    wagyu: { spotify: "https://open.spotify.com/album/5iPVNFR4Cz2zf0WYZx3x1r" },
    "moules-marinieres": { spotify: "https://open.spotify.com/album/7pAOn8FPQxA8lHdZHOltht" },
    "le-koeur-des-miens": { spotify: "https://open.spotify.com/album/4KLlIJXE49cRZaTqTV1Kcn" },
    sinistros: { spotify: "https://open.spotify.com/album/4zm8Dej5vBqOwuMiMfa7kN" },
    "nirmal-purja": { spotify: "https://open.spotify.com/album/5NvPhp5lOHn1VOiyU4m1Z3" },
    "geometry-dash-11-11": { spotify: "https://open.spotify.com/album/3nL24WqR48zAY9j71bQm6J" },
    stark: { spotify: "https://open.spotify.com/album/2adUc84gvzvsfJyG82NKJu" },
    nausicaa: { spotify: "https://open.spotify.com/album/0EWmPeQSMmw1NbcgvswZ4o" },
    "vraies-excuses": { spotify: "https://open.spotify.com/album/3Tb3TSNyQhPTbJQtMIORUf" },
    "tous-les-jours": { spotify: "https://open.spotify.com/album/3j56CPp31tYE6eaZxWHc7w" },
    algorand: { spotify: "https://open.spotify.com/album/1hlVY2HdCbNX7ReyoGcmtg" },
    koeur: { spotify: "https://open.spotify.com/album/3dUmVes2G76HIKMDariAkK" },
    nokto: { spotify: "https://open.spotify.com/album/0pS0gK0yx8h6mpXGBwn0La" },
  } as Record<string, Partial<Record<"spotify" | "appleMusic" | "deezer" | "youtubeMusic" | "youtube" | "amazonMusic" | "tidal" | "soundcloud", string>>>,

  // ── Concerts (les dates passées disparaissent toutes seules) ──
  concerts: [
    // { date: "2027-02-14", city: "Paris", venue: "La Boule Noire", ticketUrl: "https://shotgun.live/..." },
  ] as { date: string; city: string; venue: string; ticketUrl?: string; soldOut?: boolean }[],

  // ── Clips ──
  // ID de ta chaîne YouTube (commence par UC…) : les 6 derniers clips s'affichent seuls.
  youtubeChannelId: "UCjOKqHWhx24wicz5EbB6Uxg", // @robbkpr
  // Liste de secours (le flux YouTube est parfois indisponible). Le plus récent en premier.
  // Pour un nouveau clip : ajoute une ligne en haut avec l'ID (la partie après watch?v=) et le titre.
  youtubeVideos: [
    { id: "HBWM0p_iyIE", title: "ROBB - LA MEUTE (LIVE SESSION 07) | LIVE À LA BOULE NOIRE" },
    { id: "QPudcHdwLic", title: "ROBB - WAGYU feat. WB (LIVE SESSION #6)" },
    { id: "tOlv1Lv8WAs", title: "ROBB - MOULES MARINIÈRES (LIVE SESSION #5)" },
    { id: "7uzlskPunHs", title: "ROBB - LE KŒUR DES MIENS (LIVE SESSION #4)" },
    { id: "kX2BOjeXJRk", title: "ROBB - SINISTROS (LIVE SESSION #3)" },
    { id: "J46kKUCuRVI", title: "ROBB - NIRMAL PURJA (LIVE SESSION #2)" },
    { id: "pB1iTD71vvc", title: "ROBB - GEOMETRY DASH 11/11 (LIVE SESSION #1) | Devant La Boule Noire" },
    { id: "nRABQ6Lq9BQ", title: "ROBB - Vraies Excuses" },
    { id: "gRqAAIxVNn4", title: "ROBB, Mick - Tous les jours" },
    { id: "knSUnDj3W2M", title: "ROBB - Algorand" },
  ] as { id: string; title: string }[],

  // ── Boutique Shopify (produits lus automatiquement) ──
  shopUrl: "https://robbshop.fr",
  shopProductsShown: 6,

  // ── Réseaux & contact ──
  socials: {
    instagram: "https://www.instagram.com/robbkpr/",
    tiktok: "https://www.tiktok.com/@robbkpr",
    youtube: "https://www.youtube.com/@robbkpr",
    spotify: "https://open.spotify.com/artist/0nS0zGjOjVBH5xE1M1nBjc",
  },
  bookingEmail: "robbprod@gmail.com",

  // ── Direction artistique ──
  // "auto" = couleurs tirées de la dernière pochette.
  // Pour forcer une teinte : { hue: 352 } (0-360).
  palette: "auto" as "auto" | { hue: number; saturation?: number },
  // Teinte de secours si la pochette ne peut pas être lue (LA MEUTE = rouge)
  fallbackHue: 352,

  // ── Mentions légales (obligatoires dès qu'on collecte des emails) ──
  legal: {
    company: "Iridium Music SASU",
    director: "Robin Vidal",
    address: "58 rue de Monceau, 75008 Paris",
    siret: "934 882 911 00019",
    contact: "robbprod@gmail.com",
  },

  // ── Messages aux fans à chaque sortie ──
  notify: {
    senderName: "ROBB",
    senderEmail: "iridiumusic@gmail.com", // adresse du compte Brevo (déjà validée)
    smsSender: "ROBB", // 11 caractères max, sans espace
  },
};

export type SiteConfig = typeof site;
