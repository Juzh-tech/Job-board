/**
 * @fileoverview POST upload logo entreprise.
 *
 * But
 *   Fichier sur disque + nom en base (logo_filename).
 */
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextRequest } from "next/server";
import {
  jsonErreur,
  utilisateurDepuisRequete,
} from "@/lib/auth-serveur";
import { getDb, type ResultSetHeader } from "@/lib/db";

const DOSSIER = path.join(process.cwd(), "uploads", "logos");
const MAX = 2 * 1024 * 1024;

/**
 * POST /api/entreprise/logo/upload
 * Image PNG/JPEG/WebP → companies.logo_filename
 */
export async function POST(req: NextRequest) {
  const user = utilisateurDepuisRequete(req);
  if (!user || user.role !== "entreprise" || !user.companyId) {
    return jsonErreur("Accès recruteur requis", 403);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return jsonErreur("Formulaire invalide", 400);
  }

  const fichier = form.get("logo");
  if (!(fichier instanceof File)) {
    return jsonErreur("Fichier logo manquant", 400);
  }
  const okType =
    ["image/png", "image/jpeg", "image/webp", "image/gif"].includes(fichier.type) ||
    /\.(png|jpe?g|webp|gif)$/i.test(fichier.name);
  if (!okType) {
    return jsonErreur("Logo : PNG, JPG ou WebP uniquement", 400);
  }
  if (fichier.size > MAX) {
    return jsonErreur("Logo trop volumineux (2 Mo max.)", 400);
  }

  try {
    await mkdir(DOSSIER, { recursive: true });
    const ext = fichier.name.split(".").pop()?.toLowerCase() || "png";
    const nom = `${user.companyId}-${Date.now()}.${ext}`;
    await writeFile(path.join(DOSSIER, nom), Buffer.from(await fichier.arrayBuffer()));

    const db = getDb();
    await db.query<ResultSetHeader>(
      "UPDATE companies SET logo_filename = :nom WHERE id = :id",
      { nom, id: user.companyId },
    );

    return Response.json({
      message: "Logo enregistré",
      filename: nom,
      url: `/api/entreprise/logo/${encodeURIComponent(nom)}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return jsonErreur(message, 500);
  }
}
