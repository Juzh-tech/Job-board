/**
 * @fileoverview Mini carte offre (similaires / listes compactes).
 */
import Link from "next/link";
import { LogoEntreprise } from "@/composants/ui/LogoEntreprise";
import { formaterDateRelative } from "@/lib/format";
import { hrefVersOffre } from "@/lib/offres";
import type { Offre } from "@/types/offre";

type ProprietesCarteOffreCourte = {
  offre: Offre;
  onChoisir?: () => void;
};

/** Petite carte : offres similaires, ou liste sur la fiche entreprise. */
export function CarteOffreCourte({ offre, onChoisir }: ProprietesCarteOffreCourte) {
  const contenu = (
    <>
      <LogoEntreprise nom={offre.entreprise.nom} id={offre.entreprise.id} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-marque">{offre.titre}</p>
        <p className="mt-0.5 truncate text-[13px] text-muet">
          {offre.lieu.split(",")[0]}
          <span className="mx-1.5 text-ligne">·</span>
          {offre.typeContrat}
          <span className="mx-1.5 text-ligne">·</span>
          {formaterDateRelative(offre.datePublication)}
        </p>
        {offre.salaire ? (
          <p className="mt-1 truncate text-[12px] font-semibold text-dore-hover">{offre.salaire}</p>
        ) : null}
      </div>
    </>
  );

  const classe =
    "flex w-full gap-3 rounded-xl border border-ligne bg-surface px-4 py-3 text-left transition hover:border-marque/40";

  if (onChoisir) {
    return (
      <button type="button" onClick={onChoisir} className={classe}>
        {contenu}
      </button>
    );
  }

  return (
    <Link href={hrefVersOffre(offre.id)} className={classe}>
      {contenu}
    </Link>
  );
}
