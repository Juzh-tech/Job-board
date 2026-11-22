/**
 * @fileoverview Helpers garde d'accès admin.
 *
 * But
 *   Vérifier qu'un JWT a bien le rôle admin avant /api/admin/*.
 */
import { NextRequest } from "next/server";
import { jsonErreur, utilisateurDepuisRequete, type JetonPayload } from "@/lib/auth-serveur";

/** Exige un JWT admin ; renvoie l'utilisateur ou une Response d'erreur. */
export function exigerAdmin(
  req: NextRequest,
): { user: JetonPayload } | { error: Response } {
  const user = utilisateurDepuisRequete(req);
  if (!user) {
    return { error: jsonErreur("Connexion requise", 401) };
  }
  if (user.role !== "admin") {
    return { error: jsonErreur("Réservé aux administrateurs", 403) };
  }
  return { user };
}
