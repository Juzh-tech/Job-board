/**
 * @fileoverview Catalogue pays (langue, devise, validation ID entreprise…).
 *
 * But
 *   Le marché = le pays. Sélecteur en haut → locale + filtre offres.
 */
/**
 * Socle multi-pays : langue UI, monnaie, villes, identifiant entreprise local.
 * Extensible : ajouter un code ISO ici suffit pour brancher le parcours.
 */

export type CodeLangue = "fr" | "es" | "en" | "de" | "pt" | "it";

export type CodePays = "FR" | "ES" | "GB" | "BE" | "CH" | "DE" | "PT" | "IT" | "US" | "CA";

export type DefinitionPays = {
  code: CodePays;
  /** Nom du pays dans sa langue principale */
  nom: string;
  langue: CodeLangue;
  /** Locale BCP 47 pour formatage dates / montants */
  locale: string;
  devise: {
    code: string;
    symbole: string;
    nom: string;
  };
  /** Identifiant légal entreprise (SIRET, NIF, Companies House…) */
  identifiantEntreprise: {
    cle: string;
    libelle: string;
    obligatoire: boolean;
    aide: string;
    /** Regex source pour valider la valeur (sans /…/) */
    motif: string;
  };
  villes: string[];
};

export const PAYS: Record<CodePays, DefinitionPays> = {
  FR: {
    code: "FR",
    nom: "France",
    langue: "fr",
    locale: "fr-FR",
    devise: { code: "EUR", symbole: "€", nom: "Euro" },
    identifiantEntreprise: {
      cle: "siret",
      libelle: "SIRET",
      obligatoire: true,
      aide: "Exactement 14 chiffres",
      motif: "^\\d{14}$",
    },
    villes: [
      "Paris",
      "Lyon",
      "Marseille",
      "Toulouse",
      "Nice",
      "Nantes",
      "Bordeaux",
      "Lille",
      "Strasbourg",
      "Rennes",
      "Montpellier",
      "Grenoble",
      "Rouen",
      "Télétravail (France)",
    ],
  },
  ES: {
    code: "ES",
    nom: "España",
    langue: "es",
    locale: "es-ES",
    devise: { code: "EUR", symbole: "€", nom: "Euro" },
    identifiantEntreprise: {
      cle: "nif",
      libelle: "NIF / CIF",
      obligatoire: true,
      aide: "Lettre + 8 caractères (ex. B12345678)",
      motif: "^[A-Za-z]\\d{7}[A-Za-z0-9]$",
    },
    villes: [
      "Madrid",
      "Barcelona",
      "Valencia",
      "Sevilla",
      "Bilbao",
      "Málaga",
      "Zaragoza",
      "Teletrabajo (España)",
    ],
  },
  GB: {
    code: "GB",
    nom: "United Kingdom",
    langue: "en",
    locale: "en-GB",
    devise: { code: "GBP", symbole: "£", nom: "Pound sterling" },
    identifiantEntreprise: {
      cle: "company_number",
      libelle: "Company number",
      obligatoire: true,
      aide: "8 caractères alphanumériques",
      motif: "^[A-Za-z0-9]{8}$",
    },
    villes: [
      "London",
      "Manchester",
      "Birmingham",
      "Edinburgh",
      "Bristol",
      "Leeds",
      "Glasgow",
      "Remote (UK)",
    ],
  },
  BE: {
    code: "BE",
    nom: "Belgique",
    langue: "fr",
    locale: "fr-BE",
    devise: { code: "EUR", symbole: "€", nom: "Euro" },
    identifiantEntreprise: {
      cle: "bce",
      libelle: "N° BCE / entreprise",
      obligatoire: true,
      aide: "10 chiffres",
      motif: "^\\d{10}$",
    },
    villes: ["Bruxelles", "Anvers", "Gand", "Liège", "Charleroi", "Télétravail (Belgique)"],
  },
  CH: {
    code: "CH",
    nom: "Suisse",
    langue: "fr",
    locale: "fr-CH",
    devise: { code: "CHF", symbole: "CHF", nom: "Franc suisse" },
    identifiantEntreprise: {
      cle: "uid",
      libelle: "IDE / UID",
      obligatoire: true,
      aide: "CHE-123.456.789",
      motif: "^CHE[-.]?\\d{3}[.]?\\d{3}[.]?\\d{3}$",
    },
    villes: ["Genève", "Zurich", "Lausanne", "Berne", "Bâle", "Télétravail (Suisse)"],
  },
  DE: {
    code: "DE",
    nom: "Deutschland",
    langue: "de",
    locale: "de-DE",
    devise: { code: "EUR", symbole: "€", nom: "Euro" },
    identifiantEntreprise: {
      cle: "handelsregister",
      libelle: "Handelsregisternummer",
      obligatoire: true,
      aide: "Au moins 4 caractères",
      motif: "^[A-Za-z0-9][A-Za-z0-9\\s./-]{3,31}$",
    },
    villes: ["Berlin", "München", "Hamburg", "Frankfurt", "Köln", "Remote (Germany)"],
  },
  PT: {
    code: "PT",
    nom: "Portugal",
    langue: "pt",
    locale: "pt-PT",
    devise: { code: "EUR", symbole: "€", nom: "Euro" },
    identifiantEntreprise: {
      cle: "nipc",
      libelle: "NIPC",
      obligatoire: true,
      aide: "9 chiffres",
      motif: "^\\d{9}$",
    },
    villes: ["Lisboa", "Porto", "Braga", "Coimbra", "Teletrabalho (Portugal)"],
  },
  IT: {
    code: "IT",
    nom: "Italia",
    langue: "it",
    locale: "it-IT",
    devise: { code: "EUR", symbole: "€", nom: "Euro" },
    identifiantEntreprise: {
      cle: "partita_iva",
      libelle: "Partita IVA",
      obligatoire: true,
      aide: "11 chiffres",
      motif: "^\\d{11}$",
    },
    villes: ["Roma", "Milano", "Torino", "Napoli", "Bologna", "Remote (Italy)"],
  },
  US: {
    code: "US",
    nom: "United States",
    langue: "en",
    locale: "en-US",
    devise: { code: "USD", symbole: "$", nom: "US dollar" },
    identifiantEntreprise: {
      cle: "ein",
      libelle: "EIN",
      obligatoire: false,
      aide: "XX-XXXXXXX (optionnel)",
      motif: "^\\d{2}-?\\d{7}$",
    },
    villes: [
      "New York",
      "San Francisco",
      "Austin",
      "Chicago",
      "Seattle",
      "Boston",
      "Remote (US)",
    ],
  },
  CA: {
    code: "CA",
    nom: "Canada",
    langue: "fr",
    locale: "fr-CA",
    devise: { code: "CAD", symbole: "$", nom: "Dollar canadien" },
    identifiantEntreprise: {
      cle: "bn",
      libelle: "Numéro d’entreprise (NE)",
      obligatoire: false,
      aide: "9 chiffres (optionnel)",
      motif: "^\\d{9}$",
    },
    villes: ["Montréal", "Toronto", "Vancouver", "Ottawa", "Québec", "Télétravail (Canada)"],
  },
};

export const LISTE_PAYS = Object.values(PAYS);

export const PAYS_DEFAUT: CodePays = "FR";

export function paysParCode(code: string | null | undefined): DefinitionPays {
  if (code && code in PAYS) {
    return PAYS[code as CodePays];
  }
  return PAYS[PAYS_DEFAUT];
}

export function formaterMontant(
  montant: number,
  codePays: CodePays,
  options?: Intl.NumberFormatOptions,
): string {
  const p = paysParCode(codePays);
  return new Intl.NumberFormat(p.locale, {
    style: "currency",
    currency: p.devise.code,
    ...options,
  }).format(montant);
}

/** Exemple d’affichage monétaire pour UI (symbole + code). */
export function libelleDevise(codePays: CodePays): string {
  const d = paysParCode(codePays).devise;
  return `${d.symbole} (${d.code})`;
}

/** Valide l’identifiant légal entreprise selon le pays. */
export function validerIdentifiantEntreprise(
  codePays: string | null | undefined,
  valeur: string,
): string | null {
  const def = paysParCode(codePays);
  const id = def.identifiantEntreprise;
  const v = valeur.trim();
  if (!v) {
    return id.obligatoire ? `${id.libelle} obligatoire` : null;
  }
  const re = new RegExp(id.motif, "i");
  if (!re.test(v.replace(/\s/g, ""))) {
    return `${id.libelle} invalide — ${id.aide}`;
  }
  return null;
}
