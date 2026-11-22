/**
 * @fileoverview Route /confidentialite.
 */
import type { Metadata } from "next";
import { EcranConfidentialite } from "@/ecrans/legal/EcranConfidentialite";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: `Politique de confidentialité et protection des données personnelles — ${SITE.nom} (RGPD).`,
};

export default function PageConfidentialite() {
  return <EcranConfidentialite />;
}
