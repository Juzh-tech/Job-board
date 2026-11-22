/**
 * @fileoverview Client HTTP du front vers /api/*.
 *
 * But
 *   Tous les fetch du site passent (idéalement) par ici.
 *   Si un écran appelle mal une route, regarde d'abord ce fichier.
 *
 * Idée derrière
 *   Un seul endroit pour coller le Bearer token et parser les erreurs JSON.
 */
export const API_BASE = "/api";

export type UtilisateurApi = {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  role: "candidat" | "entreprise" | "admin";
  entrepriseId: number | null;
  cvNom: string | null;
  /** Pays de rattachement (filtre offres + langue). */
  pays: string;
  ville: string;
};

export type ReponseAuth = {
  message: string;
  token: string;
  user: UtilisateurApi;
};

async function lireJson<T>(reponse: Response): Promise<T> {
  const data = (await reponse.json()) as T & { error?: string };
  if (!reponse.ok) {
    throw new Error(data.error || `Erreur HTTP ${reponse.status}`);
  }
  return data;
}

export async function apiLogin(
  email: string,
  motDePasse: string,
  siteWebEntreprise = "",
) {
  const reponse = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, motDePasse, siteWebEntreprise }),
  });
  return lireJson<ReponseAuth>(reponse);
}

export async function apiRegisterCandidat(donnees: {
  prenom: string;
  nom: string;
  email: string;
  motDePasse: string;
  telephone: string;
  pays: string;
  ville: string;
}) {
  const reponse = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...donnees, role: "candidat" }),
  });
  return lireJson<ReponseAuth>(reponse);
}

export async function apiRegisterEntreprise(donnees: {
  prenom: string;
  nom: string;
  email: string;
  motDePasse: string;
  telephone: string;
  entreprise: {
    nom: string;
    secteur: string;
    ville: string;
    pays: string;
    identifiantLocal?: string;
    siteWeb?: string;
    presentation?: string;
  };
}) {
  const reponse = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...donnees, role: "entreprise" }),
  });
  return lireJson<ReponseAuth>(reponse);
}

export async function apiListerOffres(filtres?: {
  q?: string;
  lieu?: string;
  contrat?: string;
  /** Code pays ISO : ne garde que les offres des entreprises de ce pays. */
  pays?: string;
}) {
  const params = new URLSearchParams();
  if (filtres?.q) params.set("q", filtres.q);
  if (filtres?.lieu) params.set("lieu", filtres.lieu);
  if (filtres?.contrat) params.set("contrat", filtres.contrat);
  if (filtres?.pays) params.set("pays", filtres.pays);
  const qs = params.toString();
  const reponse = await fetch(`${API_BASE}/offres${qs ? `?${qs}` : ""}`, {
    cache: "no-store",
  });
  return lireJson<{ offres: import("@/types/offre").Offre[] }>(reponse);
}

export async function apiOffreParId(id: number) {
  const reponse = await fetch(`${API_BASE}/offres/${id}`, { cache: "no-store" });
  return lireJson<{ offre: import("@/types/offre").Offre }>(reponse);
}

function enTetesAuth(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/** Candidatures du candidat connecté. */
export async function apiMesCandidatures(token: string) {
  const reponse = await fetch(`${API_BASE}/candidatures`, {
    headers: enTetesAuth(token),
    cache: "no-store",
  });
  return lireJson<{ candidatures: import("@/types/candidature").Candidature[] }>(reponse);
}

/** IDs d'offres déjà postulées (badge « Déjà postulé »). */
export async function apiOffresDejaPostulees(token: string) {
  const reponse = await fetch(`${API_BASE}/candidatures?idsOnly=1`, {
    headers: enTetesAuth(token),
    cache: "no-store",
  });
  return lireJson<{ offreIds: number[] }>(reponse);
}

/** Envoie une candidature (JWT obligatoire). */
export async function apiPostuler(
  token: string,
  donnees: { offreId: number; message?: string; cvFilename?: string },
) {
  const reponse = await fetch(`${API_BASE}/candidatures`, {
    method: "POST",
    headers: enTetesAuth(token),
    body: JSON.stringify(donnees),
  });
  return lireJson<{ message: string; id: number }>(reponse);
}

/** Profil entreprise du compte connecté (statut de vérification inclus). */
export async function apiMonEntreprise(token: string) {
  const reponse = await fetch(`${API_BASE}/entreprise/me`, {
    headers: enTetesAuth(token),
    cache: "no-store",
  });
  return lireJson<{ entreprise: import("@/types/entreprise").Entreprise }>(reponse);
}

/** Met à jour les infos de l’entreprise connectée. */
export async function apiMajEntreprise(
  token: string,
  patch: {
    nom?: string;
    secteur?: string;
    ville?: string;
    siteWeb?: string;
    presentation?: string;
    contactNom?: string;
    contactEmail?: string;
  },
) {
  const reponse = await fetch(`${API_BASE}/entreprise/me`, {
    method: "PATCH",
    headers: enTetesAuth(token),
    body: JSON.stringify(patch),
  });
  return lireJson<{
    message: string;
    entreprise: import("@/types/entreprise").Entreprise;
  }>(reponse);
}

/** Upload du logo entreprise. */
export async function apiUploadLogoEntreprise(token: string, fichier: File) {
  const form = new FormData();
  form.append("logo", fichier);
  const reponse = await fetch(`${API_BASE}/entreprise/logo/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  return lireJson<{ message: string; filename: string; url: string }>(reponse);
}

/** Offres de la boîte (espace recruteur). */
export async function apiOffresEntreprise(token: string) {
  const reponse = await fetch(`${API_BASE}/entreprise/offres`, {
    headers: enTetesAuth(token),
    cache: "no-store",
  });
  return lireJson<{ offres: import("@/types/offre").Offre[] }>(reponse);
}

type DonneesOffre = {
  titre: string;
  descriptionCourte: string;
  descriptionComplete: string;
  salaire: string;
  lieu: string;
  tempsTravail: string;
  typeContrat: string;
};

/** Publie une offre pour la boîte connectée. */
export async function apiPublierOffre(token: string, donnees: DonneesOffre) {
  const reponse = await fetch(`${API_BASE}/entreprise/offres`, {
    method: "POST",
    headers: enTetesAuth(token),
    body: JSON.stringify(donnees),
  });
  return lireJson<{
    message: string;
    offre: import("@/types/offre").Offre;
  }>(reponse);
}

/** Met à jour une offre existante de la boîte. */
export async function apiMajOffre(
  token: string,
  id: number,
  donnees: Partial<DonneesOffre> & { active?: boolean },
) {
  const reponse = await fetch(`${API_BASE}/entreprise/offres/${id}`, {
    method: "PATCH",
    headers: enTetesAuth(token),
    body: JSON.stringify(donnees),
  });
  return lireJson<{
    message: string;
    offre: import("@/types/offre").Offre;
  }>(reponse);
}

/** Réclamation après refus admin → remet en_attente (+ preuve optionnelle). */
export async function apiReclamationEntreprise(
  token: string,
  donnees: { message: string; telephone: string; preuve?: File | null },
) {
  const form = new FormData();
  form.append("message", donnees.message);
  form.append("telephone", donnees.telephone);
  if (donnees.preuve) {
    form.append("preuve", donnees.preuve);
  }
  const reponse = await fetch(`${API_BASE}/entreprise/reclamation`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  return lireJson<{
    message: string;
    entreprise: import("@/types/entreprise").Entreprise;
  }>(reponse);
}

/** Upload d’un CV PDF — met à jour le profil et retourne le nom stocké. */
export async function apiUploadCv(token: string, fichier: File) {
  const form = new FormData();
  form.append("cv", fichier);
  const reponse = await fetch(`${API_BASE}/cv/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  return lireJson<{
    message: string;
    filename: string;
    url: string;
    originalName: string;
  }>(reponse);
}

/** Candidatures reçues sur les offres de la boîte. */
export async function apiCandidaturesEntreprise(token: string) {
  const reponse = await fetch(`${API_BASE}/entreprise/candidatures`, {
    headers: enTetesAuth(token),
    cache: "no-store",
  });
  return lireJson<{ candidatures: import("@/types/candidature").Candidature[] }>(
    reponse,
  );
}

/** Met à jour une candidature (statut, entretien, refus). */
export async function apiMajCandidature(
  token: string,
  id: number,
  patch: {
    statut?: import("@/types/candidature").StatutCandidature;
    motifRefus?: string;
    entretien?: import("@/types/candidature").EntretienCandidature | null;
  },
) {
  const reponse = await fetch(`${API_BASE}/candidatures/${id}`, {
    method: "PATCH",
    headers: enTetesAuth(token),
    body: JSON.stringify(patch),
  });
  return lireJson<{ message: string }>(reponse);
}

/** Ajoute une note interne sur une candidature. */
export async function apiCommentaireCandidature(
  token: string,
  id: number,
  texte: string,
) {
  const reponse = await fetch(`${API_BASE}/candidatures/${id}/commentaires`, {
    method: "POST",
    headers: enTetesAuth(token),
    body: JSON.stringify({ texte }),
  });
  return lireJson<{
    commentaire: import("@/types/candidature").CommentaireCandidature;
  }>(reponse);
}

/** Admin : liste des entreprises. */
export async function apiAdminEntreprises(token: string) {
  const reponse = await fetch(`${API_BASE}/admin/entreprises`, {
    headers: enTetesAuth(token),
    cache: "no-store",
  });
  return lireJson<{ entreprises: import("@/types/entreprise").Entreprise[] }>(reponse);
}

/** Admin : valider / refuser une entreprise. */
export async function apiAdminMajEntreprise(
  token: string,
  id: number,
  patch: {
    statutVerification: import("@/types/entreprise").StatutVerificationEntreprise;
    motifRefus?: string;
  },
) {
  const reponse = await fetch(`${API_BASE}/admin/entreprises/${id}`, {
    method: "PATCH",
    headers: enTetesAuth(token),
    body: JSON.stringify(patch),
  });
  return lireJson<{
    message: string;
    entreprise: import("@/types/entreprise").Entreprise;
  }>(reponse);
}

/** Admin : toutes les offres. */
export async function apiAdminOffres(token: string) {
  const reponse = await fetch(`${API_BASE}/admin/offres`, {
    headers: enTetesAuth(token),
    cache: "no-store",
  });
  return lireJson<{ offres: import("@/types/offre").Offre[] }>(reponse);
}

/** Admin : tous les comptes. */
export async function apiAdminComptes(token: string) {
  const reponse = await fetch(`${API_BASE}/admin/comptes`, {
    headers: enTetesAuth(token),
    cache: "no-store",
  });
  return lireJson<{
    comptes: {
      id: number;
      prenom: string;
      nom: string;
      email: string;
      role: import("@/types/personne").RoleCompte;
      entrepriseId: number | null;
    }[];
  }>(reponse);
}

/** Admin : toutes les candidatures. */
export async function apiAdminCandidatures(token: string) {
  const reponse = await fetch(`${API_BASE}/admin/candidatures`, {
    headers: enTetesAuth(token),
    cache: "no-store",
  });
  return lireJson<{ candidatures: import("@/types/candidature").Candidature[] }>(
    reponse,
  );
}

export async function apiAdminSupprimerOffre(token: string, id: number) {
  const reponse = await fetch(`${API_BASE}/admin/offres/${id}`, {
    method: "DELETE",
    headers: enTetesAuth(token),
  });
  return lireJson<{ message: string }>(reponse);
}

export async function apiAdminSupprimerCompte(token: string, id: number) {
  const reponse = await fetch(`${API_BASE}/admin/comptes/${id}`, {
    method: "DELETE",
    headers: enTetesAuth(token),
  });
  return lireJson<{ message: string }>(reponse);
}

export async function apiAdminSupprimerCandidature(token: string, id: number) {
  const reponse = await fetch(`${API_BASE}/admin/candidatures/${id}`, {
    method: "DELETE",
    headers: enTetesAuth(token),
  });
  return lireJson<{ message: string }>(reponse);
}

export async function apiAdminSupprimerEntreprise(token: string, id: number) {
  const reponse = await fetch(`${API_BASE}/admin/entreprises/${id}`, {
    method: "DELETE",
    headers: enTetesAuth(token),
  });
  return lireJson<{ message: string }>(reponse);
}

/** Met à jour le profil du compte connecté. */
export async function apiMajProfil(
  token: string,
  patch: {
    prenom?: string;
    nom?: string;
    telephone?: string;
    motDePasse?: string;
    cvNom?: string | null;
    pays?: string;
    ville?: string;
  },
) {
  const reponse = await fetch(`${API_BASE}/profil`, {
    method: "PATCH",
    headers: enTetesAuth(token),
    body: JSON.stringify(patch),
  });
  return lireJson<{ message: string; user: UtilisateurApi }>(reponse);
}
