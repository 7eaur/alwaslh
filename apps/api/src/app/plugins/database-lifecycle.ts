import type { FastifyInstance } from "fastify";
import type { Database } from "../../db.js";

export function registerDatabaseLifecycle(app: FastifyInstance, database: Database): void {
  app.addHook("onClose", async () => {
    await database.close();
  });
}
