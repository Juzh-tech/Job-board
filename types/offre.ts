/**
 * @fileoverview Types d'une offre d'emploi / stage.
 *
 * But
 *   Contrat TypeScript de advertisement + champs entreprise joints pour l'UI.
 */
export type TypeContrat = "CDI" | "CDD" | "Stage" | "Alternance" | "Freelance";

/** Liste fixe = filtres d’accueil + formulaire publier (même source). */
export const TYPES_CONTRAT: TypeContrat[] = [
  "CDI",
  "CDD",
  "Stage",
  "Alternance",
  "Freelance",
];

export type EntrepriseResume = {
  id: number;
  nom: string;
  secteur: string;
  ville: string;
  presentation: string;
  logoUrl?: string | null;
};

export type Offre = {
  id: number;
  titre: string;
  descriptionCourte: string;
  descriptionComplete: string;
  salaire: string;
  lieu: string;
  tempsTravail: string;
  typeContrat: TypeContrat;
  datePublication: string;
  /** false = retirée du marché (pas supprimée) */
  active: boolean;
  entreprise: EntrepriseResume;
};
