"use client";

import { useEffect, useState } from "react";
import type { WeddingConfig } from "@/wedding.config";
import { PageLoader } from "@/components/Spinner";
import { api } from "@/lib/api";
import { coupleLine } from "@/lib/text";
import { applyColors, paletteOf } from "@/lib/theme";

export function GuestNotePage({ slug, initial }: { slug: string; initial: WeddingConfig | null }) {
  const [config, setConfig] = useState<WeddingConfig | null>(initial);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (config) {
      applyColors(paletteOf(config));
      return;
    }
    api<{ config: WeddingConfig }>(`/api/weddings/public/${slug}`)
      .then((body) => {
        const next = { ...body.config, drive: { slug, connected: body.config.drive?.connected } };
        setConfig(next);
        applyColors(paletteOf(next));
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Invitation introuvable"));
  }, [slug, config]);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api(`/api/weddings/public/${slug}/notes`, {
        method: "POST",
        body: JSON.stringify({ kind: "book", name, message }),
      });
      setSent(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Envoi impossible");
    } finally {
      setBusy(false);
    }
  }

  if (!config && !error) return <PageLoader />;
  if (!config) return <p className="setup">{error}</p>;

  const names = coupleLine(config).replace(/\s+&\s+/, " et ");

  return (
    <main className="setup">
      <p className="kicker">Livre d'or</p>
      <h1 className="names" style={{ fontSize: "clamp(40px, 8vw, 64px)" }}>{names}</h1>
      {sent ? (
        <>
          <p className="guest-thanks">Merci. Votre mot est arrivé jusqu’à {names}, qui le liront avec beaucoup de joie.</p>
          <a className="line-btn save-block is-dirty" href={`/i/${slug}`}>Voir l'invitation</a>
        </>
      ) : (
        <form className="guest-form" onSubmit={(event) => void send(event)}>
          <p className="note">Écrivez un souhait, un souvenir ou une pensée. Les mariés le liront avec beaucoup de joie.</p>
          <label className="field">Votre nom
            <input required value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label className="field">Votre message
            <textarea required rows={5} value={message} onChange={(event) => setMessage(event.target.value)} />
          </label>
          {error ? <p className="warning">{error}</p> : null}
          <button className="line-btn save-block is-dirty" type="submit" disabled={busy}>{busy ? "Envoi" : "Envoyer"}</button>
        </form>
      )}
    </main>
  );
}
