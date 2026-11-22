/**
 * @fileoverview Types métier d'une candidature.
 *
 * But
 *   Shape partagé API / mappers / écrans (pipeline, entretien, commentaires).
 *   Si front et back divergent sur une candidature, commence ici.
 */
export type StatutCandidature =
  | "envoyee"
  | "en_etude"
  | "entretien"
  | "acceptee"
  | "refusee";

export const LIBELLES_STATUT: Record<StatutCandidature, string> = {
  envoyee: "Reçue",
  en_etude: "En étude",
  entretien: "Entretien",
  acceptee: "Validée",
  refusee: "Refusée",
};

/** Étapes affichées dans le parcours (ordre). */
export const ETAPES_PARCOURS: StatutCandidature[] = [
  "envoyee",
  "en_etude",
  "entretien",
  "acceptee",
];

export type CommentaireCandidature = {
  id: number;
  texte: string;
  date: string;
  auteur: string;
};

export type EntretienCandidature = {
  date: string;
  heure: string;
  modalite: "visio" | "telephone" | "presentiel";
  note: string;
};

export type Candidature = {
  id: number;
  offreId: number;
  titreOffre: string;
  nomEntreprise: string;
  nomCandidat: string;
  emailCandidat: string;
  telephoneCandidat: string;
  message: string;
  nomFichierCv: string;
  statut: StatutCandidature;
  dateEnvoi: string;
  commentaires: CommentaireCandidature[];
  entretien: EntretienCandidature | null;
  motifRefus: string;
};
