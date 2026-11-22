/**
 * @fileoverview Route /cookies.
 */
import type { Metadata } from "next";
import { EcranCookies } from "@/ecrans/legal/EcranCookies";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Politique cookies",
  description: `Politique cookies et gestion du consentement — ${SITE.nom}.`,
};

export default function PageCookies() {
  return <EcranCookies />;
}
