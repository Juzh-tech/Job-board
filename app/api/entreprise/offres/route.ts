/**
 * @fileoverview GET/POST /api/entreprise/offres — offres de ma boîte.
 *
 * But
 *   Lister / publier (entreprise validée). Draft possible.
 */
import { NextRequest } from "next/server";
import { jsonErreur, utilisateurDepuisRequete } from "@/lib/auth-serveur";
import { getDb, type ResultSetHeader, type RowDataPacket } from "@/lib/db";
import { offreDepuisLigne } from "@/lib/mappers";
import { TYPES_CONTRAT, type TypeContrat } from "@/types/offre";

const CONTRATS: TypeContrat[] = TYPES_CONTRAT;

function exigerEntreprise(req: NextRequest) {
  const user = utilisateurDepuisRequete(req);
  if (!user) {
    return { error: jsonErreur("Connexion requise", 401) };
  }
  if (user.role !== "entreprise" && user.role !== "admin") {
    return { error: jsonErreur("Réservé aux comptes entreprise", 403) };
  }
  if (!user.companyId) {
    return { error: jsonErreur("Aucune entreprise liée à ce compte", 403) };
  }
  return { user };
}

/**
 * GET /api/entreprise/offres
 * Toutes les offres de la boîte (y compris draft / closed), pas seulement le board public.
 */
export async function GET(req: NextRequest) {
  const gate = exigerEntreprise(req);
  if ("error" in gate && gate.error) {
    return gate.error;
  }
  const { user } = gate;

  try {
    const db = getDb();
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT
         a.id, a.title, a.short_description, a.full_description,
         a.salary, a.location, a.working_time, a.contract_type, a.published_at,
         a.is_active,
         c.id AS company_id, c.name AS company_name, c.secteur AS company_secteur,
         c.city AS company_city, c.presentation AS company_presentation
       FROM advertisement a
       JOIN companies c ON c.id = a.company_id
       WHERE a.company_id = :companyId
       ORDER BY a.published_at DESC`,
      { companyId: user!.companyId },
    );
    return Response.json({
      offres: rows.map((ligne) => offreDepuisLigne(ligne as never)),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return jsonErreur(message, 500);
  }
}

/**
 * POST /api/entreprise/offres
 * Publie une offre (status = published). Bloqué si l'entreprise n'est pas validée.
 */
export async function POST(req: NextRequest) {
  const gate = exigerEntreprise(req);
  if ("error" in gate && gate.error) {
    return gate.error;
  }
  const { user } = gate;

  let corps: {
    titre?: string;
    descriptionCourte?: string;
    descriptionComplete?: string;
    salaire?: string;
    lieu?: string;
    tempsTravail?: string;
    typeContrat?: string;
  };
  try {
    corps = await req.json();
  } catch {
    return jsonErreur("JSON invalide", 400);
  }

  const titre = corps.titre?.trim() || "";
  const descriptionCourte = corps.descriptionCourte?.trim() || "";
  const descriptionComplete = corps.descriptionComplete?.trim() || "";
  const salaire = corps.salaire?.trim() || "";
  const lieu = corps.lieu?.trim() || "";
  const tempsTravail = corps.tempsTravail?.trim() || "";
  const typeContrat = corps.typeContrat?.trim() as TypeContrat | undefined;

  if (!titre || !descriptionCourte || !descriptionComplete || !lieu) {
    return jsonErreur("Titre, descriptions et lieu sont obligatoires", 400);
  }
  if (!typeContrat || !CONTRATS.includes(typeContrat)) {
    return jsonErreur("Type de contrat invalide", 400);
  }

  try {
    const db = getDb();

    const [companies] = await db.query<RowDataPacket[]>(
      "SELECT verification_status FROM companies WHERE id = :id LIMIT 1",
      { id: user!.companyId },
    );
    if (companies.length === 0) {
      return jsonErreur("Entreprise introuvable", 404);
    }
    if (companies[0].verification_status !== "validee") {
      return jsonErreur("Votre entreprise doit être validée pour publier", 403);
    }

    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO advertisement
        (company_id, title, short_description, full_description, salary,
         location, working_time, contract_type, status, is_active, created_by)
       VALUES
        (:companyId, :titre, :courte, :complete, :salaire,
         :lieu, :temps, :contrat, 'published', TRUE, :createdBy)`,
      {
        companyId: user!.companyId,
        titre,
        courte: descriptionCourte,
        complete: descriptionComplete,
        salaire,
        lieu,
        temps: tempsTravail,
        contrat: typeContrat,
        createdBy: user!.id,
      },
    );

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT
         a.id, a.title, a.short_description, a.full_description,
         a.salary, a.location, a.working_time, a.contract_type, a.published_at,
         c.id AS company_id, c.name AS company_name, c.secteur AS company_secteur,
         c.city AS company_city, c.presentation AS company_presentation
       FROM advertisement a
       JOIN companies c ON c.id = a.company_id
       WHERE a.id = :id
       LIMIT 1`,
      { id: result.insertId },
    );

    return Response.json(
      {
        message: "Offre publiée",
        offre: offreDepuisLigne(rows[0] as never),
      },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return jsonErreur(message, 500);
  }
}
