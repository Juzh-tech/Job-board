/**
 * @fileoverview Consentement cookies / mesure d'audience.
 *
 * But
 *   Lire / écrire le choix CNIL et activer la mesure seulement si OK.
 */
/**
 * Consentement cookies / mesure d’audience (stocké en localStorage).
 * Les cookies strictement nécessaires au fonctionnement ne requièrent pas de consentement ;
 * la mesure d’audience n’est activée qu’après acceptation.
 */

export const CLE_CONSENTEMENT = "jobboard_consentement_cookies";

export type ConsentementCookies = {
  necessaires: true;
  mesureAudience: boolean;
  date: string;
};

export function lireConsentement(): ConsentementCookies | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const brut = localStorage.getItem(CLE_CONSENTEMENT);
    if (!brut) {
      return null;
    }
    return JSON.parse(brut) as ConsentementCookies;
  } catch {
    return null;
  }
}

export function ecrireConsentement(mesureAudience: boolean) {
  const valeur: ConsentementCookies = {
    necessaires: true,
    mesureAudience,
    date: new Date().toISOString(),
  };
  localStorage.setItem(CLE_CONSENTEMENT, JSON.stringify(valeur));
  window.dispatchEvent(new Event("jobboard-consentement"));
}

/** Point d’extension analytics : ne charge rien tant que le consentement n’est pas donné. */
export function initialiserMesureAudienceSiAutorisee() {
  const c = lireConsentement();
  if (!c?.mesureAudience) {
    return;
  }
  // Emplacement prévu pour Matomo / Plausible / équivalent CNIL-friendly.
  // Exemple : charger le script uniquement ici après consentement.
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("jobboard-analytics-ready"));
  }
}
