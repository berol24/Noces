"use client";

import { useEffect, useState } from "react";
import { useWedding } from "@/components/wedding-context";
import { api } from "@/lib/api";
import { useLocale } from "@/lib/locale";

export function Guestbook() {
  const wedding = useWedding();
  const { lang, t } = useLocale();
  const slug = wedding.drive?.slug || "";
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("livre") === "1") setOpen(true);
  }, []);

  if (!slug) return null;

  const { bride, groom, nameOrder } = wedding.couple;
  const first = (nameOrder === "groom-bride" ? groom : bride).firstName.trim();
  const second = (nameOrder === "groom-bride" ? bride : groom).firstName.trim();
  const couple = [first, second].filter(Boolean);
  const names = couple.join(lang === "fr" ? " et " : " and ");
  const thanks = !names
    ? t("sent")
    : lang === "fr"
      ? `Merci. Votre mot est arrivé jusqu’à ${names}, qui ${couple.length > 1 ? "le liront" : "le lira"} avec beaucoup de joie.`
      : `Thank you. Your note has reached ${names}, who will read it with great joy.`;

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

  return (
    <>
      <button className="guest-book-btn" type="button" onClick={() => setOpen(true)}>
        {t("book")}
      </button>
      {open ? (
        <div className="save-popup" onClick={() => setOpen(false)}>
          <form className="guest-form" onClick={(event) => event.stopPropagation()} onSubmit={(event) => void send(event)}>
            <button className="profile-close" type="button" aria-label={t("close")} onClick={() => setOpen(false)}>×</button>
            <p className="kicker">{t("book")}</p>
            {sent ? (
              <>
                <p className="guest-thanks">{thanks}</p>
                <button className="line-btn save-block is-dirty" type="button" onClick={() => setOpen(false)}>
                  {lang === "fr" ? "Voir l'invitation" : "See the invitation"}
                </button>
              </>
            ) : (
              <>
                <p className="note">{t("bookText")}</p>
                <label className="field">{t("name")}
                  <input required value={name} onChange={(event) => setName(event.target.value)} />
                </label>
                <label className="field">{t("message")}
                  <textarea required rows={4} value={message} onChange={(event) => setMessage(event.target.value)} />
                </label>
                {error ? <p className="warning">{error}</p> : null}
                <button className="line-btn" type="submit" disabled={busy}>{t("send")}</button>
              </>
            )}
          </form>
        </div>
      ) : null}
    </>
  );
}
