"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { WeddingConfig } from "@/wedding.config";
import { FairePart } from "@/components/FairePart";
import { PrintBar } from "@/components/PrintBar";
import { WeddingProvider } from "@/components/wedding-context";
import { api } from "@/lib/api";

export default function InvitationCardPage() {
  const params = useParams<{ slug: string }>();
  const [config, setConfig] = useState<WeddingConfig | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ config: WeddingConfig }>(`/api/weddings/public/${params.slug}`)
      .then((body) => setConfig(body.config))
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Invitation introuvable"));
  }, [params.slug]);

  if (error) return <p className="setup">{error}</p>;
  if (!config) return <p className="setup">Chargement du faire-part…</p>;
  return (
    <WeddingProvider value={config}>
      <PrintBar />
      <div className="poster-wrap">
        <FairePart />
      </div>
    </WeddingProvider>
  );
}
