/**
 * @fileoverview Helpers métier autour des offres (filtres, requêtes).
 *
 * But
 *   Logique réutilisée par /api/offres sans gonfler les route.ts.
 */
import { coordsVille } from "@/lib/coordonnees-villes";
import { distanceKm, estRemote } from "@/lib/geo";
import type { Offre, TypeContrat } from "@/types/offre";

export function hrefVersOffre(id: number): string {
  return `/?offre=${id}#panneau-offre`;
}

/** Minuscules + sans accents (é → e) pour recherche élargie. */
export function normaliserTexteRecherche(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function filtrerOffres(
  offres: Offre[],
  mot = "",
  lieu = "",
  contrat = "tous",
  rayonKm = 0,
): Offre[] {
  const motNorm = normaliserTexteRecherche(mot);
  const lieuNorm = normaliserTexteRecherche(lieu);
  const origine = lieuNorm && rayonKm > 0 ? coordsVille(lieu) : null;

  return offres.filter((offre) => {
    const texte = normaliserTexteRecherche(
      `${offre.titre} ${offre.descriptionCourte} ${offre.descriptionComplete} ${offre.entreprise.nom} ${offre.entreprise.secteur} ${offre.lieu}`,
    );
    const contratOk = contrat === "tous" || offre.typeContrat === contrat;
    const mots = motNorm.split(/\s+/).filter(Boolean);
    const motOk =
      mots.length === 0 || mots.every((m) => texte.includes(m) || texte.includes(m.slice(0, 3)));

    let lieuOk = true;
    if (lieuNorm) {
      if (origine && rayonKm > 0) {
        if (estRemote(offre.lieu)) {
          lieuOk = true;
        } else {
          const cible = coordsVille(offre.lieu) || coordsVille(offre.entreprise.ville);
          lieuOk = Boolean(cible && distanceKm(origine, cible) <= rayonKm);
        }
      } else {
        lieuOk = normaliserTexteRecherche(offre.lieu).includes(lieuNorm);
      }
    }

    return lieuOk && contratOk && motOk;
  });
}

/** Libellés métier / entreprise proposés à partir des offres déjà en mémoire. */
export function catalogueMetiers(offres: Offre[]): string[] {
  const vus = new Set<string>();
  const liste: string[] = [];
  for (const offre of offres) {
    for (const libelle of [offre.titre, offre.entreprise.nom]) {
      const cle = libelle.toLowerCase();
      if (!vus.has(cle)) {
        vus.add(cle);
        liste.push(libelle);
      }
    }
  }
  return liste.sort((a, b) => a.localeCompare(b, "fr"));
}

/** Villes (et télétravail) proposées à partir des offres déjà en mémoire. */
export function catalogueVilles(offres: Offre[]): string[] {
  const vus = new Set<string>();
  const liste: string[] = [];
  for (const offre of offres) {
    const villeLieu = offre.lieu.split(/[,]/)[0]?.trim();
    for (const libelle of [villeLieu, offre.entreprise.ville]) {
      if (!libelle) {
        continue;
      }
      const cle = libelle.toLowerCase();
      if (!vus.has(cle)) {
        vus.add(cle);
        liste.push(libelle);
      }
    }
    if (/télétravail/i.test(offre.lieu) && !vus.has("télétravail")) {
      vus.add("télétravail");
      liste.push("Télétravail");
    }
  }
  return liste.sort((a, b) => a.localeCompare(b, "fr"));
}

function filtrerSuggestions(catalogue: string[], saisie: string, limite: number): string[] {
  const norm = saisie.trim().toLowerCase();
  if (norm.length < 1) {
    return [];
  }
  const commencePar: string[] = [];
  const contient: string[] = [];
  for (const libelle of catalogue) {
    const cle = libelle.toLowerCase();
    if (cle === norm) {
      continue;
    }
    if (cle.startsWith(norm)) {
      commencePar.push(libelle);
    } else if (cle.includes(norm)) {
      contient.push(libelle);
    }
  }
  return [...commencePar, ...contient].slice(0, limite);
}

export function suggestionsMetiers(offres: Offre[], saisie: string, limite = 6): string[] {
  return filtrerSuggestions(catalogueMetiers(offres), saisie, limite);
}

export function suggestionsVilles(offres: Offre[], saisie: string, limite = 6): string[] {
  return filtrerSuggestions(catalogueVilles(offres), saisie, limite);
}

export function statsTableau(offres: Offre[]) {
  const entreprises = new Set(offres.map((offre) => offre.entreprise.id));
  const parContrat: Record<TypeContrat, number> = {
    CDI: 0,
    CDD: 0,
    Stage: 0,
    Alternance: 0,
  };
  for (const offre of offres) {
    parContrat[offre.typeContrat] += 1;
  }
  const villes = Array.from(
    new Set(offres.map((offre) => offre.lieu.split(/[,]/)[0]?.trim()).filter(Boolean)),
  ) as string[];
  return {
    total: offres.length,
    entreprises: entreprises.size,
    parContrat,
    villes,
  };
}

function ville(lieu: string): string {
  return lieu.split(/[,]/)[0]?.trim().toLowerCase() ?? "";
}

function mots(texte: string): string[] {
  return texte
    .toLowerCase()
    .split(/[^a-zàâçéèêëîïôùûü0-9]+/i)
    .filter((mot) => mot.length > 3);
}

/** Offres proches parmi une liste déjà chargée (API). */
export function offresSimilaires(offre: Offre, parmi: Offre[], limite = 3): Offre[] {
  const motsTitre = new Set(mots(offre.titre));
  const villeOffre = ville(offre.lieu);

  return parmi
    .filter((autre) => autre.id !== offre.id)
    .map((autre) => {
      let score = 0;
      if (autre.typeContrat === offre.typeContrat) {
        score += 4;
      }
      if (autre.entreprise.id === offre.entreprise.id) {
        score += 3;
      }
      if (ville(autre.lieu) === villeOffre) {
        score += 2;
      }
      if (autre.entreprise.secteur === offre.entreprise.secteur) {
        score += 1;
      }
      for (const mot of mots(autre.titre)) {
        if (motsTitre.has(mot)) {
          score += 1;
        }
      }
      return { autre, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limite)
    .map((item) => item.autre);
}
