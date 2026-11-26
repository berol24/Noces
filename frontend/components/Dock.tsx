"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { IconButton } from "@/components/art";
import { useAudio } from "@/components/audio";
import { useWedding } from "@/components/wedding-context";
import { shareText, shareTitle } from "@/lib/text";

export function Dock() {
  const wedding = useWedding();
  const pathname = usePathname();
  const audio = useAudio();
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  function shareLinks() {
    const url = window.location.href;
    const title = shareTitle(wedding);
    const text = `${title}\n${shareText(wedding)}\n${url}`;
    return {
      url,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
      mail: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      sms: `sms:?&body=${encodeURIComponent(text)}`,
    };
  }

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setShareOpen(false);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <>
      {audio.canPlayBackground ? (
        <div className="dock dock-left">
          <IconButton label="Lecture" onClick={audio.playBg}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 6.5v11l10-5.5z" fill="currentColor" />
            </svg>
          </IconButton>
          <IconButton label="Pause" onClick={audio.pauseBg}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 6h3v12H8zM13 6h3v12h-3z" fill="currentColor" />
            </svg>
          </IconButton>
        </div>
      ) : null}
      <div className="dock dock-right">
        <IconButton label="Voir le faire-part" href={pathname.startsWith("/i/") ? `${pathname}/faire-part` : "/faire-part"}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="6" y="3" width="12" height="18" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M9 8h6M9 12h6M9 16h4" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </IconButton>
        <IconButton label="Partager ce site" onClick={() => setShareOpen((open) => !open)}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="6" cy="12" r="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="17" cy="7" r="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="17" cy="17" r="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M8 11.2 15 8.2M8 12.8l7 3" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </IconButton>
      </div>
      {shareOpen ? (
        <div className="share-menu">
          <a href={shareLinks().whatsapp} target="_blank" rel="noreferrer">WhatsApp</a>
          <a href={shareLinks().mail}>E-mail</a>
          <a href={shareLinks().facebook} target="_blank" rel="noreferrer">Facebook</a>
          <a href={shareLinks().sms}>SMS</a>
          <button type="button" onClick={() => void copyLink()}>Copier le lien</button>
        </div>
      ) : null}
      {copied ? <p className="toast">Lien copié</p> : null}
    </>
  );
}
