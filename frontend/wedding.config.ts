/**
 * Noces — l'unique fichier à modifier pour un autre mariage.
 *
 * Photos : déposez les fichiers dans public/photos, puis indiquez le chemin
 *          (exemple : "/photos/hero.jpg"). Laissez src vide en attendant.
 * Musique : même principe, dans public/music.
 * Carte : mapQuery peut être une adresse, ou un lien Google Maps complet.
 */

export type Speaker = "bride" | "groom";

export type WeddingColors = {
  background: string;
  text: string;
  muted: string;
  accent: string;
  accentDeep: string;
  leaf: string;
  flower: string;
};

export type Ceremony = {
  title: string;
  time: string;
  venue: string;
  address: string;
  mapQuery: string;
};

export type ProgramItem = {
  time: string;
  title: string;
  icon: string;
  highlight: boolean;
};

export type Song = {
  person: string;
  title: string;
  artist: string;
  src: string;
};

export type GalleryPhoto = {
  src: string;
  alt: string;
  /** Lieu ou légende affiché sur la photo. */
  place?: string;
  /** Cadrage, par exemple « 50% 30% » ou « 50% 30% 1.4 » pour le zoom. */
  focus?: string;
};

export type ColorTheme = {
  id: string;
  name: string;
  colors: WeddingColors;
};

export type DressColor = {
  name: string;
  hex: string;
};

export type SocialLink = {
  label: string;
  href: string;
};

export type DesignId = "classique" | "editorial" | "jardin" | "lin";

export type WeddingConfig = {
  designId: DesignId;
  couple: {
    bride: { firstName: string; lastName: string };
    groom: { firstName: string; lastName: string };
    /** "bride-groom" affiche « Prénom mariée & Prénom marié ». */
    nameOrder: "bride-groom" | "groom-bride";
    monogram: { top: string; bottom: string };
  };
  families: string[];
  date: {
    /** Début de la journée, avec le décalage horaire. Sert au compte à rebours et à l'agenda. */
    iso: string;
    endIso: string;
    timeZone: string;
    weekday: string;
    day: string;
    month: string;
    monthNumber: string;
    year: string;
    city: string;
    country: string;
  };
  countdown: {
    before: string;
    today: string;
    past: string;
  };
  entrance: {
    enabled: boolean;
    kicker: string;
    button: string;
    /** Photo de l'écran d'arrivée. Vide : le monogramme reste seul. */
    photo?: string;
    photoFocus?: string;
  };
  invitation: string;
  /** Photo affichée avec la phrase du faire-part. */
  invitationPhoto?: string;
  invitationPhotoFocus?: string;
  story: {
    enabled: boolean;
    passages: { speaker: Speaker; quote: string; text: string; photo?: string; photoFocus?: string }[];
    closing: string;
  };
  verse: {
    enabled: boolean;
    text: string;
    reference: string;
    photo?: string;
    photoFocus?: string;
  };
  ceremonies: Ceremony[];
  betweenCeremonies: string;
  program: {
    enabled: boolean;
    subtitle: string;
    note: string;
    items: ProgramItem[];
  };
  music: {
    background: { enabled: boolean; src: string; name?: string };
    songs: Song[];
  };
  /** Id d'un modèle, ou "personnalise" pour utiliser `colors`. */
  colorChoice: string;
  /** Affiche les 10 modèles sur l'écran d'entrée. */
  showThemePicker: boolean;
  /** Palette utilisée quand colorChoice vaut "personnalise". */
  colors: WeddingColors;
  themes: ColorTheme[];
  dressCode: {
    enabled: boolean;
    subtitle: string;
    text: string;
    style: string;
    warnings: string[];
    colors: DressColor[];
  };
  photos: {
    hero: GalleryPhoto;
    gallery: GalleryPhoto[];
    signature: string;
  };
  gifts: {
    enabled: boolean;
    subtitle: string;
    text: string;
    footnote: string;
  };
  guestAlbum: {
    enabled: boolean;
    title: string;
    text: string;
    button: string;
    href: string;
  };
  church: {
    enabled: boolean;
    title: string;
    name: string;
    links: SocialLink[];
  };
  fairePart: {
    /** Image à la place du carton généré. Exemple : "/faire-part.jpg". */
    image: string;
  };
  seo: {
    /** Laissez vide pour un texte généré à partir des prénoms, de la date et de la ville. */
    title: string;
    description: string;
    shareTitle: string;
    shareText: string;
    url: string;
    locale: string;
  };
  footer: {
    signature: string;
  };
  /** Ajouté sur l'invitation publique pour envoyer les photos dans le Drive du couple. */
  drive?: { slug: string; connected?: boolean };
};

export const wedding: WeddingConfig = {
  designId: "classique",
  couple: {
    bride: { firstName: "Jessica", lastName: "Fotso Waindja" },
    groom: { firstName: "Magloire", lastName: "Kitio" },
    nameOrder: "bride-groom",
    monogram: { top: "M", bottom: "J" },
  },

  families: ["Famille Kitio", "Famille Fotso"],

  date: {
    iso: "2026-06-27T09:00:00+01:00",
    endIso: "2026-06-27T22:00:00+01:00",
    timeZone: "Africa/Douala",
    weekday: "Samedi",
    day: "27",
    month: "Juin",
    monthNumber: "06",
    year: "2026",
    city: "Douala",
    country: "Cameroun",
  },

  countdown: {
    before: "avant de nous dire oui",
    today: "C'est aujourd'hui",
    past: "Nous nous sommes dit oui",
  },

  entrance: {
    enabled: true,
    kicker: "Vous êtes cordialement invités",
    button: "Entrer dans la cérémonie",
  },

  invitation:
    "Accompagnés de leurs familles, ont l'immense joie de vous convier à la cérémonie de leur mariage.",

  story: {
    enabled: true,
    passages: [
      {
        speaker: "groom",
        quote:
          "Je croyais avancer seul. Tu es arrivée, et le chemin a changé de sens.",
        text: "Avec toi, la foi est devenue une maison. Je veux te choisir encore, dans la lumière comme dans le silence, pour tous les jours que Dieu nous donnera.",
      },
      {
        speaker: "bride",
        quote: "Tu n'es pas une idée. Tu es une présence, fidèle et vraie.",
        text: "Dans tes silences, j'ai trouvé la paix. Je veux marcher avec toi, la main dans la main, le cœur tourné vers ce qui nous dépasse.",
      },
    ],
    closing:
      "Nous ne fêtons pas seulement un jour. Nous partageons une promesse, et nous serions heureux que vous en soyez témoins.",
  },

  verse: {
    enabled: true,
    text: "Et par-dessus tout cela, revêtez-vous de l'amour, qui est le lien de la perfection.",
    reference: "Colossiens 3 : 14",
  },

  ceremonies: [
    {
      title: "Cérémonie civile",
      time: "9h00",
      venue: "Mairie de Douala V",
      address: "Douala, Cameroun",
      mapQuery: "Mairie Douala V Cameroun",
    },
    {
      title: "Bénédiction nuptiale",
      time: "15h00",
      venue: "Integrity For All Center",
      address: "Bonamoussadi, face supermarché BAO",
      mapQuery: "Integrity For All Center Bonamoussadi Douala",
    },
  ],

  betweenCeremonies: "Photos de famille entre les deux cérémonies",

  program: {
    enabled: true,
    subtitle: "Itinéraire du jour",
    note: "Les horaires peuvent varier légèrement",
    items: [
      { time: "08:30", title: "Accueil à la Mairie", icon: "🏛", highlight: false },
      { time: "09:00", title: "Cérémonie civile", icon: "⚖", highlight: false },
      { time: "10:30", title: "Photos de famille", icon: "📸", highlight: false },
      { time: "14:30", title: "Accueil à l'Integrity For All", icon: "🕊", highlight: false },
      { time: "15:00", title: "Bénédiction nuptiale", icon: "✝", highlight: true },
      { time: "17:00", title: "Cocktail de félicitations", icon: "🥂", highlight: false },
      { time: "19:00", title: "Réception et dîner", icon: "🍽", highlight: false },
      { time: "20:00", title: "Célébration", icon: "🎊", highlight: true },
    ],
  },

  music: {
    background: {
      enabled: true,
      src: "",
    },
    songs: [
      {
        person: "Magloire",
        title: "The Best In Me",
        artist: "Marvin Sapp",
        src: "",
      },
      {
        person: "Jessica",
        title: "Notre chanson",
        artist: "À préciser",
        src: "",
      },
    ],
  },

  colorChoice: "blanc-rose",
  showThemePicker: false,
  colors: {
    background: "#141820",
    text: "#f8f3ea",
    muted: "#cbbba6",
    accent: "#d4b483",
    accentDeep: "#c9848f",
    leaf: "#1d2a24",
    flower: "#e7c4cb",
  },
  themes: [
    {
      id: "blanc-rose",
      name: "Soie et or",
      colors: {
        background: "#141820",
        text: "#f8f3ea",
        muted: "#cbbba6",
        accent: "#d4b483",
        accentDeep: "#c9848f",
        leaf: "#1d2a24",
        flower: "#e7c4cb",
      },
    },
    {
      id: "nuit-cuivre",
      name: "Nuit cuivre",
      colors: {
        background: "#0f1a33",
        text: "#f6f1e7",
        muted: "#cbbfae",
        accent: "#e0a68f",
        accentDeep: "#c56a4a",
        leaf: "#14362c",
        flower: "#c9a08c",
      },
    },
    {
      id: "minuit-or",
      name: "Minuit or",
      colors: {
        background: "#0c0f14",
        text: "#f3ead7",
        muted: "#b7a48a",
        accent: "#e4c98a",
        accentDeep: "#a68446",
        leaf: "#1a2418",
        flower: "#e6d3a3",
      },
    },
    {
      id: "foret",
      name: "Forêt",
      colors: {
        background: "#10211c",
        text: "#f3efe4",
        muted: "#c5d0c4",
        accent: "#d7c4a3",
        accentDeep: "#7f9a78",
        leaf: "#1c3a30",
        flower: "#e7d7c3",
      },
    },
    {
      id: "bordeaux",
      name: "Bordeaux",
      colors: {
        background: "#2a1218",
        text: "#f8efe9",
        muted: "#d7c3bc",
        accent: "#e7b7a8",
        accentDeep: "#a33b4a",
        leaf: "#3a1c24",
        flower: "#e8c4b8",
      },
    },
    {
      id: "ivoire",
      name: "Ivoire",
      colors: {
        background: "#f7f1e8",
        text: "#2a241c",
        muted: "#6d6458",
        accent: "#8c4e32",
        accentDeep: "#a8643c",
        leaf: "#cfc4b2",
        flower: "#c47a5a",
      },
    },
    {
      id: "terracotta",
      name: "Terracotta",
      colors: {
        background: "#2a1812",
        text: "#f6efe6",
        muted: "#d2c0b0",
        accent: "#e7a07a",
        accentDeep: "#c4623a",
        leaf: "#3d2a22",
        flower: "#e8c2a4",
      },
    },
    {
      id: "saphir",
      name: "Saphir",
      colors: {
        background: "#0e1c33",
        text: "#f4f7fb",
        muted: "#c5d0de",
        accent: "#d5deea",
        accentDeep: "#7f93b0",
        leaf: "#16324a",
        flower: "#e7eef6",
      },
    },
    {
      id: "olive",
      name: "Olive",
      colors: {
        background: "#1c2114",
        text: "#f6f3e8",
        muted: "#cfc8b0",
        accent: "#e2d3a2",
        accentDeep: "#8a8f4a",
        leaf: "#2c331c",
        flower: "#efe6c4",
      },
    },
    {
      id: "prune",
      name: "Prune",
      colors: {
        background: "#241628",
        text: "#f7f0f4",
        muted: "#d4c4ce",
        accent: "#e4b7c8",
        accentDeep: "#8d4d6e",
        leaf: "#3a2438",
        flower: "#f0d0dc",
      },
    },
    {
      id: "encre",
      name: "Encre",
      colors: {
        background: "#121212",
        text: "#f5f2ea",
        muted: "#c8c2b6",
        accent: "#efe6d6",
        accentDeep: "#b9a88a",
        leaf: "#242424",
        flower: "#f3ece0",
      },
    },
  ],

  dressCode: {
    enabled: true,
    subtitle: "Dress code",
    text: "Habillez-vous dans les couleurs du jour : bleu marine, orange brûlé ou touches dorées.",
    style: "Tenue élégante — chic de cérémonie.",
    warnings: ["Le blanc est réservé à la mariée", "Tenue africaine bienvenue"],
    colors: [
      { name: "Bleu marine", hex: "#1b3a5f" },
      { name: "Orange brûlé", hex: "#d4652f" },
      { name: "Or", hex: "#c6a15b" },
    ],
  },

  photos: {
    hero: { src: "", alt: "Jessica et Magloire" },
    gallery: [
      { src: "", alt: "Jessica et Magloire" },
      { src: "", alt: "Câlin amoureux" },
      { src: "", alt: "Jessica" },
      { src: "", alt: "La demande" },
      { src: "", alt: "Selfie du bonheur" },
      { src: "", alt: "Mains unies" },
      { src: "", alt: "Roses éternelles" },
      { src: "", alt: "Ensemble" },
    ],
    signature: "Magloire & Jessica",
  },

  gifts: {
    enabled: true,
    subtitle: "Pluie de cadeaux",
    text: "Si vous souhaitez nous offrir un cadeau, nous serons heureux de le recevoir le jour de notre célébration.",
    footnote: "27 juin 2026 · Integrity For All Center",
  },

  guestAlbum: {
    enabled: true,
    title: "Partagez vos photos du grand jour",
    text: "Elles seront ajoutées à notre album souvenir",
    button: "Ajouter mes photos",
    /** Les invités sont envoyés vers cet album en cliquant sur le bouton. */
    href: "https://photos.app.goo.gl/NBEL3RMjwoBrGKJY9",
  },

  church: {
    enabled: true,
    title: "Suivre IFA",
    name: "Integrity For All",
    links: [
      { label: "Facebook", href: "https://www.facebook.com/PastorForAll" },
      { label: "Instagram", href: "https://www.instagram.com/integrity_for_all" },
      { label: "YouTube", href: "https://youtube.com/@integrityforall5304" },
    ],
  },

  fairePart: {
    image: "",
  },

  seo: {
    title: "",
    description: "",
    shareTitle: "",
    shareText: "",
    url: "",
    locale: "fr_FR",
  },

  footer: {
    signature: "Fait avec ♡",
  },
};
