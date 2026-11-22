/**
 * @fileoverview Spécification OpenAPI 3 (Swagger) de l’API Job Board.
 *
 * But
 *   Documenter les routes pour la page /swagger et GET /api/swagger.
 */
export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Job Boarding API",
    version: "1.0.0",
    description:
      "API REST du Job Board (Next.js App Router). Auth : header Authorization Bearer <JWT>.",
  },
  servers: [{ url: "/api", description: "API locale / même origine" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  paths: {
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Connexion",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "motDePasse"],
                properties: {
                  email: { type: "string" },
                  motDePasse: { type: "string" },
                  siteWebEntreprise: {
                    type: "string",
                    description: "Honeypot anti-bot (doit rester vide)",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "JWT + user" },
          "401": { description: "Identifiants incorrects" },
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Inscription candidat ou entreprise",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  role: { type: "string", enum: ["candidat", "entreprise"] },
                  prenom: { type: "string" },
                  nom: { type: "string" },
                  email: { type: "string" },
                  motDePasse: { type: "string" },
                  telephone: { type: "string" },
                  pays: { type: "string" },
                  ville: { type: "string" },
                  entreprise: { type: "object" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Compte créé + JWT" },
          "400": { description: "Données invalides" },
        },
      },
    },
    "/profil": {
      patch: {
        tags: ["Profil"],
        summary: "Mettre à jour le profil",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Profil mis à jour" } },
      },
    },
    "/offres": {
      get: {
        tags: ["Offres"],
        summary: "Lister les offres du marché",
        parameters: [
          { name: "pays", in: "query", schema: { type: "string" } },
          { name: "q", in: "query", schema: { type: "string" } },
          { name: "lieu", in: "query", schema: { type: "string" } },
          { name: "contrat", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "Liste d’offres" } },
      },
    },
    "/offres/{id}": {
      get: {
        tags: ["Offres"],
        summary: "Détail d’une offre",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "Offre" },
          "404": { description: "Introuvable" },
        },
      },
    },
    "/entreprises/{id}": {
      get: {
        tags: ["Entreprises"],
        summary: "Fiche publique entreprise",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { "200": { description: "Entreprise + offres" } },
      },
    },
    "/candidatures": {
      get: {
        tags: ["Candidatures"],
        summary: "Mes candidatures (candidat)",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Liste" } },
      },
      post: {
        tags: ["Candidatures"],
        summary: "Postuler à une offre",
        security: [{ bearerAuth: [] }],
        responses: {
          "201": { description: "Candidature créée" },
          "409": { description: "Déjà postulé" },
        },
      },
    },
    "/candidatures/{id}": {
      patch: {
        tags: ["Candidatures"],
        summary: "Changer le statut (entreprise / admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { "200": { description: "Mis à jour" } },
      },
    },
    "/cv/upload": {
      post: {
        tags: ["CV"],
        summary: "Upload CV PDF",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Nom de fichier enregistré" } },
      },
    },
    "/cv/{fichier}": {
      get: {
        tags: ["CV"],
        summary: "Télécharger / afficher un CV",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "fichier",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "token",
            in: "query",
            schema: { type: "string" },
            description: "JWT alternatif (iframe PDF)",
          },
        ],
        responses: { "200": { description: "Fichier PDF" } },
      },
    },
    "/entreprise/me": {
      get: {
        tags: ["Entreprise"],
        summary: "Profil de mon entreprise",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Entreprise" } },
      },
      patch: {
        tags: ["Entreprise"],
        summary: "Modifier infos entreprise",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "OK" } },
      },
    },
    "/entreprise/offres": {
      get: {
        tags: ["Entreprise"],
        summary: "Mes offres",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Liste" } },
      },
      post: {
        tags: ["Entreprise"],
        summary: "Publier une offre",
        security: [{ bearerAuth: [] }],
        responses: { "201": { description: "Offre créée" } },
      },
    },
    "/entreprise/offres/{id}": {
      patch: {
        tags: ["Entreprise"],
        summary: "Modifier / retirer une offre",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { "200": { description: "OK" } },
      },
    },
    "/entreprise/candidatures": {
      get: {
        tags: ["Entreprise"],
        summary: "Candidatures reçues",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Liste" } },
      },
    },
    "/admin/entreprises": {
      get: {
        tags: ["Admin"],
        summary: "Lister les entreprises",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Liste" } },
      },
    },
    "/admin/offres": {
      get: {
        tags: ["Admin"],
        summary: "Lister les offres",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Liste" } },
      },
    },
    "/admin/comptes": {
      get: {
        tags: ["Admin"],
        summary: "Lister les comptes",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Liste" } },
      },
    },
    "/admin/candidatures": {
      get: {
        tags: ["Admin"],
        summary: "Lister les candidatures",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Liste" } },
      },
    },
    "/swagger": {
      get: {
        tags: ["Docs"],
        summary: "Spécification OpenAPI (ce document)",
        responses: { "200": { description: "JSON OpenAPI 3" } },
      },
    },
  },
} as const;
