/**
 * @fileoverview Libellés de statuts / contrats affichés dans l'UI.
 *
 * But
 *   Traduire les enums BDD en texte humain hors i18n complet.
 */
import type { TypeContrat } from "@/types/offre";
import type { RoleCompte } from "@/types/personne";

export { LIBELLES_STATUT } from "@/types/candidature";

/** Textes affichés pour les types de contrat. */
export const LIBELLES_CONTRAT: Record<TypeContrat, string> = {
  CDI: "CDI",
  CDD: "CDD",
  Stage: "Stage",
  Alternance: "Alternance",
  Freelance: "Freelance",
};

export const LIBELLES_ROLE: Record<RoleCompte, string> = {
  candidat: "Candidat",
  entreprise: "Entreprise",
  admin: "Admin",
};

/** Transforme un objet de libellés en options pour une liste déroulante. */
export function versOptions<T extends string>(libelles: Record<T, string>) {
  return (Object.keys(libelles) as T[]).map((valeur) => ({
    valeur,
    libelle: libelles[valeur],
  }));
}

/** pluriel(3, "offre") donne « 3 offres ». */
export function pluriel(nombre: number, singulier: string, forme = `${singulier}s`) {
  return `${nombre} ${nombre > 1 ? forme : singulier}`;
}
