/**
 * @fileoverview Validations partagées des formulaires.
 *
 * But
 *   Règles + messages cohérents inscription / profil / offres.
 */
/** Validations formulaires côté client (messages en français). */

import { messageErreurTelephone } from "@/lib/telephone";

/**
 * E-mail strict : local@domaine.extension (ex. refusé : votre@gmail).
 * - au moins un point dans le domaine
 * - TLD de 2 à 24 lettres
 */
const EMAIL_RE =
  /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

export function validerEmail(valeur: string): string | null {
  const v = valeur.trim();
  if (!v) {
    return "L’adresse e-mail est obligatoire.";
  }
  if (v.length > 191) {
    return "L’adresse e-mail est trop longue.";
  }
  if (!EMAIL_RE.test(v)) {
    return "Indiquez une adresse e-mail valide (ex. prenom@domaine.fr).";
  }
  const domaine = v.split("@")[1] || "";
  if (!domaine.includes(".")) {
    return "L’adresse e-mail doit contenir une extension (ex. .fr, .com).";
  }
  const tld = domaine.split(".").pop() || "";
  if (tld.length < 2 || !/^[a-z]+$/i.test(tld)) {
    return "L’extension de l’e-mail est invalide.";
  }
  return null;
}

export function validerMotDePasse(valeur: string, min = 8): string | null {
  if (!valeur) {
    return "Le mot de passe est obligatoire.";
  }
  if (valeur.length < min) {
    return `Le mot de passe doit contenir au moins ${min} caractères.`;
  }
  return null;
}

export function validerChampObligatoire(valeur: string, libelle: string): string | null {
  if (!valeur.trim()) {
    return `${libelle} est obligatoire.`;
  }
  return null;
}

/** Téléphone selon le pays (format national). */
export function validerTelephone(
  valeur: string,
  obligatoire = true,
  codePays?: string | null,
): string | null {
  return messageErreurTelephone(valeur, codePays ?? "FR", obligatoire);
}

export function validerEmailServeur(email: string): boolean {
  return validerEmail(email) === null;
}
