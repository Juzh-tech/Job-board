/**
 * @fileoverview GET/PATCH /api/entreprise/me — profil boîte du JWT.
 *
 * But
 *   Gate en_attente / refusee / validee + édition infos / logo metadata.
 */
import { NextRequest } from "next/server";
import { jsonErreur, utilisateurDepuisRequete } from "@/lib/auth-serveur";
import { getDb, type ResultSetHeader, type RowDataPacket } from "@/lib/db";
import { entrepriseDepuisLigne } from "@/lib/mappers";

/**
 * GET /api/entreprise/me
 * Profil de l'entreprise liée au JWT (gate en_attente / refusee / validee).
 */
export async function GET(req: NextRequest) {
  const user = utilisateurDepuisRequete(req);
  if (!user) {
    return jsonErreur("Connexion requise", 401);
  }
  if (user.role !== "entreprise" && user.role !== "admin") {
    return jsonErreur("Réservé aux comptes entreprise", 403);
  }
  if (!user.companyId) {
    return jsonErreur("Aucune entreprise liée à ce compte", 403);
  }

  try {
    const db = getDb();
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT id, name, secteur, city, website, presentation, logo_filename,
              verification_status, motif_refus, contact_nom, contact_email, created_at
       FROM companies
       WHERE id = :id
       LIMIT 1`,
      { id: user.companyId },
    );
    if (rows.length === 0) {
      return jsonErreur("Entreprise introuvable", 404);
    }
    return Response.json({
      entreprise: entrepriseDepuisLigne(rows[0] as never),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return jsonErreur(message, 500);
  }
}

/** PATCH /api/entreprise/me — infos entreprise (nom, secteur, ville, site, présentation). */
export async function PATCH(req: NextRequest) {
  const user = utilisateurDepuisRequete(req);
  if (!user || user.role !== "entreprise" || !user.companyId) {
    return jsonErreur("Accès recruteur requis", 403);
  }

  let corps: {
    nom?: string;
    secteur?: string;
    ville?: string;
    siteWeb?: string;
    presentation?: string;
    contactNom?: string;
    contactEmail?: string;
  };
  try {
    corps = await req.json();
  } catch {
    return jsonErreur("JSON invalide", 400);
  }

  try {
    const db = getDb();
    const champs: string[] = [];
    const params: Record<string, string | number> = { id: user.companyId };

    if (corps.nom?.trim()) {
      champs.push("name = :nom");
      params.nom = corps.nom.trim();
    }
    if (corps.secteur !== undefined) {
      champs.push("secteur = :secteur");
      params.secteur = corps.secteur.trim();
    }
    if (corps.ville !== undefined) {
      champs.push("city = :ville");
      params.ville = corps.ville.trim();
    }
    if (corps.siteWeb !== undefined) {
      champs.push("website = :site");
      params.site = corps.siteWeb.trim();
    }
    if (corps.presentation !== undefined) {
      champs.push("presentation = :presentation");
      params.presentation = corps.presentation.trim();
    }
    if (corps.contactNom !== undefined) {
      champs.push("contact_nom = :contactNom");
      params.contactNom = corps.contactNom.trim();
    }
    if (corps.contactEmail !== undefined) {
      champs.push("contact_email = :contactEmail");
      params.contactEmail = corps.contactEmail.trim();
    }

    if (champs.length === 0) {
      return jsonErreur("Aucun champ à mettre à jour", 400);
    }

    await db.query<ResultSetHeader>(
      `UPDATE companies SET ${champs.join(", ")} WHERE id = :id`,
      params,
    );

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT id, name, secteur, city, website, presentation, logo_filename,
              verification_status, motif_refus, contact_nom, contact_email, created_at
       FROM companies WHERE id = :id LIMIT 1`,
      { id: user.companyId },
    );

    return Response.json({
      message: "Entreprise mise à jour",
      entreprise: entrepriseDepuisLigne(rows[0] as never),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return jsonErreur(message, 500);
  }
}
