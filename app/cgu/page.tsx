/**
 * @fileoverview Route /cgu.
 */
import type { Metadata } from "next";
import { EcranCgu } from "@/ecrans/legal/EcranCgu";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Conditions générales d’utilisation",
  description: `CGU de ${SITE.nom} — règles d’usage pour candidats et entreprises.`,
};

export default function PageCgu() {
  return <EcranCgu />;
}
