"use client";
import { useState } from "react";

export default function SubscribeForm({ source, label = "Préviens-moi" }: { source: string; label?: string }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [channel, setChannel] = useState<"email" | "sms">("email");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("sending");
    const utm = new URLSearchParams(window.location.search).get("utm_source");
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contact: f.get("contact"),
        consent: f.get("consent") === "on",
        website: f.get("website"),
        source: utm ? `${source}/${utm}` : source,
      }),
    }).catch(() => null);
    const json = await res?.json().catch(() => ({}));
    if (res?.ok) {
      setChannel(json.channel);
      setState("done");
    } else {
      setMessage(json?.error ?? "Pas de connexion. Réessaie dans un instant.");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className="sub-done" role="status">
        C'est noté. Tu recevras {channel === "sms" ? "un SMS" : "un mail"} le jour de la prochaine sortie, rien d'autre.
      </p>
    );
  }

  return (
    <form className="sub" onSubmit={onSubmit} noValidate>
      <div className="sub-row">
        <label className="sr-only" htmlFor={`contact-${source}`}>Email ou numéro de portable</label>
        <input
          id={`contact-${source}`}
          name="contact"
          type="text"
          inputMode="email"
          autoComplete="email"
          placeholder="Email ou 06…"
          required
        />
        <button type="submit" disabled={state === "sending"}>
          {state === "sending" ? "Envoi…" : label}
        </button>
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden />
      <label className="sub-consent">
        <input type="checkbox" name="consent" required />
        <span>J'accepte de recevoir un message de ROBB à chaque sortie. Désinscription en un clic (ou STOP par SMS). <a href="/mentions-legales">Données</a></span>
      </label>
      {state === "error" && <p className="sub-error" role="alert">{message}</p>}
    </form>
  );
}
