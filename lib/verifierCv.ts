/**
 * @fileoverview Contrôles fichier CV (type, taille…).
 *
 * But
 *   Refuser tôt un fichier foireux avant écriture disque.
 */
export const TAILLE_MAX_CV_MO = 5;

/** Renvoie un message d'erreur si le fichier ne peut pas servir de CV, sinon null. */
export function verifierCv(fichier: File): string | null {
  const estPdf =
    fichier.type === "application/pdf" || fichier.name.toLowerCase().endsWith(".pdf");
  if (!estPdf) return "Le CV doit être un fichier PDF.";
  if (fichier.size > TAILLE_MAX_CV_MO * 1024 * 1024) {
    return `Le CV ne doit pas dépasser ${TAILLE_MAX_CV_MO} Mo.`;
  }
  return null;
}
