/**
 * @fileoverview Textarea de formulaire.
 */
import { CLASSE_CHAMP } from "./classes";

type ProprietesChampZoneTexte = {
  libelle: string;
  nom: string;
  placeholder?: string;
  valeur?: string;
  onChange?: (valeur: string) => void;
  lignes?: number;
  requis?: boolean;
};

export function ChampZoneTexte({
  libelle,
  nom,
  placeholder,
  valeur,
  onChange,
  lignes = 5,
  requis = false,
}: ProprietesChampZoneTexte) {
  return (
    <label className="flex flex-col gap-1.5 text-[13px] tracking-wide text-muet" htmlFor={nom}>
      {libelle}
      <textarea
        id={nom}
        name={nom}
        placeholder={placeholder}
        value={onChange ? valeur : undefined}
        defaultValue={onChange ? undefined : valeur}
        required={requis}
        rows={lignes}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className={`${CLASSE_CHAMP} resize-y`}
      />
    </label>
  );
}
