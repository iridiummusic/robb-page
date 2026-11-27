// Tous les jours à 9 h UTC (10 h à Paris l'hiver) : déclenche l'envoi aux fans s'il y a une sortie aujourd'hui.
export default async () => {
  const base = process.env.URL; // adresse principale du site, fournie par Netlify
  const res = await fetch(`${base}/api/cron/release`, {
    headers: { authorization: `Bearer ${process.env.CRON_SECRET ?? ""}` },
  });
  console.log("[release-cron]", res.status, await res.text());
  return new Response("ok");
};

export const config = { schedule: "0 9 * * *" };
