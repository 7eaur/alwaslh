import Fastify, { type FastifyInstance } from "fastify";
import { registerAuthRoutes } from "./auth/http.js";
import { AuthService } from "./auth/service.js";
import type { AppConfig } from "./config.js";
import type { Database } from "./db.js";
import { toPublicError } from "./errors.js";

export interface AppDependencies {
  config: AppConfig;
  database: Database;
}

export function buildApp({ config, database }: AppDependencies): FastifyInstance {
  const app = Fastify({
    logger: config.LOG_LEVEL === "silent" ? false : { level: config.LOG_LEVEL },
    disableRequestLogging: false,
    trustProxy: false,
    bodyLimit: 1_048_576,
    requestTimeout: 15_000,
  });
  const auth = new AuthService(database, config.SESSION_TTL_HOURS);

  registerAuthRoutes(app, config, auth);

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

  app.setNotFoundHandler((_request, reply) => {
    return reply.code(404).send({ error: { code: "NOT_FOUND", message: "المسار غير موجود" } });
  });

  app.setErrorHandler((error, request, reply) => {
    const publicError = toPublicError(error);
    if (publicError.statusCode >= 500) {
      request.log.error({ err: error }, "request failed");
    }
    return reply.code(publicError.statusCode).send(publicError.body);
  });

  app.addHook("onClose", async () => {
    await database.close();
  });

  return app;
}
