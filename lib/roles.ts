/**
 * @fileoverview Constantes / helpers de rôles.
 *
 * But
 *   Un seul endroit pour les strings de rôle (éviter les typos).
 */
import type { RoleCompte } from "@/types/personne";

/** Page ouverte juste après la connexion, selon le rôle du compte. */
export const PAGE_APRES_CONNEXION: Record<RoleCompte, string> = {
  candidat: "/",
  entreprise: "/entreprise",
  admin: "/administration",
};
