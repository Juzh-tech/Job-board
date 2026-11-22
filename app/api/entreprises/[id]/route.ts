/**
 * @fileoverview GET /api/entreprises/[id] — fiche publique entreprise.
 */
import { NextRequest } from "next/server";
import { jsonErreur } from "@/lib/auth-serveur";
import { getDb, type RowDataPacket } from "@/lib/db";
import { offreDepuisLigne } from "@/lib/mappers";

/**
 * GET /api/entreprises/:id
 * Fiche publique : entreprise validée + ses offres published.
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id: idBrut } = await context.params;
  const id = Number(idBrut);
  if (!Number.isFinite(id)) {
    return jsonErreur("Identifiant invalide", 400);
  }

  try {
    const db = getDb();
    const [companies] = await db.query<RowDataPacket[]>(
      `SELECT id, name, secteur, city, website, presentation, verification_status, logo_filename
       FROM companies
       WHERE id = :id AND verification_status = 'validee'
       LIMIT 1`,
      { id },
    );
    if (companies.length === 0) {
      return jsonErreur("Entreprise introuvable", 404);
    }
    const c = companies[0];
    const logo = c.logo_filename ? String(c.logo_filename) : "";

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT
         a.id, a.title, a.short_description, a.full_description,
         a.salary, a.location, a.working_time, a.contract_type, a.published_at,
         a.is_active,
         c.id AS company_id, c.name AS company_name, c.secteur AS company_secteur,
         c.city AS company_city, c.presentation AS company_presentation,
         c.logo_filename AS company_logo
       FROM advertisement a
       JOIN companies c ON c.id = a.company_id
       WHERE a.company_id = :id
         AND a.status = 'published'
         AND a.is_active = TRUE
       ORDER BY a.published_at DESC`,
      { id },
    );

    return Response.json({
      entreprise: {
        id: Number(c.id),
        nom: String(c.name),
        secteur: String(c.secteur || ""),
        ville: String(c.city || ""),
        siteWeb: String(c.website || ""),
        presentation: String(c.presentation || ""),
        logoUrl: logo ? `/api/entreprise/logo/${encodeURIComponent(logo)}` : null,
      },
      offres: rows.map((ligne) => offreDepuisLigne(ligne as never)),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return jsonErreur(message, 500);
  }
}
