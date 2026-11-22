/**
 * @fileoverview Badge statut vérif entreprise (attente / validée / refusée).
 */
import type { StatutVerificationEntreprise } from "@/types/entreprise";
import { LIBELLES_VERIFICATION } from "@/types/entreprise";

const STYLES: Record<StatutVerificationEntreprise, string> = {
  en_attente: "bg-marque/10 text-marque",
  validee: "bg-ok/10 text-ok",
  refusee: "bg-refus/10 text-refus",
};

export function BadgeVerification({ statut }: { statut: StatutVerificationEntreprise }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-semibold tracking-wide ${STYLES[statut]}`}
    >
      {LIBELLES_VERIFICATION[statut]}
    </span>
  );
}
