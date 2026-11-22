/**
 * @fileoverview GET/POST /api/candidatures — côté candidat.
 *
 * But
 *   Lister mes candidatures / postuler. JWT role candidat (ou admin).
 */
import { NextRequest } from "next/server";
import { jsonErreur, utilisateurDepuisRequete } from "@/lib/auth-serveur";
import {
  candidatureDepuisLigne,
  SELECT_CANDIDATURE_DETAIL,
  type LigneCandidature,
} from "@/lib/candidatures-requetes";
import { getDb, type ResultSetHeader, type RowDataPacket } from "@/lib/db";
import { dateIso } from "@/lib/mappers";

/**
 * GET /api/candidatures
 * - Candidat connecté : ses propres candidatures
 * - Query ?idsOnly=1 : uniquement les offreId (pour « Déjà postulé »)
 */
export async function GET(req: NextRequest) {
  const user = utilisateurDepuisRequete(req);
  if (!user) {
    return jsonErreur("Connexion requise", 401);
  }

  const idsOnly = new URL(req.url).searchParams.get("idsOnly") === "1";

  try {
    const db = getDb();

    if (idsOnly) {
      const [rows] = await db.query<RowDataPacket[]>(
        "SELECT advertisement_id AS offreId FROM applications WHERE people_id = :peopleId",
        { peopleId: user.id },
      );
      return Response.json({
        offreIds: rows.map((r) => Number(r.offreId)),
      });
    }

    const [rows] = await db.query<LigneCandidature[]>(
      `${SELECT_CANDIDATURE_DETAIL}
       WHERE ap.people_id = :peopleId
       ORDER BY ap.applied_at DESC`,
      { peopleId: user.id },
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

/**
 * POST /api/candidatures
 * Corps : { offreId, message?, cvFilename? }
 * Le people_id vient du JWT (pas du corps) pour éviter d'usurper un compte.
 */
export async function POST(req: NextRequest) {
  const user = utilisateurDepuisRequete(req);
  if (!user) {
    return jsonErreur("Connexion requise pour postuler", 401);
  }
  if (user.role !== "candidat" && user.role !== "admin") {
    return jsonErreur("Seuls les candidats peuvent postuler", 403);
  }

  let corps: { offreId?: number; message?: string; cvFilename?: string };
  try {
    corps = await req.json();
  } catch {
    return jsonErreur("JSON invalide", 400);
  }

  const offreId = Number(corps.offreId);
  if (!Number.isFinite(offreId)) {
    return jsonErreur("offreId invalide", 400);
  }

  try {
    const db = getDb();

    const [offres] = await db.query<RowDataPacket[]>(
      `SELECT a.id
       FROM advertisement a
       JOIN companies c ON c.id = a.company_id
       WHERE a.id = :id AND a.status = 'published' AND a.is_active = TRUE
         AND c.verification_status = 'validee'
       LIMIT 1`,
      { id: offreId },
    );
    if (offres.length === 0) {
      return jsonErreur("Offre introuvable ou non publiée", 404);
    }

    const [existantes] = await db.query<RowDataPacket[]>(
      `SELECT id FROM applications
       WHERE people_id = :peopleId AND advertisement_id = :offreId
       LIMIT 1`,
      { peopleId: user.id, offreId },
    );
    if (existantes.length > 0) {
      return jsonErreur("Vous avez déjà postulé à cette offre", 409);
    }

    const [profil] = await db.query<RowDataPacket[]>(
      "SELECT cv_filename, phone, first_name, last_name FROM people WHERE id = :id",
      { id: user.id },
    );
    const cvFilename =
      corps.cvFilename?.trim() ||
      (profil[0]?.cv_filename as string | null) ||
      "";

    if (!cvFilename) {
      return jsonErreur("Un CV est obligatoire pour postuler", 400);
    }

    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO applications
        (advertisement_id, people_id, message, cv_filename, status)
       VALUES
        (:offreId, :peopleId, :message, :cvFilename, 'envoyee')`,
      {
        offreId,
        peopleId: user.id,
        message: corps.message?.trim() || "",
        cvFilename,
      },
    );

    return Response.json(
      {
        message: "Candidature envoyée",
        id: result.insertId,
      },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return jsonErreur(message, 500);
  }
}
