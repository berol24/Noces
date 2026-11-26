import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Noces",
    short_name: "Noces",
    description: "Créez et partagez l'invitation de votre mariage.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f6f1e6",
    theme_color: "#0f1a33",
    lang: "fr",
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
