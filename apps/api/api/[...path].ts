import type { IncomingMessage, ServerResponse } from "node:http";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/app.js";
import { loadConfig } from "../src/config.js";
import { createDatabase } from "../src/db.js";

let appPromise: Promise<FastifyInstance> | undefined;

function createApp(): Promise<FastifyInstance> {
  if (!appPromise) {
    appPromise = (async () => {
      const config = loadConfig();
      const database = createDatabase(config.DATABASE_URL, {
        ssl: config.DATABASE_SSL === "require",
        maxConnections: config.DATABASE_POOL_MAX,
      });
      const app = buildApp({ config, database });
      await app.ready();
      return app;
    })();
  }
  return appPromise;
}

export default async function handler(request: IncomingMessage, response: ServerResponse): Promise<void> {
  const app = await createApp();
  const originalUrl = request.url ?? "/";
  request.url = originalUrl.replace(/^\/api(?=\/|$)/, "") || "/";

  await new Promise<void>((resolve, reject) => {
    response.once("finish", resolve);
    response.once("error", reject);
    app.server.emit("request", request, response);
  });
}
