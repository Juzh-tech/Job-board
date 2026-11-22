/**
 * @fileoverview Route /offres — liste / détail alternative.
 *
 * But
 *   Même métier que l'accueil, layout un peu différent (colonnes).
 */
import { redirect } from "next/navigation";

export default async function PageOffresRedirect({
  searchParams,
}: {
  searchParams: Promise<{ offre?: string; q?: string; lieu?: string; contrat?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.offre) {
    query.set("offre", params.offre);
  }
  if (params.q) {
    query.set("q", params.q);
  }
  if (params.lieu) {
    query.set("lieu", params.lieu);
  }
  if (params.contrat) {
    query.set("contrat", params.contrat);
  }
  const suffixe = query.toString();
  redirect(suffixe ? `/?${suffixe}` : "/");
}
