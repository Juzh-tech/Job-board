/**
 * @fileoverview Calculs géo (Haversine) pour le rayon km.
 *
 * But
 *   Distance à vol d'oiseau entre deux points. Sert au filtre offres.
 */
/** Distance et résolution de villes pour le filtre rayon. */

export type Coords = { lat: number; lng: number };

const RAYON_TERRE_KM = 6371;

export function distanceKm(a: Coords, b: Coords): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * RAYON_TERRE_KM * Math.asin(Math.sqrt(h));
}

export function estRemote(lieu: string): boolean {
  return /télétravail|teletrabajo|teletrabalho|remote/i.test(lieu);
}

export const RAYONS_KM = [0, 10, 25, 50, 100, 200] as const;
