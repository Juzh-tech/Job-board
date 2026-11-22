/**
 * @fileoverview Requêtes SQL partagées sur les candidatures.
 *
 * But
 *   Éviter de dupliquer les gros SELECT entre routes candidat / entreprise / admin.
 */
import type { Candidature, StatutCandidature } from "@/types/candidature";
import { dateIso } from "@/lib/mappers";
import type { RowDataPacket } from "@/lib/db";

export type LigneCandidature = RowDataPacket & {
  id: number;
  advertisement_id: number;
  titre_offre: string;
  nom_entreprise: string;
  nom_candidat: string;
  email_candidat: string;
  telephone_candidat: string;
  message: string | null;
  cv_filename: string;
  status: StatutCandidature;
  motif_refus: string | null;
  entretien_date: Date | string | null;
  entretien_heure: string | null;
  entretien_modalite: "visio" | "telephone" | "presentiel" | null;
  entretien_note: string | null;
  applied_at: Date | string;
};

export const SELECT_CANDIDATURE_DETAIL = `
  SELECT
    ap.id,
    ap.advertisement_id,
    a.title AS titre_offre,
    c.name AS nom_entreprise,
    CONCAT(p.first_name, ' ', p.last_name) AS nom_candidat,
    p.email AS email_candidat,
    p.phone AS telephone_candidat,
    ap.message,
    ap.cv_filename,
    ap.status,
    ap.motif_refus,
    ap.entretien_date,
    ap.entretien_heure,
    ap.entretien_modalite,
    ap.entretien_note,
    ap.applied_at
  FROM applications ap
  JOIN people p ON p.id = ap.people_id
  JOIN advertisement a ON a.id = ap.advertisement_id
  JOIN companies c ON c.id = a.company_id
`;

export function candidatureDepuisLigne(ligne: LigneCandidature): Candidature {
  return {
    id: ligne.id,
    offreId: ligne.advertisement_id,
    titreOffre: ligne.titre_offre,
    nomEntreprise: ligne.nom_entreprise,
    nomCandidat: ligne.nom_candidat,
    emailCandidat: ligne.email_candidat,
    telephoneCandidat: ligne.telephone_candidat || "",
    message: ligne.message || "",
    nomFichierCv: ligne.cv_filename || "",
    statut: ligne.status,
    dateEnvoi: dateIso(ligne.applied_at),
    commentaires: [],
    entretien:
      ligne.entretien_date && ligne.entretien_modalite
        ? {
            date: dateIso(ligne.entretien_date),
            heure: ligne.entretien_heure || "",
            modalite: ligne.entretien_modalite,
            note: ligne.entretien_note || "",
          }
        : null,
    motifRefus: ligne.motif_refus || "",
  };
}
