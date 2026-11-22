/**
 * @fileoverview Input texte de formulaire.
 */
"use client";

import { useState } from "react";
import { CLASSE_CHAMP } from "./classes";

type ProprietesChampTexte = {
  libelle: string;
  nom: string;
  type?: "text" | "email" | "password" | "tel" | "url" | "date" | "time";
  placeholder?: string;
  valeur?: string;
  onChange?: (valeur: string) => void;
  requis?: boolean;
  autoComplete?: string;
  min?: string;
};

/** Champ de saisie avec son libellé. `nom` sert d'identifiant : il doit être unique sur la page. */
export function ChampTexte({
  libelle,
  nom,
  type = "text",
  placeholder,
  valeur,
  onChange,
  requis = false,
  autoComplete,
  min,
}: ProprietesChampTexte) {
  const [visible, setVisible] = useState(false);
  const estMotDePasse = type === "password";
  const typeAffiche = estMotDePasse && visible ? "text" : type;

  return (
    <div className="flex flex-col gap-1.5 text-[13px] tracking-wide text-muet">
      <label htmlFor={nom}>
        {libelle}
        {requis ? <span className="sr-only"> (obligatoire)</span> : null}
      </label>
      <div className="relative">
        <input
          id={nom}
          name={nom}
          type={typeAffiche}
          placeholder={placeholder}
          value={onChange ? valeur : undefined}
          defaultValue={onChange ? undefined : valeur}
          required={requis}
          autoComplete={autoComplete}
          min={min}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          className={`${CLASSE_CHAMP}${estMotDePasse ? " pr-20" : ""}`}
        />
        {estMotDePasse ? (
          <button
            type="button"
            tabIndex={0}
            onClick={() => setVisible((v) => !v)}
            className="absolute top-1/2 right-2 z-10 -translate-y-1/2 rounded-md px-2 py-1 text-[12px] font-semibold text-marque hover:bg-fond"
            aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            aria-pressed={visible}
          >
            {visible ? "Masquer" : "Voir"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
