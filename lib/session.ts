/**
 * @fileoverview Session navigateur (JWT en localStorage).
 *
 * But
 *   Lire / écrire / supprimer le token après login / logout.
 *
 * Note
 *   localStorage ≠ cookie HttpOnly — limite XSS connue.
 */
/**
 * Session côté navigateur (tant que l'API ne pose pas de cookie HttpOnly).
 *
 * Choix : localStorage
 *   - simple pour un projet scolaire
 *   - le JWT voyage ensuite dans Authorization: Bearer …
 * Plus tard on pourra basculer sur un cookie sécurisé sans changer les écrans
 * si on garde les mêmes helpers (lireSession / ecrireSession / viderSession).
 */

import type { UtilisateurApi } from "@/lib/api";

const CLE_TOKEN = "jobboard_token";
const CLE_USER = "jobboard_user";

export type SessionLocale = {
  token: string;
  user: UtilisateurApi;
};

/** Lit la session courante. Retourne null si absente ou illisible. */
export function lireSession(): SessionLocale | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const token = localStorage.getItem(CLE_TOKEN);
    const brut = localStorage.getItem(CLE_USER);
    if (!token || !brut) {
      return null;
    }
    return { token, user: JSON.parse(brut) as UtilisateurApi };
  } catch {
    return null;
  }
}

/** Enregistre le token + le profil après login / register. */
export function ecrireSession(session: SessionLocale) {
  localStorage.setItem(CLE_TOKEN, session.token);
  localStorage.setItem(CLE_USER, JSON.stringify(session.user));
  // Prévenir le bandeau (EnTete) qu'il doit se rafraîchir
  window.dispatchEvent(new Event("jobboard-session"));
}

/** Déconnexion locale (le JWT reste invalide côté serveur à l'expiration). */
export function viderSession() {
  localStorage.removeItem(CLE_TOKEN);
  localStorage.removeItem(CLE_USER);
  window.dispatchEvent(new Event("jobboard-session"));
}
