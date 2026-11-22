/**
 * @fileoverview Route /entreprise (espace recruteur).
 *
 * But
 *   Wrapper page → EcranEntreprise.
 */
import { EcranEntreprise } from "@/ecrans/entreprise/EcranEntreprise";

export default async function PageEntreprise({
  searchParams,
}: {
  searchParams: Promise<{ acces?: string }>;
}) {
  const { acces } = await searchParams;
  const forcerStatut =
    acces === "attente" ? "en_attente" : acces === "refus" ? "refusee" : null;

  return <EcranEntreprise forcerStatut={forcerStatut} />;
}
