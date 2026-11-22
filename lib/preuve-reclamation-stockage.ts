/**
 * @fileoverview Stockage disque des preuves de réclamation.
 *
 * But
 *   Écrire / résoudre le fichier. MySQL ne garde que le nom dans motif_refus.
 */
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export const DOSSIER_PREUVES = path.join(process.cwd(), "uploads", "reclamations");
export const TAILLE_MAX_PREUVE = 5 * 1024 * 1024; // 5 Mo

const TYPES_OK = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

export function preuveEstAcceptee(fichier: File): boolean {
  if (TYPES_OK.has(fichier.type)) {
    return true;
  }
  return /\.(pdf|png|jpe?g|webp)$/i.test(fichier.name);
}

export function cheminPreuve(nomFichier: string): string {
  return path.join(DOSSIER_PREUVES, nomFichier);
}

export function nomFichierPreuve(companyId: number, originalName: string): string {
  const base = originalName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  const aExtension = /\.(pdf|png|jpe?g|webp)$/i.test(base);
  const ext = aExtension ? "" : ".pdf";
  return `${companyId}-${Date.now()}-${base}${ext}`;
}

export async function enregistrerPreuve(
  companyId: number,
  buffer: Buffer,
  originalName: string,
): Promise<string> {
  await mkdir(DOSSIER_PREUVES, { recursive: true });
  const nom = nomFichierPreuve(companyId, originalName);
  await writeFile(cheminPreuve(nom), buffer);
  return nom;
}

export function urlApiPreuve(nomFichier: string): string {
  return `/api/entreprise/reclamation/preuve/${encodeURIComponent(nomFichier)}`;
}

export function typeMimePreuve(nomFichier: string): string {
  const lower = nomFichier.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  return "application/pdf";
}
