/**
 * @fileoverview Validation / format téléphone selon le pays.
 *
 * But
 *   Ex. FR = 9 chiffres hors indicatif. Pas un vague string libre.
 */
/**
 * Règles téléphone par pays.
 * Avec indicatif affiché à part : FR = 9 chiffres (sans le 0 national).
 * ES = 9 ; US/CA = 10 (indicatif régional inclus).
 */
import { paysParCode, type CodePays } from "@/lib/pays";

export type RegleTelephone = {
  codePays: CodePays;
  indicatif: string;
  placeholder: string;
  exemple: string;
  longueurNationale: number;
  /** Autoriser un 0 initial saisi puis le retirer à la normalisation */
  retirerZeroInitial: boolean;
  groupes: number[];
};

const REGLES: Record<CodePays, RegleTelephone> = {
  FR: {
    codePays: "FR",
    indicatif: "33",
    placeholder: "6 12 34 56 78",
    exemple: "6 12 34 56 78",
    longueurNationale: 9,
    retirerZeroInitial: true,
    groupes: [1, 2, 2, 2, 2],
  },
  ES: {
    codePays: "ES",
    indicatif: "34",
    placeholder: "612 345 678",
    exemple: "612 345 678",
    longueurNationale: 9,
    retirerZeroInitial: false,
    groupes: [3, 3, 3],
  },
  GB: {
    codePays: "GB",
    indicatif: "44",
    placeholder: "7123 456789",
    exemple: "7123 456789",
    longueurNationale: 10,
    retirerZeroInitial: true,
    groupes: [4, 6],
  },
  BE: {
    codePays: "BE",
    indicatif: "32",
    placeholder: "470 12 34 56",
    exemple: "470 12 34 56",
    longueurNationale: 9,
    retirerZeroInitial: true,
    groupes: [3, 2, 2, 2],
  },
  CH: {
    codePays: "CH",
    indicatif: "41",
    placeholder: "79 123 45 67",
    exemple: "79 123 45 67",
    longueurNationale: 9,
    retirerZeroInitial: true,
    groupes: [2, 3, 2, 2],
  },
  DE: {
    codePays: "DE",
    indicatif: "49",
    placeholder: "151 2345678",
    exemple: "151 2345678",
    longueurNationale: 10,
    retirerZeroInitial: true,
    groupes: [3, 7],
  },
  PT: {
    codePays: "PT",
    indicatif: "351",
    placeholder: "912 345 678",
    exemple: "912 345 678",
    longueurNationale: 9,
    retirerZeroInitial: false,
    groupes: [3, 3, 3],
  },
  IT: {
    codePays: "IT",
    indicatif: "39",
    placeholder: "312 345 6789",
    exemple: "312 345 6789",
    longueurNationale: 10,
    retirerZeroInitial: false,
    groupes: [3, 3, 4],
  },
  US: {
    codePays: "US",
    indicatif: "1",
    placeholder: "(201) 555-0123",
    exemple: "(201) 555-0123",
    longueurNationale: 10,
    retirerZeroInitial: false,
    groupes: [3, 3, 4],
  },
  CA: {
    codePays: "CA",
    indicatif: "1",
    placeholder: "(514) 555-0123",
    exemple: "(514) 555-0123",
    longueurNationale: 10,
    retirerZeroInitial: false,
    groupes: [3, 3, 4],
  },
};

export function regleTelephone(codePays: string | null | undefined): RegleTelephone {
  const code = paysParCode(codePays).code;
  return REGLES[code];
}

export function chiffresSeuls(valeur: string): string {
  return valeur.replace(/\D/g, "");
}

export function normaliserChiffresNationaux(
  valeur: string,
  codePays: string | null | undefined,
): string {
  const regle = regleTelephone(codePays);
  let chiffres = chiffresSeuls(valeur);

  if (chiffres.startsWith(regle.indicatif)) {
    chiffres = chiffres.slice(regle.indicatif.length);
  }
  if (regle.retirerZeroInitial && chiffres.startsWith("0")) {
    chiffres = chiffres.slice(1);
  }

  return chiffres.slice(0, regle.longueurNationale);
}

export function formaterTelephoneNational(
  valeur: string,
  codePays: string | null | undefined,
): string {
  const regle = regleTelephone(codePays);
  const chiffres = normaliserChiffresNationaux(valeur, codePays);

  if (regle.codePays === "US" || regle.codePays === "CA") {
    const a = chiffres.slice(0, 3);
    const b = chiffres.slice(3, 6);
    const c = chiffres.slice(6, 10);
    if (chiffres.length <= 3) {
      return a;
    }
    if (chiffres.length <= 6) {
      return `(${a}) ${b}`;
    }
    return `(${a}) ${b}-${c}`;
  }

  const parts: string[] = [];
  let i = 0;
  for (const taille of regle.groupes) {
    if (i >= chiffres.length) {
      break;
    }
    parts.push(chiffres.slice(i, i + taille));
    i += taille;
  }
  if (i < chiffres.length) {
    parts.push(chiffres.slice(i));
  }
  return parts.filter(Boolean).join(" ");
}

export function telephoneValidePourPays(
  valeur: string,
  codePays: string | null | undefined,
): boolean {
  const regle = regleTelephone(codePays);
  const chiffres = normaliserChiffresNationaux(valeur, codePays);
  return chiffres.length === regle.longueurNationale;
}

export function messageErreurTelephone(
  valeur: string,
  codePays: string | null | undefined,
  obligatoire = true,
): string | null {
  const v = valeur.trim();
  const regle = regleTelephone(codePays);
  if (!v) {
    return obligatoire ? "Le numéro de téléphone est obligatoire." : null;
  }
  if (!telephoneValidePourPays(v, codePays)) {
    return `Numéro invalide pour ${paysParCode(codePays).nom} (ex. ${regle.exemple}).`;
  }
  return null;
}
