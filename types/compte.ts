/**
 * @fileoverview Types compte / session côté front.
 *
 * But
 *   Ce que le navigateur garde après login (token + infos affichables).
 *   Pas de mot de passe ici — jamais.
 */
/**
 * Rôle d'un compte.
 * - candidat : consulte les offres et postule
 * - entreprise : publie ses propres offres
 * - admin : gère les données, et peut aussi publier une offre
 */
export type RoleCompte = "candidat" | "entreprise" | "admin";
