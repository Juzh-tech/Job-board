/**
 * @fileoverview Select avec recherche (longues listes : secteurs, villes…).
 */
"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CLASSE_CHAMP } from "./classes";

export type OptionRecherche = {
  valeur: string;
  libelle: string;
};

type Proprietes = {
  libelle: string;
  nom: string;
  options: OptionRecherche[];
  valeur: string;
  onChange: (valeur: string) => void;
  requis?: boolean;
  placeholder?: string;
  /** Filtre custom ; sinon filtre libelle/valeur. */
  filtrer?: (options: OptionRecherche[], saisie: string) => OptionRecherche[];
};

/**
 * Liste déroulante avec champ de recherche (secteurs, villes…).
 * Valeur stockée = `valeur` de l’option (id), affichage = libellé.
 */
export function ChampSelectRecherche({
  libelle,
  nom,
  options,
  valeur,
  onChange,
  requis = false,
  placeholder = "Rechercher…",
  filtrer,
}: Proprietes) {
  const id = useId();
  const conteneurRef = useRef<HTMLDivElement>(null);
  const [ouvert, setOuvert] = useState(false);
  const [saisie, setSaisie] = useState("");

  const selection = options.find((o) => o.valeur === valeur);

  const filtrees = useMemo(() => {
    if (filtrer) {
      return filtrer(options, saisie);
    }
    const q = saisie.trim().toLowerCase();
    if (!q) {
      return options.slice(0, 20);
    }
    return options
      .filter(
        (o) =>
          o.libelle.toLowerCase().includes(q) || o.valeur.toLowerCase().includes(q),
      )
      .slice(0, 20);
  }, [options, saisie, filtrer]);

  useEffect(() => {
    function dehors(e: MouseEvent) {
      if (!conteneurRef.current?.contains(e.target as Node)) {
        setOuvert(false);
        setSaisie("");
      }
    }
    document.addEventListener("mousedown", dehors);
    return () => document.removeEventListener("mousedown", dehors);
  }, []);

  return (
    <div className="relative flex flex-col gap-1.5 text-[13px] tracking-wide text-muet" ref={conteneurRef}>
      <label htmlFor={id}>
        {libelle}
        {requis ? <span className="sr-only"> (obligatoire)</span> : null}
      </label>
      <input type="hidden" name={nom} value={valeur} required={requis} />
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={ouvert}
        onClick={() => {
          setOuvert((o) => !o);
          setSaisie("");
        }}
        className={`${CLASSE_CHAMP} flex items-center justify-between text-left ${
          selection ? "text-encre" : "text-muet"
        }`}
      >
        <span className="truncate">{selection?.libelle || "Sélectionner…"}</span>
        <span className="ml-2 shrink-0 text-muet" aria-hidden>
          ▾
        </span>
      </button>
      {ouvert ? (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-30 overflow-hidden rounded-lg border border-ligne bg-surface shadow-lg">
          <div className="border-b border-ligne p-2">
            <input
              type="search"
              autoFocus
              value={saisie}
              onChange={(e) => setSaisie(e.target.value)}
              placeholder={placeholder}
              className="h-9 w-full rounded-md border border-ligne bg-fond px-3 text-[14px] text-encre outline-none focus:border-marque"
            />
          </div>
          <ul role="listbox" className="max-h-56 overflow-y-auto py-1">
            {filtrees.length === 0 ? (
              <li className="px-3 py-2 text-[13px] text-muet">Aucun résultat</li>
            ) : (
              filtrees.map((opt) => (
                <li key={opt.valeur}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={opt.valeur === valeur}
                    className={`w-full px-3 py-2 text-left text-[14px] hover:bg-fond ${
                      opt.valeur === valeur ? "bg-fond font-semibold text-marque" : "text-encre"
                    }`}
                    onClick={() => {
                      onChange(opt.valeur);
                      setOuvert(false);
                      setSaisie("");
                    }}
                  >
                    {opt.libelle}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
