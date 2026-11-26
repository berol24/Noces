"use client";

import { useEffect, useState } from "react";

const ASKED = "noces-pwa-asked";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function alreadyInstalled() {
  const standalone = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone =
    "standalone" in navigator &&
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return standalone || iosStandalone;
}

function onIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function InstallPrompt() {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [hint, setHint] = useState("");

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  useEffect(() => {
    if (alreadyInstalled() || localStorage.getItem(ASKED)) return;
    setOpen(true);

    function remember() {
      localStorage.setItem(ASKED, "1");
    }

    function onBefore(event: Event) {
      event.preventDefault();
      setPrompt(event as BeforeInstallPromptEvent);
    }

    function onInstalled() {
      remember();
      setOpen(false);
    }

    window.addEventListener("beforeinstallprompt", onBefore);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("pagehide", remember);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBefore);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("pagehide", remember);
    };
  }, []);

  function later() {
    localStorage.setItem(ASKED, "1");
    setOpen(false);
  }

  async function install() {
    if (prompt) {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      setPrompt(null);
      if (choice.outcome === "accepted") later();
      return;
    }
    setHint(
      onIos()
        ? "Appuyez sur Partager, puis sur « Sur l'écran d'accueil »."
        : "Ouvrez le menu du navigateur, puis « Installer Noces ».",
    );
  }

  if (!open) return null;

  return (
    <div className="install-banner no-print" role="dialog" aria-label="Installer Noces">
      <p>
        Ajoutez Noces à votre écran d'accueil.
        {hint ? <span className="install-hint">{hint}</span> : null}
      </p>
      <div className="install-actions">
        <button type="button" className="install-later" onClick={later}>
          Plus tard
        </button>
        <button type="button" className="install-go" onClick={() => void install()}>
          Installer
        </button>
      </div>
    </div>
  );
}
