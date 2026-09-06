import { buildApp } from "../apps/api/dist/app.js";
import { loadConfig } from "../apps/api/dist/config.js";
import { createDatabase } from "../apps/api/dist/db.js";

let appPromise;

function createApp() {
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

export default async function handler(request, response) {
  const app = await createApp();
  const originalUrl = request.url ?? "/";
  request.url = originalUrl.replace(/^\/api(?=\/|$)/, "") || "/";

  await new Promise((resolve, reject) => {
    response.once("finish", resolve);
    response.once("error", reject);
    app.server.emit("request", request, response);
  });
}
