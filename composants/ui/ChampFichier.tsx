/**
 * @fileoverview Champ upload fichier (CV / logo).
 */
"use client";

import { useId, useRef } from "react";

type ProprietesChampFichier = {
  libelle: string;
  nom: string;
  accept?: string;
  aide?: string;
  fichier?: File | null;
  onChange?: (fichier: File | null) => void;
  requis?: boolean;
};

/** Sélecteur de fichier. Pour le projet, on n'accepte que le PDF du CV. */
export function ChampFichier({
  libelle,
  nom,
  accept = "application/pdf",
  aide,
  fichier,
  onChange,
  requis = false,
}: ProprietesChampFichier) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] tracking-wide text-muet" id={`${id}-libelle`}>
        {libelle}
      </span>
      <button
        type="button"
        className="flex min-h-[3.25rem] items-center justify-between gap-3 rounded-sm border border-ligne bg-surface px-3 py-2 text-left text-[15px] hover:border-encre/40"
        onClick={() => inputRef.current?.click()}
        aria-labelledby={`${id}-libelle`}
      >
        <span className={fichier ? "text-encre" : "text-muet"}>
          {fichier ? fichier.name : "Choisir un fichier PDF"}
        </span>
        <span className="shrink-0 text-[13px] text-muet">Parcourir</span>
      </button>
      {aide ? <p className="text-[13px] text-muet">{aide}</p> : null}
      <input
        ref={inputRef}
        id={nom}
        name={nom}
        type="file"
        accept={accept}
        required={requis}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => onChange?.(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
