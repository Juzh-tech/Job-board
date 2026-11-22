/**
 * @fileoverview GET /api/offres — liste publique filtrable.
 *
 * But
 *   Board : pays, contrat, recherche, rayon… Seulement offres visibles.
 */
import { NextRequest } from "next/server";
import { jsonErreur } from "@/lib/auth-serveur";
import { getDb, type RowDataPacket } from "@/lib/db";
import { offreDepuisLigne } from "@/lib/mappers";
import { PAYS_DEFAUT } from "@/lib/pays";

/**
 * GET /api/offres?q=&lieu=&contrat=&pays=FR
 * Offres published d'entreprises validées, filtrées par pays (marché local).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const lieu = searchParams.get("lieu")?.trim() || "";
  const contrat = searchParams.get("contrat")?.trim() || "tous";
  const pays = (searchParams.get("pays")?.trim() || PAYS_DEFAUT).toUpperCase();

  try {
    const db = getDb();
    const conditions = [
      "a.status = 'published'",
      "a.is_active = TRUE",
      "c.verification_status = 'validee'",
      "c.country_code = :pays",
    ];
    const params: Record<string, string> = { pays };

    if (q) {
      conditions.push(
        "(a.title LIKE :q OR a.short_description LIKE :q OR c.name LIKE :q)",
      );
      params.q = `%${q}%`;
    }
    if (lieu) {
      conditions.push("a.location LIKE :lieu");
      params.lieu = `%${lieu}%`;
    }
    if (contrat && contrat !== "tous") {
      conditions.push("a.contract_type = :contrat");
      params.contrat = contrat;
    }

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT
         a.id, a.title, a.short_description, a.full_description,
         a.salary, a.location, a.working_time, a.contract_type, a.published_at,
         a.is_active,
         c.id AS company_id, c.name AS company_name, c.secteur AS company_secteur,
         c.city AS company_city, c.presentation AS company_presentation,
         c.logo_filename AS company_logo,
         c.country_code AS company_country
       FROM advertisement a
       JOIN companies c ON c.id = a.company_id
       WHERE ${conditions.join(" AND ")}
       ORDER BY a.published_at DESC`,
      params,
    );

    return Response.json({
      pays,
      offres: rows.map((ligne) => offreDepuisLigne(ligne as never)),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return jsonErreur(message, 500);
  }
}
