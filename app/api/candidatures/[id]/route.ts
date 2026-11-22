/**
 * @fileoverview PATCH /api/candidatures/[id] — maj statut (recruteur).
 *
 * But
 *   Pipeline : en_etude, entretien, acceptée, refus… JWT entreprise.
 */
import { NextRequest } from "next/server";
import { jsonErreur, utilisateurDepuisRequete } from "@/lib/auth-serveur";
import { getDb, type ResultSetHeader, type RowDataPacket } from "@/lib/db";
import type { EntretienCandidature, StatutCandidature } from "@/types/candidature";

const STATUTS: StatutCandidature[] = [
  "envoyee",
  "en_etude",
  "entretien",
  "acceptee",
  "refusee",
];

type CorpsPatch = {
  statut?: StatutCandidature;
  motifRefus?: string;
  entretien?: EntretienCandidature | null;
};

/**
 * PATCH /api/candidatures/:id
 * Recruteur : met à jour statut / entretien / motif de refus
 * (uniquement si la candidature appartient à une offre de sa boîte).
 */
export async function PATCH(
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

  let corps: CorpsPatch;
  try {
    corps = await req.json();
  } catch {
    return jsonErreur("JSON invalide", 400);
  }

  try {
    const db = getDb();

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT ap.id
       FROM applications ap
       JOIN advertisement a ON a.id = ap.advertisement_id
       WHERE ap.id = :id AND a.company_id = :companyId
       LIMIT 1`,
      { id, companyId: user.companyId },
    );
    if (rows.length === 0) {
      return jsonErreur("Candidature introuvable", 404);
    }

    const champs: string[] = [];
    const params: Record<string, string | number | null> = { id };

    if (corps.statut) {
      if (!STATUTS.includes(corps.statut)) {
        return jsonErreur("Statut invalide", 400);
      }
      champs.push("status = :statut");
      params.statut = corps.statut;
    }

    if (corps.motifRefus !== undefined) {
      champs.push("motif_refus = :motifRefus");
      params.motifRefus = corps.motifRefus.trim();
    }

    if (corps.entretien !== undefined) {
      if (corps.entretien === null) {
        champs.push(
          "entretien_date = NULL",
          "entretien_heure = ''",
          "entretien_modalite = NULL",
          "entretien_note = NULL",
        );
      } else {
        const e = corps.entretien;
        champs.push(
          "entretien_date = :entretienDate",
          "entretien_heure = :entretienHeure",
          "entretien_modalite = :entretienModalite",
          "entretien_note = :entretienNote",
        );
        params.entretienDate = e.date || null;
        params.entretienHeure = e.heure || "";
        params.entretienModalite = e.modalite;
        params.entretienNote = e.note || "";
      }
    }

    if (champs.length === 0) {
      return jsonErreur("Aucun champ à mettre à jour", 400);
    }

    await db.query<ResultSetHeader>(
      `UPDATE applications SET ${champs.join(", ")} WHERE id = :id`,
      params,
    );

    return Response.json({ message: "Candidature mise à jour" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return jsonErreur(message, 500);
  }
}
