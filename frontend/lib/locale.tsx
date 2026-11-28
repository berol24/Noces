"use client";

import { createContext, useContext, useEffect, useState } from "react";

const copy = {
  fr: {
    otherLang: "English",
    story: "Notre histoire",
    gallery: "Galerie",
    moments: "Nos moments",
    enlarge: "Cliquez sur une photo pour agrandir",
    day: "Le jour J",
    map: "Voir sur la carte",
    gifts: "Cadeaux",
    program: "Programme",
    dress: "Code vestimentaire",
    songs: "Nos chansons",
    listen: "Appuyez pour écouter",
    countdown: "Compte à rebours",
    days: "Jours",
    hours: "Heures",
    minutes: "Min",
    seconds: "Sec",
    google: "Google Agenda",
    outlook: "Outlook",
    apple: "Apple et autres",
    scroll: "Scrollez",
    click: "Cliquez ici",
    colors: "Modèle de couleurs",
    play: "Lecture",
    pause: "Pause",
    card: "Voir le faire-part",
    share: "Partager ce site",
    copied: "Lien copié",
    photos: "Ajouter mes photos",
    album: "Partagez vos photos du grand jour",
    book: "Livre d'or",
    bookText: "Laissez un mot aux mariés.",
    name: "Votre nom",
    message: "Votre message",
    send: "Envoyer",
    sent: "Merci, c'est envoyé.",
    close: "Fermer",
    meals: "Repas",
    menu: "Menu",
    choose: "Choisissez un menu",
    allergy: "Allergie ou régime",
    confirm: "Confirmer",
  },
  en: {
    otherLang: "Français",
    story: "Our story",
    gallery: "Gallery",
    moments: "Our moments",
    enlarge: "Tap a photo to enlarge it",
    day: "The day",
    map: "See on the map",
    gifts: "Gifts",
    program: "Programme",
    dress: "Dress code",
    songs: "Our songs",
    listen: "Tap to listen",
    countdown: "Countdown",
    days: "Days",
    hours: "Hours",
    minutes: "Min",
    seconds: "Sec",
    google: "Google Calendar",
    outlook: "Outlook",
    apple: "Apple and others",
    scroll: "Scroll",
    click: "Tap here",
    colors: "Colour theme",
    play: "Play",
    pause: "Pause",
    card: "See the invitation card",
    share: "Share this site",
    copied: "Link copied",
    photos: "Add my photos",
    album: "Share your photos from the day",
    book: "Guestbook",
    bookText: "Leave a note for the couple.",
    name: "Your name",
    message: "Your message",
    send: "Send",
    sent: "Thank you, it is sent.",
    close: "Close",
    meals: "Meal",
    menu: "Menu",
    choose: "Choose a menu",
    allergy: "Allergy or diet",
    confirm: "Confirm",
  },
} as const;

export type Lang = keyof typeof copy;
export type CopyKey = keyof typeof copy.fr;

const LocaleContext = createContext<{ lang: Lang; toggle: () => void; t: (key: CopyKey) => string }>({
  lang: "fr",
  toggle: () => undefined,
  t: (key) => copy.fr[key],
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("fr");

  useEffect(() => {
    const saved = window.localStorage.getItem("noces-lang");
    if (saved === "en" || saved === "fr") setLang(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  function toggle() {
    setLang((current) => {
      const next = current === "fr" ? "en" : "fr";
      window.localStorage.setItem("noces-lang", next);
      return next;
    });
  }

  return (
    <LocaleContext.Provider value={{ lang, toggle, t: (key) => copy[lang][key] }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function LanguageToggle() {
  const { t, toggle } = useLocale();
  return (
    <button className="lang-toggle" type="button" onClick={toggle}>
      {t("otherLang")}
    </button>
  );
}
