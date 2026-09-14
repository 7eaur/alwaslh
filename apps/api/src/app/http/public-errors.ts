import type { FastifyInstance } from "fastify";
import { toPublicError } from "../../errors.js";

export function registerPublicErrorHandlers(app: FastifyInstance): void {
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
}
