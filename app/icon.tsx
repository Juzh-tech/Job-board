/**
 * @fileoverview Icône / favicon générée par Next.
 *
 * But
 *   Petit asset marque pour l'onglet navigateur.
 */
import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Favicon généré : monogramme JB sur fond marque. */
export default function Icone() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b1f3a",
          color: "#ffffff",
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: -0.5,
        }}
      >
        JB
      </div>
    ),
    size,
  );
}
