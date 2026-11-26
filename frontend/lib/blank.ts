import type { DesignId, WeddingConfig } from "@/wedding.config";
import { wedding } from "@/wedding.config";

export const designs: { id: DesignId; name: string; text: string }[] = [
  {
    id: "classique",
    name: "Classique",
    text: "Invitation centrée, photo en arche, ornements.",
  },
  {
    id: "editorial",
    name: "Éditorial",
    text: "Grands noms, photo large, lecture alignée à gauche.",
  },
  {
    id: "jardin",
    name: "Jardin",
    text: "Portrait rond, feuillage plus présent.",
  },
  {
    id: "lin",
    name: "Lin",
    text: "Beaucoup d'espace, traits fins, peu d'ornements.",
  },
];

export function blankWedding(designId: DesignId = "classique"): WeddingConfig {
  const draft = structuredClone(wedding);
  draft.designId = designId;
  draft.showThemePicker = false;
  draft.colorChoice = "blanc-rose";
  draft.colors = structuredClone(wedding.themes.find((theme) => theme.id === "blanc-rose")?.colors ?? wedding.colors);
  draft.couple.bride = { firstName: "", lastName: "" };
  draft.couple.groom = { firstName: "", lastName: "" };
  draft.couple.monogram = { top: "A", bottom: "B" };
  draft.families = ["", ""];
  draft.invitation = "";
  draft.story.passages = [
    { speaker: "groom", quote: "", text: "" },
    { speaker: "bride", quote: "", text: "" },
  ];
  draft.story.closing = "";
  draft.verse.text = "";
  draft.verse.reference = "";
  draft.ceremonies = [
    { title: "Cérémonie civile", time: "", venue: "", address: "", mapQuery: "" },
    { title: "Bénédiction nuptiale", time: "", venue: "", address: "", mapQuery: "" },
  ];
  draft.betweenCeremonies = "";
  draft.program.items = [{ time: "", title: "", icon: "✦", highlight: false }];
  draft.photos.hero = { src: "", alt: "" };
  draft.photos.gallery = [];
  draft.photos.signature = "";
  draft.music.background = { enabled: false, src: "" };
  draft.music.songs = [];
  draft.gifts.enabled = false;
  draft.gifts.text = "";
  draft.gifts.footnote = "";
  draft.entrance.photo = "";
  draft.guestAlbum.href = "";
  draft.church.enabled = false;
  draft.church.links = [];
  draft.seo = { title: "", description: "", shareTitle: "", shareText: "", url: "", locale: "fr_FR" };
  return draft;
}
