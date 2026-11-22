/**
 * @fileoverview GET /api/offres/[id] — détail d'une offre.
 *
 * But
 *   Fiche complète pour le panneau détail / "en savoir plus".
 */
import { jsonErreur } from "@/lib/auth-serveur";
import { getDb, type RowDataPacket } from "@/lib/db";
import { offreDepuisLigne } from "@/lib/mappers";

type Contexte = { params: Promise<{ id: string }> };

/** GET /api/offres/:id */
export async function GET(_req: Request, contexte: Contexte) {
  const { id } = await contexte.params;
  const offreId = Number(id);
  if (!Number.isFinite(offreId)) {
    return jsonErreur("Identifiant invalide", 400);
  }

  try {
    const db = getDb();
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT
         a.id, a.title, a.short_description, a.full_description,
         a.salary, a.location, a.working_time, a.contract_type, a.published_at,
         c.id AS company_id, c.name AS company_name, c.secteur AS company_secteur,
         c.city AS company_city, c.presentation AS company_presentation
       FROM advertisement a
       JOIN companies c ON c.id = a.company_id
       WHERE a.id = :id
         AND a.status = 'published'
         AND a.is_active = TRUE
         AND c.verification_status = 'validee'
       LIMIT 1`,
      { id: offreId },
    );

    if (rows.length === 0) {
      return jsonErreur("Offre introuvable", 404);
    }

    return Response.json({
      offre: offreDepuisLigne(rows[0] as never),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return jsonErreur(message, 500);
  }
}
