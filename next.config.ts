/**
 * @fileoverview Config Next.js du Job Board.
 *
 * But
 *   Réglages build / runtime du framework. Option globale → ici, pas dans chaque page.
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["10.68.251.138"],
};

export default nextConfig;
