/**
 * @fileoverview Hook : layout desktop ou mobile ?
 *
 * But
 *   Split liste / détail offres : sur mobile une vue à la fois.
 */
import { useSyncExternalStore } from "react";

const REQUETE = "(min-width: 1024px)";

function abonner(prevenir: () => void) {
  const media = window.matchMedia(REQUETE);
  media.addEventListener("change", prevenir);
  return () => media.removeEventListener("change", prevenir);
}

/** Vrai sur un écran d'au moins 1024 px de large. Le serveur suppose un grand écran. */
export function useEstGrandEcran() {
  return useSyncExternalStore(
    abonner,
    () => window.matchMedia(REQUETE).matches,
    () => true,
  );
}
