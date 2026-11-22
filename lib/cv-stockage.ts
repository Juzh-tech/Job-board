/**
 * @fileoverview Stockage disque des CV (uploads/cv).
 *
 * But
 *   Écrire / résoudre le chemin d'un PDF. MySQL ne garde que le nom de fichier.
 */
/**
 * Stockage local des CV PDF (hors public pour éviter le listing).
 * Servis via GET /api/cv/[fichier].
 */
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export const DOSSIER_CV = path.join(process.cwd(), "uploads", "cv");
export const TAILLE_MAX_CV = 5 * 1024 * 1024; // 5 Mo

export function cheminCv(nomFichier: string): string {
  return path.join(DOSSIER_CV, nomFichier);
}

export function nomFichierCvSur(userId: number, originalName: string): string {
  const base = originalName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  const ext = base.toLowerCase().endsWith(".pdf") ? "" : ".pdf";
  return `${userId}-${Date.now()}-${base}${ext}`;
}

export async function enregistrerCvPdf(
  userId: number,
  buffer: Buffer,
  originalName: string,
): Promise<string> {
  await mkdir(DOSSIER_CV, { recursive: true });
  const nom = nomFichierCvSur(userId, originalName);
  await writeFile(cheminCv(nom), buffer);
  return nom;
}

export function urlApiCv(nomFichier: string): string {
  return `/api/cv/${encodeURIComponent(nomFichier)}`;
}
