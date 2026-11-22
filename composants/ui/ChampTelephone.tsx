/**
 * @fileoverview Champ téléphone lié aux règles du pays.
 */
"use client";

import { CLASSE_CHAMP } from "./classes";
import {
  formaterTelephoneNational,
  regleTelephone,
} from "@/lib/telephone";
import type { CodePays } from "@/lib/pays";

type Proprietes = {
  libelle: string;
  nom: string;
  codePays: CodePays | string;
  valeur: string;
  onChange: (valeur: string) => void;
  requis?: boolean;
};

/**
 * Téléphone national selon le pays : indicatif fixe + format local.
 */
export function ChampTelephone({
  libelle,
  nom,
  codePays,
  valeur,
  onChange,
  requis = false,
}: Proprietes) {
  const regle = regleTelephone(codePays);

  return (
    <div className="flex flex-col gap-1.5 text-[13px] tracking-wide text-muet">
      <label htmlFor={nom}>
        {libelle}
        {requis ? <span className="sr-only"> (obligatoire)</span> : null}
      </label>
      <div className="flex gap-2">
        <span
          className="inline-flex h-[2.75rem] shrink-0 items-center rounded-xl border border-ligne bg-fond px-3 text-[14px] font-semibold text-encre"
          aria-hidden
        >
          +{regle.indicatif}
        </span>
        <input
          id={nom}
          name={nom}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder={regle.placeholder}
          value={valeur}
          required={requis}
          onChange={(e) => onChange(formaterTelephoneNational(e.target.value, codePays))}
          className={CLASSE_CHAMP}
          aria-describedby={`${nom}-aide`}
        />
      </div>
      <p id={`${nom}-aide`} className="text-[12px] text-muet">
        Format {regle.codePays} — ex. {regle.exemple}
      </p>
    </div>
  );
}
