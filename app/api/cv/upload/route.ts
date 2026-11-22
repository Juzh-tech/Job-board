/**
 * @fileoverview POST /api/cv/upload — upload CV candidat.
 *
 * SECURITY
 *   JWT + vérif type/taille fichier avant écriture disque.
 */
import { NextRequest } from "next/server";
import {
  jsonErreur,
  utilisateurDepuisRequete,
} from "@/lib/auth-serveur";
import { enregistrerCvPdf, TAILLE_MAX_CV, urlApiCv } from "@/lib/cv-stockage";
import { getDb, type ResultSetHeader } from "@/lib/db";

/**
 * POST /api/cv/upload (multipart)
 * Enregistre le PDF et met à jour people.cv_filename.
 */
export async function POST(req: NextRequest) {
  const user = utilisateurDepuisRequete(req);
  if (!user) {
    return jsonErreur("Connexion requise", 401);
  }
  if (user.role !== "candidat" && user.role !== "admin") {
    return jsonErreur("Réservé aux candidats", 403);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return jsonErreur("Formulaire invalide", 400);
  }

  const fichier = form.get("cv");
  if (!(fichier instanceof File)) {
    return jsonErreur("Fichier CV manquant", 400);
  }
  if (fichier.type !== "application/pdf" && !fichier.name.toLowerCase().endsWith(".pdf")) {
    return jsonErreur("Le CV doit être un PDF", 400);
  }
  if (fichier.size > TAILLE_MAX_CV) {
    return jsonErreur("CV trop volumineux (5 Mo max.)", 400);
  }

  try {
    const buffer = Buffer.from(await fichier.arrayBuffer());
    const nom = await enregistrerCvPdf(user.id, buffer, fichier.name);
    const db = getDb();
    await db.query<ResultSetHeader>(
      "UPDATE people SET cv_filename = :nom WHERE id = :id",
      { nom, id: user.id },
    );

    return Response.json({
      message: "CV enregistré",
      filename: nom,
      url: urlApiCv(nom),
      originalName: fichier.name,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return jsonErreur(message, 500);
  }
}
