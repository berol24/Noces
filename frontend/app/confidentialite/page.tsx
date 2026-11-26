import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Règles de confidentialité — Noces",
  description: "Comment Noces utilise le compte Google et les fichiers du mariage.",
};

export default function Confidentialite() {
  return (
    <main className="setup">
      <p className="kicker">Noces</p>
      <h1 className="names" style={{ fontSize: 56 }}>
        Règles de confidentialité
      </h1>
      <p className="prose">
        Noces sert à créer et à partager l'invitation d'un mariage. Le compte créé sur le site garde l'adresse e-mail et le mot de passe choisi, sous forme chiffrée.
      </p>
      <p className="prose">
        Si le couple relie Google Drive, Noces demande uniquement l'accès aux fichiers qu'il crée lui-même dans un dossier du mariage : photos et musique de l'invitation. Noces ne lit pas le reste du Drive et ne vend aucune donnée.
      </p>
      <p className="prose">
        Pour une question sur ces données, écrivez à berolbertindjomo@gmail.com.
      </p>
      <p className="prose">
        <a href="/">Retour à Noces</a>
      </p>
    </main>
  );
}
