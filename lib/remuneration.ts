/**
 * @fileoverview Estimation rémunération (heure ↔ mois ↔ année).
 *
 * But
 *   Même idée recruteur (saisie) et candidat (détail offre).
 *   Peu importe la période annoncée, on estime les deux autres.
 *
 * Convention
 *   52 semaines / an. Si le volume h/semaine n'est pas dans l'offre,
 *   on part sur 35 h (temps plein classique) — c'est une estimation, pas un bulletin.
 */

export type PeriodeRemuneration = "heure" | "mois" | "annee";

export const PERIODES_REMUNERATION: {
  valeur: PeriodeRemuneration;
  libelle: string;
  suffixe: string;
}[] = [
  { valeur: "heure", libelle: "Par heure", suffixe: "/ heure" },
  { valeur: "mois", libelle: "Par mois", suffixe: "/ mois" },
  { valeur: "annee", libelle: "Par an", suffixe: "/ an" },
];

/** Volume hebdo par défaut si l'offre ne le précise pas (temps plein type FR). */
export const HEURES_SEMAINE_DEFAUT = 35;

export type EstimationRemuneration = {
  horaire: number;
  mensuel: number;
  annuel: number;
  heures: number;
  symbole: string;
  /** Période détectée / saisie d'origine. */
  periodeSource: PeriodeRemuneration;
  /** true si on a inventé les h/semaine (hypothèse 35 ou partiel). */
  hypotheseHeures: boolean;
};

export function parserMontant(valeur: string): number | null {
  const n = Number(String(valeur).replace(/\s/g, "").replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) {
    return null;
  }
  return n;
}

export function formaterMontantAffiche(montant: number, locale = "fr-FR"): string {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: montant % 1 === 0 ? 0 : 2,
  }).format(montant);
}

/** Texte stocké / affiché sur l'offre (ex. « 25 € / heure »). */
export function composerLibelleSalaire(
  montant: number,
  periode: PeriodeRemuneration,
  symboleDevise: string,
  locale = "fr-FR",
): string {
  const periodeDef = PERIODES_REMUNERATION.find((p) => p.valeur === periode);
  return `${formaterMontantAffiche(montant, locale)} ${symboleDevise} ${periodeDef?.suffixe ?? ""}`.trim();
}

/**
 * Convertit un montant d'une période vers heure / mois / année.
 * exige heuresParSemaine > 0 pour passer par l'horaire.
 */
export function estimerToutesPeriodes(
  montant: number,
  periode: PeriodeRemuneration,
  heuresParSemaine: number,
): Omit<EstimationRemuneration, "symbole" | "periodeSource" | "hypotheseHeures"> | null {
  if (!Number.isFinite(montant) || montant <= 0) {
    return null;
  }
  if (!Number.isFinite(heuresParSemaine) || heuresParSemaine <= 0) {
    return null;
  }

  const heuresAnnee = heuresParSemaine * 52;
  let horaire: number;
  let mensuel: number;
  let annuel: number;

  if (periode === "heure") {
    horaire = montant;
    annuel = montant * heuresAnnee;
    mensuel = annuel / 12;
  } else if (periode === "mois") {
    mensuel = montant;
    annuel = montant * 12;
    horaire = annuel / heuresAnnee;
  } else {
    annuel = montant;
    mensuel = montant / 12;
    horaire = annuel / heuresAnnee;
  }

  return { horaire, mensuel, annuel, heures: heuresParSemaine };
}

/** Alias historique (recruteur horaire → mois / an). */
export function estimerDepuisHoraire(
  tauxHoraire: number,
  heuresParSemaine: number,
): { mensuel: number; annuel: number } | null {
  const tout = estimerToutesPeriodes(tauxHoraire, "heure", heuresParSemaine);
  if (!tout) {
    return null;
  }
  return { mensuel: tout.mensuel, annuel: tout.annuel };
}

/** Heures / semaine depuis le texte « 35 h / semaine », sinon hypothèse. */
export function heuresDepuisTempsTravail(tempsTravail: string): {
  heures: number;
  hypothese: boolean;
} {
  const match = tempsTravail.match(/(\d+(?:[.,]\d+)?)\s*h\s*\/\s*semaine/i);
  if (match) {
    const h = parserMontant(match[1]);
    if (h) {
      return { heures: h, hypothese: false };
    }
  }
  if (/partiel/i.test(tempsTravail)) {
    return { heures: 24, hypothese: true };
  }
  return { heures: HEURES_SEMAINE_DEFAUT, hypothese: true };
}

function detecterPeriodeSalaire(salaire: string): PeriodeRemuneration | null {
  const s = salaire.toLowerCase();
  if (/\/\s*heure|par\s*heure|per\s*hour|\/\s*hour/.test(s)) {
    return "heure";
  }
  if (/\/\s*mois|par\s*mois|per\s*month|\/\s*month|brut\s*\/\s*mois/.test(s)) {
    return "mois";
  }
  if (/\/\s*an(?:née|nee)?|par\s*an|brut\s*\/\s*an|per\s*year|\/\s*year|\/\s*año/.test(s)) {
    return "annee";
  }
  return null;
}

function extraireSymbole(salaire: string, fallback = "€"): string {
  const m = salaire.match(/([€$£]|CHF)/);
  return m?.[1] || fallback;
}

/**
 * Récupère le(s) montant(s) dans le libellé salaire.
 * Fourchette « 32 000 – 36 000 » → moyenne.
 */
function extraireMontantPrincipal(salaire: string): number | null {
  const nettoye = salaire
    .replace(/\u00a0/g, " ")
    .replace(/(\d)\s+(?=\d{3}\b)/g, "$1");
  const nombres = [...nettoye.matchAll(/(\d+(?:[.,]\d+)?)/g)]
    .map((m) => parserMontant(m[1]))
    .filter((n): n is number => n != null);

  if (nombres.length === 0) {
    return null;
  }
  // Ignore les petits chiffres type "2 jours" déjà hors salaire — on prend les plus grands
  // si fourchette : moyenne des deux premiers "gros" montants
  const gros = nombres.filter((n) => n >= 5);
  const base = gros.length > 0 ? gros : nombres;
  if (base.length >= 2 && /–|-|—|à|a/.test(salaire)) {
    return (base[0] + base[1]) / 2;
  }
  return base[0];
}

/**
 * Extrait une estimation complète depuis les textes stockés sur une offre.
 * Fonctionne si le salaire indique / heure, / mois ou / an.
 */
export function extraireEstimationRemuneration(
  salaire: string,
  tempsTravail: string,
  symboleDefaut = "€",
): EstimationRemuneration | null {
  if (!salaire.trim()) {
    return null;
  }

  const periode = detecterPeriodeSalaire(salaire);
  if (!periode) {
    return null;
  }

  const montant = extraireMontantPrincipal(salaire);
  if (!montant) {
    return null;
  }

  const { heures, hypothese } = heuresDepuisTempsTravail(tempsTravail);
  // Horaire sans volume explicite : on refuse plutôt que d'inventer n'importe quoi
  if (periode === "heure" && hypothese && !/h\s*\/\s*semaine/i.test(tempsTravail)) {
    // Si c'est clairement horaire mais pas d'heures, on utilise quand même le défaut
    // pour afficher une estimation — clairement marquée hypotheseHeures
  }

  const calcule = estimerToutesPeriodes(montant, periode, heures);
  if (!calcule) {
    return null;
  }

  return {
    ...calcule,
    symbole: extraireSymbole(salaire, symboleDefaut),
    periodeSource: periode,
    hypotheseHeures: hypothese,
  };
}

/** @deprecated préférer extraireEstimationRemuneration */
export function extraireEstimationHoraire(
  salaire: string,
  tempsTravail: string,
): {
  taux: number;
  heures: number;
  symbole: string;
  mensuel: number;
  annuel: number;
} | null {
  const e = extraireEstimationRemuneration(salaire, tempsTravail);
  if (!e || e.periodeSource !== "heure") {
    return null;
  }
  return {
    taux: e.horaire,
    heures: e.heures,
    symbole: e.symbole,
    mensuel: e.mensuel,
    annuel: e.annuel,
  };
}
