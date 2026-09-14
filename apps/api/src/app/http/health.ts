import type { FastifyInstance } from "fastify";
import type { Database } from "../../db.js";

export function registerHealthRoutes(app: FastifyInstance, database: Database): void {
  app.get("/health", async () => ({
    status: "ok",
    service: "alwaslh-api",
  }));

  app.get("/ready", async (_request, reply) => {
    try {
      await database.ping();
      return { status: "ready" };
    } catch (error) {
      app.log.error({ err: error }, "database readiness check failed");
      return reply.code(503).send({ status: "not_ready" });
    }
  });
}
