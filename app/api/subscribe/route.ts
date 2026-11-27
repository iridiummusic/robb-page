import { NextResponse } from "next/server";
import { addFan, normalizePhone } from "@/lib/brevo";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const contact = String(body.contact ?? "").trim();
  const source = String(body.source ?? "").slice(0, 60);

  if (!body.consent) {
    return NextResponse.json({ error: "Coche la case pour accepter de recevoir les messages." }, { status: 400 });
  }
  // champ piège anti-robots
  if (body.website) return NextResponse.json({ ok: true });

  let email: string | undefined;
  let phone: string | undefined;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) email = contact.toLowerCase();
  else {
    const p = normalizePhone(contact);
    if (p) phone = p;
  }
  if (!email && !phone) {
    return NextResponse.json({ error: "Entre un email ou un numéro de portable valide." }, { status: 400 });
  }

  try {
    await addFan({ email, phone, source });
    return NextResponse.json({ ok: true, channel: email ? "email" : "sms" });
  } catch (e) {
    console.error("[subscribe]", e);
    return NextResponse.json({ error: "L'inscription n'est pas passée. Réessaie dans un instant." }, { status: 502 });
  }
}
