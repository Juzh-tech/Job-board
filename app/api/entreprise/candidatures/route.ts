/**
 * @fileoverview GET candidatures reçues par mon entreprise.
 */
import { NextRequest } from "next/server";
import { jsonErreur, utilisateurDepuisRequete } from "@/lib/auth-serveur";
import {
  candidatureDepuisLigne,
  SELECT_CANDIDATURE_DETAIL,
  type LigneCandidature,
} from "@/lib/candidatures-requetes";
import { getDb, type RowDataPacket } from "@/lib/db";
import { dateIso } from "@/lib/mappers";

/**
 * GET /api/entreprise/candidatures?offreId=&statut=
 * Candidatures reçues sur les offres de la boîte du JWT.
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

  const { searchParams } = new URL(req.url);
  const offreId = searchParams.get("offreId");
  const statut = searchParams.get("statut");

  try {
    const db = getDb();
    const conditions = ["a.company_id = :companyId"];
    const params: Record<string, string | number> = { companyId: user.companyId };

    if (offreId && offreId !== "toutes") {
      conditions.push("ap.advertisement_id = :offreId");
      params.offreId = Number(offreId);
    }
    if (statut && statut !== "tous") {
      conditions.push("ap.status = :statut");
      params.statut = statut;
    }

    const [rows] = await db.query<LigneCandidature[]>(
      `${SELECT_CANDIDATURE_DETAIL}
       WHERE ${conditions.join(" AND ")}
       ORDER BY ap.applied_at DESC`,
      params,
    );

    const candidatures = [];
    for (const ligne of rows) {
      const base = candidatureDepuisLigne(ligne);
      const [coms] = await db.query<RowDataPacket[]>(
        `SELECT id, author_name, texte, created_at
         FROM application_comments
         WHERE application_id = :id
         ORDER BY created_at ASC`,
        { id: ligne.id },
      );
      base.commentaires = coms.map((c) => ({
        id: Number(c.id),
        auteur: String(c.author_name),
        texte: String(c.texte),
        date: dateIso(c.created_at as Date | string),
      }));
      candidatures.push(base);
    }

    return Response.json({ candidatures });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return jsonErreur(message, 500);
  }
}
