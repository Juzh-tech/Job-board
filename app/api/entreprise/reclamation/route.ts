/**
 * @fileoverview POST réclamation si entreprise refusée.
 *
 * But
 *   Remettre le dossier en_attente avec message + preuve uploadée pour l’admin.
 */
import { NextRequest } from "next/server";
import {
  jsonErreur,
  utilisateurDepuisRequete,
} from "@/lib/auth-serveur";
import { getDb, type ResultSetHeader, type RowDataPacket } from "@/lib/db";
import { entrepriseDepuisLigne } from "@/lib/mappers";
import {
  enregistrerPreuve,
  preuveEstAcceptee,
  TAILLE_MAX_PREUVE,
} from "@/lib/preuve-reclamation-stockage";
import { ecrireReclamation, motifPrecedentDepuisChamp } from "@/lib/reclamation";

/**
 * POST /api/entreprise/reclamation
 * multipart : message, telephone, preuve? (PDF / image)
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

  const message = String(form.get("message") || "").trim();
  const telephone = String(form.get("telephone") || "").trim();
  const fichier = form.get("preuve");
  if (!message || !telephone) {
    return jsonErreur("Message et téléphone obligatoires", 400);
  }

  try {
    const db = getDb();
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT id, verification_status, motif_refus FROM companies WHERE id = :id LIMIT 1",
      { id: user.companyId },
    );
    if (rows.length === 0) {
      return jsonErreur("Entreprise introuvable", 404);
    }
    if (rows[0].verification_status !== "refusee") {
      return jsonErreur("Réclamation réservée aux dossiers refusés", 400);
    }

    let preuveNom = "";
    if (fichier instanceof File && fichier.size > 0) {
      if (!preuveEstAcceptee(fichier)) {
        return jsonErreur("Preuve : PDF, PNG, JPG ou WebP uniquement", 400);
      }
      if (fichier.size > TAILLE_MAX_PREUVE) {
        return jsonErreur("Preuve trop volumineuse (5 Mo max.)", 400);
      }
      const buffer = Buffer.from(await fichier.arrayBuffer());
      preuveNom = await enregistrerPreuve(user.companyId, buffer, fichier.name);
    }

    const motif = ecrireReclamation({
      telephone,
      preuve: preuveNom,
      message,
      motifPrecedent: motifPrecedentDepuisChamp(String(rows[0].motif_refus || "")),
    });

    await db.query<ResultSetHeader>(
      `UPDATE companies
       SET verification_status = 'en_attente', motif_refus = :motif
       WHERE id = :id`,
      { motif, id: user.companyId },
    );

    const [maj] = await db.query<RowDataPacket[]>(
      `SELECT id, name, secteur, city, website, presentation,
              verification_status, motif_refus, contact_nom, contact_email, created_at,
              logo_filename
       FROM companies WHERE id = :id LIMIT 1`,
      { id: user.companyId },
    );

    return Response.json({
      message: "Réclamation enregistrée — dossier remis en attente",
      entreprise: entrepriseDepuisLigne(maj[0] as never),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur serveur";
    return jsonErreur(msg, 500);
  }
}
