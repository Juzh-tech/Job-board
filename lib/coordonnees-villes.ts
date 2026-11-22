/**
 * @fileoverview Coordonnées lat/lng de villes pour le filtre rayon (km).
 *
 * But
 *   Points GPS de référence pour "autour de X km" sur le board.
 */
/**
 * Coordonnées approximatives des villes du catalogue multi-pays.
 * Clé = nom normalisé (minuscules, sans accents).
 */
import type { Coords } from "@/lib/geo";

function normaliser(nom: string): string {
  return nom
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const COORDS: Record<string, Coords> = {
  // FR
  paris: { lat: 48.8566, lng: 2.3522 },
  lyon: { lat: 45.764, lng: 4.8357 },
  marseille: { lat: 43.2965, lng: 5.3698 },
  toulouse: { lat: 43.6047, lng: 1.4442 },
  nice: { lat: 43.7102, lng: 7.262 },
  nantes: { lat: 47.2184, lng: -1.5536 },
  bordeaux: { lat: 44.8378, lng: -0.5792 },
  lille: { lat: 50.6292, lng: 3.0573 },
  strasbourg: { lat: 48.5734, lng: 7.7521 },
  rennes: { lat: 48.1173, lng: -1.6778 },
  montpellier: { lat: 43.6108, lng: 3.8767 },
  grenoble: { lat: 45.1885, lng: 5.7245 },
  rouen: { lat: 49.4432, lng: 1.0993 },
  // ES
  madrid: { lat: 40.4168, lng: -3.7038 },
  barcelona: { lat: 41.3874, lng: 2.1686 },
  valencia: { lat: 39.4699, lng: -0.3763 },
  sevilla: { lat: 37.3891, lng: -5.9845 },
  bilbao: { lat: 43.263, lng: -2.935 },
  malaga: { lat: 36.7213, lng: -4.4214 },
  zaragoza: { lat: 41.6488, lng: -0.8891 },
  // GB
  london: { lat: 51.5074, lng: -0.1278 },
  manchester: { lat: 53.4808, lng: -2.2426 },
  birmingham: { lat: 52.4862, lng: -1.8904 },
  edinburgh: { lat: 55.9533, lng: -3.1883 },
  bristol: { lat: 51.4545, lng: -2.5879 },
  leeds: { lat: 53.8008, lng: -1.5491 },
  glasgow: { lat: 55.8642, lng: -4.2518 },
  // BE
  bruxelles: { lat: 50.8503, lng: 4.3517 },
  anvers: { lat: 51.2194, lng: 4.4025 },
  gand: { lat: 51.0543, lng: 3.7174 },
  liege: { lat: 50.6326, lng: 5.5797 },
  charleroi: { lat: 50.4108, lng: 4.4446 },
  // CH
  geneve: { lat: 46.2044, lng: 6.1432 },
  zurich: { lat: 47.3769, lng: 8.5417 },
  lausanne: { lat: 46.5197, lng: 6.6323 },
  berne: { lat: 46.948, lng: 7.4474 },
  bale: { lat: 47.5596, lng: 7.5886 },
  // DE
  berlin: { lat: 52.52, lng: 13.405 },
  munchen: { lat: 48.1351, lng: 11.582 },
  hamburg: { lat: 53.5511, lng: 9.9937 },
  frankfurt: { lat: 50.1109, lng: 8.6821 },
  koln: { lat: 50.9375, lng: 6.9603 },
  // PT
  lisboa: { lat: 38.7223, lng: -9.1393 },
  porto: { lat: 41.1579, lng: -8.6291 },
  braga: { lat: 41.5518, lng: -8.4229 },
  coimbra: { lat: 40.2033, lng: -8.4103 },
  // IT
  roma: { lat: 41.9028, lng: 12.4964 },
  milano: { lat: 45.4642, lng: 9.19 },
  torino: { lat: 45.0703, lng: 7.6869 },
  napoli: { lat: 40.8518, lng: 14.2681 },
  bologna: { lat: 44.4949, lng: 11.3426 },
  // US
  "new york": { lat: 40.7128, lng: -74.006 },
  "san francisco": { lat: 37.7749, lng: -122.4194 },
  austin: { lat: 30.2672, lng: -97.7431 },
  chicago: { lat: 41.8781, lng: -87.6298 },
  seattle: { lat: 47.6062, lng: -122.3321 },
  boston: { lat: 42.3601, lng: -71.0589 },
  // CA
  montreal: { lat: 45.5017, lng: -73.5673 },
  toronto: { lat: 43.6532, lng: -79.3832 },
  vancouver: { lat: 49.2827, lng: -123.1207 },
  ottawa: { lat: 45.4215, lng: -75.6972 },
  quebec: { lat: 46.8139, lng: -71.208 },
};

/** Résout lat/lng à partir d’un libellé de ville / lieu d’offre. */
export function coordsVille(lieuOuVille: string): Coords | null {
  const brut = lieuOuVille.split(/[,·(]/)[0]?.trim() || "";
  if (!brut) {
    return null;
  }
  const cle = normaliser(brut);
  if (COORDS[cle]) {
    return COORDS[cle];
  }
  // Correspondance partielle (ex. « Lyon centre »)
  for (const [nom, coords] of Object.entries(COORDS)) {
    if (cle.includes(nom) || nom.includes(cle)) {
      return coords;
    }
  }
  return null;
}
