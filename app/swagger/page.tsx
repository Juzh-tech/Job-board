/**
 * @fileoverview Page Swagger UI — documentation interactive de l’API.
 *
 * But
 *   Charger Swagger UI (CDN) pointant sur GET /api/swagger.
 */
"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    SwaggerUIBundle?: {
      (opts: Record<string, unknown>): void;
      presets: { apis: unknown };
    };
  }
}

export default function PageSwagger() {
  useEffect(() => {
    const cssId = "swagger-ui-css";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css";
      document.head.appendChild(link);
    }

    function monter() {
      if (!window.SwaggerUIBundle) {
        return;
      }
      const cible = document.getElementById("swagger-ui");
      if (!cible) {
        return;
      }
      cible.innerHTML = "";
      window.SwaggerUIBundle({
        url: "/api/swagger",
        dom_id: "#swagger-ui",
        presets: [window.SwaggerUIBundle.presets.apis],
        layout: "BaseLayout",
        deepLinking: true,
        tryItOutEnabled: true,
      });
    }

    const scriptId = "swagger-ui-bundle";
    const existant = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existant) {
      monter();
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js";
    script.async = true;
    script.onload = () => monter();
    document.body.appendChild(script);
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <h1 className="text-lg font-semibold text-slate-900">API — Swagger</h1>
        <p className="text-sm text-slate-600">
          Spec JSON :{" "}
          <a className="text-blue-700 underline" href="/api/swagger">
            /api/swagger
          </a>
        </p>
      </div>
      <div id="swagger-ui" />
    </main>
  );
}
