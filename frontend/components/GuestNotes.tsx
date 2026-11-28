"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Note = { id: string; kind: "book" | "meal"; name: string; message: string; menu: string; createdAt: string };

export function GuestNotes() {
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ notes: Note[] }>("/api/weddings/me/notes")
      .then((body) => setNotes(body.notes))
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Impossible de lire les messages"));
  }, []);

  return (
    <main className="setup">
      <div className="page-tools" style={{ width: "100%", margin: "0 0 28px" }}>
        <a className="line-btn" href="/commencer" style={{ width: "auto", marginTop: 0 }}>Retour</a>
      </div>
      <h1 className="names" style={{ fontSize: "clamp(40px, 8vw, 64px)" }}>Messages</h1>
      <p className="note">Les mots laissés dans le livre d'or. Les invités ne voient pas cette page.</p>
      {error ? <p className="warning">{error}</p> : null}
      {notes === null && !error ? <p className="note">Chargement…</p> : null}
      {notes && notes.length === 0 ? <p className="note">Aucun message pour le moment.</p> : null}
      {notes && notes.length > 0 ? (
        <ul className="note-list">
          {notes.map((note) => (
            <li key={note.id}>
              <strong>{note.name}</strong>
              {note.kind === "meal" && note.menu ? <em>{note.menu}</em> : null}
              {note.message ? <span>{note.message}</span> : null}
              {note.createdAt ? <span className="note">{new Date(note.createdAt).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}
