import { NextResponse } from "next/server";
import { getCatalog, typeLabel } from "@/lib/catalog";
import { sendEmailCampaign, sendSmsCampaign } from "@/lib/brevo";
import { site } from "@/site.config";

export const dynamic = "force-dynamic";

/**
 * Lancé chaque jour à 10 h (heure de Paris) par la fonction planifiée Netlify (netlify/functions/release-cron.mts).
 * Si une sortie est parue aujourd'hui sur Deezer, envoie le message à tous les fans
 * (email + SMS) avec le lien de la page de la sortie.
 * Test manuel : /api/cron/release?dry=1 (avec l'en-tête Authorization).
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "non autorisé" }, { status: 401 });
  }
  if (process.env.AUTO_NOTIFY !== "true") {
    return NextResponse.json({ skipped: "AUTO_NOTIFY désactivé" });
  }

  const dry = new URL(req.url).searchParams.get("dry") === "1";
  const now = new Date();
  const today = now.toLocaleDateString("en-CA", { timeZone: "Europe/Paris" }); // AAAA-MM-JJ
  const [latest] = await getCatalog();
  if (!latest || latest.date !== today) {
    return NextResponse.json({ sent: false, reason: "pas de sortie aujourd'hui", latest: latest?.title });
  }

  const link = `${site.url}/${latest.slug}?utm_source=fans&utm_medium=notification`;
  const subject = `${latest.name} est sorti`;
  const html = `<!doctype html><html><body style="margin:0;background:#0a0a0a;font-family:Helvetica,Arial,sans-serif;color:#f4f4f4">
  <div style="max-width:520px;margin:0 auto;padding:32px 20px">
    <img src="${latest.cover}" alt="${latest.title}" width="480" style="width:100%;height:auto;border-radius:6px;display:block">
    <h1 style="font-size:28px;margin:24px 0 4px">${latest.name}</h1>
    <p style="margin:0 0 24px;color:#aaa">${typeLabel[latest.type]}${latest.detail ? ` · ${latest.detail}` : ""}, dispo partout.</p>
    <a href="${link}" style="display:inline-block;background:#f4f4f4;color:#0a0a0a;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:999px">Écouter maintenant</a>
    <p style="margin:32px 0 0;font-size:12px;color:#777">Tu reçois ce message parce que tu as demandé à être prévenu des sorties de ${site.artist}. <a href="{{ unsubscribe }}" style="color:#999">Se désabonner</a></p>
  </div></body></html>`;
  // Pas de caractères spéciaux (« », emoji) : sinon chaque SMS compte double
  const sms = `${site.artist} : "${latest.name}" est sorti. Ecoute-le ici : ${site.url.replace("https://", "")}/${latest.slug}`;

  if (dry) return NextResponse.json({ dry: true, subject, sms, link });

  const result: Record<string, unknown> = { release: latest.title };
  try {
    result.email = await sendEmailCampaign({
      name: `Sortie ${latest.title}`,
      subject,
      html,
      senderName: site.notify.senderName,
      senderEmail: site.notify.senderEmail,
    });
  } catch (e) {
    result.emailError = String(e);
  }
  // En France, pas de SMS commercial le dimanche
  const weekday = now.toLocaleDateString("en-US", { timeZone: "Europe/Paris", weekday: "short" });
  if (weekday !== "Sun") {
    try {
      result.sms = await sendSmsCampaign({ name: `Sortie ${latest.title}`, sender: site.notify.smsSender, content: sms });
    } catch (e) {
      result.smsError = String(e);
    }
  } else result.sms = "reporté : dimanche";

  return NextResponse.json(result);
}
