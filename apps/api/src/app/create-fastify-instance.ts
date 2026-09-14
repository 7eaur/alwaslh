import Fastify, { type FastifyInstance } from "fastify";
import type { AppConfig } from "../config.js";

export function createFastifyInstance(config: AppConfig): FastifyInstance {
  return Fastify({
    logger: config.LOG_LEVEL === "silent" ? false : { level: config.LOG_LEVEL },
    disableRequestLogging: false,
    trustProxy: true,
    bodyLimit: 1_048_576,
    requestTimeout: 15_000,
  });
}
