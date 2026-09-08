import { AuthService, type SessionProfile } from "../src/auth/service.js";
import { createDatabase } from "../src/db.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for browser auth fixture");

const [action, targetProfileId] = process.argv.slice(2);
if (!action || !targetProfileId) {
  throw new Error("usage: browser-auth-fixture <temporary-password|device-rebind> <profile-id>");
}

const db = createDatabase(databaseUrl);

try {
  const actorRows = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('admin', 'Browser E2E fixture') returning id",
  );
  const actorId = actorRows[0]?.id;
  if (!actorId) throw new Error("failed to create browser fixture actor");

  const actor: SessionProfile = {
    id: actorId,
    role: "admin",
    displayName: "Browser E2E fixture",
  };
  const auth = new AuthService(db, 24);

  if (action === "temporary-password") {
    const result = await auth.issueTemporaryPassword(actor, targetProfileId);
    process.stdout.write(JSON.stringify(result));
  } else if (action === "device-rebind") {
    await auth.resetStudentDevice(actor, targetProfileId);
    process.stdout.write(JSON.stringify({ status: "device_rebind_allowed" }));
  } else {
    throw new Error(`unsupported browser auth fixture action: ${action}`);
  }
} finally {
  await db.close();
}
