"use client";

import { useEffect, useMemo, useState } from "react";
import type { WeddingConfig } from "@/wedding.config";
import { Rings } from "@/components/art";
import { PageLoader } from "@/components/Spinner";
import { API, api, driveFileUrl, uploadFiles } from "@/lib/api";
import { applyColors, paletteOf } from "@/lib/theme";
import { coupleLine } from "@/lib/text";

type GuestPhoto = { id: string; name: string };
type DraftPhoto = { key: string; name: string; file?: File; url?: string; error?: string };

const maxPhotoBytes = 20 * 1024 * 1024;

function looksLikePhoto(file: File) {
  const type = file.type.toLowerCase();
  if (type === "image/svg+xml") return false;
  if (type.startsWith("image/")) return true;
  return /\.(jpe?g|png|webp|gif|avif|bmp|heic|heif|tiff?)$/i.test(file.name);
}

function preparePhoto(file: File) {
  const key = `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`;
  if (!looksLikePhoto(file)) {
    return Promise.resolve<DraftPhoto>({
      key,
      name: file.name,
      error: "Format non accepté. Choisissez une photo JPEG, PNG ou WebP.",
    });
  }
  return new Promise<DraftPhoto>((resolve) => {
    const source = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const longest = Math.max(image.naturalWidth, image.naturalHeight) || 1;
      const scale = Math.min(1, 2400 / longest);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(source);
        resolve({ key, name: file.name, error: "Cette photo ne peut pas être préparée." });
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(source);
        if (!blob) {
          resolve({ key, name: file.name, error: "Cette photo ne peut pas être préparée." });
          return;
        }
        const url = URL.createObjectURL(blob);
        if (blob.size > maxPhotoBytes) {
          resolve({ key, name: file.name, url, error: "Cette photo dépasse 20 Mo." });
          return;
        }
        const base = file.name.replace(/\.[^.]+$/, "") || "photo";
        resolve({
          key,
          name: file.name,
          url,
          file: new File([blob], `${base}.jpg`, { type: "image/jpeg" }),
        });
      }, "image/jpeg", 0.86);
    };
    image.onerror = () => {
      URL.revokeObjectURL(source);
      resolve({
        key,
        name: file.name,
        error: "Format non lisible. Enregistrez cette photo en JPEG.",
      });
    };
    image.src = source;
  });
}

export function Album({ slug }: { slug: string }) {
  const [wedding, setWedding] = useState<WeddingConfig | null>(null);
  const [photos, setPhotos] = useState<GuestPhoto[]>([]);
  const [ready, setReady] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<DraftPhoto[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const chosen = useMemo(() => new Set(selected), [selected]);

  async function load() {
    const [site, album] = await Promise.all([
      api<{ config: WeddingConfig }>(`/api/weddings/public/${slug}`),
      api<{ ready: boolean; photos: GuestPhoto[] }>(`/api/drive/public/${slug}/photos`),
    ]);
    setWedding(site.config);
    applyColors(paletteOf(site.config));
    setReady(album.ready);
    setPhotos(album.photos);
    document.title = `${coupleLine(site.config)} — Album`;
  }

  useEffect(() => {
    load().catch((cause) => setError(cause instanceof Error ? cause.message : "Album introuvable"));
  }, [slug]);

  const readyDrafts = drafts.filter((item) => item.file && !item.error);

  async function addDrafts(list: FileList | null) {
    if (!list?.length) return;
    setError("");
    const next: DraftPhoto[] = [];
    for (const file of Array.from(list)) next.push(await preparePhoto(file));
    setDrafts((current) => [...current, ...next]);
  }

  function dropDraft(key: string) {
    setDrafts((current) => {
      const found = current.find((item) => item.key === key);
      if (found?.url) URL.revokeObjectURL(found.url);
      return current.filter((item) => item.key !== key);
    });
  }

  function closeDrafts() {
    for (const draft of drafts) {
      if (draft.url) URL.revokeObjectURL(draft.url);
    }
    setDrafts([]);
  }

  async function publish() {
    if (!readyDrafts.length) return;
    setBusy(true);
    setProgress(0);
    setError("");
    const sent = readyDrafts;
    const sentKeys = new Set<string>();
    try {
      for (let index = 0; index < sent.length; index += 1) {
        const item = sent[index];
        await uploadFiles(`/api/drive/public/${slug}`, [item.file as File], (ratio) => {
          setProgress(Math.round(((index + ratio) / sent.length) * 100));
        });
        sentKeys.add(item.key);
        if (item.url) URL.revokeObjectURL(item.url);
        setProgress(Math.round(((index + 1) / sent.length) * 100));
      }
      setDrafts((current) => current.filter((item) => !sentKeys.has(item.key)));
      setNotice(sent.length > 1 ? `${sent.length} photos sont ajoutées à l'album.` : "La photo est ajoutée à l'album.");
      await load();
    } catch (cause) {
      setDrafts((current) => current.filter((item) => !sentKeys.has(item.key)));
      if (sentKeys.size) await load().catch(() => undefined);
      setError(cause instanceof Error ? cause.message : "Envoi impossible");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  function toggle(id: string) {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  async function downloadSelected() {
    setBusy(true);
    setError("");
    try {
      for (const id of selected) {
        const photo = photos.find((item) => item.id === id);
        const response = await fetch(`${API}/api/drive/files/${id}`);
        if (!response.ok) throw new Error("Téléchargement impossible");
        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = photo?.name || "photo.jpg";
        link.click();
        URL.revokeObjectURL(link.href);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Téléchargement impossible");
    } finally {
      setBusy(false);
    }
  }

  if (!wedding) return error ? <p className="setup">{error}</p> : <PageLoader />;

  return (
    <main className="album">
      <p className="kicker"><a href={`/i/${slug}`}>Retour à l'invitation</a></p>
      <Rings />
      <h1 className="names">{coupleLine(wedding)}</h1>
      <p className="families">Album du mariage</p>
      {notice ? <p className="note">{notice}</p> : null}
      {error ? <p className="warning">{error}</p> : null}
      {!ready ? <p className="prose">Le couple n'a pas encore relié son album. Les photos pourront être ajoutées dès que c'est fait.</p> : null}

      {photos.length === 0 ? (
        <p className="prose">Aucune photo pour le moment. Ajoutez les vôtres.</p>
      ) : (
        <div className="album-grid">
          {photos.map((photo) => (
            <button
              key={photo.id}
              type="button"
              className={chosen.has(photo.id) ? "album-card on" : "album-card"}
              onClick={() => toggle(photo.id)}
              aria-pressed={chosen.has(photo.id)}
            >
              <img src={driveFileUrl(photo.id)} alt={photo.name} />
              <span>{chosen.has(photo.id) ? "Sélectionnée" : "Choisir"}</span>
            </button>
          ))}
        </div>
      )}

      <div className="album-bar">
        <label className="line-btn">
          Ajouter des photos
          <input type="file" accept="image/*" multiple disabled={!ready || busy} onChange={(event) => { addDrafts(event.target.files); event.target.value = ""; }} />
        </label>
        <button className="line-btn" type="button" disabled={!selected.length || busy} onClick={() => void downloadSelected()}>
          Télécharger {selected.length ? `(${selected.length})` : ""}
        </button>
      </div>

      {drafts.length ? (
        <div className="save-popup" role="dialog" aria-modal="true" aria-label="Photos à ajouter">
          <div className="album-dialog">
            <p className="kicker">Avant d'ajouter</p>
            <h2>Vos photos</h2>
            <p className="note">Retirez celles que vous ne voulez pas. Une fois ajoutées, elles restent dans l'album. Celles qui sont signalées ne partent pas.</p>
            {error ? <p className="warning">{error}</p> : null}
            <div className="album-grid">
              {drafts.map((draft) => (
                <figure key={draft.key} className={draft.error ? "album-rejected" : undefined}>
                  {draft.url ? <img src={draft.url} alt={draft.name} /> : <div className="album-rejected-frame">{draft.name}</div>}
                  {draft.error ? <p className="album-reject-note">{draft.error}</p> : null}
                  <button type="button" onClick={() => dropDraft(draft.key)}>Retirer</button>
                </figure>
              ))}
            </div>
            {progress !== null ? (
              <div className="album-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label="Ajout des photos">
                <span className="album-progress-track"><span style={{ width: `${progress}%` }} /></span>
                <span className="album-progress-value">{progress} %</span>
              </div>
            ) : null}
            <div className="album-bar">
              <label className="line-btn">
                Ajouter encore
                <input type="file" accept="image/*" multiple disabled={busy} onChange={(event) => { addDrafts(event.target.files); event.target.value = ""; }} />
              </label>
              <button className="line-btn" type="button" disabled={busy || !readyDrafts.length} onClick={() => void publish()}>
                {busy ? "Ajout…" : `Ajouter${readyDrafts.length ? ` (${readyDrafts.length})` : ""}`}
              </button>
            </div>
            <button className="text-link" type="button" onClick={closeDrafts} disabled={busy}>Annuler</button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
