/**
 * @fileoverview Layout racine : header, zone pages, footer, cookies, locale.
 *
 * But
 *   Coquille commune à presque tout le site. Les pages enfants se rendent dans {children}.
 */
import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import { BanniereCookies } from "@/composants/mise-en-page/BanniereCookies";
import { EnTete } from "@/composants/mise-en-page/EnTete";
import { PiedDePage } from "@/composants/mise-en-page/PiedDePage";
import { FournisseurLocale } from "@/lib/i18n/contexte";
import { SITE } from "@/lib/site";
import "./globals.css";

const texte = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-texte",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.nom} — ${SITE.slogan}`,
    template: `%s | ${SITE.nom}`,
  },
  description: SITE.description,
  applicationName: SITE.nom,
  authors: [{ name: SITE.editeur.raisonSociale }],
  creator: SITE.editeur.raisonSociale,
  publisher: SITE.editeur.raisonSociale,
  keywords: [
    "emploi",
    "stage",
    "recrutement",
    "offres d'emploi",
    "candidature",
    "Job Board",
    "France",
  ],
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.nom,
    title: `${SITE.nom} — ${SITE.slogan}`,
    description: SITE.description,
    images: [
      {
        url: "/og-jobboard.jpg",
        width: 1200,
        height: 630,
        alt: `${SITE.nom} — plateforme d'emploi et de stages`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.nom} — ${SITE.slogan}`,
    description: SITE.description,
    images: ["/og-jobboard.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE.url,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${texte.variable} h-full antialiased`}>
      <body className="flex h-dvh max-h-dvh flex-col overflow-hidden">
        <FournisseurLocale>
          <EnTete />
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
          <PiedDePage />
          <BanniereCookies />
        </FournisseurLocale>
      </body>
    </html>
  );
}
