/**
 * @fileoverview Select de formulaire standard.
 */
import { CLASSE_CHAMP } from "./classes";

type Option = { valeur: string; libelle: string };

type ProprietesChampSelect = {
  libelle: string;
  nom: string;
  options: Option[];
  valeur?: string;
  onChange?: (valeur: string) => void;
};

export function ChampSelect({ libelle, nom, options, valeur, onChange }: ProprietesChampSelect) {
  return (
    <label className="flex flex-col gap-1.5 text-[13px] tracking-wide text-muet" htmlFor={nom}>
      {libelle}
      <select
        id={nom}
        name={nom}
        value={valeur}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className={CLASSE_CHAMP}
      >
        {options.map((option) => (
          <option key={option.valeur} value={option.valeur}>
            {option.libelle}
          </option>
        ))}
      </select>
    </label>
  );
}
