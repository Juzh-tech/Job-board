/**
 * @fileoverview Mapping lignes SQL → objets TypeScript du front.
 *
 * But
 *   La BDD parle snake_case ; l'UI parle camelCase. Le passage se fait ici.
 */
import type { StatutCandidature } from "@/types/candidature";
import type { Entreprise, StatutVerificationEntreprise } from "@/types/entreprise";
import type { Offre, TypeContrat } from "@/types/offre";
import type { RoleCompte } from "@/types/personne";

type LigneAnnonce = {
  id: number;
  title: string;
  short_description: string;
  full_description: string;
  salary: string;
  location: string;
  working_time: string;
  contract_type: TypeContrat;
  published_at: Date | string;
  is_active?: number | boolean;
  company_id: number;
  company_name: string;
  company_secteur: string;
  company_city: string;
  company_presentation: string;
  company_logo?: string | null;
};

export function dateIso(valeur: Date | string | null | undefined): string {
  if (!valeur) {
    return "";
  }
  if (typeof valeur === "string") {
    return valeur.slice(0, 10);
  }
  return valeur.toISOString().slice(0, 10);
}

export function offreDepuisLigne(ligne: LigneAnnonce): Offre {
  const active = ligne.is_active === undefined ? true : Boolean(ligne.is_active);
  return {
    id: ligne.id,
    titre: ligne.title,
    descriptionCourte: ligne.short_description,
    descriptionComplete: ligne.full_description,
    salaire: ligne.salary,
    lieu: ligne.location,
    tempsTravail: ligne.working_time,
    typeContrat: ligne.contract_type,
    datePublication: dateIso(ligne.published_at),
    active,
    entreprise: {
      id: ligne.company_id,
      nom: ligne.company_name,
      secteur: ligne.company_secteur,
      ville: ligne.company_city,
      presentation: ligne.company_presentation || "",
      logoUrl: ligne.company_logo ? `/api/entreprise/logo/${ligne.company_logo}` : null,
    },
  };
}

export function personnePublique(ligne: {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: RoleCompte;
  company_id: number | null;
  cv_filename: string | null;
  country_code?: string | null;
  city?: string | null;
}) {
  return {
    id: ligne.id,
    prenom: ligne.first_name,
    nom: ligne.last_name,
    email: ligne.email,
    telephone: ligne.phone || "",
    role: ligne.role,
    entrepriseId: ligne.company_id,
    cvNom: ligne.cv_filename,
    pays: (ligne.country_code || "FR") as string,
    ville: ligne.city || "",
  };
}

/** Ligne `companies` → type front `Entreprise`. */
export function entrepriseDepuisLigne(ligne: {
  id: number;
  name: string;
  secteur: string | null;
  city: string | null;
  website: string | null;
  presentation: string | null;
  verification_status: StatutVerificationEntreprise;
  motif_refus: string | null;
  contact_nom: string | null;
  contact_email: string | null;
  created_at: Date | string;
  logo_filename?: string | null;
}): Entreprise {
  return {
    id: ligne.id,
    nom: ligne.name,
    secteur: ligne.secteur || "",
    ville: ligne.city || "",
    siteWeb: ligne.website || "",
    presentation: ligne.presentation || "",
    statutVerification: ligne.verification_status,
    dateInscription: dateIso(ligne.created_at),
    contactNom: ligne.contact_nom || "",
    contactEmail: ligne.contact_email || "",
    motifRefus: ligne.motif_refus || "",
    logoUrl: ligne.logo_filename
      ? `/api/entreprise/logo/${encodeURIComponent(ligne.logo_filename)}`
      : null,
  };
}

export type { StatutCandidature, StatutVerificationEntreprise };
