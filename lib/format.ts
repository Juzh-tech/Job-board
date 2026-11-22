/**
 * @fileoverview Petits formatages d'affichage (dates, libellés…).
 *
 * But
 *   Garder l'UI homogène sans recopier toLocaleDateString partout.
 */
const MOIS = [
  "janv.",
  "févr.",
  "mars",
  "avr.",
  "mai",
  "juin",
  "juil.",
  "août",
  "sept.",
  "oct.",
  "nov.",
  "déc.",
];

/** Date du jour au format ISO local (YYYY-MM-DD). */
export function dateDuJour(maintenant = new Date()): string {
  const annee = maintenant.getFullYear();
  const mois = String(maintenant.getMonth() + 1).padStart(2, "0");
  const jour = String(maintenant.getDate()).padStart(2, "0");
  return `${annee}-${mois}-${jour}`;
}

/** Transforme une date ISO (YYYY-MM-DD) en texte lisible, ex. « 2 oct. 2026 ». */
export function formaterDate(iso: string): string {
  const [annee, mois, jour] = iso.split("-").map(Number);
  return `${jour} ${MOIS[mois - 1]} ${annee}`;
}

function joursEntre(iso: string, aujourdhui: string): number {
  const a = new Date(`${iso}T00:00:00`);
  const b = new Date(`${aujourdhui}T00:00:00`);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/** Date comme sur Indeed / Hellowork : « Aujourd'hui », « Hier », « Il y a 3 jours ». */
export function formaterDateRelative(iso: string, aujourdhui = dateDuJour()): string {
  const jours = joursEntre(iso, aujourdhui);
  if (jours <= 0) {
    return "Aujourd'hui";
  }
  if (jours === 1) {
    return "Hier";
  }
  if (jours < 7) {
    return `Il y a ${jours} jours`;
  }
  return formaterDate(iso);
}

/** Offre récente (moins de 4 jours) — badge « Nouveau ». */
export function offreEstNouvelle(iso: string, aujourdhui = dateDuJour()): boolean {
  return joursEntre(iso, aujourdhui) <= 3;
}
