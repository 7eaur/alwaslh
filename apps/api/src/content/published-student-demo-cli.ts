import { loadConfig } from "../config.js";
import { createDatabase } from "../db.js";
import {
  cleanupPublishedStudentDemo,
  seedPublishedStudentDemo,
  verifyPublishedStudentDemo,
} from "./published-student-demo.js";

function requiredEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value?.trim()) throw new Error(`${name} is required`);
  return value.trim();
}

async function main(): Promise<void> {
  const command = process.argv[2];
  if (command !== "seed" && command !== "verify" && command !== "cleanup") {
    throw new Error("Usage: npm run content:published-student-demo -- <seed|verify|cleanup>");
  }

  const config = loadConfig();
  const database = createDatabase(config.DATABASE_URL, {
    ssl: config.DATABASE_SSL === "require",
    maxConnections: Math.min(config.DATABASE_POOL_MAX, 4),
  });

  try {
    if (command === "cleanup") {
      const result = await cleanupPublishedStudentDemo(database, config.MEDIA_STORAGE_ROOT);
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    const identity = {
      adminIdentifier: requiredEnv("DEMO_ADMIN_IDENTIFIER", process.env.ADMIN_BOOTSTRAP_IDENTIFIER),
      studentIdentifier: requiredEnv("DEMO_STUDENT_IDENTIFIER"),
    };
    const result =
      command === "seed"
        ? await seedPublishedStudentDemo(database, config.MEDIA_STORAGE_ROOT, identity)
        : await verifyPublishedStudentDemo(database, config.MEDIA_STORAGE_ROOT, identity);
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await database.close();
  }
}

await main();
