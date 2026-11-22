/**
 * @fileoverview Select compact de pays / langue.
 *
 * But
 *   Change la locale + le marché d'offres. Label accessible, UI courte.
 */
"use client";

import { useLocale } from "@/lib/i18n/contexte";
import { LISTE_PAYS, type CodePays } from "@/lib/pays";

/**
 * Marché de la visite (session) : langue UI + offres affichées.
 * Sans symbole de devise dans le libellé.
 */
export function SelecteurPays({ className = "" }: { className?: string }) {
  const { codePays, setCodePays, t } = useLocale();

  return (
    <label className={`inline-flex items-center ${className}`}>
      <span className="sr-only">{t("nav.pays")}</span>
      <select
        value={codePays}
        onChange={(e) => setCodePays(e.target.value as CodePays)}
        aria-label={t("nav.pays")}
        className="h-8 w-auto max-w-[6.75rem] cursor-pointer rounded-lg border border-ligne bg-surface py-0 pl-2 pr-6 text-[12px] font-semibold text-encre outline-none focus:border-marque sm:h-9 sm:max-w-[9.5rem] sm:pl-2.5 sm:pr-7 sm:text-[13px]"
        title={t("nav.pays")}
      >
        {LISTE_PAYS.map((p) => (
          <option key={p.code} value={p.code}>
            {p.nom}
          </option>
        ))}
      </select>
    </label>
  );
}
