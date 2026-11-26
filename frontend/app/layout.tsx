import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { wedding } from "@/wedding.config";
import { pageDescription, pageTitle, shareText, shareTitle, siteUrl } from "@/lib/text";
import { ThemeSync } from "@/components/ThemeSync";
import { colorsFor, themeStyle } from "@/lib/theme";
import "./globals.css";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const url = siteUrl();

export const metadata: Metadata = {
  metadataBase: url ?? undefined,
  title: pageTitle(),
  description: pageDescription(),
  openGraph: {
    title: shareTitle(),
    description: shareText(),
    locale: wedding.seo.locale,
    siteName: pageTitle(),
    type: "website",
    url: url?.toString(),
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${serif.variable} ${sans.variable}`} style={themeStyle(colorsFor())}>
      <body>
        <ThemeSync />
        {children}
      </body>
    </html>
  );
}
