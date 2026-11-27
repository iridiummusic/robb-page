// ─────────────────────────────────────────────────────────────
//  RÉGLAGES DE LA PAGE — le seul fichier que tu as à modifier.
//  Les sorties, pochettes, liens plateformes et couleurs
//  se mettent à jour tout seuls depuis Deezer.
// ─────────────────────────────────────────────────────────────

export const site = {
  artist: "ROBB",
  // Adresse finale de la page (sans / à la fin)
  url: "https://robbmusic.netlify.app", // deviendra https://robbmusic.fr
  tagline: "Rap indépendant. Boulogne-Billancourt.",

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

  // ── Concerts (les dates passées disparaissent toutes seules) ──
  concerts: [
    // { date: "2027-02-14", city: "Paris", venue: "La Boule Noire", ticketUrl: "https://shotgun.live/..." },
  ] as { date: string; city: string; venue: string; ticketUrl?: string; soldOut?: boolean }[],

  // ── Clips ──
  // ID de ta chaîne YouTube (commence par UC…) : les 6 derniers clips s'affichent seuls.
  youtubeChannelId: "",
  // Ou, à défaut, une liste d'ID de vidéos (la partie après watch?v=)
  youtubeVideoIds: [] as string[],

  // ── Boutique Shopify (produits lus automatiquement) ──
  shopUrl: "https://robbshop.fr",
  shopProductsShown: 6,

  // ── Réseaux & contact ──
  socials: {
    instagram: "", // ex. "https://instagram.com/xxx"
    tiktok: "",
    youtube: "",
    spotify: "", // lien profil artiste Spotify
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
