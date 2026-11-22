/**
 * @fileoverview Types people (candidat / entreprise / admin).
 *
 * But
 *   Rôles et profils. companyId seulement si role = entreprise.
 */
/**
 * Rôle d'un compte.
 * - candidat : consulte les offres et postule
 * - entreprise : publie ses propres offres
 * - admin : gère les données, et peut aussi publier une offre
 */
export type RoleCompte = "candidat" | "entreprise" | "admin";

/** CV au format PDF. `ajouteLe` est une date au format "AAAA-MM-JJ". */
export type FichierCv = {
  nom: string;
  url: string;
  ajouteLe: string;
};

/** Une personne : candidat, contact d'une entreprise ou admin. */
export type Personne = {
  id: string;
  role: RoleCompte;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  /** Entreprise représentée. Renseignée seulement pour un compte entreprise. */
  entrepriseId: string | null;
  /** CV enregistré sur le compte. Seulement pour un candidat, et facultatif. */
  cv: FichierCv | null;
};
