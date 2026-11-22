/**
 * @fileoverview Badge visuel d'un statut candidature / offre.
 */
import type { StatutCandidature } from "@/types/candidature";
import { LIBELLES_STATUT } from "@/types/candidature";

const STYLES: Record<StatutCandidature, string> = {
  envoyee: "bg-fond text-encre",
  en_etude: "bg-marque/10 text-marque",
  entretien: "bg-[#1d4ed8]/10 text-[#1d4ed8]",
  acceptee: "bg-ok/10 text-ok",
  refusee: "bg-refus/10 text-refus",
};

export function BadgeStatut({ statut }: { statut: StatutCandidature }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-semibold tracking-wide ${STYLES[statut]}`}
    >
      {LIBELLES_STATUT[statut]}
    </span>
  );
}
