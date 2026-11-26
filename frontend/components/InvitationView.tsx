"use client";

import { useEffect, useState } from "react";
import type { WeddingConfig } from "@/wedding.config";
import { PageLoader } from "@/components/Spinner";
import { WeddingProvider } from "@/components/wedding-context";
import { WeddingSite } from "@/components/WeddingSite";
import { api } from "@/lib/api";
import { pageTitle } from "@/lib/text";
import { applyColors, paletteOf } from "@/lib/theme";

export function InvitationView({ slug, initial }: { slug: string; initial: WeddingConfig | null }) {
  const [config, setConfig] = useState<WeddingConfig | null>(initial);
  const [error, setError] = useState("");

  useEffect(() => {
    if (config) {
      applyColors(paletteOf(config));
      document.title = pageTitle(config);
      return;
    }
    api<{ config: WeddingConfig }>(`/api/weddings/public/${slug}`)
      .then((body) => {
        const next = { ...body.config, drive: { slug, connected: body.config.drive?.connected } };
        setConfig(next);
        applyColors(paletteOf(next));
        document.title = pageTitle(next);
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Invitation introuvable"));
  }, [slug, config]);

  if (error) return <p className="setup">{error}</p>;
  if (!config) return <PageLoader />;
  return (
    <WeddingProvider value={config}>
      <WeddingSite />
    </WeddingProvider>
  );
}
