/**
 * @fileoverview GET /api/swagger — spécification OpenAPI (Swagger).
 *
 * But
 *   Exposer le JSON OpenAPI consommé par la page /swagger.
 */
import { openApiSpec } from "@/lib/openapi";

export function GET() {
  return Response.json(openApiSpec, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
