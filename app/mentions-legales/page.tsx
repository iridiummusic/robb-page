import { site } from "@/site.config";

export const metadata = { title: "Mentions légales et confidentialité" };

export default function Legal() {
  const l = site.legal;
  return (
    <div className="stage" style={{ padding: "0 20px 64px" }}>
      <article className="legal-page">
        <a className="wordmark" href="/">{site.artist}</a>
        <h1>Mentions légales</h1>
        <p>
          Ce site est édité par {l.company}
          {l.address && <>, {l.address}</>}
          {l.siret && <>, SIRET {l.siret}</>}. Directeur de la publication : {l.director}. Contact : {l.contact}.
        </p>
        <p>Hébergement : Netlify, Inc., San Francisco, États-Unis (netlify.com).</p>

        <h2>Tes données</h2>
        <p>
          Quand tu laisses ton email ou ton numéro pour être prévenu des sorties, ils servent uniquement à t'envoyer un
          message à chaque nouvelle sortie de {site.artist}. Ils ne sont ni vendus ni partagés.
        </p>
        <p>
          Ils sont stockés chez Brevo (Sendinblue SAS, France), qui envoie les emails et SMS pour notre compte, et
          conservés tant que tu restes inscrit. Tu peux te désinscrire à tout moment avec le lien en bas de chaque mail ou
          en répondant STOP à un SMS.
        </p>
        <p>
          Tu peux demander l'accès, la correction ou la suppression de tes données en écrivant à {l.contact}. En cas de
          désaccord, tu peux saisir la CNIL (cnil.fr).
        </p>
        <p>Ce site ne dépose aucun cookie de suivi.</p>
      </article>
    </div>
  );
}
