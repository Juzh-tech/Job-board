/**
 * @fileoverview Pool MySQL partagé par toutes les routes API.
 *
 * But
 *   Une config (.env.local) + charset utf8mb4 forcé. BDD down → commence ici.
 */
import mysql, { type Pool, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";

declare global {
  // Pool unique en dev : Next recharge les modules, sans ça on ouvrirait
  // trop de connexions MySQL à chaque sauvegarde de fichier.
  // eslint-disable-next-line no-var
  var __jobboardPool: Pool | undefined;
}

function creerPool(): Pool {
  return mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "jobboard",
    waitForConnections: true,
    connectionLimit: 10,
    // namedPlaceholders : requêtes avec :email plutôt que ?
    namedPlaceholders: true,
    // Force UTF-8 sur la connexion (évite les accents → ??? si le serveur
    // ou l'outil d'import n'est pas aligné).
    charset: "utf8mb4",
  });
}

/** Retourne le pool MySQL partagé (lit .env.local). */
export function getDb(): Pool {
  if (!globalThis.__jobboardPool) {
    globalThis.__jobboardPool = creerPool();
  }
  return globalThis.__jobboardPool;
}

export type { ResultSetHeader, RowDataPacket };
