/**
 * @fileoverview Types entreprise (fiche publique + espace recruteur).
 *
 * But
 *   Statut de vérif, logo, infos. Aligné sur la table companies.
 */
export type StatutVerificationEntreprise = "en_attente" | "validee" | "refusee";

export const LIBELLES_VERIFICATION: Record<StatutVerificationEntreprise, string> = {
  en_attente: "En attente",
  validee: "Validée",
  refusee: "Refusée",
};

export type Entreprise = {
  id: number;
  nom: string;
  secteur: string;
  ville: string;
  siteWeb: string;
  presentation: string;
  statutVerification: StatutVerificationEntreprise;
  dateInscription: string;
  contactNom: string;
  contactEmail: string;
  /** Renseigné seulement si le dossier a été refusé. */
  motifRefus: string;
  logoUrl: string | null;
};
