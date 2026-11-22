/**
 * @fileoverview PATCH entreprise (valider / refuser + motif).
 *
 * But
 *   Cœur de la file de vérification admin.
 */
import { NextRequest } from "next/server";
import { exigerAdmin } from "@/lib/admin-auth";
import { jsonErreur } from "@/lib/auth-serveur";
import { getDb, type ResultSetHeader, type RowDataPacket } from "@/lib/db";
import { entrepriseDepuisLigne } from "@/lib/mappers";
import type { StatutVerificationEntreprise } from "@/types/entreprise";

const STATUTS: StatutVerificationEntreprise[] = ["en_attente", "validee", "refusee"];

/**
 * PATCH /api/admin/entreprises/:id
 * Corps : { statutVerification, motifRefus? }
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const gate = exigerAdmin(req);
  if ("error" in gate) {
    return gate.error;
  }

  const { id: idBrut } = await context.params;
  const id = Number(idBrut);
  if (!Number.isFinite(id)) {
    return jsonErreur("Identifiant invalide", 400);
  }

  let corps: { statutVerification?: StatutVerificationEntreprise; motifRefus?: string };
  try {
    corps = await req.json();
  } catch {
    return jsonErreur("JSON invalide", 400);
  }

  const statut = corps.statutVerification;
  if (!statut || !STATUTS.includes(statut)) {
    return jsonErreur("statutVerification invalide", 400);
  }
  if (statut === "refusee" && !corps.motifRefus?.trim()) {
    return jsonErreur("Un motif de refus est obligatoire", 400);
  }

  try {
    const db = getDb();
    const [exist] = await db.query<RowDataPacket[]>(
      "SELECT id FROM companies WHERE id = :id LIMIT 1",
      { id },
    );
    if (exist.length === 0) {
      return jsonErreur("Entreprise introuvable", 404);
    }

    await db.query<ResultSetHeader>(
      `UPDATE companies
       SET verification_status = :statut,
           motif_refus = :motif
       WHERE id = :id`,
      {
        id,
        statut,
        motif: statut === "refusee" ? corps.motifRefus!.trim() : "",
      },
    );

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT id, name, secteur, city, website, presentation,
              verification_status, motif_refus, contact_nom, contact_email, created_at
       FROM companies WHERE id = :id LIMIT 1`,
      { id },
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

/** DELETE /api/admin/entreprises/:id */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const gate = exigerAdmin(req);
  if ("error" in gate) {
    return gate.error;
  }

  const { id: idBrut } = await context.params;
  const id = Number(idBrut);
  if (!Number.isFinite(id)) {
    return jsonErreur("Identifiant invalide", 400);
  }

  try {
    const db = getDb();
    const [exist] = await db.query<RowDataPacket[]>(
      "SELECT id FROM companies WHERE id = :id LIMIT 1",
      { id },
    );
    if (exist.length === 0) {
      return jsonErreur("Entreprise introuvable", 404);
    }
    await db.query<ResultSetHeader>("DELETE FROM companies WHERE id = :id", { id });
    return Response.json({ message: "Entreprise supprimée" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return jsonErreur(message, 500);
  }
}
