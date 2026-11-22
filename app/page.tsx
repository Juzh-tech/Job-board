/**
 * @fileoverview Route / — accueil board d'offres.
 *
 * But
 *   Point d'entrée URL. L'UI réelle vit dans ecrans/accueil.
 */
import { EcranAccueil } from "@/ecrans/accueil/EcranAccueil";

export default async function PageAccueil({
  searchParams,
}: {
  searchParams: Promise<{ offre?: string; q?: string; lieu?: string; contrat?: string }>;
}) {
  const { offre, q, lieu, contrat } = await searchParams;
  const offreInitialeId = offre ? Number(offre) : undefined;

  return (
    <EcranAccueil
      offreInitialeId={offreInitialeId}
      motInitial={q ?? ""}
      lieuInitial={lieu ?? ""}
      contratInitial={contrat ?? "tous"}
    />
  );
}
