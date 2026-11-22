/**
 * @fileoverview Lecture / écriture d’une réclamation après refus admin.
 *
 * But
 *   Stocker message, téléphone, preuve et motif de refus précédent dans
 *   companies.motif_refus, sans table dédiée.
 */

export type ReclamationDossier = {
  telephone: string;
  preuve: string;
  message: string;
  /** Motif donné par l’admin lors du refus précédent. */
  motifPrecedent: string;
};

type PayloadReclamation = {
  type: "reclamation";
  telephone: string;
  preuve: string;
  message: string;
  motifPrecedent: string;
};

function estPayload(valeur: unknown): valeur is PayloadReclamation {
  if (!valeur || typeof valeur !== "object") {
    return false;
  }
  const o = valeur as Record<string, unknown>;
  return o.type === "reclamation" && typeof o.message === "string";
}

/** Ancien format : « RÉCLAMATION — Tél. … — Preuve: … — message ». */
function lireAncienFormat(motif: string): ReclamationDossier | null {
  if (!motif.startsWith("RÉCLAMATION")) {
    return null;
  }
  const parties = motif.split(" — ").map((p) => p.trim());
  let telephone = "";
  let preuve = "";
  const reste: string[] = [];
  for (const partie of parties.slice(1)) {
    if (partie.startsWith("Tél.")) {
      telephone = partie.replace(/^Tél\.\s*/i, "").trim();
    } else if (partie.startsWith("Preuve:")) {
      preuve = partie.replace(/^Preuve:\s*/i, "").trim();
    } else {
      reste.push(partie);
    }
  }
  return {
    telephone,
    preuve,
    message: reste.join(" — "),
    motifPrecedent: "",
  };
}

/** True si le champ motif_refus contient une réclamation (pas un simple refus). */
export function estReclamation(motifRefus: string | null | undefined): boolean {
  return lireReclamation(motifRefus) !== null;
}

/** Décode une réclamation depuis motif_refus, ou null. */
export function lireReclamation(motifRefus: string | null | undefined): ReclamationDossier | null {
  const brut = motifRefus?.trim() || "";
  if (!brut) {
    return null;
  }
  if (brut.startsWith("{")) {
    try {
      const data = JSON.parse(brut) as unknown;
      if (!estPayload(data)) {
        return null;
      }
      return {
        telephone: data.telephone || "",
        preuve: data.preuve || "",
        message: data.message || "",
        motifPrecedent: data.motifPrecedent || "",
      };
    } catch {
      return null;
    }
  }
  return lireAncienFormat(brut);
}

/**
 * Si motif_refus est déjà une réclamation, garde le motif de refus d’origine.
 * Sinon, le motif actuel est le refus précédent.
 */
export function motifPrecedentDepuisChamp(motifRefus: string | null | undefined): string {
  const reclamation = lireReclamation(motifRefus);
  if (reclamation) {
    return reclamation.motifPrecedent;
  }
  return motifRefus?.trim() || "";
}

/** Encode une réclamation pour stockage dans motif_refus. */
export function ecrireReclamation(donnees: ReclamationDossier): string {
  const payload: PayloadReclamation = {
    type: "reclamation",
    telephone: donnees.telephone.trim(),
    preuve: donnees.preuve.trim(),
    message: donnees.message.trim(),
    motifPrecedent: donnees.motifPrecedent.trim(),
  };
  return JSON.stringify(payload);
}

/** True si le nom correspond à un fichier réellement stocké sur disque. */
export function preuveEstStockee(nomFichier: string | null | undefined): boolean {
  return Boolean(nomFichier && /^\d+-\d+-/.test(nomFichier));
}

/** URL de téléchargement d’une preuve stockée (admin / entreprise). */
export function urlPreuveReclamation(nomFichier: string, token?: string): string {
  const base = `/api/entreprise/reclamation/preuve/${encodeURIComponent(nomFichier)}`;
  if (!token) {
    return base;
  }
  return `${base}?token=${encodeURIComponent(token)}`;
}
