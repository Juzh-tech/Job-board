/**
 * @fileoverview Barre de filtres du board (recherche, contrat, rayon…).
 *
 * But
 *   Pilote la liste d'offres côté écran parent.
 */
"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { RAYONS_KM } from "@/lib/geo";
import { useLocale } from "@/lib/i18n/contexte";
import { filtrerOffres, suggestionsMetiers, suggestionsVilles } from "@/lib/offres";
import { TYPES_CONTRAT, type Offre } from "@/types/offre";

const TOUS = "tous";

type ProprietesBarreFiltres = {
  offres: Offre[];
  onFiltrer: (offres: Offre[]) => void;
  motInitial?: string;
  lieuInitial?: string;
  contratInitial?: string;
  variante?: "hero" | "compacte";
};

export function BarreFiltres({
  offres,
  onFiltrer,
  motInitial = "",
  lieuInitial = "",
  contratInitial = TOUS,
  variante = "hero",
}: ProprietesBarreFiltres) {
  const { t } = useLocale();
  const [mot, setMot] = useState(motInitial);
  const [lieu, setLieu] = useState(lieuInitial);
  const [contrat, setContrat] = useState<string>(contratInitial);
  const [rayonKm, setRayonKm] = useState(0);
  const [listeOuverte, setListeOuverte] = useState<"mot" | "lieu" | null>(null);
  const fermerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Toujours les mêmes types que le formulaire « Publier » (pas seulement ceux présents dans la liste).
  const types = TYPES_CONTRAT;

  const propositionsMot = useMemo(
    () => (listeOuverte === "mot" ? suggestionsMetiers(offres, mot) : []),
    [listeOuverte, mot, offres],
  );
  const propositionsLieu = useMemo(
    () => (listeOuverte === "lieu" ? suggestionsVilles(offres, lieu) : []),
    [listeOuverte, lieu, offres],
  );

  function appliquer(
    prochainMot: string,
    prochainLieu: string,
    prochainContrat: string,
    prochainRayon = rayonKm,
  ) {
    onFiltrer(
      filtrerOffres(offres, prochainMot, prochainLieu, prochainContrat, prochainRayon),
    );
  }

  function rechercher(e: FormEvent) {
    e.preventDefault();
    setListeOuverte(null);
    appliquer(mot, lieu, contrat, rayonKm);
  }

  function ouvrirListe(quelle: "mot" | "lieu") {
    if (fermerTimer.current) {
      clearTimeout(fermerTimer.current);
      fermerTimer.current = null;
    }
    setListeOuverte(quelle);
  }

  function preparerFermeture() {
    fermerTimer.current = setTimeout(() => setListeOuverte(null), 120);
  }

  function choisirMot(valeur: string) {
    setMot(valeur);
    setListeOuverte(null);
    appliquer(valeur, lieu, contrat);
  }

  function choisirLieu(valeur: string) {
    setLieu(valeur);
    setListeOuverte(null);
    appliquer(mot, valeur, contrat);
  }

  const hero = variante === "hero";

  return (
    <div className={`flex flex-col ${hero ? "gap-4" : "gap-3"}`}>
      <form
        onSubmit={rechercher}
        className={`grid overflow-visible bg-surface sm:grid-cols-[1fr_1fr_auto] ${
          hero
            ? "rounded-2xl border border-ligne shadow-[0_8px_30px_rgba(11,31,58,0.08)]"
            : "rounded-xl border border-ligne shadow-sm"
        }`}
      >
        <label
          className={`relative flex min-w-0 flex-col ${hero ? "px-5 py-3.5" : "px-3 py-3"}`}
        >
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muet">
            {t("filtres.quoi")}
          </span>
          <input
            name="recherche"
            value={mot}
            placeholder={t("filtres.placeholderMot")}
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={propositionsMot.length > 0}
            onFocus={() => ouvrirListe("mot")}
            onBlur={preparerFermeture}
            onChange={(e) => {
              setMot(e.target.value);
              ouvrirListe("mot");
              appliquer(e.target.value, lieu, contrat);
            }}
            className="min-w-0 bg-transparent text-[16px] leading-7 outline-none placeholder:text-muet"
          />
          {propositionsMot.length > 0 ? (
            <ListeSuggestions
              id="suggestions-metiers"
              propositions={propositionsMot}
              onChoisir={choisirMot}
            />
          ) : null}
        </label>
        <label
          className={`relative flex min-w-0 flex-col border-t border-ligne sm:border-t-0 sm:border-l ${
            hero ? "px-5 py-3.5" : "px-3 py-3"
          }`}
        >
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muet">
            {t("filtres.ou")}
          </span>
          <input
            name="lieu"
            value={lieu}
            placeholder={t("filtres.placeholderLieu")}
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={propositionsLieu.length > 0}
            onFocus={() => ouvrirListe("lieu")}
            onBlur={preparerFermeture}
            onChange={(e) => {
              setLieu(e.target.value);
              ouvrirListe("lieu");
              appliquer(mot, e.target.value, contrat);
            }}
            className="min-w-0 bg-transparent text-[16px] leading-7 outline-none placeholder:text-muet"
          />
          {propositionsLieu.length > 0 ? (
            <ListeSuggestions
              id="suggestions-villes"
              propositions={propositionsLieu}
              onChoisir={choisirLieu}
            />
          ) : null}
        </label>
        <button
          type="submit"
          className={`bg-marque text-sm font-semibold text-white hover:bg-marque-hover ${
            hero ? "min-h-[3.75rem] px-8 sm:min-h-0" : "min-h-14 px-6 sm:min-h-0"
          }`}
        >
          {t("filtres.rechercher")}
        </button>
      </form>

      <div className={`flex flex-wrap items-center gap-2.5 ${hero ? "justify-center" : ""}`}>
        <Puce
          libelle={t("filtres.tous")}
          active={contrat === TOUS}
          onClick={() => {
            setContrat(TOUS);
            appliquer(mot, lieu, TOUS);
          }}
        />
        {types.map((type) => (
          <Puce
            key={type}
            libelle={type}
            active={contrat === type}
            onClick={() => {
              setContrat(type);
              appliquer(mot, lieu, type);
            }}
          />
        ))}
        {lieu.trim() ? (
          <label className="ml-1 flex items-center gap-2 text-[13px] text-muet">
            <span className="font-semibold">{t("filtres.rayon")}</span>
            <select
              value={rayonKm}
              onChange={(e) => {
                const r = Number(e.target.value);
                setRayonKm(r);
                appliquer(mot, lieu, contrat, r);
              }}
              className="h-8 rounded-lg border border-ligne bg-surface px-2 text-[13px] font-semibold text-encre outline-none focus:border-marque"
            >
              {RAYONS_KM.map((r) => (
                <option key={r} value={r}>
                  {r === 0 ? t("filtres.rayonExact") : `${r} ${t("filtres.km")}`}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
    </div>
  );
}

function ListeSuggestions({
  id,
  propositions,
  onChoisir,
}: {
  id: string;
  propositions: string[];
  onChoisir: (valeur: string) => void;
}) {
  return (
    <ul
      id={id}
      role="listbox"
      className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-xl border border-ligne bg-surface py-1 shadow-[0_12px_30px_rgba(11,31,58,0.12)]"
    >
      {propositions.map((proposition) => (
        <li key={proposition} role="option">
          <button
            type="button"
            className="flex w-full px-4 py-2.5 text-left text-[15px] text-encre hover:bg-fond"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onChoisir(proposition)}
          >
            {proposition}
          </button>
        </li>
      ))}
    </ul>
  );
}

function Puce({
  libelle,
  active,
  onClick,
}: {
  libelle: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 rounded-full px-4 text-[14px] font-medium transition ${
        active
          ? "bg-marque text-white"
          : "border border-ligne bg-surface text-encre hover:border-marque/40"
      }`}
    >
      {libelle}
    </button>
  );
}
