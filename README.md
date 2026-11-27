# Page artiste ROBB — mise en ligne

Ta page à toi, sans Listenify : chaque sortie a son lien permanent, la page se met à jour toute seule et prend les couleurs de la dernière pochette.

## Ce qui est automatique

| Quoi | D'où ça vient | Fréquence |
|---|---|---|
| Sorties, pochettes, dates | Catalogue Deezer de ROBB (public, sans compte) | toutes les heures |
| Liens Deezer et Apple Music (par le code-barres UPC), Spotify si une clé Spotify est ajoutée, sinon une recherche Spotify ciblée | Deezer + API publique iTunes | toutes les 24 h |
| Couleurs de la page | Teinte dominante de la dernière pochette | à chaque nouvelle sortie |
| Clips (et lien YouTube sur chaque page de sortie) | Flux de ta chaîne YouTube @robbkpr, sinon la liste `youtubeVideos` de `site.config.ts` | toutes les heures |
| Produits merch | Boutique Shopify (`/products.json`, public) | toutes les heures |
| Message aux fans (email + SMS) | Brevo, le jour de la sortie à 10 h | chaque jour, ne part que s'il y a une sortie |

Les liens à mettre partout :

- `robbmusic.fr` (pour l'instant `robbmusic.netlify.app`) : la page complète (bio Insta, kits presse)
- `robbmusic.fr/nouveau` : renvoie toujours vers la dernière sortie (idéal en story ou en bio pendant une promo)
- `robbmusic.fr/la-meute`, `robbmusic.fr/wagyu`, `robbmusic.fr/stark`… : un smartlink par titre, qui ne s'éteint jamais

Pour savoir d'où viennent tes visiteurs, ajoute `?utm_source=insta` (ou `tiktok`, `presse`…) à la fin du lien.

## Ce que tu modifies : un seul fichier

`site.config.ts` contient :

- la prochaine sortie (titre, date, lien de pré-save HyperFollow DistroKid) : le compte à rebours s'affiche tout seul ;
- tes concerts (les dates passées disparaissent toutes seules) ;
- l'identifiant de ta chaîne YouTube, tes réseaux, ton mail de booking ;
- tes mentions légales (adresse et SIRET d'Iridium Music).

Sur GitHub, ouvre le fichier, clique sur le crayon, modifie et valide (« Commit changes ») : la page en ligne se met à jour en environ une minute.

---

## Comment c'est hébergé

- **Code** : GitHub, compte `iridiummusic`, dépôt `robb-page`.
- **Hébergement** : Netlify (offre gratuite, usage commercial autorisé). Chaque modification du dépôt remet la page en ligne en environ 1 minute.
- **Fans** : Brevo (compte iridiumusic@gmail.com), liste « Fans ROBB ».
- **Variables Netlify** (Project configuration → Environment variables) :
  - `BREVO_API_KEY` : clé API Brevo
  - `BREVO_LIST_ID` : `3`
  - `CRON_SECRET` : une longue phrase secrète
  - `AUTO_NOTIFY` : `true` (mets `false` pour couper les envois aux fans)
- **Envoi automatique** : la fonction `netlify/functions/release-cron.mts` tourne chaque jour à 10 h (heure de Paris).

## Budget Netlify (gratuit : 300 crédits par mois)
- Chaque mise en ligne (chaque « Commit changes » sur GitHub) coûte environ **15 crédits**. Groupe tes modifications : modifie `site.config.ts` en une seule fois.
- Les nouvelles sorties, pochettes et liens n'ont **pas** besoin de mise en ligne : la page se met à jour toute seule.
- Le compteur de crédits est en haut à gauche dans Netlify. Si tu approches de 0, ne fais plus de modifications avant le mois suivant.

## Brancher robbmusic.fr (plus tard)
1. Achète `robbmusic.fr` chez OVH, au nom d'Iridium Music (SIREN demandé).
2. Dans Netlify, ouvre **Domain management → Add a domain** et entre `robbmusic.fr`.
3. Dans OVH, ouvre la **zone DNS** et ajoute les enregistrements que Netlify affiche (un A vers l'IP de répartition de charge de Netlify pour la racine, un CNAME `www` vers `robbmusic.netlify.app`).
4. Dans `site.config.ts`, remplace `url` par `https://robbmusic.fr`.

## Vérifier
- Inscris-toi toi-même avec ton email, puis avec ton 06 : les deux contacts doivent apparaître dans la liste Brevo « Fans ROBB ».
- Ouvre la page de La Meute sur ton téléphone et teste chaque bouton d'écoute.
- Partage le lien dans un DM Instagram : l'aperçu doit afficher la pochette.

### Plus tard : la boutique sur robbmusic.fr
Pour que le merch passe sur ton nouveau domaine (par exemple `shop.robbmusic.fr`) :
1. Dans Shopify, ouvre **Paramètres → Domaines → Connecter un domaine existant**.
2. Ajoute dans OVH le CNAME `shop` : `shops.myshopify.com.`
3. Change `shopUrl` dans `site.config.ts`.

## Règles respectées
- Pas de SMS le dimanche (règle française du démarchage). L'envoi part à 10 h.
- Consentement explicite (case à cocher), désinscription en un clic, page mentions légales et confidentialité.
- Aucun cookie de suivi.
