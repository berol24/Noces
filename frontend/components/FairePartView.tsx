"use client";

import { useEffect, useState } from "react";
import type { WeddingConfig } from "@/wedding.config";
import { FairePart } from "@/components/FairePart";
import { PageLoader } from "@/components/Spinner";
import { PrintBar } from "@/components/PrintBar";
import { WeddingProvider } from "@/components/wedding-context";
import { api } from "@/lib/api";
import { applyColors, paletteOf } from "@/lib/theme";

export function FairePartView({ slug, initial }: { slug: string; initial: WeddingConfig | null }) {
  const [config, setConfig] = useState<WeddingConfig | null>(initial);
  const [error, setError] = useState("");

  useEffect(() => {
    if (config) {
      applyColors(paletteOf(config));
      return;
    }
    api<{ config: WeddingConfig }>(`/api/weddings/public/${slug}`)
      .then((body) => {
        setConfig(body.config);
        applyColors(paletteOf(body.config));
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Invitation introuvable"));
  }, [slug, config]);

  if (error) return <p className="setup">{error}</p>;
  if (!config) return <PageLoader />;
  return (
    <WeddingProvider value={config}>
      <div className="sheet" data-design={config.designId}>
        <PrintBar />
        <div className="poster-wrap">
          <FairePart />
        </div>
      </div>
    </WeddingProvider>
  );
}
