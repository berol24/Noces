"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { WeddingConfig } from "@/wedding.config";
import { WeddingProvider } from "@/components/wedding-context";
import { WeddingSite } from "@/components/WeddingSite";
import { api } from "@/lib/api";
import { pageTitle } from "@/lib/text";

export default function InvitationPage() {
  const params = useParams<{ slug: string }>();
  const [config, setConfig] = useState<WeddingConfig | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ config: WeddingConfig }>(`/api/weddings/public/${params.slug}`)
      .then((body) => {
        const config = {
          ...body.config,
          drive: { slug: params.slug, connected: body.config.drive?.connected },
        };
        setConfig(config);
        document.title = pageTitle(config);
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Invitation introuvable"));
  }, [params.slug]);

  if (error) return <p className="setup">{error}</p>;
  if (!config) return <p className="setup">Chargement de l'invitation…</p>;
  return (
    <WeddingProvider value={config}>
      <WeddingSite />
    </WeddingProvider>
  );
}
