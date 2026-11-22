/**
 * @fileoverview POST commentaire interne sur une candidature.
 *
 * But
 *   Notes recruteur invisibles du candidat.
 */
import { NextRequest } from "next/server";
import { jsonErreur, utilisateurDepuisRequete } from "@/lib/auth-serveur";
import { getDb, type ResultSetHeader, type RowDataPacket } from "@/lib/db";
import { dateIso } from "@/lib/mappers";

/**
 * POST /api/candidatures/:id/commentaires
 * Note interne recruteur (visible dans le pipeline).
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
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

  const { id: idBrut } = await context.params;
  const id = Number(idBrut);
  if (!Number.isFinite(id)) {
    return jsonErreur("Identifiant invalide", 400);
  }

  let corps: { texte?: string };
  try {
    corps = await req.json();
  } catch {
    return jsonErreur("JSON invalide", 400);
  }
  const texte = corps.texte?.trim() || "";
  if (!texte) {
    return jsonErreur("Texte obligatoire", 400);
  }

  try {
    const db = getDb();

    const [apps] = await db.query<RowDataPacket[]>(
      `SELECT ap.id, c.name AS company_name
       FROM applications ap
       JOIN advertisement a ON a.id = ap.advertisement_id
       JOIN companies c ON c.id = a.company_id
       WHERE ap.id = :id AND a.company_id = :companyId
       LIMIT 1`,
      { id, companyId: user.companyId },
    );
    if (apps.length === 0) {
      return jsonErreur("Candidature introuvable", 404);
    }

    const auteur = String(apps[0].company_name);
    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO application_comments (application_id, author_name, texte)
       VALUES (:appId, :auteur, :texte)`,
      { appId: id, auteur, texte },
    );

    return Response.json(
      {
        commentaire: {
          id: result.insertId,
          auteur,
          texte,
          date: dateIso(new Date()),
        },
      },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return jsonErreur(message, 500);
  }
}
