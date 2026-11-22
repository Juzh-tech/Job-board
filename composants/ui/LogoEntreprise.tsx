/**
 * @fileoverview Affiche le logo boîte (ou initiale fallback).
 */
const COULEURS = ["bg-marque", "bg-[#1e3a5f]", "bg-[#334155]", "bg-[#475569]"];

type ProprietesLogo = {
  nom: string;
  id: number;
  taille?: "sm" | "md" | "lg" | "xl";
  url?: string | null;
};

export function LogoEntreprise({ nom, id, taille = "md", url }: ProprietesLogo) {
  const lettres = nom
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((mot) => mot[0]?.toUpperCase() ?? "")
    .join("");

  const classeTaille =
    taille === "sm"
      ? "h-9 w-9 rounded-lg text-[12px]"
      : taille === "lg"
        ? "h-20 w-20 rounded-2xl text-[22px]"
        : taille === "xl"
          ? "h-24 w-24 rounded-2xl text-[26px] sm:h-28 sm:w-28 sm:text-[28px]"
          : "h-11 w-11 rounded-xl text-[13px]";

  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        className={`shrink-0 object-contain ${classeTaille} border border-ligne bg-fond`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center font-semibold text-white ${classeTaille} ${COULEURS[id % COULEURS.length]}`}
    >
      {lettres}
    </span>
  );
}
