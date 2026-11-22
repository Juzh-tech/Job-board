/**
 * @fileoverview Route /mentions-legales.
 */
import type { Metadata } from "next";
import { EcranMentionsLegales } from "@/ecrans/legal/EcranMentionsLegales";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: `Mentions légales de ${SITE.nom} — éditeur, hébergeur et informations légales.`,
};

export default function PageMentionsLegales() {
  return <EcranMentionsLegales />;
}
