/**
 * @fileoverview UI pipeline d'une candidature côté recruteur.
 *
 * But
 *   Changer statut, planifier entretien, laisser un commentaire interne.
 */
import type { StatutCandidature } from "@/types/candidature";
import { ETAPES_PARCOURS, LIBELLES_STATUT } from "@/types/candidature";

const ORDRE: Record<StatutCandidature, number> = {
  envoyee: 0,
  en_etude: 1,
  entretien: 2,
  acceptee: 3,
  refusee: 1,
};

/** Fil d'étapes d'une candidature. En cas de refus, le parcours s'arrête. */
export function ParcoursCandidature({ statut }: { statut: StatutCandidature }) {
  const refusee = statut === "refusee";
  const indexActuel = ORDRE[statut];

  return (
    <ol className="flex flex-wrap items-center gap-2">
      {ETAPES_PARCOURS.map((etape, index) => {
        const atteinte = !refusee && index <= indexActuel;
        const courante = !refusee && etape === statut;
        return (
          <li key={etape} className="flex items-center gap-2">
            {index > 0 ? <span className="text-ligne">→</span> : null}
            <span
              className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${
                courante
                  ? "bg-marque text-white"
                  : atteinte
                    ? "bg-marque/10 text-marque"
                    : "bg-fond text-muet"
              }`}
            >
              {LIBELLES_STATUT[etape]}
            </span>
          </li>
        );
      })}
      {refusee ? (
        <li className="flex items-center gap-2">
          <span className="text-ligne">→</span>
          <span className="rounded-full bg-refus/10 px-2.5 py-1 text-[12px] font-semibold text-refus">
            Refusée
          </span>
        </li>
      ) : null}
    </ol>
  );
}
