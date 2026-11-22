/**
 * @fileoverview PATCH /api/entreprise/offres/[id] — maj / retrait offre.
 *
 * But
 *   Éditer ou retirer du marché (is_active / status) pour SA boîte uniquement.
 */
import { NextRequest } from "next/server";
import {
  jsonErreur,
  utilisateurDepuisRequete,
} from "@/lib/auth-serveur";
import { getDb, type ResultSetHeader, type RowDataPacket } from "@/lib/db";
import { offreDepuisLigne } from "@/lib/mappers";
import { TYPES_CONTRAT, type TypeContrat } from "@/types/offre";

const CONTRATS: TypeContrat[] = TYPES_CONTRAT;

function exigerEntreprise(req: NextRequest) {
  const user = utilisateurDepuisRequete(req);
  if (!user || (user.role !== "entreprise" && user.role !== "admin")) {
    return { error: jsonErreur("Accès recruteur requis", 403) };
  }
  if (!user.companyId && user.role === "entreprise") {
    return { error: jsonErreur("Entreprise non liée", 403) };
  }
  return { user };
}

/**
 * PATCH /api/entreprise/offres/:id
 * Met à jour une offre de la boîte connectée.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const gate = exigerEntreprise(req);
  if ("error" in gate && gate.error) {
    return gate.error;
  }
  const { user } = gate;
  const id = Number((await params).id);
  if (!Number.isFinite(id)) {
    return jsonErreur("Identifiant invalide", 400);
  }

  let corps: {
    titre?: string;
    descriptionCourte?: string;
    descriptionComplete?: string;
    salaire?: string;
    lieu?: string;
    tempsTravail?: string;
    typeContrat?: string;
    active?: boolean;
  };
  try {
    corps = await req.json();
  } catch {
    return jsonErreur("JSON invalide", 400);
  }

  const titre = corps.titre?.trim();
  const descriptionCourte = corps.descriptionCourte?.trim();
  const descriptionComplete = corps.descriptionComplete?.trim();
  const salaire = corps.salaire?.trim();
  const lieu = corps.lieu?.trim();
  const tempsTravail = corps.tempsTravail?.trim();
  const typeContrat = corps.typeContrat?.trim() as TypeContrat | undefined;
  const active = corps.active;

  if (titre !== undefined && !titre) {
    return jsonErreur("Titre invalide", 400);
  }
  if (descriptionCourte !== undefined && !descriptionCourte) {
    return jsonErreur("Profil recherché invalide", 400);
  }
  if (descriptionComplete !== undefined && !descriptionComplete) {
    return jsonErreur("Description invalide", 400);
  }
  if (lieu !== undefined && !lieu) {
    return jsonErreur("Lieu invalide", 400);
  }
  if (typeContrat !== undefined && !CONTRATS.includes(typeContrat)) {
    return jsonErreur("Type de contrat invalide", 400);
  }

  try {
    const db = getDb();
    const [existantes] = await db.query<RowDataPacket[]>(
      `SELECT id, company_id FROM advertisement
       WHERE id = :id AND company_id = :companyId LIMIT 1`,
      { id, companyId: user!.companyId },
    );
    if (existantes.length === 0) {
      return jsonErreur("Offre introuvable", 404);
    }

    const champs: string[] = [];
    const paramsSql: Record<string, string | number | boolean> = {
      id,
      companyId: user!.companyId!,
    };

    if (titre !== undefined) {
      champs.push("title = :titre");
      paramsSql.titre = titre;
    }
    if (descriptionCourte !== undefined) {
      champs.push("short_description = :courte");
      paramsSql.courte = descriptionCourte;
    }
    if (descriptionComplete !== undefined) {
      champs.push("full_description = :complete");
      paramsSql.complete = descriptionComplete;
    }
    if (salaire !== undefined) {
      champs.push("salary = :salaire");
      paramsSql.salaire = salaire;
    }
    if (lieu !== undefined) {
      champs.push("location = :lieu");
      paramsSql.lieu = lieu;
    }
    if (tempsTravail !== undefined) {
      champs.push("working_time = :temps");
      paramsSql.temps = tempsTravail;
    }
    if (typeContrat !== undefined) {
      champs.push("contract_type = :contrat");
      paramsSql.contrat = typeContrat;
    }
    if (active !== undefined) {
      champs.push("is_active = :active");
      paramsSql.active = active ? 1 : 0;
    }

    if (champs.length === 0) {
      return jsonErreur("Aucun champ à mettre à jour", 400);
    }

    await db.query<ResultSetHeader>(
      `UPDATE advertisement SET ${champs.join(", ")}
       WHERE id = :id AND company_id = :companyId`,
      paramsSql,
    );

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT
         a.id, a.title, a.short_description, a.full_description,
         a.salary, a.location, a.working_time, a.contract_type, a.published_at,
         a.is_active,
         c.id AS company_id, c.name AS company_name, c.secteur AS company_secteur,
         c.city AS company_city, c.presentation AS company_presentation
       FROM advertisement a
       JOIN companies c ON c.id = a.company_id
       WHERE a.id = :id
       LIMIT 1`,
      { id },
    );

    return Response.json({
      message: "Offre mise à jour",
      offre: offreDepuisLigne(rows[0] as never),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return jsonErreur(message, 500);
  }
}
