"use client";

import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import type { WeddingConfig } from "@/wedding.config";
import { api } from "@/lib/api";
import { coupleLine, messageUrl } from "@/lib/text";

function prettyNames(config: WeddingConfig) {
  const line = coupleLine(config).replace(/\s+&\s+/, " et ").trim();
  return line.replace(/^et$/, "").trim();
}

export function QrCard() {
  const [config, setConfig] = useState<WeddingConfig | null>(null);
  const [slug, setSlug] = useState("");
  const [qr, setQr] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ wedding: { slug: string; config: WeddingConfig } | null }>("/api/weddings/me")
      .then(async (body) => {
        if (!body.wedding?.slug) {
          setError("Enregistrez d'abord la fiche pour obtenir le lien de l'invitation.");
          return;
        }
        const url = messageUrl(body.wedding.slug);
        const image = await QRCode.toDataURL(url, {
          margin: 1,
          width: 720,
          errorCorrectionLevel: "M",
          color: { dark: "#142033", light: "#ffffff" },
        });
        setConfig(body.wedding.config);
        setSlug(body.wedding.slug);
        setQr(image);
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Impossible de préparer le QR code"));
  }, []);

  const names = config ? prettyNames(config) : "";
  const url = slug ? messageUrl(slug) : "";

  function download() {
    if (!qr || !url) return;
    const pdf = new jsPDF({ unit: "mm", format: "a5" });
    const width = pdf.internal.pageSize.getWidth();
    const center = width / 2;
    pdf.setTextColor(20, 32, 51);
    pdf.setFont("times", "italic");
    pdf.setFontSize(12);
    pdf.text("Laissez-leur un mot", center, 22, { align: "center" });
    pdf.setFont("times", "bold");
    pdf.setFontSize(24);
    const title = names ? `Pour ${names}` : "Pour les mariés";
    const titleLines = pdf.splitTextToSize(title, width - 24);
    pdf.text(titleLines, center, 34, { align: "center" });
    pdf.setFont("times", "normal");
    pdf.setFontSize(11);
    const lines = pdf.splitTextToSize(
      "Scannez ce QR code pour écrire un mot aux mariés. Un souhait, un souvenir ou une pensée : ils le liront avec beaucoup de joie.",
      width - 28,
    );
    pdf.text(lines, center, 34 + titleLines.length * 8 + 4, { align: "center" });
    const size = 78;
    const imageTop = 34 + titleLines.length * 8 + 22;
    pdf.addImage(qr, "PNG", center - size / 2, imageTop, size, size);
    pdf.setFontSize(8);
    pdf.setTextColor(90, 98, 112);
    pdf.text(url, center, imageTop + size + 8, { align: "center" });
    pdf.save(`qr-${slug}.pdf`);
  }

  return (
    <main className="setup qr-page">
      <div className="page-tools" style={{ width: "100%", margin: "0 0 28px" }}>
        <a className="line-btn" href="/commencer" style={{ width: "auto", marginTop: 0 }}>Retour</a>
      </div>
      <h1 className="names" style={{ fontSize: "clamp(40px, 8vw, 64px)" }}>QR code</h1>
      <p className="note">Ce code ouvre la page pour écrire un mot. Après l'envoi, l'invité peut revenir sur l'invitation. Téléchargez le PDF pour l'imprimer.</p>
      {error ? <p className="warning">{error}</p> : null}
      {qr && config ? (
        <>
          <article className="qr-sheet">
            <p className="kicker">Laissez-leur un mot</p>
            <h2>{names ? `Pour ${names}` : "Pour les mariés"}</h2>
            <p>Scannez ce QR code pour écrire un mot aux mariés. Un souhait, un souvenir ou une pensée : ils le liront avec beaucoup de joie.</p>
            <img src={qr} alt={`QR code de l'invitation ${url}`} />
            <p className="qr-url">{url}</p>
          </article>
          <button className="line-btn save-block is-dirty" type="button" onClick={download}>Télécharger le PDF</button>
        </>
      ) : null}
    </main>
  );
}
