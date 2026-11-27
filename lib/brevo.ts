const API = "https://api.brevo.com/v3";

function headers() {
  const key = process.env.BREVO_API_KEY;
  if (!key) throw new Error("BREVO_API_KEY manquante");
  return { "api-key": key, "content-type": "application/json", accept: "application/json" };
}

export const listId = () => Number(process.env.BREVO_LIST_ID || 0);

/** Normalise un numéro français en +33… ; renvoie null si invalide. */
export function normalizePhone(raw: string): string | null {
  let p = raw.replace(/[\s.\-()]/g, "");
  if (p.startsWith("00")) p = "+" + p.slice(2);
  if (/^0[67]\d{8}$/.test(p)) p = "+33" + p.slice(1);
  if (/^\+33[67]\d{8}$/.test(p)) return p;
  if (/^\+\d{8,15}$/.test(p)) return p; // numéro étranger
  return null;
}

export async function addFan(fan: { email?: string; phone?: string; source?: string }) {
  const body: Record<string, unknown> = {
    listIds: [listId()],
    updateEnabled: true,
    attributes: {
      ...(fan.phone ? { SMS: fan.phone } : {}),
      ...(fan.source ? { SOURCE: fan.source } : {}),
    },
  };
  if (fan.email) body.email = fan.email;
  const res = await fetch(`${API}/contacts`, { method: "POST", headers: headers(), body: JSON.stringify(body) });
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    // contact déjà présent = pas une erreur pour le fan
    if (err?.code === "duplicate_parameter") return;
    // attribut SOURCE pas encore créé dans Brevo : on réessaie sans
    if (fan.source && /attribute/i.test(err?.message ?? "")) return addFan({ ...fan, source: undefined });
    throw new Error(err?.message || `Brevo ${res.status}`);
  }
}

export async function sendEmailCampaign(opts: { name: string; subject: string; html: string; senderName: string; senderEmail: string }) {
  const res = await fetch(`${API}/emailCampaigns`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      name: opts.name,
      subject: opts.subject,
      sender: { name: opts.senderName, email: opts.senderEmail },
      htmlContent: opts.html,
      recipients: { listIds: [listId()] },
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || "création campagne email");
  const send = await fetch(`${API}/emailCampaigns/${json.id}/sendNow`, { method: "POST", headers: headers() });
  if (!send.ok) throw new Error((await send.json().catch(() => ({})))?.message || "envoi campagne email");
  return json.id as number;
}

export async function sendSmsCampaign(opts: { name: string; sender: string; content: string }) {
  const res = await fetch(`${API}/smsCampaigns`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      name: opts.name,
      sender: opts.sender,
      content: opts.content,
      recipients: { listIds: [listId()] },
      unicodeEnabled: false,
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || "création campagne SMS");
  const send = await fetch(`${API}/smsCampaigns/${json.id}/sendNow`, { method: "POST", headers: headers() });
  if (!send.ok) throw new Error((await send.json().catch(() => ({})))?.message || "envoi campagne SMS");
  return json.id as number;
}
