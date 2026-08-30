import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { loadConfig } from "../config.js";
import { createDatabase } from "../db.js";
import { importContentSource } from "./source-import.js";

const inventoryPath = process.argv[2];
if (!inventoryPath) {
  throw new Error("Usage: npm run content:import-source -- <inventory.json>");
}

const config = loadConfig();
const database = createDatabase(config.DATABASE_URL);

try {
  const raw = await readFile(resolve(inventoryPath), "utf8");
  const result = await importContentSource(database, JSON.parse(raw) as unknown);
  console.log(JSON.stringify(result));
} finally {
  await database.close();
}
