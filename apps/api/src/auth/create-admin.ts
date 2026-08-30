import { loadConfig } from "../config.js";
import { createDatabase } from "../db.js";
import { AuthService } from "./service.js";

const identifier = process.env.ADMIN_BOOTSTRAP_IDENTIFIER?.trim();
const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
const displayName = process.env.ADMIN_BOOTSTRAP_DISPLAY_NAME?.trim() || "مدير النظام";

if (!identifier || !password) {
  throw new Error("ADMIN_BOOTSTRAP_IDENTIFIER and ADMIN_BOOTSTRAP_PASSWORD are required");
}

const config = loadConfig();
const database = createDatabase(config.DATABASE_URL);
const auth = new AuthService(database, config.SESSION_TTL_HOURS);

try {
  await database.transaction(async (tx) => {
    const existing = await tx.query<{ count: string }>(
      "select count(*)::text as count from profiles where role = 'admin'",
    );
    if (existing[0]?.count !== "0") {
      throw new Error("Admin bootstrap refused: an admin account already exists");
    }

    const profiles = await tx.query<{ id: string }>(
      `insert into profiles (role, display_name, status)
       values ('admin', $1, 'active')
       returning id`,
      [displayName],
    );
    const profile = profiles[0];
    if (!profile) throw new Error("Failed to create admin profile");
    await auth.createCredential(profile.id, identifier, password, tx);
  });
  console.log("Admin bootstrap completed. The command will refuse to create a second bootstrap admin.");
} finally {
  await database.close();
}
