import type { Metadata, Viewport } from "next";
import "@fontsource/big-shoulders-display/700";
import "@fontsource/big-shoulders-display/900";
import "@fontsource/pirata-one/400";
import "@fontsource/instrument-sans/400";
import "@fontsource/instrument-sans/600";
import "./globals.css";
import { site } from "@/site.config";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.artist, template: `%s · ${site.artist}` },
  description: `${site.artist} — dernières sorties, clips, concerts et boutique.`,
};

export const viewport: Viewport = { themeColor: "#000000", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        {children}
      </body>
    </html>
  );
}
