import type { FastifyInstance } from "fastify";
import { type AppConfig, allowedOrigins } from "../../config.js";
import { AppError } from "../../errors.js";

export function registerCorsPolicy(app: FastifyInstance, config: AppConfig): void {
  const origins = allowedOrigins(config);

  app.addHook("onRequest", async (request, reply) => {
    const origin = request.headers.origin;
    if (origin && origins.has(origin)) {
      reply.header("Access-Control-Allow-Origin", origin);
      reply.header("Access-Control-Allow-Credentials", "true");
      reply.header("Vary", "Origin");
    }

    if (request.method === "OPTIONS") {
      if (!origin || !origins.has(origin)) {
        throw new AppError("FORBIDDEN", "مصدر الطلب غير مسموح", 403);
      }
      reply.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
      reply.header("Access-Control-Allow-Headers", "Content-Type");
      return reply.code(204).send();
    }
  });
}
