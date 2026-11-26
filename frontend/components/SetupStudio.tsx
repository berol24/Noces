"use client";

import { useEffect, useRef, useState } from "react";
import type { DesignId, WeddingConfig } from "@/wedding.config";
import { wedding } from "@/wedding.config";
import { Rings } from "@/components/art";
import { API, api, clearToken, driveFileUrl, ensureAccess, getToken, logoutSession, setSession, uploadFiles } from "@/lib/api";
import { applyColors, customPalette, paletteOf } from "@/lib/theme";
import { blankWedding, designs } from "@/lib/blank";
import { asTime, ceremonyQuery, inviteUrl, mapUrl, shareText, shareTitle } from "@/lib/text";

type Step = "compte" | "design" | "fiche";
type Account = { email: string; name: string };
type Mode = "register" | "login" | "forgot";

function PasswordInput({
  value,
  onChange,
  autoComplete,
  required = true,
}: {
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  required?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="password-field">
      <input
        type={visible ? "text" : "password"}
        required={required}
        minLength={required || value ? 8 : undefined}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <button type="button" aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"} onClick={() => setVisible((current) => !current)}>
        {visible ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 3l18 18M10.5 10.7A3 3 0 0 0 12 15a3 3 0 0 0 2.3-1.1" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 8.5 4.2 9.5 7a12 12 0 0 1-3.2 4.2M6.1 6.3C4.2 7.6 2.8 9.5 2.5 12c.6 1.6 2.2 4 5 5.7" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        )}
      </button>
    </span>
  );
}

const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const weekdays = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

export function SetupStudio() {
  const [step, setStep] = useState<Step>("compte");
  const [mode, setMode] = useState<Mode>("register");
  const [confirm, setConfirm] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [draft, setDraft] = useState<WeddingConfig>(() => blankWedding("classique"));
  const [dateValue, setDateValue] = useState("2026-06-27");
  const [timeValue, setTimeValue] = useState("09:00");
  const [slug, setSlug] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [driveConnected, setDriveConnected] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);
  const [folderUrl, setFolderUrl] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [popup, setPopup] = useState("");
  const [copied, setCopied] = useState(false);
  const musicRef = useRef<HTMLAudioElement>(null);

  function applySavedDate(iso: string) {
    const match = iso.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
    if (!match) return;
    setDateValue(match[1]);
    setTimeValue(match[2]);
  }

  async function loadSession() {
    const [me, saved] = await Promise.all([
      api<{ user: Account }>("/api/auth/me"),
      api<{ wedding: { slug: string; designId: DesignId; config: WeddingConfig } | null }>("/api/weddings/me"),
    ]);
    setAccount(me.user);
    setProfileName(me.user.name || "");
    setProfileEmail(me.user.email);
    if (new URLSearchParams(window.location.search).get("reset")) {
      setStep("compte");
      return;
    }
    if (saved.wedding?.config) {
      setDraft({ ...saved.wedding.config, designId: saved.wedding.designId });
      setSlug(saved.wedding.slug);
      applySavedDate(saved.wedding.config.date?.iso || "");
      applyColors(paletteOf(saved.wedding.config));
      setStep("fiche");
    } else {
      setStep("design");
    }
  }

  function logout() {
    void logoutSession();
    setAccount(null);
    setSlug("");
    setFolderUrl("");
    setDraft(blankWedding("classique"));
    setDateValue("2026-06-27");
    setTimeValue("09:00");
    setMessage("");
    setError("");
    setProfileOpen(false);
    setEditingProfile(false);
    setProfileName("");
    setProfileEmail("");
    setProfilePassword("");
    setPopup("");
    setStep("compte");
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("drive") === "connected") {
      setDriveConnected(true);
      setMessage("Google Drive est connecté. Le bouton des photos ouvrira le dossier de ce mariage.");
    }
    if (params.get("drive") === "error") {
      setError(params.get("message") || "Google Drive n'a pas pu être connecté.");
    }
    if (params.get("profil") === "1") setProfileOpen(true);
    const reset = params.get("reset");
    if (reset) {
      setResetToken(reset);
      setMode("login");
      setStep("compte");
    }
  }, []);

  useEffect(() => {
    if (!getToken()) return;
    loadSession().catch(() => {
      clearToken();
      setAccount(null);
    });
    api<{ configured: boolean; connected: boolean }>("/api/drive/status")
      .then((body) => setDriveConnected(body.connected))
      .catch(() => setDriveConnected(false));
  }, []);

  useEffect(() => {
    if (!driveConnected || !slug || !getToken()) return;
    api<{ url: string }>("/api/drive/me/link")
      .then((body) => setFolderUrl(body.url))
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Dossier Drive impossible"));
  }, [driveConnected, slug]);

  function applyDate(next: WeddingConfig, day = dateValue, time = timeValue) {
    if (!day) return next;
    const parsed = new Date(`${day}T${time || "09:00"}:00`);
    if (Number.isNaN(parsed.getTime())) return next;
    const [year, monthNumber, dayNumber] = day.split("-");
    next.date = {
      ...next.date,
      iso: `${day}T${time || "09:00"}:00+01:00`,
      endIso: `${day}T22:00:00+01:00`,
      year,
      monthNumber,
      day: String(Number(dayNumber)),
      month: months[parsed.getMonth()],
      weekday: weekdays[parsed.getDay()],
    };
    return next;
  }

  async function submitAccount(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (resetToken || mode === "forgot") {
        if (password !== confirm) throw new Error("Les deux mots de passe sont différents");
        if (resetToken) {
          await api("/api/auth/reset", { method: "POST", body: JSON.stringify({ token: resetToken, email, password }) });
          setResetToken("");
          window.history.replaceState({}, "", "/");
        } else {
          await api("/api/auth/password", { method: "POST", body: JSON.stringify({ email, password }) });
        }
        setPassword("");
        setConfirm("");
        setMode("login");
        setMessage("Mot de passe modifié. Vous pouvez vous connecter.");
        return;
      }
      const path = mode === "register" ? "/api/auth/register" : "/api/auth/login";
      const body = await api<{ token?: string; accessToken?: string; refreshToken?: string }>(path, {
        method: "POST",
        body: JSON.stringify({ email, password, name }),
      });
      setSession(body);
      await loadSession();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Connexion impossible");
    } finally {
      setBusy(false);
    }
  }

  function chooseDesign(id: DesignId) {
    setDraft((current) => ({ ...current, designId: id }));
  }

  async function connectDrive() {
    setError("");
    try {
      const status = await api<{ configured: boolean; connected: boolean }>("/api/drive/status");
      if (!status.configured) {
        setError("Ajoutez GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET dans backend/.env, puis redémarrez l'API.");
        return;
      }
      const token = await ensureAccess();
      window.location.href = `${API}/api/drive/connect?token=${encodeURIComponent(token || "")}`;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Connexion à Google Drive impossible");
    }
  }

  async function uploadOne(file: File | undefined, apply: (url: string) => void, kind: "photo" | "musique" = "photo") {
    if (!file) return;
    if (!slug || !driveConnected) {
      setError(
        kind === "musique"
          ? "Enregistrez la fiche et connectez Google Drive avant d'ajouter la musique."
          : "Enregistrez la fiche et connectez Google Drive avant d'ajouter une photo.",
      );
      return;
    }
    setBusy(true);
    setError("");
    try {
      const body = await uploadFiles<{ photos: { id: string }[] }>("/api/drive/me", [file]);
      const id = body.photos[0]?.id;
      if (id) apply(driveFileUrl(id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Envoi impossible");
    } finally {
      setBusy(false);
    }
  }

  async function addGallery(list: FileList | null) {
    if (!list?.length) return;
    if (!slug || !driveConnected) {
      setError("Enregistrez la fiche et connectez Google Drive avant d'ajouter des photos.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const body = await uploadFiles<{ photos: { id: string }[] }>("/api/drive/me", Array.from(list));
      const added = body.photos.map((photo) => ({ src: driveFileUrl(photo.id), alt: "", place: "" }));
      setDraft((current) => ({
        ...current,
        photos: {
          ...current.photos,
          gallery: [...current.photos.gallery.filter((item) => item.src), ...added],
        },
      }));
      setMessage("Photos ajoutées. Écrivez le lieu sous chacune, puis enregistrez.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Envoi impossible");
    } finally {
      setBusy(false);
    }
  }

  function pickPalette(id: string) {
    const colors = wedding.themes.find((theme) => theme.id === id)?.colors ?? draft.colors;
    const next = { ...draft, colorChoice: id, colors };
    setDraft(next);
    applyColors(colors);
  }

  function paintCustom(patch: Partial<WeddingConfig["colors"]>) {
    const colors = customPalette(
      patch.background || draft.colors.background,
      patch.text || draft.colors.text,
      patch.accent || draft.colors.accent,
    );
    setDraft({ ...draft, colorChoice: "personnalise", colors });
    applyColors(colors);
  }

  async function save() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const config = applyDate(structuredClone(draft));
      config.designId = draft.designId;
      config.photos.signature = `${config.couple.groom.firstName} & ${config.couple.bride.firstName}`.trim();
      config.ceremonies = config.ceremonies.map((ceremony) => ({
        ...ceremony,
        mapQuery: ceremonyQuery(ceremony, config),
      }));
      config.gifts.enabled = Boolean(config.gifts.text.trim() || config.gifts.footnote.trim());
      config.music.background.enabled = Boolean(config.music.background.src);
      config.guestAlbum = {
        ...config.guestAlbum,
        enabled: Boolean(config.guestAlbum.href.trim()),
        href: config.guestAlbum.href.trim(),
      };
      const saved = await api<{ slug: string }>("/api/weddings/me", {
        method: "PUT",
        body: JSON.stringify({ designId: config.designId, config }),
      });
      setSlug(saved.slug);
      setDraft(config);
      if (driveConnected) {
        const link = await api<{ url: string }>("/api/drive/me/link");
        setFolderUrl(link.url);
      }
      setPopup(
        config.guestAlbum.href
          ? "Votre invitation est enregistrée. « Ajouter mes photos » ouvre votre album Google Photos, avec les photos déjà présentes."
          : "Votre invitation est enregistrée. Ajoutez encore le lien de votre album Google Photos pour que les invités voient et déposent les photos.",
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Enregistrement impossible");
    } finally {
      setBusy(false);
    }
  }

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const body = await api<{ user: Account; token?: string; accessToken?: string; refreshToken?: string }>("/api/auth/me", {
        method: "PATCH",
        body: JSON.stringify({
          name: profileName,
          email: profileEmail,
          ...(profilePassword ? { password: profilePassword } : {}),
        }),
      });
      setSession(body);
      setAccount(body.user);
      setProfileName(body.user.name || "");
      setProfileEmail(body.user.email);
      setProfilePassword("");
      setEditingProfile(false);
      setPopup("Profil mis à jour.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Profil impossible à enregistrer");
    } finally {
      setBusy(false);
    }
  }

  function shareLinks() {
    const url = inviteUrl(slug);
    const title = shareTitle(draft);
    const text = `${title}\n${shareText(draft)}\n${url}`;
    return {
      url,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
      mail: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      sms: `sms:?&body=${encodeURIComponent(text)}`,
    };
  }

  async function copyInvite() {
    await navigator.clipboard.writeText(inviteUrl(slug));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className={step === "compte" ? "setup setup-account" : "setup"}>
      <button className="profile-btn" type="button" aria-label="Profil" onClick={() => setProfileOpen((open) => !open)}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M5.5 19c1.4-3 3.6-4.5 6.5-4.5s5.1 1.5 6.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </button>
      {profileOpen ? (
        <div className="profile-panel">
          {account ? (
            <>
              <p className="kicker">Profil</p>
              {editingProfile ? (
                <form onSubmit={(event) => void saveProfile(event)}>
                  <label className="field">Nom
                    <input value={profileName} onChange={(event) => setProfileName(event.target.value)} />
                  </label>
                  <label className="field">E-mail
                    <input type="email" required value={profileEmail} onChange={(event) => setProfileEmail(event.target.value)} />
                  </label>
                  <label className="field">Nouveau mot de passe
                    <PasswordInput value={profilePassword} autoComplete="new-password" required={false} onChange={setProfilePassword} />
                  </label>
                  <p className="note">L'e-mail reste unique. Laissez le mot de passe vide pour le garder.</p>
                  {error ? <p className="warning">{error}</p> : null}
                  <button className="line-btn" type="submit" disabled={busy}>{busy ? "Patientez" : "Enregistrer le profil"}</button>
                  <button className="text-link" type="button" onClick={() => { setEditingProfile(false); setError(""); }}>Annuler</button>
                </form>
              ) : (
                <>
                  <p>{account.name || "Compte"}</p>
                  <p className="note">{account.email}</p>
                  <button className="line-btn" type="button" onClick={() => { setProfileName(account.name || ""); setProfileEmail(account.email); setEditingProfile(true); setError(""); }}>
                    Modifier le profil
                  </button>
                  <button className="line-btn" type="button" onClick={() => { setStep(slug ? "fiche" : "design"); setProfileOpen(false); }}>
                    Modifier ma fiche
                  </button>
                  <button className="line-btn" type="button" onClick={logout}>Se déconnecter</button>
                </>
              )}
            </>
          ) : (
            <>
              <p className="kicker">Profil</p>
              <p className="note">Connectez-vous pour retrouver votre mariage.</p>
              <button className="line-btn" type="button" onClick={() => { setMode("login"); setStep("compte"); setProfileOpen(false); }}>
                Se connecter
              </button>
              <button className="line-btn" type="button" onClick={() => { setMode("register"); setStep("compte"); setProfileOpen(false); }}>
                Créer un compte
              </button>
            </>
          )}
        </div>
      ) : null}
      {step === "compte" ? (
        <>
          <p className="kicker">Noces</p>
          <Rings />
          <h1 className="names account-title">
            {resetToken || mode === "forgot" ? "Mot de passe" : mode === "login" ? "Connexion" : "Inscription"}
          </h1>
          <p className="prose">
            {resetToken || mode === "forgot"
              ? "Choisissez un nouveau mot de passe pour le compte déjà enregistré."
              : mode === "login"
                ? "Retrouvez l'invitation enregistrée sur votre compte."
                : "Un compte pour le couple. L'invitation reste la vôtre."}
          </p>
        </>
      ) : (
        <>
          <p className="kicker">Noces</p>
          <h1 className="names" style={{ fontSize: 64 }}>Créer l'invitation</h1>
          <p className="prose">Le design se choisit au départ. La fiche est enregistrée pour votre compte.</p>
        </>
      )}

      {step === "compte" ? (
        <form onSubmit={submitAccount} className="setup-card account-card">
          {resetToken ? null : (
            <div className="people">
              <button type="button" aria-pressed={mode === "register"} onClick={() => setMode("register")}>Créer un compte</button>
              <button type="button" aria-pressed={mode === "login"} onClick={() => setMode("login")}>Se connecter</button>
            </div>
          )}
          {resetToken || mode === "forgot" ? (
            <>
              <p className="note">Indiquez l'e-mail déjà enregistré. Il est unique : seul le mot de passe de ce compte est remplacé.</p>
              <label className="field">E-mail du compte
                <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
              </label>
              <label className="field">Nouveau mot de passe
                <PasswordInput value={password} autoComplete="new-password" onChange={setPassword} />
              </label>
              <label className="field">Confirmer le mot de passe
                <PasswordInput value={confirm} autoComplete="new-password" onChange={setConfirm} />
              </label>
              {resetToken ? null : (
                <button className="text-link" type="button" onClick={() => { setMode("login"); setError(""); }}>
                  Retour à la connexion
                </button>
              )}
            </>
          ) : (
            <>
              {mode === "register" ? (
                <label className="field">Votre nom
                  <input value={name} onChange={(event) => setName(event.target.value)} />
                </label>
              ) : null}
              <label className="field">Email
                <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
              </label>
              <label className="field">Mot de passe
                <PasswordInput value={password} autoComplete={mode === "register" ? "new-password" : "current-password"} onChange={setPassword} />
              </label>
              {mode === "login" ? (
                <button className="text-link" type="button" onClick={() => { setMode("forgot"); setError(""); setMessage(""); }}>
                  Mot de passe oublié
                </button>
              ) : null}
            </>
          )}
          {error ? <p className="warning">{error}</p> : null}
          {message ? <p className="note">{message}</p> : null}
          <button className="line-btn" type="submit" disabled={busy}>
            {busy ? "Patientez" : resetToken || mode === "forgot" ? "Changer le mot de passe" : mode === "login" ? "Se connecter" : "Créer le compte"}
          </button>
        </form>
      ) : null}

      {step === "design" ? (
        <section>
          <h2>Choisir le design</h2>
          <div className="design-grid">
            {designs.map((design) => (
              <button
                key={design.id}
                type="button"
                className={draft.designId === design.id ? "design-card on" : "design-card"}
                onClick={() => chooseDesign(design.id)}
              >
                <strong>{design.name}</strong>
                <span>{design.text}</span>
              </button>
            ))}
          </div>
          <button className="line-btn" type="button" onClick={() => setStep("fiche")}>Renseigner le mariage</button>
        </section>
      ) : null}

      {step === "fiche" ? (
        <section>
          <button className="hint" type="button" onClick={() => setStep("design")} style={{ background: "none", border: 0, cursor: "pointer" }}>
            Design : {designs.find((item) => item.id === draft.designId)?.name}
          </button>
          <h2>Le couple</h2>
          <div className="setup-grid">
            <label className="field">Prénom de la mariée
              <input value={draft.couple.bride.firstName} onChange={(event) => setDraft({ ...draft, couple: { ...draft.couple, bride: { ...draft.couple.bride, firstName: event.target.value } } })} />
            </label>
            <label className="field">Nom de la mariée
              <input value={draft.couple.bride.lastName} onChange={(event) => setDraft({ ...draft, couple: { ...draft.couple, bride: { ...draft.couple.bride, lastName: event.target.value } } })} />
            </label>
            <label className="field">Prénom du marié
              <input value={draft.couple.groom.firstName} onChange={(event) => setDraft({ ...draft, couple: { ...draft.couple, groom: { ...draft.couple.groom, firstName: event.target.value } } })} />
            </label>
            <label className="field">Nom du marié
              <input value={draft.couple.groom.lastName} onChange={(event) => setDraft({ ...draft, couple: { ...draft.couple, groom: { ...draft.couple.groom, lastName: event.target.value } } })} />
            </label>
            <label className="field">Initiale du haut
              <input value={draft.couple.monogram.top} onChange={(event) => setDraft({ ...draft, couple: { ...draft.couple, monogram: { ...draft.couple.monogram, top: event.target.value } } })} />
            </label>
            <label className="field">Initiale du bas
              <input value={draft.couple.monogram.bottom} onChange={(event) => setDraft({ ...draft, couple: { ...draft.couple, monogram: { ...draft.couple.monogram, bottom: event.target.value } } })} />
            </label>
            <label className="field">Famille 1
              <input value={draft.families[0] || ""} onChange={(event) => setDraft({ ...draft, families: [event.target.value, draft.families[1] || ""] })} />
            </label>
            <label className="field">Famille 2
              <input value={draft.families[1] || ""} onChange={(event) => setDraft({ ...draft, families: [draft.families[0] || "", event.target.value] })} />
            </label>
          </div>

          <h2>Google Drive</h2>
          <p className="note">
            Reliez votre Google Drive pour les photos et la musique du site (photo d'arrivée, galerie, textes). L'album des invités, lui, est un album Google Photos partagé, plus bas.
          </p>
          <button className="line-btn" type="button" onClick={() => void connectDrive()} disabled={busy}>
            {driveConnected ? "Reconnecter Google Drive" : "Connecter mon Google Drive"}
          </button>
          {driveConnected ? (
            <p className="note">
              {folderUrl
                ? `Drive lié. Dossier de ce mariage : ${folderUrl}`
                : slug
                  ? "Drive lié. Enregistrez la fiche pour créer le dossier de ce mariage."
                  : "Drive lié. Enregistrez la fiche, puis les fichiers iront dans votre Drive."}
            </p>
          ) : (
            <p className="warning">Sans Drive, les photos et la musique du site ne peuvent pas être enregistrées.</p>
          )}

          <h2>Date du mariage</h2>
          <p className="note">Cette date lance le compte à rebours et l'ajout à l'agenda.</p>
          <div className="setup-grid">
            <label className="field">Jour du mariage
              <input type="date" value={dateValue} onChange={(event) => setDateValue(event.target.value)} />
            </label>
            <label className="field">Heure de début
              <input type="time" value={timeValue} onChange={(event) => setTimeValue(event.target.value)} />
            </label>
            <label className="field">Ville
              <input value={draft.date.city} onChange={(event) => setDraft({ ...draft, date: { ...draft.date, city: event.target.value } })} />
            </label>
            <label className="field">Pays
              <input value={draft.date.country} onChange={(event) => setDraft({ ...draft, date: { ...draft.date, country: event.target.value } })} />
            </label>
          </div>

          <h2>Lieux et carte</h2>
          <p className="note">L'adresse ouvre « Voir sur la carte » pour les invités. Un lien Google Maps reste possible.</p>
          {draft.ceremonies.map((ceremony, index) => {
            const query = ceremonyQuery(ceremony, draft);
            return (
              <div className="setup-card" key={`ceremony-${index}`}>
                <div className="setup-grid">
                  <label className="field">Nom
                    <input value={ceremony.title} onChange={(event) => updateCeremony(index, { title: event.target.value })} />
                  </label>
                  <label className="field">Heure
                    <input type="time" value={asTime(ceremony.time)} onChange={(event) => updateCeremony(index, { time: event.target.value })} />
                  </label>
                  <label className="field">Lieu
                    <input value={ceremony.venue} onChange={(event) => updateCeremony(index, { venue: event.target.value })} />
                  </label>
                  <label className="field">Adresse
                    <input value={ceremony.address} onChange={(event) => updateCeremony(index, { address: event.target.value })} />
                  </label>
                </div>
                <label className="field">Lien Google Maps, si vous en avez un
                  <input value={/^https?:\/\//i.test(ceremony.mapQuery) ? ceremony.mapQuery : ""} onChange={(event) => updateCeremony(index, { mapQuery: event.target.value })} />
                </label>
                {query ? (
                  <a href={mapUrl(query)} target="_blank" rel="noreferrer">Voir sur la carte</a>
                ) : (
                  <p className="note">Indiquez l'adresse pour afficher la carte.</p>
                )}
              </div>
            );
          })}
          <button className="text-link" type="button" onClick={() => setDraft({ ...draft, ceremonies: [...draft.ceremonies, { title: "", time: "", venue: "", address: "", mapQuery: "" }] })}>
            Ajouter un lieu
          </button>

          <h2>Photo d'arrivée</h2>
          <p className="note">Elle apparaît sur le premier écran, avant d'entrer dans la cérémonie. Vous pouvez la remplacer.</p>
          <label className="field">Photo
            <input type="file" accept="image/*" disabled={!driveConnected || !slug || busy} onChange={(event) => { void uploadOne(event.target.files?.[0], (url) => setDraft((current) => ({ ...current, entrance: { ...current.entrance, photo: url } }))); event.target.value = ""; }} />
          </label>
          {draft.entrance.photo ? (
            <div className="photo-edit">
              <img className="entrance-preview" src={draft.entrance.photo} alt="" />
              <button className="text-link" type="button" onClick={() => setDraft({ ...draft, entrance: { ...draft.entrance, photo: "" } })}>Retirer</button>
            </div>
          ) : null}

          <h2>Textes</h2>
          <p className="note">Chaque texte peut avoir une photo. Sur l'invitation, elles se placent différemment : au-dessus, à gauche, à droite, puis à côté du verset.</p>
          <label className="field">Phrase du faire-part
            <textarea rows={3} value={draft.invitation} onChange={(event) => setDraft({ ...draft, invitation: event.target.value })} />
          </label>
          <label className="field">Photo de la phrase
            <input type="file" accept="image/*" disabled={!driveConnected || !slug || busy} onChange={(event) => { void uploadOne(event.target.files?.[0], (url) => setDraft((current) => ({ ...current, invitationPhoto: url }))); event.target.value = ""; }} />
          </label>
          {draft.invitationPhoto ? <img src={draft.invitationPhoto} alt="" style={{ width: "100%", maxHeight: 160, objectFit: "cover", marginTop: 8 }} /> : null}
          <label className="field">Citation du marié
            <textarea rows={2} value={draft.story.passages[0]?.quote || ""} onChange={(event) => updatePassage(0, { quote: event.target.value })} />
          </label>
          <label className="field">Texte du marié
            <textarea rows={3} value={draft.story.passages[0]?.text || ""} onChange={(event) => updatePassage(0, { text: event.target.value })} />
          </label>
          <label className="field">Photo du marié
            <input type="file" accept="image/*" disabled={!driveConnected || !slug || busy} onChange={(event) => { void uploadOne(event.target.files?.[0], (url) => setDraft((current) => ({ ...current, story: { ...current.story, passages: current.story.passages.map((item, index) => index === 0 ? { ...item, photo: url } : item) } }))); event.target.value = ""; }} />
          </label>
          {draft.story.passages[0]?.photo ? <img src={draft.story.passages[0].photo} alt="" style={{ width: "100%", maxHeight: 160, objectFit: "cover", marginTop: 8 }} /> : null}
          <label className="field">Citation de la mariée
            <textarea rows={2} value={draft.story.passages[1]?.quote || ""} onChange={(event) => updatePassage(1, { quote: event.target.value })} />
          </label>
          <label className="field">Texte de la mariée
            <textarea rows={3} value={draft.story.passages[1]?.text || ""} onChange={(event) => updatePassage(1, { text: event.target.value })} />
          </label>
          <label className="field">Photo de la mariée
            <input type="file" accept="image/*" disabled={!driveConnected || !slug || busy} onChange={(event) => { void uploadOne(event.target.files?.[0], (url) => setDraft((current) => ({ ...current, story: { ...current.story, passages: current.story.passages.map((item, index) => index === 1 ? { ...item, photo: url } : item) } }))); event.target.value = ""; }} />
          </label>
          {draft.story.passages[1]?.photo ? <img src={draft.story.passages[1].photo} alt="" style={{ width: "100%", maxHeight: 160, objectFit: "cover", marginTop: 8 }} /> : null}
          <label className="field">Verset
            <textarea rows={2} value={draft.verse.text} onChange={(event) => setDraft({ ...draft, verse: { ...draft.verse, text: event.target.value } })} />
          </label>
          <label className="field">Référence du verset
            <input value={draft.verse.reference} onChange={(event) => setDraft({ ...draft, verse: { ...draft.verse, reference: event.target.value } })} />
          </label>
          <label className="field">Photo du verset
            <input type="file" accept="image/*" disabled={!driveConnected || !slug || busy} onChange={(event) => { void uploadOne(event.target.files?.[0], (url) => setDraft((current) => ({ ...current, verse: { ...current.verse, photo: url } }))); event.target.value = ""; }} />
          </label>
          {draft.verse.photo ? <img src={draft.verse.photo} alt="" style={{ width: "100%", maxHeight: 160, objectFit: "cover", marginTop: 8 }} /> : null}

          <h2>Programme</h2>
          {draft.program.items.map((item, index) => (
            <div className="setup-grid" key={`program-${index}`}>
              <label className="field">Heure
                <input type="time" value={asTime(item.time)} onChange={(event) => updateProgram(index, { time: event.target.value })} />
              </label>
              <label className="field">Étape
                <input value={item.title} onChange={(event) => updateProgram(index, { title: event.target.value })} />
              </label>
            </div>
          ))}
          <button className="hint" type="button" onClick={() => setDraft({ ...draft, program: { ...draft.program, items: [...draft.program.items, { time: "", title: "", icon: "✦", highlight: false }] } })} style={{ background: "none", border: 0, cursor: "pointer" }}>
            Ajouter une étape
          </button>

          <h2>Couleurs du site</h2>
          <p className="note">Ces palettes colorent toute l'invitation. Elles sont séparées des couleurs de tenue.</p>
          <div className="palette-grid">
            {wedding.themes.map((theme) => (
              <button key={theme.id} type="button" className={draft.colorChoice === theme.id ? "on" : ""} onClick={() => pickPalette(theme.id)}>
                <span style={{ background: theme.colors.accent }} />
                {theme.name}
              </button>
            ))}
          </div>
          <div className="color-picks">
            <label className="field">Fond
              <input type="color" value={draft.colors.background} onChange={(event) => paintCustom({ background: event.target.value })} />
            </label>
            <label className="field">Texte
              <input type="color" value={draft.colors.text} onChange={(event) => paintCustom({ text: event.target.value })} />
            </label>
            <label className="field">Accent
              <input type="color" value={draft.colors.accent} onChange={(event) => paintCustom({ accent: event.target.value })} />
            </label>
          </div>

          <h2>Dress code</h2>
          <p className="note">Choisissez une couleur, puis écrivez son nom en dessous. Les invités s'en servent pour se repérer.</p>
          <label className="field">Consigne
            <textarea rows={2} value={draft.dressCode.text} onChange={(event) => setDraft({ ...draft, dressCode: { ...draft.dressCode, enabled: true, text: event.target.value } })} />
          </label>
          {draft.dressCode.colors.map((color, index) => (
            <div className="dress-row" key={`dress-${index}`}>
              <input type="color" aria-label={`Couleur ${index + 1}`} value={color.hex} onChange={(event) => updateDressColor(index, { hex: event.target.value })} />
              <label className="field">Nom de la couleur
                <input value={color.name} onChange={(event) => updateDressColor(index, { name: event.target.value })} />
              </label>
              <button className="text-link" type="button" onClick={() => updateDressColor(index, null)}>Retirer</button>
            </div>
          ))}
          <button className="text-link" type="button" onClick={() => setDraft({ ...draft, dressCode: { ...draft.dressCode, enabled: true, colors: [...draft.dressCode.colors, { name: "", hex: "#1b3a5f" }] } })}>
            Ajouter une couleur
          </button>

          <h2>Photos affichées</h2>
          <p className="note">
            {driveConnected && slug
              ? "Ces photos s'affichent sur l'invitation et sont stockées dans votre Drive. Indiquez le lieu sous chacune. Vous pouvez les remplacer."
              : "Connectez votre Google Drive et enregistrez la fiche, puis ajoutez les photos. Chaque couple a son propre dossier."}
          </p>
          <label className="field">Photo principale
            <input type="file" accept="image/*" disabled={!driveConnected || !slug || busy} onChange={(event) => { void uploadOne(event.target.files?.[0], (url) => setDraft((current) => ({ ...current, photos: { ...current.photos, hero: { src: url, alt: "Photo du couple" } } }))); event.target.value = ""; }} />
          </label>
          {draft.photos.hero.src ? (
            <div className="photo-edit">
              <img src={draft.photos.hero.src} alt="" />
              <button className="text-link" type="button" onClick={() => setDraft({ ...draft, photos: { ...draft.photos, hero: { src: "", alt: "" } } })}>Retirer</button>
            </div>
          ) : null}
          <label className="field">Autres photos
            <input type="file" accept="image/*" multiple disabled={!driveConnected || !slug || busy} onChange={(event) => { void addGallery(event.target.files); event.target.value = ""; }} />
          </label>
          {draft.photos.gallery.map((photo, index) => photo.src ? (
            <div className="photo-edit" key={`${photo.src}-${index}`}>
              <img src={photo.src} alt="" />
              <label className="field">Lieu de la photo
                <input value={photo.place || ""} onChange={(event) => updateGallery(index, event.target.value)} />
              </label>
              <label className="field">Remplacer
                <input type="file" accept="image/*" disabled={!driveConnected || !slug || busy} onChange={(event) => { void uploadOne(event.target.files?.[0], (url) => replaceGallery(index, url)); event.target.value = ""; }} />
              </label>
              <button className="text-link" type="button" onClick={() => removeGallery(index)}>Retirer</button>
            </div>
          ) : null)}
          {!driveConnected || !slug ? <p className="note">Connectez Google Drive et enregistrez la fiche avant d'envoyer les photos du site.</p> : null}

          <h2>Album Google Photos des invités</h2>
          <p className="note">
            Comme sur l'invitation de Jessica et Magloire : les invités ouvrent l'album, voient les photos déjà là, et cliquent sur « Add photos ». Dans Google Photos : Nouvel album → Partager → Créer un lien → autoriser les autres à ajouter des photos. Collez ensuite le lien photos.app.goo.gl.
          </p>
          <label className="field">Lien de l'album partagé
            <input
              type="url"
              placeholder="https://photos.app.goo.gl/…"
              value={draft.guestAlbum.href}
              onChange={(event) => setDraft({ ...draft, guestAlbum: { ...draft.guestAlbum, href: event.target.value, enabled: true } })}
            />
          </label>
          {draft.guestAlbum.href ? (
            <p className="note">
              Aperçu : <a href={draft.guestAlbum.href} target="_blank" rel="noreferrer">ouvrir l'album</a>
            </p>
          ) : null}

          <h2>Cadeaux</h2>
          <label className="field">Message pour expliquer comment offrir un cadeau
            <textarea rows={3} value={draft.gifts.text} onChange={(event) => setDraft({ ...draft, gifts: { ...draft.gifts, text: event.target.value } })} />
          </label>

          <h2>Musique de fond</h2>
          <p className="note">Le fichier est enregistré dans votre Google Drive. Connectez d'abord votre compte Google. Vous pouvez le remplacer. Sur l'invitation, lecture et pause sont à gauche.</p>
          <label className="field">Fichier musical
            <input type="file" accept="audio/*" disabled={!driveConnected || !slug || busy} onChange={(event) => { void uploadOne(event.target.files?.[0], (url) => setDraft((current) => ({ ...current, music: { ...current.music, background: { enabled: true, src: url } } })), "musique"); event.target.value = ""; }} />
          </label>
          {draft.music.background.src ? (
            <div className="music-actions">
              <audio ref={musicRef} src={draft.music.background.src} preload="none" />
              <button className="line-btn" type="button" onClick={() => void musicRef.current?.play()}>Lecture</button>
              <button className="line-btn" type="button" onClick={() => musicRef.current?.pause()}>Pause</button>
              <button className="text-link" type="button" onClick={() => setDraft({ ...draft, music: { ...draft.music, background: { enabled: false, src: "" } } })}>Retirer</button>
            </div>
          ) : null}

          {error ? <p className="warning">{error}</p> : null}
          {message ? <p className="note">{message}</p> : null}
          <button className="line-btn" type="button" onClick={() => void save()} disabled={busy}>
            {busy ? "Enregistrement" : "Enregistrer"}
          </button>
          {slug ? (
            <>
              <p className="prose">
                Invitation : <a href={`/i/${slug}`}>/i/{slug}</a>
              </p>
              <p className="note">Ce lien ouvre seulement l'invitation. Personne n'entre dans votre compte.</p>
              <div className="share-row">
                <a href={shareLinks().whatsapp} target="_blank" rel="noreferrer">WhatsApp</a>
                <a href={shareLinks().mail}>E-mail</a>
                <a href={shareLinks().facebook} target="_blank" rel="noreferrer">Facebook</a>
                <a href={shareLinks().sms}>SMS</a>
                <button type="button" onClick={() => void copyInvite()}>Copier le lien</button>
              </div>
            </>
          ) : null}
        </section>
      ) : null}
      {popup ? (
        <div className="save-popup" role="dialog" aria-modal="true" aria-label="Enregistrement">
          <div>
            <p className="kicker">Enregistré</p>
            <p className="prose">{popup}</p>
            {slug ? (
              <>
                <p className="note">{inviteUrl(slug)}</p>
                <a className="line-btn" href={`/i/${slug}`}>Voir l'invitation</a>
                <div className="share-row">
                  <a href={shareLinks().whatsapp} target="_blank" rel="noreferrer">WhatsApp</a>
                  <a href={shareLinks().mail}>E-mail</a>
                  <a href={shareLinks().facebook} target="_blank" rel="noreferrer">Facebook</a>
                  <a href={shareLinks().sms}>SMS</a>
                  <button type="button" onClick={() => void copyInvite()}>Copier le lien</button>
                </div>
              </>
            ) : null}
            <button className="text-link" type="button" onClick={() => setPopup("")}>Fermer</button>
          </div>
        </div>
      ) : null}
      {copied ? <p className="toast">Lien copié</p> : null}
    </div>
  );

  function updateCeremony(index: number, patch: Partial<WeddingConfig["ceremonies"][number]>) {
    const ceremonies = draft.ceremonies.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item));
    setDraft({ ...draft, ceremonies });
  }

  function updatePassage(index: number, patch: Partial<WeddingConfig["story"]["passages"][number]>) {
    const passages = draft.story.passages.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item));
    setDraft({ ...draft, story: { ...draft.story, passages } });
  }

  function updateProgram(index: number, patch: Partial<WeddingConfig["program"]["items"][number]>) {
    const items = draft.program.items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item));
    setDraft({ ...draft, program: { ...draft.program, items } });
  }

  function updateDressColor(index: number, patch: Partial<WeddingConfig["dressCode"]["colors"][number]> | null) {
    const colors = patch
      ? draft.dressCode.colors.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item))
      : draft.dressCode.colors.filter((_, itemIndex) => itemIndex !== index);
    setDraft({ ...draft, dressCode: { ...draft.dressCode, enabled: true, colors } });
  }

  function updateGallery(index: number, place: string) {
    const gallery = draft.photos.gallery.map((item, itemIndex) =>
      itemIndex === index ? { ...item, place, alt: place || item.alt } : item,
    );
    setDraft({ ...draft, photos: { ...draft.photos, gallery } });
  }

  function replaceGallery(index: number, src: string) {
    const gallery = draft.photos.gallery.map((item, itemIndex) => (itemIndex === index ? { ...item, src } : item));
    setDraft({ ...draft, photos: { ...draft.photos, gallery } });
  }

  function removeGallery(index: number) {
    const gallery = draft.photos.gallery.filter((_, itemIndex) => itemIndex !== index);
    setDraft({ ...draft, photos: { ...draft.photos, gallery } });
  }
}
