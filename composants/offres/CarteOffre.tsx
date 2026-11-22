/**
 * @fileoverview Carte d'une offre dans la liste.
 *
 * But
 *   Titre, tags, boutons En savoir plus / Postuler. Pas de popup.
 */
import Link from "next/link";
import { formaterDateRelative, offreEstNouvelle } from "@/lib/format";
import { useLocale } from "@/lib/i18n/contexte";
import { LogoEntreprise } from "@/composants/ui/LogoEntreprise";
import type { Offre } from "@/types/offre";

type ProprietesCarteOffre = {
  offre: Offre;
  selectionnee: boolean;
  onEnSavoirPlus: () => void;
  onPostuler: () => void;
  dejaPostule?: boolean;
};

export function CarteOffre({
  offre,
  selectionnee,
  onEnSavoirPlus,
  onPostuler,
  dejaPostule = false,
}: ProprietesCarteOffre) {
  const { t } = useLocale();
  const nouvelle = offreEstNouvelle(offre.datePublication);

  return (
    <article
      className={`rounded-xl border bg-surface px-4 py-3.5 transition ${
        selectionnee
          ? "border-marque shadow-[0_6px_18px_rgba(11,31,58,0.08)]"
          : "border-ligne hover:border-marque/30"
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 gap-3">
          <LogoEntreprise
            nom={offre.entreprise.nom}
            id={offre.entreprise.id}
            url={offre.entreprise.logoUrl}
            taille="sm"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {nouvelle ? (
                <span className="rounded-full bg-action px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ivoire">
                  Nouveau
                </span>
              ) : null}
              <span className="text-[12px] text-muet">
                {formaterDateRelative(offre.datePublication)}
              </span>
            </div>
            <button type="button" onClick={onEnSavoirPlus} className="mt-0.5 w-full text-left">
              <h2 className="truncate text-[16px] font-bold leading-snug text-marque">
                {offre.titre}
              </h2>
            </button>
            <Link
              href={`/entreprises/${offre.entreprise.id}`}
              className="inline-block text-[13px] font-medium text-action hover:underline"
            >
              {offre.entreprise.nom}
            </Link>
          </div>
        </div>
      </div>

      <button type="button" onClick={onEnSavoirPlus} className="w-full text-left">
        <p className="line-clamp-2 text-[13px] leading-snug text-muet">{offre.descriptionCourte}</p>
      </button>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <span className="rounded-full bg-fond px-2 py-0.5 text-[12px] font-medium text-encre">
          {offre.lieu.split(",")[0]}
        </span>
        <span className="rounded-full bg-fond px-2 py-0.5 text-[12px] font-medium text-encre">
          {offre.typeContrat}
        </span>
        <span className="rounded-full bg-marque/5 px-2 py-0.5 text-[12px] font-semibold text-dore-hover">
          {offre.salaire}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-ligne pt-3">
        <button
          type="button"
          onClick={onEnSavoirPlus}
          className="h-8 rounded-md border border-ligne px-3 text-[13px] font-medium hover:border-marque"
        >
          {t("offre.enSavoirPlus")}
        </button>
        {dejaPostule ? (
          <span className="inline-flex h-8 items-center rounded-md border border-ligne bg-fond px-3 text-[13px] font-semibold text-marque">
            {t("offre.dejaPostule")}
          </span>
        ) : (
          <button
            type="button"
            onClick={onPostuler}
            className="h-8 rounded-md bg-action px-3 text-[13px] font-semibold text-ivoire hover:bg-action-hover"
          >
            {t("offre.postuler")}
          </button>
        )}
      </div>
    </article>
  );
}
